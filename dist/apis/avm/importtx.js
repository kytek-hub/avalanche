"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportTx = void 0;
/**
 * @packageDocumentation
 * @module API-AVM-ImportTx
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const inputs_1 = require("./inputs");
const basetx_1 = require("./basetx");
const credentials_1 = require("./credentials");
const credentials_2 = require("../../common/credentials");
const constants_2 = require("../../utils/constants");
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
     * @param sourceChain Optional chainid for the source inputs to import. Default platform chainid.
     * @param importIns Array of [[TransferableInput]]s used in the transaction
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, sourceChain = undefined, importIns = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "ImportTx";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.IMPORTTX : constants_1.AVMConstants.IMPORTTX_CODECONE;
        this.sourceChain = buffer_1.Buffer.alloc(32);
        this.numIns = buffer_1.Buffer.alloc(4);
        this.importIns = [];
        /**
           * Returns the id of the [[ImportTx]]
           */
        this.getTxType = () => {
            return this._typeID;
        };
        /**
         * Returns a {@link https://github.com/feross/buffer|Buffer} for the source chainid.
         */
        this.getSourceChain = () => {
            return this.sourceChain;
        };
        this.sourceChain = sourceChain; // do not correct, if it's wrong it'll bomb on toBuffer
        if (typeof importIns !== "undefined" && Array.isArray(importIns)) {
            for (let i = 0; i < importIns.length; i++) {
                if (!(importIns[i] instanceof inputs_1.TransferableInput)) {
                    throw new errors_1.TransferableInputError(`Error - ImportTx.constructor: invalid TransferableInput in array parameter ${importIns}`);
                }
            }
            this.importIns = importIns;
        }
    }
    serialize(encoding = "hex") {
        const fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { sourceChain: serialization.encoder(this.sourceChain, encoding, buffer, cb58), importIns: this.importIns.map((i) => i.serialize(encoding)) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.sourceChain = serialization.decoder(fields["sourceChain"], encoding, cb58, buffer, 32);
        this.importIns = fields["importIns"].map((i) => {
            let ii = new inputs_1.TransferableInput();
            ii.deserialize(i, encoding);
            return ii;
        });
        this.numIns = buffer_1.Buffer.alloc(4);
        this.numIns.writeUInt32BE(this.importIns.length, 0);
    }
    /**
    * Set the codecID
    *
    * @param codecID The codecID to set
    */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - ImportTx.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.IMPORTTX : constants_1.AVMConstants.IMPORTTX_CODECONE;
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
    clone() {
        let newbase = new ImportTx();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new ImportTx(...args);
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
}
exports.ImportTx = ImportTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0dHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9hdm0vaW1wb3J0dHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQywyQ0FBMEM7QUFFMUMscUNBQTRDO0FBQzVDLHFDQUFpQztBQUNqQywrQ0FBcUQ7QUFDckQsMERBQXdFO0FBRXhFLHFEQUF3RDtBQUN4RCw2REFBNkY7QUFDN0YsK0NBRzJCO0FBRTNCOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNoRSxNQUFNLElBQUksR0FBbUIsTUFBTSxDQUFBO0FBQ25DLE1BQU0sTUFBTSxHQUFtQixRQUFRLENBQUE7QUFFdkM7O0dBRUc7QUFDSCxNQUFhLFFBQVMsU0FBUSxlQUFNO0lBMElsQzs7Ozs7Ozs7OztPQVVHO0lBQ0gsWUFDRSxZQUFvQiw0QkFBZ0IsRUFBRSxlQUF1QixlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDakYsT0FBNkIsU0FBUyxFQUFFLE1BQTJCLFNBQVMsRUFDNUUsT0FBZSxTQUFTLEVBQUUsY0FBc0IsU0FBUyxFQUFFLFlBQWlDLFNBQVM7UUFFckcsS0FBSyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQXpKdkMsY0FBUyxHQUFHLFVBQVUsQ0FBQTtRQUN0QixhQUFRLEdBQUcsd0JBQVksQ0FBQyxXQUFXLENBQUE7UUFDbkMsWUFBTyxHQUFHLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxpQkFBaUIsQ0FBQTtRQXNCdEYsZ0JBQVcsR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3RDLFdBQU0sR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2hDLGNBQVMsR0FBd0IsRUFBRSxDQUFBO1FBZ0I3Qzs7YUFFSztRQUNMLGNBQVMsR0FBRyxHQUFXLEVBQUU7WUFDdkIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFBO1FBQ3JCLENBQUMsQ0FBQTtRQUVEOztXQUVHO1FBQ0gsbUJBQWMsR0FBRyxHQUFXLEVBQUU7WUFDNUIsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFBO1FBQ3pCLENBQUMsQ0FBQTtRQW9HQyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQSxDQUFDLHVEQUF1RDtRQUN0RixJQUFJLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2hFLEtBQUssSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNqRCxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFlBQVksMEJBQWlCLENBQUMsRUFBRTtvQkFDaEQsTUFBTSxJQUFJLCtCQUFzQixDQUFDLDhFQUE4RSxTQUFTLEVBQUUsQ0FBQyxDQUFBO2lCQUM1SDthQUNGO1lBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7U0FDM0I7SUFDSCxDQUFDO0lBL0pELFNBQVMsQ0FBQyxXQUErQixLQUFLO1FBQzVDLE1BQU0sTUFBTSxHQUFXLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDaEQsdUNBQ0ssTUFBTSxLQUNULFdBQVcsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFDNUUsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQzVEO0lBQ0gsQ0FBQztJQUNELFdBQVcsQ0FBQyxNQUFjLEVBQUUsV0FBK0IsS0FBSztRQUM5RCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUNuQyxJQUFJLENBQUMsV0FBVyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQzNGLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQVMsRUFBcUIsRUFBRTtZQUN4RSxJQUFJLEVBQUUsR0FBc0IsSUFBSSwwQkFBaUIsRUFBRSxDQUFBO1lBQ25ELEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFBO1lBQzNCLE9BQU8sRUFBRSxDQUFBO1FBQ1gsQ0FBQyxDQUFDLENBQUE7UUFDRixJQUFJLENBQUMsTUFBTSxHQUFHLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDckQsQ0FBQztJQU1EOzs7O01BSUU7SUFDRixVQUFVLENBQUMsT0FBZTtRQUN4QixJQUFHLE9BQU8sS0FBSyxDQUFDLElBQUksT0FBTyxLQUFLLENBQUMsRUFBRTtZQUNqQywwQkFBMEI7WUFDMUIsTUFBTSxJQUFJLHFCQUFZLENBQUMsMkVBQTJFLENBQUMsQ0FBQTtTQUNwRztRQUNELElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFBO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLGlCQUFpQixDQUFBO0lBQzdGLENBQUM7SUFnQkQ7Ozs7Ozs7O1NBUUs7SUFDTCxVQUFVLENBQUMsS0FBYSxFQUFFLFNBQWlCLENBQUM7UUFDMUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBQ3hDLElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQTtRQUNoRSxNQUFNLElBQUksRUFBRSxDQUFBO1FBQ1osSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQzFELE1BQU0sSUFBSSxDQUFDLENBQUE7UUFDWCxNQUFNLE1BQU0sR0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsRCxLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3ZDLE1BQU0sSUFBSSxHQUFzQixJQUFJLDBCQUFpQixFQUFFLENBQUE7WUFDdkQsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBQ3ZDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1NBQzFCO1FBQ0QsT0FBTyxNQUFNLENBQUE7SUFDZixDQUFDO0lBRUQ7O09BRUc7SUFDSCxRQUFRO1FBQ04sSUFBRyxPQUFPLElBQUksQ0FBQyxXQUFXLEtBQUssV0FBVyxFQUFFO1lBQzFDLE1BQU0sSUFBSSxxQkFBWSxDQUFDLG9EQUFvRCxDQUFDLENBQUE7U0FDN0U7UUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNuRCxJQUFJLElBQUksR0FBYSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUN0RSxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLDBCQUFpQixDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUE7UUFDcEUsS0FBSyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3RELElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1NBQ3hDO1FBQ0QsT0FBTyxlQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzVCLENBQUM7SUFDRDs7U0FFSztJQUNMLGVBQWU7UUFDYixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUE7SUFDdkIsQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLE9BQU8sR0FBYSxJQUFJLFFBQVEsRUFBRSxDQUFBO1FBQ3RDLE9BQU8sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7UUFDbkMsT0FBTyxPQUFlLENBQUE7SUFDeEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFHLElBQVc7UUFDbkIsT0FBTyxJQUFJLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBUyxDQUFBO0lBQ3RDLENBQUM7SUFFRDs7Ozs7OztTQU9LO0lBQ0wsSUFBSSxDQUFDLEdBQVcsRUFBRSxFQUFZO1FBQzVCLE1BQU0sSUFBSSxHQUFpQixLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUM5QyxLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdEQsTUFBTSxJQUFJLEdBQWUsbUNBQXFCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFBO1lBQzlGLE1BQU0sT0FBTyxHQUFhLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUE7WUFDbkUsS0FBSyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQy9DLE1BQU0sT0FBTyxHQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUE7Z0JBQzFELE1BQU0sT0FBTyxHQUFXLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7Z0JBQ3pDLE1BQU0sR0FBRyxHQUFjLElBQUksdUJBQVMsRUFBRSxDQUFBO2dCQUN0QyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFBO2dCQUN2QixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ3ZCO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUNoQjtRQUNELE9BQU8sSUFBSSxDQUFBO0lBQ2IsQ0FBQztDQTZCRjtBQXJLRCw0QkFxS0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktQVZNLUltcG9ydFR4XG4gKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IHsgQVZNQ29uc3RhbnRzIH0gZnJvbSBcIi4vY29uc3RhbnRzXCJcbmltcG9ydCB7IFRyYW5zZmVyYWJsZU91dHB1dCB9IGZyb20gXCIuL291dHB1dHNcIlxuaW1wb3J0IHsgVHJhbnNmZXJhYmxlSW5wdXQgfSBmcm9tIFwiLi9pbnB1dHNcIlxuaW1wb3J0IHsgQmFzZVR4IH0gZnJvbSBcIi4vYmFzZXR4XCJcbmltcG9ydCB7IFNlbGVjdENyZWRlbnRpYWxDbGFzcyB9IGZyb20gXCIuL2NyZWRlbnRpYWxzXCJcbmltcG9ydCB7IFNpZ25hdHVyZSwgU2lnSWR4LCBDcmVkZW50aWFsIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9jcmVkZW50aWFsc1wiXG5pbXBvcnQgeyBLZXlDaGFpbiwgS2V5UGFpciB9IGZyb20gXCIuL2tleWNoYWluXCJcbmltcG9ydCB7IERlZmF1bHROZXR3b3JrSUQgfSBmcm9tIFwiLi4vLi4vdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZywgU2VyaWFsaXplZFR5cGUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5pbXBvcnQgeyBDb2RlY0lkRXJyb3IsIFxuICAgICAgICAgQ2hhaW5JZEVycm9yLCBcbiAgVHJhbnNmZXJhYmxlSW5wdXRFcnJvclxufSBmcm9tIFwiLi4vLi4vdXRpbHMvZXJyb3JzXCJcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcbmNvbnN0IGNiNTg6IFNlcmlhbGl6ZWRUeXBlID0gXCJjYjU4XCJcbmNvbnN0IGJ1ZmZlcjogU2VyaWFsaXplZFR5cGUgPSBcIkJ1ZmZlclwiXG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIEltcG9ydCB0cmFuc2FjdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEltcG9ydFR4IGV4dGVuZHMgQmFzZVR4IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiSW1wb3J0VHhcIlxuICBwcm90ZWN0ZWQgX2NvZGVjSUQgPSBBVk1Db25zdGFudHMuTEFURVNUQ09ERUNcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB0aGlzLl9jb2RlY0lEID09PSAwID8gQVZNQ29uc3RhbnRzLklNUE9SVFRYIDogQVZNQ29uc3RhbnRzLklNUE9SVFRYX0NPREVDT05FXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBjb25zdCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgc291cmNlQ2hhaW46IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLnNvdXJjZUNoYWluLCBlbmNvZGluZywgYnVmZmVyLCBjYjU4KSxcbiAgICAgIGltcG9ydEluczogdGhpcy5pbXBvcnRJbnMubWFwKChpKSA9PiBpLnNlcmlhbGl6ZShlbmNvZGluZykpXG4gICAgfVxuICB9XG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5zb3VyY2VDaGFpbiA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJzb3VyY2VDaGFpblwiXSwgZW5jb2RpbmcsIGNiNTgsIGJ1ZmZlciwgMzIpXG4gICAgdGhpcy5pbXBvcnRJbnMgPSBmaWVsZHNbXCJpbXBvcnRJbnNcIl0ubWFwKChpOiBvYmplY3QpOiBUcmFuc2ZlcmFibGVJbnB1dCA9PiB7XG4gICAgICBsZXQgaWk6IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KClcbiAgICAgIGlpLmRlc2VyaWFsaXplKGksIGVuY29kaW5nKVxuICAgICAgcmV0dXJuIGlpXG4gICAgfSlcbiAgICB0aGlzLm51bUlucyA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIHRoaXMubnVtSW5zLndyaXRlVUludDMyQkUodGhpcy5pbXBvcnRJbnMubGVuZ3RoLCAwKVxuICB9XG5cbiAgcHJvdGVjdGVkIHNvdXJjZUNoYWluOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIpXG4gIHByb3RlY3RlZCBudW1JbnM6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICBwcm90ZWN0ZWQgaW1wb3J0SW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cblxuICAvKipcbiAgKiBTZXQgdGhlIGNvZGVjSURcbiAgKlxuICAqIEBwYXJhbSBjb2RlY0lEIFRoZSBjb2RlY0lEIHRvIHNldFxuICAqL1xuICBzZXRDb2RlY0lEKGNvZGVjSUQ6IG51bWJlcik6IHZvaWQge1xuICAgIGlmKGNvZGVjSUQgIT09IDAgJiYgY29kZWNJRCAhPT0gMSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBDb2RlY0lkRXJyb3IoXCJFcnJvciAtIEltcG9ydFR4LnNldENvZGVjSUQ6IGludmFsaWQgY29kZWNJRC4gVmFsaWQgY29kZWNJRHMgYXJlIDAgYW5kIDEuXCIpXG4gICAgfVxuICAgIHRoaXMuX2NvZGVjSUQgPSBjb2RlY0lEXG4gICAgdGhpcy5fdHlwZUlEID0gdGhpcy5fY29kZWNJRCA9PT0gMCA/IEFWTUNvbnN0YW50cy5JTVBPUlRUWCA6IEFWTUNvbnN0YW50cy5JTVBPUlRUWF9DT0RFQ09ORVxuICB9XG5cbiAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaWQgb2YgdGhlIFtbSW1wb3J0VHhdXVxuICAgICAqL1xuICBnZXRUeFR5cGUgPSAoKTogbnVtYmVyID0+IHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgc291cmNlIGNoYWluaWQuXG4gICAqL1xuICBnZXRTb3VyY2VDaGFpbiA9ICgpOiBCdWZmZXIgPT4ge1xuICAgIHJldHVybiB0aGlzLnNvdXJjZUNoYWluXG4gIH1cblxuICAvKipcbiAgICAgKiBUYWtlcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYW4gW1tJbXBvcnRUeF1dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIFtbSW1wb3J0VHhdXSBpbiBieXRlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBieXRlcyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYSByYXcgW1tJbXBvcnRUeF1dXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tJbXBvcnRUeF1dXG4gICAgICpcbiAgICAgKiBAcmVtYXJrcyBhc3N1bWUgbm90LWNoZWNrc3VtbWVkXG4gICAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgdGhpcy5zb3VyY2VDaGFpbiA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDMyKVxuICAgIG9mZnNldCArPSAzMlxuICAgIHRoaXMubnVtSW5zID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICBvZmZzZXQgKz0gNFxuICAgIGNvbnN0IG51bUluczogbnVtYmVyID0gdGhpcy5udW1JbnMucmVhZFVJbnQzMkJFKDApXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IG51bUluczsgaSsrKSB7XG4gICAgICBjb25zdCBhbkluOiBUcmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBUcmFuc2ZlcmFibGVJbnB1dCgpXG4gICAgICBvZmZzZXQgPSBhbkluLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICAgIHRoaXMuaW1wb3J0SW5zLnB1c2goYW5JbilcbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tJbXBvcnRUeF1dLlxuICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBpZih0eXBlb2YgdGhpcy5zb3VyY2VDaGFpbiA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhyb3cgbmV3IENoYWluSWRFcnJvcihcIkltcG9ydFR4LnRvQnVmZmVyIC0tIHRoaXMuc291cmNlQ2hhaW4gaXMgdW5kZWZpbmVkXCIpXG4gICAgfVxuICAgIHRoaXMubnVtSW5zLndyaXRlVUludDMyQkUodGhpcy5pbXBvcnRJbnMubGVuZ3RoLCAwKVxuICAgIGxldCBiYXJyOiBCdWZmZXJbXSA9IFtzdXBlci50b0J1ZmZlcigpLCB0aGlzLnNvdXJjZUNoYWluLCB0aGlzLm51bUluc11cbiAgICB0aGlzLmltcG9ydElucyA9IHRoaXMuaW1wb3J0SW5zLnNvcnQoVHJhbnNmZXJhYmxlSW5wdXQuY29tcGFyYXRvcigpKVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmltcG9ydElucy5sZW5ndGg7IGkrKykge1xuICAgICAgYmFyci5wdXNoKHRoaXMuaW1wb3J0SW5zW2ldLnRvQnVmZmVyKCkpXG4gICAgfVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIpXG4gIH1cbiAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBvZiBbW1RyYW5zZmVyYWJsZUlucHV0XV1zIGluIHRoaXMgdHJhbnNhY3Rpb24uXG4gICAgICovXG4gIGdldEltcG9ydElucHV0cygpOiBUcmFuc2ZlcmFibGVJbnB1dFtdIHtcbiAgICByZXR1cm4gdGhpcy5pbXBvcnRJbnNcbiAgfVxuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGxldCBuZXdiYXNlOiBJbXBvcnRUeCA9IG5ldyBJbXBvcnRUeCgpXG4gICAgbmV3YmFzZS5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3YmFzZSBhcyB0aGlzXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IEltcG9ydFR4KC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgICAqIFRha2VzIHRoZSBieXRlcyBvZiBhbiBbW1Vuc2lnbmVkVHhdXSBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICAgKlxuICAgICAqIEBwYXJhbSBtc2cgQSBCdWZmZXIgZm9yIHRoZSBbW1Vuc2lnbmVkVHhdXVxuICAgICAqIEBwYXJhbSBrYyBBbiBbW0tleUNoYWluXV0gdXNlZCBpbiBzaWduaW5nXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBbW0NyZWRlbnRpYWxdXXNcbiAgICAgKi9cbiAgc2lnbihtc2c6IEJ1ZmZlciwga2M6IEtleUNoYWluKTogQ3JlZGVudGlhbFtdIHtcbiAgICBjb25zdCBzaWdzOiBDcmVkZW50aWFsW10gPSBzdXBlci5zaWduKG1zZywga2MpXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMuaW1wb3J0SW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjcmVkOiBDcmVkZW50aWFsID0gU2VsZWN0Q3JlZGVudGlhbENsYXNzKHRoaXMuaW1wb3J0SW5zW2ldLmdldElucHV0KCkuZ2V0Q3JlZGVudGlhbElEKCkpXG4gICAgICBjb25zdCBzaWdpZHhzOiBTaWdJZHhbXSA9IHRoaXMuaW1wb3J0SW5zW2ldLmdldElucHV0KCkuZ2V0U2lnSWR4cygpXG4gICAgICBmb3IgKGxldCBqOiBudW1iZXIgPSAwOyBqIDwgc2lnaWR4cy5sZW5ndGg7IGorKykge1xuICAgICAgICBjb25zdCBrZXlwYWlyOiBLZXlQYWlyID0ga2MuZ2V0S2V5KHNpZ2lkeHNbal0uZ2V0U291cmNlKCkpXG4gICAgICAgIGNvbnN0IHNpZ252YWw6IEJ1ZmZlciA9IGtleXBhaXIuc2lnbihtc2cpXG4gICAgICAgIGNvbnN0IHNpZzogU2lnbmF0dXJlID0gbmV3IFNpZ25hdHVyZSgpXG4gICAgICAgIHNpZy5mcm9tQnVmZmVyKHNpZ252YWwpXG4gICAgICAgIGNyZWQuYWRkU2lnbmF0dXJlKHNpZylcbiAgICAgIH1cbiAgICAgIHNpZ3MucHVzaChjcmVkKVxuICAgIH1cbiAgICByZXR1cm4gc2lnc1xuICB9XG5cbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiB1bnNpZ25lZCBJbXBvcnQgdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgT3B0aW9uYWwgbmV0d29ya0lELCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIE9wdGlvbmFsIGJsb2NrY2hhaW5JRCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgKiBAcGFyYW0gb3V0cyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICogQHBhcmFtIGlucyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICogQHBhcmFtIHNvdXJjZUNoYWluIE9wdGlvbmFsIGNoYWluaWQgZm9yIHRoZSBzb3VyY2UgaW5wdXRzIHRvIGltcG9ydC4gRGVmYXVsdCBwbGF0Zm9ybSBjaGFpbmlkLlxuICAgKiBAcGFyYW0gaW1wb3J0SW5zIEFycmF5IG9mIFtbVHJhbnNmZXJhYmxlSW5wdXRdXXMgdXNlZCBpbiB0aGUgdHJhbnNhY3Rpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCwgYmxvY2tjaGFpbklEOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIsIDE2KSxcbiAgICBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHVuZGVmaW5lZCwgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZCwgc291cmNlQ2hhaW46IEJ1ZmZlciA9IHVuZGVmaW5lZCwgaW1wb3J0SW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMsIG1lbW8pXG4gICAgdGhpcy5zb3VyY2VDaGFpbiA9IHNvdXJjZUNoYWluIC8vIGRvIG5vdCBjb3JyZWN0LCBpZiBpdCdzIHdyb25nIGl0J2xsIGJvbWIgb24gdG9CdWZmZXJcbiAgICBpZiAodHlwZW9mIGltcG9ydElucyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBBcnJheS5pc0FycmF5KGltcG9ydElucykpIHtcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBpbXBvcnRJbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKCEoaW1wb3J0SW5zW2ldIGluc3RhbmNlb2YgVHJhbnNmZXJhYmxlSW5wdXQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFRyYW5zZmVyYWJsZUlucHV0RXJyb3IoYEVycm9yIC0gSW1wb3J0VHguY29uc3RydWN0b3I6IGludmFsaWQgVHJhbnNmZXJhYmxlSW5wdXQgaW4gYXJyYXkgcGFyYW1ldGVyICR7aW1wb3J0SW5zfWApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuaW1wb3J0SW5zID0gaW1wb3J0SW5zXG4gICAgfVxuICB9XG59Il19