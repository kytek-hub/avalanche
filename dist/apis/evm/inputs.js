"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVMInput = exports.SECPTransferInput = exports.AmountInput = exports.TransferableInput = exports.SelectInputClass = void 0;
/**
 * @packageDocumentation
 * @module API-EVM-Inputs
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const input_1 = require("../../common/input");
const outputs_1 = require("./outputs");
const bn_js_1 = __importDefault(require("bn.js"));
const credentials_1 = require("../../common/credentials");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Takes a buffer representing the output and returns the proper [[Input]] instance.
 *
 * @param inputID A number representing the inputID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Input]]-extended class.
 */
exports.SelectInputClass = (inputID, ...args) => {
    if (inputID === constants_1.EVMConstants.SECPINPUTID) {
        return new SECPTransferInput(...args);
    }
    /* istanbul ignore next */
    throw new errors_1.InputIdError("Error - SelectInputClass: unknown inputID");
};
class TransferableInput extends input_1.StandardTransferableInput {
    constructor() {
        super(...arguments);
        this._typeName = "TransferableInput";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.input = exports.SelectInputClass(fields["input"]["_typeID"]);
        this.input.deserialize(fields["input"], encoding);
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing a [[TransferableInput]], parses it, populates the class, and returns the length of the [[TransferableInput]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[TransferableInput]]
     *
     * @returns The length of the raw [[TransferableInput]]
     */
    fromBuffer(bytes, offset = 0) {
        this.txid = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.outputidx = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.assetID = bintools.copyFrom(bytes, offset, offset + constants_1.EVMConstants.ASSETIDLEN);
        offset += 32;
        const inputid = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.input = exports.SelectInputClass(inputid);
        return this.input.fromBuffer(bytes, offset);
    }
}
exports.TransferableInput = TransferableInput;
class AmountInput extends input_1.StandardAmountInput {
    constructor() {
        super(...arguments);
        this._typeName = "AmountInput";
        this._typeID = undefined;
    }
    //serialize and deserialize both are inherited
    select(id, ...args) {
        return exports.SelectInputClass(id, ...args);
    }
}
exports.AmountInput = AmountInput;
class SECPTransferInput extends AmountInput {
    constructor() {
        super(...arguments);
        this._typeName = "SECPTransferInput";
        this._typeID = constants_1.EVMConstants.SECPINPUTID;
        this.getCredentialID = () => constants_1.EVMConstants.SECPCREDENTIAL;
    }
    //serialize and deserialize both are inherited
    /**
       * Returns the inputID for this input
       */
    getInputID() {
        return constants_1.EVMConstants.SECPINPUTID;
    }
    create(...args) {
        return new SECPTransferInput(...args);
    }
    clone() {
        const newout = this.create();
        newout.fromBuffer(this.toBuffer());
        return newout;
    }
}
exports.SECPTransferInput = SECPTransferInput;
class EVMInput extends outputs_1.EVMOutput {
    /**
     * An [[EVMInput]] class which contains address, amount, assetID, nonce.
     *
     * @param address is the EVM address from which to transfer funds.
     * @param amount is the amount of the asset to be transferred (specified in nAVAX for AVAX and the smallest denomination for all other assets).
     * @param assetID The assetID which is being sent as a {@link https://github.com/feross/buffer|Buffer} or as a string.
     * @param nonce A {@link https://github.com/indutny/bn.js/|BN} or a number representing the nonce.
     */
    constructor(address = undefined, amount = undefined, assetID = undefined, nonce = undefined) {
        super(address, amount, assetID);
        this.nonce = buffer_1.Buffer.alloc(8);
        this.nonceValue = new bn_js_1.default(0);
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
        /**
         * Returns the nonce as a {@link https://github.com/indutny/bn.js/|BN}.
         */
        this.getNonce = () => this.nonceValue.clone();
        this.getCredentialID = () => constants_1.EVMConstants.SECPCREDENTIAL;
        if (typeof nonce !== 'undefined') {
            // convert number nonce to BN
            let n;
            if (typeof nonce === 'number') {
                n = new bn_js_1.default(nonce);
            }
            else {
                n = nonce;
            }
            this.nonceValue = n.clone();
            this.nonce = bintools.fromBNToBuffer(n, 8);
        }
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[EVMOutput]].
     */
    toBuffer() {
        let superbuff = super.toBuffer();
        let bsize = superbuff.length + this.nonce.length;
        let barr = [superbuff, this.nonce];
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
     * Decodes the [[EVMInput]] as a {@link https://github.com/feross/buffer|Buffer} and returns the size.
     *
     * @param bytes The bytes as a {@link https://github.com/feross/buffer|Buffer}.
     * @param offset An offset as a number.
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.nonce = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        return offset;
    }
    /**
     * Returns a base-58 representation of the [[EVMInput]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
    create(...args) {
        return new EVMInput(...args);
    }
    clone() {
        const newEVMInput = this.create();
        newEVMInput.fromBuffer(this.toBuffer());
        return newEVMInput;
    }
}
exports.EVMInput = EVMInput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvZXZtL2lucHV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxvQ0FBaUM7QUFDakMsb0VBQTRDO0FBQzVDLDJDQUEyQztBQUMzQyw4Q0FJNEI7QUFFNUIsdUNBQXNDO0FBQ3RDLGtEQUF1QjtBQUN2QiwwREFBa0Q7QUFDbEQsK0NBQWtEO0FBRWxEOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUVsRDs7Ozs7O0dBTUc7QUFDVSxRQUFBLGdCQUFnQixHQUFHLENBQUMsT0FBZSxFQUFFLEdBQUcsSUFBVyxFQUFTLEVBQUU7SUFDekUsSUFBSSxPQUFPLEtBQUssd0JBQVksQ0FBQyxXQUFXLEVBQUU7UUFDeEMsT0FBTyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDdkM7SUFDRCwwQkFBMEI7SUFDMUIsTUFBTSxJQUFJLHFCQUFZLENBQUMsMkNBQTJDLENBQUMsQ0FBQztBQUN0RSxDQUFDLENBQUM7QUFFRixNQUFhLGlCQUFrQixTQUFRLGlDQUF5QjtJQUFoRTs7UUFDWSxjQUFTLEdBQUcsbUJBQW1CLENBQUM7UUFDaEMsWUFBTyxHQUFHLFNBQVMsQ0FBQztJQThCaEMsQ0FBQztJQTVCQyx3QkFBd0I7SUFFeEIsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsd0JBQWdCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFD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b3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktRVZNLUlucHV0c1xuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJztcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi8uLi91dGlscy9iaW50b29scyc7XG5pbXBvcnQgeyBFVk1Db25zdGFudHMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBcbiAgSW5wdXQsIFxuICBTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0LCBcbiAgU3RhbmRhcmRBbW91bnRJbnB1dCBcbn0gZnJvbSAnLi4vLi4vY29tbW9uL2lucHV0JztcbmltcG9ydCB7IFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gJy4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb24nO1xuaW1wb3J0IHsgRVZNT3V0cHV0IH0gZnJvbSAnLi9vdXRwdXRzJztcbmltcG9ydCBCTiBmcm9tICdibi5qcyc7XG5pbXBvcnQgeyBTaWdJZHggfSBmcm9tICcuLi8uLi9jb21tb24vY3JlZGVudGlhbHMnO1xuaW1wb3J0IHsgSW5wdXRJZEVycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvZXJyb3JzJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKCk7XG5cbi8qKlxuICogVGFrZXMgYSBidWZmZXIgcmVwcmVzZW50aW5nIHRoZSBvdXRwdXQgYW5kIHJldHVybnMgdGhlIHByb3BlciBbW0lucHV0XV0gaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIGlucHV0SUQgQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBpbnB1dElEIHBhcnNlZCBwcmlvciB0byB0aGUgYnl0ZXMgcGFzc2VkIGluXG4gKlxuICogQHJldHVybnMgQW4gaW5zdGFuY2Ugb2YgYW4gW1tJbnB1dF1dLWV4dGVuZGVkIGNsYXNzLlxuICovXG5leHBvcnQgY29uc3QgU2VsZWN0SW5wdXRDbGFzcyA9IChpbnB1dElEOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogSW5wdXQgPT4ge1xuICBpZiAoaW5wdXRJRCA9PT0gRVZNQ29uc3RhbnRzLlNFQ1BJTlBVVElEKSB7XG4gICAgcmV0dXJuIG5ldyBTRUNQVHJhbnNmZXJJbnB1dCguLi5hcmdzKTtcbiAgfVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICB0aHJvdyBuZXcgSW5wdXRJZEVycm9yKFwiRXJyb3IgLSBTZWxlY3RJbnB1dENsYXNzOiB1bmtub3duIGlucHV0SURcIik7XG59O1xuXG5leHBvcnQgY2xhc3MgVHJhbnNmZXJhYmxlSW5wdXQgZXh0ZW5kcyBTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVHJhbnNmZXJhYmxlSW5wdXRcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgdGhpcy5pbnB1dCA9IFNlbGVjdElucHV0Q2xhc3MoZmllbGRzW1wiaW5wdXRcIl1bXCJfdHlwZUlEXCJdKTtcbiAgICB0aGlzLmlucHV0LmRlc2VyaWFsaXplKGZpZWxkc1tcImlucHV0XCJdLCBlbmNvZGluZyk7XG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgW1tUcmFuc2ZlcmFibGVJbnB1dF1dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIFtbVHJhbnNmZXJhYmxlSW5wdXRdXSBpbiBieXRlcy5cbiAgICpcbiAgICogQHBhcmFtIGJ5dGVzIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhIHJhdyBbW1RyYW5zZmVyYWJsZUlucHV0XV1cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbVHJhbnNmZXJhYmxlSW5wdXRdXVxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMudHhpZCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKTtcbiAgICBvZmZzZXQgKz0gMzI7XG4gICAgdGhpcy5vdXRwdXRpZHggPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KTtcbiAgICBvZmZzZXQgKz0gNDtcbiAgICB0aGlzLmFzc2V0SUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyBFVk1Db25zdGFudHMuQVNTRVRJRExFTik7XG4gICAgb2Zmc2V0ICs9IDMyO1xuICAgIGNvbnN0IGlucHV0aWQ6bnVtYmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCkucmVhZFVJbnQzMkJFKDApO1xuICAgIG9mZnNldCArPSA0O1xuICAgIHRoaXMuaW5wdXQgPSBTZWxlY3RJbnB1dENsYXNzKGlucHV0aWQpO1xuICAgIHJldHVybiB0aGlzLmlucHV0LmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gIH1cbiAgXG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBbW91bnRJbnB1dCBleHRlbmRzIFN0YW5kYXJkQW1vdW50SW5wdXQge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJBbW91bnRJbnB1dFwiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG5cbiAgc2VsZWN0KGlkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogSW5wdXQge1xuICAgIHJldHVybiBTZWxlY3RJbnB1dENsYXNzKGlkLCAuLi5hcmdzKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU0VDUFRyYW5zZmVySW5wdXQgZXh0ZW5kcyBBbW91bnRJbnB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlNFQ1BUcmFuc2ZlcklucHV0XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gRVZNQ29uc3RhbnRzLlNFQ1BJTlBVVElEO1xuXG4gIC8vc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBib3RoIGFyZSBpbmhlcml0ZWRcblxuICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBpbnB1dElEIGZvciB0aGlzIGlucHV0XG4gICAgICovXG4gIGdldElucHV0SUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gRVZNQ29uc3RhbnRzLlNFQ1BJTlBVVElEO1xuICB9XG5cbiAgZ2V0Q3JlZGVudGlhbElEID0gKCk6IG51bWJlciA9PiBFVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUw7XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpc3tcbiAgICByZXR1cm4gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KC4uLmFyZ3MpIGFzIHRoaXM7XG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdvdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gdGhpcy5jcmVhdGUoKVxuICAgIG5ld291dC5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSk7XG4gICAgcmV0dXJuIG5ld291dCBhcyB0aGlzO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBFVk1JbnB1dCBleHRlbmRzIEVWTU91dHB1dCB7XG4gIHByb3RlY3RlZCBub25jZTogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDgpO1xuICBwcm90ZWN0ZWQgbm9uY2VWYWx1ZTogQk4gPSBuZXcgQk4oMCk7XG4gIHByb3RlY3RlZCBzaWdDb3VudDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICBwcm90ZWN0ZWQgc2lnSWR4czogU2lnSWR4W10gPSBbXTsgLy8gaWR4cyBvZiBzaWduZXJzIGZyb20gdXR4b1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhcnJheSBvZiBbW1NpZ0lkeF1dIGZvciB0aGlzIFtbSW5wdXRdXVxuICAgKi9cbiAgZ2V0U2lnSWR4cyA9ICgpOiBTaWdJZHhbXSA9PiB0aGlzLnNpZ0lkeHM7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYW5kIGFkZHMgYSBbW1NpZ0lkeF1dIHRvIHRoZSBbW0lucHV0XV0uXG4gICAqXG4gICAqIEBwYXJhbSBhZGRyZXNzSWR4IFRoZSBpbmRleCBvZiB0aGUgYWRkcmVzcyB0byByZWZlcmVuY2UgaW4gdGhlIHNpZ25hdHVyZXNcbiAgICogQHBhcmFtIGFkZHJlc3MgVGhlIGFkZHJlc3Mgb2YgdGhlIHNvdXJjZSBvZiB0aGUgc2lnbmF0dXJlXG4gICAqL1xuICBhZGRTaWduYXR1cmVJZHggPSAoYWRkcmVzc0lkeDogbnVtYmVyLCBhZGRyZXNzOiBCdWZmZXIpID0+IHtcbiAgICBjb25zdCBzaWdpZHg6IFNpZ0lkeCA9IG5ldyBTaWdJZHgoKTtcbiAgICBjb25zdCBiOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgYi53cml0ZVVJbnQzMkJFKGFkZHJlc3NJZHgsIDApO1xuICAgIHNpZ2lkeC5mcm9tQnVmZmVyKGIpO1xuICAgIHNpZ2lkeC5zZXRTb3VyY2UoYWRkcmVzcyk7XG4gICAgdGhpcy5zaWdJZHhzLnB1c2goc2lnaWR4KTtcbiAgICB0aGlzLnNpZ0NvdW50LndyaXRlVUludDMyQkUodGhpcy5zaWdJZHhzLmxlbmd0aCwgMCk7XG4gIH07XG5cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbm9uY2UgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfS5cbiAgICovXG4gIGdldE5vbmNlID0gKCk6IEJOID0+IHRoaXMubm9uY2VWYWx1ZS5jbG9uZSgpO1xuIFxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0VWTU91dHB1dF1dLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBsZXQgc3VwZXJidWZmOiBCdWZmZXIgPSBzdXBlci50b0J1ZmZlcigpO1xuICAgIGxldCBic2l6ZTogbnVtYmVyID0gc3VwZXJidWZmLmxlbmd0aCArIHRoaXMubm9uY2UubGVuZ3RoO1xuICAgIGxldCBiYXJyOiBCdWZmZXJbXSA9IFtzdXBlcmJ1ZmYsIHRoaXMubm9uY2VdO1xuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsYnNpemUpO1xuICB9XG5cbiAgZ2V0Q3JlZGVudGlhbElEID0gKCk6IG51bWJlciA9PiBFVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUw7XG5cbiAgLyoqXG4gICAqIERlY29kZXMgdGhlIFtbRVZNSW5wdXRdXSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGFuZCByZXR1cm5zIHRoZSBzaXplLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgVGhlIGJ5dGVzIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0uXG4gICAqIEBwYXJhbSBvZmZzZXQgQW4gb2Zmc2V0IGFzIGEgbnVtYmVyLlxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gICAgdGhpcy5ub25jZSA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDgpO1xuICAgIG9mZnNldCArPSA4O1xuICAgIHJldHVybiBvZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGJhc2UtNTggcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbRVZNSW5wdXRdXS5cbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmJ1ZmZlclRvQjU4KHRoaXMudG9CdWZmZXIoKSk7XG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlze1xuICAgIHJldHVybiBuZXcgRVZNSW5wdXQoLi4uYXJncykgYXMgdGhpcztcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IG5ld0VWTUlucHV0OiBFVk1JbnB1dCA9IHRoaXMuY3JlYXRlKCk7XG4gICAgbmV3RVZNSW5wdXQuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpO1xuICAgIHJldHVybiBuZXdFVk1JbnB1dCBhcyB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEFuIFtbRVZNSW5wdXRdXSBjbGFzcyB3aGljaCBjb250YWlucyBhZGRyZXNzLCBhbW91bnQsIGFzc2V0SUQsIG5vbmNlLlxuICAgKlxuICAgKiBAcGFyYW0gYWRkcmVzcyBpcyB0aGUgRVZNIGFkZHJlc3MgZnJvbSB3aGljaCB0byB0cmFuc2ZlciBmdW5kcy5cbiAgICogQHBhcmFtIGFtb3VudCBpcyB0aGUgYW1vdW50IG9mIHRoZSBhc3NldCB0byBiZSB0cmFuc2ZlcnJlZCAoc3BlY2lmaWVkIGluIG5BVkFYIGZvciBBVkFYIGFuZCB0aGUgc21hbGxlc3QgZGVub21pbmF0aW9uIGZvciBhbGwgb3RoZXIgYXNzZXRzKS5cbiAgICogQHBhcmFtIGFzc2V0SUQgVGhlIGFzc2V0SUQgd2hpY2ggaXMgYmVpbmcgc2VudCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9yIGFzIGEgc3RyaW5nLlxuICAgKiBAcGFyYW0gbm9uY2UgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBvciBhIG51bWJlciByZXByZXNlbnRpbmcgdGhlIG5vbmNlLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgYWRkcmVzczogQnVmZmVyIHwgc3RyaW5nID0gdW5kZWZpbmVkLCBcbiAgICBhbW91bnQ6IEJOIHwgbnVtYmVyID0gdW5kZWZpbmVkLCBcbiAgICBhc3NldElEOiBCdWZmZXIgfCBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgbm9uY2U6IEJOIHwgbnVtYmVyID0gdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKGFkZHJlc3MsIGFtb3VudCwgYXNzZXRJRCk7XG5cbiAgICBpZiAodHlwZW9mIG5vbmNlICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gY29udmVydCBudW1iZXIgbm9uY2UgdG8gQk5cbiAgICAgIGxldCBuOkJOO1xuICAgICAgaWYgKHR5cGVvZiBub25jZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgbiA9IG5ldyBCTihub25jZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuID0gbm9uY2U7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubm9uY2VWYWx1ZSA9IG4uY2xvbmUoKTtcbiAgICAgIHRoaXMubm9uY2UgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihuLCA4KTtcbiAgICB9XG4gIH1cbn0gIFxuIl19