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
exports.MetricsAPI = void 0;
const restapi_1 = require("../../common/restapi");
/**
* Class for interacting with a node API that is using the node's MetricsApi.
*
* @category RPCAPIs
*
* @remarks This extends the [[RESTAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
*/
class MetricsAPI extends restapi_1.RESTAPI {
    /**
    * This class should not be instantiated directly. Instead use the [[Avalanche.addAPI]] method.
    *
    * @param core A reference to the Avalanche class
    * @param baseurl Defaults to the string "/ext/metrics" as the path to blockchain's baseurl
    */
    constructor(core, baseurl = "/ext/metrics") {
        super(core, baseurl);
        this.axConf = () => {
            return {
                baseURL: `${this.core.getProtocol()}://${this.core.getHost()}:${this.core.getPort()}`,
                responseType: "text",
            };
        };
        /**
        *
        * @returns Promise for an object containing the metrics response
        */
        this.getMetrics = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.post("");
            return response.data;
        });
    }
}
exports.MetricsAPI = MetricsAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvbWV0cmljcy9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBS0Esa0RBQThDO0FBSTlDOzs7Ozs7RUFNRTtBQUNGLE1BQWEsVUFBVyxTQUFRLGlCQUFPO0lBaUJyQzs7Ozs7TUFLRTtJQUNGLFlBQVksSUFBbUIsRUFBRSxVQUFrQixjQUFjO1FBQUksS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtRQXRCL0UsV0FBTSxHQUFHLEdBQXVCLEVBQUU7WUFDMUMsT0FBUTtnQkFDTixPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRTtnQkFDckYsWUFBWSxFQUFFLE1BQU07YUFDckIsQ0FBQTtRQUNILENBQUMsQ0FBQTtRQUVEOzs7VUFHRTtRQUNGLGVBQVUsR0FBRyxHQUEwQixFQUFFO1lBQ3ZDLE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDekQsT0FBTyxRQUFRLENBQUMsSUFBYyxDQUFBO1FBQ2hDLENBQUMsQ0FBQSxDQUFBO0lBUXlGLENBQUM7Q0FDNUY7QUF4QkQsZ0NBd0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4qIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuKiBAbW9kdWxlIEFQSS1NZXRyaWNzXG4qL1xuaW1wb3J0IEF2YWxhbmNoZUNvcmUgZnJvbSBcIi4uLy4uL2F2YWxhbmNoZVwiXG5pbXBvcnQgeyBSRVNUQVBJIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9yZXN0YXBpXCJcbmltcG9ydCB7IFJlcXVlc3RSZXNwb25zZURhdGEgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2FwaWJhc2VcIlxuaW1wb3J0IHsgQXhpb3NSZXF1ZXN0Q29uZmlnIH0gZnJvbSBcImF4aW9zXCJcblxuLyoqXG4qIENsYXNzIGZvciBpbnRlcmFjdGluZyB3aXRoIGEgbm9kZSBBUEkgdGhhdCBpcyB1c2luZyB0aGUgbm9kZSdzIE1ldHJpY3NBcGkuXG4qXG4qIEBjYXRlZ29yeSBSUENBUElzXG4qXG4qIEByZW1hcmtzIFRoaXMgZXh0ZW5kcyB0aGUgW1tSRVNUQVBJXV0gY2xhc3MuIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBkaXJlY3RseSBjYWxsZWQuIEluc3RlYWQsIHVzZSB0aGUgW1tBdmFsYW5jaGUuYWRkQVBJXV0gZnVuY3Rpb24gdG8gcmVnaXN0ZXIgdGhpcyBpbnRlcmZhY2Ugd2l0aCBBdmFsYW5jaGUuXG4qL1xuZXhwb3J0IGNsYXNzIE1ldHJpY3NBUEkgZXh0ZW5kcyBSRVNUQVBJIHtcbiAgcHJvdGVjdGVkIGF4Q29uZiA9ICgpOiBBeGlvc1JlcXVlc3RDb25maWcgPT4ge1xuICAgIHJldHVybiAge1xuICAgICAgYmFzZVVSTDogYCR7dGhpcy5jb3JlLmdldFByb3RvY29sKCl9Oi8vJHt0aGlzLmNvcmUuZ2V0SG9zdCgpfToke3RoaXMuY29yZS5nZXRQb3J0KCl9YCxcbiAgICAgIHJlc3BvbnNlVHlwZTogXCJ0ZXh0XCIsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICpcbiAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWV0cmljcyByZXNwb25zZVxuICAqL1xuICBnZXRNZXRyaWNzID0gYXN5bmMgKCk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLnBvc3QoXCJcIilcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YSBhcyBzdHJpbmdcbiAgfVxuXG4gIC8qKlxuICAqIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBpbnN0YW50aWF0ZWQgZGlyZWN0bHkuIEluc3RlYWQgdXNlIHRoZSBbW0F2YWxhbmNoZS5hZGRBUEldXSBtZXRob2QuXG4gICpcbiAgKiBAcGFyYW0gY29yZSBBIHJlZmVyZW5jZSB0byB0aGUgQXZhbGFuY2hlIGNsYXNzXG4gICogQHBhcmFtIGJhc2V1cmwgRGVmYXVsdHMgdG8gdGhlIHN0cmluZyBcIi9leHQvbWV0cmljc1wiIGFzIHRoZSBwYXRoIHRvIGJsb2NrY2hhaW4ncyBiYXNldXJsXG4gICovXG4gIGNvbnN0cnVjdG9yKGNvcmU6IEF2YWxhbmNoZUNvcmUsIGJhc2V1cmw6IHN0cmluZyA9IFwiL2V4dC9tZXRyaWNzXCIpIHsgc3VwZXIoY29yZSwgYmFzZXVybCkgfVxufVxuXG4iXX0=