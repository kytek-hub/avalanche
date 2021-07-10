"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UTXOSet = exports.AssetAmountDestination = exports.UTXO = void 0;
/**
 * @packageDocumentation
 * @module API-AVM-UTXOs
  */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const outputs_1 = require("./outputs");
const constants_1 = require("./constants");
const tx_1 = require("./tx");
const inputs_1 = require("./inputs");
const ops_1 = require("./ops");
const helperfunctions_1 = require("../../utils/helperfunctions");
const initialstates_1 = require("./initialstates");
const utxos_1 = require("../../common/utxos");
const createassettx_1 = require("./createassettx");
const operationtx_1 = require("./operationtx");
const basetx_1 = require("./basetx");
const exporttx_1 = require("./exporttx");
const importtx_1 = require("./importtx");
const constants_2 = require("../../utils/constants");
const assetamount_1 = require("../../common/assetamount");
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
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
    create(codecID = constants_1.AVMConstants.LATESTCODEC, txid = undefined, outputidx = undefined, assetID = undefined, output = undefined) {
        return new UTXO(codecID, txid, outputidx, assetID, output);
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
                        for (let j = 0; j < spenders.length; j++) {
                            const idx = uout.getAddressIdx(spenders[j]);
                            if (idx === -1) {
                                /* istanbul ignore next */
                                throw new errors_1.AddressError('Error - UTXOSet.getMinimumSpendable: no such '
                                    + `address in output: ${spenders[j]}`);
                            }
                            xferin.getInput().addSignatureIdx(idx, spenders[j]);
                        }
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
                          + `implement AmountOutput: ${u.getOutput().getOutputID}`)*/
                        continue;
                    }
                }
            }
            if (!aad.canComplete()) {
                return new errors_1.InsufficientFundsError('Error - UTXOSet.getMinimumSpendable: insufficient '
                    + 'funds to create the transaction');
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
         * Creates an [[UnsignedTx]] wrapping a [[BaseTx]]. For more granular control, you may create your own
         * [[UnsignedTx]] wrapping a [[BaseTx]] manually (with their corresponding [[TransferableInput]]s and [[TransferableOutput]]s).
         *
         * @param networkID The number representing NetworkID of the node
         * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
         * @param amount The amount of the asset to be spent in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}.
         * @param assetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for the UTXO
         * @param toAddresses The addresses to send the funds
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs. Default: toAddresses
         * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
         * @param feeAssetID Optional. The assetID of the fees being burned. Default: assetID
         * @param memo Optional. Contains arbitrary data, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         *
         * @returns An unsigned transaction created from the passed in parameters.
         *
         */
        this.buildBaseTx = (networkID, blockchainID, amount, assetID, toAddresses, fromAddresses, changeAddresses = undefined, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => {
            if (threshold > toAddresses.length) {
                /* istanbul ignore next */
                throw new errors_1.ThresholdError("Error - UTXOSet.buildBaseTx: threshold is greater than number of addresses");
            }
            if (typeof changeAddresses === "undefined") {
                changeAddresses = toAddresses;
            }
            if (typeof feeAssetID === "undefined") {
                feeAssetID = assetID;
            }
            const zero = new bn_js_1.default(0);
            if (amount.eq(zero)) {
                return undefined;
            }
            const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
            if (assetID.toString("hex") === feeAssetID.toString("hex")) {
                aad.addAssetAmount(assetID, amount, fee);
            }
            else {
                aad.addAssetAmount(assetID, amount, zero);
                if (this._feeCheck(fee, feeAssetID)) {
                    aad.addAssetAmount(feeAssetID, zero, fee);
                }
            }
            let ins = [];
            let outs = [];
            const success = this.getMinimumSpendable(aad, asOf, locktime, threshold);
            if (typeof success === "undefined") {
                ins = aad.getInputs();
                outs = aad.getAllOutputs();
            }
            else {
                throw success;
            }
            const baseTx = new basetx_1.BaseTx(networkID, blockchainID, outs, ins, memo);
            return new tx_1.UnsignedTx(baseTx);
        };
        /**
         * Creates an unsigned Create Asset transaction. For more granular control, you may create your own
         * [[CreateAssetTX]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s).
         *
         * @param networkID The number representing NetworkID of the node
         * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs
         * @param initialState The [[InitialStates]] that represent the intial state of a created asset
         * @param name String for the descriptive name of the asset
         * @param symbol String for the ticker symbol of the asset
         * @param denomination Optional number for the denomination which is 10^D. D must be >= 0 and <= 32. Ex: $1 AVAX = 10^9 $nAVAX
         * @param mintOutputs Optional. Array of [[SECPMintOutput]]s to be included in the transaction. These outputs can be spent to mint more tokens.
         * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
         * @param feeAssetID Optional. The assetID of the fees being burned.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         *
         * @returns An unsigned transaction created from the passed in parameters.
         *
         */
        this.buildCreateAssetTx = (networkID, blockchainID, fromAddresses, changeAddresses, initialState, name, symbol, denomination, mintOutputs = undefined, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow()) => {
            const zero = new bn_js_1.default(0);
            let ins = [];
            let outs = [];
            if (this._feeCheck(fee, feeAssetID)) {
                const aad = new AssetAmountDestination(fromAddresses, fromAddresses, changeAddresses);
                aad.addAssetAmount(feeAssetID, zero, fee);
                const success = this.getMinimumSpendable(aad, asOf);
                if (typeof success === "undefined") {
                    ins = aad.getInputs();
                    outs = aad.getAllOutputs();
                }
                else {
                    throw success;
                }
            }
            if (typeof mintOutputs !== "undefined") {
                for (let i = 0; i < mintOutputs.length; i++) {
                    if (mintOutputs[i] instanceof outputs_1.SECPMintOutput) {
                        initialState.addOutput(mintOutputs[i]);
                    }
                    else {
                        throw new errors_1.SECPMintOutputError("Error - UTXOSet.buildCreateAssetTx: A submitted mintOutput was not of type SECPMintOutput");
                    }
                }
            }
            let CAtx = new createassettx_1.CreateAssetTx(networkID, blockchainID, outs, ins, memo, name, symbol, denomination, initialState);
            return new tx_1.UnsignedTx(CAtx);
        };
        /**
         * Creates an unsigned Secp mint transaction. For more granular control, you may create your own
         * [[OperationTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param networkID The number representing NetworkID of the node
         * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
         * @param mintOwner A [[SECPMintOutput]] which specifies the new set of minters
         * @param transferOwner A [[SECPTransferOutput]] which specifies where the minted tokens will go
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param mintUTXOID The UTXOID for the [[SCPMintOutput]] being spent to produce more tokens
         * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
         * @param feeAssetID Optional. The assetID of the fees being burned.
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.buildSECPMintTx = (networkID, blockchainID, mintOwner, transferOwner, fromAddresses, changeAddresses, mintUTXOID, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow()) => {
            const zero = new bn_js_1.default(0);
            let ins = [];
            let outs = [];
            if (this._feeCheck(fee, feeAssetID)) {
                const aad = new AssetAmountDestination(fromAddresses, fromAddresses, changeAddresses);
                aad.addAssetAmount(feeAssetID, zero, fee);
                const success = this.getMinimumSpendable(aad, asOf);
                if (typeof success === "undefined") {
                    ins = aad.getInputs();
                    outs = aad.getAllOutputs();
                }
                else {
                    throw success;
                }
            }
            let ops = [];
            let mintOp = new ops_1.SECPMintOperation(mintOwner, transferOwner);
            let utxo = this.getUTXO(mintUTXOID);
            if (typeof utxo === "undefined") {
                throw new errors_1.UTXOError("Error - UTXOSet.buildSECPMintTx: UTXOID not found");
            }
            if (utxo.getOutput().getOutputID() !== constants_1.AVMConstants.SECPMINTOUTPUTID) {
                throw new errors_1.SECPMintOutputError("Error - UTXOSet.buildSECPMintTx: UTXO is not a SECPMINTOUTPUTID");
            }
            let out = utxo.getOutput();
            let spenders = out.getSpenders(fromAddresses, asOf);
            for (let j = 0; j < spenders.length; j++) {
                let idx = out.getAddressIdx(spenders[j]);
                if (idx == -1) {
                    /* istanbul ignore next */
                    throw new Error("Error - UTXOSet.buildSECPMintTx: no such address in output");
                }
                mintOp.addSignatureIdx(idx, spenders[j]);
            }
            let transferableOperation = new ops_1.TransferableOperation(utxo.getAssetID(), [mintUTXOID], mintOp);
            ops.push(transferableOperation);
            let operationTx = new operationtx_1.OperationTx(networkID, blockchainID, outs, ins, memo, ops);
            return new tx_1.UnsignedTx(operationTx);
        };
        /**
        * Creates an unsigned Create Asset transaction. For more granular control, you may create your own
        * [[CreateAssetTX]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s).
        *
        * @param networkID The number representing NetworkID of the node
        * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
        * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
        * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs.
        * @param minterSets The minters and thresholds required to mint this nft asset
        * @param name String for the descriptive name of the nft asset
        * @param symbol String for the ticker symbol of the nft asset
        * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
        * @param feeAssetID Optional. The assetID of the fees being burned.
        * @param memo Optional contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        * @param locktime Optional. The locktime field created in the resulting mint output
        *
        * @returns An unsigned transaction created from the passed in parameters.
        *
        */
        this.buildCreateNFTAssetTx = (networkID, blockchainID, fromAddresses, changeAddresses, minterSets, name, symbol, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = undefined) => {
            const zero = new bn_js_1.default(0);
            let ins = [];
            let outs = [];
            if (this._feeCheck(fee, feeAssetID)) {
                const aad = new AssetAmountDestination(fromAddresses, fromAddresses, changeAddresses);
                aad.addAssetAmount(feeAssetID, zero, fee);
                const success = this.getMinimumSpendable(aad, asOf);
                if (typeof success === "undefined") {
                    ins = aad.getInputs();
                    outs = aad.getAllOutputs();
                }
                else {
                    throw success;
                }
            }
            let initialState = new initialstates_1.InitialStates();
            for (let i = 0; i < minterSets.length; i++) {
                let nftMintOutput = new outputs_1.NFTMintOutput(i, minterSets[i].getMinters(), locktime, minterSets[i].getThreshold());
                initialState.addOutput(nftMintOutput, constants_1.AVMConstants.NFTFXID);
            }
            let denomination = 0; // NFTs are non-fungible
            let CAtx = new createassettx_1.CreateAssetTx(networkID, blockchainID, outs, ins, memo, name, symbol, denomination, initialState);
            return new tx_1.UnsignedTx(CAtx);
        };
        /**
        * Creates an unsigned NFT mint transaction. For more granular control, you may create your own
        * [[OperationTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
        *
        * @param networkID The number representing NetworkID of the node
        * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
        * @param owners An array of [[OutputOwners]] who will be given the NFTs.
        * @param fromAddresses The addresses being used to send the funds from the UTXOs
        * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs.
        * @param utxoids An array of strings for the NFTs being transferred
        * @param groupID Optional. The group this NFT is issued to.
        * @param payload Optional. Data for NFT Payload.
        * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
        * @param feeAssetID Optional. The assetID of the fees being burned.
        * @param memo Optional contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        *
        * @returns An unsigned transaction created from the passed in parameters.
        *
        */
        this.buildCreateNFTMintTx = (networkID, blockchainID, owners, fromAddresses, changeAddresses, utxoids, groupID = 0, payload = undefined, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow()) => {
            const zero = new bn_js_1.default(0);
            let ins = [];
            let outs = [];
            if (this._feeCheck(fee, feeAssetID)) {
                const aad = new AssetAmountDestination(fromAddresses, fromAddresses, changeAddresses);
                aad.addAssetAmount(feeAssetID, zero, fee);
                const success = this.getMinimumSpendable(aad, asOf);
                if (typeof success === "undefined") {
                    ins = aad.getInputs();
                    outs = aad.getAllOutputs();
                }
                else {
                    throw success;
                }
            }
            let ops = [];
            let nftMintOperation = new ops_1.NFTMintOperation(groupID, payload, owners);
            for (let i = 0; i < utxoids.length; i++) {
                let utxo = this.getUTXO(utxoids[i]);
                let out = utxo.getOutput();
                let spenders = out.getSpenders(fromAddresses, asOf);
                for (let j = 0; j < spenders.length; j++) {
                    let idx;
                    idx = out.getAddressIdx(spenders[j]);
                    if (idx == -1) {
                        /* istanbul ignore next */
                        throw new errors_1.AddressError("Error - UTXOSet.buildCreateNFTMintTx: no such address in output");
                    }
                    nftMintOperation.addSignatureIdx(idx, spenders[j]);
                }
                let transferableOperation = new ops_1.TransferableOperation(utxo.getAssetID(), utxoids, nftMintOperation);
                ops.push(transferableOperation);
            }
            let operationTx = new operationtx_1.OperationTx(networkID, blockchainID, outs, ins, memo, ops);
            return new tx_1.UnsignedTx(operationTx);
        };
        /**
        * Creates an unsigned NFT transfer transaction. For more granular control, you may create your own
        * [[OperationTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
        *
        * @param networkID The number representing NetworkID of the node
        * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
        * @param toAddresses An array of {@link https://github.com/feross/buffer|Buffer}s which indicate who recieves the NFT
        * @param fromAddresses An array for {@link https://github.com/feross/buffer|Buffer} who owns the NFT
        * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs.
        * @param utxoids An array of strings for the NFTs being transferred
        * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
        * @param feeAssetID Optional. The assetID of the fees being burned.
        * @param memo Optional contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        * @param locktime Optional. The locktime field created in the resulting outputs
        * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
        *
        * @returns An unsigned transaction created from the passed in parameters.
        *
        */
        this.buildNFTTransferTx = (networkID, blockchainID, toAddresses, fromAddresses, changeAddresses, utxoids, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => {
            const zero = new bn_js_1.default(0);
            let ins = [];
            let outs = [];
            if (this._feeCheck(fee, feeAssetID)) {
                const aad = new AssetAmountDestination(fromAddresses, fromAddresses, changeAddresses);
                aad.addAssetAmount(feeAssetID, zero, fee);
                const success = this.getMinimumSpendable(aad, asOf);
                if (typeof success === "undefined") {
                    ins = aad.getInputs();
                    outs = aad.getAllOutputs();
                }
                else {
                    throw success;
                }
            }
            const ops = [];
            for (let i = 0; i < utxoids.length; i++) {
                const utxo = this.getUTXO(utxoids[i]);
                const out = utxo.getOutput();
                const spenders = out.getSpenders(fromAddresses, asOf);
                const outbound = new outputs_1.NFTTransferOutput(out.getGroupID(), out.getPayload(), toAddresses, locktime, threshold);
                const op = new ops_1.NFTTransferOperation(outbound);
                for (let j = 0; j < spenders.length; j++) {
                    const idx = out.getAddressIdx(spenders[j]);
                    if (idx === -1) {
                        /* istanbul ignore next */
                        throw new errors_1.AddressError('Error - UTXOSet.buildNFTTransferTx: '
                            + `no such address in output: ${spenders[j]}`);
                    }
                    op.addSignatureIdx(idx, spenders[j]);
                }
                const xferop = new ops_1.TransferableOperation(utxo.getAssetID(), [utxoids[i]], op);
                ops.push(xferop);
            }
            const OpTx = new operationtx_1.OperationTx(networkID, blockchainID, outs, ins, memo, ops);
            return new tx_1.UnsignedTx(OpTx);
        };
        /**
          * Creates an unsigned ImportTx transaction.
          *
          * @param networkID The number representing NetworkID of the node
          * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
          * @param toAddresses The addresses to send the funds
          * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
          * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs.
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
        this.buildImportTx = (networkID, blockchainID, toAddresses, fromAddresses, changeAddresses, atomics, sourceChain = undefined, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => {
            const zero = new bn_js_1.default(0);
            let ins = [];
            let outs = [];
            if (typeof fee === "undefined") {
                fee = zero.clone();
            }
            const importIns = [];
            let feepaid = new bn_js_1.default(0);
            let feeAssetStr = feeAssetID.toString("hex");
            for (let i = 0; i < atomics.length; i++) {
                const utxo = atomics[i];
                const assetID = utxo.getAssetID();
                const output = utxo.getOutput();
                let amt = output.getAmount().clone();
                let infeeamount = amt.clone();
                let assetStr = assetID.toString("hex");
                if (typeof feeAssetID !== "undefined" &&
                    fee.gt(zero) &&
                    feepaid.lt(fee) &&
                    assetStr === feeAssetStr) {
                    feepaid = feepaid.add(infeeamount);
                    if (feepaid.gt(fee)) {
                        infeeamount = feepaid.sub(fee);
                        feepaid = fee.clone();
                    }
                    else {
                        infeeamount = zero.clone();
                    }
                }
                const txid = utxo.getTxID();
                const outputidx = utxo.getOutputIdx();
                const input = new inputs_1.SECPTransferInput(amt);
                const xferin = new inputs_1.TransferableInput(txid, outputidx, assetID, input);
                const from = output.getAddresses();
                const spenders = output.getSpenders(from, asOf);
                for (let j = 0; j < spenders.length; j++) {
                    const idx = output.getAddressIdx(spenders[j]);
                    if (idx === -1) {
                        /* istanbul ignore next */
                        throw new errors_1.AddressError('Error - UTXOSet.buildImportTx: no such '
                            + `address in output: ${spenders[j]}`);
                    }
                    xferin.getInput().addSignatureIdx(idx, spenders[j]);
                }
                importIns.push(xferin);
                //add extra outputs for each amount (calculated from the imported inputs), minus fees
                if (infeeamount.gt(zero)) {
                    const spendout = outputs_1.SelectOutputClass(output.getOutputID(), infeeamount, toAddresses, locktime, threshold);
                    const xferout = new outputs_1.TransferableOutput(assetID, spendout);
                    outs.push(xferout);
                }
            }
            // get remaining fees from the provided addresses
            let feeRemaining = fee.sub(feepaid);
            if (feeRemaining.gt(zero) && this._feeCheck(feeRemaining, feeAssetID)) {
                const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
                aad.addAssetAmount(feeAssetID, zero, feeRemaining);
                const success = this.getMinimumSpendable(aad, asOf, locktime, threshold);
                if (typeof success === "undefined") {
                    ins = aad.getInputs();
                    outs = aad.getAllOutputs();
                }
                else {
                    throw success;
                }
            }
            const importTx = new importtx_1.ImportTx(networkID, blockchainID, outs, ins, memo, sourceChain, importIns);
            return new tx_1.UnsignedTx(importTx);
        };
        /**
        * Creates an unsigned ExportTx transaction.
        *
        * @param networkID The number representing NetworkID of the node
        * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
        * @param amount The amount being exported as a {@link https://github.com/indutny/bn.js/|BN}
        * @param avaxAssetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for AVAX
        * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who recieves the AVAX
        * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who owns the AVAX
        * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs.
        * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
        * @param destinationChain Optional. A {@link https://github.com/feross/buffer|Buffer} for the chainid where to send the asset.
        * @param feeAssetID Optional. The assetID of the fees being burned.
        * @param memo Optional contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        * @param locktime Optional. The locktime field created in the resulting outputs
        * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
        * @returns An unsigned transaction created from the passed in parameters.
        *
        */
        this.buildExportTx = (networkID, blockchainID, amount, assetID, toAddresses, fromAddresses, changeAddresses = undefined, destinationChain = undefined, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => {
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
            if (typeof feeAssetID === "undefined") {
                feeAssetID = assetID;
            }
            if (typeof destinationChain === "undefined") {
                destinationChain = bintools.cb58Decode(constants_2.PlatformChainID);
            }
            const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
            if (assetID.toString("hex") === feeAssetID.toString("hex")) {
                aad.addAssetAmount(assetID, amount, fee);
            }
            else {
                aad.addAssetAmount(assetID, amount, zero);
                if (this._feeCheck(fee, feeAssetID)) {
                    aad.addAssetAmount(feeAssetID, zero, fee);
                }
            }
            const success = this.getMinimumSpendable(aad, asOf, locktime, threshold);
            if (typeof success === "undefined") {
                ins = aad.getInputs();
                outs = aad.getChangeOutputs();
                exportouts = aad.getOutputs();
            }
            else {
                throw success;
            }
            const exportTx = new exporttx_1.ExportTx(networkID, blockchainID, outs, ins, memo, destinationChain, exportouts);
            return new tx_1.UnsignedTx(exportTx);
        };
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        let utxos = {};
        for (let utxoid in fields["utxos"]) {
            let utxoidCleaned = serialization.decoder(utxoid, encoding, "base58", "base58");
            utxos[utxoidCleaned] = new UTXO();
            utxos[utxoidCleaned].deserialize(fields["utxos"][utxoid], encoding);
        }
        let addressUTXOs = {};
        for (let address in fields["addressUTXOs"]) {
            let addressCleaned = serialization.decoder(address, encoding, "cb58", "hex");
            let utxobalance = {};
            for (let utxoid in fields["addressUTXOs"][address]) {
                let utxoidCleaned = serialization.decoder(utxoid, encoding, "base58", "base58");
                utxobalance[utxoidCleaned] = serialization.decoder(fields["addressUTXOs"][address][utxoid], encoding, "decimalString", "BN");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXR4b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9hdm0vdXR4b3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztJQUdJO0FBQ0osb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQyxrREFBc0I7QUFDdEIsdUNBQXFKO0FBQ3JKLDJDQUEwQztBQUMxQyw2QkFBaUM7QUFDakMscUNBQStEO0FBQy9ELCtCQUF3RztBQUV4RyxpRUFBcUQ7QUFDckQsbURBQStDO0FBRS9DLDhDQUFrRTtBQUNsRSxtREFBK0M7QUFDL0MsK0NBQTJDO0FBQzNDLHFDQUFpQztBQUNqQyx5Q0FBcUM7QUFDckMseUNBQXFDO0FBQ3JDLHFEQUF1RDtBQUN2RCwwREFBc0Y7QUFDdEYsNkRBQTZFO0FBQzdFLCtDQUF5SDtBQUV6SDs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFaEU7O0dBRUc7QUFDSCxNQUFhLElBQUssU0FBUSxvQkFBWTtJQUF0Qzs7UUFDWSxjQUFTLEdBQUcsTUFBTSxDQUFBO1FBQ2xCLFlBQU8sR0FBRyxTQUFTLENBQUE7SUFtRS9CLENBQUM7SUFqRUMsd0JBQXdCO0lBRXhCLFdBQVcsQ0FBQyxNQUFjLEVBQUUsV0FBK0IsS0FBSztRQUM5RCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUNuQyxJQUFJLENBQUMsTUFBTSxHQUFHLDJCQUFpQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO1FBQzVELElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNyRCxDQUFDO0lBRUQsVUFBVSxDQUFDLEtBQWEs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QUFFLENBQUMsSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxVQUFVLFlBQVksZUFBTSxDQUFDLENBQUE7SUFDdEQsQ0FBQztDQWdzQkY7QUF6dkJELDBCQXl2QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktQVZNLVVUWE9zXG4gICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJ1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uLy4uL3V0aWxzL2JpbnRvb2xzJ1xuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiXG5pbXBvcnQgeyBBbW91bnRPdXRwdXQsIFNlbGVjdE91dHB1dENsYXNzLCBUcmFuc2ZlcmFibGVPdXRwdXQsIE5GVFRyYW5zZmVyT3V0cHV0LCBORlRNaW50T3V0cHV0LCBTRUNQTWludE91dHB1dCwgU0VDUFRyYW5zZmVyT3V0cHV0IH0gZnJvbSAnLi9vdXRwdXRzJ1xuaW1wb3J0IHsgQVZNQ29uc3RhbnRzIH0gZnJvbSAnLi9jb25zdGFudHMnXG5pbXBvcnQgeyBVbnNpZ25lZFR4IH0gZnJvbSAnLi90eCdcbmltcG9ydCB7IFNFQ1BUcmFuc2ZlcklucHV0LCBUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gJy4vaW5wdXRzJ1xuaW1wb3J0IHsgTkZUVHJhbnNmZXJPcGVyYXRpb24sIFRyYW5zZmVyYWJsZU9wZXJhdGlvbiwgTkZUTWludE9wZXJhdGlvbiwgU0VDUE1pbnRPcGVyYXRpb24gfSBmcm9tICcuL29wcydcbmltcG9ydCB7IE91dHB1dCwgT3V0cHV0T3duZXJzIH0gZnJvbSAnLi4vLi4vY29tbW9uL291dHB1dCdcbmltcG9ydCB7IFVuaXhOb3cgfSBmcm9tICcuLi8uLi91dGlscy9oZWxwZXJmdW5jdGlvbnMnXG5pbXBvcnQgeyBJbml0aWFsU3RhdGVzIH0gZnJvbSAnLi9pbml0aWFsc3RhdGVzJ1xuaW1wb3J0IHsgTWludGVyU2V0IH0gZnJvbSAnLi9taW50ZXJzZXQnXG5pbXBvcnQgeyBTdGFuZGFyZFVUWE8sIFN0YW5kYXJkVVRYT1NldCB9IGZyb20gJy4uLy4uL2NvbW1vbi91dHhvcydcbmltcG9ydCB7IENyZWF0ZUFzc2V0VHggfSBmcm9tICcuL2NyZWF0ZWFzc2V0dHgnXG5pbXBvcnQgeyBPcGVyYXRpb25UeCB9IGZyb20gJy4vb3BlcmF0aW9udHgnXG5pbXBvcnQgeyBCYXNlVHggfSBmcm9tICcuL2Jhc2V0eCdcbmltcG9ydCB7IEV4cG9ydFR4IH0gZnJvbSAnLi9leHBvcnR0eCdcbmltcG9ydCB7IEltcG9ydFR4IH0gZnJvbSAnLi9pbXBvcnR0eCdcbmltcG9ydCB7IFBsYXRmb3JtQ2hhaW5JRCB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnN0YW50cydcbmltcG9ydCB7IFN0YW5kYXJkQXNzZXRBbW91bnREZXN0aW5hdGlvbiwgQXNzZXRBbW91bnQgfSBmcm9tICcuLi8uLi9jb21tb24vYXNzZXRhbW91bnQnXG5pbXBvcnQgeyBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tICcuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uJ1xuaW1wb3J0IHsgVVRYT0Vycm9yLCBBZGRyZXNzRXJyb3IsIEluc3VmZmljaWVudEZ1bmRzRXJyb3IsIFRocmVzaG9sZEVycm9yLCBTRUNQTWludE91dHB1dEVycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvZXJyb3JzJ1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG4vKipcbiAqIENsYXNzIGZvciByZXByZXNlbnRpbmcgYSBzaW5nbGUgVVRYTy5cbiAqL1xuZXhwb3J0IGNsYXNzIFVUWE8gZXh0ZW5kcyBTdGFuZGFyZFVUWE8ge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJVVFhPXCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMub3V0cHV0ID0gU2VsZWN0T3V0cHV0Q2xhc3MoZmllbGRzW1wib3V0cHV0XCJdW1wiX3R5cGVJRFwiXSlcbiAgICB0aGlzLm91dHB1dC5kZXNlcmlhbGl6ZShmaWVsZHNbXCJvdXRwdXRcIl0sIGVuY29kaW5nKVxuICB9XG5cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMuY29kZWNJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDIpXG4gICAgb2Zmc2V0ICs9IDJcbiAgICB0aGlzLnR4aWQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMilcbiAgICBvZmZzZXQgKz0gMzJcbiAgICB0aGlzLm91dHB1dGlkeCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLmFzc2V0SUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMilcbiAgICBvZmZzZXQgKz0gMzJcbiAgICBjb25zdCBvdXRwdXRpZDogbnVtYmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCkucmVhZFVJbnQzMkJFKDApXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLm91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKG91dHB1dGlkKVxuICAgIHJldHVybiB0aGlzLm91dHB1dC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSBiYXNlLTU4IHN0cmluZyBjb250YWluaW5nIGEgW1tVVFhPXV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgU3RhbmRhcmRVVFhPIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gc2VyaWFsaXplZCBBIGJhc2UtNTggc3RyaW5nIGNvbnRhaW5pbmcgYSByYXcgW1tVVFhPXV1cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbVVRYT11dXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIHVubGlrZSBtb3N0IGZyb21TdHJpbmdzLCBpdCBleHBlY3RzIHRoZSBzdHJpbmcgdG8gYmUgc2VyaWFsaXplZCBpbiBjYjU4IGZvcm1hdFxuICAgKi9cbiAgZnJvbVN0cmluZyhzZXJpYWxpemVkOiBzdHJpbmcpOiBudW1iZXIge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICByZXR1cm4gdGhpcy5mcm9tQnVmZmVyKGJpbnRvb2xzLmNiNThEZWNvZGUoc2VyaWFsaXplZCkpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGJhc2UtNTggcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbVVRYT11dLlxuICAgKlxuICAgKiBAcmVtYXJrc1xuICAgKiB1bmxpa2UgbW9zdCB0b1N0cmluZ3MsIHRoaXMgcmV0dXJucyBpbiBjYjU4IHNlcmlhbGl6YXRpb24gZm9ybWF0XG4gICAqL1xuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgcmV0dXJuIGJpbnRvb2xzLmNiNThFbmNvZGUodGhpcy50b0J1ZmZlcigpKVxuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgY29uc3QgdXR4bzogVVRYTyA9IG5ldyBVVFhPKClcbiAgICB1dHhvLmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiB1dHhvIGFzIHRoaXNcbiAgfVxuXG4gIGNyZWF0ZShcbiAgICBjb2RlY0lEOiBudW1iZXIgPSBBVk1Db25zdGFudHMuTEFURVNUQ09ERUMsXG4gICAgdHhpZDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG91dHB1dGlkeDogQnVmZmVyIHwgbnVtYmVyID0gdW5kZWZpbmVkLFxuICAgIGFzc2V0SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBvdXRwdXQ6IE91dHB1dCA9IHVuZGVmaW5lZCk6IHRoaXNcbiAge1xuICAgIHJldHVybiBuZXcgVVRYTyhjb2RlY0lELCB0eGlkLCBvdXRwdXRpZHgsIGFzc2V0SUQsIG91dHB1dCkgYXMgdGhpc1xuICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIEFzc2V0QW1vdW50RGVzdGluYXRpb24gZXh0ZW5kcyBTdGFuZGFyZEFzc2V0QW1vdW50RGVzdGluYXRpb248VHJhbnNmZXJhYmxlT3V0cHV0LCBUcmFuc2ZlcmFibGVJbnB1dD4ge31cblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBzZXQgb2YgW1tVVFhPXV1zLlxuICovXG5leHBvcnQgY2xhc3MgVVRYT1NldCBleHRlbmRzIFN0YW5kYXJkVVRYT1NldDxVVFhPPntcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVVRYT1NldFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG4gIFxuICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIGxldCB1dHhvcyA9IHt9XG4gICAgZm9yKGxldCB1dHhvaWQgaW4gZmllbGRzW1widXR4b3NcIl0pe1xuICAgICAgbGV0IHV0eG9pZENsZWFuZWQ6IHN0cmluZyA9IHNlcmlhbGl6YXRpb24uZGVjb2Rlcih1dHhvaWQsIGVuY29kaW5nLCBcImJhc2U1OFwiLCBcImJhc2U1OFwiKVxuICAgICAgdXR4b3NbdXR4b2lkQ2xlYW5lZF0gPSBuZXcgVVRYTygpXG4gICAgICB1dHhvc1t1dHhvaWRDbGVhbmVkXS5kZXNlcmlhbGl6ZShmaWVsZHNbXCJ1dHhvc1wiXVt1dHhvaWRdLCBlbmNvZGluZylcbiAgICB9XG4gICAgbGV0IGFkZHJlc3NVVFhPcyA9IHt9XG4gICAgZm9yKGxldCBhZGRyZXNzIGluIGZpZWxkc1tcImFkZHJlc3NVVFhPc1wiXSl7XG4gICAgICBsZXQgYWRkcmVzc0NsZWFuZWQ6IHN0cmluZyA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihhZGRyZXNzLCBlbmNvZGluZywgXCJjYjU4XCIsIFwiaGV4XCIpXG4gICAgICBsZXQgdXR4b2JhbGFuY2UgPSB7fVxuICAgICAgZm9yKGxldCB1dHhvaWQgaW4gZmllbGRzW1wiYWRkcmVzc1VUWE9zXCJdW2FkZHJlc3NdKXtcbiAgICAgICAgbGV0IHV0eG9pZENsZWFuZWQ6IHN0cmluZyA9IHNlcmlhbGl6YXRpb24uZGVjb2Rlcih1dHhvaWQsIGVuY29kaW5nLCBcImJhc2U1OFwiLCBcImJhc2U1OFwiKVxuICAgICAgICB1dHhvYmFsYW5jZVt1dHhvaWRDbGVhbmVkXSA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJhZGRyZXNzVVRYT3NcIl1bYWRkcmVzc11bdXR4b2lkXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJOXCIpXG4gICAgICB9XG4gICAgICBhZGRyZXNzVVRYT3NbYWRkcmVzc0NsZWFuZWRdID0gdXR4b2JhbGFuY2VcbiAgICB9XG4gICAgdGhpcy51dHhvcyA9IHV0eG9zXG4gICAgdGhpcy5hZGRyZXNzVVRYT3MgPSBhZGRyZXNzVVRYT3NcbiAgfVxuXG4gIHBhcnNlVVRYTyh1dHhvOiBVVFhPIHwgc3RyaW5nKTogVVRYTyB7XG4gICAgY29uc3QgdXR4b3ZhcjogVVRYTyA9IG5ldyBVVFhPKClcbiAgICAvLyBmb3JjZSBhIGNvcHlcbiAgICBpZiAodHlwZW9mIHV0eG8gPT09ICdzdHJpbmcnKSB7XG4gICAgICB1dHhvdmFyLmZyb21CdWZmZXIoYmludG9vbHMuY2I1OERlY29kZSh1dHhvKSlcbiAgICB9IGVsc2UgaWYgKHV0eG8gaW5zdGFuY2VvZiBVVFhPKSB7XG4gICAgICB1dHhvdmFyLmZyb21CdWZmZXIodXR4by50b0J1ZmZlcigpKSAvLyBmb3JjZXMgYSBjb3B5XG4gICAgfSBlbHNlIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgVVRYT0Vycm9yKFwiRXJyb3IgLSBVVFhPLnBhcnNlVVRYTzogdXR4byBwYXJhbWV0ZXIgaXMgbm90IGEgVVRYTyBvciBzdHJpbmdcIilcbiAgICB9XG4gICAgcmV0dXJuIHV0eG92YXJcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgVVRYT1NldCgpIGFzIHRoaXNcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IG5ld3NldDogVVRYT1NldCA9IHRoaXMuY3JlYXRlKClcbiAgICBjb25zdCBhbGxVVFhPczogVVRYT1tdID0gdGhpcy5nZXRBbGxVVFhPcygpXG4gICAgbmV3c2V0LmFkZEFycmF5KGFsbFVUWE9zKVxuICAgIHJldHVybiBuZXdzZXQgYXMgdGhpc1xuICB9XG5cbiAgX2ZlZUNoZWNrKGZlZTogQk4sIGZlZUFzc2V0SUQ6IEJ1ZmZlcik6IGJvb2xlYW4ge1xuICAgIHJldHVybiAodHlwZW9mIGZlZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBcbiAgICB0eXBlb2YgZmVlQXNzZXRJRCAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgZmVlLmd0KG5ldyBCTigwKSkgJiYgZmVlQXNzZXRJRCBpbnN0YW5jZW9mIEJ1ZmZlcilcbiAgfVxuXG4gIGdldE1pbmltdW1TcGVuZGFibGUgPSAoYWFkOiBBc3NldEFtb3VudERlc3RpbmF0aW9uLCBhc09mOiBCTiA9IFVuaXhOb3coKSwgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDApLCB0aHJlc2hvbGQ6IG51bWJlciA9IDEpOiBFcnJvciA9PiB7XG4gICAgY29uc3QgdXR4b0FycmF5OiBVVFhPW10gPSB0aGlzLmdldEFsbFVUWE9zKClcbiAgICBjb25zdCBvdXRpZHM6IG9iamVjdCA9IHt9XG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHV0eG9BcnJheS5sZW5ndGggJiYgIWFhZC5jYW5Db21wbGV0ZSgpOyBpKyspIHtcbiAgICAgIGNvbnN0IHU6IFVUWE8gPSB1dHhvQXJyYXlbaV1cbiAgICAgIGNvbnN0IGFzc2V0S2V5OiBzdHJpbmcgPSB1LmdldEFzc2V0SUQoKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgY29uc3QgZnJvbUFkZHJlc3NlczogQnVmZmVyW10gPSBhYWQuZ2V0U2VuZGVycygpXG4gICAgICBpZih1LmdldE91dHB1dCgpIGluc3RhbmNlb2YgQW1vdW50T3V0cHV0ICYmIGFhZC5hc3NldEV4aXN0cyhhc3NldEtleSkgJiYgdS5nZXRPdXRwdXQoKS5tZWV0c1RocmVzaG9sZChmcm9tQWRkcmVzc2VzLCBhc09mKSkge1xuICAgICAgICBjb25zdCBhbTogQXNzZXRBbW91bnQgPSBhYWQuZ2V0QXNzZXRBbW91bnQoYXNzZXRLZXkpXG4gICAgICAgIGlmKCFhbS5pc0ZpbmlzaGVkKCkpe1xuICAgICAgICAgIGNvbnN0IHVvdXQ6IEFtb3VudE91dHB1dCA9IHUuZ2V0T3V0cHV0KCkgYXMgQW1vdW50T3V0cHV0XG4gICAgICAgICAgb3V0aWRzW2Fzc2V0S2V5XSA9IHVvdXQuZ2V0T3V0cHV0SUQoKVxuICAgICAgICAgIGNvbnN0IGFtb3VudCA9IHVvdXQuZ2V0QW1vdW50KClcbiAgICAgICAgICBhbS5zcGVuZEFtb3VudChhbW91bnQpXG4gICAgICAgICAgY29uc3QgdHhpZDogQnVmZmVyID0gdS5nZXRUeElEKClcbiAgICAgICAgICBjb25zdCBvdXRwdXRpZHg6IEJ1ZmZlciA9IHUuZ2V0T3V0cHV0SWR4KClcbiAgICAgICAgICBjb25zdCBpbnB1dDogU0VDUFRyYW5zZmVySW5wdXQgPSBuZXcgU0VDUFRyYW5zZmVySW5wdXQoYW1vdW50KVxuICAgICAgICAgIGNvbnN0IHhmZXJpbjogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQodHhpZCwgb3V0cHV0aWR4LCB1LmdldEFzc2V0SUQoKSwgaW5wdXQpXG4gICAgICAgICAgY29uc3Qgc3BlbmRlcnM6IEJ1ZmZlcltdID0gdW91dC5nZXRTcGVuZGVycyhmcm9tQWRkcmVzc2VzLCBhc09mKVxuICAgICAgICAgIGZvciAobGV0IGo6IG51bWJlciA9IDA7IGogPCBzcGVuZGVycy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgY29uc3QgaWR4OiBudW1iZXIgPSB1b3V0LmdldEFkZHJlc3NJZHgoc3BlbmRlcnNbal0pXG4gICAgICAgICAgICBpZiAoaWR4ID09PSAtMSkge1xuICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKCdFcnJvciAtIFVUWE9TZXQuZ2V0TWluaW11bVNwZW5kYWJsZTogbm8gc3VjaCAnXG4gICAgICAgICAgICAgICAgKyBgYWRkcmVzcyBpbiBvdXRwdXQ6ICR7c3BlbmRlcnNbal19YClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHhmZXJpbi5nZXRJbnB1dCgpLmFkZFNpZ25hdHVyZUlkeChpZHgsIHNwZW5kZXJzW2pdKVxuICAgICAgICAgIH1cbiAgICAgICAgICBhYWQuYWRkSW5wdXQoeGZlcmluKVxuICAgICAgICB9IGVsc2UgaWYoYWFkLmFzc2V0RXhpc3RzKGFzc2V0S2V5KSAmJiAhKHUuZ2V0T3V0cHV0KCkgaW5zdGFuY2VvZiBBbW91bnRPdXRwdXQpKXtcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBMZWF2aW5nIHRoZSBiZWxvdyBsaW5lcywgbm90IHNpbXBseSBmb3IgcG9zdGVyaXR5LCBidXQgZm9yIGNsYXJpZmljYXRpb24uXG4gICAgICAgICAgICogQXNzZXRJRHMgbWF5IGhhdmUgbWl4ZWQgT3V0cHV0VHlwZXMuIFxuICAgICAgICAgICAqIFNvbWUgb2YgdGhvc2UgT3V0cHV0VHlwZXMgbWF5IGltcGxlbWVudCBBbW91bnRPdXRwdXQuXG4gICAgICAgICAgICogT3RoZXJzIG1heSBub3QuXG4gICAgICAgICAgICogU2ltcGx5IGNvbnRpbnVlIGluIHRoaXMgY29uZGl0aW9uLlxuICAgICAgICAgICAqL1xuICAgICAgICAgIC8qcmV0dXJuIG5ldyBFcnJvcignRXJyb3IgLSBVVFhPU2V0LmdldE1pbmltdW1TcGVuZGFibGU6IG91dHB1dElEIGRvZXMgbm90ICdcbiAgICAgICAgICAgICsgYGltcGxlbWVudCBBbW91bnRPdXRwdXQ6ICR7dS5nZXRPdXRwdXQoKS5nZXRPdXRwdXRJRH1gKSovXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZighYWFkLmNhbkNvbXBsZXRlKCkpIHtcbiAgICAgIHJldHVybiBuZXcgSW5zdWZmaWNpZW50RnVuZHNFcnJvcignRXJyb3IgLSBVVFhPU2V0LmdldE1pbmltdW1TcGVuZGFibGU6IGluc3VmZmljaWVudCAnXG4gICAgICAgICsgJ2Z1bmRzIHRvIGNyZWF0ZSB0aGUgdHJhbnNhY3Rpb24nKVxuICAgIH1cbiAgICBjb25zdCBhbW91bnRzOiBBc3NldEFtb3VudFtdID0gYWFkLmdldEFtb3VudHMoKVxuICAgIGNvbnN0IHplcm86IEJOID0gbmV3IEJOKDApXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFtb3VudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGFzc2V0S2V5OiBzdHJpbmcgPSBhbW91bnRzW2ldLmdldEFzc2V0SURTdHJpbmcoKVxuICAgICAgY29uc3QgYW1vdW50OiBCTiA9IGFtb3VudHNbaV0uZ2V0QW1vdW50KClcbiAgICAgIGlmIChhbW91bnQuZ3QoemVybykpIHtcbiAgICAgICAgY29uc3Qgc3BlbmRvdXQ6QW1vdW50T3V0cHV0ID0gU2VsZWN0T3V0cHV0Q2xhc3Mob3V0aWRzW2Fzc2V0S2V5XSxcbiAgICAgICAgICBhbW91bnQsIGFhZC5nZXREZXN0aW5hdGlvbnMoKSwgbG9ja3RpbWUsIHRocmVzaG9sZCkgYXMgQW1vdW50T3V0cHV0XG4gICAgICAgIGNvbnN0IHhmZXJvdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYW1vdW50c1tpXS5nZXRBc3NldElEKCksIHNwZW5kb3V0KVxuICAgICAgICBhYWQuYWRkT3V0cHV0KHhmZXJvdXQpXG4gICAgICB9XG4gICAgICBjb25zdCBjaGFuZ2U6IEJOID0gYW1vdW50c1tpXS5nZXRDaGFuZ2UoKVxuICAgICAgaWYgKGNoYW5nZS5ndCh6ZXJvKSkge1xuICAgICAgICBjb25zdCBjaGFuZ2VvdXQ6QW1vdW50T3V0cHV0ID0gU2VsZWN0T3V0cHV0Q2xhc3Mob3V0aWRzW2Fzc2V0S2V5XSxcbiAgICAgICAgICBjaGFuZ2UsIGFhZC5nZXRDaGFuZ2VBZGRyZXNzZXMoKSkgYXMgQW1vdW50T3V0cHV0XG4gICAgICAgIGNvbnN0IGNoZ3hmZXJvdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYW1vdW50c1tpXS5nZXRBc3NldElEKCksIGNoYW5nZW91dClcbiAgICAgICAgYWFkLmFkZENoYW5nZShjaGd4ZmVyb3V0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiBbW1Vuc2lnbmVkVHhdXSB3cmFwcGluZyBhIFtbQmFzZVR4XV0uIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICAqIFtbVW5zaWduZWRUeF1dIHdyYXBwaW5nIGEgW1tCYXNlVHhdXSBtYW51YWxseSAod2l0aCB0aGVpciBjb3JyZXNwb25kaW5nIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXMgYW5kIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zKS5cbiAgICpcbiAgICogQHBhcmFtIG5ldHdvcmtJRCBUaGUgbnVtYmVyIHJlcHJlc2VudGluZyBOZXR3b3JrSUQgb2YgdGhlIG5vZGVcbiAgICogQHBhcmFtIGJsb2NrY2hhaW5JRCBUaGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBCbG9ja2NoYWluSUQgZm9yIHRoZSB0cmFuc2FjdGlvblxuICAgKiBAcGFyYW0gYW1vdW50IFRoZSBhbW91bnQgb2YgdGhlIGFzc2V0IHRvIGJlIHNwZW50IGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59LlxuICAgKiBAcGFyYW0gYXNzZXRJRCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgYXNzZXQgSUQgZm9yIHRoZSBVVFhPXG4gICAqIEBwYXJhbSB0b0FkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRvIHNlbmQgdGhlIGZ1bmRzXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBmdW5kcyBmcm9tIHRoZSBVVFhPcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIE9wdGlvbmFsLiBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zLiBEZWZhdWx0OiB0b0FkZHJlc3Nlc1xuICAgKiBAcGFyYW0gZmVlIE9wdGlvbmFsLiBUaGUgYW1vdW50IG9mIGZlZXMgdG8gYnVybiBpbiBpdHMgc21hbGxlc3QgZGVub21pbmF0aW9uLCByZXByZXNlbnRlZCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gZmVlQXNzZXRJRCBPcHRpb25hbC4gVGhlIGFzc2V0SUQgb2YgdGhlIGZlZXMgYmVpbmcgYnVybmVkLiBEZWZhdWx0OiBhc3NldElEXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsLiBDb250YWlucyBhcmJpdHJhcnkgZGF0YSwgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBvdXRwdXRzXG4gICAqIEBwYXJhbSB0aHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAqIFxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAgKlxuICAgKi9cbiAgYnVpbGRCYXNlVHggPSAoXG4gICAgbmV0d29ya0lEOiBudW1iZXIsXG4gICAgYmxvY2tjaGFpbklEOiBCdWZmZXIsXG4gICAgYW1vdW50OiBCTixcbiAgICBhc3NldElEOiBCdWZmZXIsXG4gICAgdG9BZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgIGZyb21BZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgIGNoYW5nZUFkZHJlc3NlczogQnVmZmVyW10gPSB1bmRlZmluZWQsXG4gICAgZmVlOiBCTiA9IHVuZGVmaW5lZCxcbiAgICBmZWVBc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgIGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKSxcbiAgICB0aHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogVW5zaWduZWRUeCA9PiB7XG5cbiAgICBpZih0aHJlc2hvbGQgPiB0b0FkZHJlc3Nlcy5sZW5ndGgpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgVGhyZXNob2xkRXJyb3IoXCJFcnJvciAtIFVUWE9TZXQuYnVpbGRCYXNlVHg6IHRocmVzaG9sZCBpcyBncmVhdGVyIHRoYW4gbnVtYmVyIG9mIGFkZHJlc3Nlc1wiKVxuICAgIH1cblxuICAgIGlmKHR5cGVvZiBjaGFuZ2VBZGRyZXNzZXMgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGNoYW5nZUFkZHJlc3NlcyA9IHRvQWRkcmVzc2VzXG4gICAgfVxuXG4gICAgaWYodHlwZW9mIGZlZUFzc2V0SUQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGZlZUFzc2V0SUQgPSBhc3NldElEXG4gICAgfVxuXG4gICAgY29uc3QgemVybzogQk4gPSBuZXcgQk4oMClcbiAgICBcbiAgICBpZiAoYW1vdW50LmVxKHplcm8pKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgY29uc3QgYWFkOiBBc3NldEFtb3VudERlc3RpbmF0aW9uID0gbmV3IEFzc2V0QW1vdW50RGVzdGluYXRpb24odG9BZGRyZXNzZXMsIGZyb21BZGRyZXNzZXMsIGNoYW5nZUFkZHJlc3NlcylcbiAgICBpZihhc3NldElELnRvU3RyaW5nKFwiaGV4XCIpID09PSBmZWVBc3NldElELnRvU3RyaW5nKFwiaGV4XCIpKXtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChhc3NldElELCBhbW91bnQsIGZlZSlcbiAgICB9IGVsc2Uge1xuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGFzc2V0SUQsIGFtb3VudCwgemVybylcbiAgICAgIGlmKHRoaXMuX2ZlZUNoZWNrKGZlZSwgZmVlQXNzZXRJRCkpIHtcbiAgICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGZlZUFzc2V0SUQsIHplcm8sIGZlZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cbiAgICBsZXQgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXVxuICAgIFxuICAgIGNvbnN0IHN1Y2Nlc3M6IEVycm9yID0gdGhpcy5nZXRNaW5pbXVtU3BlbmRhYmxlKGFhZCwgYXNPZiwgbG9ja3RpbWUsIHRocmVzaG9sZClcbiAgICBpZih0eXBlb2Ygc3VjY2VzcyA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaW5zID0gYWFkLmdldElucHV0cygpXG4gICAgICBvdXRzID0gYWFkLmdldEFsbE91dHB1dHMoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBzdWNjZXNzXG4gICAgfVxuXG4gICAgY29uc3QgYmFzZVR4OiBCYXNlVHggPSBuZXcgQmFzZVR4KG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMsIG1lbW8pXG4gICAgcmV0dXJuIG5ldyBVbnNpZ25lZFR4KGJhc2VUeClcblxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gdW5zaWduZWQgQ3JlYXRlIEFzc2V0IHRyYW5zYWN0aW9uLiBGb3IgbW9yZSBncmFudWxhciBjb250cm9sLCB5b3UgbWF5IGNyZWF0ZSB5b3VyIG93blxuICAgKiBbW0NyZWF0ZUFzc2V0VFhdXSBtYW51YWxseSAod2l0aCB0aGVpciBjb3JyZXNwb25kaW5nIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXMsIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zKS5cbiAgICogXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgVGhlIG51bWJlciByZXByZXNlbnRpbmcgTmV0d29ya0lEIG9mIHRoZSBub2RlXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgVGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgQmxvY2tjaGFpbklEIGZvciB0aGUgdHJhbnNhY3Rpb25cbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgT3B0aW9uYWwuIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3NcbiAgICogQHBhcmFtIGluaXRpYWxTdGF0ZSBUaGUgW1tJbml0aWFsU3RhdGVzXV0gdGhhdCByZXByZXNlbnQgdGhlIGludGlhbCBzdGF0ZSBvZiBhIGNyZWF0ZWQgYXNzZXRcbiAgICogQHBhcmFtIG5hbWUgU3RyaW5nIGZvciB0aGUgZGVzY3JpcHRpdmUgbmFtZSBvZiB0aGUgYXNzZXRcbiAgICogQHBhcmFtIHN5bWJvbCBTdHJpbmcgZm9yIHRoZSB0aWNrZXIgc3ltYm9sIG9mIHRoZSBhc3NldFxuICAgKiBAcGFyYW0gZGVub21pbmF0aW9uIE9wdGlvbmFsIG51bWJlciBmb3IgdGhlIGRlbm9taW5hdGlvbiB3aGljaCBpcyAxMF5ELiBEIG11c3QgYmUgPj0gMCBhbmQgPD0gMzIuIEV4OiAkMSBBVkFYID0gMTBeOSAkbkFWQVhcbiAgICogQHBhcmFtIG1pbnRPdXRwdXRzIE9wdGlvbmFsLiBBcnJheSBvZiBbW1NFQ1BNaW50T3V0cHV0XV1zIHRvIGJlIGluY2x1ZGVkIGluIHRoZSB0cmFuc2FjdGlvbi4gVGhlc2Ugb3V0cHV0cyBjYW4gYmUgc3BlbnQgdG8gbWludCBtb3JlIHRva2Vucy5cbiAgICogQHBhcmFtIGZlZSBPcHRpb25hbC4gVGhlIGFtb3VudCBvZiBmZWVzIHRvIGJ1cm4gaW4gaXRzIHNtYWxsZXN0IGRlbm9taW5hdGlvbiwgcmVwcmVzZW50ZWQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGZlZUFzc2V0SUQgT3B0aW9uYWwuIFRoZSBhc3NldElEIG9mIHRoZSBmZWVzIGJlaW5nIGJ1cm5lZC5cbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICpcbiAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gY3JlYXRlZCBmcm9tIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVycy5cbiAgICpcbiAgICovXG4gIGJ1aWxkQ3JlYXRlQXNzZXRUeCA9IChcbiAgICBuZXR3b3JrSUQ6IG51bWJlcixcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlcixcbiAgICBmcm9tQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgIGluaXRpYWxTdGF0ZTogSW5pdGlhbFN0YXRlcyxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc3ltYm9sOiBzdHJpbmcsXG4gICAgZGVub21pbmF0aW9uOiBudW1iZXIsXG4gICAgbWludE91dHB1dHM6IFNFQ1BNaW50T3V0cHV0W10gPSB1bmRlZmluZWQsXG4gICAgZmVlOiBCTiA9IHVuZGVmaW5lZCxcbiAgICBmZWVBc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpXG4gICk6IFVuc2lnbmVkVHggPT4ge1xuICAgIGNvbnN0IHplcm86IEJOID0gbmV3IEJOKDApXG4gICAgbGV0IGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IFtdXG4gICAgbGV0IG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW11cbiAgICBcbiAgICBpZih0aGlzLl9mZWVDaGVjayhmZWUsIGZlZUFzc2V0SUQpKXtcbiAgICAgIGNvbnN0IGFhZDogQXNzZXRBbW91bnREZXN0aW5hdGlvbiA9IG5ldyBBc3NldEFtb3VudERlc3RpbmF0aW9uKGZyb21BZGRyZXNzZXMsIGZyb21BZGRyZXNzZXMsIGNoYW5nZUFkZHJlc3NlcylcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChmZWVBc3NldElELCB6ZXJvLCBmZWUpXG4gICAgICBjb25zdCBzdWNjZXNzOiBFcnJvciA9IHRoaXMuZ2V0TWluaW11bVNwZW5kYWJsZShhYWQsIGFzT2YpXG4gICAgICBpZih0eXBlb2Ygc3VjY2VzcyA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpbnMgPSBhYWQuZ2V0SW5wdXRzKClcbiAgICAgICAgb3V0cyA9IGFhZC5nZXRBbGxPdXRwdXRzKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IHN1Y2Nlc3NcbiAgICAgIH1cbiAgICB9XG4gICAgaWYodHlwZW9mIG1pbnRPdXRwdXRzICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBtaW50T3V0cHV0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZihtaW50T3V0cHV0c1tpXSBpbnN0YW5jZW9mIFNFQ1BNaW50T3V0cHV0KXtcbiAgICAgICAgICBpbml0aWFsU3RhdGUuYWRkT3V0cHV0KG1pbnRPdXRwdXRzW2ldKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBTRUNQTWludE91dHB1dEVycm9yKFwiRXJyb3IgLSBVVFhPU2V0LmJ1aWxkQ3JlYXRlQXNzZXRUeDogQSBzdWJtaXR0ZWQgbWludE91dHB1dCB3YXMgbm90IG9mIHR5cGUgU0VDUE1pbnRPdXRwdXRcIilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBDQXR4OiBDcmVhdGVBc3NldFR4ID0gbmV3IENyZWF0ZUFzc2V0VHgobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbywgbmFtZSwgc3ltYm9sLCBkZW5vbWluYXRpb24sIGluaXRpYWxTdGF0ZSlcbiAgICByZXR1cm4gbmV3IFVuc2lnbmVkVHgoQ0F0eClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGFuIHVuc2lnbmVkIFNlY3AgbWludCB0cmFuc2FjdGlvbi4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgICogW1tPcGVyYXRpb25UeF1dIG1hbnVhbGx5ICh3aXRoIHRoZWlyIGNvcnJlc3BvbmRpbmcgW1tUcmFuc2ZlcmFibGVJbnB1dF1dcywgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXMsIGFuZCBbW1RyYW5zZmVyT3BlcmF0aW9uXV1zKS5cbiAgICogXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgVGhlIG51bWJlciByZXByZXNlbnRpbmcgTmV0d29ya0lEIG9mIHRoZSBub2RlXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgVGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgQmxvY2tjaGFpbklEIGZvciB0aGUgdHJhbnNhY3Rpb25cbiAgICogQHBhcmFtIG1pbnRPd25lciBBIFtbU0VDUE1pbnRPdXRwdXRdXSB3aGljaCBzcGVjaWZpZXMgdGhlIG5ldyBzZXQgb2YgbWludGVyc1xuICAgKiBAcGFyYW0gdHJhbnNmZXJPd25lciBBIFtbU0VDUFRyYW5zZmVyT3V0cHV0XV0gd2hpY2ggc3BlY2lmaWVzIHdoZXJlIHRoZSBtaW50ZWQgdG9rZW5zIHdpbGwgZ29cbiAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPc1xuICAgKiBAcGFyYW0gbWludFVUWE9JRCBUaGUgVVRYT0lEIGZvciB0aGUgW1tTQ1BNaW50T3V0cHV0XV0gYmVpbmcgc3BlbnQgdG8gcHJvZHVjZSBtb3JlIHRva2Vuc1xuICAgKiBAcGFyYW0gZmVlIE9wdGlvbmFsLiBUaGUgYW1vdW50IG9mIGZlZXMgdG8gYnVybiBpbiBpdHMgc21hbGxlc3QgZGVub21pbmF0aW9uLCByZXByZXNlbnRlZCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gZmVlQXNzZXRJRCBPcHRpb25hbC4gVGhlIGFzc2V0SUQgb2YgdGhlIGZlZXMgYmVpbmcgYnVybmVkLlxuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKi9cbiAgYnVpbGRTRUNQTWludFR4ID0gKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyLFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyLFxuICAgIG1pbnRPd25lcjogU0VDUE1pbnRPdXRwdXQsXG4gICAgdHJhbnNmZXJPd25lcjogU0VDUFRyYW5zZmVyT3V0cHV0LFxuICAgIGZyb21BZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgIGNoYW5nZUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgbWludFVUWE9JRDogc3RyaW5nLFxuICAgIGZlZTogQk4gPSB1bmRlZmluZWQsXG4gICAgZmVlQXNzZXRJRDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKVxuICApOiBVbnNpZ25lZFR4ID0+IHtcbiAgICBjb25zdCB6ZXJvOiBCTiA9IG5ldyBCTigwKVxuICAgIGxldCBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXVxuICAgIGxldCBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IFtdXG5cbiAgICBpZih0aGlzLl9mZWVDaGVjayhmZWUsIGZlZUFzc2V0SUQpKSB7XG4gICAgICBjb25zdCBhYWQ6IEFzc2V0QW1vdW50RGVzdGluYXRpb24gPSBuZXcgQXNzZXRBbW91bnREZXN0aW5hdGlvbihmcm9tQWRkcmVzc2VzLCBmcm9tQWRkcmVzc2VzLCBjaGFuZ2VBZGRyZXNzZXMpXG4gICAgICBhYWQuYWRkQXNzZXRBbW91bnQoZmVlQXNzZXRJRCwgemVybywgZmVlKVxuICAgICAgY29uc3Qgc3VjY2VzczogRXJyb3IgPSB0aGlzLmdldE1pbmltdW1TcGVuZGFibGUoYWFkLCBhc09mKVxuICAgICAgaWYodHlwZW9mIHN1Y2Nlc3MgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaW5zID0gYWFkLmdldElucHV0cygpXG4gICAgICAgIG91dHMgPSBhYWQuZ2V0QWxsT3V0cHV0cygpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBzdWNjZXNzXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IG9wczogVHJhbnNmZXJhYmxlT3BlcmF0aW9uW10gPSBbXVxuICAgIGxldCBtaW50T3A6IFNFQ1BNaW50T3BlcmF0aW9uID0gbmV3IFNFQ1BNaW50T3BlcmF0aW9uKG1pbnRPd25lciwgdHJhbnNmZXJPd25lcilcbiAgICBcbiAgICBsZXQgdXR4bzogVVRYTyA9IHRoaXMuZ2V0VVRYTyhtaW50VVRYT0lEKVxuICAgIGlmKHR5cGVvZiB1dHhvID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgVVRYT0Vycm9yKFwiRXJyb3IgLSBVVFhPU2V0LmJ1aWxkU0VDUE1pbnRUeDogVVRYT0lEIG5vdCBmb3VuZFwiKVxuICAgIH1cbiAgICBpZih1dHhvLmdldE91dHB1dCgpLmdldE91dHB1dElEKCkgIT09IEFWTUNvbnN0YW50cy5TRUNQTUlOVE9VVFBVVElEKSB7XG4gICAgICB0aHJvdyBuZXcgU0VDUE1pbnRPdXRwdXRFcnJvcihcIkVycm9yIC0gVVRYT1NldC5idWlsZFNFQ1BNaW50VHg6IFVUWE8gaXMgbm90IGEgU0VDUE1JTlRPVVRQVVRJRFwiKVxuICAgIH1cbiAgICBsZXQgb3V0OiBTRUNQTWludE91dHB1dCA9IHV0eG8uZ2V0T3V0cHV0KCkgYXMgU0VDUE1pbnRPdXRwdXRcbiAgICBsZXQgc3BlbmRlcnM6IEJ1ZmZlcltdID0gb3V0LmdldFNwZW5kZXJzKGZyb21BZGRyZXNzZXMsIGFzT2YpXG5cbiAgICBmb3IgKGxldCBqOiBudW1iZXIgPSAwOyBqIDwgc3BlbmRlcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgIGxldCBpZHg6IG51bWJlciA9IG91dC5nZXRBZGRyZXNzSWR4KHNwZW5kZXJzW2pdKVxuICAgICAgaWYoaWR4ID09IC0xKSB7XG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgLSBVVFhPU2V0LmJ1aWxkU0VDUE1pbnRUeDogbm8gc3VjaCBhZGRyZXNzIGluIG91dHB1dFwiKVxuICAgICAgfVxuICAgICAgbWludE9wLmFkZFNpZ25hdHVyZUlkeChpZHgsIHNwZW5kZXJzW2pdKVxuICAgIH1cbiAgICAgIFxuICAgIGxldCB0cmFuc2ZlcmFibGVPcGVyYXRpb246IFRyYW5zZmVyYWJsZU9wZXJhdGlvbiA9IG5ldyBUcmFuc2ZlcmFibGVPcGVyYXRpb24odXR4by5nZXRBc3NldElEKCksIFttaW50VVRYT0lEXSwgbWludE9wKVxuICAgIG9wcy5wdXNoKHRyYW5zZmVyYWJsZU9wZXJhdGlvbilcblxuICAgIGxldCBvcGVyYXRpb25UeDogT3BlcmF0aW9uVHggPSBuZXcgT3BlcmF0aW9uVHgobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbywgb3BzKVxuICAgIHJldHVybiBuZXcgVW5zaWduZWRUeChvcGVyYXRpb25UeClcbiAgfVxuXG4gIC8qKlxuICAqIENyZWF0ZXMgYW4gdW5zaWduZWQgQ3JlYXRlIEFzc2V0IHRyYW5zYWN0aW9uLiBGb3IgbW9yZSBncmFudWxhciBjb250cm9sLCB5b3UgbWF5IGNyZWF0ZSB5b3VyIG93blxuICAqIFtbQ3JlYXRlQXNzZXRUWF1dIG1hbnVhbGx5ICh3aXRoIHRoZWlyIGNvcnJlc3BvbmRpbmcgW1tUcmFuc2ZlcmFibGVJbnB1dF1dcywgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXMpLlxuICAqIFxuICAqIEBwYXJhbSBuZXR3b3JrSUQgVGhlIG51bWJlciByZXByZXNlbnRpbmcgTmV0d29ya0lEIG9mIHRoZSBub2RlXG4gICogQHBhcmFtIGJsb2NrY2hhaW5JRCBUaGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBCbG9ja2NoYWluSUQgZm9yIHRoZSB0cmFuc2FjdGlvblxuICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBmdW5kcyBmcm9tIHRoZSBVVFhPcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgT3B0aW9uYWwuIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3MuXG4gICogQHBhcmFtIG1pbnRlclNldHMgVGhlIG1pbnRlcnMgYW5kIHRocmVzaG9sZHMgcmVxdWlyZWQgdG8gbWludCB0aGlzIG5mdCBhc3NldFxuICAqIEBwYXJhbSBuYW1lIFN0cmluZyBmb3IgdGhlIGRlc2NyaXB0aXZlIG5hbWUgb2YgdGhlIG5mdCBhc3NldFxuICAqIEBwYXJhbSBzeW1ib2wgU3RyaW5nIGZvciB0aGUgdGlja2VyIHN5bWJvbCBvZiB0aGUgbmZ0IGFzc2V0XG4gICogQHBhcmFtIGZlZSBPcHRpb25hbC4gVGhlIGFtb3VudCBvZiBmZWVzIHRvIGJ1cm4gaW4gaXRzIHNtYWxsZXN0IGRlbm9taW5hdGlvbiwgcmVwcmVzZW50ZWQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgKiBAcGFyYW0gZmVlQXNzZXRJRCBPcHRpb25hbC4gVGhlIGFzc2V0SUQgb2YgdGhlIGZlZXMgYmVpbmcgYnVybmVkLlxuICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgKiBAcGFyYW0gbG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgbWludCBvdXRwdXRcbiAgKiBcbiAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAqIFxuICAqL1xuICBidWlsZENyZWF0ZU5GVEFzc2V0VHggPSAoXG4gICAgbmV0d29ya0lEOiBudW1iZXIsXG4gICAgYmxvY2tjaGFpbklEOiBCdWZmZXIsXG4gICAgZnJvbUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBtaW50ZXJTZXRzOiBNaW50ZXJTZXRbXSxcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgc3ltYm9sOiBzdHJpbmcsXG4gICAgZmVlOiBCTiA9IHVuZGVmaW5lZCxcbiAgICBmZWVBc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgIGxvY2t0aW1lOiBCTiA9IHVuZGVmaW5lZFxuICApOiBVbnNpZ25lZFR4ID0+IHtcbiAgICBjb25zdCB6ZXJvOiBCTiA9IG5ldyBCTigwKVxuICAgIGxldCBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXVxuICAgIGxldCBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IFtdXG4gICAgXG4gICAgaWYodGhpcy5fZmVlQ2hlY2soZmVlLCBmZWVBc3NldElEKSkge1xuICAgICAgY29uc3QgYWFkOiBBc3NldEFtb3VudERlc3RpbmF0aW9uID0gbmV3IEFzc2V0QW1vdW50RGVzdGluYXRpb24oZnJvbUFkZHJlc3NlcywgZnJvbUFkZHJlc3NlcywgY2hhbmdlQWRkcmVzc2VzKVxuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGZlZUFzc2V0SUQsIHplcm8sIGZlZSlcbiAgICAgIGNvbnN0IHN1Y2Nlc3M6IEVycm9yID0gdGhpcy5nZXRNaW5pbXVtU3BlbmRhYmxlKGFhZCwgYXNPZilcbiAgICAgIGlmKHR5cGVvZiBzdWNjZXNzID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlucyA9IGFhZC5nZXRJbnB1dHMoKVxuICAgICAgICBvdXRzID0gYWFkLmdldEFsbE91dHB1dHMoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgc3VjY2Vzc1xuICAgICAgfVxuICAgIH1cbiAgICBsZXQgaW5pdGlhbFN0YXRlOiBJbml0aWFsU3RhdGVzID0gbmV3IEluaXRpYWxTdGF0ZXMoKVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBtaW50ZXJTZXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgbmZ0TWludE91dHB1dDpORlRNaW50T3V0cHV0ID0gbmV3IE5GVE1pbnRPdXRwdXQoXG4gICAgICAgIGksXG4gICAgICAgIG1pbnRlclNldHNbaV0uZ2V0TWludGVycygpLFxuICAgICAgICBsb2NrdGltZSwgXG4gICAgICAgIG1pbnRlclNldHNbaV0uZ2V0VGhyZXNob2xkKClcbiAgICAgIClcbiAgICAgIGluaXRpYWxTdGF0ZS5hZGRPdXRwdXQobmZ0TWludE91dHB1dCwgQVZNQ29uc3RhbnRzLk5GVEZYSUQpXG4gICAgfVxuICAgIGxldCBkZW5vbWluYXRpb246IG51bWJlciA9IDAgLy8gTkZUcyBhcmUgbm9uLWZ1bmdpYmxlXG4gICAgbGV0IENBdHg6IENyZWF0ZUFzc2V0VHggPSBuZXcgQ3JlYXRlQXNzZXRUeChuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zLCBtZW1vLCBuYW1lLCBzeW1ib2wsIGRlbm9taW5hdGlvbiwgaW5pdGlhbFN0YXRlKVxuICAgIHJldHVybiBuZXcgVW5zaWduZWRUeChDQXR4KVxuICB9XG5cbiAgLyoqXG4gICogQ3JlYXRlcyBhbiB1bnNpZ25lZCBORlQgbWludCB0cmFuc2FjdGlvbi4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgKiBbW09wZXJhdGlvblR4XV0gbWFudWFsbHkgKHdpdGggdGhlaXIgY29ycmVzcG9uZGluZyBbW1RyYW5zZmVyYWJsZUlucHV0XV1zLCBbW1RyYW5zZmVyYWJsZU91dHB1dF1dcywgYW5kIFtbVHJhbnNmZXJPcGVyYXRpb25dXXMpLlxuICAqIFxuICAqIEBwYXJhbSBuZXR3b3JrSUQgVGhlIG51bWJlciByZXByZXNlbnRpbmcgTmV0d29ya0lEIG9mIHRoZSBub2RlXG4gICogQHBhcmFtIGJsb2NrY2hhaW5JRCBUaGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBCbG9ja2NoYWluSUQgZm9yIHRoZSB0cmFuc2FjdGlvblxuICAqIEBwYXJhbSBvd25lcnMgQW4gYXJyYXkgb2YgW1tPdXRwdXRPd25lcnNdXSB3aG8gd2lsbCBiZSBnaXZlbiB0aGUgTkZUcy5cbiAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3NcbiAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIE9wdGlvbmFsLiBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zLlxuICAqIEBwYXJhbSB1dHhvaWRzIEFuIGFycmF5IG9mIHN0cmluZ3MgZm9yIHRoZSBORlRzIGJlaW5nIHRyYW5zZmVycmVkXG4gICogQHBhcmFtIGdyb3VwSUQgT3B0aW9uYWwuIFRoZSBncm91cCB0aGlzIE5GVCBpcyBpc3N1ZWQgdG8uXG4gICogQHBhcmFtIHBheWxvYWQgT3B0aW9uYWwuIERhdGEgZm9yIE5GVCBQYXlsb2FkLlxuICAqIEBwYXJhbSBmZWUgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgZmVlcyB0byBidXJuIGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICogQHBhcmFtIGZlZUFzc2V0SUQgT3B0aW9uYWwuIFRoZSBhc3NldElEIG9mIHRoZSBmZWVzIGJlaW5nIGJ1cm5lZC4gXG4gICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAqIFxuICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICogXG4gICovXG4gIGJ1aWxkQ3JlYXRlTkZUTWludFR4ID0gKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyLFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyLFxuICAgIG93bmVyczogT3V0cHV0T3duZXJzW10sXG4gICAgZnJvbUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICB1dHhvaWRzOiBzdHJpbmdbXSxcbiAgICBncm91cElEOiBudW1iZXIgPSAwLFxuICAgIHBheWxvYWQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBmZWU6IEJOID0gdW5kZWZpbmVkLFxuICAgIGZlZUFzc2V0SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBVbml4Tm93KClcbiAgKTogVW5zaWduZWRUeCA9PiB7XG5cbiAgICBjb25zdCB6ZXJvOiBCTiA9IG5ldyBCTigwKVxuICAgIGxldCBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXVxuICAgIGxldCBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IFtdXG4gICAgXG4gICAgaWYodGhpcy5fZmVlQ2hlY2soZmVlLCBmZWVBc3NldElEKSkge1xuICAgICAgY29uc3QgYWFkOiBBc3NldEFtb3VudERlc3RpbmF0aW9uID0gbmV3IEFzc2V0QW1vdW50RGVzdGluYXRpb24oZnJvbUFkZHJlc3NlcywgZnJvbUFkZHJlc3NlcywgY2hhbmdlQWRkcmVzc2VzKVxuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGZlZUFzc2V0SUQsIHplcm8sIGZlZSlcbiAgICAgIGNvbnN0IHN1Y2Nlc3M6IEVycm9yID0gdGhpcy5nZXRNaW5pbXVtU3BlbmRhYmxlKGFhZCwgYXNPZilcbiAgICAgIGlmKHR5cGVvZiBzdWNjZXNzID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlucyA9IGFhZC5nZXRJbnB1dHMoKVxuICAgICAgICBvdXRzID0gYWFkLmdldEFsbE91dHB1dHMoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgc3VjY2Vzc1xuICAgICAgfVxuICAgIH1cbiAgICBsZXQgb3BzOiBUcmFuc2ZlcmFibGVPcGVyYXRpb25bXSA9IFtdXG5cbiAgICBsZXQgbmZ0TWludE9wZXJhdGlvbjogTkZUTWludE9wZXJhdGlvbiA9IG5ldyBORlRNaW50T3BlcmF0aW9uKGdyb3VwSUQsIHBheWxvYWQsIG93bmVycylcblxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB1dHhvaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsZXQgdXR4bzogVVRYTyA9IHRoaXMuZ2V0VVRYTyh1dHhvaWRzW2ldKVxuICAgICAgbGV0IG91dDogTkZUVHJhbnNmZXJPdXRwdXQgPSB1dHhvLmdldE91dHB1dCgpIGFzIE5GVFRyYW5zZmVyT3V0cHV0XG4gICAgICBsZXQgc3BlbmRlcnM6IEJ1ZmZlcltdID0gb3V0LmdldFNwZW5kZXJzKGZyb21BZGRyZXNzZXMsIGFzT2YpXG5cbiAgICAgIGZvciAobGV0IGo6IG51bWJlciA9IDA7IGogPCBzcGVuZGVycy5sZW5ndGg7IGorKykge1xuICAgICAgICBsZXQgaWR4OiBudW1iZXJcbiAgICAgICAgaWR4ID0gb3V0LmdldEFkZHJlc3NJZHgoc3BlbmRlcnNbal0pXG4gICAgICAgICAgICBpZihpZHggPT0gLTEpe1xuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgIHRocm93IG5ldyBBZGRyZXNzRXJyb3IoXCJFcnJvciAtIFVUWE9TZXQuYnVpbGRDcmVhdGVORlRNaW50VHg6IG5vIHN1Y2ggYWRkcmVzcyBpbiBvdXRwdXRcIilcbiAgICAgICAgICAgIH1cbiAgICAgICAgbmZ0TWludE9wZXJhdGlvbi5hZGRTaWduYXR1cmVJZHgoaWR4LCBzcGVuZGVyc1tqXSlcbiAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgbGV0IHRyYW5zZmVyYWJsZU9wZXJhdGlvbjogVHJhbnNmZXJhYmxlT3BlcmF0aW9uID0gbmV3IFRyYW5zZmVyYWJsZU9wZXJhdGlvbih1dHhvLmdldEFzc2V0SUQoKSwgdXR4b2lkcywgbmZ0TWludE9wZXJhdGlvbilcbiAgICAgIG9wcy5wdXNoKHRyYW5zZmVyYWJsZU9wZXJhdGlvbilcbiAgICB9XG5cbiAgICBsZXQgb3BlcmF0aW9uVHg6IE9wZXJhdGlvblR4ID0gbmV3IE9wZXJhdGlvblR4KG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMsIG1lbW8sIG9wcylcbiAgICByZXR1cm4gbmV3IFVuc2lnbmVkVHgob3BlcmF0aW9uVHgpXG4gIH1cblxuICAvKipcbiAgKiBDcmVhdGVzIGFuIHVuc2lnbmVkIE5GVCB0cmFuc2ZlciB0cmFuc2FjdGlvbi4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgKiBbW09wZXJhdGlvblR4XV0gbWFudWFsbHkgKHdpdGggdGhlaXIgY29ycmVzcG9uZGluZyBbW1RyYW5zZmVyYWJsZUlucHV0XV1zLCBbW1RyYW5zZmVyYWJsZU91dHB1dF1dcywgYW5kIFtbVHJhbnNmZXJPcGVyYXRpb25dXXMpLlxuICAqXG4gICogQHBhcmFtIG5ldHdvcmtJRCBUaGUgbnVtYmVyIHJlcHJlc2VudGluZyBOZXR3b3JrSUQgb2YgdGhlIG5vZGVcbiAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIFRoZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRpbmcgdGhlIEJsb2NrY2hhaW5JRCBmb3IgdGhlIHRyYW5zYWN0aW9uXG4gICogQHBhcmFtIHRvQWRkcmVzc2VzIEFuIGFycmF5IG9mIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9cyB3aGljaCBpbmRpY2F0ZSB3aG8gcmVjaWV2ZXMgdGhlIE5GVFxuICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIEFuIGFycmF5IGZvciB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gb3ducyB0aGUgTkZUXG4gICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBPcHRpb25hbC4gVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPcy5cbiAgKiBAcGFyYW0gdXR4b2lkcyBBbiBhcnJheSBvZiBzdHJpbmdzIGZvciB0aGUgTkZUcyBiZWluZyB0cmFuc2ZlcnJlZFxuICAqIEBwYXJhbSBmZWUgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgZmVlcyB0byBidXJuIGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICogQHBhcmFtIGZlZUFzc2V0SUQgT3B0aW9uYWwuIFRoZSBhc3NldElEIG9mIHRoZSBmZWVzIGJlaW5nIGJ1cm5lZC4gXG4gICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBvdXRwdXRzXG4gICogQHBhcmFtIHRocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IFVUWE9cbiAgKiBcbiAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAqXG4gICovXG4gIGJ1aWxkTkZUVHJhbnNmZXJUeCA9IChcbiAgICBuZXR3b3JrSUQ6IG51bWJlcixcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlcixcbiAgICB0b0FkZHJlc3NlczogQnVmZmVyW10sXG4gICAgZnJvbUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICB1dHhvaWRzOiBzdHJpbmdbXSxcbiAgICBmZWU6IEJOID0gdW5kZWZpbmVkLFxuICAgIGZlZUFzc2V0SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBVbml4Tm93KCksXG4gICAgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDApLFxuICAgIHRocmVzaG9sZDogbnVtYmVyID0gMSxcbiAgKTogVW5zaWduZWRUeCA9PiB7XG4gICAgY29uc3QgemVybzogQk4gPSBuZXcgQk4oMClcbiAgICBsZXQgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cbiAgICBsZXQgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXVxuICAgIFxuICAgIGlmKHRoaXMuX2ZlZUNoZWNrKGZlZSwgZmVlQXNzZXRJRCkpIHtcbiAgICAgIGNvbnN0IGFhZDogQXNzZXRBbW91bnREZXN0aW5hdGlvbiA9IG5ldyBBc3NldEFtb3VudERlc3RpbmF0aW9uKGZyb21BZGRyZXNzZXMsIGZyb21BZGRyZXNzZXMsIGNoYW5nZUFkZHJlc3NlcylcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChmZWVBc3NldElELCB6ZXJvLCBmZWUpXG4gICAgICBjb25zdCBzdWNjZXNzOiBFcnJvciA9IHRoaXMuZ2V0TWluaW11bVNwZW5kYWJsZShhYWQsIGFzT2YpXG4gICAgICBpZih0eXBlb2Ygc3VjY2VzcyA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBpbnMgPSBhYWQuZ2V0SW5wdXRzKClcbiAgICAgICAgb3V0cyA9IGFhZC5nZXRBbGxPdXRwdXRzKClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IHN1Y2Nlc3NcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3Qgb3BzOiBUcmFuc2ZlcmFibGVPcGVyYXRpb25bXSA9IFtdXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHV0eG9pZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHV0eG86IFVUWE8gPSB0aGlzLmdldFVUWE8odXR4b2lkc1tpXSlcbiAgXG4gICAgICBjb25zdCBvdXQ6IE5GVFRyYW5zZmVyT3V0cHV0ID0gdXR4by5nZXRPdXRwdXQoKSBhcyBORlRUcmFuc2Zlck91dHB1dFxuICAgICAgY29uc3Qgc3BlbmRlcnM6IEJ1ZmZlcltdID0gb3V0LmdldFNwZW5kZXJzKGZyb21BZGRyZXNzZXMsIGFzT2YpXG4gIFxuICAgICAgY29uc3Qgb3V0Ym91bmQ6TkZUVHJhbnNmZXJPdXRwdXQgPSBuZXcgTkZUVHJhbnNmZXJPdXRwdXQoXG4gICAgICAgIG91dC5nZXRHcm91cElEKCksIG91dC5nZXRQYXlsb2FkKCksIHRvQWRkcmVzc2VzLCBsb2NrdGltZSwgdGhyZXNob2xkLCBcbiAgICAgIClcbiAgICAgIGNvbnN0IG9wOiBORlRUcmFuc2Zlck9wZXJhdGlvbiA9IG5ldyBORlRUcmFuc2Zlck9wZXJhdGlvbihvdXRib3VuZClcbiAgXG4gICAgICBmb3IgKGxldCBqOiBudW1iZXIgPSAwOyBqIDwgc3BlbmRlcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3QgaWR4OiBudW1iZXIgPSBvdXQuZ2V0QWRkcmVzc0lkeChzcGVuZGVyc1tqXSlcbiAgICAgICAgaWYgKGlkeCA9PT0gLTEpIHtcbiAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgIHRocm93IG5ldyBBZGRyZXNzRXJyb3IoJ0Vycm9yIC0gVVRYT1NldC5idWlsZE5GVFRyYW5zZmVyVHg6ICdcbiAgICAgICAgICAgICsgYG5vIHN1Y2ggYWRkcmVzcyBpbiBvdXRwdXQ6ICR7c3BlbmRlcnNbal19YClcbiAgICAgICAgfVxuICAgICAgICBvcC5hZGRTaWduYXR1cmVJZHgoaWR4LCBzcGVuZGVyc1tqXSlcbiAgICAgIH1cbiAgXG4gICAgICBjb25zdCB4ZmVyb3A6VHJhbnNmZXJhYmxlT3BlcmF0aW9uID0gbmV3IFRyYW5zZmVyYWJsZU9wZXJhdGlvbih1dHhvLmdldEFzc2V0SUQoKSxcbiAgICAgICAgW3V0eG9pZHNbaV1dLFxuICAgICAgICBvcClcbiAgICAgIG9wcy5wdXNoKHhmZXJvcClcbiAgICB9XG4gICAgY29uc3QgT3BUeDogT3BlcmF0aW9uVHggPSBuZXcgT3BlcmF0aW9uVHgobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbywgb3BzKVxuICAgIHJldHVybiBuZXcgVW5zaWduZWRUeChPcFR4KVxuICB9XG5cbiAgLyoqXG4gICAgKiBDcmVhdGVzIGFuIHVuc2lnbmVkIEltcG9ydFR4IHRyYW5zYWN0aW9uLlxuICAgICpcbiAgICAqIEBwYXJhbSBuZXR3b3JrSUQgVGhlIG51bWJlciByZXByZXNlbnRpbmcgTmV0d29ya0lEIG9mIHRoZSBub2RlXG4gICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIFRoZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRpbmcgdGhlIEJsb2NrY2hhaW5JRCBmb3IgdGhlIHRyYW5zYWN0aW9uXG4gICAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0byBzZW5kIHRoZSBmdW5kc1xuICAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIE9wdGlvbmFsLiBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zLlxuICAgICogQHBhcmFtIGltcG9ydElucyBBbiBhcnJheSBvZiBbW1RyYW5zZmVyYWJsZUlucHV0XV1zIGJlaW5nIGltcG9ydGVkXG4gICAgKiBAcGFyYW0gc291cmNlQ2hhaW4gQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIGNoYWluaWQgd2hlcmUgdGhlIGltcG9ydHMgYXJlIGNvbWluZyBmcm9tLlxuICAgICogQHBhcmFtIGZlZSBPcHRpb25hbC4gVGhlIGFtb3VudCBvZiBmZWVzIHRvIGJ1cm4gaW4gaXRzIHNtYWxsZXN0IGRlbm9taW5hdGlvbiwgcmVwcmVzZW50ZWQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0uIEZlZSB3aWxsIGNvbWUgZnJvbSB0aGUgaW5wdXRzIGZpcnN0LCBpZiB0aGV5IGNhbi5cbiAgICAqIEBwYXJhbSBmZWVBc3NldElEIE9wdGlvbmFsLiBUaGUgYXNzZXRJRCBvZiB0aGUgZmVlcyBiZWluZyBidXJuZWQuIFxuICAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAgKiBAcGFyYW0gbG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0c1xuICAgICogQHBhcmFtIHRocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IFVUWE9cbiAgICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICAgKlxuICAgICovXG4gICBidWlsZEltcG9ydFR4ID0gKFxuICAgICBuZXR3b3JrSUQ6IG51bWJlcixcbiAgICAgYmxvY2tjaGFpbklEOiBCdWZmZXIsXG4gICAgIHRvQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICAgZnJvbUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgIGNoYW5nZUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgIGF0b21pY3M6IFVUWE9bXSxcbiAgICAgc291cmNlQ2hhaW46IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICAgZmVlOiBCTiA9IHVuZGVmaW5lZCxcbiAgICAgZmVlQXNzZXRJRDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgICBsb2NrdGltZTogQk4gPSBuZXcgQk4oMCksXG4gICAgIHRocmVzaG9sZDogbnVtYmVyID0gMVxuICAgKTogVW5zaWduZWRUeCA9PiB7XG4gICAgIGNvbnN0IHplcm86IEJOID0gbmV3IEJOKDApXG4gICAgIGxldCBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXVxuICAgICBsZXQgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXVxuICAgIGlmKHR5cGVvZiBmZWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGZlZSA9IHplcm8uY2xvbmUoKVxuICAgIH1cblxuICAgICBjb25zdCBpbXBvcnRJbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXVxuICAgICBsZXQgZmVlcGFpZDogQk4gPSBuZXcgQk4oMClcbiAgICAgbGV0IGZlZUFzc2V0U3RyOiBzdHJpbmcgPSBmZWVBc3NldElELnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBhdG9taWNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgY29uc3QgdXR4bzogVVRYTyA9IGF0b21pY3NbaV1cbiAgICAgICBjb25zdCBhc3NldElEOiBCdWZmZXIgPSB1dHhvLmdldEFzc2V0SUQoKVxuICAgICAgIGNvbnN0IG91dHB1dDogQW1vdW50T3V0cHV0ID0gdXR4by5nZXRPdXRwdXQoKSBhcyBBbW91bnRPdXRwdXRcbiAgICAgICBsZXQgYW10OiBCTiA9IG91dHB1dC5nZXRBbW91bnQoKS5jbG9uZSgpXG5cbiAgICAgICBsZXQgaW5mZWVhbW91bnQgPSBhbXQuY2xvbmUoKVxuICAgICAgIGxldCBhc3NldFN0cjogc3RyaW5nID0gYXNzZXRJRC50b1N0cmluZyhcImhleFwiKVxuICAgICAgaWYoXG4gICAgICAgIHR5cGVvZiBmZWVBc3NldElEICE9PSBcInVuZGVmaW5lZFwiICYmIFxuICAgICAgICBmZWUuZ3QoemVybykgJiYgXG4gICAgICAgIGZlZXBhaWQubHQoZmVlKSAmJiBcbiAgICAgICAgYXNzZXRTdHIgPT09IGZlZUFzc2V0U3RyXG4gICAgICApIFxuICAgICAge1xuICAgICAgICBmZWVwYWlkID0gZmVlcGFpZC5hZGQoaW5mZWVhbW91bnQpXG4gICAgICAgIGlmKGZlZXBhaWQuZ3QoZmVlKSkge1xuICAgICAgICAgIGluZmVlYW1vdW50ID0gZmVlcGFpZC5zdWIoZmVlKVxuICAgICAgICAgIGZlZXBhaWQgPSBmZWUuY2xvbmUoKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluZmVlYW1vdW50ID0gemVyby5jbG9uZSgpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgIGNvbnN0IHR4aWQ6IEJ1ZmZlciA9IHV0eG8uZ2V0VHhJRCgpXG4gICAgICAgY29uc3Qgb3V0cHV0aWR4OiBCdWZmZXIgPSB1dHhvLmdldE91dHB1dElkeCgpXG4gICAgICAgY29uc3QgaW5wdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KGFtdClcbiAgICAgICBjb25zdCB4ZmVyaW46IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KHR4aWQsIG91dHB1dGlkeCwgYXNzZXRJRCwgaW5wdXQpXG4gICAgICAgY29uc3QgZnJvbTogQnVmZmVyW10gPSBvdXRwdXQuZ2V0QWRkcmVzc2VzKClcbiAgICAgICBjb25zdCBzcGVuZGVyczogQnVmZmVyW10gPSBvdXRwdXQuZ2V0U3BlbmRlcnMoZnJvbSwgYXNPZilcbiAgICAgICBmb3IgKGxldCBqOiBudW1iZXIgPSAwOyBqIDwgc3BlbmRlcnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgIGNvbnN0IGlkeDogbnVtYmVyID0gb3V0cHV0LmdldEFkZHJlc3NJZHgoc3BlbmRlcnNbal0pXG4gICAgICAgIGlmIChpZHggPT09IC0xKSB7XG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKCdFcnJvciAtIFVUWE9TZXQuYnVpbGRJbXBvcnRUeDogbm8gc3VjaCAnXG4gICAgICAgICAgICArIGBhZGRyZXNzIGluIG91dHB1dDogJHtzcGVuZGVyc1tqXX1gKVxuICAgICAgICB9XG4gICAgICAgICB4ZmVyaW4uZ2V0SW5wdXQoKS5hZGRTaWduYXR1cmVJZHgoaWR4LCBzcGVuZGVyc1tqXSlcbiAgICAgIH1cbiAgICAgICBpbXBvcnRJbnMucHVzaCh4ZmVyaW4pXG5cbiAgICAgIC8vYWRkIGV4dHJhIG91dHB1dHMgZm9yIGVhY2ggYW1vdW50IChjYWxjdWxhdGVkIGZyb20gdGhlIGltcG9ydGVkIGlucHV0cyksIG1pbnVzIGZlZXNcbiAgICAgIGlmKGluZmVlYW1vdW50Lmd0KHplcm8pKSB7XG4gICAgICAgIGNvbnN0IHNwZW5kb3V0OkFtb3VudE91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKG91dHB1dC5nZXRPdXRwdXRJRCgpLFxuICAgICAgICAgIGluZmVlYW1vdW50LCB0b0FkZHJlc3NlcywgbG9ja3RpbWUsIHRocmVzaG9sZCkgYXMgQW1vdW50T3V0cHV0XG4gICAgICAgIGNvbnN0IHhmZXJvdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYXNzZXRJRCwgc3BlbmRvdXQpXG4gICAgICAgIG91dHMucHVzaCh4ZmVyb3V0KVxuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBnZXQgcmVtYWluaW5nIGZlZXMgZnJvbSB0aGUgcHJvdmlkZWQgYWRkcmVzc2VzXG4gICAgIGxldCBmZWVSZW1haW5pbmc6IEJOID0gZmVlLnN1YihmZWVwYWlkKVxuICAgIGlmKGZlZVJlbWFpbmluZy5ndCh6ZXJvKSAmJiB0aGlzLl9mZWVDaGVjayhmZWVSZW1haW5pbmcsIGZlZUFzc2V0SUQpKSB7XG4gICAgICBjb25zdCBhYWQ6IEFzc2V0QW1vdW50RGVzdGluYXRpb24gPSBuZXcgQXNzZXRBbW91bnREZXN0aW5hdGlvbih0b0FkZHJlc3NlcywgZnJvbUFkZHJlc3NlcywgY2hhbmdlQWRkcmVzc2VzKVxuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGZlZUFzc2V0SUQsIHplcm8sIGZlZVJlbWFpbmluZylcbiAgICAgIGNvbnN0IHN1Y2Nlc3M6IEVycm9yID0gdGhpcy5nZXRNaW5pbXVtU3BlbmRhYmxlKGFhZCwgYXNPZiwgbG9ja3RpbWUsIHRocmVzaG9sZClcbiAgICAgIGlmKHR5cGVvZiBzdWNjZXNzID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlucyA9IGFhZC5nZXRJbnB1dHMoKVxuICAgICAgICBvdXRzID0gYWFkLmdldEFsbE91dHB1dHMoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgc3VjY2Vzc1xuICAgICAgfVxuICAgIH1cblxuICAgICBjb25zdCBpbXBvcnRUeDogSW1wb3J0VHggPSBuZXcgSW1wb3J0VHgobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbywgc291cmNlQ2hhaW4sIGltcG9ydElucylcbiAgICAgcmV0dXJuIG5ldyBVbnNpZ25lZFR4KGltcG9ydFR4KVxuICAgfVxuXG4gICAgLyoqXG4gICAgKiBDcmVhdGVzIGFuIHVuc2lnbmVkIEV4cG9ydFR4IHRyYW5zYWN0aW9uLiBcbiAgICAqXG4gICAgKiBAcGFyYW0gbmV0d29ya0lEIFRoZSBudW1iZXIgcmVwcmVzZW50aW5nIE5ldHdvcmtJRCBvZiB0aGUgbm9kZVxuICAgICogQHBhcmFtIGJsb2NrY2hhaW5JRCBUaGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBCbG9ja2NoYWluSUQgZm9yIHRoZSB0cmFuc2FjdGlvblxuICAgICogQHBhcmFtIGFtb3VudCBUaGUgYW1vdW50IGJlaW5nIGV4cG9ydGVkIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICAqIEBwYXJhbSBhdmF4QXNzZXRJRCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgYXNzZXQgSUQgZm9yIEFWQVhcbiAgICAqIEBwYXJhbSB0b0FkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIHJlY2lldmVzIHRoZSBBVkFYXG4gICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIG93bnMgdGhlIEFWQVhcbiAgICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgT3B0aW9uYWwuIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3MuXG4gICAgKiBAcGFyYW0gZmVlIE9wdGlvbmFsLiBUaGUgYW1vdW50IG9mIGZlZXMgdG8gYnVybiBpbiBpdHMgc21hbGxlc3QgZGVub21pbmF0aW9uLCByZXByZXNlbnRlZCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgICogQHBhcmFtIGRlc3RpbmF0aW9uQ2hhaW4gT3B0aW9uYWwuIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBjaGFpbmlkIHdoZXJlIHRvIHNlbmQgdGhlIGFzc2V0LlxuICAgICogQHBhcmFtIGZlZUFzc2V0SUQgT3B0aW9uYWwuIFRoZSBhc3NldElEIG9mIHRoZSBmZWVzIGJlaW5nIGJ1cm5lZC4gXG4gICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBvdXRwdXRzXG4gICAgKiBAcGFyYW0gdGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgVVRYT1xuICAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gY3JlYXRlZCBmcm9tIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVycy5cbiAgICAqXG4gICAgKi9cbiAgIGJ1aWxkRXhwb3J0VHggPSAoXG4gICAgIG5ldHdvcmtJRDogbnVtYmVyLFxuICAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlcixcbiAgICAgYW1vdW50OiBCTixcbiAgICAgYXNzZXRJRDogQnVmZmVyLFxuICAgICB0b0FkZHJlc3NlczogQnVmZmVyW10sXG4gICAgIGZyb21BZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgICBjaGFuZ2VBZGRyZXNzZXM6IEJ1ZmZlcltdID0gdW5kZWZpbmVkLFxuICAgICBkZXN0aW5hdGlvbkNoYWluOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgIGZlZTogQk4gPSB1bmRlZmluZWQsXG4gICAgIGZlZUFzc2V0SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgICAgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDApLFxuICAgICB0aHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgICk6IFVuc2lnbmVkVHggPT4ge1xuICAgICBsZXQgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cbiAgICAgbGV0IG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW11cbiAgICAgbGV0IGV4cG9ydG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW11cbiAgICBcbiAgICBpZih0eXBlb2YgY2hhbmdlQWRkcmVzc2VzID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBjaGFuZ2VBZGRyZXNzZXMgPSB0b0FkZHJlc3Nlc1xuICAgIH1cblxuICAgICBjb25zdCB6ZXJvOiBCTiA9IG5ldyBCTigwKVxuICAgIFxuICAgIGlmIChhbW91bnQuZXEoemVybykpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9XG5cbiAgICBpZih0eXBlb2YgZmVlQXNzZXRJRCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZmVlQXNzZXRJRCA9IGFzc2V0SURcbiAgICB9XG5cbiAgICBpZih0eXBlb2YgZGVzdGluYXRpb25DaGFpbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZGVzdGluYXRpb25DaGFpbiA9IGJpbnRvb2xzLmNiNThEZWNvZGUoUGxhdGZvcm1DaGFpbklEKVxuICAgIH1cblxuICAgICBjb25zdCBhYWQ6IEFzc2V0QW1vdW50RGVzdGluYXRpb24gPSBuZXcgQXNzZXRBbW91bnREZXN0aW5hdGlvbih0b0FkZHJlc3NlcywgZnJvbUFkZHJlc3NlcywgY2hhbmdlQWRkcmVzc2VzKVxuICAgIGlmKGFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikgPT09IGZlZUFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikpe1xuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGFzc2V0SUQsIGFtb3VudCwgZmVlKVxuICAgIH0gZWxzZSB7XG4gICAgICBhYWQuYWRkQXNzZXRBbW91bnQoYXNzZXRJRCwgYW1vdW50LCB6ZXJvKVxuICAgICAgaWYodGhpcy5fZmVlQ2hlY2soZmVlLCBmZWVBc3NldElEKSl7XG4gICAgICAgIGFhZC5hZGRBc3NldEFtb3VudChmZWVBc3NldElELCB6ZXJvLCBmZWUpXG4gICAgICB9XG4gICAgfVxuICAgICBjb25zdCBzdWNjZXNzOiBFcnJvciA9IHRoaXMuZ2V0TWluaW11bVNwZW5kYWJsZShhYWQsIGFzT2YsIGxvY2t0aW1lLCB0aHJlc2hvbGQpXG4gICAgaWYodHlwZW9mIHN1Y2Nlc3MgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlucyA9IGFhZC5nZXRJbnB1dHMoKVxuICAgICAgb3V0cyA9IGFhZC5nZXRDaGFuZ2VPdXRwdXRzKClcbiAgICAgIGV4cG9ydG91dHMgPSBhYWQuZ2V0T3V0cHV0cygpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IHN1Y2Nlc3NcbiAgICB9XG5cbiAgICAgY29uc3QgZXhwb3J0VHg6IEV4cG9ydFR4ID0gbmV3IEV4cG9ydFR4KG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMsIG1lbW8sIGRlc3RpbmF0aW9uQ2hhaW4sIGV4cG9ydG91dHMpXG4gICAgIHJldHVybiBuZXcgVW5zaWduZWRUeChleHBvcnRUeClcbiAgIH1cbn1cbiJdfQ==