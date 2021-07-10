"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tx = exports.UnsignedTx = exports.SelectTxClass = void 0;
/**
 * @packageDocumentation
 * @module API-AVM-Transactions
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const credentials_1 = require("./credentials");
const tx_1 = require("../../common/tx");
const create_hash_1 = __importDefault(require("create-hash"));
const basetx_1 = require("./basetx");
const createassettx_1 = require("./createassettx");
const operationtx_1 = require("./operationtx");
const importtx_1 = require("./importtx");
const exporttx_1 = require("./exporttx");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Takes a buffer representing the output and returns the proper [[BaseTx]] instance.
 *
 * @param txtype The id of the transaction type
 *
 * @returns An instance of an [[BaseTx]]-extended class.
 */
exports.SelectTxClass = (txtype, ...args) => {
    if (txtype === constants_1.AVMConstants.BASETX) {
        return new basetx_1.BaseTx(...args);
    }
    else if (txtype === constants_1.AVMConstants.CREATEASSETTX) {
        return new createassettx_1.CreateAssetTx(...args);
    }
    else if (txtype === constants_1.AVMConstants.OPERATIONTX) {
        return new operationtx_1.OperationTx(...args);
    }
    else if (txtype === constants_1.AVMConstants.IMPORTTX) {
        return new importtx_1.ImportTx(...args);
    }
    else if (txtype === constants_1.AVMConstants.EXPORTTX) {
        return new exporttx_1.ExportTx(...args);
    }
    /* istanbul ignore next */
    throw new errors_1.TransactionError("Error - SelectTxClass: unknown txtype");
};
class UnsignedTx extends tx_1.StandardUnsignedTx {
    constructor() {
        super(...arguments);
        this._typeName = "UnsignedTx";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.transaction = exports.SelectTxClass(fields["transaction"]["_typeID"]);
        this.transaction.deserialize(fields["transaction"], encoding);
    }
    getTransaction() {
        return this.transaction;
    }
    fromBuffer(bytes, offset = 0) {
        this.codecID = bintools.copyFrom(bytes, offset, offset + 2).readUInt16BE(0);
        offset += 2;
        const txtype = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.transaction = exports.SelectTxClass(txtype);
        return this.transaction.fromBuffer(bytes, offset);
    }
    /**
     * Signs this [[UnsignedTx]] and returns signed [[StandardTx]]
     *
     * @param kc An [[KeyChain]] used in signing
     *
     * @returns A signed [[StandardTx]]
     */
    sign(kc) {
        const txbuff = this.toBuffer();
        const msg = buffer_1.Buffer.from(create_hash_1.default('sha256').update(txbuff).digest());
        const sigs = this.transaction.sign(msg, kc);
        return new Tx(this, sigs);
    }
}
exports.UnsignedTx = UnsignedTx;
class Tx extends tx_1.StandardTx {
    constructor() {
        super(...arguments);
        this._typeName = "Tx";
        this._typeID = undefined;
    }
    //serialize is inherited
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.unsignedTx = new UnsignedTx();
        this.unsignedTx.deserialize(fields["unsignedTx"], encoding);
        this.credentials = [];
        for (let i = 0; i < fields["credentials"].length; i++) {
            const cred = credentials_1.SelectCredentialClass(fields["credentials"][i]["_typeID"]);
            cred.deserialize(fields["credentials"][i], encoding);
            this.credentials.push(cred);
        }
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[Tx]], parses it, populates the class, and returns the length of the Tx in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[Tx]]
     * @param offset A number representing the starting point of the bytes to begin parsing
     *
     * @returns The length of the raw [[Tx]]
     */
    fromBuffer(bytes, offset = 0) {
        this.unsignedTx = new UnsignedTx();
        offset = this.unsignedTx.fromBuffer(bytes, offset);
        const numcreds = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.credentials = [];
        for (let i = 0; i < numcreds; i++) {
            const credid = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
            offset += 4;
            const cred = credentials_1.SelectCredentialClass(credid);
            offset = cred.fromBuffer(bytes, offset);
            this.credentials.push(cred);
        }
        return offset;
    }
}
exports.Tx = Tx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9hdm0vdHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQywyQ0FBMEM7QUFDMUMsK0NBQXFEO0FBR3JELHdDQUFnRTtBQUNoRSw4REFBb0M7QUFDcEMscUNBQWlDO0FBQ2pDLG1EQUErQztBQUMvQywrQ0FBMkM7QUFDM0MseUNBQXFDO0FBQ3JDLHlDQUFxQztBQUVyQywrQ0FBcUQ7QUFFckQ7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWpEOzs7Ozs7R0FNRztBQUNVLFFBQUEsYUFBYSxHQUFHLENBQUMsTUFBYyxFQUFFLEdBQUcsSUFBVyxFQUFVLEVBQUU7SUFDdEUsSUFBSSxNQUFNLEtBQUssd0JBQVksQ0FBQyxNQUFNLEVBQUU7UUFDbEMsT0FBTyxJQUFJLGVBQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO0tBQzNCO1NBQU0sSUFBSSxNQUFNLEtBQUssd0JBQVksQ0FBQyxhQUFhLEVBQUU7UUFDaEQsT0FBTyxJQUFJLDZCQUFhLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUNsQztTQUFNLElBQUksTUFBTSxLQUFLLHdCQUFZLENBQUMsV0FBVyxFQUFFO1FBQzlDLE9BQU8sSUFBSSx5QkFBVyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUE7S0FDaEM7U0FBTSxJQUFJLE1BQU0sS0FBSyx3QkFBWSxDQUFDLFFBQVEsRUFBRTtRQUMzQyxPQUFPLElBQUksbUJBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFBO0tBQzdCO1NBQU0sSUFBSSxNQUFNLEtBQUssd0JBQVksQ0FBQyxRQUFRLEVBQUU7UUFDM0MsT0FBTyxJQUFJLG1CQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUM3QjtJQUNELDBCQUEwQjtJQUMxQixNQUFNLElBQUkseUJBQWdCLENBQUMsdUNBQXVDLENBQUMsQ0FBQTtBQUNyRSxDQUFDLENBQUE7QUFHRCxNQUFhLFVBQVcsU0FBUSx1QkFBNkM7SUFBN0U7O1FBQ1ksY0FBUyxHQUFHLFlBQVksQ0FBQTtRQUN4QixZQUFPLEdBQUcsU0FBUyxDQUFBO0lBcUMvQixDQUFDO0lBbkNDLHdCQUF3QjtJQUV4QixXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDbkMsSUFBSSxDQUFDLFdBQVcsR0FBRyxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFBO1FBQ2xFLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUMvRCxDQUFDO0lBRUQsY0FBYztRQUNaLE9BQU8sSUFBSSxDQUFDLFdBQXFCLENBQUE7SUFDbkMsQ0FBQztJQUVELFVBQVUsQ0FBQyxLQUFhLEVBQUUsU0FBaUIsQ0FBQztRQUMxQyxJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzNFLE1BQU0sSUFBSSxDQUFDLENBQUE7UUFDWCxNQUFNLE1BQU0sR0FBVyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNuRixNQUFNLElBQUksQ0FBQyxDQUFBO1FBQ1gsSUFBSSxDQUFDLFdBQVcsR0FBRyxxQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO0lBQ25ELENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxJQUFJLENBQUMsRUFBWTtRQUNmLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUM5QixNQUFNLEdBQUcsR0FBVyxlQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7UUFDN0UsTUFBTSxJQUFJLEdBQWlCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUN6RCxPQUFPLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUMzQixDQUFDO0NBRUY7QUF2Q0QsZ0NBdUNDO0FBRUQsTUFBYSxFQUFHLFNBQVEsZUFBeUM7SUFBakU7O1FBQ1ksY0FBUyxHQUFHLElBQUksQ0FBQTtRQUNoQixZQUFPLEdBQUcsU0FBUyxDQUFBO0lBd0MvQixDQUFDO0lBdENDLHdCQUF3QjtJQUV4QixXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDbkMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFBO1FBQ2xDLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUMzRCxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQTtRQUNyQixLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3RCxNQUFNLElBQUksR0FBZSxtQ0FBcUIsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQTtZQUNuRixJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQTtZQUNwRCxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUM1QjtJQUNILENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsVUFBVSxDQUFDLEtBQWEsRUFBRSxTQUFpQixDQUFDO1FBQzFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQTtRQUNsQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBQ2xELE1BQU0sUUFBUSxHQUFXLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3JGLE1BQU0sSUFBSSxDQUFDLENBQUE7UUFDWCxJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQTtRQUNyQixLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3pDLE1BQU0sTUFBTSxHQUFXLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQ25GLE1BQU0sSUFBSSxDQUFDLENBQUE7WUFDWCxNQUFNLElBQUksR0FBZSxtQ0FBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUN0RCxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFDdkMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDNUI7UUFDRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7Q0FFRjtBQTFDRCxnQkEwQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktQVZNLVRyYW5zYWN0aW9uc1xuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJ1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uLy4uL3V0aWxzL2JpbnRvb2xzJ1xuaW1wb3J0IHsgQVZNQ29uc3RhbnRzIH0gZnJvbSAnLi9jb25zdGFudHMnXG5pbXBvcnQgeyBTZWxlY3RDcmVkZW50aWFsQ2xhc3MgfSBmcm9tICcuL2NyZWRlbnRpYWxzJ1xuaW1wb3J0IHsgS2V5Q2hhaW4sIEtleVBhaXIgfSBmcm9tICcuL2tleWNoYWluJ1xuaW1wb3J0IHsgQ3JlZGVudGlhbCB9IGZyb20gJy4uLy4uL2NvbW1vbi9jcmVkZW50aWFscydcbmltcG9ydCB7IFN0YW5kYXJkVHgsIFN0YW5kYXJkVW5zaWduZWRUeCB9IGZyb20gJy4uLy4uL2NvbW1vbi90eCdcbmltcG9ydCBjcmVhdGVIYXNoIGZyb20gJ2NyZWF0ZS1oYXNoJ1xuaW1wb3J0IHsgQmFzZVR4IH0gZnJvbSAnLi9iYXNldHgnXG5pbXBvcnQgeyBDcmVhdGVBc3NldFR4IH0gZnJvbSAnLi9jcmVhdGVhc3NldHR4J1xuaW1wb3J0IHsgT3BlcmF0aW9uVHggfSBmcm9tICcuL29wZXJhdGlvbnR4J1xuaW1wb3J0IHsgSW1wb3J0VHggfSBmcm9tICcuL2ltcG9ydHR4J1xuaW1wb3J0IHsgRXhwb3J0VHggfSBmcm9tICcuL2V4cG9ydHR4J1xuaW1wb3J0IHsgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSAnLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvbidcbmltcG9ydCB7IFRyYW5zYWN0aW9uRXJyb3IgfSBmcm9tICcuLi8uLi91dGlscy9lcnJvcnMnXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogVGFrZXMgYSBidWZmZXIgcmVwcmVzZW50aW5nIHRoZSBvdXRwdXQgYW5kIHJldHVybnMgdGhlIHByb3BlciBbW0Jhc2VUeF1dIGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSB0eHR5cGUgVGhlIGlkIG9mIHRoZSB0cmFuc2FjdGlvbiB0eXBlXG4gKlxuICogQHJldHVybnMgQW4gaW5zdGFuY2Ugb2YgYW4gW1tCYXNlVHhdXS1leHRlbmRlZCBjbGFzcy5cbiAqL1xuZXhwb3J0IGNvbnN0IFNlbGVjdFR4Q2xhc3MgPSAodHh0eXBlOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogQmFzZVR4ID0+IHtcbiAgaWYgKHR4dHlwZSA9PT0gQVZNQ29uc3RhbnRzLkJBU0VUWCkge1xuICAgIHJldHVybiBuZXcgQmFzZVR4KC4uLmFyZ3MpXG4gIH0gZWxzZSBpZiAodHh0eXBlID09PSBBVk1Db25zdGFudHMuQ1JFQVRFQVNTRVRUWCkge1xuICAgIHJldHVybiBuZXcgQ3JlYXRlQXNzZXRUeCguLi5hcmdzKVxuICB9IGVsc2UgaWYgKHR4dHlwZSA9PT0gQVZNQ29uc3RhbnRzLk9QRVJBVElPTlRYKSB7XG4gICAgcmV0dXJuIG5ldyBPcGVyYXRpb25UeCguLi5hcmdzKVxuICB9IGVsc2UgaWYgKHR4dHlwZSA9PT0gQVZNQ29uc3RhbnRzLklNUE9SVFRYKSB7XG4gICAgcmV0dXJuIG5ldyBJbXBvcnRUeCguLi5hcmdzKVxuICB9IGVsc2UgaWYgKHR4dHlwZSA9PT0gQVZNQ29uc3RhbnRzLkVYUE9SVFRYKSB7XG4gICAgcmV0dXJuIG5ldyBFeHBvcnRUeCguLi5hcmdzKVxuICB9XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHRocm93IG5ldyBUcmFuc2FjdGlvbkVycm9yKFwiRXJyb3IgLSBTZWxlY3RUeENsYXNzOiB1bmtub3duIHR4dHlwZVwiKVxufVxuXG5cbmV4cG9ydCBjbGFzcyBVbnNpZ25lZFR4IGV4dGVuZHMgU3RhbmRhcmRVbnNpZ25lZFR4PEtleVBhaXIsIEtleUNoYWluLCBCYXNlVHg+IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVW5zaWduZWRUeFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLnRyYW5zYWN0aW9uID0gU2VsZWN0VHhDbGFzcyhmaWVsZHNbXCJ0cmFuc2FjdGlvblwiXVtcIl90eXBlSURcIl0pXG4gICAgdGhpcy50cmFuc2FjdGlvbi5kZXNlcmlhbGl6ZShmaWVsZHNbXCJ0cmFuc2FjdGlvblwiXSwgZW5jb2RpbmcpXG4gIH1cblxuICBnZXRUcmFuc2FjdGlvbigpOkJhc2VUeHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2FjdGlvbiBhcyBCYXNlVHhcbiAgfVxuXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICB0aGlzLmNvZGVjSUQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAyKS5yZWFkVUludDE2QkUoMClcbiAgICBvZmZzZXQgKz0gMlxuICAgIGNvbnN0IHR4dHlwZTogbnVtYmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCkucmVhZFVJbnQzMkJFKDApXG4gICAgb2Zmc2V0ICs9IDRcbiAgICB0aGlzLnRyYW5zYWN0aW9uID0gU2VsZWN0VHhDbGFzcyh0eHR5cGUpXG4gICAgcmV0dXJuIHRoaXMudHJhbnNhY3Rpb24uZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICB9XG4gIFxuICAvKipcbiAgICogU2lnbnMgdGhpcyBbW1Vuc2lnbmVkVHhdXSBhbmQgcmV0dXJucyBzaWduZWQgW1tTdGFuZGFyZFR4XV1cbiAgICpcbiAgICogQHBhcmFtIGtjIEFuIFtbS2V5Q2hhaW5dXSB1c2VkIGluIHNpZ25pbmdcbiAgICpcbiAgICogQHJldHVybnMgQSBzaWduZWQgW1tTdGFuZGFyZFR4XV1cbiAgICovXG4gIHNpZ24oa2M6IEtleUNoYWluKTogVHgge1xuICAgIGNvbnN0IHR4YnVmZiA9IHRoaXMudG9CdWZmZXIoKVxuICAgIGNvbnN0IG1zZzogQnVmZmVyID0gQnVmZmVyLmZyb20oY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKHR4YnVmZikuZGlnZXN0KCkpXG4gICAgY29uc3Qgc2lnczogQ3JlZGVudGlhbFtdID0gdGhpcy50cmFuc2FjdGlvbi5zaWduKG1zZywga2MpXG4gICAgcmV0dXJuIG5ldyBUeCh0aGlzLCBzaWdzKVxuICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIFR4IGV4dGVuZHMgU3RhbmRhcmRUeDxLZXlQYWlyLCBLZXlDaGFpbiwgVW5zaWduZWRUeD4ge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJUeFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLnVuc2lnbmVkVHggPSBuZXcgVW5zaWduZWRUeCgpXG4gICAgdGhpcy51bnNpZ25lZFR4LmRlc2VyaWFsaXplKGZpZWxkc1tcInVuc2lnbmVkVHhcIl0sIGVuY29kaW5nKVxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBbXVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBmaWVsZHNbXCJjcmVkZW50aWFsc1wiXS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgY3JlZDogQ3JlZGVudGlhbCA9IFNlbGVjdENyZWRlbnRpYWxDbGFzcyhmaWVsZHNbXCJjcmVkZW50aWFsc1wiXVtpXVtcIl90eXBlSURcIl0pXG4gICAgICBjcmVkLmRlc2VyaWFsaXplKGZpZWxkc1tcImNyZWRlbnRpYWxzXCJdW2ldLCBlbmNvZGluZylcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMucHVzaChjcmVkKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUYWtlcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYW4gW1tUeF1dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIFR4IGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbVHhdXVxuICAgKiBAcGFyYW0gb2Zmc2V0IEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgc3RhcnRpbmcgcG9pbnQgb2YgdGhlIGJ5dGVzIHRvIGJlZ2luIHBhcnNpbmdcbiAgICpcbiAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbVHhdXVxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRoaXMudW5zaWduZWRUeCA9IG5ldyBVbnNpZ25lZFR4KClcbiAgICBvZmZzZXQgPSB0aGlzLnVuc2lnbmVkVHguZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIGNvbnN0IG51bWNyZWRzOiBudW1iZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KS5yZWFkVUludDMyQkUoMClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBbXVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBudW1jcmVkczsgaSsrKSB7XG4gICAgICBjb25zdCBjcmVkaWQ6IG51bWJlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpLnJlYWRVSW50MzJCRSgwKVxuICAgICAgb2Zmc2V0ICs9IDRcbiAgICAgIGNvbnN0IGNyZWQ6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoY3JlZGlkKVxuICAgICAgb2Zmc2V0ID0gY3JlZC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgICB0aGlzLmNyZWRlbnRpYWxzLnB1c2goY3JlZClcbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbn1cbiJdfQ==