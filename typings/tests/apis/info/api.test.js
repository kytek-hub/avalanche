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
const bn_js_1 = __importDefault(require("bn.js"));
describe('Info', () => {
    const ip = '127.0.0.1';
    const port = 9650;
    const protocol = 'https';
    const avalanche = new src_1.Avalanche(ip, port, protocol, 12345, 'What is my purpose? You pass butter. Oh my god.', undefined, undefined, false);
    let info;
    beforeAll(() => {
        info = avalanche.Info();
    });
    afterEach(() => {
        jest_mock_axios_1.default.reset();
    });
    test('getBlockchainID', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = info.getBlockchainID('X');
        const payload = {
            result: {
                blockchainID: avalanche.XChain().getBlockchainID(),
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe('What is my purpose? You pass butter. Oh my god.');
    }));
    test('getNetworkID', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = info.getNetworkID();
        const payload = {
            result: {
                networkID: 12345,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(12345);
    }));
    test('getTxFee', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = info.getTxFee();
        const payload = {
            result: {
                txFee: "1000000",
                creationTxFee: "10000000"
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response.txFee.eq(new bn_js_1.default('1000000'))).toBe(true);
        expect(response.creationTxFee.eq(new bn_js_1.default('10000000'))).toBe(true);
    }));
    test('getNetworkName', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = info.getNetworkName();
        const payload = {
            result: {
                networkName: 'denali',
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe('denali');
    }));
    test('getNodeID', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = info.getNodeID();
        const payload = {
            result: {
                nodeID: 'abcd',
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe('abcd');
    }));
    test('getNodeVersion', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = info.getNodeVersion();
        const payload = {
            result: {
                version: 'avalanche/0.5.5',
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe('avalanche/0.5.5');
    }));
    test('isBootstrapped false', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = info.isBootstrapped('X');
        const payload = {
            result: {
                isBootstrapped: false,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(false);
    }));
    test('isBootstrapped true', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = info.isBootstrapped('P');
        const payload = {
            result: {
                isBootstrapped: true,
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
    test('peers', () => __awaiter(void 0, void 0, void 0, function* () {
        const peers = [{
                ip: '127.0.0.1:60300',
                publicIP: '127.0.0.1:9659',
                nodeID: 'NodeID-P7oB2McjBGgW2NXXWVYjV8JEDFoW9xDE5',
                version: 'avalanche/1.3.2',
                up: true,
                lastSent: '2021-04-14T08:15:06-07:00',
                lastReceived: '2021-04-14T08:15:06-07:00',
                benched: null
            }, {
                ip: '127.0.0.1:60302',
                publicIP: '127.0.0.1:9655',
                nodeID: 'NodeID-NFBbbJ4qCmNaCzeW7sxErhvWqvEQMnYcN',
                version: 'avalanche/1.3.2',
                up: true,
                lastSent: '2021-04-14T08:15:06-07:00',
                lastReceived: '2021-04-14T08:15:06-07:00',
                benched: null
            }];
        const result = info.peers();
        const payload = {
            result: {
                peers,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(peers);
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0cy9hcGlzL2luZm8vYXBpLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzRUFBdUM7QUFDdkMsNkJBQStCO0FBRS9CLGtEQUFzQjtBQUl0QixRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtJQUNwQixNQUFNLEVBQUUsR0FBVyxXQUFXLENBQUE7SUFDOUIsTUFBTSxJQUFJLEdBQVcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sUUFBUSxHQUFXLE9BQU8sQ0FBQTtJQUVoQyxNQUFNLFNBQVMsR0FBYyxJQUFJLGVBQVMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsaURBQWlELEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQTtJQUNySixJQUFJLElBQWEsQ0FBQTtJQUVqQixTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ2IsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUN6QixDQUFDLENBQUMsQ0FBQTtJQUVGLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYix5QkFBUyxDQUFDLEtBQUssRUFBRSxDQUFBO0lBQ25CLENBQUMsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLGlCQUFpQixFQUFFLEdBQVMsRUFBRTtRQUNqQyxNQUFNLE1BQU0sR0FBb0IsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUN6RCxNQUFNLE9BQU8sR0FBVTtZQUNyQixNQUFNLEVBQUU7Z0JBQ04sWUFBWSxFQUFFLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxlQUFlLEVBQUU7YUFDbkQ7U0FDRixDQUFBO1FBQ0QsTUFBTSxXQUFXLEdBQWlCO1lBQ2hDLElBQUksRUFBRSxPQUFPO1NBQ2QsQ0FBQTtRQUVELHlCQUFTLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FB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Z0JBQ2xELE9BQU8sRUFBRSxpQkFBaUI7Z0JBQzFCLEVBQUUsRUFBRSxJQUFJO2dCQUNSLFFBQVEsRUFBRSwyQkFBMkI7Z0JBQ3JDLFlBQVksRUFBRSwyQkFBMkI7Z0JBQ3pDLE9BQU8sRUFBRSxJQUFJO2FBQ2QsRUFBRTtnQkFDRCxFQUFFLEVBQUUsaUJBQWlCO2dCQUNyQixRQUFRLEVBQUUsZ0JBQWdCO2dCQUMxQixNQUFNLEVBQUUsMENBQTBDO2dCQUNsRCxPQUFPLEVBQUUsaUJBQWlCO2dCQUMxQixFQUFFLEVBQUUsSUFBSTtnQkFDUixRQUFRLEVBQUUsMkJBQTJCO2dCQUNyQyxZQUFZLEVBQUUsMkJBQTJCO2dCQUN6QyxPQUFPLEVBQUUsSUFBSTthQUNaLENBQUMsQ0FBQTtRQUNKLE1BQU0sTUFBTSxHQUE2QixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUE7UUFDckQsTUFBTSxPQUFPLEdBQVU7WUFDckIsTUFBTSxFQUFFO2dCQUNOLEtBQUs7YUFDTjtTQUNGLENBQUE7UUFDRCxNQUFNLFdBQVcsR0FBaUI7WUFDaEMsSUFBSSxFQUFFLE9BQU87U0FDZCxDQUFBO1FBRUQseUJBQVMsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDbkMsTUFBTSxRQUFRLEdBQW9CLE1BQU0sTUFBTSxDQUFBO1FBRTlDLE1BQU0sQ0FBQyx5QkFBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDOUIsQ0FBQyxDQUFBLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vY2tBeGlvcyBmcm9tICdqZXN0LW1vY2stYXhpb3MnXG5pbXBvcnQgeyBBdmFsYW5jaGUgfSBmcm9tICdzcmMnXG5pbXBvcnQgeyBJbmZvQVBJIH0gZnJvbSAnc3JjL2FwaXMvaW5mby9hcGknXG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCJcbmltcG9ydCB7IFBlZXJzUGFyYW1zLCBQZWVyc1Jlc3BvbnNlIH0gZnJvbSAnc3JjL2NvbW1vbidcbmltcG9ydCB7IEh0dHBSZXNwb25zZSB9IGZyb20gJ2plc3QtbW9jay1heGlvcy9kaXN0L2xpYi9tb2NrLWF4aW9zLXR5cGVzJ1xuXG5kZXNjcmliZSgnSW5mbycsICgpID0+IHtcbiAgY29uc3QgaXA6IHN0cmluZyA9ICcxMjcuMC4wLjEnXG4gIGNvbnN0IHBvcnQ6IG51bWJlciA9IDk2NTBcbiAgY29uc3QgcHJvdG9jb2w6IHN0cmluZyA9ICdodHRwcydcblxuICBjb25zdCBhdmFsYW5jaGU6IEF2YWxhbmNoZSA9IG5ldyBBdmFsYW5jaGUoaXAsIHBvcnQsIHByb3RvY29sLCAxMjM0NSwgJ1doYXQgaXMgbXkgcHVycG9zZT8gWW91IHBhc3MgYnV0dGVyLiBPaCBteSBnb2QuJywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZhbHNlKVxuICBsZXQgaW5mbzogSW5mb0FQSVxuXG4gIGJlZm9yZUFsbCgoKSA9PiB7XG4gICAgaW5mbyA9IGF2YWxhbmNoZS5JbmZvKClcbiAgfSlcblxuICBhZnRlckVhY2goKCkgPT4ge1xuICAgIG1vY2tBeGlvcy5yZXNldCgpXG4gIH0pXG5cbiAgdGVzdCgnZ2V0QmxvY2tjaGFpbklEJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gaW5mby5nZXRCbG9ja2NoYWluSUQoJ1gnKVxuICAgIGNvbnN0IHBheWxvYWQ6b2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIGJsb2NrY2hhaW5JRDogYXZhbGFuY2hlLlhDaGFpbigpLmdldEJsb2NrY2hhaW5JRCgpLFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSgnV2hhdCBpcyBteSBwdXJwb3NlPyBZb3UgcGFzcyBidXR0ZXIuIE9oIG15IGdvZC4nKVxuICB9KVxuXG4gIHRlc3QoJ2dldE5ldHdvcmtJRCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8bnVtYmVyPiA9IGluZm8uZ2V0TmV0d29ya0lEKClcbiAgICBjb25zdCBwYXlsb2FkOm9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBuZXR3b3JrSUQ6IDEyMzQ1LFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogbnVtYmVyID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSgxMjM0NSlcbiAgfSlcblxuICB0ZXN0KCdnZXRUeEZlZScsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8eyB0eEZlZTogQk4sIGNyZWF0aW9uVHhGZWU6IEJOIH0+ID0gaW5mby5nZXRUeEZlZSgpXG4gICAgY29uc3QgcGF5bG9hZDpvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgdHhGZWU6IFwiMTAwMDAwMFwiLFxuICAgICAgICBjcmVhdGlvblR4RmVlOiBcIjEwMDAwMDAwXCJcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHsgdHhGZWU6IEJOLCBjcmVhdGlvblR4RmVlOiBCTiB9ID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZS50eEZlZS5lcShuZXcgQk4oJzEwMDAwMDAnKSkpLnRvQmUodHJ1ZSlcbiAgICBleHBlY3QocmVzcG9uc2UuY3JlYXRpb25UeEZlZS5lcShuZXcgQk4oJzEwMDAwMDAwJykpKS50b0JlKHRydWUpXG4gIH0pXG5cbiAgdGVzdCgnZ2V0TmV0d29ya05hbWUnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBpbmZvLmdldE5ldHdvcmtOYW1lKClcbiAgICBjb25zdCBwYXlsb2FkOm9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBuZXR3b3JrTmFtZTogJ2RlbmFsaScsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKCdkZW5hbGknKVxuICB9KVxuXG4gIHRlc3QoJ2dldE5vZGVJRCcsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGluZm8uZ2V0Tm9kZUlEKClcbiAgICBjb25zdCBwYXlsb2FkOm9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBub2RlSUQ6ICdhYmNkJyxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUoJ2FiY2QnKVxuICB9KVxuXG4gIHRlc3QoJ2dldE5vZGVWZXJzaW9uJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gaW5mby5nZXROb2RlVmVyc2lvbigpXG4gICAgY29uc3QgcGF5bG9hZDpvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgdmVyc2lvbjogJ2F2YWxhbmNoZS8wLjUuNScsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKCdhdmFsYW5jaGUvMC41LjUnKVxuICB9KVxuXG4gIHRlc3QoJ2lzQm9vdHN0cmFwcGVkIGZhbHNlJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxib29sZWFuPiA9IGluZm8uaXNCb290c3RyYXBwZWQoJ1gnKVxuICAgIGNvbnN0IHBheWxvYWQ6b2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIGlzQm9vdHN0cmFwcGVkOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IGJvb2xlYW4gPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKGZhbHNlKVxuICB9KVxuXG4gIHRlc3QoJ2lzQm9vdHN0cmFwcGVkIHRydWUnLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPGJvb2xlYW4+ID0gaW5mby5pc0Jvb3RzdHJhcHBlZCgnUCcpXG4gICAgY29uc3QgcGF5bG9hZDpvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgaXNCb290c3RyYXBwZWQ6IHRydWUsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBib29sZWFuID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSh0cnVlKVxuICB9KVxuXG4gIHRlc3QoJ3BlZXJzJywgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHBlZXJzID0gW3tcbiAgICAgIGlwOiAnMTI3LjAuMC4xOjYwMzAwJyxcbiAgICAgIHB1YmxpY0lQOiAnMTI3LjAuMC4xOjk2NTknLFxuICAgICAgbm9kZUlEOiAnTm9kZUlELVA3b0IyTWNqQkdnVzJOWFhXVllqVjhKRURGb1c5eERFNScsXG4gICAgICB2ZXJzaW9uOiAnYXZhbGFuY2hlLzEuMy4yJyxcbiAgICAgIHVwOiB0cnVlLFxuICAgICAgbGFzdFNlbnQ6ICcyMDIxLTA0LTE0VDA4OjE1OjA2LTA3OjAwJyxcbiAgICAgIGxhc3RSZWNlaXZlZDogJzIwMjEtMDQtMTRUMDg6MTU6MDYtMDc6MDAnLFxuICAgICAgYmVuY2hlZDogbnVsbFxuICAgIH0sIHtcbiAgICAgIGlwOiAnMTI3LjAuMC4xOjYwMzAyJyxcbiAgICAgIHB1YmxpY0lQOiAnMTI3LjAuMC4xOjk2NTUnLFxuICAgICAgbm9kZUlEOiAnTm9kZUlELU5GQmJiSjRxQ21OYUN6ZVc3c3hFcmh2V3F2RVFNblljTicsXG4gICAgICB2ZXJzaW9uOiAnYXZhbGFuY2hlLzEuMy4yJyxcbiAgICAgIHVwOiB0cnVlLFxuICAgICAgbGFzdFNlbnQ6ICcyMDIxLTA0LTE0VDA4OjE1OjA2LTA3OjAwJyxcbiAgICAgIGxhc3RSZWNlaXZlZDogJzIwMjEtMDQtMTRUMDg6MTU6MDYtMDc6MDAnLFxuICAgICAgYmVuY2hlZDogbnVsbFxuICAgICAgfV1cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8UGVlcnNSZXNwb25zZVtdPiA9IGluZm8ucGVlcnMoKVxuICAgIGNvbnN0IHBheWxvYWQ6b2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIHBlZXJzLFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogUGVlcnNSZXNwb25zZVtdID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZShwZWVycylcbiAgfSlcbn0pXG4iXX0=