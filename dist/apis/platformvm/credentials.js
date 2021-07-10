"use strict";
/**
 * @packageDocumentation
 * @module API-PlatformVM-Credentials
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
    if (credid === constants_1.PlatformVMConstants.SECPCREDENTIAL) {
        return new SECPCredential(...args);
    }
    /* istanbul ignore next */
    throw new errors_1.CredIdError("Error - SelectCredentialClass: unknown credid");
};
class SECPCredential extends credentials_1.Credential {
    constructor() {
        super(...arguments);
        this._typeName = "SECPCredential";
        this._typeID = constants_1.PlatformVMConstants.SECPCREDENTIAL;
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
        let newbasetx = exports.SelectCredentialClass(id, ...args);
        return newbasetx;
    }
}
exports.SECPCredential = SECPCredential;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlZGVudGlhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL2NyZWRlbnRpYWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7OztBQUVILDJDQUFrRDtBQUNsRCwwREFBc0Q7QUFDdEQsK0NBQWlEO0FBRWpEOzs7Ozs7R0FNRztBQUNVLFFBQUEscUJBQXFCLEdBQUcsQ0FBQyxNQUFjLEVBQUUsR0FBRyxJQUFXLEVBQWMsRUFBRTtJQUNsRixJQUFJLE1BQU0sS0FBSywrQkFBbUIsQ0FBQyxjQUFjLEVBQUU7UUFDakQsT0FBTyxJQUFJLGNBQWMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQ3BDO0lBQ0QsMEJBQTBCO0lBQzFCLE1BQU0sSUFBSSxvQkFBVyxDQUFDLCtDQUErQyxDQUFDLENBQUM7QUFDekUsQ0FBQyxDQUFDO0FBRUYsTUFBYSxjQUFlLFNBQVEsd0JBQVU7SUFBOUM7O1FBQ1ksY0FBUyxHQUFHLGdCQUFnQixDQUFDO1FBQzdCLFlBQU8sR0FBRywrQkFBbUIsQ0FBQyxjQUFjLENBQUM7SUF1QnpELENBQUM7SUFyQkMsOENBQThDO0lBRTlDLGVBQWU7UUFDYixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDdEIsQ0FBQztJQUdELEtBQUs7UUFDSCxJQUFJLE9BQU8sR0FBa0IsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUNsRCxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQ3BDLE9BQU8sT0FBZSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBRyxJQUFVO1FBQ2xCLE9BQU8sSUFBSSxjQUFjLENBQUMsR0FBRyxJQUFJLENBQVMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQVMsRUFBRSxHQUFHLElBQVU7UUFDN0IsSUFBSSxTQUFTLEdBQWMsNkJBQXFCLENBQUMsRUFBRSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDOUQsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQztDQUNGO0FBekJELHdDQXlCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1QbGF0Zm9ybVZNLUNyZWRlbnRpYWxzXG4gKi9cblxuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IENyZWRlbnRpYWwgfSBmcm9tICcuLi8uLi9jb21tb24vY3JlZGVudGlhbHMnO1xuaW1wb3J0IHsgQ3JlZElkRXJyb3IgfSBmcm9tICcuLi8uLi91dGlscy9lcnJvcnMnO1xuXG4vKipcbiAqIFRha2VzIGEgYnVmZmVyIHJlcHJlc2VudGluZyB0aGUgY3JlZGVudGlhbCBhbmQgcmV0dXJucyB0aGUgcHJvcGVyIFtbQ3JlZGVudGlhbF1dIGluc3RhbmNlLlxuICpcbiAqIEBwYXJhbSBjcmVkaWQgQSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBjcmVkZW50aWFsIElEIHBhcnNlZCBwcmlvciB0byB0aGUgYnl0ZXMgcGFzc2VkIGluXG4gKlxuICogQHJldHVybnMgQW4gaW5zdGFuY2Ugb2YgYW4gW1tDcmVkZW50aWFsXV0tZXh0ZW5kZWQgY2xhc3MuXG4gKi9cbmV4cG9ydCBjb25zdCBTZWxlY3RDcmVkZW50aWFsQ2xhc3MgPSAoY3JlZGlkOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogQ3JlZGVudGlhbCA9PiB7XG4gIGlmIChjcmVkaWQgPT09IFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUwpIHtcbiAgICByZXR1cm4gbmV3IFNFQ1BDcmVkZW50aWFsKC4uLmFyZ3MpO1xuICB9XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIHRocm93IG5ldyBDcmVkSWRFcnJvcihcIkVycm9yIC0gU2VsZWN0Q3JlZGVudGlhbENsYXNzOiB1bmtub3duIGNyZWRpZFwiKTtcbn07XG5cbmV4cG9ydCBjbGFzcyBTRUNQQ3JlZGVudGlhbCBleHRlbmRzIENyZWRlbnRpYWwge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTRUNQQ3JlZGVudGlhbFwiO1xuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IFBsYXRmb3JtVk1Db25zdGFudHMuU0VDUENSRURFTlRJQUw7XG5cbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIGdldENyZWRlbnRpYWxJRCgpOm51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRDtcbiAgfVxuXG5cbiAgY2xvbmUoKTp0aGlzIHtcbiAgICBsZXQgbmV3YmFzZTpTRUNQQ3JlZGVudGlhbCA9IG5ldyBTRUNQQ3JlZGVudGlhbCgpO1xuICAgIG5ld2Jhc2UuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpO1xuICAgIHJldHVybiBuZXdiYXNlIGFzIHRoaXM7XG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczphbnlbXSk6dGhpcyB7XG4gICAgcmV0dXJuIG5ldyBTRUNQQ3JlZGVudGlhbCguLi5hcmdzKSBhcyB0aGlzO1xuICB9XG5cbiAgc2VsZWN0KGlkOm51bWJlciwgLi4uYXJnczphbnlbXSk6Q3JlZGVudGlhbCB7XG4gICAgbGV0IG5ld2Jhc2V0eDpDcmVkZW50aWFsID0gU2VsZWN0Q3JlZGVudGlhbENsYXNzKGlkLCAuLi5hcmdzKTtcbiAgICByZXR1cm4gbmV3YmFzZXR4O1xuICB9XG59XG5cbiJdfQ==