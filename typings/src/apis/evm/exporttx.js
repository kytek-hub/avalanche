"use strict";
/**
 * @packageDocumentation
 * @module API-EVM-ExportTx
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportTx = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const basetx_1 = require("./basetx");
const credentials_1 = require("./credentials");
const credentials_2 = require("../../common/credentials");
const inputs_1 = require("./inputs");
const serialization_1 = require("../../utils/serialization");
const outputs_1 = require("./outputs");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
class ExportTx extends basetx_1.EVMBaseTx {
    /**
     * Class representing a ExportTx.
     *
     * @param networkID Optional networkID
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param destinationChain Optional destinationChain, default Buffer.alloc(32, 16)
     * @param inputs Optional array of the [[EVMInputs]]s
     * @param exportedOutputs Optional array of the [[EVMOutputs]]s
     */
    constructor(networkID = undefined, blockchainID = buffer_1.Buffer.alloc(32, 16), destinationChain = buffer_1.Buffer.alloc(32, 16), inputs = undefined, exportedOutputs = undefined) {
        super(networkID, blockchainID);
        this._typeName = "ExportTx";
        this._typeID = constants_1.EVMConstants.EXPORTTX;
        this.destinationChain = buffer_1.Buffer.alloc(32);
        this.numInputs = buffer_1.Buffer.alloc(4);
        this.inputs = [];
        this.numExportedOutputs = buffer_1.Buffer.alloc(4);
        this.exportedOutputs = [];
        /**
         * Returns the destinationChain of the input as {@link https://github.com/feross/buffer|Buffer}
         */
        this.getDestinationChain = () => this.destinationChain;
        /**
         * Returns the inputs as an array of [[EVMInputs]]
         */
        this.getInputs = () => this.inputs;
        /**
         * Returns the outs as an array of [[EVMOutputs]]
         */
        this.getExportedOutputs = () => this.exportedOutputs;
        this.destinationChain = destinationChain;
        if (typeof inputs !== 'undefined' && Array.isArray(inputs)) {
            inputs.forEach((input) => {
                if (!(input instanceof inputs_1.EVMInput)) {
                    throw new errors_1.EVMInputError("Error - ExportTx.constructor: invalid EVMInput in array parameter 'inputs'");
                }
            });
            if (inputs.length > 1) {
                inputs = inputs.sort(inputs_1.EVMInput.comparator());
            }
            this.inputs = inputs;
        }
        if (typeof exportedOutputs !== 'undefined' && Array.isArray(exportedOutputs)) {
            exportedOutputs.forEach((exportedOutput) => {
                if (!(exportedOutput instanceof outputs_1.TransferableOutput)) {
                    throw new errors_1.TransferableOutputError("Error - ExportTx.constructor: TransferableOutput EVMInput in array parameter 'exportedOutputs'");
                }
            });
            this.exportedOutputs = exportedOutputs;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "destinationChain": serializer.encoder(this.destinationChain, encoding, "Buffer", "cb58"), "exportedOutputs": this.exportedOutputs.map((i) => i.serialize(encoding)) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.destinationChain = serializer.decoder(fields["destinationChain"], encoding, "cb58", "Buffer", 32);
        this.exportedOutputs = fields["exportedOutputs"].map((i) => {
            let eo = new outputs_1.TransferableOutput();
            eo.deserialize(i, encoding);
            return eo;
        });
        this.numExportedOutputs = buffer_1.Buffer.alloc(4);
        this.numExportedOutputs.writeUInt32BE(this.exportedOutputs.length, 0);
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ExportTx]].
     */
    toBuffer() {
        if (typeof this.destinationChain === "undefined") {
            throw new errors_1.ChainIdError("ExportTx.toBuffer -- this.destinationChain is undefined");
        }
        this.numInputs.writeUInt32BE(this.inputs.length, 0);
        this.numExportedOutputs.writeUInt32BE(this.exportedOutputs.length, 0);
        let barr = [super.toBuffer(), this.destinationChain, this.numInputs];
        let bsize = super.toBuffer().length + this.destinationChain.length + this.numInputs.length;
        this.inputs.forEach((importIn) => {
            bsize += importIn.toBuffer().length;
            barr.push(importIn.toBuffer());
        });
        bsize += this.numExportedOutputs.length;
        barr.push(this.numExportedOutputs);
        this.exportedOutputs.forEach((out) => {
            bsize += out.toBuffer().length;
            barr.push(out.toBuffer());
        });
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
     * Decodes the [[ExportTx]] as a {@link https://github.com/feross/buffer|Buffer} and returns the size.
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.destinationChain = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        this.numInputs = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const numInputs = this.numInputs.readUInt32BE(0);
        for (let i = 0; i < numInputs; i++) {
            const anIn = new inputs_1.EVMInput();
            offset = anIn.fromBuffer(bytes, offset);
            this.inputs.push(anIn);
        }
        this.numExportedOutputs = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const numExportedOutputs = this.numExportedOutputs.readUInt32BE(0);
        for (let i = 0; i < numExportedOutputs; i++) {
            const anOut = new outputs_1.TransferableOutput();
            offset = anOut.fromBuffer(bytes, offset);
            this.exportedOutputs.push(anOut);
        }
        return offset;
    }
    /**
     * Returns a base-58 representation of the [[ExportTx]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
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
        this.inputs.forEach((input) => {
            const cred = credentials_1.SelectCredentialClass(input.getCredentialID());
            const sigidxs = input.getSigIdxs();
            sigidxs.forEach((sigidx) => {
                const keypair = kc.getKey(sigidx.getSource());
                const signval = keypair.sign(msg);
                const sig = new credentials_2.Signature();
                sig.fromBuffer(signval);
                cred.addSignature(sig);
            });
            sigs.push(cred);
        });
        return sigs;
    }
}
exports.ExportTx = ExportTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwb3J0dHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9ldm0vZXhwb3J0dHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBRUgsb0NBQWlDO0FBQ2pDLG9FQUE0QztBQUM1QywyQ0FBMkM7QUFFM0MscUNBQXFDO0FBQ3JDLCtDQUFzRDtBQUN0RCwwREFJa0M7QUFDbEMscUNBQW9DO0FBQ3BDLDZEQUdtQztBQUNuQyx1Q0FBK0M7QUFDL0MsK0NBQTBGO0FBRTFGOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNsRCxNQUFNLFVBQVUsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUU5RCxNQUFhLFFBQVMsU0FBUSxrQkFBUztJQStIckM7Ozs7Ozs7O09BUUc7SUFDSCxZQUNFLFlBQW9CLFNBQVMsRUFDN0IsZUFBdUIsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQzNDLG1CQUEyQixlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDL0MsU0FBcUIsU0FBUyxFQUM5QixrQkFBd0MsU0FBUztRQUVqRCxLQUFLLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBOUl2QixjQUFTLEdBQUcsVUFBVSxDQUFDO1FBQ3ZCLFlBQU8sR0FBRyx3QkFBWSxDQUFDLFFBQVEsQ0FBQTtRQXNCL0IscUJBQWdCLEdBQVcsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM1QyxjQUFTLEdBQVcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNwQyxXQUFNLEdBQWUsRUFBRSxDQUFDO1FBQ3hCLHVCQUFrQixHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDN0Msb0JBQWUsR0FBeUIsRUFBRSxDQUFDO1FBRXJEOztXQUVHO1FBQ0gsd0JBQW1CLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBRTFEOztXQUVHO1FBQ0gsY0FBUyxHQUFHLEdBQWUsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFMUM7O1dBRUc7UUFDSCx1QkFBa0IsR0FBRyxHQUF5QixFQUFFLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQXFHcEUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1FBQ3pDLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDMUQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQWUsRUFBRSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksaUJBQVEsQ0FBQyxFQUFFO29CQUNoQyxNQUFNLElBQUksc0JBQWEsQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO2lCQUN2RztZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDcEIsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO2FBQzdDO1lBQ0QsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7U0FDdEI7UUFDRCxJQUFJLE9BQU8sZUFBZSxLQUFLLFdBQVcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFFO1lBQzFFLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxjQUFrQyxFQUFFLEVBQUU7Z0JBQy9ELElBQUksQ0FBQyxDQUFDLGNBQWMsWUFBWSw0QkFBa0IsQ0FBQyxFQUFFO29CQUNuRCxNQUFNLElBQUksZ0NBQXVCLENBQUMsZ0dBQWdHLENBQUMsQ0FBQztpQkFDckk7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDO1NBQ3hDO0lBQ0gsQ0FBQztJQWhLRCxTQUFTLENBQUMsV0FBK0IsS0FBSztRQUM1QyxJQUFJLE1BQU0sR0FBVyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLHVDQUNLLE1BQU0sS0FDVCxrQkFBa0IsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUN6RixpQkFBaUIsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUMxRTtJQUNILENBQUM7SUFBQSxDQUFDO0lBQ0YsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZHLElBQUksQ0FBQyxlQUFlLEdBQUcsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBUSxFQUFFLEVBQUU7WUFDaEUsSUFBSSxFQUFFLEdBQXNCLElBQUksNEJBQWtCLEVBQUUsQ0FBQztZQUNyRCxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM1QixPQUFPLEVBQUUsQ0FBQztRQUNaLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLGtCQUFrQixHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBdUJEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLElBQUcsT0FBTyxJQUFJLENBQUMsZ0JBQWdCLEtBQUssV0FBVyxFQUFFO1lBQy9DLE1BQU0sSUFBSSxxQkFBWSxDQUFDLHlEQUF5RCxDQUFDLENBQUM7U0FDbkY7UUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNwRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLElBQUksSUFBSSxHQUFhLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0UsSUFBSSxLQUFLLEdBQVcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQ25HLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBa0IsRUFBRSxFQUFFO1lBQ3pDLEtBQUssSUFBSSxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDakMsQ0FBQyxDQUFDLENBQUM7UUFDSCxLQUFLLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztRQUN4QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBdUIsRUFBRSxFQUFFO1lBQ3ZELEtBQUssSUFBSSxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQy9CLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDNUIsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLGVBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRDs7T0FFRztJQUNILFVBQVUsQ0FBQyxLQUFhLEVBQUUsU0FBaUIsQ0FBQztRQUMxQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDekMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUM7UUFDdEUsTUFBTSxJQUFJLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM5RCxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQ1osTUFBTSxTQUFTLEdBQVcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekQsS0FBSyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMxQyxNQUFNLElBQUksR0FBYSxJQUFJLGlCQUFRLEVBQUUsQ0FBQztZQUN0QyxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDeEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDeEI7UUFDRCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUN2RSxNQUFNLElBQUksQ0FBQyxDQUFDO1FBQ1osTUFBTSxrQkFBa0IsR0FBVyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNFLEtBQUssSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxrQkFBa0IsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNuRCxNQUFNLEtBQUssR0FBdUIsSUFBSSw0QkFBa0IsRUFBRSxDQUFDO1lBQzNELE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNsQztRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7T0FFRztJQUNILFFBQVE7UUFDTixPQUFPLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7SUFDL0MsQ0FBQztJQUVEOzs7Ozs7O1VBT007SUFDTixJQUFJLENBQUMsR0FBVyxFQUFFLEVBQVk7UUFDNUIsTUFBTSxJQUFJLEdBQWlCLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQy9DLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBZSxFQUFFLEVBQUU7WUFDdEMsTUFBTSxJQUFJLEdBQWUsbUNBQXFCLENBQUMsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUM7WUFDeEUsTUFBTSxPQUFPLEdBQWEsS0FBSyxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQzdDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFjLEVBQUUsRUFBRTtnQkFDakMsTUFBTSxPQUFPLEdBQVksRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztnQkFDdkQsTUFBTSxPQUFPLEdBQVcsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDMUMsTUFBTSxHQUFHLEdBQWMsSUFBSSx1QkFBUyxFQUFFLENBQUM7Z0JBQ3ZDLEdBQUcsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3hCLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBd0NGO0FBcktELDRCQXFLQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1FVk0tRXhwb3J0VHhcbiAqL1xuXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJztcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi8uLi91dGlscy9iaW50b29scyc7XG5pbXBvcnQgeyBFVk1Db25zdGFudHMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBLZXlDaGFpbiwgS2V5UGFpciB9IGZyb20gJy4va2V5Y2hhaW4nO1xuaW1wb3J0IHsgRVZNQmFzZVR4IH0gZnJvbSAnLi9iYXNldHgnO1xuaW1wb3J0IHsgU2VsZWN0Q3JlZGVudGlhbENsYXNzIH0gZnJvbSAnLi9jcmVkZW50aWFscyc7XG5pbXBvcnQgeyBcbiAgU2lnbmF0dXJlLCBcbiAgU2lnSWR4LCBcbiAgQ3JlZGVudGlhbCBcbn0gZnJvbSAnLi4vLi4vY29tbW9uL2NyZWRlbnRpYWxzJztcbmltcG9ydCB7IEVWTUlucHV0IH0gZnJvbSAnLi9pbnB1dHMnO1xuaW1wb3J0IHsgXG4gIFNlcmlhbGl6YXRpb24sIFxuICBTZXJpYWxpemVkRW5jb2RpbmcgXG59IGZyb20gJy4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb24nO1xuaW1wb3J0IHsgVHJhbnNmZXJhYmxlT3V0cHV0IH0gZnJvbSAnLi9vdXRwdXRzJztcbmltcG9ydCB7IENoYWluSWRFcnJvciwgRVZNSW5wdXRFcnJvciwgVHJhbnNmZXJhYmxlT3V0cHV0RXJyb3IgfSBmcm9tICcuLi8uLi91dGlscy9lcnJvcnMnO1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKTtcbmNvbnN0IHNlcmlhbGl6ZXI6IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKCk7XG5cbmV4cG9ydCBjbGFzcyBFeHBvcnRUeCBleHRlbmRzIEVWTUJhc2VUeCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkV4cG9ydFR4XCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEID0gRVZNQ29uc3RhbnRzLkVYUE9SVFRYXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBcImRlc3RpbmF0aW9uQ2hhaW5cIjogc2VyaWFsaXplci5lbmNvZGVyKHRoaXMuZGVzdGluYXRpb25DaGFpbiwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiY2I1OFwiKSxcbiAgICAgIFwiZXhwb3J0ZWRPdXRwdXRzXCI6IHRoaXMuZXhwb3J0ZWRPdXRwdXRzLm1hcCgoaSkgPT4gaS5zZXJpYWxpemUoZW5jb2RpbmcpKVxuICAgIH1cbiAgfTtcbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgdGhpcy5kZXN0aW5hdGlvbkNoYWluID0gc2VyaWFsaXplci5kZWNvZGVyKGZpZWxkc1tcImRlc3RpbmF0aW9uQ2hhaW5cIl0sIGVuY29kaW5nLCBcImNiNThcIiwgXCJCdWZmZXJcIiwgMzIpO1xuICAgIHRoaXMuZXhwb3J0ZWRPdXRwdXRzID0gZmllbGRzW1wiZXhwb3J0ZWRPdXRwdXRzXCJdLm1hcCgoaTpvYmplY3QpID0+IHtcbiAgICAgIGxldCBlbzpUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KCk7XG4gICAgICBlby5kZXNlcmlhbGl6ZShpLCBlbmNvZGluZyk7XG4gICAgICByZXR1cm4gZW87XG4gICAgfSk7XG4gICAgdGhpcy5udW1FeHBvcnRlZE91dHB1dHMgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgdGhpcy5udW1FeHBvcnRlZE91dHB1dHMud3JpdGVVSW50MzJCRSh0aGlzLmV4cG9ydGVkT3V0cHV0cy5sZW5ndGgsIDApO1xuICB9XG5cbiAgcHJvdGVjdGVkIGRlc3RpbmF0aW9uQ2hhaW46IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMik7XG4gIHByb3RlY3RlZCBudW1JbnB1dHM6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgcHJvdGVjdGVkIGlucHV0czogRVZNSW5wdXRbXSA9IFtdO1xuICBwcm90ZWN0ZWQgbnVtRXhwb3J0ZWRPdXRwdXRzOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gIHByb3RlY3RlZCBleHBvcnRlZE91dHB1dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW107XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGRlc3RpbmF0aW9uQ2hhaW4gb2YgdGhlIGlucHV0IGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqLyBcbiAgZ2V0RGVzdGluYXRpb25DaGFpbiA9ICgpOiBCdWZmZXIgPT4gdGhpcy5kZXN0aW5hdGlvbkNoYWluO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbnB1dHMgYXMgYW4gYXJyYXkgb2YgW1tFVk1JbnB1dHNdXVxuICAgKi8gXG4gIGdldElucHV0cyA9ICgpOiBFVk1JbnB1dFtdID0+IHRoaXMuaW5wdXRzO1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBvdXRzIGFzIGFuIGFycmF5IG9mIFtbRVZNT3V0cHV0c11dXG4gICAqLyBcbiAgZ2V0RXhwb3J0ZWRPdXRwdXRzID0gKCk6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0+IHRoaXMuZXhwb3J0ZWRPdXRwdXRzO1xuIFxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0V4cG9ydFR4XV0uXG4gICAqL1xuICB0b0J1ZmZlcigpOiBCdWZmZXIge1xuICAgIGlmKHR5cGVvZiB0aGlzLmRlc3RpbmF0aW9uQ2hhaW4gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRocm93IG5ldyBDaGFpbklkRXJyb3IoXCJFeHBvcnRUeC50b0J1ZmZlciAtLSB0aGlzLmRlc3RpbmF0aW9uQ2hhaW4gaXMgdW5kZWZpbmVkXCIpO1xuICAgIH1cbiAgICB0aGlzLm51bUlucHV0cy53cml0ZVVJbnQzMkJFKHRoaXMuaW5wdXRzLmxlbmd0aCwgMCk7XG4gICAgdGhpcy5udW1FeHBvcnRlZE91dHB1dHMud3JpdGVVSW50MzJCRSh0aGlzLmV4cG9ydGVkT3V0cHV0cy5sZW5ndGgsIDApO1xuICAgIGxldCBiYXJyOiBCdWZmZXJbXSA9IFtzdXBlci50b0J1ZmZlcigpLCB0aGlzLmRlc3RpbmF0aW9uQ2hhaW4sIHRoaXMubnVtSW5wdXRzXTtcbiAgICBsZXQgYnNpemU6IG51bWJlciA9IHN1cGVyLnRvQnVmZmVyKCkubGVuZ3RoICsgdGhpcy5kZXN0aW5hdGlvbkNoYWluLmxlbmd0aCArIHRoaXMubnVtSW5wdXRzLmxlbmd0aDtcbiAgICB0aGlzLmlucHV0cy5mb3JFYWNoKChpbXBvcnRJbjogRVZNSW5wdXQpID0+IHtcbiAgICAgIGJzaXplICs9IGltcG9ydEluLnRvQnVmZmVyKCkubGVuZ3RoO1xuICAgICAgYmFyci5wdXNoKGltcG9ydEluLnRvQnVmZmVyKCkpO1xuICAgIH0pO1xuICAgIGJzaXplICs9IHRoaXMubnVtRXhwb3J0ZWRPdXRwdXRzLmxlbmd0aDtcbiAgICBiYXJyLnB1c2godGhpcy5udW1FeHBvcnRlZE91dHB1dHMpO1xuICAgIHRoaXMuZXhwb3J0ZWRPdXRwdXRzLmZvckVhY2goKG91dDogVHJhbnNmZXJhYmxlT3V0cHV0KSA9PiB7XG4gICAgICBic2l6ZSArPSBvdXQudG9CdWZmZXIoKS5sZW5ndGg7XG4gICAgICBiYXJyLnB1c2gob3V0LnRvQnVmZmVyKCkpO1xuICAgIH0pO1xuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNvZGVzIHRoZSBbW0V4cG9ydFR4XV0gYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBhbmQgcmV0dXJucyB0aGUgc2l6ZS5cbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpO1xuICAgIHRoaXMuZGVzdGluYXRpb25DaGFpbiA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKTtcbiAgICBvZmZzZXQgKz0gMzI7XG4gICAgdGhpcy5udW1JbnB1dHMgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KTtcbiAgICBvZmZzZXQgKz0gNDtcbiAgICBjb25zdCBudW1JbnB1dHM6IG51bWJlciA9IHRoaXMubnVtSW5wdXRzLnJlYWRVSW50MzJCRSgwKTtcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbnVtSW5wdXRzOyBpKyspIHtcbiAgICAgIGNvbnN0IGFuSW46IEVWTUlucHV0ID0gbmV3IEVWTUlucHV0KCk7XG4gICAgICBvZmZzZXQgPSBhbkluLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gICAgICB0aGlzLmlucHV0cy5wdXNoKGFuSW4pO1xuICAgIH1cbiAgICB0aGlzLm51bUV4cG9ydGVkT3V0cHV0cyA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpO1xuICAgIG9mZnNldCArPSA0O1xuICAgIGNvbnN0IG51bUV4cG9ydGVkT3V0cHV0czogbnVtYmVyID0gdGhpcy5udW1FeHBvcnRlZE91dHB1dHMucmVhZFVJbnQzMkJFKDApO1xuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBudW1FeHBvcnRlZE91dHB1dHM7IGkrKykge1xuICAgICAgY29uc3QgYW5PdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoKTtcbiAgICAgIG9mZnNldCA9IGFuT3V0LmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gICAgICB0aGlzLmV4cG9ydGVkT3V0cHV0cy5wdXNoKGFuT3V0KTtcbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tFeHBvcnRUeF1dLlxuICAgKi9cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYmludG9vbHMuYnVmZmVyVG9CNTgodGhpcy50b0J1ZmZlcigpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyB0aGUgYnl0ZXMgb2YgYW4gW1tVbnNpZ25lZFR4XV0gYW5kIHJldHVybnMgYW4gYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAgICAqXG4gICAgICAqIEBwYXJhbSBtc2cgQSBCdWZmZXIgZm9yIHRoZSBbW1Vuc2lnbmVkVHhdXVxuICAgICAgKiBAcGFyYW0ga2MgQW4gW1tLZXlDaGFpbl1dIHVzZWQgaW4gc2lnbmluZ1xuICAgICAgKlxuICAgICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICAgICovXG4gIHNpZ24obXNnOiBCdWZmZXIsIGtjOiBLZXlDaGFpbik6IENyZWRlbnRpYWxbXSB7XG4gICAgY29uc3Qgc2lnczogQ3JlZGVudGlhbFtdID0gc3VwZXIuc2lnbihtc2csIGtjKTtcbiAgICB0aGlzLmlucHV0cy5mb3JFYWNoKChpbnB1dDogRVZNSW5wdXQpID0+IHtcbiAgICAgIGNvbnN0IGNyZWQ6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoaW5wdXQuZ2V0Q3JlZGVudGlhbElEKCkpO1xuICAgICAgY29uc3Qgc2lnaWR4czogU2lnSWR4W10gPSBpbnB1dC5nZXRTaWdJZHhzKCk7XG4gICAgICBzaWdpZHhzLmZvckVhY2goKHNpZ2lkeDogU2lnSWR4KSA9PiB7XG4gICAgICAgIGNvbnN0IGtleXBhaXI6IEtleVBhaXIgPSBrYy5nZXRLZXkoc2lnaWR4LmdldFNvdXJjZSgpKTtcbiAgICAgICAgY29uc3Qgc2lnbnZhbDogQnVmZmVyID0ga2V5cGFpci5zaWduKG1zZyk7XG4gICAgICAgIGNvbnN0IHNpZzogU2lnbmF0dXJlID0gbmV3IFNpZ25hdHVyZSgpO1xuICAgICAgICBzaWcuZnJvbUJ1ZmZlcihzaWdudmFsKTtcbiAgICAgICAgY3JlZC5hZGRTaWduYXR1cmUoc2lnKTtcbiAgICAgIH0pO1xuICAgICAgc2lncy5wdXNoKGNyZWQpO1xuICAgIH0pO1xuICAgIHJldHVybiBzaWdzO1xuICB9XG5cbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhIEV4cG9ydFR4LlxuICAgKlxuICAgKiBAcGFyYW0gbmV0d29ya0lEIE9wdGlvbmFsIG5ldHdvcmtJRFxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIE9wdGlvbmFsIGJsb2NrY2hhaW5JRCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgKiBAcGFyYW0gZGVzdGluYXRpb25DaGFpbiBPcHRpb25hbCBkZXN0aW5hdGlvbkNoYWluLCBkZWZhdWx0IEJ1ZmZlci5hbGxvYygzMiwgMTYpXG4gICAqIEBwYXJhbSBpbnB1dHMgT3B0aW9uYWwgYXJyYXkgb2YgdGhlIFtbRVZNSW5wdXRzXV1zXG4gICAqIEBwYXJhbSBleHBvcnRlZE91dHB1dHMgT3B0aW9uYWwgYXJyYXkgb2YgdGhlIFtbRVZNT3V0cHV0c11dc1xuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgbmV0d29ya0lEOiBudW1iZXIgPSB1bmRlZmluZWQsXG4gICAgYmxvY2tjaGFpbklEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIsIDE2KSxcbiAgICBkZXN0aW5hdGlvbkNoYWluOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIsIDE2KSwgXG4gICAgaW5wdXRzOiBFVk1JbnB1dFtdID0gdW5kZWZpbmVkLCBcbiAgICBleHBvcnRlZE91dHB1dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKG5ldHdvcmtJRCwgYmxvY2tjaGFpbklEKTtcbiAgICB0aGlzLmRlc3RpbmF0aW9uQ2hhaW4gPSBkZXN0aW5hdGlvbkNoYWluO1xuICAgIGlmICh0eXBlb2YgaW5wdXRzICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KGlucHV0cykpIHtcbiAgICAgIGlucHV0cy5mb3JFYWNoKChpbnB1dDogRVZNSW5wdXQpID0+IHtcbiAgICAgICAgaWYgKCEoaW5wdXQgaW5zdGFuY2VvZiBFVk1JbnB1dCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRVZNSW5wdXRFcnJvcihcIkVycm9yIC0gRXhwb3J0VHguY29uc3RydWN0b3I6IGludmFsaWQgRVZNSW5wdXQgaW4gYXJyYXkgcGFyYW1ldGVyICdpbnB1dHMnXCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmKGlucHV0cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGlucHV0cyA9IGlucHV0cy5zb3J0KEVWTUlucHV0LmNvbXBhcmF0b3IoKSk7XG4gICAgICB9XG4gICAgICB0aGlzLmlucHV0cyA9IGlucHV0cztcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBleHBvcnRlZE91dHB1dHMgIT09ICd1bmRlZmluZWQnICYmIEFycmF5LmlzQXJyYXkoZXhwb3J0ZWRPdXRwdXRzKSkge1xuICAgICAgICBleHBvcnRlZE91dHB1dHMuZm9yRWFjaCgoZXhwb3J0ZWRPdXRwdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCkgPT4ge1xuICAgICAgICBpZiAoIShleHBvcnRlZE91dHB1dCBpbnN0YW5jZW9mIFRyYW5zZmVyYWJsZU91dHB1dCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0RXJyb3IoXCJFcnJvciAtIEV4cG9ydFR4LmNvbnN0cnVjdG9yOiBUcmFuc2ZlcmFibGVPdXRwdXQgRVZNSW5wdXQgaW4gYXJyYXkgcGFyYW1ldGVyICdleHBvcnRlZE91dHB1dHMnXCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuZXhwb3J0ZWRPdXRwdXRzID0gZXhwb3J0ZWRPdXRwdXRzO1xuICAgIH1cbiAgfVxufSAgIl19