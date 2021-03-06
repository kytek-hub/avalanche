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
exports.TestAPI = void 0;
const apibase_1 = require("../src/common/apibase");
class TestAPI extends apibase_1.APIBase {
    constructor(avax, endpoint = "/ext/testing") {
        super(avax, endpoint);
        this.TestGET = (input, path = "", axiosConfig = undefined) => __awaiter(this, void 0, void 0, function* () { return this._TestMethod("get", path, { input }, axiosConfig); });
        this.TestDELETE = (input, path = "", axiosConfig = undefined) => __awaiter(this, void 0, void 0, function* () { return this._TestMethod("delete", path, { input }, axiosConfig); });
        this.TestPOST = (input, path = "", axiosConfig = undefined) => __awaiter(this, void 0, void 0, function* () { return this._TestMethod("post", path, {}, { input }, axiosConfig); });
        this.TestPUT = (input, path = "", axiosConfig = undefined) => __awaiter(this, void 0, void 0, function* () { return this._TestMethod("put", path, {}, { input }, axiosConfig); });
        this.TestPATCH = (input, path = "", axiosConfig = undefined) => __awaiter(this, void 0, void 0, function* () { return this._TestMethod("patch", path, {}, { input }, axiosConfig); });
        this._respFn = (res) => {
            let response;
            if (typeof res.data === "string") {
                response = JSON.parse(res.data);
            }
            else {
                response = res.data;
            }
            return response.result;
        };
        this._TestMethod = (method, path = "", getdata = {}, postdata = undefined, axiosConfig = undefined) => __awaiter(this, void 0, void 0, function* () {
            if (postdata === undefined) {
                const res = yield this.core[method](this.baseurl + path, getdata, {}, axiosConfig);
                return this._respFn(res);
            }
            const res = yield this.core[method](this.baseurl + path, getdata, postdata, {}, axiosConfig);
            res.data = JSON.stringify(res.data); // coverage completeness
            return this._respFn(res);
        });
    }
}
exports.TestAPI = TestAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGxpYi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3Rlc3RzL3Rlc3RsaWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBR0EsbURBQW9FO0FBRXBFLE1BQWEsT0FBUSxTQUFRLGlCQUFPO0lBMkJsQyxZQUFZLElBQW1CLEVBQUUsV0FBbUIsY0FBYztRQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUE7UUExQjNGLFlBQU8sR0FBRyxDQUFPLEtBQWEsRUFBRSxPQUFlLEVBQUUsRUFBRSxjQUFrQyxTQUFTLEVBQW1CLEVBQUUsZ0RBQUMsT0FBQSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQSxHQUFBLENBQUE7UUFDekssZUFBVSxHQUFHLENBQU8sS0FBYSxFQUFFLE9BQWUsRUFBRSxFQUFFLGNBQWtDLFNBQVMsRUFBbUIsRUFBRSxnREFBQyxPQUFBLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFBLEdBQUEsQ0FBQTtRQUMvSyxhQUFRLEdBQUcsQ0FBTyxLQUFhLEVBQUUsT0FBZSxFQUFFLEVBQUUsY0FBa0MsU0FBUyxFQUFtQixFQUFFLGdEQUFDLE9BQUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFBLEdBQUEsQ0FBQTtRQUMvSyxZQUFPLEdBQUcsQ0FBTyxLQUFhLEVBQUUsT0FBZSxFQUFFLEVBQUUsY0FBa0MsU0FBUyxFQUFtQixFQUFFLGdEQUFDLE9BQUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFBLEdBQUEsQ0FBQTtRQUM3SyxjQUFTLEdBQUcsQ0FBTyxLQUFhLEVBQUUsT0FBZSxFQUFFLEVBQUUsY0FBa0MsU0FBUyxFQUFtQixFQUFFLGdEQUFDLE9BQUEsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLFdBQVcsQ0FBQyxDQUFBLEdBQUEsQ0FBQTtRQUV2SyxZQUFPLEdBQUcsQ0FBQyxHQUF3QixFQUFPLEVBQUU7WUFDcEQsSUFBSSxRQUFhLENBQUE7WUFDakIsSUFBSSxPQUFPLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO2dCQUNoQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7YUFDaEM7aUJBQU07Z0JBQ0wsUUFBUSxHQUFHLEdBQUcsQ0FBQyxJQUFjLENBQUE7YUFDOUI7WUFDRCxPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUE7UUFDeEIsQ0FBQyxDQUFBO1FBRVMsZ0JBQVcsR0FBRyxDQUFPLE1BQWMsRUFBRSxPQUFlLEVBQUUsRUFBRSxVQUFrQixFQUFFLEVBQUUsV0FBbUIsU0FBUyxFQUFFLGNBQWtDLFNBQVMsRUFBbUIsRUFBRTtZQUNwTCxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7Z0JBQzFCLE1BQU0sR0FBRyxHQUF3QixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQTtnQkFDdkcsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2FBQ3pCO1lBQ0QsTUFBTSxHQUFHLEdBQXdCLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FBQTtZQUNqSCxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBLENBQUMsd0JBQXdCO1lBQzVELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUMxQixDQUFDLENBQUEsQ0FBQTtJQUUyRixDQUFDO0NBQzlGO0FBNUJELDBCQTRCQyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IEF2YWxhbmNoZUNvcmUgZnJvbSBcInNyYy9hdmFsYW5jaGVcIlxuaW1wb3J0IHsgQXhpb3NSZXF1ZXN0Q29uZmlnIH0gZnJvbSBcImF4aW9zXCJcbmltcG9ydCB7IEFQSUJhc2UsIFJlcXVlc3RSZXNwb25zZURhdGEgfSBmcm9tIFwiLi4vc3JjL2NvbW1vbi9hcGliYXNlXCJcblxuZXhwb3J0IGNsYXNzIFRlc3RBUEkgZXh0ZW5kcyBBUElCYXNlIHtcbiAgVGVzdEdFVCA9IGFzeW5jIChpbnB1dDogc3RyaW5nLCBwYXRoOiBzdHJpbmcgPSBcIlwiLCBheGlvc0NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0gdW5kZWZpbmVkKTogUHJvbWlzZTxvYmplY3Q+ID0+IHRoaXMuX1Rlc3RNZXRob2QoXCJnZXRcIiwgcGF0aCwgeyBpbnB1dCB9LCBheGlvc0NvbmZpZylcbiAgVGVzdERFTEVURSA9IGFzeW5jIChpbnB1dDogc3RyaW5nLCBwYXRoOiBzdHJpbmcgPSBcIlwiLCBheGlvc0NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0gdW5kZWZpbmVkKTogUHJvbWlzZTxvYmplY3Q+ID0+IHRoaXMuX1Rlc3RNZXRob2QoXCJkZWxldGVcIiwgcGF0aCwgeyBpbnB1dCB9LCBheGlvc0NvbmZpZylcbiAgVGVzdFBPU1QgPSBhc3luYyAoaW5wdXQ6IHN0cmluZywgcGF0aDogc3RyaW5nID0gXCJcIiwgYXhpb3NDb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHVuZGVmaW5lZCk6IFByb21pc2U8b2JqZWN0PiA9PiB0aGlzLl9UZXN0TWV0aG9kKFwicG9zdFwiLCBwYXRoLCB7fSwgeyBpbnB1dCB9LCBheGlvc0NvbmZpZylcbiAgVGVzdFBVVCA9IGFzeW5jIChpbnB1dDogc3RyaW5nLCBwYXRoOiBzdHJpbmcgPSBcIlwiLCBheGlvc0NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0gdW5kZWZpbmVkKTogUHJvbWlzZTxvYmplY3Q+ID0+IHRoaXMuX1Rlc3RNZXRob2QoXCJwdXRcIiwgcGF0aCwge30sIHsgaW5wdXQgfSwgYXhpb3NDb25maWcpXG4gIFRlc3RQQVRDSCA9IGFzeW5jIChpbnB1dDogc3RyaW5nLCBwYXRoOiBzdHJpbmcgPSBcIlwiLCBheGlvc0NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0gdW5kZWZpbmVkKTogUHJvbWlzZTxvYmplY3Q+ID0+IHRoaXMuX1Rlc3RNZXRob2QoXCJwYXRjaFwiLCBwYXRoLCB7fSwgeyBpbnB1dCB9LCBheGlvc0NvbmZpZylcblxuICBwcm90ZWN0ZWQgX3Jlc3BGbiA9IChyZXM6IFJlcXVlc3RSZXNwb25zZURhdGEpOiBhbnkgPT4ge1xuICAgIGxldCByZXNwb25zZTogYW55XG4gICAgaWYgKHR5cGVvZiByZXMuZGF0YSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlcy5kYXRhKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXNwb25zZSA9IHJlcy5kYXRhIGFzIG9iamVjdFxuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2UucmVzdWx0XG4gIH1cblxuICBwcm90ZWN0ZWQgX1Rlc3RNZXRob2QgPSBhc3luYyAobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZyA9IFwiXCIsIGdldGRhdGE6IG9iamVjdCA9IHt9LCBwb3N0ZGF0YTogb2JqZWN0ID0gdW5kZWZpbmVkLCBheGlvc0NvbmZpZzogQXhpb3NSZXF1ZXN0Q29uZmlnID0gdW5kZWZpbmVkKTogUHJvbWlzZTxvYmplY3Q+ID0+IHtcbiAgICBpZiAocG9zdGRhdGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgcmVzOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jb3JlW21ldGhvZF0odGhpcy5iYXNldXJsICsgcGF0aCwgZ2V0ZGF0YSwge30sIGF4aW9zQ29uZmlnKVxuICAgICAgcmV0dXJuIHRoaXMuX3Jlc3BGbihyZXMpXG4gICAgfVxuICAgIGNvbnN0IHJlczogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY29yZVttZXRob2RdKHRoaXMuYmFzZXVybCArIHBhdGgsIGdldGRhdGEsIHBvc3RkYXRhLCB7fSwgYXhpb3NDb25maWcpXG4gICAgcmVzLmRhdGEgPSBKU09OLnN0cmluZ2lmeShyZXMuZGF0YSkgLy8gY292ZXJhZ2UgY29tcGxldGVuZXNzXG4gICAgcmV0dXJuIHRoaXMuX3Jlc3BGbihyZXMpXG4gIH1cblxuICBjb25zdHJ1Y3RvcihhdmF4OiBBdmFsYW5jaGVDb3JlLCBlbmRwb2ludDogc3RyaW5nID0gXCIvZXh0L3Rlc3RpbmdcIikgeyBzdXBlcihhdmF4LCBlbmRwb2ludCkgfVxufVxuIl19