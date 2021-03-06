"use strict";
/**
 * @packageDocumentation
 * @module API-AVM-Credentials
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NFTCredential = exports.SECPCredential = exports.SelectCredentialClass = void 0;
const constants_1 = require("./constants");
const credentials_1 = require("../../common/credentials");
const errors_1 = require("../../utils/errors");
/**
 * Takes a buffer representing the credential and returns the proper [[Credential]] instance.
 *
 * @param credid A number representing the credential ID parsed prior to the bytes passed in
 *
 * @returns An instance of an [[Credential]]-extended class.
 */
exports.SelectCredentialClass = (credid, ...args) => {
    if (credid === constants_1.AVMConstants.SECPCREDENTIAL || credid === constants_1.AVMConstants.SECPCREDENTIAL_CODECONE) {
        return new SECPCredential(...args);
    }
    if (credid === constants_1.AVMConstants.NFTCREDENTIAL || credid === constants_1.AVMConstants.NFTCREDENTIAL_CODECONE) {
        return new NFTCredential(...args);
    }
    /* istanbul ignore next */
    throw new errors_1.CredIdError("Error - SelectCredentialClass: unknown credid");
};
class SECPCredential extends credentials_1.Credential {
    constructor() {
        super(...arguments);
        this._typeName = "SECPCredential";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.SECPCREDENTIAL : constants_1.AVMConstants.SECPCREDENTIAL_CODECONE;
    }
    //serialize and deserialize both are inherited
    /**
    * Set the codecID
    *
    * @param codecID The codecID to set
    */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - SECPCredential.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.SECPCREDENTIAL : constants_1.AVMConstants.SECPCREDENTIAL_CODECONE;
    }
    getCredentialID() {
        return this._typeID;
    }
    clone() {
        let newbase = new SECPCredential();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new SECPCredential(...args);
    }
    select(id, ...args) {
        let newbasetx = exports.SelectCredentialClass(id, ...args);
        return newbasetx;
    }
}
exports.SECPCredential = SECPCredential;
class NFTCredential extends credentials_1.Credential {
    constructor() {
        super(...arguments);
        this._typeName = "NFTCredential";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.NFTCREDENTIAL : constants_1.AVMConstants.NFTCREDENTIAL_CODECONE;
    }
    //serialize and deserialize both are inherited
    /**
    * Set the codecID
    *
    * @param codecID The codecID to set
    */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - NFTCredential.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.NFTCREDENTIAL : constants_1.AVMConstants.NFTCREDENTIAL_CODECONE;
    }
    getCredentialID() {
        return this._typeID;
    }
    clone() {
        let newbase = new NFTCredential();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new NFTCredential(...args);
    }
    select(id, ...args) {
        let newbasetx = exports.SelectCredentialClass(id, ...args);
        return newbasetx;
    }
}
exports.NFTCredential = NFTCredential;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlZGVudGlhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9hdm0vY3JlZGVudGlhbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7O0FBRUgsMkNBQTBDO0FBQzFDLDBEQUFxRDtBQUNyRCwrQ0FBOEQ7QUFFOUQ7Ozs7OztHQU1HO0FBQ1UsUUFBQSxxQkFBcUIsR0FBRyxDQUFDLE1BQWMsRUFBRSxHQUFHLElBQVcsRUFBYyxFQUFFO0lBQ2xGLElBQUksTUFBTSxLQUFLLHdCQUFZLENBQUMsY0FBYyxJQUFJLE1BQU0sS0FBSyx3QkFBWSxDQUFDLHVCQUF1QixFQUFFO1FBQzdGLE9BQU8sSUFBSSxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUNuQztJQUFDLElBQUksTUFBTSxLQUFLLHdCQUFZLENBQUMsYUFBYSxJQUFJLE1BQU0sS0FBSyx3QkFBWSxDQUFDLHNCQUFzQixFQUFFO1FBQzdGLE9BQU8sSUFBSSxhQUFhLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQTtLQUNsQztJQUNELDBCQUEwQjtJQUMxQixNQUFNLElBQUksb0JBQVcsQ0FBQywrQ0FBK0MsQ0FBQyxDQUFBO0FBQ3hFLENBQUMsQ0FBQTtBQUVELE1BQWEsY0FBZSxTQUFRLHdCQUFVO0lBQTlDOztRQUNZLGNBQVMsR0FBRyxnQkFBZ0IsQ0FBQTtRQUM1QixhQUFRLEdBQUcsd0JBQVksQ0FBQyxXQUFXLENBQUE7UUFDbkMsWUFBTyxHQUFHLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyx1QkFBdUIsQ0FBQTtJQXFDOUcsQ0FBQztJQW5DQyw4Q0FBOEM7SUFFOUM7Ozs7TUFJRTtJQUNGLFVBQVUsQ0FBQyxPQUFlO1FBQ3hCLElBQUcsT0FBTyxLQUFLLENBQUMsSUFBSSxPQUFPLEtBQUssQ0FBQyxFQUFFO1lBQ2pDLDBCQUEwQjtZQUMxQixNQUFNLElBQUkscUJBQVksQ0FBQyxpRkFBaUYsQ0FBQyxDQUFBO1NBQzFHO1FBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUE7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsdUJBQXVCLENBQUE7SUFDekcsQ0FBQztJQUVELGVBQWU7UUFDYixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUE7SUFDckIsQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLE9BQU8sR0FBbUIsSUFBSSxjQUFjLEVBQUUsQ0FBQTtRQUNsRCxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQ25DLE9BQU8sT0FBZSxDQUFBO0lBQ3hCLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBRyxJQUFXO1FBQ25CLE9BQU8sSUFBSSxjQUFjLENBQUMsR0FBRyxJQUFJLENBQVMsQ0FBQTtJQUM1QyxDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQVUsRUFBRSxHQUFHLElBQVc7UUFDL0IsSUFBSSxTQUFTLEdBQWUsNkJBQXFCLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUE7UUFDOUQsT0FBTyxTQUFTLENBQUE7SUFDbEIsQ0FBQztDQUVGO0FBeENELHdDQXdDQztBQUVELE1BQWEsYUFBYyxTQUFRLHdCQUFVO0lBQTdDOztRQUNZLGNBQVMsR0FBRyxlQUFlLENBQUE7UUFDM0IsYUFBUSxHQUFHLHdCQUFZLENBQUMsV0FBVyxDQUFBO1FBQ25DLFlBQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsc0JBQXNCLENBQUE7SUFxQzVHLENBQUM7SUFuQ0MsOENBQThDO0lBRTlDOzs7O01BSUU7SUFDRixVQUFVLENBQUMsT0FBZTtRQUN4QixJQUFHLE9BQU8sS0FBSyxDQUFDLElBQUksT0FBTyxLQUFLLENBQUMsRUFBRTtZQUNqQywwQkFBMEI7WUFDMUIsTUFBTSxJQUFJLHFCQUFZLENBQUMsZ0ZBQWdGLENBQUMsQ0FBQTtTQUN6RztRQUNELElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFBO1FBQ3ZCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLHNCQUFzQixDQUFBO0lBQ3ZHLENBQUM7SUFFRCxlQUFlO1FBQ2IsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFBO0lBQ3JCLENBQUM7SUFFRCxLQUFLO1FBQ0gsSUFBSSxPQUFPLEdBQWtCLElBQUksYUFBYSxFQUFFLENBQUE7UUFDaEQsT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtRQUNuQyxPQUFPLE9BQWUsQ0FBQTtJQUN4QixDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQUcsSUFBVztRQUNuQixPQUFPLElBQUksYUFBYSxDQUFDLEdBQUcsSUFBSSxDQUFTLENBQUE7SUFDM0MsQ0FBQztJQUVELE1BQU0sQ0FBQyxFQUFVLEVBQUUsR0FBRyxJQUFXO1FBQy9CLElBQUksU0FBUyxHQUFlLDZCQUFxQixDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQzlELE9BQU8sU0FBUyxDQUFBO0lBQ2xCLENBQUM7Q0FFRjtBQXhDRCxzQ0F3Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktQVZNLUNyZWRlbnRpYWxzXG4gKi9cblxuaW1wb3J0IHsgQVZNQ29uc3RhbnRzIH0gZnJvbSAnLi9jb25zdGFudHMnXG5pbXBvcnQgeyBDcmVkZW50aWFsIH0gZnJvbSAnLi4vLi4vY29tbW9uL2NyZWRlbnRpYWxzJ1xuaW1wb3J0IHsgQ3JlZElkRXJyb3IsIENvZGVjSWRFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzL2Vycm9ycydcblxuLyoqXG4gKiBUYWtlcyBhIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIGNyZWRlbnRpYWwgYW5kIHJldHVybnMgdGhlIHByb3BlciBbW0NyZWRlbnRpYWxdXSBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0gY3JlZGlkIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgY3JlZGVudGlhbCBJRCBwYXJzZWQgcHJpb3IgdG8gdGhlIGJ5dGVzIHBhc3NlZCBpblxuICpcbiAqIEByZXR1cm5zIEFuIGluc3RhbmNlIG9mIGFuIFtbQ3JlZGVudGlhbF1dLWV4dGVuZGVkIGNsYXNzLlxuICovXG5leHBvcnQgY29uc3QgU2VsZWN0Q3JlZGVudGlhbENsYXNzID0gKGNyZWRpZDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IENyZWRlbnRpYWwgPT4ge1xuICBpZiAoY3JlZGlkID09PSBBVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUwgfHwgY3JlZGlkID09PSBBVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUxfQ09ERUNPTkUpIHtcbiAgICByZXR1cm4gbmV3IFNFQ1BDcmVkZW50aWFsKC4uLmFyZ3MpXG4gIH0gaWYgKGNyZWRpZCA9PT0gQVZNQ29uc3RhbnRzLk5GVENSRURFTlRJQUwgfHwgY3JlZGlkID09PSBBVk1Db25zdGFudHMuTkZUQ1JFREVOVElBTF9DT0RFQ09ORSkge1xuICAgIHJldHVybiBuZXcgTkZUQ3JlZGVudGlhbCguLi5hcmdzKVxuICB9XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHRocm93IG5ldyBDcmVkSWRFcnJvcihcIkVycm9yIC0gU2VsZWN0Q3JlZGVudGlhbENsYXNzOiB1bmtub3duIGNyZWRpZFwiKVxufVxuXG5leHBvcnQgY2xhc3MgU0VDUENyZWRlbnRpYWwgZXh0ZW5kcyBDcmVkZW50aWFsIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiU0VDUENyZWRlbnRpYWxcIlxuICBwcm90ZWN0ZWQgX2NvZGVjSUQgPSBBVk1Db25zdGFudHMuTEFURVNUQ09ERUNcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB0aGlzLl9jb2RlY0lEID09PSAwID8gQVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMIDogQVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMX0NPREVDT05FXG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIC8qKlxuICAqIFNldCB0aGUgY29kZWNJRFxuICAqXG4gICogQHBhcmFtIGNvZGVjSUQgVGhlIGNvZGVjSUQgdG8gc2V0XG4gICovXG4gIHNldENvZGVjSUQoY29kZWNJRDogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYoY29kZWNJRCAhPT0gMCAmJiBjb2RlY0lEICE9PSAxKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IENvZGVjSWRFcnJvcihcIkVycm9yIC0gU0VDUENyZWRlbnRpYWwuc2V0Q29kZWNJRDogaW52YWxpZCBjb2RlY0lELiBWYWxpZCBjb2RlY0lEcyBhcmUgMCBhbmQgMS5cIilcbiAgICB9XG4gICAgdGhpcy5fY29kZWNJRCA9IGNvZGVjSURcbiAgICB0aGlzLl90eXBlSUQgPSB0aGlzLl9jb2RlY0lEID09PSAwID8gQVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMIDogQVZNQ29uc3RhbnRzLlNFQ1BDUkVERU5USUFMX0NPREVDT05FXG4gIH1cblxuICBnZXRDcmVkZW50aWFsSUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICBjbG9uZSgpOnRoaXMge1xuICAgIGxldCBuZXdiYXNlOiBTRUNQQ3JlZGVudGlhbCA9IG5ldyBTRUNQQ3JlZGVudGlhbCgpXG4gICAgbmV3YmFzZS5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3YmFzZSBhcyB0aGlzXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFNFQ1BDcmVkZW50aWFsKC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuXG4gIHNlbGVjdChpZDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IENyZWRlbnRpYWwge1xuICAgIGxldCBuZXdiYXNldHg6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoaWQsIC4uLmFyZ3MpXG4gICAgcmV0dXJuIG5ld2Jhc2V0eFxuICB9XG5cbn1cblxuZXhwb3J0IGNsYXNzIE5GVENyZWRlbnRpYWwgZXh0ZW5kcyBDcmVkZW50aWFsIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiTkZUQ3JlZGVudGlhbFwiXG4gIHByb3RlY3RlZCBfY29kZWNJRCA9IEFWTUNvbnN0YW50cy5MQVRFU1RDT0RFQ1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHRoaXMuX2NvZGVjSUQgPT09IDAgPyBBVk1Db25zdGFudHMuTkZUQ1JFREVOVElBTCA6IEFWTUNvbnN0YW50cy5ORlRDUkVERU5USUFMX0NPREVDT05FXG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIC8qKlxuICAqIFNldCB0aGUgY29kZWNJRFxuICAqXG4gICogQHBhcmFtIGNvZGVjSUQgVGhlIGNvZGVjSUQgdG8gc2V0XG4gICovXG4gIHNldENvZGVjSUQoY29kZWNJRDogbnVtYmVyKTogdm9pZCB7XG4gICAgaWYoY29kZWNJRCAhPT0gMCAmJiBjb2RlY0lEICE9PSAxKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IENvZGVjSWRFcnJvcihcIkVycm9yIC0gTkZUQ3JlZGVudGlhbC5zZXRDb2RlY0lEOiBpbnZhbGlkIGNvZGVjSUQuIFZhbGlkIGNvZGVjSURzIGFyZSAwIGFuZCAxLlwiKVxuICAgIH1cbiAgICB0aGlzLl9jb2RlY0lEID0gY29kZWNJRFxuICAgIHRoaXMuX3R5cGVJRCA9IHRoaXMuX2NvZGVjSUQgPT09IDAgPyBBVk1Db25zdGFudHMuTkZUQ1JFREVOVElBTCA6IEFWTUNvbnN0YW50cy5ORlRDUkVERU5USUFMX0NPREVDT05FXG4gIH1cblxuICBnZXRDcmVkZW50aWFsSUQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZUlEXG4gIH1cblxuICBjbG9uZSgpOnRoaXMge1xuICAgIGxldCBuZXdiYXNlOiBORlRDcmVkZW50aWFsID0gbmV3IE5GVENyZWRlbnRpYWwoKVxuICAgIG5ld2Jhc2UuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpXG4gICAgcmV0dXJuIG5ld2Jhc2UgYXMgdGhpc1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBORlRDcmVkZW50aWFsKC4uLmFyZ3MpIGFzIHRoaXNcbiAgfVxuXG4gIHNlbGVjdChpZDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IENyZWRlbnRpYWwge1xuICAgIGxldCBuZXdiYXNldHg6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoaWQsIC4uLmFyZ3MpXG4gICAgcmV0dXJuIG5ld2Jhc2V0eFxuICB9XG5cbn1cbiJdfQ==