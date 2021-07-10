"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UTXOSet = exports.AssetAmountDestination = exports.UTXO = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-UTXOs
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const outputs_1 = require("./outputs");
const inputs_1 = require("./inputs");
const helperfunctions_1 = require("../../utils/helperfunctions");
const utxos_1 = require("../../common/utxos");
const constants_1 = require("./constants");
const tx_1 = require("./tx");
const exporttx_1 = require("../platformvm/exporttx");
const constants_2 = require("../../utils/constants");
const importtx_1 = require("../platformvm/importtx");
const basetx_1 = require("../platformvm/basetx");
const assetamount_1 = require("../../common/assetamount");
const validationtx_1 = require("./validationtx");
const createsubnettx_1 = require("./createsubnettx");
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
    create(codecID = constants_1.PlatformVMConstants.LATESTCODEC, txid = undefined, outputidx = undefined, assetID = undefined, output = undefined) {
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
        this.getConsumableUXTO = (asOf = helperfunctions_1.UnixNow(), stakeable = false) => {
            return this.getAllUTXOs().filter((utxo) => {
                if (stakeable) {
                    // stakeable transactions can consume any UTXO.
                    return true;
                }
                const output = utxo.getOutput();
                if (!(output instanceof outputs_1.StakeableLockOut)) {
                    // non-stakeable transactions can consume any UTXO that isn't locked.
                    return true;
                }
                const stakeableOutput = output;
                if (stakeableOutput.getStakeableLocktime().lt(asOf)) {
                    // If the stakeable outputs locktime has ended, then this UTXO can still
                    // be consumed by a non-stakeable transaction.
                    return true;
                }
                // This output is locked and can't be consumed by a non-stakeable
                // transaction.
                return false;
            });
        };
        this.getMinimumSpendable = (aad, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1, stakeable = false) => {
            let utxoArray = this.getConsumableUXTO(asOf, stakeable);
            let tmpUTXOArray = [];
            if (stakeable) {
                // If this is a stakeable transaction then have StakeableLockOut come before SECPTransferOutput
                // so that users first stake locked tokens before staking unlocked tokens
                utxoArray.forEach((utxo) => {
                    // StakeableLockOuts
                    if (utxo.getOutput().getTypeID() === 22) {
                        tmpUTXOArray.push(utxo);
                    }
                });
                // Sort the StakeableLockOuts by StakeableLocktime so that the greatest StakeableLocktime are spent first
                tmpUTXOArray.sort((a, b) => {
                    let stakeableLockOut1 = a.getOutput();
                    let stakeableLockOut2 = b.getOutput();
                    return stakeableLockOut2.getStakeableLocktime().toNumber() - stakeableLockOut1.getStakeableLocktime().toNumber();
                });
                utxoArray.forEach((utxo) => {
                    // SECPTransferOutputs
                    if (utxo.getOutput().getTypeID() === 7) {
                        tmpUTXOArray.push(utxo);
                    }
                });
                utxoArray = tmpUTXOArray;
            }
            // outs is a map from assetID to a tuple of (lockedStakeable, unlocked)
            // which are arrays of outputs.
            const outs = {};
            // We only need to iterate over UTXOs until we have spent sufficient funds
            // to met the requested amounts.
            utxoArray.forEach((utxo, index) => {
                const assetID = utxo.getAssetID();
                const assetKey = assetID.toString("hex");
                const fromAddresses = aad.getSenders();
                const output = utxo.getOutput();
                if (!(output instanceof outputs_1.AmountOutput) || !aad.assetExists(assetKey) || !output.meetsThreshold(fromAddresses, asOf)) {
                    // We should only try to spend fungible assets.
                    // We should only spend {{ assetKey }}.
                    // We need to be able to spend the output.
                    return;
                }
                const assetAmount = aad.getAssetAmount(assetKey);
                if (assetAmount.isFinished()) {
                    // We've already spent the needed UTXOs for this assetID.
                    return;
                }
                if (!(assetKey in outs)) {
                    // If this is the first time spending this assetID, we need to
                    // initialize the outs object correctly.
                    outs[assetKey] = {
                        lockedStakeable: [],
                        unlocked: [],
                    };
                }
                const amountOutput = output;
                // amount is the amount of funds available from this UTXO.
                const amount = amountOutput.getAmount();
                // Set up the SECP input with the same amount as the output.
                let input = new inputs_1.SECPTransferInput(amount);
                let locked = false;
                if (amountOutput instanceof outputs_1.StakeableLockOut) {
                    const stakeableOutput = amountOutput;
                    const stakeableLocktime = stakeableOutput.getStakeableLocktime();
                    if (stakeableLocktime.gt(asOf)) {
                        // Add a new input and mark it as being locked.
                        input = new inputs_1.StakeableLockIn(amount, stakeableLocktime, new inputs_1.ParseableInput(input));
                        // Mark this UTXO as having been re-locked.
                        locked = true;
                    }
                }
                assetAmount.spendAmount(amount, locked);
                if (locked) {
                    // Track the UTXO as locked.
                    outs[assetKey].lockedStakeable.push(amountOutput);
                }
                else {
                    // Track the UTXO as unlocked.
                    outs[assetKey].unlocked.push(amountOutput);
                }
                // Get the indices of the outputs that should be used to authorize the
                // spending of this input.
                // TODO: getSpenders should return an array of indices rather than an
                // array of addresses.
                const spenders = amountOutput.getSpenders(fromAddresses, asOf);
                spenders.forEach((spender) => {
                    const idx = amountOutput.getAddressIdx(spender);
                    if (idx === -1) {
                        // This should never happen, which is why the error is thrown rather
                        // than being returned. If this were to ever happen this would be an
                        // error in the internal logic rather having called this function with
                        // invalid arguments.
                        /* istanbul ignore next */
                        throw new errors_1.AddressError('Error - UTXOSet.getMinimumSpendable: no such '
                            + `address in output: ${spender}`);
                    }
                    input.addSignatureIdx(idx, spender);
                });
                const txID = utxo.getTxID();
                const outputIdx = utxo.getOutputIdx();
                const transferInput = new inputs_1.TransferableInput(txID, outputIdx, assetID, input);
                aad.addInput(transferInput);
            });
            if (!aad.canComplete()) {
                // After running through all the UTXOs, we still weren't able to get all
                // the necessary funds, so this transaction can't be made.
                return new errors_1.InsufficientFundsError('Error - UTXOSet.getMinimumSpendable: insufficient '
                    + 'funds to create the transaction');
            }
            // TODO: We should separate the above functionality into a single function
            // that just selects the UTXOs to consume.
            const zero = new bn_js_1.default(0);
            // assetAmounts is an array of asset descriptions and how much is left to
            // spend for them.
            const assetAmounts = aad.getAmounts();
            assetAmounts.forEach((assetAmount) => {
                // change is the amount that should be returned back to the source of the
                // funds.
                const change = assetAmount.getChange();
                // isStakeableLockChange is if the change is locked or not.
                const isStakeableLockChange = assetAmount.getStakeableLockChange();
                // lockedChange is the amount of locked change that should be returned to
                // the sender
                const lockedChange = isStakeableLockChange ? change : zero.clone();
                const assetID = assetAmount.getAssetID();
                const assetKey = assetAmount.getAssetIDString();
                const lockedOutputs = outs[assetKey].lockedStakeable;
                lockedOutputs.forEach((lockedOutput, i) => {
                    const stakeableLocktime = lockedOutput.getStakeableLocktime();
                    const parseableOutput = lockedOutput.getTransferableOutput();
                    // We know that parseableOutput contains an AmountOutput because the
                    // first loop filters for fungible assets.
                    const output = parseableOutput.getOutput();
                    let outputAmountRemaining = output.getAmount();
                    // The only output that could generate change is the last output.
                    // Otherwise, any further UTXOs wouldn't have needed to be spent.
                    if (i == lockedOutputs.length - 1 && lockedChange.gt(zero)) {
                        // update outputAmountRemaining to no longer hold the change that we
                        // are returning.
                        outputAmountRemaining = outputAmountRemaining.sub(lockedChange);
                        // Create the inner output.
                        const newChangeOutput = outputs_1.SelectOutputClass(output.getOutputID(), lockedChange, output.getAddresses(), output.getLocktime(), output.getThreshold());
                        // Wrap the inner output in the StakeableLockOut wrapper.
                        let newLockedChangeOutput = outputs_1.SelectOutputClass(lockedOutput.getOutputID(), lockedChange, output.getAddresses(), output.getLocktime(), output.getThreshold(), stakeableLocktime, new outputs_1.ParseableOutput(newChangeOutput));
                        const transferOutput = new outputs_1.TransferableOutput(assetID, newLockedChangeOutput);
                        aad.addChange(transferOutput);
                    }
                    // We know that outputAmountRemaining > 0. Otherwise, we would never
                    // have consumed this UTXO, as it would be only change.
                    // Create the inner output.
                    const newOutput = outputs_1.SelectOutputClass(output.getOutputID(), outputAmountRemaining, output.getAddresses(), output.getLocktime(), output.getThreshold());
                    // Wrap the inner output in the StakeableLockOut wrapper.
                    const newLockedOutput = outputs_1.SelectOutputClass(lockedOutput.getOutputID(), outputAmountRemaining, output.getAddresses(), output.getLocktime(), output.getThreshold(), stakeableLocktime, new outputs_1.ParseableOutput(newOutput));
                    const transferOutput = new outputs_1.TransferableOutput(assetID, newLockedOutput);
                    aad.addOutput(transferOutput);
                });
                // unlockedChange is the amount of unlocked change that should be returned
                // to the sender
                const unlockedChange = isStakeableLockChange ? zero.clone() : change;
                if (unlockedChange.gt(zero)) {
                    const newChangeOutput = new outputs_1.SECPTransferOutput(unlockedChange, aad.getChangeAddresses(), zero.clone(), // make sure that we don't lock the change output.
                    1);
                    const transferOutput = new outputs_1.TransferableOutput(assetID, newChangeOutput);
                    aad.addChange(transferOutput);
                }
                // totalAmountSpent is the total amount of tokens consumed.
                const totalAmountSpent = assetAmount.getSpent();
                // stakeableLockedAmount is the total amount of locked tokens consumed.
                const stakeableLockedAmount = assetAmount.getStakeableLockSpent();
                // totalUnlockedSpent is the total amount of unlocked tokens consumed.
                const totalUnlockedSpent = totalAmountSpent.sub(stakeableLockedAmount);
                // amountBurnt is the amount of unlocked tokens that must be burn.
                const amountBurnt = assetAmount.getBurn();
                // totalUnlockedAvailable is the total amount of unlocked tokens available
                // to be produced.
                const totalUnlockedAvailable = totalUnlockedSpent.sub(amountBurnt);
                // unlockedAmount is the amount of unlocked tokens that should be sent.
                const unlockedAmount = totalUnlockedAvailable.sub(unlockedChange);
                if (unlockedAmount.gt(zero)) {
                    const newOutput = new outputs_1.SECPTransferOutput(unlockedAmount, aad.getDestinations(), locktime, threshold);
                    const transferOutput = new outputs_1.TransferableOutput(assetID, newOutput);
                    aad.addOutput(transferOutput);
                }
            });
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
            const minSpendableErr = this.getMinimumSpendable(aad, asOf, locktime, threshold);
            if (typeof minSpendableErr === "undefined") {
                ins = aad.getInputs();
                outs = aad.getAllOutputs();
            }
            else {
                throw minSpendableErr;
            }
            const baseTx = new basetx_1.BaseTx(networkID, blockchainID, outs, ins, memo);
            return new tx_1.UnsignedTx(baseTx);
        };
        /**
          * Creates an unsigned ImportTx transaction.
          *
          * @param networkID The number representing NetworkID of the node
          * @param blockchainID The {@link https://github.com/feross/buffer|Buffer} representing the BlockchainID for the transaction
          * @param toAddresses The addresses to send the funds
          * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
          * @param changeAddresses Optional. The addresses that can spend the change remaining from the spent UTXOs. Default: toAddresses
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
                    if (feepaid.gte(fee)) {
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
                const minSpendableErr = this.getMinimumSpendable(aad, asOf, locktime, threshold);
                if (typeof minSpendableErr === "undefined") {
                    ins = aad.getInputs();
                    outs = aad.getAllOutputs();
                }
                else {
                    throw minSpendableErr;
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
          * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover of the AVAX
          * @param destinationChain Optional. A {@link https://github.com/feross/buffer|Buffer} for the chainid where to send the asset.
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
        this.buildExportTx = (networkID, blockchainID, amount, avaxAssetID, // TODO: rename this to amountAssetID
        toAddresses, fromAddresses, changeAddresses = undefined, destinationChain = undefined, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => {
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
                feeAssetID = avaxAssetID;
            }
            else if (feeAssetID.toString("hex") !== avaxAssetID.toString("hex")) {
                /* istanbul ignore next */
                throw new errors_1.FeeAssetError('Error - UTXOSet.buildExportTx: '
                    + `feeAssetID must match avaxAssetID`);
            }
            if (typeof destinationChain === "undefined") {
                destinationChain = bintools.cb58Decode(constants_2.Defaults.network[networkID].X["blockchainID"]);
            }
            const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
            if (avaxAssetID.toString("hex") === feeAssetID.toString("hex")) {
                aad.addAssetAmount(avaxAssetID, amount, fee);
            }
            else {
                aad.addAssetAmount(avaxAssetID, amount, zero);
                if (this._feeCheck(fee, feeAssetID)) {
                    aad.addAssetAmount(feeAssetID, zero, fee);
                }
            }
            const minSpendableErr = this.getMinimumSpendable(aad, asOf, locktime, threshold);
            if (typeof minSpendableErr === "undefined") {
                ins = aad.getInputs();
                outs = aad.getChangeOutputs();
                exportouts = aad.getOutputs();
            }
            else {
                throw minSpendableErr;
            }
            const exportTx = new exporttx_1.ExportTx(networkID, blockchainID, outs, ins, memo, destinationChain, exportouts);
            return new tx_1.UnsignedTx(exportTx);
        };
        /**
        * Class representing an unsigned [[AddSubnetValidatorTx]] transaction.
        *
        * @param networkID Networkid, [[DefaultNetworkID]]
        * @param blockchainID Blockchainid, default undefined
        * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who pays the fees in AVAX
        * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the fee payment
        * @param nodeID The node ID of the validator being added.
        * @param startTime The Unix time when the validator starts validating the Primary Network.
        * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
        * @param weight The amount of weight for this subnet validator.
        * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
        * @param feeAssetID Optional. The assetID of the fees being burned.
        * @param memo Optional contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        * @param locktime Optional. The locktime field created in the resulting outputs
        * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
        *
        * @returns An unsigned transaction created from the passed in parameters.
        */
        /* must implement later once the transaction format signing process is clearer
        buildAddSubnetValidatorTx = (
          networkID:number = DefaultNetworkID,
          blockchainID:Buffer,
          fromAddresses:Buffer[],
          changeAddresses:Buffer[],
          nodeID:Buffer,
          startTime:BN,
          endTime:BN,
          weight:BN,
          fee:BN = undefined,
          feeAssetID:Buffer = undefined,
          memo:Buffer = undefined,
          asOf:BN = UnixNow()
        ):UnsignedTx => {
          let ins:TransferableInput[] = [];
          let outs:TransferableOutput[] = [];
          //let stakeOuts:TransferableOutput[] = [];
          
          const zero:BN = new BN(0);
          const now:BN = UnixNow();
          if (startTime.lt(now) || endTime.lte(startTime)) {
            throw new Error("UTXOSet.buildAddSubnetValidatorTx -- startTime must be in the future and endTime must come after startTime");
          }
         
          // Not implemented: Fees can be paid from importIns
          if(this._feeCheck(fee, feeAssetID)) {
            const aad:AssetAmountDestination = new AssetAmountDestination(fromAddresses, fromAddresses, changeAddresses);
            aad.addAssetAmount(feeAssetID, zero, fee);
            const success:Error = this.getMinimumSpendable(aad, asOf);
            if(typeof success === "undefined") {
              ins = aad.getInputs();
              outs = aad.getAllOutputs();
            } else {
              throw success;
            }
          }
         
          const UTx:AddSubnetValidatorTx = new AddSubnetValidatorTx(networkID, blockchainID, outs, ins, memo, nodeID, startTime, endTime, weight);
          return new UnsignedTx(UTx);
        }
        */
        /**
        * Class representing an unsigned [[AddDelegatorTx]] transaction.
        *
        * @param networkID Networkid, [[DefaultNetworkID]]
        * @param blockchainID Blockchainid, default undefined
        * @param avaxAssetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for AVAX
        * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} recieves the stake at the end of the staking period
        * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who pays the fees and the stake
        * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the staking payment
        * @param nodeID The node ID of the validator being added.
        * @param startTime The Unix time when the validator starts validating the Primary Network.
        * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
        * @param stakeAmount A {@link https://github.com/indutny/bn.js/|BN} for the amount of stake to be delegated in nAVAX.
        * @param rewardLocktime The locktime field created in the resulting reward outputs
        * @param rewardThreshold The number of signatures required to spend the funds in the resultant reward UTXO
        * @param rewardAddresses The addresses the validator reward goes.
        * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
        * @param feeAssetID Optional. The assetID of the fees being burned.
        * @param memo Optional contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        *
        * @returns An unsigned transaction created from the passed in parameters.
        */
        this.buildAddDelegatorTx = (networkID = constants_2.DefaultNetworkID, blockchainID, avaxAssetID, toAddresses, fromAddresses, changeAddresses, nodeID, startTime, endTime, stakeAmount, rewardLocktime, rewardThreshold, rewardAddresses, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow()) => {
            let ins = [];
            let outs = [];
            let stakeOuts = [];
            const zero = new bn_js_1.default(0);
            const now = helperfunctions_1.UnixNow();
            if (startTime.lt(now) || endTime.lte(startTime)) {
                throw new errors_1.TimeError("UTXOSet.buildAddDelegatorTx -- startTime must be in the future and endTime must come after startTime");
            }
            const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
            if (avaxAssetID.toString("hex") === feeAssetID.toString("hex")) {
                aad.addAssetAmount(avaxAssetID, stakeAmount, fee);
            }
            else {
                aad.addAssetAmount(avaxAssetID, stakeAmount, zero);
                if (this._feeCheck(fee, feeAssetID)) {
                    aad.addAssetAmount(feeAssetID, zero, fee);
                }
            }
            const minSpendableErr = this.getMinimumSpendable(aad, asOf, undefined, undefined, true);
            if (typeof minSpendableErr === "undefined") {
                ins = aad.getInputs();
                outs = aad.getChangeOutputs();
                stakeOuts = aad.getOutputs();
            }
            else {
                throw minSpendableErr;
            }
            const rewardOutputOwners = new outputs_1.SECPOwnerOutput(rewardAddresses, rewardLocktime, rewardThreshold);
            const UTx = new validationtx_1.AddDelegatorTx(networkID, blockchainID, outs, ins, memo, nodeID, startTime, endTime, stakeAmount, stakeOuts, new outputs_1.ParseableOutput(rewardOutputOwners));
            return new tx_1.UnsignedTx(UTx);
        };
        /**
          * Class representing an unsigned [[AddValidatorTx]] transaction.
          *
          * @param networkID NetworkID, [[DefaultNetworkID]]
          * @param blockchainID BlockchainID, default undefined
          * @param avaxAssetID {@link https://github.com/feross/buffer|Buffer} of the asset ID for AVAX
          * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} recieves the stake at the end of the staking period
          * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who pays the fees and the stake
          * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the staking payment
          * @param nodeID The node ID of the validator being added.
          * @param startTime The Unix time when the validator starts validating the Primary Network.
          * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
          * @param stakeAmount A {@link https://github.com/indutny/bn.js/|BN} for the amount of stake to be delegated in nAVAX.
          * @param rewardLocktime The locktime field created in the resulting reward outputs
          * @param rewardThreshold The number of signatures required to spend the funds in the resultant reward UTXO
          * @param rewardAddresses The addresses the validator reward goes.
          * @param delegationFee A number for the percentage of reward to be given to the validator when someone delegates to them. Must be between 0 and 100.
          * @param minStake A {@link https://github.com/indutny/bn.js/|BN} representing the minimum stake required to validate on this network.
          * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
          * @param feeAssetID Optional. The assetID of the fees being burned.
          * @param memo Optional contains arbitrary bytes, up to 256 bytes
          * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
          *
          * @returns An unsigned transaction created from the passed in parameters.
          */
        this.buildAddValidatorTx = (networkID = constants_2.DefaultNetworkID, blockchainID, avaxAssetID, toAddresses, fromAddresses, changeAddresses, nodeID, startTime, endTime, stakeAmount, rewardLocktime, rewardThreshold, rewardAddresses, delegationFee, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow()) => {
            let ins = [];
            let outs = [];
            let stakeOuts = [];
            const zero = new bn_js_1.default(0);
            const now = helperfunctions_1.UnixNow();
            if (startTime.lt(now) || endTime.lte(startTime)) {
                throw new errors_1.TimeError("UTXOSet.buildAddValidatorTx -- startTime must be in the future and endTime must come after startTime");
            }
            if (delegationFee > 100 || delegationFee < 0) {
                throw new errors_1.TimeError("UTXOSet.buildAddValidatorTx -- startTime must be in the range of 0 to 100, inclusively");
            }
            const aad = new AssetAmountDestination(toAddresses, fromAddresses, changeAddresses);
            if (avaxAssetID.toString("hex") === feeAssetID.toString("hex")) {
                aad.addAssetAmount(avaxAssetID, stakeAmount, fee);
            }
            else {
                aad.addAssetAmount(avaxAssetID, stakeAmount, zero);
                if (this._feeCheck(fee, feeAssetID)) {
                    aad.addAssetAmount(feeAssetID, zero, fee);
                }
            }
            const minSpendableErr = this.getMinimumSpendable(aad, asOf, undefined, undefined, true);
            if (typeof minSpendableErr === "undefined") {
                ins = aad.getInputs();
                outs = aad.getChangeOutputs();
                stakeOuts = aad.getOutputs();
            }
            else {
                throw minSpendableErr;
            }
            const rewardOutputOwners = new outputs_1.SECPOwnerOutput(rewardAddresses, rewardLocktime, rewardThreshold);
            const UTx = new validationtx_1.AddValidatorTx(networkID, blockchainID, outs, ins, memo, nodeID, startTime, endTime, stakeAmount, stakeOuts, new outputs_1.ParseableOutput(rewardOutputOwners), delegationFee);
            return new tx_1.UnsignedTx(UTx);
        };
        /**
          * Class representing an unsigned [[CreateSubnetTx]] transaction.
          *
          * @param networkID Networkid, [[DefaultNetworkID]]
          * @param blockchainID Blockchainid, default undefined
          * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
          * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs.
          * @param subnetOwnerAddresses An array of {@link https://github.com/feross/buffer|Buffer} for the addresses to add to a subnet
          * @param subnetOwnerThreshold The number of owners's signatures required to add a validator to the network
          * @param fee Optional. The amount of fees to burn in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}
          * @param feeAssetID Optional. The assetID of the fees being burned
          * @param memo Optional contains arbitrary bytes, up to 256 bytes
          * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
          *
          * @returns An unsigned transaction created from the passed in parameters.
          */
        this.buildCreateSubnetTx = (networkID = constants_2.DefaultNetworkID, blockchainID, fromAddresses, changeAddresses, subnetOwnerAddresses, subnetOwnerThreshold, fee = undefined, feeAssetID = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow()) => {
            const zero = new bn_js_1.default(0);
            let ins = [];
            let outs = [];
            if (this._feeCheck(fee, feeAssetID)) {
                const aad = new AssetAmountDestination(fromAddresses, fromAddresses, changeAddresses);
                aad.addAssetAmount(feeAssetID, zero, fee);
                const minSpendableErr = this.getMinimumSpendable(aad, asOf, undefined, undefined);
                if (typeof minSpendableErr === "undefined") {
                    ins = aad.getInputs();
                    outs = aad.getAllOutputs();
                }
                else {
                    throw minSpendableErr;
                }
            }
            const locktime = new bn_js_1.default(0);
            const UTx = new createsubnettx_1.CreateSubnetTx(networkID, blockchainID, outs, ins, memo, new outputs_1.SECPOwnerOutput(subnetOwnerAddresses, locktime, subnetOwnerThreshold));
            return new tx_1.UnsignedTx(UTx);
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
        else if (utxo instanceof utxos_1.StandardUTXO) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXR4b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL3V0eG9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFpQztBQUNqQyxvRUFBNEM7QUFDNUMsa0RBQXVCO0FBQ3ZCLHVDQUF3SjtBQUN4SixxQ0FBOEc7QUFDOUcsaUVBQXNEO0FBQ3RELDhDQUFtRTtBQUNuRSwyQ0FBa0Q7QUFDbEQsNkJBQWtDO0FBQ2xDLHFEQUFrRDtBQUNsRCxxREFBbUU7QUFDbkUscURBQWtEO0FBQ2xELGlEQUE4QztBQUM5QywwREFBdUY7QUFFdkYsaURBQWdFO0FBQ2hFLHFEQUFrRDtBQUNsRCw2REFBOEU7QUFDOUUsK0NBSytDO0FBRS9DOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVoRTs7R0FFRztBQUNILE1BQWEsSUFBSyxTQUFRLG9CQUFZO0lBQXRDOztRQUNZLGNBQVMsR0FBRyxNQUFNLENBQUM7UUFDbkIsWUFBTyxHQUFHLFNBQVMsQ0FBQztJQWtFaEMsQ0FBQztJQWhFQyx3QkFBd0I7SUFFeEIsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxNQUFNLEdBQUcsMkJBQWlCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCxVQUFVLENBQUMsS0FBYSxFQUFFLFNBQWlCLENBQUM7UUFD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Q0FDbEQsQ0FBQztJQUNKLENBQUM7Q0E0MEJGO0FBdDRCRCwwQkFzNEJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVBsYXRmb3JtVk0tVVRYT3NcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLyc7XG5pbXBvcnQgQmluVG9vbHMgZnJvbSAnLi4vLi4vdXRpbHMvYmludG9vbHMnO1xuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiO1xuaW1wb3J0IHsgQW1vdW50T3V0cHV0LCBTZWxlY3RPdXRwdXRDbGFzcywgVHJhbnNmZXJhYmxlT3V0cHV0LCBTRUNQT3duZXJPdXRwdXQsIFBhcnNlYWJsZU91dHB1dCwgU3Rha2VhYmxlTG9ja091dCwgU0VDUFRyYW5zZmVyT3V0cHV0IH0gZnJvbSAnLi9vdXRwdXRzJztcbmltcG9ydCB7IEFtb3VudElucHV0LCBTRUNQVHJhbnNmZXJJbnB1dCwgU3Rha2VhYmxlTG9ja0luLCBUcmFuc2ZlcmFibGVJbnB1dCwgUGFyc2VhYmxlSW5wdXQgfSBmcm9tICcuL2lucHV0cyc7XG5pbXBvcnQgeyBVbml4Tm93IH0gZnJvbSAnLi4vLi4vdXRpbHMvaGVscGVyZnVuY3Rpb25zJztcbmltcG9ydCB7IFN0YW5kYXJkVVRYTywgU3RhbmRhcmRVVFhPU2V0IH0gZnJvbSAnLi4vLi4vY29tbW9uL3V0eG9zJztcbmltcG9ydCB7IFBsYXRmb3JtVk1Db25zdGFudHMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBVbnNpZ25lZFR4IH0gZnJvbSAnLi90eCc7XG5pbXBvcnQgeyBFeHBvcnRUeCB9IGZyb20gJy4uL3BsYXRmb3Jtdm0vZXhwb3J0dHgnO1xuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCwgRGVmYXVsdHMgfSBmcm9tICcuLi8uLi91dGlscy9jb25zdGFudHMnO1xuaW1wb3J0IHsgSW1wb3J0VHggfSBmcm9tICcuLi9wbGF0Zm9ybXZtL2ltcG9ydHR4JztcbmltcG9ydCB7IEJhc2VUeCB9IGZyb20gJy4uL3BsYXRmb3Jtdm0vYmFzZXR4JztcbmltcG9ydCB7IFN0YW5kYXJkQXNzZXRBbW91bnREZXN0aW5hdGlvbiwgQXNzZXRBbW91bnQgfSBmcm9tICcuLi8uLi9jb21tb24vYXNzZXRhbW91bnQnO1xuaW1wb3J0IHsgT3V0cHV0IH0gZnJvbSAnLi4vLi4vY29tbW9uL291dHB1dCc7XG5pbXBvcnQgeyBBZGREZWxlZ2F0b3JUeCwgQWRkVmFsaWRhdG9yVHggfSBmcm9tICcuL3ZhbGlkYXRpb250eCc7XG5pbXBvcnQgeyBDcmVhdGVTdWJuZXRUeCB9IGZyb20gJy4vY3JlYXRlc3VibmV0dHgnO1xuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSAnLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvbic7XG5pbXBvcnQgeyBVVFhPRXJyb3IsIFxuICAgICAgICAgQWRkcmVzc0Vycm9yLCBcbiAgICAgICAgIEluc3VmZmljaWVudEZ1bmRzRXJyb3IsIFxuICAgICAgICAgVGhyZXNob2xkRXJyb3IsIFxuICAgICAgICAgRmVlQXNzZXRFcnJvcixcbiAgICAgICAgIFRpbWVFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzL2Vycm9ycyc7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIHNpbmdsZSBVVFhPLlxuICovXG5leHBvcnQgY2xhc3MgVVRYTyBleHRlbmRzIFN0YW5kYXJkVVRYTyB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlVUWE9cIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgdGhpcy5vdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhmaWVsZHNbXCJvdXRwdXRcIl1bXCJfdHlwZUlEXCJdKTtcbiAgICB0aGlzLm91dHB1dC5kZXNlcmlhbGl6ZShmaWVsZHNbXCJvdXRwdXRcIl0sIGVuY29kaW5nKTtcbiAgfVxuXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICB0aGlzLmNvZGVjSUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAyKTtcbiAgICBvZmZzZXQgKz0gMjtcbiAgICB0aGlzLnR4aWQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMik7XG4gICAgb2Zmc2V0ICs9IDMyO1xuICAgIHRoaXMub3V0cHV0aWR4ID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCk7XG4gICAgb2Zmc2V0ICs9IDQ7XG4gICAgdGhpcy5hc3NldElEID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMzIpO1xuICAgIG9mZnNldCArPSAzMjtcbiAgICBjb25zdCBvdXRwdXRpZDogbnVtYmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCkucmVhZFVJbnQzMkJFKDApO1xuICAgIG9mZnNldCArPSA0O1xuICAgIHRoaXMub3V0cHV0ID0gU2VsZWN0T3V0cHV0Q2xhc3Mob3V0cHV0aWQpO1xuICAgIHJldHVybiB0aGlzLm91dHB1dC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEgYmFzZS01OCBzdHJpbmcgY29udGFpbmluZyBhIFtbVVRYT11dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIFN0YW5kYXJkVVRYTyBpbiBieXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHNlcmlhbGl6ZWQgQSBiYXNlLTU4IHN0cmluZyBjb250YWluaW5nIGEgcmF3IFtbVVRYT11dXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsZW5ndGggb2YgdGhlIHJhdyBbW1VUWE9dXVxuICAgKlxuICAgKiBAcmVtYXJrc1xuICAgKiB1bmxpa2UgbW9zdCBmcm9tU3RyaW5ncywgaXQgZXhwZWN0cyB0aGUgc3RyaW5nIHRvIGJlIHNlcmlhbGl6ZWQgaW4gY2I1OCBmb3JtYXRcbiAgICovXG4gIGZyb21TdHJpbmcoc2VyaWFsaXplZDogc3RyaW5nKTogbnVtYmVyIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHJldHVybiB0aGlzLmZyb21CdWZmZXIoYmludG9vbHMuY2I1OERlY29kZShzZXJpYWxpemVkKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGJhc2UtNTggcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbVVRYT11dLlxuICAgKlxuICAgKiBAcmVtYXJrc1xuICAgKiB1bmxpa2UgbW9zdCB0b1N0cmluZ3MsIHRoaXMgcmV0dXJucyBpbiBjYjU4IHNlcmlhbGl6YXRpb24gZm9ybWF0XG4gICAqL1xuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgcmV0dXJuIGJpbnRvb2xzLmNiNThFbmNvZGUodGhpcy50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IHV0eG86IFVUWE8gPSBuZXcgVVRYTygpO1xuICAgIHV0eG8uZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpO1xuICAgIHJldHVybiB1dHhvIGFzIHRoaXM7XG4gIH1cblxuICBjcmVhdGUoXG4gICAgY29kZWNJRDogbnVtYmVyID0gUGxhdGZvcm1WTUNvbnN0YW50cy5MQVRFU1RDT0RFQyxcbiAgICB0eGlkOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgb3V0cHV0aWR4OiBCdWZmZXIgfCBudW1iZXIgPSB1bmRlZmluZWQsXG4gICAgYXNzZXRJRDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG91dHB1dDogT3V0cHV0ID0gdW5kZWZpbmVkKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBVVFhPKGNvZGVjSUQsIHR4aWQsIG91dHB1dGlkeCwgYXNzZXRJRCwgb3V0cHV0KSBhcyB0aGlzO1xuICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIEFzc2V0QW1vdW50RGVzdGluYXRpb24gZXh0ZW5kcyBTdGFuZGFyZEFzc2V0QW1vdW50RGVzdGluYXRpb248VHJhbnNmZXJhYmxlT3V0cHV0LCBUcmFuc2ZlcmFibGVJbnB1dD4geyB9XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgc2V0IG9mIFtbVVRYT11dcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFVUWE9TZXQgZXh0ZW5kcyBTdGFuZGFyZFVUWE9TZXQ8VVRYTz57XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlVUWE9TZXRcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgbGV0IHV0eG9zID0ge307XG4gICAgZm9yIChsZXQgdXR4b2lkIGluIGZpZWxkc1tcInV0eG9zXCJdKSB7XG4gICAgICBsZXQgdXR4b2lkQ2xlYW5lZDogc3RyaW5nID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKHV0eG9pZCwgZW5jb2RpbmcsIFwiYmFzZTU4XCIsIFwiYmFzZTU4XCIpO1xuICAgICAgdXR4b3NbdXR4b2lkQ2xlYW5lZF0gPSBuZXcgVVRYTygpO1xuICAgICAgdXR4b3NbdXR4b2lkQ2xlYW5lZF0uZGVzZXJpYWxpemUoZmllbGRzW1widXR4b3NcIl1bdXR4b2lkXSwgZW5jb2RpbmcpO1xuICAgIH1cbiAgICBsZXQgYWRkcmVzc1VUWE9zID0ge307XG4gICAgZm9yIChsZXQgYWRkcmVzcyBpbiBmaWVsZHNbXCJhZGRyZXNzVVRYT3NcIl0pIHtcbiAgICAgIGxldCBhZGRyZXNzQ2xlYW5lZDogc3RyaW5nID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKGFkZHJlc3MsIGVuY29kaW5nLCBcImNiNThcIiwgXCJoZXhcIik7XG4gICAgICBsZXQgdXR4b2JhbGFuY2UgPSB7fTtcbiAgICAgIGZvciAobGV0IHV0eG9pZCBpbiBmaWVsZHNbXCJhZGRyZXNzVVRYT3NcIl1bYWRkcmVzc10pIHtcbiAgICAgICAgbGV0IHV0eG9pZENsZWFuZWQ6IHN0cmluZyA9IHNlcmlhbGl6YXRpb24uZGVjb2Rlcih1dHhvaWQsIGVuY29kaW5nLCBcImJhc2U1OFwiLCBcImJhc2U1OFwiKVxuICAgICAgICB1dHhvYmFsYW5jZVt1dHhvaWRDbGVhbmVkXSA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJhZGRyZXNzVVRYT3NcIl1bYWRkcmVzc11bdXR4b2lkXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJOXCIpO1xuICAgICAgfVxuICAgICAgYWRkcmVzc1VUWE9zW2FkZHJlc3NDbGVhbmVkXSA9IHV0eG9iYWxhbmNlO1xuICAgIH1cbiAgICB0aGlzLnV0eG9zID0gdXR4b3M7XG4gICAgdGhpcy5hZGRyZXNzVVRYT3MgPSBhZGRyZXNzVVRYT3M7XG4gIH1cblxuICBwYXJzZVVUWE8odXR4bzogVVRYTyB8IHN0cmluZyk6IFVUWE8ge1xuICAgIGNvbnN0IHV0eG92YXI6IFVUWE8gPSBuZXcgVVRYTygpO1xuICAgIC8vIGZvcmNlIGEgY29weVxuICAgIGlmICh0eXBlb2YgdXR4byA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHV0eG92YXIuZnJvbUJ1ZmZlcihiaW50b29scy5jYjU4RGVjb2RlKHV0eG8pKTtcbiAgICB9IGVsc2UgaWYgKHV0eG8gaW5zdGFuY2VvZiBTdGFuZGFyZFVUWE8pIHtcbiAgICAgIHV0eG92YXIuZnJvbUJ1ZmZlcih1dHhvLnRvQnVmZmVyKCkpOyAvLyBmb3JjZXMgYSBjb3B5XG4gICAgfSBlbHNlIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgVVRYT0Vycm9yKFwiRXJyb3IgLSBVVFhPLnBhcnNlVVRYTzogdXR4byBwYXJhbWV0ZXIgaXMgbm90IGEgVVRYTyBvciBzdHJpbmdcIik7XG4gICAgfVxuICAgIHJldHVybiB1dHhvdmFyXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFVUWE9TZXQoKSBhcyB0aGlzO1xuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgY29uc3QgbmV3c2V0OiBVVFhPU2V0ID0gdGhpcy5jcmVhdGUoKTtcbiAgICBjb25zdCBhbGxVVFhPczogVVRYT1tdID0gdGhpcy5nZXRBbGxVVFhPcygpO1xuICAgIG5ld3NldC5hZGRBcnJheShhbGxVVFhPcylcbiAgICByZXR1cm4gbmV3c2V0IGFzIHRoaXM7XG4gIH1cblxuICBfZmVlQ2hlY2soZmVlOiBCTiwgZmVlQXNzZXRJRDogQnVmZmVyKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICh0eXBlb2YgZmVlICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICB0eXBlb2YgZmVlQXNzZXRJRCAhPT0gXCJ1bmRlZmluZWRcIiAmJlxuICAgICAgZmVlLmd0KG5ldyBCTigwKSkgJiYgZmVlQXNzZXRJRCBpbnN0YW5jZW9mIEJ1ZmZlclxuICAgICk7XG4gIH1cblxuICBnZXRDb25zdW1hYmxlVVhUTyA9IChhc09mOiBCTiA9IFVuaXhOb3coKSwgc3Rha2VhYmxlOiBib29sZWFuID0gZmFsc2UpOiBVVFhPW10gPT4ge1xuICAgIHJldHVybiB0aGlzLmdldEFsbFVUWE9zKCkuZmlsdGVyKCh1dHhvOiBVVFhPKSA9PiB7XG4gICAgICBpZiAoc3Rha2VhYmxlKSB7XG4gICAgICAgIC8vIHN0YWtlYWJsZSB0cmFuc2FjdGlvbnMgY2FuIGNvbnN1bWUgYW55IFVUWE8uXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgY29uc3Qgb3V0cHV0OiBPdXRwdXQgPSB1dHhvLmdldE91dHB1dCgpO1xuICAgICAgaWYgKCEob3V0cHV0IGluc3RhbmNlb2YgU3Rha2VhYmxlTG9ja091dCkpIHtcbiAgICAgICAgLy8gbm9uLXN0YWtlYWJsZSB0cmFuc2FjdGlvbnMgY2FuIGNvbnN1bWUgYW55IFVUWE8gdGhhdCBpc24ndCBsb2NrZWQuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgY29uc3Qgc3Rha2VhYmxlT3V0cHV0OiBTdGFrZWFibGVMb2NrT3V0ID0gb3V0cHV0IGFzIFN0YWtlYWJsZUxvY2tPdXQ7XG4gICAgICBpZiAoc3Rha2VhYmxlT3V0cHV0LmdldFN0YWtlYWJsZUxvY2t0aW1lKCkubHQoYXNPZikpIHtcbiAgICAgICAgLy8gSWYgdGhlIHN0YWtlYWJsZSBvdXRwdXRzIGxvY2t0aW1lIGhhcyBlbmRlZCwgdGhlbiB0aGlzIFVUWE8gY2FuIHN0aWxsXG4gICAgICAgIC8vIGJlIGNvbnN1bWVkIGJ5IGEgbm9uLXN0YWtlYWJsZSB0cmFuc2FjdGlvbi5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICAvLyBUaGlzIG91dHB1dCBpcyBsb2NrZWQgYW5kIGNhbid0IGJlIGNvbnN1bWVkIGJ5IGEgbm9uLXN0YWtlYWJsZVxuICAgICAgLy8gdHJhbnNhY3Rpb24uXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG4gIH1cblxuICBnZXRNaW5pbXVtU3BlbmRhYmxlID0gKFxuICAgIGFhZDogQXNzZXRBbW91bnREZXN0aW5hdGlvbixcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgICBsb2NrdGltZTogQk4gPSBuZXcgQk4oMCksXG4gICAgdGhyZXNob2xkOiBudW1iZXIgPSAxLFxuICAgIHN0YWtlYWJsZTogYm9vbGVhbiA9IGZhbHNlLFxuICApOiBFcnJvciA9PiB7XG4gICAgbGV0IHV0eG9BcnJheTogVVRYT1tdID0gdGhpcy5nZXRDb25zdW1hYmxlVVhUTyhhc09mLCBzdGFrZWFibGUpO1xuICAgIGxldCB0bXBVVFhPQXJyYXk6IFVUWE9bXSA9IFtdO1xuICAgIGlmKHN0YWtlYWJsZSkge1xuICAgICAgLy8gSWYgdGhpcyBpcyBhIHN0YWtlYWJsZSB0cmFuc2FjdGlvbiB0aGVuIGhhdmUgU3Rha2VhYmxlTG9ja091dCBjb21lIGJlZm9yZSBTRUNQVHJhbnNmZXJPdXRwdXRcbiAgICAgIC8vIHNvIHRoYXQgdXNlcnMgZmlyc3Qgc3Rha2UgbG9ja2VkIHRva2VucyBiZWZvcmUgc3Rha2luZyB1bmxvY2tlZCB0b2tlbnNcbiAgICAgIHV0eG9BcnJheS5mb3JFYWNoKCh1dHhvOiBVVFhPKSA9PiB7XG4gICAgICAgIC8vIFN0YWtlYWJsZUxvY2tPdXRzXG4gICAgICAgIGlmKHV0eG8uZ2V0T3V0cHV0KCkuZ2V0VHlwZUlEKCkgPT09IDIyKSB7XG4gICAgICAgICAgdG1wVVRYT0FycmF5LnB1c2godXR4byk7XG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIC8vIFNvcnQgdGhlIFN0YWtlYWJsZUxvY2tPdXRzIGJ5IFN0YWtlYWJsZUxvY2t0aW1lIHNvIHRoYXQgdGhlIGdyZWF0ZXN0IFN0YWtlYWJsZUxvY2t0aW1lIGFyZSBzcGVudCBmaXJzdFxuICAgICAgdG1wVVRYT0FycmF5LnNvcnQoKGE6IFVUWE8sIGI6IFVUWE8pID0+IHtcbiAgICAgICAgbGV0IHN0YWtlYWJsZUxvY2tPdXQxID0gYS5nZXRPdXRwdXQoKSBhcyBTdGFrZWFibGVMb2NrT3V0O1xuICAgICAgICBsZXQgc3Rha2VhYmxlTG9ja091dDIgPSBiLmdldE91dHB1dCgpIGFzIFN0YWtlYWJsZUxvY2tPdXQ7XG4gICAgICAgIHJldHVybiBzdGFrZWFibGVMb2NrT3V0Mi5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvTnVtYmVyKCkgLSBzdGFrZWFibGVMb2NrT3V0MS5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvTnVtYmVyKClcbiAgICAgIH0pXG5cbiAgICAgIHV0eG9BcnJheS5mb3JFYWNoKCh1dHhvOiBVVFhPKSA9PiB7XG4gICAgICAgIC8vIFNFQ1BUcmFuc2Zlck91dHB1dHNcbiAgICAgICAgaWYodXR4by5nZXRPdXRwdXQoKS5nZXRUeXBlSUQoKSA9PT0gNykge1xuICAgICAgICAgIHRtcFVUWE9BcnJheS5wdXNoKHV0eG8pO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgdXR4b0FycmF5ID0gdG1wVVRYT0FycmF5O1xuICAgIH1cblxuICAgIC8vIG91dHMgaXMgYSBtYXAgZnJvbSBhc3NldElEIHRvIGEgdHVwbGUgb2YgKGxvY2tlZFN0YWtlYWJsZSwgdW5sb2NrZWQpXG4gICAgLy8gd2hpY2ggYXJlIGFycmF5cyBvZiBvdXRwdXRzLlxuICAgIGNvbnN0IG91dHM6IG9iamVjdCA9IHt9O1xuXG4gICAgLy8gV2Ugb25seSBuZWVkIHRvIGl0ZXJhdGUgb3ZlciBVVFhPcyB1bnRpbCB3ZSBoYXZlIHNwZW50IHN1ZmZpY2llbnQgZnVuZHNcbiAgICAvLyB0byBtZXQgdGhlIHJlcXVlc3RlZCBhbW91bnRzLlxuICAgIHV0eG9BcnJheS5mb3JFYWNoKCh1dHhvOiBVVFhPLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICBjb25zdCBhc3NldElEOiBCdWZmZXIgPSB1dHhvLmdldEFzc2V0SUQoKTtcbiAgICAgIGNvbnN0IGFzc2V0S2V5OiBzdHJpbmcgPSBhc3NldElELnRvU3RyaW5nKFwiaGV4XCIpO1xuICAgICAgY29uc3QgZnJvbUFkZHJlc3NlczogQnVmZmVyW10gPSBhYWQuZ2V0U2VuZGVycygpO1xuICAgICAgY29uc3Qgb3V0cHV0OiBPdXRwdXQgPSB1dHhvLmdldE91dHB1dCgpO1xuICAgICAgaWYgKCEob3V0cHV0IGluc3RhbmNlb2YgQW1vdW50T3V0cHV0KSB8fCAhYWFkLmFzc2V0RXhpc3RzKGFzc2V0S2V5KSB8fCAhb3V0cHV0Lm1lZXRzVGhyZXNob2xkKGZyb21BZGRyZXNzZXMsIGFzT2YpKSB7XG4gICAgICAgIC8vIFdlIHNob3VsZCBvbmx5IHRyeSB0byBzcGVuZCBmdW5naWJsZSBhc3NldHMuXG4gICAgICAgIC8vIFdlIHNob3VsZCBvbmx5IHNwZW5kIHt7IGFzc2V0S2V5IH19LlxuICAgICAgICAvLyBXZSBuZWVkIHRvIGJlIGFibGUgdG8gc3BlbmQgdGhlIG91dHB1dC5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBhc3NldEFtb3VudDogQXNzZXRBbW91bnQgPSBhYWQuZ2V0QXNzZXRBbW91bnQoYXNzZXRLZXkpO1xuICAgICAgaWYgKGFzc2V0QW1vdW50LmlzRmluaXNoZWQoKSkge1xuICAgICAgICAvLyBXZSd2ZSBhbHJlYWR5IHNwZW50IHRoZSBuZWVkZWQgVVRYT3MgZm9yIHRoaXMgYXNzZXRJRC5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIShhc3NldEtleSBpbiBvdXRzKSkge1xuICAgICAgICAvLyBJZiB0aGlzIGlzIHRoZSBmaXJzdCB0aW1lIHNwZW5kaW5nIHRoaXMgYXNzZXRJRCwgd2UgbmVlZCB0b1xuICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBvdXRzIG9iamVjdCBjb3JyZWN0bHkuXG4gICAgICAgIG91dHNbYXNzZXRLZXldID0ge1xuICAgICAgICAgIGxvY2tlZFN0YWtlYWJsZTogW10sXG4gICAgICAgICAgdW5sb2NrZWQ6IFtdLFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBjb25zdCBhbW91bnRPdXRwdXQ6IEFtb3VudE91dHB1dCA9IG91dHB1dCBhcyBBbW91bnRPdXRwdXQ7XG4gICAgICAvLyBhbW91bnQgaXMgdGhlIGFtb3VudCBvZiBmdW5kcyBhdmFpbGFibGUgZnJvbSB0aGlzIFVUWE8uXG4gICAgICBjb25zdCBhbW91bnQgPSBhbW91bnRPdXRwdXQuZ2V0QW1vdW50KCk7XG5cbiAgICAgIC8vIFNldCB1cCB0aGUgU0VDUCBpbnB1dCB3aXRoIHRoZSBzYW1lIGFtb3VudCBhcyB0aGUgb3V0cHV0LlxuICAgICAgbGV0IGlucHV0OiBBbW91bnRJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChhbW91bnQpO1xuXG4gICAgICBsZXQgbG9ja2VkOiBib29sZWFuID0gZmFsc2U7XG4gICAgICBpZiAoYW1vdW50T3V0cHV0IGluc3RhbmNlb2YgU3Rha2VhYmxlTG9ja091dCkge1xuICAgICAgICBjb25zdCBzdGFrZWFibGVPdXRwdXQ6IFN0YWtlYWJsZUxvY2tPdXQgPSBhbW91bnRPdXRwdXQgYXMgU3Rha2VhYmxlTG9ja091dDtcbiAgICAgICAgY29uc3Qgc3Rha2VhYmxlTG9ja3RpbWU6IEJOID0gc3Rha2VhYmxlT3V0cHV0LmdldFN0YWtlYWJsZUxvY2t0aW1lKCk7XG5cbiAgICAgICAgaWYgKHN0YWtlYWJsZUxvY2t0aW1lLmd0KGFzT2YpKSB7XG4gICAgICAgICAgLy8gQWRkIGEgbmV3IGlucHV0IGFuZCBtYXJrIGl0IGFzIGJlaW5nIGxvY2tlZC5cbiAgICAgICAgICBpbnB1dCA9IG5ldyBTdGFrZWFibGVMb2NrSW4oXG4gICAgICAgICAgICBhbW91bnQsXG4gICAgICAgICAgICBzdGFrZWFibGVMb2NrdGltZSxcbiAgICAgICAgICAgIG5ldyBQYXJzZWFibGVJbnB1dChpbnB1dCksXG4gICAgICAgICAgKTtcblxuICAgICAgICAgIC8vIE1hcmsgdGhpcyBVVFhPIGFzIGhhdmluZyBiZWVuIHJlLWxvY2tlZC5cbiAgICAgICAgICBsb2NrZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGFzc2V0QW1vdW50LnNwZW5kQW1vdW50KGFtb3VudCwgbG9ja2VkKTtcbiAgICAgIGlmIChsb2NrZWQpIHtcbiAgICAgICAgLy8gVHJhY2sgdGhlIFVUWE8gYXMgbG9ja2VkLlxuICAgICAgICBvdXRzW2Fzc2V0S2V5XS5sb2NrZWRTdGFrZWFibGUucHVzaChhbW91bnRPdXRwdXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gVHJhY2sgdGhlIFVUWE8gYXMgdW5sb2NrZWQuXG4gICAgICAgIG91dHNbYXNzZXRLZXldLnVubG9ja2VkLnB1c2goYW1vdW50T3V0cHV0KTtcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IHRoZSBpbmRpY2VzIG9mIHRoZSBvdXRwdXRzIHRoYXQgc2hvdWxkIGJlIHVzZWQgdG8gYXV0aG9yaXplIHRoZVxuICAgICAgLy8gc3BlbmRpbmcgb2YgdGhpcyBpbnB1dC5cblxuICAgICAgLy8gVE9ETzogZ2V0U3BlbmRlcnMgc2hvdWxkIHJldHVybiBhbiBhcnJheSBvZiBpbmRpY2VzIHJhdGhlciB0aGFuIGFuXG4gICAgICAvLyBhcnJheSBvZiBhZGRyZXNzZXMuXG4gICAgICBjb25zdCBzcGVuZGVyczogQnVmZmVyW10gPSBhbW91bnRPdXRwdXQuZ2V0U3BlbmRlcnMoZnJvbUFkZHJlc3NlcywgYXNPZik7XG4gICAgICBzcGVuZGVycy5mb3JFYWNoKChzcGVuZGVyOiBCdWZmZXIpID0+IHtcbiAgICAgICAgY29uc3QgaWR4OiBudW1iZXIgPSBhbW91bnRPdXRwdXQuZ2V0QWRkcmVzc0lkeChzcGVuZGVyKTtcbiAgICAgICAgaWYgKGlkeCA9PT0gLTEpIHtcbiAgICAgICAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4sIHdoaWNoIGlzIHdoeSB0aGUgZXJyb3IgaXMgdGhyb3duIHJhdGhlclxuICAgICAgICAgIC8vIHRoYW4gYmVpbmcgcmV0dXJuZWQuIElmIHRoaXMgd2VyZSB0byBldmVyIGhhcHBlbiB0aGlzIHdvdWxkIGJlIGFuXG4gICAgICAgICAgLy8gZXJyb3IgaW4gdGhlIGludGVybmFsIGxvZ2ljIHJhdGhlciBoYXZpbmcgY2FsbGVkIHRoaXMgZnVuY3Rpb24gd2l0aFxuICAgICAgICAgIC8vIGludmFsaWQgYXJndW1lbnRzLlxuXG4gICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKCdFcnJvciAtIFVUWE9TZXQuZ2V0TWluaW11bVNwZW5kYWJsZTogbm8gc3VjaCAnXG4gICAgICAgICAgICArIGBhZGRyZXNzIGluIG91dHB1dDogJHtzcGVuZGVyfWApO1xuICAgICAgICB9XG4gICAgICAgIGlucHV0LmFkZFNpZ25hdHVyZUlkeChpZHgsIHNwZW5kZXIpO1xuICAgICAgfSlcblxuICAgICAgY29uc3QgdHhJRDogQnVmZmVyID0gdXR4by5nZXRUeElEKCk7XG4gICAgICBjb25zdCBvdXRwdXRJZHg6IEJ1ZmZlciA9IHV0eG8uZ2V0T3V0cHV0SWR4KCk7XG4gICAgICBjb25zdCB0cmFuc2ZlcklucHV0OiBUcmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBUcmFuc2ZlcmFibGVJbnB1dChcbiAgICAgICAgdHhJRCxcbiAgICAgICAgb3V0cHV0SWR4LFxuICAgICAgICBhc3NldElELFxuICAgICAgICBpbnB1dCxcbiAgICAgICk7XG4gICAgICBhYWQuYWRkSW5wdXQodHJhbnNmZXJJbnB1dCk7XG4gICAgfSk7XG5cbiAgICBpZiAoIWFhZC5jYW5Db21wbGV0ZSgpKSB7XG4gICAgICAvLyBBZnRlciBydW5uaW5nIHRocm91Z2ggYWxsIHRoZSBVVFhPcywgd2Ugc3RpbGwgd2VyZW4ndCBhYmxlIHRvIGdldCBhbGxcbiAgICAgIC8vIHRoZSBuZWNlc3NhcnkgZnVuZHMsIHNvIHRoaXMgdHJhbnNhY3Rpb24gY2FuJ3QgYmUgbWFkZS5cbiAgICAgIHJldHVybiBuZXcgSW5zdWZmaWNpZW50RnVuZHNFcnJvcignRXJyb3IgLSBVVFhPU2V0LmdldE1pbmltdW1TcGVuZGFibGU6IGluc3VmZmljaWVudCAnXG4gICAgICAgICsgJ2Z1bmRzIHRvIGNyZWF0ZSB0aGUgdHJhbnNhY3Rpb24nKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBXZSBzaG91bGQgc2VwYXJhdGUgdGhlIGFib3ZlIGZ1bmN0aW9uYWxpdHkgaW50byBhIHNpbmdsZSBmdW5jdGlvblxuICAgIC8vIHRoYXQganVzdCBzZWxlY3RzIHRoZSBVVFhPcyB0byBjb25zdW1lLlxuXG4gICAgY29uc3QgemVybzogQk4gPSBuZXcgQk4oMCk7XG5cbiAgICAvLyBhc3NldEFtb3VudHMgaXMgYW4gYXJyYXkgb2YgYXNzZXQgZGVzY3JpcHRpb25zIGFuZCBob3cgbXVjaCBpcyBsZWZ0IHRvXG4gICAgLy8gc3BlbmQgZm9yIHRoZW0uXG4gICAgY29uc3QgYXNzZXRBbW91bnRzOiBBc3NldEFtb3VudFtdID0gYWFkLmdldEFtb3VudHMoKTtcbiAgICBhc3NldEFtb3VudHMuZm9yRWFjaCgoYXNzZXRBbW91bnQ6IEFzc2V0QW1vdW50KSA9PiB7XG4gICAgICAvLyBjaGFuZ2UgaXMgdGhlIGFtb3VudCB0aGF0IHNob3VsZCBiZSByZXR1cm5lZCBiYWNrIHRvIHRoZSBzb3VyY2Ugb2YgdGhlXG4gICAgICAvLyBmdW5kcy5cbiAgICAgIGNvbnN0IGNoYW5nZTogQk4gPSBhc3NldEFtb3VudC5nZXRDaGFuZ2UoKTtcbiAgICAgIC8vIGlzU3Rha2VhYmxlTG9ja0NoYW5nZSBpcyBpZiB0aGUgY2hhbmdlIGlzIGxvY2tlZCBvciBub3QuXG4gICAgICBjb25zdCBpc1N0YWtlYWJsZUxvY2tDaGFuZ2U6IGJvb2xlYW4gPSBhc3NldEFtb3VudC5nZXRTdGFrZWFibGVMb2NrQ2hhbmdlKCk7XG4gICAgICAvLyBsb2NrZWRDaGFuZ2UgaXMgdGhlIGFtb3VudCBvZiBsb2NrZWQgY2hhbmdlIHRoYXQgc2hvdWxkIGJlIHJldHVybmVkIHRvXG4gICAgICAvLyB0aGUgc2VuZGVyXG4gICAgICBjb25zdCBsb2NrZWRDaGFuZ2U6IEJOID0gaXNTdGFrZWFibGVMb2NrQ2hhbmdlID8gY2hhbmdlIDogemVyby5jbG9uZSgpO1xuXG4gICAgICBjb25zdCBhc3NldElEOiBCdWZmZXIgPSBhc3NldEFtb3VudC5nZXRBc3NldElEKCk7XG4gICAgICBjb25zdCBhc3NldEtleTogc3RyaW5nID0gYXNzZXRBbW91bnQuZ2V0QXNzZXRJRFN0cmluZygpO1xuICAgICAgY29uc3QgbG9ja2VkT3V0cHV0czogU3Rha2VhYmxlTG9ja091dFtdID0gb3V0c1thc3NldEtleV0ubG9ja2VkU3Rha2VhYmxlO1xuICAgICAgbG9ja2VkT3V0cHV0cy5mb3JFYWNoKChsb2NrZWRPdXRwdXQ6IFN0YWtlYWJsZUxvY2tPdXQsIGk6IG51bWJlcikgPT4ge1xuICAgICAgICBjb25zdCBzdGFrZWFibGVMb2NrdGltZTogQk4gPSBsb2NrZWRPdXRwdXQuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKTtcbiAgICAgICAgY29uc3QgcGFyc2VhYmxlT3V0cHV0OiBQYXJzZWFibGVPdXRwdXQgPSBsb2NrZWRPdXRwdXQuZ2V0VHJhbnNmZXJhYmxlT3V0cHV0KCk7XG5cbiAgICAgICAgLy8gV2Uga25vdyB0aGF0IHBhcnNlYWJsZU91dHB1dCBjb250YWlucyBhbiBBbW91bnRPdXRwdXQgYmVjYXVzZSB0aGVcbiAgICAgICAgLy8gZmlyc3QgbG9vcCBmaWx0ZXJzIGZvciBmdW5naWJsZSBhc3NldHMuXG4gICAgICAgIGNvbnN0IG91dHB1dDogQW1vdW50T3V0cHV0ID0gcGFyc2VhYmxlT3V0cHV0LmdldE91dHB1dCgpIGFzIEFtb3VudE91dHB1dDtcblxuICAgICAgICBsZXQgb3V0cHV0QW1vdW50UmVtYWluaW5nOiBCTiA9IG91dHB1dC5nZXRBbW91bnQoKTtcbiAgICAgICAgLy8gVGhlIG9ubHkgb3V0cHV0IHRoYXQgY291bGQgZ2VuZXJhdGUgY2hhbmdlIGlzIHRoZSBsYXN0IG91dHB1dC5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBhbnkgZnVydGhlciBVVFhPcyB3b3VsZG4ndCBoYXZlIG5lZWRlZCB0byBiZSBzcGVudC5cbiAgICAgICAgaWYgKGkgPT0gbG9ja2VkT3V0cHV0cy5sZW5ndGggLSAxICYmIGxvY2tlZENoYW5nZS5ndCh6ZXJvKSkge1xuICAgICAgICAgIC8vIHVwZGF0ZSBvdXRwdXRBbW91bnRSZW1haW5pbmcgdG8gbm8gbG9uZ2VyIGhvbGQgdGhlIGNoYW5nZSB0aGF0IHdlXG4gICAgICAgICAgLy8gYXJlIHJldHVybmluZy5cbiAgICAgICAgICBvdXRwdXRBbW91bnRSZW1haW5pbmcgPSBvdXRwdXRBbW91bnRSZW1haW5pbmcuc3ViKGxvY2tlZENoYW5nZSk7XG4gICAgICAgICAgLy8gQ3JlYXRlIHRoZSBpbm5lciBvdXRwdXQuXG4gICAgICAgICAgY29uc3QgbmV3Q2hhbmdlT3V0cHV0OiBBbW91bnRPdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhcbiAgICAgICAgICAgIG91dHB1dC5nZXRPdXRwdXRJRCgpLFxuICAgICAgICAgICAgbG9ja2VkQ2hhbmdlLFxuICAgICAgICAgICAgb3V0cHV0LmdldEFkZHJlc3NlcygpLFxuICAgICAgICAgICAgb3V0cHV0LmdldExvY2t0aW1lKCksXG4gICAgICAgICAgICBvdXRwdXQuZ2V0VGhyZXNob2xkKCksXG4gICAgICAgICAgKSBhcyBBbW91bnRPdXRwdXQ7XG4gICAgICAgICAgLy8gV3JhcCB0aGUgaW5uZXIgb3V0cHV0IGluIHRoZSBTdGFrZWFibGVMb2NrT3V0IHdyYXBwZXIuXG4gICAgICAgICAgbGV0IG5ld0xvY2tlZENoYW5nZU91dHB1dDogU3Rha2VhYmxlTG9ja091dCA9IFNlbGVjdE91dHB1dENsYXNzKFxuICAgICAgICAgICAgbG9ja2VkT3V0cHV0LmdldE91dHB1dElEKCksXG4gICAgICAgICAgICBsb2NrZWRDaGFuZ2UsXG4gICAgICAgICAgICBvdXRwdXQuZ2V0QWRkcmVzc2VzKCksXG4gICAgICAgICAgICBvdXRwdXQuZ2V0TG9ja3RpbWUoKSxcbiAgICAgICAgICAgIG91dHB1dC5nZXRUaHJlc2hvbGQoKSxcbiAgICAgICAgICAgIHN0YWtlYWJsZUxvY2t0aW1lLFxuICAgICAgICAgICAgbmV3IFBhcnNlYWJsZU91dHB1dChuZXdDaGFuZ2VPdXRwdXQpLFxuICAgICAgICAgICkgYXMgU3Rha2VhYmxlTG9ja091dDtcbiAgICAgICAgICBjb25zdCB0cmFuc2Zlck91dHB1dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChhc3NldElELCBuZXdMb2NrZWRDaGFuZ2VPdXRwdXQpO1xuICAgICAgICAgIGFhZC5hZGRDaGFuZ2UodHJhbnNmZXJPdXRwdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2Uga25vdyB0aGF0IG91dHB1dEFtb3VudFJlbWFpbmluZyA+IDAuIE90aGVyd2lzZSwgd2Ugd291bGQgbmV2ZXJcbiAgICAgICAgLy8gaGF2ZSBjb25zdW1lZCB0aGlzIFVUWE8sIGFzIGl0IHdvdWxkIGJlIG9ubHkgY2hhbmdlLlxuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgaW5uZXIgb3V0cHV0LlxuICAgICAgICBjb25zdCBuZXdPdXRwdXQ6IEFtb3VudE91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKFxuICAgICAgICAgIG91dHB1dC5nZXRPdXRwdXRJRCgpLFxuICAgICAgICAgIG91dHB1dEFtb3VudFJlbWFpbmluZyxcbiAgICAgICAgICBvdXRwdXQuZ2V0QWRkcmVzc2VzKCksXG4gICAgICAgICAgb3V0cHV0LmdldExvY2t0aW1lKCksXG4gICAgICAgICAgb3V0cHV0LmdldFRocmVzaG9sZCgpLFxuICAgICAgICApIGFzIEFtb3VudE91dHB1dDtcbiAgICAgICAgLy8gV3JhcCB0aGUgaW5uZXIgb3V0cHV0IGluIHRoZSBTdGFrZWFibGVMb2NrT3V0IHdyYXBwZXIuXG4gICAgICAgIGNvbnN0IG5ld0xvY2tlZE91dHB1dDogU3Rha2VhYmxlTG9ja091dCA9IFNlbGVjdE91dHB1dENsYXNzKFxuICAgICAgICAgIGxvY2tlZE91dHB1dC5nZXRPdXRwdXRJRCgpLFxuICAgICAgICAgIG91dHB1dEFtb3VudFJlbWFpbmluZyxcbiAgICAgICAgICBvdXRwdXQuZ2V0QWRkcmVzc2VzKCksXG4gICAgICAgICAgb3V0cHV0LmdldExvY2t0aW1lKCksXG4gICAgICAgICAgb3V0cHV0LmdldFRocmVzaG9sZCgpLFxuICAgICAgICAgIHN0YWtlYWJsZUxvY2t0aW1lLFxuICAgICAgICAgIG5ldyBQYXJzZWFibGVPdXRwdXQobmV3T3V0cHV0KSxcbiAgICAgICAgKSBhcyBTdGFrZWFibGVMb2NrT3V0O1xuICAgICAgICBjb25zdCB0cmFuc2Zlck91dHB1dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChhc3NldElELCBuZXdMb2NrZWRPdXRwdXQpO1xuICAgICAgICBhYWQuYWRkT3V0cHV0KHRyYW5zZmVyT3V0cHV0KTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyB1bmxvY2tlZENoYW5nZSBpcyB0aGUgYW1vdW50IG9mIHVubG9ja2VkIGNoYW5nZSB0aGF0IHNob3VsZCBiZSByZXR1cm5lZFxuICAgICAgLy8gdG8gdGhlIHNlbmRlclxuICAgICAgY29uc3QgdW5sb2NrZWRDaGFuZ2U6IEJOID0gaXNTdGFrZWFibGVMb2NrQ2hhbmdlID8gemVyby5jbG9uZSgpIDogY2hhbmdlO1xuICAgICAgaWYgKHVubG9ja2VkQ2hhbmdlLmd0KHplcm8pKSB7XG4gICAgICAgIGNvbnN0IG5ld0NoYW5nZU91dHB1dDogQW1vdW50T3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChcbiAgICAgICAgICB1bmxvY2tlZENoYW5nZSxcbiAgICAgICAgICBhYWQuZ2V0Q2hhbmdlQWRkcmVzc2VzKCksXG4gICAgICAgICAgemVyby5jbG9uZSgpLCAvLyBtYWtlIHN1cmUgdGhhdCB3ZSBkb24ndCBsb2NrIHRoZSBjaGFuZ2Ugb3V0cHV0LlxuICAgICAgICAgIDEsIC8vIG9ubHkgcmVxdWlyZSBvbmUgb2YgdGhlIGNoYW5nZXMgYWRkcmVzc2VzIHRvIHNwZW5kIHRoaXMgb3V0cHV0LlxuICAgICAgICApIGFzIEFtb3VudE91dHB1dDtcbiAgICAgICAgY29uc3QgdHJhbnNmZXJPdXRwdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYXNzZXRJRCwgbmV3Q2hhbmdlT3V0cHV0KTtcbiAgICAgICAgYWFkLmFkZENoYW5nZSh0cmFuc2Zlck91dHB1dCk7XG4gICAgICB9XG5cbiAgICAgIC8vIHRvdGFsQW1vdW50U3BlbnQgaXMgdGhlIHRvdGFsIGFtb3VudCBvZiB0b2tlbnMgY29uc3VtZWQuXG4gICAgICBjb25zdCB0b3RhbEFtb3VudFNwZW50OiBCTiA9IGFzc2V0QW1vdW50LmdldFNwZW50KCk7XG4gICAgICAvLyBzdGFrZWFibGVMb2NrZWRBbW91bnQgaXMgdGhlIHRvdGFsIGFtb3VudCBvZiBsb2NrZWQgdG9rZW5zIGNvbnN1bWVkLlxuICAgICAgY29uc3Qgc3Rha2VhYmxlTG9ja2VkQW1vdW50OiBCTiA9IGFzc2V0QW1vdW50LmdldFN0YWtlYWJsZUxvY2tTcGVudCgpO1xuICAgICAgLy8gdG90YWxVbmxvY2tlZFNwZW50IGlzIHRoZSB0b3RhbCBhbW91bnQgb2YgdW5sb2NrZWQgdG9rZW5zIGNvbnN1bWVkLlxuICAgICAgY29uc3QgdG90YWxVbmxvY2tlZFNwZW50OiBCTiA9IHRvdGFsQW1vdW50U3BlbnQuc3ViKHN0YWtlYWJsZUxvY2tlZEFtb3VudCk7XG4gICAgICAvLyBhbW91bnRCdXJudCBpcyB0aGUgYW1vdW50IG9mIHVubG9ja2VkIHRva2VucyB0aGF0IG11c3QgYmUgYnVybi5cbiAgICAgIGNvbnN0IGFtb3VudEJ1cm50OiBCTiA9IGFzc2V0QW1vdW50LmdldEJ1cm4oKTtcbiAgICAgIC8vIHRvdGFsVW5sb2NrZWRBdmFpbGFibGUgaXMgdGhlIHRvdGFsIGFtb3VudCBvZiB1bmxvY2tlZCB0b2tlbnMgYXZhaWxhYmxlXG4gICAgICAvLyB0byBiZSBwcm9kdWNlZC5cbiAgICAgIGNvbnN0IHRvdGFsVW5sb2NrZWRBdmFpbGFibGU6IEJOID0gdG90YWxVbmxvY2tlZFNwZW50LnN1YihhbW91bnRCdXJudCk7XG4gICAgICAvLyB1bmxvY2tlZEFtb3VudCBpcyB0aGUgYW1vdW50IG9mIHVubG9ja2VkIHRva2VucyB0aGF0IHNob3VsZCBiZSBzZW50LlxuICAgICAgY29uc3QgdW5sb2NrZWRBbW91bnQ6IEJOID0gdG90YWxVbmxvY2tlZEF2YWlsYWJsZS5zdWIodW5sb2NrZWRDaGFuZ2UpO1xuICAgICAgaWYgKHVubG9ja2VkQW1vdW50Lmd0KHplcm8pKSB7XG4gICAgICAgIGNvbnN0IG5ld091dHB1dDogQW1vdW50T3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChcbiAgICAgICAgICB1bmxvY2tlZEFtb3VudCxcbiAgICAgICAgICBhYWQuZ2V0RGVzdGluYXRpb25zKCksXG4gICAgICAgICAgbG9ja3RpbWUsXG4gICAgICAgICAgdGhyZXNob2xkLFxuICAgICAgICApIGFzIEFtb3VudE91dHB1dDtcbiAgICAgICAgY29uc3QgdHJhbnNmZXJPdXRwdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYXNzZXRJRCwgbmV3T3V0cHV0KTtcbiAgICAgICAgYWFkLmFkZE91dHB1dCh0cmFuc2Zlck91dHB1dCk7XG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW4gW1tVbnNpZ25lZFR4XV0gd3JhcHBpbmcgYSBbW0Jhc2VUeF1dLiBGb3IgbW9yZSBncmFudWxhciBjb250cm9sLCB5b3UgbWF5IGNyZWF0ZSB5b3VyIG93blxuICAgKiBbW1Vuc2lnbmVkVHhdXSB3cmFwcGluZyBhIFtbQmFzZVR4XV0gbWFudWFsbHkgKHdpdGggdGhlaXIgY29ycmVzcG9uZGluZyBbW1RyYW5zZmVyYWJsZUlucHV0XV1zIGFuZCBbW1RyYW5zZmVyYWJsZU91dHB1dF1dcykuXG4gICAqXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgVGhlIG51bWJlciByZXByZXNlbnRpbmcgTmV0d29ya0lEIG9mIHRoZSBub2RlXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgVGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgQmxvY2tjaGFpbklEIGZvciB0aGUgdHJhbnNhY3Rpb25cbiAgICogQHBhcmFtIGFtb3VudCBUaGUgYW1vdW50IG9mIHRoZSBhc3NldCB0byBiZSBzcGVudCBpbiBpdHMgc21hbGxlc3QgZGVub21pbmF0aW9uLCByZXByZXNlbnRlZCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfS5cbiAgICogQHBhcmFtIGFzc2V0SUQge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb2YgdGhlIGFzc2V0IElEIGZvciB0aGUgVVRYT1xuICAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0byBzZW5kIHRoZSBmdW5kc1xuICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3Mge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBPcHRpb25hbC4gVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPcy4gRGVmYXVsdDogdG9BZGRyZXNzZXNcbiAgICogQHBhcmFtIGZlZSBPcHRpb25hbC4gVGhlIGFtb3VudCBvZiBmZWVzIHRvIGJ1cm4gaW4gaXRzIHNtYWxsZXN0IGRlbm9taW5hdGlvbiwgcmVwcmVzZW50ZWQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGZlZUFzc2V0SUQgT3B0aW9uYWwuIFRoZSBhc3NldElEIG9mIHRoZSBmZWVzIGJlaW5nIGJ1cm5lZC4gRGVmYXVsdDogYXNzZXRJRFxuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbC4gQ29udGFpbnMgYXJiaXRyYXJ5IGRhdGEsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gbG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0c1xuICAgKiBAcGFyYW0gdGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgVVRYT1xuICAgKiBcbiAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gY3JlYXRlZCBmcm9tIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVycy5cbiAgICpcbiAgICovXG4gIGJ1aWxkQmFzZVR4ID0gKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyLFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyLFxuICAgIGFtb3VudDogQk4sXG4gICAgYXNzZXRJRDogQnVmZmVyLFxuICAgIHRvQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBmcm9tQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IEJ1ZmZlcltdID0gdW5kZWZpbmVkLFxuICAgIGZlZTogQk4gPSB1bmRlZmluZWQsXG4gICAgZmVlQXNzZXRJRDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgICBsb2NrdGltZTogQk4gPSBuZXcgQk4oMCksXG4gICAgdGhyZXNob2xkOiBudW1iZXIgPSAxXG4gICk6IFVuc2lnbmVkVHggPT4ge1xuXG4gICAgaWYgKHRocmVzaG9sZCA+IHRvQWRkcmVzc2VzLmxlbmd0aCkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBUaHJlc2hvbGRFcnJvcihcIkVycm9yIC0gVVRYT1NldC5idWlsZEJhc2VUeDogdGhyZXNob2xkIGlzIGdyZWF0ZXIgdGhhbiBudW1iZXIgb2YgYWRkcmVzc2VzXCIpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY2hhbmdlQWRkcmVzc2VzID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBjaGFuZ2VBZGRyZXNzZXMgPSB0b0FkZHJlc3NlcztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGZlZUFzc2V0SUQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGZlZUFzc2V0SUQgPSBhc3NldElEO1xuICAgIH1cblxuICAgIGNvbnN0IHplcm86IEJOID0gbmV3IEJOKDApO1xuXG4gICAgaWYgKGFtb3VudC5lcSh6ZXJvKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBjb25zdCBhYWQ6IEFzc2V0QW1vdW50RGVzdGluYXRpb24gPSBuZXcgQXNzZXRBbW91bnREZXN0aW5hdGlvbih0b0FkZHJlc3NlcywgZnJvbUFkZHJlc3NlcywgY2hhbmdlQWRkcmVzc2VzKTtcbiAgICBpZiAoYXNzZXRJRC50b1N0cmluZyhcImhleFwiKSA9PT0gZmVlQXNzZXRJRC50b1N0cmluZyhcImhleFwiKSkge1xuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGFzc2V0SUQsIGFtb3VudCwgZmVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGFzc2V0SUQsIGFtb3VudCwgemVybyk7XG4gICAgICBpZiAodGhpcy5fZmVlQ2hlY2soZmVlLCBmZWVBc3NldElEKSkge1xuICAgICAgICBhYWQuYWRkQXNzZXRBbW91bnQoZmVlQXNzZXRJRCwgemVybywgZmVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cbiAgICBsZXQgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXTtcblxuICAgIGNvbnN0IG1pblNwZW5kYWJsZUVycjogRXJyb3IgPSB0aGlzLmdldE1pbmltdW1TcGVuZGFibGUoYWFkLCBhc09mLCBsb2NrdGltZSwgdGhyZXNob2xkKTtcbiAgICBpZiAodHlwZW9mIG1pblNwZW5kYWJsZUVyciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaW5zID0gYWFkLmdldElucHV0cygpO1xuICAgICAgb3V0cyA9IGFhZC5nZXRBbGxPdXRwdXRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG1pblNwZW5kYWJsZUVycjtcbiAgICB9XG5cbiAgICBjb25zdCBiYXNlVHg6IEJhc2VUeCA9IG5ldyBCYXNlVHgobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbyk7XG4gICAgcmV0dXJuIG5ldyBVbnNpZ25lZFR4KGJhc2VUeCk7XG5cbiAgfTtcblxuICAvKipcbiAgICAqIENyZWF0ZXMgYW4gdW5zaWduZWQgSW1wb3J0VHggdHJhbnNhY3Rpb24uXG4gICAgKlxuICAgICogQHBhcmFtIG5ldHdvcmtJRCBUaGUgbnVtYmVyIHJlcHJlc2VudGluZyBOZXR3b3JrSUQgb2YgdGhlIG5vZGVcbiAgICAqIEBwYXJhbSBibG9ja2NoYWluSUQgVGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgQmxvY2tjaGFpbklEIGZvciB0aGUgdHJhbnNhY3Rpb25cbiAgICAqIEBwYXJhbSB0b0FkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRvIHNlbmQgdGhlIGZ1bmRzXG4gICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3Mge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgT3B0aW9uYWwuIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3MuIERlZmF1bHQ6IHRvQWRkcmVzc2VzXG4gICAgKiBAcGFyYW0gaW1wb3J0SW5zIEFuIGFycmF5IG9mIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXMgYmVpbmcgaW1wb3J0ZWRcbiAgICAqIEBwYXJhbSBzb3VyY2VDaGFpbiBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgY2hhaW5pZCB3aGVyZSB0aGUgaW1wb3J0cyBhcmUgY29taW5nIGZyb20uXG4gICAgKiBAcGFyYW0gZmVlIE9wdGlvbmFsLiBUaGUgYW1vdW50IG9mIGZlZXMgdG8gYnVybiBpbiBpdHMgc21hbGxlc3QgZGVub21pbmF0aW9uLCByZXByZXNlbnRlZCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfS4gRmVlIHdpbGwgY29tZSBmcm9tIHRoZSBpbnB1dHMgZmlyc3QsIGlmIHRoZXkgY2FuLlxuICAgICogQHBhcmFtIGZlZUFzc2V0SUQgT3B0aW9uYWwuIFRoZSBhc3NldElEIG9mIHRoZSBmZWVzIGJlaW5nIGJ1cm5lZC4gXG4gICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBvdXRwdXRzXG4gICAgKiBAcGFyYW0gdGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgVVRYT1xuICAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gY3JlYXRlZCBmcm9tIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVycy5cbiAgICAqXG4gICAgKi9cbiAgYnVpbGRJbXBvcnRUeCA9IChcbiAgICBuZXR3b3JrSUQ6IG51bWJlcixcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlcixcbiAgICB0b0FkZHJlc3NlczogQnVmZmVyW10sXG4gICAgZnJvbUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBhdG9taWNzOiBVVFhPW10sXG4gICAgc291cmNlQ2hhaW46IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBmZWU6IEJOID0gdW5kZWZpbmVkLFxuICAgIGZlZUFzc2V0SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBVbml4Tm93KCksXG4gICAgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDApLFxuICAgIHRocmVzaG9sZDogbnVtYmVyID0gMVxuICApOiBVbnNpZ25lZFR4ID0+IHtcbiAgICBjb25zdCB6ZXJvOiBCTiA9IG5ldyBCTigwKTtcbiAgICBsZXQgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cbiAgICBsZXQgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXTtcbiAgICBpZiAodHlwZW9mIGZlZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZmVlID0gemVyby5jbG9uZSgpO1xuICAgIH1cblxuICAgIGNvbnN0IGltcG9ydEluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IFtdO1xuICAgIGxldCBmZWVwYWlkOiBCTiA9IG5ldyBCTigwKTtcbiAgICBsZXQgZmVlQXNzZXRTdHI6IHN0cmluZyA9IGZlZUFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIik7XG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGF0b21pY3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHV0eG86IFVUWE8gPSBhdG9taWNzW2ldO1xuICAgICAgY29uc3QgYXNzZXRJRDogQnVmZmVyID0gdXR4by5nZXRBc3NldElEKCk7XG4gICAgICBjb25zdCBvdXRwdXQ6IEFtb3VudE91dHB1dCA9IHV0eG8uZ2V0T3V0cHV0KCkgYXMgQW1vdW50T3V0cHV0O1xuICAgICAgbGV0IGFtdDogQk4gPSBvdXRwdXQuZ2V0QW1vdW50KCkuY2xvbmUoKTtcblxuICAgICAgbGV0IGluZmVlYW1vdW50ID0gYW10LmNsb25lKCk7XG4gICAgICBsZXQgYXNzZXRTdHI6IHN0cmluZyA9IGFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIik7XG4gICAgICBpZiAoXG4gICAgICAgIHR5cGVvZiBmZWVBc3NldElEICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICAgIGZlZS5ndCh6ZXJvKSAmJlxuICAgICAgICBmZWVwYWlkLmx0KGZlZSkgJiZcbiAgICAgICAgYXNzZXRTdHIgPT09IGZlZUFzc2V0U3RyXG4gICAgICApIHtcbiAgICAgICAgZmVlcGFpZCA9IGZlZXBhaWQuYWRkKGluZmVlYW1vdW50KTtcbiAgICAgICAgaWYgKGZlZXBhaWQuZ3RlKGZlZSkpIHtcbiAgICAgICAgICBpbmZlZWFtb3VudCA9IGZlZXBhaWQuc3ViKGZlZSk7XG4gICAgICAgICAgZmVlcGFpZCA9IGZlZS5jbG9uZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluZmVlYW1vdW50ID0gemVyby5jbG9uZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHR4aWQ6IEJ1ZmZlciA9IHV0eG8uZ2V0VHhJRCgpO1xuICAgICAgY29uc3Qgb3V0cHV0aWR4OiBCdWZmZXIgPSB1dHhvLmdldE91dHB1dElkeCgpO1xuICAgICAgY29uc3QgaW5wdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KGFtdCk7XG4gICAgICBjb25zdCB4ZmVyaW46IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KHR4aWQsIG91dHB1dGlkeCwgYXNzZXRJRCwgaW5wdXQpO1xuICAgICAgY29uc3QgZnJvbTogQnVmZmVyW10gPSBvdXRwdXQuZ2V0QWRkcmVzc2VzKClcbiAgICAgIGNvbnN0IHNwZW5kZXJzOiBCdWZmZXJbXSA9IG91dHB1dC5nZXRTcGVuZGVycyhmcm9tLCBhc09mKTtcbiAgICAgIGZvciAobGV0IGo6IG51bWJlciA9IDA7IGogPCBzcGVuZGVycy5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBpZHg6IG51bWJlciA9IG91dHB1dC5nZXRBZGRyZXNzSWR4KHNwZW5kZXJzW2pdKTtcbiAgICAgICAgaWYgKGlkeCA9PT0gLTEpIHtcbiAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgIHRocm93IG5ldyBBZGRyZXNzRXJyb3IoJ0Vycm9yIC0gVVRYT1NldC5idWlsZEltcG9ydFR4OiBubyBzdWNoICdcbiAgICAgICAgICAgICsgYGFkZHJlc3MgaW4gb3V0cHV0OiAke3NwZW5kZXJzW2pdfWApO1xuICAgICAgICB9XG4gICAgICAgIHhmZXJpbi5nZXRJbnB1dCgpLmFkZFNpZ25hdHVyZUlkeChpZHgsIHNwZW5kZXJzW2pdKTtcbiAgICAgIH1cbiAgICAgIGltcG9ydElucy5wdXNoKHhmZXJpbik7XG4gICAgICAvL2FkZCBleHRyYSBvdXRwdXRzIGZvciBlYWNoIGFtb3VudCAoY2FsY3VsYXRlZCBmcm9tIHRoZSBpbXBvcnRlZCBpbnB1dHMpLCBtaW51cyBmZWVzXG4gICAgICBpZiAoaW5mZWVhbW91bnQuZ3QoemVybykpIHtcbiAgICAgICAgY29uc3Qgc3BlbmRvdXQ6IEFtb3VudE91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKG91dHB1dC5nZXRPdXRwdXRJRCgpLFxuICAgICAgICAgIGluZmVlYW1vdW50LCB0b0FkZHJlc3NlcywgbG9ja3RpbWUsIHRocmVzaG9sZCkgYXMgQW1vdW50T3V0cHV0O1xuICAgICAgICBjb25zdCB4ZmVyb3V0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KGFzc2V0SUQsIHNwZW5kb3V0KTtcbiAgICAgICAgb3V0cy5wdXNoKHhmZXJvdXQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGdldCByZW1haW5pbmcgZmVlcyBmcm9tIHRoZSBwcm92aWRlZCBhZGRyZXNzZXNcbiAgICBsZXQgZmVlUmVtYWluaW5nOiBCTiA9IGZlZS5zdWIoZmVlcGFpZCk7XG4gICAgaWYgKGZlZVJlbWFpbmluZy5ndCh6ZXJvKSAmJiB0aGlzLl9mZWVDaGVjayhmZWVSZW1haW5pbmcsIGZlZUFzc2V0SUQpKSB7XG4gICAgICBjb25zdCBhYWQ6IEFzc2V0QW1vdW50RGVzdGluYXRpb24gPSBuZXcgQXNzZXRBbW91bnREZXN0aW5hdGlvbih0b0FkZHJlc3NlcywgZnJvbUFkZHJlc3NlcywgY2hhbmdlQWRkcmVzc2VzKTtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChmZWVBc3NldElELCB6ZXJvLCBmZWVSZW1haW5pbmcpO1xuICAgICAgY29uc3QgbWluU3BlbmRhYmxlRXJyOiBFcnJvciA9IHRoaXMuZ2V0TWluaW11bVNwZW5kYWJsZShhYWQsIGFzT2YsIGxvY2t0aW1lLCB0aHJlc2hvbGQpO1xuICAgICAgaWYgKHR5cGVvZiBtaW5TcGVuZGFibGVFcnIgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaW5zID0gYWFkLmdldElucHV0cygpO1xuICAgICAgICBvdXRzID0gYWFkLmdldEFsbE91dHB1dHMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG1pblNwZW5kYWJsZUVycjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBpbXBvcnRUeDogSW1wb3J0VHggPSBuZXcgSW1wb3J0VHgobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbywgc291cmNlQ2hhaW4sIGltcG9ydElucyk7XG4gICAgcmV0dXJuIG5ldyBVbnNpZ25lZFR4KGltcG9ydFR4KTtcbiAgfTtcblxuICAvKipcbiAgICAqIENyZWF0ZXMgYW4gdW5zaWduZWQgRXhwb3J0VHggdHJhbnNhY3Rpb24uIFxuICAgICpcbiAgICAqIEBwYXJhbSBuZXR3b3JrSUQgVGhlIG51bWJlciByZXByZXNlbnRpbmcgTmV0d29ya0lEIG9mIHRoZSBub2RlXG4gICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIFRoZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRpbmcgdGhlIEJsb2NrY2hhaW5JRCBmb3IgdGhlIHRyYW5zYWN0aW9uXG4gICAgKiBAcGFyYW0gYW1vdW50IFRoZSBhbW91bnQgYmVpbmcgZXhwb3J0ZWQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgICogQHBhcmFtIGF2YXhBc3NldElEIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9mIHRoZSBhc3NldCBJRCBmb3IgQVZBWFxuICAgICogQHBhcmFtIHRvQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gcmVjaWV2ZXMgdGhlIEFWQVhcbiAgICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gb3ducyB0aGUgQVZBWFxuICAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIGdldHMgdGhlIGNoYW5nZSBsZWZ0b3ZlciBvZiB0aGUgQVZBWFxuICAgICogQHBhcmFtIGRlc3RpbmF0aW9uQ2hhaW4gT3B0aW9uYWwuIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBjaGFpbmlkIHdoZXJlIHRvIHNlbmQgdGhlIGFzc2V0LlxuICAgICogQHBhcmFtIGZlZSBPcHRpb25hbC4gVGhlIGFtb3VudCBvZiBmZWVzIHRvIGJ1cm4gaW4gaXRzIHNtYWxsZXN0IGRlbm9taW5hdGlvbiwgcmVwcmVzZW50ZWQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICAqIEBwYXJhbSBmZWVBc3NldElEIE9wdGlvbmFsLiBUaGUgYXNzZXRJRCBvZiB0aGUgZmVlcyBiZWluZyBidXJuZWQuIFxuICAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAgKiBAcGFyYW0gbG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0c1xuICAgICogQHBhcmFtIHRocmVzaG9sZCBPcHRpb25hbC4gVGhlIG51bWJlciBvZiBzaWduYXR1cmVzIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBmdW5kcyBpbiB0aGUgcmVzdWx0YW50IFVUWE9cbiAgICAqIFxuICAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gY3JlYXRlZCBmcm9tIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVycy5cbiAgICAqXG4gICAgKi9cbiAgYnVpbGRFeHBvcnRUeCA9IChcbiAgICBuZXR3b3JrSUQ6IG51bWJlcixcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlcixcbiAgICBhbW91bnQ6IEJOLFxuICAgIGF2YXhBc3NldElEOiBCdWZmZXIsIC8vIFRPRE86IHJlbmFtZSB0aGlzIHRvIGFtb3VudEFzc2V0SURcbiAgICB0b0FkZHJlc3NlczogQnVmZmVyW10sXG4gICAgZnJvbUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBCdWZmZXJbXSA9IHVuZGVmaW5lZCxcbiAgICBkZXN0aW5hdGlvbkNoYWluOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgZmVlOiBCTiA9IHVuZGVmaW5lZCxcbiAgICBmZWVBc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgIGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKSxcbiAgICB0aHJlc2hvbGQ6IG51bWJlciA9IDEsXG4gICk6IFVuc2lnbmVkVHggPT4ge1xuICAgIGxldCBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXVxuICAgIGxldCBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IFtdXG4gICAgbGV0IGV4cG9ydG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW107XG5cbiAgICBpZiAodHlwZW9mIGNoYW5nZUFkZHJlc3NlcyA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgY2hhbmdlQWRkcmVzc2VzID0gdG9BZGRyZXNzZXM7XG4gICAgfVxuXG4gICAgY29uc3QgemVybzogQk4gPSBuZXcgQk4oMCk7XG5cbiAgICBpZiAoYW1vdW50LmVxKHplcm8pKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZmVlQXNzZXRJRCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgZmVlQXNzZXRJRCA9IGF2YXhBc3NldElEO1xuICAgIH0gZWxzZSBpZiAoZmVlQXNzZXRJRC50b1N0cmluZyhcImhleFwiKSAhPT0gYXZheEFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgRmVlQXNzZXRFcnJvcignRXJyb3IgLSBVVFhPU2V0LmJ1aWxkRXhwb3J0VHg6ICdcbiAgICAgICAgKyBgZmVlQXNzZXRJRCBtdXN0IG1hdGNoIGF2YXhBc3NldElEYCk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBkZXN0aW5hdGlvbkNoYWluID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBkZXN0aW5hdGlvbkNoYWluID0gYmludG9vbHMuY2I1OERlY29kZShEZWZhdWx0cy5uZXR3b3JrW25ldHdvcmtJRF0uWFtcImJsb2NrY2hhaW5JRFwiXSk7XG4gICAgfVxuXG4gICAgY29uc3QgYWFkOiBBc3NldEFtb3VudERlc3RpbmF0aW9uID0gbmV3IEFzc2V0QW1vdW50RGVzdGluYXRpb24odG9BZGRyZXNzZXMsIGZyb21BZGRyZXNzZXMsIGNoYW5nZUFkZHJlc3Nlcyk7XG4gICAgaWYgKGF2YXhBc3NldElELnRvU3RyaW5nKFwiaGV4XCIpID09PSBmZWVBc3NldElELnRvU3RyaW5nKFwiaGV4XCIpKSB7XG4gICAgICBhYWQuYWRkQXNzZXRBbW91bnQoYXZheEFzc2V0SUQsIGFtb3VudCwgZmVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGF2YXhBc3NldElELCBhbW91bnQsIHplcm8pO1xuICAgICAgaWYgKHRoaXMuX2ZlZUNoZWNrKGZlZSwgZmVlQXNzZXRJRCkpIHtcbiAgICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGZlZUFzc2V0SUQsIHplcm8sIGZlZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbWluU3BlbmRhYmxlRXJyOiBFcnJvciA9IHRoaXMuZ2V0TWluaW11bVNwZW5kYWJsZShhYWQsIGFzT2YsIGxvY2t0aW1lLCB0aHJlc2hvbGQpO1xuICAgIGlmICh0eXBlb2YgbWluU3BlbmRhYmxlRXJyID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpbnMgPSBhYWQuZ2V0SW5wdXRzKCk7XG4gICAgICBvdXRzID0gYWFkLmdldENoYW5nZU91dHB1dHMoKTtcbiAgICAgIGV4cG9ydG91dHMgPSBhYWQuZ2V0T3V0cHV0cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBtaW5TcGVuZGFibGVFcnI7XG4gICAgfVxuXG4gICAgY29uc3QgZXhwb3J0VHg6IEV4cG9ydFR4ID0gbmV3IEV4cG9ydFR4KG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMsIG1lbW8sIGRlc3RpbmF0aW9uQ2hhaW4sIGV4cG9ydG91dHMpO1xuXG4gICAgcmV0dXJuIG5ldyBVbnNpZ25lZFR4KGV4cG9ydFR4KTtcbiAgfTtcblxuXG4gIC8qKlxuICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBbW0FkZFN1Ym5ldFZhbGlkYXRvclR4XV0gdHJhbnNhY3Rpb24uXG4gICpcbiAgKiBAcGFyYW0gbmV0d29ya0lEIE5ldHdvcmtpZCwgW1tEZWZhdWx0TmV0d29ya0lEXV1cbiAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIEJsb2NrY2hhaW5pZCwgZGVmYXVsdCB1bmRlZmluZWRcbiAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIHBheXMgdGhlIGZlZXMgaW4gQVZBWFxuICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBnZXRzIHRoZSBjaGFuZ2UgbGVmdG92ZXIgZnJvbSB0aGUgZmVlIHBheW1lbnRcbiAgKiBAcGFyYW0gbm9kZUlEIFRoZSBub2RlIElEIG9mIHRoZSB2YWxpZGF0b3IgYmVpbmcgYWRkZWQuXG4gICogQHBhcmFtIHN0YXJ0VGltZSBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdGFydHMgdmFsaWRhdGluZyB0aGUgUHJpbWFyeSBOZXR3b3JrLlxuICAqIEBwYXJhbSBlbmRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgKiBAcGFyYW0gd2VpZ2h0IFRoZSBhbW91bnQgb2Ygd2VpZ2h0IGZvciB0aGlzIHN1Ym5ldCB2YWxpZGF0b3IuXG4gICogQHBhcmFtIGZlZSBPcHRpb25hbC4gVGhlIGFtb3VudCBvZiBmZWVzIHRvIGJ1cm4gaW4gaXRzIHNtYWxsZXN0IGRlbm9taW5hdGlvbiwgcmVwcmVzZW50ZWQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgKiBAcGFyYW0gZmVlQXNzZXRJRCBPcHRpb25hbC4gVGhlIGFzc2V0SUQgb2YgdGhlIGZlZXMgYmVpbmcgYnVybmVkLiBcbiAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICogQHBhcmFtIGxvY2t0aW1lIE9wdGlvbmFsLiBUaGUgbG9ja3RpbWUgZmllbGQgY3JlYXRlZCBpbiB0aGUgcmVzdWx0aW5nIG91dHB1dHNcbiAgKiBAcGFyYW0gdGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgVVRYT1xuICAqIFxuICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICovXG5cbiAgLyogbXVzdCBpbXBsZW1lbnQgbGF0ZXIgb25jZSB0aGUgdHJhbnNhY3Rpb24gZm9ybWF0IHNpZ25pbmcgcHJvY2VzcyBpcyBjbGVhcmVyXG4gIGJ1aWxkQWRkU3VibmV0VmFsaWRhdG9yVHggPSAoXG4gICAgbmV0d29ya0lEOm51bWJlciA9IERlZmF1bHROZXR3b3JrSUQsXG4gICAgYmxvY2tjaGFpbklEOkJ1ZmZlcixcbiAgICBmcm9tQWRkcmVzc2VzOkJ1ZmZlcltdLFxuICAgIGNoYW5nZUFkZHJlc3NlczpCdWZmZXJbXSxcbiAgICBub2RlSUQ6QnVmZmVyLCBcbiAgICBzdGFydFRpbWU6Qk4sIFxuICAgIGVuZFRpbWU6Qk4sXG4gICAgd2VpZ2h0OkJOLFxuICAgIGZlZTpCTiA9IHVuZGVmaW5lZCxcbiAgICBmZWVBc3NldElEOkJ1ZmZlciA9IHVuZGVmaW5lZCwgXG4gICAgbWVtbzpCdWZmZXIgPSB1bmRlZmluZWQsIFxuICAgIGFzT2Y6Qk4gPSBVbml4Tm93KClcbiAgKTpVbnNpZ25lZFR4ID0+IHtcbiAgICBsZXQgaW5zOlRyYW5zZmVyYWJsZUlucHV0W10gPSBbXTtcbiAgICBsZXQgb3V0czpUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IFtdO1xuICAgIC8vbGV0IHN0YWtlT3V0czpUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IFtdO1xuICAgIFxuICAgIGNvbnN0IHplcm86Qk4gPSBuZXcgQk4oMCk7XG4gICAgY29uc3Qgbm93OkJOID0gVW5peE5vdygpO1xuICAgIGlmIChzdGFydFRpbWUubHQobm93KSB8fCBlbmRUaW1lLmx0ZShzdGFydFRpbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVVFhPU2V0LmJ1aWxkQWRkU3VibmV0VmFsaWRhdG9yVHggLS0gc3RhcnRUaW1lIG11c3QgYmUgaW4gdGhlIGZ1dHVyZSBhbmQgZW5kVGltZSBtdXN0IGNvbWUgYWZ0ZXIgc3RhcnRUaW1lXCIpO1xuICAgIH1cbiAgIFxuICAgIC8vIE5vdCBpbXBsZW1lbnRlZDogRmVlcyBjYW4gYmUgcGFpZCBmcm9tIGltcG9ydEluc1xuICAgIGlmKHRoaXMuX2ZlZUNoZWNrKGZlZSwgZmVlQXNzZXRJRCkpIHtcbiAgICAgIGNvbnN0IGFhZDpBc3NldEFtb3VudERlc3RpbmF0aW9uID0gbmV3IEFzc2V0QW1vdW50RGVzdGluYXRpb24oZnJvbUFkZHJlc3NlcywgZnJvbUFkZHJlc3NlcywgY2hhbmdlQWRkcmVzc2VzKTtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChmZWVBc3NldElELCB6ZXJvLCBmZWUpO1xuICAgICAgY29uc3Qgc3VjY2VzczpFcnJvciA9IHRoaXMuZ2V0TWluaW11bVNwZW5kYWJsZShhYWQsIGFzT2YpO1xuICAgICAgaWYodHlwZW9mIHN1Y2Nlc3MgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaW5zID0gYWFkLmdldElucHV0cygpO1xuICAgICAgICBvdXRzID0gYWFkLmdldEFsbE91dHB1dHMoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IHN1Y2Nlc3M7XG4gICAgICB9XG4gICAgfVxuICAgXG4gICAgY29uc3QgVVR4OkFkZFN1Ym5ldFZhbGlkYXRvclR4ID0gbmV3IEFkZFN1Ym5ldFZhbGlkYXRvclR4KG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMsIG1lbW8sIG5vZGVJRCwgc3RhcnRUaW1lLCBlbmRUaW1lLCB3ZWlnaHQpO1xuICAgIHJldHVybiBuZXcgVW5zaWduZWRUeChVVHgpO1xuICB9XG4gICovXG5cbiAgLyoqXG4gICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIFtbQWRkRGVsZWdhdG9yVHhdXSB0cmFuc2FjdGlvbi5cbiAgKlxuICAqIEBwYXJhbSBuZXR3b3JrSUQgTmV0d29ya2lkLCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAqIEBwYXJhbSBibG9ja2NoYWluSUQgQmxvY2tjaGFpbmlkLCBkZWZhdWx0IHVuZGVmaW5lZFxuICAqIEBwYXJhbSBhdmF4QXNzZXRJRCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgYXNzZXQgSUQgZm9yIEFWQVhcbiAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlY2lldmVzIHRoZSBzdGFrZSBhdCB0aGUgZW5kIG9mIHRoZSBzdGFraW5nIHBlcmlvZFxuICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gcGF5cyB0aGUgZmVlcyBhbmQgdGhlIHN0YWtlXG4gICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIGdldHMgdGhlIGNoYW5nZSBsZWZ0b3ZlciBmcm9tIHRoZSBzdGFraW5nIHBheW1lbnRcbiAgKiBAcGFyYW0gbm9kZUlEIFRoZSBub2RlIElEIG9mIHRoZSB2YWxpZGF0b3IgYmVpbmcgYWRkZWQuXG4gICogQHBhcmFtIHN0YXJ0VGltZSBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdGFydHMgdmFsaWRhdGluZyB0aGUgUHJpbWFyeSBOZXR3b3JrLlxuICAqIEBwYXJhbSBlbmRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgKiBAcGFyYW0gc3Rha2VBbW91bnQgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBmb3IgdGhlIGFtb3VudCBvZiBzdGFrZSB0byBiZSBkZWxlZ2F0ZWQgaW4gbkFWQVguXG4gICogQHBhcmFtIHJld2FyZExvY2t0aW1lIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgcmV3YXJkIG91dHB1dHNcbiAgKiBAcGFyYW0gcmV3YXJkVGhyZXNob2xkIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCByZXdhcmQgVVRYT1xuICAqIEBwYXJhbSByZXdhcmRBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGUgdmFsaWRhdG9yIHJld2FyZCBnb2VzLlxuICAqIEBwYXJhbSBmZWUgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgZmVlcyB0byBidXJuIGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICogQHBhcmFtIGZlZUFzc2V0SUQgT3B0aW9uYWwuIFRoZSBhc3NldElEIG9mIHRoZSBmZWVzIGJlaW5nIGJ1cm5lZC4gXG4gICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAqIFxuICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICovXG4gIGJ1aWxkQWRkRGVsZWdhdG9yVHggPSAoXG4gICAgbmV0d29ya0lEOiBudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELFxuICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyLFxuICAgIGF2YXhBc3NldElEOiBCdWZmZXIsXG4gICAgdG9BZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgIGZyb21BZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgIGNoYW5nZUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgbm9kZUlEOiBCdWZmZXIsXG4gICAgc3RhcnRUaW1lOiBCTixcbiAgICBlbmRUaW1lOiBCTixcbiAgICBzdGFrZUFtb3VudDogQk4sXG4gICAgcmV3YXJkTG9ja3RpbWU6IEJOLFxuICAgIHJld2FyZFRocmVzaG9sZDogbnVtYmVyLFxuICAgIHJld2FyZEFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgZmVlOiBCTiA9IHVuZGVmaW5lZCxcbiAgICBmZWVBc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICApOiBVbnNpZ25lZFR4ID0+IHtcbiAgICBsZXQgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cbiAgICBsZXQgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXVxuICAgIGxldCBzdGFrZU91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW107XG5cbiAgICBjb25zdCB6ZXJvOiBCTiA9IG5ldyBCTigwKTtcbiAgICBjb25zdCBub3c6IEJOID0gVW5peE5vdygpO1xuICAgIGlmIChzdGFydFRpbWUubHQobm93KSB8fCBlbmRUaW1lLmx0ZShzdGFydFRpbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVGltZUVycm9yKFwiVVRYT1NldC5idWlsZEFkZERlbGVnYXRvclR4IC0tIHN0YXJ0VGltZSBtdXN0IGJlIGluIHRoZSBmdXR1cmUgYW5kIGVuZFRpbWUgbXVzdCBjb21lIGFmdGVyIHN0YXJ0VGltZVwiKTtcbiAgICB9XG5cbiAgICBjb25zdCBhYWQ6IEFzc2V0QW1vdW50RGVzdGluYXRpb24gPSBuZXcgQXNzZXRBbW91bnREZXN0aW5hdGlvbih0b0FkZHJlc3NlcywgZnJvbUFkZHJlc3NlcywgY2hhbmdlQWRkcmVzc2VzKTtcbiAgICBpZiAoYXZheEFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikgPT09IGZlZUFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikpIHtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChhdmF4QXNzZXRJRCwgc3Rha2VBbW91bnQsIGZlZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChhdmF4QXNzZXRJRCwgc3Rha2VBbW91bnQsIHplcm8pO1xuICAgICAgaWYgKHRoaXMuX2ZlZUNoZWNrKGZlZSwgZmVlQXNzZXRJRCkpIHtcbiAgICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGZlZUFzc2V0SUQsIHplcm8sIGZlZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbWluU3BlbmRhYmxlRXJyOiBFcnJvciA9IHRoaXMuZ2V0TWluaW11bVNwZW5kYWJsZShhYWQsIGFzT2YsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0cnVlKTtcbiAgICBpZiAodHlwZW9mIG1pblNwZW5kYWJsZUVyciA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaW5zID0gYWFkLmdldElucHV0cygpO1xuICAgICAgb3V0cyA9IGFhZC5nZXRDaGFuZ2VPdXRwdXRzKCk7XG4gICAgICBzdGFrZU91dHMgPSBhYWQuZ2V0T3V0cHV0cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBtaW5TcGVuZGFibGVFcnI7XG4gICAgfVxuXG4gICAgY29uc3QgcmV3YXJkT3V0cHV0T3duZXJzOiBTRUNQT3duZXJPdXRwdXQgPSBuZXcgU0VDUE93bmVyT3V0cHV0KHJld2FyZEFkZHJlc3NlcywgcmV3YXJkTG9ja3RpbWUsIHJld2FyZFRocmVzaG9sZCk7XG5cbiAgICBjb25zdCBVVHg6IEFkZERlbGVnYXRvclR4ID0gbmV3IEFkZERlbGVnYXRvclR4KG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMsIG1lbW8sIG5vZGVJRCwgc3RhcnRUaW1lLCBlbmRUaW1lLCBzdGFrZUFtb3VudCwgc3Rha2VPdXRzLCBuZXcgUGFyc2VhYmxlT3V0cHV0KHJld2FyZE91dHB1dE93bmVycykpO1xuICAgIHJldHVybiBuZXcgVW5zaWduZWRUeChVVHgpO1xuICB9XG5cbiAgLyoqXG4gICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgW1tBZGRWYWxpZGF0b3JUeF1dIHRyYW5zYWN0aW9uLlxuICAgICpcbiAgICAqIEBwYXJhbSBuZXR3b3JrSUQgTmV0d29ya0lELCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgICogQHBhcmFtIGJsb2NrY2hhaW5JRCBCbG9ja2NoYWluSUQsIGRlZmF1bHQgdW5kZWZpbmVkXG4gICAgKiBAcGFyYW0gYXZheEFzc2V0SUQge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb2YgdGhlIGFzc2V0IElEIGZvciBBVkFYXG4gICAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlY2lldmVzIHRoZSBzdGFrZSBhdCB0aGUgZW5kIG9mIHRoZSBzdGFraW5nIHBlcmlvZFxuICAgICogQHBhcmFtIGZyb21BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBwYXlzIHRoZSBmZWVzIGFuZCB0aGUgc3Rha2VcbiAgICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBnZXRzIHRoZSBjaGFuZ2UgbGVmdG92ZXIgZnJvbSB0aGUgc3Rha2luZyBwYXltZW50XG4gICAgKiBAcGFyYW0gbm9kZUlEIFRoZSBub2RlIElEIG9mIHRoZSB2YWxpZGF0b3IgYmVpbmcgYWRkZWQuXG4gICAgKiBAcGFyYW0gc3RhcnRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0YXJ0cyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAgKiBAcGFyYW0gZW5kVGltZSBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdG9wcyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsgKGFuZCBzdGFrZWQgQVZBWCBpcyByZXR1cm5lZCkuXG4gICAgKiBAcGFyYW0gc3Rha2VBbW91bnQgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBmb3IgdGhlIGFtb3VudCBvZiBzdGFrZSB0byBiZSBkZWxlZ2F0ZWQgaW4gbkFWQVguXG4gICAgKiBAcGFyYW0gcmV3YXJkTG9ja3RpbWUgVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyByZXdhcmQgb3V0cHV0c1xuICAgICogQHBhcmFtIHJld2FyZFRocmVzaG9sZCBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgcmV3YXJkIFVUWE9cbiAgICAqIEBwYXJhbSByZXdhcmRBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGUgdmFsaWRhdG9yIHJld2FyZCBnb2VzLlxuICAgICogQHBhcmFtIGRlbGVnYXRpb25GZWUgQSBudW1iZXIgZm9yIHRoZSBwZXJjZW50YWdlIG9mIHJld2FyZCB0byBiZSBnaXZlbiB0byB0aGUgdmFsaWRhdG9yIHdoZW4gc29tZW9uZSBkZWxlZ2F0ZXMgdG8gdGhlbS4gTXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDEwMC4gXG4gICAgKiBAcGFyYW0gbWluU3Rha2UgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSByZXByZXNlbnRpbmcgdGhlIG1pbmltdW0gc3Rha2UgcmVxdWlyZWQgdG8gdmFsaWRhdGUgb24gdGhpcyBuZXR3b3JrLlxuICAgICogQHBhcmFtIGZlZSBPcHRpb25hbC4gVGhlIGFtb3VudCBvZiBmZWVzIHRvIGJ1cm4gaW4gaXRzIHNtYWxsZXN0IGRlbm9taW5hdGlvbiwgcmVwcmVzZW50ZWQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICAqIEBwYXJhbSBmZWVBc3NldElEIE9wdGlvbmFsLiBUaGUgYXNzZXRJRCBvZiB0aGUgZmVlcyBiZWluZyBidXJuZWQuIFxuICAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAgKiBcbiAgICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICAgKi9cbiAgYnVpbGRBZGRWYWxpZGF0b3JUeCA9IChcbiAgICBuZXR3b3JrSUQ6IG51bWJlciA9IERlZmF1bHROZXR3b3JrSUQsXG4gICAgYmxvY2tjaGFpbklEOiBCdWZmZXIsXG4gICAgYXZheEFzc2V0SUQ6IEJ1ZmZlcixcbiAgICB0b0FkZHJlc3NlczogQnVmZmVyW10sXG4gICAgZnJvbUFkZHJlc3NlczogQnVmZmVyW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBub2RlSUQ6IEJ1ZmZlcixcbiAgICBzdGFydFRpbWU6IEJOLFxuICAgIGVuZFRpbWU6IEJOLFxuICAgIHN0YWtlQW1vdW50OiBCTixcbiAgICByZXdhcmRMb2NrdGltZTogQk4sXG4gICAgcmV3YXJkVGhyZXNob2xkOiBudW1iZXIsXG4gICAgcmV3YXJkQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBkZWxlZ2F0aW9uRmVlOiBudW1iZXIsXG4gICAgZmVlOiBCTiA9IHVuZGVmaW5lZCxcbiAgICBmZWVBc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICApOiBVbnNpZ25lZFR4ID0+IHtcbiAgICBsZXQgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cbiAgICBsZXQgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXVxuICAgIGxldCBzdGFrZU91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW107XG5cbiAgICBjb25zdCB6ZXJvOiBCTiA9IG5ldyBCTigwKTtcbiAgICBjb25zdCBub3c6IEJOID0gVW5peE5vdygpO1xuICAgIGlmIChzdGFydFRpbWUubHQobm93KSB8fCBlbmRUaW1lLmx0ZShzdGFydFRpbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVGltZUVycm9yKFwiVVRYT1NldC5idWlsZEFkZFZhbGlkYXRvclR4IC0tIHN0YXJ0VGltZSBtdXN0IGJlIGluIHRoZSBmdXR1cmUgYW5kIGVuZFRpbWUgbXVzdCBjb21lIGFmdGVyIHN0YXJ0VGltZVwiKTtcbiAgICB9XG5cbiAgICBpZiAoZGVsZWdhdGlvbkZlZSA+IDEwMCB8fCBkZWxlZ2F0aW9uRmVlIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IFRpbWVFcnJvcihcIlVUWE9TZXQuYnVpbGRBZGRWYWxpZGF0b3JUeCAtLSBzdGFydFRpbWUgbXVzdCBiZSBpbiB0aGUgcmFuZ2Ugb2YgMCB0byAxMDAsIGluY2x1c2l2ZWx5XCIpO1xuICAgIH1cblxuICAgIGNvbnN0IGFhZDogQXNzZXRBbW91bnREZXN0aW5hdGlvbiA9IG5ldyBBc3NldEFtb3VudERlc3RpbmF0aW9uKHRvQWRkcmVzc2VzLCBmcm9tQWRkcmVzc2VzLCBjaGFuZ2VBZGRyZXNzZXMpO1xuICAgIGlmIChhdmF4QXNzZXRJRC50b1N0cmluZyhcImhleFwiKSA9PT0gZmVlQXNzZXRJRC50b1N0cmluZyhcImhleFwiKSkge1xuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGF2YXhBc3NldElELCBzdGFrZUFtb3VudCwgZmVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYWFkLmFkZEFzc2V0QW1vdW50KGF2YXhBc3NldElELCBzdGFrZUFtb3VudCwgemVybyk7XG4gICAgICBpZiAodGhpcy5fZmVlQ2hlY2soZmVlLCBmZWVBc3NldElEKSkge1xuICAgICAgICBhYWQuYWRkQXNzZXRBbW91bnQoZmVlQXNzZXRJRCwgemVybywgZmVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBtaW5TcGVuZGFibGVFcnI6IEVycm9yID0gdGhpcy5nZXRNaW5pbXVtU3BlbmRhYmxlKGFhZCwgYXNPZiwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHRydWUpO1xuICAgIGlmICh0eXBlb2YgbWluU3BlbmRhYmxlRXJyID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpbnMgPSBhYWQuZ2V0SW5wdXRzKCk7XG4gICAgICBvdXRzID0gYWFkLmdldENoYW5nZU91dHB1dHMoKTtcbiAgICAgIHN0YWtlT3V0cyA9IGFhZC5nZXRPdXRwdXRzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG1pblNwZW5kYWJsZUVycjtcbiAgICB9XG5cbiAgICBjb25zdCByZXdhcmRPdXRwdXRPd25lcnM6IFNFQ1BPd25lck91dHB1dCA9IG5ldyBTRUNQT3duZXJPdXRwdXQocmV3YXJkQWRkcmVzc2VzLCByZXdhcmRMb2NrdGltZSwgcmV3YXJkVGhyZXNob2xkKTtcblxuICAgIGNvbnN0IFVUeDogQWRkVmFsaWRhdG9yVHggPSBuZXcgQWRkVmFsaWRhdG9yVHgobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbywgbm9kZUlELCBzdGFydFRpbWUsIGVuZFRpbWUsIHN0YWtlQW1vdW50LCBzdGFrZU91dHMsIG5ldyBQYXJzZWFibGVPdXRwdXQocmV3YXJkT3V0cHV0T3duZXJzKSwgZGVsZWdhdGlvbkZlZSk7XG4gICAgcmV0dXJuIG5ldyBVbnNpZ25lZFR4KFVUeCk7XG4gIH1cblxuICAvKipcbiAgICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBbW0NyZWF0ZVN1Ym5ldFR4XV0gdHJhbnNhY3Rpb24uXG4gICAgKlxuICAgICogQHBhcmFtIG5ldHdvcmtJRCBOZXR3b3JraWQsIFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIEJsb2NrY2hhaW5pZCwgZGVmYXVsdCB1bmRlZmluZWRcbiAgICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBmdW5kcyBmcm9tIHRoZSBVVFhPcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zLlxuICAgICogQHBhcmFtIHN1Ym5ldE93bmVyQWRkcmVzc2VzIEFuIGFycmF5IG9mIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgYWRkcmVzc2VzIHRvIGFkZCB0byBhIHN1Ym5ldFxuICAgICogQHBhcmFtIHN1Ym5ldE93bmVyVGhyZXNob2xkIFRoZSBudW1iZXIgb2Ygb3duZXJzJ3Mgc2lnbmF0dXJlcyByZXF1aXJlZCB0byBhZGQgYSB2YWxpZGF0b3IgdG8gdGhlIG5ldHdvcmtcbiAgICAqIEBwYXJhbSBmZWUgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgZmVlcyB0byBidXJuIGluIGl0cyBzbWFsbGVzdCBkZW5vbWluYXRpb24sIHJlcHJlc2VudGVkIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAgKiBAcGFyYW0gZmVlQXNzZXRJRCBPcHRpb25hbC4gVGhlIGFzc2V0SUQgb2YgdGhlIGZlZXMgYmVpbmcgYnVybmVkXG4gICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICAqIFxuICAgICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gY3JlYXRlZCBmcm9tIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVycy5cbiAgICAqL1xuICBidWlsZENyZWF0ZVN1Ym5ldFR4ID0gKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCxcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlcixcbiAgICBmcm9tQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IEJ1ZmZlcltdLFxuICAgIHN1Ym5ldE93bmVyQWRkcmVzc2VzOiBCdWZmZXJbXSxcbiAgICBzdWJuZXRPd25lclRocmVzaG9sZDogbnVtYmVyLFxuICAgIGZlZTogQk4gPSB1bmRlZmluZWQsXG4gICAgZmVlQXNzZXRJRDogQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgKTogVW5zaWduZWRUeCA9PiB7XG4gICAgY29uc3QgemVybzogQk4gPSBuZXcgQk4oMCk7XG4gICAgbGV0IGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IFtdXG4gICAgbGV0IG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW107XG5cbiAgICBpZiAodGhpcy5fZmVlQ2hlY2soZmVlLCBmZWVBc3NldElEKSkge1xuICAgICAgY29uc3QgYWFkOiBBc3NldEFtb3VudERlc3RpbmF0aW9uID0gbmV3IEFzc2V0QW1vdW50RGVzdGluYXRpb24oZnJvbUFkZHJlc3NlcywgZnJvbUFkZHJlc3NlcywgY2hhbmdlQWRkcmVzc2VzKTtcbiAgICAgIGFhZC5hZGRBc3NldEFtb3VudChmZWVBc3NldElELCB6ZXJvLCBmZWUpO1xuICAgICAgY29uc3QgbWluU3BlbmRhYmxlRXJyOiBFcnJvciA9IHRoaXMuZ2V0TWluaW11bVNwZW5kYWJsZShhYWQsIGFzT2YsIHVuZGVmaW5lZCwgdW5kZWZpbmVkKTtcbiAgICAgIGlmICh0eXBlb2YgbWluU3BlbmRhYmxlRXJyID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIGlucyA9IGFhZC5nZXRJbnB1dHMoKTtcbiAgICAgICAgb3V0cyA9IGFhZC5nZXRBbGxPdXRwdXRzKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBtaW5TcGVuZGFibGVFcnI7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDApXG4gICAgY29uc3QgVVR4OiBDcmVhdGVTdWJuZXRUeCA9IG5ldyBDcmVhdGVTdWJuZXRUeChuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zLCBtZW1vLCBuZXcgU0VDUE93bmVyT3V0cHV0KHN1Ym5ldE93bmVyQWRkcmVzc2VzLCBsb2NrdGltZSwgc3VibmV0T3duZXJUaHJlc2hvbGQpKTtcbiAgICByZXR1cm4gbmV3IFVuc2lnbmVkVHgoVVR4KTtcbiAgfVxuXG59XG4iXX0=