"use strict";
/**
* @packageDocumentation
* @module Common-JRPCAPI
*/
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
exports.JRPCAPI = void 0;
const apibase_1 = require("./apibase");
class JRPCAPI extends apibase_1.APIBase {
    /**
    *
    * @param core Reference to the Avalanche instance using this endpoint
    * @param baseurl Path of the APIs baseurl - ex: "/ext/bc/avm"
    * @param jrpcVersion The jrpc version to use, default "2.0".
    */
    constructor(core, baseurl, jrpcVersion = "2.0") {
        super(core, baseurl);
        this.jrpcVersion = "2.0";
        this.rpcid = 1;
        this.callMethod = (method, params, baseurl, headers) => __awaiter(this, void 0, void 0, function* () {
            const ep = baseurl || this.baseurl;
            const rpc = {};
            rpc.id = this.rpcid;
            rpc.method = method;
            // Set parameters if exists
            if (params) {
                rpc.params = params;
            }
            else if (this.jrpcVersion === "1.0") {
                rpc.params = [];
            }
            if (this.jrpcVersion !== "1.0") {
                rpc.jsonrpc = this.jrpcVersion;
            }
            let headrs = { "Content-Type": "application/json" };
            if (headers) {
                headrs = Object.assign(Object.assign({}, headrs), headers);
            }
            let baseURL = `${this.core.getProtocol()}://${this.core.getHost()}`;
            const port = this.core.getPort();
            if (port != undefined && typeof port === "number" && port >= 0) {
                baseURL = `${baseURL}:${port}`;
            }
            const axConf = {
                baseURL: baseURL,
                responseType: "json",
            };
            const resp = yield this.core.post(ep, {}, JSON.stringify(rpc), headrs, axConf);
            if (resp.status >= 200 && resp.status < 300) {
                this.rpcid += 1;
                if (typeof resp.data === "string") {
                    resp.data = JSON.parse(resp.data);
                }
                if (typeof resp.data === "object" && (resp.data === null || "error" in resp.data)) {
                    throw new Error(resp.data.error.message);
                }
            }
            return resp;
        });
        /**
        * Returns the rpcid, a strictly-increasing number, starting from 1, indicating the next
        * request ID that will be sent.
        */
        this.getRPCID = () => this.rpcid;
        this.jrpcVersion = jrpcVersion;
        this.rpcid = 1;
    }
}
exports.JRPCAPI = JRPCAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianJwY2FwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vanJwY2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztFQUdFOzs7Ozs7Ozs7Ozs7QUFJRix1Q0FBd0Q7QUFFeEQsTUFBYSxPQUFRLFNBQVEsaUJBQU87SUE2RGxDOzs7OztNQUtFO0lBQ0YsWUFBWSxJQUFtQixFQUFFLE9BQWUsRUFBRSxjQUFzQixLQUFLO1FBQzNFLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFuRVosZ0JBQVcsR0FBVyxLQUFLLENBQUE7UUFDM0IsVUFBSyxHQUFHLENBQUMsQ0FBQTtRQUVuQixlQUFVLEdBQUcsQ0FDWCxNQUFjLEVBQ2QsTUFBMEIsRUFDMUIsT0FBZSxFQUNmLE9BQWdCLEVBQ2MsRUFBRTtZQUNoQyxNQUFNLEVBQUUsR0FBVyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQTtZQUMxQyxNQUFNLEdBQUcsR0FBUSxFQUFFLENBQUE7WUFDbkIsR0FBRyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFBO1lBQ25CLEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1lBRW5CLDJCQUEyQjtZQUMzQixJQUFJLE1BQU0sRUFBRTtnQkFDVixHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTthQUNwQjtpQkFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssS0FBSyxFQUFFO2dCQUNyQyxHQUFHLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQTthQUNoQjtZQUVELElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxLQUFLLEVBQUU7Z0JBQzlCLEdBQUcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQTthQUMvQjtZQUVELElBQUksTUFBTSxHQUFXLEVBQUUsY0FBYyxFQUFFLCtCQUErQixFQUFFLENBQUE7WUFDeEUsSUFBRyxPQUFPLEVBQUU7Z0JBQ1YsTUFBTSxtQ0FBUSxNQUFNLEdBQUssT0FBTyxDQUFFLENBQUE7YUFDbkM7WUFFRCxJQUFJLE9BQU8sR0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFBO1lBQzNFLE1BQU0sSUFBSSxHQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUE7WUFDeEMsSUFBSSxJQUFJLElBQUksU0FBUyxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxJQUFJLElBQUksQ0FBQyxFQUFFO2dCQUM5RCxPQUFPLEdBQUcsR0FBRyxPQUFPLElBQUksSUFBSSxFQUFFLENBQUE7YUFDL0I7WUFFRCxNQUFNLE1BQU0sR0FBc0I7Z0JBQ2hDLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixZQUFZLEVBQUUsTUFBTTthQUNyQixDQUFBO1lBRUQsTUFBTSxJQUFJLEdBQXdCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUNuRyxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO2dCQUMzQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQTtnQkFDZixJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7b0JBQ2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7aUJBQ2xDO2dCQUNELElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLE9BQU8sSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ2pGLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUE7aUJBQ3pDO2FBQ0Y7WUFDRCxPQUFPLElBQUksQ0FBQTtRQUNiLENBQUMsQ0FBQSxDQUFBO1FBRUQ7OztVQUdFO1FBQ0YsYUFBUSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUE7UUFVakMsSUFBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7UUFDOUIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUE7SUFDaEIsQ0FBQztDQUNGO0FBeEVELDBCQXdFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiogQG1vZHVsZSBDb21tb24tSlJQQ0FQSVxuKi9cblxuaW1wb3J0IHsgQXhpb3NSZXF1ZXN0Q29uZmlnIH0gZnJvbSBcImF4aW9zXCJcbmltcG9ydCBBdmFsYW5jaGVDb3JlIGZyb20gXCIuLi9hdmFsYW5jaGVcIlxuaW1wb3J0IHsgQVBJQmFzZSwgUmVxdWVzdFJlc3BvbnNlRGF0YSB9IGZyb20gXCIuL2FwaWJhc2VcIlxuXG5leHBvcnQgY2xhc3MgSlJQQ0FQSSBleHRlbmRzIEFQSUJhc2Uge1xuICBwcm90ZWN0ZWQganJwY1ZlcnNpb246IHN0cmluZyA9IFwiMi4wXCJcbiAgcHJvdGVjdGVkIHJwY2lkID0gMVxuXG4gIGNhbGxNZXRob2QgPSBhc3luYyAoXG4gICAgbWV0aG9kOiBzdHJpbmcsXG4gICAgcGFyYW1zPzogb2JqZWN0W10gfCBvYmplY3QsXG4gICAgYmFzZXVybD86c3RyaW5nLFxuICAgIGhlYWRlcnM/OiBvYmplY3RcbiAgKTogUHJvbWlzZTxSZXF1ZXN0UmVzcG9uc2VEYXRhPiA9PiB7XG4gICAgY29uc3QgZXA6IHN0cmluZyA9IGJhc2V1cmwgfHwgdGhpcy5iYXNldXJsXG4gICAgY29uc3QgcnBjOiBhbnkgPSB7fVxuICAgIHJwYy5pZCA9IHRoaXMucnBjaWRcbiAgICBycGMubWV0aG9kID0gbWV0aG9kXG5cbiAgICAvLyBTZXQgcGFyYW1ldGVycyBpZiBleGlzdHNcbiAgICBpZiAocGFyYW1zKSB7XG4gICAgICBycGMucGFyYW1zID0gcGFyYW1zXG4gICAgfSBlbHNlIGlmICh0aGlzLmpycGNWZXJzaW9uID09PSBcIjEuMFwiKSB7XG4gICAgICBycGMucGFyYW1zID0gW11cbiAgICB9XG5cbiAgICBpZiAodGhpcy5qcnBjVmVyc2lvbiAhPT0gXCIxLjBcIikge1xuICAgICAgcnBjLmpzb25ycGMgPSB0aGlzLmpycGNWZXJzaW9uXG4gICAgfVxuXG4gICAgbGV0IGhlYWRyczogb2JqZWN0ID0geyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25jaGFyc2V0PVVURi04XCIgfVxuICAgIGlmKGhlYWRlcnMpIHtcbiAgICAgIGhlYWRycyA9IHsgLi4uaGVhZHJzLCAuLi5oZWFkZXJzIH1cbiAgICB9XG5cbiAgICBsZXQgYmFzZVVSTDogc3RyaW5nID0gYCR7dGhpcy5jb3JlLmdldFByb3RvY29sKCl9Oi8vJHt0aGlzLmNvcmUuZ2V0SG9zdCgpfWBcbiAgICBjb25zdCBwb3J0OiBudW1iZXIgPSB0aGlzLmNvcmUuZ2V0UG9ydCgpXG4gICAgaWYgKHBvcnQgIT0gdW5kZWZpbmVkICYmIHR5cGVvZiBwb3J0ID09PSBcIm51bWJlclwiICYmIHBvcnQgPj0gMCkge1xuICAgICAgYmFzZVVSTCA9IGAke2Jhc2VVUkx9OiR7cG9ydH1gXG4gICAgfVxuXG4gICAgY29uc3QgYXhDb25mOkF4aW9zUmVxdWVzdENvbmZpZyA9IHtcbiAgICAgIGJhc2VVUkw6IGJhc2VVUkwsXG4gICAgICByZXNwb25zZVR5cGU6IFwianNvblwiLFxuICAgIH1cblxuICAgIGNvbnN0IHJlc3A6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNvcmUucG9zdChlcCwge30sIEpTT04uc3RyaW5naWZ5KHJwYyksIGhlYWRycywgYXhDb25mKVxuICAgIGlmIChyZXNwLnN0YXR1cyA+PSAyMDAgJiYgcmVzcC5zdGF0dXMgPCAzMDApIHtcbiAgICAgIHRoaXMucnBjaWQgKz0gMVxuICAgICAgaWYgKHR5cGVvZiByZXNwLmRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmVzcC5kYXRhID0gSlNPTi5wYXJzZShyZXNwLmRhdGEpXG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIHJlc3AuZGF0YSA9PT0gXCJvYmplY3RcIiAmJiAocmVzcC5kYXRhID09PSBudWxsIHx8IFwiZXJyb3JcIiBpbiByZXNwLmRhdGEpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihyZXNwLmRhdGEuZXJyb3IubWVzc2FnZSlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3BcbiAgfVxuXG4gIC8qKlxuICAqIFJldHVybnMgdGhlIHJwY2lkLCBhIHN0cmljdGx5LWluY3JlYXNpbmcgbnVtYmVyLCBzdGFydGluZyBmcm9tIDEsIGluZGljYXRpbmcgdGhlIG5leHRcbiAgKiByZXF1ZXN0IElEIHRoYXQgd2lsbCBiZSBzZW50LlxuICAqL1xuICBnZXRSUENJRCA9ICgpOiBudW1iZXIgPT4gdGhpcy5ycGNpZFxuXG4gIC8qKlxuICAqXG4gICogQHBhcmFtIGNvcmUgUmVmZXJlbmNlIHRvIHRoZSBBdmFsYW5jaGUgaW5zdGFuY2UgdXNpbmcgdGhpcyBlbmRwb2ludFxuICAqIEBwYXJhbSBiYXNldXJsIFBhdGggb2YgdGhlIEFQSXMgYmFzZXVybCAtIGV4OiBcIi9leHQvYmMvYXZtXCJcbiAgKiBAcGFyYW0ganJwY1ZlcnNpb24gVGhlIGpycGMgdmVyc2lvbiB0byB1c2UsIGRlZmF1bHQgXCIyLjBcIi5cbiAgKi9cbiAgY29uc3RydWN0b3IoY29yZTogQXZhbGFuY2hlQ29yZSwgYmFzZXVybDogc3RyaW5nLCBqcnBjVmVyc2lvbjogc3RyaW5nID0gXCIyLjBcIikge1xuICAgIHN1cGVyKGNvcmUsIGJhc2V1cmwpXG4gICAgdGhpcy5qcnBjVmVyc2lvbiA9IGpycGNWZXJzaW9uXG4gICAgdGhpcy5ycGNpZCA9IDFcbiAgfVxufVxuIl19