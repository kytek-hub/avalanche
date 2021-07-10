"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthAPI = void 0;
const jrpcapi_1 = require("../../common/jrpcapi");
/**
 * Class for interacting with a node's AuthAPI.
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
class AuthAPI extends jrpcapi_1.JRPCAPI {
    constructor(core, baseurl = "/ext/auth") {
        super(core, baseurl);
        /**
        * Creates a new authorization token that grants access to one or more API endpoints.
        *
        * @param password This node's authorization token password, set through the CLI when the node was launched.
        * @param endpoints A list of endpoints that will be accessible using the generated token. If there"s an element that is "*", this token can reach any endpoint.
        *
        * @returns Returns a Promise<string> containing the authorization token.
        */
        this.newToken = (password, endpoints) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                password,
                endpoints
            };
            const response = yield this.callMethod("auth.newToken", params);
            return response.data.result.token;
        });
        /**
        * Revokes an authorization token, removing all of its rights to access endpoints.
        *
        * @param password This node's authorization token password, set through the CLI when the node was launched.
        * @param token An authorization token whose access should be revoked.
        *
        * @returns Returns a Promise<boolean> indicating if a token was successfully revoked.
        */
        this.revokeToken = (password, token) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                password,
                token
            };
            const response = yield this.callMethod("auth.revokeToken", params);
            return response.data.result.success;
        });
        /**
        * Change this node's authorization token password. **Any authorization tokens created under an old password will become invalid.**
        *
        * @param oldPassword This node's authorization token password, set through the CLI when the node was launched.
        * @param newPassword A new password for this node's authorization token issuance.
        *
        * @returns Returns a Promise<boolean> indicating if the password was successfully changed.
        */
        this.changePassword = (oldPassword, newPassword) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                oldPassword,
                newPassword
            };
            const response = yield this.callMethod("auth.changePassword", params);
            return response.data.result.success;
        });
    }
}
exports.AuthAPI = AuthAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvYXV0aC9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBS0Esa0RBQThDO0FBRzlDOzs7Ozs7R0FNRztBQUNILE1BQWEsT0FBUSxTQUFRLGlCQUFPO0lBcURsQyxZQUFZLElBQW1CLEVBQUUsVUFBa0IsV0FBVztRQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFwRHJGOzs7Ozs7O1VBT0U7UUFDSCxhQUFRLEdBQUcsQ0FBTyxRQUFnQixFQUFFLFNBQW1CLEVBQW1CLEVBQUU7WUFDMUUsTUFBTSxNQUFNLEdBQVE7Z0JBQ2xCLFFBQVE7Z0JBQ1IsU0FBUzthQUNWLENBQUE7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUNwRixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQTtRQUNuQyxDQUFDLENBQUEsQ0FBQTtRQUdEOzs7Ozs7O1VBT0U7UUFDRixnQkFBVyxHQUFHLENBQU8sUUFBZ0IsRUFBRSxLQUFhLEVBQW9CLEVBQUU7WUFDeEUsTUFBTSxNQUFNLEdBQVE7Z0JBQ2xCLFFBQVE7Z0JBQ1IsS0FBSzthQUNOLENBQUE7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBQ3ZGLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFBO1FBQ3JDLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7Ozs7VUFPRTtRQUNGLG1CQUFjLEdBQUcsQ0FBTyxXQUFtQixFQUFFLFdBQW1CLEVBQW9CLEVBQUU7WUFDcEYsTUFBTSxNQUFNLEdBQVE7Z0JBQ2xCLFdBQVc7Z0JBQ1gsV0FBVzthQUNaLENBQUE7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLHFCQUFxQixFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBQzFGLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFBO1FBQ3JDLENBQUMsQ0FBQSxDQUFBO0lBRXNGLENBQUM7Q0FDekY7QUF0REQsMEJBc0RDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4qIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuKiBAbW9kdWxlIEFQSS1BdXRoXG4qL1xuaW1wb3J0IEF2YWxhbmNoZUNvcmUgZnJvbSBcIi4uLy4uL2F2YWxhbmNoZVwiXG5pbXBvcnQgeyBKUlBDQVBJIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9qcnBjYXBpXCJcbmltcG9ydCB7IFJlcXVlc3RSZXNwb25zZURhdGEgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2FwaWJhc2VcIlxuXG4vKipcbiAqIENsYXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgbm9kZSdzIEF1dGhBUEkuXG4gKlxuICogQGNhdGVnb3J5IFJQQ0FQSXNcbiAqXG4gKiBAcmVtYXJrcyBUaGlzIGV4dGVuZHMgdGhlIFtbSlJQQ0FQSV1dIGNsYXNzLiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgZGlyZWN0bHkgY2FsbGVkLiBJbnN0ZWFkLCB1c2UgdGhlIFtbQXZhbGFuY2hlLmFkZEFQSV1dIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIHRoaXMgaW50ZXJmYWNlIHdpdGggQXZhbGFuY2hlLlxuICovXG5leHBvcnQgY2xhc3MgQXV0aEFQSSBleHRlbmRzIEpSUENBUEkge1xuICAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgYXV0aG9yaXphdGlvbiB0b2tlbiB0aGF0IGdyYW50cyBhY2Nlc3MgdG8gb25lIG9yIG1vcmUgQVBJIGVuZHBvaW50cy5cbiAgICpcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoaXMgbm9kZSdzIGF1dGhvcml6YXRpb24gdG9rZW4gcGFzc3dvcmQsIHNldCB0aHJvdWdoIHRoZSBDTEkgd2hlbiB0aGUgbm9kZSB3YXMgbGF1bmNoZWQuXG4gICAqIEBwYXJhbSBlbmRwb2ludHMgQSBsaXN0IG9mIGVuZHBvaW50cyB0aGF0IHdpbGwgYmUgYWNjZXNzaWJsZSB1c2luZyB0aGUgZ2VuZXJhdGVkIHRva2VuLiBJZiB0aGVyZVwicyBhbiBlbGVtZW50IHRoYXQgaXMgXCIqXCIsIHRoaXMgdG9rZW4gY2FuIHJlYWNoIGFueSBlbmRwb2ludC5cbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2U8c3RyaW5nPiBjb250YWluaW5nIHRoZSBhdXRob3JpemF0aW9uIHRva2VuLlxuICAgKi9cbiAgbmV3VG9rZW4gPSBhc3luYyAocGFzc3dvcmQ6IHN0cmluZywgZW5kcG9pbnRzOiBzdHJpbmdbXSk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICBwYXNzd29yZCxcbiAgICAgIGVuZHBvaW50c1xuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcImF1dGgubmV3VG9rZW5cIiwgcGFyYW1zKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC50b2tlblxuICB9XG5cblxuICAvKipcbiAgKiBSZXZva2VzIGFuIGF1dGhvcml6YXRpb24gdG9rZW4sIHJlbW92aW5nIGFsbCBvZiBpdHMgcmlnaHRzIHRvIGFjY2VzcyBlbmRwb2ludHMuXG4gICpcbiAgKiBAcGFyYW0gcGFzc3dvcmQgVGhpcyBub2RlJ3MgYXV0aG9yaXphdGlvbiB0b2tlbiBwYXNzd29yZCwgc2V0IHRocm91Z2ggdGhlIENMSSB3aGVuIHRoZSBub2RlIHdhcyBsYXVuY2hlZC5cbiAgKiBAcGFyYW0gdG9rZW4gQW4gYXV0aG9yaXphdGlvbiB0b2tlbiB3aG9zZSBhY2Nlc3Mgc2hvdWxkIGJlIHJldm9rZWQuXG4gICpcbiAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZTxib29sZWFuPiBpbmRpY2F0aW5nIGlmIGEgdG9rZW4gd2FzIHN1Y2Nlc3NmdWxseSByZXZva2VkLlxuICAqL1xuICByZXZva2VUb2tlbiA9IGFzeW5jIChwYXNzd29yZDogc3RyaW5nLCB0b2tlbjogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICBwYXNzd29yZCxcbiAgICAgIHRva2VuXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwiYXV0aC5yZXZva2VUb2tlblwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnN1Y2Nlc3NcbiAgfVxuXG4gIC8qKlxuICAqIENoYW5nZSB0aGlzIG5vZGUncyBhdXRob3JpemF0aW9uIHRva2VuIHBhc3N3b3JkLiAqKkFueSBhdXRob3JpemF0aW9uIHRva2VucyBjcmVhdGVkIHVuZGVyIGFuIG9sZCBwYXNzd29yZCB3aWxsIGJlY29tZSBpbnZhbGlkLioqXG4gICpcbiAgKiBAcGFyYW0gb2xkUGFzc3dvcmQgVGhpcyBub2RlJ3MgYXV0aG9yaXphdGlvbiB0b2tlbiBwYXNzd29yZCwgc2V0IHRocm91Z2ggdGhlIENMSSB3aGVuIHRoZSBub2RlIHdhcyBsYXVuY2hlZC5cbiAgKiBAcGFyYW0gbmV3UGFzc3dvcmQgQSBuZXcgcGFzc3dvcmQgZm9yIHRoaXMgbm9kZSdzIGF1dGhvcml6YXRpb24gdG9rZW4gaXNzdWFuY2UuXG4gICpcbiAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZTxib29sZWFuPiBpbmRpY2F0aW5nIGlmIHRoZSBwYXNzd29yZCB3YXMgc3VjY2Vzc2Z1bGx5IGNoYW5nZWQuXG4gICovXG4gIGNoYW5nZVBhc3N3b3JkID0gYXN5bmMgKG9sZFBhc3N3b3JkOiBzdHJpbmcsIG5ld1Bhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIG9sZFBhc3N3b3JkLFxuICAgICAgbmV3UGFzc3dvcmRcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJhdXRoLmNoYW5nZVBhc3N3b3JkXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuc3VjY2Vzc1xuICB9XG5cbiAgY29uc3RydWN0b3IoY29yZTogQXZhbGFuY2hlQ29yZSwgYmFzZXVybDogc3RyaW5nID0gXCIvZXh0L2F1dGhcIikgeyBzdXBlcihjb3JlLCBiYXNldXJsKSB9XG59XG4iXX0=