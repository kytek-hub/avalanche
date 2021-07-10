"use strict";
/**
 * @packageDocumentation
 * @module Common-AssetAmount
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardAssetAmountDestination = exports.AssetAmount = void 0;
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const errors_1 = require("../utils/errors");
/**
 * Class for managing asset amounts in the UTXOSet fee calcuation
 */
class AssetAmount {
    constructor(assetID, amount, burn) {
        // assetID that is amount is managing.
        this.assetID = buffer_1.Buffer.alloc(32);
        // amount of this asset that should be sent.
        this.amount = new bn_js_1.default(0);
        // burn is the amount of this asset that should be burned.
        this.burn = new bn_js_1.default(0);
        // spent is the total amount of this asset that has been consumed.
        this.spent = new bn_js_1.default(0);
        // stakeableLockSpent is the amount of this asset that has been consumed that
        // was locked.
        this.stakeableLockSpent = new bn_js_1.default(0);
        // change is the excess amount of this asset that was consumed over the amount
        // requested to be consumed(amount + burn).
        this.change = new bn_js_1.default(0);
        // stakeableLockChange is a flag to mark if the input that generated the
        // change was locked.
        this.stakeableLockChange = false;
        // finished is a convenience flag to track "spent >= amount + burn"
        this.finished = false;
        this.getAssetID = () => {
            return this.assetID;
        };
        this.getAssetIDString = () => {
            return this.assetID.toString("hex");
        };
        this.getAmount = () => {
            return this.amount;
        };
        this.getSpent = () => {
            return this.spent;
        };
        this.getBurn = () => {
            return this.burn;
        };
        this.getChange = () => {
            return this.change;
        };
        this.getStakeableLockSpent = () => {
            return this.stakeableLockSpent;
        };
        this.getStakeableLockChange = () => {
            return this.stakeableLockChange;
        };
        this.isFinished = () => {
            return this.finished;
        };
        // spendAmount should only be called if this asset is still awaiting more
        // funds to consume.
        this.spendAmount = (amt, stakeableLocked = false) => {
            if (this.finished) {
                /* istanbul ignore next */
                throw new errors_1.InsufficientFundsError('Error - AssetAmount.spendAmount: attempted to spend '
                    + 'excess funds');
            }
            this.spent = this.spent.add(amt);
            if (stakeableLocked) {
                this.stakeableLockSpent = this.stakeableLockSpent.add(amt);
            }
            const total = this.amount.add(this.burn);
            if (this.spent.gte(total)) {
                this.change = this.spent.sub(total);
                if (stakeableLocked) {
                    this.stakeableLockChange = true;
                }
                this.finished = true;
            }
            return this.finished;
        };
        this.assetID = assetID;
        this.amount = typeof amount === "undefined" ? new bn_js_1.default(0) : amount;
        this.burn = typeof burn === "undefined" ? new bn_js_1.default(0) : burn;
        this.spent = new bn_js_1.default(0);
        this.stakeableLockSpent = new bn_js_1.default(0);
        this.stakeableLockChange = false;
    }
}
exports.AssetAmount = AssetAmount;
class StandardAssetAmountDestination {
    constructor(destinations, senders, changeAddresses) {
        this.amounts = [];
        this.destinations = [];
        this.senders = [];
        this.changeAddresses = [];
        this.amountkey = {};
        this.inputs = [];
        this.outputs = [];
        this.change = [];
        // TODO: should this function allow for repeated calls with the same
        //       assetID?
        this.addAssetAmount = (assetID, amount, burn) => {
            let aa = new AssetAmount(assetID, amount, burn);
            this.amounts.push(aa);
            this.amountkey[aa.getAssetIDString()] = aa;
        };
        this.addInput = (input) => {
            this.inputs.push(input);
        };
        this.addOutput = (output) => {
            this.outputs.push(output);
        };
        this.addChange = (output) => {
            this.change.push(output);
        };
        this.getAmounts = () => {
            return this.amounts;
        };
        this.getDestinations = () => {
            return this.destinations;
        };
        this.getSenders = () => {
            return this.senders;
        };
        this.getChangeAddresses = () => {
            return this.changeAddresses;
        };
        this.getAssetAmount = (assetHexStr) => {
            return this.amountkey[assetHexStr];
        };
        this.assetExists = (assetHexStr) => {
            return (assetHexStr in this.amountkey);
        };
        this.getInputs = () => {
            return this.inputs;
        };
        this.getOutputs = () => {
            return this.outputs;
        };
        this.getChangeOutputs = () => {
            return this.change;
        };
        this.getAllOutputs = () => {
            return this.outputs.concat(this.change);
        };
        this.canComplete = () => {
            for (let i = 0; i < this.amounts.length; i++) {
                if (!this.amounts[i].isFinished()) {
                    return false;
                }
            }
            return true;
        };
        this.destinations = destinations;
        this.changeAddresses = changeAddresses;
        this.senders = senders;
    }
}
exports.StandardAssetAmountDestination = StandardAssetAmountDestination;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXRhbW91bnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2Fzc2V0YW1vdW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7OztBQUVILG9DQUFpQztBQUNqQyxrREFBdUI7QUFHdkIsNENBQXlEO0FBRXpEOztHQUVHO0FBQ0gsTUFBYSxXQUFXO0lBb0Z0QixZQUFZLE9BQWUsRUFBRSxNQUFVLEVBQUUsSUFBUTtRQW5GakQsc0NBQXNDO1FBQzVCLFlBQU8sR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLDRDQUE0QztRQUNsQyxXQUFNLEdBQU8sSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsMERBQTBEO1FBQ2hELFNBQUksR0FBTyxJQUFJLGVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUUvQixrRUFBa0U7UUFDeEQsVUFBSyxHQUFPLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLDZFQUE2RTtRQUM3RSxjQUFjO1FBQ0osdUJBQWtCLEdBQU8sSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFN0MsOEVBQThFO1FBQzlFLDJDQUEyQztRQUNqQyxXQUFNLEdBQU8sSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsd0VBQXdFO1FBQ3hFLHFCQUFxQjtRQUNYLHdCQUFtQixHQUFZLEtBQUssQ0FBQztRQUUvQyxtRUFBbUU7UUFDekQsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUVwQyxlQUFVLEdBQUcsR0FBVyxFQUFFO1lBQ3hCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUN0QixDQUFDLENBQUE7UUFFRCxxQkFBZ0IsR0FBRyxHQUFXLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUE7UUFFRCxj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QUE7UUFHQyxJQUFJLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQztRQUNqQyxJQUFJLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQztRQUN2QyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUN6QixDQUFDO0NBRUY7QUF0RkQsd0VBc0ZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQ29tbW9uLUFzc2V0QW1vdW50XG4gKi9cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLyc7XG5pbXBvcnQgQk4gZnJvbSAnYm4uanMnO1xuaW1wb3J0IHsgU3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tICcuL291dHB1dCc7XG5pbXBvcnQgeyBTdGFuZGFyZFRyYW5zZmVyYWJsZUlucHV0IH0gZnJvbSAnLi9pbnB1dCc7XG5pbXBvcnQgeyBJbnN1ZmZpY2llbnRGdW5kc0Vycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3JzJztcblxuLyoqXG4gKiBDbGFzcyBmb3IgbWFuYWdpbmcgYXNzZXQgYW1vdW50cyBpbiB0aGUgVVRYT1NldCBmZWUgY2FsY3VhdGlvblxuICovXG5leHBvcnQgY2xhc3MgQXNzZXRBbW91bnQge1xuICAvLyBhc3NldElEIHRoYXQgaXMgYW1vdW50IGlzIG1hbmFnaW5nLlxuICBwcm90ZWN0ZWQgYXNzZXRJRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyKTtcbiAgLy8gYW1vdW50IG9mIHRoaXMgYXNzZXQgdGhhdCBzaG91bGQgYmUgc2VudC5cbiAgcHJvdGVjdGVkIGFtb3VudDogQk4gPSBuZXcgQk4oMCk7XG4gIC8vIGJ1cm4gaXMgdGhlIGFtb3VudCBvZiB0aGlzIGFzc2V0IHRoYXQgc2hvdWxkIGJlIGJ1cm5lZC5cbiAgcHJvdGVjdGVkIGJ1cm46IEJOID0gbmV3IEJOKDApO1xuXG4gIC8vIHNwZW50IGlzIHRoZSB0b3RhbCBhbW91bnQgb2YgdGhpcyBhc3NldCB0aGF0IGhhcyBiZWVuIGNvbnN1bWVkLlxuICBwcm90ZWN0ZWQgc3BlbnQ6IEJOID0gbmV3IEJOKDApO1xuICAvLyBzdGFrZWFibGVMb2NrU3BlbnQgaXMgdGhlIGFtb3VudCBvZiB0aGlzIGFzc2V0IHRoYXQgaGFzIGJlZW4gY29uc3VtZWQgdGhhdFxuICAvLyB3YXMgbG9ja2VkLlxuICBwcm90ZWN0ZWQgc3Rha2VhYmxlTG9ja1NwZW50OiBCTiA9IG5ldyBCTigwKTtcblxuICAvLyBjaGFuZ2UgaXMgdGhlIGV4Y2VzcyBhbW91bnQgb2YgdGhpcyBhc3NldCB0aGF0IHdhcyBjb25zdW1lZCBvdmVyIHRoZSBhbW91bnRcbiAgLy8gcmVxdWVzdGVkIHRvIGJlIGNvbnN1bWVkKGFtb3VudCArIGJ1cm4pLlxuICBwcm90ZWN0ZWQgY2hhbmdlOiBCTiA9IG5ldyBCTigwKTtcbiAgLy8gc3Rha2VhYmxlTG9ja0NoYW5nZSBpcyBhIGZsYWcgdG8gbWFyayBpZiB0aGUgaW5wdXQgdGhhdCBnZW5lcmF0ZWQgdGhlXG4gIC8vIGNoYW5nZSB3YXMgbG9ja2VkLlxuICBwcm90ZWN0ZWQgc3Rha2VhYmxlTG9ja0NoYW5nZTogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIC8vIGZpbmlzaGVkIGlzIGEgY29udmVuaWVuY2UgZmxhZyB0byB0cmFjayBcInNwZW50ID49IGFtb3VudCArIGJ1cm5cIlxuICBwcm90ZWN0ZWQgZmluaXNoZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBnZXRBc3NldElEID0gKCk6IEJ1ZmZlciA9PiB7XG4gICAgcmV0dXJuIHRoaXMuYXNzZXRJRDtcbiAgfVxuXG4gIGdldEFzc2V0SURTdHJpbmcgPSAoKTogc3RyaW5nID0+IHtcbiAgICByZXR1cm4gdGhpcy5hc3NldElELnRvU3RyaW5nKFwiaGV4XCIpO1xuICB9XG5cbiAgZ2V0QW1vdW50ID0gKCk6IEJOID0+IHtcbiAgICByZXR1cm4gdGhpcy5hbW91bnRcbiAgfVxuXG4gIGdldFNwZW50ID0gKCk6IEJOID0+IHtcbiAgICByZXR1cm4gdGhpcy5zcGVudDtcbiAgfVxuXG4gIGdldEJ1cm4gPSAoKTogQk4gPT4ge1xuICAgIHJldHVybiB0aGlzLmJ1cm47XG4gIH1cblxuICBnZXRDaGFuZ2UgPSAoKTogQk4gPT4ge1xuICAgIHJldHVybiB0aGlzLmNoYW5nZTtcbiAgfVxuXG4gIGdldFN0YWtlYWJsZUxvY2tTcGVudCA9ICgpOiBCTiA9PiB7XG4gICAgcmV0dXJuIHRoaXMuc3Rha2VhYmxlTG9ja1NwZW50O1xuICB9XG5cbiAgZ2V0U3Rha2VhYmxlTG9ja0NoYW5nZSA9ICgpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gdGhpcy5zdGFrZWFibGVMb2NrQ2hhbmdlO1xuICB9XG5cbiAgaXNGaW5pc2hlZCA9ICgpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gdGhpcy5maW5pc2hlZDtcbiAgfVxuXG4gIC8vIHNwZW5kQW1vdW50IHNob3VsZCBvbmx5IGJlIGNhbGxlZCBpZiB0aGlzIGFzc2V0IGlzIHN0aWxsIGF3YWl0aW5nIG1vcmVcbiAgLy8gZnVuZHMgdG8gY29uc3VtZS5cbiAgc3BlbmRBbW91bnQgPSAoYW10OiBCTiwgc3Rha2VhYmxlTG9ja2VkOiBib29sZWFuID0gZmFsc2UpOiBib29sZWFuID0+IHtcbiAgICBpZiAodGhpcy5maW5pc2hlZCkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBJbnN1ZmZpY2llbnRGdW5kc0Vycm9yKCdFcnJvciAtIEFzc2V0QW1vdW50LnNwZW5kQW1vdW50OiBhdHRlbXB0ZWQgdG8gc3BlbmQgJ1xuICAgICAgICArICdleGNlc3MgZnVuZHMnKTtcbiAgICB9XG4gICAgdGhpcy5zcGVudCA9IHRoaXMuc3BlbnQuYWRkKGFtdCk7XG4gICAgaWYgKHN0YWtlYWJsZUxvY2tlZCkge1xuICAgICAgdGhpcy5zdGFrZWFibGVMb2NrU3BlbnQgPSB0aGlzLnN0YWtlYWJsZUxvY2tTcGVudC5hZGQoYW10KTtcbiAgICB9XG5cbiAgICBjb25zdCB0b3RhbDogQk4gPSB0aGlzLmFtb3VudC5hZGQodGhpcy5idXJuKTtcbiAgICBpZiAodGhpcy5zcGVudC5ndGUodG90YWwpKSB7XG4gICAgICB0aGlzLmNoYW5nZSA9IHRoaXMuc3BlbnQuc3ViKHRvdGFsKTtcbiAgICAgIGlmIChzdGFrZWFibGVMb2NrZWQpIHtcbiAgICAgICAgdGhpcy5zdGFrZWFibGVMb2NrQ2hhbmdlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHRoaXMuZmluaXNoZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maW5pc2hlZDtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKGFzc2V0SUQ6IEJ1ZmZlciwgYW1vdW50OiBCTiwgYnVybjogQk4pIHtcbiAgICB0aGlzLmFzc2V0SUQgPSBhc3NldElEO1xuICAgIHRoaXMuYW1vdW50ID0gdHlwZW9mIGFtb3VudCA9PT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBCTigwKSA6IGFtb3VudDtcbiAgICB0aGlzLmJ1cm4gPSB0eXBlb2YgYnVybiA9PT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBCTigwKSA6IGJ1cm47XG4gICAgdGhpcy5zcGVudCA9IG5ldyBCTigwKTtcbiAgICB0aGlzLnN0YWtlYWJsZUxvY2tTcGVudCA9IG5ldyBCTigwKTtcbiAgICB0aGlzLnN0YWtlYWJsZUxvY2tDaGFuZ2UgPSBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RhbmRhcmRBc3NldEFtb3VudERlc3RpbmF0aW9uPFRPIGV4dGVuZHMgU3RhbmRhcmRUcmFuc2ZlcmFibGVPdXRwdXQsIFRJIGV4dGVuZHMgU3RhbmRhcmRUcmFuc2ZlcmFibGVJbnB1dD4gIHtcbiAgcHJvdGVjdGVkIGFtb3VudHM6IEFzc2V0QW1vdW50W10gPSBbXTtcbiAgcHJvdGVjdGVkIGRlc3RpbmF0aW9uczogQnVmZmVyW10gPSBbXTtcbiAgcHJvdGVjdGVkIHNlbmRlcnM6IEJ1ZmZlcltdID0gW107XG4gIHByb3RlY3RlZCBjaGFuZ2VBZGRyZXNzZXM6IEJ1ZmZlcltdID0gW107XG4gIHByb3RlY3RlZCBhbW91bnRrZXk6IG9iamVjdCA9IHt9O1xuICBwcm90ZWN0ZWQgaW5wdXRzOiBUSVtdID0gW107XG4gIHByb3RlY3RlZCBvdXRwdXRzOiBUT1tdID0gW107XG4gIHByb3RlY3RlZCBjaGFuZ2U6IFRPW10gPSBbXTtcblxuICAvLyBUT0RPOiBzaG91bGQgdGhpcyBmdW5jdGlvbiBhbGxvdyBmb3IgcmVwZWF0ZWQgY2FsbHMgd2l0aCB0aGUgc2FtZVxuICAvLyAgICAgICBhc3NldElEP1xuICBhZGRBc3NldEFtb3VudCA9IChhc3NldElEOiBCdWZmZXIsIGFtb3VudDogQk4sIGJ1cm46IEJOKSA9PiB7XG4gICAgbGV0IGFhOiBBc3NldEFtb3VudCA9IG5ldyBBc3NldEFtb3VudChhc3NldElELCBhbW91bnQsIGJ1cm4pO1xuICAgIHRoaXMuYW1vdW50cy5wdXNoKGFhKTtcbiAgICB0aGlzLmFtb3VudGtleVthYS5nZXRBc3NldElEU3RyaW5nKCldID0gYWE7XG4gIH1cblxuICBhZGRJbnB1dCA9IChpbnB1dDogVEkpID0+IHtcbiAgICB0aGlzLmlucHV0cy5wdXNoKGlucHV0KTtcbiAgfVxuXG4gIGFkZE91dHB1dCA9IChvdXRwdXQ6IFRPKSA9PiB7XG4gICAgdGhpcy5vdXRwdXRzLnB1c2gob3V0cHV0KTtcbiAgfVxuXG4gIGFkZENoYW5nZSA9IChvdXRwdXQ6IFRPKSA9PiB7XG4gICAgdGhpcy5jaGFuZ2UucHVzaChvdXRwdXQpO1xuICB9XG5cbiAgZ2V0QW1vdW50cyA9ICgpOiBBc3NldEFtb3VudFtdID0+IHtcbiAgICByZXR1cm4gdGhpcy5hbW91bnRzO1xuICB9XG5cbiAgZ2V0RGVzdGluYXRpb25zID0gKCk6IEJ1ZmZlcltdID0+IHtcbiAgICByZXR1cm4gdGhpcy5kZXN0aW5hdGlvbnM7XG4gIH1cblxuICBnZXRTZW5kZXJzID0gKCk6IEJ1ZmZlcltdID0+IHtcbiAgICByZXR1cm4gdGhpcy5zZW5kZXJzO1xuICB9XG5cbiAgZ2V0Q2hhbmdlQWRkcmVzc2VzID0gKCk6IEJ1ZmZlcltdID0+IHtcbiAgICByZXR1cm4gdGhpcy5jaGFuZ2VBZGRyZXNzZXM7XG4gIH1cblxuICBnZXRBc3NldEFtb3VudCA9IChhc3NldEhleFN0cjogc3RyaW5nKTogQXNzZXRBbW91bnQgPT4ge1xuICAgIHJldHVybiB0aGlzLmFtb3VudGtleVthc3NldEhleFN0cl07XG4gIH1cblxuICBhc3NldEV4aXN0cyA9IChhc3NldEhleFN0cjogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuIChhc3NldEhleFN0ciBpbiB0aGlzLmFtb3VudGtleSk7XG4gIH1cblxuICBnZXRJbnB1dHMgPSAoKTogVElbXSA9PiB7XG4gICAgcmV0dXJuIHRoaXMuaW5wdXRzO1xuICB9XG5cbiAgZ2V0T3V0cHV0cyA9ICgpOiBUT1tdID0+IHtcbiAgICByZXR1cm4gdGhpcy5vdXRwdXRzO1xuICB9XG5cbiAgZ2V0Q2hhbmdlT3V0cHV0cyA9ICgpOiBUT1tdID0+IHtcbiAgICByZXR1cm4gdGhpcy5jaGFuZ2U7XG4gIH1cblxuICBnZXRBbGxPdXRwdXRzID0gKCk6IFRPW10gPT4ge1xuICAgIHJldHVybiB0aGlzLm91dHB1dHMuY29uY2F0KHRoaXMuY2hhbmdlKTtcbiAgfVxuXG4gIGNhbkNvbXBsZXRlID0gKCk6IGJvb2xlYW4gPT4ge1xuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmFtb3VudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghdGhpcy5hbW91bnRzW2ldLmlzRmluaXNoZWQoKSkge1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihkZXN0aW5hdGlvbnM6IEJ1ZmZlcltdLCBzZW5kZXJzOiBCdWZmZXJbXSwgY2hhbmdlQWRkcmVzc2VzOiBCdWZmZXJbXSkge1xuICAgIHRoaXMuZGVzdGluYXRpb25zID0gZGVzdGluYXRpb25zO1xuICAgIHRoaXMuY2hhbmdlQWRkcmVzc2VzID0gY2hhbmdlQWRkcmVzc2VzO1xuICAgIHRoaXMuc2VuZGVycyA9IHNlbmRlcnM7XG4gIH1cblxufSJdfQ==