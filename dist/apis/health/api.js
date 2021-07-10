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
exports.HealthAPI = void 0;
const jrpcapi_1 = require("../../common/jrpcapi");
/**
* Class for interacting with a node API that is using the node's HealthApi.
*
* @category RPCAPIs
*
* @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
*/
class HealthAPI extends jrpcapi_1.JRPCAPI {
    /**
    * This class should not be instantiated directly. Instead use the [[Avalanche.addAPI]] method.
    *
    * @param core A reference to the Avalanche class
    * @param baseurl Defaults to the string "/ext/health" as the path to blockchain's baseurl
    */
    constructor(core, baseurl = "/ext/health") {
        super(core, baseurl);
        /**
        *
        * @returns Promise for an object containing the health check response
        */
        this.getLiveness = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("health.getLiveness");
            return response.data.result;
        });
    }
}
exports.HealthAPI = HealthAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvaGVhbHRoL2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFLQSxrREFBOEM7QUFJOUM7Ozs7OztFQU1FO0FBQ0YsTUFBYSxTQUFVLFNBQVEsaUJBQU87SUFVcEM7Ozs7O01BS0U7SUFDRixZQUFZLElBQW1CLEVBQUUsVUFBa0IsYUFBYTtRQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFmeEY7OztVQUdFO1FBQ0YsZ0JBQVcsR0FBRyxHQUEwQixFQUFFO1lBQ3hDLE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtZQUNqRixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFBO1FBQzdCLENBQUMsQ0FBQSxDQUFBO0lBUXdGLENBQUM7Q0FDM0Y7QUFqQkQsOEJBaUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4qIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuKiBAbW9kdWxlIEFQSS1IZWFsdGhcbiovXG5pbXBvcnQgQXZhbGFuY2hlQ29yZSBmcm9tIFwiLi4vLi4vYXZhbGFuY2hlXCJcbmltcG9ydCB7IEpSUENBUEkgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2pycGNhcGlcIlxuaW1wb3J0IHsgUmVxdWVzdFJlc3BvbnNlRGF0YSB9IGZyb20gXCIuLi8uLi9jb21tb24vYXBpYmFzZVwiXG5cblxuLyoqXG4qIENsYXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgbm9kZSBBUEkgdGhhdCBpcyB1c2luZyB0aGUgbm9kZSdzIEhlYWx0aEFwaS5cbipcbiogQGNhdGVnb3J5IFJQQ0FQSXNcbipcbiogQHJlbWFya3MgVGhpcyBleHRlbmRzIHRoZSBbW0pSUENBUEldXSBjbGFzcy4gVGhpcyBjbGFzcyBzaG91bGQgbm90IGJlIGRpcmVjdGx5IGNhbGxlZC4gSW5zdGVhZCwgdXNlIHRoZSBbW0F2YWxhbmNoZS5hZGRBUEldXSBmdW5jdGlvbiB0byByZWdpc3RlciB0aGlzIGludGVyZmFjZSB3aXRoIEF2YWxhbmNoZS5cbiovXG5leHBvcnQgY2xhc3MgSGVhbHRoQVBJIGV4dGVuZHMgSlJQQ0FQSSB7XG4gIC8qKlxuICAqXG4gICogQHJldHVybnMgUHJvbWlzZSBmb3IgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGhlYWx0aCBjaGVjayByZXNwb25zZVxuICAqL1xuICBnZXRMaXZlbmVzcyA9IGFzeW5jICgpOiBQcm9taXNlPG9iamVjdD4gPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwiaGVhbHRoLmdldExpdmVuZXNzXCIpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgKiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgaW5zdGFudGlhdGVkIGRpcmVjdGx5LiBJbnN0ZWFkIHVzZSB0aGUgW1tBdmFsYW5jaGUuYWRkQVBJXV0gbWV0aG9kLlxuICAqXG4gICogQHBhcmFtIGNvcmUgQSByZWZlcmVuY2UgdG8gdGhlIEF2YWxhbmNoZSBjbGFzc1xuICAqIEBwYXJhbSBiYXNldXJsIERlZmF1bHRzIHRvIHRoZSBzdHJpbmcgXCIvZXh0L2hlYWx0aFwiIGFzIHRoZSBwYXRoIHRvIGJsb2NrY2hhaW4ncyBiYXNldXJsXG4gICovXG4gIGNvbnN0cnVjdG9yKGNvcmU6IEF2YWxhbmNoZUNvcmUsIGJhc2V1cmw6IHN0cmluZyA9IFwiL2V4dC9oZWFsdGhcIikgeyBzdXBlcihjb3JlLCBiYXNldXJsKSB9XG59XG5cbiJdfQ==