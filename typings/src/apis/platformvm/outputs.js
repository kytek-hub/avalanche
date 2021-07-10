"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECPOwnerOutput = exports.StakeableLockOut = exports.SECPTransferOutput = exports.AmountOutput = exports.ParseableOutput = exports.TransferableOutput = exports.SelectOutputClass = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-Outputs
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
    if (outputid == constants_1.PlatformVMConstants.SECPXFEROUTPUTID) {
        return new SECPTransferOutput(...args);
    }
    else if (outputid == constants_1.PlatformVMConstants.SECPOWNEROUTPUTID) {
        return new SECPOwnerOutput(...args);
    }
    else if (outputid == constants_1.PlatformVMConstants.STAKEABLELOCKOUTID) {
        return new StakeableLockOut(...args);
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
        this.assetID = bintools.copyFrom(bytes, offset, offset + constants_1.PlatformVMConstants.ASSETIDLEN);
        offset += constants_1.PlatformVMConstants.ASSETIDLEN;
        const outputid = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.output = exports.SelectOutputClass(outputid);
        return this.output.fromBuffer(bytes, offset);
    }
}
exports.TransferableOutput = TransferableOutput;
class ParseableOutput extends output_1.StandardParseableOutput {
    constructor() {
        super(...arguments);
        this._typeName = "ParseableOutput";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.output = exports.SelectOutputClass(fields["output"]["_typeID"]);
        this.output.deserialize(fields["output"], encoding);
    }
    fromBuffer(bytes, offset = 0) {
        const outputid = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.output = exports.SelectOutputClass(outputid);
        return this.output.fromBuffer(bytes, offset);
    }
}
exports.ParseableOutput = ParseableOutput;
class AmountOutput extends output_1.StandardAmountOutput {
    constructor() {
        super(...arguments);
        this._typeName = "AmountOutput";
        this._typeID = undefined;
    }
    //serialize and deserialize both are inherited
    /**
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
/**
 * An [[Output]] class which specifies an Output that carries an ammount for an assetID and uses secp256k1 signature scheme.
 */
class SECPTransferOutput extends AmountOutput {
    constructor() {
        super(...arguments);
        this._typeName = "SECPTransferOutput";
        this._typeID = constants_1.PlatformVMConstants.SECPXFEROUTPUTID;
    }
    //serialize and deserialize both are inherited
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
 * An [[Output]] class which specifies an input that has a locktime which can also enable staking of the value held, preventing transfers but not validation.
 */
class StakeableLockOut extends AmountOutput {
    /**
     * A [[Output]] class which specifies a [[ParseableOutput]] that has a locktime which can also enable staking of the value held, preventing transfers but not validation.
     *
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} representing the amount in the output
     * @param addresses An array of {@link https://github.com/feross/buffer|Buffer}s representing addresses
     * @param locktime A {@link https://github.com/indutny/bn.js/|BN} representing the locktime
     * @param threshold A number representing the the threshold number of signers required to sign the transaction
     * @param stakeableLocktime A {@link https://github.com/indutny/bn.js/|BN} representing the stakeable locktime
     * @param transferableOutput A [[ParseableOutput]] which is embedded into this output.
     */
    constructor(amount = undefined, addresses = undefined, locktime = undefined, threshold = undefined, stakeableLocktime = undefined, transferableOutput = undefined) {
        super(amount, addresses, locktime, threshold);
        this._typeName = "StakeableLockOut";
        this._typeID = constants_1.PlatformVMConstants.STAKEABLELOCKOUTID;
        if (typeof stakeableLocktime !== "undefined") {
            this.stakeableLocktime = bintools.fromBNToBuffer(stakeableLocktime, 8);
        }
        if (typeof transferableOutput !== "undefined") {
            this.transferableOutput = transferableOutput;
            this.synchronize();
        }
    }
    //serialize and deserialize both are inherited
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        let outobj = Object.assign(Object.assign({}, fields), { "stakeableLocktime": serialization.encoder(this.stakeableLocktime, encoding, "Buffer", "decimalString", 8), "transferableOutput": this.transferableOutput.serialize(encoding) });
        delete outobj["addresses"];
        delete outobj["locktime"];
        delete outobj["threshold"];
        delete outobj["amount"];
        return outobj;
    }
    ;
    deserialize(fields, encoding = "hex") {
        fields["addresses"] = [];
        fields["locktime"] = "0";
        fields["threshold"] = "1";
        fields["amount"] = "99";
        super.deserialize(fields, encoding);
        this.stakeableLocktime = serialization.decoder(fields["stakeableLocktime"], encoding, "decimalString", "Buffer", 8);
        this.transferableOutput = new ParseableOutput();
        this.transferableOutput.deserialize(fields["transferableOutput"], encoding);
        this.synchronize();
    }
    //call this every time you load in data
    synchronize() {
        let output = this.transferableOutput.getOutput();
        this.addresses = output.getAddresses().map((a) => {
            let addr = new output_1.Address();
            addr.fromBuffer(a);
            return addr;
        });
        this.numaddrs = buffer_1.Buffer.alloc(4);
        this.numaddrs.writeUInt32BE(this.addresses.length, 0);
        this.locktime = bintools.fromBNToBuffer(output.getLocktime(), 8);
        this.threshold = buffer_1.Buffer.alloc(4);
        this.threshold.writeUInt32BE(output.getThreshold(), 0);
        this.amount = bintools.fromBNToBuffer(output.getAmount(), 8);
        this.amountValue = output.getAmount();
    }
    getStakeableLocktime() {
        return bintools.fromBufferToBN(this.stakeableLocktime);
    }
    getTransferableOutput() {
        return this.transferableOutput;
    }
    /**
     * @param assetID An assetID which is wrapped around the Buffer of the Output
     */
    makeTransferable(assetID) {
        return new TransferableOutput(assetID, this);
    }
    select(id, ...args) {
        return exports.SelectOutputClass(id, ...args);
    }
    /**
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[StakeableLockOut]] and returns the size of the output.
     */
    fromBuffer(outbuff, offset = 0) {
        this.stakeableLocktime = bintools.copyFrom(outbuff, offset, offset + 8);
        offset += 8;
        this.transferableOutput = new ParseableOutput();
        offset = this.transferableOutput.fromBuffer(outbuff, offset);
        this.synchronize();
        return offset;
    }
    /**
     * Returns the buffer representing the [[StakeableLockOut]] instance.
     */
    toBuffer() {
        let xferoutBuff = this.transferableOutput.toBuffer();
        const bsize = this.stakeableLocktime.length + xferoutBuff.length;
        const barr = [this.stakeableLocktime, xferoutBuff];
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
     * Returns the outputID for this output
     */
    getOutputID() {
        return this._typeID;
    }
    create(...args) {
        return new StakeableLockOut(...args);
    }
    clone() {
        const newout = this.create();
        newout.fromBuffer(this.toBuffer());
        return newout;
    }
}
exports.StakeableLockOut = StakeableLockOut;
/**
 * An [[Output]] class which only specifies an Output ownership and uses secp256k1 signature scheme.
 */
class SECPOwnerOutput extends output_1.Output {
    constructor() {
        super(...arguments);
        this._typeName = "SECPOwnerOutput";
        this._typeID = constants_1.PlatformVMConstants.SECPOWNEROUTPUTID;
    }
    //serialize and deserialize both are inherited
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
        return new SECPOwnerOutput(...args);
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
exports.SECPOwnerOutput = SECPOwnerOutput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hcGlzL3BsYXRmb3Jtdm0vb3V0cHV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxvQ0FBaUM7QUFDakMsb0VBQTRDO0FBQzVDLDJDQUFrRDtBQUNsRCxnREFBaUk7QUFDakksNkRBQThFO0FBRTlFLCtDQUFtRDtBQUVuRCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWhFOzs7Ozs7R0FNRztBQUNVLFFBQUEsaUJBQWlCLEdBQUcsQ0FBQyxRQUFnQixFQUFFLEdBQUcsSUFBVyxFQUFVLEVBQUU7SUFDMUUsSUFBRyxRQUFRLElBQUksK0JBQW1CLENBQUMsZ0JBQWdCLEVBQUM7UUFDbEQsT0FBTyxJQUFJLGtCQUFrQixDQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDekM7U0FBTSxJQUFHLFFBQVEsSUFBSSwrQkFBbUIsQ0FBQyxpQkFBaUIsRUFBRTtRQUMzRCxPQUFPLElBQUksZUFBZSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDckM7U0FBTSxJQUFHLFFBQVEsSUFBSSwrQkFBbUIsQ0FBQyxrQkFBa0IsRUFBRTtRQUM1RCxPQUFPLElBQUksZ0JBQWdCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUN0QztJQUNELE1BQU0sSUFBSSxzQkFBYSxDQUFDLDhDQUE4QyxHQUFHLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZGLENBQUMsQ0FBQTtBQUVELE1BQWEsa0JBQW1CLFNBQVEsbUNBQTBCO0lBQWxFOztRQUNZLGNBQVMsR0FBRyxvQkFBb0IsQ0FBQztRQUNqQyxZQUFPLEdBQUcsU0FBUyxDQUFDO0lBbUJoQyxDQUFDO0lBakJDLHdCQUF3QjtJQUV4QixXQUFXLENBQUMsTUFBYSxFQUFFLFdBQThC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TUFBTSxDQUFDLEVBQVMsRUFBRSxHQUFHLElBQVc7UUFDOUIsT0FBTyx5QkFBaUIsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUN4QyxDQUFDO0NBQ0Y7QUFsQ0QsMENBa0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVBsYXRmb3JtVk0tT3V0cHV0c1xuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJztcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi8uLi91dGlscy9iaW50b29scyc7XG5pbXBvcnQgeyBQbGF0Zm9ybVZNQ29uc3RhbnRzIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgT3V0cHV0LCBTdGFuZGFyZEFtb3VudE91dHB1dCwgU3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXQsIFN0YW5kYXJkUGFyc2VhYmxlT3V0cHV0LCBBZGRyZXNzIH0gZnJvbSAnLi4vLi4vY29tbW9uL291dHB1dCc7XG5pbXBvcnQgeyBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tICcuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uJztcbmltcG9ydCBCTiBmcm9tICdibi5qcyc7XG5pbXBvcnQgeyBPdXRwdXRJZEVycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvZXJyb3JzJztcblxuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuXG4vKipcbiAqIFRha2VzIGEgYnVmZmVyIHJlcHJlc2VudGluZyB0aGUgb3V0cHV0IGFuZCByZXR1cm5zIHRoZSBwcm9wZXIgT3V0cHV0IGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSBvdXRwdXRpZCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIGlucHV0SUQgcGFyc2VkIHByaW9yIHRvIHRoZSBieXRlcyBwYXNzZWQgaW5cbiAqXG4gKiBAcmV0dXJucyBBbiBpbnN0YW5jZSBvZiBhbiBbW091dHB1dF1dLWV4dGVuZGVkIGNsYXNzLlxuICovXG5leHBvcnQgY29uc3QgU2VsZWN0T3V0cHV0Q2xhc3MgPSAob3V0cHV0aWQ6IG51bWJlciwgLi4uYXJnczogYW55W10pOiBPdXRwdXQgPT4ge1xuICAgIGlmKG91dHB1dGlkID09IFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUFhGRVJPVVRQVVRJRCl7XG4gICAgICByZXR1cm4gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dCggLi4uYXJncyk7XG4gICAgfSBlbHNlIGlmKG91dHB1dGlkID09IFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUE9XTkVST1VUUFVUSUQpIHtcbiAgICAgIHJldHVybiBuZXcgU0VDUE93bmVyT3V0cHV0KC4uLmFyZ3MpO1xuICAgIH0gZWxzZSBpZihvdXRwdXRpZCA9PSBQbGF0Zm9ybVZNQ29uc3RhbnRzLlNUQUtFQUJMRUxPQ0tPVVRJRCkge1xuICAgICAgcmV0dXJuIG5ldyBTdGFrZWFibGVMb2NrT3V0KC4uLmFyZ3MpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgT3V0cHV0SWRFcnJvcihcIkVycm9yIC0gU2VsZWN0T3V0cHV0Q2xhc3M6IHVua25vd24gb3V0cHV0aWQgXCIgKyBvdXRwdXRpZCk7XG59XG5cbmV4cG9ydCBjbGFzcyBUcmFuc2ZlcmFibGVPdXRwdXQgZXh0ZW5kcyBTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVHJhbnNmZXJhYmxlT3V0cHV0XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkO1xuXG4gIC8vc2VyaWFsaXplIGlzIGluaGVyaXRlZFxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLm91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKGZpZWxkc1tcIm91dHB1dFwiXVtcIl90eXBlSURcIl0pO1xuICAgIHRoaXMub3V0cHV0LmRlc2VyaWFsaXplKGZpZWxkc1tcIm91dHB1dFwiXSwgZW5jb2RpbmcpO1xuICB9XG5cbiAgZnJvbUJ1ZmZlcihieXRlczpCdWZmZXIsIG9mZnNldDpudW1iZXIgPSAwKTpudW1iZXIge1xuICAgIHRoaXMuYXNzZXRJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIFBsYXRmb3JtVk1Db25zdGFudHMuQVNTRVRJRExFTik7XG4gICAgb2Zmc2V0ICs9IFBsYXRmb3JtVk1Db25zdGFudHMuQVNTRVRJRExFTjtcbiAgICBjb25zdCBvdXRwdXRpZDpudW1iZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KS5yZWFkVUludDMyQkUoMCk7XG4gICAgb2Zmc2V0ICs9IDQ7XG4gICAgdGhpcy5vdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhvdXRwdXRpZCk7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0LmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gIH1cblxufVxuXG5leHBvcnQgY2xhc3MgUGFyc2VhYmxlT3V0cHV0IGV4dGVuZHMgU3RhbmRhcmRQYXJzZWFibGVPdXRwdXR7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlBhcnNlYWJsZU91dHB1dFwiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6b2JqZWN0LCBlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgdGhpcy5vdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhmaWVsZHNbXCJvdXRwdXRcIl1bXCJfdHlwZUlEXCJdKTtcbiAgICB0aGlzLm91dHB1dC5kZXNlcmlhbGl6ZShmaWVsZHNbXCJvdXRwdXRcIl0sIGVuY29kaW5nKTtcbiAgfVxuXG4gIGZyb21CdWZmZXIoYnl0ZXM6QnVmZmVyLCBvZmZzZXQ6bnVtYmVyID0gMCk6bnVtYmVyIHtcbiAgICBjb25zdCBvdXRwdXRpZDpudW1iZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KS5yZWFkVUludDMyQkUoMCk7XG4gICAgb2Zmc2V0ICs9IDQ7XG4gICAgdGhpcy5vdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhvdXRwdXRpZCk7XG4gICAgcmV0dXJuIHRoaXMub3V0cHV0LmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFtb3VudE91dHB1dCBleHRlbmRzIFN0YW5kYXJkQW1vdW50T3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiQW1vdW50T3V0cHV0XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkO1xuXG4gIC8vc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBib3RoIGFyZSBpbmhlcml0ZWRcblxuICAvKipcbiAgICogQHBhcmFtIGFzc2V0SUQgQW4gYXNzZXRJRCB3aGljaCBpcyB3cmFwcGVkIGFyb3VuZCB0aGUgQnVmZmVyIG9mIHRoZSBPdXRwdXRcbiAgICovXG4gIG1ha2VUcmFuc2ZlcmFibGUoYXNzZXRJRDpCdWZmZXIpOlRyYW5zZmVyYWJsZU91dHB1dCB7XG4gICAgcmV0dXJuIG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYXNzZXRJRCwgdGhpcyk7XG4gIH1cblxuICBzZWxlY3QoaWQ6bnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6T3V0cHV0IHtcbiAgICByZXR1cm4gU2VsZWN0T3V0cHV0Q2xhc3MoaWQsIC4uLmFyZ3MpO1xuICB9XG59XG5cbi8qKlxuICogQW4gW1tPdXRwdXRdXSBjbGFzcyB3aGljaCBzcGVjaWZpZXMgYW4gT3V0cHV0IHRoYXQgY2FycmllcyBhbiBhbW1vdW50IGZvciBhbiBhc3NldElEIGFuZCB1c2VzIHNlY3AyNTZrMSBzaWduYXR1cmUgc2NoZW1lLlxuICovXG5leHBvcnQgY2xhc3MgU0VDUFRyYW5zZmVyT3V0cHV0IGV4dGVuZHMgQW1vdW50T3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU0VDUFRyYW5zZmVyT3V0cHV0XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5TRUNQWEZFUk9VVFBVVElEO1xuXG4gIC8vc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBib3RoIGFyZSBpbmhlcml0ZWRcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgb3V0cHV0SUQgZm9yIHRoaXMgb3V0cHV0XG4gICAqL1xuICBnZXRPdXRwdXRJRCgpOm51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRDtcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOmFueVtdKTp0aGlze1xuICAgIHJldHVybiBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KC4uLmFyZ3MpIGFzIHRoaXM7XG4gIH1cblxuICBjbG9uZSgpOnRoaXMge1xuICAgIGNvbnN0IG5ld291dDpTRUNQVHJhbnNmZXJPdXRwdXQgPSB0aGlzLmNyZWF0ZSgpXG4gICAgbmV3b3V0LmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKTtcbiAgICByZXR1cm4gbmV3b3V0IGFzIHRoaXM7XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBbW091dHB1dF1dIGNsYXNzIHdoaWNoIHNwZWNpZmllcyBhbiBpbnB1dCB0aGF0IGhhcyBhIGxvY2t0aW1lIHdoaWNoIGNhbiBhbHNvIGVuYWJsZSBzdGFraW5nIG9mIHRoZSB2YWx1ZSBoZWxkLCBwcmV2ZW50aW5nIHRyYW5zZmVycyBidXQgbm90IHZhbGlkYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBTdGFrZWFibGVMb2NrT3V0IGV4dGVuZHMgQW1vdW50T3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU3Rha2VhYmxlTG9ja091dFwiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IFBsYXRmb3JtVk1Db25zdGFudHMuU1RBS0VBQkxFTE9DS09VVElEO1xuXG4gIC8vc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBib3RoIGFyZSBpbmhlcml0ZWRcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgbGV0IG91dG9iajpvYmplY3QgPSB7XG4gICAgICAuLi5maWVsZHMsIC8vaW5jbHVkZWQgYW55d2F5eXl5Li4uIG5vdCBpZGVhbFxuICAgICAgXCJzdGFrZWFibGVMb2NrdGltZVwiOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5zdGFrZWFibGVMb2NrdGltZSwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiZGVjaW1hbFN0cmluZ1wiLCA4KSxcbiAgICAgIFwidHJhbnNmZXJhYmxlT3V0cHV0XCI6IHRoaXMudHJhbnNmZXJhYmxlT3V0cHV0LnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICB9O1xuICAgIGRlbGV0ZSBvdXRvYmpbXCJhZGRyZXNzZXNcIl07XG4gICAgZGVsZXRlIG91dG9ialtcImxvY2t0aW1lXCJdO1xuICAgIGRlbGV0ZSBvdXRvYmpbXCJ0aHJlc2hvbGRcIl07XG4gICAgZGVsZXRlIG91dG9ialtcImFtb3VudFwiXTtcbiAgICByZXR1cm4gb3V0b2JqO1xuICB9O1xuICBkZXNlcmlhbGl6ZShmaWVsZHM6b2JqZWN0LCBlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgZmllbGRzW1wiYWRkcmVzc2VzXCJdID0gW107XG4gICAgZmllbGRzW1wibG9ja3RpbWVcIl0gPSBcIjBcIjtcbiAgICBmaWVsZHNbXCJ0aHJlc2hvbGRcIl0gPSAgXCIxXCI7XG4gICAgZmllbGRzW1wiYW1vdW50XCJdID0gXCI5OVwiO1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpO1xuICAgIHRoaXMuc3Rha2VhYmxlTG9ja3RpbWUgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wic3Rha2VhYmxlTG9ja3RpbWVcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJCdWZmZXJcIiwgOCk7XG4gICAgdGhpcy50cmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgUGFyc2VhYmxlT3V0cHV0KCk7XG4gICAgdGhpcy50cmFuc2ZlcmFibGVPdXRwdXQuZGVzZXJpYWxpemUoZmllbGRzW1widHJhbnNmZXJhYmxlT3V0cHV0XCJdLCBlbmNvZGluZyk7XG4gICAgdGhpcy5zeW5jaHJvbml6ZSgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIHN0YWtlYWJsZUxvY2t0aW1lOkJ1ZmZlcjtcbiAgcHJvdGVjdGVkIHRyYW5zZmVyYWJsZU91dHB1dDpQYXJzZWFibGVPdXRwdXQ7XG5cbiAgLy9jYWxsIHRoaXMgZXZlcnkgdGltZSB5b3UgbG9hZCBpbiBkYXRhXG4gIHByaXZhdGUgc3luY2hyb25pemUoKXtcbiAgICBsZXQgb3V0cHV0OkFtb3VudE91dHB1dCA9IHRoaXMudHJhbnNmZXJhYmxlT3V0cHV0LmdldE91dHB1dCgpIGFzIEFtb3VudE91dHB1dDtcbiAgICB0aGlzLmFkZHJlc3NlcyA9IG91dHB1dC5nZXRBZGRyZXNzZXMoKS5tYXAoKGEpID0+IHtcbiAgICAgIGxldCBhZGRyOkFkZHJlc3MgPSBuZXcgQWRkcmVzcygpO1xuICAgICAgYWRkci5mcm9tQnVmZmVyKGEpO1xuICAgICAgcmV0dXJuIGFkZHI7XG4gICAgfSk7XG4gICAgdGhpcy5udW1hZGRycyA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICB0aGlzLm51bWFkZHJzLndyaXRlVUludDMyQkUodGhpcy5hZGRyZXNzZXMubGVuZ3RoLCAwKTtcbiAgICB0aGlzLmxvY2t0aW1lID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIob3V0cHV0LmdldExvY2t0aW1lKCksIDgpO1xuICAgIHRoaXMudGhyZXNob2xkID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgIHRoaXMudGhyZXNob2xkLndyaXRlVUludDMyQkUob3V0cHV0LmdldFRocmVzaG9sZCgpLCAwKTtcbiAgICB0aGlzLmFtb3VudCA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG91dHB1dC5nZXRBbW91bnQoKSwgOCk7XG4gICAgdGhpcy5hbW91bnRWYWx1ZSA9IG91dHB1dC5nZXRBbW91bnQoKTtcbiAgfVxuXG4gIGdldFN0YWtlYWJsZUxvY2t0aW1lKCk6Qk4ge1xuICAgIHJldHVybiBiaW50b29scy5mcm9tQnVmZmVyVG9CTih0aGlzLnN0YWtlYWJsZUxvY2t0aW1lKTtcbiAgfVxuXG4gIGdldFRyYW5zZmVyYWJsZU91dHB1dCgpOlBhcnNlYWJsZU91dHB1dCB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNmZXJhYmxlT3V0cHV0O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBhc3NldElEIEFuIGFzc2V0SUQgd2hpY2ggaXMgd3JhcHBlZCBhcm91bmQgdGhlIEJ1ZmZlciBvZiB0aGUgT3V0cHV0XG4gICAqL1xuICBtYWtlVHJhbnNmZXJhYmxlKGFzc2V0SUQ6QnVmZmVyKTpUcmFuc2ZlcmFibGVPdXRwdXQge1xuICAgIHJldHVybiBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KGFzc2V0SUQsIHRoaXMpO1xuICB9XG5cbiAgc2VsZWN0KGlkOm51bWJlciwgLi4uYXJnczogYW55W10pOk91dHB1dCB7XG4gICAgcmV0dXJuIFNlbGVjdE91dHB1dENsYXNzKGlkLCAuLi5hcmdzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQb3B1YXRlcyB0aGUgaW5zdGFuY2UgZnJvbSBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgW1tTdGFrZWFibGVMb2NrT3V0XV0gYW5kIHJldHVybnMgdGhlIHNpemUgb2YgdGhlIG91dHB1dC5cbiAgICovXG4gIGZyb21CdWZmZXIob3V0YnVmZjpCdWZmZXIsIG9mZnNldDpudW1iZXIgPSAwKTpudW1iZXIge1xuICAgIHRoaXMuc3Rha2VhYmxlTG9ja3RpbWUgPSBiaW50b29scy5jb3B5RnJvbShvdXRidWZmLCBvZmZzZXQsIG9mZnNldCArIDgpO1xuICAgIG9mZnNldCArPSA4O1xuICAgIHRoaXMudHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFBhcnNlYWJsZU91dHB1dCgpO1xuICAgIG9mZnNldCA9IHRoaXMudHJhbnNmZXJhYmxlT3V0cHV0LmZyb21CdWZmZXIob3V0YnVmZiwgb2Zmc2V0KTtcbiAgICB0aGlzLnN5bmNocm9uaXplKCk7XG4gICAgcmV0dXJuIG9mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBidWZmZXIgcmVwcmVzZW50aW5nIHRoZSBbW1N0YWtlYWJsZUxvY2tPdXRdXSBpbnN0YW5jZS5cbiAgICovXG4gIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICBsZXQgeGZlcm91dEJ1ZmY6QnVmZmVyID0gdGhpcy50cmFuc2ZlcmFibGVPdXRwdXQudG9CdWZmZXIoKTtcbiAgICBjb25zdCBic2l6ZTpudW1iZXIgPSB0aGlzLnN0YWtlYWJsZUxvY2t0aW1lLmxlbmd0aCArIHhmZXJvdXRCdWZmLmxlbmd0aDtcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFt0aGlzLnN0YWtlYWJsZUxvY2t0aW1lLCB4ZmVyb3V0QnVmZl07XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG91dHB1dElEIGZvciB0aGlzIG91dHB1dFxuICAgKi9cbiAgZ2V0T3V0cHV0SUQoKTpudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSUQ7XG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczphbnlbXSk6dGhpc3tcbiAgICByZXR1cm4gbmV3IFN0YWtlYWJsZUxvY2tPdXQoLi4uYXJncykgYXMgdGhpcztcbiAgfVxuXG4gIGNsb25lKCk6dGhpcyB7XG4gICAgY29uc3QgbmV3b3V0OlN0YWtlYWJsZUxvY2tPdXQgPSB0aGlzLmNyZWF0ZSgpXG4gICAgbmV3b3V0LmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKTtcbiAgICByZXR1cm4gbmV3b3V0IGFzIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQSBbW091dHB1dF1dIGNsYXNzIHdoaWNoIHNwZWNpZmllcyBhIFtbUGFyc2VhYmxlT3V0cHV0XV0gdGhhdCBoYXMgYSBsb2NrdGltZSB3aGljaCBjYW4gYWxzbyBlbmFibGUgc3Rha2luZyBvZiB0aGUgdmFsdWUgaGVsZCwgcHJldmVudGluZyB0cmFuc2ZlcnMgYnV0IG5vdCB2YWxpZGF0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gYW1vdW50IEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gcmVwcmVzZW50aW5nIHRoZSBhbW91bnQgaW4gdGhlIG91dHB1dFxuICAgKiBAcGFyYW0gYWRkcmVzc2VzIEFuIGFycmF5IG9mIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9cyByZXByZXNlbnRpbmcgYWRkcmVzc2VzXG4gICAqIEBwYXJhbSBsb2NrdGltZSBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHJlcHJlc2VudGluZyB0aGUgbG9ja3RpbWVcbiAgICogQHBhcmFtIHRocmVzaG9sZCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIHRoZSB0aHJlc2hvbGQgbnVtYmVyIG9mIHNpZ25lcnMgcmVxdWlyZWQgdG8gc2lnbiB0aGUgdHJhbnNhY3Rpb25cbiAgICogQHBhcmFtIHN0YWtlYWJsZUxvY2t0aW1lIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gcmVwcmVzZW50aW5nIHRoZSBzdGFrZWFibGUgbG9ja3RpbWVcbiAgICogQHBhcmFtIHRyYW5zZmVyYWJsZU91dHB1dCBBIFtbUGFyc2VhYmxlT3V0cHV0XV0gd2hpY2ggaXMgZW1iZWRkZWQgaW50byB0aGlzIG91dHB1dC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtb3VudDogQk4gPSB1bmRlZmluZWQsIGFkZHJlc3NlczogQnVmZmVyW10gPSB1bmRlZmluZWQsIGxvY2t0aW1lOiBCTiA9IHVuZGVmaW5lZCwgdGhyZXNob2xkOiBudW1iZXIgPSB1bmRlZmluZWQsIHN0YWtlYWJsZUxvY2t0aW1lOiBCTiA9IHVuZGVmaW5lZCwgdHJhbnNmZXJhYmxlT3V0cHV0OiBQYXJzZWFibGVPdXRwdXQgPSB1bmRlZmluZWQpIHtcbiAgICBzdXBlcihhbW91bnQsIGFkZHJlc3NlcywgbG9ja3RpbWUsIHRocmVzaG9sZCk7XG4gICAgaWYgKHR5cGVvZiBzdGFrZWFibGVMb2NrdGltZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5zdGFrZWFibGVMb2NrdGltZSA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKHN0YWtlYWJsZUxvY2t0aW1lLCA4KTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0cmFuc2ZlcmFibGVPdXRwdXQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMudHJhbnNmZXJhYmxlT3V0cHV0ID0gdHJhbnNmZXJhYmxlT3V0cHV0O1xuICAgICAgdGhpcy5zeW5jaHJvbml6ZSgpO1xuICAgIH1cbiAgfVxufVxuXG5cbi8qKlxuICogQW4gW1tPdXRwdXRdXSBjbGFzcyB3aGljaCBvbmx5IHNwZWNpZmllcyBhbiBPdXRwdXQgb3duZXJzaGlwIGFuZCB1c2VzIHNlY3AyNTZrMSBzaWduYXR1cmUgc2NoZW1lLlxuICovXG5leHBvcnQgY2xhc3MgU0VDUE93bmVyT3V0cHV0IGV4dGVuZHMgT3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU0VDUE93bmVyT3V0cHV0XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5TRUNQT1dORVJPVVRQVVRJRDtcblxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIG91dHB1dElEIGZvciB0aGlzIG91dHB1dFxuICAgKi9cbiAgZ2V0T3V0cHV0SUQoKTpudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSUQ7XG4gIH1cblxuICAvKipcbiAgICogXG4gICAqIEBwYXJhbSBhc3NldElEIEFuIGFzc2V0SUQgd2hpY2ggaXMgd3JhcHBlZCBhcm91bmQgdGhlIEJ1ZmZlciBvZiB0aGUgT3V0cHV0XG4gICAqL1xuICBtYWtlVHJhbnNmZXJhYmxlKGFzc2V0SUQ6QnVmZmVyKTpUcmFuc2ZlcmFibGVPdXRwdXQge1xuICAgIHJldHVybiBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KGFzc2V0SUQsIHRoaXMpO1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6YW55W10pOnRoaXN7XG4gICAgcmV0dXJuIG5ldyBTRUNQT3duZXJPdXRwdXQoLi4uYXJncykgYXMgdGhpcztcbiAgfVxuXG4gIGNsb25lKCk6dGhpcyB7XG4gICAgY29uc3QgbmV3b3V0OlNFQ1BPd25lck91dHB1dCA9IHRoaXMuY3JlYXRlKClcbiAgICBuZXdvdXQuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpO1xuICAgIHJldHVybiBuZXdvdXQgYXMgdGhpcztcbiAgfVxuXG4gIHNlbGVjdChpZDpudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTpPdXRwdXQge1xuICAgIHJldHVybiBTZWxlY3RPdXRwdXRDbGFzcyhpZCwgLi4uYXJncyk7XG4gIH1cbn0iXX0=