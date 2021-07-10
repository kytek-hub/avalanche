"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tx = exports.UnsignedTx = exports.SelectTxClass = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-Transactions
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const credentials_1 = require("./credentials");
const tx_1 = require("../../common/tx");
const create_hash_1 = __importDefault(require("create-hash"));
const basetx_1 = require("./basetx");
const importtx_1 = require("./importtx");
const exporttx_1 = require("./exporttx");
const validationtx_1 = require("./validationtx");
const createsubnettx_1 = require("./createsubnettx");
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
    if (txtype === constants_1.PlatformVMConstants.BASETX) {
        return new basetx_1.BaseTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.IMPORTTX) {
        return new importtx_1.ImportTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.EXPORTTX) {
        return new exporttx_1.ExportTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.ADDDELEGATORTX) {
        return new validationtx_1.AddDelegatorTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.ADDVALIDATORTX) {
        return new validationtx_1.AddValidatorTx(...args);
    }
    else if (txtype === constants_1.PlatformVMConstants.CREATESUBNETTX) {
        return new createsubnettx_1.CreateSubnetTx(...args);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL3R4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFpQztBQUNqQyxvRUFBNEM7QUFDNUMsMkNBQWtEO0FBQ2xELCtDQUFzRDtBQUV0RCx3Q0FBaUU7QUFFakUsOERBQXFDO0FBQ3JDLHFDQUFrQztBQUNsQyx5Q0FBc0M7QUFDdEMseUNBQXNDO0FBRXRDLGlEQUFnRTtBQUNoRSxxREFBa0Q7QUFDbEQsK0NBQXNEO0FBRXREOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVqRDs7Ozs7O0dBTUc7QUFDVSxRQUFBLGFBQWEsR0FBRyxDQUFDLE1BQWMsRUFBRSxHQUFHLElBQVcsRUFBVSxFQUFFO0lBQ3RFLElBQUksTUFBTSxLQUFLLCtCQUFtQixDQUFDLE1BQU0sRUFBRTtRQUN6QyxPQUFPLElBQUksZUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDNUI7U0FBTSxJQUFJLE1BQU0sS0FBSywrQkFBbUIsQ0FBQyxRQUFRLEVBQUU7UUFDbEQsT0FBTyxJQUFJLG1CQUFRLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUM5QjtTQUFNLElBQUksTUFBTSxLQUFLLCtCQUFtQixDQUFDLFFBQVEsRUFBRTtRQUNsRCxPQUFPLElBQUksbUJBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQzlCO1NBQU0sSUFBSSxNQUFNLEtBQUssK0JBQW1CLENBQUMsY0FBYyxFQUFFO1FBQ3hELE9BQU8sSUFBSSw2QkFBYyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDcEM7U0FBTSxJQUFJLE1BQU0sS0FBSywrQkFBbUIsQ0FBQyxjQUFjLEVBQUU7UUFDeEQsT0FBTyxJQUFJLDZCQUFjLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUNwQztTQUFN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QUssRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN4QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QjtRQUNELE9BQU8sTUFBTSxDQUFDO0lBQ2hCLENBQUM7Q0FFRjtBQTFDRCxnQkEwQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktUGxhdGZvcm1WTS1UcmFuc2FjdGlvbnNcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLyc7XG5pbXBvcnQgQmluVG9vbHMgZnJvbSAnLi4vLi4vdXRpbHMvYmludG9vbHMnO1xuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IFNlbGVjdENyZWRlbnRpYWxDbGFzcyB9IGZyb20gJy4vY3JlZGVudGlhbHMnO1xuaW1wb3J0IHsgS2V5Q2hhaW4sIEtleVBhaXIgfSBmcm9tICcuL2tleWNoYWluJztcbmltcG9ydCB7IFN0YW5kYXJkVHgsIFN0YW5kYXJkVW5zaWduZWRUeCB9IGZyb20gJy4uLy4uL2NvbW1vbi90eCc7XG5pbXBvcnQgeyBDcmVkZW50aWFsIH0gZnJvbSAnLi4vLi4vY29tbW9uL2NyZWRlbnRpYWxzJztcbmltcG9ydCBjcmVhdGVIYXNoIGZyb20gJ2NyZWF0ZS1oYXNoJztcbmltcG9ydCB7IEJhc2VUeCB9IGZyb20gJy4vYmFzZXR4JztcbmltcG9ydCB7IEltcG9ydFR4IH0gZnJvbSAnLi9pbXBvcnR0eCc7XG5pbXBvcnQgeyBFeHBvcnRUeCB9IGZyb20gJy4vZXhwb3J0dHgnO1xuaW1wb3J0IHsgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSAnLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvbic7XG5pbXBvcnQgeyBBZGREZWxlZ2F0b3JUeCwgQWRkVmFsaWRhdG9yVHggfSBmcm9tICcuL3ZhbGlkYXRpb250eCc7XG5pbXBvcnQgeyBDcmVhdGVTdWJuZXRUeCB9IGZyb20gJy4vY3JlYXRlc3VibmV0dHgnO1xuaW1wb3J0IHsgVHJhbnNhY3Rpb25FcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzL2Vycm9ycyc7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogVGFrZXMgYSBidWZmZXIgcmVwcmVzZW50aW5nIHRoZSBvdXRwdXQgYW5kIHJldHVybnMgdGhlIHByb3BlciBbW0Jhc2VUeF1dIGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSB0eHR5cGUgVGhlIGlkIG9mIHRoZSB0cmFuc2FjdGlvbiB0eXBlXG4gKlxuICogQHJldHVybnMgQW4gaW5zdGFuY2Ugb2YgYW4gW1tCYXNlVHhdXS1leHRlbmRlZCBjbGFzcy5cbiAqL1xuZXhwb3J0IGNvbnN0IFNlbGVjdFR4Q2xhc3MgPSAodHh0eXBlOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogQmFzZVR4ID0+IHtcbiAgaWYgKHR4dHlwZSA9PT0gUGxhdGZvcm1WTUNvbnN0YW50cy5CQVNFVFgpIHtcbiAgICByZXR1cm4gbmV3IEJhc2VUeCguLi5hcmdzKTtcbiAgfSBlbHNlIGlmICh0eHR5cGUgPT09IFBsYXRmb3JtVk1Db25zdGFudHMuSU1QT1JUVFgpIHtcbiAgICByZXR1cm4gbmV3IEltcG9ydFR4KC4uLmFyZ3MpO1xuICB9IGVsc2UgaWYgKHR4dHlwZSA9PT0gUGxhdGZvcm1WTUNvbnN0YW50cy5FWFBPUlRUWCkge1xuICAgIHJldHVybiBuZXcgRXhwb3J0VHgoLi4uYXJncyk7XG4gIH0gZWxzZSBpZiAodHh0eXBlID09PSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkFERERFTEVHQVRPUlRYKSB7XG4gICAgcmV0dXJuIG5ldyBBZGREZWxlZ2F0b3JUeCguLi5hcmdzKTtcbiAgfSBlbHNlIGlmICh0eHR5cGUgPT09IFBsYXRmb3JtVk1Db25zdGFudHMuQUREVkFMSURBVE9SVFgpIHtcbiAgICByZXR1cm4gbmV3IEFkZFZhbGlkYXRvclR4KC4uLmFyZ3MpO1xuICB9IGVsc2UgaWYgKHR4dHlwZSA9PT0gUGxhdGZvcm1WTUNvbnN0YW50cy5DUkVBVEVTVUJORVRUWCkge1xuICAgIHJldHVybiBuZXcgQ3JlYXRlU3VibmV0VHgoLi4uYXJncyk7XG4gIH0gXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHRocm93IG5ldyBUcmFuc2FjdGlvbkVycm9yKFwiRXJyb3IgLSBTZWxlY3RUeENsYXNzOiB1bmtub3duIHR4dHlwZVwiKTtcbn07XG5cbmV4cG9ydCBjbGFzcyBVbnNpZ25lZFR4IGV4dGVuZHMgU3RhbmRhcmRVbnNpZ25lZFR4PEtleVBhaXIsIEtleUNoYWluLCBCYXNlVHg+IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVW5zaWduZWRUeFwiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICAvL3NlcmlhbGl6ZSBpcyBpbmhlcml0ZWRcblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6b2JqZWN0LCBlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgdGhpcy50cmFuc2FjdGlvbiA9IFNlbGVjdFR4Q2xhc3MoZmllbGRzW1widHJhbnNhY3Rpb25cIl1bXCJfdHlwZUlEXCJdKTtcbiAgICB0aGlzLnRyYW5zYWN0aW9uLmRlc2VyaWFsaXplKGZpZWxkc1tcInRyYW5zYWN0aW9uXCJdLCBlbmNvZGluZyk7XG4gIH1cblxuICBnZXRUcmFuc2FjdGlvbigpOkJhc2VUeHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2FjdGlvbiBhcyBCYXNlVHg7XG4gIH0gXG5cbiAgZnJvbUJ1ZmZlcihieXRlczpCdWZmZXIsIG9mZnNldDpudW1iZXIgPSAwKTpudW1iZXIge1xuICAgIHRoaXMuY29kZWNJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDIpLnJlYWRVSW50MTZCRSgwKTtcbiAgICBvZmZzZXQgKz0gMjtcbiAgICBjb25zdCB0eHR5cGU6bnVtYmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCkucmVhZFVJbnQzMkJFKDApO1xuICAgIG9mZnNldCArPSA0O1xuICAgIHRoaXMudHJhbnNhY3Rpb24gPSBTZWxlY3RUeENsYXNzKHR4dHlwZSk7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNhY3Rpb24uZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTaWducyB0aGlzIFtbVW5zaWduZWRUeF1dIGFuZCByZXR1cm5zIHNpZ25lZCBbW1N0YW5kYXJkVHhdXVxuICAgKlxuICAgKiBAcGFyYW0ga2MgQW4gW1tLZXlDaGFpbl1dIHVzZWQgaW4gc2lnbmluZ1xuICAgKlxuICAgKiBAcmV0dXJucyBBIHNpZ25lZCBbW1N0YW5kYXJkVHhdXVxuICAgKi9cbiAgc2lnbihrYzpLZXlDaGFpbik6VHgge1xuICAgIGNvbnN0IHR4YnVmZiA9IHRoaXMudG9CdWZmZXIoKTtcbiAgICBjb25zdCBtc2c6QnVmZmVyID0gQnVmZmVyLmZyb20oY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKHR4YnVmZikuZGlnZXN0KCkpO1xuICAgIGNvbnN0IHNpZ3M6IENyZWRlbnRpYWxbXSA9IHRoaXMudHJhbnNhY3Rpb24uc2lnbihtc2csIGtjKTtcbiAgICByZXR1cm4gbmV3IFR4KHRoaXMsIHNpZ3MpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUeCBleHRlbmRzIFN0YW5kYXJkVHg8S2V5UGFpciwgS2V5Q2hhaW4sIFVuc2lnbmVkVHg+IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVHhcIjtcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWQ7XG5cbiAgLy9zZXJpYWxpemUgaXMgaW5oZXJpdGVkXG5cbiAgZGVzZXJpYWxpemUoZmllbGRzOm9iamVjdCwgZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpO1xuICAgIHRoaXMudW5zaWduZWRUeCA9IG5ldyBVbnNpZ25lZFR4KCk7XG4gICAgdGhpcy51bnNpZ25lZFR4LmRlc2VyaWFsaXplKGZpZWxkc1tcInVuc2lnbmVkVHhcIl0sIGVuY29kaW5nKTtcbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gW107XG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGZpZWxkc1tcImNyZWRlbnRpYWxzXCJdLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjcmVkOkNyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoZmllbGRzW1wiY3JlZGVudGlhbHNcIl1baV1bXCJfdHlwZUlEXCJdKTtcbiAgICAgIGNyZWQuZGVzZXJpYWxpemUoZmllbGRzW1wiY3JlZGVudGlhbHNcIl1baV0sIGVuY29kaW5nKTtcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMucHVzaChjcmVkKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGFuIFtbVHhdXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBUeCBpbiBieXRlcy5cbiAgICpcbiAgICogQHBhcmFtIGJ5dGVzIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhIHJhdyBbW1R4XV1cbiAgICogQHBhcmFtIG9mZnNldCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIHN0YXJ0aW5nIHBvaW50IG9mIHRoZSBieXRlcyB0byBiZWdpbiBwYXJzaW5nXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsZW5ndGggb2YgdGhlIHJhdyBbW1R4XV1cbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6QnVmZmVyLCBvZmZzZXQ6bnVtYmVyID0gMCk6bnVtYmVyIHtcbiAgICB0aGlzLnVuc2lnbmVkVHggPSBuZXcgVW5zaWduZWRUeCgpO1xuICAgIG9mZnNldCA9IHRoaXMudW5zaWduZWRUeC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpO1xuICAgIGNvbnN0IG51bWNyZWRzOm51bWJlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpLnJlYWRVSW50MzJCRSgwKTtcbiAgICBvZmZzZXQgKz0gNDtcbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gW107XG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IG51bWNyZWRzOyBpKyspIHtcbiAgICAgIGNvbnN0IGNyZWRpZDpudW1iZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KS5yZWFkVUludDMyQkUoMCk7XG4gICAgICBvZmZzZXQgKz0gNDtcbiAgICAgIGNvbnN0IGNyZWQ6Q3JlZGVudGlhbCA9IFNlbGVjdENyZWRlbnRpYWxDbGFzcyhjcmVkaWQpO1xuICAgICAgb2Zmc2V0ID0gY3JlZC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpO1xuICAgICAgdGhpcy5jcmVkZW50aWFscy5wdXNoKGNyZWQpO1xuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0O1xuICB9XG5cbn1cbiJdfQ==