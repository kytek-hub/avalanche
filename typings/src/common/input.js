"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardAmountInput = exports.StandardTransferableInput = exports.StandardParseableInput = exports.Input = void 0;
/**
 * @packageDocumentation
 * @module Common-Inputs
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const credentials_1 = require("./credentials");
const serialization_1 = require("../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
class Input extends serialization_1.Serializable {
    constructor() {
        super(...arguments);
        this._typeName = "Input";
        this._typeID = undefined;
        this.sigCount = buffer_1.Buffer.alloc(4);
        this.sigIdxs = []; // idxs of signers from utxo
        /**
         * Returns the array of [[SigIdx]] for this [[Input]]
         */
        this.getSigIdxs = () => this.sigIdxs;
        /**
         * Creates and adds a [[SigIdx]] to the [[Input]].
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
        return Object.assign(Object.assign({}, fields), { "sigIdxs": this.sigIdxs.map((s) => s.serialize(encoding)) });
    }
    ;
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
     * Returns a base-58 representation of the [[Input]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
}
exports.Input = Input;
Input.comparator = () => (a, b) => {
    const aoutid = buffer_1.Buffer.alloc(4);
    aoutid.writeUInt32BE(a.getInputID(), 0);
    const abuff = a.toBuffer();
    const boutid = buffer_1.Buffer.alloc(4);
    boutid.writeUInt32BE(b.getInputID(), 0);
    const bbuff = b.toBuffer();
    const asort = buffer_1.Buffer.concat([aoutid, abuff], aoutid.length + abuff.length);
    const bsort = buffer_1.Buffer.concat([boutid, bbuff], boutid.length + bbuff.length);
    return buffer_1.Buffer.compare(asort, bsort);
};
class StandardParseableInput extends serialization_1.Serializable {
    /**
     * Class representing an [[StandardParseableInput]] for a transaction.
     *
     * @param input A number representing the InputID of the [[StandardParseableInput]]
     */
    constructor(input = undefined) {
        super();
        this._typeName = "StandardParseableInput";
        this._typeID = undefined;
        this.getInput = () => this.input;
        if (input instanceof Input) {
            this.input = input;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "input": this.input.serialize(encoding) });
    }
    ;
    toBuffer() {
        const inbuff = this.input.toBuffer();
        const inid = buffer_1.Buffer.alloc(4);
        inid.writeUInt32BE(this.input.getInputID(), 0);
        const barr = [inid, inbuff];
        return buffer_1.Buffer.concat(barr, inid.length + inbuff.length);
    }
}
exports.StandardParseableInput = StandardParseableInput;
/**
 * Returns a function used to sort an array of [[StandardParseableInput]]s
 */
StandardParseableInput.comparator = () => (a, b) => {
    const sorta = a.toBuffer();
    const sortb = b.toBuffer();
    return buffer_1.Buffer.compare(sorta, sortb);
};
class StandardTransferableInput extends StandardParseableInput {
    /**
     * Class representing an [[StandardTransferableInput]] for a transaction.
     *
     * @param txid A {@link https://github.com/feross/buffer|Buffer} containing the transaction ID of the referenced UTXO
     * @param outputidx A {@link https://github.com/feross/buffer|Buffer} containing the index of the output in the transaction consumed in the [[StandardTransferableInput]]
     * @param assetID A {@link https://github.com/feross/buffer|Buffer} representing the assetID of the [[Input]]
     * @param input An [[Input]] to be made transferable
     */
    constructor(txid = undefined, outputidx = undefined, assetID = undefined, input = undefined) {
        super();
        this._typeName = "StandardTransferableInput";
        this._typeID = undefined;
        this.txid = buffer_1.Buffer.alloc(32);
        this.outputidx = buffer_1.Buffer.alloc(4);
        this.assetID = buffer_1.Buffer.alloc(32);
        /**
         * Returns a {@link https://github.com/feross/buffer|Buffer} of the TxID.
         */
        this.getTxID = () => this.txid;
        /**
         * Returns a {@link https://github.com/feross/buffer|Buffer}  of the OutputIdx.
         */
        this.getOutputIdx = () => this.outputidx;
        /**
         * Returns a base-58 string representation of the UTXOID this [[StandardTransferableInput]] references.
         */
        this.getUTXOID = () => bintools.bufferToB58(buffer_1.Buffer.concat([this.txid, this.outputidx]));
        /**
         * Returns the input.
         */
        this.getInput = () => this.input;
        /**
         * Returns the assetID of the input.
         */
        this.getAssetID = () => this.assetID;
        if (typeof txid !== 'undefined' && typeof outputidx !== 'undefined' && typeof assetID !== 'undefined' && input instanceof Input) {
            this.input = input;
            this.txid = txid;
            this.outputidx = outputidx;
            this.assetID = assetID;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { txid: serialization.encoder(this.txid, encoding, "Buffer", "cb58"), outputidx: serialization.encoder(this.outputidx, encoding, "Buffer", "decimalString"), assetID: serialization.encoder(this.assetID, encoding, "Buffer", "cb58") });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.txid = serialization.decoder(fields["txid"], encoding, "cb58", "Buffer", 32);
        this.outputidx = serialization.decoder(fields["outputidx"], encoding, "decimalString", "Buffer", 4);
        this.assetID = serialization.decoder(fields["assetID"], encoding, "cb58", "Buffer", 32);
        //input deserialization must be implmented in child classes
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[StandardTransferableInput]].
     */
    toBuffer() {
        const parseableBuff = super.toBuffer();
        const bsize = this.txid.length + this.outputidx.length + this.assetID.length + parseableBuff.length;
        const barr = [this.txid, this.outputidx, this.assetID, parseableBuff];
        const buff = buffer_1.Buffer.concat(barr, bsize);
        return buff;
    }
    /**
     * Returns a base-58 representation of the [[StandardTransferableInput]].
     */
    toString() {
        /* istanbul ignore next */
        return bintools.bufferToB58(this.toBuffer());
    }
}
exports.StandardTransferableInput = StandardTransferableInput;
/**
 * An [[Input]] class which specifies a token amount .
 */
class StandardAmountInput extends Input {
    /**
     * An [[AmountInput]] class which issues a payment on an assetID.
     *
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} representing the amount in the input
     */
    constructor(amount = undefined) {
        super();
        this._typeName = "StandardAmountInput";
        this._typeID = undefined;
        this.amount = buffer_1.Buffer.alloc(8);
        this.amountValue = new bn_js_1.default(0);
        /**
         * Returns the amount as a {@link https://github.com/indutny/bn.js/|BN}.
         */
        this.getAmount = () => this.amountValue.clone();
        if (amount) {
            this.amountValue = amount.clone();
            this.amount = bintools.fromBNToBuffer(amount, 8);
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "amount": serialization.encoder(this.amount, encoding, "Buffer", "decimalString", 8) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.amount = serialization.decoder(fields["amount"], encoding, "decimalString", "Buffer", 8);
        this.amountValue = bintools.fromBufferToBN(this.amount);
    }
    /**
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[AmountInput]] and returns the size of the input.
     */
    fromBuffer(bytes, offset = 0) {
        this.amount = bintools.copyFrom(bytes, offset, offset + 8);
        this.amountValue = bintools.fromBufferToBN(this.amount);
        offset += 8;
        return super.fromBuffer(bytes, offset);
    }
    /**
     * Returns the buffer representing the [[AmountInput]] instance.
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        const bsize = this.amount.length + superbuff.length;
        const barr = [this.amount, superbuff];
        return buffer_1.Buffer.concat(barr, bsize);
    }
}
exports.StandardAmountInput = StandardAmountInput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2lucHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFpQztBQUNqQyxpRUFBeUM7QUFDekMsa0RBQXVCO0FBQ3ZCLCtDQUF1QztBQUN2QywwREFBeUY7QUFFekY7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWhFLE1BQXNCLEtBQU0sU0FBUSw0QkFBWTtJQUFoRDs7UUFDWSxjQUFTLEdBQUcsT0FBTyxDQUFDO1FBQ3BCLFlBQU8sR0FBRyxTQUFTLENBQUM7UUFtQnBCLGFBQVEsR0FBVSxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xDLFlBQU8sR0FBYSxFQUFFLENBQUMsQ0FBQyw0QkFBNEI7UUFrQjlEOztXQUVHO1FBQ0gsZUFBVSxHQUFHLEdBQWEsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFJMUM7Ozs7O1dBS0c7UUFDSCxvQkFBZSxHQUFHLENBQUMsVUFBaUIsRUFBRSxPQUFjLEVBQUUsRUFBRTtZQUN0RCxNQUFNLE1BQU0sR0FBVSxJQUFJLG9CQUFNLEVBQUUsQ0FBQztZQUNuQyxNQUFNLENBQUMsR0FBVSxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLENBQUMsQ0FBQyxhQUFhLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9CLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMs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V0FBVyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3hELE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDWixPQUFPLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDTixNQUFNLFNBQVMsR0FBVSxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDMUMsTUFBTSxLQUFLLEdBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQztRQUMzRCxNQUFNLElBQUksR0FBYSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDaEQsT0FBTyxlQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUNwQyxDQUFDO0NBY0Y7QUF6REQsa0RBeURDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQ29tbW9uLUlucHV0c1xuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJztcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi91dGlscy9iaW50b29scyc7XG5pbXBvcnQgQk4gZnJvbSAnYm4uanMnO1xuaW1wb3J0IHsgU2lnSWR4IH0gZnJvbSAnLi9jcmVkZW50aWFscyc7XG5pbXBvcnQgeyBTZXJpYWxpemFibGUsIFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gJy4uL3V0aWxzL3NlcmlhbGl6YXRpb24nO1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSW5wdXQgZXh0ZW5kcyBTZXJpYWxpemFibGUge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJJbnB1dFwiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIFwic2lnSWR4c1wiOiB0aGlzLnNpZ0lkeHMubWFwKChzKSA9PiBzLnNlcmlhbGl6ZShlbmNvZGluZykpXG4gICAgfVxuICB9O1xuICBkZXNlcmlhbGl6ZShmaWVsZHM6b2JqZWN0LCBlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgdGhpcy5zaWdJZHhzID0gZmllbGRzW1wic2lnSWR4c1wiXS5tYXAoKHM6b2JqZWN0KSA9PiB7XG4gICAgICBsZXQgc2lkeDpTaWdJZHggPSBuZXcgU2lnSWR4KCk7XG4gICAgICBzaWR4LmRlc2VyaWFsaXplKHMsIGVuY29kaW5nKTtcbiAgICAgIHJldHVybiBzaWR4O1xuICAgIH0pO1xuICAgIHRoaXMuc2lnQ291bnQud3JpdGVVSW50MzJCRSh0aGlzLnNpZ0lkeHMubGVuZ3RoLCAwKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBzaWdDb3VudDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gIHByb3RlY3RlZCBzaWdJZHhzOiBTaWdJZHhbXSA9IFtdOyAvLyBpZHhzIG9mIHNpZ25lcnMgZnJvbSB1dHhvXG5cbiAgc3RhdGljIGNvbXBhcmF0b3IgPSAoKTooYTpJbnB1dCwgYjpJbnB1dCkgPT4gKDF8LTF8MCkgPT4gKGE6SW5wdXQsIGI6SW5wdXQpOigxfC0xfDApID0+IHtcbiAgICBjb25zdCBhb3V0aWQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgIGFvdXRpZC53cml0ZVVJbnQzMkJFKGEuZ2V0SW5wdXRJRCgpLCAwKTtcbiAgICBjb25zdCBhYnVmZjpCdWZmZXIgPSBhLnRvQnVmZmVyKCk7XG5cbiAgICBjb25zdCBib3V0aWQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgIGJvdXRpZC53cml0ZVVJbnQzMkJFKGIuZ2V0SW5wdXRJRCgpLCAwKTtcbiAgICBjb25zdCBiYnVmZjpCdWZmZXIgPSBiLnRvQnVmZmVyKCk7XG5cbiAgICBjb25zdCBhc29ydDpCdWZmZXIgPSBCdWZmZXIuY29uY2F0KFthb3V0aWQsIGFidWZmXSwgYW91dGlkLmxlbmd0aCArIGFidWZmLmxlbmd0aCk7XG4gICAgY29uc3QgYnNvcnQ6QnVmZmVyID0gQnVmZmVyLmNvbmNhdChbYm91dGlkLCBiYnVmZl0sIGJvdXRpZC5sZW5ndGggKyBiYnVmZi5sZW5ndGgpO1xuICAgIHJldHVybiBCdWZmZXIuY29tcGFyZShhc29ydCwgYnNvcnQpIGFzICgxfC0xfDApO1xuICB9O1xuXG4gIGFic3RyYWN0IGdldElucHV0SUQoKTpudW1iZXI7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFycmF5IG9mIFtbU2lnSWR4XV0gZm9yIHRoaXMgW1tJbnB1dF1dXG4gICAqL1xuICBnZXRTaWdJZHhzID0gKCk6IFNpZ0lkeFtdID0+IHRoaXMuc2lnSWR4cztcblxuICBhYnN0cmFjdCBnZXRDcmVkZW50aWFsSUQoKTpudW1iZXI7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIGFkZHMgYSBbW1NpZ0lkeF1dIHRvIHRoZSBbW0lucHV0XV0uXG4gICAqXG4gICAqIEBwYXJhbSBhZGRyZXNzSWR4IFRoZSBpbmRleCBvZiB0aGUgYWRkcmVzcyB0byByZWZlcmVuY2UgaW4gdGhlIHNpZ25hdHVyZXNcbiAgICogQHBhcmFtIGFkZHJlc3MgVGhlIGFkZHJlc3Mgb2YgdGhlIHNvdXJjZSBvZiB0aGUgc2lnbmF0dXJlXG4gICAqL1xuICBhZGRTaWduYXR1cmVJZHggPSAoYWRkcmVzc0lkeDpudW1iZXIsIGFkZHJlc3M6QnVmZmVyKSA9PiB7XG4gICAgY29uc3Qgc2lnaWR4OlNpZ0lkeCA9IG5ldyBTaWdJZHgoKTtcbiAgICBjb25zdCBiOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICBiLndyaXRlVUludDMyQkUoYWRkcmVzc0lkeCwgMCk7XG4gICAgc2lnaWR4LmZyb21CdWZmZXIoYik7XG4gICAgc2lnaWR4LnNldFNvdXJjZShhZGRyZXNzKTtcbiAgICB0aGlzLnNpZ0lkeHMucHVzaChzaWdpZHgpO1xuICAgIHRoaXMuc2lnQ291bnQud3JpdGVVSW50MzJCRSh0aGlzLnNpZ0lkeHMubGVuZ3RoLCAwKTtcbiAgfTtcblxuICBmcm9tQnVmZmVyKGJ5dGVzOkJ1ZmZlciwgb2Zmc2V0Om51bWJlciA9IDApOm51bWJlciB7XG4gICAgdGhpcy5zaWdDb3VudCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpO1xuICAgIG9mZnNldCArPSA0O1xuICAgIGNvbnN0IHNpZ0NvdW50Om51bWJlciA9IHRoaXMuc2lnQ291bnQucmVhZFVJbnQzMkJFKDApO1xuICAgIHRoaXMuc2lnSWR4cyA9IFtdO1xuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBzaWdDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCBzaWdpZHggPSBuZXcgU2lnSWR4KCk7XG4gICAgICBjb25zdCBzaWdidWZmOkJ1ZmZlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpO1xuICAgICAgc2lnaWR4LmZyb21CdWZmZXIoc2lnYnVmZik7XG4gICAgICBvZmZzZXQgKz0gNDtcbiAgICAgIHRoaXMuc2lnSWR4cy5wdXNoKHNpZ2lkeCk7XG4gICAgfVxuICAgIHJldHVybiBvZmZzZXQ7XG4gIH1cblxuICB0b0J1ZmZlcigpOkJ1ZmZlciB7XG4gICAgdGhpcy5zaWdDb3VudC53cml0ZVVJbnQzMkJFKHRoaXMuc2lnSWR4cy5sZW5ndGgsIDApO1xuICAgIGxldCBic2l6ZTpudW1iZXIgPSB0aGlzLnNpZ0NvdW50Lmxlbmd0aDtcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFt0aGlzLnNpZ0NvdW50XTtcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5zaWdJZHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBiOkJ1ZmZlciA9IHRoaXMuc2lnSWR4c1tpXS50b0J1ZmZlcigpO1xuICAgICAgYmFyci5wdXNoKGIpO1xuICAgICAgYnNpemUgKz0gYi5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tJbnB1dF1dLlxuICAgKi9cbiAgdG9TdHJpbmcoKTpzdHJpbmcge1xuICAgIHJldHVybiBiaW50b29scy5idWZmZXJUb0I1OCh0aGlzLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgYWJzdHJhY3QgY2xvbmUoKTp0aGlzO1xuXG4gIGFic3RyYWN0IGNyZWF0ZSguLi5hcmdzOmFueVtdKTp0aGlzO1xuXG4gIGFic3RyYWN0IHNlbGVjdChpZDpudW1iZXIsIC4uLmFyZ3M6YW55W10pOklucHV0O1xuICBcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0YW5kYXJkUGFyc2VhYmxlSW5wdXQgZXh0ZW5kcyBTZXJpYWxpemFibGUge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTdGFuZGFyZFBhcnNlYWJsZUlucHV0XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkO1xuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTpvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6b2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgXCJpbnB1dFwiOiB0aGlzLmlucHV0LnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICB9XG4gIH07XG5cbiAgcHJvdGVjdGVkIGlucHV0OklucHV0O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgZnVuY3Rpb24gdXNlZCB0byBzb3J0IGFuIGFycmF5IG9mIFtbU3RhbmRhcmRQYXJzZWFibGVJbnB1dF1dc1xuICAgKi9cbiAgc3RhdGljIGNvbXBhcmF0b3IgPSAoKTooYTpTdGFuZGFyZFBhcnNlYWJsZUlucHV0LCBiOlN0YW5kYXJkUGFyc2VhYmxlSW5wdXQpID0+ICgxfC0xfDApID0+IChhOlN0YW5kYXJkUGFyc2VhYmxlSW5wdXQsIGI6U3RhbmRhcmRQYXJzZWFibGVJbnB1dCk6KDF8LTF8MCkgPT4ge1xuICAgIGNvbnN0IHNvcnRhID0gYS50b0J1ZmZlcigpO1xuICAgIGNvbnN0IHNvcnRiID0gYi50b0J1ZmZlcigpO1xuICAgIHJldHVybiBCdWZmZXIuY29tcGFyZShzb3J0YSwgc29ydGIpIGFzICgxfC0xfDApO1xuICB9O1xuXG4gIGdldElucHV0ID0gKCk6SW5wdXQgPT4gdGhpcy5pbnB1dDtcblxuICAvLyBtdXN0IGJlIGltcGxlbWVudGVkIHRvIHNlbGVjdCBpbnB1dCB0eXBlcyBmb3IgdGhlIFZNIGluIHF1ZXN0aW9uXG4gIGFic3RyYWN0IGZyb21CdWZmZXIoYnl0ZXM6QnVmZmVyLCBvZmZzZXQ/Om51bWJlcik6bnVtYmVyOyBcblxuICB0b0J1ZmZlcigpOkJ1ZmZlciB7XG4gICAgY29uc3QgaW5idWZmOkJ1ZmZlciA9IHRoaXMuaW5wdXQudG9CdWZmZXIoKTtcbiAgICBjb25zdCBpbmlkOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICBpbmlkLndyaXRlVUludDMyQkUodGhpcy5pbnB1dC5nZXRJbnB1dElEKCksIDApO1xuICAgIGNvbnN0IGJhcnI6IEJ1ZmZlcltdID0gW2luaWQsIGluYnVmZl07XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgaW5pZC5sZW5ndGggKyBpbmJ1ZmYubGVuZ3RoKTtcbiAgfVxuICBcbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiBbW1N0YW5kYXJkUGFyc2VhYmxlSW5wdXRdXSBmb3IgYSB0cmFuc2FjdGlvbi5cbiAgICogXG4gICAqIEBwYXJhbSBpbnB1dCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIElucHV0SUQgb2YgdGhlIFtbU3RhbmRhcmRQYXJzZWFibGVJbnB1dF1dXG4gICAqL1xuICBjb25zdHJ1Y3RvcihpbnB1dDpJbnB1dCA9IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKCk7XG4gICAgaWYgKGlucHV0IGluc3RhbmNlb2YgSW5wdXQpIHtcbiAgICAgIHRoaXMuaW5wdXQgPSBpbnB1dDtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXQgZXh0ZW5kcyBTdGFuZGFyZFBhcnNlYWJsZUlucHV0e1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkO1xuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTpvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6b2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgdHhpZDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMudHhpZCwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiY2I1OFwiKSxcbiAgICAgIG91dHB1dGlkeDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMub3V0cHV0aWR4LCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJkZWNpbWFsU3RyaW5nXCIpLFxuICAgICAgYXNzZXRJRDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuYXNzZXRJRCwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiY2I1OFwiKSxcbiAgICB9XG4gIH07XG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLnR4aWQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1widHhpZFwiXSwgZW5jb2RpbmcsIFwiY2I1OFwiLCBcIkJ1ZmZlclwiLCAzMilcbiAgICB0aGlzLm91dHB1dGlkeCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJvdXRwdXRpZHhcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJCdWZmZXJcIiwgNClcbiAgICB0aGlzLmFzc2V0SUQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wiYXNzZXRJRFwiXSwgZW5jb2RpbmcsIFwiY2I1OFwiLCBcIkJ1ZmZlclwiLCAzMik7XG4gICAgLy9pbnB1dCBkZXNlcmlhbGl6YXRpb24gbXVzdCBiZSBpbXBsbWVudGVkIGluIGNoaWxkIGNsYXNzZXNcbiAgfVxuXG4gIHByb3RlY3RlZCB0eGlkOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMik7XG4gIHByb3RlY3RlZCBvdXRwdXRpZHg6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICBwcm90ZWN0ZWQgYXNzZXRJRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyKTtcblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9mIHRoZSBUeElELlxuICAgKi9cbiAgZ2V0VHhJRCA9ICgpXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIDpCdWZmZXIgPT4gdGhpcy50eGlkO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gIG9mIHRoZSBPdXRwdXRJZHguXG4gICAqL1xuICBnZXRPdXRwdXRJZHggPSAoKVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICA6QnVmZmVyID0+IHRoaXMub3V0cHV0aWR4O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIFVUWE9JRCB0aGlzIFtbU3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dF1dIHJlZmVyZW5jZXMuXG4gICAqL1xuICBnZXRVVFhPSUQgPSAoKTpzdHJpbmcgPT4gYmludG9vbHMuYnVmZmVyVG9CNTgoQnVmZmVyLmNvbmNhdChbdGhpcy50eGlkLCB0aGlzLm91dHB1dGlkeF0pKTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaW5wdXQuXG4gICAqL1xuICBnZXRJbnB1dCA9ICgpOklucHV0ID0+IHRoaXMuaW5wdXQ7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFzc2V0SUQgb2YgdGhlIGlucHV0LlxuICAgKi9cbiAgZ2V0QXNzZXRJRCA9ICgpOiBCdWZmZXIgPT4gdGhpcy5hc3NldElEO1xuXG4gIGFic3RyYWN0IGZyb21CdWZmZXIoYnl0ZXM6QnVmZmVyLCBvZmZzZXQ/Om51bWJlcik6bnVtYmVyOyBcblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW1N0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXRdXS5cbiAgICovXG4gIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICBjb25zdCBwYXJzZWFibGVCdWZmOkJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKCk7XG4gICAgY29uc3QgYnNpemU6IG51bWJlciA9IHRoaXMudHhpZC5sZW5ndGggKyB0aGlzLm91dHB1dGlkeC5sZW5ndGggKyB0aGlzLmFzc2V0SUQubGVuZ3RoICsgcGFyc2VhYmxlQnVmZi5sZW5ndGhcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFt0aGlzLnR4aWQsIHRoaXMub3V0cHV0aWR4LCB0aGlzLmFzc2V0SUQsIHBhcnNlYWJsZUJ1ZmZdO1xuICAgIGNvbnN0IGJ1ZmY6IEJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpO1xuICAgIHJldHVybiBidWZmO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBiYXNlLTU4IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW1N0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXRdXS5cbiAgICovXG4gIHRvU3RyaW5nKCk6c3RyaW5nIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHJldHVybiBiaW50b29scy5idWZmZXJUb0I1OCh0aGlzLnRvQnVmZmVyKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiBbW1N0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXRdXSBmb3IgYSB0cmFuc2FjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHR4aWQgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIHRoZSB0cmFuc2FjdGlvbiBJRCBvZiB0aGUgcmVmZXJlbmNlZCBVVFhPXG4gICAqIEBwYXJhbSBvdXRwdXRpZHggQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIHRoZSBpbmRleCBvZiB0aGUgb3V0cHV0IGluIHRoZSB0cmFuc2FjdGlvbiBjb25zdW1lZCBpbiB0aGUgW1tTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0XV1cbiAgICogQHBhcmFtIGFzc2V0SUQgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRpbmcgdGhlIGFzc2V0SUQgb2YgdGhlIFtbSW5wdXRdXVxuICAgKiBAcGFyYW0gaW5wdXQgQW4gW1tJbnB1dF1dIHRvIGJlIG1hZGUgdHJhbnNmZXJhYmxlXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih0eGlkOkJ1ZmZlciA9IHVuZGVmaW5lZCwgb3V0cHV0aWR4OkJ1ZmZlciA9IHVuZGVmaW5lZCwgYXNzZXRJRDpCdWZmZXIgPSB1bmRlZmluZWQsIGlucHV0OklucHV0ID0gdW5kZWZpbmVkKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAodHlwZW9mIHR4aWQgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBvdXRwdXRpZHggIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBhc3NldElEICE9PSAndW5kZWZpbmVkJyAmJiBpbnB1dCBpbnN0YW5jZW9mIElucHV0KSB7XG4gICAgICB0aGlzLmlucHV0ID0gaW5wdXQ7XG4gICAgICB0aGlzLnR4aWQgPSB0eGlkO1xuICAgICAgdGhpcy5vdXRwdXRpZHggPSBvdXRwdXRpZHg7XG4gICAgICB0aGlzLmFzc2V0SUQgPSBhc3NldElEO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFuIFtbSW5wdXRdXSBjbGFzcyB3aGljaCBzcGVjaWZpZXMgYSB0b2tlbiBhbW91bnQgLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RhbmRhcmRBbW91bnRJbnB1dCBleHRlbmRzIElucHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU3RhbmRhcmRBbW91bnRJbnB1dFwiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIFwiYW1vdW50XCI6IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLmFtb3VudCwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiZGVjaW1hbFN0cmluZ1wiLCA4KVxuICAgIH1cbiAgfTtcbiAgZGVzZXJpYWxpemUoZmllbGRzOm9iamVjdCwgZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpO1xuICAgIHRoaXMuYW1vdW50ID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKGZpZWxkc1tcImFtb3VudFwiXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJ1ZmZlclwiLCA4KTtcbiAgICB0aGlzLmFtb3VudFZhbHVlID0gYmludG9vbHMuZnJvbUJ1ZmZlclRvQk4odGhpcy5hbW91bnQpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGFtb3VudDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoOCk7XG4gIHByb3RlY3RlZCBhbW91bnRWYWx1ZTpCTiA9IG5ldyBCTigwKTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYW1vdW50IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0uXG4gICAqL1xuICBnZXRBbW91bnQgPSAoKTpCTiA9PiB0aGlzLmFtb3VudFZhbHVlLmNsb25lKCk7XG5cbiAgLyoqXG4gICAqIFBvcHVhdGVzIHRoZSBpbnN0YW5jZSBmcm9tIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBbW0Ftb3VudElucHV0XV0gYW5kIHJldHVybnMgdGhlIHNpemUgb2YgdGhlIGlucHV0LlxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczpCdWZmZXIsIG9mZnNldDpudW1iZXIgPSAwKTpudW1iZXIge1xuICAgIHRoaXMuYW1vdW50ID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOCk7XG4gICAgdGhpcy5hbW91bnRWYWx1ZSA9IGJpbnRvb2xzLmZyb21CdWZmZXJUb0JOKHRoaXMuYW1vdW50KTtcbiAgICBvZmZzZXQgKz0gODtcbiAgICByZXR1cm4gc3VwZXIuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBidWZmZXIgcmVwcmVzZW50aW5nIHRoZSBbW0Ftb3VudElucHV0XV0gaW5zdGFuY2UuXG4gICAqL1xuICB0b0J1ZmZlcigpOkJ1ZmZlciB7XG4gICAgY29uc3Qgc3VwZXJidWZmOkJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKCk7XG4gICAgY29uc3QgYnNpemU6bnVtYmVyID0gdGhpcy5hbW91bnQubGVuZ3RoICsgc3VwZXJidWZmLmxlbmd0aDtcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFt0aGlzLmFtb3VudCwgc3VwZXJidWZmXTtcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSk7XG4gIH1cblxuICAvKipcbiAgICogQW4gW1tBbW91bnRJbnB1dF1dIGNsYXNzIHdoaWNoIGlzc3VlcyBhIHBheW1lbnQgb24gYW4gYXNzZXRJRC5cbiAgICpcbiAgICogQHBhcmFtIGFtb3VudCBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHJlcHJlc2VudGluZyB0aGUgYW1vdW50IGluIHRoZSBpbnB1dFxuICAgKi9cbiAgY29uc3RydWN0b3IoYW1vdW50OkJOID0gdW5kZWZpbmVkKSB7XG4gICAgc3VwZXIoKTtcbiAgICBpZiAoYW1vdW50KSB7XG4gICAgICB0aGlzLmFtb3VudFZhbHVlID0gYW1vdW50LmNsb25lKCk7XG4gICAgICB0aGlzLmFtb3VudCA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKGFtb3VudCwgOCk7XG4gICAgfVxuICB9XG59Il19