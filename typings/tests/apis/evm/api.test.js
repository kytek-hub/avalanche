"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const api_1 = require("src/apis/evm/api");
const bintools_1 = __importDefault(require("src/utils/bintools"));
const bech32 = __importStar(require("bech32"));
const constants_1 = require("src/utils/constants");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
describe('EVMAPI', () => {
    const networkID = 12345;
    const blockchainID = constants_1.Defaults.network[networkID].C.blockchainID;
    const ip = '127.0.0.1';
    const port = 9650;
    const protocol = 'https';
    const username = 'AvaLabs';
    const password = 'password';
    const avalanche = new src_1.Avalanche(ip, port, protocol, networkID, undefined, undefined, undefined, true);
    let api;
    const addrA = 'C-' + bech32.encode(avalanche.getHRP(), bech32.toWords(bintools.cb58Decode("B6D4v1VtPYLbiUvYXtW4Px8oE9imC2vGW")));
    const addrC = 'C-' + bech32.encode(avalanche.getHRP(), bech32.toWords(bintools.cb58Decode("6Y3kysjF9jnHnYkdS9yGAuoHyae2eNmeV")));
    beforeAll(() => {
        api = new api_1.EVMAPI(avalanche, '/ext/bc/C/avax', blockchainID);
    });
    afterEach(() => {
        jest_mock_axios_1.default.reset();
    });
    test('importKey', () => __awaiter(void 0, void 0, void 0, function* () {
        const address = addrC;
        const result = api.importKey(username, password, 'key');
        const payload = {
            result: {
                address,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(address);
    }));
    test('exportKey', () => __awaiter(void 0, void 0, void 0, function* () {
        const key = 'sdfglvlj2h3v45';
        const result = api.exportKey(username, password, addrA);
        const payload = {
            result: {
                privateKey: key,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(key);
    }));
    test("exportAVAX", () => __awaiter(void 0, void 0, void 0, function* () {
        let amount = new src_1.BN(100);
        let to = "abcdef";
        let username = "Robert";
        let password = "Paulson";
        let txID = "valid";
        let result = api.exportAVAX(username, password, to, amount);
        let payload = {
            "result": {
                "txID": txID
            }
        };
        let responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        let response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(txID);
    }));
    test("export", () => __awaiter(void 0, void 0, void 0, function* () {
        let amount = new src_1.BN(100);
        let to = "abcdef";
        let assetID = "2fombhL7aGPwj3KH4bfrmJwW6PVnMobf9Y2fn9GwxiAAJyFDbe";
        let username = "Robert";
        let password = "Paulson";
        let txID = "valid";
        let result = api.export(username, password, to, amount, assetID);
        let payload = {
            "result": {
                "txID": txID
            }
        };
        let responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        let response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(txID);
    }));
    test("importAVAX", () => __awaiter(void 0, void 0, void 0, function* () {
        let to = "abcdef";
        let username = "Robert";
        let password = "Paulson";
        let txID = "valid";
        let result = api.importAVAX(username, password, to, blockchainID);
        let payload = {
            "result": {
                "txID": txID
            }
        };
        let responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        let response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(txID);
    }));
    test("import", () => __awaiter(void 0, void 0, void 0, function* () {
        let to = "abcdef";
        let username = "Robert";
        let password = "Paulson";
        let txID = "valid";
        let result = api.import(username, password, to, blockchainID);
        let payload = {
            "result": {
                "txID": txID
            }
        };
        let responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        let response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(txID);
    }));
    test('refreshBlockchainID', () => __awaiter(void 0, void 0, void 0, function* () {
        const n5bcID = constants_1.Defaults.network[5].C["blockchainID"];
        const n12345bcID = constants_1.Defaults.network[12345].C["blockchainID"];
        const testAPI = new api_1.EVMAPI(avalanche, '/ext/bc/C/avax', n5bcID);
        const bc1 = testAPI.getBlockchainID();
        expect(bc1).toBe(n5bcID);
        let res = testAPI.refreshBlockchainID();
        expect(res).toBeTruthy();
        const bc2 = testAPI.getBlockchainID();
        expect(bc2).toBe(n12345bcID);
        res = testAPI.refreshBlockchainID(n5bcID);
        expect(res).toBeTruthy();
        const bc3 = testAPI.getBlockchainID();
        expect(bc3).toBe(n5bcID);
    }));
    test("getAssetBalance", () => __awaiter(void 0, void 0, void 0, function* () {
        const address = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC";
        const hexStr = "0x0";
        const blockHeight = hexStr;
        const assetID = "FCry2Z1Su9KZqK1XRMhxQS6XuPorxDm3C3RBT7hw32ojiqyvP";
        const result = api.getAssetBalance(address, blockHeight, assetID);
        const payload = {
            result: hexStr
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(hexStr);
    }));
    test("getAtomicTxStatus", () => __awaiter(void 0, void 0, void 0, function* () {
        const txID = "FCry2Z1Su9KZqK1XRMhxQS6XuPorxDm3C3RBT7hw32ojiqyvP";
        const result = api.getAtomicTxStatus(txID);
        const payload = {
            result: {
                status: 'Accepted',
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe('Accepted');
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0cy9hcGlzL2V2bS9hcGkudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzRUFBdUM7QUFDdkMsNkJBQW1DO0FBQ25DLDBDQUF5QztBQUN6QyxrRUFBeUM7QUFDekMsK0NBQWdDO0FBQ2hDLG1EQUE4QztBQUc5Qzs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFakQsUUFBUSxDQUFDLFFBQVEsRUFBRSxHQUFTLEVBQUU7SUFDNUIsTUFBTSxTQUFTLEdBQVcsS0FBSyxDQUFBO0lBQy9CLE1BQU0sWUFBWSxHQUFXLG9CQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUE7SUFDdkUsTUFBTSxFQUFFLEdBQVcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sSUFBSSxHQUFXLElBQUksQ0FBQTtJQUN6QixNQUFNLFFBQVEsR0FBVyxPQUFPLENBQUE7SUFDaEMsTUFBTSxRQUFRLEdBQVcsU0FBUyxDQUFBO0lBQ2xDLE1BQU0sUUFBUSxHQUFXLFVBQVUsQ0FBQTtJQUVuQyxNQUFNLFNBQVMsR0FBYyxJQUFJLGVBQVMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUE7SUFDaEgsSUFBSSxHQUFXLENBQUE7SUFFZixNQUFNLEtBQUssR0FBVyxJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLG1DQUFtQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3hJLE1BQU0sS0FBSyxHQUFXLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFeEksU0FBUyxDQUFDLEdBQVMsRUFBRTtRQUNuQixHQUFHLEdBQUcsSUFBSSxZQUFNLENBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFFLFlBQVksQ0FBQyxDQUFBO0lBQzdELENBQUMsQ0FBQyxDQUFBO0lBRUYsU0FBUyxDQUFDLEdBQVMsRUFBRTtRQUNuQix5QkFBUyxDQUFDLEtBQUssRUFBRSxDQUFBO0lBQ25CLENBQUMsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUF3QixFQUFFO1FBQzFDLE1BQU0sT0FBTyxHQUFXLEtBQUssQ0FBQTtRQUU3QixNQUFNLE1BQU0sR0FBb0IsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ3hFLE1BQU0sT0FBTyxHQUFXO1lBQ3RCLE1BQU0sRUFBRTtnQkFDTixPQUFPO2FBQ1I7U0FDRixDQUFBO1FBQ0QsTUFBTSxXQUFXLEdBQWlCO1lBQ2hDLElBQUksRUFBRSxPQUFPO1NBQ2QsQ0FBQTtRQUVELHlCQUFTLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ25DLE1BQU0sUUFBUSxHQUFXLE1BQU0sTUFBTSxDQUFBO1FBRXJDLE1BQU0sQ0FBQyx5QkFBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDaEMsQ0FBQyxDQUFBLENBQUMsQ0FBQTtJQUVGLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBd0IsRUFBRTtRQUMxQyxNQUFNLEdBQUcsR0FBVyxnQkFBZ0IsQ0FBQTtRQUVwQyxNQUFNLE1BQU0sR0FBb0IsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ3hFLE1BQU0sT0FBTyxHQUFXO1lBQ3RCLE1BQU0sRUFBRTtnQkFDTixVQUFVLEVBQUUsR0FBRzthQUNoQjtTQUNGLENBQUE7UUFDRCxNQUFNLFdBQVcsR0FBaUI7WUFDaEMsSUFBSSxFQUFFLE9BQU87U0FDZCxDQUFBO1FBRUQseUJBQVMsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDbkMsTUFBTSxRQUFRLEdBQVcsTUFBTSxNQUFNLENBQUE7UUFFckMsTUFBTSxDQUFDLHlCQUFTLENBQUMsT0FBTyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUM1QixDQUFDLENBQUEsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLFlBQVksRUFBRSxHQUF3QixFQUFFO1FBQzNDLElBQUksTUFBTSxHQUFPLElBQUksUUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBQzVCLElBQUksRUFBRSxHQUFXLFFBQVEsQ0FBQTtRQUN6QixJQUFJLFFBQVEsR0FBVyxRQUFRLENBQUE7UUFDL0IsSUFBSSxRQUFRLEdBQVcsU0FBUyxDQUFBO1FBQ2hDLElBQUksSUFBSSxHQUFXLE9BQU8sQ0FBQTtRQUMxQixJQUFJLE1BQU0sR0FBb0IsR0FBRyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUM1RSxJQUFJLE9BQU8sR0FBVztZQUNsQixRQUFRLEVBQUU7Z0JBQ04sTUFBTSxFQUFFLElBQUk7YUFDZjtTQUNKLENBQUE7UUFDRCxJQUFJLFdBQVcsR0FBRztZQUNkLElBQUksRUFBRSxPQUFPO1NBQ2hCLENBQUE7UUFFRCx5QkFBUyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUNuQyxJQUFJLFFBQVEsR0FBVyxNQUFNLE1BQU0sQ0FBQTtRQUVuQyxNQUFNLENBQUMseUJBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdCLENBQUMsQ0FBQSxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMsUUFBUSxFQUFFLEdBQXdCLEVBQUU7UUFDdkMsSUFBSSxNQUFNLEdBQU8sSUFBSSxRQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDNUIsSUFBSSxFQUFFLEdBQVcsUUFBUSxDQUFBO1FBQ3pCLElBQUksT0FBTyxHQUFXLG9EQUFvRCxDQUFBO1FBQzFFLElBQUksUUFBUSxHQUFXLFFBQVEsQ0FBQTtRQUMvQixJQUFJLFFBQVEsR0FBVyxTQUFTLENBQUE7UUFDaEMsSUFBSSxJQUFJLEdBQVcsT0FBTyxDQUFBO1FBQzFCLElBQUksTUFBTSxHQUFvQixHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQTtRQUNqRixJQUFJLE9BQU8sR0FBVztZQUNsQixRQUFRLEVBQUU7Z0JBQ04sTUFBTSxFQUFFLElBQUk7YUFDZjtTQUNKLENBQUE7UUFDRCxJQUFJLFdBQVcsR0FBRztZQUNkLElBQUksRUFBRSxPQUFPO1NBQ2hCLENBQUE7UUFFRCx5QkFBUyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUNuQyxJQUFJLFFBQVEsR0FBVyxNQUFNLE1BQU0sQ0FBQTtRQUVuQyxNQUFNLENBQUMseUJBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzdCLENBQUMsQ0FBQSxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMsWUFBWSxFQUFFLEdBQXdCLEVBQUU7UUFDM0MsSUFBSSxFQUFFLEdBQVcsUUFBUSxDQUFBO1FBQ3pCLElBQUksUUFBUSxHQUFXLFFBQVEsQ0FBQTtRQUMvQixJQUFJLFFBQVEsR0FBVyxTQUFTLENBQUE7UUFDaEMsSUFBSSxJQUFJLEdBQVcsT0FBTyxDQUFBO1FBQzFCLElBQUksTUFBTSxHQUFvQixHQUFHLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFBO1FBQ2xGLElBQUksT0FBTyxHQUFXO1lBQ2xCLFFBQVEsRUFBRTtnQkFDTixNQUFNLEVBQUUsSUFBSTthQUNmO1NBQ0osQ0FBQTtRQUNELElBQUksV0FBVyxHQUFHO1lBQ2QsSUFBSSxFQUFFLE9BQU87U0FDaEIsQ0FBQTtRQUVELHlCQUFTLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ25DLElBQUksUUFBUSxHQUFXLE1BQU0sTUFBTSxDQUFBO1FBRW5DLE1BQU0sQ0FBQyx5QkFBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDN0IsQ0FBQyxDQUFBLENBQUMsQ0FBQTtJQUVGLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBd0IsRUFBRTtRQUN2QyxJQUFJLEVBQUUsR0FBVyxRQUFRLENBQUE7UUFDekIsSUFBSSxRQUFRLEdBQVcsUUFBUSxDQUFBO1FBQy9CLElBQUksUUFBUSxHQUFXLFNBQVMsQ0FBQTtRQUNoQyxJQUFJLElBQUksR0FBVyxPQUFPLENBQUE7UUFDMUIsSUFBSSxNQUFNLEdBQW9CLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUE7UUFDOUUsSUFBSSxPQUFPLEdBQVc7WUFDbEIsUUFBUSxFQUFFO2dCQUNOLE1BQU0sRUFBRSxJQUFJO2FBQ2Y7U0FDSixDQUFBO1FBQ0QsSUFBSSxXQUFXLEdBQUc7WUFDZCxJQUFJLEVBQUUsT0FBTztTQUNoQixDQUFBO1FBRUQseUJBQVMsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUE7UUFDbkMsSUFBSSxRQUFRLEdBQVcsTUFBTSxNQUFNLENBQUE7UUFFbkMsTUFBTSxDQUFDLHlCQUFTLENBQUMsT0FBTyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUM3QixDQUFDLENBQUEsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLHFCQUFxQixFQUFFLEdBQXdCLEVBQUU7UUFDcEQsTUFBTSxNQUFNLEdBQVcsb0JBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFBO1FBQzVELE1BQU0sVUFBVSxHQUFXLG9CQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQTtRQUNwRSxNQUFNLE9BQU8sR0FBVyxJQUFJLFlBQU0sQ0FBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDdkUsTUFBTSxHQUFHLEdBQVcsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFBO1FBQzdDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7UUFFeEIsSUFBSSxHQUFHLEdBQVksT0FBTyxDQUFDLG1CQUFtQixFQUFFLENBQUE7UUFDaEQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3hCLE1BQU0sR0FBRyxHQUFXLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQTtRQUM3QyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBRTVCLEdBQUcsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDekMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3hCLE1BQU0sR0FBRyxHQUFXLE9BQU8sQ0FBQyxlQUFlLEVBQUUsQ0FBQTtRQUM3QyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBRTFCLENBQUMsQ0FBQSxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMsaUJBQWlCLEVBQUUsR0FBd0IsRUFBRTtRQUNoRCxNQUFNLE9BQU8sR0FBVyw0Q0FBNEMsQ0FBQTtRQUNwRSxNQUFNLE1BQU0sR0FBVyxLQUFLLENBQUE7UUFDNUIsTUFBTSxXQUFXLEdBQVcsTUFBTSxDQUFBO1FBQ2xDLE1BQU0sT0FBTyxHQUFXLG1EQUFtRCxDQUFBO1FBRTNFLE1BQU0sTUFBTSxHQUFvQixHQUFHLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFDbEYsTUFBTSxPQUFPLEdBQVc7WUFDdEIsTUFBTSxFQUFFLE1BQU07U0FDZixDQUFBO1FBQ0QsTUFBTSxXQUFXLEdBQWlCO1lBQ2hDLElBQUksRUFBRSxPQUFPO1NBQ2QsQ0FBQTtRQUVELHlCQUFTLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1FBQ25DLE1BQU0sUUFBUSxHQUFXLE1BQU0sTUFBTSxDQUFBO1FBRXJDLE1BQU0sQ0FBQyx5QkFBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2xELE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDL0IsQ0FBQyxDQUFBLENBQUMsQ0FBQTtJQUVGLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxHQUF3QixFQUFFO1FBQ2xELE1BQU0sSUFBSSxHQUFXLG1EQUFtRCxDQUFBO1FBRXhFLE1BQU0sTUFBTSxHQUFvQixHQUFHLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDM0QsTUFBTSxPQUFPLEdBQVc7WUFDdEIsTUFBTSxFQUFFO2dCQUNOLE1BQU0sRUFBRSxVQUFVO2FBQ25CO1NBQ0YsQ0FBQTtRQUNELE1BQU0sV0FBVyxHQUFpQjtZQUNoQyxJQUFJLEVBQUUsT0FBTztTQUNkLENBQUE7UUFFRCx5QkFBUyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsQ0FBQTtRQUNuQyxNQUFNLFFBQVEsR0FBVyxNQUFNLE1BQU0sQ0FBQTtRQUVyQyxNQUFNLENBQUMseUJBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNsRCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQ25DLENBQUMsQ0FBQSxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb2NrQXhpb3MgZnJvbSAnamVzdC1tb2NrLWF4aW9zJ1xuaW1wb3J0IHsgQXZhbGFuY2hlLCBCTiB9IGZyb20gXCJzcmNcIlxuaW1wb3J0IHsgRVZNQVBJIH0gZnJvbSBcInNyYy9hcGlzL2V2bS9hcGlcIlxuaW1wb3J0IEJpblRvb2xzIGZyb20gJ3NyYy91dGlscy9iaW50b29scydcbmltcG9ydCAqIGFzIGJlY2gzMiBmcm9tICdiZWNoMzInXG5pbXBvcnQgeyBEZWZhdWx0cyB9IGZyb20gJ3NyYy91dGlscy9jb25zdGFudHMnXG5pbXBvcnQgeyBIdHRwUmVzcG9uc2UgfSBmcm9tICdqZXN0LW1vY2stYXhpb3MvZGlzdC9saWIvbW9jay1heGlvcy10eXBlcydcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcblxuZGVzY3JpYmUoJ0VWTUFQSScsICgpOiB2b2lkID0+IHtcbiAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSAxMjM0NVxuICBjb25zdCBibG9ja2NoYWluSUQ6IHN0cmluZyA9IERlZmF1bHRzLm5ldHdvcmtbbmV0d29ya0lEXS5DLmJsb2NrY2hhaW5JRFxuICBjb25zdCBpcDogc3RyaW5nID0gJzEyNy4wLjAuMSdcbiAgY29uc3QgcG9ydDogbnVtYmVyID0gOTY1MFxuICBjb25zdCBwcm90b2NvbDogc3RyaW5nID0gJ2h0dHBzJ1xuICBjb25zdCB1c2VybmFtZTogc3RyaW5nID0gJ0F2YUxhYnMnXG4gIGNvbnN0IHBhc3N3b3JkOiBzdHJpbmcgPSAncGFzc3dvcmQnXG5cbiAgY29uc3QgYXZhbGFuY2hlOiBBdmFsYW5jaGUgPSBuZXcgQXZhbGFuY2hlKGlwLCBwb3J0LCBwcm90b2NvbCwgbmV0d29ya0lELCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0cnVlKVxuICBsZXQgYXBpOiBFVk1BUElcblxuICBjb25zdCBhZGRyQTogc3RyaW5nID0gJ0MtJyArIGJlY2gzMi5lbmNvZGUoYXZhbGFuY2hlLmdldEhSUCgpLCBiZWNoMzIudG9Xb3JkcyhiaW50b29scy5jYjU4RGVjb2RlKFwiQjZENHYxVnRQWUxiaVV2WVh0VzRQeDhvRTlpbUMydkdXXCIpKSlcbiAgY29uc3QgYWRkckM6IHN0cmluZyA9ICdDLScgKyBiZWNoMzIuZW5jb2RlKGF2YWxhbmNoZS5nZXRIUlAoKSwgYmVjaDMyLnRvV29yZHMoYmludG9vbHMuY2I1OERlY29kZShcIjZZM2t5c2pGOWpuSG5Za2RTOXlHQXVvSHlhZTJlTm1lVlwiKSkpXG5cbiAgYmVmb3JlQWxsKCgpOiB2b2lkID0+IHtcbiAgICBhcGkgPSBuZXcgRVZNQVBJKGF2YWxhbmNoZSwgJy9leHQvYmMvQy9hdmF4JywgYmxvY2tjaGFpbklEKVxuICB9KVxuXG4gIGFmdGVyRWFjaCgoKTogdm9pZCA9PiB7XG4gICAgbW9ja0F4aW9zLnJlc2V0KClcbiAgfSlcblxuICB0ZXN0KCdpbXBvcnRLZXknLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgYWRkcmVzczogc3RyaW5nID0gYWRkckNcblxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXBpLmltcG9ydEtleSh1c2VybmFtZSwgcGFzc3dvcmQsICdrZXknKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBhZGRyZXNzLFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZShhZGRyZXNzKVxuICB9KVxuXG4gIHRlc3QoJ2V4cG9ydEtleScsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBrZXk6IHN0cmluZyA9ICdzZGZnbHZsajJoM3Y0NSdcblxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXBpLmV4cG9ydEtleSh1c2VybmFtZSwgcGFzc3dvcmQsIGFkZHJBKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBwcml2YXRlS2V5OiBrZXksXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKGtleSlcbiAgfSlcblxuICB0ZXN0KFwiZXhwb3J0QVZBWFwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgbGV0IGFtb3VudDogQk4gPSBuZXcgQk4oMTAwKVxuICAgIGxldCB0bzogc3RyaW5nID0gXCJhYmNkZWZcIlxuICAgIGxldCB1c2VybmFtZTogc3RyaW5nID0gXCJSb2JlcnRcIlxuICAgIGxldCBwYXNzd29yZDogc3RyaW5nID0gXCJQYXVsc29uXCJcbiAgICBsZXQgdHhJRDogc3RyaW5nID0gXCJ2YWxpZFwiXG4gICAgbGV0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXBpLmV4cG9ydEFWQVgodXNlcm5hbWUsIHBhc3N3b3JkLCB0bywgYW1vdW50KVxuICAgIGxldCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICAgIFwicmVzdWx0XCI6IHtcbiAgICAgICAgICAgIFwidHhJRFwiOiB0eElEXG4gICAgICAgIH1cbiAgICB9XG4gICAgbGV0IHJlc3BvbnNlT2JqID0ge1xuICAgICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBsZXQgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUodHhJRClcbiAgfSlcblxuICB0ZXN0KFwiZXhwb3J0XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBsZXQgYW1vdW50OiBCTiA9IG5ldyBCTigxMDApXG4gICAgbGV0IHRvOiBzdHJpbmcgPSBcImFiY2RlZlwiXG4gICAgbGV0IGFzc2V0SUQ6IHN0cmluZyA9IFwiMmZvbWJoTDdhR1B3ajNLSDRiZnJtSndXNlBWbk1vYmY5WTJmbjlHd3hpQUFKeUZEYmVcIlxuICAgIGxldCB1c2VybmFtZTogc3RyaW5nID0gXCJSb2JlcnRcIlxuICAgIGxldCBwYXNzd29yZDogc3RyaW5nID0gXCJQYXVsc29uXCJcbiAgICBsZXQgdHhJRDogc3RyaW5nID0gXCJ2YWxpZFwiXG4gICAgbGV0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXBpLmV4cG9ydCh1c2VybmFtZSwgcGFzc3dvcmQsIHRvLCBhbW91bnQsIGFzc2V0SUQpXG4gICAgbGV0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgICAgXCJyZXN1bHRcIjoge1xuICAgICAgICAgICAgXCJ0eElEXCI6IHR4SURcbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgcmVzcG9uc2VPYmogPSB7XG4gICAgICAgIGRhdGE6IHBheWxvYWRcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGxldCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSh0eElEKVxuICB9KVxuXG4gIHRlc3QoXCJpbXBvcnRBVkFYXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBsZXQgdG86IHN0cmluZyA9IFwiYWJjZGVmXCJcbiAgICBsZXQgdXNlcm5hbWU6IHN0cmluZyA9IFwiUm9iZXJ0XCJcbiAgICBsZXQgcGFzc3dvcmQ6IHN0cmluZyA9IFwiUGF1bHNvblwiXG4gICAgbGV0IHR4SUQ6IHN0cmluZyA9IFwidmFsaWRcIlxuICAgIGxldCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5pbXBvcnRBVkFYKHVzZXJuYW1lLCBwYXNzd29yZCwgdG8sIGJsb2NrY2hhaW5JRClcbiAgICBsZXQgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgICBcInJlc3VsdFwiOiB7XG4gICAgICAgICAgICBcInR4SURcIjogdHhJRFxuICAgICAgICB9XG4gICAgfVxuICAgIGxldCByZXNwb25zZU9iaiA9IHtcbiAgICAgICAgZGF0YTogcGF5bG9hZFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgbGV0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHR4SUQpXG4gIH0pXG5cbiAgdGVzdChcImltcG9ydFwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgbGV0IHRvOiBzdHJpbmcgPSBcImFiY2RlZlwiXG4gICAgbGV0IHVzZXJuYW1lOiBzdHJpbmcgPSBcIlJvYmVydFwiXG4gICAgbGV0IHBhc3N3b3JkOiBzdHJpbmcgPSBcIlBhdWxzb25cIlxuICAgIGxldCB0eElEOiBzdHJpbmcgPSBcInZhbGlkXCJcbiAgICBsZXQgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkuaW1wb3J0KHVzZXJuYW1lLCBwYXNzd29yZCwgdG8sIGJsb2NrY2hhaW5JRClcbiAgICBsZXQgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgICBcInJlc3VsdFwiOiB7XG4gICAgICAgICAgICBcInR4SURcIjogdHhJRFxuICAgICAgICB9XG4gICAgfVxuICAgIGxldCByZXNwb25zZU9iaiA9IHtcbiAgICAgICAgZGF0YTogcGF5bG9hZFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgbGV0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHR4SUQpXG4gIH0pXG5cbiAgdGVzdCgncmVmcmVzaEJsb2NrY2hhaW5JRCcsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBuNWJjSUQ6IHN0cmluZyA9IERlZmF1bHRzLm5ldHdvcmtbNV0uQ1tcImJsb2NrY2hhaW5JRFwiXVxuICAgIGNvbnN0IG4xMjM0NWJjSUQ6IHN0cmluZyA9IERlZmF1bHRzLm5ldHdvcmtbMTIzNDVdLkNbXCJibG9ja2NoYWluSURcIl1cbiAgICBjb25zdCB0ZXN0QVBJOiBFVk1BUEkgPSBuZXcgRVZNQVBJKGF2YWxhbmNoZSwgJy9leHQvYmMvQy9hdmF4JywgbjViY0lEKVxuICAgIGNvbnN0IGJjMTogc3RyaW5nID0gdGVzdEFQSS5nZXRCbG9ja2NoYWluSUQoKVxuICAgIGV4cGVjdChiYzEpLnRvQmUobjViY0lEKVxuXG4gICAgbGV0IHJlczogYm9vbGVhbiA9IHRlc3RBUEkucmVmcmVzaEJsb2NrY2hhaW5JRCgpXG4gICAgZXhwZWN0KHJlcykudG9CZVRydXRoeSgpXG4gICAgY29uc3QgYmMyOiBzdHJpbmcgPSB0ZXN0QVBJLmdldEJsb2NrY2hhaW5JRCgpXG4gICAgZXhwZWN0KGJjMikudG9CZShuMTIzNDViY0lEKVxuXG4gICAgcmVzID0gdGVzdEFQSS5yZWZyZXNoQmxvY2tjaGFpbklEKG41YmNJRClcbiAgICBleHBlY3QocmVzKS50b0JlVHJ1dGh5KClcbiAgICBjb25zdCBiYzM6IHN0cmluZyA9IHRlc3RBUEkuZ2V0QmxvY2tjaGFpbklEKClcbiAgICBleHBlY3QoYmMzKS50b0JlKG41YmNJRClcblxuICB9KVxuXG4gIHRlc3QoXCJnZXRBc3NldEJhbGFuY2VcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IGFkZHJlc3M6IHN0cmluZyA9IFwiMHg4ZGI5N0M3Y0VjRTI0OWMyYjk4YkRDMDIyNkNjNEMyQTU3QkY1MkZDXCJcbiAgICBjb25zdCBoZXhTdHI6IHN0cmluZyA9IFwiMHgwXCJcbiAgICBjb25zdCBibG9ja0hlaWdodDogc3RyaW5nID0gaGV4U3RyXG4gICAgY29uc3QgYXNzZXRJRDogc3RyaW5nID0gXCJGQ3J5MloxU3U5S1pxSzFYUk1oeFFTNlh1UG9yeERtM0MzUkJUN2h3MzJvamlxeXZQXCJcblxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXBpLmdldEFzc2V0QmFsYW5jZShhZGRyZXNzLCBibG9ja0hlaWdodCwgYXNzZXRJRClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IGhleFN0clxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKGhleFN0cilcbiAgfSlcblxuICB0ZXN0KFwiZ2V0QXRvbWljVHhTdGF0dXNcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHR4SUQ6IHN0cmluZyA9IFwiRkNyeTJaMVN1OUtacUsxWFJNaHhRUzZYdVBvcnhEbTNDM1JCVDdodzMyb2ppcXl2UFwiXG5cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5nZXRBdG9taWNUeFN0YXR1cyh0eElEKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBzdGF0dXM6ICdBY2NlcHRlZCcsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKCdBY2NlcHRlZCcpXG4gIH0pXG59KSJdfQ==