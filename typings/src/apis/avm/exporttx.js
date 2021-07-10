"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportTx = void 0;
/**
 * @packageDocumentation
 * @module API-AVM-ExportTx
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const outputs_1 = require("./outputs");
const basetx_1 = require("./basetx");
const constants_2 = require("../../utils/constants");
const bn_js_1 = __importDefault(require("bn.js"));
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
const cb58 = "cb58";
const buffer = "Buffer";
/**
 * Class representing an unsigned Export transaction.
 */
class ExportTx extends basetx_1.BaseTx {
    /**
       * Class representing an unsigned Export transaction.
       *
       * @param networkID Optional networkID, [[DefaultNetworkID]]
       * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
       * @param outs Optional array of the [[TransferableOutput]]s
       * @param ins Optional array of the [[TransferableInput]]s
       * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
       * @param destinationChain Optional chainid which identifies where the funds will sent to
       * @param exportOuts Array of [[TransferableOutputs]]s used in the transaction
       */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, destinationChain = undefined, exportOuts = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "ExportTx";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.EXPORTTX : constants_1.AVMConstants.EXPORTTX_CODECONE;
        this.destinationChain = undefined;
        this.numOuts = buffer_1.Buffer.alloc(4);
        this.exportOuts = [];
        /**
           * Returns the id of the [[ExportTx]]
           */
        this.getTxType = () => {
            return this._typeID;
        };
        /**
         * Returns a {@link https://github.com/feross/buffer|Buffer} for the destination chainid.
         */
        this.getDestinationChain = () => {
            return this.destinationChain;
        };
        this.destinationChain = destinationChain; // no correction, if they don"t pass a chainid here, it will BOMB on toBuffer
        if (typeof exportOuts !== "undefined" && Array.isArray(exportOuts)) {
            for (let i = 0; i < exportOuts.length; i++) {
                if (!(exportOuts[i] instanceof outputs_1.TransferableOutput)) {
                    throw new errors_1.TransferableOutputError(`Error - ExportTx.constructor: invalid TransferableOutput in array parameter ${exportOuts}`);
                }
            }
            this.exportOuts = exportOuts;
        }
    }
    serialize(encoding = "hex") {
        const fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { destinationChain: serialization.encoder(this.destinationChain, encoding, buffer, cb58), exportOuts: this.exportOuts.map((e) => e.serialize(encoding)) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.destinationChain = serialization.decoder(fields["destinationChain"], encoding, cb58, buffer, 32);
        this.exportOuts = fields["exportOuts"].map((e) => {
            let eo = new outputs_1.TransferableOutput();
            eo.deserialize(e, encoding);
            return eo;
        });
        this.numOuts = buffer_1.Buffer.alloc(4);
        this.numOuts.writeUInt32BE(this.exportOuts.length, 0);
    }
    /**
    * Set the codecID
    *
    * @param codecID The codecID to set
    */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - ExportTx.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.EXPORTTX : constants_1.AVMConstants.EXPORTTX_CODECONE;
    }
    /**
     * Returns an array of [[TransferableOutput]]s in this transaction.
     */
    getExportOutputs() {
        return this.exportOuts;
    }
    /**
     * Returns the totall exported amount as a {@link https://github.com/indutny/bn.js/|BN}.
     */
    getExportTotal() {
        let val = new bn_js_1.default(0);
        for (let i = 0; i < this.exportOuts.length; i++) {
            val = val.add(this.exportOuts[i].getOutput().getAmount());
        }
        return val;
    }
    getTotalOuts() {
        return [...this.getOuts(), ...this.getExportOutputs()];
    }
    /**
       * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[ExportTx]], parses it, populates the class, and returns the length of the [[ExportTx]] in bytes.
       *
       * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[ExportTx]]
       *
       * @returns The length of the raw [[ExportTx]]
       *
       * @remarks assume not-checksummed
       */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.destinationChain = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.numOuts = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const numOuts = this.numOuts.readUInt32BE(0);
        for (let i = 0; i < numOuts; i++) {
            const anOut = new outputs_1.TransferableOutput();
            offset = anOut.fromBuffer(bytes, offset);
            this.exportOuts.push(anOut);
        }
        return offset;
    }
    /**
       * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ExportTx]].
       */
    toBuffer() {
        if (typeof this.destinationChain === "undefined") {
            throw new errors_1.ChainIdError("ExportTx.toBuffer -- this.destinationChain is undefined");
        }
        this.numOuts.writeUInt32BE(this.exportOuts.length, 0);
        let barr = [super.toBuffer(), this.destinationChain, this.numOuts];
        this.exportOuts = this.exportOuts.sort(outputs_1.TransferableOutput.comparator());
        for (let i = 0; i < this.exportOuts.length; i++) {
            barr.push(this.exportOuts[i].toBuffer());
        }
        return buffer_1.Buffer.concat(barr);
    }
    clone() {
        let newbase = new ExportTx();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new ExportTx(...args);
    }
}
exports.ExportTx = ExportTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0dHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9hdm0vZXhwb3J0dHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQywyQ0FBMEM7QUFDMUMsdUNBQTREO0FBRTVELHFDQUFpQztBQUNqQyxxREFBd0Q7QUFDeEQsa0RBQXNCO0FBQ3RCLDZEQUE2RjtBQUM3RiwrQ0FBd0Y7QUFFeEY7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2hFLE1BQU0sSUFBSSxHQUFtQixNQUFNLENBQUE7QUFDbkMsTUFBTSxNQUFNLEdBQW1CLFFBQVEsQ0FBQTtBQUV2Qzs7R0FFRztBQUNILE1BQWEsUUFBUyxTQUFRLGVBQU07SUFpSWxDOzs7Ozs7Ozs7O1NBVUs7SUFDTCxZQUNFLFlBQW9CLDRCQUFnQixFQUFFLGVBQXVCLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUNqRixPQUE2QixTQUFTLEVBQUUsTUFBMkIsU0FBUyxFQUM1RSxPQUFlLFNBQVMsRUFBRSxtQkFBMkIsU0FBUyxFQUFFLGFBQW1DLFNBQVM7UUFFNUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQWhKdkMsY0FBUyxHQUFHLFVBQVUsQ0FBQTtRQUN0QixhQUFRLEdBQUcsd0JBQVksQ0FBQyxXQUFXLENBQUE7UUFDbkMsWUFBTyxHQUFHLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxpQkFBaUIsQ0FBQTtRQXNCdEYscUJBQWdC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SSxDQUFDLENBQUE7SUFDNUIsQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLE9BQU8sR0FBYSxJQUFJLFFBQVEsRUFBRSxDQUFBO1FBQ3RDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7UUFDbkMsT0FBTyxPQUFlLENBQUE7SUFDeEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHLElBQVc7UUFDbkIsT0FBTyxJQUFJLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBUyxDQUFBO0lBQ3RDLENBQUM7Q0E2QkY7QUE1SkQsNEJBNEpDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLUFWTS1FeHBvcnRUeFxuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IEFWTUNvbnN0YW50cyB9IGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVPdXRwdXQsIEFtb3VudE91dHB1dCB9IGZyb20gXCIuL291dHB1dHNcIlxuaW1wb3J0IHsgVHJhbnNmZXJhYmxlSW5wdXQgfSBmcm9tIFwiLi9pbnB1dHNcIlxuaW1wb3J0IHsgQmFzZVR4IH0gZnJvbSBcIi4vYmFzZXR4XCJcbmltcG9ydCB7IERlZmF1bHROZXR3b3JrSUQgfSBmcm9tIFwiLi4vLi4vdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nLCBTZXJpYWxpemVkVHlwZSB9IGZyb20gXCIuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uXCJcbmltcG9ydCB7IENvZGVjSWRFcnJvciwgQ2hhaW5JZEVycm9yLCBUcmFuc2ZlcmFibGVPdXRwdXRFcnJvciB9IGZyb20gXCIuLi8uLi91dGlscy9lcnJvcnNcIlxuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuY29uc3Qgc2VyaWFsaXphdGlvbjogU2VyaWFsaXphdGlvbiA9IFNlcmlhbGl6YXRpb24uZ2V0SW5zdGFuY2UoKVxuY29uc3QgY2I1ODogU2VyaWFsaXplZFR5cGUgPSBcImNiNThcIlxuY29uc3QgYnVmZmVyOiBTZXJpYWxpemVkVHlwZSA9IFwiQnVmZmVyXCJcblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgRXhwb3J0IHRyYW5zYWN0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgRXhwb3J0VHggZXh0ZW5kcyBCYXNlVHgge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJFeHBvcnRUeFwiXG4gIHByb3RlY3RlZCBfY29kZWNJRCA9IEFWTUNvbnN0YW50cy5MQVRFU1RDT0RFQ1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHRoaXMuX2NvZGVjSUQgPT09IDAgPyBBVk1Db25zdGFudHMuRVhQT1JUVFggOiBBVk1Db25zdGFudHMuRVhQT1JUVFhfQ09ERUNPTkVcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGNvbnN0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBkZXN0aW5hdGlvbkNoYWluOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5kZXN0aW5hdGlvbkNoYWluLCBlbmNvZGluZywgYnVmZmVyLCBjYjU4KSxcbiAgICAgIGV4cG9ydE91dHM6IHRoaXMuZXhwb3J0T3V0cy5tYXAoKGUpID0+IGUuc2VyaWFsaXplKGVuY29kaW5nKSlcbiAgICB9XG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLmRlc3RpbmF0aW9uQ2hhaW4gPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wiZGVzdGluYXRpb25DaGFpblwiXSwgZW5jb2RpbmcsIGNiNTgsIGJ1ZmZlciwgMzIpXG4gICAgdGhpcy5leHBvcnRPdXRzID0gZmllbGRzW1wiZXhwb3J0T3V0c1wiXS5tYXAoKGU6IG9iamVjdCk6IFRyYW5zZmVyYWJsZU91dHB1dCA9PiB7XG4gICAgICBsZXQgZW86IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoKVxuICAgICAgZW8uZGVzZXJpYWxpemUoZSwgZW5jb2RpbmcpXG4gICAgICByZXR1cm4gZW9cbiAgICB9KVxuICAgIHRoaXMubnVtT3V0cyA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIHRoaXMubnVtT3V0cy53cml0ZVVJbnQzMkJFKHRoaXMuZXhwb3J0T3V0cy5sZW5ndGgsIDApXG4gIH1cblxuICBwcm90ZWN0ZWQgZGVzdGluYXRpb25DaGFpbjogQnVmZmVyID0gdW5kZWZpbmVkXG4gIHByb3RlY3RlZCBudW1PdXRzOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgcHJvdGVjdGVkIGV4cG9ydE91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW11cblxuICAvKipcbiAgKiBTZXQgdGhlIGNvZGVjSURcbiAgKlxuICAqIEBwYXJhbSBjb2RlY0lEIFRoZSBjb2RlY0lEIHRvIHNldFxuICAqL1xuICBzZXRDb2RlY0lEKGNvZGVjSUQ6IG51bWJlcik6IHZvaWQge1xuICAgIGlmKGNvZGVjSUQgIT09IDAgJiYgY29kZWNJRCAhPT0gMSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBDb2RlY0lkRXJyb3IoXCJFcnJvciAtIEV4cG9ydFR4LnNldENvZGVjSUQ6IGludmFsaWQgY29kZWNJRC4gVmFsaWQgY29kZWNJRHMgYXJlIDAgYW5kIDEuXCIpXG4gICAgfVxuICAgIHRoaXMuX2NvZGVjSUQgPSBjb2RlY0lEXG4gICAgdGhpcy5fdHlwZUlEID0gdGhpcy5fY29kZWNJRCA9PT0gMCA/IEFWTUNvbnN0YW50cy5FWFBPUlRUWCA6IEFWTUNvbnN0YW50cy5FWFBPUlRUWF9DT0RFQ09ORVxuICB9XG5cbiAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaWQgb2YgdGhlIFtbRXhwb3J0VHhdXVxuICAgICAqL1xuICBnZXRUeFR5cGUgPSAoKTogbnVtYmVyID0+IHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBbW1RyYW5zZmVyYWJsZU91dHB1dF1dcyBpbiB0aGlzIHRyYW5zYWN0aW9uLlxuICAgKi9cbiAgZ2V0RXhwb3J0T3V0cHV0cygpOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSB7XG4gICAgcmV0dXJuIHRoaXMuZXhwb3J0T3V0c1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHRvdGFsbCBleHBvcnRlZCBhbW91bnQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfS5cbiAgICovXG4gIGdldEV4cG9ydFRvdGFsKCk6IEJOIHtcbiAgICBsZXQgdmFsOiBCTiA9IG5ldyBCTigwKVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmV4cG9ydE91dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbCA9IHZhbC5hZGQoKHRoaXMuZXhwb3J0T3V0c1tpXS5nZXRPdXRwdXQoKSBhcyBBbW91bnRPdXRwdXQpLmdldEFtb3VudCgpKVxuICAgIH1cbiAgICByZXR1cm4gdmFsXG4gIH1cblxuICBnZXRUb3RhbE91dHMoKTogVHJhbnNmZXJhYmxlT3V0cHV0W10ge1xuICAgIHJldHVybiBbLi4udGhpcy5nZXRPdXRzKCkgYXMgVHJhbnNmZXJhYmxlT3V0cHV0W10sIC4uLnRoaXMuZ2V0RXhwb3J0T3V0cHV0cygpXVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIGRlc3RpbmF0aW9uIGNoYWluaWQuXG4gICAqL1xuICBnZXREZXN0aW5hdGlvbkNoYWluID0gKCk6IEJ1ZmZlciA9PiB7XG4gICAgcmV0dXJuIHRoaXMuZGVzdGluYXRpb25DaGFpblxuICB9XG5cbiAgLyoqXG4gICAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGFuIFtbRXhwb3J0VHhdXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBbW0V4cG9ydFR4XV0gaW4gYnl0ZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbRXhwb3J0VHhdXVxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbRXhwb3J0VHhdXVxuICAgICAqXG4gICAgICogQHJlbWFya3MgYXNzdW1lIG5vdC1jaGVja3N1bW1lZFxuICAgICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOkJ1ZmZlciwgb2Zmc2V0Om51bWJlciA9IDApOm51bWJlciB7XG4gICAgb2Zmc2V0ID0gc3VwZXIuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIHRoaXMuZGVzdGluYXRpb25DaGFpbiA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKVxuICAgIG9mZnNldCArPSAzMlxuICAgIHRoaXMubnVtT3V0cyA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcbiAgICBjb25zdCBudW1PdXRzOiBudW1iZXIgPSB0aGlzLm51bU91dHMucmVhZFVJbnQzMkJFKDApXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IG51bU91dHM7IGkrKykge1xuICAgICAgY29uc3QgYW5PdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoKVxuICAgICAgb2Zmc2V0ID0gYW5PdXQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgICAgdGhpcy5leHBvcnRPdXRzLnB1c2goYW5PdXQpXG4gICAgfVxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tFeHBvcnRUeF1dLlxuICAgICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGlmKHR5cGVvZiB0aGlzLmRlc3RpbmF0aW9uQ2hhaW4gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRocm93IG5ldyBDaGFpbklkRXJyb3IoXCJFeHBvcnRUeC50b0J1ZmZlciAtLSB0aGlzLmRlc3RpbmF0aW9uQ2hhaW4gaXMgdW5kZWZpbmVkXCIpXG4gICAgfVxuICAgIHRoaXMubnVtT3V0cy53cml0ZVVJbnQzMkJFKHRoaXMuZXhwb3J0T3V0cy5sZW5ndGgsIDApXG4gICAgbGV0IGJhcnI6IEJ1ZmZlcltdID0gW3N1cGVyLnRvQnVmZmVyKCksIHRoaXMuZGVzdGluYXRpb25DaGFpbiwgdGhpcy5udW1PdXRzXVxuICAgIHRoaXMuZXhwb3J0T3V0cyA9IHRoaXMuZXhwb3J0T3V0cy5zb3J0KFRyYW5zZmVyYWJsZU91dHB1dC5jb21wYXJhdG9yKCkpXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMuZXhwb3J0T3V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgYmFyci5wdXNoKHRoaXMuZXhwb3J0T3V0c1tpXS50b0J1ZmZlcigpKVxuICAgIH1cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyKVxuICB9XG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgbGV0IG5ld2Jhc2U6IEV4cG9ydFR4ID0gbmV3IEV4cG9ydFR4KClcbiAgICBuZXdiYXNlLmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiBuZXdiYXNlIGFzIHRoaXNcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgRXhwb3J0VHgoLi4uYXJncykgYXMgdGhpc1xuICB9XG5cbiAgLyoqXG4gICAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIEV4cG9ydCB0cmFuc2FjdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBuZXR3b3JrSUQgT3B0aW9uYWwgbmV0d29ya0lELCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgICAqIEBwYXJhbSBibG9ja2NoYWluSUQgT3B0aW9uYWwgYmxvY2tjaGFpbklELCBkZWZhdWx0IEJ1ZmZlci5hbGxvYygzMiwgMTYpXG4gICAgICogQHBhcmFtIG91dHMgT3B0aW9uYWwgYXJyYXkgb2YgdGhlIFtbVHJhbnNmZXJhYmxlT3V0cHV0XV1zXG4gICAgICogQHBhcmFtIGlucyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgbWVtbyBmaWVsZFxuICAgICAqIEBwYXJhbSBkZXN0aW5hdGlvbkNoYWluIE9wdGlvbmFsIGNoYWluaWQgd2hpY2ggaWRlbnRpZmllcyB3aGVyZSB0aGUgZnVuZHMgd2lsbCBzZW50IHRvXG4gICAgICogQHBhcmFtIGV4cG9ydE91dHMgQXJyYXkgb2YgW1tUcmFuc2ZlcmFibGVPdXRwdXRzXV1zIHVzZWQgaW4gdGhlIHRyYW5zYWN0aW9uXG4gICAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCwgYmxvY2tjaGFpbklEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIsIDE2KSxcbiAgICBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHVuZGVmaW5lZCwgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCwgZGVzdGluYXRpb25DaGFpbjogQnVmZmVyID0gdW5kZWZpbmVkLCBleHBvcnRPdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zLCBtZW1vKVxuICAgIHRoaXMuZGVzdGluYXRpb25DaGFpbiA9IGRlc3RpbmF0aW9uQ2hhaW4gLy8gbm8gY29ycmVjdGlvbiwgaWYgdGhleSBkb25cInQgcGFzcyBhIGNoYWluaWQgaGVyZSwgaXQgd2lsbCBCT01CIG9uIHRvQnVmZmVyXG4gICAgaWYgKHR5cGVvZiBleHBvcnRPdXRzICE9PSBcInVuZGVmaW5lZFwiICYmIEFycmF5LmlzQXJyYXkoZXhwb3J0T3V0cykpIHtcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBleHBvcnRPdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghKGV4cG9ydE91dHNbaV0gaW5zdGFuY2VvZiBUcmFuc2ZlcmFibGVPdXRwdXQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFRyYW5zZmVyYWJsZU91dHB1dEVycm9yKGBFcnJvciAtIEV4cG9ydFR4LmNvbnN0cnVjdG9yOiBpbnZhbGlkIFRyYW5zZmVyYWJsZU91dHB1dCBpbiBhcnJheSBwYXJhbWV0ZXIgJHtleHBvcnRPdXRzfWApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuZXhwb3J0T3V0cyA9IGV4cG9ydE91dHNcbiAgICB9XG4gIH1cbn0iXX0=