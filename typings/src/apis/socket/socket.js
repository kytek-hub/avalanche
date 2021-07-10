"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = void 0;
const isomorphic_ws_1 = __importDefault(require("isomorphic-ws"));
const utils_1 = require("../../utils");
class Socket extends isomorphic_ws_1.default {
    /**
     * Provides the API for creating and managing a WebSocket connection to a server, as well as for sending and receiving data on the connection.
     *
     * @param url Defaults to [[MainnetAPI]]
     * @param options Optional
     */
    constructor(url = `wss://${utils_1.MainnetAPI}:443/ext/bc/X/events`, options) {
        super(url, options);
    }
    /**
     * Send a message to the server
     *
     * @param data
     * @param cb Optional
     */
    send(data, cb) {
        super.send(data, cb);
    }
    /**
     * Terminates the connection completely
     *
     * @param mcode Optional
     * @param data Optional
     */
    close(mcode, data) {
        super.close(mcode, data);
    }
}
exports.Socket = Socket;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ja2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvc29ja2V0L3NvY2tldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFLQSxrRUFBcUM7QUFDckMsdUNBQXdDO0FBQ3hDLE1BQWEsTUFBTyxTQUFRLHVCQUFTO0lBOEJuQzs7Ozs7T0FLRztJQUNILFlBQ0UsTUFBa0MsU0FBUyxrQkFBVSxzQkFBc0IsRUFDM0UsT0FBcUQ7UUFDckQsS0FBSyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQTtJQUNyQixDQUFDO0lBOUJEOzs7OztPQUtHO0lBQ0gsSUFBSSxDQUFDLElBQVMsRUFBRSxFQUFRO1FBQ3RCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ3RCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxLQUFjLEVBQUUsSUFBYTtRQUNqQyxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUMxQixDQUFDO0NBYUY7QUF6Q0Qsd0JBeUNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVNvY2tldFxuICovXG5pbXBvcnQgeyBDbGllbnRSZXF1ZXN0QXJncyB9IGZyb20gXCJodHRwXCJcbmltcG9ydCBXZWJTb2NrZXQgZnJvbSBcImlzb21vcnBoaWMtd3NcIlxuaW1wb3J0IHsgTWFpbm5ldEFQSSB9IGZyb20gXCIuLi8uLi91dGlsc1wiXG5leHBvcnQgY2xhc3MgU29ja2V0IGV4dGVuZHMgV2ViU29ja2V0IHtcbiAgLy8gRmlyZXMgb25jZSB0aGUgY29ubmVjdGlvbiBoYXMgYmVlbiBlc3RhYmxpc2hlZCBiZXR3ZWVuIHRoZSBjbGllbnQgYW5kIHRoZSBzZXJ2ZXJcbiAgb25vcGVuOiBhbnlcbiAgLy8gRmlyZXMgd2hlbiB0aGUgc2VydmVyIHNlbmRzIHNvbWUgZGF0YVxuICBvbm1lc3NhZ2U6IGFueVxuICAvLyBGaXJlcyBhZnRlciBlbmQgb2YgdGhlIGNvbW11bmljYXRpb24gYmV0d2VlbiBzZXJ2ZXIgYW5kIHRoZSBjbGllbnRcbiAgb25jbG9zZTogYW55XG4gIC8vIEZpcmVzIGZvciBzb21lIG1pc3Rha2UsIHdoaWNoIGhhcHBlbnMgZHVyaW5nIHRoZSBjb21tdW5pY2F0aW9uXG4gIG9uZXJyb3I6IGFueVxuXG4gIC8qKlxuICAgKiBTZW5kIGEgbWVzc2FnZSB0byB0aGUgc2VydmVyXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIFxuICAgKiBAcGFyYW0gY2IgT3B0aW9uYWxcbiAgICovXG4gIHNlbmQoZGF0YTogYW55LCBjYj86IGFueSk6IHZvaWQge1xuICAgIHN1cGVyLnNlbmQoZGF0YSwgY2IpXG4gIH1cblxuICAvKipcbiAgICogVGVybWluYXRlcyB0aGUgY29ubmVjdGlvbiBjb21wbGV0ZWx5XG4gICAqXG4gICAqIEBwYXJhbSBtY29kZSBPcHRpb25hbCBcbiAgICogQHBhcmFtIGRhdGEgT3B0aW9uYWxcbiAgICovXG4gIGNsb3NlKG1jb2RlPzogbnVtYmVyLCBkYXRhPzogc3RyaW5nKTogdm9pZCB7XG4gICAgc3VwZXIuY2xvc2UobWNvZGUsIGRhdGEpXG4gIH1cblxuICAvKipcbiAgICogUHJvdmlkZXMgdGhlIEFQSSBmb3IgY3JlYXRpbmcgYW5kIG1hbmFnaW5nIGEgV2ViU29ja2V0IGNvbm5lY3Rpb24gdG8gYSBzZXJ2ZXIsIGFzIHdlbGwgYXMgZm9yIHNlbmRpbmcgYW5kIHJlY2VpdmluZyBkYXRhIG9uIHRoZSBjb25uZWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIERlZmF1bHRzIHRvIFtbTWFpbm5ldEFQSV1dXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbmFsXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICB1cmw6IHN0cmluZyB8IGltcG9ydChcInVybFwiKS5VUkwgPSBgd3NzOi8vJHtNYWlubmV0QVBJfTo0NDMvZXh0L2JjL1gvZXZlbnRzYCxcbiAgICBvcHRpb25zPzogV2ViU29ja2V0LkNsaWVudE9wdGlvbnMgfCBDbGllbnRSZXF1ZXN0QXJncykge1xuICAgIHN1cGVyKHVybCwgb3B0aW9ucylcbiAgfVxufVxuIl19