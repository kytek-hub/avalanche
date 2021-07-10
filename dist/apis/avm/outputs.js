"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTTransferOutput = exports.NFTMintOutput = exports.SECPMintOutput = exports.SECPTransferOutput = exports.NFTOutput = exports.AmountOutput = exports.TransferableOutput = exports.SelectOutputClass = void 0;
/**
 * @packageDocumentation
 * @module API-AVM-Outputs
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const output_1 = require("../../common/output");
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Takes a buffer representing the output and returns the proper Output instance.
 *
 * @param outputid A number representing the inputID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Output]]-extended class.
 */
exports.SelectOutputClass = (outputid, ...args) => {
    if (outputid === constants_1.AVMConstants.SECPXFEROUTPUTID || outputid === constants_1.AVMConstants.SECPXFEROUTPUTID_CODECONE) {
        return new SECPTransferOutput(...args);
    }
    else if (outputid === constants_1.AVMConstants.SECPMINTOUTPUTID || outputid === constants_1.AVMConstants.SECPMINTOUTPUTID_CODECONE) {
        return new SECPMintOutput(...args);
    }
    else if (outputid === constants_1.AVMConstants.NFTMINTOUTPUTID || outputid === constants_1.AVMConstants.NFTMINTOUTPUTID_CODECONE) {
        return new NFTMintOutput(...args);
    }
    else if (outputid === constants_1.AVMConstants.NFTXFEROUTPUTID || outputid === constants_1.AVMConstants.NFTXFEROUTPUTID_CODECONE) {
        return new NFTTransferOutput(...args);
    }
    throw new errors_1.OutputIdError("Error - SelectOutputClass: unknown outputid " + outputid);
};
class TransferableOutput extends output_1.StandardTransferableOutput {
    constructor() {
        super(...arguments);
        this._typeName = "TransferableOutput";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.output = exports.SelectOutputClass(fields["output"]["_typeID"]);
        this.output.deserialize(fields["output"], encoding);
    }
    fromBuffer(bytes, offset = 0) {
        this.assetID = bintools.copyFrom(bytes, offset, offset + constants_1.AVMConstants.ASSETIDLEN);
        offset += constants_1.AVMConstants.ASSETIDLEN;
        const outputid = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.output = exports.SelectOutputClass(outputid);
        return this.output.fromBuffer(bytes, offset);
    }
}
exports.TransferableOutput = TransferableOutput;
class AmountOutput extends output_1.StandardAmountOutput {
    constructor() {
        super(...arguments);
        this._typeName = "AmountOutput";
        this._typeID = undefined;
    }
    //serialize and deserialize both are inherited
    /**
     *
     * @param assetID An assetID which is wrapped around the Buffer of the Output
     */
    makeTransferable(assetID) {
        return new TransferableOutput(assetID, this);
    }
    select(id, ...args) {
        return exports.SelectOutputClass(id, ...args);
    }
}
exports.AmountOutput = AmountOutput;
class NFTOutput extends output_1.BaseNFTOutput {
    constructor() {
        super(...arguments);
        this._typeName = "NFTOutput";
        this._typeID = undefined;
    }
    //serialize and deserialize both are inherited
    /**
     *
     * @param assetID An assetID which is wrapped around the Buffer of the Output
     */
    makeTransferable(assetID) {
        return new TransferableOutput(assetID, this);
    }
    select(id, ...args) {
        return exports.SelectOutputClass(id, ...args);
    }
}
exports.NFTOutput = NFTOutput;
/**
 * An [[Output]] class which specifies an Output that carries an ammount for an assetID and uses secp256k1 signature scheme.
 */
class SECPTransferOutput extends AmountOutput {
    constructor() {
        super(...arguments);
        this._typeName = "SECPTransferOutput";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.SECPXFEROUTPUTID : constants_1.AVMConstants.SECPXFEROUTPUTID_CODECONE;
    }
    //serialize and deserialize both are inherited
    /**
    * Set the codecID
    *
    * @param codecID The codecID to set
    */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - SECPTransferOutput.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.SECPXFEROUTPUTID : constants_1.AVMConstants.SECPXFEROUTPUTID_CODECONE;
    }
    /**
       * Returns the outputID for this output
       */
    getOutputID() {
        return this._typeID;
    }
    create(...args) {
        return new SECPTransferOutput(...args);
    }
    clone() {
        const newout = this.create();
        newout.fromBuffer(this.toBuffer());
        return newout;
    }
}
exports.SECPTransferOutput = SECPTransferOutput;
/**
 * An [[Output]] class which specifies an Output that carries an ammount for an assetID and uses secp256k1 signature scheme.
 */
class SECPMintOutput extends output_1.Output {
    constructor() {
        super(...arguments);
        this._typeName = "SECPMintOutput";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.SECPMINTOUTPUTID : constants_1.AVMConstants.SECPMINTOUTPUTID_CODECONE;
    }
    //serialize and deserialize both are inherited
    /**
    * Set the codecID
    *
    * @param codecID The codecID to set
    */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - SECPMintOutput.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.SECPMINTOUTPUTID : constants_1.AVMConstants.SECPMINTOUTPUTID_CODECONE;
    }
    /**
     * Returns the outputID for this output
     */
    getOutputID() {
        return this._typeID;
    }
    /**
     *
     * @param assetID An assetID which is wrapped around the Buffer of the Output
     */
    makeTransferable(assetID) {
        return new TransferableOutput(assetID, this);
    }
    create(...args) {
        return new SECPMintOutput(...args);
    }
    clone() {
        const newout = this.create();
        newout.fromBuffer(this.toBuffer());
        return newout;
    }
    select(id, ...args) {
        return exports.SelectOutputClass(id, ...args);
    }
}
exports.SECPMintOutput = SECPMintOutput;
/**
 * An [[Output]] class which specifies an Output that carries an NFT Mint and uses secp256k1 signature scheme.
 */
class NFTMintOutput extends NFTOutput {
    /**
     * An [[Output]] class which contains an NFT mint for an assetID.
     *
     * @param groupID A number specifies the group this NFT is issued to
     * @param locktime A {@link https://github.com/indutny/bn.js/|BN} representing the locktime
     * @param threshold A number representing the the threshold number of signers required to sign the transaction
     * @param addresses An array of {@link https://github.com/feross/buffer|Buffer}s representing addresses
     */
    constructor(groupID = undefined, addresses = undefined, locktime = undefined, threshold = undefined) {
        super(addresses, locktime, threshold);
        this._typeName = "NFTMintOutput";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.NFTMINTOUTPUTID : constants_1.AVMConstants.NFTMINTOUTPUTID_CODECONE;
        if (typeof groupID !== 'undefined') {
            this.groupID.writeUInt32BE(groupID, 0);
        }
    }
    //serialize and deserialize both are inherited
    /**
    * Set the codecID
    *
    * @param codecID The codecID to set
    */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - NFTMintOutput.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.NFTMINTOUTPUTID : constants_1.AVMConstants.NFTMINTOUTPUTID_CODECONE;
    }
    /**
     * Returns the outputID for this output
     */
    getOutputID() {
        return this._typeID;
    }
    /**
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[NFTMintOutput]] and returns the size of the output.
     */
    fromBuffer(utxobuff, offset = 0) {
        this.groupID = bintools.copyFrom(utxobuff, offset, offset + 4);
        offset += 4;
        return super.fromBuffer(utxobuff, offset);
    }
    /**
     * Returns the buffer representing the [[NFTMintOutput]] instance.
     */
    toBuffer() {
        let superbuff = super.toBuffer();
        let bsize = this.groupID.length + superbuff.length;
        let barr = [this.groupID, superbuff];
        return buffer_1.Buffer.concat(barr, bsize);
    }
    create(...args) {
        return new NFTMintOutput(...args);
    }
    clone() {
        const newout = this.create();
        newout.fromBuffer(this.toBuffer());
        return newout;
    }
}
exports.NFTMintOutput = NFTMintOutput;
/**
 * An [[Output]] class which specifies an Output that carries an NFT and uses secp256k1 signature scheme.
 */
class NFTTransferOutput extends NFTOutput {
    /**
       * An [[Output]] class which contains an NFT on an assetID.
       *
       * @param groupID A number representing the amount in the output
       * @param payload A {@link https://github.com/feross/buffer|Buffer} of max length 1024
       * @param addresses An array of {@link https://github.com/feross/buffer|Buffer}s representing addresses
       * @param locktime A {@link https://github.com/indutny/bn.js/|BN} representing the locktime
       * @param threshold A number representing the the threshold number of signers required to sign the transaction
  
       */
    constructor(groupID = undefined, payload = undefined, addresses = undefined, locktime = undefined, threshold = undefined) {
        super(addresses, locktime, threshold);
        this._typeName = "NFTTransferOutput";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.NFTXFEROUTPUTID : constants_1.AVMConstants.NFTXFEROUTPUTID_CODECONE;
        this.sizePayload = buffer_1.Buffer.alloc(4);
        /**
         * Returns the payload as a {@link https://github.com/feross/buffer|Buffer} with content only.
         */
        this.getPayload = () => bintools.copyFrom(this.payload);
        /**
         * Returns the payload as a {@link https://github.com/feross/buffer|Buffer} with length of payload prepended.
         */
        this.getPayloadBuffer = () => buffer_1.Buffer.concat([bintools.copyFrom(this.sizePayload), bintools.copyFrom(this.payload)]);
        if (typeof groupID !== 'undefined' && typeof payload !== 'undefined') {
            this.groupID.writeUInt32BE(groupID, 0);
            this.sizePayload.writeUInt32BE(payload.length, 0);
            this.payload = bintools.copyFrom(payload, 0, payload.length);
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "payload": serialization.encoder(this.payload, encoding, "Buffer", "hex", this.payload.length) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.payload = serialization.decoder(fields["payload"], encoding, "hex", "Buffer");
        this.sizePayload = buffer_1.Buffer.alloc(4);
        this.sizePayload.writeUInt32BE(this.payload.length, 0);
    }
    /**
    * Set the codecID
    *
    * @param codecID The codecID to set
    */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - NFTTransferOutput.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.NFTXFEROUTPUTID : constants_1.AVMConstants.NFTXFEROUTPUTID_CODECONE;
    }
    /**
     * Returns the outputID for this output
     */
    getOutputID() {
        return this._typeID;
    }
    /**
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[NFTTransferOutput]] and returns the size of the output.
     */
    fromBuffer(utxobuff, offset = 0) {
        this.groupID = bintools.copyFrom(utxobuff, offset, offset + 4);
        offset += 4;
        this.sizePayload = bintools.copyFrom(utxobuff, offset, offset + 4);
        let psize = this.sizePayload.readUInt32BE(0);
        offset += 4;
        this.payload = bintools.copyFrom(utxobuff, offset, offset + psize);
        offset = offset + psize;
        return super.fromBuffer(utxobuff, offset);
    }
    /**
     * Returns the buffer representing the [[NFTTransferOutput]] instance.
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        const bsize = this.groupID.length + this.sizePayload.length + this.payload.length + superbuff.length;
        this.sizePayload.writeUInt32BE(this.payload.length, 0);
        const barr = [this.groupID, this.sizePayload, this.payload, superbuff];
        return buffer_1.Buffer.concat(barr, bsize);
    }
    create(...args) {
        return new NFTTransferOutput(...args);
    }
    clone() {
        const newout = this.create();
        newout.fromBuffer(this.toBuffer());
        return newout;
    }
}
exports.NFTTransferOutput = NFTTransferOutput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hcGlzL2F2bS9vdXRwdXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUVoQyxvRUFBMkM7QUFDM0MsMkNBQTBDO0FBQzFDLGdEQUE2RztBQUM3Ryw2REFBNkU7QUFDN0UsK0NBQWdFO0FBRWhFLE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFaEU7Ozs7OztHQU1HO0FBQ1UsUUFBQSxpQkFBaUIsR0FBRyxDQUFDLFFBQWdCLEVBQUUsR0FBRyxJQUFXLEVBQVUsRUFBRTtJQUMxRSxJQUFHLFFBQVEsS0FBSyx3QkFBWSxDQUFDLGdCQUFnQixJQUFJLFFBQVEsS0FBSyx3QkFBWSxDQUFDLHlCQUF5QixFQUFDO1FBQ25HLE9BQU8sSUFBSSxrQkFBa0IsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO0tBQ3ZDO1NBQU0sSUFBRyxRQUFRLEtBQUssd0JBQVksQ0FBQyxnQkFBZ0IsSUFBSSxRQUFRLEtBQUssd0JBQVksQ0FBQyx5QkFBeUIsRUFBQztRQUMxRyxPQUFPLElBQUksY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7S0FDbkM7U0FBTSxJQUFHLFFBQVEsS0FBSyx3QkFBWSxDQUFDLGVBQWUsSUFBSSxRQUFRLEtBQUssd0JBQVksQ0FBQyx3QkFBd0IsRUFBQztRQUN4RyxPQUFPLElBQUksYUFBYSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7S0FDbEM7U0FBTSxJQUFHLFFBQVEsS0FBSyx3QkFBWSxDQUFDLGVBQWUsSUFBSSxRQUFRLEtBQUssd0JBQVksQ0FBQyx3QkFBd0IsRUFBQztRQUN4RyxPQUFPLElBQUksaUJBQWlCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUN0QztJ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QUFxQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDOUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtRQUNsQyxPQUFPLE1BQWMsQ0FBQTtJQUN2QixDQUFDO0NBb0JGO0FBNUdELDhDQTRHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1BVk0tT3V0cHV0c1xuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJ1xuaW1wb3J0IEJOIGZyb20gJ2JuLmpzJ1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uLy4uL3V0aWxzL2JpbnRvb2xzJ1xuaW1wb3J0IHsgQVZNQ29uc3RhbnRzIH0gZnJvbSAnLi9jb25zdGFudHMnXG5pbXBvcnQgeyBPdXRwdXQsIFN0YW5kYXJkQW1vdW50T3V0cHV0LCBTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dCwgQmFzZU5GVE91dHB1dCB9IGZyb20gJy4uLy4uL2NvbW1vbi9vdXRwdXQnXG5pbXBvcnQgeyBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tICcuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uJ1xuaW1wb3J0IHsgT3V0cHV0SWRFcnJvciwgQ29kZWNJZEVycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvZXJyb3JzJ1xuXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogVGFrZXMgYSBidWZmZXIgcmVwcmVzZW50aW5nIHRoZSBvdXRwdXQgYW5kIHJldHVybnMgdGhlIHByb3BlciBPdXRwdXQgaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIG91dHB1dGlkIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgaW5wdXRJRCBwYXJzZWQgcHJpb3IgdG8gdGhlIGJ5dGVzIHBhc3NlZCBpblxuICpcbiAqIEByZXR1cm5zIEFuIGluc3RhbmNlIG9mIGFuIFtbT3V0cHV0XV0tZXh0ZW5kZWQgY2xhc3MuXG4gKi9cbmV4cG9ydCBjb25zdCBTZWxlY3RPdXRwdXRDbGFzcyA9IChvdXRwdXRpZDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IE91dHB1dCA9PiB7XG4gICAgaWYob3V0cHV0aWQgPT09IEFWTUNvbnN0YW50cy5TRUNQWEZFUk9VVFBVVElEIHx8IG91dHB1dGlkID09PSBBVk1Db25zdGFudHMuU0VDUFhGRVJPVVRQVVRJRF9DT0RFQ09ORSl7XG4gICAgICByZXR1cm4gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dCguLi5hcmdzKVxuICAgIH0gZWxzZSBpZihvdXRwdXRpZCA9PT0gQVZNQ29uc3RhbnRzLlNFQ1BNSU5UT1VUUFVUSUQgfHwgb3V0cHV0aWQgPT09IEFWTUNvbnN0YW50cy5TRUNQTUlOVE9VVFBVVElEX0NPREVDT05FKXtcbiAgICAgIHJldHVybiBuZXcgU0VDUE1pbnRPdXRwdXQoLi4uYXJncylcbiAgICB9IGVsc2UgaWYob3V0cHV0aWQgPT09IEFWTUNvbnN0YW50cy5ORlRNSU5UT1VUUFVUSUQgfHwgb3V0cHV0aWQgPT09IEFWTUNvbnN0YW50cy5ORlRNSU5UT1VUUFVUSURfQ09ERUNPTkUpe1xuICAgICAgcmV0dXJuIG5ldyBORlRNaW50T3V0cHV0KC4uLmFyZ3MpXG4gICAgfSBlbHNlIGlmKG91dHB1dGlkID09PSBBVk1Db25zdGFudHMuTkZUWEZFUk9VVFBVVElEIHx8IG91dHB1dGlkID09PSBBVk1Db25zdGFudHMuTkZUWEZFUk9VVFBVVElEX0NPREVDT05FKXtcbiAgICAgIHJldHVybiBuZXcgTkZUVHJhbnNmZXJPdXRwdXQoLi4uYXJncylcbiAgICB9XG4gIHRocm93IG5ldyBPdXRwdXRJZEVycm9yKFwiRXJyb3IgLSBTZWxlY3RPdXRwdXRDbGFzczogdW5rbm93biBvdXRwdXRpZCBcIiArIG91dHB1dGlkKVxufVxuXG5leHBvcnQgY2xhc3MgVHJhbnNmZXJhYmxlT3V0cHV0IGV4dGVuZHMgU3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXR7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlRyYW5zZmVyYWJsZU91dHB1dFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLm91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKGZpZWxkc1tcIm91dHB1dFwiXVtcIl90eXBlSURcIl0pXG4gICAgdGhpcy5vdXRwdXQuZGVzZXJpYWxpemUoZmllbGRzW1wib3V0cHV0XCJdLCBlbmNvZGluZylcbiAgfVxuXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICB0aGlzLmFzc2V0SUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyBBVk1Db25zdGFudHMuQVNTRVRJRExFTilcbiAgICBvZmZzZXQgKz0gQVZNQ29uc3RhbnRzLkFTU0VUSURMRU5cbiAgICBjb25zdCBvdXRwdXRpZDogbnVtYmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCkucmVhZFVJbnQzMkJFKDApXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLm91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKG91dHB1dGlkKVxuICAgIHJldHVybiB0aGlzLm91dHB1dC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFtb3VudE91dHB1dCBleHRlbmRzIFN0YW5kYXJkQW1vdW50T3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiQW1vdW50T3V0cHV0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG4gIFxuICAvKipcbiAgICogXG4gICAqIEBwYXJhbSBhc3NldElEIEFuIGFzc2V0SUQgd2hpY2ggaXMgd3JhcHBlZCBhcm91bmQgdGhlIEJ1ZmZlciBvZiB0aGUgT3V0cHV0XG4gICAqL1xuICBtYWtlVHJhbnNmZXJhYmxlKGFzc2V0SUQ6IEJ1ZmZlcik6IFRyYW5zZmVyYWJsZU91dHB1dCB7XG4gICAgcmV0dXJuIG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYXNzZXRJRCwgdGhpcylcbiAgfVxuXG4gIHNlbGVjdChpZDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IE91dHB1dCB7XG4gICAgcmV0dXJuIFNlbGVjdE91dHB1dENsYXNzKGlkLCAuLi5hcmdzKVxuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBORlRPdXRwdXQgZXh0ZW5kcyBCYXNlTkZUT3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiTkZUT3V0cHV0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG5cbiAgLyoqXG4gICAqIFxuICAgKiBAcGFyYW0gYXNzZXRJRCBBbiBhc3NldElEIHdoaWNoIGlzIHdyYXBwZWQgYXJvdW5kIHRoZSBCdWZmZXIgb2YgdGhlIE91dHB1dFxuICAgKi9cbiAgbWFrZVRyYW5zZmVyYWJsZShhc3NldElEOkJ1ZmZlcik6VHJhbnNmZXJhYmxlT3V0cHV0IHtcbiAgICByZXR1cm4gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChhc3NldElELCB0aGlzKVxuICB9XG5cbiAgc2VsZWN0KGlkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogT3V0cHV0IHtcbiAgICByZXR1cm4gU2VsZWN0T3V0cHV0Q2xhc3MoaWQsIC4uLmFyZ3MpXG4gIH1cbn1cblxuLyoqXG4gKiBBbiBbW091dHB1dF1dIGNsYXNzIHdoaWNoIHNwZWNpZmllcyBhbiBPdXRwdXQgdGhhdCBjYXJyaWVzIGFuIGFtbW91bnQgZm9yIGFuIGFzc2V0SUQgYW5kIHVzZXMgc2VjcDI1NmsxIHNpZ25hdHVyZSBzY2hlbWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBTRUNQVHJhbnNmZXJPdXRwdXQgZXh0ZW5kcyBBbW91bnRPdXRwdXQge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTRUNQVHJhbnNmZXJPdXRwdXRcIlxuICBwcm90ZWN0ZWQgX2NvZGVjSUQgPSBBVk1Db25zdGFudHMuTEFURVNUQ09ERUNcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB0aGlzLl9jb2RlY0lEID09PSAwID8gQVZNQ29uc3RhbnRzLlNFQ1BYRkVST1VUUFVUSUQgOiBBVk1Db25zdGFudHMuU0VDUFhGRVJPVVRQVVRJRF9DT0RFQ09ORVxuXG4gIC8vc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBib3RoIGFyZSBpbmhlcml0ZWRcblxuICAvKipcbiAgKiBTZXQgdGhlIGNvZGVjSURcbiAgKlxuICAqIEBwYXJhbSBjb2RlY0lEIFRoZSBjb2RlY0lEIHRvIHNldFxuICAqL1xuICBzZXRDb2RlY0lEKGNvZGVjSUQ6IG51bWJlcik6IHZvaWQge1xuICAgIGlmKGNvZGVjSUQgIT09IDAgJiYgY29kZWNJRCAhPT0gMSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBDb2RlY0lkRXJyb3IoXCJFcnJvciAtIFNFQ1BUcmFuc2Zlck91dHB1dC5zZXRDb2RlY0lEOiBpbnZhbGlkIGNvZGVjSUQuIFZhbGlkIGNvZGVjSURzIGFyZSAwIGFuZCAxLlwiKVxuICAgIH1cbiAgICB0aGlzLl9jb2RlY0lEID0gY29kZWNJRFxuICAgIHRoaXMuX3R5cGVJRCA9IHRoaXMuX2NvZGVjSUQgPT09IDAgPyBBVk1Db25zdGFudHMuU0VDUFhGRVJPVVRQVVRJRCA6IEFWTUNvbnN0YW50cy5TRUNQWEZFUk9VVFBVVElEX0NPREVDT05FXG4gIH1cblxuICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBvdXRwdXRJRCBmb3IgdGhpcyBvdXRwdXRcbiAgICAgKi9cbiAgZ2V0T3V0cHV0SUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dCguLi5hcmdzKSBhcyB0aGlzXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdvdXQ6IFNFQ1BUcmFuc2Zlck91dHB1dCA9IHRoaXMuY3JlYXRlKClcbiAgICBuZXdvdXQuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpXG4gICAgcmV0dXJuIG5ld291dCBhcyB0aGlzXG4gIH1cbn1cblxuLyoqXG4gKiBBbiBbW091dHB1dF1dIGNsYXNzIHdoaWNoIHNwZWNpZmllcyBhbiBPdXRwdXQgdGhhdCBjYXJyaWVzIGFuIGFtbW91bnQgZm9yIGFuIGFzc2V0SUQgYW5kIHVzZXMgc2VjcDI1NmsxIHNpZ25hdHVyZSBzY2hlbWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBTRUNQTWludE91dHB1dCBleHRlbmRzIE91dHB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlNFQ1BNaW50T3V0cHV0XCJcbiAgcHJvdGVjdGVkIF9jb2RlY0lEID0gQVZNQ29uc3RhbnRzLkxBVEVTVENPREVDXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdGhpcy5fY29kZWNJRCA9PT0gMCA/IEFWTUNvbnN0YW50cy5TRUNQTUlOVE9VVFBVVElEIDogQVZNQ29uc3RhbnRzLlNFQ1BNSU5UT1VUUFVUSURfQ09ERUNPTkVcblxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG5cbiAgLyoqXG4gICogU2V0IHRoZSBjb2RlY0lEXG4gICpcbiAgKiBAcGFyYW0gY29kZWNJRCBUaGUgY29kZWNJRCB0byBzZXRcbiAgKi9cbiAgc2V0Q29kZWNJRChjb2RlY0lEOiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZihjb2RlY0lEICE9PSAwICYmIGNvZGVjSUQgIT09IDEpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgQ29kZWNJZEVycm9yKFwiRXJyb3IgLSBTRUNQTWludE91dHB1dC5zZXRDb2RlY0lEOiBpbnZhbGlkIGNvZGVjSUQuIFZhbGlkIGNvZGVjSURzIGFyZSAwIGFuZCAxLlwiKVxuICAgIH1cbiAgICB0aGlzLl9jb2RlY0lEID0gY29kZWNJRFxuICAgIHRoaXMuX3R5cGVJRCA9IHRoaXMuX2NvZGVjSUQgPT09IDAgPyBBVk1Db25zdGFudHMuU0VDUE1JTlRPVVRQVVRJRCA6IEFWTUNvbnN0YW50cy5TRUNQTUlOVE9VVFBVVElEX0NPREVDT05FXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3V0cHV0SUQgZm9yIHRoaXMgb3V0cHV0XG4gICAqL1xuICBnZXRPdXRwdXRJRCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIC8qKlxuICAgKiBcbiAgICogQHBhcmFtIGFzc2V0SUQgQW4gYXNzZXRJRCB3aGljaCBpcyB3cmFwcGVkIGFyb3VuZCB0aGUgQnVmZmVyIG9mIHRoZSBPdXRwdXRcbiAgICovXG4gIG1ha2VUcmFuc2ZlcmFibGUoYXNzZXRJRDogQnVmZmVyKTogVHJhbnNmZXJhYmxlT3V0cHV0IHtcbiAgICByZXR1cm4gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChhc3NldElELCB0aGlzKVxuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBTRUNQTWludE91dHB1dCguLi5hcmdzKSBhcyB0aGlzXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdvdXQ6U0VDUE1pbnRPdXRwdXQgPSB0aGlzLmNyZWF0ZSgpXG4gICAgbmV3b3V0LmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiBuZXdvdXQgYXMgdGhpc1xuICB9XG5cbiAgc2VsZWN0KGlkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogT3V0cHV0IHtcbiAgICByZXR1cm4gU2VsZWN0T3V0cHV0Q2xhc3MoaWQsIC4uLmFyZ3MpXG4gIH1cblxufVxuXG4vKipcbiAqIEFuIFtbT3V0cHV0XV0gY2xhc3Mgd2hpY2ggc3BlY2lmaWVzIGFuIE91dHB1dCB0aGF0IGNhcnJpZXMgYW4gTkZUIE1pbnQgYW5kIHVzZXMgc2VjcDI1NmsxIHNpZ25hdHVyZSBzY2hlbWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBORlRNaW50T3V0cHV0IGV4dGVuZHMgTkZUT3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiTkZUTWludE91dHB1dFwiXG4gIHByb3RlY3RlZCBfY29kZWNJRCA9IEFWTUNvbnN0YW50cy5MQVRFU1RDT0RFQ1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHRoaXMuX2NvZGVjSUQgPT09IDAgPyBBVk1Db25zdGFudHMuTkZUTUlOVE9VVFBVVElEIDogQVZNQ29uc3RhbnRzLk5GVE1JTlRPVVRQVVRJRF9DT0RFQ09ORVxuXG4gIC8vc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBib3RoIGFyZSBpbmhlcml0ZWRcblxuICAvKipcbiAgKiBTZXQgdGhlIGNvZGVjSURcbiAgKlxuICAqIEBwYXJhbSBjb2RlY0lEIFRoZSBjb2RlY0lEIHRvIHNldFxuICAqL1xuICBzZXRDb2RlY0lEKGNvZGVjSUQ6IG51bWJlcik6IHZvaWQge1xuICAgIGlmKGNvZGVjSUQgIT09IDAgJiYgY29kZWNJRCAhPT0gMSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBDb2RlY0lkRXJyb3IoXCJFcnJvciAtIE5GVE1pbnRPdXRwdXQuc2V0Q29kZWNJRDogaW52YWxpZCBjb2RlY0lELiBWYWxpZCBjb2RlY0lEcyBhcmUgMCBhbmQgMS5cIilcbiAgICB9XG4gICAgdGhpcy5fY29kZWNJRCA9IGNvZGVjSURcbiAgICB0aGlzLl90eXBlSUQgPSB0aGlzLl9jb2RlY0lEID09PSAwID8gQVZNQ29uc3RhbnRzLk5GVE1JTlRPVVRQVVRJRCA6IEFWTUNvbnN0YW50cy5ORlRNSU5UT1VUUFVUSURfQ09ERUNPTkVcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBvdXRwdXRJRCBmb3IgdGhpcyBvdXRwdXRcbiAgICovXG4gIGdldE91dHB1dElEKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRFxuICB9XG5cbiAgLyoqXG4gICAqIFBvcHVhdGVzIHRoZSBpbnN0YW5jZSBmcm9tIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBbW05GVE1pbnRPdXRwdXRdXSBhbmQgcmV0dXJucyB0aGUgc2l6ZSBvZiB0aGUgb3V0cHV0LlxuICAgKi9cbiAgZnJvbUJ1ZmZlcih1dHhvYnVmZjogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMuZ3JvdXBJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKHV0eG9idWZmLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcbiAgICByZXR1cm4gc3VwZXIuZnJvbUJ1ZmZlcih1dHhvYnVmZiwgb2Zmc2V0KVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIFtbTkZUTWludE91dHB1dF1dIGluc3RhbmNlLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBsZXQgc3VwZXJidWZmOiBCdWZmZXIgPSBzdXBlci50b0J1ZmZlcigpXG4gICAgbGV0IGJzaXplOiBudW1iZXIgPSB0aGlzLmdyb3VwSUQubGVuZ3RoICsgc3VwZXJidWZmLmxlbmd0aFxuICAgIGxldCBiYXJyOiBCdWZmZXJbXSA9IFt0aGlzLmdyb3VwSUQsIHN1cGVyYnVmZl1cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSlcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgTkZUTWludE91dHB1dCguLi5hcmdzKSBhcyB0aGlzXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdvdXQ6IE5GVE1pbnRPdXRwdXQgPSB0aGlzLmNyZWF0ZSgpXG4gICAgbmV3b3V0LmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiBuZXdvdXQgYXMgdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIFtbT3V0cHV0XV0gY2xhc3Mgd2hpY2ggY29udGFpbnMgYW4gTkZUIG1pbnQgZm9yIGFuIGFzc2V0SUQuXG4gICAqIFxuICAgKiBAcGFyYW0gZ3JvdXBJRCBBIG51bWJlciBzcGVjaWZpZXMgdGhlIGdyb3VwIHRoaXMgTkZUIGlzIGlzc3VlZCB0b1xuICAgKiBAcGFyYW0gbG9ja3RpbWUgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSByZXByZXNlbnRpbmcgdGhlIGxvY2t0aW1lXG4gICAqIEBwYXJhbSB0aHJlc2hvbGQgQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSB0aGUgdGhyZXNob2xkIG51bWJlciBvZiBzaWduZXJzIHJlcXVpcmVkIHRvIHNpZ24gdGhlIHRyYW5zYWN0aW9uXG4gICAqIEBwYXJhbSBhZGRyZXNzZXMgQW4gYXJyYXkgb2Yge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1zIHJlcHJlc2VudGluZyBhZGRyZXNzZXNcbiAgICovXG4gIGNvbnN0cnVjdG9yKGdyb3VwSUQ6IG51bWJlciA9IHVuZGVmaW5lZCwgYWRkcmVzc2VzOiBCdWZmZXJbXSA9IHVuZGVmaW5lZCwgbG9ja3RpbWU6IEJOID0gdW5kZWZpbmVkLCB0aHJlc2hvbGQ6IG51bWJlciA9IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKGFkZHJlc3NlcywgbG9ja3RpbWUsIHRocmVzaG9sZClcbiAgICAgIGlmKHR5cGVvZiBncm91cElEICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aGlzLmdyb3VwSUQud3JpdGVVSW50MzJCRShncm91cElELCAwKVxuICAgICAgfVxuICB9XG59XG5cbi8qKlxuICogQW4gW1tPdXRwdXRdXSBjbGFzcyB3aGljaCBzcGVjaWZpZXMgYW4gT3V0cHV0IHRoYXQgY2FycmllcyBhbiBORlQgYW5kIHVzZXMgc2VjcDI1NmsxIHNpZ25hdHVyZSBzY2hlbWUuXG4gKi9cbmV4cG9ydCBjbGFzcyBORlRUcmFuc2Zlck91dHB1dCBleHRlbmRzIE5GVE91dHB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIk5GVFRyYW5zZmVyT3V0cHV0XCJcbiAgcHJvdGVjdGVkIF9jb2RlY0lEID0gQVZNQ29uc3RhbnRzLkxBVEVTVENPREVDXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdGhpcy5fY29kZWNJRCA9PT0gMCA/IEFWTUNvbnN0YW50cy5ORlRYRkVST1VUUFVUSUQgOiBBVk1Db25zdGFudHMuTkZUWEZFUk9VVFBVVElEX0NPREVDT05FXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIFwicGF5bG9hZFwiOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5wYXlsb2FkLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJoZXhcIiwgdGhpcy5wYXlsb2FkLmxlbmd0aClcbiAgICB9XG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLnBheWxvYWQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wicGF5bG9hZFwiXSwgZW5jb2RpbmcsIFwiaGV4XCIsIFwiQnVmZmVyXCIpXG4gICAgdGhpcy5zaXplUGF5bG9hZCA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIHRoaXMuc2l6ZVBheWxvYWQud3JpdGVVSW50MzJCRSh0aGlzLnBheWxvYWQubGVuZ3RoLCAwKVxuICB9XG5cbiAgcHJvdGVjdGVkIHNpemVQYXlsb2FkOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgcHJvdGVjdGVkIHBheWxvYWQ6IEJ1ZmZlclxuXG4gIC8qKlxuICAqIFNldCB0aGUgY29kZWNJRFxuICAqXG4gICogQHBhcmFtIGNvZGVjSUQgVGhlIGNvZGVjSUQgdG8gc2V0XG4gICovXG4gIHNldENvZGVjSUQoY29kZWNJRDogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYoY29kZWNJRCAhPT0gMCAmJiBjb2RlY0lEICE9PSAxKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IENvZGVjSWRFcnJvcihcIkVycm9yIC0gTkZUVHJhbnNmZXJPdXRwdXQuc2V0Q29kZWNJRDogaW52YWxpZCBjb2RlY0lELiBWYWxpZCBjb2RlY0lEcyBhcmUgMCBhbmQgMS5cIilcbiAgICB9XG4gICAgdGhpcy5fY29kZWNJRCA9IGNvZGVjSURcbiAgICB0aGlzLl90eXBlSUQgPSB0aGlzLl9jb2RlY0lEID09PSAwID8gQVZNQ29uc3RhbnRzLk5GVFhGRVJPVVRQVVRJRCA6IEFWTUNvbnN0YW50cy5ORlRYRkVST1VUUFVUSURfQ09ERUNPTkVcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBvdXRwdXRJRCBmb3IgdGhpcyBvdXRwdXRcbiAgICovXG4gIGdldE91dHB1dElEKCk6bnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcGF5bG9hZCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdpdGggY29udGVudCBvbmx5LlxuICAgKi9cbiAgZ2V0UGF5bG9hZCA9ICgpOiBCdWZmZXIgPT4gYmludG9vbHMuY29weUZyb20odGhpcy5wYXlsb2FkKVxuXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBheWxvYWQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aXRoIGxlbmd0aCBvZiBwYXlsb2FkIHByZXBlbmRlZC5cbiAgICovXG4gIGdldFBheWxvYWRCdWZmZXIgPSAoKTogQnVmZmVyID0+IEJ1ZmZlci5jb25jYXQoW2JpbnRvb2xzLmNvcHlGcm9tKHRoaXMuc2l6ZVBheWxvYWQpLCBiaW50b29scy5jb3B5RnJvbSh0aGlzLnBheWxvYWQpXSlcblxuXG4gIC8qKlxuICAgKiBQb3B1YXRlcyB0aGUgaW5zdGFuY2UgZnJvbSBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgW1tORlRUcmFuc2Zlck91dHB1dF1dIGFuZCByZXR1cm5zIHRoZSBzaXplIG9mIHRoZSBvdXRwdXQuXG4gICAqL1xuICBmcm9tQnVmZmVyKHV0eG9idWZmOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgdGhpcy5ncm91cElEID0gYmludG9vbHMuY29weUZyb20odXR4b2J1ZmYsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHRoaXMuc2l6ZVBheWxvYWQgPSBiaW50b29scy5jb3B5RnJvbSh1dHhvYnVmZiwgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgIGxldCBwc2l6ZTogbnVtYmVyID0gdGhpcy5zaXplUGF5bG9hZC5yZWFkVUludDMyQkUoMClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHRoaXMucGF5bG9hZCA9IGJpbnRvb2xzLmNvcHlGcm9tKHV0eG9idWZmLCBvZmZzZXQsIG9mZnNldCArIHBzaXplKVxuICAgIG9mZnNldCA9IG9mZnNldCArIHBzaXplXG4gICAgcmV0dXJuIHN1cGVyLmZyb21CdWZmZXIodXR4b2J1ZmYsIG9mZnNldClcbiAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYnVmZmVyIHJlcHJlc2VudGluZyB0aGUgW1tORlRUcmFuc2Zlck91dHB1dF1dIGluc3RhbmNlLlxuICAgICAqL1xuICB0b0J1ZmZlcigpOkJ1ZmZlciB7XG4gICAgY29uc3Qgc3VwZXJidWZmOiBCdWZmZXIgPSBzdXBlci50b0J1ZmZlcigpXG4gICAgY29uc3QgYnNpemU6IG51bWJlciA9IHRoaXMuZ3JvdXBJRC5sZW5ndGggKyB0aGlzLnNpemVQYXlsb2FkLmxlbmd0aCArIHRoaXMucGF5bG9hZC5sZW5ndGggKyBzdXBlcmJ1ZmYubGVuZ3RoXG4gICAgdGhpcy5zaXplUGF5bG9hZC53cml0ZVVJbnQzMkJFKHRoaXMucGF5bG9hZC5sZW5ndGgsIDApXG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbdGhpcy5ncm91cElELCB0aGlzLnNpemVQYXlsb2FkLCB0aGlzLnBheWxvYWQsIHN1cGVyYnVmZl1cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSlcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgTkZUVHJhbnNmZXJPdXRwdXQoLi4uYXJncykgYXMgdGhpc1xuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgY29uc3QgbmV3b3V0Ok5GVFRyYW5zZmVyT3V0cHV0ID0gdGhpcy5jcmVhdGUoKVxuICAgIG5ld291dC5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3b3V0IGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgICAqIEFuIFtbT3V0cHV0XV0gY2xhc3Mgd2hpY2ggY29udGFpbnMgYW4gTkZUIG9uIGFuIGFzc2V0SUQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZ3JvdXBJRCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIGFtb3VudCBpbiB0aGUgb3V0cHV0XG4gICAgICogQHBhcmFtIHBheWxvYWQgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiBtYXggbGVuZ3RoIDEwMjQgXG4gICAgICogQHBhcmFtIGFkZHJlc3NlcyBBbiBhcnJheSBvZiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfXMgcmVwcmVzZW50aW5nIGFkZHJlc3Nlc1xuICAgICAqIEBwYXJhbSBsb2NrdGltZSBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHJlcHJlc2VudGluZyB0aGUgbG9ja3RpbWVcbiAgICAgKiBAcGFyYW0gdGhyZXNob2xkIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgdGhlIHRocmVzaG9sZCBudW1iZXIgb2Ygc2lnbmVycyByZXF1aXJlZCB0byBzaWduIHRoZSB0cmFuc2FjdGlvblxuXG4gICAgICovXG4gIGNvbnN0cnVjdG9yKGdyb3VwSUQ6IG51bWJlciA9IHVuZGVmaW5lZCwgcGF5bG9hZDogQnVmZmVyID0gdW5kZWZpbmVkLCBhZGRyZXNzZXM6IEJ1ZmZlcltdID0gdW5kZWZpbmVkLCBsb2NrdGltZTogQk4gPSB1bmRlZmluZWQsIHRocmVzaG9sZDogbnVtYmVyID0gdW5kZWZpbmVkLCkge1xuICAgIHN1cGVyKGFkZHJlc3NlcywgbG9ja3RpbWUsIHRocmVzaG9sZClcbiAgICBpZiAodHlwZW9mIGdyb3VwSUQgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwYXlsb2FkICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhpcy5ncm91cElELndyaXRlVUludDMyQkUoZ3JvdXBJRCwgMClcbiAgICAgIHRoaXMuc2l6ZVBheWxvYWQud3JpdGVVSW50MzJCRShwYXlsb2FkLmxlbmd0aCwgMClcbiAgICAgIHRoaXMucGF5bG9hZCA9IGJpbnRvb2xzLmNvcHlGcm9tKHBheWxvYWQsIDAsIHBheWxvYWQubGVuZ3RoKVxuICAgIH1cbiAgfVxufVxuIl19