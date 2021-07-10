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
const api_1 = require("src/apis/metrics/api");
describe('Metrics', () => {
    const ip = '127.0.0.1';
    const port = 9650;
    const protocol = 'https';
    const avalanche = new src_1.Avalanche(ip, port, protocol, 12345, undefined, undefined, undefined, true);
    let metrics;
    beforeAll(() => {
        metrics = new api_1.MetricsAPI(avalanche);
    });
    afterEach(() => {
        jest_mock_axios_1.default.reset();
    });
    test('getMetrics', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = metrics.getMetrics();
        const payload = `
              gecko_timestamp_handler_get_failed_bucket{le="100"} 0
              gecko_timestamp_handler_get_failed_bucket{le="1000"} 0
              gecko_timestamp_handler_get_failed_bucket{le="10000"} 0
              gecko_timestamp_handler_get_failed_bucket{le="100000"} 0
              gecko_timestamp_handler_get_failed_bucket{le="1e+06"} 0
              gecko_timestamp_handler_get_failed_bucket{le="1e+07"} 0
              gecko_timestamp_handler_get_failed_bucket{le="1e+08"} 0
              gecko_timestamp_handler_get_failed_bucket{le="1e+09"} 0
              gecko_timestamp_handler_get_failed_bucket{le="+Inf"} 0
        `;
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(payload);
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0cy9hcGlzL21ldHJpY3MvYXBpLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzRUFBdUM7QUFFdkMsNkJBQStCO0FBQy9CLDhDQUFpRDtBQUVqRCxRQUFRLENBQUMsU0FBUyxFQUFFLEdBQVMsRUFBRTtJQUM3QixNQUFNLEVBQUUsR0FBVyxXQUFXLENBQUE7SUFDOUIsTUFBTSxJQUFJLEdBQVcsSUFBSSxDQUFBO0lBQ3pCLE1BQU0sUUFBUSxHQUFXLE9BQU8sQ0FBQTtJQUVoQyxNQUFNLFNBQVMsR0FBYyxJQUFJLGVBQVMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDNUcsSUFBSSxPQUFtQixDQUFBO0lBRXZCLFNBQVMsQ0FBQyxHQUFTLEVBQUU7UUFDbkIsT0FBTyxHQUFHLElBQUksZ0JBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNyQyxDQUFDLENBQUMsQ0FBQTtJQUVGLFNBQVMsQ0FBQyxHQUFTLEVBQUU7UUFDbkIseUJBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtJQUNuQixDQUFDLENBQUMsQ0FBQTtJQUVGLElBQUksQ0FBQyxZQUFZLEVBQUUsR0FBd0IsRUFBRTtRQUMzQyxNQUFNLE1BQU0sR0FBb0IsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3BELE1BQU0sT0FBTyxHQUFVOzs7Ozs7Ozs7O1NBVWxCLENBQUE7UUFDTCxNQUFNLFdBQVcsR0FBaUI7WUFDaEMsSUFBSSxFQUFFLE9BQU87U0FDZCxDQUFBO1FBRUQseUJBQVMsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDbkMsTUFBTSxRQUFRLEdBQVcsTUFBTSxNQUFNLENBQUE7UUFFckMsTUFBTSxDQUFDLHlCQUFTLENBQUMsT0FBTyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUNoQyxDQUFDLENBQUEsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbW9ja0F4aW9zIGZyb20gJ2plc3QtbW9jay1heGlvcydcbmltcG9ydCB7IEh0dHBSZXNwb25zZSB9IGZyb20gJ2plc3QtbW9jay1heGlvcy9kaXN0L2xpYi9tb2NrLWF4aW9zLXR5cGVzJ1xuaW1wb3J0IHsgQXZhbGFuY2hlIH0gZnJvbSAnc3JjJ1xuaW1wb3J0IHsgTWV0cmljc0FQSSB9IGZyb20gJ3NyYy9hcGlzL21ldHJpY3MvYXBpJ1xuXG5kZXNjcmliZSgnTWV0cmljcycsICgpOiB2b2lkID0+IHtcbiAgY29uc3QgaXA6IHN0cmluZyA9ICcxMjcuMC4wLjEnXG4gIGNvbnN0IHBvcnQ6IG51bWJlciA9IDk2NTBcbiAgY29uc3QgcHJvdG9jb2w6IHN0cmluZyA9ICdodHRwcydcblxuICBjb25zdCBhdmFsYW5jaGU6IEF2YWxhbmNoZSA9IG5ldyBBdmFsYW5jaGUoaXAsIHBvcnQsIHByb3RvY29sLCAxMjM0NSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdHJ1ZSlcbiAgbGV0IG1ldHJpY3M6IE1ldHJpY3NBUElcblxuICBiZWZvcmVBbGwoKCk6IHZvaWQgPT4ge1xuICAgIG1ldHJpY3MgPSBuZXcgTWV0cmljc0FQSShhdmFsYW5jaGUpXG4gIH0pXG5cbiAgYWZ0ZXJFYWNoKCgpOiB2b2lkID0+IHtcbiAgICBtb2NrQXhpb3MucmVzZXQoKVxuICB9KVxuXG4gIHRlc3QoJ2dldE1ldHJpY3MnLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBtZXRyaWNzLmdldE1ldHJpY3MoKVxuICAgIGNvbnN0IHBheWxvYWQ6c3RyaW5nID0gYFxuICAgICAgICAgICAgICBnZWNrb190aW1lc3RhbXBfaGFuZGxlcl9nZXRfZmFpbGVkX2J1Y2tldHtsZT1cIjEwMFwifSAwXG4gICAgICAgICAgICAgIGdlY2tvX3RpbWVzdGFtcF9oYW5kbGVyX2dldF9mYWlsZWRfYnVja2V0e2xlPVwiMTAwMFwifSAwXG4gICAgICAgICAgICAgIGdlY2tvX3RpbWVzdGFtcF9oYW5kbGVyX2dldF9mYWlsZWRfYnVja2V0e2xlPVwiMTAwMDBcIn0gMFxuICAgICAgICAgICAgICBnZWNrb190aW1lc3RhbXBfaGFuZGxlcl9nZXRfZmFpbGVkX2J1Y2tldHtsZT1cIjEwMDAwMFwifSAwXG4gICAgICAgICAgICAgIGdlY2tvX3RpbWVzdGFtcF9oYW5kbGVyX2dldF9mYWlsZWRfYnVja2V0e2xlPVwiMWUrMDZcIn0gMFxuICAgICAgICAgICAgICBnZWNrb190aW1lc3RhbXBfaGFuZGxlcl9nZXRfZmFpbGVkX2J1Y2tldHtsZT1cIjFlKzA3XCJ9IDBcbiAgICAgICAgICAgICAgZ2Vja29fdGltZXN0YW1wX2hhbmRsZXJfZ2V0X2ZhaWxlZF9idWNrZXR7bGU9XCIxZSswOFwifSAwXG4gICAgICAgICAgICAgIGdlY2tvX3RpbWVzdGFtcF9oYW5kbGVyX2dldF9mYWlsZWRfYnVja2V0e2xlPVwiMWUrMDlcIn0gMFxuICAgICAgICAgICAgICBnZWNrb190aW1lc3RhbXBfaGFuZGxlcl9nZXRfZmFpbGVkX2J1Y2tldHtsZT1cIitJbmZcIn0gMFxuICAgICAgICBgXG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZShwYXlsb2FkKVxuICB9KVxufSlcbiJdfQ==