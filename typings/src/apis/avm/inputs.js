"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECPTransferInput = exports.AmountInput = exports.TransferableInput = exports.SelectInputClass = void 0;
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const input_1 = require("../../common/input");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Takes a buffer representing the output and returns the proper [[Input]] instance.
 *
 * @param inputid A number representing the inputID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Input]]-extended class.
 */
exports.SelectInputClass = (inputid, ...args) => {
    if (inputid === constants_1.AVMConstants.SECPINPUTID || inputid === constants_1.AVMConstants.SECPINPUTID_CODECONE) {
        return new SECPTransferInput(...args);
    }
    /* istanbul ignore next */
    throw new errors_1.InputIdError("Error - SelectInputClass: unknown inputid");
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
        this.assetID = bintools.copyFrom(bytes, offset, offset + constants_1.AVMConstants.ASSETIDLEN);
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
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.SECPINPUTID : constants_1.AVMConstants.SECPINPUTID_CODECONE;
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
            throw new errors_1.CodecIdError("Error - SECPTransferInput.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.SECPINPUTID : constants_1.AVMConstants.SECPINPUTID_CODECONE;
    }
    /**
       * Returns the inputID for this input
       */
    getInputID() {
        return this._typeID;
    }
    getCredentialID() {
        if (this._codecID === 0) {
            return constants_1.AVMConstants.SECPCREDENTIAL;
        }
        else if (this._codecID === 1) {
            return constants_1.AVMConstants.SECPCREDENTIAL_CODECONE;
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvYXZtL2lucHV0cy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFLQSxvRUFBMkM7QUFDM0MsMkNBQTBDO0FBQzFDLDhDQUEwRjtBQUUxRiwrQ0FBK0Q7QUFFL0Q7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWpEOzs7Ozs7R0FNRztBQUNVLFFBQUEsZ0JBQWdCLEdBQUcsQ0FBQyxPQUFlLEVBQUUsR0FBRyxJQUFXLEVBQVMsRUFBRTtJQUN6RSxJQUFJLE9BQU8sS0FBSyx3QkFBWSxDQUFDLFdBQVcsSUFBSSxPQUFPLEtBQUssd0JBQVksQ0FBQyxvQkFBb0IsRUFBRTtRQUN6RixPQUFPLElBQUksaUJBQWlCLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUN0QztJQUNELDBCQUEwQjtJQUMxQixNQUFNLElBQUkscUJBQVksQ0FBQywyQ0FBMkMsQ0FBQyxDQUFBO0FBQ3JFLENBQUMsQ0FBQTtBQUVELE1BQWEsaUJBQWtCLFNBQVEsaUNBQXlCO0lBQWhFOztRQUNZLGNBQVMsR0FBRyxtQkFBbUIsQ0FBQTtRQUMvQixZQUFPLEdBQUcsU0FBUyxDQUFBO0lBOEIvQixDQUFDO0lBNUJDLHdCQUF3QjtJQUV4QixXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDbkMsSUFBSSxDQUFDLEtBQUssR0FBRyx3QkFBZ0IsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtRQUN6RCxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDbkQsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNI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QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDL0MsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtRQUNsQyxPQUFPLE1BQWMsQ0FBQTtJQUN2QixDQUFDO0NBQ0Y7QUE3Q0QsOENBNkNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLUFWTS1JbnB1dHNcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLydcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi8uLi91dGlscy9iaW50b29scydcbmltcG9ydCB7IEFWTUNvbnN0YW50cyB9IGZyb20gJy4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgSW5wdXQsIFN0YW5kYXJkVHJhbnNmZXJhYmxlSW5wdXQsIFN0YW5kYXJkQW1vdW50SW5wdXQgfSBmcm9tICcuLi8uLi9jb21tb24vaW5wdXQnXG5pbXBvcnQgeyBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tICcuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uJ1xuaW1wb3J0IHsgSW5wdXRJZEVycm9yLCBDb2RlY0lkRXJyb3IgfSBmcm9tICcuLi8uLi91dGlscy9lcnJvcnMnXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogVGFrZXMgYSBidWZmZXIgcmVwcmVzZW50aW5nIHRoZSBvdXRwdXQgYW5kIHJldHVybnMgdGhlIHByb3BlciBbW0lucHV0XV0gaW5zdGFuY2UuXG4gKlxuICogQHBhcmFtIGlucHV0aWQgQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBpbnB1dElEIHBhcnNlZCBwcmlvciB0byB0aGUgYnl0ZXMgcGFzc2VkIGluXG4gKlxuICogQHJldHVybnMgQW4gaW5zdGFuY2Ugb2YgYW4gW1tJbnB1dF1dLWV4dGVuZGVkIGNsYXNzLlxuICovXG5leHBvcnQgY29uc3QgU2VsZWN0SW5wdXRDbGFzcyA9IChpbnB1dGlkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogSW5wdXQgPT4ge1xuICBpZiAoaW5wdXRpZCA9PT0gQVZNQ29uc3RhbnRzLlNFQ1BJTlBVVElEIHx8IGlucHV0aWQgPT09IEFWTUNvbnN0YW50cy5TRUNQSU5QVVRJRF9DT0RFQ09ORSkge1xuICAgIHJldHVybiBuZXcgU0VDUFRyYW5zZmVySW5wdXQoLi4uYXJncylcbiAgfVxuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICB0aHJvdyBuZXcgSW5wdXRJZEVycm9yKFwiRXJyb3IgLSBTZWxlY3RJbnB1dENsYXNzOiB1bmtub3duIGlucHV0aWRcIilcbn1cblxuZXhwb3J0IGNsYXNzIFRyYW5zZmVyYWJsZUlucHV0IGV4dGVuZHMgU3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlRyYW5zZmVyYWJsZUlucHV0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMuaW5wdXQgPSBTZWxlY3RJbnB1dENsYXNzKGZpZWxkc1tcImlucHV0XCJdW1wiX3R5cGVJRFwiXSlcbiAgICB0aGlzLmlucHV0LmRlc2VyaWFsaXplKGZpZWxkc1tcImlucHV0XCJdLCBlbmNvZGluZylcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYSBbW1RyYW5zZmVyYWJsZUlucHV0XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbVHJhbnNmZXJhYmxlSW5wdXRdXVxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tUcmFuc2ZlcmFibGVJbnB1dF1dXG4gICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgdGhpcy50eGlkID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMzIpXG4gICAgb2Zmc2V0ICs9IDMyXG4gICAgdGhpcy5vdXRwdXRpZHggPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5hc3NldElEID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgQVZNQ29uc3RhbnRzLkFTU0VUSURMRU4pXG4gICAgb2Zmc2V0ICs9IDMyXG4gICAgY29uc3QgaW5wdXRpZDogbnVtYmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCkucmVhZFVJbnQzMkJFKDApXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLmlucHV0ID0gU2VsZWN0SW5wdXRDbGFzcyhpbnB1dGlkKVxuICAgIHJldHVybiB0aGlzLmlucHV0LmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgfVxuICBcbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFtb3VudElucHV0IGV4dGVuZHMgU3RhbmRhcmRBbW91bnRJbnB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkFtb3VudElucHV0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICAvL3NlcmlhbGl6ZSBhbmQgZGVzZXJpYWxpemUgYm90aCBhcmUgaW5oZXJpdGVkXG5cbiAgc2VsZWN0KGlkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogSW5wdXQge1xuICAgIHJldHVybiBTZWxlY3RJbnB1dENsYXNzKGlkLCAuLi5hcmdzKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTRUNQVHJhbnNmZXJJbnB1dCBleHRlbmRzIEFtb3VudElucHV0IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU0VDUFRyYW5zZmVySW5wdXRcIlxuICBwcm90ZWN0ZWQgX2NvZGVjSUQgPSBBVk1Db25zdGFudHMuTEFURVNUQ09ERUNcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB0aGlzLl9jb2RlY0lEID09PSAwID8gQVZNQ29uc3RhbnRzLlNFQ1BJTlBVVElEIDogQVZNQ29uc3RhbnRzLlNFQ1BJTlBVVElEX0NPREVDT05FXG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIC8qKlxuICAqIFNldCB0aGUgY29kZWNJRFxuICAqXG4gICogQHBhcmFtIGNvZGVjSUQgVGhlIGNvZGVjSUQgdG8gc2V0XG4gICovXG4gIHNldENvZGVjSUQoY29kZWNJRDogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYoY29kZWNJRCAhPT0gMCAmJiBjb2RlY0lEICE9PSAxKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IENvZGVjSWRFcnJvcihcIkVycm9yIC0gU0VDUFRyYW5zZmVySW5wdXQuc2V0Q29kZWNJRDogaW52YWxpZCBjb2RlY0lELiBWYWxpZCBjb2RlY0lEcyBhcmUgMCBhbmQgMS5cIilcbiAgICB9XG4gICAgdGhpcy5fY29kZWNJRCA9IGNvZGVjSURcbiAgICB0aGlzLl90eXBlSUQgPSB0aGlzLl9jb2RlY0lEID09PSAwID8gQVZNQ29uc3RhbnRzLlNFQ1BJTlBVVElEIDogQVZNQ29uc3RhbnRzLlNFQ1BJTlBVVElEX0NPREVDT05FXG4gIH1cblxuICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBpbnB1dElEIGZvciB0aGlzIGlucHV0XG4gICAgICovXG4gIGdldElucHV0SUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICBnZXRDcmVkZW50aWFsSUQoKTogbnVtYmVyIHtcbiAgICBpZih0aGlzLl9jb2RlY0lEID09PSAwKSB7XG4gICAgICByZXR1cm4gQVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMXG4gICAgfSBlbHNlIGlmICh0aGlzLl9jb2RlY0lEID09PSAxKSB7XG4gICAgICByZXR1cm4gQVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMX0NPREVDT05FXG4gICAgfVxuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBTRUNQVHJhbnNmZXJJbnB1dCguLi5hcmdzKSBhcyB0aGlzXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBjb25zdCBuZXdvdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gdGhpcy5jcmVhdGUoKVxuICAgIG5ld291dC5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3b3V0IGFzIHRoaXNcbiAgfVxufVxuIl19