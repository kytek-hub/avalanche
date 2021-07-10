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
const api_1 = require("src/apis/platformvm/api");
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const bintools_1 = __importDefault(require("src/utils/bintools"));
const bech32 = __importStar(require("bech32"));
const constants_1 = require("src/utils/constants");
const utxos_1 = require("src/apis/platformvm/utxos");
const persistenceoptions_1 = require("src/utils/persistenceoptions");
const keychain_1 = require("src/apis/platformvm/keychain");
const outputs_1 = require("src/apis/platformvm/outputs");
const inputs_1 = require("src/apis/platformvm/inputs");
const utxos_2 = require("src/apis/platformvm/utxos");
const create_hash_1 = __importDefault(require("create-hash"));
const tx_1 = require("src/apis/platformvm/tx");
const helperfunctions_1 = require("src/utils/helperfunctions");
const payload_1 = require("src/utils/payload");
const helperfunctions_2 = require("src/utils/helperfunctions");
const constants_2 = require("src/utils/constants");
const serialization_1 = require("src/utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serializer = serialization_1.Serialization.getInstance();
const display = "display";
const dumpSerialization = false;
const serialzeit = (aThing, name) => {
    if (dumpSerialization) {
        console.log(JSON.stringify(serializer.serialize(aThing, "platformvm", "hex", name + " -- Hex Encoded")));
        console.log(JSON.stringify(serializer.serialize(aThing, "platformvm", "display", name + " -- Human-Readable")));
    }
};
describe('PlatformVMAPI', () => {
    const networkID = 12345;
    const blockchainID = constants_1.PlatformChainID;
    const ip = '127.0.0.1';
    const port = 9650;
    const protocol = 'https';
    const nodeID = "NodeID-B6D4v1VtPYLbiUvYXtW4Px8oE9imC2vGW";
    const startTime = helperfunctions_1.UnixNow().add(new bn_js_1.default(60 * 5));
    const endTime = startTime.add(new bn_js_1.default(1209600));
    const username = 'AvaLabs';
    const password = 'password';
    const avalanche = new src_1.Avalanche(ip, port, protocol, networkID, undefined, undefined, undefined, true);
    let api;
    let alias;
    const addrA = 'P-' + bech32.encode(avalanche.getHRP(), bech32.toWords(bintools.cb58Decode("B6D4v1VtPYLbiUvYXtW4Px8oE9imC2vGW")));
    const addrB = 'P-' + bech32.encode(avalanche.getHRP(), bech32.toWords(bintools.cb58Decode("P5wdRuZeaDt28eHMP5S3w9ZdoBfo7wuzF")));
    const addrC = 'P-' + bech32.encode(avalanche.getHRP(), bech32.toWords(bintools.cb58Decode("6Y3kysjF9jnHnYkdS9yGAuoHyae2eNmeV")));
    beforeAll(() => {
        api = new api_1.PlatformVMAPI(avalanche, '/ext/bc/P');
        alias = api.getBlockchainAlias();
    });
    afterEach(() => {
        jest_mock_axios_1.default.reset();
    });
    test('refreshBlockchainID', () => __awaiter(void 0, void 0, void 0, function* () {
        let n3bcID = constants_1.Defaults.network[3].P["blockchainID"];
        let testAPI = new api_1.PlatformVMAPI(avalanche, '/ext/bc/P');
        let bc1 = testAPI.getBlockchainID();
        expect(bc1).toBe(constants_1.PlatformChainID);
        testAPI.refreshBlockchainID();
        let bc2 = testAPI.getBlockchainID();
        expect(bc2).toBe(constants_1.PlatformChainID);
        testAPI.refreshBlockchainID(n3bcID);
        let bc3 = testAPI.getBlockchainID();
        expect(bc3).toBe(n3bcID);
    }));
    test('listAddresses', () => __awaiter(void 0, void 0, void 0, function* () {
        const addresses = [addrA, addrB];
        const result = api.listAddresses(username, password);
        const payload = {
            result: {
                addresses,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(addresses);
    }));
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
    test('getBalance', () => __awaiter(void 0, void 0, void 0, function* () {
        const balance = new bn_js_1.default('100', 10);
        const respobj = {
            balance,
            utxoIDs: [
                {
                    "txID": "LUriB3W919F84LwPMMw4sm2fZ4Y76Wgb6msaauEY7i1tFNmtv",
                    "outputIndex": 0
                }
            ]
        };
        const result = api.getBalance(addrA);
        const payload = {
            result: respobj,
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(response)).toBe(JSON.stringify(respobj));
    }));
    test('getCurrentSupply', () => __awaiter(void 0, void 0, void 0, function* () {
        const supply = new bn_js_1.default('1000000000000', 10);
        const result = api.getCurrentSupply();
        const payload = {
            result: {
                supply
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response.toString(10)).toBe(supply.toString(10));
    }));
    test('getHeight', () => __awaiter(void 0, void 0, void 0, function* () {
        const height = new bn_js_1.default('100', 10);
        const result = api.getHeight();
        const payload = {
            result: {
                height
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response.toString(10)).toBe(height.toString(10));
    }));
    test('getMinStake', () => __awaiter(void 0, void 0, void 0, function* () {
        const minStake = new bn_js_1.default("2000000000000", 10);
        const minDelegate = new bn_js_1.default("25000000000", 10);
        const result = api.getMinStake();
        const payload = {
            result: {
                minValidatorStake: "2000000000000",
                minDelegatorStake: "25000000000"
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response["minValidatorStake"].toString(10)).toBe(minStake.toString(10));
        expect(response["minDelegatorStake"].toString(10)).toBe(minDelegate.toString(10));
    }));
    test('getStake', () => __awaiter(void 0, void 0, void 0, function* () {
        const staked = new bn_js_1.default('100', 10);
        const stakedOutputs = [
            "0x000021e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff000000160000000060bd6180000000070000000fb750430000000000000000000000000100000001e70060b7051a4838ebe8e29bcbe1403db9b88cc316895eb3",
            "0x000021e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff000000160000000060bd618000000007000000d18c2e280000000000000000000000000100000001e70060b7051a4838ebe8e29bcbe1403db9b88cc3714de759",
            "0x000021e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff000000160000000061340880000000070000000fb750430000000000000000000000000100000001e70060b7051a4838ebe8e29bcbe1403db9b88cc379b89461",
            "0x000021e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff00000016000000006134088000000007000000d18c2e280000000000000000000000000100000001e70060b7051a4838ebe8e29bcbe1403db9b88cc3c7aa35d1",
            "0x000021e67317cbc4be2aeb00677ad6462778a8f52274b9d605df2591b23027a87dff00000016000000006134088000000007000001d1a94a200000000000000000000000000100000001e70060b7051a4838ebe8e29bcbe1403db9b88cc38fd232d8"
        ];
        const objs = stakedOutputs.map((stakedOutput) => {
            const transferableOutput = new outputs_1.TransferableOutput();
            let buf = buffer_1.Buffer.from(stakedOutput.replace(/0x/g, ""), "hex");
            transferableOutput.fromBuffer(buf, 2);
            return transferableOutput;
        });
        const result = api.getStake([addrA], "hex");
        const payload = {
            result: {
                staked,
                stakedOutputs
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(response["staked"])).toBe(JSON.stringify(staked));
        expect(JSON.stringify(response["stakedOutputs"])).toBe(JSON.stringify(objs));
    }));
    test('addSubnetValidator 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const nodeID = 'abcdef';
        const subnetID = "4R5p2RXDGLqaifZE4hHWH9owe34pfoBULn1DrQTWivjg8o4aH";
        const startTime = new Date(1985, 5, 9, 12, 59, 43, 9);
        const endTime = new Date(1982, 3, 1, 12, 58, 33, 7);
        const weight = 13;
        const utx = 'valid';
        const result = api.addSubnetValidator(username, password, nodeID, subnetID, startTime, endTime, weight);
        const payload = {
            result: {
                txID: utx,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(utx);
    }));
    test('addSubnetValidator', () => __awaiter(void 0, void 0, void 0, function* () {
        const nodeID = 'abcdef';
        const subnetID = buffer_1.Buffer.from('abcdef', 'hex');
        const startTime = new Date(1985, 5, 9, 12, 59, 43, 9);
        const endTime = new Date(1982, 3, 1, 12, 58, 33, 7);
        const weight = 13;
        const utx = 'valid';
        const result = api.addSubnetValidator(username, password, nodeID, subnetID, startTime, endTime, weight);
        const payload = {
            result: {
                txID: utx,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(utx);
    }));
    test('addDelegator 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const nodeID = 'abcdef';
        const startTime = new Date(1985, 5, 9, 12, 59, 43, 9);
        const endTime = new Date(1982, 3, 1, 12, 58, 33, 7);
        const stakeAmount = new bn_js_1.default(13);
        const rewardAddress = 'fedcba';
        const utx = 'valid';
        const result = api.addDelegator(username, password, nodeID, startTime, endTime, stakeAmount, rewardAddress);
        const payload = {
            result: {
                txID: utx,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(utx);
    }));
    test('getBlockchains 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = [{
                id: 'nodeID',
                subnetID: 'subnetID',
                vmID: 'vmID',
            }];
        const result = api.getBlockchains();
        const payload = {
            result: {
                blockchains: resp,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(resp);
    }));
    test('getSubnets 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const resp = [{
                id: 'id',
                controlKeys: ['controlKeys'],
                threshold: 'threshold',
            }];
        const result = api.getSubnets();
        const payload = {
            result: {
                subnets: resp,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toEqual(resp);
    }));
    test('getCurrentValidators 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const validators = ['val1', 'val2'];
        const result = api.getCurrentValidators();
        const payload = {
            result: {
                validators,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toStrictEqual({ validators });
    }));
    test('getCurrentValidators 2', () => __awaiter(void 0, void 0, void 0, function* () {
        const subnetID = 'abcdef';
        const validators = ['val1', 'val2'];
        const result = api.getCurrentValidators(subnetID);
        const payload = {
            result: {
                validators,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toStrictEqual({ validators });
    }));
    test('getCurrentValidators 3', () => __awaiter(void 0, void 0, void 0, function* () {
        const subnetID = buffer_1.Buffer.from('abcdef', 'hex');
        const validators = ['val1', 'val2'];
        const result = api.getCurrentValidators(subnetID);
        const payload = {
            result: {
                validators,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toStrictEqual({ validators });
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
        const amount = new bn_js_1.default(100);
        const to = "abcdef";
        const username = "Robert";
        const password = "Paulson";
        const txID = "valid";
        const result = api.exportAVAX(username, password, amount, to);
        const payload = {
            "result": {
                "txID": txID
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
            "result": {
                "txID": txID
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
    test('createBlockchain', () => __awaiter(void 0, void 0, void 0, function* () {
        const blockchainID = '7sik3Pr6r1FeLrvK1oWwECBS8iJ5VPuSh';
        const vmID = '7sik3Pr6r1FeLrvK1oWwECBS8iJ5VPuSh';
        const name = 'Some Blockchain';
        const genesis = '{ruh:"roh"}';
        const subnetID = buffer_1.Buffer.from('abcdef', 'hex');
        const result = api.createBlockchain(username, password, subnetID, vmID, [1, 2, 3], name, genesis);
        const payload = {
            result: {
                txID: blockchainID,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(blockchainID);
    }));
    test('getBlockchainStatus', () => __awaiter(void 0, void 0, void 0, function* () {
        const blockchainID = '7sik3Pr6r1FeLrvK1oWwECBS8iJ5VPuSh';
        const result = api.getBlockchainStatus(blockchainID);
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
    test('createAddress', () => __awaiter(void 0, void 0, void 0, function* () {
        const alias = 'randomalias';
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
    test('createSubnet 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const controlKeys = ['abcdef'];
        const threshold = 13;
        const utx = 'valid';
        const result = api.createSubnet(username, password, controlKeys, threshold);
        const payload = {
            result: {
                txID: utx,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(utx);
    }));
    test('sampleValidators 1', () => __awaiter(void 0, void 0, void 0, function* () {
        let subnetID;
        const validators = ['val1', 'val2'];
        const result = api.sampleValidators(10, subnetID);
        const payload = {
            result: {
                validators,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(validators);
    }));
    test('sampleValidators 2', () => __awaiter(void 0, void 0, void 0, function* () {
        const subnetID = 'abcdef';
        const validators = ['val1', 'val2'];
        const result = api.sampleValidators(10, subnetID);
        const payload = {
            result: {
                validators,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(validators);
    }));
    test('sampleValidators 3', () => __awaiter(void 0, void 0, void 0, function* () {
        const subnetID = buffer_1.Buffer.from('abcdef', 'hex');
        const validators = ['val1', 'val2'];
        const result = api.sampleValidators(10, subnetID);
        const payload = {
            result: {
                validators,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(validators);
    }));
    test('validatedBy 1', () => __awaiter(void 0, void 0, void 0, function* () {
        const blockchainID = 'abcdef';
        const resp = 'valid';
        const result = api.validatedBy(blockchainID);
        const payload = {
            result: {
                subnetID: resp,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(resp);
    }));
    test('validates 1', () => __awaiter(void 0, void 0, void 0, function* () {
        let subnetID;
        const resp = ['valid'];
        const result = api.validates(subnetID);
        const payload = {
            result: {
                blockchainIDs: resp,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(resp);
    }));
    test('validates 2', () => __awaiter(void 0, void 0, void 0, function* () {
        const subnetID = 'deadbeef';
        const resp = ['valid'];
        const result = api.validates(subnetID);
        const payload = {
            result: {
                blockchainIDs: resp,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(resp);
    }));
    test('validates 3', () => __awaiter(void 0, void 0, void 0, function* () {
        const subnetID = buffer_1.Buffer.from('abcdef', 'hex');
        const resp = ['valid'];
        const result = api.validates(subnetID);
        const payload = {
            result: {
                blockchainIDs: resp,
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(resp);
    }));
    test('getTx', () => __awaiter(void 0, void 0, void 0, function* () {
        const txid = 'f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7';
        const result = api.getTx(txid);
        const payload = {
            result: {
                tx: 'sometx',
            },
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe('sometx');
    }));
    test('getTxStatus', () => __awaiter(void 0, void 0, void 0, function* () {
        const txid = 'f966750f438867c3c9828ddcdbe660e21ccdbb36a9276958f011ba472f75d4e7';
        const result = api.getTxStatus(txid);
        const payload = {
            result: 'accepted'
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe('accepted');
    }));
    test('getUTXOs', () => __awaiter(void 0, void 0, void 0, function* () {
        // Payment
        const OPUTXOstr1 = bintools.cb58Encode(buffer_1.Buffer.from('000038d1b9f1138672da6fb6c35125539276a9acc2a668d63bea6ba3c795e2edb0f5000000013e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd3558000000070000000000004dd500000000000000000000000100000001a36fd0c2dbcab311731dde7ef1514bd26fcdc74d', 'hex'));
        const OPUTXOstr2 = bintools.cb58Encode(buffer_1.Buffer.from('0000c3e4823571587fe2bdfc502689f5a8238b9d0ea7f3277124d16af9de0d2d9911000000003e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd355800000007000000000000001900000000000000000000000100000001e1b6b6a4bad94d2e3f20730379b9bcd6f176318e', 'hex'));
        const OPUTXOstr3 = bintools.cb58Encode(buffer_1.Buffer.from('0000f29dba61fda8d57a911e7f8810f935bde810d3f8d495404685bdb8d9d8545e86000000003e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd355800000007000000000000001900000000000000000000000100000001e1b6b6a4bad94d2e3f20730379b9bcd6f176318e', 'hex'));
        const set = new utxos_1.UTXOSet();
        set.add(OPUTXOstr1);
        set.addArray([OPUTXOstr2, OPUTXOstr3]);
        const persistOpts = new persistenceoptions_1.PersistanceOptions('test', true, 'union');
        expect(persistOpts.getMergeRule()).toBe('union');
        let addresses = set.getAddresses().map((a) => api.addressFromBuffer(a));
        let result = api.getUTXOs(addresses, api.getBlockchainID(), 0, undefined, persistOpts);
        const payload = {
            result: {
                numFetched: 3,
                utxos: [OPUTXOstr1, OPUTXOstr2, OPUTXOstr3],
                stopIndex: { address: "a", utxo: "b" }
            },
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
    describe('Transactions', () => {
        let set;
        let lset;
        let keymgr2;
        let keymgr3;
        let addrs1;
        let addrs2;
        let addrs3;
        let addressbuffs = [];
        let addresses = [];
        let utxos;
        let lutxos;
        let inputs;
        let outputs;
        const amnt = 10000;
        const assetID = buffer_1.Buffer.from(create_hash_1.default('sha256').update('mary had a little lamb').digest());
        let secpbase1;
        let secpbase2;
        let secpbase3;
        let fungutxoids = [];
        let platformvm;
        const fee = 10;
        const name = 'Mortycoin is the dumb as a sack of hammers.';
        const symbol = 'morT';
        const denomination = 8;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            platformvm = new api_1.PlatformVMAPI(avalanche, "/ext/bc/P");
            const result = platformvm.getAVAXAssetID();
            const payload = {
                result: {
                    name,
                    symbol,
                    assetID: bintools.cb58Encode(assetID),
                    denomination: `${denomination}`,
                },
            };
            const responseObj = {
                data: payload,
            };
            jest_mock_axios_1.default.mockResponse(responseObj);
            yield result;
            set = new utxos_1.UTXOSet();
            lset = new utxos_1.UTXOSet;
            platformvm.newKeyChain();
            keymgr2 = new keychain_1.KeyChain(avalanche.getHRP(), alias);
            keymgr3 = new keychain_1.KeyChain(avalanche.getHRP(), alias);
            addrs1 = [];
            addrs2 = [];
            addrs3 = [];
            utxos = [];
            lutxos = [];
            inputs = [];
            outputs = [];
            fungutxoids = [];
            const pload = buffer_1.Buffer.alloc(1024);
            pload.write("All you Trekkies and TV addicts, Don't mean to diss don't mean to bring static.", 0, 1024, 'utf8');
            for (let i = 0; i < 3; i++) {
                addrs1.push(platformvm.addressFromBuffer(platformvm.keyChain().makeKey().getAddress()));
                addrs2.push(platformvm.addressFromBuffer(keymgr2.makeKey().getAddress()));
                addrs3.push(platformvm.addressFromBuffer(keymgr3.makeKey().getAddress()));
            }
            const amount = constants_2.ONEAVAX.mul(new bn_js_1.default(amnt));
            addressbuffs = platformvm.keyChain().getAddresses();
            addresses = addressbuffs.map((a) => platformvm.addressFromBuffer(a));
            const locktime = new bn_js_1.default(54321);
            const threshold = 3;
            for (let i = 0; i < 5; i++) {
                let txid = buffer_1.Buffer.from(create_hash_1.default('sha256').update(bintools.fromBNToBuffer(new bn_js_1.default(i), 32)).digest());
                let txidx = buffer_1.Buffer.alloc(4);
                txidx.writeUInt32BE(i, 0);
                const out = new outputs_1.SECPTransferOutput(amount, addressbuffs, locktime, threshold);
                const xferout = new outputs_1.TransferableOutput(assetID, out);
                outputs.push(xferout);
                const u = new utxos_2.UTXO();
                u.fromBuffer(buffer_1.Buffer.concat([u.getCodecIDBuffer(), txid, txidx, xferout.toBuffer()]));
                fungutxoids.push(u.getUTXOID());
                utxos.push(u);
                txid = u.getTxID();
                txidx = u.getOutputIdx();
                const asset = u.getAssetID();
                const input = new inputs_1.SECPTransferInput(amount);
                const xferinput = new inputs_1.TransferableInput(txid, txidx, asset, input);
                inputs.push(xferinput);
            }
            set.addArray(utxos);
            for (let i = 0; i < 4; i++) {
                let txid = buffer_1.Buffer.from(create_hash_1.default('sha256').update(bintools.fromBNToBuffer(new bn_js_1.default(i), 32)).digest());
                let txidx = buffer_1.Buffer.alloc(4);
                txidx.writeUInt32BE(i, 0);
                const out = new outputs_1.SECPTransferOutput(constants_2.ONEAVAX.mul(new bn_js_1.default(5)), addressbuffs, locktime, 1);
                const pout = new outputs_1.ParseableOutput(out);
                const lockout = new outputs_1.StakeableLockOut(constants_2.ONEAVAX.mul(new bn_js_1.default(5)), addressbuffs, locktime, 1, locktime.add(new bn_js_1.default(86400)), pout);
                const xferout = new outputs_1.TransferableOutput(assetID, lockout);
                const u = new utxos_2.UTXO();
                u.fromBuffer(buffer_1.Buffer.concat([u.getCodecIDBuffer(), txid, txidx, xferout.toBuffer()]));
                lutxos.push(u);
            }
            lset.addArray(lutxos);
            lset.addArray(set.getAllUTXOs());
            secpbase1 = new outputs_1.SECPTransferOutput(new bn_js_1.default(777), addrs3.map((a) => platformvm.parseAddress(a)), helperfunctions_1.UnixNow(), 1);
            secpbase2 = new outputs_1.SECPTransferOutput(new bn_js_1.default(888), addrs2.map((a) => platformvm.parseAddress(a)), helperfunctions_1.UnixNow(), 1);
            secpbase3 = new outputs_1.SECPTransferOutput(new bn_js_1.default(999), addrs2.map((a) => platformvm.parseAddress(a)), helperfunctions_1.UnixNow(), 1);
        }));
        test('signTx', () => __awaiter(void 0, void 0, void 0, function* () {
            const assetID = yield platformvm.getAVAXAssetID();
            const txu2 = set.buildBaseTx(networkID, bintools.cb58Decode(blockchainID), new bn_js_1.default(amnt), assetID, addrs3.map((a) => platformvm.parseAddress(a)), addrs1.map((a) => platformvm.parseAddress(a)), addrs1.map((a) => platformvm.parseAddress(a)), platformvm.getTxFee(), assetID, undefined, helperfunctions_1.UnixNow(), new bn_js_1.default(0), 1);
            txu2.sign(platformvm.keyChain());
        }));
        test('buildImportTx', () => __awaiter(void 0, void 0, void 0, function* () {
            const locktime = new bn_js_1.default(0);
            const threshold = 1;
            platformvm.setTxFee(new bn_js_1.default(fee));
            const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a));
            const fungutxo = set.getUTXO(fungutxoids[1]);
            const fungutxostr = fungutxo.toString();
            const result = platformvm.buildImportTx(set, addrs1, constants_1.PlatformChainID, addrs3, addrs1, addrs2, new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow(), locktime, threshold);
            const payload = {
                result: {
                    utxos: [fungutxostr]
                },
            };
            const responseObj = {
                data: payload,
            };
            jest_mock_axios_1.default.mockResponse(responseObj);
            const txu1 = yield result;
            const txu2 = set.buildImportTx(networkID, bintools.cb58Decode(blockchainID), addrbuff3, addrbuff1, addrbuff2, [fungutxo], bintools.cb58Decode(constants_1.PlatformChainID), platformvm.getTxFee(), yield platformvm.getAVAXAssetID(), new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow(), locktime, threshold);
            expect(txu2.toBuffer().toString('hex')).toBe(txu1.toBuffer().toString('hex'));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(platformvm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(platformvm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "ImportTx");
        }));
        test('buildExportTx', () => __awaiter(void 0, void 0, void 0, function* () {
            platformvm.setTxFee(new bn_js_1.default(fee));
            const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a));
            const amount = new bn_js_1.default(90);
            const type = "bech32";
            const txu1 = yield platformvm.buildExportTx(set, amount, bintools.cb58Decode(constants_1.Defaults.network[avalanche.getNetworkID()].X["blockchainID"]), addrbuff3.map((a) => serializer.bufferToType(a, type, avalanche.getHRP(), "P")), addrs1, addrs2, new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow());
            const txu2 = set.buildExportTx(networkID, bintools.cb58Decode(blockchainID), amount, assetID, addrbuff3, addrbuff1, addrbuff2, bintools.cb58Decode(constants_1.Defaults.network[avalanche.getNetworkID()].X["blockchainID"]), platformvm.getTxFee(), assetID, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow());
            expect(txu2.toBuffer().toString('hex')).toBe(txu1.toBuffer().toString('hex'));
            expect(txu2.toString()).toBe(txu1.toString());
            const txu3 = yield platformvm.buildExportTx(set, amount, bintools.cb58Decode(constants_1.Defaults.network[avalanche.getNetworkID()].X["blockchainID"]), addrs3, addrs1, addrs2, new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow());
            const txu4 = set.buildExportTx(networkID, bintools.cb58Decode(blockchainID), amount, assetID, addrbuff3, addrbuff1, addrbuff2, undefined, platformvm.getTxFee(), assetID, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow());
            expect(txu4.toBuffer().toString('hex')).toBe(txu3.toBuffer().toString('hex'));
            expect(txu4.toString()).toBe(txu3.toString());
            expect(txu2.toBuffer().toString('hex')).toBe(txu1.toBuffer().toString('hex'));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(platformvm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(platformvm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "ExportTx");
        }));
        /*
            test('buildAddSubnetValidatorTx', async (): Promise<void> => {
              platformvm.setFee(new BN(fee));
              const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a));
              const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a));
              const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a));
              const amount:BN = new BN(90);
        
              const txu1:UnsignedTx = await platformvm.buildAddSubnetValidatorTx(
                set,
                addrs1,
                addrs2,
                nodeID,
                startTime,
                endTime,
                PlatformVMConstants.MINSTAKE,
                new UTF8Payload("hello world"), UnixNow()
              );
        
              const txu2:UnsignedTx = set.buildAddSubnetValidatorTx(
                networkID, bintools.cb58Decode(blockchainID),
                addrbuff1,
                addrbuff2,
                NodeIDStringToBuffer(nodeID),
                startTime,
                endTime,
                PlatformVMConstants.MINSTAKE,
                platformvm.getFee(),
                assetID,
                new UTF8Payload("hello world").getPayload(), UnixNow()
              );
              expect(txu2.toBuffer().toString('hex')).toBe(txu1.toBuffer().toString('hex'));
              expect(txu2.toString()).toBe(txu1.toString());
        
            });
        */
        test('buildAddDelegatorTx 1', () => __awaiter(void 0, void 0, void 0, function* () {
            const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a));
            const amount = constants_1.Defaults.network[networkID]["P"].minDelegationStake;
            const locktime = new bn_js_1.default(54321);
            const threshold = 2;
            platformvm.setMinStake(constants_1.Defaults.network[networkID]["P"].minStake, constants_1.Defaults.network[networkID]["P"].minDelegationStake);
            const txu1 = yield platformvm.buildAddDelegatorTx(set, addrs3, addrs1, addrs2, nodeID, startTime, endTime, amount, addrs3, locktime, threshold, new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow());
            const txu2 = set.buildAddDelegatorTx(networkID, bintools.cb58Decode(blockchainID), assetID, addrbuff3, addrbuff1, addrbuff2, helperfunctions_2.NodeIDStringToBuffer(nodeID), startTime, endTime, amount, locktime, threshold, addrbuff3, new bn_js_1.default(0), assetID, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow());
            expect(txu2.toBuffer().toString('hex')).toBe(txu1.toBuffer().toString('hex'));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(platformvm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(platformvm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "AddDelegatorTx");
        }));
        test('buildAddValidatorTx sort StakeableLockOuts 1', () => __awaiter(void 0, void 0, void 0, function* () {
            // two UTXO. The 1st has a lesser stakeablelocktime and a greater amount of AVAX. The 2nd has a greater stakeablelocktime and a lesser amount of AVAX.
            // We expect this test to only consume the 2nd UTXO since it has the greater locktime.
            const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a));
            const amount1 = new bn_js_1.default('20000000000000000');
            const amount2 = new bn_js_1.default('10000000000000000');
            const locktime1 = new bn_js_1.default(0);
            const threshold = 1;
            const stakeableLockTime1 = new bn_js_1.default(1633824000);
            const secpTransferOutput1 = new outputs_1.SECPTransferOutput(amount1, addrbuff1, locktime1, threshold);
            const parseableOutput1 = new outputs_1.ParseableOutput(secpTransferOutput1);
            const stakeableLockOut1 = new outputs_1.StakeableLockOut(amount1, addrbuff1, locktime1, threshold, stakeableLockTime1, parseableOutput1);
            const stakeableLockTime2 = new bn_js_1.default(1733824000);
            const secpTransferOutput2 = new outputs_1.SECPTransferOutput(amount2, addrbuff1, locktime1, threshold);
            const parseableOutput2 = new outputs_1.ParseableOutput(secpTransferOutput2);
            const stakeableLockOut2 = new outputs_1.StakeableLockOut(amount2, addrbuff1, locktime1, threshold, stakeableLockTime2, parseableOutput2);
            const nodeID = "NodeID-36giFye5epwBTpGqPk7b4CCYe3hfyoFr1";
            const stakeAmount = constants_1.Defaults.network[networkID]["P"].minStake;
            platformvm.setMinStake(stakeAmount, constants_1.Defaults.network[networkID]["P"].minDelegationStake);
            const delegationFeeRate = new bn_js_1.default(2).toNumber();
            const codecID = 0;
            const txid = bintools.cb58Decode('auhMFs24ffc2BRWKw6i7Qngcs8jSQUS9Ei2XwJsUpEq4sTVib');
            const txid2 = bintools.cb58Decode('2JwDfm3C7p88rJQ1Y1xWLkWNMA1nqPzqnaC2Hi4PDNKiPnXgGv');
            const outputidx0 = 0;
            const outputidx1 = 0;
            const assetID = yield platformvm.getAVAXAssetID();
            const assetID2 = yield platformvm.getAVAXAssetID();
            const utxo1 = new utxos_2.UTXO(codecID, txid, outputidx0, assetID, stakeableLockOut1);
            const utxo2 = new utxos_2.UTXO(codecID, txid2, outputidx1, assetID2, stakeableLockOut2);
            const utxoSet = new utxos_1.UTXOSet();
            utxoSet.add(utxo1);
            utxoSet.add(utxo2);
            const txu1 = yield platformvm.buildAddValidatorTx(utxoSet, addrs3, addrs1, addrs2, nodeID, startTime, endTime, stakeAmount, addrs3, delegationFeeRate);
            const tx = txu1.getTransaction();
            const ins = tx.getIns();
            // start test inputs
            // confirm only 1 input
            expect(ins.length).toBe(1);
            const input = ins[0];
            const ai = input.getInput();
            const ao = stakeableLockOut2.getTransferableOutput().getOutput();
            const ao2 = stakeableLockOut1.getTransferableOutput().getOutput();
            // confirm input amount matches the output w/ the greater staekablelock time but lesser amount
            expect(ai.getAmount().toString()).toEqual(ao.getAmount().toString());
            // confirm input amount doesn't match the output w/ the lesser staekablelock time but greater amount
            expect(ai.getAmount().toString()).not.toEqual(ao2.getAmount().toString());
            const sli = input.getInput();
            // confirm input stakeablelock time matches the output w/ the greater stakeablelock time but lesser amount 
            expect(sli.getStakeableLocktime().toString()).toEqual(stakeableLockOut2.getStakeableLocktime().toString());
            // confirm input stakeablelock time doesn't match the output w/ the lesser stakeablelock time but greater amount
            expect(sli.getStakeableLocktime().toString()).not.toEqual(stakeableLockOut1.getStakeableLocktime().toString());
            // stop test inputs
            // start test outputs
            const outs = tx.getOuts();
            // confirm only 1 output
            expect(outs.length).toBe(1);
            const output = outs[0];
            const ao3 = output.getOutput();
            // confirm output amount matches the output w/ the greater stakeablelock time but lesser amount sans the stake amount
            expect(ao3.getAmount().toString()).toEqual(ao.getAmount().sub(stakeAmount).toString());
            // confirm output amount doesn't match the output w/ the lesser stakeablelock time but greater amount
            expect(ao3.getAmount().toString()).not.toEqual(ao2.getAmount().toString());
            const slo = output.getOutput();
            // confirm output stakeablelock time matches the output w/ the greater stakeablelock time but lesser amount 
            expect(slo.getStakeableLocktime().toString()).toEqual(stakeableLockOut2.getStakeableLocktime().toString());
            // confirm output stakeablelock time doesn't match the output w/ the greater stakeablelock time but lesser amount 
            expect(slo.getStakeableLocktime().toString()).not.toEqual(stakeableLockOut1.getStakeableLocktime().toString());
            // confirm tx nodeID matches nodeID
            expect(tx.getNodeIDString()).toEqual(nodeID);
            // confirm tx starttime matches starttime
            expect(tx.getStartTime().toString()).toEqual(startTime.toString());
            // confirm tx endtime matches endtime 
            expect(tx.getEndTime().toString()).toEqual(endTime.toString());
            // confirm tx stake amount matches stakeAmount
            expect(tx.getStakeAmount().toString()).toEqual(stakeAmount.toString());
            const stakeOuts = tx.getStakeOuts();
            // confirm only 1 stakeOut
            expect(stakeOuts.length).toBe(1);
            const stakeOut = stakeOuts[0];
            const slo2 = stakeOut.getOutput();
            // confirm stakeOut stakeablelock time matches the output w/ the greater stakeablelock time but lesser amount 
            expect(slo2.getStakeableLocktime().toString()).toEqual(stakeableLockOut2.getStakeableLocktime().toString());
            // confirm stakeOut stakeablelock time doesn't match the output w/ the greater stakeablelock time but lesser amount 
            expect(slo2.getStakeableLocktime().toString()).not.toEqual(stakeableLockOut1.getStakeableLocktime().toString());
            slo2.getAmount();
            // confirm stakeOut stake amount matches stakeAmount
            expect(slo2.getAmount().toString()).toEqual(stakeAmount.toString());
        }));
        test('buildAddValidatorTx sort StakeableLockOuts 2', () => __awaiter(void 0, void 0, void 0, function* () {
            // two UTXO. The 1st has a lesser stakeablelocktime and a greater amount of AVAX. The 2nd has a greater stakeablelocktime and a lesser amount of AVAX.
            // this time we're staking a greater amount than is available in the 2nd UTXO.
            // We expect this test to consume the full 2nd UTXO and a fraction of the 1st UTXO..
            const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a));
            const amount1 = new bn_js_1.default('20000000000000000');
            const amount2 = new bn_js_1.default('10000000000000000');
            const locktime1 = new bn_js_1.default(0);
            const threshold = 1;
            const stakeableLockTime1 = new bn_js_1.default(1633824000);
            const secpTransferOutput1 = new outputs_1.SECPTransferOutput(amount1, addrbuff1, locktime1, threshold);
            const parseableOutput1 = new outputs_1.ParseableOutput(secpTransferOutput1);
            const stakeableLockOut1 = new outputs_1.StakeableLockOut(amount1, addrbuff1, locktime1, threshold, stakeableLockTime1, parseableOutput1);
            const stakeableLockTime2 = new bn_js_1.default(1733824000);
            const secpTransferOutput2 = new outputs_1.SECPTransferOutput(amount2, addrbuff1, locktime1, threshold);
            const parseableOutput2 = new outputs_1.ParseableOutput(secpTransferOutput2);
            const stakeableLockOut2 = new outputs_1.StakeableLockOut(amount2, addrbuff1, locktime1, threshold, stakeableLockTime2, parseableOutput2);
            const nodeID = "NodeID-36giFye5epwBTpGqPk7b4CCYe3hfyoFr1";
            const stakeAmount = new bn_js_1.default('10000003000000000');
            platformvm.setMinStake(stakeAmount, constants_1.Defaults.network[networkID]["P"].minDelegationStake);
            const delegationFeeRate = new bn_js_1.default(2).toNumber();
            const codecID = 0;
            const txid = bintools.cb58Decode('auhMFs24ffc2BRWKw6i7Qngcs8jSQUS9Ei2XwJsUpEq4sTVib');
            const txid2 = bintools.cb58Decode('2JwDfm3C7p88rJQ1Y1xWLkWNMA1nqPzqnaC2Hi4PDNKiPnXgGv');
            const outputidx0 = 0;
            const outputidx1 = 0;
            const assetID = yield platformvm.getAVAXAssetID();
            const assetID2 = yield platformvm.getAVAXAssetID();
            const utxo1 = new utxos_2.UTXO(codecID, txid, outputidx0, assetID, stakeableLockOut1);
            const utxo2 = new utxos_2.UTXO(codecID, txid2, outputidx1, assetID2, stakeableLockOut2);
            const utxoSet = new utxos_1.UTXOSet();
            utxoSet.add(utxo1);
            utxoSet.add(utxo2);
            const txu1 = yield platformvm.buildAddValidatorTx(utxoSet, addrs3, addrs1, addrs2, nodeID, startTime, endTime, stakeAmount, addrs3, delegationFeeRate);
            const tx = txu1.getTransaction();
            const ins = tx.getIns();
            // start test inputs
            // confirm only 1 input
            expect(ins.length).toBe(2);
            const input1 = ins[0];
            const input2 = ins[1];
            const ai1 = input1.getInput();
            const ai2 = input2.getInput();
            const ao1 = stakeableLockOut2.getTransferableOutput().getOutput();
            const ao2 = stakeableLockOut1.getTransferableOutput().getOutput();
            // confirm each input amount matches the corresponding output 
            expect(ai2.getAmount().toString()).toEqual(ao1.getAmount().toString());
            expect(ai1.getAmount().toString()).toEqual(ao2.getAmount().toString());
            const sli1 = input1.getInput();
            const sli2 = input2.getInput();
            // confirm input strakeablelock time matches the output w/ the greater staekablelock time but lesser amount 
            expect(sli1.getStakeableLocktime().toString()).toEqual(stakeableLockOut1.getStakeableLocktime().toString());
            expect(sli2.getStakeableLocktime().toString()).toEqual(stakeableLockOut2.getStakeableLocktime().toString());
            // stop test inputs
            // start test outputs
            const outs = tx.getOuts();
            // confirm only 1 output
            expect(outs.length).toBe(1);
            const output = outs[0];
            const ao3 = output.getOutput();
            // confirm output amount matches the output amount sans the 2nd utxo amount and the stake amount
            expect(ao3.getAmount().toString()).toEqual(ao2.getAmount().sub(stakeAmount.sub(ao1.getAmount())).toString());
            const slo = output.getOutput();
            // confirm output stakeablelock time matches the output w/ the lesser stakeablelock since the other was consumed
            expect(slo.getStakeableLocktime().toString()).toEqual(stakeableLockOut1.getStakeableLocktime().toString());
            // confirm output stakeablelock time doesn't match the output w/ the greater stakeablelock time  
            expect(slo.getStakeableLocktime().toString()).not.toEqual(stakeableLockOut2.getStakeableLocktime().toString());
            // confirm tx nodeID matches nodeID
            expect(tx.getNodeIDString()).toEqual(nodeID);
            // confirm tx starttime matches starttime
            expect(tx.getStartTime().toString()).toEqual(startTime.toString());
            // confirm tx endtime matches endtime 
            expect(tx.getEndTime().toString()).toEqual(endTime.toString());
            // confirm tx stake amount matches stakeAmount
            expect(tx.getStakeAmount().toString()).toEqual(stakeAmount.toString());
            let stakeOuts = tx.getStakeOuts();
            // confirm 2 stakeOuts
            expect(stakeOuts.length).toBe(2);
            let stakeOut1 = stakeOuts[0];
            let stakeOut2 = stakeOuts[1];
            let slo2 = stakeOut1.getOutput();
            let slo3 = stakeOut2.getOutput();
            // confirm both stakeOut strakeablelock times matche the corresponding output  
            expect(slo3.getStakeableLocktime().toString()).toEqual(stakeableLockOut1.getStakeableLocktime().toString());
            expect(slo2.getStakeableLocktime().toString()).toEqual(stakeableLockOut2.getStakeableLocktime().toString());
        }));
        test('buildAddValidatorTx sort StakeableLockOuts 3', () => __awaiter(void 0, void 0, void 0, function* () {
            // three UTXO. 
            // The 1st is a SecpTransferableOutput. 
            // The 2nd has a lesser stakeablelocktime and a greater amount of AVAX. 
            // The 3rd has a greater stakeablelocktime and a lesser amount of AVAX.
            // 
            // this time we're staking a greater amount than is available in the 3rd UTXO.
            // We expect this test to consume the full 3rd UTXO and a fraction of the 2nd UTXO and not to consume the SecpTransferableOutput
            const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a));
            const amount1 = new bn_js_1.default('20000000000000000');
            const amount2 = new bn_js_1.default('10000000000000000');
            const locktime1 = new bn_js_1.default(0);
            const threshold = 1;
            const stakeableLockTime1 = new bn_js_1.default(1633824000);
            const secpTransferOutput0 = new outputs_1.SECPTransferOutput(amount1, addrbuff1, locktime1, threshold);
            const secpTransferOutput1 = new outputs_1.SECPTransferOutput(amount1, addrbuff1, locktime1, threshold);
            const parseableOutput1 = new outputs_1.ParseableOutput(secpTransferOutput1);
            const stakeableLockOut1 = new outputs_1.StakeableLockOut(amount1, addrbuff1, locktime1, threshold, stakeableLockTime1, parseableOutput1);
            const stakeableLockTime2 = new bn_js_1.default(1733824000);
            const secpTransferOutput2 = new outputs_1.SECPTransferOutput(amount2, addrbuff1, locktime1, threshold);
            const parseableOutput2 = new outputs_1.ParseableOutput(secpTransferOutput2);
            const stakeableLockOut2 = new outputs_1.StakeableLockOut(amount2, addrbuff1, locktime1, threshold, stakeableLockTime2, parseableOutput2);
            const nodeID = "NodeID-36giFye5epwBTpGqPk7b4CCYe3hfyoFr1";
            const stakeAmount = new bn_js_1.default('10000003000000000');
            platformvm.setMinStake(stakeAmount, constants_1.Defaults.network[networkID]["P"].minDelegationStake);
            const delegationFeeRate = new bn_js_1.default(2).toNumber();
            const codecID = 0;
            const txid0 = bintools.cb58Decode('auhMFs24ffc2BRWKw6i7Qngcs8jSQUS9Ei2XwJsUpEq4sTVib');
            const txid1 = bintools.cb58Decode('2jhyJit8kWA6SwkRwKxXepFnfhs971CEqaGkjJmiADM8H4g2LR');
            const txid2 = bintools.cb58Decode('2JwDfm3C7p88rJQ1Y1xWLkWNMA1nqPzqnaC2Hi4PDNKiPnXgGv');
            const outputidx0 = 0;
            const outputidx1 = 0;
            const assetID = yield platformvm.getAVAXAssetID();
            const assetID2 = yield platformvm.getAVAXAssetID();
            const utxo0 = new utxos_2.UTXO(codecID, txid0, outputidx0, assetID, secpTransferOutput0);
            const utxo1 = new utxos_2.UTXO(codecID, txid1, outputidx0, assetID, stakeableLockOut1);
            const utxo2 = new utxos_2.UTXO(codecID, txid2, outputidx1, assetID2, stakeableLockOut2);
            const utxoSet = new utxos_1.UTXOSet();
            utxoSet.add(utxo0);
            utxoSet.add(utxo1);
            utxoSet.add(utxo2);
            const txu1 = yield platformvm.buildAddValidatorTx(utxoSet, addrs3, addrs1, addrs2, nodeID, startTime, endTime, stakeAmount, addrs3, delegationFeeRate);
            const tx = txu1.getTransaction();
            const ins = tx.getIns();
            // start test inputs
            // confirm only 1 input
            expect(ins.length).toBe(2);
            const input1 = ins[0];
            const input2 = ins[1];
            const ai1 = input1.getInput();
            const ai2 = input2.getInput();
            const ao1 = stakeableLockOut2.getTransferableOutput().getOutput();
            const ao2 = stakeableLockOut1.getTransferableOutput().getOutput();
            // confirm each input amount matches the corresponding output 
            expect(ai2.getAmount().toString()).toEqual(ao2.getAmount().toString());
            expect(ai1.getAmount().toString()).toEqual(ao1.getAmount().toString());
            const sli1 = input1.getInput();
            const sli2 = input2.getInput();
            // confirm input strakeablelock time matches the output w/ the greater staekablelock time but lesser amount 
            expect(sli1.getStakeableLocktime().toString()).toEqual(stakeableLockOut2.getStakeableLocktime().toString());
            expect(sli2.getStakeableLocktime().toString()).toEqual(stakeableLockOut1.getStakeableLocktime().toString());
            // stop test inputs
            // start test outputs
            const outs = tx.getOuts();
            // confirm only 1 output
            expect(outs.length).toBe(1);
            const output = outs[0];
            const ao3 = output.getOutput();
            // confirm output amount matches the output amount sans the 2nd utxo amount and the stake amount
            expect(ao3.getAmount().toString()).toEqual(ao2.getAmount().sub(stakeAmount.sub(ao1.getAmount())).toString());
            const slo = output.getOutput();
            // confirm output stakeablelock time matches the output w/ the lesser stakeablelock since the other was consumed
            expect(slo.getStakeableLocktime().toString()).toEqual(stakeableLockOut1.getStakeableLocktime().toString());
            // confirm output stakeablelock time doesn't match the output w/ the greater stakeablelock time  
            expect(slo.getStakeableLocktime().toString()).not.toEqual(stakeableLockOut2.getStakeableLocktime().toString());
            // confirm tx nodeID matches nodeID
            expect(tx.getNodeIDString()).toEqual(nodeID);
            // confirm tx starttime matches starttime
            expect(tx.getStartTime().toString()).toEqual(startTime.toString());
            // confirm tx endtime matches endtime 
            expect(tx.getEndTime().toString()).toEqual(endTime.toString());
            // confirm tx stake amount matches stakeAmount
            expect(tx.getStakeAmount().toString()).toEqual(stakeAmount.toString());
            const stakeOuts = tx.getStakeOuts();
            // confirm 2 stakeOuts
            expect(stakeOuts.length).toBe(2);
            const stakeOut1 = stakeOuts[0];
            const stakeOut2 = stakeOuts[1];
            const slo2 = stakeOut1.getOutput();
            const slo3 = stakeOut2.getOutput();
            // confirm both stakeOut strakeablelock times matche the corresponding output  
            expect(slo3.getStakeableLocktime().toString()).toEqual(stakeableLockOut1.getStakeableLocktime().toString());
            expect(slo2.getStakeableLocktime().toString()).toEqual(stakeableLockOut2.getStakeableLocktime().toString());
        }));
        test('buildAddValidatorTx 1', () => __awaiter(void 0, void 0, void 0, function* () {
            const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a));
            const amount = constants_1.Defaults.network[networkID]["P"].minStake.add(new bn_js_1.default(fee));
            const locktime = new bn_js_1.default(54321);
            const threshold = 2;
            platformvm.setMinStake(constants_1.Defaults.network[networkID]["P"].minStake, constants_1.Defaults.network[networkID]["P"].minDelegationStake);
            const txu1 = yield platformvm.buildAddValidatorTx(set, addrs3, addrs1, addrs2, nodeID, startTime, endTime, amount, addrs3, 0.1334556, locktime, threshold, new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow());
            const txu2 = set.buildAddValidatorTx(networkID, bintools.cb58Decode(blockchainID), assetID, addrbuff3, addrbuff1, addrbuff2, helperfunctions_2.NodeIDStringToBuffer(nodeID), startTime, endTime, amount, locktime, threshold, addrbuff3, 0.1335, new bn_js_1.default(0), assetID, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow());
            expect(txu2.toBuffer().toString('hex')).toBe(txu1.toBuffer().toString('hex'));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(platformvm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(platformvm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "AddValidatorTx");
        }));
        test('buildAddDelegatorTx 2', () => __awaiter(void 0, void 0, void 0, function* () {
            const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a));
            const amount = constants_1.Defaults.network[networkID]["P"].minDelegationStake;
            const locktime = new bn_js_1.default(54321);
            const threshold = 2;
            platformvm.setMinStake(constants_1.Defaults.network[networkID]["P"].minStake, constants_1.Defaults.network[networkID]["P"].minDelegationStake);
            const txu1 = yield platformvm.buildAddDelegatorTx(lset, addrs3, addrs1, addrs2, nodeID, startTime, endTime, amount, addrs3, locktime, threshold, new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow());
            const txu2 = lset.buildAddDelegatorTx(networkID, bintools.cb58Decode(blockchainID), assetID, addrbuff3, addrbuff1, addrbuff2, helperfunctions_2.NodeIDStringToBuffer(nodeID), startTime, endTime, amount, locktime, threshold, addrbuff3, new bn_js_1.default(0), assetID, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow());
            expect(txu2.toBuffer().toString('hex')).toBe(txu1.toBuffer().toString('hex'));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(platformvm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(platformvm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "AddDelegatorTx");
        }));
        test('buildAddValidatorTx 2', () => __awaiter(void 0, void 0, void 0, function* () {
            const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a));
            const amount = constants_2.ONEAVAX.mul(new bn_js_1.default(25));
            const locktime = new bn_js_1.default(54321);
            const threshold = 2;
            platformvm.setMinStake(constants_2.ONEAVAX.mul(new bn_js_1.default(25)), constants_2.ONEAVAX.mul(new bn_js_1.default(25)));
            const txu1 = yield platformvm.buildAddValidatorTx(lset, addrs3, addrs1, addrs2, nodeID, startTime, endTime, amount, addrs3, 0.1334556, locktime, threshold, new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow());
            const txu2 = lset.buildAddValidatorTx(networkID, bintools.cb58Decode(blockchainID), assetID, addrbuff3, addrbuff1, addrbuff2, helperfunctions_2.NodeIDStringToBuffer(nodeID), startTime, endTime, amount, locktime, threshold, addrbuff3, 0.1335, new bn_js_1.default(0), assetID, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow());
            expect(txu2.toBuffer().toString('hex')).toBe(txu1.toBuffer().toString('hex'));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(platformvm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(platformvm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "AddValidatorTx");
        }));
        test('buildAddValidatorTx 3', () => __awaiter(void 0, void 0, void 0, function* () {
            const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a));
            const amount = constants_2.ONEAVAX.mul(new bn_js_1.default(3));
            const locktime = new bn_js_1.default(54321);
            const threshold = 2;
            platformvm.setMinStake(constants_2.ONEAVAX.mul(new bn_js_1.default(3)), constants_2.ONEAVAX.mul(new bn_js_1.default(3)));
            //2 utxos; one lockedstakeable; other unlocked; both utxos have 2 avax; stake 3 AVAX
            const dummySet = new utxos_1.UTXOSet();
            const lockedBaseOut = new outputs_1.SECPTransferOutput(constants_2.ONEAVAX.mul(new bn_js_1.default(2)), addrbuff1, locktime, 1);
            const lockedBaseXOut = new outputs_1.ParseableOutput(lockedBaseOut);
            const lockedOut = new outputs_1.StakeableLockOut(constants_2.ONEAVAX.mul(new bn_js_1.default(2)), addrbuff1, locktime, 1, locktime, lockedBaseXOut);
            const txidLocked = buffer_1.Buffer.alloc(32);
            txidLocked.fill(1);
            const txidxLocked = buffer_1.Buffer.alloc(4);
            txidxLocked.writeUInt32BE(1, 0);
            const lu = new utxos_2.UTXO(0, txidLocked, txidxLocked, assetID, lockedOut);
            const txidUnlocked = buffer_1.Buffer.alloc(32);
            txidUnlocked.fill(2);
            const txidxUnlocked = buffer_1.Buffer.alloc(4);
            txidxUnlocked.writeUInt32BE(2, 0);
            const unlockedOut = new outputs_1.SECPTransferOutput(constants_2.ONEAVAX.mul(new bn_js_1.default(2)), addrbuff1, locktime, 1);
            const ulu = new utxos_2.UTXO(0, txidUnlocked, txidxUnlocked, assetID, unlockedOut);
            dummySet.add(ulu);
            dummySet.add(lu);
            const txu1 = yield platformvm.buildAddValidatorTx(dummySet, addrs3, addrs1, addrs2, nodeID, startTime, endTime, amount, addrs3, 0.1334556, locktime, threshold, new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow());
            const txu1Ins = txu1.getTransaction().getIns();
            const txu1Outs = txu1.getTransaction().getOuts();
            const txu1Stake = txu1.getTransaction().getStakeOuts();
            const txu1Total = txu1.getTransaction().getTotalOuts();
            let intotal = new bn_js_1.default(0);
            for (let i = 0; i < txu1Ins.length; i++) {
                intotal = intotal.add(txu1Ins[i].getInput().getAmount());
            }
            let outtotal = new bn_js_1.default(0);
            for (let i = 0; i < txu1Outs.length; i++) {
                outtotal = outtotal.add(txu1Outs[i].getOutput().getAmount());
            }
            let staketotal = new bn_js_1.default(0);
            for (let i = 0; i < txu1Stake.length; i++) {
                staketotal = staketotal.add(txu1Stake[i].getOutput().getAmount());
            }
            let totaltotal = new bn_js_1.default(0);
            for (let i = 0; i < txu1Total.length; i++) {
                totaltotal = totaltotal.add(txu1Total[i].getOutput().getAmount());
            }
            expect(intotal.toString(10)).toBe("4000000000");
            expect(outtotal.toString(10)).toBe("1000000000");
            expect(staketotal.toString(10)).toBe("3000000000");
            expect(totaltotal.toString(10)).toBe("4000000000");
        }));
        test('buildCreateSubnetTx1', () => __awaiter(void 0, void 0, void 0, function* () {
            platformvm.setCreationTxFee(new bn_js_1.default(10));
            const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a));
            const txu1 = yield platformvm.buildCreateSubnetTx(set, addrs1, addrs2, addrs3, 1, new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow());
            const txu2 = set.buildCreateSubnetTx(networkID, bintools.cb58Decode(blockchainID), addrbuff1, addrbuff2, addrbuff3, 1, platformvm.getCreationTxFee(), assetID, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow());
            expect(txu2.toBuffer().toString('hex')).toBe(txu1.toBuffer().toString('hex'));
            expect(txu2.toString()).toBe(txu1.toString());
            const tx1 = txu1.sign(platformvm.keyChain());
            const checkTx = tx1.toBuffer().toString("hex");
            const tx1obj = tx1.serialize("hex");
            const tx1str = JSON.stringify(tx1obj);
            const tx2newobj = JSON.parse(tx1str);
            const tx2 = new tx_1.Tx();
            tx2.deserialize(tx2newobj, "hex");
            expect(tx2.toBuffer().toString("hex")).toBe(checkTx);
            const tx3 = txu1.sign(platformvm.keyChain());
            const tx3obj = tx3.serialize(display);
            const tx3str = JSON.stringify(tx3obj);
            const tx4newobj = JSON.parse(tx3str);
            const tx4 = new tx_1.Tx();
            tx4.deserialize(tx4newobj, display);
            expect(tx4.toBuffer().toString("hex")).toBe(checkTx);
            serialzeit(tx1, "CreateSubnetTx");
        }));
        test('buildCreateSubnetTx 2', () => __awaiter(void 0, void 0, void 0, function* () {
            platformvm.setCreationTxFee(new bn_js_1.default(10));
            const addrbuff1 = addrs1.map((a) => platformvm.parseAddress(a));
            const addrbuff2 = addrs2.map((a) => platformvm.parseAddress(a));
            const addrbuff3 = addrs3.map((a) => platformvm.parseAddress(a));
            const txu1 = yield platformvm.buildCreateSubnetTx(lset, addrs1, addrs2, addrs3, 1, new payload_1.UTF8Payload("hello world"), helperfunctions_1.UnixNow());
            const txu2 = lset.buildCreateSubnetTx(networkID, bintools.cb58Decode(blockchainID), addrbuff1, addrbuff2, addrbuff3, 1, platformvm.getCreationTxFee(), assetID, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow());
            expect(txu2.toBuffer().toString('hex')).toBe(txu1.toBuffer().toString('hex'));
            expect(txu2.toString()).toBe(txu1.toString());
        }));
    });
    test('getRewardUTXOs', () => __awaiter(void 0, void 0, void 0, function* () {
        const txID = '7sik3Pr6r1FeLrvK1oWwECBS8iJ5VPuSh';
        const result = api.getRewardUTXOs(txID);
        const payload = {
            result: { numFetched: '0', utxos: [], encoding: 'cb58' }
        };
        const responseObj = {
            data: payload,
        };
        jest_mock_axios_1.default.mockResponse(responseObj);
        const response = yield result;
        expect(jest_mock_axios_1.default.request).toHaveBeenCalledTimes(1);
        expect(response).toBe(payload["result"]);
    }));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0cy9hcGlzL3BsYXRmb3Jtdm0vYXBpLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0VBQXVDO0FBQ3ZDLDZCQUErQjtBQUMvQixpREFBdUQ7QUFDdkQsb0NBQWdDO0FBQ2hDLGtEQUFzQjtBQUN0QixrRUFBeUM7QUFDekMsK0NBQWdDO0FBQ2hDLG1EQUErRDtBQUMvRCxxREFBbUQ7QUFDbkQscUVBQWlFO0FBQ2pFLDJEQUF1RDtBQUN2RCx5REFBcUk7QUFDckksdURBQStHO0FBQy9HLHFEQUFnRDtBQUNoRCw4REFBb0M7QUFDcEMsK0NBQXVEO0FBQ3ZELCtEQUFtRDtBQUNuRCwrQ0FBK0M7QUFDL0MsK0RBQWdFO0FBQ2hFLG1EQUE2QztBQUM3QywyREFBeUc7QUFLekc7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBRyxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ3ZDLE1BQU0sVUFBVSxHQUFHLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDOUMsTUFBTSxPQUFPLEdBQXVCLFNBQVMsQ0FBQTtBQUM3QyxNQUFNLGlCQUFpQixHQUFZLEtBQUssQ0FBQTtBQUV4QyxNQUFNLFVBQVUsR0FBRyxDQUFDLE1BQW9CLEVBQUUsSUFBWSxFQUFRLEVBQUU7SUFDOUQsSUFBSSxpQkFBaUIsRUFBRTtRQUNyQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDeEcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLFlBQVksRUFB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QUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb2NrQXhpb3MgZnJvbSAnamVzdC1tb2NrLWF4aW9zJ1xuaW1wb3J0IHsgQXZhbGFuY2hlIH0gZnJvbSAnc3JjJ1xuaW1wb3J0IHsgUGxhdGZvcm1WTUFQSSB9IGZyb20gJ3NyYy9hcGlzL3BsYXRmb3Jtdm0vYXBpJ1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLydcbmltcG9ydCBCTiBmcm9tICdibi5qcydcbmltcG9ydCBCaW5Ub29scyBmcm9tICdzcmMvdXRpbHMvYmludG9vbHMnXG5pbXBvcnQgKiBhcyBiZWNoMzIgZnJvbSAnYmVjaDMyJ1xuaW1wb3J0IHsgRGVmYXVsdHMsIFBsYXRmb3JtQ2hhaW5JRCB9IGZyb20gJ3NyYy91dGlscy9jb25zdGFudHMnXG5pbXBvcnQgeyBVVFhPU2V0IH0gZnJvbSAnc3JjL2FwaXMvcGxhdGZvcm12bS91dHhvcydcbmltcG9ydCB7IFBlcnNpc3RhbmNlT3B0aW9ucyB9IGZyb20gJ3NyYy91dGlscy9wZXJzaXN0ZW5jZW9wdGlvbnMnXG5pbXBvcnQgeyBLZXlDaGFpbiB9IGZyb20gJ3NyYy9hcGlzL3BsYXRmb3Jtdm0va2V5Y2hhaW4nXG5pbXBvcnQgeyBTRUNQVHJhbnNmZXJPdXRwdXQsIFRyYW5zZmVyYWJsZU91dHB1dCwgQW1vdW50T3V0cHV0LCBQYXJzZWFibGVPdXRwdXQsIFN0YWtlYWJsZUxvY2tPdXQgfSBmcm9tICdzcmMvYXBpcy9wbGF0Zm9ybXZtL291dHB1dHMnXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVJbnB1dCwgU0VDUFRyYW5zZmVySW5wdXQsIEFtb3VudElucHV0LCBTdGFrZWFibGVMb2NrSW4gfSBmcm9tICdzcmMvYXBpcy9wbGF0Zm9ybXZtL2lucHV0cydcbmltcG9ydCB7IFVUWE8gfSBmcm9tICdzcmMvYXBpcy9wbGF0Zm9ybXZtL3V0eG9zJ1xuaW1wb3J0IGNyZWF0ZUhhc2ggZnJvbSAnY3JlYXRlLWhhc2gnXG5pbXBvcnQgeyBVbnNpZ25lZFR4LCBUeCB9IGZyb20gJ3NyYy9hcGlzL3BsYXRmb3Jtdm0vdHgnXG5pbXBvcnQgeyBVbml4Tm93IH0gZnJvbSAnc3JjL3V0aWxzL2hlbHBlcmZ1bmN0aW9ucydcbmltcG9ydCB7IFVURjhQYXlsb2FkIH0gZnJvbSAnc3JjL3V0aWxzL3BheWxvYWQnXG5pbXBvcnQgeyBOb2RlSURTdHJpbmdUb0J1ZmZlciB9IGZyb20gJ3NyYy91dGlscy9oZWxwZXJmdW5jdGlvbnMnXG5pbXBvcnQgeyBPTkVBVkFYIH0gZnJvbSAnc3JjL3V0aWxzL2NvbnN0YW50cydcbmltcG9ydCB7IFNlcmlhbGl6YWJsZSwgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nLCBTZXJpYWxpemVkVHlwZSB9IGZyb20gJ3NyYy91dGlscy9zZXJpYWxpemF0aW9uJ1xuaW1wb3J0IHsgQWRkVmFsaWRhdG9yVHggfSBmcm9tICdzcmMvYXBpcy9wbGF0Zm9ybXZtL3ZhbGlkYXRpb250eCdcbmltcG9ydCB7IEdldFJld2FyZFVUWE9zUmVzcG9uc2UgfSBmcm9tICdzcmMvY29tbW9uJ1xuaW1wb3J0IHsgSHR0cFJlc3BvbnNlIH0gZnJvbSAnamVzdC1tb2NrLWF4aW9zL2Rpc3QvbGliL21vY2stYXhpb3MtdHlwZXMnXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IHNlcmlhbGl6ZXIgPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcbmNvbnN0IGRpc3BsYXk6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiZGlzcGxheVwiXG5jb25zdCBkdW1wU2VyaWFsaXphdGlvbjogYm9vbGVhbiA9IGZhbHNlXG5cbmNvbnN0IHNlcmlhbHplaXQgPSAoYVRoaW5nOiBTZXJpYWxpemFibGUsIG5hbWU6IHN0cmluZyk6IHZvaWQgPT4ge1xuICBpZiAoZHVtcFNlcmlhbGl6YXRpb24pIHtcbiAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShzZXJpYWxpemVyLnNlcmlhbGl6ZShhVGhpbmcsIFwicGxhdGZvcm12bVwiLCBcImhleFwiLCBuYW1lICsgXCIgLS0gSGV4IEVuY29kZWRcIikpKVxuICAgIGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHNlcmlhbGl6ZXIuc2VyaWFsaXplKGFUaGluZywgXCJwbGF0Zm9ybXZtXCIsIFwiZGlzcGxheVwiLCBuYW1lICsgXCIgLS0gSHVtYW4tUmVhZGFibGVcIikpKVxuICB9XG59XG5cbmRlc2NyaWJlKCdQbGF0Zm9ybVZNQVBJJywgKCk6IHZvaWQgPT4ge1xuICBjb25zdCBuZXR3b3JrSUQ6IG51bWJlciA9IDEyMzQ1XG4gIGNvbnN0IGJsb2NrY2hhaW5JRDogc3RyaW5nID0gUGxhdGZvcm1DaGFpbklEXG4gIGNvbnN0IGlwOiBzdHJpbmcgPSAnMTI3LjAuMC4xJ1xuICBjb25zdCBwb3J0OiBudW1iZXIgPSA5NjUwXG4gIGNvbnN0IHByb3RvY29sOiBzdHJpbmcgPSAnaHR0cHMnXG5cbiAgY29uc3Qgbm9kZUlEOiBzdHJpbmcgPSBcIk5vZGVJRC1CNkQ0djFWdFBZTGJpVXZZWHRXNFB4OG9FOWltQzJ2R1dcIlxuICBjb25zdCBzdGFydFRpbWU6IEJOID0gVW5peE5vdygpLmFkZChuZXcgQk4oNjAgKiA1KSlcbiAgY29uc3QgZW5kVGltZTogQk4gPSBzdGFydFRpbWUuYWRkKG5ldyBCTigxMjA5NjAwKSlcblxuICBjb25zdCB1c2VybmFtZTogc3RyaW5nID0gJ0F2YUxhYnMnXG4gIGNvbnN0IHBhc3N3b3JkOiBzdHJpbmcgPSAncGFzc3dvcmQnXG5cbiAgY29uc3QgYXZhbGFuY2hlOiBBdmFsYW5jaGUgPSBuZXcgQXZhbGFuY2hlKGlwLCBwb3J0LCBwcm90b2NvbCwgbmV0d29ya0lELCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB0cnVlKVxuICBsZXQgYXBpOiBQbGF0Zm9ybVZNQVBJXG4gIGxldCBhbGlhczogc3RyaW5nXG5cbiAgY29uc3QgYWRkckE6IHN0cmluZyA9ICdQLScgKyBiZWNoMzIuZW5jb2RlKGF2YWxhbmNoZS5nZXRIUlAoKSwgYmVjaDMyLnRvV29yZHMoYmludG9vbHMuY2I1OERlY29kZShcIkI2RDR2MVZ0UFlMYmlVdllYdFc0UHg4b0U5aW1DMnZHV1wiKSkpXG4gIGNvbnN0IGFkZHJCOiBzdHJpbmcgPSAnUC0nICsgYmVjaDMyLmVuY29kZShhdmFsYW5jaGUuZ2V0SFJQKCksIGJlY2gzMi50b1dvcmRzKGJpbnRvb2xzLmNiNThEZWNvZGUoXCJQNXdkUnVaZWFEdDI4ZUhNUDVTM3c5WmRvQmZvN3d1ekZcIikpKVxuICBjb25zdCBhZGRyQzogc3RyaW5nID0gJ1AtJyArIGJlY2gzMi5lbmNvZGUoYXZhbGFuY2hlLmdldEhSUCgpLCBiZWNoMzIudG9Xb3JkcyhiaW50b29scy5jYjU4RGVjb2RlKFwiNlkza3lzakY5am5IbllrZFM5eUdBdW9IeWFlMmVObWVWXCIpKSlcblxuICBiZWZvcmVBbGwoKCk6IHZvaWQgPT4ge1xuICAgIGFwaSA9IG5ldyBQbGF0Zm9ybVZNQVBJKGF2YWxhbmNoZSwgJy9leHQvYmMvUCcpXG4gICAgYWxpYXMgPSBhcGkuZ2V0QmxvY2tjaGFpbkFsaWFzKClcbiAgfSlcblxuICBhZnRlckVhY2goKCk6IHZvaWQgPT4ge1xuICAgIG1vY2tBeGlvcy5yZXNldCgpXG4gIH0pXG5cbiAgdGVzdCgncmVmcmVzaEJsb2NrY2hhaW5JRCcsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBsZXQgbjNiY0lEOiBzdHJpbmcgPSBEZWZhdWx0cy5uZXR3b3JrWzNdLlBbXCJibG9ja2NoYWluSURcIl1cbiAgICBsZXQgdGVzdEFQSTogUGxhdGZvcm1WTUFQSSA9IG5ldyBQbGF0Zm9ybVZNQVBJKGF2YWxhbmNoZSwgJy9leHQvYmMvUCcpXG4gICAgbGV0IGJjMTogc3RyaW5nID0gdGVzdEFQSS5nZXRCbG9ja2NoYWluSUQoKVxuICAgIGV4cGVjdChiYzEpLnRvQmUoUGxhdGZvcm1DaGFpbklEKVxuXG4gICAgdGVzdEFQSS5yZWZyZXNoQmxvY2tjaGFpbklEKClcbiAgICBsZXQgYmMyOiBzdHJpbmcgPSB0ZXN0QVBJLmdldEJsb2NrY2hhaW5JRCgpXG4gICAgZXhwZWN0KGJjMikudG9CZShQbGF0Zm9ybUNoYWluSUQpXG5cbiAgICB0ZXN0QVBJLnJlZnJlc2hCbG9ja2NoYWluSUQobjNiY0lEKVxuICAgIGxldCBiYzM6IHN0cmluZyA9IHRlc3RBUEkuZ2V0QmxvY2tjaGFpbklEKClcbiAgICBleHBlY3QoYmMzKS50b0JlKG4zYmNJRClcblxuICB9KVxuXG4gIHRlc3QoJ2xpc3RBZGRyZXNzZXMnLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgYWRkcmVzc2VzOiBzdHJpbmdbXSA9IFthZGRyQSwgYWRkckJdXG5cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nW10+ID0gYXBpLmxpc3RBZGRyZXNzZXModXNlcm5hbWUsIHBhc3N3b3JkKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBhZGRyZXNzZXMsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmdbXSA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUoYWRkcmVzc2VzKVxuICB9KVxuXG4gIHRlc3QoJ2ltcG9ydEtleScsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBhZGRyZXNzOiBzdHJpbmcgPSBhZGRyQ1xuXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkuaW1wb3J0S2V5KHVzZXJuYW1lLCBwYXNzd29yZCwgJ2tleScpXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIGFkZHJlc3MsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKGFkZHJlc3MpXG4gIH0pXG5cbiAgdGVzdCgnZ2V0QmFsYW5jZScsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBiYWxhbmNlOiBCTiA9IG5ldyBCTignMTAwJywgMTApXG4gICAgY29uc3QgcmVzcG9iajogb2JqZWN0ID0ge1xuICAgICAgYmFsYW5jZSxcbiAgICAgIHV0eG9JRHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwidHhJRFwiOiBcIkxVcmlCM1c5MTlGODRMd1BNTXc0c20yZlo0WTc2V2diNm1zYWF1RVk3aTF0Rk5tdHZcIixcbiAgICAgICAgICBcIm91dHB1dEluZGV4XCI6IDBcbiAgICAgICAgfVxuICAgICAgXVxuICAgIH1cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8b2JqZWN0PiA9IGFwaS5nZXRCYWxhbmNlKGFkZHJBKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDogcmVzcG9iaixcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogb2JqZWN0ID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShyZXNwb25zZSkpLnRvQmUoSlNPTi5zdHJpbmdpZnkocmVzcG9iaikpXG4gIH0pXG5cbiAgdGVzdCgnZ2V0Q3VycmVudFN1cHBseScsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBzdXBwbHk6IEJOID0gbmV3IEJOKCcxMDAwMDAwMDAwMDAwJywgMTApXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPEJOPiA9IGFwaS5nZXRDdXJyZW50U3VwcGx5KClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgc3VwcGx5XG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBCTiA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UudG9TdHJpbmcoMTApKS50b0JlKHN1cHBseS50b1N0cmluZygxMCkpXG4gIH0pXG5cbiAgdGVzdCgnZ2V0SGVpZ2h0JywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IGhlaWdodDogQk4gPSBuZXcgQk4oJzEwMCcsIDEwKVxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxCTj4gPSBhcGkuZ2V0SGVpZ2h0KClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgaGVpZ2h0XG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBCTiA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UudG9TdHJpbmcoMTApKS50b0JlKGhlaWdodC50b1N0cmluZygxMCkpXG4gIH0pXG5cbiAgdGVzdCgnZ2V0TWluU3Rha2UnLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgbWluU3Rha2U6IEJOID0gbmV3IEJOKFwiMjAwMDAwMDAwMDAwMFwiLCAxMClcbiAgICBjb25zdCBtaW5EZWxlZ2F0ZTogQk4gPSBuZXcgQk4oXCIyNTAwMDAwMDAwMFwiLCAxMClcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8b2JqZWN0PiA9IGFwaS5nZXRNaW5TdGFrZSgpXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIG1pblZhbGlkYXRvclN0YWtlOiBcIjIwMDAwMDAwMDAwMDBcIixcbiAgICAgICAgbWluRGVsZWdhdG9yU3Rha2U6IFwiMjUwMDAwMDAwMDBcIlxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogb2JqZWN0ID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZVtcIm1pblZhbGlkYXRvclN0YWtlXCJdLnRvU3RyaW5nKDEwKSkudG9CZShtaW5TdGFrZS50b1N0cmluZygxMCkpXG4gICAgZXhwZWN0KHJlc3BvbnNlW1wibWluRGVsZWdhdG9yU3Rha2VcIl0udG9TdHJpbmcoMTApKS50b0JlKG1pbkRlbGVnYXRlLnRvU3RyaW5nKDEwKSlcbiAgfSlcblxuICB0ZXN0KCdnZXRTdGFrZScsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBzdGFrZWQ6IEJOID0gbmV3IEJOKCcxMDAnLCAxMClcbiAgICBjb25zdCBzdGFrZWRPdXRwdXRzOiBzdHJpbmdbXSA9IFtcbiAgICAgIFwiMHgwMDAwMjFlNjczMTdjYmM0YmUyYWViMDA2NzdhZDY0NjI3NzhhOGY1MjI3NGI5ZDYwNWRmMjU5MWIyMzAyN2E4N2RmZjAwMDAwMDE2MDAwMDAwMDA2MGJkNjE4MDAwMDAwMDA3MDAwMDAwMGZiNzUwNDMwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAxZTcwMDYwYjcwNTFhNDgzOGViZThlMjliY2JlMTQwM2RiOWI4OGNjMzE2ODk1ZWIzXCIsXG4gICAgICBcIjB4MDAwMDIxZTY3MzE3Y2JjNGJlMmFlYjAwNjc3YWQ2NDYyNzc4YThmNTIyNzRiOWQ2MDVkZjI1OTFiMjMwMjdhODdkZmYwMDAwMDAxNjAwMDAwMDAwNjBiZDYxODAwMDAwMDAwNzAwMDAwMGQxOGMyZTI4MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMWU3MDA2MGI3MDUxYTQ4MzhlYmU4ZTI5YmNiZTE0MDNkYjliODhjYzM3MTRkZTc1OVwiLFxuICAgICAgXCIweDAwMDAyMWU2NzMxN2NiYzRiZTJhZWIwMDY3N2FkNjQ2Mjc3OGE4ZjUyMjc0YjlkNjA1ZGYyNTkxYjIzMDI3YTg3ZGZmMDAwMDAwMTYwMDAwMDAwMDYxMzQwODgwMDAwMDAwMDcwMDAwMDAwZmI3NTA0MzAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDFlNzAwNjBiNzA1MWE0ODM4ZWJlOGUyOWJjYmUxNDAzZGI5Yjg4Y2MzNzliODk0NjFcIixcbiAgICAgIFwiMHgwMDAwMjFlNjczMTdjYmM0YmUyYWViMDA2NzdhZDY0NjI3NzhhOGY1MjI3NGI5ZDYwNWRmMjU5MWIyMzAyN2E4N2RmZjAwMDAwMDE2MDAwMDAwMDA2MTM0MDg4MDAwMDAwMDA3MDAwMDAwZDE4YzJlMjgwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAxZTcwMDYwYjcwNTFhNDgzOGViZThlMjliY2JlMTQwM2RiOWI4OGNjM2M3YWEzNWQxXCIsXG4gICAgICBcIjB4MDAwMDIxZTY3MzE3Y2JjNGJlMmFlYjAwNjc3YWQ2NDYyNzc4YThmNTIyNzRiOWQ2MDVkZjI1OTFiMjMwMjdhODdkZmYwMDAwMDAxNjAwMDAwMDAwNjEzNDA4ODAwMDAwMDAwNzAwMDAwMWQxYTk0YTIwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMWU3MDA2MGI3MDUxYTQ4MzhlYmU4ZTI5YmNiZTE0MDNkYjliODhjYzM4ZmQyMzJkOFwiXG4gICAgXVxuICAgIGNvbnN0IG9ianM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gc3Rha2VkT3V0cHV0cy5tYXAoKHN0YWtlZE91dHB1dDogc3RyaW5nKTogVHJhbnNmZXJhYmxlT3V0cHV0ID0+IHtcbiAgICAgIGNvbnN0IHRyYW5zZmVyYWJsZU91dHB1dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dCgpXG4gICAgICBsZXQgYnVmOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShzdGFrZWRPdXRwdXQucmVwbGFjZSgvMHgvZywgXCJcIiksIFwiaGV4XCIpXG4gICAgICB0cmFuc2ZlcmFibGVPdXRwdXQuZnJvbUJ1ZmZlcihidWYsIDIpXG4gICAgICByZXR1cm4gdHJhbnNmZXJhYmxlT3V0cHV0XG4gICAgfSlcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8b2JqZWN0PiA9IGFwaS5nZXRTdGFrZShbYWRkckFdLCBcImhleFwiKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBzdGFrZWQsXG4gICAgICAgIHN0YWtlZE91dHB1dHNcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IG9iamVjdCA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkocmVzcG9uc2VbXCJzdGFrZWRcIl0pKS50b0JlKEpTT04uc3RyaW5naWZ5KHN0YWtlZCkpXG4gICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlW1wic3Rha2VkT3V0cHV0c1wiXSkpLnRvQmUoSlNPTi5zdHJpbmdpZnkob2JqcykpXG4gIH0pXG5cblxuICB0ZXN0KCdhZGRTdWJuZXRWYWxpZGF0b3IgMScsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBub2RlSUQ6IHN0cmluZyA9ICdhYmNkZWYnXG4gICAgY29uc3Qgc3VibmV0SUQ6IHN0cmluZyA9IFwiNFI1cDJSWERHTHFhaWZaRTRoSFdIOW93ZTM0cGZvQlVMbjFEclFUV2l2amc4bzRhSFwiXG4gICAgY29uc3Qgc3RhcnRUaW1lOiBEYXRlID0gbmV3IERhdGUoMTk4NSwgNSwgOSwgMTIsIDU5LCA0MywgOSlcbiAgICBjb25zdCBlbmRUaW1lOiBEYXRlID0gbmV3IERhdGUoMTk4MiwgMywgMSwgMTIsIDU4LCAzMywgNylcbiAgICBjb25zdCB3ZWlnaHQ6IG51bWJlciA9IDEzXG4gICAgY29uc3QgdXR4OiBzdHJpbmcgPSAndmFsaWQnXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkuYWRkU3VibmV0VmFsaWRhdG9yKHVzZXJuYW1lLCBwYXNzd29yZCwgbm9kZUlELCBzdWJuZXRJRCwgc3RhcnRUaW1lLCBlbmRUaW1lLCB3ZWlnaHQpXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIHR4SUQ6IHV0eCxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUodXR4KVxuICB9KVxuXG4gIHRlc3QoJ2FkZFN1Ym5ldFZhbGlkYXRvcicsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBub2RlSUQ6IHN0cmluZyA9ICdhYmNkZWYnXG4gICAgY29uc3Qgc3VibmV0SUQ6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKCdhYmNkZWYnLCAnaGV4JylcbiAgICBjb25zdCBzdGFydFRpbWU6IERhdGUgPSBuZXcgRGF0ZSgxOTg1LCA1LCA5LCAxMiwgNTksIDQzLCA5KVxuICAgIGNvbnN0IGVuZFRpbWU6IERhdGUgPSBuZXcgRGF0ZSgxOTgyLCAzLCAxLCAxMiwgNTgsIDMzLCA3KVxuICAgIGNvbnN0IHdlaWdodDogbnVtYmVyID0gMTNcbiAgICBjb25zdCB1dHg6IHN0cmluZyA9ICd2YWxpZCdcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5hZGRTdWJuZXRWYWxpZGF0b3IodXNlcm5hbWUsIHBhc3N3b3JkLCBub2RlSUQsIHN1Ym5ldElELCBzdGFydFRpbWUsIGVuZFRpbWUsIHdlaWdodClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgdHhJRDogdXR4LFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSh1dHgpXG4gIH0pXG5cbiAgdGVzdCgnYWRkRGVsZWdhdG9yIDEnLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3Qgbm9kZUlEOiBzdHJpbmcgPSAnYWJjZGVmJ1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IG5ldyBEYXRlKDE5ODUsIDUsIDksIDEyLCA1OSwgNDMsIDkpXG4gICAgY29uc3QgZW5kVGltZTogRGF0ZSA9IG5ldyBEYXRlKDE5ODIsIDMsIDEsIDEyLCA1OCwgMzMsIDcpXG4gICAgY29uc3Qgc3Rha2VBbW91bnQ6IEJOID0gbmV3IEJOKDEzKVxuICAgIGNvbnN0IHJld2FyZEFkZHJlc3M6IHN0cmluZyA9ICdmZWRjYmEnXG4gICAgY29uc3QgdXR4OiBzdHJpbmcgPSAndmFsaWQnXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkuYWRkRGVsZWdhdG9yKHVzZXJuYW1lLCBwYXNzd29yZCwgbm9kZUlELCBzdGFydFRpbWUsIGVuZFRpbWUsIHN0YWtlQW1vdW50LCByZXdhcmRBZGRyZXNzKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB0eElEOiB1dHgsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHV0eClcbiAgfSlcblxuICB0ZXN0KCdnZXRCbG9ja2NoYWlucyAxJywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHJlc3A6IG9iamVjdFtdID0gW3tcbiAgICAgIGlkOiAnbm9kZUlEJyxcbiAgICAgIHN1Ym5ldElEOiAnc3VibmV0SUQnLFxuICAgICAgdm1JRDogJ3ZtSUQnLFxuICAgIH1dXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPG9iamVjdFtdPiA9IGFwaS5nZXRCbG9ja2NoYWlucygpXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIGJsb2NrY2hhaW5zOiByZXNwLFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogb2JqZWN0W10gPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHJlc3ApXG4gIH0pXG5cbiAgdGVzdCgnZ2V0U3VibmV0cyAxJywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHJlc3A6IG9iamVjdFtdID0gW3tcbiAgICAgIGlkOiAnaWQnLFxuICAgICAgY29udHJvbEtleXM6IFsnY29udHJvbEtleXMnXSxcbiAgICAgIHRocmVzaG9sZDogJ3RocmVzaG9sZCcsXG4gICAgfV1cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8b2JqZWN0PiA9IGFwaS5nZXRTdWJuZXRzKClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgc3VibmV0czogcmVzcCxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IG9iamVjdCA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvRXF1YWwocmVzcClcbiAgfSlcblxuICB0ZXN0KCdnZXRDdXJyZW50VmFsaWRhdG9ycyAxJywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHZhbGlkYXRvcnM6IHN0cmluZ1tdID0gWyd2YWwxJywgJ3ZhbDInXVxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxvYmplY3Q+ID0gYXBpLmdldEN1cnJlbnRWYWxpZGF0b3JzKClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgdmFsaWRhdG9ycyxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IG9iamVjdCA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvU3RyaWN0RXF1YWwoeyB2YWxpZGF0b3JzIH0pXG4gIH0pXG5cbiAgdGVzdCgnZ2V0Q3VycmVudFZhbGlkYXRvcnMgMicsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBzdWJuZXRJRDogc3RyaW5nID0gJ2FiY2RlZidcbiAgICBjb25zdCB2YWxpZGF0b3JzOiBzdHJpbmdbXSA9IFsndmFsMScsICd2YWwyJ11cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8b2JqZWN0PiA9IGFwaS5nZXRDdXJyZW50VmFsaWRhdG9ycyhzdWJuZXRJRClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgdmFsaWRhdG9ycyxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IG9iamVjdCA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvU3RyaWN0RXF1YWwoeyB2YWxpZGF0b3JzIH0pXG4gIH0pXG5cbiAgdGVzdCgnZ2V0Q3VycmVudFZhbGlkYXRvcnMgMycsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBzdWJuZXRJRDogQnVmZmVyID0gQnVmZmVyLmZyb20oJ2FiY2RlZicsICdoZXgnKVxuICAgIGNvbnN0IHZhbGlkYXRvcnM6IHN0cmluZ1tdID0gWyd2YWwxJywgJ3ZhbDInXVxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxvYmplY3Q+ID0gYXBpLmdldEN1cnJlbnRWYWxpZGF0b3JzKHN1Ym5ldElEKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB2YWxpZGF0b3JzLFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogb2JqZWN0ID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9TdHJpY3RFcXVhbCh7IHZhbGlkYXRvcnMgfSlcbiAgfSlcblxuICB0ZXN0KCdleHBvcnRLZXknLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3Qga2V5OiBzdHJpbmcgPSAnc2RmZ2x2bGoyaDN2NDUnXG5cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5leHBvcnRLZXkodXNlcm5hbWUsIHBhc3N3b3JkLCBhZGRyQSlcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgcHJpdmF0ZUtleToga2V5LFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZShrZXkpXG4gIH0pXG5cbiAgdGVzdChcImV4cG9ydEFWQVhcIiwgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IGFtb3VudDogQk4gPSBuZXcgQk4oMTAwKVxuICAgIGNvbnN0IHRvOiBzdHJpbmcgPSBcImFiY2RlZlwiXG4gICAgY29uc3QgdXNlcm5hbWU6IHN0cmluZyA9IFwiUm9iZXJ0XCJcbiAgICBjb25zdCBwYXNzd29yZDogc3RyaW5nID0gXCJQYXVsc29uXCJcbiAgICBjb25zdCB0eElEOiBzdHJpbmcgPSBcInZhbGlkXCJcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5leHBvcnRBVkFYKHVzZXJuYW1lLCBwYXNzd29yZCwgYW1vdW50LCB0bylcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICBcInJlc3VsdFwiOiB7XG4gICAgICAgIFwidHhJRFwiOiB0eElEXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSh0eElEKVxuICB9KVxuXG4gIHRlc3QoXCJpbXBvcnRBVkFYXCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCB0bzogc3RyaW5nID0gXCJhYmNkZWZcIlxuICAgIGNvbnN0IHVzZXJuYW1lOiBzdHJpbmcgPSBcIlJvYmVydFwiXG4gICAgY29uc3QgcGFzc3dvcmQgPSBcIlBhdWxzb25cIlxuICAgIGNvbnN0IHR4SUQgPSBcInZhbGlkXCJcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5pbXBvcnRBVkFYKHVzZXJuYW1lLCBwYXNzd29yZCwgdG8sIGJsb2NrY2hhaW5JRClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICBcInJlc3VsdFwiOiB7XG4gICAgICAgIFwidHhJRFwiOiB0eElEXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSh0eElEKVxuICB9KVxuXG4gIHRlc3QoJ2NyZWF0ZUJsb2NrY2hhaW4nLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgYmxvY2tjaGFpbklEOiBzdHJpbmcgPSAnN3NpazNQcjZyMUZlTHJ2SzFvV3dFQ0JTOGlKNVZQdVNoJ1xuICAgIGNvbnN0IHZtSUQ6IHN0cmluZyA9ICc3c2lrM1ByNnIxRmVMcnZLMW9Xd0VDQlM4aUo1VlB1U2gnXG4gICAgY29uc3QgbmFtZTogc3RyaW5nID0gJ1NvbWUgQmxvY2tjaGFpbidcbiAgICBjb25zdCBnZW5lc2lzOiBzdHJpbmcgPSAne3J1aDpcInJvaFwifSdcbiAgICBjb25zdCBzdWJuZXRJRDogQnVmZmVyID0gQnVmZmVyLmZyb20oJ2FiY2RlZicsICdoZXgnKVxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXBpLmNyZWF0ZUJsb2NrY2hhaW4odXNlcm5hbWUsIHBhc3N3b3JkLCBzdWJuZXRJRCwgdm1JRCwgWzEsIDIsIDNdLCBuYW1lLCBnZW5lc2lzKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB0eElEOiBibG9ja2NoYWluSUQsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKGJsb2NrY2hhaW5JRClcbiAgfSlcblxuICB0ZXN0KCdnZXRCbG9ja2NoYWluU3RhdHVzJywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IGJsb2NrY2hhaW5JRDogc3RyaW5nID0gJzdzaWszUHI2cjFGZUxydksxb1d3RUNCUzhpSjVWUHVTaCdcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5nZXRCbG9ja2NoYWluU3RhdHVzKGJsb2NrY2hhaW5JRClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgc3RhdHVzOiAnQWNjZXB0ZWQnLFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSgnQWNjZXB0ZWQnKVxuICB9KVxuXG4gIHRlc3QoJ2NyZWF0ZUFkZHJlc3MnLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgYWxpYXM6IHN0cmluZyA9ICdyYW5kb21hbGlhcydcblxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmc+ID0gYXBpLmNyZWF0ZUFkZHJlc3ModXNlcm5hbWUsIHBhc3N3b3JkKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBhZGRyZXNzOiBhbGlhcyxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUoYWxpYXMpXG4gIH0pXG5cbiAgdGVzdCgnY3JlYXRlU3VibmV0IDEnLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgY29udHJvbEtleXM6IHN0cmluZ1tdID0gWydhYmNkZWYnXVxuICAgIGNvbnN0IHRocmVzaG9sZDogbnVtYmVyID0gMTNcbiAgICBjb25zdCB1dHg6IHN0cmluZyA9ICd2YWxpZCdcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nPiA9IGFwaS5jcmVhdGVTdWJuZXQodXNlcm5hbWUsIHBhc3N3b3JkLCBjb250cm9sS2V5cywgdGhyZXNob2xkKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB0eElEOiB1dHgsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmcgPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHV0eClcbiAgfSlcblxuICB0ZXN0KCdzYW1wbGVWYWxpZGF0b3JzIDEnLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgbGV0IHN1Ym5ldElEXG4gICAgY29uc3QgdmFsaWRhdG9yczogc3RyaW5nW10gPSBbJ3ZhbDEnLCAndmFsMiddXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZ1tdPiA9IGFwaS5zYW1wbGVWYWxpZGF0b3JzKDEwLCBzdWJuZXRJRClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgdmFsaWRhdG9ycyxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZ1tdID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSh2YWxpZGF0b3JzKVxuICB9KVxuXG4gIHRlc3QoJ3NhbXBsZVZhbGlkYXRvcnMgMicsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBzdWJuZXRJRDogc3RyaW5nID0gJ2FiY2RlZidcbiAgICBjb25zdCB2YWxpZGF0b3JzOiBzdHJpbmdbXSA9IFsndmFsMScsICd2YWwyJ11cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nW10+ID0gYXBpLnNhbXBsZVZhbGlkYXRvcnMoMTAsIHN1Ym5ldElEKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICB2YWxpZGF0b3JzLFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nW10gPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHZhbGlkYXRvcnMpXG4gIH0pXG5cbiAgdGVzdCgnc2FtcGxlVmFsaWRhdG9ycyAzJywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHN1Ym5ldElEID0gQnVmZmVyLmZyb20oJ2FiY2RlZicsICdoZXgnKVxuICAgIGNvbnN0IHZhbGlkYXRvcnM6IHN0cmluZ1tdID0gWyd2YWwxJywgJ3ZhbDInXVxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmdbXT4gPSBhcGkuc2FtcGxlVmFsaWRhdG9ycygxMCwgc3VibmV0SUQpXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiB7XG4gICAgICAgIHZhbGlkYXRvcnMsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBzdHJpbmdbXSA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUodmFsaWRhdG9ycylcbiAgfSlcblxuICB0ZXN0KCd2YWxpZGF0ZWRCeSAxJywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IGJsb2NrY2hhaW5JRDogc3RyaW5nID0gJ2FiY2RlZidcbiAgICBjb25zdCByZXNwOiBzdHJpbmcgPSAndmFsaWQnXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkudmFsaWRhdGVkQnkoYmxvY2tjaGFpbklEKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBzdWJuZXRJRDogcmVzcCxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyA9IGF3YWl0IHJlc3VsdFxuXG4gICAgZXhwZWN0KG1vY2tBeGlvcy5yZXF1ZXN0KS50b0hhdmVCZWVuQ2FsbGVkVGltZXMoMSlcbiAgICBleHBlY3QocmVzcG9uc2UpLnRvQmUocmVzcClcbiAgfSlcblxuICB0ZXN0KCd2YWxpZGF0ZXMgMScsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBsZXQgc3VibmV0SURcbiAgICBjb25zdCByZXNwOiBzdHJpbmdbXSA9IFsndmFsaWQnXVxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmdbXT4gPSBhcGkudmFsaWRhdGVzKHN1Ym5ldElEKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBibG9ja2NoYWluSURzOiByZXNwLFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nW10gPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHJlc3ApXG4gIH0pXG5cbiAgdGVzdCgndmFsaWRhdGVzIDInLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3Qgc3VibmV0SUQ6IHN0cmluZyA9ICdkZWFkYmVlZidcbiAgICBjb25zdCByZXNwOiBzdHJpbmdbXSA9IFsndmFsaWQnXVxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxzdHJpbmdbXT4gPSBhcGkudmFsaWRhdGVzKHN1Ym5ldElEKVxuICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBibG9ja2NoYWluSURzOiByZXNwLFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nW10gPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKHJlc3ApXG4gIH0pXG5cbiAgdGVzdCgndmFsaWRhdGVzIDMnLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3Qgc3VibmV0SUQgPSBCdWZmZXIuZnJvbSgnYWJjZGVmJywgJ2hleCcpXG4gICAgY29uc3QgcmVzcDogc3RyaW5nW10gPSBbJ3ZhbGlkJ11cbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8c3RyaW5nW10+ID0gYXBpLnZhbGlkYXRlcyhzdWJuZXRJRClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgYmxvY2tjaGFpbklEczogcmVzcCxcbiAgICAgIH0sXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZ1tdID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZShyZXNwKVxuICB9KVxuXG4gIHRlc3QoJ2dldFR4JywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHR4aWQ6IHN0cmluZyA9ICdmOTY2NzUwZjQzODg2N2MzYzk4MjhkZGNkYmU2NjBlMjFjY2RiYjM2YTkyNzY5NThmMDExYmE0NzJmNzVkNGU3J1xuXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZz4gPSBhcGkuZ2V0VHgodHhpZClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgdHg6ICdzb21ldHgnLFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBjb25zdCByZXNwb25zZTogc3RyaW5nID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZSgnc29tZXR4JylcbiAgfSlcblxuXG4gIHRlc3QoJ2dldFR4U3RhdHVzJywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IHR4aWQ6IHN0cmluZyA9ICdmOTY2NzUwZjQzODg2N2MzYzk4MjhkZGNkYmU2NjBlMjFjY2RiYjM2YTkyNzY5NThmMDExYmE0NzJmNzVkNGU3J1xuXG4gICAgY29uc3QgcmVzdWx0OiBQcm9taXNlPHN0cmluZyB8IHsgc3RhdHVzOiBzdHJpbmcsIHJlYXNvbjogc3RyaW5nIH0+ID0gYXBpLmdldFR4U3RhdHVzKHR4aWQpXG4gICAgY29uc3QgcGF5bG9hZDogb2JqZWN0ID0ge1xuICAgICAgcmVzdWx0OiAnYWNjZXB0ZWQnXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICBkYXRhOiBwYXlsb2FkLFxuICAgIH1cblxuICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgY29uc3QgcmVzcG9uc2U6IHN0cmluZyB8IHsgc3RhdHVzOiBzdHJpbmcsIHJlYXNvbjogc3RyaW5nIH0gPSBhd2FpdCByZXN1bHRcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDEpXG4gICAgZXhwZWN0KHJlc3BvbnNlKS50b0JlKCdhY2NlcHRlZCcpXG4gIH0pXG5cbiAgdGVzdCgnZ2V0VVRYT3MnLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgLy8gUGF5bWVudFxuICAgIGNvbnN0IE9QVVRYT3N0cjE6IHN0cmluZyA9IGJpbnRvb2xzLmNiNThFbmNvZGUoQnVmZmVyLmZyb20oJzAwMDAzOGQxYjlmMTEzODY3MmRhNmZiNmMzNTEyNTUzOTI3NmE5YWNjMmE2NjhkNjNiZWE2YmEzYzc5NWUyZWRiMGY1MDAwMDAwMDEzZTA3ZTM4ZTJmMjMxMjFiZTg3NTY0MTJjMThkYjcyNDZhMTZkMjZlZTk5MzZmM2NiYTI4YmUxNDljZmQzNTU4MDAwMDAwMDcwMDAwMDAwMDAwMDA0ZGQ1MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDFhMzZmZDBjMmRiY2FiMzExNzMxZGRlN2VmMTUxNGJkMjZmY2RjNzRkJywgJ2hleCcpKVxuICAgIGNvbnN0IE9QVVRYT3N0cjI6IHN0cmluZyA9IGJpbnRvb2xzLmNiNThFbmNvZGUoQnVmZmVyLmZyb20oJzAwMDBjM2U0ODIzNTcxNTg3ZmUyYmRmYzUwMjY4OWY1YTgyMzhiOWQwZWE3ZjMyNzcxMjRkMTZhZjlkZTBkMmQ5OTExMDAwMDAwMDAzZTA3ZTM4ZTJmMjMxMjFiZTg3NTY0MTJjMThkYjcyNDZhMTZkMjZlZTk5MzZmM2NiYTI4YmUxNDljZmQzNTU4MDAwMDAwMDcwMDAwMDAwMDAwMDAwMDE5MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDFlMWI2YjZhNGJhZDk0ZDJlM2YyMDczMDM3OWI5YmNkNmYxNzYzMThlJywgJ2hleCcpKVxuICAgIGNvbnN0IE9QVVRYT3N0cjM6IHN0cmluZyA9IGJpbnRvb2xzLmNiNThFbmNvZGUoQnVmZmVyLmZyb20oJzAwMDBmMjlkYmE2MWZkYThkNTdhOTExZTdmODgxMGY5MzViZGU4MTBkM2Y4ZDQ5NTQwNDY4NWJkYjhkOWQ4NTQ1ZTg2MDAwMDAwMDAzZTA3ZTM4ZTJmMjMxMjFiZTg3NTY0MTJjMThkYjcyNDZhMTZkMjZlZTk5MzZmM2NiYTI4YmUxNDljZmQzNTU4MDAwMDAwMDcwMDAwMDAwMDAwMDAwMDE5MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDFlMWI2YjZhNGJhZDk0ZDJlM2YyMDczMDM3OWI5YmNkNmYxNzYzMThlJywgJ2hleCcpKVxuXG4gICAgY29uc3Qgc2V0OiBVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKVxuICAgIHNldC5hZGQoT1BVVFhPc3RyMSlcbiAgICBzZXQuYWRkQXJyYXkoW09QVVRYT3N0cjIsIE9QVVRYT3N0cjNdKVxuXG4gICAgY29uc3QgcGVyc2lzdE9wdHM6IFBlcnNpc3RhbmNlT3B0aW9ucyA9IG5ldyBQZXJzaXN0YW5jZU9wdGlvbnMoJ3Rlc3QnLCB0cnVlLCAndW5pb24nKVxuICAgIGV4cGVjdChwZXJzaXN0T3B0cy5nZXRNZXJnZVJ1bGUoKSkudG9CZSgndW5pb24nKVxuICAgIGxldCBhZGRyZXNzZXM6IHN0cmluZ1tdID0gc2V0LmdldEFkZHJlc3NlcygpLm1hcCgoYSk6IHN0cmluZyA9PiBhcGkuYWRkcmVzc0Zyb21CdWZmZXIoYSkpXG4gICAgbGV0IHJlc3VsdDogUHJvbWlzZTx7XG4gICAgICBudW1GZXRjaGVkOiBudW1iZXIsXG4gICAgICB1dHhvczogVVRYT1NldCxcbiAgICAgIGVuZEluZGV4OiB7IGFkZHJlc3M6IHN0cmluZywgdXR4bzogc3RyaW5nIH1cbiAgICB9PiA9IGFwaS5nZXRVVFhPcyhhZGRyZXNzZXMsIGFwaS5nZXRCbG9ja2NoYWluSUQoKSwgMCwgdW5kZWZpbmVkLCBwZXJzaXN0T3B0cylcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgbnVtRmV0Y2hlZDogMyxcbiAgICAgICAgdXR4b3M6IFtPUFVUWE9zdHIxLCBPUFVUWE9zdHIyLCBPUFVUWE9zdHIzXSxcbiAgICAgICAgc3RvcEluZGV4OiB7IGFkZHJlc3M6IFwiYVwiLCB1dHhvOiBcImJcIiB9XG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGxldCByZXNwb25zZTogVVRYT1NldCA9IChhd2FpdCByZXN1bHQpLnV0eG9zXG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShyZXNwb25zZS5nZXRBbGxVVFhPU3RyaW5ncygpLnNvcnQoKSkpLnRvQmUoSlNPTi5zdHJpbmdpZnkoc2V0LmdldEFsbFVUWE9TdHJpbmdzKCkuc29ydCgpKSlcblxuICAgIGFkZHJlc3NlcyA9IHNldC5nZXRBZGRyZXNzZXMoKS5tYXAoKGEpID0+IGFwaS5hZGRyZXNzRnJvbUJ1ZmZlcihhKSlcbiAgICByZXN1bHQgPSBhcGkuZ2V0VVRYT3MoYWRkcmVzc2VzLCBhcGkuZ2V0QmxvY2tjaGFpbklEKCksIDAsIHVuZGVmaW5lZCwgcGVyc2lzdE9wdHMpXG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIHJlc3BvbnNlID0gKGF3YWl0IHJlc3VsdCkudXR4b3NcblxuICAgIGV4cGVjdChtb2NrQXhpb3MucmVxdWVzdCkudG9IYXZlQmVlbkNhbGxlZFRpbWVzKDIpXG4gICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlLmdldEFsbFVUWE9TdHJpbmdzKCkuc29ydCgpKSkudG9CZShKU09OLnN0cmluZ2lmeShzZXQuZ2V0QWxsVVRYT1N0cmluZ3MoKS5zb3J0KCkpKVxuICB9KVxuXG5cbiAgZGVzY3JpYmUoJ1RyYW5zYWN0aW9ucycsICgpOiB2b2lkID0+IHtcbiAgICBsZXQgc2V0OiBVVFhPU2V0XG4gICAgbGV0IGxzZXQ6IFVUWE9TZXRcbiAgICBsZXQga2V5bWdyMjogS2V5Q2hhaW5cbiAgICBsZXQga2V5bWdyMzogS2V5Q2hhaW5cbiAgICBsZXQgYWRkcnMxOiBzdHJpbmdbXVxuICAgIGxldCBhZGRyczI6IHN0cmluZ1tdXG4gICAgbGV0IGFkZHJzMzogc3RyaW5nW11cbiAgICBsZXQgYWRkcmVzc2J1ZmZzOiBCdWZmZXJbXSA9IFtdXG4gICAgbGV0IGFkZHJlc3Nlczogc3RyaW5nW10gPSBbXVxuICAgIGxldCB1dHhvczogVVRYT1tdXG4gICAgbGV0IGx1dHhvczogVVRYT1tdXG4gICAgbGV0IGlucHV0czogVHJhbnNmZXJhYmxlSW5wdXRbXVxuICAgIGxldCBvdXRwdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXVxuICAgIGNvbnN0IGFtbnQ6IG51bWJlciA9IDEwMDAwXG4gICAgY29uc3QgYXNzZXRJRDogQnVmZmVyID0gQnVmZmVyLmZyb20oY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKCdtYXJ5IGhhZCBhIGxpdHRsZSBsYW1iJykuZGlnZXN0KCkpXG4gICAgbGV0IHNlY3BiYXNlMTogU0VDUFRyYW5zZmVyT3V0cHV0XG4gICAgbGV0IHNlY3BiYXNlMjogU0VDUFRyYW5zZmVyT3V0cHV0XG4gICAgbGV0IHNlY3BiYXNlMzogU0VDUFRyYW5zZmVyT3V0cHV0XG4gICAgbGV0IGZ1bmd1dHhvaWRzOiBzdHJpbmdbXSA9IFtdXG4gICAgbGV0IHBsYXRmb3Jtdm06IFBsYXRmb3JtVk1BUElcbiAgICBjb25zdCBmZWU6IG51bWJlciA9IDEwXG4gICAgY29uc3QgbmFtZTogc3RyaW5nID0gJ01vcnR5Y29pbiBpcyB0aGUgZHVtYiBhcyBhIHNhY2sgb2YgaGFtbWVycy4nXG4gICAgY29uc3Qgc3ltYm9sOiBzdHJpbmcgPSAnbW9yVCdcbiAgICBjb25zdCBkZW5vbWluYXRpb246IG51bWJlciA9IDhcblxuICAgIGJlZm9yZUVhY2goYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgcGxhdGZvcm12bSA9IG5ldyBQbGF0Zm9ybVZNQVBJKGF2YWxhbmNoZSwgXCIvZXh0L2JjL1BcIilcbiAgICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxCdWZmZXI+ID0gcGxhdGZvcm12bS5nZXRBVkFYQXNzZXRJRCgpXG4gICAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICAgIHJlc3VsdDoge1xuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgc3ltYm9sLFxuICAgICAgICAgIGFzc2V0SUQ6IGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRCksXG4gICAgICAgICAgZGVub21pbmF0aW9uOiBgJHtkZW5vbWluYXRpb259YCxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgICB9XG5cbiAgICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgICBhd2FpdCByZXN1bHRcbiAgICAgIHNldCA9IG5ldyBVVFhPU2V0KClcbiAgICAgIGxzZXQgPSBuZXcgVVRYT1NldFxuICAgICAgcGxhdGZvcm12bS5uZXdLZXlDaGFpbigpXG4gICAgICBrZXltZ3IyID0gbmV3IEtleUNoYWluKGF2YWxhbmNoZS5nZXRIUlAoKSwgYWxpYXMpXG4gICAgICBrZXltZ3IzID0gbmV3IEtleUNoYWluKGF2YWxhbmNoZS5nZXRIUlAoKSwgYWxpYXMpXG4gICAgICBhZGRyczEgPSBbXVxuICAgICAgYWRkcnMyID0gW11cbiAgICAgIGFkZHJzMyA9IFtdXG4gICAgICB1dHhvcyA9IFtdXG4gICAgICBsdXR4b3MgPSBbXVxuICAgICAgaW5wdXRzID0gW11cbiAgICAgIG91dHB1dHMgPSBbXVxuICAgICAgZnVuZ3V0eG9pZHMgPSBbXVxuICAgICAgY29uc3QgcGxvYWQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygxMDI0KVxuICAgICAgcGxvYWQud3JpdGUoXCJBbGwgeW91IFRyZWtraWVzIGFuZCBUViBhZGRpY3RzLCBEb24ndCBtZWFuIHRvIGRpc3MgZG9uJ3QgbWVhbiB0byBicmluZyBzdGF0aWMuXCIsIDAsIDEwMjQsICd1dGY4JylcblxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICBhZGRyczEucHVzaChwbGF0Zm9ybXZtLmFkZHJlc3NGcm9tQnVmZmVyKHBsYXRmb3Jtdm0ua2V5Q2hhaW4oKS5tYWtlS2V5KCkuZ2V0QWRkcmVzcygpKSlcbiAgICAgICAgYWRkcnMyLnB1c2gocGxhdGZvcm12bS5hZGRyZXNzRnJvbUJ1ZmZlcihrZXltZ3IyLm1ha2VLZXkoKS5nZXRBZGRyZXNzKCkpKVxuICAgICAgICBhZGRyczMucHVzaChwbGF0Zm9ybXZtLmFkZHJlc3NGcm9tQnVmZmVyKGtleW1ncjMubWFrZUtleSgpLmdldEFkZHJlc3MoKSkpXG4gICAgICB9XG4gICAgICBjb25zdCBhbW91bnQ6IEJOID0gT05FQVZBWC5tdWwobmV3IEJOKGFtbnQpKVxuICAgICAgYWRkcmVzc2J1ZmZzID0gcGxhdGZvcm12bS5rZXlDaGFpbigpLmdldEFkZHJlc3NlcygpXG4gICAgICBhZGRyZXNzZXMgPSBhZGRyZXNzYnVmZnMubWFwKChhKSA9PiBwbGF0Zm9ybXZtLmFkZHJlc3NGcm9tQnVmZmVyKGEpKVxuICAgICAgY29uc3QgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDU0MzIxKVxuICAgICAgY29uc3QgdGhyZXNob2xkOiBudW1iZXIgPSAzXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgIGxldCB0eGlkOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShjcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUoYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobmV3IEJOKGkpLCAzMikpLmRpZ2VzdCgpKVxuICAgICAgICBsZXQgdHhpZHg6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgICAgICB0eGlkeC53cml0ZVVJbnQzMkJFKGksIDApXG5cbiAgICAgICAgY29uc3Qgb3V0OiBTRUNQVHJhbnNmZXJPdXRwdXQgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KGFtb3VudCwgYWRkcmVzc2J1ZmZzLCBsb2NrdGltZSwgdGhyZXNob2xkKVxuICAgICAgICBjb25zdCB4ZmVyb3V0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KGFzc2V0SUQsIG91dClcbiAgICAgICAgb3V0cHV0cy5wdXNoKHhmZXJvdXQpXG5cbiAgICAgICAgY29uc3QgdTogVVRYTyA9IG5ldyBVVFhPKClcbiAgICAgICAgdS5mcm9tQnVmZmVyKEJ1ZmZlci5jb25jYXQoW3UuZ2V0Q29kZWNJREJ1ZmZlcigpLCB0eGlkLCB0eGlkeCwgeGZlcm91dC50b0J1ZmZlcigpXSkpXG4gICAgICAgIGZ1bmd1dHhvaWRzLnB1c2godS5nZXRVVFhPSUQoKSlcbiAgICAgICAgdXR4b3MucHVzaCh1KVxuXG4gICAgICAgIHR4aWQgPSB1LmdldFR4SUQoKVxuICAgICAgICB0eGlkeCA9IHUuZ2V0T3V0cHV0SWR4KClcbiAgICAgICAgY29uc3QgYXNzZXQgPSB1LmdldEFzc2V0SUQoKVxuXG4gICAgICAgIGNvbnN0IGlucHV0OiBTRUNQVHJhbnNmZXJJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChhbW91bnQpXG4gICAgICAgIGNvbnN0IHhmZXJpbnB1dDogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQodHhpZCwgdHhpZHgsIGFzc2V0LCBpbnB1dClcbiAgICAgICAgaW5wdXRzLnB1c2goeGZlcmlucHV0KVxuICAgICAgfVxuICAgICAgc2V0LmFkZEFycmF5KHV0eG9zKVxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICBsZXQgdHhpZDogQnVmZmVyID0gQnVmZmVyLmZyb20oY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG5ldyBCTihpKSwgMzIpKS5kaWdlc3QoKSlcbiAgICAgICAgbGV0IHR4aWR4OiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICAgICAgdHhpZHgud3JpdGVVSW50MzJCRShpLCAwKVxuXG4gICAgICAgIGNvbnN0IG91dDogU0VDUFRyYW5zZmVyT3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChPTkVBVkFYLm11bChuZXcgQk4oNSkpLCBhZGRyZXNzYnVmZnMsIGxvY2t0aW1lLCAxKVxuICAgICAgICBjb25zdCBwb3V0OiBQYXJzZWFibGVPdXRwdXQgPSBuZXcgUGFyc2VhYmxlT3V0cHV0KG91dClcbiAgICAgICAgY29uc3QgbG9ja291dDogU3Rha2VhYmxlTG9ja091dCA9IG5ldyBTdGFrZWFibGVMb2NrT3V0KE9ORUFWQVgubXVsKG5ldyBCTig1KSksIGFkZHJlc3NidWZmcywgbG9ja3RpbWUsIDEsIGxvY2t0aW1lLmFkZChuZXcgQk4oODY0MDApKSwgcG91dClcbiAgICAgICAgY29uc3QgeGZlcm91dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChhc3NldElELCBsb2Nrb3V0KVxuXG4gICAgICAgIGNvbnN0IHU6IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgICAgIHUuZnJvbUJ1ZmZlcihCdWZmZXIuY29uY2F0KFt1LmdldENvZGVjSURCdWZmZXIoKSwgdHhpZCwgdHhpZHgsIHhmZXJvdXQudG9CdWZmZXIoKV0pKVxuICAgICAgICBsdXR4b3MucHVzaCh1KVxuICAgICAgfVxuXG4gICAgICBsc2V0LmFkZEFycmF5KGx1dHhvcylcbiAgICAgIGxzZXQuYWRkQXJyYXkoc2V0LmdldEFsbFVUWE9zKCkpXG5cbiAgICAgIHNlY3BiYXNlMSA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQobmV3IEJOKDc3NyksIGFkZHJzMy5tYXAoKGEpID0+IHBsYXRmb3Jtdm0ucGFyc2VBZGRyZXNzKGEpKSwgVW5peE5vdygpLCAxKVxuICAgICAgc2VjcGJhc2UyID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChuZXcgQk4oODg4KSwgYWRkcnMyLm1hcCgoYSkgPT4gcGxhdGZvcm12bS5wYXJzZUFkZHJlc3MoYSkpLCBVbml4Tm93KCksIDEpXG4gICAgICBzZWNwYmFzZTMgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KG5ldyBCTig5OTkpLCBhZGRyczIubWFwKChhKSA9PiBwbGF0Zm9ybXZtLnBhcnNlQWRkcmVzcyhhKSksIFVuaXhOb3coKSwgMSlcbiAgICB9KVxuXG4gICAgdGVzdCgnc2lnblR4JywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgY29uc3QgYXNzZXRJRDogQnVmZmVyID0gYXdhaXQgcGxhdGZvcm12bS5nZXRBVkFYQXNzZXRJRCgpXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkQmFzZVR4KFxuICAgICAgICBuZXR3b3JrSUQsIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSwgbmV3IEJOKGFtbnQpLCBhc3NldElELFxuICAgICAgICBhZGRyczMubWFwKChhKTogQnVmZmVyID0+IHBsYXRmb3Jtdm0ucGFyc2VBZGRyZXNzKGEpKSxcbiAgICAgICAgYWRkcnMxLm1hcCgoYSk6IEJ1ZmZlciA9PiBwbGF0Zm9ybXZtLnBhcnNlQWRkcmVzcyhhKSksXG4gICAgICAgIGFkZHJzMS5tYXAoKGEpOiBCdWZmZXIgPT4gcGxhdGZvcm12bS5wYXJzZUFkZHJlc3MoYSkpLFxuICAgICAgICBwbGF0Zm9ybXZtLmdldFR4RmVlKCksIGFzc2V0SUQsXG4gICAgICAgIHVuZGVmaW5lZCwgVW5peE5vdygpLCBuZXcgQk4oMCksIDEsXG4gICAgICApXG5cbiAgICAgIHR4dTIuc2lnbihwbGF0Zm9ybXZtLmtleUNoYWluKCkpXG4gICAgfSlcblxuICAgIHRlc3QoJ2J1aWxkSW1wb3J0VHgnLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBjb25zdCBsb2NrdGltZTogQk4gPSBuZXcgQk4oMClcbiAgICAgIGNvbnN0IHRocmVzaG9sZDogbnVtYmVyID0gMVxuICAgICAgcGxhdGZvcm12bS5zZXRUeEZlZShuZXcgQk4oZmVlKSlcbiAgICAgIGNvbnN0IGFkZHJidWZmMSA9IGFkZHJzMS5tYXAoKGEpID0+IHBsYXRmb3Jtdm0ucGFyc2VBZGRyZXNzKGEpKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYyID0gYWRkcnMyLm1hcCgoYSkgPT4gcGxhdGZvcm12bS5wYXJzZUFkZHJlc3MoYSkpXG4gICAgICBjb25zdCBhZGRyYnVmZjMgPSBhZGRyczMubWFwKChhKSA9PiBwbGF0Zm9ybXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGZ1bmd1dHhvOiBVVFhPID0gc2V0LmdldFVUWE8oZnVuZ3V0eG9pZHNbMV0pXG4gICAgICBjb25zdCBmdW5ndXR4b3N0cjogc3RyaW5nID0gZnVuZ3V0eG8udG9TdHJpbmcoKVxuXG4gICAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8VW5zaWduZWRUeD4gPSBwbGF0Zm9ybXZtLmJ1aWxkSW1wb3J0VHgoXG4gICAgICAgIHNldCwgYWRkcnMxLCBQbGF0Zm9ybUNoYWluSUQsIGFkZHJzMywgYWRkcnMxLCBhZGRyczIsIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLCBVbml4Tm93KCksIGxvY2t0aW1lLCB0aHJlc2hvbGRcbiAgICAgIClcbiAgICAgIGNvbnN0IHBheWxvYWQ6IG9iamVjdCA9IHtcbiAgICAgICAgcmVzdWx0OiB7XG4gICAgICAgICAgdXR4b3M6IFtmdW5ndXR4b3N0cl1cbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJlc3BvbnNlT2JqOiBIdHRwUmVzcG9uc2UgPSB7XG4gICAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgICB9XG5cbiAgICAgIG1vY2tBeGlvcy5tb2NrUmVzcG9uc2UocmVzcG9uc2VPYmopXG4gICAgICBjb25zdCB0eHUxOiBVbnNpZ25lZFR4ID0gYXdhaXQgcmVzdWx0XG5cbiAgICAgIGNvbnN0IHR4dTI6IFVuc2lnbmVkVHggPSBzZXQuYnVpbGRJbXBvcnRUeChcbiAgICAgICAgbmV0d29ya0lELCBiaW50b29scy5jYjU4RGVjb2RlKGJsb2NrY2hhaW5JRCksXG4gICAgICAgIGFkZHJidWZmMywgYWRkcmJ1ZmYxLCBhZGRyYnVmZjIsIFtmdW5ndXR4b10sIGJpbnRvb2xzLmNiNThEZWNvZGUoUGxhdGZvcm1DaGFpbklEKSwgcGxhdGZvcm12bS5nZXRUeEZlZSgpLCBhd2FpdCBwbGF0Zm9ybXZtLmdldEFWQVhBc3NldElEKCksXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSwgVW5peE5vdygpLCBsb2NrdGltZSwgdGhyZXNob2xkXG4gICAgICApXG5cbiAgICAgIGV4cGVjdCh0eHUyLnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKS50b0JlKHR4dTEudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpXG4gICAgICBleHBlY3QodHh1Mi50b1N0cmluZygpKS50b0JlKHR4dTEudG9TdHJpbmcoKSlcblxuICAgICAgY29uc3QgdHgxOiBUeCA9IHR4dTEuc2lnbihwbGF0Zm9ybXZtLmtleUNoYWluKCkpXG4gICAgICBjb25zdCBjaGVja1R4OiBzdHJpbmcgPSB0eDEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgY29uc3QgdHgxb2JqOiBvYmplY3QgPSB0eDEuc2VyaWFsaXplKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDFzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4MW9iailcblxuICAgICAgY29uc3QgdHgybmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4MXN0cilcbiAgICAgIGNvbnN0IHR4MjogVHggPSBuZXcgVHgoKVxuICAgICAgdHgyLmRlc2VyaWFsaXplKHR4Mm5ld29iaiwgXCJoZXhcIilcblxuICAgICAgZXhwZWN0KHR4Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG5cbiAgICAgIGNvbnN0IHR4MzogVHggPSB0eHUxLnNpZ24ocGxhdGZvcm12bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgdHgzb2JqOiBvYmplY3QgPSB0eDMuc2VyaWFsaXplKGRpc3BsYXkpXG4gICAgICBjb25zdCB0eDNzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4M29iailcblxuICAgICAgY29uc3QgdHg0bmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4M3N0cilcbiAgICAgIGNvbnN0IHR4NDogVHggPSBuZXcgVHgoKVxuICAgICAgdHg0LmRlc2VyaWFsaXplKHR4NG5ld29iaiwgZGlzcGxheSlcblxuICAgICAgZXhwZWN0KHR4NC50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG5cbiAgICAgIHNlcmlhbHplaXQodHgxLCBcIkltcG9ydFR4XCIpXG4gICAgfSlcblxuICAgIHRlc3QoJ2J1aWxkRXhwb3J0VHgnLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG5cbiAgICAgIHBsYXRmb3Jtdm0uc2V0VHhGZWUobmV3IEJOKGZlZSkpXG4gICAgICBjb25zdCBhZGRyYnVmZjEgPSBhZGRyczEubWFwKChhKSA9PiBwbGF0Zm9ybXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGFkZHJidWZmMiA9IGFkZHJzMi5tYXAoKGEpID0+IHBsYXRmb3Jtdm0ucGFyc2VBZGRyZXNzKGEpKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYzID0gYWRkcnMzLm1hcCgoYSkgPT4gcGxhdGZvcm12bS5wYXJzZUFkZHJlc3MoYSkpXG4gICAgICBjb25zdCBhbW91bnQ6IEJOID0gbmV3IEJOKDkwKVxuICAgICAgY29uc3QgdHlwZTogU2VyaWFsaXplZFR5cGUgPSBcImJlY2gzMlwiXG4gICAgICBjb25zdCB0eHUxOiBVbnNpZ25lZFR4ID0gYXdhaXQgcGxhdGZvcm12bS5idWlsZEV4cG9ydFR4KFxuICAgICAgICBzZXQsXG4gICAgICAgIGFtb3VudCxcbiAgICAgICAgYmludG9vbHMuY2I1OERlY29kZShEZWZhdWx0cy5uZXR3b3JrW2F2YWxhbmNoZS5nZXROZXR3b3JrSUQoKV0uWFtcImJsb2NrY2hhaW5JRFwiXSksXG4gICAgICAgIGFkZHJidWZmMy5tYXAoKGEpID0+IHNlcmlhbGl6ZXIuYnVmZmVyVG9UeXBlKGEsIHR5cGUsIGF2YWxhbmNoZS5nZXRIUlAoKSwgXCJQXCIpKSxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczIsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLCBVbml4Tm93KClcbiAgICAgIClcblxuICAgICAgY29uc3QgdHh1MjogVW5zaWduZWRUeCA9IHNldC5idWlsZEV4cG9ydFR4KFxuICAgICAgICBuZXR3b3JrSUQsIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSxcbiAgICAgICAgYW1vdW50LFxuICAgICAgICBhc3NldElELFxuICAgICAgICBhZGRyYnVmZjMsXG4gICAgICAgIGFkZHJidWZmMSxcbiAgICAgICAgYWRkcmJ1ZmYyLFxuICAgICAgICBiaW50b29scy5jYjU4RGVjb2RlKERlZmF1bHRzLm5ldHdvcmtbYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpXS5YW1wiYmxvY2tjaGFpbklEXCJdKSxcbiAgICAgICAgcGxhdGZvcm12bS5nZXRUeEZlZSgpLFxuICAgICAgICBhc3NldElELFxuICAgICAgICBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKS5nZXRQYXlsb2FkKCksIFVuaXhOb3coKVxuICAgICAgKVxuXG4gICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSkudG9CZSh0eHUxLnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKVxuICAgICAgZXhwZWN0KHR4dTIudG9TdHJpbmcoKSkudG9CZSh0eHUxLnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IHR4dTM6IFVuc2lnbmVkVHggPSBhd2FpdCBwbGF0Zm9ybXZtLmJ1aWxkRXhwb3J0VHgoXG4gICAgICAgIHNldCwgYW1vdW50LCBiaW50b29scy5jYjU4RGVjb2RlKERlZmF1bHRzLm5ldHdvcmtbYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpXS5YW1wiYmxvY2tjaGFpbklEXCJdKSxcbiAgICAgICAgYWRkcnMzLCBhZGRyczEsIGFkZHJzMixcbiAgICAgICAgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIiksIFVuaXhOb3coKVxuICAgICAgKVxuXG4gICAgICBjb25zdCB0eHU0OiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkRXhwb3J0VHgoXG4gICAgICAgIG5ldHdvcmtJRCwgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLCBhbW91bnQsXG4gICAgICAgIGFzc2V0SUQsIGFkZHJidWZmMywgYWRkcmJ1ZmYxLCBhZGRyYnVmZjIsIHVuZGVmaW5lZCwgcGxhdGZvcm12bS5nZXRUeEZlZSgpLCBhc3NldElELFxuICAgICAgICBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKS5nZXRQYXlsb2FkKCksIFVuaXhOb3coKVxuICAgICAgKVxuXG4gICAgICBleHBlY3QodHh1NC50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSkudG9CZSh0eHUzLnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKVxuICAgICAgZXhwZWN0KHR4dTQudG9TdHJpbmcoKSkudG9CZSh0eHUzLnRvU3RyaW5nKCkpXG5cbiAgICAgIGV4cGVjdCh0eHUyLnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKS50b0JlKHR4dTEudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpXG4gICAgICBleHBlY3QodHh1Mi50b1N0cmluZygpKS50b0JlKHR4dTEudG9TdHJpbmcoKSlcblxuICAgICAgY29uc3QgdHgxOiBUeCA9IHR4dTEuc2lnbihwbGF0Zm9ybXZtLmtleUNoYWluKCkpXG4gICAgICBjb25zdCBjaGVja1R4OiBzdHJpbmcgPSB0eDEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgY29uc3QgdHgxb2JqOiBvYmplY3QgPSB0eDEuc2VyaWFsaXplKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDFzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4MW9iailcblxuICAgICAgY29uc3QgdHgybmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4MXN0cilcbiAgICAgIGNvbnN0IHR4MjogVHggPSBuZXcgVHgoKVxuICAgICAgdHgyLmRlc2VyaWFsaXplKHR4Mm5ld29iaiwgXCJoZXhcIilcblxuICAgICAgZXhwZWN0KHR4Mi50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG5cbiAgICAgIGNvbnN0IHR4MzogVHggPSB0eHUxLnNpZ24ocGxhdGZvcm12bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgdHgzb2JqOiBvYmplY3QgPSB0eDMuc2VyaWFsaXplKGRpc3BsYXkpXG4gICAgICBjb25zdCB0eDNzdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHR4M29iailcblxuICAgICAgY29uc3QgdHg0bmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHR4M3N0cilcbiAgICAgIGNvbnN0IHR4NDogVHggPSBuZXcgVHgoKVxuICAgICAgdHg0LmRlc2VyaWFsaXplKHR4NG5ld29iaiwgZGlzcGxheSlcblxuICAgICAgZXhwZWN0KHR4NC50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpKS50b0JlKGNoZWNrVHgpXG5cbiAgICAgIHNlcmlhbHplaXQodHgxLCBcIkV4cG9ydFR4XCIpXG5cbiAgICB9KVxuICAgIC8qXG4gICAgICAgIHRlc3QoJ2J1aWxkQWRkU3VibmV0VmFsaWRhdG9yVHgnLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAgICAgcGxhdGZvcm12bS5zZXRGZWUobmV3IEJOKGZlZSkpO1xuICAgICAgICAgIGNvbnN0IGFkZHJidWZmMSA9IGFkZHJzMS5tYXAoKGEpID0+IHBsYXRmb3Jtdm0ucGFyc2VBZGRyZXNzKGEpKTtcbiAgICAgICAgICBjb25zdCBhZGRyYnVmZjIgPSBhZGRyczIubWFwKChhKSA9PiBwbGF0Zm9ybXZtLnBhcnNlQWRkcmVzcyhhKSk7XG4gICAgICAgICAgY29uc3QgYWRkcmJ1ZmYzID0gYWRkcnMzLm1hcCgoYSkgPT4gcGxhdGZvcm12bS5wYXJzZUFkZHJlc3MoYSkpO1xuICAgICAgICAgIGNvbnN0IGFtb3VudDpCTiA9IG5ldyBCTig5MCk7XG4gICAgXG4gICAgICAgICAgY29uc3QgdHh1MTpVbnNpZ25lZFR4ID0gYXdhaXQgcGxhdGZvcm12bS5idWlsZEFkZFN1Ym5ldFZhbGlkYXRvclR4KFxuICAgICAgICAgICAgc2V0LCAgXG4gICAgICAgICAgICBhZGRyczEsIFxuICAgICAgICAgICAgYWRkcnMyLCBcbiAgICAgICAgICAgIG5vZGVJRCwgXG4gICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICBlbmRUaW1lLFxuICAgICAgICAgICAgUGxhdGZvcm1WTUNvbnN0YW50cy5NSU5TVEFLRSxcbiAgICAgICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLCBVbml4Tm93KClcbiAgICAgICAgICApO1xuICAgIFxuICAgICAgICAgIGNvbnN0IHR4dTI6VW5zaWduZWRUeCA9IHNldC5idWlsZEFkZFN1Ym5ldFZhbGlkYXRvclR4KFxuICAgICAgICAgICAgbmV0d29ya0lELCBiaW50b29scy5jYjU4RGVjb2RlKGJsb2NrY2hhaW5JRCksXG4gICAgICAgICAgICBhZGRyYnVmZjEsICAgICAgICAgXG4gICAgICAgICAgICBhZGRyYnVmZjIsIFxuICAgICAgICAgICAgTm9kZUlEU3RyaW5nVG9CdWZmZXIobm9kZUlEKSwgXG4gICAgICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgICAgICBlbmRUaW1lLFxuICAgICAgICAgICAgUGxhdGZvcm1WTUNvbnN0YW50cy5NSU5TVEFLRSxcbiAgICAgICAgICAgIHBsYXRmb3Jtdm0uZ2V0RmVlKCksIFxuICAgICAgICAgICAgYXNzZXRJRCxcbiAgICAgICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSwgVW5peE5vdygpXG4gICAgICAgICAgKTtcbiAgICAgICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSkudG9CZSh0eHUxLnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKTtcbiAgICAgICAgICBleHBlY3QodHh1Mi50b1N0cmluZygpKS50b0JlKHR4dTEudG9TdHJpbmcoKSk7XG4gICAgXG4gICAgICAgIH0pO1xuICAgICovXG4gICAgdGVzdCgnYnVpbGRBZGREZWxlZ2F0b3JUeCAxJywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgY29uc3QgYWRkcmJ1ZmYxID0gYWRkcnMxLm1hcCgoYSkgPT4gcGxhdGZvcm12bS5wYXJzZUFkZHJlc3MoYSkpXG4gICAgICBjb25zdCBhZGRyYnVmZjIgPSBhZGRyczIubWFwKChhKSA9PiBwbGF0Zm9ybXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGFkZHJidWZmMyA9IGFkZHJzMy5tYXAoKGEpID0+IHBsYXRmb3Jtdm0ucGFyc2VBZGRyZXNzKGEpKVxuICAgICAgY29uc3QgYW1vdW50OiBCTiA9IERlZmF1bHRzLm5ldHdvcmtbbmV0d29ya0lEXVtcIlBcIl0ubWluRGVsZWdhdGlvblN0YWtlXG5cbiAgICAgIGNvbnN0IGxvY2t0aW1lOiBCTiA9IG5ldyBCTig1NDMyMSlcbiAgICAgIGNvbnN0IHRocmVzaG9sZDogbnVtYmVyID0gMlxuXG4gICAgICBwbGF0Zm9ybXZtLnNldE1pblN0YWtlKERlZmF1bHRzLm5ldHdvcmtbbmV0d29ya0lEXVtcIlBcIl0ubWluU3Rha2UsIERlZmF1bHRzLm5ldHdvcmtbbmV0d29ya0lEXVtcIlBcIl0ubWluRGVsZWdhdGlvblN0YWtlKVxuXG4gICAgICBjb25zdCB0eHUxOiBVbnNpZ25lZFR4ID0gYXdhaXQgcGxhdGZvcm12bS5idWlsZEFkZERlbGVnYXRvclR4KFxuICAgICAgICBzZXQsXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczIsXG4gICAgICAgIG5vZGVJRCxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbmRUaW1lLFxuICAgICAgICBhbW91bnQsXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgbG9ja3RpbWUsXG4gICAgICAgIHRocmVzaG9sZCxcbiAgICAgICAgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIiksIFVuaXhOb3coKVxuICAgICAgKVxuXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkQWRkRGVsZWdhdG9yVHgoXG4gICAgICAgIG5ldHdvcmtJRCwgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLFxuICAgICAgICBhc3NldElELFxuICAgICAgICBhZGRyYnVmZjMsXG4gICAgICAgIGFkZHJidWZmMSxcbiAgICAgICAgYWRkcmJ1ZmYyLFxuICAgICAgICBOb2RlSURTdHJpbmdUb0J1ZmZlcihub2RlSUQpLFxuICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgIGVuZFRpbWUsXG4gICAgICAgIGFtb3VudCxcbiAgICAgICAgbG9ja3RpbWUsXG4gICAgICAgIHRocmVzaG9sZCxcbiAgICAgICAgYWRkcmJ1ZmYzLFxuICAgICAgICBuZXcgQk4oMCksXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSwgVW5peE5vdygpXG4gICAgICApXG4gICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSkudG9CZSh0eHUxLnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKVxuICAgICAgZXhwZWN0KHR4dTIudG9TdHJpbmcoKSkudG9CZSh0eHUxLnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IHR4MTogVHggPSB0eHUxLnNpZ24ocGxhdGZvcm12bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgY2hlY2tUeDogc3RyaW5nID0gdHgxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MW9iajogb2JqZWN0ID0gdHgxLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgxc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDFvYmopXG5cbiAgICAgIGNvbnN0IHR4Mm5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDFzdHIpXG4gICAgICBjb25zdCB0eDI6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4Mi5kZXNlcmlhbGl6ZSh0eDJuZXdvYmosIFwiaGV4XCIpXG5cbiAgICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBjb25zdCB0eDM6IFR4ID0gdHh1MS5zaWduKHBsYXRmb3Jtdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IHR4M29iajogb2JqZWN0ID0gdHgzLnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHgzc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDNvYmopXG5cbiAgICAgIGNvbnN0IHR4NG5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDNzdHIpXG4gICAgICBjb25zdCB0eDQ6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4NC5kZXNlcmlhbGl6ZSh0eDRuZXdvYmosIGRpc3BsYXkpXG5cbiAgICAgIGV4cGVjdCh0eDQudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBzZXJpYWx6ZWl0KHR4MSwgXCJBZGREZWxlZ2F0b3JUeFwiKVxuICAgIH0pXG5cbiAgICB0ZXN0KCdidWlsZEFkZFZhbGlkYXRvclR4IHNvcnQgU3Rha2VhYmxlTG9ja091dHMgMScsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIC8vIHR3byBVVFhPLiBUaGUgMXN0IGhhcyBhIGxlc3NlciBzdGFrZWFibGVsb2NrdGltZSBhbmQgYSBncmVhdGVyIGFtb3VudCBvZiBBVkFYLiBUaGUgMm5kIGhhcyBhIGdyZWF0ZXIgc3Rha2VhYmxlbG9ja3RpbWUgYW5kIGEgbGVzc2VyIGFtb3VudCBvZiBBVkFYLlxuICAgICAgLy8gV2UgZXhwZWN0IHRoaXMgdGVzdCB0byBvbmx5IGNvbnN1bWUgdGhlIDJuZCBVVFhPIHNpbmNlIGl0IGhhcyB0aGUgZ3JlYXRlciBsb2NrdGltZS5cbiAgICAgIGNvbnN0IGFkZHJidWZmMTogQnVmZmVyW10gPSBhZGRyczEubWFwKChhKSA9PiBwbGF0Zm9ybXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGFtb3VudDE6IEJOID0gbmV3IEJOKCcyMDAwMDAwMDAwMDAwMDAwMCcpXG4gICAgICBjb25zdCBhbW91bnQyOiBCTiA9IG5ldyBCTignMTAwMDAwMDAwMDAwMDAwMDAnKVxuICAgICAgY29uc3QgbG9ja3RpbWUxOiBCTiA9IG5ldyBCTigwKVxuICAgICAgY29uc3QgdGhyZXNob2xkOiBudW1iZXIgPSAxXG5cbiAgICAgIGNvbnN0IHN0YWtlYWJsZUxvY2tUaW1lMTogQk4gPSBuZXcgQk4oMTYzMzgyNDAwMClcbiAgICAgIGNvbnN0IHNlY3BUcmFuc2Zlck91dHB1dDE6IFNFQ1BUcmFuc2Zlck91dHB1dCA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQoYW1vdW50MSwgYWRkcmJ1ZmYxLCBsb2NrdGltZTEsIHRocmVzaG9sZClcbiAgICAgIGNvbnN0IHBhcnNlYWJsZU91dHB1dDE6IFBhcnNlYWJsZU91dHB1dCA9IG5ldyBQYXJzZWFibGVPdXRwdXQoc2VjcFRyYW5zZmVyT3V0cHV0MSlcbiAgICAgIGNvbnN0IHN0YWtlYWJsZUxvY2tPdXQxOiBTdGFrZWFibGVMb2NrT3V0ID0gbmV3IFN0YWtlYWJsZUxvY2tPdXQoYW1vdW50MSwgYWRkcmJ1ZmYxLCBsb2NrdGltZTEsIHRocmVzaG9sZCwgc3Rha2VhYmxlTG9ja1RpbWUxLCBwYXJzZWFibGVPdXRwdXQxKVxuICAgICAgY29uc3Qgc3Rha2VhYmxlTG9ja1RpbWUyOiBCTiA9IG5ldyBCTigxNzMzODI0MDAwKVxuICAgICAgY29uc3Qgc2VjcFRyYW5zZmVyT3V0cHV0MjogU0VDUFRyYW5zZmVyT3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChhbW91bnQyLCBhZGRyYnVmZjEsIGxvY2t0aW1lMSwgdGhyZXNob2xkKVxuICAgICAgY29uc3QgcGFyc2VhYmxlT3V0cHV0MjogUGFyc2VhYmxlT3V0cHV0ID0gbmV3IFBhcnNlYWJsZU91dHB1dChzZWNwVHJhbnNmZXJPdXRwdXQyKVxuICAgICAgY29uc3Qgc3Rha2VhYmxlTG9ja091dDI6IFN0YWtlYWJsZUxvY2tPdXQgPSBuZXcgU3Rha2VhYmxlTG9ja091dChhbW91bnQyLCBhZGRyYnVmZjEsIGxvY2t0aW1lMSwgdGhyZXNob2xkLCBzdGFrZWFibGVMb2NrVGltZTIsIHBhcnNlYWJsZU91dHB1dDIpXG4gICAgICBjb25zdCBub2RlSUQ6IHN0cmluZyA9IFwiTm9kZUlELTM2Z2lGeWU1ZXB3QlRwR3FQazdiNENDWWUzaGZ5b0ZyMVwiXG4gICAgICBjb25zdCBzdGFrZUFtb3VudDogQk4gPSBEZWZhdWx0cy5uZXR3b3JrW25ldHdvcmtJRF1bXCJQXCJdLm1pblN0YWtlXG4gICAgICBwbGF0Zm9ybXZtLnNldE1pblN0YWtlKHN0YWtlQW1vdW50LCBEZWZhdWx0cy5uZXR3b3JrW25ldHdvcmtJRF1bXCJQXCJdLm1pbkRlbGVnYXRpb25TdGFrZSlcbiAgICAgIGNvbnN0IGRlbGVnYXRpb25GZWVSYXRlOiBudW1iZXIgPSBuZXcgQk4oMikudG9OdW1iZXIoKVxuICAgICAgY29uc3QgY29kZWNJRDogbnVtYmVyID0gMFxuICAgICAgY29uc3QgdHhpZDogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZSgnYXVoTUZzMjRmZmMyQlJXS3c2aTdRbmdjczhqU1FVUzlFaTJYd0pzVXBFcTRzVFZpYicpXG4gICAgICBjb25zdCB0eGlkMjogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZSgnMkp3RGZtM0M3cDg4ckpRMVkxeFdMa1dOTUExbnFQenFuYUMySGk0UEROS2lQblhnR3YnKVxuICAgICAgY29uc3Qgb3V0cHV0aWR4MDogbnVtYmVyID0gMFxuICAgICAgY29uc3Qgb3V0cHV0aWR4MTogbnVtYmVyID0gMFxuICAgICAgY29uc3QgYXNzZXRJRCA9IGF3YWl0IHBsYXRmb3Jtdm0uZ2V0QVZBWEFzc2V0SUQoKVxuICAgICAgY29uc3QgYXNzZXRJRDIgPSBhd2FpdCBwbGF0Zm9ybXZtLmdldEFWQVhBc3NldElEKClcbiAgICAgIGNvbnN0IHV0eG8xOiBVVFhPID0gbmV3IFVUWE8oY29kZWNJRCwgdHhpZCwgb3V0cHV0aWR4MCwgYXNzZXRJRCwgc3Rha2VhYmxlTG9ja091dDEpXG4gICAgICBjb25zdCB1dHhvMjogVVRYTyA9IG5ldyBVVFhPKGNvZGVjSUQsIHR4aWQyLCBvdXRwdXRpZHgxLCBhc3NldElEMiwgc3Rha2VhYmxlTG9ja091dDIpXG4gICAgICBjb25zdCB1dHhvU2V0OiBVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKVxuICAgICAgdXR4b1NldC5hZGQodXR4bzEpXG4gICAgICB1dHhvU2V0LmFkZCh1dHhvMilcbiAgICAgIGNvbnN0IHR4dTE6IFVuc2lnbmVkVHggPSBhd2FpdCBwbGF0Zm9ybXZtLmJ1aWxkQWRkVmFsaWRhdG9yVHgoXG4gICAgICAgIHV0eG9TZXQsXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczIsXG4gICAgICAgIG5vZGVJRCxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbmRUaW1lLFxuICAgICAgICBzdGFrZUFtb3VudCxcbiAgICAgICAgYWRkcnMzLFxuICAgICAgICBkZWxlZ2F0aW9uRmVlUmF0ZVxuICAgICAgKVxuICAgICAgY29uc3QgdHggPSB0eHUxLmdldFRyYW5zYWN0aW9uKCkgYXMgQWRkVmFsaWRhdG9yVHhcbiAgICAgIGNvbnN0IGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHR4LmdldElucygpXG4gICAgICAvLyBzdGFydCB0ZXN0IGlucHV0c1xuICAgICAgLy8gY29uZmlybSBvbmx5IDEgaW5wdXRcbiAgICAgIGV4cGVjdChpbnMubGVuZ3RoKS50b0JlKDEpXG4gICAgICBjb25zdCBpbnB1dDogVHJhbnNmZXJhYmxlSW5wdXQgPSBpbnNbMF1cbiAgICAgIGNvbnN0IGFpID0gaW5wdXQuZ2V0SW5wdXQoKSBhcyBBbW91bnRJbnB1dFxuICAgICAgY29uc3QgYW8gPSBzdGFrZWFibGVMb2NrT3V0Mi5nZXRUcmFuc2ZlcmFibGVPdXRwdXQoKS5nZXRPdXRwdXQoKSBhcyBBbW91bnRPdXRwdXRcbiAgICAgIGNvbnN0IGFvMiA9IHN0YWtlYWJsZUxvY2tPdXQxLmdldFRyYW5zZmVyYWJsZU91dHB1dCgpLmdldE91dHB1dCgpIGFzIEFtb3VudE91dHB1dFxuICAgICAgLy8gY29uZmlybSBpbnB1dCBhbW91bnQgbWF0Y2hlcyB0aGUgb3V0cHV0IHcvIHRoZSBncmVhdGVyIHN0YWVrYWJsZWxvY2sgdGltZSBidXQgbGVzc2VyIGFtb3VudFxuICAgICAgZXhwZWN0KGFpLmdldEFtb3VudCgpLnRvU3RyaW5nKCkpLnRvRXF1YWwoYW8uZ2V0QW1vdW50KCkudG9TdHJpbmcoKSlcbiAgICAgIC8vIGNvbmZpcm0gaW5wdXQgYW1vdW50IGRvZXNuJ3QgbWF0Y2ggdGhlIG91dHB1dCB3LyB0aGUgbGVzc2VyIHN0YWVrYWJsZWxvY2sgdGltZSBidXQgZ3JlYXRlciBhbW91bnRcbiAgICAgIGV4cGVjdChhaS5nZXRBbW91bnQoKS50b1N0cmluZygpKS5ub3QudG9FcXVhbChhbzIuZ2V0QW1vdW50KCkudG9TdHJpbmcoKSlcblxuICAgICAgY29uc3Qgc2xpOiBTdGFrZWFibGVMb2NrSW4gPSBpbnB1dC5nZXRJbnB1dCgpIGFzIFN0YWtlYWJsZUxvY2tJblxuICAgICAgLy8gY29uZmlybSBpbnB1dCBzdGFrZWFibGVsb2NrIHRpbWUgbWF0Y2hlcyB0aGUgb3V0cHV0IHcvIHRoZSBncmVhdGVyIHN0YWtlYWJsZWxvY2sgdGltZSBidXQgbGVzc2VyIGFtb3VudCBcbiAgICAgIGV4cGVjdChzbGkuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS50b1N0cmluZygpKS50b0VxdWFsKHN0YWtlYWJsZUxvY2tPdXQyLmdldFN0YWtlYWJsZUxvY2t0aW1lKCkudG9TdHJpbmcoKSlcbiAgICAgIC8vIGNvbmZpcm0gaW5wdXQgc3Rha2VhYmxlbG9jayB0aW1lIGRvZXNuJ3QgbWF0Y2ggdGhlIG91dHB1dCB3LyB0aGUgbGVzc2VyIHN0YWtlYWJsZWxvY2sgdGltZSBidXQgZ3JlYXRlciBhbW91bnRcbiAgICAgIGV4cGVjdChzbGkuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS50b1N0cmluZygpKS5ub3QudG9FcXVhbChzdGFrZWFibGVMb2NrT3V0MS5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvU3RyaW5nKCkpXG4gICAgICAvLyBzdG9wIHRlc3QgaW5wdXRzXG5cbiAgICAgIC8vIHN0YXJ0IHRlc3Qgb3V0cHV0c1xuICAgICAgY29uc3Qgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB0eC5nZXRPdXRzKClcbiAgICAgIC8vIGNvbmZpcm0gb25seSAxIG91dHB1dFxuICAgICAgZXhwZWN0KG91dHMubGVuZ3RoKS50b0JlKDEpXG4gICAgICBjb25zdCBvdXRwdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG91dHNbMF1cbiAgICAgIGNvbnN0IGFvMyA9IG91dHB1dC5nZXRPdXRwdXQoKSBhcyBBbW91bnRPdXRwdXRcbiAgICAgIC8vIGNvbmZpcm0gb3V0cHV0IGFtb3VudCBtYXRjaGVzIHRoZSBvdXRwdXQgdy8gdGhlIGdyZWF0ZXIgc3Rha2VhYmxlbG9jayB0aW1lIGJ1dCBsZXNzZXIgYW1vdW50IHNhbnMgdGhlIHN0YWtlIGFtb3VudFxuICAgICAgZXhwZWN0KGFvMy5nZXRBbW91bnQoKS50b1N0cmluZygpKS50b0VxdWFsKGFvLmdldEFtb3VudCgpLnN1YihzdGFrZUFtb3VudCkudG9TdHJpbmcoKSlcbiAgICAgIC8vIGNvbmZpcm0gb3V0cHV0IGFtb3VudCBkb2Vzbid0IG1hdGNoIHRoZSBvdXRwdXQgdy8gdGhlIGxlc3NlciBzdGFrZWFibGVsb2NrIHRpbWUgYnV0IGdyZWF0ZXIgYW1vdW50XG4gICAgICBleHBlY3QoYW8zLmdldEFtb3VudCgpLnRvU3RyaW5nKCkpLm5vdC50b0VxdWFsKGFvMi5nZXRBbW91bnQoKS50b1N0cmluZygpKVxuXG4gICAgICBjb25zdCBzbG86IFN0YWtlYWJsZUxvY2tPdXQgPSBvdXRwdXQuZ2V0T3V0cHV0KCkgYXMgU3Rha2VhYmxlTG9ja091dFxuICAgICAgLy8gY29uZmlybSBvdXRwdXQgc3Rha2VhYmxlbG9jayB0aW1lIG1hdGNoZXMgdGhlIG91dHB1dCB3LyB0aGUgZ3JlYXRlciBzdGFrZWFibGVsb2NrIHRpbWUgYnV0IGxlc3NlciBhbW91bnQgXG4gICAgICBleHBlY3Qoc2xvLmdldFN0YWtlYWJsZUxvY2t0aW1lKCkudG9TdHJpbmcoKSkudG9FcXVhbChzdGFrZWFibGVMb2NrT3V0Mi5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvU3RyaW5nKCkpXG4gICAgICAvLyBjb25maXJtIG91dHB1dCBzdGFrZWFibGVsb2NrIHRpbWUgZG9lc24ndCBtYXRjaCB0aGUgb3V0cHV0IHcvIHRoZSBncmVhdGVyIHN0YWtlYWJsZWxvY2sgdGltZSBidXQgbGVzc2VyIGFtb3VudCBcbiAgICAgIGV4cGVjdChzbG8uZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS50b1N0cmluZygpKS5ub3QudG9FcXVhbChzdGFrZWFibGVMb2NrT3V0MS5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvU3RyaW5nKCkpXG5cbiAgICAgIC8vIGNvbmZpcm0gdHggbm9kZUlEIG1hdGNoZXMgbm9kZUlEXG4gICAgICBleHBlY3QodHguZ2V0Tm9kZUlEU3RyaW5nKCkpLnRvRXF1YWwobm9kZUlEKVxuICAgICAgLy8gY29uZmlybSB0eCBzdGFydHRpbWUgbWF0Y2hlcyBzdGFydHRpbWVcbiAgICAgIGV4cGVjdCh0eC5nZXRTdGFydFRpbWUoKS50b1N0cmluZygpKS50b0VxdWFsKHN0YXJ0VGltZS50b1N0cmluZygpKVxuICAgICAgLy8gY29uZmlybSB0eCBlbmR0aW1lIG1hdGNoZXMgZW5kdGltZSBcbiAgICAgIGV4cGVjdCh0eC5nZXRFbmRUaW1lKCkudG9TdHJpbmcoKSkudG9FcXVhbChlbmRUaW1lLnRvU3RyaW5nKCkpXG4gICAgICAvLyBjb25maXJtIHR4IHN0YWtlIGFtb3VudCBtYXRjaGVzIHN0YWtlQW1vdW50XG4gICAgICBleHBlY3QodHguZ2V0U3Rha2VBbW91bnQoKS50b1N0cmluZygpKS50b0VxdWFsKHN0YWtlQW1vdW50LnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IHN0YWtlT3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB0eC5nZXRTdGFrZU91dHMoKVxuICAgICAgLy8gY29uZmlybSBvbmx5IDEgc3Rha2VPdXRcbiAgICAgIGV4cGVjdChzdGFrZU91dHMubGVuZ3RoKS50b0JlKDEpXG5cbiAgICAgIGNvbnN0IHN0YWtlT3V0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBzdGFrZU91dHNbMF1cbiAgICAgIGNvbnN0IHNsbzIgPSBzdGFrZU91dC5nZXRPdXRwdXQoKSBhcyBTdGFrZWFibGVMb2NrT3V0XG4gICAgICAvLyBjb25maXJtIHN0YWtlT3V0IHN0YWtlYWJsZWxvY2sgdGltZSBtYXRjaGVzIHRoZSBvdXRwdXQgdy8gdGhlIGdyZWF0ZXIgc3Rha2VhYmxlbG9jayB0aW1lIGJ1dCBsZXNzZXIgYW1vdW50IFxuICAgICAgZXhwZWN0KHNsbzIuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS50b1N0cmluZygpKS50b0VxdWFsKHN0YWtlYWJsZUxvY2tPdXQyLmdldFN0YWtlYWJsZUxvY2t0aW1lKCkudG9TdHJpbmcoKSlcbiAgICAgIC8vIGNvbmZpcm0gc3Rha2VPdXQgc3Rha2VhYmxlbG9jayB0aW1lIGRvZXNuJ3QgbWF0Y2ggdGhlIG91dHB1dCB3LyB0aGUgZ3JlYXRlciBzdGFrZWFibGVsb2NrIHRpbWUgYnV0IGxlc3NlciBhbW91bnQgXG4gICAgICBleHBlY3Qoc2xvMi5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvU3RyaW5nKCkpLm5vdC50b0VxdWFsKHN0YWtlYWJsZUxvY2tPdXQxLmdldFN0YWtlYWJsZUxvY2t0aW1lKCkudG9TdHJpbmcoKSlcbiAgICAgIHNsbzIuZ2V0QW1vdW50KClcbiAgICAgIC8vIGNvbmZpcm0gc3Rha2VPdXQgc3Rha2UgYW1vdW50IG1hdGNoZXMgc3Rha2VBbW91bnRcbiAgICAgIGV4cGVjdChzbG8yLmdldEFtb3VudCgpLnRvU3RyaW5nKCkpLnRvRXF1YWwoc3Rha2VBbW91bnQudG9TdHJpbmcoKSlcbiAgICB9KVxuXG4gICAgdGVzdCgnYnVpbGRBZGRWYWxpZGF0b3JUeCBzb3J0IFN0YWtlYWJsZUxvY2tPdXRzIDInLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICAvLyB0d28gVVRYTy4gVGhlIDFzdCBoYXMgYSBsZXNzZXIgc3Rha2VhYmxlbG9ja3RpbWUgYW5kIGEgZ3JlYXRlciBhbW91bnQgb2YgQVZBWC4gVGhlIDJuZCBoYXMgYSBncmVhdGVyIHN0YWtlYWJsZWxvY2t0aW1lIGFuZCBhIGxlc3NlciBhbW91bnQgb2YgQVZBWC5cbiAgICAgIC8vIHRoaXMgdGltZSB3ZSdyZSBzdGFraW5nIGEgZ3JlYXRlciBhbW91bnQgdGhhbiBpcyBhdmFpbGFibGUgaW4gdGhlIDJuZCBVVFhPLlxuICAgICAgLy8gV2UgZXhwZWN0IHRoaXMgdGVzdCB0byBjb25zdW1lIHRoZSBmdWxsIDJuZCBVVFhPIGFuZCBhIGZyYWN0aW9uIG9mIHRoZSAxc3QgVVRYTy4uXG4gICAgICBjb25zdCBhZGRyYnVmZjE6IEJ1ZmZlcltdID0gYWRkcnMxLm1hcCgoYSk6IEJ1ZmZlciA9PiBwbGF0Zm9ybXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGFtb3VudDE6IEJOID0gbmV3IEJOKCcyMDAwMDAwMDAwMDAwMDAwMCcpXG4gICAgICBjb25zdCBhbW91bnQyOiBCTiA9IG5ldyBCTignMTAwMDAwMDAwMDAwMDAwMDAnKVxuICAgICAgY29uc3QgbG9ja3RpbWUxOiBCTiA9IG5ldyBCTigwKVxuICAgICAgY29uc3QgdGhyZXNob2xkOiBudW1iZXIgPSAxXG5cbiAgICAgIGNvbnN0IHN0YWtlYWJsZUxvY2tUaW1lMTogQk4gPSBuZXcgQk4oMTYzMzgyNDAwMClcbiAgICAgIGNvbnN0IHNlY3BUcmFuc2Zlck91dHB1dDE6IFNFQ1BUcmFuc2Zlck91dHB1dCA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQoYW1vdW50MSwgYWRkcmJ1ZmYxLCBsb2NrdGltZTEsIHRocmVzaG9sZClcbiAgICAgIGNvbnN0IHBhcnNlYWJsZU91dHB1dDE6IFBhcnNlYWJsZU91dHB1dCA9IG5ldyBQYXJzZWFibGVPdXRwdXQoc2VjcFRyYW5zZmVyT3V0cHV0MSlcbiAgICAgIGNvbnN0IHN0YWtlYWJsZUxvY2tPdXQxOiBTdGFrZWFibGVMb2NrT3V0ID0gbmV3IFN0YWtlYWJsZUxvY2tPdXQoYW1vdW50MSwgYWRkcmJ1ZmYxLCBsb2NrdGltZTEsIHRocmVzaG9sZCwgc3Rha2VhYmxlTG9ja1RpbWUxLCBwYXJzZWFibGVPdXRwdXQxKVxuICAgICAgY29uc3Qgc3Rha2VhYmxlTG9ja1RpbWUyOiBCTiA9IG5ldyBCTigxNzMzODI0MDAwKVxuICAgICAgY29uc3Qgc2VjcFRyYW5zZmVyT3V0cHV0MjogU0VDUFRyYW5zZmVyT3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChhbW91bnQyLCBhZGRyYnVmZjEsIGxvY2t0aW1lMSwgdGhyZXNob2xkKVxuICAgICAgY29uc3QgcGFyc2VhYmxlT3V0cHV0MjogUGFyc2VhYmxlT3V0cHV0ID0gbmV3IFBhcnNlYWJsZU91dHB1dChzZWNwVHJhbnNmZXJPdXRwdXQyKVxuICAgICAgY29uc3Qgc3Rha2VhYmxlTG9ja091dDI6IFN0YWtlYWJsZUxvY2tPdXQgPSBuZXcgU3Rha2VhYmxlTG9ja091dChhbW91bnQyLCBhZGRyYnVmZjEsIGxvY2t0aW1lMSwgdGhyZXNob2xkLCBzdGFrZWFibGVMb2NrVGltZTIsIHBhcnNlYWJsZU91dHB1dDIpXG4gICAgICBjb25zdCBub2RlSUQ6IHN0cmluZyA9IFwiTm9kZUlELTM2Z2lGeWU1ZXB3QlRwR3FQazdiNENDWWUzaGZ5b0ZyMVwiXG4gICAgICBjb25zdCBzdGFrZUFtb3VudDogQk4gPSBuZXcgQk4oJzEwMDAwMDAzMDAwMDAwMDAwJylcbiAgICAgIHBsYXRmb3Jtdm0uc2V0TWluU3Rha2Uoc3Rha2VBbW91bnQsIERlZmF1bHRzLm5ldHdvcmtbbmV0d29ya0lEXVtcIlBcIl0ubWluRGVsZWdhdGlvblN0YWtlKVxuICAgICAgY29uc3QgZGVsZWdhdGlvbkZlZVJhdGU6IG51bWJlciA9IG5ldyBCTigyKS50b051bWJlcigpXG4gICAgICBjb25zdCBjb2RlY0lEOiBudW1iZXIgPSAwXG4gICAgICBjb25zdCB0eGlkOiBCdWZmZXIgPSBiaW50b29scy5jYjU4RGVjb2RlKCdhdWhNRnMyNGZmYzJCUldLdzZpN1FuZ2NzOGpTUVVTOUVpMlh3SnNVcEVxNHNUVmliJylcbiAgICAgIGNvbnN0IHR4aWQyOiBCdWZmZXIgPSBiaW50b29scy5jYjU4RGVjb2RlKCcySndEZm0zQzdwODhySlExWTF4V0xrV05NQTFucVB6cW5hQzJIaTRQRE5LaVBuWGdHdicpXG4gICAgICBjb25zdCBvdXRwdXRpZHgwOiBudW1iZXIgPSAwXG4gICAgICBjb25zdCBvdXRwdXRpZHgxOiBudW1iZXIgPSAwXG4gICAgICBjb25zdCBhc3NldElEOiBCdWZmZXIgPSBhd2FpdCBwbGF0Zm9ybXZtLmdldEFWQVhBc3NldElEKClcbiAgICAgIGNvbnN0IGFzc2V0SUQyOiBCdWZmZXIgPSBhd2FpdCBwbGF0Zm9ybXZtLmdldEFWQVhBc3NldElEKClcbiAgICAgIGNvbnN0IHV0eG8xOiBVVFhPID0gbmV3IFVUWE8oY29kZWNJRCwgdHhpZCwgb3V0cHV0aWR4MCwgYXNzZXRJRCwgc3Rha2VhYmxlTG9ja091dDEpXG4gICAgICBjb25zdCB1dHhvMjogVVRYTyA9IG5ldyBVVFhPKGNvZGVjSUQsIHR4aWQyLCBvdXRwdXRpZHgxLCBhc3NldElEMiwgc3Rha2VhYmxlTG9ja091dDIpXG4gICAgICBjb25zdCB1dHhvU2V0OiBVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKVxuICAgICAgdXR4b1NldC5hZGQodXR4bzEpXG4gICAgICB1dHhvU2V0LmFkZCh1dHhvMilcbiAgICAgIGNvbnN0IHR4dTE6IFVuc2lnbmVkVHggPSBhd2FpdCBwbGF0Zm9ybXZtLmJ1aWxkQWRkVmFsaWRhdG9yVHgoXG4gICAgICAgIHV0eG9TZXQsXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczIsXG4gICAgICAgIG5vZGVJRCxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbmRUaW1lLFxuICAgICAgICBzdGFrZUFtb3VudCxcbiAgICAgICAgYWRkcnMzLFxuICAgICAgICBkZWxlZ2F0aW9uRmVlUmF0ZVxuICAgICAgKVxuICAgICAgY29uc3QgdHggPSB0eHUxLmdldFRyYW5zYWN0aW9uKCkgYXMgQWRkVmFsaWRhdG9yVHhcbiAgICAgIGNvbnN0IGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHR4LmdldElucygpXG4gICAgICAvLyBzdGFydCB0ZXN0IGlucHV0c1xuICAgICAgLy8gY29uZmlybSBvbmx5IDEgaW5wdXRcbiAgICAgIGV4cGVjdChpbnMubGVuZ3RoKS50b0JlKDIpXG4gICAgICBjb25zdCBpbnB1dDE6IFRyYW5zZmVyYWJsZUlucHV0ID0gaW5zWzBdXG4gICAgICBjb25zdCBpbnB1dDI6IFRyYW5zZmVyYWJsZUlucHV0ID0gaW5zWzFdXG4gICAgICBjb25zdCBhaTEgPSBpbnB1dDEuZ2V0SW5wdXQoKSBhcyBBbW91bnRJbnB1dFxuICAgICAgY29uc3QgYWkyID0gaW5wdXQyLmdldElucHV0KCkgYXMgQW1vdW50SW5wdXRcbiAgICAgIGNvbnN0IGFvMSA9IHN0YWtlYWJsZUxvY2tPdXQyLmdldFRyYW5zZmVyYWJsZU91dHB1dCgpLmdldE91dHB1dCgpIGFzIEFtb3VudE91dHB1dFxuICAgICAgY29uc3QgYW8yID0gc3Rha2VhYmxlTG9ja091dDEuZ2V0VHJhbnNmZXJhYmxlT3V0cHV0KCkuZ2V0T3V0cHV0KCkgYXMgQW1vdW50T3V0cHV0XG4gICAgICAvLyBjb25maXJtIGVhY2ggaW5wdXQgYW1vdW50IG1hdGNoZXMgdGhlIGNvcnJlc3BvbmRpbmcgb3V0cHV0IFxuICAgICAgZXhwZWN0KGFpMi5nZXRBbW91bnQoKS50b1N0cmluZygpKS50b0VxdWFsKGFvMS5nZXRBbW91bnQoKS50b1N0cmluZygpKVxuICAgICAgZXhwZWN0KGFpMS5nZXRBbW91bnQoKS50b1N0cmluZygpKS50b0VxdWFsKGFvMi5nZXRBbW91bnQoKS50b1N0cmluZygpKVxuXG4gICAgICBjb25zdCBzbGkxID0gaW5wdXQxLmdldElucHV0KCkgYXMgU3Rha2VhYmxlTG9ja0luXG4gICAgICBjb25zdCBzbGkyID0gaW5wdXQyLmdldElucHV0KCkgYXMgU3Rha2VhYmxlTG9ja0luXG4gICAgICAvLyBjb25maXJtIGlucHV0IHN0cmFrZWFibGVsb2NrIHRpbWUgbWF0Y2hlcyB0aGUgb3V0cHV0IHcvIHRoZSBncmVhdGVyIHN0YWVrYWJsZWxvY2sgdGltZSBidXQgbGVzc2VyIGFtb3VudCBcbiAgICAgIGV4cGVjdChzbGkxLmdldFN0YWtlYWJsZUxvY2t0aW1lKCkudG9TdHJpbmcoKSkudG9FcXVhbChzdGFrZWFibGVMb2NrT3V0MS5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvU3RyaW5nKCkpXG4gICAgICBleHBlY3Qoc2xpMi5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvU3RyaW5nKCkpLnRvRXF1YWwoc3Rha2VhYmxlTG9ja091dDIuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS50b1N0cmluZygpKVxuICAgICAgLy8gc3RvcCB0ZXN0IGlucHV0c1xuXG4gICAgICAvLyBzdGFydCB0ZXN0IG91dHB1dHNcbiAgICAgIGNvbnN0IG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gdHguZ2V0T3V0cygpXG4gICAgICAvLyBjb25maXJtIG9ubHkgMSBvdXRwdXRcbiAgICAgIGV4cGVjdChvdXRzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgY29uc3Qgb3V0cHV0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBvdXRzWzBdXG4gICAgICBjb25zdCBhbzMgPSBvdXRwdXQuZ2V0T3V0cHV0KCkgYXMgQW1vdW50T3V0cHV0XG4gICAgICAvLyBjb25maXJtIG91dHB1dCBhbW91bnQgbWF0Y2hlcyB0aGUgb3V0cHV0IGFtb3VudCBzYW5zIHRoZSAybmQgdXR4byBhbW91bnQgYW5kIHRoZSBzdGFrZSBhbW91bnRcbiAgICAgIGV4cGVjdChhbzMuZ2V0QW1vdW50KCkudG9TdHJpbmcoKSkudG9FcXVhbChhbzIuZ2V0QW1vdW50KCkuc3ViKHN0YWtlQW1vdW50LnN1YihhbzEuZ2V0QW1vdW50KCkpKS50b1N0cmluZygpKVxuXG4gICAgICBjb25zdCBzbG8gPSBvdXRwdXQuZ2V0T3V0cHV0KCkgYXMgU3Rha2VhYmxlTG9ja091dFxuICAgICAgLy8gY29uZmlybSBvdXRwdXQgc3Rha2VhYmxlbG9jayB0aW1lIG1hdGNoZXMgdGhlIG91dHB1dCB3LyB0aGUgbGVzc2VyIHN0YWtlYWJsZWxvY2sgc2luY2UgdGhlIG90aGVyIHdhcyBjb25zdW1lZFxuICAgICAgZXhwZWN0KHNsby5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvU3RyaW5nKCkpLnRvRXF1YWwoc3Rha2VhYmxlTG9ja091dDEuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS50b1N0cmluZygpKVxuICAgICAgLy8gY29uZmlybSBvdXRwdXQgc3Rha2VhYmxlbG9jayB0aW1lIGRvZXNuJ3QgbWF0Y2ggdGhlIG91dHB1dCB3LyB0aGUgZ3JlYXRlciBzdGFrZWFibGVsb2NrIHRpbWUgIFxuICAgICAgZXhwZWN0KHNsby5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvU3RyaW5nKCkpLm5vdC50b0VxdWFsKHN0YWtlYWJsZUxvY2tPdXQyLmdldFN0YWtlYWJsZUxvY2t0aW1lKCkudG9TdHJpbmcoKSlcblxuICAgICAgLy8gY29uZmlybSB0eCBub2RlSUQgbWF0Y2hlcyBub2RlSURcbiAgICAgIGV4cGVjdCh0eC5nZXROb2RlSURTdHJpbmcoKSkudG9FcXVhbChub2RlSUQpXG4gICAgICAvLyBjb25maXJtIHR4IHN0YXJ0dGltZSBtYXRjaGVzIHN0YXJ0dGltZVxuICAgICAgZXhwZWN0KHR4LmdldFN0YXJ0VGltZSgpLnRvU3RyaW5nKCkpLnRvRXF1YWwoc3RhcnRUaW1lLnRvU3RyaW5nKCkpXG4gICAgICAvLyBjb25maXJtIHR4IGVuZHRpbWUgbWF0Y2hlcyBlbmR0aW1lIFxuICAgICAgZXhwZWN0KHR4LmdldEVuZFRpbWUoKS50b1N0cmluZygpKS50b0VxdWFsKGVuZFRpbWUudG9TdHJpbmcoKSlcbiAgICAgIC8vIGNvbmZpcm0gdHggc3Rha2UgYW1vdW50IG1hdGNoZXMgc3Rha2VBbW91bnRcbiAgICAgIGV4cGVjdCh0eC5nZXRTdGFrZUFtb3VudCgpLnRvU3RyaW5nKCkpLnRvRXF1YWwoc3Rha2VBbW91bnQudG9TdHJpbmcoKSlcblxuICAgICAgbGV0IHN0YWtlT3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB0eC5nZXRTdGFrZU91dHMoKVxuICAgICAgLy8gY29uZmlybSAyIHN0YWtlT3V0c1xuICAgICAgZXhwZWN0KHN0YWtlT3V0cy5sZW5ndGgpLnRvQmUoMilcblxuICAgICAgbGV0IHN0YWtlT3V0MTogVHJhbnNmZXJhYmxlT3V0cHV0ID0gc3Rha2VPdXRzWzBdXG4gICAgICBsZXQgc3Rha2VPdXQyOiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBzdGFrZU91dHNbMV1cbiAgICAgIGxldCBzbG8yID0gc3Rha2VPdXQxLmdldE91dHB1dCgpIGFzIFN0YWtlYWJsZUxvY2tPdXRcbiAgICAgIGxldCBzbG8zID0gc3Rha2VPdXQyLmdldE91dHB1dCgpIGFzIFN0YWtlYWJsZUxvY2tPdXRcbiAgICAgIC8vIGNvbmZpcm0gYm90aCBzdGFrZU91dCBzdHJha2VhYmxlbG9jayB0aW1lcyBtYXRjaGUgdGhlIGNvcnJlc3BvbmRpbmcgb3V0cHV0ICBcbiAgICAgIGV4cGVjdChzbG8zLmdldFN0YWtlYWJsZUxvY2t0aW1lKCkudG9TdHJpbmcoKSkudG9FcXVhbChzdGFrZWFibGVMb2NrT3V0MS5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvU3RyaW5nKCkpXG4gICAgICBleHBlY3Qoc2xvMi5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvU3RyaW5nKCkpLnRvRXF1YWwoc3Rha2VhYmxlTG9ja091dDIuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS50b1N0cmluZygpKVxuICAgIH0pXG5cbiAgICB0ZXN0KCdidWlsZEFkZFZhbGlkYXRvclR4IHNvcnQgU3Rha2VhYmxlTG9ja091dHMgMycsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIC8vIHRocmVlIFVUWE8uIFxuICAgICAgLy8gVGhlIDFzdCBpcyBhIFNlY3BUcmFuc2ZlcmFibGVPdXRwdXQuIFxuICAgICAgLy8gVGhlIDJuZCBoYXMgYSBsZXNzZXIgc3Rha2VhYmxlbG9ja3RpbWUgYW5kIGEgZ3JlYXRlciBhbW91bnQgb2YgQVZBWC4gXG4gICAgICAvLyBUaGUgM3JkIGhhcyBhIGdyZWF0ZXIgc3Rha2VhYmxlbG9ja3RpbWUgYW5kIGEgbGVzc2VyIGFtb3VudCBvZiBBVkFYLlxuICAgICAgLy8gXG4gICAgICAvLyB0aGlzIHRpbWUgd2UncmUgc3Rha2luZyBhIGdyZWF0ZXIgYW1vdW50IHRoYW4gaXMgYXZhaWxhYmxlIGluIHRoZSAzcmQgVVRYTy5cbiAgICAgIC8vIFdlIGV4cGVjdCB0aGlzIHRlc3QgdG8gY29uc3VtZSB0aGUgZnVsbCAzcmQgVVRYTyBhbmQgYSBmcmFjdGlvbiBvZiB0aGUgMm5kIFVUWE8gYW5kIG5vdCB0byBjb25zdW1lIHRoZSBTZWNwVHJhbnNmZXJhYmxlT3V0cHV0XG4gICAgICBjb25zdCBhZGRyYnVmZjE6IEJ1ZmZlcltdID0gYWRkcnMxLm1hcCgoYSkgPT4gcGxhdGZvcm12bS5wYXJzZUFkZHJlc3MoYSkpXG4gICAgICBjb25zdCBhbW91bnQxOiBCTiA9IG5ldyBCTignMjAwMDAwMDAwMDAwMDAwMDAnKVxuICAgICAgY29uc3QgYW1vdW50MjogQk4gPSBuZXcgQk4oJzEwMDAwMDAwMDAwMDAwMDAwJylcbiAgICAgIGNvbnN0IGxvY2t0aW1lMTogQk4gPSBuZXcgQk4oMClcbiAgICAgIGNvbnN0IHRocmVzaG9sZDogbnVtYmVyID0gMVxuXG4gICAgICBjb25zdCBzdGFrZWFibGVMb2NrVGltZTE6IEJOID0gbmV3IEJOKDE2MzM4MjQwMDApXG4gICAgICBjb25zdCBzZWNwVHJhbnNmZXJPdXRwdXQwOiBTRUNQVHJhbnNmZXJPdXRwdXQgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KGFtb3VudDEsIGFkZHJidWZmMSwgbG9ja3RpbWUxLCB0aHJlc2hvbGQpXG4gICAgICBjb25zdCBzZWNwVHJhbnNmZXJPdXRwdXQxOiBTRUNQVHJhbnNmZXJPdXRwdXQgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KGFtb3VudDEsIGFkZHJidWZmMSwgbG9ja3RpbWUxLCB0aHJlc2hvbGQpXG4gICAgICBjb25zdCBwYXJzZWFibGVPdXRwdXQxOiBQYXJzZWFibGVPdXRwdXQgPSBuZXcgUGFyc2VhYmxlT3V0cHV0KHNlY3BUcmFuc2Zlck91dHB1dDEpXG4gICAgICBjb25zdCBzdGFrZWFibGVMb2NrT3V0MTogU3Rha2VhYmxlTG9ja091dCA9IG5ldyBTdGFrZWFibGVMb2NrT3V0KGFtb3VudDEsIGFkZHJidWZmMSwgbG9ja3RpbWUxLCB0aHJlc2hvbGQsIHN0YWtlYWJsZUxvY2tUaW1lMSwgcGFyc2VhYmxlT3V0cHV0MSlcbiAgICAgIGNvbnN0IHN0YWtlYWJsZUxvY2tUaW1lMjogQk4gPSBuZXcgQk4oMTczMzgyNDAwMClcbiAgICAgIGNvbnN0IHNlY3BUcmFuc2Zlck91dHB1dDI6IFNFQ1BUcmFuc2Zlck91dHB1dCA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQoYW1vdW50MiwgYWRkcmJ1ZmYxLCBsb2NrdGltZTEsIHRocmVzaG9sZClcbiAgICAgIGNvbnN0IHBhcnNlYWJsZU91dHB1dDI6IFBhcnNlYWJsZU91dHB1dCA9IG5ldyBQYXJzZWFibGVPdXRwdXQoc2VjcFRyYW5zZmVyT3V0cHV0MilcbiAgICAgIGNvbnN0IHN0YWtlYWJsZUxvY2tPdXQyOiBTdGFrZWFibGVMb2NrT3V0ID0gbmV3IFN0YWtlYWJsZUxvY2tPdXQoYW1vdW50MiwgYWRkcmJ1ZmYxLCBsb2NrdGltZTEsIHRocmVzaG9sZCwgc3Rha2VhYmxlTG9ja1RpbWUyLCBwYXJzZWFibGVPdXRwdXQyKVxuICAgICAgY29uc3Qgbm9kZUlEOiBzdHJpbmcgPSBcIk5vZGVJRC0zNmdpRnllNWVwd0JUcEdxUGs3YjRDQ1llM2hmeW9GcjFcIlxuICAgICAgY29uc3Qgc3Rha2VBbW91bnQ6IEJOID0gbmV3IEJOKCcxMDAwMDAwMzAwMDAwMDAwMCcpXG4gICAgICBwbGF0Zm9ybXZtLnNldE1pblN0YWtlKHN0YWtlQW1vdW50LCBEZWZhdWx0cy5uZXR3b3JrW25ldHdvcmtJRF1bXCJQXCJdLm1pbkRlbGVnYXRpb25TdGFrZSlcbiAgICAgIGNvbnN0IGRlbGVnYXRpb25GZWVSYXRlOiBudW1iZXIgPSBuZXcgQk4oMikudG9OdW1iZXIoKVxuICAgICAgY29uc3QgY29kZWNJRDogbnVtYmVyID0gMFxuICAgICAgY29uc3QgdHhpZDA6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUoJ2F1aE1GczI0ZmZjMkJSV0t3Nmk3UW5nY3M4alNRVVM5RWkyWHdKc1VwRXE0c1RWaWInKVxuICAgICAgY29uc3QgdHhpZDE6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUoJzJqaHlKaXQ4a1dBNlN3a1J3S3hYZXBGbmZoczk3MUNFcWFHa2pKbWlBRE04SDRnMkxSJylcbiAgICAgIGNvbnN0IHR4aWQyOiBCdWZmZXIgPSBiaW50b29scy5jYjU4RGVjb2RlKCcySndEZm0zQzdwODhySlExWTF4V0xrV05NQTFucVB6cW5hQzJIaTRQRE5LaVBuWGdHdicpXG4gICAgICBjb25zdCBvdXRwdXRpZHgwOiBudW1iZXIgPSAwXG4gICAgICBjb25zdCBvdXRwdXRpZHgxOiBudW1iZXIgPSAwXG4gICAgICBjb25zdCBhc3NldElEOiBCdWZmZXIgPSBhd2FpdCBwbGF0Zm9ybXZtLmdldEFWQVhBc3NldElEKClcbiAgICAgIGNvbnN0IGFzc2V0SUQyOiBCdWZmZXIgPSBhd2FpdCBwbGF0Zm9ybXZtLmdldEFWQVhBc3NldElEKClcbiAgICAgIGNvbnN0IHV0eG8wOiBVVFhPID0gbmV3IFVUWE8oY29kZWNJRCwgdHhpZDAsIG91dHB1dGlkeDAsIGFzc2V0SUQsIHNlY3BUcmFuc2Zlck91dHB1dDApXG4gICAgICBjb25zdCB1dHhvMTogVVRYTyA9IG5ldyBVVFhPKGNvZGVjSUQsIHR4aWQxLCBvdXRwdXRpZHgwLCBhc3NldElELCBzdGFrZWFibGVMb2NrT3V0MSlcbiAgICAgIGNvbnN0IHV0eG8yOiBVVFhPID0gbmV3IFVUWE8oY29kZWNJRCwgdHhpZDIsIG91dHB1dGlkeDEsIGFzc2V0SUQyLCBzdGFrZWFibGVMb2NrT3V0MilcbiAgICAgIGNvbnN0IHV0eG9TZXQ6IFVUWE9TZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgICB1dHhvU2V0LmFkZCh1dHhvMClcbiAgICAgIHV0eG9TZXQuYWRkKHV0eG8xKVxuICAgICAgdXR4b1NldC5hZGQodXR4bzIpXG4gICAgICBjb25zdCB0eHUxOiBVbnNpZ25lZFR4ID0gYXdhaXQgcGxhdGZvcm12bS5idWlsZEFkZFZhbGlkYXRvclR4KFxuICAgICAgICB1dHhvU2V0LFxuICAgICAgICBhZGRyczMsXG4gICAgICAgIGFkZHJzMSxcbiAgICAgICAgYWRkcnMyLFxuICAgICAgICBub2RlSUQsXG4gICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgZW5kVGltZSxcbiAgICAgICAgc3Rha2VBbW91bnQsXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgZGVsZWdhdGlvbkZlZVJhdGVcbiAgICAgIClcbiAgICAgIGNvbnN0IHR4ID0gdHh1MS5nZXRUcmFuc2FjdGlvbigpIGFzIEFkZFZhbGlkYXRvclR4XG4gICAgICBjb25zdCBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSB0eC5nZXRJbnMoKVxuICAgICAgLy8gc3RhcnQgdGVzdCBpbnB1dHNcbiAgICAgIC8vIGNvbmZpcm0gb25seSAxIGlucHV0XG4gICAgICBleHBlY3QoaW5zLmxlbmd0aCkudG9CZSgyKVxuICAgICAgY29uc3QgaW5wdXQxOiBUcmFuc2ZlcmFibGVJbnB1dCA9IGluc1swXVxuICAgICAgY29uc3QgaW5wdXQyOiBUcmFuc2ZlcmFibGVJbnB1dCA9IGluc1sxXVxuICAgICAgY29uc3QgYWkxID0gaW5wdXQxLmdldElucHV0KCkgYXMgQW1vdW50SW5wdXRcbiAgICAgIGNvbnN0IGFpMiA9IGlucHV0Mi5nZXRJbnB1dCgpIGFzIEFtb3VudElucHV0XG4gICAgICBjb25zdCBhbzEgPSBzdGFrZWFibGVMb2NrT3V0Mi5nZXRUcmFuc2ZlcmFibGVPdXRwdXQoKS5nZXRPdXRwdXQoKSBhcyBBbW91bnRPdXRwdXRcbiAgICAgIGNvbnN0IGFvMiA9IHN0YWtlYWJsZUxvY2tPdXQxLmdldFRyYW5zZmVyYWJsZU91dHB1dCgpLmdldE91dHB1dCgpIGFzIEFtb3VudE91dHB1dFxuICAgICAgLy8gY29uZmlybSBlYWNoIGlucHV0IGFtb3VudCBtYXRjaGVzIHRoZSBjb3JyZXNwb25kaW5nIG91dHB1dCBcbiAgICAgIGV4cGVjdChhaTIuZ2V0QW1vdW50KCkudG9TdHJpbmcoKSkudG9FcXVhbChhbzIuZ2V0QW1vdW50KCkudG9TdHJpbmcoKSlcbiAgICAgIGV4cGVjdChhaTEuZ2V0QW1vdW50KCkudG9TdHJpbmcoKSkudG9FcXVhbChhbzEuZ2V0QW1vdW50KCkudG9TdHJpbmcoKSlcblxuICAgICAgY29uc3Qgc2xpMSA9IGlucHV0MS5nZXRJbnB1dCgpIGFzIFN0YWtlYWJsZUxvY2tJblxuICAgICAgY29uc3Qgc2xpMiA9IGlucHV0Mi5nZXRJbnB1dCgpIGFzIFN0YWtlYWJsZUxvY2tJblxuICAgICAgLy8gY29uZmlybSBpbnB1dCBzdHJha2VhYmxlbG9jayB0aW1lIG1hdGNoZXMgdGhlIG91dHB1dCB3LyB0aGUgZ3JlYXRlciBzdGFla2FibGVsb2NrIHRpbWUgYnV0IGxlc3NlciBhbW91bnQgXG4gICAgICBleHBlY3Qoc2xpMS5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvU3RyaW5nKCkpLnRvRXF1YWwoc3Rha2VhYmxlTG9ja091dDIuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS50b1N0cmluZygpKVxuICAgICAgZXhwZWN0KHNsaTIuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS50b1N0cmluZygpKS50b0VxdWFsKHN0YWtlYWJsZUxvY2tPdXQxLmdldFN0YWtlYWJsZUxvY2t0aW1lKCkudG9TdHJpbmcoKSlcbiAgICAgIC8vIHN0b3AgdGVzdCBpbnB1dHNcblxuICAgICAgLy8gc3RhcnQgdGVzdCBvdXRwdXRzXG4gICAgICBjb25zdCBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHR4LmdldE91dHMoKVxuICAgICAgLy8gY29uZmlybSBvbmx5IDEgb3V0cHV0XG4gICAgICBleHBlY3Qob3V0cy5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGNvbnN0IG91dHB1dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gb3V0c1swXVxuICAgICAgY29uc3QgYW8zID0gb3V0cHV0LmdldE91dHB1dCgpIGFzIEFtb3VudE91dHB1dFxuICAgICAgLy8gY29uZmlybSBvdXRwdXQgYW1vdW50IG1hdGNoZXMgdGhlIG91dHB1dCBhbW91bnQgc2FucyB0aGUgMm5kIHV0eG8gYW1vdW50IGFuZCB0aGUgc3Rha2UgYW1vdW50XG4gICAgICBleHBlY3QoYW8zLmdldEFtb3VudCgpLnRvU3RyaW5nKCkpLnRvRXF1YWwoYW8yLmdldEFtb3VudCgpLnN1YihzdGFrZUFtb3VudC5zdWIoYW8xLmdldEFtb3VudCgpKSkudG9TdHJpbmcoKSlcblxuICAgICAgY29uc3Qgc2xvID0gb3V0cHV0LmdldE91dHB1dCgpIGFzIFN0YWtlYWJsZUxvY2tPdXRcbiAgICAgIC8vIGNvbmZpcm0gb3V0cHV0IHN0YWtlYWJsZWxvY2sgdGltZSBtYXRjaGVzIHRoZSBvdXRwdXQgdy8gdGhlIGxlc3NlciBzdGFrZWFibGVsb2NrIHNpbmNlIHRoZSBvdGhlciB3YXMgY29uc3VtZWRcbiAgICAgIGV4cGVjdChzbG8uZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS50b1N0cmluZygpKS50b0VxdWFsKHN0YWtlYWJsZUxvY2tPdXQxLmdldFN0YWtlYWJsZUxvY2t0aW1lKCkudG9TdHJpbmcoKSlcbiAgICAgIC8vIGNvbmZpcm0gb3V0cHV0IHN0YWtlYWJsZWxvY2sgdGltZSBkb2Vzbid0IG1hdGNoIHRoZSBvdXRwdXQgdy8gdGhlIGdyZWF0ZXIgc3Rha2VhYmxlbG9jayB0aW1lICBcbiAgICAgIGV4cGVjdChzbG8uZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS50b1N0cmluZygpKS5ub3QudG9FcXVhbChzdGFrZWFibGVMb2NrT3V0Mi5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvU3RyaW5nKCkpXG5cbiAgICAgIC8vIGNvbmZpcm0gdHggbm9kZUlEIG1hdGNoZXMgbm9kZUlEXG4gICAgICBleHBlY3QodHguZ2V0Tm9kZUlEU3RyaW5nKCkpLnRvRXF1YWwobm9kZUlEKVxuICAgICAgLy8gY29uZmlybSB0eCBzdGFydHRpbWUgbWF0Y2hlcyBzdGFydHRpbWVcbiAgICAgIGV4cGVjdCh0eC5nZXRTdGFydFRpbWUoKS50b1N0cmluZygpKS50b0VxdWFsKHN0YXJ0VGltZS50b1N0cmluZygpKVxuICAgICAgLy8gY29uZmlybSB0eCBlbmR0aW1lIG1hdGNoZXMgZW5kdGltZSBcbiAgICAgIGV4cGVjdCh0eC5nZXRFbmRUaW1lKCkudG9TdHJpbmcoKSkudG9FcXVhbChlbmRUaW1lLnRvU3RyaW5nKCkpXG4gICAgICAvLyBjb25maXJtIHR4IHN0YWtlIGFtb3VudCBtYXRjaGVzIHN0YWtlQW1vdW50XG4gICAgICBleHBlY3QodHguZ2V0U3Rha2VBbW91bnQoKS50b1N0cmluZygpKS50b0VxdWFsKHN0YWtlQW1vdW50LnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IHN0YWtlT3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB0eC5nZXRTdGFrZU91dHMoKVxuICAgICAgLy8gY29uZmlybSAyIHN0YWtlT3V0c1xuICAgICAgZXhwZWN0KHN0YWtlT3V0cy5sZW5ndGgpLnRvQmUoMilcblxuICAgICAgY29uc3Qgc3Rha2VPdXQxOiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBzdGFrZU91dHNbMF1cbiAgICAgIGNvbnN0IHN0YWtlT3V0MjogVHJhbnNmZXJhYmxlT3V0cHV0ID0gc3Rha2VPdXRzWzFdXG4gICAgICBjb25zdCBzbG8yID0gc3Rha2VPdXQxLmdldE91dHB1dCgpIGFzIFN0YWtlYWJsZUxvY2tPdXRcbiAgICAgIGNvbnN0IHNsbzMgPSBzdGFrZU91dDIuZ2V0T3V0cHV0KCkgYXMgU3Rha2VhYmxlTG9ja091dFxuICAgICAgLy8gY29uZmlybSBib3RoIHN0YWtlT3V0IHN0cmFrZWFibGVsb2NrIHRpbWVzIG1hdGNoZSB0aGUgY29ycmVzcG9uZGluZyBvdXRwdXQgIFxuICAgICAgZXhwZWN0KHNsbzMuZ2V0U3Rha2VhYmxlTG9ja3RpbWUoKS50b1N0cmluZygpKS50b0VxdWFsKHN0YWtlYWJsZUxvY2tPdXQxLmdldFN0YWtlYWJsZUxvY2t0aW1lKCkudG9TdHJpbmcoKSlcbiAgICAgIGV4cGVjdChzbG8yLmdldFN0YWtlYWJsZUxvY2t0aW1lKCkudG9TdHJpbmcoKSkudG9FcXVhbChzdGFrZWFibGVMb2NrT3V0Mi5nZXRTdGFrZWFibGVMb2NrdGltZSgpLnRvU3RyaW5nKCkpXG4gICAgfSlcblxuICAgIHRlc3QoJ2J1aWxkQWRkVmFsaWRhdG9yVHggMScsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGNvbnN0IGFkZHJidWZmMSA9IGFkZHJzMS5tYXAoKGEpID0+IHBsYXRmb3Jtdm0ucGFyc2VBZGRyZXNzKGEpKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYyID0gYWRkcnMyLm1hcCgoYSkgPT4gcGxhdGZvcm12bS5wYXJzZUFkZHJlc3MoYSkpXG4gICAgICBjb25zdCBhZGRyYnVmZjMgPSBhZGRyczMubWFwKChhKSA9PiBwbGF0Zm9ybXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGFtb3VudDogQk4gPSBEZWZhdWx0cy5uZXR3b3JrW25ldHdvcmtJRF1bXCJQXCJdLm1pblN0YWtlLmFkZChuZXcgQk4oZmVlKSlcblxuICAgICAgY29uc3QgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDU0MzIxKVxuICAgICAgY29uc3QgdGhyZXNob2xkOiBudW1iZXIgPSAyXG5cbiAgICAgIHBsYXRmb3Jtdm0uc2V0TWluU3Rha2UoRGVmYXVsdHMubmV0d29ya1tuZXR3b3JrSURdW1wiUFwiXS5taW5TdGFrZSwgRGVmYXVsdHMubmV0d29ya1tuZXR3b3JrSURdW1wiUFwiXS5taW5EZWxlZ2F0aW9uU3Rha2UpXG5cbiAgICAgIGNvbnN0IHR4dTE6IFVuc2lnbmVkVHggPSBhd2FpdCBwbGF0Zm9ybXZtLmJ1aWxkQWRkVmFsaWRhdG9yVHgoXG4gICAgICAgIHNldCxcbiAgICAgICAgYWRkcnMzLFxuICAgICAgICBhZGRyczEsXG4gICAgICAgIGFkZHJzMixcbiAgICAgICAgbm9kZUlELFxuICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgIGVuZFRpbWUsXG4gICAgICAgIGFtb3VudCxcbiAgICAgICAgYWRkcnMzLFxuICAgICAgICAwLjEzMzQ1NTYsXG4gICAgICAgIGxvY2t0aW1lLFxuICAgICAgICB0aHJlc2hvbGQsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLCBVbml4Tm93KClcbiAgICAgIClcblxuICAgICAgY29uc3QgdHh1MjogVW5zaWduZWRUeCA9IHNldC5idWlsZEFkZFZhbGlkYXRvclR4KFxuICAgICAgICBuZXR3b3JrSUQsIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSxcbiAgICAgICAgYXNzZXRJRCxcbiAgICAgICAgYWRkcmJ1ZmYzLFxuICAgICAgICBhZGRyYnVmZjEsXG4gICAgICAgIGFkZHJidWZmMixcbiAgICAgICAgTm9kZUlEU3RyaW5nVG9CdWZmZXIobm9kZUlEKSxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbmRUaW1lLFxuICAgICAgICBhbW91bnQsXG4gICAgICAgIGxvY2t0aW1lLFxuICAgICAgICB0aHJlc2hvbGQsXG4gICAgICAgIGFkZHJidWZmMyxcbiAgICAgICAgMC4xMzM1LFxuICAgICAgICBuZXcgQk4oMCksXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSwgVW5peE5vdygpXG4gICAgICApXG4gICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSkudG9CZSh0eHUxLnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKVxuICAgICAgZXhwZWN0KHR4dTIudG9TdHJpbmcoKSkudG9CZSh0eHUxLnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IHR4MTogVHggPSB0eHUxLnNpZ24ocGxhdGZvcm12bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgY2hlY2tUeDogc3RyaW5nID0gdHgxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MW9iajogb2JqZWN0ID0gdHgxLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgxc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDFvYmopXG5cbiAgICAgIGNvbnN0IHR4Mm5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDFzdHIpXG4gICAgICBjb25zdCB0eDI6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4Mi5kZXNlcmlhbGl6ZSh0eDJuZXdvYmosIFwiaGV4XCIpXG5cbiAgICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBjb25zdCB0eDM6IFR4ID0gdHh1MS5zaWduKHBsYXRmb3Jtdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IHR4M29iajogb2JqZWN0ID0gdHgzLnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHgzc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDNvYmopXG5cbiAgICAgIGNvbnN0IHR4NG5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDNzdHIpXG4gICAgICBjb25zdCB0eDQ6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4NC5kZXNlcmlhbGl6ZSh0eDRuZXdvYmosIGRpc3BsYXkpXG5cbiAgICAgIGV4cGVjdCh0eDQudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBzZXJpYWx6ZWl0KHR4MSwgXCJBZGRWYWxpZGF0b3JUeFwiKVxuXG4gICAgfSlcblxuICAgIHRlc3QoJ2J1aWxkQWRkRGVsZWdhdG9yVHggMicsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGNvbnN0IGFkZHJidWZmMSA9IGFkZHJzMS5tYXAoKGEpID0+IHBsYXRmb3Jtdm0ucGFyc2VBZGRyZXNzKGEpKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYyID0gYWRkcnMyLm1hcCgoYSkgPT4gcGxhdGZvcm12bS5wYXJzZUFkZHJlc3MoYSkpXG4gICAgICBjb25zdCBhZGRyYnVmZjMgPSBhZGRyczMubWFwKChhKSA9PiBwbGF0Zm9ybXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGFtb3VudDogQk4gPSBEZWZhdWx0cy5uZXR3b3JrW25ldHdvcmtJRF1bXCJQXCJdLm1pbkRlbGVnYXRpb25TdGFrZVxuICAgICAgY29uc3QgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDU0MzIxKVxuICAgICAgY29uc3QgdGhyZXNob2xkOiBudW1iZXIgPSAyXG5cbiAgICAgIHBsYXRmb3Jtdm0uc2V0TWluU3Rha2UoRGVmYXVsdHMubmV0d29ya1tuZXR3b3JrSURdW1wiUFwiXS5taW5TdGFrZSwgRGVmYXVsdHMubmV0d29ya1tuZXR3b3JrSURdW1wiUFwiXS5taW5EZWxlZ2F0aW9uU3Rha2UpXG5cbiAgICAgIGNvbnN0IHR4dTE6IFVuc2lnbmVkVHggPSBhd2FpdCBwbGF0Zm9ybXZtLmJ1aWxkQWRkRGVsZWdhdG9yVHgoXG4gICAgICAgIGxzZXQsXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczIsXG4gICAgICAgIG5vZGVJRCxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbmRUaW1lLFxuICAgICAgICBhbW91bnQsXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgbG9ja3RpbWUsXG4gICAgICAgIHRocmVzaG9sZCxcbiAgICAgICAgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIiksIFVuaXhOb3coKVxuICAgICAgKVxuXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gbHNldC5idWlsZEFkZERlbGVnYXRvclR4KFxuICAgICAgICBuZXR3b3JrSUQsIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSxcbiAgICAgICAgYXNzZXRJRCxcbiAgICAgICAgYWRkcmJ1ZmYzLFxuICAgICAgICBhZGRyYnVmZjEsXG4gICAgICAgIGFkZHJidWZmMixcbiAgICAgICAgTm9kZUlEU3RyaW5nVG9CdWZmZXIobm9kZUlEKSxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbmRUaW1lLFxuICAgICAgICBhbW91bnQsXG4gICAgICAgIGxvY2t0aW1lLFxuICAgICAgICB0aHJlc2hvbGQsXG4gICAgICAgIGFkZHJidWZmMyxcbiAgICAgICAgbmV3IEJOKDApLFxuICAgICAgICBhc3NldElELFxuICAgICAgICBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKS5nZXRQYXlsb2FkKCksIFVuaXhOb3coKVxuICAgICAgKVxuICAgICAgZXhwZWN0KHR4dTIudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpLnRvQmUodHh1MS50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSlcbiAgICAgIGV4cGVjdCh0eHUyLnRvU3RyaW5nKCkpLnRvQmUodHh1MS50b1N0cmluZygpKVxuXG4gICAgICBjb25zdCB0eDE6IFR4ID0gdHh1MS5zaWduKHBsYXRmb3Jtdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IGNoZWNrVHg6IHN0cmluZyA9IHR4MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICBjb25zdCB0eDFvYmo6IG9iamVjdCA9IHR4MS5zZXJpYWxpemUoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MXN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgxb2JqKVxuXG4gICAgICBjb25zdCB0eDJuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgxc3RyKVxuICAgICAgY29uc3QgdHgyOiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDIuZGVzZXJpYWxpemUodHgybmV3b2JqLCBcImhleFwiKVxuXG4gICAgICBleHBlY3QodHgyLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoY2hlY2tUeClcblxuICAgICAgY29uc3QgdHgzOiBUeCA9IHR4dTEuc2lnbihwbGF0Zm9ybXZtLmtleUNoYWluKCkpXG4gICAgICBjb25zdCB0eDNvYmo6IG9iamVjdCA9IHR4My5zZXJpYWxpemUoZGlzcGxheSlcbiAgICAgIGNvbnN0IHR4M3N0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkodHgzb2JqKVxuXG4gICAgICBjb25zdCB0eDRuZXdvYmo6IG9iamVjdCA9IEpTT04ucGFyc2UodHgzc3RyKVxuICAgICAgY29uc3QgdHg0OiBUeCA9IG5ldyBUeCgpXG4gICAgICB0eDQuZGVzZXJpYWxpemUodHg0bmV3b2JqLCBkaXNwbGF5KVxuXG4gICAgICBleHBlY3QodHg0LnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIikpLnRvQmUoY2hlY2tUeClcblxuICAgICAgc2VyaWFsemVpdCh0eDEsIFwiQWRkRGVsZWdhdG9yVHhcIilcblxuICAgIH0pXG5cbiAgICB0ZXN0KCdidWlsZEFkZFZhbGlkYXRvclR4IDInLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgICBjb25zdCBhZGRyYnVmZjEgPSBhZGRyczEubWFwKChhKSA9PiBwbGF0Zm9ybXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGFkZHJidWZmMiA9IGFkZHJzMi5tYXAoKGEpID0+IHBsYXRmb3Jtdm0ucGFyc2VBZGRyZXNzKGEpKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYzID0gYWRkcnMzLm1hcCgoYSkgPT4gcGxhdGZvcm12bS5wYXJzZUFkZHJlc3MoYSkpXG4gICAgICBjb25zdCBhbW91bnQ6IEJOID0gT05FQVZBWC5tdWwobmV3IEJOKDI1KSlcblxuICAgICAgY29uc3QgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDU0MzIxKVxuICAgICAgY29uc3QgdGhyZXNob2xkOiBudW1iZXIgPSAyXG5cbiAgICAgIHBsYXRmb3Jtdm0uc2V0TWluU3Rha2UoT05FQVZBWC5tdWwobmV3IEJOKDI1KSksIE9ORUFWQVgubXVsKG5ldyBCTigyNSkpKVxuXG4gICAgICBjb25zdCB0eHUxOiBVbnNpZ25lZFR4ID0gYXdhaXQgcGxhdGZvcm12bS5idWlsZEFkZFZhbGlkYXRvclR4KFxuICAgICAgICBsc2V0LFxuICAgICAgICBhZGRyczMsXG4gICAgICAgIGFkZHJzMSxcbiAgICAgICAgYWRkcnMyLFxuICAgICAgICBub2RlSUQsXG4gICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgZW5kVGltZSxcbiAgICAgICAgYW1vdW50LFxuICAgICAgICBhZGRyczMsXG4gICAgICAgIDAuMTMzNDU1NixcbiAgICAgICAgbG9ja3RpbWUsXG4gICAgICAgIHRocmVzaG9sZCxcbiAgICAgICAgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIiksIFVuaXhOb3coKVxuICAgICAgKVxuXG4gICAgICBjb25zdCB0eHUyOiBVbnNpZ25lZFR4ID0gbHNldC5idWlsZEFkZFZhbGlkYXRvclR4KFxuICAgICAgICBuZXR3b3JrSUQsIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSxcbiAgICAgICAgYXNzZXRJRCxcbiAgICAgICAgYWRkcmJ1ZmYzLFxuICAgICAgICBhZGRyYnVmZjEsXG4gICAgICAgIGFkZHJidWZmMixcbiAgICAgICAgTm9kZUlEU3RyaW5nVG9CdWZmZXIobm9kZUlEKSxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbmRUaW1lLFxuICAgICAgICBhbW91bnQsXG4gICAgICAgIGxvY2t0aW1lLFxuICAgICAgICB0aHJlc2hvbGQsXG4gICAgICAgIGFkZHJidWZmMyxcbiAgICAgICAgMC4xMzM1LFxuICAgICAgICBuZXcgQk4oMCksXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSwgVW5peE5vdygpXG4gICAgICApXG4gICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSkudG9CZSh0eHUxLnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKVxuICAgICAgZXhwZWN0KHR4dTIudG9TdHJpbmcoKSkudG9CZSh0eHUxLnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IHR4MTogVHggPSB0eHUxLnNpZ24ocGxhdGZvcm12bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgY2hlY2tUeDogc3RyaW5nID0gdHgxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MW9iajogb2JqZWN0ID0gdHgxLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgxc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDFvYmopXG5cbiAgICAgIGNvbnN0IHR4Mm5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDFzdHIpXG4gICAgICBjb25zdCB0eDI6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4Mi5kZXNlcmlhbGl6ZSh0eDJuZXdvYmosIFwiaGV4XCIpXG5cbiAgICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBjb25zdCB0eDM6IFR4ID0gdHh1MS5zaWduKHBsYXRmb3Jtdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IHR4M29iajogb2JqZWN0ID0gdHgzLnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHgzc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDNvYmopXG5cbiAgICAgIGNvbnN0IHR4NG5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDNzdHIpXG4gICAgICBjb25zdCB0eDQ6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4NC5kZXNlcmlhbGl6ZSh0eDRuZXdvYmosIGRpc3BsYXkpXG5cbiAgICAgIGV4cGVjdCh0eDQudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBzZXJpYWx6ZWl0KHR4MSwgXCJBZGRWYWxpZGF0b3JUeFwiKVxuXG4gICAgfSlcblxuICAgIHRlc3QoJ2J1aWxkQWRkVmFsaWRhdG9yVHggMycsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIGNvbnN0IGFkZHJidWZmMSA9IGFkZHJzMS5tYXAoKGEpID0+IHBsYXRmb3Jtdm0ucGFyc2VBZGRyZXNzKGEpKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYyID0gYWRkcnMyLm1hcCgoYSkgPT4gcGxhdGZvcm12bS5wYXJzZUFkZHJlc3MoYSkpXG4gICAgICBjb25zdCBhZGRyYnVmZjMgPSBhZGRyczMubWFwKChhKSA9PiBwbGF0Zm9ybXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGFtb3VudDogQk4gPSBPTkVBVkFYLm11bChuZXcgQk4oMykpXG5cbiAgICAgIGNvbnN0IGxvY2t0aW1lOiBCTiA9IG5ldyBCTig1NDMyMSlcbiAgICAgIGNvbnN0IHRocmVzaG9sZDogbnVtYmVyID0gMlxuXG4gICAgICBwbGF0Zm9ybXZtLnNldE1pblN0YWtlKE9ORUFWQVgubXVsKG5ldyBCTigzKSksIE9ORUFWQVgubXVsKG5ldyBCTigzKSkpXG5cbiAgICAgIC8vMiB1dHhvczsgb25lIGxvY2tlZHN0YWtlYWJsZTsgb3RoZXIgdW5sb2NrZWQ7IGJvdGggdXR4b3MgaGF2ZSAyIGF2YXg7IHN0YWtlIDMgQVZBWFxuXG4gICAgICBjb25zdCBkdW1teVNldDogVVRYT1NldCA9IG5ldyBVVFhPU2V0KClcblxuICAgICAgY29uc3QgbG9ja2VkQmFzZU91dDogU0VDUFRyYW5zZmVyT3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChPTkVBVkFYLm11bChuZXcgQk4oMikpLCBhZGRyYnVmZjEsIGxvY2t0aW1lLCAxKVxuICAgICAgY29uc3QgbG9ja2VkQmFzZVhPdXQ6IFBhcnNlYWJsZU91dHB1dCA9IG5ldyBQYXJzZWFibGVPdXRwdXQobG9ja2VkQmFzZU91dClcbiAgICAgIGNvbnN0IGxvY2tlZE91dDogU3Rha2VhYmxlTG9ja091dCA9IG5ldyBTdGFrZWFibGVMb2NrT3V0KE9ORUFWQVgubXVsKG5ldyBCTigyKSksIGFkZHJidWZmMSwgbG9ja3RpbWUsIDEsIGxvY2t0aW1lLCBsb2NrZWRCYXNlWE91dClcblxuICAgICAgY29uc3QgdHhpZExvY2tlZDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyKVxuICAgICAgdHhpZExvY2tlZC5maWxsKDEpXG4gICAgICBjb25zdCB0eGlkeExvY2tlZDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgICB0eGlkeExvY2tlZC53cml0ZVVJbnQzMkJFKDEsIDApXG4gICAgICBjb25zdCBsdTogVVRYTyA9IG5ldyBVVFhPKDAsIHR4aWRMb2NrZWQsIHR4aWR4TG9ja2VkLCBhc3NldElELCBsb2NrZWRPdXQpXG5cbiAgICAgIGNvbnN0IHR4aWRVbmxvY2tlZDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyKVxuICAgICAgdHhpZFVubG9ja2VkLmZpbGwoMilcbiAgICAgIGNvbnN0IHR4aWR4VW5sb2NrZWQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgICAgdHhpZHhVbmxvY2tlZC53cml0ZVVJbnQzMkJFKDIsIDApXG4gICAgICBjb25zdCB1bmxvY2tlZE91dDogU0VDUFRyYW5zZmVyT3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChPTkVBVkFYLm11bChuZXcgQk4oMikpLCBhZGRyYnVmZjEsIGxvY2t0aW1lLCAxKVxuICAgICAgY29uc3QgdWx1OiBVVFhPID0gbmV3IFVUWE8oMCwgdHhpZFVubG9ja2VkLCB0eGlkeFVubG9ja2VkLCBhc3NldElELCB1bmxvY2tlZE91dClcblxuICAgICAgZHVtbXlTZXQuYWRkKHVsdSlcbiAgICAgIGR1bW15U2V0LmFkZChsdSlcblxuICAgICAgY29uc3QgdHh1MTogVW5zaWduZWRUeCA9IGF3YWl0IHBsYXRmb3Jtdm0uYnVpbGRBZGRWYWxpZGF0b3JUeChcbiAgICAgICAgZHVtbXlTZXQsXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgYWRkcnMxLFxuICAgICAgICBhZGRyczIsXG4gICAgICAgIG5vZGVJRCxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbmRUaW1lLFxuICAgICAgICBhbW91bnQsXG4gICAgICAgIGFkZHJzMyxcbiAgICAgICAgMC4xMzM0NTU2LFxuICAgICAgICBsb2NrdGltZSxcbiAgICAgICAgdGhyZXNob2xkLFxuICAgICAgICBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKSwgVW5peE5vdygpXG4gICAgICApXG5cbiAgICAgIGNvbnN0IHR4dTFJbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSAodHh1MS5nZXRUcmFuc2FjdGlvbigpIGFzIEFkZFZhbGlkYXRvclR4KS5nZXRJbnMoKVxuICAgICAgY29uc3QgdHh1MU91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gKHR4dTEuZ2V0VHJhbnNhY3Rpb24oKSBhcyBBZGRWYWxpZGF0b3JUeCkuZ2V0T3V0cygpXG4gICAgICBjb25zdCB0eHUxU3Rha2U6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gKHR4dTEuZ2V0VHJhbnNhY3Rpb24oKSBhcyBBZGRWYWxpZGF0b3JUeCkuZ2V0U3Rha2VPdXRzKClcbiAgICAgIGNvbnN0IHR4dTFUb3RhbDogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSAodHh1MS5nZXRUcmFuc2FjdGlvbigpIGFzIEFkZFZhbGlkYXRvclR4KS5nZXRUb3RhbE91dHMoKVxuXG4gICAgICBsZXQgaW50b3RhbDogQk4gPSBuZXcgQk4oMClcblxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHR4dTFJbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaW50b3RhbCA9IGludG90YWwuYWRkKCh0eHUxSW5zW2ldLmdldElucHV0KCkgYXMgQW1vdW50SW5wdXQpLmdldEFtb3VudCgpKVxuICAgICAgfVxuXG4gICAgICBsZXQgb3V0dG90YWw6IEJOID0gbmV3IEJOKDApXG5cbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0eHUxT3V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBvdXR0b3RhbCA9IG91dHRvdGFsLmFkZCgodHh1MU91dHNbaV0uZ2V0T3V0cHV0KCkgYXMgQW1vdW50T3V0cHV0KS5nZXRBbW91bnQoKSlcbiAgICAgIH1cblxuICAgICAgbGV0IHN0YWtldG90YWw6IEJOID0gbmV3IEJOKDApXG5cbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0eHUxU3Rha2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc3Rha2V0b3RhbCA9IHN0YWtldG90YWwuYWRkKCh0eHUxU3Rha2VbaV0uZ2V0T3V0cHV0KCkgYXMgQW1vdW50T3V0cHV0KS5nZXRBbW91bnQoKSlcbiAgICAgIH1cblxuICAgICAgbGV0IHRvdGFsdG90YWw6IEJOID0gbmV3IEJOKDApXG5cbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0eHUxVG90YWwubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdG90YWx0b3RhbCA9IHRvdGFsdG90YWwuYWRkKCh0eHUxVG90YWxbaV0uZ2V0T3V0cHV0KCkgYXMgQW1vdW50T3V0cHV0KS5nZXRBbW91bnQoKSlcbiAgICAgIH1cblxuICAgICAgZXhwZWN0KGludG90YWwudG9TdHJpbmcoMTApKS50b0JlKFwiNDAwMDAwMDAwMFwiKVxuICAgICAgZXhwZWN0KG91dHRvdGFsLnRvU3RyaW5nKDEwKSkudG9CZShcIjEwMDAwMDAwMDBcIilcbiAgICAgIGV4cGVjdChzdGFrZXRvdGFsLnRvU3RyaW5nKDEwKSkudG9CZShcIjMwMDAwMDAwMDBcIilcbiAgICAgIGV4cGVjdCh0b3RhbHRvdGFsLnRvU3RyaW5nKDEwKSkudG9CZShcIjQwMDAwMDAwMDBcIilcblxuICAgIH0pXG5cbiAgICB0ZXN0KCdidWlsZENyZWF0ZVN1Ym5ldFR4MScsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIHBsYXRmb3Jtdm0uc2V0Q3JlYXRpb25UeEZlZShuZXcgQk4oMTApKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYxOiBCdWZmZXJbXSA9IGFkZHJzMS5tYXAoKGEpOiBCdWZmZXIgPT4gcGxhdGZvcm12bS5wYXJzZUFkZHJlc3MoYSkpXG4gICAgICBjb25zdCBhZGRyYnVmZjI6IEJ1ZmZlcltdID0gYWRkcnMyLm1hcCgoYSk6IEJ1ZmZlciA9PiBwbGF0Zm9ybXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGFkZHJidWZmMzogQnVmZmVyW10gPSBhZGRyczMubWFwKChhKTogQnVmZmVyID0+IHBsYXRmb3Jtdm0ucGFyc2VBZGRyZXNzKGEpKVxuXG4gICAgICBjb25zdCB0eHUxOiBVbnNpZ25lZFR4ID0gYXdhaXQgcGxhdGZvcm12bS5idWlsZENyZWF0ZVN1Ym5ldFR4KFxuICAgICAgICBzZXQsXG4gICAgICAgIGFkZHJzMSxcbiAgICAgICAgYWRkcnMyLFxuICAgICAgICBhZGRyczMsXG4gICAgICAgIDEsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLCBVbml4Tm93KClcbiAgICAgIClcblxuICAgICAgY29uc3QgdHh1MjogVW5zaWduZWRUeCA9IHNldC5idWlsZENyZWF0ZVN1Ym5ldFR4KFxuICAgICAgICBuZXR3b3JrSUQsIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSxcbiAgICAgICAgYWRkcmJ1ZmYxLFxuICAgICAgICBhZGRyYnVmZjIsXG4gICAgICAgIGFkZHJidWZmMyxcbiAgICAgICAgMSxcbiAgICAgICAgcGxhdGZvcm12bS5nZXRDcmVhdGlvblR4RmVlKCksXG4gICAgICAgIGFzc2V0SUQsXG4gICAgICAgIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSwgVW5peE5vdygpXG4gICAgICApXG4gICAgICBleHBlY3QodHh1Mi50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSkudG9CZSh0eHUxLnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKVxuICAgICAgZXhwZWN0KHR4dTIudG9TdHJpbmcoKSkudG9CZSh0eHUxLnRvU3RyaW5nKCkpXG5cbiAgICAgIGNvbnN0IHR4MTogVHggPSB0eHUxLnNpZ24ocGxhdGZvcm12bS5rZXlDaGFpbigpKVxuICAgICAgY29uc3QgY2hlY2tUeDogc3RyaW5nID0gdHgxLnRvQnVmZmVyKCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4MW9iajogb2JqZWN0ID0gdHgxLnNlcmlhbGl6ZShcImhleFwiKVxuICAgICAgY29uc3QgdHgxc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDFvYmopXG5cbiAgICAgIGNvbnN0IHR4Mm5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDFzdHIpXG4gICAgICBjb25zdCB0eDI6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4Mi5kZXNlcmlhbGl6ZSh0eDJuZXdvYmosIFwiaGV4XCIpXG5cbiAgICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBjb25zdCB0eDM6IFR4ID0gdHh1MS5zaWduKHBsYXRmb3Jtdm0ua2V5Q2hhaW4oKSlcbiAgICAgIGNvbnN0IHR4M29iajogb2JqZWN0ID0gdHgzLnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgICAgY29uc3QgdHgzc3RyOiBzdHJpbmcgPSBKU09OLnN0cmluZ2lmeSh0eDNvYmopXG5cbiAgICAgIGNvbnN0IHR4NG5ld29iajogb2JqZWN0ID0gSlNPTi5wYXJzZSh0eDNzdHIpXG4gICAgICBjb25zdCB0eDQ6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4NC5kZXNlcmlhbGl6ZSh0eDRuZXdvYmosIGRpc3BsYXkpXG5cbiAgICAgIGV4cGVjdCh0eDQudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKSkudG9CZShjaGVja1R4KVxuXG4gICAgICBzZXJpYWx6ZWl0KHR4MSwgXCJDcmVhdGVTdWJuZXRUeFwiKVxuXG4gICAgfSlcblxuICAgIHRlc3QoJ2J1aWxkQ3JlYXRlU3VibmV0VHggMicsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAgIHBsYXRmb3Jtdm0uc2V0Q3JlYXRpb25UeEZlZShuZXcgQk4oMTApKVxuICAgICAgY29uc3QgYWRkcmJ1ZmYxID0gYWRkcnMxLm1hcCgoYSkgPT4gcGxhdGZvcm12bS5wYXJzZUFkZHJlc3MoYSkpXG4gICAgICBjb25zdCBhZGRyYnVmZjIgPSBhZGRyczIubWFwKChhKSA9PiBwbGF0Zm9ybXZtLnBhcnNlQWRkcmVzcyhhKSlcbiAgICAgIGNvbnN0IGFkZHJidWZmMyA9IGFkZHJzMy5tYXAoKGEpID0+IHBsYXRmb3Jtdm0ucGFyc2VBZGRyZXNzKGEpKVxuXG4gICAgICBjb25zdCB0eHUxOiBVbnNpZ25lZFR4ID0gYXdhaXQgcGxhdGZvcm12bS5idWlsZENyZWF0ZVN1Ym5ldFR4KFxuICAgICAgICBsc2V0LFxuICAgICAgICBhZGRyczEsXG4gICAgICAgIGFkZHJzMixcbiAgICAgICAgYWRkcnMzLFxuICAgICAgICAxLFxuICAgICAgICBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKSwgVW5peE5vdygpXG4gICAgICApXG5cbiAgICAgIGNvbnN0IHR4dTI6IFVuc2lnbmVkVHggPSBsc2V0LmJ1aWxkQ3JlYXRlU3VibmV0VHgoXG4gICAgICAgIG5ldHdvcmtJRCwgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLFxuICAgICAgICBhZGRyYnVmZjEsXG4gICAgICAgIGFkZHJidWZmMixcbiAgICAgICAgYWRkcmJ1ZmYzLFxuICAgICAgICAxLFxuICAgICAgICBwbGF0Zm9ybXZtLmdldENyZWF0aW9uVHhGZWUoKSxcbiAgICAgICAgYXNzZXRJRCxcbiAgICAgICAgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIikuZ2V0UGF5bG9hZCgpLCBVbml4Tm93KClcbiAgICAgIClcbiAgICAgIGV4cGVjdCh0eHUyLnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKS50b0JlKHR4dTEudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpXG4gICAgICBleHBlY3QodHh1Mi50b1N0cmluZygpKS50b0JlKHR4dTEudG9TdHJpbmcoKSlcblxuICAgIH0pXG4gIH0pXG5cbiAgdGVzdCgnZ2V0UmV3YXJkVVRYT3MnLCBhc3luYyAoKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gICAgY29uc3QgdHhJRDogc3RyaW5nID0gJzdzaWszUHI2cjFGZUxydksxb1d3RUNCUzhpSjVWUHVTaCdcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8R2V0UmV3YXJkVVRYT3NSZXNwb25zZT4gPSBhcGkuZ2V0UmV3YXJkVVRYT3ModHhJRClcbiAgICBjb25zdCBwYXlsb2FkOiBvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHsgbnVtRmV0Y2hlZDogJzAnLCB1dHhvczogW10sIGVuY29kaW5nOiAnY2I1OCcgfVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGNvbnN0IHJlc3BvbnNlOiBHZXRSZXdhcmRVVFhPc1Jlc3BvbnNlID0gYXdhaXQgcmVzdWx0XG5cbiAgICBleHBlY3QobW9ja0F4aW9zLnJlcXVlc3QpLnRvSGF2ZUJlZW5DYWxsZWRUaW1lcygxKVxuICAgIGV4cGVjdChyZXNwb25zZSkudG9CZShwYXlsb2FkW1wicmVzdWx0XCJdKVxuICB9KVxufSlcbiJdfQ==