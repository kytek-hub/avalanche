"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseTx = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-BaseTx
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const outputs_1 = require("./outputs");
const inputs_1 = require("./inputs");
const credentials_1 = require("./credentials");
const tx_1 = require("../../common/tx");
const credentials_2 = require("../../common/credentials");
const constants_2 = require("../../utils/constants");
const tx_2 = require("../platformvm/tx");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Class representing a base for all transactions.
 */
class BaseTx extends tx_1.StandardBaseTx {
    /**
     * Class representing a BaseTx which is the foundation for all transactions.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "BaseTx";
        this._typeID = constants_1.PlatformVMConstants.CREATESUBNETTX;
        /**
         * Returns the id of the [[BaseTx]]
         */
        this.getTxType = () => {
            return constants_1.PlatformVMConstants.BASETX;
        };
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.outs = fields["outs"].map((o) => {
            let newOut = new outputs_1.TransferableOutput();
            newOut.deserialize(o, encoding);
            return newOut;
        });
        this.ins = fields["ins"].map((i) => {
            let newIn = new inputs_1.TransferableInput();
            newIn.deserialize(i, encoding);
            return newIn;
        });
        this.numouts = buffer_1.Buffer.alloc(4);
        this.numouts.writeUInt32BE(this.outs.length, 0);
        this.numins = buffer_1.Buffer.alloc(4);
        this.numins.writeUInt32BE(this.ins.length, 0);
    }
    getOuts() {
        return this.outs;
    }
    getIns() {
        return this.ins;
    }
    getTotalOuts() {
        return this.getOuts();
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[BaseTx]], parses it, populates the class, and returns the length of the BaseTx in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[BaseTx]]
     *
     * @returns The length of the raw [[BaseTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        this.networkID = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.blockchainID = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.numouts = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const outcount = this.numouts.readUInt32BE(0);
        this.outs = [];
        for (let i = 0; i < outcount; i++) {
            const xferout = new outputs_1.TransferableOutput();
            offset = xferout.fromBuffer(bytes, offset);
            this.outs.push(xferout);
        }
        this.numins = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const incount = this.numins.readUInt32BE(0);
        this.ins = [];
        for (let i = 0; i < incount; i++) {
            const xferin = new inputs_1.TransferableInput();
            offset = xferin.fromBuffer(bytes, offset);
            this.ins.push(xferin);
        }
        let memolen = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.memo = bintools.copyFrom(bytes, offset, offset + memolen);
        offset += memolen;
        return offset;
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
        const sigs = [];
        for (let i = 0; i < this.ins.length; i++) {
            const cred = credentials_1.SelectCredentialClass(this.ins[i].getInput().getCredentialID());
            const sigidxs = this.ins[i].getInput().getSigIdxs();
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
        let newbase = new BaseTx();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new BaseTx(...args);
    }
    select(id, ...args) {
        let newbasetx = tx_2.SelectTxClass(id, ...args);
        return newbasetx;
    }
}
exports.BaseTx = BaseTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZXR4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS9iYXNldHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWlDO0FBQ2pDLG9FQUE0QztBQUM1QywyQ0FBa0Q7QUFDbEQsdUNBQStDO0FBQy9DLHFDQUE2QztBQUM3QywrQ0FBc0Q7QUFFdEQsd0NBQWlEO0FBQ2pELDBEQUF5RTtBQUN6RSxxREFBeUQ7QUFDekQseUNBQWlEO0FBR2pEOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVqRDs7R0FFRztBQUNILE1BQWEsTUFBTyxTQUFRLG1CQUFpQztJQTBIM0Q7Ozs7Ozs7O09BUUc7SUFDSCxZQUFZLFlBQW9CLDRCQUFnQixFQUFFLGVBQXVCLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLE9BQTZCLFNBQVMsRUFBRSxNQUEyQixTQUFTLEVBQUUsT0FBZSxTQUFTO1FBQ25NLEtBQUssQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFuSXhDLGNBQVMsR0FBRyxRQUFRLENBQUM7UUFDckIsWUFBTyxHQUFHLCtCQUFtQixDQUFDLGNBQWMsQ0FBQztRQWlDdkQ7O1dBRUc7UUFDSCxjQUFTLEdBQUcsR0FBVSxFQUFFO1lBQ3RCLE9BQU8sK0JBQW1CLENBQUMsTUFBTSxDQUFDO1FBQ3BDLENBQUMsQ0FBQTtJQTZGRCxDQUFDO0lBaklELFdBQVcsQ0FBQyxNQUFhLEVBQUUsV0FBOEIsS0FBSztRQUM1RCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxD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LENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUMvQyxNQUFNLE9BQU8sR0FBVyxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLE9BQU8sR0FBVSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN6QyxNQUFNLEdBQUcsR0FBYSxJQUFJLHVCQUFTLEVBQUUsQ0FBQztnQkFDdEMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDeEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUN4QjtZQUNELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDakI7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxLQUFLO1FBQ0gsSUFBSSxPQUFPLEdBQVUsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUNsQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sT0FBZSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBRyxJQUFVO1FBQ2xCLE9BQU8sSUFBSSxNQUFNLENBQUMsR0FBRyxJQUFJLENBQVMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQVMsRUFBRSxHQUFHLElBQVU7UUFDN0IsSUFBSSxTQUFTLEdBQVUsa0JBQWEsQ0FBQyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNsRCxPQUFPLFNBQWlCLENBQUM7SUFDM0IsQ0FBQztDQWNGO0FBdElELHdCQXNJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1QbGF0Zm9ybVZNLUJhc2VUeFxuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJztcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi8uLi91dGlscy9iaW50b29scyc7XG5pbXBvcnQgeyBQbGF0Zm9ybVZNQ29uc3RhbnRzIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgVHJhbnNmZXJhYmxlT3V0cHV0IH0gZnJvbSAnLi9vdXRwdXRzJztcbmltcG9ydCB7IFRyYW5zZmVyYWJsZUlucHV0IH0gZnJvbSAnLi9pbnB1dHMnO1xuaW1wb3J0IHsgU2VsZWN0Q3JlZGVudGlhbENsYXNzIH0gZnJvbSAnLi9jcmVkZW50aWFscyc7XG5pbXBvcnQgeyBLZXlDaGFpbiwgS2V5UGFpciB9IGZyb20gJy4va2V5Y2hhaW4nO1xuaW1wb3J0IHsgU3RhbmRhcmRCYXNlVHggfSBmcm9tICcuLi8uLi9jb21tb24vdHgnO1xuaW1wb3J0IHsgU2lnbmF0dXJlLCBTaWdJZHgsIENyZWRlbnRpYWwgfSBmcm9tICcuLi8uLi9jb21tb24vY3JlZGVudGlhbHMnO1xuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBTZWxlY3RUeENsYXNzIH0gZnJvbSAnLi4vcGxhdGZvcm12bS90eCc7XG5pbXBvcnQgeyBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tICcuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBiYXNlIGZvciBhbGwgdHJhbnNhY3Rpb25zLlxuICovXG5leHBvcnQgY2xhc3MgQmFzZVR4IGV4dGVuZHMgU3RhbmRhcmRCYXNlVHg8S2V5UGFpciwgS2V5Q2hhaW4+e1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJCYXNlVHhcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkNSRUFURVNVQk5FVFRYO1xuXG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLm91dHMgPSBmaWVsZHNbXCJvdXRzXCJdLm1hcCgobzpUcmFuc2ZlcmFibGVPdXRwdXQpID0+IHtcbiAgICAgIGxldCBuZXdPdXQ6VHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dCgpO1xuICAgICAgbmV3T3V0LmRlc2VyaWFsaXplKG8sIGVuY29kaW5nKTtcbiAgICAgIHJldHVybiBuZXdPdXQ7XG4gICAgfSk7XG4gICAgdGhpcy5pbnMgPSBmaWVsZHNbXCJpbnNcIl0ubWFwKChpOlRyYW5zZmVyYWJsZUlucHV0KSA9PiB7XG4gICAgICBsZXQgbmV3SW46VHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQoKTtcbiAgICAgIG5ld0luLmRlc2VyaWFsaXplKGksIGVuY29kaW5nKTtcbiAgICAgIHJldHVybiBuZXdJbjtcbiAgICB9KTtcbiAgICB0aGlzLm51bW91dHMgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgdGhpcy5udW1vdXRzLndyaXRlVUludDMyQkUodGhpcy5vdXRzLmxlbmd0aCwgMCk7XG4gICAgdGhpcy5udW1pbnMgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgdGhpcy5udW1pbnMud3JpdGVVSW50MzJCRSh0aGlzLmlucy5sZW5ndGgsIDApO1xuICB9XG5cbiAgZ2V0T3V0cygpOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSB7XG4gICAgcmV0dXJuIHRoaXMub3V0cyBhcyBUcmFuc2ZlcmFibGVPdXRwdXRbXTtcbiAgfVxuXG4gIGdldElucygpOiBUcmFuc2ZlcmFibGVJbnB1dFtdIHtcbiAgICByZXR1cm4gdGhpcy5pbnMgYXMgVHJhbnNmZXJhYmxlSW5wdXRbXTtcbiAgfVxuXG5cbiAgZ2V0VG90YWxPdXRzKCk6IFRyYW5zZmVyYWJsZU91dHB1dFtdIHtcbiAgICByZXR1cm4gdGhpcy5nZXRPdXRzKCkgYXMgVHJhbnNmZXJhYmxlT3V0cHV0W107XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaWQgb2YgdGhlIFtbQmFzZVR4XV1cbiAgICovXG4gIGdldFR4VHlwZSA9ICgpOm51bWJlciA9PiB7XG4gICAgcmV0dXJuIFBsYXRmb3JtVk1Db25zdGFudHMuQkFTRVRYO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhbiBbW0Jhc2VUeF1dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIEJhc2VUeCBpbiBieXRlcy5cbiAgICpcbiAgICogQHBhcmFtIGJ5dGVzIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhIHJhdyBbW0Jhc2VUeF1dXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsZW5ndGggb2YgdGhlIHJhdyBbW0Jhc2VUeF1dXG4gICAqXG4gICAqIEByZW1hcmtzIGFzc3VtZSBub3QtY2hlY2tzdW1tZWRcbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6QnVmZmVyLCBvZmZzZXQ6bnVtYmVyID0gMCk6bnVtYmVyIHtcbiAgICB0aGlzLm5ldHdvcmtJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpO1xuICAgIG9mZnNldCArPSA0O1xuICAgIHRoaXMuYmxvY2tjaGFpbklEID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMzIpO1xuICAgIG9mZnNldCArPSAzMjtcbiAgICB0aGlzLm51bW91dHMgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KTtcbiAgICBvZmZzZXQgKz0gNDtcbiAgICBjb25zdCBvdXRjb3VudDpudW1iZXIgPSB0aGlzLm51bW91dHMucmVhZFVJbnQzMkJFKDApO1xuICAgIHRoaXMub3V0cyA9IFtdO1xuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBvdXRjb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCB4ZmVyb3V0OlRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoKTtcbiAgICAgIG9mZnNldCA9IHhmZXJvdXQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KTtcbiAgICAgIHRoaXMub3V0cy5wdXNoKHhmZXJvdXQpO1xuICAgIH1cblxuICAgIHRoaXMubnVtaW5zID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCk7XG4gICAgb2Zmc2V0ICs9IDQ7XG4gICAgY29uc3QgaW5jb3VudDpudW1iZXIgPSB0aGlzLm51bWlucy5yZWFkVUludDMyQkUoMCk7XG4gICAgdGhpcy5pbnMgPSBbXTtcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgaW5jb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCB4ZmVyaW46VHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQoKTtcbiAgICAgIG9mZnNldCA9IHhmZXJpbi5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpO1xuICAgICAgdGhpcy5pbnMucHVzaCh4ZmVyaW4pO1xuICAgIH1cbiAgICBsZXQgbWVtb2xlbjpudW1iZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KS5yZWFkVUludDMyQkUoMCk7XG4gICAgb2Zmc2V0ICs9IDQ7XG4gICAgdGhpcy5tZW1vID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgbWVtb2xlbik7XG4gICAgb2Zmc2V0ICs9IG1lbW9sZW47XG4gICAgcmV0dXJuIG9mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyB0aGUgYnl0ZXMgb2YgYW4gW1tVbnNpZ25lZFR4XV0gYW5kIHJldHVybnMgYW4gYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAqXG4gICAqIEBwYXJhbSBtc2cgQSBCdWZmZXIgZm9yIHRoZSBbW1Vuc2lnbmVkVHhdXVxuICAgKiBAcGFyYW0ga2MgQW4gW1tLZXlDaGFpbl1dIHVzZWQgaW4gc2lnbmluZ1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICovXG4gIHNpZ24obXNnOiBCdWZmZXIsIGtjOiBLZXlDaGFpbik6IENyZWRlbnRpYWxbXSB7XG4gICAgY29uc3Qgc2lnczogQ3JlZGVudGlhbFtdID0gW107XG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMuaW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjcmVkOkNyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3ModGhpcy5pbnNbaV0uZ2V0SW5wdXQoKS5nZXRDcmVkZW50aWFsSUQoKSk7XG4gICAgICBjb25zdCBzaWdpZHhzOiBTaWdJZHhbXSA9IHRoaXMuaW5zW2ldLmdldElucHV0KCkuZ2V0U2lnSWR4cygpO1xuICAgICAgZm9yIChsZXQgajogbnVtYmVyID0gMDsgaiA8IHNpZ2lkeHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgY29uc3Qga2V5cGFpcjpLZXlQYWlyID0ga2MuZ2V0S2V5KHNpZ2lkeHNbal0uZ2V0U291cmNlKCkpO1xuICAgICAgICBjb25zdCBzaWdudmFsOkJ1ZmZlciA9IGtleXBhaXIuc2lnbihtc2cpO1xuICAgICAgICBjb25zdCBzaWc6U2lnbmF0dXJlID0gbmV3IFNpZ25hdHVyZSgpO1xuICAgICAgICBzaWcuZnJvbUJ1ZmZlcihzaWdudmFsKTtcbiAgICAgICAgY3JlZC5hZGRTaWduYXR1cmUoc2lnKTtcbiAgICAgIH1cbiAgICAgIHNpZ3MucHVzaChjcmVkKTtcbiAgICB9XG4gICAgcmV0dXJuIHNpZ3M7XG4gIH1cblxuICBjbG9uZSgpOnRoaXMge1xuICAgIGxldCBuZXdiYXNlOkJhc2VUeCA9IG5ldyBCYXNlVHgoKTtcbiAgICBuZXdiYXNlLmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKTtcbiAgICByZXR1cm4gbmV3YmFzZSBhcyB0aGlzO1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6YW55W10pOnRoaXMge1xuICAgIHJldHVybiBuZXcgQmFzZVR4KC4uLmFyZ3MpIGFzIHRoaXM7XG4gIH1cblxuICBzZWxlY3QoaWQ6bnVtYmVyLCAuLi5hcmdzOmFueVtdKTp0aGlzIHtcbiAgICBsZXQgbmV3YmFzZXR4OkJhc2VUeCA9IFNlbGVjdFR4Q2xhc3MoaWQsIC4uLmFyZ3MpO1xuICAgIHJldHVybiBuZXdiYXNldHggYXMgdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYSBCYXNlVHggd2hpY2ggaXMgdGhlIGZvdW5kYXRpb24gZm9yIGFsbCB0cmFuc2FjdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgT3B0aW9uYWwgbmV0d29ya0lELCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIE9wdGlvbmFsIGJsb2NrY2hhaW5JRCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgKiBAcGFyYW0gb3V0cyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICogQHBhcmFtIGlucyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICovXG4gIGNvbnN0cnVjdG9yKG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCwgYmxvY2tjaGFpbklEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIsIDE2KSwgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB1bmRlZmluZWQsIGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHVuZGVmaW5lZCwgbWVtbzogQnVmZmVyID0gdW5kZWZpbmVkKSB7XG4gICAgc3VwZXIobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbyk7XG4gIH1cbn0iXX0=