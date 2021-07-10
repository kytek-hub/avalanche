"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UTXOID = exports.NFTTransferOperation = exports.NFTMintOperation = exports.SECPMintOperation = exports.TransferableOperation = exports.Operation = exports.SelectOperationClass = void 0;
/**
 * @packageDocumentation
 * @module API-AVM-Operations
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const outputs_1 = require("./outputs");
const nbytes_1 = require("../../common/nbytes");
const credentials_1 = require("../../common/credentials");
const output_1 = require("../../common/output");
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
const cb58 = "cb58";
const buffer = "Buffer";
const hex = "hex";
const decimalString = "decimalString";
/**
 * Takes a buffer representing the output and returns the proper [[Operation]] instance.
 *
 * @param opid A number representing the operation ID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Operation]]-extended class.
 */
exports.SelectOperationClass = (opid, ...args) => {
    if (opid === constants_1.AVMConstants.SECPMINTOPID || opid === constants_1.AVMConstants.SECPMINTOPID_CODECONE) {
        return new SECPMintOperation(...args);
    }
    else if (opid === constants_1.AVMConstants.NFTMINTOPID || opid === constants_1.AVMConstants.NFTMINTOPID_CODECONE) {
        return new NFTMintOperation(...args);
    }
    else if (opid === constants_1.AVMConstants.NFTXFEROPID || opid === constants_1.AVMConstants.NFTXFEROPID_CODECONE) {
        return new NFTTransferOperation(...args);
    }
    /* istanbul ignore next */
    throw new errors_1.InvalidOperationIdError(`Error - SelectOperationClass: unknown opid ${opid}`);
};
/**
 * A class representing an operation. All operation types must extend on this class.
 */
class Operation extends serialization_1.Serializable {
    constructor() {
        super(...arguments);
        this._typeName = "Operation";
        this._typeID = undefined;
        this.sigCount = buffer_1.Buffer.alloc(4);
        this.sigIdxs = []; // idxs of signers from utxo
        /**
         * Returns the array of [[SigIdx]] for this [[Operation]]
         */
        this.getSigIdxs = () => this.sigIdxs;
        /**
         * Creates and adds a [[SigIdx]] to the [[Operation]].
         *
         * @param addressIdx The index of the address to reference in the signatures
         * @param address The address of the source of the signature
         */
        this.addSignatureIdx = (addressIdx, address) => {
            const sigidx = new credentials_1.SigIdx();
            const b = buffer_1.Buffer.alloc(4);
            b.writeUInt32BE(addressIdx, 0);
            sigidx.fromBuffer(b);
            sigidx.setSource(address);
            this.sigIdxs.push(sigidx);
            this.sigCount.writeUInt32BE(this.sigIdxs.length, 0);
        };
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { sigIdxs: this.sigIdxs.map((s) => s.serialize(encoding)) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.sigIdxs = fields["sigIdxs"].map((s) => {
            let sidx = new credentials_1.SigIdx();
            sidx.deserialize(s, encoding);
            return sidx;
        });
        this.sigCount.writeUInt32BE(this.sigIdxs.length, 0);
    }
    fromBuffer(bytes, offset = 0) {
        this.sigCount = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const sigCount = this.sigCount.readUInt32BE(0);
        this.sigIdxs = [];
        for (let i = 0; i < sigCount; i++) {
            const sigidx = new credentials_1.SigIdx();
            const sigbuff = bintools.copyFrom(bytes, offset, offset + 4);
            sigidx.fromBuffer(sigbuff);
            offset += 4;
            this.sigIdxs.push(sigidx);
        }
        return offset;
    }
    toBuffer() {
        this.sigCount.writeUInt32BE(this.sigIdxs.length, 0);
        let bsize = this.sigCount.length;
        const barr = [this.sigCount];
        for (let i = 0; i < this.sigIdxs.length; i++) {
            const b = this.sigIdxs[i].toBuffer();
            barr.push(b);
            bsize += b.length;
        }
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
     * Returns a base-58 string representing the [[NFTMintOperation]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
}
exports.Operation = Operation;
Operation.comparator = () => (a, b) => {
    const aoutid = buffer_1.Buffer.alloc(4);
    aoutid.writeUInt32BE(a.getOperationID(), 0);
    const abuff = a.toBuffer();
    const boutid = buffer_1.Buffer.alloc(4);
    boutid.writeUInt32BE(b.getOperationID(), 0);
    const bbuff = b.toBuffer();
    const asort = buffer_1.Buffer.concat([aoutid, abuff], aoutid.length + abuff.length);
    const bsort = buffer_1.Buffer.concat([boutid, bbuff], boutid.length + bbuff.length);
    return buffer_1.Buffer.compare(asort, bsort);
};
/**
 * A class which contains an [[Operation]] for transfers.
 *
 */
class TransferableOperation extends serialization_1.Serializable {
    constructor(assetID = undefined, utxoids = undefined, operation = undefined) {
        super();
        this._typeName = "TransferableOperation";
        this._typeID = undefined;
        this.assetID = buffer_1.Buffer.alloc(32);
        this.utxoIDs = [];
        /**
         * Returns the assetID as a {@link https://github.com/feross/buffer|Buffer}.
         */
        this.getAssetID = () => this.assetID;
        /**
         * Returns an array of UTXOIDs in this operation.
         */
        this.getUTXOIDs = () => this.utxoIDs;
        /**
         * Returns the operation
         */
        this.getOperation = () => this.operation;
        if (typeof assetID !== "undefined" && assetID.length === constants_1.AVMConstants.ASSETIDLEN
            && operation instanceof Operation && typeof utxoids !== "undefined"
            && Array.isArray(utxoids)) {
            this.assetID = assetID;
            this.operation = operation;
            for (let i = 0; i < utxoids.length; i++) {
                const utxoid = new UTXOID();
                if (typeof utxoids[i] === "string") {
                    utxoid.fromString(utxoids[i]);
                }
                else if (utxoids[i] instanceof buffer_1.Buffer) {
                    utxoid.fromBuffer(utxoids[i]);
                }
                else if (utxoids[i] instanceof UTXOID) {
                    utxoid.fromString(utxoids[i].toString()); // clone
                }
                this.utxoIDs.push(utxoid);
            }
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { assetID: serialization.encoder(this.assetID, encoding, buffer, cb58, 32), utxoIDs: this.utxoIDs.map((u) => u.serialize(encoding)), operation: this.operation.serialize(encoding) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.assetID = serialization.decoder(fields["assetID"], encoding, cb58, buffer, 32);
        this.utxoIDs = fields["utxoIDs"].map((u) => {
            let utxoid = new UTXOID();
            utxoid.deserialize(u, encoding);
            return utxoid;
        });
        this.operation = exports.SelectOperationClass(fields["operation"]["_typeID"]);
        this.operation.deserialize(fields["operation"], encoding);
    }
    fromBuffer(bytes, offset = 0) {
        this.assetID = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        const numutxoIDs = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.utxoIDs = [];
        for (let i = 0; i < numutxoIDs; i++) {
            const utxoid = new UTXOID();
            offset = utxoid.fromBuffer(bytes, offset);
            this.utxoIDs.push(utxoid);
        }
        const opid = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.operation = exports.SelectOperationClass(opid);
        return this.operation.fromBuffer(bytes, offset);
    }
    toBuffer() {
        const numutxoIDs = buffer_1.Buffer.alloc(4);
        numutxoIDs.writeUInt32BE(this.utxoIDs.length, 0);
        let bsize = this.assetID.length + numutxoIDs.length;
        const barr = [this.assetID, numutxoIDs];
        this.utxoIDs = this.utxoIDs.sort(UTXOID.comparator());
        for (let i = 0; i < this.utxoIDs.length; i++) {
            const b = this.utxoIDs[i].toBuffer();
            barr.push(b);
            bsize += b.length;
        }
        const opid = buffer_1.Buffer.alloc(4);
        opid.writeUInt32BE(this.operation.getOperationID(), 0);
        barr.push(opid);
        bsize += opid.length;
        const b = this.operation.toBuffer();
        bsize += b.length;
        barr.push(b);
        return buffer_1.Buffer.concat(barr, bsize);
    }
}
exports.TransferableOperation = TransferableOperation;
/**
 * Returns a function used to sort an array of [[TransferableOperation]]s
 */
TransferableOperation.comparator = () => {
    return function (a, b) {
        return buffer_1.Buffer.compare(a.toBuffer(), b.toBuffer());
    };
};
/**
 * An [[Operation]] class which specifies a SECP256k1 Mint Op.
 */
class SECPMintOperation extends Operation {
    /**
     * An [[Operation]] class which mints new tokens on an assetID.
     *
     * @param mintOutput The [[SECPMintOutput]] that will be produced by this transaction.
     * @param transferOutput A [[SECPTransferOutput]] that will be produced from this minting operation.
     */
    constructor(mintOutput = undefined, transferOutput = undefined) {
        super();
        this._typeName = "SECPMintOperation";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.SECPMINTOPID : constants_1.AVMConstants.SECPMINTOPID_CODECONE;
        this.mintOutput = undefined;
        this.transferOutput = undefined;
        if (typeof mintOutput !== "undefined") {
            this.mintOutput = mintOutput;
        }
        if (typeof transferOutput !== "undefined") {
            this.transferOutput = transferOutput;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { mintOutput: this.mintOutput.serialize(encoding), transferOutputs: this.transferOutput.serialize(encoding) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.mintOutput = new outputs_1.SECPMintOutput();
        this.mintOutput.deserialize(fields["mintOutput"], encoding);
        this.transferOutput = new outputs_1.SECPTransferOutput();
        this.transferOutput.deserialize(fields["transferOutputs"], encoding);
    }
    /**
    * Set the codecID
    *
    * @param codecID The codecID to set
    */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - SECPMintOperation.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.SECPMINTOPID : constants_1.AVMConstants.SECPMINTOPID_CODECONE;
    }
    /**
     * Returns the operation ID.
     */
    getOperationID() {
        return this._typeID;
    }
    /**
     * Returns the credential ID.
     */
    getCredentialID() {
        if (this._codecID === 0) {
            return constants_1.AVMConstants.SECPCREDENTIAL;
        }
        else if (this._codecID === 1) {
            return constants_1.AVMConstants.SECPCREDENTIAL_CODECONE;
        }
    }
    /**
     * Returns the [[SECPMintOutput]] to be produced by this operation.
     */
    getMintOutput() {
        return this.mintOutput;
    }
    /**
     * Returns [[SECPTransferOutput]] to be produced by this operation.
     */
    getTransferOutput() {
        return this.transferOutput;
    }
    /**
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[SECPMintOperation]] and returns the updated offset.
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.mintOutput = new outputs_1.SECPMintOutput();
        offset = this.mintOutput.fromBuffer(bytes, offset);
        this.transferOutput = new outputs_1.SECPTransferOutput();
        offset = this.transferOutput.fromBuffer(bytes, offset);
        return offset;
    }
    /**
     * Returns the buffer representing the [[SECPMintOperation]] instance.
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        const mintoutBuff = this.mintOutput.toBuffer();
        const transferOutBuff = this.transferOutput.toBuffer();
        const bsize = superbuff.length +
            mintoutBuff.length +
            transferOutBuff.length;
        const barr = [
            superbuff,
            mintoutBuff,
            transferOutBuff
        ];
        return buffer_1.Buffer.concat(barr, bsize);
    }
}
exports.SECPMintOperation = SECPMintOperation;
/**
 * An [[Operation]] class which specifies a NFT Mint Op.
 */
class NFTMintOperation extends Operation {
    /**
    * An [[Operation]] class which contains an NFT on an assetID.
    *
    * @param groupID The group to which to issue the NFT Output
    * @param payload A {@link https://github.com/feross/buffer|Buffer} of the NFT payload
    * @param outputOwners An array of outputOwners
    */
    constructor(groupID = undefined, payload = undefined, outputOwners = undefined) {
        super();
        this._typeName = "NFTMintOperation";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.NFTMINTOPID : constants_1.AVMConstants.NFTMINTOPID_CODECONE;
        this.groupID = buffer_1.Buffer.alloc(4);
        this.outputOwners = [];
        /**
        * Returns the credential ID.
        */
        this.getCredentialID = () => {
            if (this._codecID === 0) {
                return constants_1.AVMConstants.NFTCREDENTIAL;
            }
            else if (this._codecID === 1) {
                return constants_1.AVMConstants.NFTCREDENTIAL_CODECONE;
            }
        };
        /**
        * Returns the payload.
        */
        this.getGroupID = () => {
            return bintools.copyFrom(this.groupID, 0);
        };
        /**
        * Returns the payload.
        */
        this.getPayload = () => {
            return bintools.copyFrom(this.payload, 0);
        };
        /**
        * Returns the payload's raw {@link https://github.com/feross/buffer|Buffer} with length prepended, for use with [[PayloadBase]]'s fromBuffer
        */
        this.getPayloadBuffer = () => {
            let payloadlen = buffer_1.Buffer.alloc(4);
            payloadlen.writeUInt32BE(this.payload.length, 0);
            return buffer_1.Buffer.concat([payloadlen, bintools.copyFrom(this.payload, 0)]);
        };
        /**
        * Returns the outputOwners.
        */
        this.getOutputOwners = () => {
            return this.outputOwners;
        };
        if (typeof groupID !== "undefined" && typeof payload !== "undefined" && outputOwners.length) {
            this.groupID.writeUInt32BE((groupID ? groupID : 0), 0);
            this.payload = payload;
            this.outputOwners = outputOwners;
        }
    }
    serialize(encoding = "hex") {
        const fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { groupID: serialization.encoder(this.groupID, encoding, buffer, decimalString, 4), payload: serialization.encoder(this.payload, encoding, buffer, hex), outputOwners: this.outputOwners.map((o) => o.serialize(encoding)) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.groupID = serialization.decoder(fields["groupID"], encoding, decimalString, buffer, 4);
        this.payload = serialization.decoder(fields["payload"], encoding, hex, buffer);
        // this.outputOwners = fields["outputOwners"].map((o: NFTMintOutput) => {
        //   let oo: NFTMintOutput = new NFTMintOutput()
        //   oo.deserialize(o, encoding)
        //   return oo
        // })
        this.outputOwners = fields["outputOwners"].map((o) => {
            let oo = new output_1.OutputOwners();
            oo.deserialize(o, encoding);
            return oo;
        });
    }
    /**
    * Set the codecID
    *
    * @param codecID The codecID to set
    */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - NFTMintOperation.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.NFTMINTOPID : constants_1.AVMConstants.NFTMINTOPID_CODECONE;
    }
    /**
    * Returns the operation ID.
    */
    getOperationID() {
        return this._typeID;
    }
    /**
    * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[NFTMintOperation]] and returns the updated offset.
    */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.groupID = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        let payloadLen = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.payload = bintools.copyFrom(bytes, offset, offset + payloadLen);
        offset += payloadLen;
        let numoutputs = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.outputOwners = [];
        for (let i = 0; i < numoutputs; i++) {
            let outputOwner = new output_1.OutputOwners();
            offset = outputOwner.fromBuffer(bytes, offset);
            this.outputOwners.push(outputOwner);
        }
        return offset;
    }
    /**
    * Returns the buffer representing the [[NFTMintOperation]] instance.
    */
    toBuffer() {
        const superbuff = super.toBuffer();
        const payloadlen = buffer_1.Buffer.alloc(4);
        payloadlen.writeUInt32BE(this.payload.length, 0);
        const outputownerslen = buffer_1.Buffer.alloc(4);
        outputownerslen.writeUInt32BE(this.outputOwners.length, 0);
        let bsize = superbuff.length +
            this.groupID.length +
            payloadlen.length +
            this.payload.length +
            outputownerslen.length;
        const barr = [
            superbuff,
            this.groupID,
            payloadlen,
            this.payload,
            outputownerslen
        ];
        for (let i = 0; i < this.outputOwners.length; i++) {
            let b = this.outputOwners[i].toBuffer();
            barr.push(b);
            bsize += b.length;
        }
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
    * Returns a base-58 string representing the [[NFTMintOperation]].
    */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
}
exports.NFTMintOperation = NFTMintOperation;
/**
* A [[Operation]] class which specifies a NFT Transfer Op.
*/
class NFTTransferOperation extends Operation {
    /**
    * An [[Operation]] class which contains an NFT on an assetID.
    *
    * @param output An [[NFTTransferOutput]]
    */
    constructor(output = undefined) {
        super();
        this._typeName = "NFTTransferOperation";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.NFTXFEROPID : constants_1.AVMConstants.NFTXFEROPID_CODECONE;
        this.getOutput = () => this.output;
        if (typeof output !== "undefined") {
            this.output = output;
        }
    }
    serialize(encoding = "hex") {
        const fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { output: this.output.serialize(encoding) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.output = new outputs_1.NFTTransferOutput();
        this.output.deserialize(fields["output"], encoding);
    }
    /**
    * Set the codecID
    *
    * @param codecID The codecID to set
    */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - NFTTransferOperation.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.NFTXFEROPID : constants_1.AVMConstants.NFTXFEROPID_CODECONE;
    }
    /**
    * Returns the operation ID.
    */
    getOperationID() {
        return this._typeID;
    }
    /**
    * Returns the credential ID.
    */
    getCredentialID() {
        if (this._codecID === 0) {
            return constants_1.AVMConstants.NFTCREDENTIAL;
        }
        else if (this._codecID === 1) {
            return constants_1.AVMConstants.NFTCREDENTIAL_CODECONE;
        }
    }
    /**
    * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[NFTTransferOperation]] and returns the updated offset.
    */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.output = new outputs_1.NFTTransferOutput();
        return this.output.fromBuffer(bytes, offset);
    }
    /**
    * Returns the buffer representing the [[NFTTransferOperation]] instance.
    */
    toBuffer() {
        const superbuff = super.toBuffer();
        const outbuff = this.output.toBuffer();
        const bsize = superbuff.length + outbuff.length;
        const barr = [superbuff, outbuff];
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
    * Returns a base-58 string representing the [[NFTTransferOperation]].
    */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
}
exports.NFTTransferOperation = NFTTransferOperation;
/**
* Class for representing a UTXOID used in [[TransferableOp]] types
*/
class UTXOID extends nbytes_1.NBytes {
    /**
    * Class for representing a UTXOID used in [[TransferableOp]] types
    */
    constructor() {
        super();
        this._typeName = "UTXOID";
        this._typeID = undefined;
        //serialize and deserialize both are inherited
        this.bytes = buffer_1.Buffer.alloc(36);
        this.bsize = 36;
    }
    /**
    * Returns a base-58 representation of the [[UTXOID]].
    */
    toString() {
        return bintools.cb58Encode(this.toBuffer());
    }
    /**
    * Takes a base-58 string containing an [[UTXOID]], parses it, populates the class, and returns the length of the UTXOID in bytes.
    *
    * @param bytes A base-58 string containing a raw [[UTXOID]]
    *
    * @returns The length of the raw [[UTXOID]]
    */
    fromString(utxoid) {
        const utxoidbuff = bintools.b58ToBuffer(utxoid);
        if (utxoidbuff.length === 40 && bintools.validateChecksum(utxoidbuff)) {
            const newbuff = bintools.copyFrom(utxoidbuff, 0, utxoidbuff.length - 4);
            if (newbuff.length === 36) {
                this.bytes = newbuff;
            }
        }
        else if (utxoidbuff.length === 40) {
            throw new errors_1.ChecksumError("Error - UTXOID.fromString: invalid checksum on address");
        }
        else if (utxoidbuff.length === 36) {
            this.bytes = utxoidbuff;
        }
        else {
            /* istanbul ignore next */
            throw new errors_1.AddressError("Error - UTXOID.fromString: invalid address");
        }
        return this.getSize();
    }
    clone() {
        const newbase = new UTXOID();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new UTXOID();
    }
}
exports.UTXOID = UTXOID;
/**
* Returns a function used to sort an array of [[UTXOID]]s
*/
UTXOID.comparator = () => (a, b) => buffer_1.Buffer.compare(a.toBuffer(), b.toBuffer());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvYXZtL29wcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxvQ0FBZ0M7QUFDaEMsb0VBQTJDO0FBQzNDLDJDQUEwQztBQUMxQyx1Q0FBaUY7QUFDakYsZ0RBQTRDO0FBQzVDLDBEQUFpRDtBQUNqRCxnREFBa0Q7QUFDbEQsNkRBQTJHO0FBQzNHLCtDQUkyQjtBQUUzQixNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2hFLE1BQU0sSUFBSSxHQUFtQixNQUFNLENBQUE7QUFDbkMsTUFBTSxNQUFNLEdBQW1CLFFBQVEsQ0FBQTtBQUN2QyxNQUFNLEdBQUcsR0FBbUIsS0FBSyxDQUFBO0FBQ2pDLE1BQU0sYUFBYSxHQUFtQixlQUFlLENBQUE7QUFFckQ7Ozs7OztHQU1HO0FBQ1UsUUFBQSxvQkFBb0IsR0FBRyxDQUFDLElBQVksRUFBRSxHQUFHLElBQVcsRUFBYSxFQUFFO0lBQzVFLElBQUcsSUFBSSxLQUFLLHdCQUFZLENBQUMsWUFBWSxJQUFJLElBQUksS0FBSyx3QkFBWSxDQUFDLHFCQUFxQixFQUFFO1FBQ3BGLE9BQU8sSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO0tBQ3RDO1NBQU0sSUFBRyxJQUFJLEtBQUssd0JBQVksQ0FBQyxXQUFXLElBQUksSUFBSSxLQUFLLHdCQUFZLENBQUMsb0JBQW9CLEVBQUM7UUFDeEYsT0FBTyxJQUFJLGdCQUFnQixDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7S0FDckM7U0FBTSxJQUFHLElBQUksS0FBSyx3QkFBWSxDQUFDLFdBQVcsSUFBSSxJQUFJLEtBQUssd0JBQVksQ0FBQyxvQkFBb0IsRUFBQztRQUN4RixPQUFPLElBQUksb0JBQW9CLENB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TUFBTSxDQUFDLEdBQUcsSUFBVztRQUNuQixPQUFPLElBQUksTUFBTSxFQUFVLENBQUE7SUFDN0IsQ0FBQzs7QUF4REgsd0JBZ0VDO0FBdkRDOztFQUVFO0FBQ0ssaUJBQVUsR0FBRyxHQUEyQyxFQUFFLENBQUMsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUN0RSxFQUFFLENBQUMsZUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFpQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLUFWTS1PcGVyYXRpb25zXG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IHsgQVZNQ29uc3RhbnRzIH0gZnJvbSBcIi4vY29uc3RhbnRzXCJcbmltcG9ydCB7IE5GVFRyYW5zZmVyT3V0cHV0LCBTRUNQTWludE91dHB1dCwgU0VDUFRyYW5zZmVyT3V0cHV0IH0gZnJvbSBcIi4vb3V0cHV0c1wiXG5pbXBvcnQgeyBOQnl0ZXMgfSBmcm9tIFwiLi4vLi4vY29tbW9uL25ieXRlc1wiXG5pbXBvcnQgeyBTaWdJZHggfSBmcm9tIFwiLi4vLi4vY29tbW9uL2NyZWRlbnRpYWxzXCJcbmltcG9ydCB7IE91dHB1dE93bmVycyB9IGZyb20gXCIuLi8uLi9jb21tb24vb3V0cHV0XCJcbmltcG9ydCB7IFNlcmlhbGl6YWJsZSwgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nLCBTZXJpYWxpemVkVHlwZSB9IGZyb20gXCIuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uXCJcbmltcG9ydCB7IEludmFsaWRPcGVyYXRpb25JZEVycm9yLFxuICBDb2RlY0lkRXJyb3IsXG4gIENoZWNrc3VtRXJyb3IsXG4gIEFkZHJlc3NFcnJvclxufSBmcm9tIFwiLi4vLi4vdXRpbHMvZXJyb3JzXCJcblxuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuY29uc3QgY2I1ODogU2VyaWFsaXplZFR5cGUgPSBcImNiNThcIlxuY29uc3QgYnVmZmVyOiBTZXJpYWxpemVkVHlwZSA9IFwiQnVmZmVyXCJcbmNvbnN0IGhleDogU2VyaWFsaXplZFR5cGUgPSBcImhleFwiXG5jb25zdCBkZWNpbWFsU3RyaW5nOiBTZXJpYWxpemVkVHlwZSA9IFwiZGVjaW1hbFN0cmluZ1wiXG5cbi8qKlxuICogVGFrZXMgYSBidWZmZXIgcmVwcmVzZW50aW5nIHRoZSBvdXRwdXQgYW5kIHJldHVybnMgdGhlIHByb3BlciBbW09wZXJhdGlvbl1dIGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSBvcGlkIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgb3BlcmF0aW9uIElEIHBhcnNlZCBwcmlvciB0byB0aGUgYnl0ZXMgcGFzc2VkIGluXG4gKlxuICogQHJldHVybnMgQW4gaW5zdGFuY2Ugb2YgYW4gW1tPcGVyYXRpb25dXS1leHRlbmRlZCBjbGFzcy5cbiAqL1xuZXhwb3J0IGNvbnN0IFNlbGVjdE9wZXJhdGlvbkNsYXNzID0gKG9waWQ6IG51bWJlciwgLi4uYXJnczogYW55W10pOiBPcGVyYXRpb24gPT4ge1xuICAgIGlmKG9waWQgPT09IEFWTUNvbnN0YW50cy5TRUNQTUlOVE9QSUQgfHwgb3BpZCA9PT0gQVZNQ29uc3RhbnRzLlNFQ1BNSU5UT1BJRF9DT0RFQ09ORSkge1xuICAgICAgcmV0dXJuIG5ldyBTRUNQTWludE9wZXJhdGlvbiguLi5hcmdzKVxuICAgIH0gZWxzZSBpZihvcGlkID09PSBBVk1Db25zdGFudHMuTkZUTUlOVE9QSUQgfHwgb3BpZCA9PT0gQVZNQ29uc3RhbnRzLk5GVE1JTlRPUElEX0NPREVDT05FKXtcbiAgICAgIHJldHVybiBuZXcgTkZUTWludE9wZXJhdGlvbiguLi5hcmdzKVxuICAgIH0gZWxzZSBpZihvcGlkID09PSBBVk1Db25zdGFudHMuTkZUWEZFUk9QSUQgfHwgb3BpZCA9PT0gQVZNQ29uc3RhbnRzLk5GVFhGRVJPUElEX0NPREVDT05FKXtcbiAgICAgIHJldHVybiBuZXcgTkZUVHJhbnNmZXJPcGVyYXRpb24oLi4uYXJncylcbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgdGhyb3cgbmV3IEludmFsaWRPcGVyYXRpb25JZEVycm9yKGBFcnJvciAtIFNlbGVjdE9wZXJhdGlvbkNsYXNzOiB1bmtub3duIG9waWQgJHtvcGlkfWApXG59XG5cbi8qKlxuICogQSBjbGFzcyByZXByZXNlbnRpbmcgYW4gb3BlcmF0aW9uLiBBbGwgb3BlcmF0aW9uIHR5cGVzIG11c3QgZXh0ZW5kIG9uIHRoaXMgY2xhc3MuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBPcGVyYXRpb24gZXh0ZW5kcyBTZXJpYWxpemFibGV7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIk9wZXJhdGlvblwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIHNpZ0lkeHM6IHRoaXMuc2lnSWR4cy5tYXAoKHM6IFNpZ0lkeCk6IG9iamVjdCA9PiBzLnNlcmlhbGl6ZShlbmNvZGluZykpXG4gICAgfVxuICB9XG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5zaWdJZHhzID0gZmllbGRzW1wic2lnSWR4c1wiXS5tYXAoKHM6IG9iamVjdCk6IFNpZ0lkeCA9PiB7XG4gICAgICBsZXQgc2lkeDogU2lnSWR4ID0gbmV3IFNpZ0lkeCgpXG4gICAgICBzaWR4LmRlc2VyaWFsaXplKHMsIGVuY29kaW5nKVxuICAgICAgcmV0dXJuIHNpZHhcbiAgICB9KVxuICAgIHRoaXMuc2lnQ291bnQud3JpdGVVSW50MzJCRSh0aGlzLnNpZ0lkeHMubGVuZ3RoLCAwKVxuICB9XG5cbiAgcHJvdGVjdGVkIHNpZ0NvdW50OiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgcHJvdGVjdGVkIHNpZ0lkeHM6IFNpZ0lkeFtdID0gW10gLy8gaWR4cyBvZiBzaWduZXJzIGZyb20gdXR4b1xuXG4gIHN0YXRpYyBjb21wYXJhdG9yID0gKCk6IChhOiBPcGVyYXRpb24sIGI6IE9wZXJhdGlvbikgPT4gKDEgfCAtMSB8IDApID0+IChhOiBPcGVyYXRpb24sIGI6IE9wZXJhdGlvbik6ICgxIHwgLTEgfCAwKSA9PiB7XG4gICAgY29uc3QgYW91dGlkOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBhb3V0aWQud3JpdGVVSW50MzJCRShhLmdldE9wZXJhdGlvbklEKCksIDApXG4gICAgY29uc3QgYWJ1ZmY6IEJ1ZmZlciA9IGEudG9CdWZmZXIoKVxuXG4gICAgY29uc3QgYm91dGlkOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBib3V0aWQud3JpdGVVSW50MzJCRShiLmdldE9wZXJhdGlvbklEKCksIDApXG4gICAgY29uc3QgYmJ1ZmY6IEJ1ZmZlciA9IGIudG9CdWZmZXIoKVxuXG4gICAgY29uc3QgYXNvcnQ6IEJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW2FvdXRpZCwgYWJ1ZmZdLCBhb3V0aWQubGVuZ3RoICsgYWJ1ZmYubGVuZ3RoKVxuICAgIGNvbnN0IGJzb3J0OiBCdWZmZXIgPSBCdWZmZXIuY29uY2F0KFtib3V0aWQsIGJidWZmXSwgYm91dGlkLmxlbmd0aCArIGJidWZmLmxlbmd0aClcbiAgICByZXR1cm4gQnVmZmVyLmNvbXBhcmUoYXNvcnQsIGJzb3J0KSBhcyAoMSB8IC0xIHwgMClcbiAgfVxuXG4gIGFic3RyYWN0IGdldE9wZXJhdGlvbklEKCk6IG51bWJlclxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhcnJheSBvZiBbW1NpZ0lkeF1dIGZvciB0aGlzIFtbT3BlcmF0aW9uXV1cbiAgICovXG4gIGdldFNpZ0lkeHMgPSAoKTogU2lnSWR4W10gPT4gdGhpcy5zaWdJZHhzXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNyZWRlbnRpYWwgSUQuXG4gICAqL1xuICBhYnN0cmFjdCBnZXRDcmVkZW50aWFsSUQoKTogbnVtYmVyXG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIGFkZHMgYSBbW1NpZ0lkeF1dIHRvIHRoZSBbW09wZXJhdGlvbl1dLlxuICAgKlxuICAgKiBAcGFyYW0gYWRkcmVzc0lkeCBUaGUgaW5kZXggb2YgdGhlIGFkZHJlc3MgdG8gcmVmZXJlbmNlIGluIHRoZSBzaWduYXR1cmVzXG4gICAqIEBwYXJhbSBhZGRyZXNzIFRoZSBhZGRyZXNzIG9mIHRoZSBzb3VyY2Ugb2YgdGhlIHNpZ25hdHVyZVxuICAgKi9cbiAgYWRkU2lnbmF0dXJlSWR4ID0gKGFkZHJlc3NJZHg6IG51bWJlciwgYWRkcmVzczogQnVmZmVyKSA9PiB7XG4gICAgY29uc3Qgc2lnaWR4OiBTaWdJZHggPSBuZXcgU2lnSWR4KClcbiAgICBjb25zdCBiOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBiLndyaXRlVUludDMyQkUoYWRkcmVzc0lkeCwgMClcbiAgICBzaWdpZHguZnJvbUJ1ZmZlcihiKVxuICAgIHNpZ2lkeC5zZXRTb3VyY2UoYWRkcmVzcylcbiAgICB0aGlzLnNpZ0lkeHMucHVzaChzaWdpZHgpXG4gICAgdGhpcy5zaWdDb3VudC53cml0ZVVJbnQzMkJFKHRoaXMuc2lnSWR4cy5sZW5ndGgsIDApXG4gIH1cblxuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgdGhpcy5zaWdDb3VudCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcbiAgICBjb25zdCBzaWdDb3VudDogbnVtYmVyID0gdGhpcy5zaWdDb3VudC5yZWFkVUludDMyQkUoMClcbiAgICB0aGlzLnNpZ0lkeHMgPSBbXVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBzaWdDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCBzaWdpZHg6IFNpZ0lkeCA9IG5ldyBTaWdJZHgoKVxuICAgICAgY29uc3Qgc2lnYnVmZjogQnVmZmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICAgIHNpZ2lkeC5mcm9tQnVmZmVyKHNpZ2J1ZmYpXG4gICAgICBvZmZzZXQgKz0gNFxuICAgICAgdGhpcy5zaWdJZHhzLnB1c2goc2lnaWR4KVxuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIHRoaXMuc2lnQ291bnQud3JpdGVVSW50MzJCRSh0aGlzLnNpZ0lkeHMubGVuZ3RoLCAwKVxuICAgIGxldCBic2l6ZTogbnVtYmVyID0gdGhpcy5zaWdDb3VudC5sZW5ndGhcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFt0aGlzLnNpZ0NvdW50XVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLnNpZ0lkeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGI6IEJ1ZmZlciA9IHRoaXMuc2lnSWR4c1tpXS50b0J1ZmZlcigpXG4gICAgICBiYXJyLnB1c2goYilcbiAgICAgIGJzaXplICs9IGIubGVuZ3RoXG4gICAgfVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBiYXNlLTU4IHN0cmluZyByZXByZXNlbnRpbmcgdGhlIFtbTkZUTWludE9wZXJhdGlvbl1dLlxuICAgKi9cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuYnVmZmVyVG9CNTgodGhpcy50b0J1ZmZlcigpKVxuICB9XG5cbn1cblxuLyoqXG4gKiBBIGNsYXNzIHdoaWNoIGNvbnRhaW5zIGFuIFtbT3BlcmF0aW9uXV0gZm9yIHRyYW5zZmVycy5cbiAqXG4gKi9cbmV4cG9ydCBjbGFzcyBUcmFuc2ZlcmFibGVPcGVyYXRpb24gZXh0ZW5kcyBTZXJpYWxpemFibGUge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJUcmFuc2ZlcmFibGVPcGVyYXRpb25cIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBhc3NldElEOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5hc3NldElELCBlbmNvZGluZywgYnVmZmVyLCBjYjU4LCAzMiksXG4gICAgICB1dHhvSURzOiB0aGlzLnV0eG9JRHMubWFwKCh1KSA9PiB1LnNlcmlhbGl6ZShlbmNvZGluZykpLFxuICAgICAgb3BlcmF0aW9uOiB0aGlzLm9wZXJhdGlvbi5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgfVxuICB9XG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5hc3NldElEID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKGZpZWxkc1tcImFzc2V0SURcIl0sIGVuY29kaW5nLCBjYjU4LCBidWZmZXIsIDMyKVxuICAgIHRoaXMudXR4b0lEcyA9IGZpZWxkc1tcInV0eG9JRHNcIl0ubWFwKCh1Om9iamVjdCkgPT4ge1xuICAgICAgbGV0IHV0eG9pZDogVVRYT0lEID0gbmV3IFVUWE9JRCgpXG4gICAgICB1dHhvaWQuZGVzZXJpYWxpemUodSwgZW5jb2RpbmcpXG4gICAgICByZXR1cm4gdXR4b2lkXG4gICAgfSlcbiAgICB0aGlzLm9wZXJhdGlvbiA9IFNlbGVjdE9wZXJhdGlvbkNsYXNzKGZpZWxkc1tcIm9wZXJhdGlvblwiXVtcIl90eXBlSURcIl0pXG4gICAgdGhpcy5vcGVyYXRpb24uZGVzZXJpYWxpemUoZmllbGRzW1wib3BlcmF0aW9uXCJdLCBlbmNvZGluZylcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3NldElEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIpXG4gIHByb3RlY3RlZCB1dHhvSURzOiBVVFhPSURbXSA9IFtdXG4gIHByb3RlY3RlZCBvcGVyYXRpb246IE9wZXJhdGlvblxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgZnVuY3Rpb24gdXNlZCB0byBzb3J0IGFuIGFycmF5IG9mIFtbVHJhbnNmZXJhYmxlT3BlcmF0aW9uXV1zXG4gICAqL1xuICBzdGF0aWMgY29tcGFyYXRvciA9ICgpOiAoYTogVHJhbnNmZXJhYmxlT3BlcmF0aW9uLCBiOiBUcmFuc2ZlcmFibGVPcGVyYXRpb24pID0+ICgxIHwgLTEgfCAwKSA9PiB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oYTpUcmFuc2ZlcmFibGVPcGVyYXRpb24sIGI6VHJhbnNmZXJhYmxlT3BlcmF0aW9uKTooMXwtMXwwKSB7IFxuICAgICAgICByZXR1cm4gQnVmZmVyLmNvbXBhcmUoYS50b0J1ZmZlcigpLCBiLnRvQnVmZmVyKCkpIGFzICgxIHwgLTEgfCAwKVxuICAgICAgfVxuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhc3NldElEIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0uXG4gICAqL1xuICBnZXRBc3NldElEID0gKCk6IEJ1ZmZlciA9PiB0aGlzLmFzc2V0SURcblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBVVFhPSURzIGluIHRoaXMgb3BlcmF0aW9uLlxuICAgKi9cbiAgZ2V0VVRYT0lEcyA9ICgpOiBVVFhPSURbXSA9PiB0aGlzLnV0eG9JRHNcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3BlcmF0aW9uXG4gICAqL1xuICBnZXRPcGVyYXRpb24gPSAoKTogT3BlcmF0aW9uID0+IHRoaXMub3BlcmF0aW9uXG5cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMuYXNzZXRJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKVxuICAgIG9mZnNldCArPSAzMlxuICAgIGNvbnN0IG51bXV0eG9JRHM6IG51bWJlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy51dHhvSURzID0gW11cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbnVtdXR4b0lEczsgaSsrKSB7XG4gICAgICBjb25zdCB1dHhvaWQ6IFVUWE9JRCA9IG5ldyBVVFhPSUQoKVxuICAgICAgb2Zmc2V0ID0gdXR4b2lkLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICAgIHRoaXMudXR4b0lEcy5wdXNoKHV0eG9pZClcbiAgICB9XG4gICAgY29uc3Qgb3BpZDogbnVtYmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCkucmVhZFVJbnQzMkJFKDApXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLm9wZXJhdGlvbiA9IFNlbGVjdE9wZXJhdGlvbkNsYXNzKG9waWQpXG4gICAgcmV0dXJuIHRoaXMub3BlcmF0aW9uLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgfVxuXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgY29uc3QgbnVtdXR4b0lEcyA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIG51bXV0eG9JRHMud3JpdGVVSW50MzJCRSh0aGlzLnV0eG9JRHMubGVuZ3RoLCAwKVxuICAgIGxldCBic2l6ZTogbnVtYmVyID0gdGhpcy5hc3NldElELmxlbmd0aCArIG51bXV0eG9JRHMubGVuZ3RoXG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbdGhpcy5hc3NldElELCBudW11dHhvSURzXVxuICAgIHRoaXMudXR4b0lEcyA9IHRoaXMudXR4b0lEcy5zb3J0KFVUWE9JRC5jb21wYXJhdG9yKCkpXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMudXR4b0lEcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYjogQnVmZmVyID0gdGhpcy51dHhvSURzW2ldLnRvQnVmZmVyKClcbiAgICAgIGJhcnIucHVzaChiKVxuICAgICAgYnNpemUgKz0gYi5sZW5ndGhcbiAgICB9XG4gICAgY29uc3Qgb3BpZDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgb3BpZC53cml0ZVVJbnQzMkJFKHRoaXMub3BlcmF0aW9uLmdldE9wZXJhdGlvbklEKCksIDApXG4gICAgYmFyci5wdXNoKG9waWQpXG4gICAgYnNpemUgKz0gb3BpZC5sZW5ndGhcbiAgICBjb25zdCBiOiBCdWZmZXIgPSB0aGlzLm9wZXJhdGlvbi50b0J1ZmZlcigpXG4gICAgYnNpemUgKz0gYi5sZW5ndGhcbiAgICBiYXJyLnB1c2goYilcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSlcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGFzc2V0SUQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCwgdXR4b2lkczogVVRYT0lEW10gfCBzdHJpbmdbXSB8IEJ1ZmZlcltdID0gdW5kZWZpbmVkLCBvcGVyYXRpb246IE9wZXJhdGlvbiA9IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKClcbiAgICBpZiAoXG4gICAgICB0eXBlb2YgYXNzZXRJRCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBhc3NldElELmxlbmd0aCA9PT0gQVZNQ29uc3RhbnRzLkFTU0VUSURMRU5cbiAgICAgICYmIG9wZXJhdGlvbiBpbnN0YW5jZW9mIE9wZXJhdGlvbiAmJiB0eXBlb2YgdXR4b2lkcyAhPT0gXCJ1bmRlZmluZWRcIlxuICAgICAgICAgICAgJiYgQXJyYXkuaXNBcnJheSh1dHhvaWRzKVxuICAgICkge1xuICAgICAgdGhpcy5hc3NldElEID0gYXNzZXRJRFxuICAgICAgdGhpcy5vcGVyYXRpb24gPSBvcGVyYXRpb25cbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB1dHhvaWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHV0eG9pZDogVVRYT0lEID0gbmV3IFVUWE9JRCgpXG4gICAgICAgIGlmICh0eXBlb2YgdXR4b2lkc1tpXSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIHV0eG9pZC5mcm9tU3RyaW5nKHV0eG9pZHNbaV0gYXMgc3RyaW5nKVxuICAgICAgICB9IGVsc2UgaWYgKHV0eG9pZHNbaV0gaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgICB1dHhvaWQuZnJvbUJ1ZmZlcih1dHhvaWRzW2ldIGFzIEJ1ZmZlcilcbiAgICAgICAgfSBlbHNlIGlmICh1dHhvaWRzW2ldIGluc3RhbmNlb2YgVVRYT0lEKSB7XG4gICAgICAgICAgdXR4b2lkLmZyb21TdHJpbmcodXR4b2lkc1tpXS50b1N0cmluZygpKSAvLyBjbG9uZVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudXR4b0lEcy5wdXNoKHV0eG9pZClcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBbW09wZXJhdGlvbl1dIGNsYXNzIHdoaWNoIHNwZWNpZmllcyBhIFNFQ1AyNTZrMSBNaW50IE9wLlxuICovXG5leHBvcnQgY2xhc3MgU0VDUE1pbnRPcGVyYXRpb24gZXh0ZW5kcyBPcGVyYXRpb24ge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTRUNQTWludE9wZXJhdGlvblwiXG4gIHByb3RlY3RlZCBfY29kZWNJRCA9IEFWTUNvbnN0YW50cy5MQVRFU1RDT0RFQ1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHRoaXMuX2NvZGVjSUQgPT09IDAgPyBBVk1Db25zdGFudHMuU0VDUE1JTlRPUElEIDogQVZNQ29uc3RhbnRzLlNFQ1BNSU5UT1BJRF9DT0RFQ09ORVxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBtaW50T3V0cHV0OiB0aGlzLm1pbnRPdXRwdXQuc2VyaWFsaXplKGVuY29kaW5nKSxcbiAgICAgIHRyYW5zZmVyT3V0cHV0czogdGhpcy50cmFuc2Zlck91dHB1dC5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgfVxuICB9XG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5taW50T3V0cHV0ID0gbmV3IFNFQ1BNaW50T3V0cHV0KClcbiAgICB0aGlzLm1pbnRPdXRwdXQuZGVzZXJpYWxpemUoZmllbGRzW1wibWludE91dHB1dFwiXSwgZW5jb2RpbmcpXG4gICAgdGhpcy50cmFuc2Zlck91dHB1dCA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQoKVxuICAgIHRoaXMudHJhbnNmZXJPdXRwdXQuZGVzZXJpYWxpemUoZmllbGRzW1widHJhbnNmZXJPdXRwdXRzXCJdLCBlbmNvZGluZylcbiAgfVxuXG4gIHByb3RlY3RlZCBtaW50T3V0cHV0OiBTRUNQTWludE91dHB1dCA9IHVuZGVmaW5lZFxuICBwcm90ZWN0ZWQgdHJhbnNmZXJPdXRwdXQ6IFNFQ1BUcmFuc2Zlck91dHB1dCA9IHVuZGVmaW5lZFxuXG4gIC8qKlxuICAqIFNldCB0aGUgY29kZWNJRFxuICAqXG4gICogQHBhcmFtIGNvZGVjSUQgVGhlIGNvZGVjSUQgdG8gc2V0XG4gICovXG4gIHNldENvZGVjSUQoY29kZWNJRDogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYoY29kZWNJRCAhPT0gMCAmJiBjb2RlY0lEICE9PSAxKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IENvZGVjSWRFcnJvcihcIkVycm9yIC0gU0VDUE1pbnRPcGVyYXRpb24uc2V0Q29kZWNJRDogaW52YWxpZCBjb2RlY0lELiBWYWxpZCBjb2RlY0lEcyBhcmUgMCBhbmQgMS5cIilcbiAgICB9XG4gICAgdGhpcy5fY29kZWNJRCA9IGNvZGVjSURcbiAgICB0aGlzLl90eXBlSUQgPSB0aGlzLl9jb2RlY0lEID09PSAwID8gQVZNQ29uc3RhbnRzLlNFQ1BNSU5UT1BJRCA6IEFWTUNvbnN0YW50cy5TRUNQTUlOVE9QSURfQ09ERUNPTkVcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBvcGVyYXRpb24gSUQuXG4gICAqL1xuICBnZXRPcGVyYXRpb25JRCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjcmVkZW50aWFsIElELlxuICAgKi9cbiAgZ2V0Q3JlZGVudGlhbElEICgpOiBudW1iZXIge1xuICAgIGlmKHRoaXMuX2NvZGVjSUQgPT09IDApIHtcbiAgICAgIHJldHVybiBBVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2NvZGVjSUQgPT09IDEpIHtcbiAgICAgIHJldHVybiBBVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxfQ09ERUNPTkVcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgW1tTRUNQTWludE91dHB1dF1dIHRvIGJlIHByb2R1Y2VkIGJ5IHRoaXMgb3BlcmF0aW9uLlxuICAgKi9cbiAgZ2V0TWludE91dHB1dCgpOiBTRUNQTWludE91dHB1dCB7XG4gICAgcmV0dXJuIHRoaXMubWludE91dHB1dFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgW1tTRUNQVHJhbnNmZXJPdXRwdXRdXSB0byBiZSBwcm9kdWNlZCBieSB0aGlzIG9wZXJhdGlvbi5cbiAgICovXG4gIGdldFRyYW5zZmVyT3V0cHV0KCk6IFNFQ1BUcmFuc2Zlck91dHB1dCB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmZXJPdXRwdXRcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3B1YXRlcyB0aGUgaW5zdGFuY2UgZnJvbSBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgW1tTRUNQTWludE9wZXJhdGlvbl1dIGFuZCByZXR1cm5zIHRoZSB1cGRhdGVkIG9mZnNldC5cbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgdGhpcy5taW50T3V0cHV0ID0gbmV3IFNFQ1BNaW50T3V0cHV0KClcbiAgICBvZmZzZXQgPSB0aGlzLm1pbnRPdXRwdXQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIHRoaXMudHJhbnNmZXJPdXRwdXQgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KClcbiAgICBvZmZzZXQgPSB0aGlzLnRyYW5zZmVyT3V0cHV0LmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYnVmZmVyIHJlcHJlc2VudGluZyB0aGUgW1tTRUNQTWludE9wZXJhdGlvbl1dIGluc3RhbmNlLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCBzdXBlcmJ1ZmY6IEJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKClcbiAgICBjb25zdCBtaW50b3V0QnVmZjogQnVmZmVyID0gdGhpcy5taW50T3V0cHV0LnRvQnVmZmVyKClcbiAgICBjb25zdCB0cmFuc2Zlck91dEJ1ZmY6IEJ1ZmZlciA9IHRoaXMudHJhbnNmZXJPdXRwdXQudG9CdWZmZXIoKVxuICAgIGNvbnN0IGJzaXplOiBudW1iZXIgPVxuICAgICAgc3VwZXJidWZmLmxlbmd0aCArIFxuICAgICAgbWludG91dEJ1ZmYubGVuZ3RoICsgXG4gICAgICB0cmFuc2Zlck91dEJ1ZmYubGVuZ3RoXG5cbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFtcbiAgICAgIHN1cGVyYnVmZiwgXG4gICAgICBtaW50b3V0QnVmZixcbiAgICAgIHRyYW5zZmVyT3V0QnVmZlxuICAgIF1cblxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKVxuICB9XG5cbiAgLyoqXG4gICAqIEFuIFtbT3BlcmF0aW9uXV0gY2xhc3Mgd2hpY2ggbWludHMgbmV3IHRva2VucyBvbiBhbiBhc3NldElELlxuICAgKiBcbiAgICogQHBhcmFtIG1pbnRPdXRwdXQgVGhlIFtbU0VDUE1pbnRPdXRwdXRdXSB0aGF0IHdpbGwgYmUgcHJvZHVjZWQgYnkgdGhpcyB0cmFuc2FjdGlvbi5cbiAgICogQHBhcmFtIHRyYW5zZmVyT3V0cHV0IEEgW1tTRUNQVHJhbnNmZXJPdXRwdXRdXSB0aGF0IHdpbGwgYmUgcHJvZHVjZWQgZnJvbSB0aGlzIG1pbnRpbmcgb3BlcmF0aW9uLlxuICAgKi9cbiAgY29uc3RydWN0b3IobWludE91dHB1dDogU0VDUE1pbnRPdXRwdXQgPSB1bmRlZmluZWQsIHRyYW5zZmVyT3V0cHV0OiBTRUNQVHJhbnNmZXJPdXRwdXQgPSB1bmRlZmluZWQpIHtcbiAgICBzdXBlcigpXG4gICAgaWYgKHR5cGVvZiBtaW50T3V0cHV0ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLm1pbnRPdXRwdXQgPSBtaW50T3V0cHV0XG4gICAgfSBcbiAgICBpZiAodHlwZW9mIHRyYW5zZmVyT3V0cHV0ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLnRyYW5zZmVyT3V0cHV0ID0gdHJhbnNmZXJPdXRwdXRcbiAgICB9XG4gIH1cblxufVxuXG4vKipcbiAqIEFuIFtbT3BlcmF0aW9uXV0gY2xhc3Mgd2hpY2ggc3BlY2lmaWVzIGEgTkZUIE1pbnQgT3AuXG4gKi9cbmV4cG9ydCBjbGFzcyBORlRNaW50T3BlcmF0aW9uIGV4dGVuZHMgT3BlcmF0aW9uIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiTkZUTWludE9wZXJhdGlvblwiXG4gIHByb3RlY3RlZCBfY29kZWNJRCA9IEFWTUNvbnN0YW50cy5MQVRFU1RDT0RFQ1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHRoaXMuX2NvZGVjSUQgPT09IDAgPyBBVk1Db25zdGFudHMuTkZUTUlOVE9QSUQgOiBBVk1Db25zdGFudHMuTkZUTUlOVE9QSURfQ09ERUNPTkVcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGNvbnN0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBncm91cElEOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5ncm91cElELCBlbmNvZGluZywgYnVmZmVyLCBkZWNpbWFsU3RyaW5nLCA0KSxcbiAgICAgIHBheWxvYWQ6IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLnBheWxvYWQsIGVuY29kaW5nLCBidWZmZXIsIGhleCksXG4gICAgICBvdXRwdXRPd25lcnM6IHRoaXMub3V0cHV0T3duZXJzLm1hcCgobykgPT4gby5zZXJpYWxpemUoZW5jb2RpbmcpKVxuICAgIH1cbiAgfVxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMuZ3JvdXBJRCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJncm91cElEXCJdLCBlbmNvZGluZywgZGVjaW1hbFN0cmluZywgYnVmZmVyLCA0KVxuICAgIHRoaXMucGF5bG9hZCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJwYXlsb2FkXCJdLCBlbmNvZGluZywgaGV4LCBidWZmZXIpXG4gICAgLy8gdGhpcy5vdXRwdXRPd25lcnMgPSBmaWVsZHNbXCJvdXRwdXRPd25lcnNcIl0ubWFwKChvOiBORlRNaW50T3V0cHV0KSA9PiB7XG4gICAgLy8gICBsZXQgb286IE5GVE1pbnRPdXRwdXQgPSBuZXcgTkZUTWludE91dHB1dCgpXG4gICAgLy8gICBvby5kZXNlcmlhbGl6ZShvLCBlbmNvZGluZylcbiAgICAvLyAgIHJldHVybiBvb1xuICAgIC8vIH0pXG4gICAgdGhpcy5vdXRwdXRPd25lcnMgPSBmaWVsZHNbXCJvdXRwdXRPd25lcnNcIl0ubWFwKChvOiBvYmplY3QpOiBPdXRwdXRPd25lcnMgPT4ge1xuICAgICAgbGV0IG9vOiBPdXRwdXRPd25lcnMgPSBuZXcgT3V0cHV0T3duZXJzKClcbiAgICAgIG9vLmRlc2VyaWFsaXplKG8sIGVuY29kaW5nKVxuICAgICAgcmV0dXJuIG9vXG4gICAgfSlcbiAgfVxuXG4gIHByb3RlY3RlZCBncm91cElEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgcHJvdGVjdGVkIHBheWxvYWQ6IEJ1ZmZlclxuICBwcm90ZWN0ZWQgb3V0cHV0T3duZXJzOiBPdXRwdXRPd25lcnNbXSA9IFtdXG5cbiAgLyoqXG4gICogU2V0IHRoZSBjb2RlY0lEXG4gICpcbiAgKiBAcGFyYW0gY29kZWNJRCBUaGUgY29kZWNJRCB0byBzZXRcbiAgKi9cbiAgc2V0Q29kZWNJRChjb2RlY0lEOiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZihjb2RlY0lEICE9PSAwICYmIGNvZGVjSUQgIT09IDEpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgQ29kZWNJZEVycm9yKFwiRXJyb3IgLSBORlRNaW50T3BlcmF0aW9uLnNldENvZGVjSUQ6IGludmFsaWQgY29kZWNJRC4gVmFsaWQgY29kZWNJRHMgYXJlIDAgYW5kIDEuXCIpXG4gICAgfVxuICAgIHRoaXMuX2NvZGVjSUQgPSBjb2RlY0lEXG4gICAgdGhpcy5fdHlwZUlEID0gdGhpcy5fY29kZWNJRCA9PT0gMCA/IEFWTUNvbnN0YW50cy5ORlRNSU5UT1BJRCA6IEFWTUNvbnN0YW50cy5ORlRNSU5UT1BJRF9DT0RFQ09ORVxuICB9XG5cbiAgLyoqXG4gICogUmV0dXJucyB0aGUgb3BlcmF0aW9uIElELlxuICAqL1xuICBnZXRPcGVyYXRpb25JRCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIC8qKlxuICAqIFJldHVybnMgdGhlIGNyZWRlbnRpYWwgSUQuXG4gICovXG4gIGdldENyZWRlbnRpYWxJRCA9ICgpOiBudW1iZXIgPT4ge1xuICAgIGlmKHRoaXMuX2NvZGVjSUQgPT09IDApIHtcbiAgICAgIHJldHVybiBBVk1Db25zdGFudHMuTkZUQ1JFREVOVElBTFxuICAgIH0gZWxzZSBpZiAodGhpcy5fY29kZWNJRCA9PT0gMSkge1xuICAgICAgcmV0dXJuIEFWTUNvbnN0YW50cy5ORlRDUkVERU5USUFMX0NPREVDT05FXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICogUmV0dXJucyB0aGUgcGF5bG9hZC5cbiAgKi9cbiAgZ2V0R3JvdXBJRCA9ICgpOiBCdWZmZXIgPT4ge1xuICAgIHJldHVybiBiaW50b29scy5jb3B5RnJvbSh0aGlzLmdyb3VwSUQsIDApXG4gIH1cblxuICAvKipcbiAgKiBSZXR1cm5zIHRoZSBwYXlsb2FkLlxuICAqL1xuICBnZXRQYXlsb2FkID0gKCk6IEJ1ZmZlciA9PiB7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmNvcHlGcm9tKHRoaXMucGF5bG9hZCwgMClcbiAgfVxuXG4gIC8qKlxuICAqIFJldHVybnMgdGhlIHBheWxvYWQncyByYXcge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2l0aCBsZW5ndGggcHJlcGVuZGVkLCBmb3IgdXNlIHdpdGggW1tQYXlsb2FkQmFzZV1dJ3MgZnJvbUJ1ZmZlclxuICAqL1xuICBnZXRQYXlsb2FkQnVmZmVyID0gKCk6IEJ1ZmZlciA9PiB7XG4gICAgbGV0IHBheWxvYWRsZW46IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIHBheWxvYWRsZW4ud3JpdGVVSW50MzJCRSh0aGlzLnBheWxvYWQubGVuZ3RoLCAwKVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFtwYXlsb2FkbGVuLCBiaW50b29scy5jb3B5RnJvbSh0aGlzLnBheWxvYWQsIDApXSlcbiAgfVxuXG4gIC8qKlxuICAqIFJldHVybnMgdGhlIG91dHB1dE93bmVycy5cbiAgKi9cbiAgZ2V0T3V0cHV0T3duZXJzID0gKCk6IE91dHB1dE93bmVyc1tdID0+IHtcbiAgICByZXR1cm4gdGhpcy5vdXRwdXRPd25lcnNcbiAgfVxuXG4gIC8qKlxuICAqIFBvcHVhdGVzIHRoZSBpbnN0YW5jZSBmcm9tIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBbW05GVE1pbnRPcGVyYXRpb25dXSBhbmQgcmV0dXJucyB0aGUgdXBkYXRlZCBvZmZzZXQuXG4gICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgdGhpcy5ncm91cElEID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICBvZmZzZXQgKz0gNFxuICAgIGxldCBwYXlsb2FkTGVuOiBudW1iZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KS5yZWFkVUludDMyQkUoMClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHRoaXMucGF5bG9hZCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIHBheWxvYWRMZW4pXG4gICAgb2Zmc2V0ICs9IHBheWxvYWRMZW5cbiAgICBsZXQgbnVtb3V0cHV0czogbnVtYmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCkucmVhZFVJbnQzMkJFKDApXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLm91dHB1dE93bmVycyA9IFtdXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IG51bW91dHB1dHM7IGkrKykge1xuICAgICAgbGV0IG91dHB1dE93bmVyOiBPdXRwdXRPd25lcnMgPSBuZXcgT3V0cHV0T3duZXJzKClcbiAgICAgIG9mZnNldCA9IG91dHB1dE93bmVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICAgIHRoaXMub3V0cHV0T3duZXJzLnB1c2gob3V0cHV0T3duZXIpXG4gICAgfVxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAqIFJldHVybnMgdGhlIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIFtbTkZUTWludE9wZXJhdGlvbl1dIGluc3RhbmNlLlxuICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGNvbnN0IHN1cGVyYnVmZjogQnVmZmVyID0gc3VwZXIudG9CdWZmZXIoKVxuICAgIGNvbnN0IHBheWxvYWRsZW46IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIHBheWxvYWRsZW4ud3JpdGVVSW50MzJCRSh0aGlzLnBheWxvYWQubGVuZ3RoLCAwKVxuXG4gICAgY29uc3Qgb3V0cHV0b3duZXJzbGVuOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBvdXRwdXRvd25lcnNsZW4ud3JpdGVVSW50MzJCRSh0aGlzLm91dHB1dE93bmVycy5sZW5ndGgsIDApXG5cbiAgICBsZXQgYnNpemU6IG51bWJlciA9XG4gICAgICBzdXBlcmJ1ZmYubGVuZ3RoICsgXG4gICAgICB0aGlzLmdyb3VwSUQubGVuZ3RoICsgXG4gICAgICBwYXlsb2FkbGVuLmxlbmd0aCArIFxuICAgICAgdGhpcy5wYXlsb2FkLmxlbmd0aCArXG4gICAgICBvdXRwdXRvd25lcnNsZW4ubGVuZ3RoXG5cbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFtcbiAgICAgIHN1cGVyYnVmZiwgXG4gICAgICB0aGlzLmdyb3VwSUQsXG4gICAgICBwYXlsb2FkbGVuLFxuICAgICAgdGhpcy5wYXlsb2FkLCBcbiAgICAgIG91dHB1dG93bmVyc2xlblxuICAgIF1cblxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLm91dHB1dE93bmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IGI6IEJ1ZmZlciA9IHRoaXMub3V0cHV0T3duZXJzW2ldLnRvQnVmZmVyKClcbiAgICAgIGJhcnIucHVzaChiKVxuICAgICAgYnNpemUgKz0gYi5sZW5ndGhcbiAgICB9XG5cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSlcbiAgfVxuXG4gIC8qKlxuICAqIFJldHVybnMgYSBiYXNlLTU4IHN0cmluZyByZXByZXNlbnRpbmcgdGhlIFtbTkZUTWludE9wZXJhdGlvbl1dLlxuICAqL1xuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiBiaW50b29scy5idWZmZXJUb0I1OCh0aGlzLnRvQnVmZmVyKCkpXG4gIH1cblxuICAvKipcbiAgKiBBbiBbW09wZXJhdGlvbl1dIGNsYXNzIHdoaWNoIGNvbnRhaW5zIGFuIE5GVCBvbiBhbiBhc3NldElELlxuICAqXG4gICogQHBhcmFtIGdyb3VwSUQgVGhlIGdyb3VwIHRvIHdoaWNoIHRvIGlzc3VlIHRoZSBORlQgT3V0cHV0XG4gICogQHBhcmFtIHBheWxvYWQgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgTkZUIHBheWxvYWRcbiAgKiBAcGFyYW0gb3V0cHV0T3duZXJzIEFuIGFycmF5IG9mIG91dHB1dE93bmVyc1xuICAqL1xuICBjb25zdHJ1Y3Rvcihncm91cElEOiBudW1iZXIgPSB1bmRlZmluZWQsIHBheWxvYWQ6IEJ1ZmZlciA9IHVuZGVmaW5lZCwgb3V0cHV0T3duZXJzOiBPdXRwdXRPd25lcnNbXSA9IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKClcbiAgICBpZiAodHlwZW9mIGdyb3VwSUQgIT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIHBheWxvYWQgIT09IFwidW5kZWZpbmVkXCIgJiYgb3V0cHV0T3duZXJzLmxlbmd0aCkge1xuICAgICAgdGhpcy5ncm91cElELndyaXRlVUludDMyQkUoKGdyb3VwSUQgPyBncm91cElEIDogMCksIDApXG4gICAgICB0aGlzLnBheWxvYWQgPSBwYXlsb2FkXG4gICAgICB0aGlzLm91dHB1dE93bmVycyA9IG91dHB1dE93bmVyc1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiogQSBbW09wZXJhdGlvbl1dIGNsYXNzIHdoaWNoIHNwZWNpZmllcyBhIE5GVCBUcmFuc2ZlciBPcC5cbiovXG5leHBvcnQgY2xhc3MgTkZUVHJhbnNmZXJPcGVyYXRpb24gZXh0ZW5kcyBPcGVyYXRpb24ge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJORlRUcmFuc2Zlck9wZXJhdGlvblwiXG4gIHByb3RlY3RlZCBfY29kZWNJRCA9IEFWTUNvbnN0YW50cy5MQVRFU1RDT0RFQ1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHRoaXMuX2NvZGVjSUQgPT09IDAgPyBBVk1Db25zdGFudHMuTkZUWEZFUk9QSUQgOiBBVk1Db25zdGFudHMuTkZUWEZFUk9QSURfQ09ERUNPTkVcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGNvbnN0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBvdXRwdXQ6IHRoaXMub3V0cHV0LnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICB9XG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLm91dHB1dCA9IG5ldyBORlRUcmFuc2Zlck91dHB1dCgpXG4gICAgdGhpcy5vdXRwdXQuZGVzZXJpYWxpemUoZmllbGRzW1wib3V0cHV0XCJdLCBlbmNvZGluZylcbiAgfVxuXG4gIHByb3RlY3RlZCBvdXRwdXQ6IE5GVFRyYW5zZmVyT3V0cHV0XG5cbiAgLyoqXG4gICogU2V0IHRoZSBjb2RlY0lEXG4gICpcbiAgKiBAcGFyYW0gY29kZWNJRCBUaGUgY29kZWNJRCB0byBzZXRcbiAgKi9cbiAgc2V0Q29kZWNJRChjb2RlY0lEOiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZihjb2RlY0lEICE9PSAwICYmIGNvZGVjSUQgIT09IDEpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgQ29kZWNJZEVycm9yKFwiRXJyb3IgLSBORlRUcmFuc2Zlck9wZXJhdGlvbi5zZXRDb2RlY0lEOiBpbnZhbGlkIGNvZGVjSUQuIFZhbGlkIGNvZGVjSURzIGFyZSAwIGFuZCAxLlwiKVxuICAgIH1cbiAgICB0aGlzLl9jb2RlY0lEID0gY29kZWNJRFxuICAgIHRoaXMuX3R5cGVJRCA9IHRoaXMuX2NvZGVjSUQgPT09IDAgPyBBVk1Db25zdGFudHMuTkZUWEZFUk9QSUQgOiBBVk1Db25zdGFudHMuTkZUWEZFUk9QSURfQ09ERUNPTkVcbiAgfVxuXG4gIC8qKlxuICAqIFJldHVybnMgdGhlIG9wZXJhdGlvbiBJRC5cbiAgKi9cbiAgZ2V0T3BlcmF0aW9uSUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICAvKipcbiAgKiBSZXR1cm5zIHRoZSBjcmVkZW50aWFsIElELlxuICAqL1xuICBnZXRDcmVkZW50aWFsSUQgKCk6IG51bWJlciB7XG4gICAgaWYodGhpcy5fY29kZWNJRCA9PT0gMCkge1xuICAgICAgcmV0dXJuIEFWTUNvbnN0YW50cy5ORlRDUkVERU5USUFMXG4gICAgfSBlbHNlIGlmICh0aGlzLl9jb2RlY0lEID09PSAxKSB7XG4gICAgICByZXR1cm4gQVZNQ29uc3RhbnRzLk5GVENSRURFTlRJQUxfQ09ERUNPTkVcbiAgICB9XG4gIH1cblxuICBnZXRPdXRwdXQgPSAoKTogTkZUVHJhbnNmZXJPdXRwdXQgPT4gdGhpcy5vdXRwdXRcblxuICAvKipcbiAgKiBQb3B1YXRlcyB0aGUgaW5zdGFuY2UgZnJvbSBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgW1tORlRUcmFuc2Zlck9wZXJhdGlvbl1dIGFuZCByZXR1cm5zIHRoZSB1cGRhdGVkIG9mZnNldC5cbiAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICB0aGlzLm91dHB1dCA9IG5ldyBORlRUcmFuc2Zlck91dHB1dCgpXG4gICAgcmV0dXJuIHRoaXMub3V0cHV0LmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgfVxuXG4gIC8qKlxuICAqIFJldHVybnMgdGhlIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIFtbTkZUVHJhbnNmZXJPcGVyYXRpb25dXSBpbnN0YW5jZS5cbiAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCBzdXBlcmJ1ZmY6IEJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKClcbiAgICBjb25zdCBvdXRidWZmOiBCdWZmZXIgPSB0aGlzLm91dHB1dC50b0J1ZmZlcigpXG4gICAgY29uc3QgYnNpemU6IG51bWJlciA9IHN1cGVyYnVmZi5sZW5ndGggKyBvdXRidWZmLmxlbmd0aFxuICAgIGNvbnN0IGJhcnI6IEJ1ZmZlcltdID0gW3N1cGVyYnVmZiwgb3V0YnVmZl1cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSlcbiAgfVxuXG4gIC8qKlxuICAqIFJldHVybnMgYSBiYXNlLTU4IHN0cmluZyByZXByZXNlbnRpbmcgdGhlIFtbTkZUVHJhbnNmZXJPcGVyYXRpb25dXS5cbiAgKi9cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuYnVmZmVyVG9CNTgodGhpcy50b0J1ZmZlcigpKVxuICB9XG5cbiAgLyoqXG4gICogQW4gW1tPcGVyYXRpb25dXSBjbGFzcyB3aGljaCBjb250YWlucyBhbiBORlQgb24gYW4gYXNzZXRJRC5cbiAgKlxuICAqIEBwYXJhbSBvdXRwdXQgQW4gW1tORlRUcmFuc2Zlck91dHB1dF1dXG4gICovXG4gIGNvbnN0cnVjdG9yKG91dHB1dDogTkZUVHJhbnNmZXJPdXRwdXQgPSB1bmRlZmluZWQpIHtcbiAgICBzdXBlcigpXG4gICAgaWYgKHR5cGVvZiBvdXRwdXQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMub3V0cHV0ID0gb3V0cHV0XG4gICAgfVxuICB9XG59XG5cbi8qKlxuKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEgVVRYT0lEIHVzZWQgaW4gW1tUcmFuc2ZlcmFibGVPcF1dIHR5cGVzXG4qL1xuZXhwb3J0IGNsYXNzIFVUWE9JRCBleHRlbmRzIE5CeXRlcyB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlVUWE9JRFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIHByb3RlY3RlZCBieXRlcyA9IEJ1ZmZlci5hbGxvYygzNilcbiAgcHJvdGVjdGVkIGJzaXplID0gMzZcblxuICAvKipcbiAgKiBSZXR1cm5zIGEgZnVuY3Rpb24gdXNlZCB0byBzb3J0IGFuIGFycmF5IG9mIFtbVVRYT0lEXV1zXG4gICovXG4gIHN0YXRpYyBjb21wYXJhdG9yID0gKCk6IChhOiBVVFhPSUQsIGI6IFVUWE9JRCkgPT4gKDEgfCAtMSB8IDApID0+IChhOiBVVFhPSUQsIGI6IFVUWE9JRClcbiAgICA6ICgxIHwgLTEgfCAwKSA9PiBCdWZmZXIuY29tcGFyZShhLnRvQnVmZmVyKCksIGIudG9CdWZmZXIoKSkgYXMgKDEgfCAtMSB8IDApXG5cbiAgLyoqXG4gICogUmV0dXJucyBhIGJhc2UtNTggcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbVVRYT0lEXV0uXG4gICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmNiNThFbmNvZGUodGhpcy50b0J1ZmZlcigpKVxuICB9XG5cbiAgLyoqXG4gICogVGFrZXMgYSBiYXNlLTU4IHN0cmluZyBjb250YWluaW5nIGFuIFtbVVRYT0lEXV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgVVRYT0lEIGluIGJ5dGVzLlxuICAqXG4gICogQHBhcmFtIGJ5dGVzIEEgYmFzZS01OCBzdHJpbmcgY29udGFpbmluZyBhIHJhdyBbW1VUWE9JRF1dXG4gICpcbiAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tVVFhPSURdXVxuICAqL1xuICBmcm9tU3RyaW5nKHV0eG9pZDogc3RyaW5nKTogbnVtYmVyIHtcbiAgICBjb25zdCB1dHhvaWRidWZmOiBCdWZmZXIgPSBiaW50b29scy5iNThUb0J1ZmZlcih1dHhvaWQpXG4gICAgaWYgKHV0eG9pZGJ1ZmYubGVuZ3RoID09PSA0MCAmJiBiaW50b29scy52YWxpZGF0ZUNoZWNrc3VtKHV0eG9pZGJ1ZmYpKSB7XG4gICAgICBjb25zdCBuZXdidWZmOiBCdWZmZXIgPSBiaW50b29scy5jb3B5RnJvbSh1dHhvaWRidWZmLCAwLCB1dHhvaWRidWZmLmxlbmd0aCAtIDQpXG4gICAgICBpZiAobmV3YnVmZi5sZW5ndGggPT09IDM2KSB7XG4gICAgICAgIHRoaXMuYnl0ZXMgPSBuZXdidWZmXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh1dHhvaWRidWZmLmxlbmd0aCA9PT0gNDApIHtcbiAgICAgIHRocm93IG5ldyBDaGVja3N1bUVycm9yKFwiRXJyb3IgLSBVVFhPSUQuZnJvbVN0cmluZzogaW52YWxpZCBjaGVja3N1bSBvbiBhZGRyZXNzXCIpXG4gICAgfSBlbHNlIGlmICh1dHhvaWRidWZmLmxlbmd0aCA9PT0gMzYpIHtcbiAgICAgIHRoaXMuYnl0ZXMgPSB1dHhvaWRidWZmXG4gICAgfSBlbHNlIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKFwiRXJyb3IgLSBVVFhPSUQuZnJvbVN0cmluZzogaW52YWxpZCBhZGRyZXNzXCIpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmdldFNpemUoKVxuICAgIFxuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgY29uc3QgbmV3YmFzZTogVVRYT0lEID0gbmV3IFVUWE9JRCgpXG4gICAgbmV3YmFzZS5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3YmFzZSBhcyB0aGlzXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFVUWE9JRCgpIGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAqIENsYXNzIGZvciByZXByZXNlbnRpbmcgYSBVVFhPSUQgdXNlZCBpbiBbW1RyYW5zZmVyYWJsZU9wXV0gdHlwZXNcbiAgKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKVxuICB9XG59Il19