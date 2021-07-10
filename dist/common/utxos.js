"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardUTXOSet = exports.StandardUTXO = void 0;
/**
 * @packageDocumentation
 * @module Common-UTXOs
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const output_1 = require("./output");
const helperfunctions_1 = require("../utils/helperfunctions");
const serialization_1 = require("../utils/serialization");
const errors_1 = require("../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Class for representing a single StandardUTXO.
 */
class StandardUTXO extends serialization_1.Serializable {
    /**
       * Class for representing a single StandardUTXO.
       *
       * @param codecID Optional number which specifies the codeID of the UTXO. Default 0
       * @param txID Optional {@link https://github.com/feross/buffer|Buffer} of transaction ID for the StandardUTXO
       * @param txidx Optional {@link https://github.com/feross/buffer|Buffer} or number for the index of the transaction's [[Output]]
       * @param assetID Optional {@link https://github.com/feross/buffer|Buffer} of the asset ID for the StandardUTXO
       * @param outputid Optional {@link https://github.com/feross/buffer|Buffer} or number of the output ID for the StandardUTXO
       */
    constructor(codecID = 0, txID = undefined, outputidx = undefined, assetID = undefined, output = undefined) {
        super();
        this._typeName = "StandardUTXO";
        this._typeID = undefined;
        this.codecID = buffer_1.Buffer.alloc(2);
        this.txid = buffer_1.Buffer.alloc(32);
        this.outputidx = buffer_1.Buffer.alloc(4);
        this.assetID = buffer_1.Buffer.alloc(32);
        this.output = undefined;
        /**
           * Returns the numeric representation of the CodecID.
           */
        this.getCodecID = () => this.codecID.readUInt8(0);
        /**
         * Returns the {@link https://github.com/feross/buffer|Buffer} representation of the CodecID
          */
        this.getCodecIDBuffer = () => this.codecID;
        /**
           * Returns a {@link https://github.com/feross/buffer|Buffer} of the TxID.
           */
        this.getTxID = () => this.txid;
        /**
           * Returns a {@link https://github.com/feross/buffer|Buffer}  of the OutputIdx.
           */
        this.getOutputIdx = () => this.outputidx;
        /**
           * Returns the assetID as a {@link https://github.com/feross/buffer|Buffer}.
           */
        this.getAssetID = () => this.assetID;
        /**
           * Returns the UTXOID as a base-58 string (UTXOID is a string )
           */
        this.getUTXOID = () => bintools.bufferToB58(buffer_1.Buffer.concat([this.getTxID(), this.getOutputIdx()]));
        /**
         * Returns a reference to the output
        */
        this.getOutput = () => this.output;
        if (typeof codecID !== 'undefined') {
            this.codecID.writeUInt8(codecID, 0);
        }
        if (typeof txID !== 'undefined') {
            this.txid = txID;
        }
        if (typeof outputidx === 'number') {
            this.outputidx.writeUInt32BE(outputidx, 0);
        }
        else if (outputidx instanceof buffer_1.Buffer) {
            this.outputidx = outputidx;
        }
        if (typeof assetID !== 'undefined') {
            this.assetID = assetID;
        }
        if (typeof output !== 'undefined') {
            this.output = output;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { codecID: serialization.encoder(this.codecID, encoding, "Buffer", "decimalString"), txid: serialization.encoder(this.txid, encoding, "Buffer", "cb58"), outputidx: serialization.encoder(this.outputidx, encoding, "Buffer", "decimalString"), assetID: serialization.encoder(this.assetID, encoding, "Buffer", "cb58"), output: this.output.serialize(encoding) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.codecID = serialization.decoder(fields["codecID"], encoding, "decimalString", "Buffer", 2);
        this.txid = serialization.decoder(fields["txid"], encoding, "cb58", "Buffer", 32);
        this.outputidx = serialization.decoder(fields["outputidx"], encoding, "decimalString", "Buffer", 4);
        this.assetID = serialization.decoder(fields["assetID"], encoding, "cb58", "Buffer", 32);
    }
    /**
       * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[StandardUTXO]].
       */
    toBuffer() {
        const outbuff = this.output.toBuffer();
        const outputidbuffer = buffer_1.Buffer.alloc(4);
        outputidbuffer.writeUInt32BE(this.output.getOutputID(), 0);
        const barr = [this.codecID, this.txid, this.outputidx, this.assetID, outputidbuffer, outbuff];
        return buffer_1.Buffer.concat(barr, this.codecID.length + this.txid.length
            + this.outputidx.length + this.assetID.length
            + outputidbuffer.length + outbuff.length);
    }
}
exports.StandardUTXO = StandardUTXO;
/**
 * Class representing a set of [[StandardUTXO]]s.
 */
class StandardUTXOSet extends serialization_1.Serializable {
    constructor() {
        super(...arguments);
        this._typeName = "StandardUTXOSet";
        this._typeID = undefined;
        this.utxos = {};
        this.addressUTXOs = {}; // maps address to utxoids:locktime
        /**
         * Returns true if the [[StandardUTXO]] is in the StandardUTXOSet.
         *
         * @param utxo Either a [[StandardUTXO]] a cb58 serialized string representing a StandardUTXO
         */
        this.includes = (utxo) => {
            let utxoX = undefined;
            let utxoid = undefined;
            try {
                utxoX = this.parseUTXO(utxo);
                utxoid = utxoX.getUTXOID();
            }
            catch (e) {
                if (e instanceof Error) {
                    console.log(e.message);
                }
                else {
                    console.log(e);
                }
                return false;
            }
            return (utxoid in this.utxos);
        };
        /**
           * Removes a [[StandardUTXO]] from the [[StandardUTXOSet]] if it exists.
           *
           * @param utxo Either a [[StandardUTXO]] an cb58 serialized string representing a StandardUTXO
           *
           * @returns A [[StandardUTXO]] if it was removed and undefined if nothing was removed.
           */
        this.remove = (utxo) => {
            let utxovar = undefined;
            try {
                utxovar = this.parseUTXO(utxo);
            }
            catch (e) {
                if (e instanceof Error) {
                    console.log(e.message);
                }
                else {
                    console.log(e);
                }
                return undefined;
            }
            const utxoid = utxovar.getUTXOID();
            if (!(utxoid in this.utxos)) {
                return undefined;
            }
            delete this.utxos[utxoid];
            const addresses = Object.keys(this.addressUTXOs);
            for (let i = 0; i < addresses.length; i++) {
                if (utxoid in this.addressUTXOs[addresses[i]]) {
                    delete this.addressUTXOs[addresses[i]][utxoid];
                }
            }
            return utxovar;
        };
        /**
           * Removes an array of [[StandardUTXO]]s to the [[StandardUTXOSet]].
           *
           * @param utxo Either a [[StandardUTXO]] an cb58 serialized string representing a StandardUTXO
           * @param overwrite If true, if the UTXOID already exists, overwrite it... default false
           *
           * @returns An array of UTXOs which were removed.
           */
        this.removeArray = (utxos) => {
            const removed = [];
            for (let i = 0; i < utxos.length; i++) {
                const result = this.remove(utxos[i]);
                if (typeof result !== 'undefined') {
                    removed.push(result);
                }
            }
            return removed;
        };
        /**
           * Gets a [[StandardUTXO]] from the [[StandardUTXOSet]] by its UTXOID.
           *
           * @param utxoid String representing the UTXOID
           *
           * @returns A [[StandardUTXO]] if it exists in the set.
           */
        this.getUTXO = (utxoid) => this.utxos[utxoid];
        /**
           * Gets all the [[StandardUTXO]]s, optionally that match with UTXOIDs in an array
           *
           * @param utxoids An optional array of UTXOIDs, returns all [[StandardUTXO]]s if not provided
           *
           * @returns An array of [[StandardUTXO]]s.
           */
        this.getAllUTXOs = (utxoids = undefined) => {
            let results = [];
            if (typeof utxoids !== 'undefined' && Array.isArray(utxoids)) {
                for (let i = 0; i < utxoids.length; i++) {
                    if (utxoids[i] in this.utxos && !(utxoids[i] in results)) {
                        results.push(this.utxos[utxoids[i]]);
                    }
                }
            }
            else {
                results = Object.values(this.utxos);
            }
            return results;
        };
        /**
           * Gets all the [[StandardUTXO]]s as strings, optionally that match with UTXOIDs in an array.
           *
           * @param utxoids An optional array of UTXOIDs, returns all [[StandardUTXO]]s if not provided
           *
           * @returns An array of [[StandardUTXO]]s as cb58 serialized strings.
           */
        this.getAllUTXOStrings = (utxoids = undefined) => {
            const results = [];
            const utxos = Object.keys(this.utxos);
            if (typeof utxoids !== 'undefined' && Array.isArray(utxoids)) {
                for (let i = 0; i < utxoids.length; i++) {
                    if (utxoids[i] in this.utxos) {
                        results.push(this.utxos[utxoids[i]].toString());
                    }
                }
            }
            else {
                for (const u of utxos) {
                    results.push(this.utxos[u].toString());
                }
            }
            return results;
        };
        /**
           * Given an address or array of addresses, returns all the UTXOIDs for those addresses
           *
           * @param address An array of address {@link https://github.com/feross/buffer|Buffer}s
           * @param spendable If true, only retrieves UTXOIDs whose locktime has passed
           *
           * @returns An array of addresses.
           */
        this.getUTXOIDs = (addresses = undefined, spendable = true) => {
            if (typeof addresses !== 'undefined') {
                const results = [];
                const now = helperfunctions_1.UnixNow();
                for (let i = 0; i < addresses.length; i++) {
                    if (addresses[i].toString('hex') in this.addressUTXOs) {
                        const entries = Object.entries(this.addressUTXOs[addresses[i].toString('hex')]);
                        for (const [utxoid, locktime] of entries) {
                            if ((results.indexOf(utxoid) === -1
                                && (spendable && locktime.lte(now)))
                                || !spendable) {
                                results.push(utxoid);
                            }
                        }
                    }
                }
                return results;
            }
            return Object.keys(this.utxos);
        };
        /**
           * Gets the addresses in the [[StandardUTXOSet]] and returns an array of {@link https://github.com/feross/buffer|Buffer}.
           */
        this.getAddresses = () => Object.keys(this.addressUTXOs)
            .map((k) => buffer_1.Buffer.from(k, 'hex'));
        /**
           * Returns the balance of a set of addresses in the StandardUTXOSet.
           *
           * @param addresses An array of addresses
           * @param assetID Either a {@link https://github.com/feross/buffer|Buffer} or an cb58 serialized representation of an AssetID
           * @param asOf The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
           *
           * @returns Returns the total balance as a {@link https://github.com/indutny/bn.js/|BN}.
           */
        this.getBalance = (addresses, assetID, asOf = undefined) => {
            const utxoids = this.getUTXOIDs(addresses);
            const utxos = this.getAllUTXOs(utxoids);
            let spend = new bn_js_1.default(0);
            let asset;
            if (typeof assetID === 'string') {
                asset = bintools.cb58Decode(assetID);
            }
            else {
                asset = assetID;
            }
            for (let i = 0; i < utxos.length; i++) {
                if (utxos[i].getOutput() instanceof output_1.StandardAmountOutput
                    && utxos[i].getAssetID().toString('hex') === asset.toString('hex')
                    && utxos[i].getOutput().meetsThreshold(addresses, asOf)) {
                    spend = spend.add(utxos[i].getOutput().getAmount());
                }
            }
            return spend;
        };
        /**
           * Gets all the Asset IDs, optionally that match with Asset IDs in an array
           *
           * @param utxoids An optional array of Addresses as string or Buffer, returns all Asset IDs if not provided
           *
           * @returns An array of {@link https://github.com/feross/buffer|Buffer} representing the Asset IDs.
           */
        this.getAssetIDs = (addresses = undefined) => {
            const results = new Set();
            let utxoids = [];
            if (typeof addresses !== 'undefined') {
                utxoids = this.getUTXOIDs(addresses);
            }
            else {
                utxoids = this.getUTXOIDs();
            }
            for (let i = 0; i < utxoids.length; i++) {
                if (utxoids[i] in this.utxos && !(utxoids[i] in results)) {
                    results.add(this.utxos[utxoids[i]].getAssetID());
                }
            }
            return [...results];
        };
        /**
           * Returns a new set with copy of UTXOs in this and set parameter.
           *
           * @param utxoset The [[StandardUTXOSet]] to merge with this one
           * @param hasUTXOIDs Will subselect a set of [[StandardUTXO]]s which have the UTXOIDs provided in this array, defults to all UTXOs
           *
           * @returns A new StandardUTXOSet that contains all the filtered elements.
           */
        this.merge = (utxoset, hasUTXOIDs = undefined) => {
            const results = this.create();
            const utxos1 = this.getAllUTXOs(hasUTXOIDs);
            const utxos2 = utxoset.getAllUTXOs(hasUTXOIDs);
            const process = (utxo) => {
                results.add(utxo);
            };
            utxos1.forEach(process);
            utxos2.forEach(process);
            return results;
        };
        /**
           * Set intersetion between this set and a parameter.
           *
           * @param utxoset The set to intersect
           *
           * @returns A new StandardUTXOSet containing the intersection
           */
        this.intersection = (utxoset) => {
            const us1 = this.getUTXOIDs();
            const us2 = utxoset.getUTXOIDs();
            const results = us1.filter((utxoid) => us2.includes(utxoid));
            return this.merge(utxoset, results);
        };
        /**
           * Set difference between this set and a parameter.
           *
           * @param utxoset The set to difference
           *
           * @returns A new StandardUTXOSet containing the difference
           */
        this.difference = (utxoset) => {
            const us1 = this.getUTXOIDs();
            const us2 = utxoset.getUTXOIDs();
            const results = us1.filter((utxoid) => !us2.includes(utxoid));
            return this.merge(utxoset, results);
        };
        /**
           * Set symmetrical difference between this set and a parameter.
           *
           * @param utxoset The set to symmetrical difference
           *
           * @returns A new StandardUTXOSet containing the symmetrical difference
           */
        this.symDifference = (utxoset) => {
            const us1 = this.getUTXOIDs();
            const us2 = utxoset.getUTXOIDs();
            const results = us1.filter((utxoid) => !us2.includes(utxoid))
                .concat(us2.filter((utxoid) => !us1.includes(utxoid)));
            return this.merge(utxoset, results);
        };
        /**
           * Set union between this set and a parameter.
           *
           * @param utxoset The set to union
           *
           * @returns A new StandardUTXOSet containing the union
           */
        this.union = (utxoset) => this.merge(utxoset);
        /**
           * Merges a set by the rule provided.
           *
           * @param utxoset The set to merge by the MergeRule
           * @param mergeRule The [[MergeRule]] to apply
           *
           * @returns A new StandardUTXOSet containing the merged data
           *
           * @remarks
           * The merge rules are as follows:
           *   * "intersection" - the intersection of the set
           *   * "differenceSelf" - the difference between the existing data and new set
           *   * "differenceNew" - the difference between the new data and the existing set
           *   * "symDifference" - the union of the differences between both sets of data
           *   * "union" - the unique set of all elements contained in both sets
           *   * "unionMinusNew" - the unique set of all elements contained in both sets, excluding values only found in the new set
           *   * "unionMinusSelf" - the unique set of all elements contained in both sets, excluding values only found in the existing set
           */
        this.mergeByRule = (utxoset, mergeRule) => {
            let uSet;
            switch (mergeRule) {
                case 'intersection':
                    return this.intersection(utxoset);
                case 'differenceSelf':
                    return this.difference(utxoset);
                case 'differenceNew':
                    return utxoset.difference(this);
                case 'symDifference':
                    return this.symDifference(utxoset);
                case 'union':
                    return this.union(utxoset);
                case 'unionMinusNew':
                    uSet = this.union(utxoset);
                    return uSet.difference(utxoset);
                case 'unionMinusSelf':
                    uSet = this.union(utxoset);
                    return uSet.difference(this);
                default:
                    throw new errors_1.MergeRuleError("Error - StandardUTXOSet.mergeByRule: bad MergeRule");
            }
        };
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        let utxos = {};
        for (let utxoid in this.utxos) {
            let utxoidCleaned = serialization.encoder(utxoid, encoding, "base58", "base58");
            utxos[utxoidCleaned] = this.utxos[utxoid].serialize(encoding);
        }
        let addressUTXOs = {};
        for (let address in this.addressUTXOs) {
            let addressCleaned = serialization.encoder(address, encoding, "hex", "cb58");
            let utxobalance = {};
            for (let utxoid in this.addressUTXOs[address]) {
                let utxoidCleaned = serialization.encoder(utxoid, encoding, "base58", "base58");
                utxobalance[utxoidCleaned] = serialization.encoder(this.addressUTXOs[address][utxoid], encoding, "BN", "decimalString");
            }
            addressUTXOs[addressCleaned] = utxobalance;
        }
        return Object.assign(Object.assign({}, fields), { utxos,
            addressUTXOs });
    }
    /**
       * Adds a [[StandardUTXO]] to the StandardUTXOSet.
       *
       * @param utxo Either a [[StandardUTXO]] an cb58 serialized string representing a StandardUTXO
       * @param overwrite If true, if the UTXOID already exists, overwrite it... default false
       *
       * @returns A [[StandardUTXO]] if one was added and undefined if nothing was added.
       */
    add(utxo, overwrite = false) {
        let utxovar = undefined;
        try {
            utxovar = this.parseUTXO(utxo);
        }
        catch (e) {
            if (e instanceof Error) {
                console.log(e.message);
            }
            else {
                console.log(e);
            }
            return undefined;
        }
        const utxoid = utxovar.getUTXOID();
        if (!(utxoid in this.utxos) || overwrite === true) {
            this.utxos[utxoid] = utxovar;
            const addresses = utxovar.getOutput().getAddresses();
            const locktime = utxovar.getOutput().getLocktime();
            for (let i = 0; i < addresses.length; i++) {
                const address = addresses[i].toString('hex');
                if (!(address in this.addressUTXOs)) {
                    this.addressUTXOs[address] = {};
                }
                this.addressUTXOs[address][utxoid] = locktime;
            }
            return utxovar;
        }
        return undefined;
    }
    /**
       * Adds an array of [[StandardUTXO]]s to the [[StandardUTXOSet]].
       *
       * @param utxo Either a [[StandardUTXO]] an cb58 serialized string representing a StandardUTXO
       * @param overwrite If true, if the UTXOID already exists, overwrite it... default false
       *
       * @returns An array of StandardUTXOs which were added.
       */
    addArray(utxos, overwrite = false) {
        const added = [];
        for (let i = 0; i < utxos.length; i++) {
            let result = this.add(utxos[i], overwrite);
            if (typeof result !== 'undefined') {
                added.push(result);
            }
        }
        return added;
    }
    filter(args, lambda) {
        let newset = this.clone();
        let utxos = this.getAllUTXOs();
        for (let i = 0; i < utxos.length; i++) {
            if (lambda(utxos[i], ...args) === false) {
                newset.remove(utxos[i]);
            }
        }
        return newset;
    }
}
exports.StandardUTXOSet = StandardUTXOSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXR4b3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL3V0eG9zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUNoQyxpRUFBd0M7QUFDeEMsa0RBQXNCO0FBQ3RCLHFDQUF1RDtBQUN2RCw4REFBa0Q7QUFFbEQsMERBQXdGO0FBQ3hGLDRDQUFnRDtBQUVoRDs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFaEU7O0dBRUc7QUFDSCxNQUFzQixZQUFhLFNBQVEsNEJBQVk7SUF3R3JEOzs7Ozs7OztTQVFLO0lBQ0wsWUFBWSxVQUFrQixDQUFDLEVBQUUsT0FBZSxTQUFTLEVBQ3ZELFlBQTRCLFNBQVMsRUFDckMsVUFBa0IsU0FBUyxFQUMzQixTQUFnQixTQUFTO1FBQ3pCLEtBQUssRUFBRSxDQUFBO1FBcEhDLGNBQVMsR0FBRyxjQUFjLENBQUE7UUFDMUIsWUFBTyxHQUFHLFNBQVMsQ0FBQTtRQXFCbkIsWUFBTyxHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDakMsU0FBSSxHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDL0IsY0FBUyxHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkMsWUFBTyxHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDbEMsV0FBTSxHQUFXLFNBQVMsQ0FBQTtRQUVwQzs7YUFFSztRQUNMLGVBQVUsR0FBRyxHQUVGLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUV2Qzs7WUFFSTtRQUNKLHFCQUFnQixHQUFHLEdBQVcsRUFB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SUFDTCxRQUFRLENBQUMsS0FBNkIsRUFBRSxZQUFxQixLQUFLO1FBQ2hFLE1BQU0sS0FBSyxHQUFnQixFQUFFLENBQUE7UUFDN0IsS0FBSyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDN0MsSUFBSSxNQUFNLEdBQWMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUE7WUFDckQsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLEVBQUU7Z0JBQ2pDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7YUFDbkI7U0FDRjtRQUNELE9BQU8sS0FBSyxDQUFBO0lBQ2QsQ0FBQztJQTBNRCxNQUFNLENBQUMsSUFBVyxFQUFFLE1BQXFEO1FBQ3ZFLElBQUksTUFBTSxHQUFTLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQTtRQUMvQixJQUFJLEtBQUssR0FBZ0IsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQzNDLEtBQUssSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQzdDLElBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRTtnQkFDdEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTthQUN4QjtTQUNGO1FBQ0QsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDO0NBbUhGO0FBcGJELDBDQW9iQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIENvbW1vbi1VVFhPc1xuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJ1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uL3V0aWxzL2JpbnRvb2xzJ1xuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiXG5pbXBvcnQgeyBPdXRwdXQsIFN0YW5kYXJkQW1vdW50T3V0cHV0IH0gZnJvbSAnLi9vdXRwdXQnXG5pbXBvcnQgeyBVbml4Tm93IH0gZnJvbSAnLi4vdXRpbHMvaGVscGVyZnVuY3Rpb25zJ1xuaW1wb3J0IHsgTWVyZ2VSdWxlIH0gZnJvbSAnLi4vdXRpbHMvY29uc3RhbnRzJ1xuaW1wb3J0IHsgU2VyaWFsaXphYmxlLCBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tICcuLi91dGlscy9zZXJpYWxpemF0aW9uJ1xuaW1wb3J0IHsgTWVyZ2VSdWxlRXJyb3IgfSBmcm9tICcuLi91dGlscy9lcnJvcnMnXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIHNpbmdsZSBTdGFuZGFyZFVUWE8uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdGFuZGFyZFVUWE8gZXh0ZW5kcyBTZXJpYWxpemFibGV7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlN0YW5kYXJkVVRYT1wiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIGNvZGVjSUQ6IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLmNvZGVjSUQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIiksXG4gICAgICB0eGlkOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy50eGlkLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJjYjU4XCIpLFxuICAgICAgb3V0cHV0aWR4OiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5vdXRwdXRpZHgsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIiksXG4gICAgICBhc3NldElEOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5hc3NldElELCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJjYjU4XCIpLFxuICAgICAgb3V0cHV0OiB0aGlzLm91dHB1dC5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgfVxuICB9XG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5jb2RlY0lEID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKGZpZWxkc1tcImNvZGVjSURcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJCdWZmZXJcIiwgMilcbiAgICB0aGlzLnR4aWQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1widHhpZFwiXSwgZW5jb2RpbmcsIFwiY2I1OFwiLCBcIkJ1ZmZlclwiLCAzMilcbiAgICB0aGlzLm91dHB1dGlkeCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJvdXRwdXRpZHhcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJCdWZmZXJcIiwgNClcbiAgICB0aGlzLmFzc2V0SUQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wiYXNzZXRJRFwiXSwgZW5jb2RpbmcsIFwiY2I1OFwiLCBcIkJ1ZmZlclwiLCAzMilcbiAgfVxuXG4gIHByb3RlY3RlZCBjb2RlY0lEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMilcbiAgcHJvdGVjdGVkIHR4aWQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMilcbiAgcHJvdGVjdGVkIG91dHB1dGlkeDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gIHByb3RlY3RlZCBhc3NldElEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIpXG4gIHByb3RlY3RlZCBvdXRwdXQ6IE91dHB1dCA9IHVuZGVmaW5lZFxuXG4gIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG51bWVyaWMgcmVwcmVzZW50YXRpb24gb2YgdGhlIENvZGVjSUQuXG4gICAgICovXG4gIGdldENvZGVjSUQgPSAoKVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIDogbnVtYmVyID0+IHRoaXMuY29kZWNJRC5yZWFkVUludDgoMClcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIENvZGVjSURcbiAgICAqL1xuICBnZXRDb2RlY0lEQnVmZmVyID0gKCk6IEJ1ZmZlciA9PiB0aGlzLmNvZGVjSURcblxuICAvKipcbiAgICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb2YgdGhlIFR4SUQuXG4gICAgICovXG4gIGdldFR4SUQgPSAoKVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIDogQnVmZmVyID0+IHRoaXMudHhpZFxuXG4gIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSAgb2YgdGhlIE91dHB1dElkeC5cbiAgICAgKi9cbiAgZ2V0T3V0cHV0SWR4ID0gKClcbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICA6IEJ1ZmZlciA9PiB0aGlzLm91dHB1dGlkeFxuXG4gIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGFzc2V0SUQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfS5cbiAgICAgKi9cbiAgZ2V0QXNzZXRJRCA9ICgpOiBCdWZmZXIgPT4gdGhpcy5hc3NldElEXG5cbiAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgVVRYT0lEIGFzIGEgYmFzZS01OCBzdHJpbmcgKFVUWE9JRCBpcyBhIHN0cmluZyApXG4gICAgICovXG4gIGdldFVUWE9JRCA9ICgpXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgOiBzdHJpbmcgPT4gYmludG9vbHMuYnVmZmVyVG9CNTgoQnVmZmVyLmNvbmNhdChbdGhpcy5nZXRUeElEKCksIHRoaXMuZ2V0T3V0cHV0SWR4KCldKSlcblxuICAvKipcbiAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgb3V0cHV0XG4gICovXG4gIGdldE91dHB1dCA9ICgpOiBPdXRwdXQgPT4gdGhpcy5vdXRwdXRcblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGFuIFtbU3RhbmRhcmRVVFhPXV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgU3RhbmRhcmRVVFhPIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbU3RhbmRhcmRVVFhPXV1cbiAgICovXG4gIGFic3RyYWN0IGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0PzogbnVtYmVyKTogbnVtYmVyXG5cbiAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW1N0YW5kYXJkVVRYT11dLlxuICAgICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGNvbnN0IG91dGJ1ZmY6IEJ1ZmZlciA9IHRoaXMub3V0cHV0LnRvQnVmZmVyKClcbiAgICBjb25zdCBvdXRwdXRpZGJ1ZmZlcjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgb3V0cHV0aWRidWZmZXIud3JpdGVVSW50MzJCRSh0aGlzLm91dHB1dC5nZXRPdXRwdXRJRCgpLCAwKVxuICAgIGNvbnN0IGJhcnI6IEJ1ZmZlcltdID0gW3RoaXMuY29kZWNJRCwgdGhpcy50eGlkLCB0aGlzLm91dHB1dGlkeCwgdGhpcy5hc3NldElELCBvdXRwdXRpZGJ1ZmZlciwgb3V0YnVmZl1cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBcbiAgICAgIHRoaXMuY29kZWNJRC5sZW5ndGggKyB0aGlzLnR4aWQubGVuZ3RoXG4gICAgICArIHRoaXMub3V0cHV0aWR4Lmxlbmd0aCArIHRoaXMuYXNzZXRJRC5sZW5ndGhcbiAgICAgICsgb3V0cHV0aWRidWZmZXIubGVuZ3RoICsgb3V0YnVmZi5sZW5ndGgpXG4gIH1cblxuICBhYnN0cmFjdCBmcm9tU3RyaW5nKHNlcmlhbGl6ZWQ6IHN0cmluZyk6IG51bWJlclxuXG4gIGFic3RyYWN0IHRvU3RyaW5nKCk6IHN0cmluZ1xuXG4gIGFic3RyYWN0IGNsb25lKCk6IHRoaXNcblxuICBhYnN0cmFjdCBjcmVhdGUoY29kZWNJRD86IG51bWJlciwgdHhpZD86IEJ1ZmZlcixcbiAgICBvdXRwdXRpZHg/OkJ1ZmZlciB8IG51bWJlcixcbiAgICBhc3NldElEPzogQnVmZmVyLFxuICAgIG91dHB1dD86IE91dHB1dCk6IHRoaXNcblxuICAvKipcbiAgICAgKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEgc2luZ2xlIFN0YW5kYXJkVVRYTy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjb2RlY0lEIE9wdGlvbmFsIG51bWJlciB3aGljaCBzcGVjaWZpZXMgdGhlIGNvZGVJRCBvZiB0aGUgVVRYTy4gRGVmYXVsdCAwXG4gICAgICogQHBhcmFtIHR4SUQgT3B0aW9uYWwge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb2YgdHJhbnNhY3Rpb24gSUQgZm9yIHRoZSBTdGFuZGFyZFVUWE9cbiAgICAgKiBAcGFyYW0gdHhpZHggT3B0aW9uYWwge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb3IgbnVtYmVyIGZvciB0aGUgaW5kZXggb2YgdGhlIHRyYW5zYWN0aW9uJ3MgW1tPdXRwdXRdXVxuICAgICAqIEBwYXJhbSBhc3NldElEIE9wdGlvbmFsIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9mIHRoZSBhc3NldCBJRCBmb3IgdGhlIFN0YW5kYXJkVVRYT1xuICAgICAqIEBwYXJhbSBvdXRwdXRpZCBPcHRpb25hbCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBudW1iZXIgb2YgdGhlIG91dHB1dCBJRCBmb3IgdGhlIFN0YW5kYXJkVVRYT1xuICAgICAqL1xuICBjb25zdHJ1Y3Rvcihjb2RlY0lEOiBudW1iZXIgPSAwLCB0eElEOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgb3V0cHV0aWR4OkJ1ZmZlciB8IG51bWJlciA9IHVuZGVmaW5lZCxcbiAgICBhc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgb3V0cHV0Ok91dHB1dCA9IHVuZGVmaW5lZCl7XG4gICAgc3VwZXIoKVxuICAgIGlmICh0eXBlb2YgY29kZWNJRCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMuY29kZWNJRC53cml0ZVVJbnQ4KGNvZGVjSUQsIDApXG4gICAgfVxuICAgIGlmICh0eXBlb2YgdHhJRCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXMudHhpZCA9IHR4SURcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvdXRwdXRpZHggPT09ICdudW1iZXInKSB7XG4gICAgICB0aGlzLm91dHB1dGlkeC53cml0ZVVJbnQzMkJFKG91dHB1dGlkeCwgMClcbiAgICB9IGVsc2UgaWYgKG91dHB1dGlkeCBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgdGhpcy5vdXRwdXRpZHggPSBvdXRwdXRpZHhcbiAgICB9IFxuXG4gICAgaWYgKHR5cGVvZiBhc3NldElEICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5hc3NldElEID0gYXNzZXRJRFxuICAgIH1cbiAgICBpZih0eXBlb2Ygb3V0cHV0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5vdXRwdXQgPSBvdXRwdXRcbiAgICB9XG4gICAgICBcbiAgfVxufVxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBzZXQgb2YgW1tTdGFuZGFyZFVUWE9dXXMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdGFuZGFyZFVUWE9TZXQ8VVRYT0NsYXNzIGV4dGVuZHMgU3RhbmRhcmRVVFhPPiBleHRlbmRzIFNlcmlhbGl6YWJsZXtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU3RhbmRhcmRVVFhPU2V0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICBsZXQgdXR4b3MgPSB7fVxuICAgIGZvcihsZXQgdXR4b2lkIGluIHRoaXMudXR4b3MpIHtcbiAgICAgIGxldCB1dHhvaWRDbGVhbmVkOiBzdHJpbmcgPSBzZXJpYWxpemF0aW9uLmVuY29kZXIodXR4b2lkLCBlbmNvZGluZywgXCJiYXNlNThcIiwgXCJiYXNlNThcIilcbiAgICAgIHV0eG9zW3V0eG9pZENsZWFuZWRdID0gdGhpcy51dHhvc1t1dHhvaWRdLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICB9XG4gICAgbGV0IGFkZHJlc3NVVFhPcyA9IHt9XG4gICAgZm9yKGxldCBhZGRyZXNzIGluIHRoaXMuYWRkcmVzc1VUWE9zKSB7XG4gICAgICBsZXQgYWRkcmVzc0NsZWFuZWQ6IHN0cmluZyA9IHNlcmlhbGl6YXRpb24uZW5jb2RlcihhZGRyZXNzLCBlbmNvZGluZywgXCJoZXhcIiwgXCJjYjU4XCIpXG4gICAgICBsZXQgdXR4b2JhbGFuY2UgPSB7fVxuICAgICAgZm9yKGxldCB1dHhvaWQgaW4gdGhpcy5hZGRyZXNzVVRYT3NbYWRkcmVzc10pe1xuICAgICAgICBsZXQgdXR4b2lkQ2xlYW5lZDogc3RyaW5nID0gc2VyaWFsaXphdGlvbi5lbmNvZGVyKHV0eG9pZCwgZW5jb2RpbmcsIFwiYmFzZTU4XCIsIFwiYmFzZTU4XCIpXG4gICAgICAgIHV0eG9iYWxhbmNlW3V0eG9pZENsZWFuZWRdID0gc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuYWRkcmVzc1VUWE9zW2FkZHJlc3NdW3V0eG9pZF0sIGVuY29kaW5nLCBcIkJOXCIsIFwiZGVjaW1hbFN0cmluZ1wiKVxuICAgICAgfVxuICAgICAgYWRkcmVzc1VUWE9zW2FkZHJlc3NDbGVhbmVkXSA9IHV0eG9iYWxhbmNlXG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICB1dHhvcyxcbiAgICAgIGFkZHJlc3NVVFhPc1xuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCB1dHhvczogeyBbdXR4b2lkOiBzdHJpbmddOiBVVFhPQ2xhc3MgfSA9IHt9XG4gIHByb3RlY3RlZCBhZGRyZXNzVVRYT3M6IHsgW2FkZHJlc3M6IHN0cmluZ106IHsgW3V0eG9pZDogc3RyaW5nXTogQk4gfSB9ID0ge30gLy8gbWFwcyBhZGRyZXNzIHRvIHV0eG9pZHM6bG9ja3RpbWVcblxuICBhYnN0cmFjdCBwYXJzZVVUWE8odXR4bzogVVRYT0NsYXNzIHwgc3RyaW5nKTogVVRYT0NsYXNzXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgW1tTdGFuZGFyZFVUWE9dXSBpcyBpbiB0aGUgU3RhbmRhcmRVVFhPU2V0LlxuICAgKlxuICAgKiBAcGFyYW0gdXR4byBFaXRoZXIgYSBbW1N0YW5kYXJkVVRYT11dIGEgY2I1OCBzZXJpYWxpemVkIHN0cmluZyByZXByZXNlbnRpbmcgYSBTdGFuZGFyZFVUWE9cbiAgICovXG4gIGluY2x1ZGVzID0gKHV0eG86VVRYT0NsYXNzIHwgc3RyaW5nKTpib29sZWFuID0+IHtcbiAgICBsZXQgdXR4b1g6IFVUWE9DbGFzcyA9IHVuZGVmaW5lZFxuICAgIGxldCB1dHhvaWQ6IHN0cmluZyA9IHVuZGVmaW5lZFxuICAgIHRyeSB7XG4gICAgICB1dHhvWCA9IHRoaXMucGFyc2VVVFhPKHV0eG8pXG4gICAgICB1dHhvaWQgPSB1dHhvWC5nZXRVVFhPSUQoKVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgaWYoZSBpbnN0YW5jZW9mIEVycm9yKXtcbiAgICAgICAgY29uc29sZS5sb2coZS5tZXNzYWdlKVxuICAgICAgfSBlbHNleyBcbiAgICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gKHV0eG9pZCBpbiB0aGlzLnV0eG9zKVxuICB9XG5cbiAgLyoqXG4gICAgICogQWRkcyBhIFtbU3RhbmRhcmRVVFhPXV0gdG8gdGhlIFN0YW5kYXJkVVRYT1NldC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1dHhvIEVpdGhlciBhIFtbU3RhbmRhcmRVVFhPXV0gYW4gY2I1OCBzZXJpYWxpemVkIHN0cmluZyByZXByZXNlbnRpbmcgYSBTdGFuZGFyZFVUWE9cbiAgICAgKiBAcGFyYW0gb3ZlcndyaXRlIElmIHRydWUsIGlmIHRoZSBVVFhPSUQgYWxyZWFkeSBleGlzdHMsIG92ZXJ3cml0ZSBpdC4uLiBkZWZhdWx0IGZhbHNlXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIFtbU3RhbmRhcmRVVFhPXV0gaWYgb25lIHdhcyBhZGRlZCBhbmQgdW5kZWZpbmVkIGlmIG5vdGhpbmcgd2FzIGFkZGVkLlxuICAgICAqL1xuICBhZGQodXR4bzpVVFhPQ2xhc3MgfCBzdHJpbmcsIG92ZXJ3cml0ZTpib29sZWFuID0gZmFsc2UpOlVUWE9DbGFzcyB7XG4gICAgbGV0IHV0eG92YXI6IFVUWE9DbGFzcyA9IHVuZGVmaW5lZFxuICAgIHRyeSB7XG4gICAgICB1dHhvdmFyID0gdGhpcy5wYXJzZVVUWE8odXR4bylcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIGlmKGUgaW5zdGFuY2VvZiBFcnJvcil7XG4gICAgICAgIGNvbnNvbGUubG9nKGUubWVzc2FnZSlcbiAgICAgIH0gZWxzZXsgXG4gICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICB9XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgY29uc3QgdXR4b2lkOiBzdHJpbmcgPSB1dHhvdmFyLmdldFVUWE9JRCgpXG4gICAgaWYgKCEodXR4b2lkIGluIHRoaXMudXR4b3MpIHx8IG92ZXJ3cml0ZSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy51dHhvc1t1dHhvaWRdID0gdXR4b3ZhclxuICAgICAgY29uc3QgYWRkcmVzc2VzOiBCdWZmZXJbXSA9IHV0eG92YXIuZ2V0T3V0cHV0KCkuZ2V0QWRkcmVzc2VzKClcbiAgICAgIGNvbnN0IGxvY2t0aW1lOiBCTiA9IHV0eG92YXIuZ2V0T3V0cHV0KCkuZ2V0TG9ja3RpbWUoKVxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFkZHJlc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBhZGRyZXNzOiBzdHJpbmcgPSBhZGRyZXNzZXNbaV0udG9TdHJpbmcoJ2hleCcpXG4gICAgICAgIGlmICghKGFkZHJlc3MgaW4gdGhpcy5hZGRyZXNzVVRYT3MpKSB7XG4gICAgICAgICAgdGhpcy5hZGRyZXNzVVRYT3NbYWRkcmVzc10gPSB7fVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWRkcmVzc1VUWE9zW2FkZHJlc3NdW3V0eG9pZF0gPSBsb2NrdGltZVxuICAgICAgfVxuICAgICAgcmV0dXJuIHV0eG92YXJcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgLyoqXG4gICAgICogQWRkcyBhbiBhcnJheSBvZiBbW1N0YW5kYXJkVVRYT11dcyB0byB0aGUgW1tTdGFuZGFyZFVUWE9TZXRdXS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1dHhvIEVpdGhlciBhIFtbU3RhbmRhcmRVVFhPXV0gYW4gY2I1OCBzZXJpYWxpemVkIHN0cmluZyByZXByZXNlbnRpbmcgYSBTdGFuZGFyZFVUWE9cbiAgICAgKiBAcGFyYW0gb3ZlcndyaXRlIElmIHRydWUsIGlmIHRoZSBVVFhPSUQgYWxyZWFkeSBleGlzdHMsIG92ZXJ3cml0ZSBpdC4uLiBkZWZhdWx0IGZhbHNlXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBTdGFuZGFyZFVUWE9zIHdoaWNoIHdlcmUgYWRkZWQuXG4gICAgICovXG4gIGFkZEFycmF5KHV0eG9zOiBzdHJpbmdbXSB8IFVUWE9DbGFzc1tdLCBvdmVyd3JpdGU6IGJvb2xlYW4gPSBmYWxzZSk6IFN0YW5kYXJkVVRYT1tdIHtcbiAgICBjb25zdCBhZGRlZDogVVRYT0NsYXNzW10gPSBbXVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB1dHhvcy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHJlc3VsdDogVVRYT0NsYXNzID0gdGhpcy5hZGQodXR4b3NbaV0sIG92ZXJ3cml0ZSlcbiAgICAgIGlmICh0eXBlb2YgcmVzdWx0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBhZGRlZC5wdXNoKHJlc3VsdClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFkZGVkXG4gIH1cblxuICAvKipcbiAgICAgKiBSZW1vdmVzIGEgW1tTdGFuZGFyZFVUWE9dXSBmcm9tIHRoZSBbW1N0YW5kYXJkVVRYT1NldF1dIGlmIGl0IGV4aXN0cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1dHhvIEVpdGhlciBhIFtbU3RhbmRhcmRVVFhPXV0gYW4gY2I1OCBzZXJpYWxpemVkIHN0cmluZyByZXByZXNlbnRpbmcgYSBTdGFuZGFyZFVUWE9cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgW1tTdGFuZGFyZFVUWE9dXSBpZiBpdCB3YXMgcmVtb3ZlZCBhbmQgdW5kZWZpbmVkIGlmIG5vdGhpbmcgd2FzIHJlbW92ZWQuXG4gICAgICovXG4gIHJlbW92ZSA9ICh1dHhvOiBVVFhPQ2xhc3MgfCBzdHJpbmcpOiBVVFhPQ2xhc3MgPT4ge1xuICAgIGxldCB1dHhvdmFyOiBVVFhPQ2xhc3MgPSB1bmRlZmluZWRcbiAgICB0cnkge1xuICAgICAgdXR4b3ZhciA9IHRoaXMucGFyc2VVVFhPKHV0eG8pXG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBpZihlIGluc3RhbmNlb2YgRXJyb3Ipe1xuICAgICAgICBjb25zb2xlLmxvZyhlLm1lc3NhZ2UpXG4gICAgICB9IGVsc2V7IFxuICAgICAgICBjb25zb2xlLmxvZyhlKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cblxuICAgIGNvbnN0IHV0eG9pZDogc3RyaW5nID0gdXR4b3Zhci5nZXRVVFhPSUQoKVxuICAgIGlmICghKHV0eG9pZCBpbiB0aGlzLnV0eG9zKSkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cbiAgICBkZWxldGUgdGhpcy51dHhvc1t1dHhvaWRdXG4gICAgY29uc3QgYWRkcmVzc2VzID0gT2JqZWN0LmtleXModGhpcy5hZGRyZXNzVVRYT3MpXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFkZHJlc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHV0eG9pZCBpbiB0aGlzLmFkZHJlc3NVVFhPc1thZGRyZXNzZXNbaV1dKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmFkZHJlc3NVVFhPc1thZGRyZXNzZXNbaV1dW3V0eG9pZF1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHV0eG92YXJcbiAgfVxuXG4gIC8qKlxuICAgICAqIFJlbW92ZXMgYW4gYXJyYXkgb2YgW1tTdGFuZGFyZFVUWE9dXXMgdG8gdGhlIFtbU3RhbmRhcmRVVFhPU2V0XV0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXR4byBFaXRoZXIgYSBbW1N0YW5kYXJkVVRYT11dIGFuIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgcmVwcmVzZW50aW5nIGEgU3RhbmRhcmRVVFhPXG4gICAgICogQHBhcmFtIG92ZXJ3cml0ZSBJZiB0cnVlLCBpZiB0aGUgVVRYT0lEIGFscmVhZHkgZXhpc3RzLCBvdmVyd3JpdGUgaXQuLi4gZGVmYXVsdCBmYWxzZVxuICAgICAqXG4gICAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgVVRYT3Mgd2hpY2ggd2VyZSByZW1vdmVkLlxuICAgICAqL1xuICByZW1vdmVBcnJheSA9ICh1dHhvczogc3RyaW5nW10gfCBVVFhPQ2xhc3NbXSk6IFVUWE9DbGFzc1tdID0+IHtcbiAgICBjb25zdCByZW1vdmVkOiBVVFhPQ2xhc3NbXSA9IFtdXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHV0eG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCByZXN1bHQ6IFVUWE9DbGFzcyA9IHRoaXMucmVtb3ZlKHV0eG9zW2ldKVxuICAgICAgaWYgKHR5cGVvZiByZXN1bHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJlbW92ZWQucHVzaChyZXN1bHQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZW1vdmVkXG4gIH1cblxuICAvKipcbiAgICAgKiBHZXRzIGEgW1tTdGFuZGFyZFVUWE9dXSBmcm9tIHRoZSBbW1N0YW5kYXJkVVRYT1NldF1dIGJ5IGl0cyBVVFhPSUQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXR4b2lkIFN0cmluZyByZXByZXNlbnRpbmcgdGhlIFVUWE9JRFxuICAgICAqXG4gICAgICogQHJldHVybnMgQSBbW1N0YW5kYXJkVVRYT11dIGlmIGl0IGV4aXN0cyBpbiB0aGUgc2V0LlxuICAgICAqL1xuICBnZXRVVFhPID0gKHV0eG9pZDogc3RyaW5nKTogVVRYT0NsYXNzID0+IHRoaXMudXR4b3NbdXR4b2lkXVxuXG4gIC8qKlxuICAgICAqIEdldHMgYWxsIHRoZSBbW1N0YW5kYXJkVVRYT11dcywgb3B0aW9uYWxseSB0aGF0IG1hdGNoIHdpdGggVVRYT0lEcyBpbiBhbiBhcnJheVxuICAgICAqXG4gICAgICogQHBhcmFtIHV0eG9pZHMgQW4gb3B0aW9uYWwgYXJyYXkgb2YgVVRYT0lEcywgcmV0dXJucyBhbGwgW1tTdGFuZGFyZFVUWE9dXXMgaWYgbm90IHByb3ZpZGVkXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBbW1N0YW5kYXJkVVRYT11dcy5cbiAgICAgKi9cbiAgZ2V0QWxsVVRYT3MgPSAodXR4b2lkczogc3RyaW5nW10gPSB1bmRlZmluZWQpOiBVVFhPQ2xhc3NbXSA9PiB7XG4gICAgbGV0IHJlc3VsdHM6IFVUWE9DbGFzc1tdID0gW11cbiAgICBpZiAodHlwZW9mIHV0eG9pZHMgIT09ICd1bmRlZmluZWQnICYmIEFycmF5LmlzQXJyYXkodXR4b2lkcykpIHtcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB1dHhvaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh1dHhvaWRzW2ldIGluIHRoaXMudXR4b3MgJiYgISh1dHhvaWRzW2ldIGluIHJlc3VsdHMpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHRoaXMudXR4b3NbdXR4b2lkc1tpXV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0cyA9IE9iamVjdC52YWx1ZXModGhpcy51dHhvcylcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHNcbiAgfVxuXG4gIC8qKlxuICAgICAqIEdldHMgYWxsIHRoZSBbW1N0YW5kYXJkVVRYT11dcyBhcyBzdHJpbmdzLCBvcHRpb25hbGx5IHRoYXQgbWF0Y2ggd2l0aCBVVFhPSURzIGluIGFuIGFycmF5LlxuICAgICAqXG4gICAgICogQHBhcmFtIHV0eG9pZHMgQW4gb3B0aW9uYWwgYXJyYXkgb2YgVVRYT0lEcywgcmV0dXJucyBhbGwgW1tTdGFuZGFyZFVUWE9dXXMgaWYgbm90IHByb3ZpZGVkXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBbW1N0YW5kYXJkVVRYT11dcyBhcyBjYjU4IHNlcmlhbGl6ZWQgc3RyaW5ncy5cbiAgICAgKi9cbiAgZ2V0QWxsVVRYT1N0cmluZ3MgPSAodXR4b2lkczogc3RyaW5nW10gPSB1bmRlZmluZWQpOiBzdHJpbmdbXSA9PiB7XG4gICAgY29uc3QgcmVzdWx0czogc3RyaW5nW10gPSBbXVxuICAgIGNvbnN0IHV0eG9zID0gT2JqZWN0LmtleXModGhpcy51dHhvcylcbiAgICBpZiAodHlwZW9mIHV0eG9pZHMgIT09ICd1bmRlZmluZWQnICYmIEFycmF5LmlzQXJyYXkodXR4b2lkcykpIHtcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB1dHhvaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh1dHhvaWRzW2ldIGluIHRoaXMudXR4b3MpIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2godGhpcy51dHhvc1t1dHhvaWRzW2ldXS50b1N0cmluZygpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAoY29uc3QgdSBvZiB1dHhvcykge1xuICAgICAgICByZXN1bHRzLnB1c2godGhpcy51dHhvc1t1XS50b1N0cmluZygpKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0c1xuICB9XG5cbiAgLyoqXG4gICAgICogR2l2ZW4gYW4gYWRkcmVzcyBvciBhcnJheSBvZiBhZGRyZXNzZXMsIHJldHVybnMgYWxsIHRoZSBVVFhPSURzIGZvciB0aG9zZSBhZGRyZXNzZXNcbiAgICAgKlxuICAgICAqIEBwYXJhbSBhZGRyZXNzIEFuIGFycmF5IG9mIGFkZHJlc3Mge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1zXG4gICAgICogQHBhcmFtIHNwZW5kYWJsZSBJZiB0cnVlLCBvbmx5IHJldHJpZXZlcyBVVFhPSURzIHdob3NlIGxvY2t0aW1lIGhhcyBwYXNzZWRcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIGFkZHJlc3Nlcy5cbiAgICAgKi9cbiAgZ2V0VVRYT0lEcyA9IChhZGRyZXNzZXM6IEJ1ZmZlcltdID0gdW5kZWZpbmVkLCBzcGVuZGFibGU6IGJvb2xlYW4gPSB0cnVlKTogc3RyaW5nW10gPT4ge1xuICAgIGlmICh0eXBlb2YgYWRkcmVzc2VzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc3QgcmVzdWx0czogc3RyaW5nW10gPSBbXVxuICAgICAgY29uc3Qgbm93OiBCTiA9IFVuaXhOb3coKVxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFkZHJlc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoYWRkcmVzc2VzW2ldLnRvU3RyaW5nKCdoZXgnKSBpbiB0aGlzLmFkZHJlc3NVVFhPcykge1xuICAgICAgICAgIGNvbnN0IGVudHJpZXMgPSBPYmplY3QuZW50cmllcyh0aGlzLmFkZHJlc3NVVFhPc1thZGRyZXNzZXNbaV0udG9TdHJpbmcoJ2hleCcpXSlcbiAgICAgICAgICBmb3IgKGNvbnN0IFt1dHhvaWQsIGxvY2t0aW1lXSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgICBpZiAoKHJlc3VsdHMuaW5kZXhPZih1dHhvaWQpID09PSAtMVxuICAgICAgICAgICAgJiYgKHNwZW5kYWJsZSAmJiBsb2NrdGltZS5sdGUobm93KSkpXG4gICAgICAgICAgICB8fCAhc3BlbmRhYmxlKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHMucHVzaCh1dHhvaWQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0c1xuICAgIH1cbiAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy51dHhvcylcbiAgfVxuXG4gIC8qKlxuICAgICAqIEdldHMgdGhlIGFkZHJlc3NlcyBpbiB0aGUgW1tTdGFuZGFyZFVUWE9TZXRdXSBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfS5cbiAgICAgKi9cbiAgZ2V0QWRkcmVzc2VzID0gKCk6IEJ1ZmZlcltdID0+IE9iamVjdC5rZXlzKHRoaXMuYWRkcmVzc1VUWE9zKVxuICAgIC5tYXAoKGspID0+IEJ1ZmZlci5mcm9tKGssICdoZXgnKSlcblxuICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBiYWxhbmNlIG9mIGEgc2V0IG9mIGFkZHJlc3NlcyBpbiB0aGUgU3RhbmRhcmRVVFhPU2V0LlxuICAgICAqXG4gICAgICogQHBhcmFtIGFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXNcbiAgICAgKiBAcGFyYW0gYXNzZXRJRCBFaXRoZXIgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBhbiBjYjU4IHNlcmlhbGl6ZWQgcmVwcmVzZW50YXRpb24gb2YgYW4gQXNzZXRJRFxuICAgICAqIEBwYXJhbSBhc09mIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgdGhlIHRvdGFsIGJhbGFuY2UgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfS5cbiAgICAgKi9cbiAgZ2V0QmFsYW5jZSA9IChhZGRyZXNzZXM6IEJ1ZmZlcltdLCBhc3NldElEOiBCdWZmZXIgfCBzdHJpbmcsIGFzT2Y6IEJOID0gdW5kZWZpbmVkKTogQk4gPT4ge1xuICAgIGNvbnN0IHV0eG9pZHM6IHN0cmluZ1tdID0gdGhpcy5nZXRVVFhPSURzKGFkZHJlc3NlcylcbiAgICBjb25zdCB1dHhvczogU3RhbmRhcmRVVFhPW10gPSB0aGlzLmdldEFsbFVUWE9zKHV0eG9pZHMpXG4gICAgbGV0IHNwZW5kOiBCTiA9IG5ldyBCTigwKVxuICAgIGxldCBhc3NldDogQnVmZmVyXG4gICAgaWYgKHR5cGVvZiBhc3NldElEID09PSAnc3RyaW5nJykge1xuICAgICAgYXNzZXQgPSBiaW50b29scy5jYjU4RGVjb2RlKGFzc2V0SUQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2V0ID0gYXNzZXRJRFxuICAgIH1cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdXR4b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh1dHhvc1tpXS5nZXRPdXRwdXQoKSBpbnN0YW5jZW9mIFN0YW5kYXJkQW1vdW50T3V0cHV0XG4gICAgICAmJiB1dHhvc1tpXS5nZXRBc3NldElEKCkudG9TdHJpbmcoJ2hleCcpID09PSBhc3NldC50b1N0cmluZygnaGV4JylcbiAgICAgICYmIHV0eG9zW2ldLmdldE91dHB1dCgpLm1lZXRzVGhyZXNob2xkKGFkZHJlc3NlcywgYXNPZikpIHtcbiAgICAgICAgc3BlbmQgPSBzcGVuZC5hZGQoKHV0eG9zW2ldLmdldE91dHB1dCgpIGFzIFN0YW5kYXJkQW1vdW50T3V0cHV0KS5nZXRBbW91bnQoKSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNwZW5kXG4gIH1cblxuICAvKipcbiAgICAgKiBHZXRzIGFsbCB0aGUgQXNzZXQgSURzLCBvcHRpb25hbGx5IHRoYXQgbWF0Y2ggd2l0aCBBc3NldCBJRHMgaW4gYW4gYXJyYXlcbiAgICAgKlxuICAgICAqIEBwYXJhbSB1dHhvaWRzIEFuIG9wdGlvbmFsIGFycmF5IG9mIEFkZHJlc3NlcyBhcyBzdHJpbmcgb3IgQnVmZmVyLCByZXR1cm5zIGFsbCBBc3NldCBJRHMgaWYgbm90IHByb3ZpZGVkXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRpbmcgdGhlIEFzc2V0IElEcy5cbiAgICAgKi9cbiAgZ2V0QXNzZXRJRHMgPSAoYWRkcmVzc2VzOiBCdWZmZXJbXSA9IHVuZGVmaW5lZCk6IEJ1ZmZlcltdID0+IHtcbiAgICBjb25zdCByZXN1bHRzOiBTZXQ8QnVmZmVyPiA9IG5ldyBTZXQoKVxuICAgIGxldCB1dHhvaWRzOiBzdHJpbmdbXSA9IFtdXG4gICAgaWYgKHR5cGVvZiBhZGRyZXNzZXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB1dHhvaWRzID0gdGhpcy5nZXRVVFhPSURzKGFkZHJlc3NlcylcbiAgICB9IGVsc2Uge1xuICAgICAgdXR4b2lkcyA9IHRoaXMuZ2V0VVRYT0lEcygpXG4gICAgfVxuXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHV0eG9pZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh1dHhvaWRzW2ldIGluIHRoaXMudXR4b3MgJiYgISh1dHhvaWRzW2ldIGluIHJlc3VsdHMpKSB7XG4gICAgICAgIHJlc3VsdHMuYWRkKHRoaXMudXR4b3NbdXR4b2lkc1tpXV0uZ2V0QXNzZXRJRCgpKVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBbLi4ucmVzdWx0c11cbiAgfVxuXG4gIGFic3RyYWN0IGNsb25lKCk6IHRoaXNcblxuICBhYnN0cmFjdCBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzXG5cbiAgZmlsdGVyKGFyZ3M6IGFueVtdLCBsYW1iZGE6ICh1dHhvOiBVVFhPQ2xhc3MsIC4uLmxhcmdzOiBhbnlbXSkgPT4gYm9vbGVhbik6IHRoaXMge1xuICAgIGxldCBuZXdzZXQ6IHRoaXMgPSB0aGlzLmNsb25lKClcbiAgICBsZXQgdXR4b3M6IFVUWE9DbGFzc1tdID0gdGhpcy5nZXRBbGxVVFhPcygpXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHV0eG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZihsYW1iZGEodXR4b3NbaV0sIC4uLmFyZ3MpID09PSBmYWxzZSkge1xuICAgICAgICBuZXdzZXQucmVtb3ZlKHV0eG9zW2ldKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3c2V0XG4gIH1cblxuICAvKipcbiAgICAgKiBSZXR1cm5zIGEgbmV3IHNldCB3aXRoIGNvcHkgb2YgVVRYT3MgaW4gdGhpcyBhbmQgc2V0IHBhcmFtZXRlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1dHhvc2V0IFRoZSBbW1N0YW5kYXJkVVRYT1NldF1dIHRvIG1lcmdlIHdpdGggdGhpcyBvbmVcbiAgICAgKiBAcGFyYW0gaGFzVVRYT0lEcyBXaWxsIHN1YnNlbGVjdCBhIHNldCBvZiBbW1N0YW5kYXJkVVRYT11dcyB3aGljaCBoYXZlIHRoZSBVVFhPSURzIHByb3ZpZGVkIGluIHRoaXMgYXJyYXksIGRlZnVsdHMgdG8gYWxsIFVUWE9zXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIG5ldyBTdGFuZGFyZFVUWE9TZXQgdGhhdCBjb250YWlucyBhbGwgdGhlIGZpbHRlcmVkIGVsZW1lbnRzLlxuICAgICAqL1xuICBtZXJnZSA9ICh1dHhvc2V0OiB0aGlzLCBoYXNVVFhPSURzOiBzdHJpbmdbXSA9IHVuZGVmaW5lZCk6IHRoaXMgPT4ge1xuICAgIGNvbnN0IHJlc3VsdHM6IHRoaXMgPSB0aGlzLmNyZWF0ZSgpXG4gICAgY29uc3QgdXR4b3MxOiBVVFhPQ2xhc3NbXSA9IHRoaXMuZ2V0QWxsVVRYT3MoaGFzVVRYT0lEcylcbiAgICBjb25zdCB1dHhvczI6IFVUWE9DbGFzc1tdID0gdXR4b3NldC5nZXRBbGxVVFhPcyhoYXNVVFhPSURzKVxuICAgIGNvbnN0IHByb2Nlc3MgPSAodXR4bzpVVFhPQ2xhc3MpID0+IHtcbiAgICAgIHJlc3VsdHMuYWRkKHV0eG8pXG4gICAgfVxuICAgIHV0eG9zMS5mb3JFYWNoKHByb2Nlc3MpXG4gICAgdXR4b3MyLmZvckVhY2gocHJvY2VzcylcbiAgICByZXR1cm4gcmVzdWx0cyBhcyB0aGlzXG4gIH1cblxuICAvKipcbiAgICAgKiBTZXQgaW50ZXJzZXRpb24gYmV0d2VlbiB0aGlzIHNldCBhbmQgYSBwYXJhbWV0ZXIuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXR4b3NldCBUaGUgc2V0IHRvIGludGVyc2VjdFxuICAgICAqXG4gICAgICogQHJldHVybnMgQSBuZXcgU3RhbmRhcmRVVFhPU2V0IGNvbnRhaW5pbmcgdGhlIGludGVyc2VjdGlvblxuICAgICAqL1xuICBpbnRlcnNlY3Rpb24gPSAodXR4b3NldDogdGhpcyk6IHRoaXMgPT4ge1xuICAgIGNvbnN0IHVzMTogc3RyaW5nW10gPSB0aGlzLmdldFVUWE9JRHMoKVxuICAgIGNvbnN0IHVzMjogc3RyaW5nW10gPSB1dHhvc2V0LmdldFVUWE9JRHMoKVxuICAgIGNvbnN0IHJlc3VsdHM6IHN0cmluZ1tdID0gdXMxLmZpbHRlcigodXR4b2lkKSA9PiB1czIuaW5jbHVkZXModXR4b2lkKSlcbiAgICByZXR1cm4gdGhpcy5tZXJnZSh1dHhvc2V0LCByZXN1bHRzKSBhcyB0aGlzXG4gIH1cblxuICAvKipcbiAgICAgKiBTZXQgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoaXMgc2V0IGFuZCBhIHBhcmFtZXRlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1dHhvc2V0IFRoZSBzZXQgdG8gZGlmZmVyZW5jZVxuICAgICAqXG4gICAgICogQHJldHVybnMgQSBuZXcgU3RhbmRhcmRVVFhPU2V0IGNvbnRhaW5pbmcgdGhlIGRpZmZlcmVuY2VcbiAgICAgKi9cbiAgZGlmZmVyZW5jZSA9ICh1dHhvc2V0OiB0aGlzKTogdGhpcyA9PiB7XG4gICAgY29uc3QgdXMxOiBzdHJpbmdbXSA9IHRoaXMuZ2V0VVRYT0lEcygpXG4gICAgY29uc3QgdXMyOiBzdHJpbmdbXSA9IHV0eG9zZXQuZ2V0VVRYT0lEcygpXG4gICAgY29uc3QgcmVzdWx0czogc3RyaW5nW10gPSB1czEuZmlsdGVyKCh1dHhvaWQpID0+ICF1czIuaW5jbHVkZXModXR4b2lkKSlcbiAgICByZXR1cm4gdGhpcy5tZXJnZSh1dHhvc2V0LCByZXN1bHRzKSBhcyB0aGlzXG4gIH1cblxuICAvKipcbiAgICAgKiBTZXQgc3ltbWV0cmljYWwgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoaXMgc2V0IGFuZCBhIHBhcmFtZXRlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1dHhvc2V0IFRoZSBzZXQgdG8gc3ltbWV0cmljYWwgZGlmZmVyZW5jZVxuICAgICAqXG4gICAgICogQHJldHVybnMgQSBuZXcgU3RhbmRhcmRVVFhPU2V0IGNvbnRhaW5pbmcgdGhlIHN5bW1ldHJpY2FsIGRpZmZlcmVuY2VcbiAgICAgKi9cbiAgc3ltRGlmZmVyZW5jZSA9ICh1dHhvc2V0OiB0aGlzKTogdGhpcyA9PiB7XG4gICAgY29uc3QgdXMxOiBzdHJpbmdbXSA9IHRoaXMuZ2V0VVRYT0lEcygpXG4gICAgY29uc3QgdXMyOiBzdHJpbmdbXSA9IHV0eG9zZXQuZ2V0VVRYT0lEcygpXG4gICAgY29uc3QgcmVzdWx0czogc3RyaW5nW10gPSB1czEuZmlsdGVyKCh1dHhvaWQpID0+ICF1czIuaW5jbHVkZXModXR4b2lkKSlcbiAgICAgIC5jb25jYXQodXMyLmZpbHRlcigodXR4b2lkKSA9PiAhdXMxLmluY2x1ZGVzKHV0eG9pZCkpKVxuICAgIHJldHVybiB0aGlzLm1lcmdlKHV0eG9zZXQsIHJlc3VsdHMpIGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgICAqIFNldCB1bmlvbiBiZXR3ZWVuIHRoaXMgc2V0IGFuZCBhIHBhcmFtZXRlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1dHhvc2V0IFRoZSBzZXQgdG8gdW5pb25cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgbmV3IFN0YW5kYXJkVVRYT1NldCBjb250YWluaW5nIHRoZSB1bmlvblxuICAgICAqL1xuICB1bmlvbiA9ICh1dHhvc2V0OiB0aGlzKTogdGhpcyA9PiB0aGlzLm1lcmdlKHV0eG9zZXQpIGFzIHRoaXNcblxuICAvKipcbiAgICAgKiBNZXJnZXMgYSBzZXQgYnkgdGhlIHJ1bGUgcHJvdmlkZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXR4b3NldCBUaGUgc2V0IHRvIG1lcmdlIGJ5IHRoZSBNZXJnZVJ1bGVcbiAgICAgKiBAcGFyYW0gbWVyZ2VSdWxlIFRoZSBbW01lcmdlUnVsZV1dIHRvIGFwcGx5XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIG5ldyBTdGFuZGFyZFVUWE9TZXQgY29udGFpbmluZyB0aGUgbWVyZ2VkIGRhdGFcbiAgICAgKlxuICAgICAqIEByZW1hcmtzXG4gICAgICogVGhlIG1lcmdlIHJ1bGVzIGFyZSBhcyBmb2xsb3dzOlxuICAgICAqICAgKiBcImludGVyc2VjdGlvblwiIC0gdGhlIGludGVyc2VjdGlvbiBvZiB0aGUgc2V0XG4gICAgICogICAqIFwiZGlmZmVyZW5jZVNlbGZcIiAtIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gdGhlIGV4aXN0aW5nIGRhdGEgYW5kIG5ldyBzZXRcbiAgICAgKiAgICogXCJkaWZmZXJlbmNlTmV3XCIgLSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBuZXcgZGF0YSBhbmQgdGhlIGV4aXN0aW5nIHNldFxuICAgICAqICAgKiBcInN5bURpZmZlcmVuY2VcIiAtIHRoZSB1bmlvbiBvZiB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbiBib3RoIHNldHMgb2YgZGF0YVxuICAgICAqICAgKiBcInVuaW9uXCIgLSB0aGUgdW5pcXVlIHNldCBvZiBhbGwgZWxlbWVudHMgY29udGFpbmVkIGluIGJvdGggc2V0c1xuICAgICAqICAgKiBcInVuaW9uTWludXNOZXdcIiAtIHRoZSB1bmlxdWUgc2V0IG9mIGFsbCBlbGVtZW50cyBjb250YWluZWQgaW4gYm90aCBzZXRzLCBleGNsdWRpbmcgdmFsdWVzIG9ubHkgZm91bmQgaW4gdGhlIG5ldyBzZXRcbiAgICAgKiAgICogXCJ1bmlvbk1pbnVzU2VsZlwiIC0gdGhlIHVuaXF1ZSBzZXQgb2YgYWxsIGVsZW1lbnRzIGNvbnRhaW5lZCBpbiBib3RoIHNldHMsIGV4Y2x1ZGluZyB2YWx1ZXMgb25seSBmb3VuZCBpbiB0aGUgZXhpc3Rpbmcgc2V0XG4gICAgICovXG4gIG1lcmdlQnlSdWxlID0gKHV0eG9zZXQ6IHRoaXMsIG1lcmdlUnVsZTogTWVyZ2VSdWxlKTogdGhpcyA9PiB7XG4gICAgbGV0IHVTZXQ6IHRoaXNcbiAgICBzd2l0Y2ggKG1lcmdlUnVsZSkge1xuICAgICAgY2FzZSAnaW50ZXJzZWN0aW9uJzpcbiAgICAgICAgcmV0dXJuIHRoaXMuaW50ZXJzZWN0aW9uKHV0eG9zZXQpXG4gICAgICBjYXNlICdkaWZmZXJlbmNlU2VsZic6XG4gICAgICAgIHJldHVybiB0aGlzLmRpZmZlcmVuY2UodXR4b3NldClcbiAgICAgIGNhc2UgJ2RpZmZlcmVuY2VOZXcnOlxuICAgICAgICByZXR1cm4gdXR4b3NldC5kaWZmZXJlbmNlKHRoaXMpIGFzIHRoaXNcbiAgICAgIGNhc2UgJ3N5bURpZmZlcmVuY2UnOlxuICAgICAgICByZXR1cm4gdGhpcy5zeW1EaWZmZXJlbmNlKHV0eG9zZXQpXG4gICAgICBjYXNlICd1bmlvbic6XG4gICAgICAgIHJldHVybiB0aGlzLnVuaW9uKHV0eG9zZXQpXG4gICAgICBjYXNlICd1bmlvbk1pbnVzTmV3JzpcbiAgICAgICAgdVNldCA9IHRoaXMudW5pb24odXR4b3NldClcbiAgICAgICAgcmV0dXJuIHVTZXQuZGlmZmVyZW5jZSh1dHhvc2V0KSBhcyB0aGlzXG4gICAgICBjYXNlICd1bmlvbk1pbnVzU2VsZic6XG4gICAgICAgIHVTZXQgPSB0aGlzLnVuaW9uKHV0eG9zZXQpXG4gICAgICAgIHJldHVybiB1U2V0LmRpZmZlcmVuY2UodGhpcykgYXMgdGhpc1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IE1lcmdlUnVsZUVycm9yKFwiRXJyb3IgLSBTdGFuZGFyZFVUWE9TZXQubWVyZ2VCeVJ1bGU6IGJhZCBNZXJnZVJ1bGVcIilcbiAgICB9XG4gIH1cbn1cbiJdfQ==