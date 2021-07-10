"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportTx = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-ImportTx
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const inputs_1 = require("./inputs");
const credentials_1 = require("./credentials");
const credentials_2 = require("../../common/credentials");
const basetx_1 = require("./basetx");
const constants_2 = require("../../utils/constants");
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Class representing an unsigned Import transaction.
 */
class ImportTx extends basetx_1.BaseTx {
    /**
     * Class representing an unsigned Import transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param sourceChain Optiona chainid for the source inputs to import. Default platform chainid.
     * @param importIns Array of [[TransferableInput]]s used in the transaction
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, sourceChain = undefined, importIns = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "ImportTx";
        this._typeID = constants_1.PlatformVMConstants.IMPORTTX;
        this.sourceChain = buffer_1.Buffer.alloc(32);
        this.numIns = buffer_1.Buffer.alloc(4);
        this.importIns = [];
        /**
           * Returns the id of the [[ImportTx]]
           */
        this.getTxType = () => {
            return this._typeID;
        };
        this.sourceChain = sourceChain; // do no correct, if it's wrong it'll bomb on toBuffer
        if (typeof importIns !== 'undefined' && Array.isArray(importIns)) {
            for (let i = 0; i < importIns.length; i++) {
                if (!(importIns[i] instanceof inputs_1.TransferableInput)) {
                    throw new errors_1.TransferableInputError("Error - ImportTx.constructor: invalid TransferableInput in array parameter 'importIns'");
                }
            }
            this.importIns = importIns;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "sourceChain": serialization.encoder(this.sourceChain, encoding, "Buffer", "cb58"), "importIns": this.importIns.map((i) => i.serialize(encoding)) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.sourceChain = serialization.decoder(fields["sourceChain"], encoding, "cb58", "Buffer", 32);
        this.importIns = fields["importIns"].map((i) => {
            let ii = new inputs_1.TransferableInput();
            ii.deserialize(i, encoding);
            return ii;
        });
        this.numIns = buffer_1.Buffer.alloc(4);
        this.numIns.writeUInt32BE(this.importIns.length, 0);
    }
    /**
       * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[ImportTx]], parses it, populates the class, and returns the length of the [[ImportTx]] in bytes.
       *
       * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[ImportTx]]
       *
       * @returns The length of the raw [[ImportTx]]
       *
       * @remarks assume not-checksummed
       */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.sourceChain = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.numIns = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const numIns = this.numIns.readUInt32BE(0);
        for (let i = 0; i < numIns; i++) {
            const anIn = new inputs_1.TransferableInput();
            offset = anIn.fromBuffer(bytes, offset);
            this.importIns.push(anIn);
        }
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ImportTx]].
     */
    toBuffer() {
        if (typeof this.sourceChain === "undefined") {
            throw new errors_1.ChainIdError("ImportTx.toBuffer -- this.sourceChain is undefined");
        }
        this.numIns.writeUInt32BE(this.importIns.length, 0);
        let barr = [super.toBuffer(), this.sourceChain, this.numIns];
        this.importIns = this.importIns.sort(inputs_1.TransferableInput.comparator());
        for (let i = 0; i < this.importIns.length; i++) {
            barr.push(this.importIns[i].toBuffer());
        }
        return buffer_1.Buffer.concat(barr);
    }
    /**
       * Returns an array of [[TransferableInput]]s in this transaction.
       */
    getImportInputs() {
        return this.importIns;
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
        for (let i = 0; i < this.importIns.length; i++) {
            const cred = credentials_1.SelectCredentialClass(this.importIns[i].getInput().getCredentialID());
            const sigidxs = this.importIns[i].getInput().getSigIdxs();
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
        let newbase = new ImportTx();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new ImportTx(...args);
    }
}
exports.ImportTx = ImportTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0dHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL2ltcG9ydHR4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFpQztBQUNqQyxvRUFBNEM7QUFDNUMsMkNBQWtEO0FBRWxELHFDQUE2QztBQUU3QywrQ0FBc0Q7QUFDdEQsMERBQXlFO0FBQ3pFLHFDQUFrQztBQUNsQyxxREFBeUQ7QUFDekQsNkRBQThFO0FBQzlFLCtDQUEwRTtBQUUxRTs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFHaEU7O0dBRUc7QUFDSCxNQUFhLFFBQVMsU0FBUSxlQUFNO0lBb0hsQzs7Ozs7Ozs7OztPQVVHO0lBQ0gsWUFDRSxZQUFvQiw0QkFBZ0IsRUFBRSxlQUF1QixlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDakYsT0FBNkIsU0FBUyxFQUFFLE1BQTJCLFNBQVMsRUFDNUUsT0FBZSxTQUFTLEVBQUUsY0FBc0IsU0FBUyxFQUFFLFlBQWlDLFNBQVM7UUFFckcsS0FBSyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQW5JeEMsY0FBUyxHQUFHLFVBQVUsQ0FBQztRQUN2QixZQUFPLEdBQUcsK0JBQW1CLENBQUMsUUFBUSxDQUFDO1FBc0J2QyxnQkFBVyxHQUFVLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEMsV0FBTSxHQUFVLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsY0FBUyxHQUF3QixFQUFFLENBQUM7UUFFOUM7O2FBRUs7UUFDTCxjQUFTLEdBQUcsR0FBVSxFQUFF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LE9BQU8sT0FBZSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBRyxJQUFVO1FBQ2xCLE9BQU8sSUFBSSxRQUFRLENBQUMsR0FBRyxJQUFJLENBQVMsQ0FBQztJQUN2QyxDQUFDO0NBNkJGO0FBL0lELDRCQStJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1QbGF0Zm9ybVZNLUltcG9ydFR4XG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nO1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uLy4uL3V0aWxzL2JpbnRvb2xzJztcbmltcG9ydCB7IFBsYXRmb3JtVk1Db25zdGFudHMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tICcuL291dHB1dHMnO1xuaW1wb3J0IHsgVHJhbnNmZXJhYmxlSW5wdXQgfSBmcm9tICcuL2lucHV0cyc7XG5pbXBvcnQgeyBLZXlDaGFpbiwgS2V5UGFpciB9IGZyb20gJy4va2V5Y2hhaW4nO1xuaW1wb3J0IHsgU2VsZWN0Q3JlZGVudGlhbENsYXNzIH0gZnJvbSAnLi9jcmVkZW50aWFscyc7XG5pbXBvcnQgeyBTaWduYXR1cmUsIFNpZ0lkeCwgQ3JlZGVudGlhbCB9IGZyb20gJy4uLy4uL2NvbW1vbi9jcmVkZW50aWFscyc7XG5pbXBvcnQgeyBCYXNlVHggfSBmcm9tICcuL2Jhc2V0eCc7XG5pbXBvcnQgeyBEZWZhdWx0TmV0d29ya0lEIH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc3RhbnRzJztcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gJy4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb24nO1xuaW1wb3J0IHsgQ2hhaW5JZEVycm9yLCBUcmFuc2ZlcmFibGVJbnB1dEVycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvZXJyb3JzJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcblxuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBJbXBvcnQgdHJhbnNhY3Rpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBJbXBvcnRUeCBleHRlbmRzIEJhc2VUeCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkltcG9ydFR4XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5JTVBPUlRUWDtcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIFwic291cmNlQ2hhaW5cIjogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuc291cmNlQ2hhaW4sIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImNiNThcIiksXG4gICAgICBcImltcG9ydEluc1wiOiB0aGlzLmltcG9ydElucy5tYXAoKGkpID0+IGkuc2VyaWFsaXplKGVuY29kaW5nKSlcbiAgICB9XG4gIH07XG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLnNvdXJjZUNoYWluID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKGZpZWxkc1tcInNvdXJjZUNoYWluXCJdLCBlbmNvZGluZywgXCJjYjU4XCIsIFwiQnVmZmVyXCIsIDMyKTtcbiAgICB0aGlzLmltcG9ydElucyA9IGZpZWxkc1tcImltcG9ydEluc1wiXS5tYXAoKGk6b2JqZWN0KSA9PiB7XG4gICAgICBsZXQgaWk6VHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQoKTtcbiAgICAgIGlpLmRlc2VyaWFsaXplKGksIGVuY29kaW5nKTtcbiAgICAgIHJldHVybiBpaTtcbiAgICB9KTtcbiAgICB0aGlzLm51bUlucyA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICB0aGlzLm51bUlucy53cml0ZVVJbnQzMkJFKHRoaXMuaW1wb3J0SW5zLmxlbmd0aCwgMCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgc291cmNlQ2hhaW46QnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyKTtcbiAgcHJvdGVjdGVkIG51bUluczpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gIHByb3RlY3RlZCBpbXBvcnRJbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXTtcblxuICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBpZCBvZiB0aGUgW1tJbXBvcnRUeF1dXG4gICAgICovXG4gIGdldFR4VHlwZSA9ICgpOm51bWJlciA9PiB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRDtcbiAgfVxuICBcbiAgLyoqXG4gICAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGFuIFtbSW1wb3J0VHhdXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBbW0ltcG9ydFR4XV0gaW4gYnl0ZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbSW1wb3J0VHhdXVxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbSW1wb3J0VHhdXVxuICAgICAqXG4gICAgICogQHJlbWFya3MgYXNzdW1lIG5vdC1jaGVja3N1bW1lZFxuICAgICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOkJ1ZmZlciwgb2Zmc2V0Om51bWJlciA9IDApOm51bWJlciB7XG4gICAgb2Zmc2V0ID0gc3VwZXIuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KTtcbiAgICB0aGlzLnNvdXJjZUNoYWluID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMzIpO1xuICAgIG9mZnNldCArPSAzMjtcbiAgICB0aGlzLm51bUlucyA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpO1xuICAgIG9mZnNldCArPSA0O1xuICAgIGNvbnN0IG51bUluczpudW1iZXIgPSB0aGlzLm51bUlucy5yZWFkVUludDMyQkUoMCk7XG4gICAgZm9yIChsZXQgaTpudW1iZXIgPSAwOyBpIDwgbnVtSW5zOyBpKyspIHtcbiAgICAgIGNvbnN0IGFuSW46VHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQoKTtcbiAgICAgIG9mZnNldCA9IGFuSW4uZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KTtcbiAgICAgIHRoaXMuaW1wb3J0SW5zLnB1c2goYW5Jbik7XG4gICAgfVxuICAgIHJldHVybiBvZmZzZXQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0ltcG9ydFR4XV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOkJ1ZmZlciB7XG4gICAgaWYodHlwZW9mIHRoaXMuc291cmNlQ2hhaW4gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRocm93IG5ldyBDaGFpbklkRXJyb3IoXCJJbXBvcnRUeC50b0J1ZmZlciAtLSB0aGlzLnNvdXJjZUNoYWluIGlzIHVuZGVmaW5lZFwiKTtcbiAgICB9XG4gICAgdGhpcy5udW1JbnMud3JpdGVVSW50MzJCRSh0aGlzLmltcG9ydElucy5sZW5ndGgsIDApO1xuICAgIGxldCBiYXJyOiBCdWZmZXJbXSA9IFtzdXBlci50b0J1ZmZlcigpLCB0aGlzLnNvdXJjZUNoYWluLCB0aGlzLm51bUluc107XG4gICAgdGhpcy5pbXBvcnRJbnMgPSB0aGlzLmltcG9ydElucy5zb3J0KFRyYW5zZmVyYWJsZUlucHV0LmNvbXBhcmF0b3IoKSk7XG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMuaW1wb3J0SW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGJhcnIucHVzaCh0aGlzLmltcG9ydEluc1tpXS50b0J1ZmZlcigpKTtcbiAgICB9XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFycik7XG4gIH1cbiAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBvZiBbW1RyYW5zZmVyYWJsZUlucHV0XV1zIGluIHRoaXMgdHJhbnNhY3Rpb24uXG4gICAgICovXG4gIGdldEltcG9ydElucHV0cygpOiBUcmFuc2ZlcmFibGVJbnB1dFtdIHtcbiAgICByZXR1cm4gdGhpcy5pbXBvcnRJbnM7XG4gIH1cblxuICAvKipcbiAgICAgKiBUYWtlcyB0aGUgYnl0ZXMgb2YgYW4gW1tVbnNpZ25lZFR4XV0gYW5kIHJldHVybnMgYW4gYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbXNnIEEgQnVmZmVyIGZvciB0aGUgW1tVbnNpZ25lZFR4XV1cbiAgICAgKiBAcGFyYW0ga2MgQW4gW1tLZXlDaGFpbl1dIHVzZWQgaW4gc2lnbmluZ1xuICAgICAqXG4gICAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAgICovXG4gIHNpZ24obXNnOiBCdWZmZXIsIGtjOiBLZXlDaGFpbik6IENyZWRlbnRpYWxbXSB7XG4gICAgY29uc3Qgc2lnczogQ3JlZGVudGlhbFtdID0gc3VwZXIuc2lnbihtc2csIGtjKTtcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5pbXBvcnRJbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGNyZWQ6Q3JlZGVudGlhbCA9IFNlbGVjdENyZWRlbnRpYWxDbGFzcyh0aGlzLmltcG9ydEluc1tpXS5nZXRJbnB1dCgpLmdldENyZWRlbnRpYWxJRCgpKTtcbiAgICAgIGNvbnN0IHNpZ2lkeHM6IFNpZ0lkeFtdID0gdGhpcy5pbXBvcnRJbnNbaV0uZ2V0SW5wdXQoKS5nZXRTaWdJZHhzKCk7XG4gICAgICBmb3IgKGxldCBqOiBudW1iZXIgPSAwOyBqIDwgc2lnaWR4cy5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBrZXlwYWlyOktleVBhaXIgPSBrYy5nZXRLZXkoc2lnaWR4c1tqXS5nZXRTb3VyY2UoKSk7XG4gICAgICAgIGNvbnN0IHNpZ252YWw6QnVmZmVyID0ga2V5cGFpci5zaWduKG1zZyk7XG4gICAgICAgIGNvbnN0IHNpZzpTaWduYXR1cmUgPSBuZXcgU2lnbmF0dXJlKCk7XG4gICAgICAgIHNpZy5mcm9tQnVmZmVyKHNpZ252YWwpO1xuICAgICAgICBjcmVkLmFkZFNpZ25hdHVyZShzaWcpO1xuICAgICAgfVxuICAgICAgc2lncy5wdXNoKGNyZWQpO1xuICAgIH1cbiAgICByZXR1cm4gc2lncztcbiAgfVxuXG4gIGNsb25lKCk6dGhpcyB7XG4gICAgbGV0IG5ld2Jhc2U6SW1wb3J0VHggPSBuZXcgSW1wb3J0VHgoKTtcbiAgICBuZXdiYXNlLmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKTtcbiAgICByZXR1cm4gbmV3YmFzZSBhcyB0aGlzO1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6YW55W10pOnRoaXMge1xuICAgIHJldHVybiBuZXcgSW1wb3J0VHgoLi4uYXJncykgYXMgdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgSW1wb3J0IHRyYW5zYWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gbmV0d29ya0lEIE9wdGlvbmFsIG5ldHdvcmtJRCwgW1tEZWZhdWx0TmV0d29ya0lEXV1cbiAgICogQHBhcmFtIGJsb2NrY2hhaW5JRCBPcHRpb25hbCBibG9ja2NoYWluSUQsIGRlZmF1bHQgQnVmZmVyLmFsbG9jKDMyLCAxNilcbiAgICogQHBhcmFtIG91dHMgT3B0aW9uYWwgYXJyYXkgb2YgdGhlIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zXG4gICAqIEBwYXJhbSBpbnMgT3B0aW9uYWwgYXJyYXkgb2YgdGhlIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXNcbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBtZW1vIGZpZWxkXG4gICAqIEBwYXJhbSBzb3VyY2VDaGFpbiBPcHRpb25hIGNoYWluaWQgZm9yIHRoZSBzb3VyY2UgaW5wdXRzIHRvIGltcG9ydC4gRGVmYXVsdCBwbGF0Zm9ybSBjaGFpbmlkLlxuICAgKiBAcGFyYW0gaW1wb3J0SW5zIEFycmF5IG9mIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXMgdXNlZCBpbiB0aGUgdHJhbnNhY3Rpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCwgYmxvY2tjaGFpbklEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIsIDE2KSxcbiAgICBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHVuZGVmaW5lZCwgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCwgc291cmNlQ2hhaW46IEJ1ZmZlciA9IHVuZGVmaW5lZCwgaW1wb3J0SW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMsIG1lbW8pO1xuICAgIHRoaXMuc291cmNlQ2hhaW4gPSBzb3VyY2VDaGFpbjsgLy8gZG8gbm8gY29ycmVjdCwgaWYgaXQncyB3cm9uZyBpdCdsbCBib21iIG9uIHRvQnVmZmVyXG4gICAgaWYgKHR5cGVvZiBpbXBvcnRJbnMgIT09ICd1bmRlZmluZWQnICYmIEFycmF5LmlzQXJyYXkoaW1wb3J0SW5zKSkge1xuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGltcG9ydElucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIShpbXBvcnRJbnNbaV0gaW5zdGFuY2VvZiBUcmFuc2ZlcmFibGVJbnB1dCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHJhbnNmZXJhYmxlSW5wdXRFcnJvcihcIkVycm9yIC0gSW1wb3J0VHguY29uc3RydWN0b3I6IGludmFsaWQgVHJhbnNmZXJhYmxlSW5wdXQgaW4gYXJyYXkgcGFyYW1ldGVyICdpbXBvcnRJbnMnXCIpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmltcG9ydElucyA9IGltcG9ydElucztcbiAgICB9XG4gIH1cbn0iXX0=