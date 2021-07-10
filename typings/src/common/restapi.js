"use strict";
/**
 * @packageDocumentation
 * @module Common-RESTAPI
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
exports.RESTAPI = void 0;
const apibase_1 = require("./apibase");
class RESTAPI extends apibase_1.APIBase {
    /**
    *
    * @param core Reference to the Avalanche instance using this endpoint
    * @param baseurl Path of the APIs baseurl - ex: "/ext/bc/avm"
    * @param contentType Optional Determines the type of the entity attached to the
    * incoming request
    * @param acceptType Optional Determines the type of representation which is
    * desired on the client side
    */
    constructor(core, baseurl, contentType = "application/json", acceptType = undefined) {
        super(core, baseurl);
        this.prepHeaders = (contentType, acceptType) => {
            const headers = {};
            if (contentType !== undefined) {
                headers["Content-Type"] = contentType;
            }
            else {
                headers["Content-Type"] = this.contentType;
            }
            if (acceptType !== undefined) {
                headers["Accept"] = acceptType;
            }
            else if (this.acceptType !== undefined) {
                headers["Accept"] = this.acceptType;
            }
            return headers;
        };
        this.axConf = () => {
            return {
                baseURL: `${this.core.getProtocol()}://${this.core.getHost()}:${this.core.getPort()}`,
                responseType: "json",
            };
        };
        this.get = (baseurl, contentType, acceptType) => __awaiter(this, void 0, void 0, function* () {
            const ep = baseurl || this.baseurl;
            const headers = this.prepHeaders(contentType, acceptType);
            const resp = yield this.core.get(ep, {}, headers, this.axConf());
            return resp;
        });
        this.post = (method, params, baseurl, contentType, acceptType) => __awaiter(this, void 0, void 0, function* () {
            const ep = baseurl || this.baseurl;
            const rpc = {};
            rpc.method = method;
            // Set parameters if exists
            if (params) {
                rpc.params = params;
            }
            const headers = this.prepHeaders(contentType, acceptType);
            const resp = yield this.core.post(ep, {}, JSON.stringify(rpc), headers, this.axConf());
            return resp;
        });
        this.put = (method, params, baseurl, contentType, acceptType) => __awaiter(this, void 0, void 0, function* () {
            const ep = baseurl || this.baseurl;
            const rpc = {};
            rpc.method = method;
            // Set parameters if exists
            if (params) {
                rpc.params = params;
            }
            const headers = this.prepHeaders(contentType, acceptType);
            const resp = yield this.core.put(ep, {}, JSON.stringify(rpc), headers, this.axConf());
            return resp;
        });
        this.delete = (method, params, baseurl, contentType, acceptType) => __awaiter(this, void 0, void 0, function* () {
            const ep = baseurl || this.baseurl;
            const rpc = {};
            rpc.method = method;
            // Set parameters if exists
            if (params) {
                rpc.params = params;
            }
            const headers = this.prepHeaders(contentType, acceptType);
            const resp = yield this.core.delete(ep, {}, headers, this.axConf());
            return resp;
        });
        this.patch = (method, params, baseurl, contentType, acceptType) => __awaiter(this, void 0, void 0, function* () {
            const ep = baseurl || this.baseurl;
            const rpc = {};
            rpc.method = method;
            // Set parameters if exists
            if (params) {
                rpc.params = params;
            }
            const headers = this.prepHeaders(contentType, acceptType);
            const resp = yield this.core.patch(ep, {}, JSON.stringify(rpc), headers, this.axConf());
            return resp;
        });
        /**
        * Returns the type of the entity attached to the incoming request
        */
        this.getContentType = () => this.contentType;
        /**
        * Returns what type of representation is desired at the client side
        */
        this.getAcceptType = () => this.acceptType;
        this.contentType = contentType;
        this.acceptType = acceptType;
    }
}
exports.RESTAPI = RESTAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdGFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vcmVzdGFwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7Ozs7Ozs7QUFJSCx1Q0FBd0Q7QUFFeEQsTUFBYSxPQUFRLFNBQVEsaUJBQU87SUErR2xDOzs7Ozs7OztNQVFFO0lBQ0YsWUFBWSxJQUFtQixFQUM3QixPQUFlLEVBQ2YsY0FBc0IsK0JBQStCLEVBQ3JELGFBQXFCLFNBQVM7UUFDOUIsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtRQXhIWixnQkFBVyxHQUFHLENBQUMsV0FBb0IsRUFBRSxVQUFtQixFQUFVLEVBQUU7WUFDNUUsTUFBTSxPQUFPLEdBQVcsRUFBRSxDQUFBO1lBQzFCLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtnQkFDN0IsT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLFdBQVcsQ0FBQTthQUN0QztpQkFBTTtnQkFDTCxPQUFPLENBQUMsY0FBYyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQTthQUMzQztZQUVELElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRTtnQkFDNUIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFVBQVUsQ0FBQTthQUMvQjtpQkFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFO2dCQUN4QyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQTthQUNwQztZQUNELE9BQU8sT0FBTyxDQUFBO1FBQ2hCLENBQUMsQ0FBQTtRQUVTLFdBQU0sR0FBRyxHQUF1QixFQUFFO1lBQzFDLE9BQVE7Z0JBQ04sT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ3JGLFlBQVksRUFBRSxNQUFNO2FBQ3JCLENBQUE7UUFDSCxDQUFDLENBQUE7UUFFRCxRQUFHLEdBQUcsQ0FBTyxPQUFnQixFQUFFLFdBQW9CLEVBQUUsVUFBbUIsRUFBZ0MsRUFBRTtZQUN4RyxNQUFNLEVBQUUsR0FBVyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQTtZQUMxQyxNQUFNLE9BQU8sR0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQTtZQUNqRSxNQUFNLElBQUksR0FBd0IsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtZQUNyRixPQUFPLElBQUksQ0FBQTtRQUNiLENBQUMsQ0FBQSxDQUFBO1FBRUQsU0FBSSxHQUFHLENBQU8sTUFBYyxFQUFFLE1BQTBCLEVBQUUsT0FBZ0IsRUFDeEUsV0FBb0IsRUFBRSxVQUFtQixFQUFnQyxFQUFFO1lBQzNFLE1BQU0sRUFBRSxHQUFXLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFBO1lBQzFDLE1BQU0sR0FBRyxHQUFRLEVBQUUsQ0FBQTtZQUNuQixHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTtZQUVuQiwyQkFBMkI7WUFDM0IsSUFBSSxNQUFNLEVBQUU7Z0JBQ1YsR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7YUFDcEI7WUFFRCxNQUFNLE9BQU8sR0FBVyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQTtZQUNqRSxNQUFNLElBQUksR0FBd0IsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFBO1lBQzNHLE9BQU8sSUFBSSxDQUFBO1FBQ2IsQ0FBQyxDQUFBLENBQUE7UUFFRCxRQUFHLEdBQUcsQ0FBTyxNQUFjLEVBQ3pCLE1BQTBCLEVBQzFCLE9BQWdCLEVBQ2hCLFdBQW1CLEVBQ25CLFVBQW1CLEVBQWdDLEVBQUU7WUFDckQsTUFBTSxFQUFFLEdBQVcsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUE7WUFDMUMsTUFBTSxHQUFHLEdBQVEsRUFBRSxDQUFBO1lBQ25CLEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1lBRW5CLDJCQUEyQjtZQUMzQixJQUFJLE1BQU0sRUFBRTtnQkFDVixHQUFHLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQTthQUNwQjtZQUVELE1BQU0sT0FBTyxHQUFXLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFBO1lBQ2pFLE1BQU0sSUFBSSxHQUF3QixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7WUFDMUcsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDLENBQUEsQ0FBQTtRQUVELFdBQU0sR0FBRyxDQUFPLE1BQWMsRUFBRSxNQUEwQixFQUFFLE9BQWdCLEVBQzFFLFdBQW9CLEVBQUUsVUFBbUIsRUFBZ0MsRUFBRTtZQUMzRSxNQUFNLEVBQUUsR0FBVyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQTtZQUMxQyxNQUFNLEdBQUcsR0FBUSxFQUFFLENBQUE7WUFDbkIsR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7WUFFbkIsMkJBQTJCO1lBQzNCLElBQUksTUFBTSxFQUFFO2dCQUNWLEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO2FBQ3BCO1lBRUQsTUFBTSxPQUFPLEdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUE7WUFDakUsTUFBTSxJQUFJLEdBQXdCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUE7WUFDeEYsT0FBTyxJQUFJLENBQUE7UUFDYixDQUFDLENBQUEsQ0FBQTtRQUVELFVBQUssR0FBRyxDQUFPLE1BQWMsRUFBRSxNQUEwQixFQUFFLE9BQWdCLEVBQ3pFLFdBQW9CLEVBQUUsVUFBbUIsRUFBZ0MsRUFBRTtZQUMzRSxNQUFNLEVBQUUsR0FBVyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQTtZQUMxQyxNQUFNLEdBQUcsR0FBUSxFQUFFLENBQUE7WUFDbkIsR0FBRyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUE7WUFFbkIsMkJBQTJCO1lBQzNCLElBQUksTUFBTSxFQUFFO2dCQUNWLEdBQUcsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO2FBQ3BCO1lBRUQsTUFBTSxPQUFPLEdBQVcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUE7WUFDakUsTUFBTSxJQUFJLEdBQXdCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQTtZQUM1RyxPQUFPLElBQUksQ0FBQTtRQUNiLENBQUMsQ0FBQSxDQUFBO1FBRUQ7O1VBRUU7UUFDRixtQkFBYyxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUE7UUFFL0M7O1VBRUU7UUFDRixrQkFBYSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUE7UUFnQjNDLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO1FBQzlCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFBO0lBQzlCLENBQUM7Q0FDRjtBQWhJRCwwQkFnSUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBDb21tb24tUkVTVEFQSVxuICovXG5cbmltcG9ydCB7IEF4aW9zUmVxdWVzdENvbmZpZyB9IGZyb20gXCJheGlvc1wiXG5pbXBvcnQgQXZhbGFuY2hlQ29yZSBmcm9tIFwiLi4vYXZhbGFuY2hlXCJcbmltcG9ydCB7IEFQSUJhc2UsIFJlcXVlc3RSZXNwb25zZURhdGEgfSBmcm9tIFwiLi9hcGliYXNlXCJcblxuZXhwb3J0IGNsYXNzIFJFU1RBUEkgZXh0ZW5kcyBBUElCYXNlIHtcbiAgcHJvdGVjdGVkIGNvbnRlbnRUeXBlOiBzdHJpbmdcbiAgcHJvdGVjdGVkIGFjY2VwdFR5cGU6IHN0cmluZ1xuXG4gIHByb3RlY3RlZCBwcmVwSGVhZGVycyA9IChjb250ZW50VHlwZT86IHN0cmluZywgYWNjZXB0VHlwZT86IHN0cmluZyk6IG9iamVjdCA9PiB7XG4gICAgY29uc3QgaGVhZGVyczogb2JqZWN0ID0ge31cbiAgICBpZiAoY29udGVudFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaGVhZGVyc1tcIkNvbnRlbnQtVHlwZVwiXSA9IGNvbnRlbnRUeXBlXG4gICAgfSBlbHNlIHtcbiAgICAgIGhlYWRlcnNbXCJDb250ZW50LVR5cGVcIl0gPSB0aGlzLmNvbnRlbnRUeXBlXG4gICAgfVxuXG4gICAgaWYgKGFjY2VwdFR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaGVhZGVyc1tcIkFjY2VwdFwiXSA9IGFjY2VwdFR5cGVcbiAgICB9IGVsc2UgaWYgKHRoaXMuYWNjZXB0VHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBoZWFkZXJzW1wiQWNjZXB0XCJdID0gdGhpcy5hY2NlcHRUeXBlXG4gICAgfVxuICAgIHJldHVybiBoZWFkZXJzXG4gIH1cblxuICBwcm90ZWN0ZWQgYXhDb25mID0gKCk6IEF4aW9zUmVxdWVzdENvbmZpZyA9PiB7XG4gICAgcmV0dXJuICB7XG4gICAgICBiYXNlVVJMOiBgJHt0aGlzLmNvcmUuZ2V0UHJvdG9jb2woKX06Ly8ke3RoaXMuY29yZS5nZXRIb3N0KCl9OiR7dGhpcy5jb3JlLmdldFBvcnQoKX1gLFxuICAgICAgcmVzcG9uc2VUeXBlOiBcImpzb25cIixcbiAgICB9XG4gIH1cblxuICBnZXQgPSBhc3luYyAoYmFzZXVybD86IHN0cmluZywgY29udGVudFR5cGU/OiBzdHJpbmcsIGFjY2VwdFR5cGU/OiBzdHJpbmcpOiBQcm9taXNlPFJlcXVlc3RSZXNwb25zZURhdGE+ID0+IHtcbiAgICBjb25zdCBlcDogc3RyaW5nID0gYmFzZXVybCB8fCB0aGlzLmJhc2V1cmxcbiAgICBjb25zdCBoZWFkZXJzOiBvYmplY3QgPSB0aGlzLnByZXBIZWFkZXJzKGNvbnRlbnRUeXBlLCBhY2NlcHRUeXBlKVxuICAgIGNvbnN0IHJlc3A6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNvcmUuZ2V0KGVwLCB7fSwgaGVhZGVycywgdGhpcy5heENvbmYoKSlcbiAgICByZXR1cm4gcmVzcFxuICB9XG5cbiAgcG9zdCA9IGFzeW5jIChtZXRob2Q6IHN0cmluZywgcGFyYW1zPzogb2JqZWN0W10gfCBvYmplY3QsIGJhc2V1cmw/OiBzdHJpbmcsXG4gICAgY29udGVudFR5cGU/OiBzdHJpbmcsIGFjY2VwdFR5cGU/OiBzdHJpbmcpOiBQcm9taXNlPFJlcXVlc3RSZXNwb25zZURhdGE+ID0+IHtcbiAgICBjb25zdCBlcDogc3RyaW5nID0gYmFzZXVybCB8fCB0aGlzLmJhc2V1cmxcbiAgICBjb25zdCBycGM6IGFueSA9IHt9XG4gICAgcnBjLm1ldGhvZCA9IG1ldGhvZFxuXG4gICAgLy8gU2V0IHBhcmFtZXRlcnMgaWYgZXhpc3RzXG4gICAgaWYgKHBhcmFtcykge1xuICAgICAgcnBjLnBhcmFtcyA9IHBhcmFtc1xuICAgIH1cblxuICAgIGNvbnN0IGhlYWRlcnM6IG9iamVjdCA9IHRoaXMucHJlcEhlYWRlcnMoY29udGVudFR5cGUsIGFjY2VwdFR5cGUpXG4gICAgY29uc3QgcmVzcDogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY29yZS5wb3N0KGVwLCB7fSwgSlNPTi5zdHJpbmdpZnkocnBjKSwgaGVhZGVycywgdGhpcy5heENvbmYoKSlcbiAgICByZXR1cm4gcmVzcFxuICB9XG5cbiAgcHV0ID0gYXN5bmMgKG1ldGhvZDogc3RyaW5nLFxuICAgIHBhcmFtcz86IG9iamVjdFtdIHwgb2JqZWN0LFxuICAgIGJhc2V1cmw/OiBzdHJpbmcsXG4gICAgY29udGVudFR5cGU/OnN0cmluZyxcbiAgICBhY2NlcHRUeXBlPzogc3RyaW5nKTogUHJvbWlzZTxSZXF1ZXN0UmVzcG9uc2VEYXRhPiA9PiB7XG4gICAgY29uc3QgZXA6IHN0cmluZyA9IGJhc2V1cmwgfHwgdGhpcy5iYXNldXJsXG4gICAgY29uc3QgcnBjOiBhbnkgPSB7fVxuICAgIHJwYy5tZXRob2QgPSBtZXRob2RcblxuICAgIC8vIFNldCBwYXJhbWV0ZXJzIGlmIGV4aXN0c1xuICAgIGlmIChwYXJhbXMpIHtcbiAgICAgIHJwYy5wYXJhbXMgPSBwYXJhbXNcbiAgICB9XG5cbiAgICBjb25zdCBoZWFkZXJzOiBvYmplY3QgPSB0aGlzLnByZXBIZWFkZXJzKGNvbnRlbnRUeXBlLCBhY2NlcHRUeXBlKVxuICAgIGNvbnN0IHJlc3A6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNvcmUucHV0KGVwLCB7fSwgSlNPTi5zdHJpbmdpZnkocnBjKSwgaGVhZGVycywgdGhpcy5heENvbmYoKSlcbiAgICByZXR1cm4gcmVzcFxuICB9XG5cbiAgZGVsZXRlID0gYXN5bmMgKG1ldGhvZDogc3RyaW5nLCBwYXJhbXM/OiBvYmplY3RbXSB8IG9iamVjdCwgYmFzZXVybD86IHN0cmluZyxcbiAgICBjb250ZW50VHlwZT86IHN0cmluZywgYWNjZXB0VHlwZT86IHN0cmluZyk6IFByb21pc2U8UmVxdWVzdFJlc3BvbnNlRGF0YT4gPT4ge1xuICAgIGNvbnN0IGVwOiBzdHJpbmcgPSBiYXNldXJsIHx8IHRoaXMuYmFzZXVybFxuICAgIGNvbnN0IHJwYzogYW55ID0ge31cbiAgICBycGMubWV0aG9kID0gbWV0aG9kXG5cbiAgICAvLyBTZXQgcGFyYW1ldGVycyBpZiBleGlzdHNcbiAgICBpZiAocGFyYW1zKSB7XG4gICAgICBycGMucGFyYW1zID0gcGFyYW1zXG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVyczogb2JqZWN0ID0gdGhpcy5wcmVwSGVhZGVycyhjb250ZW50VHlwZSwgYWNjZXB0VHlwZSlcbiAgICBjb25zdCByZXNwOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jb3JlLmRlbGV0ZShlcCwge30sIGhlYWRlcnMsIHRoaXMuYXhDb25mKCkpXG4gICAgcmV0dXJuIHJlc3BcbiAgfVxuXG4gIHBhdGNoID0gYXN5bmMgKG1ldGhvZDogc3RyaW5nLCBwYXJhbXM/OiBvYmplY3RbXSB8IG9iamVjdCwgYmFzZXVybD86IHN0cmluZyxcbiAgICBjb250ZW50VHlwZT86IHN0cmluZywgYWNjZXB0VHlwZT86IHN0cmluZyk6IFByb21pc2U8UmVxdWVzdFJlc3BvbnNlRGF0YT4gPT4ge1xuICAgIGNvbnN0IGVwOiBzdHJpbmcgPSBiYXNldXJsIHx8IHRoaXMuYmFzZXVybFxuICAgIGNvbnN0IHJwYzogYW55ID0ge31cbiAgICBycGMubWV0aG9kID0gbWV0aG9kXG5cbiAgICAvLyBTZXQgcGFyYW1ldGVycyBpZiBleGlzdHNcbiAgICBpZiAocGFyYW1zKSB7XG4gICAgICBycGMucGFyYW1zID0gcGFyYW1zXG4gICAgfVxuXG4gICAgY29uc3QgaGVhZGVyczogb2JqZWN0ID0gdGhpcy5wcmVwSGVhZGVycyhjb250ZW50VHlwZSwgYWNjZXB0VHlwZSlcbiAgICBjb25zdCByZXNwOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jb3JlLnBhdGNoKGVwLCB7fSwgSlNPTi5zdHJpbmdpZnkocnBjKSwgaGVhZGVycywgdGhpcy5heENvbmYoKSlcbiAgICByZXR1cm4gcmVzcFxuICB9XG5cbiAgLyoqXG4gICogUmV0dXJucyB0aGUgdHlwZSBvZiB0aGUgZW50aXR5IGF0dGFjaGVkIHRvIHRoZSBpbmNvbWluZyByZXF1ZXN0XG4gICovXG4gIGdldENvbnRlbnRUeXBlID0gKCk6IHN0cmluZyA9PiB0aGlzLmNvbnRlbnRUeXBlXG5cbiAgLyoqXG4gICogUmV0dXJucyB3aGF0IHR5cGUgb2YgcmVwcmVzZW50YXRpb24gaXMgZGVzaXJlZCBhdCB0aGUgY2xpZW50IHNpZGVcbiAgKi9cbiAgZ2V0QWNjZXB0VHlwZSA9ICgpOiBzdHJpbmcgPT4gdGhpcy5hY2NlcHRUeXBlXG5cbiAgLyoqXG4gICpcbiAgKiBAcGFyYW0gY29yZSBSZWZlcmVuY2UgdG8gdGhlIEF2YWxhbmNoZSBpbnN0YW5jZSB1c2luZyB0aGlzIGVuZHBvaW50XG4gICogQHBhcmFtIGJhc2V1cmwgUGF0aCBvZiB0aGUgQVBJcyBiYXNldXJsIC0gZXg6IFwiL2V4dC9iYy9hdm1cIlxuICAqIEBwYXJhbSBjb250ZW50VHlwZSBPcHRpb25hbCBEZXRlcm1pbmVzIHRoZSB0eXBlIG9mIHRoZSBlbnRpdHkgYXR0YWNoZWQgdG8gdGhlXG4gICogaW5jb21pbmcgcmVxdWVzdFxuICAqIEBwYXJhbSBhY2NlcHRUeXBlIE9wdGlvbmFsIERldGVybWluZXMgdGhlIHR5cGUgb2YgcmVwcmVzZW50YXRpb24gd2hpY2ggaXNcbiAgKiBkZXNpcmVkIG9uIHRoZSBjbGllbnQgc2lkZVxuICAqL1xuICBjb25zdHJ1Y3Rvcihjb3JlOiBBdmFsYW5jaGVDb3JlLFxuICAgIGJhc2V1cmw6IHN0cmluZyxcbiAgICBjb250ZW50VHlwZTogc3RyaW5nID0gXCJhcHBsaWNhdGlvbi9qc29uY2hhcnNldD1VVEYtOFwiLFxuICAgIGFjY2VwdFR5cGU6IHN0cmluZyA9IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKGNvcmUsIGJhc2V1cmwpXG4gICAgdGhpcy5jb250ZW50VHlwZSA9IGNvbnRlbnRUeXBlXG4gICAgdGhpcy5hY2NlcHRUeXBlID0gYWNjZXB0VHlwZVxuICB9XG59XG5cblxuXG5cblxuXG4iXX0=