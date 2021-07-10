"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportTx = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-ExportTx
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
     * @param destinationChain Optional chainid which identifies where the funds will send to.
     * @param exportOuts Array of [[TransferableOutputs]]s used in the transaction
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, destinationChain = undefined, exportOuts = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "ExportTx";
        this._typeID = constants_1.PlatformVMConstants.EXPORTTX;
        this.destinationChain = buffer_1.Buffer.alloc(32);
        this.numOuts = buffer_1.Buffer.alloc(4);
        this.exportOuts = [];
        /**
         * Returns the id of the [[ExportTx]]
         */
        this.getTxType = () => {
            return constants_1.PlatformVMConstants.EXPORTTX;
        };
        this.destinationChain = destinationChain; //do not correct, it should bomb on toBuffer if not provided
        if (typeof exportOuts !== 'undefined' && Array.isArray(exportOuts)) {
            for (let i = 0; i < exportOuts.length; i++) {
                if (!(exportOuts[i] instanceof outputs_1.TransferableOutput)) {
                    throw new errors_1.TransferableOutputError("Error - ExportTx.constructor: invalid TransferableOutput in array parameter 'exportOuts'");
                }
            }
            this.exportOuts = exportOuts;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "destinationChain": serialization.encoder(this.destinationChain, encoding, "Buffer", "cb58"), "exportOuts": this.exportOuts.map((e) => e.serialize(encoding)) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.destinationChain = serialization.decoder(fields["destinationChain"], encoding, "cb58", "Buffer", 32);
        this.exportOuts = fields["exportOuts"].map((e) => {
            let eo = new outputs_1.TransferableOutput();
            eo.deserialize(e, encoding);
            return eo;
        });
        this.numOuts = buffer_1.Buffer.alloc(4);
        this.numOuts.writeUInt32BE(this.exportOuts.length, 0);
    }
    /**
     * Returns an array of [[TransferableOutput]]s in this transaction.
     */
    getExportOutputs() {
        return this.exportOuts;
    }
    /**
     * Returns the total exported amount as a {@link https://github.com/indutny/bn.js/|BN}.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0dHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL2V4cG9ydHR4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFpQztBQUNqQyxvRUFBNEM7QUFDNUMsMkNBQWtEO0FBQ2xELHVDQUErQztBQUUvQyxxQ0FBa0M7QUFDbEMscURBQXlEO0FBQ3pELGtEQUF1QjtBQUV2Qiw2REFBOEU7QUFDOUUsK0NBQTJFO0FBRTNFOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUVqRTs7R0FFRztBQUNILE1BQWEsUUFBUyxTQUFRLGVBQU07SUEyR2xDOzs7Ozs7Ozs7O09BVUc7SUFDSCxZQUNFLFlBQW9CLDRCQUFnQixFQUFFLGVBQXVCLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUNqRixPQUE2QixTQUFTLEVBQUUsTUFBMkIsU0FBUyxFQUM1RSxPQUFlLFNBQVMsRUFBRSxtQkFBMkIsU0FBUyxFQUFFLGFBQW1DLFNBQVM7UUFFNUcsS0FBSyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQTFIeEMsY0FBUyxHQUFHLFVBQVUsQ0FBQztRQUN2QixZQUFPLEdBQUcsK0JBQW1CLENBQUMsUUFBUSxDQUFDO1FBc0J2QyxxQkFBZ0IsR0FBVSxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLFlBQU8sR0FBVSxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLGVBQVUsR0FBeUIsRUFBRSxDQUFDO1FBRWhEOztXQUVHO1FBQ0gsY0FBUyxHQUFHLEdBQVUsRUFBRTtZQUN0QixPQUFPLCtCQUFtQixDQUFDLFFBQVEsQ0FBQztRQUN0QyxDQUFDLENBQUE7UUEyRkMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDLENBQUMsNERBQTREO1FBQ3RHLElBQUksT0FBTyxVQUFVLEtBQUssV0FBVyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDbEUsS0FBSyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2xELElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsWUFBWSw0QkFBa0IsQ0FBQyxFQUFFO29CQUNsRCxNQUFNLElBQUksZ0NBQXVCLENBQUMsMEZBQTBGLENBQUMsQ0FBQztpQkFDL0g7YUFDRjtZQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1NBQzlCO0lBQ0gsQ0FBQztJQWpJRCxTQUFTLENBQUMsV0FBOEIsS0FBSztRQUMzQyxJQUFJLE1BQU0sR0FBVSxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzlDLHVDQUNLLE1BQU0sS0FDVCxrQkFBa0IsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUM1RixZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsSUFDaEU7SUFDSCxDQUFDO0lBQUEsQ0FBQztJQUNGLFdBQVcsQ0FBQyxNQUFhLEVBQUUsV0FBOEIsS0FBSztRQUM1RCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRyxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFRLEVBQUUsRUFBRTtZQUN0RCxJQUFJLEVBQUUsR0FBc0IsSUFBSSw0QkFBa0IsRUFBRSxDQUFDO1lBQ3JELEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQzVCLE9BQU8sRUFBRSxDQUFDO1FBQ1osQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsT0FBTyxHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQWFEOztPQUVHO0lBQ0gsZ0JBQWdCO1FBQ2QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWM7UUFDWixJQUFJLEdBQUcsR0FBTSxJQUFJLGVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixLQUFJLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUM7WUFDckQsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQW1CLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztTQUM3RTtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQztJQUVELFlBQVk7UUFDVixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUEwQixFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQ7Ozs7Ozs7O09BUUc7SUFDSCxVQUFVLENBQUMsS0FBWSxFQUFFLFNBQWdCLENBQUM7UUFDeEMsTUFBTSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sSUFBSSxFQUFFLENBQUM7UUFDYixJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDNUQsTUFBTSxJQUFJLENBQUMsQ0FBQztRQUNaLE1BQU0sT0FBTyxHQUFVLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BELEtBQUssSUFBSSxDQUFDLEdBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdkMsTUFBTSxLQUFLLEdBQXNCLElBQUksNEJBQWtCLEVBQUUsQ0FBQztZQUMxRCxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDN0I7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxRQUFRO1FBQ04sSUFBRyxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxXQUFXLEVBQUU7WUFDL0MsTUFBTSxJQUFJLHFCQUFZLENBQUMseURBQXlELENBQUMsQ0FBQztTQUNuRjtRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3RELElBQUksSUFBSSxHQUFhLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0UsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyw0QkFBa0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBQ3hFLEtBQUksSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNwRCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztTQUM1QztRQUNELE9BQU8sZUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBRUQsS0FBSztRQUNILElBQUksT0FBTyxHQUFZLElBQUksUUFBUSxFQUFFLENBQUM7UUFDdEMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztRQUNwQyxPQUFPLE9BQWUsQ0FBQztJQUN6QixDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQUcsSUFBVTtRQUNsQixPQUFPLElBQUksUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFTLENBQUM7SUFDdkMsQ0FBQztDQTZCRjtBQXRJRCw0QkFzSUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktUGxhdGZvcm1WTS1FeHBvcnRUeFxuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJztcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi8uLi91dGlscy9iaW50b29scyc7XG5pbXBvcnQgeyBQbGF0Zm9ybVZNQ29uc3RhbnRzIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgVHJhbnNmZXJhYmxlT3V0cHV0IH0gZnJvbSAnLi9vdXRwdXRzJztcbmltcG9ydCB7IFRyYW5zZmVyYWJsZUlucHV0IH0gZnJvbSAnLi9pbnB1dHMnO1xuaW1wb3J0IHsgQmFzZVR4IH0gZnJvbSAnLi9iYXNldHgnO1xuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnN0YW50cyc7XG5pbXBvcnQgQk4gZnJvbSAnYm4uanMnO1xuaW1wb3J0IHsgQW1vdW50T3V0cHV0IH0gZnJvbSAnLi4vcGxhdGZvcm12bS9vdXRwdXRzJztcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gJy4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb24nO1xuaW1wb3J0IHsgQ2hhaW5JZEVycm9yLCBUcmFuc2ZlcmFibGVPdXRwdXRFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzL2Vycm9ycyc7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpO1xuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBFeHBvcnQgdHJhbnNhY3Rpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBFeHBvcnRUeCBleHRlbmRzIEJhc2VUeCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkV4cG9ydFR4XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5FWFBPUlRUWDtcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIFwiZGVzdGluYXRpb25DaGFpblwiOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5kZXN0aW5hdGlvbkNoYWluLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJjYjU4XCIpLFxuICAgICAgXCJleHBvcnRPdXRzXCI6IHRoaXMuZXhwb3J0T3V0cy5tYXAoKGUpID0+IGUuc2VyaWFsaXplKGVuY29kaW5nKSlcbiAgICB9XG4gIH07XG4gIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLmRlc3RpbmF0aW9uQ2hhaW4gPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wiZGVzdGluYXRpb25DaGFpblwiXSwgZW5jb2RpbmcsIFwiY2I1OFwiLCBcIkJ1ZmZlclwiLCAzMik7XG4gICAgdGhpcy5leHBvcnRPdXRzID0gZmllbGRzW1wiZXhwb3J0T3V0c1wiXS5tYXAoKGU6b2JqZWN0KSA9PiB7XG4gICAgICBsZXQgZW86VHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dCgpO1xuICAgICAgZW8uZGVzZXJpYWxpemUoZSwgZW5jb2RpbmcpO1xuICAgICAgcmV0dXJuIGVvO1xuICAgIH0pO1xuICAgIHRoaXMubnVtT3V0cyA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICB0aGlzLm51bU91dHMud3JpdGVVSW50MzJCRSh0aGlzLmV4cG9ydE91dHMubGVuZ3RoLCAwKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBkZXN0aW5hdGlvbkNoYWluOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMik7XG4gIHByb3RlY3RlZCBudW1PdXRzOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgcHJvdGVjdGVkIGV4cG9ydE91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW107XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlkIG9mIHRoZSBbW0V4cG9ydFR4XV1cbiAgICovXG4gIGdldFR4VHlwZSA9ICgpOm51bWJlciA9PiB7XG4gICAgcmV0dXJuIFBsYXRmb3JtVk1Db25zdGFudHMuRVhQT1JUVFg7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBhcnJheSBvZiBbW1RyYW5zZmVyYWJsZU91dHB1dF1dcyBpbiB0aGlzIHRyYW5zYWN0aW9uLlxuICAgKi9cbiAgZ2V0RXhwb3J0T3V0cHV0cygpOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSB7XG4gICAgcmV0dXJuIHRoaXMuZXhwb3J0T3V0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0b3RhbCBleHBvcnRlZCBhbW91bnQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfS5cbiAgICovXG4gIGdldEV4cG9ydFRvdGFsKCk6Qk4ge1xuICAgIGxldCB2YWw6Qk4gPSBuZXcgQk4oMCk7XG4gICAgZm9yKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5leHBvcnRPdXRzLmxlbmd0aDsgaSsrKXtcbiAgICAgIHZhbCA9IHZhbC5hZGQoKHRoaXMuZXhwb3J0T3V0c1tpXS5nZXRPdXRwdXQoKSBhcyBBbW91bnRPdXRwdXQpLmdldEFtb3VudCgpKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuXG4gIGdldFRvdGFsT3V0cygpOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSB7XG4gICAgcmV0dXJuIFsuLi50aGlzLmdldE91dHMoKSBhcyBUcmFuc2ZlcmFibGVPdXRwdXRbXSwgLi4udGhpcy5nZXRFeHBvcnRPdXRwdXRzKCldO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhbiBbW0V4cG9ydFR4XV0sIHBhcnNlcyBpdCwgcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgW1tFeHBvcnRUeF1dIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbRXhwb3J0VHhdXVxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tFeHBvcnRUeF1dXG4gICAqXG4gICAqIEByZW1hcmtzIGFzc3VtZSBub3QtY2hlY2tzdW1tZWRcbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6QnVmZmVyLCBvZmZzZXQ6bnVtYmVyID0gMCk6bnVtYmVyIHtcbiAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpO1xuICAgIHRoaXMuZGVzdGluYXRpb25DaGFpbiA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKTtcbiAgICBvZmZzZXQgKz0gMzI7XG4gICAgdGhpcy5udW1PdXRzID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCk7XG4gICAgb2Zmc2V0ICs9IDQ7XG4gICAgY29uc3QgbnVtT3V0czpudW1iZXIgPSB0aGlzLm51bU91dHMucmVhZFVJbnQzMkJFKDApO1xuICAgIGZvciAobGV0IGk6bnVtYmVyID0gMDsgaSA8IG51bU91dHM7IGkrKykge1xuICAgICAgY29uc3QgYW5PdXQ6VHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dCgpO1xuICAgICAgb2Zmc2V0ID0gYW5PdXQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KTtcbiAgICAgIHRoaXMuZXhwb3J0T3V0cy5wdXNoKGFuT3V0KTtcbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbRXhwb3J0VHhdXS5cbiAgICovXG4gIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICBpZih0eXBlb2YgdGhpcy5kZXN0aW5hdGlvbkNoYWluID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgQ2hhaW5JZEVycm9yKFwiRXhwb3J0VHgudG9CdWZmZXIgLS0gdGhpcy5kZXN0aW5hdGlvbkNoYWluIGlzIHVuZGVmaW5lZFwiKTtcbiAgICB9XG4gICAgdGhpcy5udW1PdXRzLndyaXRlVUludDMyQkUodGhpcy5leHBvcnRPdXRzLmxlbmd0aCwgMCk7XG4gICAgbGV0IGJhcnI6IEJ1ZmZlcltdID0gW3N1cGVyLnRvQnVmZmVyKCksIHRoaXMuZGVzdGluYXRpb25DaGFpbiwgdGhpcy5udW1PdXRzXTtcbiAgICB0aGlzLmV4cG9ydE91dHMgPSB0aGlzLmV4cG9ydE91dHMuc29ydChUcmFuc2ZlcmFibGVPdXRwdXQuY29tcGFyYXRvcigpKTtcbiAgICBmb3IobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmV4cG9ydE91dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYmFyci5wdXNoKHRoaXMuZXhwb3J0T3V0c1tpXS50b0J1ZmZlcigpKTtcbiAgICB9XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFycik7XG4gIH1cblxuICBjbG9uZSgpOnRoaXMge1xuICAgIGxldCBuZXdiYXNlOkV4cG9ydFR4ID0gbmV3IEV4cG9ydFR4KCk7XG4gICAgbmV3YmFzZS5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSk7XG4gICAgcmV0dXJuIG5ld2Jhc2UgYXMgdGhpcztcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOmFueVtdKTp0aGlzIHtcbiAgICByZXR1cm4gbmV3IEV4cG9ydFR4KC4uLmFyZ3MpIGFzIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIEV4cG9ydCB0cmFuc2FjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIG5ldHdvcmtJRCBPcHRpb25hbCBuZXR3b3JrSUQsIFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgT3B0aW9uYWwgYmxvY2tjaGFpbklELCBkZWZhdWx0IEJ1ZmZlci5hbGxvYygzMiwgMTYpXG4gICAqIEBwYXJhbSBvdXRzIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZU91dHB1dF1dc1xuICAgKiBAcGFyYW0gaW5zIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZUlucHV0XV1zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgbWVtbyBmaWVsZFxuICAgKiBAcGFyYW0gZGVzdGluYXRpb25DaGFpbiBPcHRpb25hbCBjaGFpbmlkIHdoaWNoIGlkZW50aWZpZXMgd2hlcmUgdGhlIGZ1bmRzIHdpbGwgc2VuZCB0by5cbiAgICogQHBhcmFtIGV4cG9ydE91dHMgQXJyYXkgb2YgW1tUcmFuc2ZlcmFibGVPdXRwdXRzXV1zIHVzZWQgaW4gdGhlIHRyYW5zYWN0aW9uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBuZXR3b3JrSUQ6IG51bWJlciA9IERlZmF1bHROZXR3b3JrSUQsIGJsb2NrY2hhaW5JRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksXG4gICAgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB1bmRlZmluZWQsIGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsIGRlc3RpbmF0aW9uQ2hhaW46IEJ1ZmZlciA9IHVuZGVmaW5lZCwgZXhwb3J0T3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB1bmRlZmluZWRcbiAgKSB7XG4gICAgc3VwZXIobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbyk7XG4gICAgdGhpcy5kZXN0aW5hdGlvbkNoYWluID0gZGVzdGluYXRpb25DaGFpbjsgLy9kbyBub3QgY29ycmVjdCwgaXQgc2hvdWxkIGJvbWIgb24gdG9CdWZmZXIgaWYgbm90IHByb3ZpZGVkXG4gICAgaWYgKHR5cGVvZiBleHBvcnRPdXRzICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KGV4cG9ydE91dHMpKSB7XG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgZXhwb3J0T3V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIShleHBvcnRPdXRzW2ldIGluc3RhbmNlb2YgVHJhbnNmZXJhYmxlT3V0cHV0KSkge1xuICAgICAgICAgIHRocm93IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXRFcnJvcihcIkVycm9yIC0gRXhwb3J0VHguY29uc3RydWN0b3I6IGludmFsaWQgVHJhbnNmZXJhYmxlT3V0cHV0IGluIGFycmF5IHBhcmFtZXRlciAnZXhwb3J0T3V0cydcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuZXhwb3J0T3V0cyA9IGV4cG9ydE91dHM7XG4gICAgfVxuICB9XG59Il19