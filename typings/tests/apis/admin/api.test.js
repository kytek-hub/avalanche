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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jest_mock_axios_1 = __importDefault(require("jest-mock-axios"));
const src_1 = require("src");
describe('Admin', () => {
    const ip = '127.0.0.1';
    const port = 9650;
    const protocol = 'https';
    const avalanche = new src_1.Avalanche(ip, port, protocol, 12345, 'What is my purpose? You pass butter. Oh my god.', undefined, undefined, false);
    let admin;
    beforeAll(() => {
        admin = avalanche.Admin();
    });
    afterEach(() => {
        jest_mock_axios_1.default.reset();
    });
    test('alias', () => __awaiter(void 0, void 0, void 0, function* () {
        const ep = '/ext/something';
        const al = '/ext/anotherthing';
        const result = admin.alias(ep, al);
        const payload = {
            result: {
                success: true,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(true);
    }));
    test('aliasChain', () => __awaiter(void 0, void 0, void 0, function* () {
        const ch = 'abcd';
        const al = 'myChain';
        const result = admin.aliasChain(ch, al);
        const payload = {
            result: {
                success: true,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(true);
    }));
    test('getChainAliases', () => __awaiter(void 0, void 0, void 0, function* () {
        const ch = 'chain';
        const result = admin.getChainAliases(ch);
        const payload = {
            result: {
                aliases: [
                    "alias1",
                    "alias2"
                ],
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        // @ts-ignore
        expect(response).toBe(payload.result.aliases);
    }));
    test('lockProfile', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = admin.lockProfile();
        const payload = {
            result: {
                success: true,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(true);
    }));
    test('memoryProfile', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = admin.memoryProfile();
        const payload = {
            result: {
                success: true,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(true);
    }));
    test('startCPUProfiler', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = admin.startCPUProfiler();
        const payload = {
            result: {
                success: true,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(true);
    }));
    test('stopCPUProfiler', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = admin.stopCPUProfiler();
        const payload = {
            result: {
                success: true,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(true);
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0cy9hcGlzL2FkbWluL2FwaS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0VBQXVDO0FBRXZDLDZCQUErQjtBQUcvQixRQUFRLENBQUMsT0FBTyxFQUFFLEdBQVMsRUFBRTtJQUMzQixNQUFNLEVBQUUsR0FBVyxXQUFXLENBQUE7SUFDOUIsTUFBTSxJQUFJLEdBQVcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sUUFBUSxHQUFXLE9BQU8sQ0FBQTtJQUNoQyxNQUFNLFNBQVMsR0FBYyxJQUFJLGVBQVMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsaURBQWlELEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUNySixJQUFJLEtBQWUsQ0FBQTtJQUVuQixTQUFTLENBQUMsR0FBUyxFQUFFO1FBQ25CLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUE7SUFDM0IsQ0FBQyxDQUFDLENBQUE7SUFFRixTQUFTLENBQUMsR0FBUyxFQUFFO1FBQ25CLHlCQUFTLENBQUMsS0FBSyxFQUFFLENBQUE7SUFDbkIsQ0FBQyxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMsT0FBTyxFQUFFLEdBQXdCLEVBQUU7UUFDdEMsTUFBTSxFQUFFLEdBQVcsZ0JBQWdCLENBQUE7UUFDbkMsTUFBTSxFQUFFLEdBQVcsbUJBQW1CLENBQUE7UUFDdEMsTUFBTSxNQUFNLEdBQXFCLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ3BELE1BQU0sT0FBTyxHQUFVO1lBQ3JCLE1BQU0sRUFBRTtnQkFDTixPQUFPLEVBQUUsSUFBSTthQUNkO1NBQ0YsQ0FBQTtRQUNELE1BQU0sV0FBVyxHQUFpQjtZQUNoQyxJQUFJLEVBQUUsT0FBTztTQUNkLENBQUE7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LE1BQU0sRUFBRTtnQkFDTixPQUFPLEVBQUUsSUFBSTthQUNkO1NBQ0YsQ0FBQTtRQUNELE1BQU0sV0FBVyxHQUFpQjtZQUNoQyxJQUFJLEVBQUUsT0FBTztTQUNkLENBQUE7UUFFRCx5QkFBUyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUNuQyxNQUFNLFFBQVEsR0FBWSxNQUFNLE1BQU0sQ0FBQTtRQUV0QyxNQUFNLENBQUMseUJBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdCLENBQUMsQ0FBQSxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb2NrQXhpb3MgZnJvbSAnamVzdC1tb2NrLWF4aW9zJ1xuaW1wb3J0IHsgSHR0cFJlc3BvbnNlIH0gZnJvbSAnamVzdC1tb2NrLWF4aW9zL2Rpc3QvbGliL21vY2stYXhpb3MtdHlwZXMnXG5pbXBvcnQgeyBBdmFsYW5jaGUgfSBmcm9tICdzcmMnXG5pbXBvcnQgeyBBZG1pbkFQSSB9IGZyb20gJ3NyYy9hcGlzL2FkbWluL2FwaSdcblxuZGVzY3JpYmUoJ0FkbWluJywgKCk6IHZvaWQgPT4ge1xuICBjb25zdCBpcDogc3RyaW5nID0gJzEyNy4wLjAuMSdcbiAgY29uc3QgcG9ydDogbnVtYmVyID0gOTY1MFxuICBjb25zdCBwcm90b2NvbDogc3RyaW5nID0gJ2h0dHBzJ1xuICBjb25zdCBhdmFsYW5jaGU6IEF2YWxhbmNoZSA9IG5ldyBBdmFsYW5jaGUoaXAsIHBvcnQsIHByb3RvY29sLCAxMjM0NSwgJ1doYXQgaXMgbXkgcHVycG9zZT8gWW91IHBhc3MgYnV0dGVyLiBPaCBteSBnb2QuJywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZhbHNlKVxuICBsZXQgYWRtaW46IEFkbWluQVBJXG5cbiAgYmVmb3JlQWxsKCgpOiB2b2lkID0+IHtcbiAgICBhZG1pbiA9IGF2YWxhbmNoZS5BZG1pbigpXG4gIH0pXG5cbiAgYWZ0ZXJFYWNoKCgpOiB2b2lkID0+IHtcbiAgICBtb2NrQXhpb3MucmVzZXQoKVxuICB9KVxuXG4gIHRlc3QoJ2FsaWFzJywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IGVwOiBzdHJpbmcgPSAnL2V4dC9zb21ldGhpbmcnXG4gICAgY29uc3QgYWw6IHN0cmluZyA9ICcvZXh0L2Fub3RoZXJ0aGluZydcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8Ym9vbGVhbj4gPSBhZG1pbi5hbGlhcyhlcCwgYWwpXG4gICAgY29uc3QgcGF5bG9hZDpvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IGJvb2xlYW4gPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHRydWUpXG4gIH0pXG5cbiAgdGVzdCgnYWxpYXNDaGFpbicsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBjaDogc3RyaW5nID0gJ2FiY2QnXG4gICAgY29uc3QgYWw6IHN0cmluZyA9ICdteUNoYWluJ1xuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxib29sZWFuPiA9IGFkbWluLmFsaWFzQ2hhaW4oY2gsIGFsKVxuICAgIGNvbnN0IHBheWxvYWQ6b2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBib29sZWFuID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSh0cnVlKVxuICB9KVxuXG4gIHRlc3QoJ2dldENoYWluQWxpYXNlcycsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBjaDogc3RyaW5nID0gJ2NoYWluJ1xuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmdbXT4gPSBhZG1pbi5nZXRDaGFpbkFsaWFzZXMoY2gpXG4gICAgY29uc3QgcGF5bG9hZDpvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgYWxpYXNlczogW1xuICAgICAgICAgICAgXCJhbGlhczFcIixcbiAgICAgICAgICAgIFwiYWxpYXMyXCJcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZ1tdID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIC8vIEB0cy1pZ25vcmVcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUocGF5bG9hZC5yZXN1bHQuYWxpYXNlcylcbiAgfSlcblxuICB0ZXN0KCdsb2NrUHJvZmlsZScsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8Ym9vbGVhbj4gPSBhZG1pbi5sb2NrUHJvZmlsZSgpXG4gICAgY29uc3QgcGF5bG9hZDpvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IGJvb2xlYW4gPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHRydWUpXG4gIH0pXG5cbiAgdGVzdCgnbWVtb3J5UHJvZmlsZScsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8Ym9vbGVhbj4gPSBhZG1pbi5tZW1vcnlQcm9maWxlKClcbiAgICBjb25zdCBwYXlsb2FkOm9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogYm9vbGVhbiA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUodHJ1ZSlcbiAgfSlcblxuICB0ZXN0KCdzdGFydENQVVByb2ZpbGVyJywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxib29sZWFuPiA9IGFkbWluLnN0YXJ0Q1BVUHJvZmlsZXIoKVxuICAgIGNvbnN0IHBheWxvYWQ6b2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBib29sZWFuID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSh0cnVlKVxuICB9KVxuXG4gIHRlc3QoJ3N0b3BDUFVQcm9maWxlcicsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8Ym9vbGVhbj4gPSBhZG1pbi5zdG9wQ1BVUHJvZmlsZXIoKVxuICAgIGNvbnN0IHBheWxvYWQ6b2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIHN1Y2Nlc3M6IHRydWUsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBib29sZWFuID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSh0cnVlKVxuICB9KVxufSlcbiJdfQ==