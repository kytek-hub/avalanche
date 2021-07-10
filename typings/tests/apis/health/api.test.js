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
const bintools_1 = __importDefault(require("src/utils/bintools"));
const api_1 = require("src/apis/health/api");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
describe('Health', () => {
    const ip = '127.0.0.1';
    const port = 9650;
    const protocol = 'https';
    const avalanche = new src_1.Avalanche(ip, port, protocol, 12345, undefined, undefined, undefined, true);
    let health;
    beforeAll(() => {
        health = new api_1.HealthAPI(avalanche);
    });
    afterEach(() => {
        jest_mock_axios_1.default.reset();
    });
    test('getLiveness ', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = health.getLiveness();
        const payload = {
            result: {
                checks: {
                    'network.validators.heartbeat': {
                        message: {
                            heartbeat: 1591041377,
                        },
                        timestamp: '2020-06-01T15:56:18.554202-04:00',
                        duration: 23201,
                        contiguousFailures: 0,
                        timeOfFirstFailure: null,
                    },
                },
                healthy: true,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(payload.result);
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0cy9hcGlzL2hlYWx0aC9hcGkudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHNFQUF1QztBQUV2Qyw2QkFBK0I7QUFDL0Isa0VBQXlDO0FBQ3pDLDZDQUErQztBQUcvQzs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFakQsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFTLEVBQUU7SUFDNUIsTUFBTSxFQUFFLEdBQVcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sSUFBSSxHQUFXLElBQUksQ0FBQTtJQUN6QixNQUFNLFFBQVEsR0FBVyxPQUFPLENBQUE7SUFDaEMsTUFBTSxTQUFTLEdBQWMsSUFBSSxlQUFTLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFBO0lBQzVHLElBQUksTUFBaUIsQ0FBQTtJQUVyQixTQUFTLENBQUMsR0FBUyxFQUFFO1FBQ25CLE1BQU0sR0FBRyxJQUFJLGVBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNuQyxDQUFDLENBQUMsQ0FBQTtJQUVGLFNBQVMsQ0FBQyxHQUFTLEVBQUU7UUFDbkIseUJBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUNuQixDQUFDLENBQUMsQ0FBQTtJQUVGLElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBd0IsRUFBRTtRQUM3QyxNQUFNLE1BQU0sR0FBb0IsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFBO1FBQ3BELE1BQU0sT0FBTyxHQUFPO1lBQ2xCLE1BQU0sRUFBRTtnQkFDTixNQUFNLEVBQUU7b0JBQ04sOEJBQThCLEVBQUU7d0JBQzlCLE9BQU8sRUFBRTs0QkFDUCxTQUFTLEVBQUUsVUFBVTt5QkFDdEI7d0JBQ0QsU0FBUyxFQUFFLGtDQUFrQzt3QkFDN0MsUUFBUSxFQUFFLEtBQUs7d0JBQ2Ysa0JBQWtCLEVBQUUsQ0FBQzt3QkFDckIsa0JBQWtCLEVBQUUsSUFBSTtxQkFDekI7aUJBQ0Y7Z0JBQ0QsT0FBTyxFQUFFLElBQUk7YUFDZDtTQUNGLENBQUE7UUFDRCxNQUFNLFdBQVcsR0FBaUI7WUFDaEMsSUFBSSxFQUFFLE9BQU87U0FDZCxDQUFBO1FBRUQseUJBQVMsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDbkMsTUFBTSxRQUFRLEdBQVEsTUFBTSxNQUFNLENBQUE7UUFFbEMsTUFBTSxDQUFDLHlCQUFTLENBQUMsT0FBTyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDdkMsQ0FBQyxDQUFBLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vY2tBeGlvcyBmcm9tICdqZXN0LW1vY2stYXhpb3MnXG5cbmltcG9ydCB7IEF2YWxhbmNoZSB9IGZyb20gJ3NyYydcbmltcG9ydCBCaW5Ub29scyBmcm9tICdzcmMvdXRpbHMvYmludG9vbHMnXG5pbXBvcnQgeyBIZWFsdGhBUEkgfSBmcm9tICdzcmMvYXBpcy9oZWFsdGgvYXBpJ1xuaW1wb3J0IHsgSHR0cFJlc3BvbnNlIH0gZnJvbSAnamVzdC1tb2NrLWF4aW9zL2Rpc3QvbGliL21vY2stYXhpb3MtdHlwZXMnXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5cbmRlc2NyaWJlKCdIZWFsdGgnLCAoKTogdm9pZCA9PiB7XG4gIGNvbnN0IGlwOiBzdHJpbmcgPSAnMTI3LjAuMC4xJ1xuICBjb25zdCBwb3J0OiBudW1iZXIgPSA5NjUwXG4gIGNvbnN0IHByb3RvY29sOiBzdHJpbmcgPSAnaHR0cHMnXG4gIGNvbnN0IGF2YWxhbmNoZTogQXZhbGFuY2hlID0gbmV3IEF2YWxhbmNoZShpcCwgcG9ydCwgcHJvdG9jb2wsIDEyMzQ1LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0cnVlKVxuICBsZXQgaGVhbHRoOiBIZWFsdGhBUElcblxuICBiZWZvcmVBbGwoKCk6IHZvaWQgPT4ge1xuICAgIGhlYWx0aCA9IG5ldyBIZWFsdGhBUEkoYXZhbGFuY2hlKVxuICB9KVxuXG4gIGFmdGVyRWFjaCgoKTogdm9pZCA9PiB7XG4gICAgbW9ja0F4aW9zLnJlc2V0KClcbiAgfSlcblxuICB0ZXN0KCdnZXRMaXZlbmVzcyAnLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPG9iamVjdD4gPSBoZWFsdGguZ2V0TGl2ZW5lc3MoKVxuICAgIGNvbnN0IHBheWxvYWQ6YW55ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIGNoZWNrczoge1xuICAgICAgICAgICduZXR3b3JrLnZhbGlkYXRvcnMuaGVhcnRiZWF0Jzoge1xuICAgICAgICAgICAgbWVzc2FnZToge1xuICAgICAgICAgICAgICBoZWFydGJlYXQ6IDE1OTEwNDEzNzcsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGltZXN0YW1wOiAnMjAyMC0wNi0wMVQxNTo1NjoxOC41NTQyMDItMDQ6MDAnLFxuICAgICAgICAgICAgZHVyYXRpb246IDIzMjAxLFxuICAgICAgICAgICAgY29udGlndW91c0ZhaWx1cmVzOiAwLFxuICAgICAgICAgICAgdGltZU9mRmlyc3RGYWlsdXJlOiBudWxsLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGhlYWx0aHk6IHRydWUsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBhbnkgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHBheWxvYWQucmVzdWx0KVxuICB9KVxufSlcbiJdfQ==