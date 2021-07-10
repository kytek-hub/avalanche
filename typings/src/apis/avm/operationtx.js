"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationTx = void 0;
/**
 * @packageDocumentation
 * @module API-AVM-OperationTx
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const ops_1 = require("./ops");
const credentials_1 = require("./credentials");
const credentials_2 = require("../../common/credentials");
const basetx_1 = require("./basetx");
const constants_2 = require("../../utils/constants");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Class representing an unsigned Operation transaction.
 */
class OperationTx extends basetx_1.BaseTx {
    /**
     * Class representing an unsigned Operation transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param ops Array of [[Operation]]s used in the transaction
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, ops = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "OperationTx";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.OPERATIONTX : constants_1.AVMConstants.OPERATIONTX_CODECONE;
        this.numOps = buffer_1.Buffer.alloc(4);
        this.ops = [];
        /**
         * Returns the id of the [[OperationTx]]
         */
        this.getTxType = () => {
            return this._typeID;
        };
        if (typeof ops !== "undefined" && Array.isArray(ops)) {
            for (let i = 0; i < ops.length; i++) {
                if (!(ops[i] instanceof ops_1.TransferableOperation)) {
                    throw new errors_1.OperationError(`Error - OperationTx.constructor: invalid op in array parameter ${ops}`);
                }
            }
            this.ops = ops;
        }
    }
    serialize(encoding = "hex") {
        const fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { ops: this.ops.map((o) => o.serialize(encoding)) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.ops = fields["ops"].map((o) => {
            let op = new ops_1.TransferableOperation();
            op.deserialize(o, encoding);
            return op;
        });
        this.numOps = buffer_1.Buffer.alloc(4);
        this.numOps.writeUInt32BE(this.ops.length, 0);
    }
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - OperationTx.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.OPERATIONTX : constants_1.AVMConstants.OPERATIONTX_CODECONE;
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[OperationTx]], parses it, populates the class, and returns the length of the [[OperationTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[OperationTx]]
     *
     * @returns The length of the raw [[OperationTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.numOps = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const numOps = this.numOps.readUInt32BE(0);
        for (let i = 0; i < numOps; i++) {
            const op = new ops_1.TransferableOperation();
            offset = op.fromBuffer(bytes, offset);
            this.ops.push(op);
        }
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[OperationTx]].
     */
    toBuffer() {
        this.numOps.writeUInt32BE(this.ops.length, 0);
        let barr = [super.toBuffer(), this.numOps];
        this.ops = this.ops.sort(ops_1.TransferableOperation.comparator());
        for (let i = 0; i < this.ops.length; i++) {
            barr.push(this.ops[i].toBuffer());
        }
        return buffer_1.Buffer.concat(barr);
    }
    /**
     * Returns an array of [[TransferableOperation]]s in this transaction.
     */
    getOperations() {
        return this.ops;
    }
    /**
     * Takes the bytes of an [[UnsignedTx]] and returns an array of [[Credential]]s
     *
     * @param msg A Buffer for the [[UnsignedTx]]
     * @param kc An [[KeyChain]] used in signing
     *
     * @returns An array of [[Credential]]s
     */
    sign(msg, kc) {
        const sigs = super.sign(msg, kc);
        for (let i = 0; i < this.ops.length; i++) {
            const cred = credentials_1.SelectCredentialClass(this.ops[i].getOperation().getCredentialID());
            const sigidxs = this.ops[i].getOperation().getSigIdxs();
            for (let j = 0; j < sigidxs.length; j++) {
                const keypair = kc.getKey(sigidxs[j].getSource());
                const signval = keypair.sign(msg);
                const sig = new credentials_2.Signature();
                sig.fromBuffer(signval);
                cred.addSignature(sig);
            }
            sigs.push(cred);
        }
        return sigs;
    }
    clone() {
        let newbase = new OperationTx();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new OperationTx(...args);
    }
}
exports.OperationTx = OperationTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BlcmF0aW9udHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9hdm0vb3BlcmF0aW9udHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQywyQ0FBMEM7QUFHMUMsK0JBQTZDO0FBQzdDLCtDQUFxRDtBQUVyRCwwREFBd0U7QUFDeEUscUNBQWlDO0FBQ2pDLHFEQUF3RDtBQUV4RCwrQ0FBaUU7QUFFakU7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWpEOztHQUVHO0FBQ0gsTUFBYSxXQUFZLFNBQVEsZUFBTTtJQXVIckM7Ozs7Ozs7OztPQVNHO0lBQ0gsWUFDRSxZQUFvQiw0QkFBZ0IsRUFBRSxlQUF1QixlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDakYsT0FBNkIsU0FBUyxFQUFFLE1BQTJCLFNBQVMsRUFDNUUsT0FBZSxTQUFTLEVBQUUsTUFBK0IsU0FBUztRQUVsRSxLQUFLLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFBO1FBckl2QyxjQUFTLEdBQUcsYUFBYSxDQUFBO1FBQ3pCLGFBQVEsR0FBRyx3QkFBWSxDQUFDLFdBQVcsQ0FBQTtRQUNuQyxZQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLG9CQUFvQixDQUFBO1FBb0I1RixXQUFNLEdBQVcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNoQyxRQUFHLEdBQTRCLEVBQUUsQ0FBQTtRQVczQzs7V0FFRztRQUNILGNBQVMsR0FBRyxHQUFXLEVBQUU7WUFDdkIsT0FBTyxJQUFJLENBQUMs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QUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUE7WUFDNUYsTUFBTSxPQUFPLEdBQWEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtZQUNqRSxLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDL0MsTUFBTSxPQUFPLEdBQVksRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQTtnQkFDMUQsTUFBTSxPQUFPLEdBQVcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtnQkFDekMsTUFBTSxHQUFHLEdBQWMsSUFBSSx1QkFBUyxFQUFFLENBQUE7Z0JBQ3RDLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUE7Z0JBQ3ZCLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUE7YUFDdkI7WUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQ2hCO1FBQ0QsT0FBTyxJQUFJLENBQUE7SUFDYixDQUFDO0lBRUQsS0FBSztRQUNILElBQUksT0FBTyxHQUFnQixJQUFJLFdBQVcsRUFBRSxDQUFBO1FBQzVDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7UUFDbkMsT0FBTyxPQUFlLENBQUE7SUFDeEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHLElBQVc7UUFDbkIsT0FBTyxJQUFJLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBUyxDQUFBO0lBQ3pDLENBQUM7Q0EyQkY7QUFoSkQsa0NBZ0pDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLUFWTS1PcGVyYXRpb25UeFxuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IEFWTUNvbnN0YW50cyB9IGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tIFwiLi9vdXRwdXRzXCJcbmltcG9ydCB7IFRyYW5zZmVyYWJsZUlucHV0IH0gZnJvbSBcIi4vaW5wdXRzXCJcbmltcG9ydCB7IFRyYW5zZmVyYWJsZU9wZXJhdGlvbiB9IGZyb20gXCIuL29wc1wiXG5pbXBvcnQgeyBTZWxlY3RDcmVkZW50aWFsQ2xhc3MgfSBmcm9tIFwiLi9jcmVkZW50aWFsc1wiXG5pbXBvcnQgeyBLZXlDaGFpbiwgS2V5UGFpciB9IGZyb20gXCIuL2tleWNoYWluXCJcbmltcG9ydCB7IFNpZ25hdHVyZSwgU2lnSWR4LCBDcmVkZW50aWFsIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9jcmVkZW50aWFsc1wiXG5pbXBvcnQgeyBCYXNlVHggfSBmcm9tIFwiLi9iYXNldHhcIlxuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCB9IGZyb20gXCIuLi8uLi91dGlscy9jb25zdGFudHNcIlxuaW1wb3J0IHsgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuaW1wb3J0IHsgQ29kZWNJZEVycm9yLCBPcGVyYXRpb25FcnJvciB9IGZyb20gXCIuLi8uLi91dGlscy9lcnJvcnNcIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBPcGVyYXRpb24gdHJhbnNhY3Rpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBPcGVyYXRpb25UeCBleHRlbmRzIEJhc2VUeCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIk9wZXJhdGlvblR4XCJcbiAgcHJvdGVjdGVkIF9jb2RlY0lEID0gQVZNQ29uc3RhbnRzLkxBVEVTVENPREVDXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdGhpcy5fY29kZWNJRCA9PT0gMCA/IEFWTUNvbnN0YW50cy5PUEVSQVRJT05UWCA6IEFWTUNvbnN0YW50cy5PUEVSQVRJT05UWF9DT0RFQ09ORVxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgY29uc3QgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIG9wczogdGhpcy5vcHMubWFwKChvKSA9PiBvLnNlcmlhbGl6ZShlbmNvZGluZykpXG4gICAgfVxuICB9XG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5vcHMgPSBmaWVsZHNbXCJvcHNcIl0ubWFwKChvOm9iamVjdCkgPT4ge1xuICAgICAgbGV0IG9wOiBUcmFuc2ZlcmFibGVPcGVyYXRpb24gPSBuZXcgVHJhbnNmZXJhYmxlT3BlcmF0aW9uKClcbiAgICAgIG9wLmRlc2VyaWFsaXplKG8sIGVuY29kaW5nKVxuICAgICAgcmV0dXJuIG9wXG4gICAgfSlcbiAgICB0aGlzLm51bU9wcyA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIHRoaXMubnVtT3BzLndyaXRlVUludDMyQkUodGhpcy5vcHMubGVuZ3RoLCAwKVxuICB9XG5cbiAgcHJvdGVjdGVkIG51bU9wczogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gIHByb3RlY3RlZCBvcHM6IFRyYW5zZmVyYWJsZU9wZXJhdGlvbltdID0gW11cblxuICBzZXRDb2RlY0lEKGNvZGVjSUQ6IG51bWJlcik6IHZvaWQge1xuICAgIGlmKGNvZGVjSUQgIT09IDAgJiYgY29kZWNJRCAhPT0gMSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBDb2RlY0lkRXJyb3IoXCJFcnJvciAtIE9wZXJhdGlvblR4LnNldENvZGVjSUQ6IGludmFsaWQgY29kZWNJRC4gVmFsaWQgY29kZWNJRHMgYXJlIDAgYW5kIDEuXCIpXG4gICAgfVxuICAgIHRoaXMuX2NvZGVjSUQgPSBjb2RlY0lEXG4gICAgdGhpcy5fdHlwZUlEID0gdGhpcy5fY29kZWNJRCA9PT0gMCA/IEFWTUNvbnN0YW50cy5PUEVSQVRJT05UWCA6IEFWTUNvbnN0YW50cy5PUEVSQVRJT05UWF9DT0RFQ09ORVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlkIG9mIHRoZSBbW09wZXJhdGlvblR4XV1cbiAgICovXG4gIGdldFR4VHlwZSA9ICgpOiBudW1iZXIgPT4ge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYW4gW1tPcGVyYXRpb25UeF1dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIFtbT3BlcmF0aW9uVHhdXSBpbiBieXRlcy5cbiAgICpcbiAgICogQHBhcmFtIGJ5dGVzIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhIHJhdyBbW09wZXJhdGlvblR4XV1cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbT3BlcmF0aW9uVHhdXVxuICAgKlxuICAgKiBAcmVtYXJrcyBhc3N1bWUgbm90LWNoZWNrc3VtbWVkXG4gICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgb2Zmc2V0ID0gc3VwZXIuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIHRoaXMubnVtT3BzID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICBvZmZzZXQgKz0gNFxuICAgIGNvbnN0IG51bU9wczogbnVtYmVyID0gdGhpcy5udW1PcHMucmVhZFVJbnQzMkJFKDApXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IG51bU9wczsgaSsrKSB7XG4gICAgICBjb25zdCBvcDogVHJhbnNmZXJhYmxlT3BlcmF0aW9uID0gbmV3IFRyYW5zZmVyYWJsZU9wZXJhdGlvbigpXG4gICAgICBvZmZzZXQgPSBvcC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgICB0aGlzLm9wcy5wdXNoKG9wKVxuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW09wZXJhdGlvblR4XV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIHRoaXMubnVtT3BzLndyaXRlVUludDMyQkUodGhpcy5vcHMubGVuZ3RoLCAwKVxuICAgIGxldCBiYXJyOiBCdWZmZXJbXSA9IFtzdXBlci50b0J1ZmZlcigpLCB0aGlzLm51bU9wc11cbiAgICB0aGlzLm9wcyA9IHRoaXMub3BzLnNvcnQoVHJhbnNmZXJhYmxlT3BlcmF0aW9uLmNvbXBhcmF0b3IoKSlcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5vcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGJhcnIucHVzaCh0aGlzLm9wc1tpXS50b0J1ZmZlcigpKVxuICAgICAgfVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBbW1RyYW5zZmVyYWJsZU9wZXJhdGlvbl1dcyBpbiB0aGlzIHRyYW5zYWN0aW9uLlxuICAgKi9cbiAgZ2V0T3BlcmF0aW9ucygpOiBUcmFuc2ZlcmFibGVPcGVyYXRpb25bXSB7XG4gICAgcmV0dXJuIHRoaXMub3BzXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgdGhlIGJ5dGVzIG9mIGFuIFtbVW5zaWduZWRUeF1dIGFuZCByZXR1cm5zIGFuIGFycmF5IG9mIFtbQ3JlZGVudGlhbF1dc1xuICAgKlxuICAgKiBAcGFyYW0gbXNnIEEgQnVmZmVyIGZvciB0aGUgW1tVbnNpZ25lZFR4XV1cbiAgICogQHBhcmFtIGtjIEFuIFtbS2V5Q2hhaW5dXSB1c2VkIGluIHNpZ25pbmdcbiAgICpcbiAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAqL1xuICBzaWduKG1zZzogQnVmZmVyLCBrYzogS2V5Q2hhaW4pOiBDcmVkZW50aWFsW10ge1xuICAgIGNvbnN0IHNpZ3M6IENyZWRlbnRpYWxbXSA9IHN1cGVyLnNpZ24obXNnLCBrYylcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5vcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNyZWQ6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3ModGhpcy5vcHNbaV0uZ2V0T3BlcmF0aW9uKCkuZ2V0Q3JlZGVudGlhbElEKCkpXG4gICAgICBjb25zdCBzaWdpZHhzOiBTaWdJZHhbXSA9IHRoaXMub3BzW2ldLmdldE9wZXJhdGlvbigpLmdldFNpZ0lkeHMoKVxuICAgICAgZm9yIChsZXQgajogbnVtYmVyID0gMDsgaiA8IHNpZ2lkeHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3Qga2V5cGFpcjogS2V5UGFpciA9IGtjLmdldEtleShzaWdpZHhzW2pdLmdldFNvdXJjZSgpKVxuICAgICAgICBjb25zdCBzaWdudmFsOiBCdWZmZXIgPSBrZXlwYWlyLnNpZ24obXNnKVxuICAgICAgICBjb25zdCBzaWc6IFNpZ25hdHVyZSA9IG5ldyBTaWduYXR1cmUoKVxuICAgICAgICBzaWcuZnJvbUJ1ZmZlcihzaWdudmFsKVxuICAgICAgICBjcmVkLmFkZFNpZ25hdHVyZShzaWcpXG4gICAgICB9XG4gICAgICBzaWdzLnB1c2goY3JlZClcbiAgICB9XG4gICAgcmV0dXJuIHNpZ3NcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGxldCBuZXdiYXNlOiBPcGVyYXRpb25UeCA9IG5ldyBPcGVyYXRpb25UeCgpXG4gICAgbmV3YmFzZS5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3YmFzZSBhcyB0aGlzXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IE9wZXJhdGlvblR4KC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgT3BlcmF0aW9uIHRyYW5zYWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gbmV0d29ya0lEIE9wdGlvbmFsIG5ldHdvcmtJRCwgW1tEZWZhdWx0TmV0d29ya0lEXV1cbiAgICogQHBhcmFtIGJsb2NrY2hhaW5JRCBPcHRpb25hbCBibG9ja2NoYWluSUQsIGRlZmF1bHQgQnVmZmVyLmFsbG9jKDMyLCAxNilcbiAgICogQHBhcmFtIG91dHMgT3B0aW9uYWwgYXJyYXkgb2YgdGhlIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zXG4gICAqIEBwYXJhbSBpbnMgT3B0aW9uYWwgYXJyYXkgb2YgdGhlIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXNcbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBtZW1vIGZpZWxkXG4gICAqIEBwYXJhbSBvcHMgQXJyYXkgb2YgW1tPcGVyYXRpb25dXXMgdXNlZCBpbiB0aGUgdHJhbnNhY3Rpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCwgYmxvY2tjaGFpbklEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIsIDE2KSxcbiAgICBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHVuZGVmaW5lZCwgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCwgb3BzOiBUcmFuc2ZlcmFibGVPcGVyYXRpb25bXSA9IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zLCBtZW1vKVxuICAgIGlmICh0eXBlb2Ygb3BzICE9PSBcInVuZGVmaW5lZFwiICYmIEFycmF5LmlzQXJyYXkob3BzKSkge1xuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IG9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIShvcHNbaV0gaW5zdGFuY2VvZiBUcmFuc2ZlcmFibGVPcGVyYXRpb24pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IE9wZXJhdGlvbkVycm9yKGBFcnJvciAtIE9wZXJhdGlvblR4LmNvbnN0cnVjdG9yOiBpbnZhbGlkIG9wIGluIGFycmF5IHBhcmFtZXRlciAke29wc31gKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLm9wcyA9IG9wc1xuICAgIH1cbiAgfVxufSJdfQ==