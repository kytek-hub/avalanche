"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVMOutput = exports.SECPTransferOutput = exports.AmountOutput = exports.TransferableOutput = exports.SelectOutputClass = void 0;
/**
 * @packageDocumentation
 * @module API-EVM-Outputs
 */
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const output_1 = require("../../common/output");
const errors_1 = require("../../utils/errors");
const bintools = bintools_1.default.getInstance();
/**
 * Takes a buffer representing the output and returns the proper Output instance.
 *
 * @param outputID A number representing the outputID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Output]]-extended class.
 */
exports.SelectOutputClass = (outputID, ...args) => {
    if (outputID == constants_1.EVMConstants.SECPXFEROUTPUTID) {
        return new SECPTransferOutput(...args);
    }
    throw new errors_1.OutputIdError("Error - SelectOutputClass: unknown outputID");
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
        this.assetID = bintools.copyFrom(bytes, offset, offset + constants_1.EVMConstants.ASSETIDLEN);
        offset += constants_1.EVMConstants.ASSETIDLEN;
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
/**
 * An [[Output]] class which specifies an Output that carries an ammount for an assetID and uses secp256k1 signature scheme.
 */
class SECPTransferOutput extends AmountOutput {
    constructor() {
        super(...arguments);
        this._typeName = "SECPTransferOutput";
        this._typeID = constants_1.EVMConstants.SECPXFEROUTPUTID;
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
class EVMOutput {
    /**
     * An [[EVMOutput]] class which contains address, amount, and assetID.
     *
     * @param address The address recieving the asset as a {@link https://github.com/feross/buffer|Buffer} or a string.
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} or number representing the amount.
     * @param assetID The assetID which is being sent as a {@link https://github.com/feross/buffer|Buffer} or a string.
     */
    constructor(address = undefined, amount = undefined, assetID = undefined) {
        this.address = buffer_1.Buffer.alloc(20);
        this.amount = buffer_1.Buffer.alloc(8);
        this.amountValue = new bn_js_1.default(0);
        this.assetID = buffer_1.Buffer.alloc(32);
        /**
         * Returns the address of the input as {@link https://github.com/feross/buffer|Buffer}
         */
        this.getAddress = () => this.address;
        /**
         * Returns the address as a bech32 encoded string.
         */
        this.getAddressString = () => this.address.toString('hex');
        /**
         * Returns the amount as a {@link https://github.com/indutny/bn.js/|BN}.
         */
        this.getAmount = () => this.amountValue.clone();
        /**
         * Returns the assetID of the input as {@link https://github.com/feross/buffer|Buffer}
         */
        this.getAssetID = () => this.assetID;
        if (typeof address !== 'undefined' && typeof amount !== 'undefined' && typeof assetID !== 'undefined') {
            if (typeof address === 'string') {
                // if present then remove `0x` prefix
                let prefix = address.substring(0, 2);
                if (prefix === '0x') {
                    address = address.split('x')[1];
                }
                address = buffer_1.Buffer.from(address, 'hex');
            }
            // convert number amount to BN
            let amnt;
            if (typeof amount === 'number') {
                amnt = new bn_js_1.default(amount);
            }
            else {
                amnt = amount;
            }
            // convert string assetID to Buffer
            if (!(assetID instanceof buffer_1.Buffer)) {
                assetID = bintools.cb58Decode(assetID);
            }
            this.address = address;
            this.amountValue = amnt.clone();
            this.amount = bintools.fromBNToBuffer(amnt, 8);
            this.assetID = assetID;
        }
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[EVMOutput]].
     */
    toBuffer() {
        const bsize = this.address.length + this.amount.length + this.assetID.length;
        const barr = [this.address, this.amount, this.assetID];
        const buff = buffer_1.Buffer.concat(barr, bsize);
        return buff;
    }
    /**
     * Decodes the [[EVMOutput]] as a {@link https://github.com/feross/buffer|Buffer} and returns the size.
     */
    fromBuffer(bytes, offset = 0) {
        this.address = bintools.copyFrom(bytes, offset, offset + 20);
        offset += 20;
        this.amount = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.assetID = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        return offset;
    }
    /**
     * Returns a base-58 representation of the [[EVMOutput]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
    create(...args) {
        return new EVMOutput(...args);
    }
    clone() {
        const newEVMOutput = this.create();
        newEVMOutput.fromBuffer(this.toBuffer());
        return newEVMOutput;
    }
}
exports.EVMOutput = EVMOutput;
/**
* Returns a function used to sort an array of [[EVMOutput]]s
*/
EVMOutput.comparator = () => (a, b) => {
    // primarily sort by address
    let sorta = a.getAddress();
    let sortb = b.getAddress();
    // secondarily sort by assetID
    if (sorta.equals(sortb)) {
        sorta = a.getAssetID();
        sortb = b.getAssetID();
    }
    return buffer_1.Buffer.compare(sorta, sortb);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hcGlzL2V2bS9vdXRwdXRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFpQztBQUNqQyxrREFBdUI7QUFDdkIsb0VBQTRDO0FBQzVDLDJDQUEyQztBQUMzQyxnREFBK0Y7QUFHL0YsK0NBQW1EO0FBRW5ELE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUM7QUFFbEQ7Ozs7OztHQU1HO0FBQ1UsUUFBQSxpQkFBaUIsR0FBRyxDQUFDLFFBQWdCLEVBQUUsR0FBRyxJQUFXLEVBQVUsRUFBRTtJQUM1RSxJQUFHLFFBQVEsSUFBSSx3QkFBWSxDQUFDLGdCQUFnQixFQUFDO1FBQzNDLE9BQU8sSUFBSSxrQkFBa0IsQ0FBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQ3pDO0lBQ0QsTUFBTSxJQUFJLHNCQUFhLENBQUMsNkNBQTZDLENBQUMsQ0FBQztBQUN6RSxDQUFDLENBQUE7QUFFRCxNQUFhLGtCQUFtQixTQUFRLG1DQUEwQjtJQUFsRTs7UUFDWSxjQUFTLEdBQUcsb0JBQW9CLENBQUM7UUFDakMsWUFBTyxHQUFHLFNBQVMsQ0FBQztJQWtCaEMsQ0FBQztJQWhCQyx3QkFBd0I7SUFFeEIsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxNQUFNLEdBQUcseUJBQWlCLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDN0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3RELENBQUM7SUFFRCxVQUFVLENBQUMsS0FBYSxFQUFFLFNBQWlCLENB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LEVBQUUsQ0FBQztRQUM5QyxZQUFZLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sWUFBb0IsQ0FBQztJQUM5QixDQUFDOztBQS9FSCw4QkEwSEM7QUFwSEM7O0VBRUU7QUFDSyxvQkFBVSxHQUFHLEdBQW1FLEVBQUUsQ0FBQyxDQUFDLENBQXVCLEVBQUUsQ0FBdUIsRUFBWSxFQUFFO0lBQ3ZKLDRCQUE0QjtJQUM1QixJQUFJLEtBQUssR0FBVyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDbkMsSUFBSSxLQUFLLEdBQVcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ25DLDhCQUE4QjtJQUM5QixJQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDdEIsS0FBSyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUN2QixLQUFLLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0tBQ3hCO0lBQ0QsT0FBTyxlQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQWEsQ0FBQztBQUNsRCxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktRVZNLU91dHB1dHNcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLyc7XG5pbXBvcnQgQk4gZnJvbSAnYm4uanMnO1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uLy4uL3V0aWxzL2JpbnRvb2xzJztcbmltcG9ydCB7IEVWTUNvbnN0YW50cyB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IE91dHB1dCwgU3RhbmRhcmRBbW91bnRPdXRwdXQsIFN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0IH0gZnJvbSAnLi4vLi4vY29tbW9uL291dHB1dCc7XG5pbXBvcnQgeyBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tICcuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uJztcbmltcG9ydCB7IEVWTUlucHV0IH0gZnJvbSAnLi9pbnB1dHMnO1xuaW1wb3J0IHsgT3V0cHV0SWRFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzL2Vycm9ycyc7XG5cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKCk7XG5cbi8qKlxuICogVGFrZXMgYSBidWZmZXIgcmVwcmVzZW50aW5nIHRoZSBvdXRwdXQgYW5kIHJldHVybnMgdGhlIHByb3BlciBPdXRwdXQgaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIG91dHB1dElEIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgb3V0cHV0SUQgcGFyc2VkIHByaW9yIHRvIHRoZSBieXRlcyBwYXNzZWQgaW5cbiAqXG4gKiBAcmV0dXJucyBBbiBpbnN0YW5jZSBvZiBhbiBbW091dHB1dF1dLWV4dGVuZGVkIGNsYXNzLlxuICovXG5leHBvcnQgY29uc3QgU2VsZWN0T3V0cHV0Q2xhc3MgPSAob3V0cHV0SUQ6IG51bWJlciwgLi4uYXJnczogYW55W10pOiBPdXRwdXQgPT4ge1xuICBpZihvdXRwdXRJRCA9PSBFVk1Db25zdGFudHMuU0VDUFhGRVJPVVRQVVRJRCl7XG4gICAgcmV0dXJuIG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQoIC4uLmFyZ3MpO1xuICB9XG4gIHRocm93IG5ldyBPdXRwdXRJZEVycm9yKFwiRXJyb3IgLSBTZWxlY3RPdXRwdXRDbGFzczogdW5rbm93biBvdXRwdXRJRFwiKTtcbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zZmVyYWJsZU91dHB1dCBleHRlbmRzIFN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0e1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJUcmFuc2ZlcmFibGVPdXRwdXRcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgdGhpcy5vdXRwdXQgPSBTZWxlY3RPdXRwdXRDbGFzcyhmaWVsZHNbXCJvdXRwdXRcIl1bXCJfdHlwZUlEXCJdKTtcbiAgICB0aGlzLm91dHB1dC5kZXNlcmlhbGl6ZShmaWVsZHNbXCJvdXRwdXRcIl0sIGVuY29kaW5nKTtcbiAgfVxuXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICB0aGlzLmFzc2V0SUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyBFVk1Db25zdGFudHMuQVNTRVRJRExFTik7XG4gICAgb2Zmc2V0ICs9IEVWTUNvbnN0YW50cy5BU1NFVElETEVOO1xuICAgIGNvbnN0IG91dHB1dGlkOm51bWJlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpLnJlYWRVSW50MzJCRSgwKTtcbiAgICBvZmZzZXQgKz0gNDtcbiAgICB0aGlzLm91dHB1dCA9IFNlbGVjdE91dHB1dENsYXNzKG91dHB1dGlkKTtcbiAgICByZXR1cm4gdGhpcy5vdXRwdXQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQW1vdW50T3V0cHV0IGV4dGVuZHMgU3RhbmRhcmRBbW91bnRPdXRwdXQge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJBbW91bnRPdXRwdXRcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuICBcbiAgLyoqXG4gICAqIFxuICAgKiBAcGFyYW0gYXNzZXRJRCBBbiBhc3NldElEIHdoaWNoIGlzIHdyYXBwZWQgYXJvdW5kIHRoZSBCdWZmZXIgb2YgdGhlIE91dHB1dFxuICAgKi9cbiAgbWFrZVRyYW5zZmVyYWJsZShhc3NldElEOiBCdWZmZXIpOiBUcmFuc2ZlcmFibGVPdXRwdXQge1xuICAgIHJldHVybiBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KGFzc2V0SUQsIHRoaXMpO1xuICB9XG5cbiAgc2VsZWN0KGlkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogT3V0cHV0IHtcbiAgICByZXR1cm4gU2VsZWN0T3V0cHV0Q2xhc3MoaWQsIC4uLmFyZ3MpO1xuICB9XG59XG5cbi8qKlxuICogQW4gW1tPdXRwdXRdXSBjbGFzcyB3aGljaCBzcGVjaWZpZXMgYW4gT3V0cHV0IHRoYXQgY2FycmllcyBhbiBhbW1vdW50IGZvciBhbiBhc3NldElEIGFuZCB1c2VzIHNlY3AyNTZrMSBzaWduYXR1cmUgc2NoZW1lLlxuICovXG5leHBvcnQgY2xhc3MgU0VDUFRyYW5zZmVyT3V0cHV0IGV4dGVuZHMgQW1vdW50T3V0cHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU0VDUFRyYW5zZmVyT3V0cHV0XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gRVZNQ29uc3RhbnRzLlNFQ1BYRkVST1VUUFVUSUQ7XG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG91dHB1dElEIGZvciB0aGlzIG91dHB1dFxuICAgICAqL1xuICBnZXRPdXRwdXRJRCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSUQ7XG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlze1xuICAgIHJldHVybiBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KC4uLmFyZ3MpIGFzIHRoaXM7XG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdvdXQ6IFNFQ1BUcmFuc2Zlck91dHB1dCA9IHRoaXMuY3JlYXRlKClcbiAgICBuZXdvdXQuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpO1xuICAgIHJldHVybiBuZXdvdXQgYXMgdGhpcztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRVZNT3V0cHV0IHtcbiAgcHJvdGVjdGVkIGFkZHJlc3M6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygyMCk7IFxuICBwcm90ZWN0ZWQgYW1vdW50OiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoOCk7XG4gIHByb3RlY3RlZCBhbW91bnRWYWx1ZTogQk4gPSBuZXcgQk4oMCk7XG4gIHByb3RlY3RlZCBhc3NldElEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIpO1xuXG4gIC8qKlxuICAqIFJldHVybnMgYSBmdW5jdGlvbiB1c2VkIHRvIHNvcnQgYW4gYXJyYXkgb2YgW1tFVk1PdXRwdXRdXXNcbiAgKi9cbiAgc3RhdGljIGNvbXBhcmF0b3IgPSAoKTogKGE6IEVWTU91dHB1dCB8IEVWTUlucHV0LCBiOiBFVk1PdXRwdXQgfCBFVk1JbnB1dCkgPT4gKDF8LTF8MCkgPT4gKGE6IEVWTU91dHB1dCB8IEVWTUlucHV0LCBiOiBFVk1PdXRwdXQgfCBFVk1JbnB1dCk6ICgxfC0xfDApID0+IHtcbiAgICAvLyBwcmltYXJpbHkgc29ydCBieSBhZGRyZXNzXG4gICAgbGV0IHNvcnRhOiBCdWZmZXIgPSBhLmdldEFkZHJlc3MoKTtcbiAgICBsZXQgc29ydGI6IEJ1ZmZlciA9IGIuZ2V0QWRkcmVzcygpO1xuICAgIC8vIHNlY29uZGFyaWx5IHNvcnQgYnkgYXNzZXRJRFxuICAgIGlmKHNvcnRhLmVxdWFscyhzb3J0YikpIHtcbiAgICAgIHNvcnRhID0gYS5nZXRBc3NldElEKCk7XG4gICAgICBzb3J0YiA9IGIuZ2V0QXNzZXRJRCgpO1xuICAgIH1cbiAgICByZXR1cm4gQnVmZmVyLmNvbXBhcmUoc29ydGEsIHNvcnRiKSBhcyAoMXwtMXwwKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhZGRyZXNzIG9mIHRoZSBpbnB1dCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKi9cbiAgZ2V0QWRkcmVzcyA9ICgpOiBCdWZmZXIgPT4gdGhpcy5hZGRyZXNzO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhZGRyZXNzIGFzIGEgYmVjaDMyIGVuY29kZWQgc3RyaW5nLlxuICAgKi9cbiAgZ2V0QWRkcmVzc1N0cmluZyA9ICgpOiBzdHJpbmcgPT4gdGhpcy5hZGRyZXNzLnRvU3RyaW5nKCdoZXgnKTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYW1vdW50IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0uXG4gICAqL1xuICBnZXRBbW91bnQgPSAoKTogQk4gPT4gdGhpcy5hbW91bnRWYWx1ZS5jbG9uZSgpO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhc3NldElEIG9mIHRoZSBpbnB1dCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKi8gXG4gIGdldEFzc2V0SUQgPSAoKTogQnVmZmVyID0+IHRoaXMuYXNzZXRJRDtcbiBcbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tFVk1PdXRwdXRdXS5cbiAgICovXG4gIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICBjb25zdCBic2l6ZTogbnVtYmVyID0gdGhpcy5hZGRyZXNzLmxlbmd0aCArIHRoaXMuYW1vdW50Lmxlbmd0aCArIHRoaXMuYXNzZXRJRC5sZW5ndGg7XG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbdGhpcy5hZGRyZXNzLCB0aGlzLmFtb3VudCwgdGhpcy5hc3NldElEXTtcbiAgICBjb25zdCBidWZmOiBCdWZmZXIgPSBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKTtcbiAgICByZXR1cm4gYnVmZjtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNvZGVzIHRoZSBbW0VWTU91dHB1dF1dIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gYW5kIHJldHVybnMgdGhlIHNpemUuXG4gICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgdGhpcy5hZGRyZXNzID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMjApO1xuICAgIG9mZnNldCArPSAyMDtcbiAgICB0aGlzLmFtb3VudCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDgpO1xuICAgIG9mZnNldCArPSA4O1xuICAgIHRoaXMuYXNzZXRJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKTtcbiAgICBvZmZzZXQgKz0gMzI7XG4gICAgcmV0dXJuIG9mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tFVk1PdXRwdXRdXS5cbiAgICovXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmJ1ZmZlclRvQjU4KHRoaXMudG9CdWZmZXIoKSk7XG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlze1xuICAgIHJldHVybiBuZXcgRVZNT3V0cHV0KC4uLmFyZ3MpIGFzIHRoaXM7XG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdFVk1PdXRwdXQ6IEVWTU91dHB1dCA9IHRoaXMuY3JlYXRlKCk7XG4gICAgbmV3RVZNT3V0cHV0LmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKTtcbiAgICByZXR1cm4gbmV3RVZNT3V0cHV0IGFzIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQW4gW1tFVk1PdXRwdXRdXSBjbGFzcyB3aGljaCBjb250YWlucyBhZGRyZXNzLCBhbW91bnQsIGFuZCBhc3NldElELlxuICAgKlxuICAgKiBAcGFyYW0gYWRkcmVzcyBUaGUgYWRkcmVzcyByZWNpZXZpbmcgdGhlIGFzc2V0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb3IgYSBzdHJpbmcuXG4gICAqIEBwYXJhbSBhbW91bnQgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBvciBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBhbW91bnQuXG4gICAqIEBwYXJhbSBhc3NldElEIFRoZSBhc3NldElEIHdoaWNoIGlzIGJlaW5nIHNlbnQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBhIHN0cmluZy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFkZHJlc3M6IEJ1ZmZlciB8IHN0cmluZyA9IHVuZGVmaW5lZCwgXG4gICAgYW1vdW50OiBCTiB8IG51bWJlciA9IHVuZGVmaW5lZCwgXG4gICAgYXNzZXRJRDogQnVmZmVyIHwgc3RyaW5nID0gdW5kZWZpbmVkXG4gICkge1xuICAgIGlmICh0eXBlb2YgYWRkcmVzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGFtb3VudCAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGFzc2V0SUQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBpZih0eXBlb2YgYWRkcmVzcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgLy8gaWYgcHJlc2VudCB0aGVuIHJlbW92ZSBgMHhgIHByZWZpeFxuICAgICAgICBsZXQgcHJlZml4OiBzdHJpbmcgPSBhZGRyZXNzLnN1YnN0cmluZygwLCAyKTtcbiAgICAgICAgaWYocHJlZml4ID09PSAnMHgnKSB7XG4gICAgICAgICAgYWRkcmVzcyA9IGFkZHJlc3Muc3BsaXQoJ3gnKVsxXTtcbiAgICAgICAgfVxuICAgICAgICBhZGRyZXNzID0gQnVmZmVyLmZyb20oYWRkcmVzcywgJ2hleCcpO1xuICAgICAgfVxuXG4gICAgICAvLyBjb252ZXJ0IG51bWJlciBhbW91bnQgdG8gQk5cbiAgICAgIGxldCBhbW50OiBCTjtcbiAgICAgIGlmICh0eXBlb2YgYW1vdW50ID09PSAnbnVtYmVyJykge1xuICAgICAgICBhbW50ID0gbmV3IEJOKGFtb3VudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhbW50ID0gYW1vdW50O1xuICAgICAgfVxuXG4gICAgICAvLyBjb252ZXJ0IHN0cmluZyBhc3NldElEIHRvIEJ1ZmZlclxuICAgICAgaWYoIShhc3NldElEIGluc3RhbmNlb2YgQnVmZmVyKSkge1xuICAgICAgICBhc3NldElEID0gYmludG9vbHMuY2I1OERlY29kZShhc3NldElEKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hZGRyZXNzID0gYWRkcmVzcztcbiAgICAgIHRoaXMuYW1vdW50VmFsdWUgPSBhbW50LmNsb25lKCk7XG4gICAgICB0aGlzLmFtb3VudCA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKGFtbnQsIDgpO1xuICAgICAgdGhpcy5hc3NldElEID0gYXNzZXRJRDtcbiAgICB9XG4gIH1cbn0gICJdfQ==