"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardTx = exports.StandardUnsignedTx = exports.StandardBaseTx = void 0;
/**
 * @packageDocumentation
 * @module Common-Transactions
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const input_1 = require("./input");
const output_1 = require("./output");
const constants_1 = require("../utils/constants");
const serialization_1 = require("../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
const cb58 = "cb58";
const hex = "hex";
const decimalString = "decimalString";
const buffer = "Buffer";
/**
 * Class representing a base for all transactions.
 */
class StandardBaseTx extends serialization_1.Serializable {
    /**
     * Class representing a StandardBaseTx which is the foundation for all transactions.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     */
    constructor(networkID = constants_1.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined) {
        super();
        this._typeName = "StandardBaseTx";
        this._typeID = undefined;
        this.networkID = buffer_1.Buffer.alloc(4);
        this.blockchainID = buffer_1.Buffer.alloc(32);
        this.numouts = buffer_1.Buffer.alloc(4);
        this.numins = buffer_1.Buffer.alloc(4);
        this.memo = buffer_1.Buffer.alloc(0);
        /**
         * Returns the NetworkID as a number
         */
        this.getNetworkID = () => this.networkID.readUInt32BE(0);
        /**
         * Returns the Buffer representation of the BlockchainID
         */
        this.getBlockchainID = () => this.blockchainID;
        /**
         * Returns the {@link https://github.com/feross/buffer|Buffer} representation of the memo
         */
        this.getMemo = () => this.memo;
        this.networkID.writeUInt32BE(networkID, 0);
        this.blockchainID = blockchainID;
        if (typeof memo != "undefined") {
            this.memo = memo;
        }
        if (typeof ins !== "undefined" && typeof outs !== "undefined") {
            this.numouts.writeUInt32BE(outs.length, 0);
            this.outs = outs.sort(output_1.StandardTransferableOutput.comparator());
            this.numins.writeUInt32BE(ins.length, 0);
            this.ins = ins.sort(input_1.StandardTransferableInput.comparator());
        }
    }
    serialize(encoding = "hex") {
        const fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { networkID: serialization.encoder(this.networkID, encoding, buffer, decimalString), blockchainID: serialization.encoder(this.blockchainID, encoding, buffer, cb58), outs: this.outs.map((o) => o.serialize(encoding)), ins: this.ins.map((i) => i.serialize(encoding)), memo: serialization.encoder(this.memo, encoding, buffer, hex) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.networkID = serialization.decoder(fields["networkID"], encoding, decimalString, buffer, 4);
        this.blockchainID = serialization.decoder(fields["blockchainID"], encoding, cb58, buffer, 32);
        this.memo = serialization.decoder(fields["memo"], encoding, hex, buffer);
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[StandardBaseTx]].
     */
    toBuffer() {
        this.outs.sort(output_1.StandardTransferableOutput.comparator());
        this.ins.sort(input_1.StandardTransferableInput.comparator());
        this.numouts.writeUInt32BE(this.outs.length, 0);
        this.numins.writeUInt32BE(this.ins.length, 0);
        let bsize = this.networkID.length + this.blockchainID.length + this.numouts.length;
        const barr = [this.networkID, this.blockchainID, this.numouts];
        for (let i = 0; i < this.outs.length; i++) {
            const b = this.outs[i].toBuffer();
            barr.push(b);
            bsize += b.length;
        }
        barr.push(this.numins);
        bsize += this.numins.length;
        for (let i = 0; i < this.ins.length; i++) {
            const b = this.ins[i].toBuffer();
            barr.push(b);
            bsize += b.length;
        }
        let memolen = buffer_1.Buffer.alloc(4);
        memolen.writeUInt32BE(this.memo.length, 0);
        barr.push(memolen);
        bsize += 4;
        barr.push(this.memo);
        bsize += this.memo.length;
        const buff = buffer_1.Buffer.concat(barr, bsize);
        return buff;
    }
    /**
     * Returns a base-58 representation of the [[StandardBaseTx]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
}
exports.StandardBaseTx = StandardBaseTx;
/**
 * Class representing an unsigned transaction.
 */
class StandardUnsignedTx extends serialization_1.Serializable {
    constructor(transaction = undefined, codecID = 0) {
        super();
        this._typeName = "StandardUnsignedTx";
        this._typeID = undefined;
        this.codecID = 0;
        /**
         * Returns the CodecID as a number
         */
        this.getCodecID = () => this.codecID;
        /**
        * Returns the {@link https://github.com/feross/buffer|Buffer} representation of the CodecID
        */
        this.getCodecIDBuffer = () => {
            let codecBuf = buffer_1.Buffer.alloc(2);
            codecBuf.writeUInt16BE(this.codecID, 0);
            return codecBuf;
        };
        /**
         * Returns the inputTotal as a BN
         */
        this.getInputTotal = (assetID) => {
            const ins = this.getTransaction().getIns();
            const aIDHex = assetID.toString("hex");
            let total = new bn_js_1.default(0);
            for (let i = 0; i < ins.length; i++) {
                // only check StandardAmountInputs
                if (ins[i].getInput() instanceof input_1.StandardAmountInput && aIDHex === ins[i].getAssetID().toString("hex")) {
                    const input = ins[i].getInput();
                    total = total.add(input.getAmount());
                }
            }
            return total;
        };
        /**
         * Returns the outputTotal as a BN
         */
        this.getOutputTotal = (assetID) => {
            const outs = this.getTransaction().getTotalOuts();
            const aIDHex = assetID.toString("hex");
            let total = new bn_js_1.default(0);
            for (let i = 0; i < outs.length; i++) {
                // only check StandardAmountOutput
                if (outs[i].getOutput() instanceof output_1.StandardAmountOutput && aIDHex === outs[i].getAssetID().toString("hex")) {
                    const output = outs[i].getOutput();
                    total = total.add(output.getAmount());
                }
            }
            return total;
        };
        /**
         * Returns the number of burned tokens as a BN
         */
        this.getBurn = (assetID) => {
            return this.getInputTotal(assetID).sub(this.getOutputTotal(assetID));
        };
        this.codecID = codecID;
        this.transaction = transaction;
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { codecID: serialization.encoder(this.codecID, encoding, "number", "decimalString", 2), transaction: this.transaction.serialize(encoding) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.codecID = serialization.decoder(fields["codecID"], encoding, "decimalString", "number");
    }
    toBuffer() {
        const codecBuf = buffer_1.Buffer.alloc(2);
        codecBuf.writeUInt16BE(this.transaction.getCodecID(), 0);
        const txtype = buffer_1.Buffer.alloc(4);
        txtype.writeUInt32BE(this.transaction.getTxType(), 0);
        const basebuff = this.transaction.toBuffer();
        return buffer_1.Buffer.concat([codecBuf, txtype, basebuff], codecBuf.length + txtype.length + basebuff.length);
    }
}
exports.StandardUnsignedTx = StandardUnsignedTx;
/**
 * Class representing a signed transaction.
 */
class StandardTx extends serialization_1.Serializable {
    /**
     * Class representing a signed transaction.
     *
     * @param unsignedTx Optional [[StandardUnsignedTx]]
     * @param signatures Optional array of [[Credential]]s
     */
    constructor(unsignedTx = undefined, credentials = undefined) {
        super();
        this._typeName = "StandardTx";
        this._typeID = undefined;
        this.unsignedTx = undefined;
        this.credentials = [];
        /**
         * Returns the [[Credential[]]]
         */
        this.getCredentials = () => {
            return this.credentials;
        };
        /**
         * Returns the [[StandardUnsignedTx]]
         */
        this.getUnsignedTx = () => {
            return this.unsignedTx;
        };
        if (typeof unsignedTx !== "undefined") {
            this.unsignedTx = unsignedTx;
            if (typeof credentials !== "undefined") {
                this.credentials = credentials;
            }
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "unsignedTx": this.unsignedTx.serialize(encoding), "credentials": this.credentials.map((c) => c.serialize(encoding)) });
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[StandardTx]].
     */
    toBuffer() {
        const tx = this.unsignedTx.getTransaction();
        const codecID = tx.getCodecID();
        const txbuff = this.unsignedTx.toBuffer();
        let bsize = txbuff.length;
        const credlen = buffer_1.Buffer.alloc(4);
        credlen.writeUInt32BE(this.credentials.length, 0);
        const barr = [txbuff, credlen];
        bsize += credlen.length;
        for (let i = 0; i < this.credentials.length; i++) {
            this.credentials[i].setCodecID(codecID);
            const credID = buffer_1.Buffer.alloc(4);
            credID.writeUInt32BE(this.credentials[i].getCredentialID(), 0);
            barr.push(credID);
            bsize += credID.length;
            const credbuff = this.credentials[i].toBuffer();
            bsize += credbuff.length;
            barr.push(credbuff);
        }
        const buff = buffer_1.Buffer.concat(barr, bsize);
        return buff;
    }
    /**
     * Takes a base-58 string containing an [[StandardTx]], parses it, populates the class, and returns the length of the Tx in bytes.
     *
     * @param serialized A base-58 string containing a raw [[StandardTx]]
     *
     * @returns The length of the raw [[StandardTx]]
     *
     * @remarks
     * unlike most fromStrings, it expects the string to be serialized in cb58 format
     */
    fromString(serialized) {
        return this.fromBuffer(bintools.cb58Decode(serialized));
    }
    /**
     * Returns a cb58 representation of the [[StandardTx]].
     *
     * @remarks
     * unlike most toStrings, this returns in cb58 serialization format
     */
    toString() {
        return bintools.cb58Encode(this.toBuffer());
    }
}
exports.StandardTx = StandardTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL3R4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUNoQyxpRUFBd0M7QUFFeEMsa0RBQXNCO0FBRXRCLG1DQUF3RTtBQUN4RSxxQ0FBMkU7QUFDM0Usa0RBQXFEO0FBQ3JELDBEQUF3RztBQUV4Rzs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDaEUsTUFBTSxJQUFJLEdBQW1CLE1BQU0sQ0FBQTtBQUNuQyxNQUFNLEdBQUcsR0FBbUIsS0FBSyxDQUFBO0FBQ2pDLE1BQU0sYUFBYSxHQUFtQixlQUFlLENBQUE7QUFDckQsTUFBTSxNQUFNLEdBQW1CLFFBQVEsQ0FBQTtBQUV2Qzs7R0FFRztBQUNILE1BQXNCLGNBQTJGLFNBQVEsNEJBQVk7SUF5SG5JOzs7Ozs7OztPQVFHO0lBQ0gsWUFBWSxZQUFvQiw0QkFBZ0IsRUFBRSxlQUF1QixlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFxQyxTQUFTLEVBQUUsTUFBbUMsU0FBUyxFQUFFLE9BQWUsU0FBUztRQUNuTixLQUFLLEVBQUUsQ0FBQTtRQWxJQyxjQUFTLEdBQUcsZ0JBQWdCLENBQUE7UUFDNUIsWUFBTyxHQUFHLFNBQVMsQ0FBQTtRQXFCbkIsY0FBUyxHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbkMsaUJBQVksR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZDLFlBQU8sR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBRWpDLFdBQU0sR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMs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O1lBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7U0FDcEI7UUFDRCxNQUFNLElBQUksR0FBVyxlQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUMvQyxPQUFPLElBQUksQ0FBQTtJQUNiLENBQUM7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDSCxVQUFVLENBQUMsVUFBa0I7UUFDM0IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQTtJQUN6RCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxRQUFRO1FBQ04sT0FBTyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0lBQzdDLENBQUM7Q0FpQkY7QUF4R0QsZ0NBd0dDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQ29tbW9uLVRyYW5zYWN0aW9uc1xuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IENyZWRlbnRpYWwgfSBmcm9tIFwiLi9jcmVkZW50aWFsc1wiXG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCJcbmltcG9ydCB7IFN0YW5kYXJkS2V5Q2hhaW4sIFN0YW5kYXJkS2V5UGFpciB9IGZyb20gXCIuL2tleWNoYWluXCJcbmltcG9ydCB7IFN0YW5kYXJkQW1vdW50SW5wdXQsIFN0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXQgfSBmcm9tIFwiLi9pbnB1dFwiXG5pbXBvcnQgeyBTdGFuZGFyZEFtb3VudE91dHB1dCwgU3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tIFwiLi9vdXRwdXRcIlxuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCB9IGZyb20gXCIuLi91dGlscy9jb25zdGFudHNcIlxuaW1wb3J0IHsgU2VyaWFsaXphYmxlLCBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcsIFNlcmlhbGl6ZWRUeXBlIH0gZnJvbSBcIi4uL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuY29uc3QgY2I1ODogU2VyaWFsaXplZFR5cGUgPSBcImNiNThcIlxuY29uc3QgaGV4OiBTZXJpYWxpemVkVHlwZSA9IFwiaGV4XCJcbmNvbnN0IGRlY2ltYWxTdHJpbmc6IFNlcmlhbGl6ZWRUeXBlID0gXCJkZWNpbWFsU3RyaW5nXCJcbmNvbnN0IGJ1ZmZlcjogU2VyaWFsaXplZFR5cGUgPSBcIkJ1ZmZlclwiXG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgYmFzZSBmb3IgYWxsIHRyYW5zYWN0aW9ucy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0YW5kYXJkQmFzZVR4PEtQQ2xhc3MgZXh0ZW5kcyBTdGFuZGFyZEtleVBhaXIsIEtDQ2xhc3MgZXh0ZW5kcyBTdGFuZGFyZEtleUNoYWluPEtQQ2xhc3M+PiBleHRlbmRzIFNlcmlhbGl6YWJsZXtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU3RhbmRhcmRCYXNlVHhcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgY29uc3QgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIG5ldHdvcmtJRDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMubmV0d29ya0lELCBlbmNvZGluZywgYnVmZmVyLCBkZWNpbWFsU3RyaW5nKSxcbiAgICAgIGJsb2NrY2hhaW5JRDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuYmxvY2tjaGFpbklELCBlbmNvZGluZywgYnVmZmVyLCBjYjU4KSxcbiAgICAgIG91dHM6IHRoaXMub3V0cy5tYXAoKG8pID0+IG8uc2VyaWFsaXplKGVuY29kaW5nKSksXG4gICAgICBpbnM6IHRoaXMuaW5zLm1hcCgoaSkgPT4gaS5zZXJpYWxpemUoZW5jb2RpbmcpKSxcbiAgICAgIG1lbW86IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLm1lbW8sIGVuY29kaW5nLCBidWZmZXIsIGhleClcbiAgICB9XG4gIH1cblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMubmV0d29ya0lEID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKGZpZWxkc1tcIm5ldHdvcmtJRFwiXSwgZW5jb2RpbmcsIGRlY2ltYWxTdHJpbmcsIGJ1ZmZlciwgNClcbiAgICB0aGlzLmJsb2NrY2hhaW5JRCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJibG9ja2NoYWluSURcIl0sIGVuY29kaW5nLCBjYjU4LCBidWZmZXIsIDMyKVxuICAgIHRoaXMubWVtbyA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJtZW1vXCJdLCBlbmNvZGluZywgaGV4LCBidWZmZXIpXG4gIH1cblxuICBwcm90ZWN0ZWQgbmV0d29ya0lEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgcHJvdGVjdGVkIGJsb2NrY2hhaW5JRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyKVxuICBwcm90ZWN0ZWQgbnVtb3V0czogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gIHByb3RlY3RlZCBvdXRzOiBTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dFtdXG4gIHByb3RlY3RlZCBudW1pbnM6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICBwcm90ZWN0ZWQgaW5zOiBTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0W11cbiAgcHJvdGVjdGVkIG1lbW86IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygwKVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpZCBvZiB0aGUgW1tTdGFuZGFyZEJhc2VUeF1dXG4gICAqL1xuICBhYnN0cmFjdCBnZXRUeFR5cGU6ICgpID0+IG51bWJlclxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBOZXR3b3JrSUQgYXMgYSBudW1iZXJcbiAgICovXG4gIGdldE5ldHdvcmtJRCA9ICgpOiBudW1iZXIgPT4gdGhpcy5uZXR3b3JrSUQucmVhZFVJbnQzMkJFKDApXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIEJ1ZmZlciByZXByZXNlbnRhdGlvbiBvZiB0aGUgQmxvY2tjaGFpbklEXG4gICAqL1xuICBnZXRCbG9ja2NoYWluSUQgPSAoKTogQnVmZmVyID0+IHRoaXMuYmxvY2tjaGFpbklEXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFycmF5IG9mIFtbU3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgKi9cbiAgYWJzdHJhY3QgZ2V0SW5zKCk6IFN0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXRbXVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhcnJheSBvZiBbW1N0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0XV1zXG4gICAqL1xuICBhYnN0cmFjdCBnZXRPdXRzKCk6IFN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0W11cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYXJyYXkgb2YgY29tYmluZWQgdG90YWwgW1tTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dF1dc1xuICAgKi9cbiAgYWJzdHJhY3QgZ2V0VG90YWxPdXRzKCk6IFN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0W11cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIG1lbW8gXG4gICAqL1xuICBnZXRNZW1vID0gKCk6IEJ1ZmZlciA9PiB0aGlzLm1lbW9cblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW1N0YW5kYXJkQmFzZVR4XV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIHRoaXMub3V0cy5zb3J0KFN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0LmNvbXBhcmF0b3IoKSlcbiAgICB0aGlzLmlucy5zb3J0KFN0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXQuY29tcGFyYXRvcigpKVxuICAgIHRoaXMubnVtb3V0cy53cml0ZVVJbnQzMkJFKHRoaXMub3V0cy5sZW5ndGgsIDApXG4gICAgdGhpcy5udW1pbnMud3JpdGVVSW50MzJCRSh0aGlzLmlucy5sZW5ndGgsIDApXG4gICAgbGV0IGJzaXplOiBudW1iZXIgPSB0aGlzLm5ldHdvcmtJRC5sZW5ndGggKyB0aGlzLmJsb2NrY2hhaW5JRC5sZW5ndGggKyB0aGlzLm51bW91dHMubGVuZ3RoXG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbdGhpcy5uZXR3b3JrSUQsIHRoaXMuYmxvY2tjaGFpbklELCB0aGlzLm51bW91dHNdXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMub3V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYjogQnVmZmVyID0gdGhpcy5vdXRzW2ldLnRvQnVmZmVyKClcbiAgICAgIGJhcnIucHVzaChiKVxuICAgICAgYnNpemUgKz0gYi5sZW5ndGhcbiAgICB9XG4gICAgYmFyci5wdXNoKHRoaXMubnVtaW5zKVxuICAgIGJzaXplICs9IHRoaXMubnVtaW5zLmxlbmd0aFxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmlucy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYjogQnVmZmVyID0gdGhpcy5pbnNbaV0udG9CdWZmZXIoKVxuICAgICAgYmFyci5wdXNoKGIpXG4gICAgICBic2l6ZSArPSBiLmxlbmd0aFxuICAgIH1cbiAgICBsZXQgbWVtb2xlbjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgbWVtb2xlbi53cml0ZVVJbnQzMkJFKHRoaXMubWVtby5sZW5ndGgsIDApXG4gICAgYmFyci5wdXNoKG1lbW9sZW4pXG4gICAgYnNpemUgKz0gNFxuICAgIGJhcnIucHVzaCh0aGlzLm1lbW8pXG4gICAgYnNpemUgKz0gdGhpcy5tZW1vLmxlbmd0aFxuICAgIGNvbnN0IGJ1ZmY6IEJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpXG4gICAgcmV0dXJuIGJ1ZmZcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tTdGFuZGFyZEJhc2VUeF1dLlxuICAgKi9cbiAgdG9TdHJpbmcoKTpzdHJpbmcge1xuICAgIHJldHVybiBiaW50b29scy5idWZmZXJUb0I1OCh0aGlzLnRvQnVmZmVyKCkpXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgdGhlIGJ5dGVzIG9mIGFuIFtbVW5zaWduZWRUeF1dIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mIFtbQ3JlZGVudGlhbF1dc1xuICAgKlxuICAgKiBAcGFyYW0gbXNnIEEgQnVmZmVyIGZvciB0aGUgW1tVbnNpZ25lZFR4XV1cbiAgICogQHBhcmFtIGtjIEFuIFtbS2V5Q2hhaW5dXSB1c2VkIGluIHNpZ25pbmdcbiAgICpcbiAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAqL1xuICBhYnN0cmFjdCBzaWduKG1zZzogQnVmZmVyLCBrYzogU3RhbmRhcmRLZXlDaGFpbjxLUENsYXNzPik6IENyZWRlbnRpYWxbXVxuXG4gIGFic3RyYWN0IGNsb25lKCk6IHRoaXNcblxuICBhYnN0cmFjdCBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzXG5cbiAgYWJzdHJhY3Qgc2VsZWN0KGlkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogdGhpc1xuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYSBTdGFuZGFyZEJhc2VUeCB3aGljaCBpcyB0aGUgZm91bmRhdGlvbiBmb3IgYWxsIHRyYW5zYWN0aW9ucy5cbiAgICpcbiAgICogQHBhcmFtIG5ldHdvcmtJRCBPcHRpb25hbCBuZXR3b3JrSUQsIFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgT3B0aW9uYWwgYmxvY2tjaGFpbklELCBkZWZhdWx0IEJ1ZmZlci5hbGxvYygzMiwgMTYpXG4gICAqIEBwYXJhbSBvdXRzIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZU91dHB1dF1dc1xuICAgKiBAcGFyYW0gaW5zIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZUlucHV0XV1zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgbWVtbyBmaWVsZFxuICAgKi9cbiAgY29uc3RydWN0b3IobmV0d29ya0lEOiBudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELCBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMiwgMTYpLCBvdXRzOiBTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dFtdID0gdW5kZWZpbmVkLCBpbnM6IFN0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHVuZGVmaW5lZCwgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMubmV0d29ya0lELndyaXRlVUludDMyQkUobmV0d29ya0lELCAwKVxuICAgIHRoaXMuYmxvY2tjaGFpbklEID0gYmxvY2tjaGFpbklEXG4gICAgaWYodHlwZW9mIG1lbW8gIT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICB0aGlzLm1lbW8gPSBtZW1vXG4gICAgfVxuICAgIFxuICAgIGlmICh0eXBlb2YgaW5zICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBvdXRzICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLm51bW91dHMud3JpdGVVSW50MzJCRShvdXRzLmxlbmd0aCwgMClcbiAgICAgIHRoaXMub3V0cyA9IG91dHMuc29ydChTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dC5jb21wYXJhdG9yKCkpXG4gICAgICB0aGlzLm51bWlucy53cml0ZVVJbnQzMkJFKGlucy5sZW5ndGgsIDApXG4gICAgICB0aGlzLmlucyA9IGlucy5zb3J0KFN0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXQuY29tcGFyYXRvcigpKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCB0cmFuc2FjdGlvbi5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0YW5kYXJkVW5zaWduZWRUeDxLUENsYXNzIGV4dGVuZHMgU3RhbmRhcmRLZXlQYWlyLCBcbktDQ2xhc3MgZXh0ZW5kcyBTdGFuZGFyZEtleUNoYWluPEtQQ2xhc3M+LCBcblNCVHggZXh0ZW5kcyBTdGFuZGFyZEJhc2VUeDxLUENsYXNzLCBLQ0NsYXNzPlxuPiBleHRlbmRzIFNlcmlhbGl6YWJsZXtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU3RhbmRhcmRVbnNpZ25lZFR4XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgY29kZWNJRDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuY29kZWNJRCwgZW5jb2RpbmcsIFwibnVtYmVyXCIsIFwiZGVjaW1hbFN0cmluZ1wiLCAyKSxcbiAgICAgIHRyYW5zYWN0aW9uOiB0aGlzLnRyYW5zYWN0aW9uLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICB9XG4gIH1cblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMuY29kZWNJRCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJjb2RlY0lEXCJdLCBlbmNvZGluZywgXCJkZWNpbWFsU3RyaW5nXCIsIFwibnVtYmVyXCIpXG4gIH1cblxuICBwcm90ZWN0ZWQgY29kZWNJRDogbnVtYmVyID0gMFxuICBwcm90ZWN0ZWQgdHJhbnNhY3Rpb246IFNCVHhcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgQ29kZWNJRCBhcyBhIG51bWJlclxuICAgKi9cbiAgZ2V0Q29kZWNJRCA9ICgpOiBudW1iZXIgPT4gdGhpcy5jb2RlY0lEXG5cbiAgLyoqXG4gICogUmV0dXJucyB0aGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIENvZGVjSURcbiAgKi9cbiAgZ2V0Q29kZWNJREJ1ZmZlciA9ICgpOiBCdWZmZXIgPT4ge1xuICAgIGxldCBjb2RlY0J1ZjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDIpXG4gICAgY29kZWNCdWYud3JpdGVVSW50MTZCRSh0aGlzLmNvZGVjSUQsIDApXG4gICAgcmV0dXJuIGNvZGVjQnVmXG4gIH0gXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlucHV0VG90YWwgYXMgYSBCTiBcbiAgICovXG4gIGdldElucHV0VG90YWwgPSAoYXNzZXRJRDogQnVmZmVyKTogQk4gPT4ge1xuICAgIGNvbnN0IGluczogU3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dFtdID0gdGhpcy5nZXRUcmFuc2FjdGlvbigpLmdldElucygpXG4gICAgY29uc3QgYUlESGV4OiBzdHJpbmcgPSBhc3NldElELnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgbGV0IHRvdGFsOiBCTiA9IG5ldyBCTigwKVxuXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGlucy5sZW5ndGg7IGkrKykge1xuICAgICAgIFxuXG4gICAgICAvLyBvbmx5IGNoZWNrIFN0YW5kYXJkQW1vdW50SW5wdXRzXG4gICAgICBpZiAoaW5zW2ldLmdldElucHV0KCkgaW5zdGFuY2VvZiBTdGFuZGFyZEFtb3VudElucHV0ICYmIGFJREhleCA9PT0gaW5zW2ldLmdldEFzc2V0SUQoKS50b1N0cmluZyhcImhleFwiKSkge1xuICAgICAgICBjb25zdCBpbnB1dCA9IGluc1tpXS5nZXRJbnB1dCgpIGFzIFN0YW5kYXJkQW1vdW50SW5wdXRcbiAgICAgICAgdG90YWwgPSB0b3RhbC5hZGQoaW5wdXQuZ2V0QW1vdW50KCkpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0b3RhbFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG91dHB1dFRvdGFsIGFzIGEgQk5cbiAgICovXG4gIGdldE91dHB1dFRvdGFsID0gKGFzc2V0SUQ6IEJ1ZmZlcik6IEJOID0+IHtcbiAgICBjb25zdCBvdXRzOiBTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dFtdID0gdGhpcy5nZXRUcmFuc2FjdGlvbigpLmdldFRvdGFsT3V0cygpXG4gICAgY29uc3QgYUlESGV4OiBzdHJpbmcgPSBhc3NldElELnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgbGV0IHRvdGFsOiBCTiA9IG5ldyBCTigwKVxuXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IG91dHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgLy8gb25seSBjaGVjayBTdGFuZGFyZEFtb3VudE91dHB1dFxuICAgICAgaWYgKG91dHNbaV0uZ2V0T3V0cHV0KCkgaW5zdGFuY2VvZiBTdGFuZGFyZEFtb3VudE91dHB1dCAmJiBhSURIZXggPT09IG91dHNbaV0uZ2V0QXNzZXRJRCgpLnRvU3RyaW5nKFwiaGV4XCIpKSB7XG4gICAgICAgIGNvbnN0IG91dHB1dDogU3RhbmRhcmRBbW91bnRPdXRwdXQgPSBvdXRzW2ldLmdldE91dHB1dCgpIGFzIFN0YW5kYXJkQW1vdW50T3V0cHV0XG4gICAgICAgIHRvdGFsID0gdG90YWwuYWRkKG91dHB1dC5nZXRBbW91bnQoKSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIGJ1cm5lZCB0b2tlbnMgYXMgYSBCTlxuICAgKi9cbiAgZ2V0QnVybiA9IChhc3NldElEOiBCdWZmZXIpOiBCTiA9PiB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0SW5wdXRUb3RhbChhc3NldElEKS5zdWIodGhpcy5nZXRPdXRwdXRUb3RhbChhc3NldElEKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBUcmFuc2FjdGlvblxuICAgKi9cbiAgYWJzdHJhY3QgZ2V0VHJhbnNhY3Rpb24oKTogU0JUeFxuXG4gIGFic3RyYWN0IGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0PzogbnVtYmVyKTogbnVtYmVyXG5cbiAgdG9CdWZmZXIoKTpCdWZmZXIge1xuICAgIGNvbnN0IGNvZGVjQnVmOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMilcbiAgICBjb2RlY0J1Zi53cml0ZVVJbnQxNkJFKHRoaXMudHJhbnNhY3Rpb24uZ2V0Q29kZWNJRCgpLCAwKVxuICAgIGNvbnN0IHR4dHlwZTogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgdHh0eXBlLndyaXRlVUludDMyQkUodGhpcy50cmFuc2FjdGlvbi5nZXRUeFR5cGUoKSwgMClcbiAgICBjb25zdCBiYXNlYnVmZiA9IHRoaXMudHJhbnNhY3Rpb24udG9CdWZmZXIoKVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFtjb2RlY0J1ZiwgdHh0eXBlLCBiYXNlYnVmZl0sIGNvZGVjQnVmLmxlbmd0aCArIHR4dHlwZS5sZW5ndGggKyBiYXNlYnVmZi5sZW5ndGgpXG4gIH1cblxuICAvKipcbiAgICogU2lnbnMgdGhpcyBbW1Vuc2lnbmVkVHhdXSBhbmQgcmV0dXJucyBzaWduZWQgW1tTdGFuZGFyZFR4XV1cbiAgICpcbiAgICogQHBhcmFtIGtjIEFuIFtbS2V5Q2hhaW5dXSB1c2VkIGluIHNpZ25pbmdcbiAgICpcbiAgICogQHJldHVybnMgQSBzaWduZWQgW1tTdGFuZGFyZFR4XV1cbiAgICovXG4gIGFic3RyYWN0IHNpZ24oa2M6IEtDQ2xhc3MpOiBTdGFuZGFyZFR4PFxuICAgIEtQQ2xhc3MsIFxuICAgIEtDQ2xhc3MsIFxuICAgIFN0YW5kYXJkVW5zaWduZWRUeDxLUENsYXNzLCBLQ0NsYXNzLCBTQlR4PlxuICAgID5cblxuICBjb25zdHJ1Y3Rvcih0cmFuc2FjdGlvbjogU0JUeCA9IHVuZGVmaW5lZCwgY29kZWNJRDogbnVtYmVyID0gMCkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmNvZGVjSUQgPSBjb2RlY0lEXG4gICAgdGhpcy50cmFuc2FjdGlvbiA9IHRyYW5zYWN0aW9uXG4gIH1cbn1cblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBzaWduZWQgdHJhbnNhY3Rpb24uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdGFuZGFyZFR4PFxuICAgIEtQQ2xhc3MgZXh0ZW5kcyBTdGFuZGFyZEtleVBhaXIsIFxuICAgIEtDQ2xhc3MgZXh0ZW5kcyBTdGFuZGFyZEtleUNoYWluPEtQQ2xhc3M+LCBcbiAgICBTVUJUeCBleHRlbmRzIFN0YW5kYXJkVW5zaWduZWRUeDxcbiAgICAgICAgS1BDbGFzcywgXG4gICAgICAgIEtDQ2xhc3MsIFxuICAgICAgICBTdGFuZGFyZEJhc2VUeDxLUENsYXNzLCBLQ0NsYXNzPj5cbiAgICA+IGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU3RhbmRhcmRUeFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIFwidW5zaWduZWRUeFwiOiB0aGlzLnVuc2lnbmVkVHguc2VyaWFsaXplKGVuY29kaW5nKSxcbiAgICAgIFwiY3JlZGVudGlhbHNcIjogdGhpcy5jcmVkZW50aWFscy5tYXAoKGMpID0+IGMuc2VyaWFsaXplKGVuY29kaW5nKSlcbiAgICB9XG4gIH1cblxuICBwcm90ZWN0ZWQgdW5zaWduZWRUeDogU1VCVHggPSB1bmRlZmluZWRcbiAgcHJvdGVjdGVkIGNyZWRlbnRpYWxzOiBDcmVkZW50aWFsW10gPSBbXVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBbW0NyZWRlbnRpYWxbXV1dXG4gICAqL1xuICBnZXRDcmVkZW50aWFscyA9ICgpOiBDcmVkZW50aWFsW10gPT4ge1xuICAgIHJldHVybiB0aGlzLmNyZWRlbnRpYWxzXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgW1tTdGFuZGFyZFVuc2lnbmVkVHhdXVxuICAgKi9cbiAgZ2V0VW5zaWduZWRUeCA9ICgpOiBTVUJUeCA9PiB7XG4gICAgcmV0dXJuIHRoaXMudW5zaWduZWRUeFxuICB9XG5cbiAgYWJzdHJhY3QgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ/OiBudW1iZXIpOiBudW1iZXJcblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW1N0YW5kYXJkVHhdXS5cbiAgICovXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgY29uc3QgdHggPSB0aGlzLnVuc2lnbmVkVHguZ2V0VHJhbnNhY3Rpb24oKVxuICAgIGNvbnN0IGNvZGVjSUQ6IG51bWJlciA9IHR4LmdldENvZGVjSUQoKVxuICAgIGNvbnN0IHR4YnVmZjogQnVmZmVyID0gdGhpcy51bnNpZ25lZFR4LnRvQnVmZmVyKClcbiAgICBsZXQgYnNpemU6IG51bWJlciA9IHR4YnVmZi5sZW5ndGhcbiAgICBjb25zdCBjcmVkbGVuOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBjcmVkbGVuLndyaXRlVUludDMyQkUodGhpcy5jcmVkZW50aWFscy5sZW5ndGgsIDApXG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbdHhidWZmLCBjcmVkbGVuXVxuICAgIGJzaXplICs9IGNyZWRsZW4ubGVuZ3RoXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMuY3JlZGVudGlhbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMuY3JlZGVudGlhbHNbaV0uc2V0Q29kZWNJRChjb2RlY0lEKVxuICAgICAgY29uc3QgY3JlZElEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICAgIGNyZWRJRC53cml0ZVVJbnQzMkJFKHRoaXMuY3JlZGVudGlhbHNbaV0uZ2V0Q3JlZGVudGlhbElEKCksIDApXG4gICAgICBiYXJyLnB1c2goY3JlZElEKVxuICAgICAgYnNpemUgKz0gY3JlZElELmxlbmd0aFxuICAgICAgY29uc3QgY3JlZGJ1ZmY6IEJ1ZmZlciA9IHRoaXMuY3JlZGVudGlhbHNbaV0udG9CdWZmZXIoKVxuICAgICAgYnNpemUgKz0gY3JlZGJ1ZmYubGVuZ3RoXG4gICAgICBiYXJyLnB1c2goY3JlZGJ1ZmYpXG4gICAgfVxuICAgIGNvbnN0IGJ1ZmY6IEJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpXG4gICAgcmV0dXJuIGJ1ZmZcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIGJhc2UtNTggc3RyaW5nIGNvbnRhaW5pbmcgYW4gW1tTdGFuZGFyZFR4XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgVHggaW4gYnl0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBzZXJpYWxpemVkIEEgYmFzZS01OCBzdHJpbmcgY29udGFpbmluZyBhIHJhdyBbW1N0YW5kYXJkVHhdXVxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tTdGFuZGFyZFR4XV1cbiAgICpcbiAgICogQHJlbWFya3NcbiAgICogdW5saWtlIG1vc3QgZnJvbVN0cmluZ3MsIGl0IGV4cGVjdHMgdGhlIHN0cmluZyB0byBiZSBzZXJpYWxpemVkIGluIGNiNTggZm9ybWF0XG4gICAqL1xuICBmcm9tU3RyaW5nKHNlcmlhbGl6ZWQ6IHN0cmluZyk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuZnJvbUJ1ZmZlcihiaW50b29scy5jYjU4RGVjb2RlKHNlcmlhbGl6ZWQpKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBjYjU4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW1N0YW5kYXJkVHhdXS5cbiAgICpcbiAgICogQHJlbWFya3NcbiAgICogdW5saWtlIG1vc3QgdG9TdHJpbmdzLCB0aGlzIHJldHVybnMgaW4gY2I1OCBzZXJpYWxpemF0aW9uIGZvcm1hdFxuICAgKi9cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuY2I1OEVuY29kZSh0aGlzLnRvQnVmZmVyKCkpXG4gIH1cblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgc2lnbmVkIHRyYW5zYWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gdW5zaWduZWRUeCBPcHRpb25hbCBbW1N0YW5kYXJkVW5zaWduZWRUeF1dXG4gICAqIEBwYXJhbSBzaWduYXR1cmVzIE9wdGlvbmFsIGFycmF5IG9mIFtbQ3JlZGVudGlhbF1dc1xuICAgKi9cbiAgY29uc3RydWN0b3IodW5zaWduZWRUeDogU1VCVHggPSB1bmRlZmluZWQsIGNyZWRlbnRpYWxzOiBDcmVkZW50aWFsW10gPSB1bmRlZmluZWQpIHtcbiAgICBzdXBlcigpXG4gICAgaWYgKHR5cGVvZiB1bnNpZ25lZFR4ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLnVuc2lnbmVkVHggPSB1bnNpZ25lZFR4XG4gICAgICBpZiAodHlwZW9mIGNyZWRlbnRpYWxzICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBjcmVkZW50aWFsc1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19