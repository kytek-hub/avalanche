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
const api_1 = require("src/apis/avm/api");
const keychain_1 = require("src/apis/avm/keychain");
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const bintools_1 = __importDefault(require("src/utils/bintools"));
const utxos_1 = require("src/apis/avm/utxos");
const inputs_1 = require("src/apis/avm/inputs");
const create_hash_1 = __importDefault(require("create-hash"));
const tx_1 = require("src/apis/avm/tx");
const constants_1 = require("src/apis/avm/constants");
const outputs_1 = require("src/apis/avm/outputs");
const ops_1 = require("src/apis/avm/ops");
const bech32 = __importStar(require("bech32"));
const payload_1 = require("src/utils/payload");
const initialstates_1 = require("src/apis/avm/initialstates");
const constants_2 = require("src/utils/constants");
const helperfunctions_1 = require("src/utils/helperfunctions");
const output_1 = require("src/common/output");
const minterset_1 = require("src/apis/avm/minterset");
const constants_3 = require("src/utils/constants");
const persistenceoptions_1 = require("src/utils/persistenceoptions");
const constants_4 = require("src/utils/constants");
const serialization_1 = require("src/utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
const dumpSerailization = false;
const display = "display";
const serialzeit = (aThing, name) => {
    if (dumpSerailization) {
        console.log(JSON.stringify(serialization.serialize(aThing, "avm", "hex", name + " -- Hex Encoded")));
        console.log(JSON.stringify(serialization.serialize(aThing, "avm", "display", name + " -- Human-Readable")));
    }
};
describe("AVMAPI", () => {
    const networkID = 12345;
    const blockchainID = constants_2.Defaults.network[networkID].X.blockchainID;
    const ip = "127.0.0.1";
    const port = 9650;
    const protocol = "https";
    const username = "AvaLabs";
    const password = "password";
    const avalanche = new src_1.Avalanche(ip, port, protocol, networkID, undefined, undefined, undefined, true);
    let api;
    let alias;
    const addrA = `X-${bech32.encode(avalanche.getHRP(), bech32.toWords(bintools.cb58Decode("B6D4v1VtPYLbiUvYXtW4Px8oE9imC2vGW")))}`;
    const addrB = `X-${bech32.encode(avalanche.getHRP(), bech32.toWords(bintools.cb58Decode("P5wdRuZeaDt28eHMP5S3w9ZdoBfo7wuzF")))}`;
    const addrC = `X-${bech32.encode(avalanche.getHRP(), bech32.toWords(bintools.cb58Decode("6Y3kysjF9jnHnYkdS9yGAuoHyae2eNmeV")))}`;
    beforeAll(() => {
        api = new api_1.AVMAPI(avalanche, "/ext/bc/X", blockchainID);
        alias = api.getBlockchainAlias();
    });
    afterEach(() => {
        jest_mock_axios_1.default.reset();
    });
    test("can Send 1", () => __awaiter(void 0, void 0, void 0, function* () {
        const txId = "asdfhvl234";
        const memo = "hello world";
        const changeAddr = "X-local1";
        const result = api.send(username, password, "assetId", 10, addrA, [addrB], addrA, memo);
        const payload = {
            result: {
                txID: txId,
                changeAddr: changeAddr
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response["txID"]).toBe(txId);
        expect(response["changeAddr"]).toBe(changeAddr);
    }));
    test("can Send 2", () => __awaiter(void 0, void 0, void 0, function* () {
        const txId = "asdfhvl234";
        const memo = buffer_1.Buffer.from("hello world");
        const changeAddr = "X-local1";
        const result = api.send(username, password, bintools.b58ToBuffer("6h2s5de1VC65meajE1L2PjvZ1MXvHc3F6eqPCGKuDt4MxiweF"), new bn_js_1.default(10), addrA, [addrB], addrA, memo);
        const payload = {
            result: {
                txID: txId,
                changeAddr: changeAddr
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response["txID"]).toBe(txId);
        expect(response["changeAddr"]).toBe(changeAddr);
    }));
    test("can Send Multiple", () => __awaiter(void 0, void 0, void 0, function* () {
        const txId = "asdfhvl234";
        const memo = "hello world";
        const changeAddr = "X-local1";
        const result = api.sendMultiple(username, password, [{ assetID: "assetId", amount: 10, to: addrA }], [addrB], addrA, memo);
        const payload = {
            result: {
                txID: txId,
                changeAddr: changeAddr
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response["txID"]).toBe(txId);
        expect(response["changeAddr"]).toBe(changeAddr);
    }));
    test("refreshBlockchainID", () => __awaiter(void 0, void 0, void 0, function* () {
        const n3bcID = constants_2.Defaults.network[3].X["blockchainID"];
        const n12345bcID = constants_2.Defaults.network[12345].X["blockchainID"];
        const testAPI = new api_1.AVMAPI(avalanche, "/ext/bc/avm", n3bcID);
        const bc1 = testAPI.getBlockchainID();
        expect(bc1).toBe(n3bcID);
        testAPI.refreshBlockchainID();
        const bc2 = testAPI.getBlockchainID();
        expect(bc2).toBe(n12345bcID);
        testAPI.refreshBlockchainID(n3bcID);
        const bc3 = testAPI.getBlockchainID();
        expect(bc3).toBe(n3bcID);
    }));
    test("listAddresses", () => __awaiter(void 0, void 0, void 0, function* () {
        const addresses = [addrA, addrB];
        const result = api.listAddresses(username, password);
        const payload = {
            result: {
                addresses
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(addresses);
    }));
    test("importKey", () => __awaiter(void 0, void 0, void 0, function* () {
        const address = addrC;
        const result = api.importKey(username, password, "key");
        const payload = {
            result: {
                address
            }
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(address);
    }));
    test("getBalance", () => __awaiter(void 0, void 0, void 0, function* () {
        const balance = new bn_js_1.default("100", 10);
        const respobj = {
            balance,
            utxoIDs: [
                {
                    "txID": "LUriB3W919F84LwPMMw4sm2fZ4Y76Wgb6msaauEY7i1tFNmtv",
                    "outputIndex": 0
                }
            ]
        };
        const result = api.getBalance(addrA, "ATH");
        const payload = {
            result: respobj
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(response)).toBe(JSON.stringify(respobj));
    }));
    test("exportKey", () => __awaiter(void 0, void 0, void 0, function* () {
        const key = "sdfglvlj2h3v45";
        const result = api.exportKey(username, password, addrA);
        const payload = {
            result: {
                privateKey: key
            }
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(key);
    }));
    test("export", () => __awaiter(void 0, void 0, void 0, function* () {
        const amount = new bn_js_1.default(100);
        const to = "abcdef";
        const assetID = "AVAX";
        const username = "Robert";
        const password = "Paulson";
        const txID = "valid";
        const result = api.export(username, password, to, amount, assetID);
        const payload = {
            result: {
                txID: txID
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(txID);
    }));
    test("exportAVAX", () => __awaiter(void 0, void 0, void 0, function* () {
        const amount = new bn_js_1.default(100);
        const to = "abcdef";
        const username = "Robert";
        const password = "Paulson";
        const txID = "valid";
        const result = api.exportAVAX(username, password, to, amount);
        const payload = {
            result: {
                txID: txID
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(txID);
    }));
    test("import", () => __awaiter(void 0, void 0, void 0, function* () {
        const to = "abcdef";
        const username = "Robert";
        const password = "Paulson";
        const txID = "valid";
        const result = api.import(username, password, to, blockchainID);
        const payload = {
            result: {
                txID: txID
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(txID);
    }));
    test("importAVAX", () => __awaiter(void 0, void 0, void 0, function* () {
        const to = "abcdef";
        const username = "Robert";
        const password = "Paulson";
        const txID = "valid";
        const result = api.importAVAX(username, password, to, blockchainID);
        const payload = {
            result: {
                txID: txID
            }
        };
        const responseObj = {
            data: payload
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(txID);
    }));
    test("createAddress", () => __awaiter(void 0, void 0, void 0, function* () {
        const alias = "randomalias";
        const result = api.createAddress(username, password);
        const payload = {
            result: {
                address: alias,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(alias);
    }));
    test("createFixedCapAsset", () => __awaiter(void 0, void 0, void 0, function* () {
        const kp = new keychain_1.KeyPair(avalanche.getHRP(), alias);
        kp.importKey(buffer_1.Buffer.from("ef9bf2d4436491c153967c9709dd8e82795bdb9b5ad44ee22c2903005d1cf676", "hex"));
        const denomination = 0;
        const assetID = "8a5d2d32e68bc50036e4d086044617fe4a0a0296b274999ba568ea92da46d533";
        const initialHolders = [
            {
                address: "7sik3Pr6r1FeLrvK1oWwECBS8iJ5VPuSh",
                amount: "10000"
            },
            {
                address: "7sik3Pr6r1FeLrvK1oWwECBS8iJ5VPuSh",
                amount: "50000"
            }
        ];
        const result = api.createFixedCapAsset(username, password, "Some Coin", "SCC", denomination, initialHolders);
        const payload = {
            result: {
                assetID: assetID,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(assetID);
    }));
    test("createVariableCapAsset", () => __awaiter(void 0, void 0, void 0, function* () {
        const kp = new keychain_1.KeyPair(avalanche.getHRP(), alias);
        kp.importKey(buffer_1.Buffer.from("ef9bf2d4436491c153967c9709dd8e82795bdb9b5ad44ee22c2903005d1cf676", "hex"));
        const denomination = 0;
        const assetID = "8a5d2d32e68bc50036e4d086044617fe4a0a0296b274999ba568ea92da46d533";
        const minterSets = [
            {
                minters: [
                    "4peJsFvhdn7XjhNF4HWAQy6YaJts27s9q",
                ],
                threshold: 1
            },
            {
                minters: [
                    "dcJ6z9duLfyQTgbjq2wBCowkvcPZHVDF",
                    "2fE6iibqfERz5wenXE6qyvinsxDvFhHZk",
                    "7ieAJbfrGQbpNZRAQEpZCC1Gs1z5gz4HU"
                ],
                threshold: 2
            }
        ];
        const result = api.createVariableCapAsset(username, password, "Some Coin", "SCC", denomination, minterSets);
        const payload = {
            result: {
                assetID: assetID,
            }
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(assetID);
    }));
    test("mint 1", () => __awaiter(void 0, void 0, void 0, function* () {
        const username = "Collin";
        const password = "Cusce";
        const amount = 2;
        const assetID = "f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7";
        const to = "dcJ6z9duLfyQTgbjq2wBCowkvcPZHVDF";
        const minters = [
            "dcJ6z9duLfyQTgbjq2wBCowkvcPZHVDF",
            "2fE6iibqfERz5wenXE6qyvinsxDvFhHZk",
            "7ieAJbfrGQbpNZRAQEpZCC1Gs1z5gz4HU"
        ];
        const result = api.mint(username, password, amount, assetID, to, minters);
        const payload = {
            result: {
                txID: "sometx"
            }
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe("sometx");
    }));
    test("mint 2", () => __awaiter(void 0, void 0, void 0, function* () {
        const username = "Collin";
        const password = "Cusce";
        const amount = new bn_js_1.default(1);
        const assetID = buffer_1.Buffer.from("f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7", "hex");
        const to = "dcJ6z9duLfyQTgbjq2wBCowkvcPZHVDF";
        const minters = [
            "dcJ6z9duLfyQTgbjq2wBCowkvcPZHVDF",
            "2fE6iibqfERz5wenXE6qyvinsxDvFhHZk",
            "7ieAJbfrGQbpNZRAQEpZCC1Gs1z5gz4HU"
        ];
        const result = api.mint(username, password, amount, assetID, to, minters);
        const payload = {
            result: {
                txID: "sometx"
            }
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe("sometx");
    }));
    test("getTx", () => __awaiter(void 0, void 0, void 0, function* () {
        const txid = "f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7";
        const result = api.getTx(txid);
        const payload = {
            result: {
                tx: "sometx"
            }
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe("sometx");
    }));
    test("getTxStatus", () => __awaiter(void 0, void 0, void 0, function* () {
        const txid = "f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7";
        const result = api.getTxStatus(txid);
        const payload = {
            result: {
                status: "accepted"
            }
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe("accepted");
    }));
    test("getAssetDescription as string", () => __awaiter(void 0, void 0, void 0, function* () {
        const assetID = buffer_1.Buffer.from("8a5d2d32e68bc50036e4d086044617fe4a0a0296b274999ba568ea92da46d533", "hex");
        const assetidstr = bintools.cb58Encode(assetID);
        const result = api.getAssetDescription(assetidstr);
        const payload = {
            result: {
                name: "Collin Coin",
                symbol: "CKC",
                assetID: assetidstr,
                denomination: "10"
            }
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response.name).toBe("Collin Coin");
        expect(response.symbol).toBe("CKC");
        expect(response.assetID.toString("hex")).toBe(assetID.toString("hex"));
        expect(response.denomination).toBe(10);
    }));
    test("getAssetDescription as Buffer", () => __awaiter(void 0, void 0, void 0, function* () {
        const assetID = buffer_1.Buffer.from("8a5d2d32e68bc50036e4d086044617fe4a0a0296b274999ba568ea92da46d533", "hex");
        const assetidstr = bintools.cb58Encode(buffer_1.Buffer.from("8a5d2d32e68bc50036e4d086044617fe4a0a0296b274999ba568ea92da46d533", "hex"));
        const result = api.getAssetDescription(assetID);
        const payload = {
            result: {
                name: "Collin Coin",
                symbol: "CKC",
                assetID: assetidstr,
                denomination: "11"
            }
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response.name).toBe("Collin Coin");
        expect(response.symbol).toBe("CKC");
        expect(response.assetID.toString("hex")).toBe(assetID.toString("hex"));
        expect(response.denomination).toBe(11);
    }));
    test("getUTXOs", () => __awaiter(void 0, void 0, void 0, function* () {
        // Payment
        const OPUTXOstr1 = bintools.cb58Encode(buffer_1.Buffer.from("000038d1b9f1138672da6fb6c35125539276a9acc2a668d63bea6ba3c795e2edb0f5000000013e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd3558000000070000000000004dd500000000000000000000000100000001a36fd0c2dbcab311731dde7ef1514bd26fcdc74d", "hex"));
        const OPUTXOstr2 = bintools.cb58Encode(buffer_1.Buffer.from("0000c3e4823571587fe2bdfc502689f5a8238b9d0ea7f3277124d16af9de0d2d9911000000003e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd355800000007000000000000001900000000000000000000000100000001e1b6b6a4bad94d2e3f20730379b9bcd6f176318e", "hex"));
        const OPUTXOstr3 = bintools.cb58Encode(buffer_1.Buffer.from("0000f29dba61fda8d57a911e7f8810f935bde810d3f8d495404685bdb8d9d8545e86000000003e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd355800000007000000000000001900000000000000000000000100000001e1b6b6a4bad94d2e3f20730379b9bcd6f176318e", "hex"));
        const set = new utxos_1.UTXOSet();
        set.add(OPUTXOstr1);
        set.addArray([OPUTXOstr2, OPUTXOstr3]);
        const persistOpts = new persistenceoptions_1.PersistanceOptions("test", true, "union");
        expect(persistOpts.getMergeRule()).toBe("union");
        let addresses = set.getAddresses().map((a) => api.addressFromBuffer(a));
        let result = api.getUTXOs(addresses, api.getBlockchainID(), 0, undefined, persistOpts);
        const payload = {
            result: {
                numFetched: 3,
                utxos: [OPUTXOstr1, OPUTXOstr2, OPUTXOstr3],
                stopIndex: { address: "a", utxo: "b" }
            }
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        let response = (yield result).utxos;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(response.getAllUTXOStrings().sort())).toBe(JSON.stringify(set.getAllUTXOStrings().sort()));
        addresses = set.getAddresses().map((a) => api.addressFromBuffer(a));
        result = api.getUTXOs(addresses, api.getBlockchainID(), 0, undefined, persistOpts);
        jest_mock_axios_1.default.mockResponse(responseObj);
        response = (yield result).utxos;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(2);
        expect(JSON.stringify(response.getAllUTXOStrings().sort())).toBe(JSON.stringify(set.getAllUTXOStrings().sort()));
    }));
    describe("Transactions", () => {
        let set;
        let keymgr2;
        let keymgr3;
        let addrs1;
        let addrs2;
        let addrs3;
        let addressbuffs = [];
        let addresses = [];
        let utxos;
        let inputs;
        let outputs;
        let ops;
        let amnt = 10000;
        const assetID = buffer_1.Buffer.from(create_hash_1.default("sha256").update("mary had a little lamb").digest());
        const NFTassetID = buffer_1.Buffer.from(create_hash_1.default("sha256").update("I can't stand it, I know you planned it, I'mma set straight this Watergate.").digest());
        let secpbase1;
        let secpbase2;
        let secpbase3;
        let initialState;
        let nftpbase1;
        let nftpbase2;
        let nftpbase3;
        let nftInitialState;
        let nftutxoids = [];
        let fungutxoids = [];
        let avm;
        const fee = 10;
        const name = "Mortycoin is the dumb as a sack of hammers.";
        const symbol = "morT";
        const denomination = 8;
        let secpMintOut1;
        let secpMintOut2;
        let secpMintTXID;
        let secpMintUTXO;
        let secpMintXferOut1;
        let secpMintXferOut2;
        let secpMintOp;
        let xfersecpmintop;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            avm = new api_1.AVMAPI(avalanche, "/ext/bc/X", blockchainID);
            const result = avm.getAVAXAssetID(true);
            const payload = {
                result: {
                    name,
                    symbol,
                    assetID: bintools.cb58Encode(assetID),
                    denomination: denomination
                }
            };
            const responseObj = {
                data: payload
            };
            jest_mock_axios_1.default.mockResponse(responseObj);
            yield result;
            set = new utxos_1.UTXOSet();
            avm.newKeyChain();
            keymgr2 = new keychain_1.KeyChain(avalanche.getHRP(), alias);
            keymgr3 = new keychain_1.KeyChain(avalanche.getHRP(), alias);
            addrs1 = [];
            addrs2 = [];
            addrs3 = [];
            utxos = [];
            inputs = [];
            outputs = [];
            ops = [];
            nftutxoids = [];
            fungutxoids = [];
            const pload = buffer_1.Buffer.alloc(1024);
            pload.write("All you Trekkies and TV addicts, Don't mean to diss don't mean to bring static.", 0, 1024, "utf8");
            for (let i = 0; i < 3; i++) {
                addrs1.push(avm.addressFromBuffer(avm.keyChain().makeKey().getAddress()));
                addrs2.push(avm.addressFromBuffer(keymgr2.makeKey().getAddress()));
                addrs3.push(avm.addressFromBuffer(keymgr3.makeKey().getAddress()));
            }
            const amount = constants_4.ONEAVAX.mul(new bn_js_1.default(amnt));
            addressbuffs = avm.keyChain().getAddresses();
            addresses = addressbuffs.map((a) => avm.addressFromBuffer(a));
            const locktime = new bn_js_1.default(54321);
            const threshold = 3;
            for (let i = 0; i < 5; i++) {
                let txid = buffer_1.Buffer.from(create_hash_1.default("sha256").update(bintools.fromBNToBuffer(new bn_js_1.default(i), 32)).digest());
                let txidx = buffer_1.Buffer.alloc(4);
                txidx.writeUInt32BE(i, 0);
                const out = new outputs_1.SECPTransferOutput(amount, addressbuffs, locktime, threshold);
                const xferout = new outputs_1.TransferableOutput(assetID, out);
                outputs.push(xferout);
                const u = new utxos_1.UTXO();
                u.fromBuffer(buffer_1.Buffer.concat([u.getCodecIDBuffer(), txid, txidx, xferout.toBuffer()]));
                fungutxoids.push(u.getUTXOID());
                utxos.push(u);
                txid = u.getTxID();
                txidx = u.getOutputIdx();
                const asset = u.getAssetID();
                const input = new inputs_1.SECPTransferInput(amount);
                const xferinput = new inputs_1.TransferableInput(txid, txidx, asset, input);
                inputs.push(xferinput);
                const nout = new outputs_1.NFTTransferOutput(1000 + i, pload, addressbuffs, locktime, threshold);
                const op = new ops_1.NFTTransferOperation(nout);
                const nfttxid = buffer_1.Buffer.from(create_hash_1.default("sha256").update(bintools.fromBNToBuffer(new bn_js_1.default(1000 + i), 32)).digest());
                const nftutxo = new utxos_1.UTXO(constants_1.AVMConstants.LATESTCODEC, nfttxid, 1000 + i, NFTassetID, nout);
                nftutxoids.push(nftutxo.getUTXOID());
                const xferop = new ops_1.TransferableOperation(NFTassetID, [nftutxo.getUTXOID()], op);
                ops.push(xferop);
                utxos.push(nftutxo);
            }
            set.addArray(utxos);
            secpbase1 = new outputs_1.SECPTransferOutput(new bn_js_1.default(777), addrs3.map((a) => avm.parseAddress(a)), helperfunctions_1.UnixNow(), 1);
            secpbase2 = new outputs_1.SECPTransferOutput(new bn_js_1.default(888), addrs2.map((a) => avm.parseAddress(a)), helperfunctions_1.UnixNow(), 1);
            secpbase3 = new outputs_1.SECPTransferOutput(new bn_js_1.default(999), addrs2.map((a) => avm.parseAddress(a)), helperfunctions_1.UnixNow(), 1);
            initialState = new initialstates_1.InitialStates();
            initialState.addOutput(secpbase1, constants_1.AVMConstants.SECPFXID);
            initialState.addOutput(secpbase2, constants_1.AVMConstants.SECPFXID);
            initialState.addOutput(secpbase3, constants_1.AVMConstants.SECPFXID);
            nftpbase1 = new outputs_1.NFTMintOutput(0, addrs1.map(a => api.parseAddress(a)), locktime, 1);
            nftpbase2 = new outputs_1.NFTMintOutput(1, addrs2.map(a => api.parseAddress(a)), locktime, 1);
            nftpbase3 = new outputs_1.NFTMintOutput(2, addrs3.map(a => api.parseAddress(a)), locktime, 1);
            nftInitialState = new initialstates_1.InitialStates();
            nftInitialState.addOutput(nftpbase1, constants_1.AVMConstants.NFTFXID);
            nftInitialState.addOutput(nftpbase2, constants_1.AVMConstants.NFTFXID);
            nftInitialState.addOutput(nftpbase3, constants_1.AVMConstants.NFTFXID);
            secpMintOut1 = new outputs_1.SECPMintOutput(addressbuffs, new bn_js_1.default(0), 1);
            secpMintOut2 = new outputs_1.SECPMintOutput(addressbuffs, new bn_js_1.default(0), 1);
            secpMintTXID = buffer_1.Buffer.from(create_hash_1.default("sha256").update(bintools.fromBNToBuffer(new bn_js_1.default(1337), 32)).digest());
            secpMintUTXO = new utxos_1.UTXO(constants_1.AVMConstants.LATESTCODEC, secpMintTXID, 0, assetID, secpMintOut1);
            secpMintXferOut1 = new outputs_1.SECPTransferOutput(new bn_js_1.default(123), addrs3.map((a) => avm.parseAddress(a)), helperfunctions_1.UnixNow(), 2);
            secpMintXferOut2 = new outputs_1.SECPTransferOutput(new bn_js_1.default(456), [avm.parseAddress(addrs2[0])], helperfunctions_1.UnixNow(), 1);
            secpMintOp = new ops_1.SECPMintOperation(secpMintOut1, secpMintXferOut1);
            set.add(secpMintUTXO);
            xfersecpmintop = new ops_1.TransferableOperation(assetID, [secpMintUTXO.getUTXOID()], secpMintOp);
        }));
        test("signTx", () => __awaiter(void 0, void 0, void 0, function* () {
            const txu1 = yield avm.buildBaseTx(set, new bn_js_1.default(amnt), bintools.cb58Encode(assetID), addrs3, addrs1, addrs1);
            const txu2 = set.buildBaseTx(networkID, bintools.cb58Decode(blockchainID), new bn_js_1.default(amnt), assetID, addrs3.map((a) => avm.parseAddress(a)), addrs1.map((a) => avm.parseAddress(a)), addrs1.map((a) => avm.parseAddress(a)), avm.getTxFee(), assetID, undefined, helperfunctions_1.UnixNow(), new bn_js_1.default(0), 1);
            const tx1 = avm.signTx(txu1);
            const tx2 = avm.signTx(txu2);
            expect(tx2.toBuffer().toString("hex")).toBe(tx1.toBuffer().toString("hex"));
            expect(tx2.toString()).toBe(tx1.toString());
        }));
        test("buildBaseTx1", () => __awaiter(void 0, void 0, void 0, function* () {
            const txu1 = yield avm.buildBaseTx(set, new bn_js_1.default(amnt), bintools.cb58Encode(assetID), addrs3, addrs1, addrs1, new payload_1.UTF8Payload("hello world").getContent());
            const memobuf = buffer_1.Buffer.from("hello world");
            const txu2 = set.buildBaseTx(networkID, bintools.cb58Decode(blockchainID), new bn_js_1.default(amnt), assetID, addrs3.map((a) => avm.parseAddress(a)), addrs1.map((a) => avm.parseAddress(a)), addrs1.map((a) => avm.parseAddress(a)), avm.getTxFee(), assetID, memobuf, helperfunctions_1.UnixNow(), new bn_js_1.default(0), 1);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
        }));
        test("buildBaseTx2", () => __awaiter(void 0, void 0, void 0, function* () {
            const txu1 = yield avm.buildBaseTx(set, new bn_js_1.default(amnt).sub(new bn_js_1.default(100)), bintools.cb58Encode(assetID), addrs3, addrs1, addrs2, new payload_1.UTF8Payload("hello world"));
            const txu2 = set.buildBaseTx(networkID, bintools.cb58Decode(blockchainID), new bn_js_1.default(amnt).sub(new bn_js_1.default(100)), assetID, addrs3.map((a) => avm.parseAddress(a)), addrs1.map((a) => avm.parseAddress(a)), addrs2.map((a) => avm.parseAddress(a)), avm.getTxFee(), assetID, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow(), new bn_js_1.default(0), 1);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const outies = txu1.getTransaction().getOuts().sort(outputs_1.TransferableOutput.comparator());
            expect(outies.length).toBe(2);
            const outaddr0 = outies[0].getOutput().getAddresses().map((a) => avm.addressFromBuffer(a));
            const outaddr1 = outies[1].getOutput().getAddresses().map((a) => avm.addressFromBuffer(a));
            const testaddr2 = JSON.stringify(addrs2.sort());
            const testaddr3 = JSON.stringify(addrs3.sort());
            const testout0 = JSON.stringify(outaddr0.sort());
            const testout1 = JSON.stringify(outaddr1.sort());
            expect((testaddr2 == testout0 && testaddr3 == testout1)
                || (testaddr3 == testout0 && testaddr2 == testout1)).toBe(true);
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "BaseTx");
        }));
        test("issueTx Serialized", () => __awaiter(void 0, void 0, void 0, function* () {
            const txu = yield avm.buildBaseTx(set, new bn_js_1.default(amnt), bintools.cb58Encode(assetID), addrs3, addrs1, addrs1);
            const tx = avm.signTx(txu);
            const txid = "f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7";
            const result = avm.issueTx(tx.toString());
            const payload = {
                result: {
                    txID: txid
                }
            };
            const responseObj = {
                data: payload
            };
            jest_mock_axios_1.default.mockResponse(responseObj);
            const response = yield result;
            expect(response).toBe(txid);
        }));
        test("issueTx Buffer", () => __awaiter(void 0, void 0, void 0, function* () {
            const txu = yield avm.buildBaseTx(set, new bn_js_1.default(amnt), bintools.cb58Encode(assetID), addrs3, addrs1, addrs1);
            const tx = avm.signTx(txu);
            const txid = "f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7";
            const result = avm.issueTx(tx.toBuffer());
            const payload = {
                result: {
                    txID: txid
                }
            };
            const responseObj = {
                data: payload
            };
            jest_mock_axios_1.default.mockResponse(responseObj);
            const response = yield result;
            expect(response).toBe(txid);
        }));
        test("issueTx Class Tx", () => __awaiter(void 0, void 0, void 0, function* () {
            const txu = yield avm.buildBaseTx(set, new bn_js_1.default(amnt), bintools.cb58Encode(assetID), addrs3, addrs1, addrs1);
            const tx = avm.signTx(txu);
            const txid = "f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7";
            const result = avm.issueTx(tx);
            const payload = {
                result: {
                    txID: txid
                }
            };
            const responseObj = {
                data: payload
            };
            jest_mock_axios_1.default.mockResponse(responseObj);
            const response = yield result;
            expect(response).toBe(txid);
        }));
        test("buildCreateAssetTx - Fixed Cap", () => __awaiter(void 0, void 0, void 0, function* () {
            avm.setCreationTxFee(new bn_js_1.default(fee));
            const txu1 = yield avm.buildCreateAssetTx(set, addrs1, addrs2, initialState, name, symbol, denomination);
            const txu2 = set.buildCreateAssetTx(avalanche.getNetworkID(), bintools.cb58Decode(avm.getBlockchainID()), addrs1.map((a) => avm.parseAddress(a)), addrs2.map((a) => avm.parseAddress(a)), initialState, name, symbol, denomination, undefined, avm.getCreationTxFee(), assetID);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "CreateAssetTx");
        }));
        test("buildCreateAssetTx - Variable Cap", () => __awaiter(void 0, void 0, void 0, function* () {
            avm.setCreationTxFee(new bn_js_1.default(constants_2.Defaults.network[12345].P["creationTxFee"]));
            const mintOutputs = [secpMintOut1, secpMintOut2];
            const txu1 = yield avm.buildCreateAssetTx(set, addrs1, addrs2, initialState, name, symbol, denomination, mintOutputs);
            const txu2 = set.buildCreateAssetTx(avalanche.getNetworkID(), bintools.cb58Decode(avm.getBlockchainID()), addrs1.map((a) => avm.parseAddress(a)), addrs2.map((a) => avm.parseAddress(a)), initialState, name, symbol, denomination, mintOutputs, avm.getCreationTxFee(), assetID);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
        }));
        test("buildSECPMintTx", () => __awaiter(void 0, void 0, void 0, function* () {
            avm.setTxFee(new bn_js_1.default(fee));
            const newMinter = new outputs_1.SECPMintOutput(addrs3.map((a) => avm.parseAddress(a)), new bn_js_1.default(0), 1);
            const txu1 = yield avm.buildSECPMintTx(set, newMinter, secpMintXferOut1, addrs1, addrs2, secpMintUTXO.getUTXOID());
            const txu2 = set.buildSECPMintTx(avalanche.getNetworkID(), bintools.cb58Decode(avm.getBlockchainID()), newMinter, secpMintXferOut1, addrs1.map((a) => avm.parseAddress(a)), addrs2.map((a) => avm.parseAddress(a)), secpMintUTXO.getUTXOID(), avm.getTxFee(), assetID);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "SECPMintTx");
        }));
        test("buildCreateNFTAssetTx", () => __awaiter(void 0, void 0, void 0, function* () {
            avm.setCreationTxFee(new bn_js_1.default(constants_2.Defaults.network[12345].P["creationTxFee"]));
            const minterSets = [new minterset_1.MinterSet(1, addrs1)];
            const locktime = new bn_js_1.default(0);
            const txu1 = yield avm.buildCreateNFTAssetTx(set, addrs1, addrs2, minterSets, name, symbol, new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow(), locktime);
            const txu2 = set.buildCreateNFTAssetTx(avalanche.getNetworkID(), bintools.cb58Decode(avm.getBlockchainID()), addrs1.map((a) => avm.parseAddress(a)), addrs2.map((a) => avm.parseAddress(a)), minterSets, name, symbol, avm.getCreationTxFee(), assetID, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow(), locktime);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "CreateNFTAssetTx");
        }));
        test("buildCreateNFTMintTx", () => __awaiter(void 0, void 0, void 0, function* () {
            avm.setTxFee(new bn_js_1.default(fee));
            const groupID = 0;
            const locktime = new bn_js_1.default(0);
            const threshold = 1;
            const payload = buffer_1.Buffer.from("Avalanche");
            const addrbuff1 = addrs1.map((a) => avm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => avm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => avm.parseAddress(a));
            const outputOwners = [];
            const oo = new output_1.OutputOwners(addrbuff3, locktime, threshold);
            outputOwners.push();
            const txu1 = yield avm.buildCreateNFTMintTx(set, oo, addrs1, addrs2, nftutxoids, groupID, payload, undefined, helperfunctions_1.UnixNow());
            const txu2 = set.buildCreateNFTMintTx(avalanche.getNetworkID(), bintools.cb58Decode(avm.getBlockchainID()), [oo], addrbuff1, addrbuff2, nftutxoids, groupID, payload, avm.getTxFee(), assetID, undefined, helperfunctions_1.UnixNow());
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            outputOwners.push(oo);
            outputOwners.push(new output_1.OutputOwners(addrbuff3, locktime, threshold + 1));
            const txu3 = yield avm.buildCreateNFTMintTx(set, outputOwners, addrs1, addrs2, nftutxoids, groupID, payload, undefined, helperfunctions_1.UnixNow());
            const txu4 = set.buildCreateNFTMintTx(avalanche.getNetworkID(), bintools.cb58Decode(avm.getBlockchainID()), outputOwners, addrbuff1, addrbuff2, nftutxoids, groupID, payload, avm.getTxFee(), assetID, undefined, helperfunctions_1.UnixNow());
            expect(txu4.toBuffer().toString("hex")).toBe(txu3.toBuffer().toString("hex"));
            expect(txu4.toString()).toBe(txu3.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "CreateNFTMintTx");
        }));
        test("buildNFTTransferTx", () => __awaiter(void 0, void 0, void 0, function* () {
            avm.setTxFee(new bn_js_1.default(fee));
            const pload = buffer_1.Buffer.alloc(1024);
            pload.write("All you Trekkies and TV addicts, Don't mean to diss don't mean to bring static.", 0, 1024, "utf8");
            const addrbuff1 = addrs1.map((a) => avm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => avm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => avm.parseAddress(a));
            const txu1 = yield avm.buildNFTTransferTx(set, addrs3, addrs1, addrs2, nftutxoids[1], new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow(), new bn_js_1.default(0), 1);
            const txu2 = set.buildNFTTransferTx(networkID, bintools.cb58Decode(blockchainID), addrbuff3, addrbuff1, addrbuff2, [nftutxoids[1]], avm.getTxFee(), assetID, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow(), new bn_js_1.default(0), 1);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "NFTTransferTx");
        }));
        test("buildImportTx", () => __awaiter(void 0, void 0, void 0, function* () {
            const locktime = new bn_js_1.default(0);
            const threshold = 1;
            avm.setTxFee(new bn_js_1.default(fee));
            const addrbuff1 = addrs1.map((a) => avm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => avm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => avm.parseAddress(a));
            const fungutxo = set.getUTXO(fungutxoids[1]);
            const fungutxostr = fungutxo.toString();
            const result = avm.buildImportTx(set, addrs1, constants_3.PlatformChainID, addrs3, addrs1, addrs2, new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow(), locktime, threshold);
            const payload = {
                result: {
                    utxos: [fungutxostr]
                }
            };
            const responseObj = {
                data: payload
            };
            jest_mock_axios_1.default.mockResponse(responseObj);
            const txu1 = yield result;
            const txu2 = set.buildImportTx(networkID, bintools.cb58Decode(blockchainID), addrbuff3, addrbuff1, addrbuff2, [fungutxo], bintools.cb58Decode(constants_3.PlatformChainID), avm.getTxFee(), yield avm.getAVAXAssetID(), new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow(), locktime, threshold);
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "ImportTx");
        }));
        test("buildExportTx", () => __awaiter(void 0, void 0, void 0, function* () {
            avm.setTxFee(new bn_js_1.default(fee));
            const addrbuff1 = addrs1.map((a) => avm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => avm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => avm.parseAddress(a));
            const amount = new bn_js_1.default(90);
            const type = "bech32";
            const txu1 = yield avm.buildExportTx(set, amount, bintools.cb58Decode(constants_3.PlatformChainID), addrbuff3.map((a) => serialization.bufferToType(a, type, avalanche.getHRP(), "P")), addrs1, addrs2, new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow());
            const txu2 = set.buildExportTx(networkID, bintools.cb58Decode(blockchainID), amount, assetID, addrbuff3, addrbuff1, addrbuff2, bintools.cb58Decode(constants_3.PlatformChainID), avm.getTxFee(), assetID, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow());
            expect(txu2.toBuffer().toString("hex")).toBe(txu1.toBuffer().toString("hex"));
            expect(txu2.toString()).toBe(txu1.toString());
            const txu3 = yield avm.buildExportTx(set, amount, constants_3.PlatformChainID, addrs3, addrs1, addrs2, new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow());
            const txu4 = set.buildExportTx(networkID, bintools.cb58Decode(blockchainID), amount, assetID, addrbuff3, addrbuff1, addrbuff2, undefined, avm.getTxFee(), assetID, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow());
            expect(txu4.toBuffer().toString("hex")).toBe(txu3.toBuffer().toString("hex"));
            expect(txu4.toString()).toBe(txu3.toString());
            const tx1 = txu1.sign(avm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            const tx2obj = tx2.serialize("hex");
            const tx2str = JSON.stringify(tx2obj);
            expect(tx1obj).toStrictEqual(tx2obj);
            expect(tx1str).toStrictEqual(tx2str);
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(avm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            const tx4obj = tx4.serialize(display);
            const tx4str = JSON.stringify(tx4obj);
            expect(tx3obj).toStrictEqual(tx4obj);
            expect(tx3str).toStrictEqual(tx4str);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "ExportTx");
        }));
        test("buildGenesis", () => __awaiter(void 0, void 0, void 0, function* () {
            const genesisData = {
                genesisData: {
                    assetAlias1: {
                        name: "human readable name",
                        symbol: "AVAL",
                        initialState: {
                            fixedCap: [
                                {
                                    amount: 1000,
                                    address: "A"
                                },
                                {
                                    amount: 5000,
                                    address: "B"
                                }
                            ]
                        }
                    },
                    assetAliasCanBeAnythingUnique: {
                        name: "human readable name",
                        symbol: "AVAL",
                        initialState: {
                            variableCap: [
                                {
                                    minters: [
                                        "A",
                                        "B"
                                    ],
                                    threshold: 1
                                },
                                {
                                    minters: [
                                        "A",
                                        "B",
                                        "C"
                                    ],
                                    threshold: 2
                                }
                            ]
                        }
                    }
                }
            };
            const bytes = "111TNWzUtHKoSvxohjyfEwE2X228ZDGBngZ4mdMUVMnVnjtnawW1b1zbAhzyAM1v6d7ECNj6DXsT7qDmhSEf3DWgXRj7ECwBX36ZXFc9tWVB2qHURoUfdDvFsBeSRqatCmj76eZQMGZDgBFRNijRhPNKUap7bCeKpHDtuCZc4YpPkd4mR84dLL2AL1b4K46eirWKMaFVjA5btYS4DnyUx5cLpAq3d35kEdNdU5zH3rTU18S4TxYV8voMPcLCTZ3h4zRsM5jW1cUzjWVvKg7uYS2oR9qXRFcgy1gwNTFZGstySuvSF7MZeZF4zSdNgC4rbY9H94RVhqe8rW7MXqMSZB6vBTB2BpgF6tNFehmYxEXwjaKRrimX91utvZe9YjgGbDr8XHsXCnXXg4ZDCjapCy4HmmRUtUoAduGNBdGVMiwE9WvVbpMFFcNfgDXGz9NiatgSnkxQALTHvGXXm8bn4CoLFzKnAtq3KwiWqHmV3GjFYeUm3m8Zee9VDfZAvDsha51acxfto1htstxYu66DWpT36YT18WSbxibZcKXa7gZrrsCwyzid8CCWw79DbaLCUiq9u47VqofG1kgxwuuyHb8NVnTgRTkQASSbj232fyG7YeX4mAvZY7a7K7yfSyzJaXdUdR7aLeCdLP6mbFDqUMrN6YEkU2X8d4Ck3T";
            const result = api.buildGenesis(genesisData);
            const payload = {
                "result": {
                    "bytes": bytes
                }
            };
            const responseObj = {
                data: payload
            };
            jest_mock_axios_1.default.mockResponse(responseObj);
            const response = yield result;
            expect(response).toBe(bytes);
        }));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0cy9hcGlzL2F2bS9hcGkudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzRUFBdUM7QUFDdkMsNkJBQStCO0FBQy9CLDBDQUF5QztBQUN6QyxvREFBeUQ7QUFDekQsb0NBQWdDO0FBQ2hDLGtEQUFzQjtBQUN0QixrRUFBeUM7QUFDekMsOENBQWtEO0FBQ2xELGdEQUEwRTtBQUMxRSw4REFBb0M7QUFDcEMsd0NBQWdEO0FBQ2hELHNEQUFxRDtBQUNyRCxrREFBK0g7QUFDL0gsMENBQWlHO0FBQ2pHLCtDQUFnQztBQUNoQywrQ0FBK0M7QUFDL0MsOERBQTBEO0FBQzFELG1EQUE4QztBQUM5QywrREFBbUQ7QUFDbkQsOENBQWdEO0FBQ2hELHNEQUFrRDtBQUNsRCxtREFBcUQ7QUFDckQscUVBQWlFO0FBQ2pFLG1EQUE2QztBQUM3QywyREFBeUc7QUFHekc7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2hFLE1BQU0saUJBQWlCLEdBQVksS0FBSyxDQUFBO0FBQ3hDLE1BQU0sT0FBTyxHQUF1QixTQUFTLENBQUE7QUFFN0MsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFvQixFQUFFLElBQVksRUFBUSxFQUFFO0lBQzlELElBQUcsaUJBQWlCLEVBQUM7UUFDbkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BHLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNB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QkFBa0IsQ0FDN0MsU0FBUyxDQUFDLFlBQVksRUFBRSxFQUN4QixRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxFQUMxQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3RDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDdEMsWUFBWSxFQUNaLElBQUksRUFDSixNQUFNLEVBQ04sWUFBWSxFQUNaLFdBQVcsRUFDWCxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsRUFDdEIsT0FBTyxDQUNSLENBQUE7WUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7WUFDN0UsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtZQUU3QyxNQUFNLEdBQUcsR0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1lBQ3pDLE1BQU0sT0FBTyxHQUFXLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDdEQsTUFBTSxNQUFNLEdBQVcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUMzQyxNQUFNLE1BQU0sR0FBVyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQzdDLE1BQU0sU0FBUyxHQUFXLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDNUMsTUFBTSxHQUFH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QUNiO2dDQUNEO29DQUNFLE1BQU0sRUFBRSxJQUFJO29DQUNaLE9BQU8sRUFBRSxHQUFHO2lDQUNiOzZCQUNGO3lCQUNGO3FCQUNGO29CQUNELDZCQUE2QixFQUFFO3dCQUM3QixJQUFJLEVBQUUscUJBQXFCO3dCQUMzQixNQUFNLEVBQUUsTUFBTTt3QkFDZCxZQUFZLEVBQUU7NEJBQ1osV0FBVyxFQUFFO2dDQUNYO29DQUNFLE9BQU8sRUFBRTt3Q0FDUCxHQUFHO3dDQUNILEdBQUc7cUNBQ0o7b0NBQ0QsU0FBUyxFQUFFLENBQUM7aUNBQ2I7Z0NBQ0Q7b0NBQ0UsT0FBTyxFQUFFO3dDQUNQLEdBQUc7d0NBQ0gsR0FBRzt3Q0FDSCxHQUFHO3FDQUNKO29DQUNELFNBQVMsRUFBRSxDQUFDO2lDQUNiOzZCQUNGO3lCQUNGO3FCQUNGO2lCQUNGO2FBQ0YsQ0FBQTtZQUNELE1BQU0sS0FBSyxHQUFXLHdxQkFBd3FCLENBQUE7WUFDOXJCLE1BQU0sTUFBTSxHQUFvQixHQUFHLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFBO1lBQzdELE1BQU0sT0FBTyxHQUFXO2dCQUN0QixRQUFRLEVBQUU7b0JBQ1IsT0FBTyxFQUFFLEtBQUs7aUJBQ2Y7YUFDRixDQUFBO1lBQ0QsTUFBTSxXQUFXLEdBRWI7Z0JBQ0YsSUFBSSxFQUFFLE9BQU87YUFDZCxDQUFBO1lBRUQseUJBQVMsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUE7WUFDbkMsTUFBTSxRQUFRLEdBQVcsTUFBTSxNQUFNLENBQUE7WUFDckMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUM5QixDQUFDLENBQUEsQ0FBQyxDQUFBO0lBQ0osQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb2NrQXhpb3MgZnJvbSBcImplc3QtbW9jay1heGlvc1wiXG5pbXBvcnQgeyBBdmFsYW5jaGUgfSBmcm9tIFwic3JjXCJcbmltcG9ydCB7IEFWTUFQSSB9IGZyb20gXCJzcmMvYXBpcy9hdm0vYXBpXCJcbmltcG9ydCB7IEtleVBhaXIsIEtleUNoYWluIH0gZnJvbSBcInNyYy9hcGlzL2F2bS9rZXljaGFpblwiXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwic3JjL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IFVUWE9TZXQsIFVUWE8gfSBmcm9tIFwic3JjL2FwaXMvYXZtL3V0eG9zXCJcbmltcG9ydCB7IFRyYW5zZmVyYWJsZUlucHV0LCBTRUNQVHJhbnNmZXJJbnB1dCB9IGZyb20gXCJzcmMvYXBpcy9hdm0vaW5wdXRzXCJcbmltcG9ydCBjcmVhdGVIYXNoIGZyb20gXCJjcmVhdGUtaGFzaFwiXG5pbXBvcnQgeyBVbnNpZ25lZFR4LCBUeCB9IGZyb20gXCJzcmMvYXBpcy9hdm0vdHhcIlxuaW1wb3J0IHsgQVZNQ29uc3RhbnRzIH0gZnJvbSBcInNyYy9hcGlzL2F2bS9jb25zdGFudHNcIlxuaW1wb3J0IHsgVHJhbnNmZXJhYmxlT3V0cHV0LCBTRUNQVHJhbnNmZXJPdXRwdXQsIE5GVE1pbnRPdXRwdXQsIE5GVFRyYW5zZmVyT3V0cHV0LCBTRUNQTWludE91dHB1dCB9IGZyb20gXCJzcmMvYXBpcy9hdm0vb3V0cHV0c1wiXG5pbXBvcnQgeyBORlRUcmFuc2Zlck9wZXJhdGlvbiwgVHJhbnNmZXJhYmxlT3BlcmF0aW9uLCBTRUNQTWludE9wZXJhdGlvbiB9IGZyb20gXCJzcmMvYXBpcy9hdm0vb3BzXCJcbmltcG9ydCAqIGFzIGJlY2gzMiBmcm9tIFwiYmVjaDMyXCJcbmltcG9ydCB7IFVURjhQYXlsb2FkIH0gZnJvbSBcInNyYy91dGlscy9wYXlsb2FkXCJcbmltcG9ydCB7IEluaXRpYWxTdGF0ZXMgfSBmcm9tIFwic3JjL2FwaXMvYXZtL2luaXRpYWxzdGF0ZXNcIlxuaW1wb3J0IHsgRGVmYXVsdHMgfSBmcm9tIFwic3JjL3V0aWxzL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBVbml4Tm93IH0gZnJvbSBcInNyYy91dGlscy9oZWxwZXJmdW5jdGlvbnNcIlxuaW1wb3J0IHsgT3V0cHV0T3duZXJzIH0gZnJvbSBcInNyYy9jb21tb24vb3V0cHV0XCJcbmltcG9ydCB7IE1pbnRlclNldCB9IGZyb20gXCJzcmMvYXBpcy9hdm0vbWludGVyc2V0XCJcbmltcG9ydCB7IFBsYXRmb3JtQ2hhaW5JRCB9IGZyb20gXCJzcmMvdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCB7IFBlcnNpc3RhbmNlT3B0aW9ucyB9IGZyb20gXCJzcmMvdXRpbHMvcGVyc2lzdGVuY2VvcHRpb25zXCJcbmltcG9ydCB7IE9ORUFWQVggfSBmcm9tIFwic3JjL3V0aWxzL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBTZXJpYWxpemFibGUsIFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZywgU2VyaWFsaXplZFR5cGUgfSBmcm9tIFwic3JjL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuaW1wb3J0IHsgSHR0cFJlc3BvbnNlIH0gZnJvbSBcImplc3QtbW9jay1heGlvcy9kaXN0L2xpYi9tb2NrLWF4aW9zLXR5cGVzXCJcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcbmNvbnN0IGR1bXBTZXJhaWxpemF0aW9uOiBib29sZWFuID0gZmFsc2VcbmNvbnN0IGRpc3BsYXk6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiZGlzcGxheVwiXG5cbmNvbnN0IHNlcmlhbHplaXQgPSAoYVRoaW5nOiBTZXJpYWxpemFibGUsIG5hbWU6IHN0cmluZyk6IHZvaWQgPT4ge1xuICBpZihkdW1wU2VyYWlsaXphdGlvbil7XG4gICAgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkoc2VyaWFsaXphdGlvbi5zZXJpYWxpemUoYVRoaW5nLCBcImF2bVwiLCBcImhleFwiLCBuYW1lICsgXCIgLS0gSGV4IEVuY29kZWRcIikpKVxuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHNlcmlhbGl6YXRpb24uc2VyaWFsaXplKGFUaGluZywgXCJhdm1cIiwgXCJkaXNwbGF5XCIsIG5hbWUgKyBcIiAtLSBIdW1hbi1SZWFkYWJsZVwiKSkpXG4gIH1cbn1cblxuZGVzY3JpYmUoXCJBVk1BUElcIiwgKCk6IHZvaWQgPT4ge1xuICBjb25zdCBuZXR3b3JrSUQ6IG51bWJlciA9IDEyMzQ1XG4gIGNvbnN0IGJsb2NrY2hhaW5JRDogc3RyaW5nID0gRGVmYXVsdHMubmV0d29ya1tuZXR3b3JrSURdLlguYmxvY2tjaGFpbklEXG4gIGNvbnN0IGlwOiBzdHJpbmcgPSBcIjEyNy4wLjAuMVwiXG4gIGNvbnN0IHBvcnQ6IG51bWJlciA9IDk2NTBcbiAgY29uc3QgcHJvdG9jb2w6IHN0cmluZyA9IFwiaHR0cHNcIlxuXG4gIGNvbnN0IHVzZXJuYW1lOiBzdHJpbmcgPSBcIkF2YUxhYnNcIlxuICBjb25zdCBwYXNzd29yZDogc3RyaW5nID0gXCJwYXNzd29yZFwiXG5cbiAgY29uc3QgYXZhbGFuY2hlOiBBdmFsYW5jaGUgPSBuZXcgQXZhbGFuY2hlKGlwLCBwb3J0LCBwcm90b2NvbCwgbmV0d29ya0lELCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0cnVlKVxuICBsZXQgYXBpOiBBVk1BUElcbiAgbGV0IGFsaWFzOiBzdHJpbmdcblxuICBjb25zdCBhZGRyQTogc3RyaW5nID0gYFgtJHtiZWNoMzIuZW5jb2RlKGF2YWxhbmNoZS5nZXRIUlAoKSwgYmVjaDMyLnRvV29yZHMoYmludG9vbHMuY2I1OERlY29kZShcIkI2RDR2MVZ0UFlMYmlVdllYdFc0UHg4b0U5aW1DMnZHV1wiKSkpfWBcbiAgY29uc3QgYWRkckI6IHN0cmluZyA9IGBYLSR7YmVjaDMyLmVuY29kZShhdmFsYW5jaGUuZ2V0SFJQKCksIGJlY2gzMi50b1dvcmRzKGJpbnRvb2xzLmNiNThEZWNvZGUoXCJQNXdkUnVaZWFEdDI4ZUhNUDVTM3c5WmRvQmZvN3d1ekZcIikpKX1gXG4gIGNvbnN0IGFkZHJDOiBzdHJpbmcgPSBgWC0ke2JlY2gzMi5lbmNvZGUoYXZhbGFuY2hlLmdldEhSUCgpLCBiZWNoMzIudG9Xb3JkcyhiaW50b29scy5jYjU4RGVjb2RlKFwiNlkza3lzakY5am5IbllrZFM5eUdBdW9IeWFlMmVObWVWXCIpKSl9YFxuXG4gIGJlZm9yZUFsbCgoKTogdm9pZCA9PiB7XG4gICAgYXBpID0gbmV3IEFWTUFQSShhdmFsYW5jaGUsIFwiL2V4dC9iYy9YXCIsIGJsb2NrY2hhaW5JRClcbiAgICBhbGlhcyA9IGFwaS5nZXRCbG9ja2NoYWluQWxpYXMoKVxuICB9KVxuXG4gIGFmdGVyRWFjaCgoKTogdm9pZCA9PiB7XG4gICAgbW9ja0F4aW9zLnJlc2V0KClcbiAgfSlcblxuICB0ZXN0KFwiY2FuIFNlbmQgMVwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgdHhJZDogc3RyaW5nID0gXCJhc2RmaHZsMjM0XCJcbiAgICBjb25zdCBtZW1vOiBzdHJpbmcgPSBcImhlbGxvIHdvcmxkXCJcbiAgICBjb25zdCBjaGFuZ2VBZGRyOnN0cmluZyA9IFwiWC1sb2NhbDFcIlxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxvYmplY3Q+ID0gYXBpLnNlbmQodXNlcm5hbWUsIHBhc3N3b3JkLCBcImFzc2V0SWRcIiwgMTAsIGFkZHJBLCBbYWRkckJdLCBhZGRyQSwgbWVtbylcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgdHhJRDogdHhJZCxcbiAgICAgICAgY2hhbmdlQWRkcjogY2hhbmdlQWRkclxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IG9iamVjdCA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2VbXCJ0eElEXCJdKS50b0JlKHR4SWQpXG4gICAgZXhwZWN0KHJlc3BvbnNlW1wiY2hhbmdlQWRkclwiXSkudG9CZShjaGFuZ2VBZGRyKVxuICB9KVxuXG4gIHRlc3QoXCJjYW4gU2VuZCAyXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCB0eElkOiBzdHJpbmcgPSBcImFzZGZodmwyMzRcIlxuICAgIGNvbnN0IG1lbW86QnVmZmVyID0gQnVmZmVyLmZyb20oXCJoZWxsbyB3b3JsZFwiKVxuICAgIGNvbnN0IGNoYW5nZUFkZHI6c3RyaW5nID0gXCJYLWxvY2FsMVwiXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPG9iamVjdD4gPSBhcGkuc2VuZCh1c2VybmFtZSwgcGFzc3dvcmQsIGJpbnRvb2xzLmI1OFRvQnVmZmVyKFwiNmgyczVkZTFWQzY1bWVhakUxTDJQanZaMU1YdkhjM0Y2ZXFQQ0dLdUR0NE14aXdlRlwiKSwgbmV3IEJOKDEwKSwgYWRkckEsIFthZGRyQl0sIGFkZHJBLCBtZW1vKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB0eElEOiB0eElkLFxuICAgICAgICBjaGFuZ2VBZGRyOiBjaGFuZ2VBZGRyXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogb2JqZWN0ID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZVtcInR4SURcIl0pLnRvQmUodHhJZClcbiAgICBleHBlY3QocmVzcG9uc2VbXCJjaGFuZ2VBZGRyXCJdKS50b0JlKGNoYW5nZUFkZHIpXG4gIH0pXG5cbiAgdGVzdChcImNhbiBTZW5kIE11bHRpcGxlXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCB0eElkOiBzdHJpbmcgPSBcImFzZGZodmwyMzRcIlxuICAgIGNvbnN0IG1lbW86IHN0cmluZyA9IFwiaGVsbG8gd29ybGRcIlxuICAgIGNvbnN0IGNoYW5nZUFkZHI6c3RyaW5nID0gXCJYLWxvY2FsMVwiXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPG9iamVjdD4gPSBhcGkuc2VuZE11bHRpcGxlKHVzZXJuYW1lLCBwYXNzd29yZCwgW3sgYXNzZXRJRDogXCJhc3NldElkXCIsIGFtb3VudDogMTAsIHRvOiBhZGRyQSB9XSwgW2FkZHJCXSwgYWRkckEsIG1lbW8pXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIHR4SUQ6IHR4SWQsXG4gICAgICAgIGNoYW5nZUFkZHI6IGNoYW5nZUFkZHJcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWRcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBvYmplY3QgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlW1widHhJRFwiXSkudG9CZSh0eElkKVxuICAgIGV4cGVjdChyZXNwb25zZVtcImNoYW5nZUFkZHJcIl0pLnRvQmUoY2hhbmdlQWRkcilcbiAgfSlcblxuICB0ZXN0KFwicmVmcmVzaEJsb2NrY2hhaW5JRFwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgbjNiY0lEOiBzdHJpbmcgPSBEZWZhdWx0cy5uZXR3b3JrWzNdLlhbXCJibG9ja2NoYWluSURcIl1cbiAgICBjb25zdCBuMTIzNDViY0lEOiBzdHJpbmcgPSBEZWZhdWx0cy5uZXR3b3JrWzEyMzQ1XS5YW1wiYmxvY2tjaGFpbklEXCJdXG4gICAgY29uc3QgdGVzdEFQSTogQVZNQVBJID0gbmV3IEFWTUFQSShhdmFsYW5jaGUsIFwiL2V4dC9iYy9hdm1cIiwgbjNiY0lEKVxuICAgIGNvbnN0IGJjMTogc3RyaW5nID0gdGVzdEFQSS5nZXRCbG9ja2NoYWluSUQoKVxuICAgIGV4cGVjdChiYzEpLnRvQmUobjNiY0lEKVxuXG4gICAgdGVzdEFQSS5yZWZyZXNoQmxvY2tjaGFpbklEKClcbiAgICBjb25zdCBiYzI6IHN0cmluZyA9IHRlc3RBUEkuZ2V0QmxvY2tjaGFpbklEKClcbiAgICBleHBlY3QoYmMyKS50b0JlKG4xMjM0NWJjSUQpXG5cbiAgICB0ZXN0QVBJLnJlZnJlc2hCbG9ja2NoYWluSUQobjNiY0lEKVxuICAgIGNvbnN0IGJjMzogc3RyaW5nID0gdGVzdEFQSS5nZXRCbG9ja2NoYWluSUQoKVxuICAgIGV4cGVjdChiYzMpLnRvQmUobjNiY0lEKVxuXG4gIH0pXG5cbiAgdGVzdChcImxpc3RBZGRyZXNzZXNcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IGFkZHJlc3NlcyA9IFthZGRyQSwgYWRkckJdXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZ1tdPiA9IGFwaS5saXN0QWRkcmVzc2VzKHVzZXJuYW1lLCBwYXNzd29yZClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgYWRkcmVzc2VzXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nW10gPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKGFkZHJlc3NlcylcbiAgfSlcblxuICB0ZXN0KFwiaW1wb3J0S2V5XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBhZGRyZXNzID0gYWRkckNcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5pbXBvcnRLZXkodXNlcm5hbWUsIHBhc3N3b3JkLCBcImtleVwiKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBhZGRyZXNzXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUoYWRkcmVzcylcbiAgfSlcblxuICB0ZXN0KFwiZ2V0QmFsYW5jZVwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgYmFsYW5jZTogQk4gPSBuZXcgQk4oXCIxMDBcIiwgMTApXG4gICAgY29uc3QgcmVzcG9iaiA9IHtcbiAgICAgIGJhbGFuY2UsXG4gICAgICB1dHhvSURzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBcInR4SURcIjpcIkxVcmlCM1c5MTlGODRMd1BNTXc0c20yZlo0WTc2V2diNm1zYWF1RVk3aTF0Rk5tdHZcIixcbiAgICAgICAgICBcIm91dHB1dEluZGV4XCI6MFxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPG9iamVjdD4gPSBhcGkuZ2V0QmFsYW5jZShhZGRyQSwgXCJBVEhcIilcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHJlc3BvYmpcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWRcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBvYmplY3QgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSkudG9CZShKU09OLnN0cmluZ2lmeShyZXNwb2JqKSlcbiAgfSlcblxuICB0ZXN0KFwiZXhwb3J0S2V5XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBrZXk6IHN0cmluZyA9IFwic2RmZ2x2bGoyaDN2NDVcIlxuXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkuZXhwb3J0S2V5KHVzZXJuYW1lLCBwYXNzd29yZCwgYWRkckEpXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIHByaXZhdGVLZXk6IGtleVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKGtleSlcbiAgfSlcblxuICB0ZXN0KFwiZXhwb3J0XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBhbW91bnQ6IEJOID0gbmV3IEJOKDEwMClcbiAgICBjb25zdCB0bzogc3RyaW5nID0gXCJhYmNkZWZcIlxuICAgIGNvbnN0IGFzc2V0SUQ6IHN0cmluZyA9IFwiQVZBWFwiXG4gICAgY29uc3QgdXNlcm5hbWU6IHN0cmluZyA9IFwiUm9iZXJ0XCJcbiAgICBjb25zdCBwYXNzd29yZDogc3RyaW5nID0gXCJQYXVsc29uXCJcbiAgICBjb25zdCB0eElEOiBzdHJpbmcgPSBcInZhbGlkXCJcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5leHBvcnQodXNlcm5hbWUsIHBhc3N3b3JkLCB0bywgYW1vdW50LCBhc3NldElEKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB0eElEOiB0eElEXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSh0eElEKVxuICB9KVxuXG4gIHRlc3QoXCJleHBvcnRBVkFYXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBhbW91bnQ6IEJOID0gbmV3IEJOKDEwMClcbiAgICBjb25zdCB0bzogc3RyaW5nID0gXCJhYmNkZWZcIlxuICAgIGNvbnN0IHVzZXJuYW1lOiBzdHJpbmcgPSBcIlJvYmVydFwiXG4gICAgY29uc3QgcGFzc3dvcmQ6IHN0cmluZyA9IFwiUGF1bHNvblwiXG4gICAgY29uc3QgdHhJRDogc3RyaW5nID0gXCJ2YWxpZFwiXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkuZXhwb3J0QVZBWCh1c2VybmFtZSwgcGFzc3dvcmQsIHRvLCBhbW91bnQpXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIHR4SUQ6IHR4SURcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcGF5bG9hZFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUodHhJRClcbiAgfSlcblxuICB0ZXN0KFwiaW1wb3J0XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCB0bzogc3RyaW5nID0gXCJhYmNkZWZcIlxuICAgIGNvbnN0IHVzZXJuYW1lOiBzdHJpbmcgPSBcIlJvYmVydFwiXG4gICAgY29uc3QgcGFzc3dvcmQ6IHN0cmluZyA9IFwiUGF1bHNvblwiXG4gICAgY29uc3QgdHhJRDogc3RyaW5nID0gXCJ2YWxpZFwiXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkuaW1wb3J0KHVzZXJuYW1lLCBwYXNzd29yZCwgdG8sIGJsb2NrY2hhaW5JRClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgdHhJRDogdHhJRFxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUodHhJRClcbiAgfSlcblxuICB0ZXN0KFwiaW1wb3J0QVZBWFwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgdG86IHN0cmluZyA9IFwiYWJjZGVmXCJcbiAgICBjb25zdCB1c2VybmFtZTogc3RyaW5nID0gXCJSb2JlcnRcIlxuICAgIGNvbnN0IHBhc3N3b3JkOiBzdHJpbmcgPSBcIlBhdWxzb25cIlxuICAgIGNvbnN0IHR4SUQ6IHN0cmluZyA9IFwidmFsaWRcIlxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXBpLmltcG9ydEFWQVgodXNlcm5hbWUsIHBhc3N3b3JkLCB0bywgYmxvY2tjaGFpbklEKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB0eElEOiB0eElEXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSh0eElEKVxuICB9KVxuXG4gIHRlc3QoXCJjcmVhdGVBZGRyZXNzXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBhbGlhczogc3RyaW5nID0gXCJyYW5kb21hbGlhc1wiXG5cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5jcmVhdGVBZGRyZXNzKHVzZXJuYW1lLCBwYXNzd29yZClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgYWRkcmVzczogYWxpYXMsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKGFsaWFzKVxuICB9KVxuXG4gIHRlc3QoXCJjcmVhdGVGaXhlZENhcEFzc2V0XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBrcDogS2V5UGFpciA9IG5ldyBLZXlQYWlyKGF2YWxhbmNoZS5nZXRIUlAoKSwgYWxpYXMpXG4gICAga3AuaW1wb3J0S2V5KEJ1ZmZlci5mcm9tKFwiZWY5YmYyZDQ0MzY0OTFjMTUzOTY3Yzk3MDlkZDhlODI3OTViZGI5YjVhZDQ0ZWUyMmMyOTAzMDA1ZDFjZjY3NlwiLCBcImhleFwiKSlcblxuICAgIGNvbnN0IGRlbm9taW5hdGlvbjogbnVtYmVyID0gMFxuICAgIGNvbnN0IGFzc2V0SUQ6IHN0cmluZyA9IFwiOGE1ZDJkMzJlNjhiYzUwMDM2ZTRkMDg2MDQ0NjE3ZmU0YTBhMDI5NmIyNzQ5OTliYTU2OGVhOTJkYTQ2ZDUzM1wiXG4gICAgY29uc3QgaW5pdGlhbEhvbGRlcnM6IG9iamVjdFtdID0gW1xuICAgICAge1xuICAgICAgICBhZGRyZXNzOiBcIjdzaWszUHI2cjFGZUxydksxb1d3RUNCUzhpSjVWUHVTaFwiLFxuICAgICAgICBhbW91bnQ6IFwiMTAwMDBcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgYWRkcmVzczogXCI3c2lrM1ByNnIxRmVMcnZLMW9Xd0VDQlM4aUo1VlB1U2hcIixcbiAgICAgICAgYW1vdW50OiBcIjUwMDAwXCJcbiAgICAgIH1cbiAgICBdXG5cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5jcmVhdGVGaXhlZENhcEFzc2V0KHVzZXJuYW1lLCBwYXNzd29yZCwgXCJTb21lIENvaW5cIiwgXCJTQ0NcIiwgZGVub21pbmF0aW9uLCBpbml0aWFsSG9sZGVycylcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgYXNzZXRJRDogYXNzZXRJRCxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUoYXNzZXRJRClcbiAgfSlcblxuICB0ZXN0KFwiY3JlYXRlVmFyaWFibGVDYXBBc3NldFwiLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3Qga3A6IEtleVBhaXIgPSBuZXcgS2V5UGFpcihhdmFsYW5jaGUuZ2V0SFJQKCksIGFsaWFzKVxuICAgIGtwLmltcG9ydEtleShCdWZmZXIuZnJvbShcImVmOWJmMmQ0NDM2NDkxYzE1Mzk2N2M5NzA5ZGQ4ZTgyNzk1YmRiOWI1YWQ0NGVlMjJjMjkwMzAwNWQxY2Y2NzZcIiwgXCJoZXhcIikpXG5cbiAgICBjb25zdCBkZW5vbWluYXRpb246IG51bWJlciA9IDBcbiAgICBjb25zdCBhc3NldElEOiBzdHJpbmcgPSBcIjhhNWQyZDMyZTY4YmM1MDAzNmU0ZDA4NjA0NDYxN2ZlNGEwYTAyOTZiMjc0OTk5YmE1NjhlYTkyZGE0NmQ1MzNcIlxuICAgIGNvbnN0IG1pbnRlclNldHM6IG9iamVjdFtdID0gW1xuICAgICAge1xuICAgICAgICBtaW50ZXJzOiBbXG4gICAgICAgICAgXCI0cGVKc0Z2aGRuN1hqaE5GNEhXQVF5NllhSnRzMjdzOXFcIixcbiAgICAgICAgXSxcbiAgICAgICAgdGhyZXNob2xkOiAxXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBtaW50ZXJzOiBbXG4gICAgICAgICAgXCJkY0o2ejlkdUxmeVFUZ2JqcTJ3QkNvd2t2Y1BaSFZERlwiLFxuICAgICAgICAgIFwiMmZFNmlpYnFmRVJ6NXdlblhFNnF5dmluc3hEdkZoSFprXCIsXG4gICAgICAgICAgXCI3aWVBSmJmckdRYnBOWlJBUUVwWkNDMUdzMXo1Z3o0SFVcIlxuICAgICAgICBdLFxuICAgICAgICB0aHJlc2hvbGQ6IDJcbiAgICAgIH1cbiAgICBdXG5cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5jcmVhdGVWYXJpYWJsZUNhcEFzc2V0KHVzZXJuYW1lLCBwYXNzd29yZCwgXCJTb21lIENvaW5cIiwgXCJTQ0NcIiwgZGVub21pbmF0aW9uLCBtaW50ZXJTZXRzKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBhc3NldElEOiBhc3NldElELFxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKGFzc2V0SUQpXG4gIH0pXG5cbiAgdGVzdChcIm1pbnQgMVwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgdXNlcm5hbWU6IHN0cmluZyA9IFwiQ29sbGluXCJcbiAgICBjb25zdCBwYXNzd29yZDogc3RyaW5nID0gXCJDdXNjZVwiXG4gICAgY29uc3QgYW1vdW50OiBudW1iZXIgPSAyXG4gICAgY29uc3QgYXNzZXRJRDogc3RyaW5nID0gXCJmOTY2NzUwZjQzODg2N2MzYzk4MjhkZGNkYmU2NjBlMjFjY2RiYjM2YTkyNzY5NThmMDExYmE0NzJmNzVkNGU3XCJcbiAgICBjb25zdCB0bzogc3RyaW5nID0gXCJkY0o2ejlkdUxmeVFUZ2JqcTJ3QkNvd2t2Y1BaSFZERlwiXG4gICAgY29uc3QgbWludGVyczogc3RyaW5nW10gPSBbXG4gICAgICBcImRjSjZ6OWR1TGZ5UVRnYmpxMndCQ293a3ZjUFpIVkRGXCIsXG4gICAgICBcIjJmRTZpaWJxZkVSejV3ZW5YRTZxeXZpbnN4RHZGaEhaa1wiLFxuICAgICAgXCI3aWVBSmJmckdRYnBOWlJBUUVwWkNDMUdzMXo1Z3o0SFVcIlxuICAgIF1cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5taW50KHVzZXJuYW1lLCBwYXNzd29yZCwgYW1vdW50LCBhc3NldElELCB0bywgbWludGVycylcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgdHhJRDogXCJzb21ldHhcIlxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKFwic29tZXR4XCIpXG4gIH0pXG5cbiAgdGVzdChcIm1pbnQgMlwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgdXNlcm5hbWU6IHN0cmluZyA9IFwiQ29sbGluXCJcbiAgICBjb25zdCBwYXNzd29yZDogc3RyaW5nID0gXCJDdXNjZVwiXG4gICAgY29uc3QgYW1vdW50OiBCTiA9IG5ldyBCTigxKVxuICAgIGNvbnN0IGFzc2V0SUQ6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKFwiZjk2Njc1MGY0Mzg4NjdjM2M5ODI4ZGRjZGJlNjYwZTIxY2NkYmIzNmE5Mjc2OTU4ZjAxMWJhNDcyZjc1ZDRlN1wiLCBcImhleFwiKVxuICAgIGNvbnN0IHRvOiBzdHJpbmcgPSBcImRjSjZ6OWR1TGZ5UVRnYmpxMndCQ293a3ZjUFpIVkRGXCJcbiAgICBjb25zdCBtaW50ZXJzOiBzdHJpbmdbXSA9IFtcbiAgICAgIFwiZGNKNno5ZHVMZnlRVGdianEyd0JDb3drdmNQWkhWREZcIixcbiAgICAgIFwiMmZFNmlpYnFmRVJ6NXdlblhFNnF5dmluc3hEdkZoSFprXCIsXG4gICAgICBcIjdpZUFKYmZyR1FicE5aUkFRRXBaQ0MxR3MxejVnejRIVVwiXG4gICAgXVxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXBpLm1pbnQodXNlcm5hbWUsIHBhc3N3b3JkLCBhbW91bnQsIGFzc2V0SUQsIHRvLCBtaW50ZXJzKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB0eElEOiBcInNvbWV0eFwiXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUoXCJzb21ldHhcIilcbiAgfSlcblxuICB0ZXN0KFwiZ2V0VHhcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHR4aWQ6IHN0cmluZyA9IFwiZjk2Njc1MGY0Mzg4NjdjM2M5ODI4ZGRjZGJlNjYwZTIxY2NkYmIzNmE5Mjc2OTU4ZjAxMWJhNDcyZjc1ZDRlN1wiXG5cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5nZXRUeCh0eGlkKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB0eDogXCJzb21ldHhcIlxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKFwic29tZXR4XCIpXG4gIH0pXG5cblxuICB0ZXN0KFwiZ2V0VHhTdGF0dXNcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHR4aWQ6IHN0cmluZyA9IFwiZjk2Njc1MGY0Mzg4NjdjM2M5ODI4ZGRjZGJlNjYwZTIxY2NkYmIzNmE5Mjc2OTU4ZjAxMWJhNDcyZjc1ZDRlN1wiXG5cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5nZXRUeFN0YXR1cyh0eGlkKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBzdGF0dXM6IFwiYWNjZXB0ZWRcIlxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKFwiYWNjZXB0ZWRcIilcbiAgfSlcblxuICB0ZXN0KFwiZ2V0QXNzZXREZXNjcmlwdGlvbiBhcyBzdHJpbmdcIiwgYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IGFzc2V0SUQ6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKFwiOGE1ZDJkMzJlNjhiYzUwMDM2ZTRkMDg2MDQ0NjE3ZmU0YTBhMDI5NmIyNzQ5OTliYTU2OGVhOTJkYTQ2ZDUzM1wiLCBcImhleFwiKVxuICAgIGNvbnN0IGFzc2V0aWRzdHI6IHN0cmluZyA9IGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRClcblxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxvYmplY3Q+ID0gYXBpLmdldEFzc2V0RGVzY3JpcHRpb24oYXNzZXRpZHN0cilcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgbmFtZTogXCJDb2xsaW4gQ29pblwiLFxuICAgICAgICBzeW1ib2w6IFwiQ0tDXCIsXG4gICAgICAgIGFzc2V0SUQ6IGFzc2V0aWRzdHIsXG4gICAgICAgIGRlbm9taW5hdGlvbjogXCIxMFwiXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IGFueSA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UubmFtZSkudG9CZShcIkNvbGxpbiBDb2luXCIpXG4gICAgZXhwZWN0KHJlc3BvbnNlLnN5bWJvbCkudG9CZShcIkNLQ1wiKVxuICAgIGV4cGVjdChyZXNwb25zZS5hc3NldElELnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikpXG4gICAgZXhwZWN0KHJlc3BvbnNlLmRlbm9taW5hdGlvbikudG9CZSgxMClcbiAgfSlcblxuICB0ZXN0KFwiZ2V0QXNzZXREZXNjcmlwdGlvbiBhcyBCdWZmZXJcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IGFzc2V0SUQ6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKFwiOGE1ZDJkMzJlNjhiYzUwMDM2ZTRkMDg2MDQ0NjE3ZmU0YTBhMDI5NmIyNzQ5OTliYTU2OGVhOTJkYTQ2ZDUzM1wiLCBcImhleFwiKVxuICAgIGNvbnN0IGFzc2V0aWRzdHI6IHN0cmluZyA9IGJpbnRvb2xzLmNiNThFbmNvZGUoQnVmZmVyLmZyb20oXCI4YTVkMmQzMmU2OGJjNTAwMzZlNGQwODYwNDQ2MTdmZTRhMGEwMjk2YjI3NDk5OWJhNTY4ZWE5MmRhNDZkNTMzXCIsIFwiaGV4XCIpKVxuXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPG9iamVjdD4gPSBhcGkuZ2V0QXNzZXREZXNjcmlwdGlvbihhc3NldElEKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBuYW1lOiBcIkNvbGxpbiBDb2luXCIsXG4gICAgICAgIHN5bWJvbDogXCJDS0NcIixcbiAgICAgICAgYXNzZXRJRDogYXNzZXRpZHN0cixcbiAgICAgICAgZGVub21pbmF0aW9uOiBcIjExXCJcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogYW55ID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZS5uYW1lKS50b0JlKFwiQ29sbGluIENvaW5cIilcbiAgICBleHBlY3QocmVzcG9uc2Uuc3ltYm9sKS50b0JlKFwiQ0tDXCIpXG4gICAgZXhwZWN0KHJlc3BvbnNlLmFzc2V0SUQudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoYXNzZXRJRC50b1N0cmluZyhcImhleFwiKSlcbiAgICBleHBlY3QocmVzcG9uc2UuZGVub21pbmF0aW9uKS50b0JlKDExKVxuICB9KVxuXG4gIHRlc3QoXCJnZXRVVFhPc1wiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgLy8gUGF5bWVudFxuICAgIGNvbnN0IE9QVVRYT3N0cjE6IHN0cmluZyA9IGJpbnRvb2xzLmNiNThFbmNvZGUoQnVmZmVyLmZyb20oXCIwMDAwMzhkMWI5ZjExMzg2NzJkYTZmYjZjMzUxMjU1MzkyNzZhOWFjYzJhNjY4ZDYzYmVhNmJhM2M3OTVlMmVkYjBmNTAwMDAwMDAxM2UwN2UzOGUyZjIzMTIxYmU4NzU2NDEyYzE4ZGI3MjQ2YTE2ZDI2ZWU5OTM2ZjNjYmEyOGJlMTQ5Y2ZkMzU1ODAwMDAwMDA3MDAwMDAwMDAwMDAwNGRkNTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAxYTM2ZmQwYzJkYmNhYjMxMTczMWRkZTdlZjE1MTRiZDI2ZmNkYzc0ZFwiLCBcImhleFwiKSlcbiAgICBjb25zdCBPUFVUWE9zdHIyOiBzdHJpbmcgPSBiaW50b29scy5jYjU4RW5jb2RlKEJ1ZmZlci5mcm9tKFwiMDAwMGMzZTQ4MjM1NzE1ODdmZTJiZGZjNTAyNjg5ZjVhODIzOGI5ZDBlYTdmMzI3NzEyNGQxNmFmOWRlMGQyZDk5MTEwMDAwMDAwMDNlMDdlMzhlMmYyMzEyMWJlODc1NjQxMmMxOGRiNzI0NmExNmQyNmVlOTkzNmYzY2JhMjhiZTE0OWNmZDM1NTgwMDAwMDAwNzAwMDAwMDAwMDAwMDAwMTkwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMWUxYjZiNmE0YmFkOTRkMmUzZjIwNzMwMzc5YjliY2Q2ZjE3NjMxOGVcIiwgXCJoZXhcIikpXG4gICAgY29uc3QgT1BVVFhPc3RyMzogc3RyaW5nID0gYmludG9vbHMuY2I1OEVuY29kZShCdWZmZXIuZnJvbShcIjAwMDBmMjlkYmE2MWZkYThkNTdhOTExZTdmODgxMGY5MzViZGU4MTBkM2Y4ZDQ5NTQwNDY4NWJkYjhkOWQ4NTQ1ZTg2MDAwMDAwMDAzZTA3ZTM4ZTJmMjMxMjFiZTg3NTY0MTJjMThkYjcyNDZhMTZkMjZlZTk5MzZmM2NiYTI4YmUxNDljZmQzNTU4MDAwMDAwMDcwMDAwMDAwMDAwMDAwMDE5MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDFlMWI2YjZhNGJhZDk0ZDJlM2YyMDczMDM3OWI5YmNkNmYxNzYzMThlXCIsIFwiaGV4XCIpKVxuXG4gICAgY29uc3Qgc2V0OiBVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKVxuICAgIHNldC5hZGQoT1BVVFhPc3RyMSlcbiAgICBzZXQuYWRkQXJyYXkoW09QVVRYT3N0cjIsIE9QVVRYT3N0cjNdKVxuXG4gICAgY29uc3QgcGVyc2lzdE9wdHM6IFBlcnNpc3RhbmNlT3B0aW9ucyA9IG5ldyBQZXJzaXN0YW5jZU9wdGlvbnMoXCJ0ZXN0XCIsIHRydWUsIFwidW5pb25cIilcbiAgICBleHBlY3QocGVyc2lzdE9wdHMuZ2V0TWVyZ2VSdWxlKCkpLnRvQmUoXCJ1bmlvblwiKVxuICAgIGxldCBhZGRyZXNzZXM6IHN0cmluZ1tdID0gc2V0LmdldEFkZHJlc3NlcygpLm1hcCgoYSkgPT4gYXBpLmFkZHJlc3NGcm9tQnVmZmVyKGEpKVxuICAgIGxldCByZXN1bHQ6IFByb21pc2U8e1xuICAgICAgbnVtRmV0Y2hlZDogbnVtYmVyLFxuICAgICAgdXR4b3M6IFVUWE9TZXQsXG4gICAgICBlbmRJbmRleDogeyBhZGRyZXNzOiBzdHJpbmcsIHV0eG86IHN0cmluZyB9XG4gICAgfT4gPSBhcGkuZ2V0VVRYT3MoYWRkcmVzc2VzLCBhcGkuZ2V0QmxvY2tjaGFpbklEKCksIDAsIHVuZGVmaW5lZCwgcGVyc2lzdE9wdHMpXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIG51bUZldGNoZWQ6MyxcbiAgICAgICAgdXR4b3M6IFtPUFVUWE9zdHIxLCBPUFVUWE9zdHIyLCBPUFVUWE9zdHIzXSxcbiAgICAgICAgc3RvcEluZGV4OiB7YWRkcmVzczogXCJhXCIsIHV0eG86IFwiYlwifVxuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGxldCByZXNwb25zZTogVVRYT1NldCA9IChhd2FpdCByZXN1bHQpLnV0eG9zXG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShyZXNwb25zZS5nZXRBbGxVVFhPU3RyaW5ncygpLnNvcnQoKSkpLnRvQmUoSlNPTi5zdHJpbmdpZnkoc2V0LmdldEFsbFVUWE9TdHJpbmdzKCkuc29ydCgpKSlcblxuICAgIGFkZHJlc3NlcyA9IHNldC5nZXRBZGRyZXNzZXMoKS5tYXAoKGEpID0+IGFwaS5hZGRyZXNzRnJvbUJ1ZmZlcihhKSlcbiAgICByZXN1bHQgPSBhcGkuZ2V0VVRYT3MoYWRkcmVzc2VzLCBhcGkuZ2V0QmxvY2tjaGFpbklEKCksIDAsIHVuZGVmaW5lZCwgcGVyc2lzdE9wdHMpXG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIHJlc3BvbnNlID0gKGF3YWl0IHJlc3VsdCkudXR4b3NcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDIpXG4gICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlLmdldEFsbFVUWE9TdHJpbmdzKCkuc29ydCgpKSkudG9CZShKU09OLnN0cmluZ2lmeShzZXQuZ2V0QWxsVVRYT1N0cmluZ3MoKS5zb3J0KCkpKVxuICB9KVxuXG4gIGRlc2NyaWJlKFwiVHJhbnNhY3Rpb25zXCIsICgpOiB2b2lkID0+IHtcbiAgICBsZXQgc2V0OiBVVFhPU2V0XG4gICAgbGV0IGtleW1ncjI6IEtleUNoYWluXG4gICAgbGV0IGtleW1ncjM6IEtleUNoYWluXG4gICAgbGV0IGFkZHJzMTogc3RyaW5nW11cbiAgICBsZXQgYWRkcnMyOiBzdHJpbmdbXVxuICAgIGxldCBhZGRyczM6IHN0cmluZ1tdXG4gICAgbGV0IGFkZHJlc3NidWZmczogQnVmZmVyW10gPSBbXVxuICAgIGxldCBhZGRyZXNzZXM6IHN0cmluZ1tdID0gW11cbiAgICBsZXQgdXR4b3M6IFVUWE9bXVxuICAgIGxldCBpbnB1dHM6IFRyYW5zZmVyYWJsZUlucHV0W11cbiAgICBsZXQgb3V0cHV0czogVHJhbnNmZXJhYmxlT3V0cHV0W11cbiAgICBsZXQgb3BzOiBUcmFuc2ZlcmFibGVPcGVyYXRpb25bXVxuICAgIGxldCBhbW50OiBudW1iZXIgPSAxMDAwMFxuICAgIGNvbnN0IGFzc2V0SUQ6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGNyZWF0ZUhhc2goXCJzaGEyNTZcIikudXBkYXRlKFwibWFyeSBoYWQgYSBsaXR0bGUgbGFtYlwiKS5kaWdlc3QoKSlcbiAgICBjb25zdCBORlRhc3NldElEOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShjcmVhdGVIYXNoKFwic2hhMjU2XCIpLnVwZGF0ZShcIkkgY2FuJ3Qgc3RhbmQgaXQsIEkga25vdyB5b3UgcGxhbm5lZCBpdCwgSSdtbWEgc2V0IHN0cmFpZ2h0IHRoaXMgV2F0ZXJnYXRlLlwiKS5kaWdlc3QoKSlcbiAgICBsZXQgc2VjcGJhc2UxOiBTRUNQVHJhbnNmZXJPdXRwdXRcbiAgICBsZXQgc2VjcGJhc2UyOiBTRUNQVHJhbnNmZXJPdXRwdXRcbiAgICBsZXQgc2VjcGJhc2UzOiBTRUNQVHJhbnNmZXJPdXRwdXRcbiAgICBsZXQgaW5pdGlhbFN0YXRlOiBJbml0aWFsU3RhdGVzXG4gICAgbGV0IG5mdHBiYXNlMTogTkZUTWludE91dHB1dFxuICAgIGxldCBuZnRwYmFzZTI6IE5GVE1pbnRPdXRwdXRcbiAgICBsZXQgbmZ0cGJhc2UzOiBORlRNaW50T3V0cHV0XG4gICAgbGV0IG5mdEluaXRpYWxTdGF0ZTogSW5pdGlhbFN0YXRlc1xuICAgIGxldCBuZnR1dHhvaWRzOiBzdHJpbmdbXSA9IFtdXG4gICAgbGV0IGZ1bmd1dHhvaWRzOiBzdHJpbmdbXSA9IFtdXG4gICAgbGV0IGF2bTogQVZNQVBJXG4gICAgY29uc3QgZmVlOiBudW1iZXIgPSAxMFxuICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9IFwiTW9ydHljb2luIGlzIHRoZSBkdW1iIGFzIGEgc2FjayBvZiBoYW1tZXJzLlwiXG4gICAgY29uc3Qgc3ltYm9sOiBzdHJpbmcgPSBcIm1vclRcIlxuICAgIGNvbnN0IGRlbm9taW5hdGlvbjogbnVtYmVyID0gOFxuXG4gICAgbGV0IHNlY3BNaW50T3V0MTogU0VDUE1pbnRPdXRwdXRcbiAgICBsZXQgc2VjcE1pbnRPdXQyOiBTRUNQTWludE91dHB1dFxuICAgIGxldCBzZWNwTWludFRYSUQ6IEJ1ZmZlclxuICAgIGxldCBzZWNwTWludFVUWE86IFVUWE9cbiAgICBsZXQgc2VjcE1pbnRYZmVyT3V0MTogU0VDUFRyYW5zZmVyT3V0cHV0XG4gICAgbGV0IHNlY3BNaW50WGZlck91dDI6IFNFQ1BUcmFuc2Zlck91dHB1dFxuICAgIGxldCBzZWNwTWludE9wOiBTRUNQTWludE9wZXJhdGlvblxuXG4gICAgbGV0IHhmZXJzZWNwbWludG9wOiBUcmFuc2ZlcmFibGVPcGVyYXRpb25cblxuICAgIGJlZm9yZUVhY2goYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgYXZtID0gbmV3IEFWTUFQSShhdmFsYW5jaGUsIFwiL2V4dC9iYy9YXCIsIGJsb2NrY2hhaW5JRClcbiAgICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxCdWZmZXI+ID0gYXZtLmdldEFWQVhBc3NldElEKHRydWUpXG4gICAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICAgIHJlc3VsdDoge1xuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgc3ltYm9sLFxuICAgICAgICAgIGFzc2V0SUQ6IGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRCksXG4gICAgICAgICAgZGVub21pbmF0aW9uOiBkZW5vbWluYXRpb25cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcGF5bG9hZFxuICAgICAgfVxuXG4gICAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgICAgYXdhaXQgcmVzdWx0XG4gICAgICBzZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgICBhdm0ubmV3S2V5Q2hhaW4oKVxuICAgICAga2V5bWdyMiA9IG5ldyBLZXlDaGFpbihhdmFsYW5jaGUuZ2V0SFJQKCksIGFsaWFzKVxuICAgICAga2V5bWdyMyA9IG5ldyBLZXlDaGFpbihhdmFsYW5jaGUuZ2V0SFJQKCksIGFsaWFzKVxuICAgICAgYWRkcnMxID0gW11cbiAgICAgIGFkZHJzMiA9IFtdXG4gICAgICBhZGRyczMgPSBbXVxuICAgICAgdXR4b3MgPSBbXVxuICAgICAgaW5wdXRzID0gW11cbiAgICAgIG91dHB1dHMgPSBbXVxuICAgICAgb3BzID0gW11cbiAgICAgIG5mdHV0eG9pZHMgPSBbXVxuICAgICAgZnVuZ3V0eG9pZHMgPSBbXVxuICAgICAgY29uc3QgcGxvYWQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygxMDI0KVxuICAgICAgcGxvYWQud3JpdGUoXCJBbGwgeW91IFRyZWtraWVzIGFuZCBUViBhZGRpY3RzLCBEb24ndCBtZWFuIHRvIGRpc3MgZG9uJ3QgbWVhbiB0byBicmluZyBzdGF0aWMuXCIsIDAsIDEwMjQsIFwidXRmOFwiKVxuXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgIGFkZHJzMS5wdXNoKGF2bS5hZGRyZXNzRnJvbUJ1ZmZlcihhdm0ua2V5Q2hhaW4oKS5tYWtlS2V5KCkuZ2V0QWRkcmVzcygpKSlcbiAgICAgICAgYWRkcnMyLnB1c2goYXZtLmFkZHJlc3NGcm9tQnVmZmVyKGtleW1ncjIubWFrZUtleSgpLmdldEFkZHJlc3MoKSkpXG4gICAgICAgIGFkZHJzMy5wdXNoKGF2bS5hZGRyZXNzRnJvbUJ1ZmZlcihrZXltZ3IzLm1ha2VLZXkoKS5nZXRBZGRyZXNzKCkpKVxuICAgICAgfVxuICAgICAgY29uc3QgYW1vdW50OiBCTiA9IE9ORUFWQVgubXVsKG5ldyBCTihhbW50KSlcbiAgICAgIGFkZHJlc3NidWZmcyA9IGF2bS5rZXlDaGFpbigpLmdldEFkZHJlc3NlcygpXG4gICAgICBhZGRyZXNzZXMgPSBhZGRyZXNzYnVmZnMubWFwKChhKSA9PiBhdm0uYWRkcmVzc0Zyb21CdWZmZXIoYSkpXG4gICAgICBjb25zdCBsb2NrdGltZTogQk4gPSBuZXcgQk4oNTQzMjEpXG4gICAgICBjb25zdCB0aHJlc2hvbGQ6IG51bWJlciA9IDNcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgbGV0IHR4aWQ6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGNyZWF0ZUhhc2goXCJzaGEyNTZcIikudXBkYXRlKGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG5ldyBCTihpKSwgMzIpKS5kaWdlc3QoKSlcbiAgICAgICAgbGV0IHR4aWR4OiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICAgICAgdHhpZHgud3JpdGVVSW50MzJCRShpLCAwKVxuICAgICAgICBcbiAgICAgICAgY29uc3Qgb3V0OiBTRUNQVHJhbnNmZXJPdXRwdXQgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KGFtb3VudCwgYWRkcmVzc2J1ZmZzLCBsb2NrdGltZSwgdGhyZXNob2xkKVxuICAgICAgICBjb25zdCB4ZmVyb3V0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KGFzc2V0SUQsIG91dClcbiAgICAgICAgb3V0cHV0cy5wdXNoKHhmZXJvdXQpXG5cbiAgICAgICAgY29uc3QgdTogVVRYTyA9IG5ldyBVVFhPKClcbiAgICAgICAgdS5mcm9tQnVmZmVyKEJ1ZmZlci5jb25jYXQoW3UuZ2V0Q29kZWNJREJ1ZmZlcigpLCB0eGlkLCB0eGlkeCwgeGZlcm91dC50b0J1ZmZlcigpXSkpXG4gICAgICAgIGZ1bmd1dHhvaWRzLnB1c2godS5nZXRVVFhPSUQoKSlcbiAgICAgICAgdXR4b3MucHVzaCh1KVxuXG4gICAgICAgIHR4aWQgPSB1LmdldFR4SUQoKVxuICAgICAgICB0eGlkeCA9IHUuZ2V0T3V0cHV0SWR4KClcbiAgICAgICAgY29uc3QgYXNzZXQgPSB1LmdldEFzc2V0SUQoKVxuXG4gICAgICAgIGNvbnN0IGlucHV0OiBTRUNQVHJhbnNmZXJJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChhbW91bnQpXG4gICAgICAgIGNvbnN0IHhmZXJpbnB1dDogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQodHhpZCwgdHhpZHgsIGFzc2V0LCBpbnB1dClcbiAgICAgICAgaW5wdXRzLnB1c2goeGZlcmlucHV0KVxuXG4gICAgICAgIGNvbnN0IG5vdXQ6IE5GVFRyYW5zZmVyT3V0cHV0ID0gbmV3IE5GVFRyYW5zZmVyT3V0cHV0KDEwMDAgKyBpLCBwbG9hZCwgYWRkcmVzc2J1ZmZzLCBsb2NrdGltZSwgdGhyZXNob2xkKVxuICAgICAgICBjb25zdCBvcDogTkZUVHJhbnNmZXJPcGVyYXRpb24gPSBuZXcgTkZUVHJhbnNmZXJPcGVyYXRpb24obm91dClcbiAgICAgICAgY29uc3QgbmZ0dHhpZDogQnVmZmVyID0gQnVmZmVyLmZyb20oY3JlYXRlSGFzaChcInNoYTI1NlwiKS51cGRhdGUoYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobmV3IEJOKDEwMDAgKyBpKSwgMzIpKS5kaWdlc3QoKSlcbiAgICAgICAgY29uc3QgbmZ0dXR4bzogVVRYTyA9IG5ldyBVVFhPKEFWTUNvbnN0YW50cy5MQVRFU1RDT0RFQywgbmZ0dHhpZCwgMTAwMCArIGksIE5GVGFzc2V0SUQsIG5vdXQpXG4gICAgICAgIG5mdHV0eG9pZHMucHVzaChuZnR1dHhvLmdldFVUWE9JRCgpKVxuICAgICAgICBjb25zdCB4ZmVyb3A6IFRyYW5zZmVyYWJsZU9wZXJhdGlvbiA9IG5ldyBUcmFuc2ZlcmFibGVPcGVyYXRpb24oTkZUYXNzZXRJRCwgW25mdHV0eG8uZ2V0VVRYT0lEKCldLCBvcClcbiAgICAgICAgb3BzLnB1c2goeGZlcm9wKVxuICAgICAgICB1dHhvcy5wdXNoKG5mdHV0eG8pXG4gICAgICB9XG4gICAgICBzZXQuYWRkQXJyYXkodXR4b3MpXG5cbiAgICAgIHNlY3BiYXNlMSA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQobmV3IEJOKDc3NyksIGFkZHJzMy5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLCBVbml4Tm93KCksIDEpXG4gICAgICBzZWNwYmFzZTIgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KG5ldyBCTig4ODgpLCBhZGRyczIubWFwKChhKSA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSwgVW5peE5vdygpLCAxKVxuICAgICAgc2VjcGJhc2UzID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChuZXcgQk4oOTk5KSwgYWRkcnMyLm1hcCgoYSkgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSksIFVuaXhOb3coKSwgMSlcbiAgICAgIGluaXRpYWxTdGF0ZSA9IG5ldyBJbml0aWFsU3RhdGVzKClcbiAgICAgIGluaXRpYWxTdGF0ZS5hZGRPdXRwdXQoc2VjcGJhc2UxLCBBVk1Db25zdGFudHMuU0VDUEZYSUQpXG4gICAgICBpbml0aWFsU3RhdGUuYWRkT3V0cHV0KHNlY3BiYXNlMiwgQVZNQ29uc3RhbnRzLlNFQ1BGWElEKVxuICAgICAgaW5pdGlhbFN0YXRlLmFkZE91dHB1dChzZWNwYmFzZTMsIEFWTUNvbnN0YW50cy5TRUNQRlhJRClcblxuICAgICAgbmZ0cGJhc2UxID0gbmV3IE5GVE1pbnRPdXRwdXQoMCwgYWRkcnMxLm1hcChhID0+IGFwaS5wYXJzZUFkZHJlc3MoYSkpLCBsb2NrdGltZSwgMSlcbiAgICAgIG5mdHBiYXNlMiA9IG5ldyBORlRNaW50T3V0cHV0KDEsIGFkZHJzMi5tYXAoYSA9PiBhcGkucGFyc2VBZGRyZXNzKGEpKSwgbG9ja3RpbWUsIDEpXG4gICAgICBuZnRwYmFzZTMgPSBuZXcgTkZUTWludE91dHB1dCgyLCBhZGRyczMubWFwKGEgPT4gYXBpLnBhcnNlQWRkcmVzcyhhKSksIGxvY2t0aW1lLCAxKVxuICAgICAgbmZ0SW5pdGlhbFN0YXRlID0gbmV3IEluaXRpYWxTdGF0ZXMoKVxuICAgICAgbmZ0SW5pdGlhbFN0YXRlLmFkZE91dHB1dChuZnRwYmFzZTEsIEFWTUNvbnN0YW50cy5ORlRGWElEKVxuICAgICAgbmZ0SW5pdGlhbFN0YXRlLmFkZE91dHB1dChuZnRwYmFzZTIsIEFWTUNvbnN0YW50cy5ORlRGWElEKVxuICAgICAgbmZ0SW5pdGlhbFN0YXRlLmFkZE91dHB1dChuZnRwYmFzZTMsIEFWTUNvbnN0YW50cy5ORlRGWElEKVxuXG4gICAgICBzZWNwTWludE91dDEgPSBuZXcgU0VDUE1pbnRPdXRwdXQoYWRkcmVzc2J1ZmZzLCBuZXcgQk4oMCksIDEpXG4gICAgICBzZWNwTWludE91dDIgPSBuZXcgU0VDUE1pbnRPdXRwdXQoYWRkcmVzc2J1ZmZzLCBuZXcgQk4oMCksIDEpXG4gICAgICBzZWNwTWludFRYSUQgPSBCdWZmZXIuZnJvbShjcmVhdGVIYXNoKFwic2hhMjU2XCIpLnVwZGF0ZShiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihuZXcgQk4oMTMzNyksIDMyKSkuZGlnZXN0KCkpXG4gICAgICBzZWNwTWludFVUWE8gPSBuZXcgVVRYTyhBVk1Db25zdGFudHMuTEFURVNUQ09ERUMsIHNlY3BNaW50VFhJRCwgMCwgYXNzZXRJRCwgc2VjcE1pbnRPdXQxKVxuICAgICAgc2VjcE1pbnRYZmVyT3V0MSA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQobmV3IEJOKDEyMyksIGFkZHJzMy5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLCBVbml4Tm93KCksIDIpXG4gICAgICBzZWNwTWludFhmZXJPdXQyID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChuZXcgQk4oNDU2KSwgW2F2bS5wYXJzZUFkZHJlc3MoYWRkcnMyWzBdKV0sIFVuaXhOb3coKSwgMSlcbiAgICAgIHNlY3BNaW50T3AgPSBuZXcgU0VDUE1pbnRPcGVyYXRpb24oc2VjcE1pbnRPdXQxLCBzZWNwTWludFhmZXJPdXQxKVxuXG4gICAgICBzZXQuYWRkKHNlY3BNaW50VVRYTylcblxuICAgICAgeGZlcnNlY3BtaW50b3AgPSBuZXcgVHJhbnNmZXJhYmxlT3BlcmF0aW9uKGFzc2V0SUQsIFtzZWNwTWludFVUWE8uZ2V0VVRYT0lEKCldLCBzZWNwTWludE9wKVxuXG4gICAgfSlcblxuICAgIHRlc3QoXCJzaWduVHhcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgY29uc3QgdHh1MTogVW5zaWduZWRUeCA9IGF3YWl0IGF2bS5idWlsZEJhc2VUeChzZXQsIG5ldyBCTihhbW50KSwgYmludG9vbHMuY2I1OEVuY29kZShhc3NldElEKSwgYWRkcnMzLCBhZGRyczEsIGFkZHJzMSlcbiAgICAgIGNvbnN0IHR4dTI6IFVuc2lnbmVkVHggPSBzZXQuYnVpbGRCYXNlVHgoXG4gICAgICAgIG5ldHdvcmtJRCwgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLCBuZXcgQk4oYW1udCksIGFzc2V0SUQsXG4gICAgICAgIGFkZHJzMy5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLFxuICAgICAgICBhZGRyczEubWFwKChhKSA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSxcbiAgICAgICAgYWRkcnMxLm1hcCgoYSkgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSksXG4gICAgICAgIGF2bS5nZXRUeEZlZSgpLCBhc3NldElELFxuICAgICAgICB1bmRlZmluZWQsIFVuaXhOb3coKSwgbmV3IEJOKDApLCAxLFxuICAgICAgKVxuXG4gICAgICBjb25zdCB0eDE6IFR4ID0gYXZtLnNpZ25UeCh0eHUxKVxuICAgICAgY29uc3QgdHgyOiBUeCA9IGF2bS5zaWduVHgodHh1MilcblxuICAgICAgZXhwZWN0KHR4Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKHR4MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKVxuICAgICAgZXhwZWN0KHR4Mi50b1N0cmluZygpKS50b0JlKHR4MS50b1N0cmluZygpKVxuICAgIH0pXG5cbiAgICB0ZXN0KFwiYnVpbGRCYXNlVHgxXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGNvbnN0IHR4dTE6IFVuc2lnbmVkVHggPSBhd2FpdCBhdm0uYnVpbGRCYXNlVHgoc2V0LCBuZXcgQk4oYW1udCksIGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRCksIGFkZHJzMywgYWRkcnMxLCBhZGRyczEsIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldENvbnRlbnQoKSlcbiAgICAgIGNvbnN0IG1lbW9idWY6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKFwiaGVsbG8gd29ybGRcIilcbiAgICAgIGNvbnN0IHR4dTI6IFVuc2lnbmVkVHggPSBzZXQuYnVpbGRCYXNlVHgoXG4gICAgICAgIG5ldHdvcmtJRCwgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLCBuZXcgQk4oYW1udCksIGFzc2V0SUQsXG4gICAgICAgIGFkZHJzMy5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLFxuICAgICAgICBhZGRyczEubWFwKChhKSA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSxcbiAgICAgICAgYWRkcnMxLm1hcCgoYSkgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSksXG4gICAgICAgIGF2bS5nZXRUeEZlZSgpLCBhc3NldElELFxuICAgICAgICAgbWVtb2J1ZiwgVW5peE5vdygpLCBuZXcgQk4oMCksIDEsXG4gICAgICApXG4gICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKHR4dTEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSlcbiAgICAgIGV4cGVjdCh0eHUyLnRvU3RyaW5nKCkpLnRvQmUodHh1MS50b1N0cmluZygpKVxuXG4gICAgICBjb25zdCB0eDE6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgY2hlY2tUeDogc3RyaW5nID0gdHgxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MW9iajogb2JqZWN0ID0gdHgxLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgxc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDFvYmopXG4gICAgICBjb25zdCB0eDJuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgxc3RyKVxuICAgICAgY29uc3QgdHgyOiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDIuZGVzZXJpYWxpemUodHgybmV3b2JqLCBcImhleFwiKVxuXG4gICAgICBjb25zdCB0eDJvYmo6IG9iamVjdCA9IHR4Mi5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MnN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgyb2JqKVxuICAgICAgZXhwZWN0KHR4MW9iaikudG9TdHJpY3RFcXVhbCh0eDJvYmopXG4gICAgICBleHBlY3QodHgxc3RyKS50b1N0cmljdEVxdWFsKHR4MnN0cilcbiAgICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBjb25zdCB0eDM6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgdHgzb2JqOiBvYmplY3QgPSB0eDMuc2VyaWFsaXplKGRpc3BsYXkpXG4gICAgICBjb25zdCB0eDNzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4M29iailcbiAgICAgIGNvbnN0IHR4NG5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDNzdHIpXG4gICAgICBjb25zdCB0eDQ6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4NC5kZXNlcmlhbGl6ZSh0eDRuZXdvYmosIGRpc3BsYXkpXG5cbiAgICAgIGNvbnN0IHR4NG9iajogb2JqZWN0ID0gdHg0LnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHg0c3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDRvYmopXG4gICAgICBleHBlY3QodHgzb2JqKS50b1N0cmljdEVxdWFsKHR4NG9iailcbiAgICAgIGV4cGVjdCh0eDNzdHIpLnRvU3RyaWN0RXF1YWwodHg0c3RyKVxuICAgICAgZXhwZWN0KHR4NC50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG4gICAgfSlcblxuICAgIHRlc3QoXCJidWlsZEJhc2VUeDJcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgY29uc3QgdHh1MTogVW5zaWduZWRUeCA9IGF3YWl0IGF2bS5idWlsZEJhc2VUeChcbiAgICAgICAgc2V0LCBuZXcgQk4oYW1udCkuc3ViKG5ldyBCTigxMDApKSwgYmludG9vbHMuY2I1OEVuY29kZShhc3NldElEKSwgXG4gICAgICAgIGFkZHJzMywgYWRkcnMxLCBhZGRyczIsIFxuICAgICAgICBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKSlcbiAgICAgIGNvbnN0IHR4dTI6IFVuc2lnbmVkVHggPSBzZXQuYnVpbGRCYXNlVHgoXG4gICAgICAgIG5ldHdvcmtJRCwgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLCBuZXcgQk4oYW1udCkuc3ViKG5ldyBCTigxMDApKSwgYXNzZXRJRCxcbiAgICAgICAgYWRkcnMzLm1hcCgoYSk6IEJ1ZmZlciA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSxcbiAgICAgICAgYWRkcnMxLm1hcCgoYSk6IEJ1ZmZlciA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSxcbiAgICAgICAgYWRkcnMyLm1hcCgoYSk6IEJ1ZmZlciA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSxcbiAgICAgICAgYXZtLmdldFR4RmVlKCksIGFzc2V0SUQsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSwgVW5peE5vdygpLCBuZXcgQk4oMCksIDEsXG4gICAgICApXG5cbiAgICAgIGV4cGVjdCh0eHUyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUodHh1MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKVxuICAgICAgZXhwZWN0KHR4dTIudG9TdHJpbmcoKSkudG9CZSh0eHUxLnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IG91dGllcyA9IHR4dTEuZ2V0VHJhbnNhY3Rpb24oKS5nZXRPdXRzKCkuc29ydChUcmFuc2ZlcmFibGVPdXRwdXQuY29tcGFyYXRvcigpKSBhcyBUcmFuc2ZlcmFibGVPdXRwdXRbXVxuXG4gICAgICBleHBlY3Qob3V0aWVzLmxlbmd0aCkudG9CZSgyKVxuICAgICAgY29uc3Qgb3V0YWRkcjAgPSBvdXRpZXNbMF0uZ2V0T3V0cHV0KCkuZ2V0QWRkcmVzc2VzKCkubWFwKChhKSA9PiBhdm0uYWRkcmVzc0Zyb21CdWZmZXIoYSkpXG4gICAgICBjb25zdCBvdXRhZGRyMSA9IG91dGllc1sxXS5nZXRPdXRwdXQoKS5nZXRBZGRyZXNzZXMoKS5tYXAoKGEpID0+IGF2bS5hZGRyZXNzRnJvbUJ1ZmZlcihhKSlcblxuICAgICAgY29uc3QgdGVzdGFkZHIyID0gSlNPTi5zdHJpbmdpZnkoYWRkcnMyLnNvcnQoKSlcbiAgICAgIGNvbnN0IHRlc3RhZGRyMyA9IEpTT04uc3RyaW5naWZ5KGFkZHJzMy5zb3J0KCkpXG5cbiAgICAgIGNvbnN0IHRlc3RvdXQwID0gSlNPTi5zdHJpbmdpZnkob3V0YWRkcjAuc29ydCgpKVxuICAgICAgY29uc3QgdGVzdG91dDEgPSBKU09OLnN0cmluZ2lmeShvdXRhZGRyMS5zb3J0KCkpXG4gICAgICBleHBlY3QoXG4gICAgICAgICh0ZXN0YWRkcjIgPT0gdGVzdG91dDAgJiYgdGVzdGFkZHIzID09IHRlc3RvdXQxKVxuICAgICAgICB8fCAodGVzdGFkZHIzID09IHRlc3RvdXQwICYmIHRlc3RhZGRyMiA9PSB0ZXN0b3V0MSksXG4gICAgICApLnRvQmUodHJ1ZSlcblxuICAgICAgY29uc3QgdHgxOiBUeCA9IHR4dTEuc2lnbihhdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IGNoZWNrVHg6IHN0cmluZyA9IHR4MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDFvYmo6IG9iamVjdCA9IHR4MS5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MXN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgxb2JqKVxuICAgICAgY29uc3QgdHgybmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4MXN0cilcbiAgICAgIGNvbnN0IHR4MjogVHggPSBuZXcgVHgoKVxuICAgICAgdHgyLmRlc2VyaWFsaXplKHR4Mm5ld29iaiwgXCJoZXhcIilcblxuICAgICAgY29uc3QgdHgyb2JqOiBvYmplY3QgPSB0eDIuc2VyaWFsaXplKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDJzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4Mm9iailcbiAgICAgIGV4cGVjdCh0eDFvYmopLnRvU3RyaWN0RXF1YWwodHgyb2JqKVxuICAgICAgZXhwZWN0KHR4MXN0cikudG9TdHJpY3RFcXVhbCh0eDJzdHIpXG4gICAgICBleHBlY3QodHgyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoY2hlY2tUeClcblxuICAgICAgY29uc3QgdHgzOiBUeCA9IHR4dTEuc2lnbihhdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IHR4M29iajogb2JqZWN0ID0gdHgzLnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHgzc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDNvYmopXG4gICAgICBjb25zdCB0eDRuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgzc3RyKVxuICAgICAgY29uc3QgdHg0OiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDQuZGVzZXJpYWxpemUodHg0bmV3b2JqLCBkaXNwbGF5KVxuXG4gICAgICBjb25zdCB0eDRvYmo6IG9iamVjdCA9IHR4NC5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4NHN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHg0b2JqKVxuICAgICAgZXhwZWN0KHR4M29iaikudG9TdHJpY3RFcXVhbCh0eDRvYmopXG4gICAgICBleHBlY3QodHgzc3RyKS50b1N0cmljdEVxdWFsKHR4NHN0cilcbiAgICAgIGV4cGVjdCh0eDQudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBzZXJpYWx6ZWl0KHR4MSwgXCJCYXNlVHhcIilcbiAgICB9KVxuXG4gICAgdGVzdChcImlzc3VlVHggU2VyaWFsaXplZFwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBjb25zdCB0eHU6IFVuc2lnbmVkVHggPSBhd2FpdCBhdm0uYnVpbGRCYXNlVHgoc2V0LCBuZXcgQk4oYW1udCksIGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRCksIGFkZHJzMywgYWRkcnMxLCBhZGRyczEpXG4gICAgICBjb25zdCB0eCA9IGF2bS5zaWduVHgodHh1KVxuICAgICAgY29uc3QgdHhpZDogc3RyaW5nID0gXCJmOTY2NzUwZjQzODg2N2MzYzk4MjhkZGNkYmU2NjBlMjFjY2RiYjM2YTkyNzY5NThmMDExYmE0NzJmNzVkNGU3XCJcblxuICAgICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhdm0uaXNzdWVUeCh0eC50b1N0cmluZygpKVxuICAgICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgICByZXN1bHQ6IHtcbiAgICAgICAgICB0eElEOiB0eGlkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHBheWxvYWRcbiAgICAgIH1cbiAgICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSh0eGlkKVxuICAgIH0pXG5cbiAgICB0ZXN0KFwiaXNzdWVUeCBCdWZmZXJcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgY29uc3QgdHh1OiBVbnNpZ25lZFR4ID0gYXdhaXQgYXZtLmJ1aWxkQmFzZVR4KHNldCwgbmV3IEJOKGFtbnQpLCBiaW50b29scy5jYjU4RW5jb2RlKGFzc2V0SUQpLCBhZGRyczMsIGFkZHJzMSwgYWRkcnMxKVxuICAgICAgY29uc3QgdHggPSBhdm0uc2lnblR4KHR4dSlcblxuICAgICAgY29uc3QgdHhpZDogc3RyaW5nID0gXCJmOTY2NzUwZjQzODg2N2MzYzk4MjhkZGNkYmU2NjBlMjFjY2RiYjM2YTkyNzY5NThmMDExYmE0NzJmNzVkNGU3XCJcbiAgICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXZtLmlzc3VlVHgodHgudG9CdWZmZXIoKSlcbiAgICAgIGNvbnN0IHBheWxvYWQ6b2JqZWN0ID0ge1xuICAgICAgICByZXN1bHQ6IHtcbiAgICAgICAgICB0eElEOiB0eGlkXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHBheWxvYWRcbiAgICAgIH1cblxuICAgICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHR4aWQpXG4gICAgfSlcbiAgICB0ZXN0KFwiaXNzdWVUeCBDbGFzcyBUeFwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBjb25zdCB0eHU6IFVuc2lnbmVkVHggPSBhd2FpdCBhdm0uYnVpbGRCYXNlVHgoc2V0LCBuZXcgQk4oYW1udCksIGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRCksIGFkZHJzMywgYWRkcnMxLCBhZGRyczEpXG4gICAgICBjb25zdCB0eCA9IGF2bS5zaWduVHgodHh1KVxuXG4gICAgICBjb25zdCB0eGlkOiBzdHJpbmcgPSBcImY5NjY3NTBmNDM4ODY3YzNjOTgyOGRkY2RiZTY2MGUyMWNjZGJiMzZhOTI3Njk1OGYwMTFiYTQ3MmY3NWQ0ZTdcIlxuXG4gICAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGF2bS5pc3N1ZVR4KHR4KVxuICAgICAgY29uc3QgcGF5bG9hZDpvYmplY3QgPSB7XG4gICAgICAgIHJlc3VsdDoge1xuICAgICAgICAgIHR4SUQ6IHR4aWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcGF5bG9hZFxuICAgICAgfVxuXG4gICAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuICAgICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHR4aWQpXG4gICAgfSlcblxuICAgIHRlc3QoXCJidWlsZENyZWF0ZUFzc2V0VHggLSBGaXhlZCBDYXBcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgYXZtLnNldENyZWF0aW9uVHhGZWUobmV3IEJOKGZlZSkpXG4gICAgICBjb25zdCB0eHUxOlVuc2lnbmVkVHggPSBhd2FpdCBhdm0uYnVpbGRDcmVhdGVBc3NldFR4KFxuICAgICAgICBzZXQsIFxuICAgICAgICBhZGRyczEsIFxuICAgICAgICBhZGRyczIsXG4gICAgICAgIGluaXRpYWxTdGF0ZSwgXG4gICAgICAgIG5hbWUsIFxuICAgICAgICBzeW1ib2wsIFxuICAgICAgICBkZW5vbWluYXRpb25cbiAgICAgIClcbiAgXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkQ3JlYXRlQXNzZXRUeChcbiAgICAgICAgYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpLCBcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShhdm0uZ2V0QmxvY2tjaGFpbklEKCkpLCBcbiAgICAgICAgYWRkcnMxLm1hcCgoYSkgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSksIFxuICAgICAgICBhZGRyczIubWFwKChhKSA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSwgXG4gICAgICAgIGluaXRpYWxTdGF0ZSwgXG4gICAgICAgIG5hbWUsIFxuICAgICAgICBzeW1ib2wsIFxuICAgICAgICBkZW5vbWluYXRpb24sXG4gICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgYXZtLmdldENyZWF0aW9uVHhGZWUoKSxcbiAgICAgICAgYXNzZXRJRFxuICAgICAgKVxuXG4gICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKHR4dTEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSlcbiAgICAgIGV4cGVjdCh0eHUyLnRvU3RyaW5nKCkpLnRvQmUodHh1MS50b1N0cmluZygpKVxuXG4gICAgICBjb25zdCB0eDE6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgY2hlY2tUeDogc3RyaW5nID0gdHgxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MW9iajogb2JqZWN0ID0gdHgxLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgxc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDFvYmopXG4gICAgICBjb25zdCB0eDJuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgxc3RyKVxuICAgICAgY29uc3QgdHgyOiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDIuZGVzZXJpYWxpemUodHgybmV3b2JqLCBcImhleFwiKVxuXG4gICAgICBjb25zdCB0eDJvYmo6b2JqZWN0ID0gdHgyLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgyc3RyOnN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4Mm9iailcbiAgICAgIGV4cGVjdCh0eDFvYmopLnRvU3RyaWN0RXF1YWwodHgyb2JqKVxuICAgICAgZXhwZWN0KHR4MXN0cikudG9TdHJpY3RFcXVhbCh0eDJzdHIpXG4gICAgICBleHBlY3QodHgyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoY2hlY2tUeClcblxuICAgICAgY29uc3QgdHgzOiBUeCA9IHR4dTEuc2lnbihhdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IHR4M29iajogb2JqZWN0ID0gdHgzLnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHgzc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDNvYmopXG4gICAgICBjb25zdCB0eDRuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgzc3RyKVxuICAgICAgY29uc3QgdHg0OiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDQuZGVzZXJpYWxpemUodHg0bmV3b2JqLCBkaXNwbGF5KVxuXG4gICAgICBjb25zdCB0eDRvYmo6IG9iamVjdCA9IHR4NC5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4NHN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHg0b2JqKVxuICAgICAgZXhwZWN0KHR4M29iaikudG9TdHJpY3RFcXVhbCh0eDRvYmopXG4gICAgICBleHBlY3QodHgzc3RyKS50b1N0cmljdEVxdWFsKHR4NHN0cilcbiAgICAgIGV4cGVjdCh0eDQudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuICAgICAgc2VyaWFsemVpdCh0eDEsIFwiQ3JlYXRlQXNzZXRUeFwiKVxuICAgIH0pXG5cbiAgICB0ZXN0KFwiYnVpbGRDcmVhdGVBc3NldFR4IC0gVmFyaWFibGUgQ2FwXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGF2bS5zZXRDcmVhdGlvblR4RmVlKG5ldyBCTihEZWZhdWx0cy5uZXR3b3JrWzEyMzQ1XS5QW1wiY3JlYXRpb25UeEZlZVwiXSkpXG4gICAgICBjb25zdCBtaW50T3V0cHV0czogU0VDUE1pbnRPdXRwdXRbXSA9IFtzZWNwTWludE91dDEsIHNlY3BNaW50T3V0Ml1cbiAgICAgIGNvbnN0IHR4dTE6IFVuc2lnbmVkVHggPSBhd2FpdCBhdm0uYnVpbGRDcmVhdGVBc3NldFR4KFxuICAgICAgICBzZXQsIFxuICAgICAgICBhZGRyczEsIFxuICAgICAgICBhZGRyczIsXG4gICAgICAgIGluaXRpYWxTdGF0ZSwgXG4gICAgICAgIG5hbWUsIFxuICAgICAgICBzeW1ib2wsIFxuICAgICAgICBkZW5vbWluYXRpb24sXG4gICAgICAgIG1pbnRPdXRwdXRzXG4gICAgICApXG4gIFxuICAgICAgY29uc3QgdHh1MjogVW5zaWduZWRUeCA9IHNldC5idWlsZENyZWF0ZUFzc2V0VHgoXG4gICAgICAgIGF2YWxhbmNoZS5nZXROZXR3b3JrSUQoKSwgXG4gICAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoYXZtLmdldEJsb2NrY2hhaW5JRCgpKSwgXG4gICAgICAgIGFkZHJzMS5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLCBcbiAgICAgICAgYWRkcnMyLm1hcCgoYSkgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSksIFxuICAgICAgICBpbml0aWFsU3RhdGUsIFxuICAgICAgICBuYW1lLCBcbiAgICAgICAgc3ltYm9sLCBcbiAgICAgICAgZGVub21pbmF0aW9uLFxuICAgICAgICBtaW50T3V0cHV0cyxcbiAgICAgICAgYXZtLmdldENyZWF0aW9uVHhGZWUoKSxcbiAgICAgICAgYXNzZXRJRFxuICAgICAgKVxuXG4gICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKHR4dTEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSlcbiAgICAgIGV4cGVjdCh0eHUyLnRvU3RyaW5nKCkpLnRvQmUodHh1MS50b1N0cmluZygpKVxuXG4gICAgICBjb25zdCB0eDE6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgY2hlY2tUeDogc3RyaW5nID0gdHgxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MW9iajogb2JqZWN0ID0gdHgxLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgxc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDFvYmopXG4gICAgICBjb25zdCB0eDJuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgxc3RyKVxuICAgICAgY29uc3QgdHgyOiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDIuZGVzZXJpYWxpemUodHgybmV3b2JqLCBcImhleFwiKVxuXG4gICAgICBjb25zdCB0eDJvYmo6IG9iamVjdCA9IHR4Mi5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MnN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgyb2JqKVxuICAgICAgZXhwZWN0KHR4MW9iaikudG9TdHJpY3RFcXVhbCh0eDJvYmopXG4gICAgICBleHBlY3QodHgxc3RyKS50b1N0cmljdEVxdWFsKHR4MnN0cilcbiAgICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBjb25zdCB0eDM6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgdHgzb2JqOiBvYmplY3QgPSB0eDMuc2VyaWFsaXplKGRpc3BsYXkpXG4gICAgICBjb25zdCB0eDNzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4M29iailcbiAgICAgIGNvbnN0IHR4NG5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDNzdHIpXG4gICAgICBjb25zdCB0eDQ6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4NC5kZXNlcmlhbGl6ZSh0eDRuZXdvYmosIGRpc3BsYXkpXG5cbiAgICAgIGNvbnN0IHR4NG9iajogb2JqZWN0ID0gdHg0LnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHg0c3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDRvYmopXG4gICAgICBleHBlY3QodHgzb2JqKS50b1N0cmljdEVxdWFsKHR4NG9iailcbiAgICAgIGV4cGVjdCh0eDNzdHIpLnRvU3RyaWN0RXF1YWwodHg0c3RyKVxuICAgICAgZXhwZWN0KHR4NC50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG4gICAgfSlcblxuICAgIHRlc3QoXCJidWlsZFNFQ1BNaW50VHhcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgYXZtLnNldFR4RmVlKG5ldyBCTihmZWUpKVxuICAgICAgY29uc3QgbmV3TWludGVyOiBTRUNQTWludE91dHB1dCA9IG5ldyBTRUNQTWludE91dHB1dChhZGRyczMubWFwKChhKSA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSwgbmV3IEJOKDApLCAxKVxuICAgICAgY29uc3QgdHh1MTogVW5zaWduZWRUeCA9IGF3YWl0IGF2bS5idWlsZFNFQ1BNaW50VHgoXG4gICAgICAgIHNldCwgXG4gICAgICAgIG5ld01pbnRlcixcbiAgICAgICAgc2VjcE1pbnRYZmVyT3V0MSxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczIsXG4gICAgICAgIHNlY3BNaW50VVRYTy5nZXRVVFhPSUQoKVxuICAgICAgKVxuICBcbiAgICAgIGNvbnN0IHR4dTI6IFVuc2lnbmVkVHggPSBzZXQuYnVpbGRTRUNQTWludFR4KFxuICAgICAgICBhdmFsYW5jaGUuZ2V0TmV0d29ya0lEKCksIFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKGF2bS5nZXRCbG9ja2NoYWluSUQoKSksXG4gICAgICAgIG5ld01pbnRlcixcbiAgICAgICAgc2VjcE1pbnRYZmVyT3V0MSxcbiAgICAgICAgYWRkcnMxLm1hcCgoYSkgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSksIFxuICAgICAgICBhZGRyczIubWFwKChhKSA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSwgXG4gICAgICAgIHNlY3BNaW50VVRYTy5nZXRVVFhPSUQoKSxcbiAgICAgICAgYXZtLmdldFR4RmVlKCksIGFzc2V0SURcbiAgICAgIClcblxuICAgICAgZXhwZWN0KHR4dTIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZSh0eHUxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpXG4gICAgICBleHBlY3QodHh1Mi50b1N0cmluZygpKS50b0JlKHR4dTEudG9TdHJpbmcoKSlcblxuICAgICAgY29uc3QgdHgxOiBUeCA9IHR4dTEuc2lnbihhdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IGNoZWNrVHg6IHN0cmluZyA9IHR4MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDFvYmo6IG9iamVjdCA9IHR4MS5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MXN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgxb2JqKVxuICAgICAgY29uc3QgdHgybmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4MXN0cilcbiAgICAgIGNvbnN0IHR4MjogVHggPSBuZXcgVHgoKVxuICAgICAgdHgyLmRlc2VyaWFsaXplKHR4Mm5ld29iaiwgXCJoZXhcIilcblxuICAgICAgY29uc3QgdHgyb2JqOm9iamVjdCA9IHR4Mi5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MnN0cjpzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDJvYmopXG4gICAgICBleHBlY3QodHgxb2JqKS50b1N0cmljdEVxdWFsKHR4Mm9iailcbiAgICAgIGV4cGVjdCh0eDFzdHIpLnRvU3RyaWN0RXF1YWwodHgyc3RyKVxuICAgICAgZXhwZWN0KHR4Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG5cbiAgICAgIGNvbnN0IHR4MzogVHggPSB0eHUxLnNpZ24oYXZtLmtleUNoYWluKCkpXG4gICAgICBjb25zdCB0eDNvYmo6IG9iamVjdCA9IHR4My5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4M3N0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgzb2JqKVxuICAgICAgY29uc3QgdHg0bmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4M3N0cilcbiAgICAgIGNvbnN0IHR4NDogVHggPSBuZXcgVHgoKVxuICAgICAgdHg0LmRlc2VyaWFsaXplKHR4NG5ld29iaiwgZGlzcGxheSlcblxuICAgICAgY29uc3QgdHg0b2JqOm9iamVjdCA9IHR4NC5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4NHN0cjpzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDRvYmopXG4gICAgICBleHBlY3QodHgzb2JqKS50b1N0cmljdEVxdWFsKHR4NG9iailcbiAgICAgIGV4cGVjdCh0eDNzdHIpLnRvU3RyaWN0RXF1YWwodHg0c3RyKVxuICAgICAgZXhwZWN0KHR4NC50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG4gICAgICBzZXJpYWx6ZWl0KHR4MSwgXCJTRUNQTWludFR4XCIpXG4gICAgfSlcblxuICAgIHRlc3QoXCJidWlsZENyZWF0ZU5GVEFzc2V0VHhcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgYXZtLnNldENyZWF0aW9uVHhGZWUobmV3IEJOKERlZmF1bHRzLm5ldHdvcmtbMTIzNDVdLlBbXCJjcmVhdGlvblR4RmVlXCJdKSlcbiAgICAgIGNvbnN0IG1pbnRlclNldHM6IE1pbnRlclNldFtdID0gW25ldyBNaW50ZXJTZXQoMSwgYWRkcnMxKV1cbiAgICAgIGNvbnN0IGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKVxuXG4gICAgICBjb25zdCB0eHUxOiBVbnNpZ25lZFR4ID0gYXdhaXQgYXZtLmJ1aWxkQ3JlYXRlTkZUQXNzZXRUeChcbiAgICAgICAgc2V0LCBhZGRyczEsIGFkZHJzMiwgbWludGVyU2V0cyxcbiAgICAgICAgbmFtZSwgc3ltYm9sLCBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKSwgVW5peE5vdygpLCBsb2NrdGltZVxuICAgICAgKVxuICAgICAgXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkQ3JlYXRlTkZUQXNzZXRUeChcbiAgICAgICAgYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpLCBiaW50b29scy5jYjU4RGVjb2RlKGF2bS5nZXRCbG9ja2NoYWluSUQoKSksXG4gICAgICAgIGFkZHJzMS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKSwgYWRkcnMyLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpLCBtaW50ZXJTZXRzLFxuICAgICAgICBuYW1lLCBzeW1ib2wsIGF2bS5nZXRDcmVhdGlvblR4RmVlKCksIGFzc2V0SUQsIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSwgVW5peE5vdygpLCBsb2NrdGltZVxuICAgICAgKVxuXG4gICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKHR4dTEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSlcbiAgICAgIGV4cGVjdCh0eHUyLnRvU3RyaW5nKCkpLnRvQmUodHh1MS50b1N0cmluZygpKVxuXG4gICAgICBjb25zdCB0eDE6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgY2hlY2tUeDogc3RyaW5nID0gdHgxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MW9iajogb2JqZWN0ID0gdHgxLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgxc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDFvYmopXG4gICAgICBjb25zdCB0eDJuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgxc3RyKVxuICAgICAgY29uc3QgdHgyOiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDIuZGVzZXJpYWxpemUodHgybmV3b2JqLCBcImhleFwiKVxuXG4gICAgICBjb25zdCB0eDJvYmo6IG9iamVjdCA9IHR4Mi5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MnN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgyb2JqKVxuICAgICAgZXhwZWN0KHR4MW9iaikudG9TdHJpY3RFcXVhbCh0eDJvYmopXG4gICAgICBleHBlY3QodHgxc3RyKS50b1N0cmljdEVxdWFsKHR4MnN0cilcbiAgICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBjb25zdCB0eDM6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgdHgzb2JqOiBvYmplY3QgPSB0eDMuc2VyaWFsaXplKGRpc3BsYXkpXG4gICAgICBjb25zdCB0eDNzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4M29iailcbiAgICAgIGNvbnN0IHR4NG5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDNzdHIpXG4gICAgICBjb25zdCB0eDQ6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4NC5kZXNlcmlhbGl6ZSh0eDRuZXdvYmosIGRpc3BsYXkpXG5cbiAgICAgIGNvbnN0IHR4NG9iajogb2JqZWN0ID0gdHg0LnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHg0c3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDRvYmopXG4gICAgICBleHBlY3QodHgzb2JqKS50b1N0cmljdEVxdWFsKHR4NG9iailcbiAgICAgIGV4cGVjdCh0eDNzdHIpLnRvU3RyaWN0RXF1YWwodHg0c3RyKVxuICAgICAgZXhwZWN0KHR4NC50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG4gICAgICBzZXJpYWx6ZWl0KHR4MSwgXCJDcmVhdGVORlRBc3NldFR4XCIpXG4gICAgfSlcblxuICAgIHRlc3QoXCJidWlsZENyZWF0ZU5GVE1pbnRUeFwiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBhdm0uc2V0VHhGZWUobmV3IEJOKGZlZSkpXG4gICAgICBjb25zdCBncm91cElEOiBudW1iZXIgPSAwXG4gICAgICBjb25zdCBsb2NrdGltZTogQk4gPSBuZXcgQk4oMClcbiAgICAgIGNvbnN0IHRocmVzaG9sZDogbnVtYmVyID0gMVxuICAgICAgY29uc3QgcGF5bG9hZDogQnVmZmVyID0gQnVmZmVyLmZyb20oXCJBdmFsYW5jaGVcIilcbiAgICAgIGNvbnN0IGFkZHJidWZmMTogQnVmZmVyW10gPSBhZGRyczEubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGFkZHJidWZmMjogQnVmZmVyW10gPSBhZGRyczIubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGFkZHJidWZmMzogQnVmZmVyW10gPSBhZGRyczMubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IG91dHB1dE93bmVyczogT3V0cHV0T3duZXJzW10gPSBbXVxuICAgICAgY29uc3Qgb286IE91dHB1dE93bmVycyA9IG5ldyBPdXRwdXRPd25lcnMoYWRkcmJ1ZmYzLCBsb2NrdGltZSwgdGhyZXNob2xkKVxuICAgICAgb3V0cHV0T3duZXJzLnB1c2goKVxuICAgICAgIFxuICAgICAgY29uc3QgdHh1MTogVW5zaWduZWRUeCA9IGF3YWl0IGF2bS5idWlsZENyZWF0ZU5GVE1pbnRUeChcbiAgICAgICAgc2V0LCBvbywgYWRkcnMxLCBhZGRyczIsIG5mdHV0eG9pZHMsIGdyb3VwSUQsIHBheWxvYWQsXG4gICAgICAgIHVuZGVmaW5lZCwgVW5peE5vdygpXG4gICAgICApXG5cbiAgICAgIGNvbnN0IHR4dTI6IFVuc2lnbmVkVHggPSBzZXQuYnVpbGRDcmVhdGVORlRNaW50VHgoXG4gICAgICAgIGF2YWxhbmNoZS5nZXROZXR3b3JrSUQoKSwgYmludG9vbHMuY2I1OERlY29kZShhdm0uZ2V0QmxvY2tjaGFpbklEKCkpLFxuICAgICAgICBbb29dLCBhZGRyYnVmZjEsIGFkZHJidWZmMiwgbmZ0dXR4b2lkcywgZ3JvdXBJRCwgcGF5bG9hZCxcbiAgICAgICAgYXZtLmdldFR4RmVlKCksIGFzc2V0SUQsIHVuZGVmaW5lZCwgVW5peE5vdygpXG4gICAgICApXG5cbiAgICAgIGV4cGVjdCh0eHUyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUodHh1MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKVxuICAgICAgZXhwZWN0KHR4dTIudG9TdHJpbmcoKSkudG9CZSh0eHUxLnRvU3RyaW5nKCkpXG5cbiAgICAgIG91dHB1dE93bmVycy5wdXNoKG9vKVxuICAgICAgb3V0cHV0T3duZXJzLnB1c2gobmV3IE91dHB1dE93bmVycyhhZGRyYnVmZjMsIGxvY2t0aW1lLCB0aHJlc2hvbGQgKyAxKSlcblxuICAgICAgY29uc3QgdHh1MzogVW5zaWduZWRUeCA9IGF3YWl0IGF2bS5idWlsZENyZWF0ZU5GVE1pbnRUeChcbiAgICAgICAgc2V0LCBvdXRwdXRPd25lcnMsIGFkZHJzMSwgYWRkcnMyLCBuZnR1dHhvaWRzLCBncm91cElELCBwYXlsb2FkLCBcbiAgICAgICAgdW5kZWZpbmVkLCBVbml4Tm93KClcbiAgICAgIClcblxuICAgICAgY29uc3QgdHh1NDogVW5zaWduZWRUeCA9IHNldC5idWlsZENyZWF0ZU5GVE1pbnRUeChcbiAgICAgICAgYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpLCBiaW50b29scy5jYjU4RGVjb2RlKGF2bS5nZXRCbG9ja2NoYWluSUQoKSksIFxuICAgICAgICBvdXRwdXRPd25lcnMsIGFkZHJidWZmMSwgYWRkcmJ1ZmYyLCBuZnR1dHhvaWRzLCBncm91cElELCBwYXlsb2FkLCBcbiAgICAgICAgYXZtLmdldFR4RmVlKCksIGFzc2V0SUQsIHVuZGVmaW5lZCwgVW5peE5vdygpXG4gICAgICApXG5cbiAgICAgIGV4cGVjdCh0eHU0LnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUodHh1My50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKVxuICAgICAgZXhwZWN0KHR4dTQudG9TdHJpbmcoKSkudG9CZSh0eHUzLnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IHR4MTogVHggPSB0eHUxLnNpZ24oYXZtLmtleUNoYWluKCkpXG4gICAgICBjb25zdCBjaGVja1R4OiBzdHJpbmcgPSB0eDEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgY29uc3QgdHgxb2JqOiBvYmplY3QgPSB0eDEuc2VyaWFsaXplKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDFzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4MW9iailcbiAgICAgIGNvbnN0IHR4Mm5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDFzdHIpXG4gICAgICBjb25zdCB0eDI6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4Mi5kZXNlcmlhbGl6ZSh0eDJuZXdvYmosIFwiaGV4XCIpXG5cbiAgICAgIGNvbnN0IHR4Mm9iajogb2JqZWN0ID0gdHgyLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgyc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDJvYmopXG4gICAgICBleHBlY3QodHgxb2JqKS50b1N0cmljdEVxdWFsKHR4Mm9iailcbiAgICAgIGV4cGVjdCh0eDFzdHIpLnRvU3RyaWN0RXF1YWwodHgyc3RyKVxuICAgICAgZXhwZWN0KHR4Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG5cbiAgICAgIGNvbnN0IHR4MzogVHggPSB0eHUxLnNpZ24oYXZtLmtleUNoYWluKCkpXG4gICAgICBjb25zdCB0eDNvYmo6IG9iamVjdCA9IHR4My5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4M3N0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgzb2JqKVxuICAgICAgY29uc3QgdHg0bmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4M3N0cilcbiAgICAgIGNvbnN0IHR4NDogVHggPSBuZXcgVHgoKVxuICAgICAgdHg0LmRlc2VyaWFsaXplKHR4NG5ld29iaiwgZGlzcGxheSlcblxuICAgICAgY29uc3QgdHg0b2JqOiBvYmplY3QgPSB0eDQuc2VyaWFsaXplKGRpc3BsYXkpXG4gICAgICBjb25zdCB0eDRzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4NG9iailcbiAgICAgIGV4cGVjdCh0eDNvYmopLnRvU3RyaWN0RXF1YWwodHg0b2JqKVxuICAgICAgZXhwZWN0KHR4M3N0cikudG9TdHJpY3RFcXVhbCh0eDRzdHIpXG4gICAgICBleHBlY3QodHg0LnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoY2hlY2tUeClcbiAgICAgIHNlcmlhbHplaXQodHgxLCBcIkNyZWF0ZU5GVE1pbnRUeFwiKVxuICAgIH0pXG5cbiAgICB0ZXN0KFwiYnVpbGRORlRUcmFuc2ZlclR4XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGF2bS5zZXRUeEZlZShuZXcgQk4oZmVlKSlcbiAgICAgIGNvbnN0IHBsb2FkOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMTAyNClcbiAgICAgIHBsb2FkLndyaXRlKFwiQWxsIHlvdSBUcmVra2llcyBhbmQgVFYgYWRkaWN0cywgRG9uJ3QgbWVhbiB0byBkaXNzIGRvbid0IG1lYW4gdG8gYnJpbmcgc3RhdGljLlwiLCAwLCAxMDI0LCBcInV0ZjhcIilcbiAgICAgIGNvbnN0IGFkZHJidWZmMSA9IGFkZHJzMS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYyID0gYWRkcnMyLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpXG4gICAgICBjb25zdCBhZGRyYnVmZjMgPSBhZGRyczMubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IHR4dTE6IFVuc2lnbmVkVHggPSBhd2FpdCBhdm0uYnVpbGRORlRUcmFuc2ZlclR4KFxuICAgICAgICBzZXQsIGFkZHJzMywgYWRkcnMxLCBhZGRyczIsIG5mdHV0eG9pZHNbMV0sXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLCBVbml4Tm93KCksIG5ldyBCTigwKSwgMSxcbiAgICAgIClcblxuICAgICAgY29uc3QgdHh1MjogVW5zaWduZWRUeCA9IHNldC5idWlsZE5GVFRyYW5zZmVyVHgoXG4gICAgICAgIG5ldHdvcmtJRCwgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLCBhZGRyYnVmZjMsIGFkZHJidWZmMSwgYWRkcmJ1ZmYyLFxuICAgICAgICBbbmZ0dXR4b2lkc1sxXV0sIGF2bS5nZXRUeEZlZSgpLCBhc3NldElELCBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKS5nZXRQYXlsb2FkKCksIFVuaXhOb3coKSwgbmV3IEJOKDApLCAxLFxuICAgICAgKVxuXG4gICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKHR4dTEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSlcbiAgICAgIGV4cGVjdCh0eHUyLnRvU3RyaW5nKCkpLnRvQmUodHh1MS50b1N0cmluZygpKVxuXG4gICAgICBjb25zdCB0eDE6IFR4ID0gdHh1MS5zaWduKGF2bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgY2hlY2tUeDogc3RyaW5nID0gdHgxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MW9iajogb2JqZWN0ID0gdHgxLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgxc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDFvYmopXG4gICAgICBjb25zdCB0eDJuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgxc3RyKVxuICAgICAgY29uc3QgdHgyOiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDIuZGVzZXJpYWxpemUodHgybmV3b2JqLCBcImhleFwiKVxuXG4gICAgICBjb25zdCB0eDJvYmo6IG9iamVjdCA9IHR4Mi5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MnN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgyb2JqKVxuICAgICAgZXhwZWN0KHR4MW9iaikudG9TdHJpY3RFcXVhbCh0eDJvYmopXG4gICAgICBleHBlY3QodHgxc3RyKS50b1N0cmljdEVxdWFsKHR4MnN0cilcbiAgICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuICBcbiAgICAgIGNvbnN0IHR4MzogVHggPSB0eHUxLnNpZ24oYXZtLmtleUNoYWluKCkpXG4gICAgICBjb25zdCB0eDNvYmo6IG9iamVjdCA9IHR4My5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4M3N0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgzb2JqKVxuICAgICAgY29uc3QgdHg0bmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4M3N0cilcbiAgICAgIGNvbnN0IHR4NDogVHggPSBuZXcgVHgoKVxuICAgICAgdHg0LmRlc2VyaWFsaXplKHR4NG5ld29iaiwgZGlzcGxheSlcblxuICAgICAgY29uc3QgdHg0b2JqOiBvYmplY3QgPSB0eDQuc2VyaWFsaXplKGRpc3BsYXkpXG4gICAgICBjb25zdCB0eDRzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4NG9iailcbiAgICAgIGV4cGVjdCh0eDNvYmopLnRvU3RyaWN0RXF1YWwodHg0b2JqKVxuICAgICAgZXhwZWN0KHR4M3N0cikudG9TdHJpY3RFcXVhbCh0eDRzdHIpXG4gICAgICBleHBlY3QodHg0LnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoY2hlY2tUeClcbiAgICAgIHNlcmlhbHplaXQodHgxLCBcIk5GVFRyYW5zZmVyVHhcIilcbiAgICB9KVxuXG4gICAgdGVzdChcImJ1aWxkSW1wb3J0VHhcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgY29uc3QgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDApXG4gICAgICBjb25zdCB0aHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgICAgIGF2bS5zZXRUeEZlZShuZXcgQk4oZmVlKSlcbiAgICAgIGNvbnN0IGFkZHJidWZmMSA9IGFkZHJzMS5tYXAoKGEpID0+IGF2bS5wYXJzZUFkZHJlc3MoYSkpXG4gICAgICBjb25zdCBhZGRyYnVmZjIgPSBhZGRyczIubWFwKChhKSA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYzID0gYWRkcnMzLm1hcCgoYSkgPT4gYXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGZ1bmd1dHhvOiBVVFhPID0gc2V0LmdldFVUWE8oZnVuZ3V0eG9pZHNbMV0pXG4gICAgICBjb25zdCBmdW5ndXR4b3N0cjogc3RyaW5nID0gZnVuZ3V0eG8udG9TdHJpbmcoKVxuICAgICAgXG4gICAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8VW5zaWduZWRUeD4gPSBhdm0uYnVpbGRJbXBvcnRUeChcbiAgICAgICAgc2V0LCBhZGRyczEsIFBsYXRmb3JtQ2hhaW5JRCwgYWRkcnMzLCBhZGRyczEsIGFkZHJzMiwgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIiksIFVuaXhOb3coKSwgbG9ja3RpbWUsIHRocmVzaG9sZFxuICAgICAgKVxuICAgICAgY29uc3QgcGF5bG9hZDpvYmplY3QgPSB7XG4gICAgICAgIHJlc3VsdDoge1xuICAgICAgICAgIHV0eG9zOltmdW5ndXR4b3N0cl1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgICAgZGF0YTogcGF5bG9hZFxuICAgICAgfVxuXG4gICAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgICAgY29uc3QgdHh1MTogVW5zaWduZWRUeCA9IGF3YWl0IHJlc3VsdFxuXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkSW1wb3J0VHgoXG4gICAgICAgIG5ldHdvcmtJRCwgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLFxuICAgICAgICBhZGRyYnVmZjMsIGFkZHJidWZmMSwgYWRkcmJ1ZmYyLCBbZnVuZ3V0eG9dLCBiaW50b29scy5jYjU4RGVjb2RlKFBsYXRmb3JtQ2hhaW5JRCksIGF2bS5nZXRUeEZlZSgpLCBhd2FpdCBhdm0uZ2V0QVZBWEFzc2V0SUQoKSwgXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSwgVW5peE5vdygpLCBsb2NrdGltZSwgdGhyZXNob2xkXG4gICAgICApXG5cbiAgICAgIGV4cGVjdCh0eHUyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUodHh1MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKVxuICAgICAgZXhwZWN0KHR4dTIudG9TdHJpbmcoKSkudG9CZSh0eHUxLnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IHR4MTogVHggPSB0eHUxLnNpZ24oYXZtLmtleUNoYWluKCkpXG4gICAgICBjb25zdCBjaGVja1R4OiBzdHJpbmcgPSB0eDEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgY29uc3QgdHgxb2JqOiBvYmplY3QgPSB0eDEuc2VyaWFsaXplKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDFzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4MW9iailcbiAgICAgIGNvbnN0IHR4Mm5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDFzdHIpXG4gICAgICBjb25zdCB0eDI6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4Mi5kZXNlcmlhbGl6ZSh0eDJuZXdvYmosIFwiaGV4XCIpXG5cbiAgICAgIGNvbnN0IHR4Mm9iajogb2JqZWN0ID0gdHgyLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgyc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDJvYmopXG4gICAgICBleHBlY3QodHgxb2JqKS50b1N0cmljdEVxdWFsKHR4Mm9iailcbiAgICAgIGV4cGVjdCh0eDFzdHIpLnRvU3RyaWN0RXF1YWwodHgyc3RyKVxuICAgICAgZXhwZWN0KHR4Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG4gIFxuICAgICAgY29uc3QgdHgzOiBUeCA9IHR4dTEuc2lnbihhdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IHR4M29iajogb2JqZWN0ID0gdHgzLnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHgzc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDNvYmopXG4gICAgICBjb25zdCB0eDRuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgzc3RyKVxuICAgICAgY29uc3QgdHg0OiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDQuZGVzZXJpYWxpemUodHg0bmV3b2JqLCBkaXNwbGF5KVxuXG4gICAgICBjb25zdCB0eDRvYmo6IG9iamVjdCA9IHR4NC5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4NHN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHg0b2JqKVxuICAgICAgZXhwZWN0KHR4M29iaikudG9TdHJpY3RFcXVhbCh0eDRvYmopXG4gICAgICBleHBlY3QodHgzc3RyKS50b1N0cmljdEVxdWFsKHR4NHN0cilcbiAgICAgIGV4cGVjdCh0eDQudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuICAgICAgc2VyaWFsemVpdCh0eDEsIFwiSW1wb3J0VHhcIilcbiAgICB9KVxuXG4gICAgdGVzdChcImJ1aWxkRXhwb3J0VHhcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgYXZtLnNldFR4RmVlKG5ldyBCTihmZWUpKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYxOiBCdWZmZXJbXSA9IGFkZHJzMS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYyOiBCdWZmZXJbXSA9IGFkZHJzMi5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYzOiBCdWZmZXJbXSA9IGFkZHJzMy5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBhdm0ucGFyc2VBZGRyZXNzKGEpKVxuICAgICAgY29uc3QgYW1vdW50OiBCTiA9IG5ldyBCTig5MClcbiAgICAgIGNvbnN0IHR5cGU6IFNlcmlhbGl6ZWRUeXBlID0gXCJiZWNoMzJcIlxuICAgICAgY29uc3QgdHh1MTogVW5zaWduZWRUeCA9IGF3YWl0IGF2bS5idWlsZEV4cG9ydFR4KFxuICAgICAgICBzZXQsIFxuICAgICAgICBhbW91bnQsIFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKFBsYXRmb3JtQ2hhaW5JRCksXG4gICAgICAgIGFkZHJidWZmMy5tYXAoKGE6IEJ1ZmZlcik6IGFueSA9PiBzZXJpYWxpemF0aW9uLmJ1ZmZlclRvVHlwZShhLCB0eXBlLCBhdmFsYW5jaGUuZ2V0SFJQKCksIFwiUFwiKSksXG4gICAgICAgIGFkZHJzMSwgXG4gICAgICAgIGFkZHJzMixcbiAgICAgICAgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIiksIFVuaXhOb3coKVxuICAgICAgKVxuXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkRXhwb3J0VHgoXG4gICAgICAgIG5ldHdvcmtJRCwgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLFxuICAgICAgICBhbW91bnQsXG4gICAgICAgIGFzc2V0SUQsIFxuICAgICAgICBhZGRyYnVmZjMsIFxuICAgICAgICBhZGRyYnVmZjEsIFxuICAgICAgICBhZGRyYnVmZjIsIFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKFBsYXRmb3JtQ2hhaW5JRCksIFxuICAgICAgICBhdm0uZ2V0VHhGZWUoKSwgXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSwgVW5peE5vdygpXG4gICAgICApXG5cbiAgICAgIGV4cGVjdCh0eHUyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUodHh1MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKVxuICAgICAgZXhwZWN0KHR4dTIudG9TdHJpbmcoKSkudG9CZSh0eHUxLnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IHR4dTM6IFVuc2lnbmVkVHggPSBhd2FpdCBhdm0uYnVpbGRFeHBvcnRUeChcbiAgICAgICAgc2V0LCBhbW91bnQsIFBsYXRmb3JtQ2hhaW5JRCwgXG4gICAgICAgIGFkZHJzMywgYWRkcnMxLCBhZGRyczIsIFxuICAgICAgICBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKSwgVW5peE5vdygpXG4gICAgICApXG5cbiAgICAgIGNvbnN0IHR4dTQ6IFVuc2lnbmVkVHggPSBzZXQuYnVpbGRFeHBvcnRUeChcbiAgICAgICAgbmV0d29ya0lELCBiaW50b29scy5jYjU4RGVjb2RlKGJsb2NrY2hhaW5JRCksIGFtb3VudCxcbiAgICAgICAgYXNzZXRJRCwgYWRkcmJ1ZmYzLCBhZGRyYnVmZjEsIGFkZHJidWZmMiwgdW5kZWZpbmVkLCBhdm0uZ2V0VHhGZWUoKSwgYXNzZXRJRCwgXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSwgVW5peE5vdygpXG4gICAgICApXG5cbiAgICAgIGV4cGVjdCh0eHU0LnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUodHh1My50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKVxuICAgICAgZXhwZWN0KHR4dTQudG9TdHJpbmcoKSkudG9CZSh0eHUzLnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IHR4MTogVHggPSB0eHUxLnNpZ24oYXZtLmtleUNoYWluKCkpXG4gICAgICBjb25zdCBjaGVja1R4OiBzdHJpbmcgPSB0eDEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgY29uc3QgdHgxb2JqOiBvYmplY3QgPSB0eDEuc2VyaWFsaXplKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDFzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4MW9iailcbiAgICAgIGNvbnN0IHR4Mm5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDFzdHIpXG4gICAgICBjb25zdCB0eDI6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4Mi5kZXNlcmlhbGl6ZSh0eDJuZXdvYmosIFwiaGV4XCIpXG5cbiAgICAgIGNvbnN0IHR4Mm9iajogb2JqZWN0ID0gdHgyLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgyc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDJvYmopXG4gICAgICBleHBlY3QodHgxb2JqKS50b1N0cmljdEVxdWFsKHR4Mm9iailcbiAgICAgIGV4cGVjdCh0eDFzdHIpLnRvU3RyaWN0RXF1YWwodHgyc3RyKVxuICAgICAgZXhwZWN0KHR4Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG4gIFxuICAgICAgY29uc3QgdHgzOiBUeCA9IHR4dTEuc2lnbihhdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IHR4M29iajogb2JqZWN0ID0gdHgzLnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHgzc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDNvYmopXG4gICAgICBjb25zdCB0eDRuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgzc3RyKVxuICAgICAgY29uc3QgdHg0OiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDQuZGVzZXJpYWxpemUodHg0bmV3b2JqLCBkaXNwbGF5KVxuXG4gICAgICBjb25zdCB0eDRvYmo6IG9iamVjdCA9IHR4NC5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4NHN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHg0b2JqKVxuICAgICAgZXhwZWN0KHR4M29iaikudG9TdHJpY3RFcXVhbCh0eDRvYmopXG4gICAgICBleHBlY3QodHgzc3RyKS50b1N0cmljdEVxdWFsKHR4NHN0cilcbiAgICAgIGV4cGVjdCh0eDQudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuICAgICAgc2VyaWFsemVpdCh0eDEsIFwiRXhwb3J0VHhcIilcbiAgICB9KVxuXG4gICAgdGVzdChcImJ1aWxkR2VuZXNpc1wiLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBjb25zdCBnZW5lc2lzRGF0YTogb2JqZWN0ID0ge1xuICAgICAgICBnZW5lc2lzRGF0YToge1xuICAgICAgICAgIGFzc2V0QWxpYXMxOiB7XG4gICAgICAgICAgICBuYW1lOiBcImh1bWFuIHJlYWRhYmxlIG5hbWVcIixcbiAgICAgICAgICAgIHN5bWJvbDogXCJBVkFMXCIsXG4gICAgICAgICAgICBpbml0aWFsU3RhdGU6IHtcbiAgICAgICAgICAgICAgZml4ZWRDYXA6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBhbW91bnQ6IDEwMDAsXG4gICAgICAgICAgICAgICAgICBhZGRyZXNzOiBcIkFcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgYW1vdW50OiA1MDAwLFxuICAgICAgICAgICAgICAgICAgYWRkcmVzczogXCJCXCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGFzc2V0QWxpYXNDYW5CZUFueXRoaW5nVW5pcXVlOiB7XG4gICAgICAgICAgICBuYW1lOiBcImh1bWFuIHJlYWRhYmxlIG5hbWVcIixcbiAgICAgICAgICAgIHN5bWJvbDogXCJBVkFMXCIsXG4gICAgICAgICAgICBpbml0aWFsU3RhdGU6IHtcbiAgICAgICAgICAgICAgdmFyaWFibGVDYXA6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBtaW50ZXJzOiBbXG4gICAgICAgICAgICAgICAgICAgIFwiQVwiLFxuICAgICAgICAgICAgICAgICAgICBcIkJcIlxuICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICAgIHRocmVzaG9sZDogMVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgbWludGVyczogW1xuICAgICAgICAgICAgICAgICAgICBcIkFcIixcbiAgICAgICAgICAgICAgICAgICAgXCJCXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiQ1wiXG4gICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgICAgdGhyZXNob2xkOiAyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCBieXRlczogc3RyaW5nID0gXCIxMTFUTld6VXRIS29TdnhvaGp5ZkV3RTJYMjI4WkRHQm5nWjRtZE1VVk1uVm5qdG5hd1cxYjF6YkFoenlBTTF2NmQ3RUNOajZEWHNUN3FEbWhTRWYzRFdnWFJqN0VDd0JYMzZaWEZjOXRXVkIycUhVUm9VZmREdkZzQmVTUnFhdENtajc2ZVpRTUdaRGdCRlJOaWpSaFBOS1VhcDdiQ2VLcEhEdHVDWmM0WXBQa2Q0bVI4NGRMTDJBTDFiNEs0NmVpcldLTWFGVmpBNWJ0WVM0RG55VXg1Y0xwQXEzZDM1a0VkTmRVNXpIM3JUVTE4UzRUeFlWOHZvTVBjTENUWjNoNHpSc001alcxY1V6aldWdktnN3VZUzJvUjlxWFJGY2d5MWd3TlRGWkdzdHlTdXZTRjdNWmVaRjR6U2ROZ0M0cmJZOUg5NFJWaHFlOHJXN01YcU1TWkI2dkJUQjJCcGdGNnRORmVobVl4RVh3amFLUnJpbVg5MXV0dlplOVlqZ0diRHI4WEhzWENuWFhnNFpEQ2phcEN5NEhtbVJVdFVvQWR1R05CZEdWTWl3RTlXdlZicE1GRmNOZmdEWEd6OU5pYXRnU25reFFBTFRIdkdYWG04Ym40Q29MRnpLbkF0cTNLd2lXcUhtVjNHakZZZVVtM204WmVlOVZEZlpBdkRzaGE1MWFjeGZ0bzFodHN0eFl1NjZEV3BUMzZZVDE4V1NieGliWmNLWGE3Z1pycnNDd3l6aWQ4Q0NXdzc5RGJhTENVaXE5dTQ3VnFvZkcxa2d4d3V1eUhiOE5WblRnUlRrUUFTU2JqMjMyZnlHN1llWDRtQXZaWTdhN0s3eWZTeXpKYVhkVWRSN2FMZUNkTFA2bWJGRHFVTXJONllFa1UyWDhkNENrM1RcIlxuICAgICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkuYnVpbGRHZW5lc2lzKGdlbmVzaXNEYXRhKVxuICAgICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgICBcInJlc3VsdFwiOiB7XG4gICAgICAgICAgXCJieXRlc1wiOiBieXRlc1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBjb25zdCByZXNwb25zZU9iajoge1xuICAgICAgICBkYXRhOiBvYmplY3RcbiAgICAgIH0gPSB7XG4gICAgICAgIGRhdGE6IHBheWxvYWRcbiAgICAgIH1cblxuICAgICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcbiAgICAgIGV4cGVjdChyZXNwb25zZSkudG9CZShieXRlcylcbiAgICB9KVxuICB9KVxufSkiXX0=