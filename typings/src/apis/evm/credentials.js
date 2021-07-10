"use strict";
/**
 * @packageDocumentation
 * @module API-EVM-Credentials
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECPCredential = exports.SelectCredentialClass = void 0;
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
    if (credid === constants_1.EVMConstants.SECPCREDENTIAL) {
        return new SECPCredential(...args);
    }
    /* istanbul ignore next */
    throw new errors_1.CredIdError("Error - SelectCredentialClass: unknown credid");
};
class SECPCredential extends credentials_1.Credential {
    constructor() {
        super(...arguments);
        this._typeName = "SECPCredential";
        this._typeID = constants_1.EVMConstants.SECPCREDENTIAL;
    }
    //serialize and deserialize both are inherited
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
        let credential = exports.SelectCredentialClass(id, ...args);
        return credential;
    }
}
exports.SECPCredential = SECPCredential;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlZGVudGlhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9ldm0vY3JlZGVudGlhbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7O0FBRUgsMkNBQTJDO0FBQzNDLDBEQUFzRDtBQUN0RCwrQ0FBaUQ7QUFFakQ7Ozs7OztHQU1HO0FBQ1UsUUFBQSxxQkFBcUIsR0FBRyxDQUFDLE1BQWMsRUFBRSxHQUFHLElBQVcsRUFBYyxFQUFFO0lBQ2xGLElBQUksTUFBTSxLQUFLLHdCQUFZLENBQUMsY0FBYyxFQUFFO1FBQzFDLE9BQU8sSUFBSSxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUNwQztJQUNELDBCQUEwQjtJQUMxQixNQUFNLElBQUksb0JBQVcsQ0FBQywrQ0FBK0MsQ0FBQyxDQUFDO0FBQ3pFLENBQUMsQ0FBQztBQUVGLE1BQWEsY0FBZSxTQUFRLHdCQUFVO0lBQTlDOztRQUNZLGNBQVMsR0FBVyxnQkFBZ0IsQ0FBQztRQUNyQyxZQUFPLEdBQVcsd0JBQVksQ0FBQyxjQUFjLENBQUM7SUFzQjFELENBQUM7SUFwQkMsOENBQThDO0lBRTlDLGVBQWU7UUFDYixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLE9BQU8sR0FBbUIsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUNuRCxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sT0FBZSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBRyxJQUFXO1FBQ25CLE9BQU8sSUFBSSxjQUFjLENBQUMsR0FBRyxJQUFJLENBQVMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQVUsRUFBRSxHQUFHLElBQVc7UUFDL0IsSUFBSSxVQUFVLEdBQWUsNkJBQXFCLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDaEUsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztDQUNGO0FBeEJELHdDQXdCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1FVk0tQ3JlZGVudGlhbHNcbiAqL1xuXG5pbXBvcnQgeyBFVk1Db25zdGFudHMgfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBDcmVkZW50aWFsIH0gZnJvbSAnLi4vLi4vY29tbW9uL2NyZWRlbnRpYWxzJztcbmltcG9ydCB7IENyZWRJZEVycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvZXJyb3JzJztcblxuLyoqXG4gKiBUYWtlcyBhIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIGNyZWRlbnRpYWwgYW5kIHJldHVybnMgdGhlIHByb3BlciBbW0NyZWRlbnRpYWxdXSBpbnN0YW5jZS5cbiAqXG4gKiBAcGFyYW0gY3JlZGlkIEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgY3JlZGVudGlhbCBJRCBwYXJzZWQgcHJpb3IgdG8gdGhlIGJ5dGVzIHBhc3NlZCBpblxuICpcbiAqIEByZXR1cm5zIEFuIGluc3RhbmNlIG9mIGFuIFtbQ3JlZGVudGlhbF1dLWV4dGVuZGVkIGNsYXNzLlxuICovXG5leHBvcnQgY29uc3QgU2VsZWN0Q3JlZGVudGlhbENsYXNzID0gKGNyZWRpZDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IENyZWRlbnRpYWwgPT4ge1xuICBpZiAoY3JlZGlkID09PSBFVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUwpIHtcbiAgICByZXR1cm4gbmV3IFNFQ1BDcmVkZW50aWFsKC4uLmFyZ3MpO1xuICB9XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHRocm93IG5ldyBDcmVkSWRFcnJvcihcIkVycm9yIC0gU2VsZWN0Q3JlZGVudGlhbENsYXNzOiB1bmtub3duIGNyZWRpZFwiKTtcbn07XG5cbmV4cG9ydCBjbGFzcyBTRUNQQ3JlZGVudGlhbCBleHRlbmRzIENyZWRlbnRpYWwge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lOiBzdHJpbmcgPSBcIlNFQ1BDcmVkZW50aWFsXCI7XG4gIHByb3RlY3RlZCBfdHlwZUlEOiBudW1iZXIgPSBFVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUw7XG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIGdldENyZWRlbnRpYWxJRCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90eXBlSUQ7XG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBsZXQgbmV3YmFzZTogU0VDUENyZWRlbnRpYWwgPSBuZXcgU0VDUENyZWRlbnRpYWwoKTtcbiAgICBuZXdiYXNlLmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKTtcbiAgICByZXR1cm4gbmV3YmFzZSBhcyB0aGlzO1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgcmV0dXJuIG5ldyBTRUNQQ3JlZGVudGlhbCguLi5hcmdzKSBhcyB0aGlzO1xuICB9XG5cbiAgc2VsZWN0KGlkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogQ3JlZGVudGlhbCB7XG4gICAgbGV0IGNyZWRlbnRpYWw6IENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoaWQsIC4uLmFyZ3MpO1xuICAgIHJldHVybiBjcmVkZW50aWFsO1xuICB9XG59XG5cbiJdfQ==