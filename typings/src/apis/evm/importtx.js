"use strict";
/**
 * @packageDocumentation
 * @module API-EVM-ImportTx
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportTx = void 0;
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const outputs_1 = require("./outputs");
const inputs_1 = require("./inputs");
const basetx_1 = require("./basetx");
const credentials_1 = require("./credentials");
const credentials_2 = require("../../common/credentials");
const input_1 = require("../../common/input");
const constants_2 = require("../../utils/constants");
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
/**
 * Class representing an unsigned Import transaction.
 */
class ImportTx extends basetx_1.EVMBaseTx {
    /**
     * Class representing an unsigned Import transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param sourceChainID Optional chainID for the source inputs to import. Default platform chainid.
     * @param importIns Array of [[TransferableInput]]s used in the transaction
     * @param outs Optional array of the [[EVMOutput]]s
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), sourceChainID = buffer_1.Buffer.alloc(32, 16), importIns = undefined, outs = undefined) {
        super(networkID, blockchainID);
        this._typeName = "ImportTx";
        this._typeID = constants_1.EVMConstants.IMPORTTX;
        this.sourceChain = buffer_1.Buffer.alloc(32);
        this.numIns = buffer_1.Buffer.alloc(4);
        this.importIns = [];
        this.numOuts = buffer_1.Buffer.alloc(4);
        this.outs = [];
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
        this.sourceChain = sourceChainID;
        let inputsPassed = false;
        let outputsPassed = false;
        if (typeof importIns !== 'undefined' && Array.isArray(importIns) && importIns.length > 0) {
            importIns.forEach((importIn) => {
                if (!(importIn instanceof inputs_1.TransferableInput)) {
                    throw new errors_1.TransferableInputError("Error - ImportTx.constructor: invalid TransferableInput in array parameter 'importIns'");
                }
            });
            inputsPassed = true;
            this.importIns = importIns;
        }
        if (typeof outs !== 'undefined' && Array.isArray(outs) && outs.length > 0) {
            outs.forEach((out) => {
                if (!(out instanceof outputs_1.EVMOutput)) {
                    throw new errors_1.EVMOutputError("Error - ImportTx.constructor: invalid EVMOutput in array parameter 'outs'");
                }
            });
            if (outs.length > 1) {
                outs = outs.sort(outputs_1.EVMOutput.comparator());
            }
            outputsPassed = true;
            this.outs = outs;
        }
        if (inputsPassed && outputsPassed) {
            this.validateOuts();
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "sourceChain": serializer.encoder(this.sourceChain, encoding, "Buffer", "cb58"), "importIns": this.importIns.map((i) => i.serialize(encoding)) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.sourceChain = serializer.decoder(fields["sourceChain"], encoding, "cb58", "Buffer", 32);
        this.importIns = fields["importIns"].map((i) => {
            let ii = new inputs_1.TransferableInput();
            ii.deserialize(i, encoding);
            return ii;
        });
        this.numIns = buffer_1.Buffer.alloc(4);
        this.numIns.writeUInt32BE(this.importIns.length, 0);
    }
    /**
       * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[ImportTx]], parses it,
       * populates the class, and returns the length of the [[ImportTx]] in bytes.
       *
       * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[ImportTx]]
       * @param offset A number representing the byte offset. Defaults to 0.
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
        this.numOuts = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const numOuts = this.numOuts.readUInt32BE(0);
        for (let i = 0; i < numOuts; i++) {
            const anOut = new outputs_1.EVMOutput();
            offset = anOut.fromBuffer(bytes, offset);
            this.outs.push(anOut);
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
        this.numOuts.writeUInt32BE(this.outs.length, 0);
        let barr = [super.toBuffer(), this.sourceChain, this.numIns];
        let bsize = super.toBuffer().length + this.sourceChain.length + this.numIns.length;
        this.importIns = this.importIns.sort(inputs_1.TransferableInput.comparator());
        this.importIns.forEach((importIn) => {
            bsize += importIn.toBuffer().length;
            barr.push(importIn.toBuffer());
        });
        bsize += this.numOuts.length;
        barr.push(this.numOuts);
        this.outs.forEach((out) => {
            bsize += out.toBuffer().length;
            barr.push(out.toBuffer());
        });
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
       * Returns an array of [[TransferableInput]]s in this transaction.
       */
    getImportInputs() {
        return this.importIns;
    }
    /**
       * Returns an array of [[EVMOutput]]s in this transaction.
       */
    getOuts() {
        return this.outs;
    }
    clone() {
        let newImportTx = new ImportTx();
        newImportTx.fromBuffer(this.toBuffer());
        return newImportTx;
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
        this.importIns.forEach((importIn) => {
            const cred = credentials_1.SelectCredentialClass(importIn.getInput().getCredentialID());
            const sigidxs = importIn.getInput().getSigIdxs();
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
    validateOuts() {
        // This Map enforces uniqueness of pair(address, assetId) for each EVMOutput.
        // For each imported assetID, each ETH-style C-Chain address can 
        // have exactly 1 EVMOutput.
        // Map(2) {
        //   '0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC' => [
        //     'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
        //     'F4MyJcUvq3Rxbqgd4Zs8sUpvwLHApyrp4yxJXe2bAV86Vvp38'
        //   ],
        //   '0xecC3B2968B277b837a81A7181e0b94EB1Ca54EdE' => [
        //     'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z',
        //     '2Df96yHyhNc3vooieNNhyKwrjEfTsV2ReMo5FKjMpr8vwN4Jqy',
        //     'SfSXBzDb9GZ9R2uH61qZKe8nxQHW9KERW9Kq9WRe4vHJZRN3e'
        //   ]
        // }
        const seenAssetSends = new Map();
        this.outs.forEach((evmOutput) => {
            const address = evmOutput.getAddressString();
            const assetId = bintools.cb58Encode(evmOutput.getAssetID());
            if (seenAssetSends.has(address)) {
                const assetsSentToAddress = seenAssetSends.get(address);
                if (assetsSentToAddress.includes(assetId)) {
                    const errorMessage = `Error - ImportTx: duplicate (address, assetId) pair found in outputs: (0x${address}, ${assetId})`;
                    throw new errors_1.EVMOutputError(errorMessage);
                }
                assetsSentToAddress.push(assetId);
            }
            else {
                seenAssetSends.set(address, [assetId]);
            }
        });
        // make sure this transaction pays the required avax fee
        const selectedNetwork = this.getNetworkID();
        const requiredFee = constants_2.Defaults.network[selectedNetwork].C.txFee;
        const feeDiff = new bn_js_1.default(0);
        const avaxAssetID = constants_2.Defaults.network[selectedNetwork].X.avaxAssetID;
        // sum incoming AVAX
        this.importIns.forEach((input) => {
            // only check StandardAmountInputs
            if (input.getInput() instanceof input_1.StandardAmountInput && avaxAssetID === bintools.cb58Encode(input.getAssetID())) {
                const ui = input.getInput();
                const i = ui;
                feeDiff.iadd(i.getAmount());
            }
        });
        // subtract all outgoing AVAX
        this.outs.forEach((evmOutput) => {
            if (avaxAssetID === bintools.cb58Encode(evmOutput.getAssetID())) {
                feeDiff.isub(evmOutput.getAmount());
            }
        });
        if (feeDiff.lt(requiredFee)) {
            const errorMessage = `Error - ${requiredFee} AVAX required for fee and only ${feeDiff} AVAX provided`;
            throw new errors_1.EVMFeeError(errorMessage);
        }
    }
}
exports.ImportTx = ImportTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0dHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9ldm0vaW1wb3J0dHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBRUgsb0NBQWlDO0FBQ2pDLGtEQUF1QjtBQUN2QixvRUFBNEM7QUFDNUMsMkNBQTJDO0FBQzNDLHVDQUFzQztBQUN0QyxxQ0FBNkM7QUFDN0MscUNBQXFDO0FBQ3JDLCtDQUFzRDtBQUN0RCwwREFJa0M7QUFDbEMsOENBQXlEO0FBS3pELHFEQUFtRTtBQUNuRSw2REFHbUM7QUFDbkMsK0NBQXVHO0FBRXZHOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNsRCxNQUFNLFVBQVUsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUU5RDs7R0FFRztBQUNILE1BQWEsUUFBUyxTQUFRLGtCQUFTO0lBd0pyQzs7Ozs7Ozs7T0FRRztJQUNILFlBQ0UsWUFBb0IsNEJBQWdCLEVBQ3BDLGVBQXVCLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUMzQyxnQkFBd0IsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQzVDLFlBQWlDLFNBQVMsRUFDMUMsT0FBb0IsU0FBUztRQUU3QixLQUFLLENBQUMsU0FBUyxFQUFFLFlBQVksQ0FBQyxDQUFBO1FBdkt0QixjQUFTLEdBQUcsVUFBVSxDQUFDO1FBQ3ZCLFlBQU8sR0FBRyx3QkFBWSxDQUFDLFFBQVEsQ0FBQztRQXNCaEMsZ0JBQVcsR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLFdBQU0sR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pDLGNBQVMsR0FBd0IsRUFBRSxDQUFDO1FBQ3BDLFlBQU8sR0FBVyxlQUFNLENBQUMsS0FB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IEBtb2R1bGUgQVBJLUVWTS1JbXBvcnRUeFxuICovXG5cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nO1xuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiO1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uLy4uL3V0aWxzL2JpbnRvb2xzJztcbmltcG9ydCB7IEVWTUNvbnN0YW50cyB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IEVWTU91dHB1dCB9IGZyb20gJy4vb3V0cHV0cyc7XG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVJbnB1dCB9IGZyb20gJy4vaW5wdXRzJztcbmltcG9ydCB7IEVWTUJhc2VUeCB9IGZyb20gJy4vYmFzZXR4JztcbmltcG9ydCB7IFNlbGVjdENyZWRlbnRpYWxDbGFzcyB9IGZyb20gJy4vY3JlZGVudGlhbHMnO1xuaW1wb3J0IHsgXG4gIFNpZ25hdHVyZSwgXG4gIFNpZ0lkeCwgXG4gIENyZWRlbnRpYWwgXG59IGZyb20gJy4uLy4uL2NvbW1vbi9jcmVkZW50aWFscyc7XG5pbXBvcnQgeyBTdGFuZGFyZEFtb3VudElucHV0IH0gZnJvbSAnLi4vLi4vY29tbW9uL2lucHV0JztcbmltcG9ydCB7IFxuICBLZXlDaGFpbiwgXG4gIEtleVBhaXIgXG59IGZyb20gJy4va2V5Y2hhaW4nO1xuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCwgRGVmYXVsdHMgfSBmcm9tICcuLi8uLi91dGlscy9jb25zdGFudHMnO1xuaW1wb3J0IHsgXG4gIFNlcmlhbGl6YXRpb24sIFxuICBTZXJpYWxpemVkRW5jb2RpbmcgXG59IGZyb20gJy4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb24nO1xuaW1wb3J0IHsgQ2hhaW5JZEVycm9yLCBUcmFuc2ZlcmFibGVJbnB1dEVycm9yLCBFVk1PdXRwdXRFcnJvciwgRVZNRmVlRXJyb3IgfSBmcm9tICcuLi8uLi91dGlscy9lcnJvcnMnO1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKTtcbmNvbnN0IHNlcmlhbGl6ZXI6IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKCk7XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIEltcG9ydCB0cmFuc2FjdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIEltcG9ydFR4IGV4dGVuZHMgRVZNQmFzZVR4IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiSW1wb3J0VHhcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSBFVk1Db25zdGFudHMuSU1QT1JUVFg7XG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpO1xuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBcInNvdXJjZUNoYWluXCI6IHNlcmlhbGl6ZXIuZW5jb2Rlcih0aGlzLnNvdXJjZUNoYWluLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJjYjU4XCIpLFxuICAgICAgXCJpbXBvcnRJbnNcIjogdGhpcy5pbXBvcnRJbnMubWFwKChpKSA9PiBpLnNlcmlhbGl6ZShlbmNvZGluZykpXG4gICAgfVxuICB9O1xuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICB0aGlzLnNvdXJjZUNoYWluID0gc2VyaWFsaXplci5kZWNvZGVyKGZpZWxkc1tcInNvdXJjZUNoYWluXCJdLCBlbmNvZGluZywgXCJjYjU4XCIsIFwiQnVmZmVyXCIsIDMyKTtcbiAgICB0aGlzLmltcG9ydElucyA9IGZpZWxkc1tcImltcG9ydEluc1wiXS5tYXAoKGk6b2JqZWN0KSA9PiB7XG4gICAgICBsZXQgaWk6IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KCk7XG4gICAgICBpaS5kZXNlcmlhbGl6ZShpLCBlbmNvZGluZyk7XG4gICAgICByZXR1cm4gaWk7XG4gICAgfSk7XG4gICAgdGhpcy5udW1JbnMgPSBCdWZmZXIuYWxsb2MoNCk7XG4gICAgdGhpcy5udW1JbnMud3JpdGVVSW50MzJCRSh0aGlzLmltcG9ydElucy5sZW5ndGgsIDApO1xuICB9XG5cbiAgcHJvdGVjdGVkIHNvdXJjZUNoYWluOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIpO1xuICBwcm90ZWN0ZWQgbnVtSW5zOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNCk7XG4gIHByb3RlY3RlZCBpbXBvcnRJbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXTtcbiAgcHJvdGVjdGVkIG51bU91dHM6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgcHJvdGVjdGVkIG91dHM6IEVWTU91dHB1dFtdID0gW107XG5cbiAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgaWQgb2YgdGhlIFtbSW1wb3J0VHhdXVxuICAgICAqL1xuICBnZXRUeFR5cGUgPSAoKTogbnVtYmVyID0+IHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIHNvdXJjZSBjaGFpbmlkLlxuICAgKi9cbiAgZ2V0U291cmNlQ2hhaW4gPSAoKTogQnVmZmVyID0+IHtcbiAgICByZXR1cm4gdGhpcy5zb3VyY2VDaGFpbjtcbiAgfVxuXG4gIC8qKlxuICAgICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhbiBbW0ltcG9ydFR4XV0sIHBhcnNlcyBpdCwgXG4gICAgICogcG9wdWxhdGVzIHRoZSBjbGFzcywgYW5kIHJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUgW1tJbXBvcnRUeF1dIGluIGJ5dGVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGJ5dGVzIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhIHJhdyBbW0ltcG9ydFR4XV1cbiAgICAgKiBAcGFyYW0gb2Zmc2V0IEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgYnl0ZSBvZmZzZXQuIERlZmF1bHRzIHRvIDAuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tJbXBvcnRUeF1dXG4gICAgICpcbiAgICAgKiBAcmVtYXJrcyBhc3N1bWUgbm90LWNoZWNrc3VtbWVkXG4gICAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpO1xuICAgIHRoaXMuc291cmNlQ2hhaW4gPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAzMik7XG4gICAgb2Zmc2V0ICs9IDMyO1xuICAgIHRoaXMubnVtSW5zID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCk7XG4gICAgb2Zmc2V0ICs9IDQ7XG4gICAgY29uc3QgbnVtSW5zOiBudW1iZXIgPSB0aGlzLm51bUlucy5yZWFkVUludDMyQkUoMCk7XG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IG51bUluczsgaSsrKSB7XG4gICAgICBjb25zdCBhbkluOiBUcmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBUcmFuc2ZlcmFibGVJbnB1dCgpO1xuICAgICAgb2Zmc2V0ID0gYW5Jbi5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpO1xuICAgICAgdGhpcy5pbXBvcnRJbnMucHVzaChhbkluKTtcbiAgICB9XG4gICAgdGhpcy5udW1PdXRzID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCk7XG4gICAgb2Zmc2V0ICs9IDQ7XG4gICAgY29uc3QgbnVtT3V0czogbnVtYmVyID0gdGhpcy5udW1PdXRzLnJlYWRVSW50MzJCRSgwKTtcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbnVtT3V0czsgaSsrKSB7XG4gICAgICBjb25zdCBhbk91dDogRVZNT3V0cHV0ID0gbmV3IEVWTU91dHB1dCgpO1xuICAgICAgb2Zmc2V0ID0gYW5PdXQuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KTtcbiAgICAgIHRoaXMub3V0cy5wdXNoKGFuT3V0KTtcbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbSW1wb3J0VHhdXS5cbiAgICovXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgaWYodHlwZW9mIHRoaXMuc291cmNlQ2hhaW4gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRocm93IG5ldyBDaGFpbklkRXJyb3IoXCJJbXBvcnRUeC50b0J1ZmZlciAtLSB0aGlzLnNvdXJjZUNoYWluIGlzIHVuZGVmaW5lZFwiKTtcbiAgICB9XG4gICAgdGhpcy5udW1JbnMud3JpdGVVSW50MzJCRSh0aGlzLmltcG9ydElucy5sZW5ndGgsIDApO1xuICAgIHRoaXMubnVtT3V0cy53cml0ZVVJbnQzMkJFKHRoaXMub3V0cy5sZW5ndGgsIDApO1xuICAgIGxldCBiYXJyOiBCdWZmZXJbXSA9IFtzdXBlci50b0J1ZmZlcigpLCB0aGlzLnNvdXJjZUNoYWluLCB0aGlzLm51bUluc107XG4gICAgbGV0IGJzaXplOiBudW1iZXIgPSBzdXBlci50b0J1ZmZlcigpLmxlbmd0aCArIHRoaXMuc291cmNlQ2hhaW4ubGVuZ3RoICsgdGhpcy5udW1JbnMubGVuZ3RoO1xuICAgIHRoaXMuaW1wb3J0SW5zID0gdGhpcy5pbXBvcnRJbnMuc29ydChUcmFuc2ZlcmFibGVJbnB1dC5jb21wYXJhdG9yKCkpO1xuICAgIHRoaXMuaW1wb3J0SW5zLmZvckVhY2goKGltcG9ydEluOiBUcmFuc2ZlcmFibGVJbnB1dCkgPT4ge1xuICAgICAgYnNpemUgKz0gaW1wb3J0SW4udG9CdWZmZXIoKS5sZW5ndGg7XG4gICAgICBiYXJyLnB1c2goaW1wb3J0SW4udG9CdWZmZXIoKSk7XG4gICAgfSk7XG4gICAgYnNpemUgKz0gdGhpcy5udW1PdXRzLmxlbmd0aDtcbiAgICBiYXJyLnB1c2godGhpcy5udW1PdXRzKTtcbiAgICB0aGlzLm91dHMuZm9yRWFjaCgob3V0OiBFVk1PdXRwdXQpID0+IHtcbiAgICAgIGJzaXplICs9IG91dC50b0J1ZmZlcigpLmxlbmd0aDtcbiAgICAgIGJhcnIucHVzaChvdXQudG9CdWZmZXIoKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpO1xuICB9XG5cbiAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhcnJheSBvZiBbW1RyYW5zZmVyYWJsZUlucHV0XV1zIGluIHRoaXMgdHJhbnNhY3Rpb24uXG4gICAgICovXG4gIGdldEltcG9ydElucHV0cygpOiBUcmFuc2ZlcmFibGVJbnB1dFtdIHtcbiAgICByZXR1cm4gdGhpcy5pbXBvcnRJbnM7XG4gIH1cblxuICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIFtbRVZNT3V0cHV0XV1zIGluIHRoaXMgdHJhbnNhY3Rpb24uXG4gICAgICovXG4gIGdldE91dHMoKTogRVZNT3V0cHV0W10ge1xuICAgIHJldHVybiB0aGlzLm91dHM7XG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBsZXQgbmV3SW1wb3J0VHg6IEltcG9ydFR4ID0gbmV3IEltcG9ydFR4KCk7XG4gICAgbmV3SW1wb3J0VHguZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpO1xuICAgIHJldHVybiBuZXdJbXBvcnRUeCBhcyB0aGlzO1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgICByZXR1cm4gbmV3IEltcG9ydFR4KC4uLmFyZ3MpIGFzIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICAgKiBUYWtlcyB0aGUgYnl0ZXMgb2YgYW4gW1tVbnNpZ25lZFR4XV0gYW5kIHJldHVybnMgYW4gYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAgICpcbiAgICAgKiBAcGFyYW0gbXNnIEEgQnVmZmVyIGZvciB0aGUgW1tVbnNpZ25lZFR4XV1cbiAgICAgKiBAcGFyYW0ga2MgQW4gW1tLZXlDaGFpbl1dIHVzZWQgaW4gc2lnbmluZ1xuICAgICAqXG4gICAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgW1tDcmVkZW50aWFsXV1zXG4gICAgICovXG4gIHNpZ24obXNnOiBCdWZmZXIsIGtjOiBLZXlDaGFpbik6IENyZWRlbnRpYWxbXSB7XG4gICAgY29uc3Qgc2lnczogQ3JlZGVudGlhbFtdID0gc3VwZXIuc2lnbihtc2csIGtjKTtcbiAgICB0aGlzLmltcG9ydElucy5mb3JFYWNoKChpbXBvcnRJbjogVHJhbnNmZXJhYmxlSW5wdXQpID0+IHtcbiAgICAgIGNvbnN0IGNyZWQ6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoaW1wb3J0SW4uZ2V0SW5wdXQoKS5nZXRDcmVkZW50aWFsSUQoKSk7XG4gICAgICBjb25zdCBzaWdpZHhzOiBTaWdJZHhbXSA9IGltcG9ydEluLmdldElucHV0KCkuZ2V0U2lnSWR4cygpO1xuICAgICAgc2lnaWR4cy5mb3JFYWNoKChzaWdpZHg6IFNpZ0lkeCkgPT4ge1xuICAgICAgICBjb25zdCBrZXlwYWlyOiBLZXlQYWlyID0ga2MuZ2V0S2V5KHNpZ2lkeC5nZXRTb3VyY2UoKSk7XG4gICAgICAgIGNvbnN0IHNpZ252YWw6IEJ1ZmZlciA9IGtleXBhaXIuc2lnbihtc2cpO1xuICAgICAgICBjb25zdCBzaWc6IFNpZ25hdHVyZSA9IG5ldyBTaWduYXR1cmUoKTtcbiAgICAgICAgc2lnLmZyb21CdWZmZXIoc2lnbnZhbCk7XG4gICAgICAgIGNyZWQuYWRkU2lnbmF0dXJlKHNpZyk7XG4gICAgICB9KTtcbiAgICAgIHNpZ3MucHVzaChjcmVkKTtcbiAgICB9KTtcbiAgICByZXR1cm4gc2lncztcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgSW1wb3J0IHRyYW5zYWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gbmV0d29ya0lEIE9wdGlvbmFsIG5ldHdvcmtJRCwgW1tEZWZhdWx0TmV0d29ya0lEXV1cbiAgICogQHBhcmFtIGJsb2NrY2hhaW5JRCBPcHRpb25hbCBibG9ja2NoYWluSUQsIGRlZmF1bHQgQnVmZmVyLmFsbG9jKDMyLCAxNilcbiAgICogQHBhcmFtIHNvdXJjZUNoYWluSUQgT3B0aW9uYWwgY2hhaW5JRCBmb3IgdGhlIHNvdXJjZSBpbnB1dHMgdG8gaW1wb3J0LiBEZWZhdWx0IHBsYXRmb3JtIGNoYWluaWQuXG4gICAqIEBwYXJhbSBpbXBvcnRJbnMgQXJyYXkgb2YgW1tUcmFuc2ZlcmFibGVJbnB1dF1dcyB1c2VkIGluIHRoZSB0cmFuc2FjdGlvblxuICAgKiBAcGFyYW0gb3V0cyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tFVk1PdXRwdXRdXXNcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCxcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMiwgMTYpLFxuICAgIHNvdXJjZUNoYWluSUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMiwgMTYpLFxuICAgIGltcG9ydEluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHVuZGVmaW5lZCxcbiAgICBvdXRzOiBFVk1PdXRwdXRbXSA9IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRClcbiAgICB0aGlzLnNvdXJjZUNoYWluID0gc291cmNlQ2hhaW5JRDtcbiAgICBsZXQgaW5wdXRzUGFzc2VkOiBib29sZWFuID0gZmFsc2U7XG4gICAgbGV0IG91dHB1dHNQYXNzZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBpZih0eXBlb2YgaW1wb3J0SW5zICE9PSAndW5kZWZpbmVkJyAmJiBBcnJheS5pc0FycmF5KGltcG9ydElucykgJiYgaW1wb3J0SW5zLmxlbmd0aCA+IDApIHtcbiAgICAgIGltcG9ydElucy5mb3JFYWNoKChpbXBvcnRJbjogVHJhbnNmZXJhYmxlSW5wdXQpID0+IHtcbiAgICAgICAgaWYgKCEoaW1wb3J0SW4gaW5zdGFuY2VvZiBUcmFuc2ZlcmFibGVJbnB1dCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHJhbnNmZXJhYmxlSW5wdXRFcnJvcihcIkVycm9yIC0gSW1wb3J0VHguY29uc3RydWN0b3I6IGludmFsaWQgVHJhbnNmZXJhYmxlSW5wdXQgaW4gYXJyYXkgcGFyYW1ldGVyICdpbXBvcnRJbnMnXCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlucHV0c1Bhc3NlZCA9IHRydWU7XG4gICAgICB0aGlzLmltcG9ydElucyA9IGltcG9ydElucztcbiAgICB9XG4gICAgaWYodHlwZW9mIG91dHMgIT09ICd1bmRlZmluZWQnICYmIEFycmF5LmlzQXJyYXkob3V0cykgJiYgb3V0cy5sZW5ndGggPiAwKSB7XG4gICAgICBvdXRzLmZvckVhY2goKG91dDogRVZNT3V0cHV0KSA9PiB7XG4gICAgICAgIGlmICghKG91dCBpbnN0YW5jZW9mIEVWTU91dHB1dCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRVZNT3V0cHV0RXJyb3IoXCJFcnJvciAtIEltcG9ydFR4LmNvbnN0cnVjdG9yOiBpbnZhbGlkIEVWTU91dHB1dCBpbiBhcnJheSBwYXJhbWV0ZXIgJ291dHMnXCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmKG91dHMubGVuZ3RoID4gMSkge1xuICAgICAgICBvdXRzID0gb3V0cy5zb3J0KEVWTU91dHB1dC5jb21wYXJhdG9yKCkpO1xuICAgICAgfVxuICAgICAgb3V0cHV0c1Bhc3NlZCA9IHRydWU7XG4gICAgICB0aGlzLm91dHMgPSBvdXRzO1xuICAgIH1cbiAgICBpZihpbnB1dHNQYXNzZWQgJiYgb3V0cHV0c1Bhc3NlZCkge1xuICAgICAgdGhpcy52YWxpZGF0ZU91dHMoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHZhbGlkYXRlT3V0cygpOiB2b2lkIHtcbiAgICAgIC8vIFRoaXMgTWFwIGVuZm9yY2VzIHVuaXF1ZW5lc3Mgb2YgcGFpcihhZGRyZXNzLCBhc3NldElkKSBmb3IgZWFjaCBFVk1PdXRwdXQuXG4gICAgICAvLyBGb3IgZWFjaCBpbXBvcnRlZCBhc3NldElELCBlYWNoIEVUSC1zdHlsZSBDLUNoYWluIGFkZHJlc3MgY2FuIFxuICAgICAgLy8gaGF2ZSBleGFjdGx5IDEgRVZNT3V0cHV0LlxuICAgICAgLy8gTWFwKDIpIHtcbiAgICAgIC8vICAgJzB4OGRiOTdDN2NFY0UyNDljMmI5OGJEQzAyMjZDYzRDMkE1N0JGNTJGQycgPT4gW1xuICAgICAgLy8gICAgICdGdndFQWhteEtmZWlHOFNuRXZxNDJoYzZ3aFJ5WTNFRllBdmViTXFETkRHQ2d4TjVaJyxcbiAgICAgIC8vICAgICAnRjRNeUpjVXZxM1J4YnFnZDRaczhzVXB2d0xIQXB5cnA0eXhKWGUyYkFWODZWdnAzOCdcbiAgICAgIC8vICAgXSxcbiAgICAgIC8vICAgJzB4ZWNDM0IyOTY4QjI3N2I4MzdhODFBNzE4MWUwYjk0RUIxQ2E1NEVkRScgPT4gW1xuICAgICAgLy8gICAgICdGdndFQWhteEtmZWlHOFNuRXZxNDJoYzZ3aFJ5WTNFRllBdmViTXFETkRHQ2d4TjVaJyxcbiAgICAgIC8vICAgICAnMkRmOTZ5SHloTmMzdm9vaWVOTmh5S3dyakVmVHNWMlJlTW81RktqTXByOHZ3TjRKcXknLFxuICAgICAgLy8gICAgICdTZlNYQnpEYjlHWjlSMnVINjFxWktlOG54UUhXOUtFUlc5S3E5V1JlNHZISlpSTjNlJ1xuICAgICAgLy8gICBdXG4gICAgICAvLyB9XG4gICAgICBjb25zdCBzZWVuQXNzZXRTZW5kczogTWFwPHN0cmluZywgc3RyaW5nW10+ID0gbmV3IE1hcCgpO1xuICAgICAgdGhpcy5vdXRzLmZvckVhY2goKGV2bU91dHB1dDogRVZNT3V0cHV0KTogdm9pZCA9PiB7XG4gICAgICAgIGNvbnN0IGFkZHJlc3M6IHN0cmluZyA9IGV2bU91dHB1dC5nZXRBZGRyZXNzU3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IGFzc2V0SWQ6IHN0cmluZyA9IGJpbnRvb2xzLmNiNThFbmNvZGUoZXZtT3V0cHV0LmdldEFzc2V0SUQoKSk7XG4gICAgICAgIGlmKHNlZW5Bc3NldFNlbmRzLmhhcyhhZGRyZXNzKSkge1xuICAgICAgICAgIGNvbnN0IGFzc2V0c1NlbnRUb0FkZHJlc3M6IHN0cmluZ1tdID0gc2VlbkFzc2V0U2VuZHMuZ2V0KGFkZHJlc3MpO1xuICAgICAgICAgIGlmKGFzc2V0c1NlbnRUb0FkZHJlc3MuaW5jbHVkZXMoYXNzZXRJZCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZTogc3RyaW5nID0gYEVycm9yIC0gSW1wb3J0VHg6IGR1cGxpY2F0ZSAoYWRkcmVzcywgYXNzZXRJZCkgcGFpciBmb3VuZCBpbiBvdXRwdXRzOiAoMHgke2FkZHJlc3N9LCAke2Fzc2V0SWR9KWA7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRVZNT3V0cHV0RXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXNzZXRzU2VudFRvQWRkcmVzcy5wdXNoKGFzc2V0SWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlZW5Bc3NldFNlbmRzLnNldChhZGRyZXNzLCBbYXNzZXRJZF0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIG1ha2Ugc3VyZSB0aGlzIHRyYW5zYWN0aW9uIHBheXMgdGhlIHJlcXVpcmVkIGF2YXggZmVlXG4gICAgICBjb25zdCBzZWxlY3RlZE5ldHdvcms6IG51bWJlciA9IHRoaXMuZ2V0TmV0d29ya0lEKCk7XG4gICAgICBjb25zdCByZXF1aXJlZEZlZTogQk4gPSBEZWZhdWx0cy5uZXR3b3JrW3NlbGVjdGVkTmV0d29ya10uQy50eEZlZTtcbiAgICAgIGNvbnN0IGZlZURpZmY6IEJOID0gbmV3IEJOKDApO1xuICAgICAgY29uc3QgYXZheEFzc2V0SUQ6IHN0cmluZyA9IERlZmF1bHRzLm5ldHdvcmtbc2VsZWN0ZWROZXR3b3JrXS5YLmF2YXhBc3NldElEO1xuICAgICAgLy8gc3VtIGluY29taW5nIEFWQVhcbiAgICAgIHRoaXMuaW1wb3J0SW5zLmZvckVhY2goKGlucHV0OiBUcmFuc2ZlcmFibGVJbnB1dCk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBvbmx5IGNoZWNrIFN0YW5kYXJkQW1vdW50SW5wdXRzXG4gICAgICAgIGlmKGlucHV0LmdldElucHV0KCkgaW5zdGFuY2VvZiBTdGFuZGFyZEFtb3VudElucHV0ICYmIGF2YXhBc3NldElEID09PSBiaW50b29scy5jYjU4RW5jb2RlKGlucHV0LmdldEFzc2V0SUQoKSkpIHtcbiAgICAgICAgICBjb25zdCB1aSA9IGlucHV0LmdldElucHV0KCkgYXMgdW5rbm93bjtcbiAgICAgICAgICBjb25zdCBpID0gdWkgYXMgU3RhbmRhcmRBbW91bnRJbnB1dDtcbiAgICAgICAgICBmZWVEaWZmLmlhZGQoaS5nZXRBbW91bnQoKSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gc3VidHJhY3QgYWxsIG91dGdvaW5nIEFWQVhcbiAgICAgIHRoaXMub3V0cy5mb3JFYWNoKChldm1PdXRwdXQ6IEVWTU91dHB1dCk6IHZvaWQgPT4ge1xuICAgICAgICBpZihhdmF4QXNzZXRJRCA9PT0gYmludG9vbHMuY2I1OEVuY29kZShldm1PdXRwdXQuZ2V0QXNzZXRJRCgpKSkge1xuICAgICAgICAgIGZlZURpZmYuaXN1Yihldm1PdXRwdXQuZ2V0QW1vdW50KCkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGlmKGZlZURpZmYubHQocmVxdWlyZWRGZWUpKSB7XG4gICAgICAgIGNvbnN0IGVycm9yTWVzc2FnZTogc3RyaW5nID0gYEVycm9yIC0gJHtyZXF1aXJlZEZlZX0gQVZBWCByZXF1aXJlZCBmb3IgZmVlIGFuZCBvbmx5ICR7ZmVlRGlmZn0gQVZBWCBwcm92aWRlZGA7XG4gICAgICAgIHRocm93IG5ldyBFVk1GZWVFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgfVxuICB9XG59XG4iXX0=