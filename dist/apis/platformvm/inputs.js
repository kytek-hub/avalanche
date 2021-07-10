"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StakeableLockIn = exports.SECPTransferInput = exports.AmountInput = exports.TransferableInput = exports.ParseableInput = exports.SelectInputClass = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-Inputs
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const input_1 = require("../../common/input");
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Takes a buffer representing the output and returns the proper [[Input]] instance.
 *
 * @param inputid A number representing the inputID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Input]]-extended class.
 */
exports.SelectInputClass = (inputid, ...args) => {
    if (inputid === constants_1.PlatformVMConstants.SECPINPUTID) {
        return new SECPTransferInput(...args);
    }
    else if (inputid === constants_1.PlatformVMConstants.STAKEABLELOCKINID) {
        return new StakeableLockIn(...args);
    }
    /* istanbul ignore next */
    throw new errors_1.InputIdError("Error - SelectInputClass: unknown inputid");
};
class ParseableInput extends input_1.StandardParseableInput {
    constructor() {
        super(...arguments);
        this._typeName = "ParseableInput";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.input = exports.SelectInputClass(fields["input"]["_typeID"]);
        this.input.deserialize(fields["input"], encoding);
    }
    fromBuffer(bytes, offset = 0) {
        const inputid = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.input = exports.SelectInputClass(inputid);
        return this.input.fromBuffer(bytes, offset);
    }
}
exports.ParseableInput = ParseableInput;
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
        this.assetID = bintools.copyFrom(bytes, offset, offset + constants_1.PlatformVMConstants.ASSETIDLEN);
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
        this._typeID = constants_1.PlatformVMConstants.SECPINPUTID;
        this.getCredentialID = () => constants_1.PlatformVMConstants.SECPCREDENTIAL;
    }
    //serialize and deserialize both are inherited
    /**
     * Returns the inputID for this input
     */
    getInputID() {
        return this._typeID;
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
/**
 * An [[Input]] class which specifies an input that has a locktime which can also enable staking of the value held, preventing transfers but not validation.
 */
class StakeableLockIn extends AmountInput {
    /**
     * A [[Output]] class which specifies an [[Input]] that has a locktime which can also enable staking of the value held, preventing transfers but not validation.
     *
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} representing the amount in the input
     * @param stakeableLocktime A {@link https://github.com/indutny/bn.js/|BN} representing the stakeable locktime
     * @param transferableInput A [[ParseableInput]] which is embedded into this input.
     */
    constructor(amount = undefined, stakeableLocktime = undefined, transferableInput = undefined) {
        super(amount);
        this._typeName = "StakeableLockIn";
        this._typeID = constants_1.PlatformVMConstants.STAKEABLELOCKINID;
        this.getCredentialID = () => constants_1.PlatformVMConstants.SECPCREDENTIAL;
        if (typeof stakeableLocktime !== "undefined") {
            this.stakeableLocktime = bintools.fromBNToBuffer(stakeableLocktime, 8);
        }
        if (typeof transferableInput !== "undefined") {
            this.transferableInput = transferableInput;
            this.synchronize();
        }
    }
    //serialize and deserialize both are inherited
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        let outobj = Object.assign(Object.assign({}, fields), { "stakeableLocktime": serialization.encoder(this.stakeableLocktime, encoding, "Buffer", "decimalString", 8), "transferableInput": this.transferableInput.serialize(encoding) });
        delete outobj["sigIdxs"];
        delete outobj["sigCount"];
        delete outobj["amount"];
        return outobj;
    }
    ;
    deserialize(fields, encoding = "hex") {
        fields["sigIdxs"] = [];
        fields["sigCount"] = "0";
        fields["amount"] = "98";
        super.deserialize(fields, encoding);
        this.stakeableLocktime = serialization.decoder(fields["stakeableLocktime"], encoding, "decimalString", "Buffer", 8);
        this.transferableInput = new ParseableInput();
        this.transferableInput.deserialize(fields["transferableInput"], encoding);
        this.synchronize();
    }
    synchronize() {
        let input = this.transferableInput.getInput();
        this.sigIdxs = input.getSigIdxs();
        this.sigCount = buffer_1.Buffer.alloc(4);
        this.sigCount.writeUInt32BE(this.sigIdxs.length, 0);
        this.amount = bintools.fromBNToBuffer(input.getAmount(), 8);
        this.amountValue = input.getAmount();
    }
    getStakeableLocktime() {
        return bintools.fromBufferToBN(this.stakeableLocktime);
    }
    getTransferablInput() {
        return this.transferableInput;
    }
    /**
     * Returns the inputID for this input
     */
    getInputID() {
        return this._typeID;
    }
    /**
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[StakeableLockIn]] and returns the size of the output.
     */
    fromBuffer(bytes, offset = 0) {
        this.stakeableLocktime = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.transferableInput = new ParseableInput();
        offset = this.transferableInput.fromBuffer(bytes, offset);
        this.synchronize();
        return offset;
    }
    /**
     * Returns the buffer representing the [[StakeableLockIn]] instance.
     */
    toBuffer() {
        const xferinBuff = this.transferableInput.toBuffer();
        const bsize = this.stakeableLocktime.length + xferinBuff.length;
        const barr = [this.stakeableLocktime, xferinBuff];
        return buffer_1.Buffer.concat(barr, bsize);
    }
    create(...args) {
        return new StakeableLockIn(...args);
    }
    clone() {
        const newout = this.create();
        newout.fromBuffer(this.toBuffer());
        return newout;
    }
    select(id, ...args) {
        return exports.SelectInputClass(id, ...args);
    }
}
exports.StakeableLockIn = StakeableLockIn;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS9pbnB1dHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWlDO0FBQ2pDLG9FQUE0QztBQUM1QywyQ0FBa0Q7QUFDbEQsOENBQW1IO0FBQ25ILDZEQUE4RTtBQUU5RSwrQ0FBa0Q7QUFFbEQ7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWhFOzs7Ozs7R0FNRztBQUNVLFFBQUEsZ0JBQWdCLEdBQUcsQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXLEVBQVMsRUFBRTtJQUN6RSxJQUFJLE9BQU8sS0FBSywrQkFBbUIsQ0FBQyxXQUFXLEVBQUU7UUFDL0MsT0FBTyxJQUFJLGlCQUFpQixDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDdkM7U0FBTSxJQUFJLE9BQU8sS0FBSywrQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRTtRQUM1RCxPQUFPLElBQUksZUFBZSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDckM7SUFDRCwwQkFBMEI7SUFDMUIsTUFBTSxJQUFJLHFCQUFZLENBQUMsMkNBQTJDLENBQUMsQ0FBQztBQUN0RSxDQUFDLENBQUM7QUFFRixNQUFhLGNBQWUsU0FBUSw4QkFBc0I7SUFBMUQ7O1FBQ1ksY0FBUyxHQUFHLGdCQUFnQixDQUFDO1FBQzdCLFlBQU8sR0FBRyxTQUFTLENBQUM7SUFnQmhDLENBQUM7SUFkQyx3QkFBd0I7SUFFeEIsV0FBVyxDQUFDLE1BQWEsRUFBRSxXQUE4QixLQUFLO1FBQzVELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxLQUFLLEdBQUcsd0JBQWdCLENB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QUM7UUFDOUMsTUFBTSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQixPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxRQUFRO1FBQ04sTUFBTSxVQUFVLEdBQVUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzVELE1BQU0sS0FBSyxHQUFVLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUN2RSxNQUFNLElBQUksR0FBYSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUM1RCxPQUFPLGVBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBRyxJQUFVO1FBQ2xCLE9BQU8sSUFBSSxlQUFlLENBQUMsR0FBRyxJQUFJLENBQVMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsS0FBSztRQUNILE1BQU0sTUFBTSxHQUFtQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDNUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNuQyxPQUFPLE1BQWMsQ0FBQztJQUN4QixDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQVMsRUFBRSxHQUFHLElBQVc7UUFDOUIsT0FBTyx3QkFBZ0IsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0NBbUJGO0FBOUdELDBDQThHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1QbGF0Zm9ybVZNLUlucHV0c1xuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJztcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi8uLi91dGlscy9iaW50b29scyc7XG5pbXBvcnQgeyBQbGF0Zm9ybVZNQ29uc3RhbnRzIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgSW5wdXQsIFN0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXQsIFN0YW5kYXJkQW1vdW50SW5wdXQsIFN0YW5kYXJkUGFyc2VhYmxlSW5wdXQgfSBmcm9tICcuLi8uLi9jb21tb24vaW5wdXQnO1xuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSAnLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvbic7XG5pbXBvcnQgQk4gZnJvbSAnYm4uanMnO1xuaW1wb3J0IHsgSW5wdXRJZEVycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvZXJyb3JzJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcblxuLyoqXG4gKiBUYWtlcyBhIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIG91dHB1dCBhbmQgcmV0dXJucyB0aGUgcHJvcGVyIFtbSW5wdXRdXSBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0gaW5wdXRpZCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIGlucHV0SUQgcGFyc2VkIHByaW9yIHRvIHRoZSBieXRlcyBwYXNzZWQgaW5cbiAqXG4gKiBAcmV0dXJucyBBbiBpbnN0YW5jZSBvZiBhbiBbW0lucHV0XV0tZXh0ZW5kZWQgY2xhc3MuXG4gKi9cbmV4cG9ydCBjb25zdCBTZWxlY3RJbnB1dENsYXNzID0gKGlucHV0aWQ6IG51bWJlciwgLi4uYXJnczogYW55W10pOiBJbnB1dCA9PiB7XG4gIGlmIChpbnB1dGlkID09PSBQbGF0Zm9ybVZNQ29uc3RhbnRzLlNFQ1BJTlBVVElEKSB7XG4gICAgcmV0dXJuIG5ldyBTRUNQVHJhbnNmZXJJbnB1dCguLi5hcmdzKTtcbiAgfSBlbHNlIGlmIChpbnB1dGlkID09PSBQbGF0Zm9ybVZNQ29uc3RhbnRzLlNUQUtFQUJMRUxPQ0tJTklEKSB7XG4gICAgcmV0dXJuIG5ldyBTdGFrZWFibGVMb2NrSW4oLi4uYXJncyk7XG4gIH1cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgdGhyb3cgbmV3IElucHV0SWRFcnJvcihcIkVycm9yIC0gU2VsZWN0SW5wdXRDbGFzczogdW5rbm93biBpbnB1dGlkXCIpO1xufTtcblxuZXhwb3J0IGNsYXNzIFBhcnNlYWJsZUlucHV0IGV4dGVuZHMgU3RhbmRhcmRQYXJzZWFibGVJbnB1dHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiUGFyc2VhYmxlSW5wdXRcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOm9iamVjdCwgZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpO1xuICAgIHRoaXMuaW5wdXQgPSBTZWxlY3RJbnB1dENsYXNzKGZpZWxkc1tcImlucHV0XCJdW1wiX3R5cGVJRFwiXSk7XG4gICAgdGhpcy5pbnB1dC5kZXNlcmlhbGl6ZShmaWVsZHNbXCJpbnB1dFwiXSwgZW5jb2RpbmcpO1xuICB9XG5cbiAgZnJvbUJ1ZmZlcihieXRlczpCdWZmZXIsIG9mZnNldDpudW1iZXIgPSAwKTpudW1iZXIge1xuICAgIGNvbnN0IGlucHV0aWQ6bnVtYmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCkucmVhZFVJbnQzMkJFKDApO1xuICAgIG9mZnNldCArPSA0O1xuICAgIHRoaXMuaW5wdXQgPSBTZWxlY3RJbnB1dENsYXNzKGlucHV0aWQpO1xuICAgIHJldHVybiB0aGlzLmlucHV0LmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zZmVyYWJsZUlucHV0IGV4dGVuZHMgU3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlRyYW5zZmVyYWJsZUlucHV0XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkO1xuXG4gIC8vc2VyaWFsaXplIGlzIGluaGVyaXRlZFxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLmlucHV0ID0gU2VsZWN0SW5wdXRDbGFzcyhmaWVsZHNbXCJpbnB1dFwiXVtcIl90eXBlSURcIl0pO1xuICAgIHRoaXMuaW5wdXQuZGVzZXJpYWxpemUoZmllbGRzW1wiaW5wdXRcIl0sIGVuY29kaW5nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYSBbW1RyYW5zZmVyYWJsZUlucHV0XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbVHJhbnNmZXJhYmxlSW5wdXRdXVxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tUcmFuc2ZlcmFibGVJbnB1dF1dXG4gICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOkJ1ZmZlciwgb2Zmc2V0Om51bWJlciA9IDApOm51bWJlciB7XG4gICAgdGhpcy50eGlkID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMzIpO1xuICAgIG9mZnNldCArPSAzMjtcbiAgICB0aGlzLm91dHB1dGlkeCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpO1xuICAgIG9mZnNldCArPSA0O1xuICAgIHRoaXMuYXNzZXRJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIFBsYXRmb3JtVk1Db25zdGFudHMuQVNTRVRJRExFTik7XG4gICAgb2Zmc2V0ICs9IDMyO1xuICAgIGNvbnN0IGlucHV0aWQ6bnVtYmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCkucmVhZFVJbnQzMkJFKDApO1xuICAgIG9mZnNldCArPSA0O1xuICAgIHRoaXMuaW5wdXQgPSBTZWxlY3RJbnB1dENsYXNzKGlucHV0aWQpO1xuICAgIHJldHVybiB0aGlzLmlucHV0LmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gIH1cblxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW1vdW50SW5wdXQgZXh0ZW5kcyBTdGFuZGFyZEFtb3VudElucHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiQW1vdW50SW5wdXRcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIHNlbGVjdChpZDpudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTpJbnB1dCB7XG4gICAgcmV0dXJuIFNlbGVjdElucHV0Q2xhc3MoaWQsIC4uLmFyZ3MpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTRUNQVHJhbnNmZXJJbnB1dCBleHRlbmRzIEFtb3VudElucHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU0VDUFRyYW5zZmVySW5wdXRcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSBQbGF0Zm9ybVZNQ29uc3RhbnRzLlNFQ1BJTlBVVElEO1xuXG4gIC8vc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBib3RoIGFyZSBpbmhlcml0ZWRcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaW5wdXRJRCBmb3IgdGhpcyBpbnB1dFxuICAgKi9cbiAgZ2V0SW5wdXRJRCgpOm51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRDtcbiAgfVxuXG4gIGdldENyZWRlbnRpYWxJRCA9ICgpOm51bWJlciA9PiBQbGF0Zm9ybVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMO1xuXG4gIGNyZWF0ZSguLi5hcmdzOmFueVtdKTp0aGlze1xuICAgIHJldHVybiBuZXcgU0VDUFRyYW5zZmVySW5wdXQoLi4uYXJncykgYXMgdGhpcztcbiAgfVxuXG4gIGNsb25lKCk6dGhpcyB7XG4gICAgY29uc3QgbmV3b3V0OlNFQ1BUcmFuc2ZlcklucHV0ID0gdGhpcy5jcmVhdGUoKVxuICAgIG5ld291dC5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSk7XG4gICAgcmV0dXJuIG5ld291dCBhcyB0aGlzO1xuICB9XG5cbn1cblxuLyoqXG4gKiBBbiBbW0lucHV0XV0gY2xhc3Mgd2hpY2ggc3BlY2lmaWVzIGFuIGlucHV0IHRoYXQgaGFzIGEgbG9ja3RpbWUgd2hpY2ggY2FuIGFsc28gZW5hYmxlIHN0YWtpbmcgb2YgdGhlIHZhbHVlIGhlbGQsIHByZXZlbnRpbmcgdHJhbnNmZXJzIGJ1dCBub3QgdmFsaWRhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFN0YWtlYWJsZUxvY2tJbiBleHRlbmRzIEFtb3VudElucHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU3Rha2VhYmxlTG9ja0luXCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5TVEFLRUFCTEVMT0NLSU5JRDtcblxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOm9iamVjdCB7XG4gICAgbGV0IGZpZWxkczpvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgIGxldCBvdXRvYmo6b2JqZWN0ID0ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgXCJzdGFrZWFibGVMb2NrdGltZVwiOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5zdGFrZWFibGVMb2NrdGltZSwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiZGVjaW1hbFN0cmluZ1wiLCA4KSxcbiAgICAgIFwidHJhbnNmZXJhYmxlSW5wdXRcIjogdGhpcy50cmFuc2ZlcmFibGVJbnB1dC5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgfTtcbiAgICBkZWxldGUgb3V0b2JqW1wic2lnSWR4c1wiXTtcbiAgICBkZWxldGUgb3V0b2JqW1wic2lnQ291bnRcIl07XG4gICAgZGVsZXRlIG91dG9ialtcImFtb3VudFwiXTtcbiAgICByZXR1cm4gb3V0b2JqO1xuICB9O1xuICBkZXNlcmlhbGl6ZShmaWVsZHM6b2JqZWN0LCBlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgZmllbGRzW1wic2lnSWR4c1wiXSA9IFtdO1xuICAgIGZpZWxkc1tcInNpZ0NvdW50XCJdID0gXCIwXCI7XG4gICAgZmllbGRzW1wiYW1vdW50XCJdID0gXCI5OFwiO1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpO1xuICAgIHRoaXMuc3Rha2VhYmxlTG9ja3RpbWUgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wic3Rha2VhYmxlTG9ja3RpbWVcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJCdWZmZXJcIiwgOCk7XG4gICAgdGhpcy50cmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBQYXJzZWFibGVJbnB1dCgpO1xuICAgIHRoaXMudHJhbnNmZXJhYmxlSW5wdXQuZGVzZXJpYWxpemUoZmllbGRzW1widHJhbnNmZXJhYmxlSW5wdXRcIl0sIGVuY29kaW5nKTtcbiAgICB0aGlzLnN5bmNocm9uaXplKCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgc3Rha2VhYmxlTG9ja3RpbWU6QnVmZmVyO1xuICBwcm90ZWN0ZWQgdHJhbnNmZXJhYmxlSW5wdXQ6UGFyc2VhYmxlSW5wdXQ7XG5cbiAgcHJpdmF0ZSBzeW5jaHJvbml6ZSgpe1xuICAgIGxldCBpbnB1dDpBbW91bnRJbnB1dCA9IHRoaXMudHJhbnNmZXJhYmxlSW5wdXQuZ2V0SW5wdXQoKSBhcyBBbW91bnRJbnB1dDtcbiAgICB0aGlzLnNpZ0lkeHMgPSBpbnB1dC5nZXRTaWdJZHhzKCk7XG4gICAgdGhpcy5zaWdDb3VudCA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICB0aGlzLnNpZ0NvdW50LndyaXRlVUludDMyQkUodGhpcy5zaWdJZHhzLmxlbmd0aCwgMCk7XG4gICAgdGhpcy5hbW91bnQgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihpbnB1dC5nZXRBbW91bnQoKSwgOCk7XG4gICAgdGhpcy5hbW91bnRWYWx1ZSA9IGlucHV0LmdldEFtb3VudCgpO1xuICB9XG5cbiAgZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKTpCTiB7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmZyb21CdWZmZXJUb0JOKHRoaXMuc3Rha2VhYmxlTG9ja3RpbWUpO1xuICB9XG5cbiAgZ2V0VHJhbnNmZXJhYmxJbnB1dCgpOlBhcnNlYWJsZUlucHV0IHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2ZlcmFibGVJbnB1dDtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaW5wdXRJRCBmb3IgdGhpcyBpbnB1dFxuICAgKi9cbiAgZ2V0SW5wdXRJRCgpOm51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRDtcbiAgfVxuXG4gIGdldENyZWRlbnRpYWxJRCA9ICgpOm51bWJlciA9PiBQbGF0Zm9ybVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMO1xuXG4gIC8qKlxuICAgKiBQb3B1YXRlcyB0aGUgaW5zdGFuY2UgZnJvbSBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgW1tTdGFrZWFibGVMb2NrSW5dXSBhbmQgcmV0dXJucyB0aGUgc2l6ZSBvZiB0aGUgb3V0cHV0LlxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczpCdWZmZXIsIG9mZnNldDpudW1iZXIgPSAwKTpudW1iZXIge1xuICAgIHRoaXMuc3Rha2VhYmxlTG9ja3RpbWUgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA4KTtcbiAgICBvZmZzZXQgKz0gODtcbiAgICB0aGlzLnRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFBhcnNlYWJsZUlucHV0KCk7XG4gICAgb2Zmc2V0ID0gdGhpcy50cmFuc2ZlcmFibGVJbnB1dC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpO1xuICAgIHRoaXMuc3luY2hyb25pemUoKTtcbiAgICByZXR1cm4gb2Zmc2V0O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIFtbU3Rha2VhYmxlTG9ja0luXV0gaW5zdGFuY2UuXG4gICAqL1xuICB0b0J1ZmZlcigpOkJ1ZmZlciB7XG4gICAgY29uc3QgeGZlcmluQnVmZjpCdWZmZXIgPSB0aGlzLnRyYW5zZmVyYWJsZUlucHV0LnRvQnVmZmVyKCk7XG4gICAgY29uc3QgYnNpemU6bnVtYmVyID0gdGhpcy5zdGFrZWFibGVMb2NrdGltZS5sZW5ndGggKyB4ZmVyaW5CdWZmLmxlbmd0aDtcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFt0aGlzLnN0YWtlYWJsZUxvY2t0aW1lLCB4ZmVyaW5CdWZmXTtcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSk7XG4gIH1cbiAgXG4gIGNyZWF0ZSguLi5hcmdzOmFueVtdKTp0aGlze1xuICAgIHJldHVybiBuZXcgU3Rha2VhYmxlTG9ja0luKC4uLmFyZ3MpIGFzIHRoaXM7XG4gIH1cblxuICBjbG9uZSgpOnRoaXMge1xuICAgIGNvbnN0IG5ld291dDpTdGFrZWFibGVMb2NrSW4gPSB0aGlzLmNyZWF0ZSgpXG4gICAgbmV3b3V0LmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKTtcbiAgICByZXR1cm4gbmV3b3V0IGFzIHRoaXM7XG4gIH1cblxuICBzZWxlY3QoaWQ6bnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6SW5wdXQge1xuICAgIHJldHVybiBTZWxlY3RJbnB1dENsYXNzKGlkLCAuLi5hcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIFtbT3V0cHV0XV0gY2xhc3Mgd2hpY2ggc3BlY2lmaWVzIGFuIFtbSW5wdXRdXSB0aGF0IGhhcyBhIGxvY2t0aW1lIHdoaWNoIGNhbiBhbHNvIGVuYWJsZSBzdGFraW5nIG9mIHRoZSB2YWx1ZSBoZWxkLCBwcmV2ZW50aW5nIHRyYW5zZmVycyBidXQgbm90IHZhbGlkYXRpb24uXG4gICAqXG4gICAqIEBwYXJhbSBhbW91bnQgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSByZXByZXNlbnRpbmcgdGhlIGFtb3VudCBpbiB0aGUgaW5wdXRcbiAgICogQHBhcmFtIHN0YWtlYWJsZUxvY2t0aW1lIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gcmVwcmVzZW50aW5nIHRoZSBzdGFrZWFibGUgbG9ja3RpbWVcbiAgICogQHBhcmFtIHRyYW5zZmVyYWJsZUlucHV0IEEgW1tQYXJzZWFibGVJbnB1dF1dIHdoaWNoIGlzIGVtYmVkZGVkIGludG8gdGhpcyBpbnB1dC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtb3VudDpCTiA9IHVuZGVmaW5lZCwgc3Rha2VhYmxlTG9ja3RpbWU6Qk4gPSB1bmRlZmluZWQsIHRyYW5zZmVyYWJsZUlucHV0OlBhcnNlYWJsZUlucHV0ID0gdW5kZWZpbmVkKSB7XG4gICAgc3VwZXIoYW1vdW50KTtcbiAgICBpZiAodHlwZW9mIHN0YWtlYWJsZUxvY2t0aW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLnN0YWtlYWJsZUxvY2t0aW1lID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIoc3Rha2VhYmxlTG9ja3RpbWUsIDgpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHRyYW5zZmVyYWJsZUlucHV0ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLnRyYW5zZmVyYWJsZUlucHV0ID0gdHJhbnNmZXJhYmxlSW5wdXQ7XG4gICAgICB0aGlzLnN5bmNocm9uaXplKCk7XG4gICAgfVxuICB9XG59XG4iXX0=