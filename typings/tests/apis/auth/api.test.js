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
describe('Auth', () => {
    const ip = '127.0.0.1';
    const port = 9650;
    const protocol = 'https';
    const avalanche = new src_1.Avalanche(ip, port, protocol, 12345, 'What is my purpose? You pass butter. Oh my god.', undefined, undefined, false);
    let auth;
    // We think we're a Rick, but we're totally a Jerry.
    let password = "Weddings are basically funerals with a cake. -- Rich Sanchez";
    let newPassword = "Sometimes science is more art than science, Morty. -- Rich Sanchez";
    let testToken = "To live is to risk it all otherwise you're just an inert chunk of randomly assembled molecules drifting wherever the universe blows you. -- Rick Sanchez";
    let testEndpoints = ["/ext/opt/bin/bash/foo", "/dev/null", "/tmp"];
    beforeAll(() => {
        auth = avalanche.Auth();
    });
    afterEach(() => {
        jest_mock_axios_1.default.reset();
    });
    test('newToken', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = auth.newToken(password, testEndpoints);
        const payload = {
            result: {
                token: testToken,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(testToken);
    }));
    test('revokeToken', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = auth.revokeToken(password, testToken);
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
    test('changePassword', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = auth.changePassword(password, newPassword);
        const payload = {
            result: {
                success: false,
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0cy9hcGlzL2F1dGgvYXBpLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzRUFBdUM7QUFFdkMsNkJBQStCO0FBRy9CLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBUyxFQUFFO0lBQzFCLE1BQU0sRUFBRSxHQUFXLFdBQVcsQ0FBQTtJQUM5QixNQUFNLElBQUksR0FBVyxJQUFJLENBQUE7SUFDekIsTUFBTSxRQUFRLEdBQVcsT0FBTyxDQUFBO0lBQ2hDLE1BQU0sU0FBUyxHQUFjLElBQUksZUFBUyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxpREFBaUQsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ3JKLElBQUksSUFBYSxDQUFBO0lBRWpCLG9EQUFvRDtJQUNwRCxJQUFJLFFBQVEsR0FBVyw4REFBOEQsQ0FBQTtJQUNyRixJQUFJLFdBQVcsR0FBVyxvRUFBb0UsQ0FBQTtJQUM5RixJQUFJLFNBQVMsR0FBVywwSkFBMEosQ0FBQTtJQUNsTCxJQUFJLGFBQWEsR0FBYSxDQUFDLHVCQUF1QixFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUU1RSxTQUFTLENBQUMsR0FBUyxFQUFFO1FBQ25CLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUE7SUFDekIsQ0FBQyxDQUFDLENBQUE7SUFFRixTQUFTLENBQUMsR0FBUyxFQUFFO1FBQ25CLHlCQUFTLENBQUMsS0FBSyxFQUFFLENBQUE7SUFDbkIsQ0FBQyxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMsVUFBVSxFQUFFLEdBQXdCLEVBQUU7UUFDekMsTUFBTSxNQUFNLEdBQW9CLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFBO1FBQ3RFLE1BQU0sT0FBTyxHQUFVO1lBQ3JCLE1BQU0sRUFBRTtnQkFDTixLQUFLLEVBQUUsU0FBUzthQUNqQjtTQUNGLENBQUE7UUFDRCxNQUFNLFdBQVcsR0FBaUI7WUFDaEMsSUFBSSxFQUFFLE9BQU87U0FDZCxDQUFBO1FBRUQseUJBQVMsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDbkMsTUFBTSxRQUFRLEdBQVcsTUFBTSxNQUFNLENBQUE7UUFFckMsTUFBTSxDQUFDLHlCQUFTLENBQUMsT0FBTyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtJQUNsQyxDQUFDLENBQUEsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUF3QixFQUFFO1FBQzVDLE1BQU0sTUFBTSxHQUFxQixJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQTtRQUN0RSxNQUFNLE9BQU8sR0FBVTtZQUNyQixNQUFNLEVBQUU7Z0JBQ04sT0FBTyxFQUFFLElBQUk7YUFDZDtTQUNGLENBQUE7UUFDRCxNQUFNLFdBQVcsR0FBaUI7WUFDaEMsSUFBSSxFQUFFLE9BQU87U0FDZCxDQUFBO1FBRUQseUJBQVMsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDbkMsTUFBTSxRQUFRLEdBQVksTUFBTSxNQUFNLENBQUE7UUFFdEMsTUFBTSxDQUFDLHlCQUFTLENBQUMsT0FBTyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QixDQUFDLENBQUEsQ0FBQyxDQUFBO0lBR0YsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQXdCLEVBQUU7UUFDL0MsTUFBTSxNQUFNLEdBQXFCLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFBO1FBQzNFLE1BQU0sT0FBTyxHQUFVO1lBQ3JCLE1BQU0sRUFBRTtnQkFDTixPQUFPLEVBQUUsS0FBSzthQUNmO1NBQ0YsQ0FBQTtRQUNELE1BQU0sV0FBVyxHQUFpQjtZQUNoQyxJQUFJLEVBQUUsT0FBTztTQUNkLENBQUE7UUFFRCx5QkFBUyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUNuQyxNQUFNLFFBQVEsR0FBWSxNQUFNLE1BQU0sQ0FBQTtRQUV0QyxNQUFNLENBQUMseUJBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzlCLENBQUMsQ0FBQSxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb2NrQXhpb3MgZnJvbSAnamVzdC1tb2NrLWF4aW9zJ1xuaW1wb3J0IHsgSHR0cFJlc3BvbnNlIH0gZnJvbSAnamVzdC1tb2NrLWF4aW9zL2Rpc3QvbGliL21vY2stYXhpb3MtdHlwZXMnXG5pbXBvcnQgeyBBdmFsYW5jaGUgfSBmcm9tICdzcmMnXG5pbXBvcnQgeyBBdXRoQVBJIH0gZnJvbSAnc3JjL2FwaXMvYXV0aC9hcGknXG5cbmRlc2NyaWJlKCdBdXRoJywgKCk6IHZvaWQgPT4ge1xuICBjb25zdCBpcDogc3RyaW5nID0gJzEyNy4wLjAuMSdcbiAgY29uc3QgcG9ydDogbnVtYmVyID0gOTY1MFxuICBjb25zdCBwcm90b2NvbDogc3RyaW5nID0gJ2h0dHBzJ1xuICBjb25zdCBhdmFsYW5jaGU6IEF2YWxhbmNoZSA9IG5ldyBBdmFsYW5jaGUoaXAsIHBvcnQsIHByb3RvY29sLCAxMjM0NSwgJ1doYXQgaXMgbXkgcHVycG9zZT8gWW91IHBhc3MgYnV0dGVyLiBPaCBteSBnb2QuJywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZhbHNlKVxuICBsZXQgYXV0aDogQXV0aEFQSVxuXG4gIC8vIFdlIHRoaW5rIHdlJ3JlIGEgUmljaywgYnV0IHdlJ3JlIHRvdGFsbHkgYSBKZXJyeS5cbiAgbGV0IHBhc3N3b3JkOiBzdHJpbmcgPSBcIldlZGRpbmdzIGFyZSBiYXNpY2FsbHkgZnVuZXJhbHMgd2l0aCBhIGNha2UuIC0tIFJpY2ggU2FuY2hlelwiXG4gIGxldCBuZXdQYXNzd29yZDogc3RyaW5nID0gXCJTb21ldGltZXMgc2NpZW5jZSBpcyBtb3JlIGFydCB0aGFuIHNjaWVuY2UsIE1vcnR5LiAtLSBSaWNoIFNhbmNoZXpcIlxuICBsZXQgdGVzdFRva2VuOiBzdHJpbmcgPSBcIlRvIGxpdmUgaXMgdG8gcmlzayBpdCBhbGwgb3RoZXJ3aXNlIHlvdSdyZSBqdXN0IGFuIGluZXJ0IGNodW5rIG9mIHJhbmRvbWx5IGFzc2VtYmxlZCBtb2xlY3VsZXMgZHJpZnRpbmcgd2hlcmV2ZXIgdGhlIHVuaXZlcnNlIGJsb3dzIHlvdS4gLS0gUmljayBTYW5jaGV6XCJcbiAgbGV0IHRlc3RFbmRwb2ludHM6IHN0cmluZ1tdID0gW1wiL2V4dC9vcHQvYmluL2Jhc2gvZm9vXCIsIFwiL2Rldi9udWxsXCIsIFwiL3RtcFwiXVxuXG4gIGJlZm9yZUFsbCgoKTogdm9pZCA9PiB7XG4gICAgYXV0aCA9IGF2YWxhbmNoZS5BdXRoKClcbiAgfSlcblxuICBhZnRlckVhY2goKCk6IHZvaWQgPT4ge1xuICAgIG1vY2tBeGlvcy5yZXNldCgpXG4gIH0pXG5cbiAgdGVzdCgnbmV3VG9rZW4nLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhdXRoLm5ld1Rva2VuKHBhc3N3b3JkLCB0ZXN0RW5kcG9pbnRzKVxuICAgIGNvbnN0IHBheWxvYWQ6b2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIHRva2VuOiB0ZXN0VG9rZW4sXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHRlc3RUb2tlbilcbiAgfSlcblxuICB0ZXN0KCdyZXZva2VUb2tlbicsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8Ym9vbGVhbj4gPSBhdXRoLnJldm9rZVRva2VuKHBhc3N3b3JkLCB0ZXN0VG9rZW4pXG4gICAgY29uc3QgcGF5bG9hZDpvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IGJvb2xlYW4gPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHRydWUpXG4gIH0pXG5cblxuICB0ZXN0KCdjaGFuZ2VQYXNzd29yZCcsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8Ym9vbGVhbj4gPSBhdXRoLmNoYW5nZVBhc3N3b3JkKHBhc3N3b3JkLCBuZXdQYXNzd29yZClcbiAgICBjb25zdCBwYXlsb2FkOm9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IGJvb2xlYW4gPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKGZhbHNlKVxuICB9KVxufSlcbiJdfQ==