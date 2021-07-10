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
exports.KeystoreAPI = void 0;
const jrpcapi_1 = require("../../common/jrpcapi");
/**
 * Class for interacting with a node API that is using the node's KeystoreAPI.
 *
 * **WARNING**: The KeystoreAPI is to be used by the node-owner as the data is stored locally on the node. Do not trust the root user. If you are not the node-owner, do not use this as your wallet.
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
class KeystoreAPI extends jrpcapi_1.JRPCAPI {
    /**
       * This class should not be instantiated directly. Instead use the [[Avalanche.addAPI]] method.
       *
       * @param core A reference to the Avalanche class
       * @param baseurl Defaults to the string "/ext/keystore" as the path to blockchain"s baseurl
       */
    constructor(core, baseurl = "/ext/keystore") {
        super(core, baseurl);
        /**
           * Creates a user in the node's database.
           *
           * @param username Name of the user to create
           * @param password Password for the user
           *
           * @returns Promise for a boolean with true on success
           */
        this.createUser = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password
            };
            const response = yield this.callMethod("keystore.createUser", params);
            return response.data.result.success;
        });
        /**
           * Exports a user. The user can be imported to another node with keystore.importUser .
           *
           * @param username The name of the user to export
           * @param password The password of the user to export
           *
           * @returns Promise with a string importable using importUser
           */
        this.exportUser = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password
            };
            const response = yield this.callMethod("keystore.exportUser", params);
            return response.data.result.user;
        });
        /**
           * Imports a user file into the node's user database and assigns it to a username.
           *
           * @param username The name the user file should be imported into
           * @param user cb58 serialized string represetning a user"s data
           * @param password The user"s password
           *
           * @returns A promise with a true-value on success.
           */
        this.importUser = (username, user, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                user,
                password
            };
            const response = yield this.callMethod("keystore.importUser", params);
            return response.data.result.success;
        });
        /**
           * Lists the names of all users on the node.
           *
           * @returns Promise of an array with all user names.
           */
        this.listUsers = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("keystore.listUsers");
            return response.data.result.users;
        });
        /**
           * Deletes a user in the node's database.
           *
           * @param username Name of the user to delete
           * @param password Password for the user
           *
           * @returns Promise for a boolean with true on success
           */
        this.deleteUser = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password
            };
            const response = yield this.callMethod("keystore.deleteUser", params);
            return response.data.result.success;
        });
    }
}
exports.KeystoreAPI = KeystoreAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMva2V5c3RvcmUvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUtBLGtEQUE4QztBQUc5Qzs7Ozs7Ozs7R0FRRztBQUNILE1BQWEsV0FBWSxTQUFRLGlCQUFPO0lBaUZ0Qzs7Ozs7U0FLSztJQUNMLFlBQVksSUFBbUIsRUFBRSxVQUFrQixlQUFlO1FBQUksS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtRQXRGMUY7Ozs7Ozs7YUFPSztRQUNMLGVBQVUsR0FBRyxDQUFPLFFBQWdCLEVBQUUsUUFBZ0IsRUFBb0IsRUFBRTtZQUMxRSxNQUFNLE1BQU0sR0FBUTtnQkFDbEIsUUFBUTtnQkFDUixRQUFRO2FBQ1QsQ0FBQTtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFDMUYsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUE7UUFDckMsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7OzthQU9LO1FBQ0wsZUFBVSxHQUFHLENBQU8sUUFBZ0IsRUFBRSxRQUFnQixFQUFtQixFQUFFO1lBQ3pFLE1BQU0sTUFBTSxHQUFRO2dCQUNsQixRQUFRO2dCQUNSLFFBQVE7YUFDVCxDQUFBO1lBQ0QsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUMxRixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQTtRQUNsQyxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7OzthQVFLO1FBQ0wsZUFBVSxHQUFHLENBQU8sUUFBZ0IsRUFBRSxJQUFZLEVBQUUsUUFBZ0IsRUFBb0IsRUFBRTtZQUN4RixNQUFNLE1BQU0sR0FBUTtnQkFDbEIsUUFBUTtnQkFDUixJQUFJO2dCQUNKLFFBQVE7YUFDVCxDQUFBO1lBQ0QsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUMxRixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQTtRQUNyQyxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7O2FBSUs7UUFDTCxjQUFTLEdBQUcsR0FBNEIsRUFBRTtZQUN4QyxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUE7WUFDakYsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUE7UUFDbkMsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7OzthQU9LO1FBQ0wsZUFBVSxHQUFHLENBQU8sUUFBZ0IsRUFBRSxRQUFnQixFQUFvQixFQUFFO1lBQzFFLE1BQU0sTUFBTSxHQUFRO2dCQUNsQixRQUFRO2dCQUNSLFFBQVE7YUFDVCxDQUFBO1lBQ0QsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUMxRixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQTtRQUNyQyxDQUFDLENBQUEsQ0FBQTtJQVEwRixDQUFDO0NBQzdGO0FBeEZELGtDQXdGQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1LZXlzdG9yZVxuICovXG5pbXBvcnQgQXZhbGFuY2hlQ29yZSBmcm9tIFwiLi4vLi4vYXZhbGFuY2hlXCJcbmltcG9ydCB7IEpSUENBUEkgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2pycGNhcGlcIlxuaW1wb3J0IHsgUmVxdWVzdFJlc3BvbnNlRGF0YSB9IGZyb20gXCIuLi8uLi9jb21tb24vYXBpYmFzZVwiXG5cbi8qKlxuICogQ2xhc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBub2RlIEFQSSB0aGF0IGlzIHVzaW5nIHRoZSBub2RlJ3MgS2V5c3RvcmVBUEkuXG4gKlxuICogKipXQVJOSU5HKio6IFRoZSBLZXlzdG9yZUFQSSBpcyB0byBiZSB1c2VkIGJ5IHRoZSBub2RlLW93bmVyIGFzIHRoZSBkYXRhIGlzIHN0b3JlZCBsb2NhbGx5IG9uIHRoZSBub2RlLiBEbyBub3QgdHJ1c3QgdGhlIHJvb3QgdXNlci4gSWYgeW91IGFyZSBub3QgdGhlIG5vZGUtb3duZXIsIGRvIG5vdCB1c2UgdGhpcyBhcyB5b3VyIHdhbGxldC5cbiAqXG4gKiBAY2F0ZWdvcnkgUlBDQVBJc1xuICpcbiAqIEByZW1hcmtzIFRoaXMgZXh0ZW5kcyB0aGUgW1tKUlBDQVBJXV0gY2xhc3MuIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBkaXJlY3RseSBjYWxsZWQuIEluc3RlYWQsIHVzZSB0aGUgW1tBdmFsYW5jaGUuYWRkQVBJXV0gZnVuY3Rpb24gdG8gcmVnaXN0ZXIgdGhpcyBpbnRlcmZhY2Ugd2l0aCBBdmFsYW5jaGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBLZXlzdG9yZUFQSSBleHRlbmRzIEpSUENBUEkge1xuICAvKipcbiAgICAgKiBDcmVhdGVzIGEgdXNlciBpbiB0aGUgbm9kZSdzIGRhdGFiYXNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHVzZXJuYW1lIE5hbWUgb2YgdGhlIHVzZXIgdG8gY3JlYXRlXG4gICAgICogQHBhcmFtIHBhc3N3b3JkIFBhc3N3b3JkIGZvciB0aGUgdXNlclxuICAgICAqXG4gICAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYSBib29sZWFuIHdpdGggdHJ1ZSBvbiBzdWNjZXNzXG4gICAgICovXG4gIGNyZWF0ZVVzZXIgPSBhc3luYyAodXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcImtleXN0b3JlLmNyZWF0ZVVzZXJcIiwgcGFyYW1zKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5zdWNjZXNzXG4gIH1cblxuICAvKipcbiAgICAgKiBFeHBvcnRzIGEgdXNlci4gVGhlIHVzZXIgY2FuIGJlIGltcG9ydGVkIHRvIGFub3RoZXIgbm9kZSB3aXRoIGtleXN0b3JlLmltcG9ydFVzZXIgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHVzZXJuYW1lIFRoZSBuYW1lIG9mIHRoZSB1c2VyIHRvIGV4cG9ydFxuICAgICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIHVzZXIgdG8gZXhwb3J0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIHdpdGggYSBzdHJpbmcgaW1wb3J0YWJsZSB1c2luZyBpbXBvcnRVc2VyXG4gICAgICovXG4gIGV4cG9ydFVzZXIgPSBhc3luYyAodXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwia2V5c3RvcmUuZXhwb3J0VXNlclwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnVzZXJcbiAgfVxuXG4gIC8qKlxuICAgICAqIEltcG9ydHMgYSB1c2VyIGZpbGUgaW50byB0aGUgbm9kZSdzIHVzZXIgZGF0YWJhc2UgYW5kIGFzc2lnbnMgaXQgdG8gYSB1c2VybmFtZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgbmFtZSB0aGUgdXNlciBmaWxlIHNob3VsZCBiZSBpbXBvcnRlZCBpbnRvXG4gICAgICogQHBhcmFtIHVzZXIgY2I1OCBzZXJpYWxpemVkIHN0cmluZyByZXByZXNldG5pbmcgYSB1c2VyXCJzIGRhdGFcbiAgICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHVzZXJcInMgcGFzc3dvcmRcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgcHJvbWlzZSB3aXRoIGEgdHJ1ZS12YWx1ZSBvbiBzdWNjZXNzLlxuICAgICAqL1xuICBpbXBvcnRVc2VyID0gYXN5bmMgKHVzZXJuYW1lOiBzdHJpbmcsIHVzZXI6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICB1c2VyLFxuICAgICAgcGFzc3dvcmRcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJrZXlzdG9yZS5pbXBvcnRVc2VyXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuc3VjY2Vzc1xuICB9XG5cbiAgLyoqXG4gICAgICogTGlzdHMgdGhlIG5hbWVzIG9mIGFsbCB1c2VycyBvbiB0aGUgbm9kZS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFByb21pc2Ugb2YgYW4gYXJyYXkgd2l0aCBhbGwgdXNlciBuYW1lcy5cbiAgICAgKi9cbiAgbGlzdFVzZXJzID0gYXN5bmMgKCk6IFByb21pc2U8c3RyaW5nW10+ID0+IHtcbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcImtleXN0b3JlLmxpc3RVc2Vyc1wiKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC51c2Vyc1xuICB9XG5cbiAgLyoqXG4gICAgICogRGVsZXRlcyBhIHVzZXIgaW4gdGhlIG5vZGUncyBkYXRhYmFzZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1c2VybmFtZSBOYW1lIG9mIHRoZSB1c2VyIHRvIGRlbGV0ZVxuICAgICAqIEBwYXJhbSBwYXNzd29yZCBQYXNzd29yZCBmb3IgdGhlIHVzZXJcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGEgYm9vbGVhbiB3aXRoIHRydWUgb24gc3VjY2Vzc1xuICAgICAqL1xuICBkZWxldGVVc2VyID0gYXN5bmMgKHVzZXJuYW1lOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmRcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJrZXlzdG9yZS5kZWxldGVVc2VyXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuc3VjY2Vzc1xuICB9XG5cbiAgLyoqXG4gICAgICogVGhpcyBjbGFzcyBzaG91bGQgbm90IGJlIGluc3RhbnRpYXRlZCBkaXJlY3RseS4gSW5zdGVhZCB1c2UgdGhlIFtbQXZhbGFuY2hlLmFkZEFQSV1dIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBjb3JlIEEgcmVmZXJlbmNlIHRvIHRoZSBBdmFsYW5jaGUgY2xhc3NcbiAgICAgKiBAcGFyYW0gYmFzZXVybCBEZWZhdWx0cyB0byB0aGUgc3RyaW5nIFwiL2V4dC9rZXlzdG9yZVwiIGFzIHRoZSBwYXRoIHRvIGJsb2NrY2hhaW5cInMgYmFzZXVybFxuICAgICAqL1xuICBjb25zdHJ1Y3Rvcihjb3JlOiBBdmFsYW5jaGVDb3JlLCBiYXNldXJsOiBzdHJpbmcgPSBcIi9leHQva2V5c3RvcmVcIikgeyBzdXBlcihjb3JlLCBiYXNldXJsKSB9XG59Il19