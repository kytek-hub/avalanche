"use strict";
/**
 * @packageDocumentation
 * @module API-EVM-UTXOs
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UTXOSet = exports.AssetAmountDestination = exports.UTXO = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const outputs_1 = require("./outputs");
const constants_1 = require("./constants");
const inputs_1 = require("./inputs");
const helperfunctions_1 = require("../../utils/helperfunctions");
const utxos_1 = require("../../common/utxos");
const constants_2 = require("../../utils/constants");
const assetamount_1 = require("../../common/assetamount");
const serialization_1 = require("../../utils/serialization");
const tx_1 = require("./tx");
const importtx_1 = require("./importtx");
const exporttx_1 = require("./exporttx");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
/**
 * Class for representing a single UTXO.
 */
class UTXO extends utxos_1.StandardUTXO {
    constructor() {
        super(...arguments);
        this._typeName = "UTXO";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.output = outputs_1.SelectOutputClass(fields["output"]["_typeID"]);
        this.output.deserialize(fields["output"], encoding);
    }
    fromBuffer(bytes, offset = 0) {
        this.codecID = bintools.copyFrom(bytes, offset, offset + 2);
        offset += 2;
        this.txid = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.outputidx = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.assetID = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        const outputid = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.output = outputs_1.SelectOutputClass(outputid);
        return this.output.fromBuffer(bytes, offset);
    }
    /**
     * Takes a base-58 string containing a [[UTXO]], parses it, populates the class, and returns the length of the StandardUTXO in bytes.
     *
     * @param serialized A base-58 string containing a raw [[UTXO]]
     *
     * @returns The length of the raw [[UTXO]]
     *
     * @remarks
     * unlike most fromStrings, it expects the string to be serialized in cb58 format
     */
    fromString(serialized) {
        /* istanbul ignore next */
        return this.fromBuffer(bintools.cb58Decode(serialized));
    }
    /**
     * Returns a base-58 representation of the [[UTXO]].
     *
     * @remarks
     * unlike most toStrings, this returns in cb58 serialization format
     */
    toString() {
        /* istanbul ignore next */
        return bintools.cb58Encode(this.toBuffer());
    }
    clone() {
        const utxo = new UTXO();
        utxo.fromBuffer(this.toBuffer());
        return utxo;
    }
    create(codecID = constants_1.EVMConstants.LATESTCODEC, txID = undefined, outputidx = undefined, assetID = undefined, output = undefined) {
        return new UTXO(codecID, txID, outputidx, assetID, output);
    }
}
exports.UTXO = UTXO;
class AssetAmountDestination extends assetamount_1.StandardAssetAmountDestination {
}
exports.AssetAmountDestination = AssetAmountDestination;
/**
 * Class representing a set of [[UTXO]]s.
 */
class UTXOSet extends utxos_1.StandardUTXOSet {
    constructor() {
        super(...arguments);
        this._typeName = "UTXOSet";
        this._typeID = undefined;
        this.getMinimumSpendable = (aad, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => {
            const utxoArray = this.getAllUTXOs();
            const outids = {};
            for (let i = 0; i < utxoArray.length && !aad.canComplete(); i++) {
                const u = utxoArray[i];
                const assetKey = u.getAssetID().toString("hex");
                const fromAddresses = aad.getSenders();
                if (u.getOutput() instanceof outputs_1.AmountOutput && aad.assetExists(assetKey) && u.getOutput().meetsThreshold(fromAddresses, asOf)) {
                    const am = aad.getAssetAmount(assetKey);
                    if (!am.isFinished()) {
                        const uout = u.getOutput();
                        outids[assetKey] = uout.getOutputID();
                        const amount = uout.getAmount();
                        am.spendAmount(amount);
                        const txid = u.getTxID();
                        const outputidx = u.getOutputIdx();
                        const input = new inputs_1.SECPTransferInput(amount);
                        const xferin = new inputs_1.TransferableInput(txid, outputidx, u.getAssetID(), input);
                        const spenders = uout.getSpenders(fromAddresses, asOf);
                        spenders.forEach((spender) => {
                            const idx = uout.getAddressIdx(spender);
                            if (idx === -1) {
                                /* istanbul ignore next */
                                throw new errors_1.AddressError("Error - UTXOSet.getMinimumSpendable: no such address in output");
                            }
                            xferin.getInput().addSignatureIdx(idx, spender);
                        });
                        aad.addInput(xferin);
                    }
                    else if (aad.assetExists(assetKey) && !(u.getOutput() instanceof outputs_1.AmountOutput)) {
                        /**
                         * Leaving the below lines, not simply for posterity, but for clarification.
                         * AssetIDs may have mixed OutputTypes.
                         * Some of those OutputTypes may implement AmountOutput.
                         * Others may not.
                         * Simply continue in this condition.
                         */
                        /*return new Error('Error - UTXOSet.getMinimumSpendable: outputID does not '
                          + `implement AmountOutput: ${u.getOutput().getOutputID}`);*/
                        continue;
                    }
                }
            }
            if (!aad.canComplete()) {
                return new errors_1.InsufficientFundsError(`Error - UTXOSet.getMinimumSpendable: insufficient funds to create the transaction`);
            }
            const amounts = aad.getAmounts();
            const zero = new bn_js_1.default(0);
            for (let i = 0; i < amounts.length; i++) {
                const assetKey = amounts[i].getAssetIDString();
                const amount = amounts[i].getAmount();
                if (amount.gt(zero)) {
                    const spendout = outputs_1.SelectOutputClass(outids[assetKey], amount, aad.getDestinations(), locktime, threshold);
                    const xferout = new outputs_1.TransferableOutput(amounts[i].getAssetID(), spendout);
                    aad.addOutput(xferout);
                }
                const change = amounts[i].getChange();
                if (change.gt(zero)) {
                    const changeout = outputs_1.SelectOutputClass(outids[assetKey], change, aad.getChangeAddresses());
                    const chgxferout = new outputs_1.TransferableOutput(amounts[i].getAssetID(), changeout);
                    aad.addChange(chgxferout);
                }
            }
            return undefined;
        };
        /**
          * Creates an unsigned ImportTx transaction.
          *
          * @param networkID The number representing NetworkID of the node
          * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
          * @param toAddress The address to send the funds
          * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
          * @param importIns An array of [[TransferableInput]]s being imported
          * @param sourceChain A {@link https://github.com/feross/buffer|Buffer} for the chainid where the imports are coming from.
          * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}. Fee will come from the inputs first, if they can.
          * @param feeAssetID Optional. The assetID of the fees being burned.
          * @param memo Optional contains arbitrary bytes, up to 256 bytes
          * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
          * @param locktime Optional. The locktime field created in the resulting outputs
          * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
          * @returns An unsigned transaction created from the passed in parameters.
          *
          */
        this.buildImportTx = (networkID, blockchainID, toAddress, fromAddresses, atomics, sourceChain = undefined, fee = undefined, feeAssetID = undefined) => {
            const zero = new bn_js_1.default(0);
            let ins = [];
            const outs = [];
            if (typeof fee === "undefined") {
                fee = zero.clone();
            }
            let feepaid = new bn_js_1.default(0);
            const map = new Map();
            atomics.forEach((atomic) => {
                const assetIDBuf = atomic.getAssetID();
                const assetID = bintools.cb58Encode(atomic.getAssetID());
                const output = atomic.getOutput();
                const amt = output.getAmount().clone();
                let infeeamount = amt.clone();
                if (typeof feeAssetID !== "undefined" &&
                    fee.gt(zero) &&
                    feepaid.lt(fee) &&
                    (buffer_1.Buffer.compare(feeAssetID, assetIDBuf) === 0)) {
                    feepaid = feepaid.add(infeeamount);
                    if (feepaid.gt(fee)) {
                        infeeamount = feepaid.sub(fee);
                        feepaid = fee.clone();
                    }
                    else {
                        infeeamount = zero.clone();
                    }
                }
                const txid = atomic.getTxID();
                const outputidx = atomic.getOutputIdx();
                const input = new inputs_1.SECPTransferInput(amt);
                const xferin = new inputs_1.TransferableInput(txid, outputidx, assetIDBuf, input);
                const from = output.getAddresses();
                const spenders = output.getSpenders(from);
                spenders.forEach((spender) => {
                    const idx = output.getAddressIdx(spender);
                    if (idx === -1) {
                        /* istanbul ignore next */
                        throw new errors_1.AddressError("Error - UTXOSet.buildImportTx: no such address in output");
                    }
                    xferin.getInput().addSignatureIdx(idx, spender);
                });
                ins.push(xferin);
                // lexicographically sort array
                ins = ins.sort(inputs_1.TransferableInput.comparator());
                if (map.has(assetID)) {
                    infeeamount = infeeamount.add(new bn_js_1.default(map.get(assetID)));
                }
                map.set(assetID, infeeamount.toString());
            });
            for (let [assetID, amount] of map) {
                // Create single EVMOutput for each assetID
                const evmOutput = new outputs_1.EVMOutput(toAddress, new bn_js_1.default(amount), bintools.cb58Decode(assetID));
                outs.push(evmOutput);
            }
            const importTx = new importtx_1.ImportTx(networkID, blockchainID, sourceChain, ins, outs);
            return new tx_1.UnsignedTx(importTx);
        };
        /**
        * Creates an unsigned ExportTx transaction.
        *
        * @param networkID The number representing NetworkID of the node
        * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
        * @param amount The amount being exported as a {@link https://github.com/indutny/bn.js/|BN}
        * @param avaxAssetID {@link https://github.com/feross/buffer|Buffer} of the AssetID for AVAX
        * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who recieves the AVAX
        * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who owns the AVAX
        * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs.
        * @param destinationChain Optional. A {@link https://github.com/feross/buffer|Buffer} for the chainid where to send the asset.
        * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
        * @param feeAssetID Optional. The assetID of the fees being burned.
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        * @param locktime Optional. The locktime field created in the resulting outputs
        * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
        * @returns An unsigned transaction created from the passed in parameters.
        *
        */
        this.buildExportTx = (networkID, blockchainID, amount, avaxAssetID, toAddresses, fromAddresses, changeAddresses = undefined, destinationChain = undefined, fee = undefined, feeAssetID = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => {
            let ins = [];
            let outs = [];
            let exportouts = [];
            if (typeof changeAddresses === "undefined") {
                changeAddresses = toAddresses;
            }
            const zero = new bn_js_1.default(0);
            if (amount.eq(zero)) {
                return undefined;
            }
            if (typeof feeAssetID === 'undefined') {
                feeAssetID = avaxAssetID;
            }
            else if (feeAssetID.toString('hex') !== avaxAssetID.toString('hex')) {
                /* istanbul ignore next */
                throw new errors_1.FeeAssetError('Error - UTXOSet.buildExportTx: feeAssetID must match avaxAssetID');
            }
            if (typeof destinationChain === 'undefined') {
                destinationChain = bintools.cb58Decode(constants_2.PlatformChainID);
            }
            const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
            if (avaxAssetID.toString('hex') === feeAssetID.toString('hex')) {
                aad.addAssetAmount(avaxAssetID, amount, fee);
            }
            else {
                aad.addAssetAmount(avaxAssetID, amount, zero);
                if (this._feeCheck(fee, feeAssetID)) {
                    aad.addAssetAmount(feeAssetID, zero, fee);
                }
            }
            const success = this.getMinimumSpendable(aad, asOf, locktime, threshold);
            if (typeof success === 'undefined') {
                outs = aad.getChangeOutputs();
                exportouts = aad.getOutputs();
            }
            else {
                throw success;
            }
            const exportTx = new exporttx_1.ExportTx(networkID, blockchainID, destinationChain, ins, exportouts);
            return new tx_1.UnsignedTx(exportTx);
        };
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        let utxos = {};
        for (let utxoid in fields["utxos"]) {
            let utxoidCleaned = serializer.decoder(utxoid, encoding, "base58", "base58");
            utxos[utxoidCleaned] = new UTXO();
            utxos[utxoidCleaned].deserialize(fields["utxos"][utxoid], encoding);
        }
        let addressUTXOs = {};
        for (let address in fields["addressUTXOs"]) {
            let addressCleaned = serializer.decoder(address, encoding, "cb58", "hex");
            let utxobalance = {};
            for (let utxoid in fields["addressUTXOs"][address]) {
                let utxoidCleaned = serializer.decoder(utxoid, encoding, "base58", "base58");
                utxobalance[utxoidCleaned] = serializer.decoder(fields["addressUTXOs"][address][utxoid], encoding, "decimalString", "BN");
            }
            addressUTXOs[addressCleaned] = utxobalance;
        }
        this.utxos = utxos;
        this.addressUTXOs = addressUTXOs;
    }
    parseUTXO(utxo) {
        const utxovar = new UTXO();
        // force a copy
        if (typeof utxo === 'string') {
            utxovar.fromBuffer(bintools.cb58Decode(utxo));
        }
        else if (utxo instanceof UTXO) {
            utxovar.fromBuffer(utxo.toBuffer()); // forces a copy
        }
        else {
            /* istanbul ignore next */
            throw new errors_1.UTXOError("Error - UTXO.parseUTXO: utxo parameter is not a UTXO or string");
        }
        return utxovar;
    }
    create(...args) {
        return new UTXOSet();
    }
    clone() {
        const newset = this.create();
        const allUTXOs = this.getAllUTXOs();
        newset.addArray(allUTXOs);
        return newset;
    }
    _feeCheck(fee, feeAssetID) {
        return (typeof fee !== "undefined" &&
            typeof feeAssetID !== "undefined" &&
            fee.gt(new bn_js_1.default(0)) && feeAssetID instanceof buffer_1.Buffer);
    }
}
exports.UTXOSet = UTXOSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXR4b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9ldm0vdXR4b3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBRUgsb0NBQWlDO0FBQ2pDLG9FQUE0QztBQUM1QyxrREFBdUI7QUFDdkIsdUNBS21CO0FBQ25CLDJDQUEyQztBQUMzQyxxQ0FJa0I7QUFFbEIsaUVBQXNEO0FBQ3RELDhDQUc0QjtBQUM1QixxREFBd0Q7QUFDeEQsMERBR2tDO0FBQ2xDLDZEQUdtQztBQUNuQyw2QkFBa0M7QUFDbEMseUNBQXNDO0FBQ3RDLHlDQUFzQztBQUN0QywrQ0FBb0c7QUFFbkc7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2xELE1BQU0sVUFBVSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBRTlEOztHQUVHO0FBQ0gsTUFBYSxJQUFLLFNBQVEsb0JBQVk7SUFBdEM7O1FBQ1ksY0FBUyxHQUFHLE1BQU0sQ0FBQztRQUNuQixZQUFPLEdBQUcsU0FBUyxDQUFDO0lBbUVoQyxDQUFDO0lBakVDLHdCQUF3QjtJQUV4QixXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLE1BQU0sR0FBRywyQkFBaUIsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELFVBQVUsQ0FBQyxLQUFhLEVBQUUsU0FBaUIsQ0FBQztRQUMxQyxJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FB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QUMsZ0VBQWdFLENBQUMsQ0FBQztTQUN2RjtRQUNELE9BQU8sT0FBTyxDQUFBO0lBQ2hCLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBRyxJQUFXO1FBQ25CLE9BQU8sSUFBSSxPQUFPLEVBQVUsQ0FBQztJQUMvQixDQUFDO0lBRUQsS0FBSztRQUNILE1BQU0sTUFBTSxHQUFZLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUN0QyxNQUFNLFFBQVEsR0FBVyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDNUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUN6QixPQUFPLE1BQWMsQ0FBQztJQUN4QixDQUFDO0lBRUQsU0FBUyxDQUFDLEdBQU8sRUFBRSxVQUFrQjtRQUNuQyxPQUFPLENBQUMsT0FBTyxHQUFHLEtBQUssV0FBVztZQUNsQyxPQUFPLFVBQVUsS0FBSyxXQUFXO1lBQ2pDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLFlBQVksZUFBTSxDQUFDLENBQUM7SUFDckQsQ0FBQztDQThQRjtBQXZURCwwQkF1VEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktRVZNLVVUWE9zXG4gKi9cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLyc7XG5pbXBvcnQgQmluVG9vbHMgZnJvbSAnLi4vLi4vdXRpbHMvYmludG9vbHMnO1xuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiO1xuaW1wb3J0IHsgXG4gIEFtb3VudE91dHB1dCwgXG4gIFNlbGVjdE91dHB1dENsYXNzLCBcbiAgVHJhbnNmZXJhYmxlT3V0cHV0LCBcbiAgRVZNT3V0cHV0IFxufSBmcm9tICcuL291dHB1dHMnO1xuaW1wb3J0IHsgRVZNQ29uc3RhbnRzIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgXG4gIEVWTUlucHV0LCBcbiAgU0VDUFRyYW5zZmVySW5wdXQsIFxuICBUcmFuc2ZlcmFibGVJbnB1dCBcbn0gZnJvbSAnLi9pbnB1dHMnO1xuaW1wb3J0IHsgT3V0cHV0IH0gZnJvbSAnLi4vLi4vY29tbW9uL291dHB1dCc7XG5pbXBvcnQgeyBVbml4Tm93IH0gZnJvbSAnLi4vLi4vdXRpbHMvaGVscGVyZnVuY3Rpb25zJztcbmltcG9ydCB7IFxuICBTdGFuZGFyZFVUWE8sIFxuICBTdGFuZGFyZFVUWE9TZXQgXG59IGZyb20gJy4uLy4uL2NvbW1vbi91dHhvcyc7XG5pbXBvcnQgeyBQbGF0Zm9ybUNoYWluSUQgfSBmcm9tICcuLi8uLi91dGlscy9jb25zdGFudHMnO1xuaW1wb3J0IHsgXG4gIFN0YW5kYXJkQXNzZXRBbW91bnREZXN0aW5hdGlvbiwgXG4gIEFzc2V0QW1vdW50IFxufSBmcm9tICcuLi8uLi9jb21tb24vYXNzZXRhbW91bnQnO1xuaW1wb3J0IHsgXG4gIFNlcmlhbGl6YXRpb24sIFxuICBTZXJpYWxpemVkRW5jb2RpbmcgXG59IGZyb20gJy4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb24nO1xuaW1wb3J0IHsgVW5zaWduZWRUeCB9IGZyb20gJy4vdHgnO1xuaW1wb3J0IHsgSW1wb3J0VHggfSBmcm9tICcuL2ltcG9ydHR4JztcbmltcG9ydCB7IEV4cG9ydFR4IH0gZnJvbSAnLi9leHBvcnR0eCc7XG5pbXBvcnQgeyBVVFhPRXJyb3IsIEFkZHJlc3NFcnJvciwgSW5zdWZmaWNpZW50RnVuZHNFcnJvciwgRmVlQXNzZXRFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzL2Vycm9ycyc7XG4gXG4gLyoqXG4gICogQGlnbm9yZVxuICAqL1xuIGNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKCk7XG4gY29uc3Qgc2VyaWFsaXplcjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKTtcbiBcbiAvKipcbiAgKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEgc2luZ2xlIFVUWE8uXG4gICovXG4gZXhwb3J0IGNsYXNzIFVUWE8gZXh0ZW5kcyBTdGFuZGFyZFVUWE8ge1xuICAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVVRYT1wiO1xuICAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG4gXG4gICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcbiBcbiAgIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICAgdGhpcy5vdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhmaWVsZHNbXCJvdXRwdXRcIl1bXCJfdHlwZUlEXCJdKTtcbiAgICAgdGhpcy5vdXRwdXQuZGVzZXJpYWxpemUoZmllbGRzW1wib3V0cHV0XCJdLCBlbmNvZGluZyk7XG4gICB9XG4gXG4gICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6bnVtYmVyIHtcbiAgICAgdGhpcy5jb2RlY0lEID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMik7XG4gICAgIG9mZnNldCArPSAyO1xuICAgICB0aGlzLnR4aWQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMik7XG4gICAgIG9mZnNldCArPSAzMjtcbiAgICAgdGhpcy5vdXRwdXRpZHggPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KTtcbiAgICAgb2Zmc2V0ICs9IDQ7XG4gICAgIHRoaXMuYXNzZXRJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKTtcbiAgICAgb2Zmc2V0ICs9IDMyO1xuICAgICBjb25zdCBvdXRwdXRpZDogbnVtYmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCkucmVhZFVJbnQzMkJFKDApO1xuICAgICBvZmZzZXQgKz0gNDtcbiAgICAgdGhpcy5vdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhvdXRwdXRpZCk7XG4gICAgIHJldHVybiB0aGlzLm91dHB1dC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpO1xuICAgfVxuIFxuICAgLyoqXG4gICAgKiBUYWtlcyBhIGJhc2UtNTggc3RyaW5nIGNvbnRhaW5pbmcgYSBbW1VUWE9dXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBTdGFuZGFyZFVUWE8gaW4gYnl0ZXMuXG4gICAgKlxuICAgICogQHBhcmFtIHNlcmlhbGl6ZWQgQSBiYXNlLTU4IHN0cmluZyBjb250YWluaW5nIGEgcmF3IFtbVVRYT11dXG4gICAgKlxuICAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbVVRYT11dXG4gICAgKlxuICAgICogQHJlbWFya3NcbiAgICAqIHVubGlrZSBtb3N0IGZyb21TdHJpbmdzLCBpdCBleHBlY3RzIHRoZSBzdHJpbmcgdG8gYmUgc2VyaWFsaXplZCBpbiBjYjU4IGZvcm1hdFxuICAgICovXG4gICBmcm9tU3RyaW5nKHNlcmlhbGl6ZWQ6IHN0cmluZyk6IG51bWJlciB7XG4gICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICByZXR1cm4gdGhpcy5mcm9tQnVmZmVyKGJpbnRvb2xzLmNiNThEZWNvZGUoc2VyaWFsaXplZCkpO1xuICAgfVxuIFxuICAgLyoqXG4gICAgKiBSZXR1cm5zIGEgYmFzZS01OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tVVFhPXV0uXG4gICAgKlxuICAgICogQHJlbWFya3NcbiAgICAqIHVubGlrZSBtb3N0IHRvU3RyaW5ncywgdGhpcyByZXR1cm5zIGluIGNiNTggc2VyaWFsaXphdGlvbiBmb3JtYXRcbiAgICAqL1xuICAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgcmV0dXJuIGJpbnRvb2xzLmNiNThFbmNvZGUodGhpcy50b0J1ZmZlcigpKTtcbiAgIH1cbiBcbiAgIGNsb25lKCk6IHRoaXMge1xuICAgICBjb25zdCB1dHhvOiBVVFhPID0gbmV3IFVUWE8oKTtcbiAgICAgdXR4by5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSk7XG4gICAgIHJldHVybiB1dHhvIGFzIHRoaXM7XG4gICB9XG4gXG4gICBjcmVhdGUoXG4gICAgIGNvZGVjSUQ6IG51bWJlciA9IEVWTUNvbnN0YW50cy5MQVRFU1RDT0RFQywgXG4gICAgIHR4SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICAgb3V0cHV0aWR4OiBCdWZmZXIgfCBudW1iZXIgPSB1bmRlZmluZWQsXG4gICAgIGFzc2V0SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICAgb3V0cHV0OiBPdXRwdXQgPSB1bmRlZmluZWQpOnRoaXMgXG4gICB7XG4gICAgIHJldHVybiBuZXcgVVRYTyhjb2RlY0lELCB0eElELCBvdXRwdXRpZHgsIGFzc2V0SUQsIG91dHB1dCkgYXMgdGhpcztcbiAgIH1cbiBcbiB9XG4gXG4gZXhwb3J0IGNsYXNzIEFzc2V0QW1vdW50RGVzdGluYXRpb24gZXh0ZW5kcyBTdGFuZGFyZEFzc2V0QW1vdW50RGVzdGluYXRpb248VHJhbnNmZXJhYmxlT3V0cHV0LCBUcmFuc2ZlcmFibGVJbnB1dD4ge31cbiBcbiAvKipcbiAgKiBDbGFzcyByZXByZXNlbnRpbmcgYSBzZXQgb2YgW1tVVFhPXV1zLlxuICAqL1xuIGV4cG9ydCBjbGFzcyBVVFhPU2V0IGV4dGVuZHMgU3RhbmRhcmRVVFhPU2V0PFVUWE8+e1xuICAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVVRYT1NldFwiO1xuICAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG4gICBcbiAgIC8vc2VyaWFsaXplIGlzIGluaGVyaXRlZFxuIFxuICAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpO1xuICAgICBsZXQgdXR4b3MgPSB7fTtcbiAgICAgZm9yKGxldCB1dHhvaWQgaW4gZmllbGRzW1widXR4b3NcIl0pe1xuICAgICAgIGxldCB1dHhvaWRDbGVhbmVkOiBzdHJpbmcgPSBzZXJpYWxpemVyLmRlY29kZXIodXR4b2lkLCBlbmNvZGluZywgXCJiYXNlNThcIiwgXCJiYXNlNThcIik7XG4gICAgICAgdXR4b3NbdXR4b2lkQ2xlYW5lZF0gPSBuZXcgVVRYTygpO1xuICAgICAgIHV0eG9zW3V0eG9pZENsZWFuZWRdLmRlc2VyaWFsaXplKGZpZWxkc1tcInV0eG9zXCJdW3V0eG9pZF0sIGVuY29kaW5nKTtcbiAgICAgfVxuICAgICBsZXQgYWRkcmVzc1VUWE9zID0ge307XG4gICAgIGZvcihsZXQgYWRkcmVzcyBpbiBmaWVsZHNbXCJhZGRyZXNzVVRYT3NcIl0pe1xuICAgICAgIGxldCBhZGRyZXNzQ2xlYW5lZDogc3RyaW5nID0gc2VyaWFsaXplci5kZWNvZGVyKGFkZHJlc3MsIGVuY29kaW5nLCBcImNiNThcIiwgXCJoZXhcIik7XG4gICAgICAgbGV0IHV0eG9iYWxhbmNlID0ge307XG4gICAgICAgZm9yKGxldCB1dHhvaWQgaW4gZmllbGRzW1wiYWRkcmVzc1VUWE9zXCJdW2FkZHJlc3NdKXtcbiAgICAgICAgIGxldCB1dHhvaWRDbGVhbmVkOiBzdHJpbmcgPSBzZXJpYWxpemVyLmRlY29kZXIodXR4b2lkLCBlbmNvZGluZywgXCJiYXNlNThcIiwgXCJiYXNlNThcIik7XG4gICAgICAgICB1dHhvYmFsYW5jZVt1dHhvaWRDbGVhbmVkXSA9IHNlcmlhbGl6ZXIuZGVjb2RlcihmaWVsZHNbXCJhZGRyZXNzVVRYT3NcIl1bYWRkcmVzc11bdXR4b2lkXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJOXCIpO1xuICAgICAgIH1cbiAgICAgICBhZGRyZXNzVVRYT3NbYWRkcmVzc0NsZWFuZWRdID0gdXR4b2JhbGFuY2U7XG4gICAgIH1cbiAgICAgdGhpcy51dHhvcyA9IHV0eG9zO1xuICAgICB0aGlzLmFkZHJlc3NVVFhPcyA9IGFkZHJlc3NVVFhPcztcbiAgIH1cbiBcbiAgIHBhcnNlVVRYTyh1dHhvOiBVVFhPIHwgc3RyaW5nKTogVVRYTyB7XG4gICAgIGNvbnN0IHV0eG92YXI6IFVUWE8gPSBuZXcgVVRYTygpO1xuICAgICAvLyBmb3JjZSBhIGNvcHlcbiAgICAgaWYgKHR5cGVvZiB1dHhvID09PSAnc3RyaW5nJykge1xuICAgICAgIHV0eG92YXIuZnJvbUJ1ZmZlcihiaW50b29scy5jYjU4RGVjb2RlKHV0eG8pKTtcbiAgICAgfSBlbHNlIGlmICh1dHhvIGluc3RhbmNlb2YgVVRYTykge1xuICAgICAgIHV0eG92YXIuZnJvbUJ1ZmZlcih1dHhvLnRvQnVmZmVyKCkpOyAvLyBmb3JjZXMgYSBjb3B5XG4gICAgIH0gZWxzZSB7XG4gICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICB0aHJvdyBuZXcgVVRYT0Vycm9yKFwiRXJyb3IgLSBVVFhPLnBhcnNlVVRYTzogdXR4byBwYXJhbWV0ZXIgaXMgbm90IGEgVVRYTyBvciBzdHJpbmdcIik7XG4gICAgIH1cbiAgICAgcmV0dXJuIHV0eG92YXJcbiAgIH1cbiBcbiAgIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXN7XG4gICAgIHJldHVybiBuZXcgVVRYT1NldCgpIGFzIHRoaXM7XG4gICB9XG4gXG4gICBjbG9uZSgpOiB0aGlzIHtcbiAgICAgY29uc3QgbmV3c2V0OiBVVFhPU2V0ID0gdGhpcy5jcmVhdGUoKTtcbiAgICAgY29uc3QgYWxsVVRYT3M6IFVUWE9bXSA9IHRoaXMuZ2V0QWxsVVRYT3MoKTtcbiAgICAgbmV3c2V0LmFkZEFycmF5KGFsbFVUWE9zKVxuICAgICByZXR1cm4gbmV3c2V0IGFzIHRoaXM7XG4gICB9XG4gXG4gICBfZmVlQ2hlY2soZmVlOiBCTiwgZmVlQXNzZXRJRDogQnVmZmVyKTogYm9vbGVhbiB7XG4gICAgIHJldHVybiAodHlwZW9mIGZlZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBcbiAgICAgdHlwZW9mIGZlZUFzc2V0SUQgIT09IFwidW5kZWZpbmVkXCIgJiZcbiAgICAgZmVlLmd0KG5ldyBCTigwKSkgJiYgZmVlQXNzZXRJRCBpbnN0YW5jZW9mIEJ1ZmZlcik7XG4gICB9XG4gXG4gICBnZXRNaW5pbXVtU3BlbmRhYmxlID0gKFxuICAgICBhYWQ6QXNzZXRBbW91bnREZXN0aW5hdGlvbiwgXG4gICAgIGFzT2Y6Qk4gPSBVbml4Tm93KCksIFxuICAgICBsb2NrdGltZTpCTiA9IG5ldyBCTigwKSwgXG4gICAgIHRocmVzaG9sZDpudW1iZXIgPSAxXG4gICAgKTpFcnJvciA9PiB7XG4gICAgIGNvbnN0IHV0eG9BcnJheTogVVRYT1tdID0gdGhpcy5nZXRBbGxVVFhPcygpO1xuICAgICBjb25zdCBvdXRpZHM6IG9iamVjdCA9IHt9O1xuICAgICBmb3IobGV0IGk6IG51bWJlciA9IDA7IGkgPCB1dHhvQXJyYXkubGVuZ3RoICYmICFhYWQuY2FuQ29tcGxldGUoKTsgaSsrKSB7XG4gICAgICAgY29uc3QgdTogVVRYTyA9IHV0eG9BcnJheVtpXTtcbiAgICAgICBjb25zdCBhc3NldEtleTogc3RyaW5nID0gdS5nZXRBc3NldElEKCkudG9TdHJpbmcoXCJoZXhcIik7XG4gICAgICAgY29uc3QgZnJvbUFkZHJlc3NlczogQnVmZmVyW10gPSBhYWQuZ2V0U2VuZGVycygpO1xuICAgICAgIGlmKHUuZ2V0T3V0cHV0KCkgaW5zdGFuY2VvZiBBbW91bnRPdXRwdXQgJiYgYWFkLmFzc2V0RXhpc3RzKGFzc2V0S2V5KSAmJiB1LmdldE91dHB1dCgpLm1lZXRzVGhyZXNob2xkKGZyb21BZGRyZXNzZXMsIGFzT2YpKSB7XG4gICAgICAgICBjb25zdCBhbTogQXNzZXRBbW91bnQgPSBhYWQuZ2V0QXNzZXRBbW91bnQoYXNzZXRLZXkpO1xuICAgICAgICAgaWYoIWFtLmlzRmluaXNoZWQoKSl7XG4gICAgICAgICAgIGNvbnN0IHVvdXQ6IEFtb3VudE91dHB1dCA9IHUuZ2V0T3V0cHV0KCkgYXMgQW1vdW50T3V0cHV0O1xuICAgICAgICAgICBvdXRpZHNbYXNzZXRLZXldID0gdW91dC5nZXRPdXRwdXRJRCgpO1xuICAgICAgICAgICBjb25zdCBhbW91bnQgPSB1b3V0LmdldEFtb3VudCgpO1xuICAgICAgICAgICBhbS5zcGVuZEFtb3VudChhbW91bnQpO1xuICAgICAgICAgICBjb25zdCB0eGlkOiBCdWZmZXIgPSB1LmdldFR4SUQoKTtcbiAgICAgICAgICAgY29uc3Qgb3V0cHV0aWR4OiBCdWZmZXIgPSB1LmdldE91dHB1dElkeCgpO1xuICAgICAgICAgICBjb25zdCBpbnB1dDogU0VDUFRyYW5zZmVySW5wdXQgPSBuZXcgU0VDUFRyYW5zZmVySW5wdXQoYW1vdW50KTtcbiAgICAgICAgICAgY29uc3QgeGZlcmluOiBUcmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBUcmFuc2ZlcmFibGVJbnB1dCh0eGlkLCBvdXRwdXRpZHgsIHUuZ2V0QXNzZXRJRCgpLCBpbnB1dCk7XG4gICAgICAgICAgIGNvbnN0IHNwZW5kZXJzOiBCdWZmZXJbXSA9IHVvdXQuZ2V0U3BlbmRlcnMoZnJvbUFkZHJlc3NlcywgYXNPZik7XG4gICAgICAgICAgIHNwZW5kZXJzLmZvckVhY2goKHNwZW5kZXI6IEJ1ZmZlcikgPT4ge1xuICAgICAgICAgICAgIGNvbnN0IGlkeDogbnVtYmVyID0gdW91dC5nZXRBZGRyZXNzSWR4KHNwZW5kZXIpO1xuICAgICAgICAgICAgIGlmIChpZHggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihcIkVycm9yIC0gVVRYT1NldC5nZXRNaW5pbXVtU3BlbmRhYmxlOiBubyBzdWNoIGFkZHJlc3MgaW4gb3V0cHV0XCIpO1xuICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICB4ZmVyaW4uZ2V0SW5wdXQoKS5hZGRTaWduYXR1cmVJZHgoaWR4LCBzcGVuZGVyKTtcbiAgICAgICAgICAgfSk7XG4gICAgICAgICAgIGFhZC5hZGRJbnB1dCh4ZmVyaW4pO1xuICAgICAgICAgfSBlbHNlIGlmKGFhZC5hc3NldEV4aXN0cyhhc3NldEtleSkgJiYgISh1LmdldE91dHB1dCgpIGluc3RhbmNlb2YgQW1vdW50T3V0cHV0KSl7XG4gICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBMZWF2aW5nIHRoZSBiZWxvdyBsaW5lcywgbm90IHNpbXBseSBmb3IgcG9zdGVyaXR5LCBidXQgZm9yIGNsYXJpZmljYXRpb24uXG4gICAgICAgICAgICAqIEFzc2V0SURzIG1heSBoYXZlIG1peGVkIE91dHB1dFR5cGVzLiBcbiAgICAgICAgICAgICogU29tZSBvZiB0aG9zZSBPdXRwdXRUeXBlcyBtYXkgaW1wbGVtZW50IEFtb3VudE91dHB1dC5cbiAgICAgICAgICAgICogT3RoZXJzIG1heSBub3QuXG4gICAgICAgICAgICAqIFNpbXBseSBjb250aW51ZSBpbiB0aGlzIGNvbmRpdGlvbi5cbiAgICAgICAgICAgICovXG4gICAgICAgICAgIC8qcmV0dXJuIG5ldyBFcnJvcignRXJyb3IgLSBVVFhPU2V0LmdldE1pbmltdW1TcGVuZGFibGU6IG91dHB1dElEIGRvZXMgbm90ICdcbiAgICAgICAgICAgICArIGBpbXBsZW1lbnQgQW1vdW50T3V0cHV0OiAke3UuZ2V0T3V0cHV0KCkuZ2V0T3V0cHV0SUR9YCk7Ki9cbiAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgIH1cbiAgICAgICB9XG4gICAgIH1cbiAgICAgaWYoIWFhZC5jYW5Db21wbGV0ZSgpKSB7XG4gICAgICAgcmV0dXJuIG5ldyBJbnN1ZmZpY2llbnRGdW5kc0Vycm9yKGBFcnJvciAtIFVUWE9TZXQuZ2V0TWluaW11bVNwZW5kYWJsZTogaW5zdWZmaWNpZW50IGZ1bmRzIHRvIGNyZWF0ZSB0aGUgdHJhbnNhY3Rpb25gKTtcbiAgICAgfVxuICAgICBjb25zdCBhbW91bnRzOiBBc3NldEFtb3VudFtdID0gYWFkLmdldEFtb3VudHMoKTtcbiAgICAgY29uc3QgemVybzogQk4gPSBuZXcgQk4oMCk7XG4gICAgIGZvcihsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFtb3VudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICBjb25zdCBhc3NldEtleTogc3RyaW5nID0gYW1vdW50c1tpXS5nZXRBc3NldElEU3RyaW5nKCk7XG4gICAgICAgY29uc3QgYW1vdW50OiBCTiA9IGFtb3VudHNbaV0uZ2V0QW1vdW50KCk7XG4gICAgICAgaWYgKGFtb3VudC5ndCh6ZXJvKSkge1xuICAgICAgICAgY29uc3Qgc3BlbmRvdXQ6IEFtb3VudE91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKG91dGlkc1thc3NldEtleV0sXG4gICAgICAgICAgIGFtb3VudCwgYWFkLmdldERlc3RpbmF0aW9ucygpLCBsb2NrdGltZSwgdGhyZXNob2xkKSBhcyBBbW91bnRPdXRwdXQ7XG4gICAgICAgICBjb25zdCB4ZmVyb3V0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KGFtb3VudHNbaV0uZ2V0QXNzZXRJRCgpLCBzcGVuZG91dCk7XG4gICAgICAgICBhYWQuYWRkT3V0cHV0KHhmZXJvdXQpO1xuICAgICAgIH1cbiAgICAgICBjb25zdCBjaGFuZ2U6IEJOID0gYW1vdW50c1tpXS5nZXRDaGFuZ2UoKTtcbiAgICAgICBpZiAoY2hhbmdlLmd0KHplcm8pKSB7XG4gICAgICAgICBjb25zdCBjaGFuZ2VvdXQ6IEFtb3VudE91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKG91dGlkc1thc3NldEtleV0sXG4gICAgICAgICAgIGNoYW5nZSwgYWFkLmdldENoYW5nZUFkZHJlc3NlcygpKSBhcyBBbW91bnRPdXRwdXQ7XG4gICAgICAgICBjb25zdCBjaGd4ZmVyb3V0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KGFtb3VudHNbaV0uZ2V0QXNzZXRJRCgpLCBjaGFuZ2VvdXQpO1xuICAgICAgICAgYWFkLmFkZENoYW5nZShjaGd4ZmVyb3V0KTtcbiAgICAgICB9XG4gICAgIH1cbiAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgIH1cbiBcbiAgIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gdW5zaWduZWQgSW1wb3J0VHggdHJhbnNhY3Rpb24uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbmV0d29ya0lEIFRoZSBudW1iZXIgcmVwcmVzZW50aW5nIE5ldHdvcmtJRCBvZiB0aGUgbm9kZVxuICAgICAqIEBwYXJhbSBibG9ja2NoYWluSUQgVGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgQmxvY2tjaGFpbklEIGZvciB0aGUgdHJhbnNhY3Rpb25cbiAgICAgKiBAcGFyYW0gdG9BZGRyZXNzIFRoZSBhZGRyZXNzIHRvIHNlbmQgdGhlIGZ1bmRzXG4gICAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAgICogQHBhcmFtIGltcG9ydElucyBBbiBhcnJheSBvZiBbW1RyYW5zZmVyYWJsZUlucHV0XV1zIGJlaW5nIGltcG9ydGVkXG4gICAgICogQHBhcmFtIHNvdXJjZUNoYWluIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBjaGFpbmlkIHdoZXJlIHRoZSBpbXBvcnRzIGFyZSBjb21pbmcgZnJvbS5cbiAgICAgKiBAcGFyYW0gZmVlIE9wdGlvbmFsLiBUaGUgYW1vdW50IG9mIGZlZXMgdG8gYnVybiBpbiBpdHMgc21hbGxlc3QgZGVub21pbmF0aW9uLCByZXByZXNlbnRlZCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfS4gRmVlIHdpbGwgY29tZSBmcm9tIHRoZSBpbnB1dHMgZmlyc3QsIGlmIHRoZXkgY2FuLlxuICAgICAqIEBwYXJhbSBmZWVBc3NldElEIE9wdGlvbmFsLiBUaGUgYXNzZXRJRCBvZiB0aGUgZmVlcyBiZWluZyBidXJuZWQuIFxuICAgICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICAgKiBAcGFyYW0gbG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0c1xuICAgICAqIEBwYXJhbSB0aHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gY3JlYXRlZCBmcm9tIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVycy5cbiAgICAgKlxuICAgICAqL1xuICAgIGJ1aWxkSW1wb3J0VHggPSAoXG4gICAgIG5ldHdvcmtJRDogbnVtYmVyLCBcbiAgICAgYmxvY2tjaGFpbklEOiBCdWZmZXIsXG4gICAgIHRvQWRkcmVzczogc3RyaW5nLFxuICAgICBmcm9tQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICAgYXRvbWljczogVVRYT1tdLFxuICAgICBzb3VyY2VDaGFpbjogQnVmZmVyID0gdW5kZWZpbmVkLCBcbiAgICAgZmVlOiBCTiA9IHVuZGVmaW5lZCxcbiAgICAgZmVlQXNzZXRJRDogQnVmZmVyID0gdW5kZWZpbmVkXG4gICApOiBVbnNpZ25lZFR4ID0+IHtcblxuICAgICBjb25zdCB6ZXJvOiBCTiA9IG5ldyBCTigwKTtcbiAgICAgbGV0IGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IFtdO1xuICAgICBjb25zdCBvdXRzOiBFVk1PdXRwdXRbXSA9IFtdO1xuXG4gICAgIGlmKHR5cGVvZiBmZWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICBmZWUgPSB6ZXJvLmNsb25lKCk7XG4gICAgIH1cbiBcbiAgICAgbGV0IGZlZXBhaWQ6IEJOID0gbmV3IEJOKDApO1xuICAgICBjb25zdCBtYXA6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG4gICAgIGF0b21pY3MuZm9yRWFjaCgoYXRvbWljOiBVVFhPKSA9PiB7XG4gICAgICAgY29uc3QgYXNzZXRJREJ1ZjogQnVmZmVyID0gYXRvbWljLmdldEFzc2V0SUQoKTsgXG4gICAgICAgY29uc3QgYXNzZXRJRDogc3RyaW5nID0gYmludG9vbHMuY2I1OEVuY29kZShhdG9taWMuZ2V0QXNzZXRJRCgpKTsgXG4gICAgICAgY29uc3Qgb3V0cHV0OiBBbW91bnRPdXRwdXQgPSBhdG9taWMuZ2V0T3V0cHV0KCkgYXMgQW1vdW50T3V0cHV0O1xuICAgICAgIGNvbnN0IGFtdDogQk4gPSBvdXRwdXQuZ2V0QW1vdW50KCkuY2xvbmUoKTtcbiBcbiAgICAgICBsZXQgaW5mZWVhbW91bnQ6IEJOID0gYW10LmNsb25lKCk7XG4gICAgICAgaWYoXG4gICAgICAgICB0eXBlb2YgZmVlQXNzZXRJRCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBcbiAgICAgICAgIGZlZS5ndCh6ZXJvKSAmJiBcbiAgICAgICAgIGZlZXBhaWQubHQoZmVlKSAmJiBcbiAgICAgICAgIChCdWZmZXIuY29tcGFyZShmZWVBc3NldElELCBhc3NldElEQnVmKSA9PT0gMClcbiAgICAgICApIFxuICAgICAgIHtcbiAgICAgICAgIGZlZXBhaWQgPSBmZWVwYWlkLmFkZChpbmZlZWFtb3VudCk7XG4gICAgICAgICBpZihmZWVwYWlkLmd0KGZlZSkpIHtcbiAgICAgICAgICAgaW5mZWVhbW91bnQgPSBmZWVwYWlkLnN1YihmZWUpO1xuICAgICAgICAgICBmZWVwYWlkID0gZmVlLmNsb25lKCk7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICBpbmZlZWFtb3VudCA9ICB6ZXJvLmNsb25lKCk7XG4gICAgICAgICB9XG4gICAgICAgfVxuIFxuICAgICAgIGNvbnN0IHR4aWQ6IEJ1ZmZlciA9IGF0b21pYy5nZXRUeElEKCk7XG4gICAgICAgY29uc3Qgb3V0cHV0aWR4OiBCdWZmZXIgPSBhdG9taWMuZ2V0T3V0cHV0SWR4KCk7XG4gICAgICAgY29uc3QgaW5wdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KGFtdCk7XG4gICAgICAgY29uc3QgeGZlcmluOiBUcmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBUcmFuc2ZlcmFibGVJbnB1dCh0eGlkLCBvdXRwdXRpZHgsIGFzc2V0SURCdWYsIGlucHV0KTtcbiAgICAgICBjb25zdCBmcm9tOiBCdWZmZXJbXSA9IG91dHB1dC5nZXRBZGRyZXNzZXMoKTsgXG4gICAgICAgY29uc3Qgc3BlbmRlcnM6IEJ1ZmZlcltdID0gb3V0cHV0LmdldFNwZW5kZXJzKGZyb20pO1xuICAgICAgIHNwZW5kZXJzLmZvckVhY2goKHNwZW5kZXI6IEJ1ZmZlcikgPT4ge1xuICAgICAgICAgY29uc3QgaWR4OiBudW1iZXIgPSBvdXRwdXQuZ2V0QWRkcmVzc0lkeChzcGVuZGVyKTtcbiAgICAgICAgIGlmIChpZHggPT09IC0xKSB7XG4gICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgIHRocm93IG5ldyBBZGRyZXNzRXJyb3IoXCJFcnJvciAtIFVUWE9TZXQuYnVpbGRJbXBvcnRUeDogbm8gc3VjaCBhZGRyZXNzIGluIG91dHB1dFwiKTtcbiAgICAgICAgIH1cbiAgICAgICAgIHhmZXJpbi5nZXRJbnB1dCgpLmFkZFNpZ25hdHVyZUlkeChpZHgsIHNwZW5kZXIpO1xuICAgICAgIH0pO1xuICAgICAgIGlucy5wdXNoKHhmZXJpbik7XG5cbiAgICAgICAvLyBsZXhpY29ncmFwaGljYWxseSBzb3J0IGFycmF5XG4gICAgICAgaW5zID0gaW5zLnNvcnQoVHJhbnNmZXJhYmxlSW5wdXQuY29tcGFyYXRvcigpKTtcblxuICAgICAgIGlmKG1hcC5oYXMoYXNzZXRJRCkpIHtcbiAgICAgICAgIGluZmVlYW1vdW50ID0gaW5mZWVhbW91bnQuYWRkKG5ldyBCTihtYXAuZ2V0KGFzc2V0SUQpKSk7XG4gICAgICAgfVxuICAgICAgIG1hcC5zZXQoYXNzZXRJRCwgaW5mZWVhbW91bnQudG9TdHJpbmcoKSk7XG4gICAgIH0pO1xuXG4gICAgIGZvcihsZXQgW2Fzc2V0SUQsIGFtb3VudF0gb2YgbWFwKSB7XG4gICAgICAgLy8gQ3JlYXRlIHNpbmdsZSBFVk1PdXRwdXQgZm9yIGVhY2ggYXNzZXRJRFxuICAgICAgICBjb25zdCBldm1PdXRwdXQ6IEVWTU91dHB1dCA9IG5ldyBFVk1PdXRwdXQoXG4gICAgICAgICAgdG9BZGRyZXNzLFxuICAgICAgICAgIG5ldyBCTihhbW91bnQpLFxuICAgICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoYXNzZXRJRClcbiAgICAgICAgKTtcbiAgICAgICAgb3V0cy5wdXNoKGV2bU91dHB1dCk7XG4gICAgIH0gXG5cbiAgICAgY29uc3QgaW1wb3J0VHg6IEltcG9ydFR4ID0gbmV3IEltcG9ydFR4KG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBzb3VyY2VDaGFpbiwgaW5zLCBvdXRzKTtcbiAgICAgcmV0dXJuIG5ldyBVbnNpZ25lZFR4KGltcG9ydFR4KTtcbiAgIH07XG4gXG4gICAvKipcbiAgICogQ3JlYXRlcyBhbiB1bnNpZ25lZCBFeHBvcnRUeCB0cmFuc2FjdGlvbi4gXG4gICAqXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgVGhlIG51bWJlciByZXByZXNlbnRpbmcgTmV0d29ya0lEIG9mIHRoZSBub2RlXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgVGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgQmxvY2tjaGFpbklEIGZvciB0aGUgdHJhbnNhY3Rpb25cbiAgICogQHBhcmFtIGFtb3VudCBUaGUgYW1vdW50IGJlaW5nIGV4cG9ydGVkIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGF2YXhBc3NldElEIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9mIHRoZSBBc3NldElEIGZvciBBVkFYXG4gICAqIEBwYXJhbSB0b0FkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIHJlY2lldmVzIHRoZSBBVkFYXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gb3ducyB0aGUgQVZBWFxuICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIE9wdGlvbmFsLiBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zLlxuICAgKiBAcGFyYW0gZGVzdGluYXRpb25DaGFpbiBPcHRpb25hbC4gQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIGNoYWluaWQgd2hlcmUgdG8gc2VuZCB0aGUgYXNzZXQuXG4gICAqIEBwYXJhbSBmZWUgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgZmVlcyB0byBidXJuIGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBmZWVBc3NldElEIE9wdGlvbmFsLiBUaGUgYXNzZXRJRCBvZiB0aGUgZmVlcyBiZWluZyBidXJuZWQuIFxuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gbG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0c1xuICAgKiBAcGFyYW0gdGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgVVRYT1xuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKi9cbiAgIGJ1aWxkRXhwb3J0VHggPSAoXG4gICAgbmV0d29ya0lEOiBudW1iZXIsIFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyLFxuICAgIGFtb3VudDogQk4sXG4gICAgYXZheEFzc2V0SUQ6IEJ1ZmZlcixcbiAgICB0b0FkZHJlc3NlczogQnVmZmVyW10sXG4gICAgZnJvbUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBCdWZmZXJbXSA9IHVuZGVmaW5lZCxcbiAgICBkZXN0aW5hdGlvbkNoYWluOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgZmVlOiBCTiA9IHVuZGVmaW5lZCxcbiAgICBmZWVBc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWQsIFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgIGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKSwgXG4gICAgdGhyZXNob2xkOiBudW1iZXIgPSAxXG4gICk6IFVuc2lnbmVkVHggPT4ge1xuICAgIGxldCBpbnM6IEVWTUlucHV0W10gPSBbXTtcbiAgICBsZXQgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXTtcbiAgICBsZXQgZXhwb3J0b3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXTtcbiAgICBcbiAgICBpZih0eXBlb2YgY2hhbmdlQWRkcmVzc2VzID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBjaGFuZ2VBZGRyZXNzZXMgPSB0b0FkZHJlc3NlcztcbiAgICB9XG5cbiAgICBjb25zdCB6ZXJvOiBCTiA9IG5ldyBCTigwKTtcbiAgICBcbiAgICBpZiAoYW1vdW50LmVxKHplcm8pKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmKHR5cGVvZiBmZWVBc3NldElEID09PSAndW5kZWZpbmVkJykge1xuICAgICAgZmVlQXNzZXRJRCA9IGF2YXhBc3NldElEO1xuICAgIH0gZWxzZSBpZiAoZmVlQXNzZXRJRC50b1N0cmluZygnaGV4JykgIT09IGF2YXhBc3NldElELnRvU3RyaW5nKCdoZXgnKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBGZWVBc3NldEVycm9yKCdFcnJvciAtIFVUWE9TZXQuYnVpbGRFeHBvcnRUeDogZmVlQXNzZXRJRCBtdXN0IG1hdGNoIGF2YXhBc3NldElEJyk7XG4gICAgfVxuXG4gICAgaWYodHlwZW9mIGRlc3RpbmF0aW9uQ2hhaW4gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBkZXN0aW5hdGlvbkNoYWluID0gYmludG9vbHMuY2I1OERlY29kZShQbGF0Zm9ybUNoYWluSUQpO1xuICAgIH1cblxuICAgIGNvbnN0IGFhZDogQXNzZXRBbW91bnREZXN0aW5hdGlvbiA9IG5ldyBBc3NldEFtb3VudERlc3RpbmF0aW9uKHRvQWRkcmVzc2VzLCBmcm9tQWRkcmVzc2VzLCBjaGFuZ2VBZGRyZXNzZXMpO1xuICAgIGlmKGF2YXhBc3NldElELnRvU3RyaW5nKCdoZXgnKSA9PT0gZmVlQXNzZXRJRC50b1N0cmluZygnaGV4Jykpe1xuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGF2YXhBc3NldElELCBhbW91bnQsIGZlZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChhdmF4QXNzZXRJRCwgYW1vdW50LCB6ZXJvKTtcbiAgICAgIGlmKHRoaXMuX2ZlZUNoZWNrKGZlZSwgZmVlQXNzZXRJRCkpe1xuICAgICAgICBhYWQuYWRkQXNzZXRBbW91bnQoZmVlQXNzZXRJRCwgemVybywgZmVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgc3VjY2VzczogRXJyb3IgPSB0aGlzLmdldE1pbmltdW1TcGVuZGFibGUoYWFkLCBhc09mLCBsb2NrdGltZSwgdGhyZXNob2xkKTtcbiAgICBpZih0eXBlb2Ygc3VjY2VzcyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG91dHMgPSBhYWQuZ2V0Q2hhbmdlT3V0cHV0cygpO1xuICAgICAgZXhwb3J0b3V0cyA9IGFhZC5nZXRPdXRwdXRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IHN1Y2Nlc3M7XG4gICAgfVxuXG4gICAgY29uc3QgZXhwb3J0VHg6IEV4cG9ydFR4ID0gbmV3IEV4cG9ydFR4KG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBkZXN0aW5hdGlvbkNoYWluLCBpbnMsIGV4cG9ydG91dHMpO1xuICAgIHJldHVybiBuZXcgVW5zaWduZWRUeChleHBvcnRUeCk7XG4gIH07XG4gfVxuICJdfQ==