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
const utxos_1 = require("src/apis/avm/utxos");
const api_1 = require("src/apis/avm/api");
const tx_1 = require("src/apis/avm/tx");
const keychain_1 = require("src/apis/avm/keychain");
const inputs_1 = require("src/apis/avm/inputs");
const create_hash_1 = __importDefault(require("create-hash"));
const bintools_1 = __importDefault(require("src/utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const outputs_1 = require("src/apis/avm/outputs");
const constants_1 = require("src/apis/avm/constants");
const ops_1 = require("src/apis/avm/ops");
const index_1 = require("src/index");
const payload_1 = require("src/utils/payload");
const initialstates_1 = require("src/apis/avm/initialstates");
const helperfunctions_1 = require("src/utils/helperfunctions");
const basetx_1 = require("src/apis/avm/basetx");
const createassettx_1 = require("src/apis/avm/createassettx");
const operationtx_1 = require("src/apis/avm/operationtx");
const importtx_1 = require("src/apis/avm/importtx");
const exporttx_1 = require("src/apis/avm/exporttx");
const constants_2 = require("src/utils/constants");
const constants_3 = require("src/utils/constants");
const constants_4 = require("../../../src/utils/constants");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
describe('Transactions', () => {
    let set;
    let keymgr1;
    let keymgr2;
    let keymgr3;
    let addrs1;
    let addrs2;
    let addrs3;
    let utxos;
    let inputs;
    let outputs;
    let ops;
    let importIns;
    let importUTXOs;
    let exportOuts;
    let fungutxos;
    let exportUTXOIDS;
    let api;
    const amnt = 10000;
    const netid = 12345;
    const memo = buffer_1.Buffer.from("AvalancheJS");
    const bID = constants_3.Defaults.network[netid].X.blockchainID;
    const alias = 'X';
    const assetID = buffer_1.Buffer.from(create_hash_1.default('sha256').update("Well, now, don't you tell me to smile, you stick around I'll make it worth your while.").digest());
    const NFTassetID = buffer_1.Buffer.from(create_hash_1.default('sha256').update("I can't stand it, I know you planned it, I'mma set straight this Watergate.'").digest());
    const codecID_zero = 0;
    const codecID_one = 1;
    let amount;
    let addresses;
    let fallAddresses;
    let locktime;
    let fallLocktime;
    let threshold;
    let fallThreshold;
    const nftutxoids = [];
    const ip = '127.0.0.1';
    const port = 8080;
    const protocol = 'http';
    let avalanche;
    const blockchainID = bintools.cb58Decode(bID);
    const name = 'Mortycoin is the dumb as a sack of hammers.';
    const symbol = 'morT';
    const denomination = 8;
    let avaxAssetID;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        avalanche = new index_1.Avalanche(ip, port, protocol, netid, undefined, undefined, null, true);
        api = new api_1.AVMAPI(avalanche, '/ext/bc/avm', bID);
        const result = api.getAVAXAssetID();
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
        avaxAssetID = yield result;
    }));
    beforeEach(() => {
        set = new utxos_1.UTXOSet();
        keymgr1 = new keychain_1.KeyChain(avalanche.getHRP(), alias);
        keymgr2 = new keychain_1.KeyChain(avalanche.getHRP(), alias);
        keymgr3 = new keychain_1.KeyChain(avalanche.getHRP(), alias);
        addrs1 = [];
        addrs2 = [];
        addrs3 = [];
        utxos = [];
        inputs = [];
        outputs = [];
        importIns = [];
        importUTXOs = [];
        exportOuts = [];
        fungutxos = [];
        exportUTXOIDS = [];
        ops = [];
        for (let i = 0; i < 3; i++) {
            addrs1.push(keymgr1.makeKey().getAddress());
            addrs2.push(keymgr2.makeKey().getAddress());
            addrs3.push(keymgr3.makeKey().getAddress());
        }
        amount = constants_4.ONEAVAX.mul(new bn_js_1.default(amnt));
        addresses = keymgr1.getAddresses();
        fallAddresses = keymgr2.getAddresses();
        locktime = new bn_js_1.default(54321);
        fallLocktime = locktime.add(new bn_js_1.default(50));
        threshold = 3;
        fallThreshold = 1;
        const payload = buffer_1.Buffer.alloc(1024);
        payload.write("All you Trekkies and TV addicts, Don't mean to diss don't mean to bring static.", 0, 1024, 'utf8');
        for (let i = 0; i < 5; i++) {
            let txid = buffer_1.Buffer.from(create_hash_1.default('sha256').update(bintools.fromBNToBuffer(new bn_js_1.default(i), 32)).digest());
            let txidx = buffer_1.Buffer.from(bintools.fromBNToBuffer(new bn_js_1.default(i), 4));
            const out = new outputs_1.SECPTransferOutput(amount, addresses, locktime, threshold);
            const xferout = new outputs_1.TransferableOutput(assetID, out);
            outputs.push(xferout);
            const u = new utxos_1.UTXO(constants_1.AVMConstants.LATESTCODEC, txid, txidx, assetID, out);
            utxos.push(u);
            fungutxos.push(u);
            importUTXOs.push(u);
            txid = u.getTxID();
            txidx = u.getOutputIdx();
            const input = new inputs_1.SECPTransferInput(amount);
            const xferin = new inputs_1.TransferableInput(txid, txidx, assetID, input);
            inputs.push(xferin);
            const nout = new outputs_1.NFTTransferOutput(1000 + i, payload, addresses, locktime, threshold);
            const op = new ops_1.NFTTransferOperation(nout);
            const nfttxid = buffer_1.Buffer.from(create_hash_1.default('sha256').update(bintools.fromBNToBuffer(new bn_js_1.default(1000 + i), 32)).digest());
            const nftutxo = new utxos_1.UTXO(constants_1.AVMConstants.LATESTCODEC, nfttxid, 1000 + i, NFTassetID, nout);
            nftutxoids.push(nftutxo.getUTXOID());
            const xferop = new ops_1.TransferableOperation(NFTassetID, [nftutxo.getUTXOID()], op);
            ops.push(xferop);
            utxos.push(nftutxo);
        }
        for (let i = 1; i < 4; i++) {
            importIns.push(inputs[i]);
            exportOuts.push(outputs[i]);
            exportUTXOIDS.push(fungutxos[i].getUTXOID());
        }
        set.addArray(utxos);
    });
    test("BaseTx codecIDs", () => {
        const baseTx = new basetx_1.BaseTx();
        expect(baseTx.getCodecID()).toBe(codecID_zero);
        expect(baseTx.getTypeID()).toBe(constants_1.AVMConstants.BASETX);
        baseTx.setCodecID(codecID_one);
        expect(baseTx.getCodecID()).toBe(codecID_one);
        expect(baseTx.getTypeID()).toBe(constants_1.AVMConstants.BASETX_CODECONE);
        baseTx.setCodecID(codecID_zero);
        expect(baseTx.getCodecID()).toBe(codecID_zero);
        expect(baseTx.getTypeID()).toBe(constants_1.AVMConstants.BASETX);
    });
    test("Invalid BaseTx codecID", () => {
        const baseTx = new basetx_1.BaseTx();
        expect(() => {
            baseTx.setCodecID(2);
        }).toThrow("Error - BaseTx.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
    });
    test("CreateAssetTx codecIDs", () => {
        const createAssetTx = new createassettx_1.CreateAssetTx();
        expect(createAssetTx.getCodecID()).toBe(codecID_zero);
        expect(createAssetTx.getTypeID()).toBe(constants_1.AVMConstants.CREATEASSETTX);
        createAssetTx.setCodecID(codecID_one);
        expect(createAssetTx.getCodecID()).toBe(codecID_one);
        expect(createAssetTx.getTypeID()).toBe(constants_1.AVMConstants.CREATEASSETTX_CODECONE);
        createAssetTx.setCodecID(codecID_zero);
        expect(createAssetTx.getCodecID()).toBe(codecID_zero);
        expect(createAssetTx.getTypeID()).toBe(constants_1.AVMConstants.CREATEASSETTX);
    });
    test("Invalid CreateAssetTx codecID", () => {
        const createAssetTx = new createassettx_1.CreateAssetTx();
        expect(() => {
            createAssetTx.setCodecID(2);
        }).toThrow("Error - CreateAssetTx.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
    });
    test("OperationTx codecIDs", () => {
        const operationTx = new operationtx_1.OperationTx();
        expect(operationTx.getCodecID()).toBe(codecID_zero);
        expect(operationTx.getTypeID()).toBe(constants_1.AVMConstants.OPERATIONTX);
        operationTx.setCodecID(codecID_one);
        expect(operationTx.getCodecID()).toBe(codecID_one);
        expect(operationTx.getTypeID()).toBe(constants_1.AVMConstants.OPERATIONTX_CODECONE);
        operationTx.setCodecID(codecID_zero);
        expect(operationTx.getCodecID()).toBe(codecID_zero);
        expect(operationTx.getTypeID()).toBe(constants_1.AVMConstants.OPERATIONTX);
    });
    test("Invalid OperationTx codecID", () => {
        const operationTx = new operationtx_1.OperationTx();
        expect(() => {
            operationTx.setCodecID(2);
        }).toThrow("Error - OperationTx.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
    });
    test("ImportTx codecIDs", () => {
        const importTx = new importtx_1.ImportTx();
        expect(importTx.getCodecID()).toBe(codecID_zero);
        expect(importTx.getTypeID()).toBe(constants_1.AVMConstants.IMPORTTX);
        importTx.setCodecID(codecID_one);
        expect(importTx.getCodecID()).toBe(codecID_one);
        expect(importTx.getTypeID()).toBe(constants_1.AVMConstants.IMPORTTX_CODECONE);
        importTx.setCodecID(codecID_zero);
        expect(importTx.getCodecID()).toBe(codecID_zero);
        expect(importTx.getTypeID()).toBe(constants_1.AVMConstants.IMPORTTX);
    });
    test("Invalid ImportTx codecID", () => {
        const importTx = new importtx_1.ImportTx();
        expect(() => {
            importTx.setCodecID(2);
        }).toThrow("Error - ImportTx.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
    });
    test("ExportTx codecIDs", () => {
        const exportTx = new exporttx_1.ExportTx();
        expect(exportTx.getCodecID()).toBe(codecID_zero);
        expect(exportTx.getTypeID()).toBe(constants_1.AVMConstants.EXPORTTX);
        exportTx.setCodecID(codecID_one);
        expect(exportTx.getCodecID()).toBe(codecID_one);
        expect(exportTx.getTypeID()).toBe(constants_1.AVMConstants.EXPORTTX_CODECONE);
        exportTx.setCodecID(codecID_zero);
        expect(exportTx.getCodecID()).toBe(codecID_zero);
        expect(exportTx.getTypeID()).toBe(constants_1.AVMConstants.EXPORTTX);
    });
    test("Invalid ExportTx codecID", () => {
        const exportTx = new exporttx_1.ExportTx();
        expect(() => {
            exportTx.setCodecID(2);
        }).toThrow("Error - ExportTx.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
    });
    test('Create small BaseTx that is Goose Egg Tx', () => __awaiter(void 0, void 0, void 0, function* () {
        const outs = [];
        const ins = [];
        const outputAmt = new bn_js_1.default("266");
        const output = new outputs_1.SECPTransferOutput(outputAmt, addrs1, new bn_js_1.default(0), 1);
        const transferableOutput = new outputs_1.TransferableOutput(avaxAssetID, output);
        outs.push(transferableOutput);
        const inputAmt = new bn_js_1.default("400");
        const input = new inputs_1.SECPTransferInput(inputAmt);
        input.addSignatureIdx(0, addrs1[0]);
        const txid = bintools.cb58Decode("n8XH5JY1EX5VYqDeAhB4Zd4GKxi9UNQy6oPpMsCAj1Q6xkiiL");
        const outputIndex = buffer_1.Buffer.from(bintools.fromBNToBuffer(new bn_js_1.default(0), 4));
        const transferableInput = new inputs_1.TransferableInput(txid, outputIndex, avaxAssetID, input);
        ins.push(transferableInput);
        const baseTx = new basetx_1.BaseTx(netid, blockchainID, outs, ins);
        const unsignedTx = new tx_1.UnsignedTx(baseTx);
        expect(yield api.checkGooseEgg(unsignedTx)).toBe(true);
    }));
    test('confirm inputTotal, outputTotal and fee are correct', () => __awaiter(void 0, void 0, void 0, function* () {
        // AVAX assetID
        const assetID = bintools.cb58Decode("n8XH5JY1EX5VYqDeAhB4Zd4GKxi9UNQy6oPpMsCAj1Q6xkiiL");
        const outs = [];
        const ins = [];
        const outputAmt = new bn_js_1.default("266");
        const output = new outputs_1.SECPTransferOutput(outputAmt, addrs1, new bn_js_1.default(0), 1);
        const transferableOutput = new outputs_1.TransferableOutput(assetID, output);
        outs.push(transferableOutput);
        const inputAmt = new bn_js_1.default("400");
        const input = new inputs_1.SECPTransferInput(inputAmt);
        input.addSignatureIdx(0, addrs1[0]);
        const txid = bintools.cb58Decode("n8XH5JY1EX5VYqDeAhB4Zd4GKxi9UNQy6oPpMsCAj1Q6xkiiL");
        const outputIndex = buffer_1.Buffer.from(bintools.fromBNToBuffer(new bn_js_1.default(0), 4));
        const transferableInput = new inputs_1.TransferableInput(txid, outputIndex, assetID, input);
        ins.push(transferableInput);
        const baseTx = new basetx_1.BaseTx(netid, blockchainID, outs, ins);
        const unsignedTx = new tx_1.UnsignedTx(baseTx);
        const inputTotal = unsignedTx.getInputTotal(assetID);
        const outputTotal = unsignedTx.getOutputTotal(assetID);
        const burn = unsignedTx.getBurn(assetID);
        expect(inputTotal.toNumber()).toEqual(new bn_js_1.default(400).toNumber());
        expect(outputTotal.toNumber()).toEqual(new bn_js_1.default(266).toNumber());
        expect(burn.toNumber()).toEqual(new bn_js_1.default(134).toNumber());
    }));
    test("Create small BaseTx that isn't Goose Egg Tx", () => __awaiter(void 0, void 0, void 0, function* () {
        const outs = [];
        const ins = [];
        const outputAmt = new bn_js_1.default("267");
        const output = new outputs_1.SECPTransferOutput(outputAmt, addrs1, new bn_js_1.default(0), 1);
        const transferableOutput = new outputs_1.TransferableOutput(avaxAssetID, output);
        outs.push(transferableOutput);
        const inputAmt = new bn_js_1.default("400");
        const input = new inputs_1.SECPTransferInput(inputAmt);
        input.addSignatureIdx(0, addrs1[0]);
        const txid = bintools.cb58Decode("n8XH5JY1EX5VYqDeAhB4Zd4GKxi9UNQy6oPpMsCAj1Q6xkiiL");
        const outputIndex = buffer_1.Buffer.from(bintools.fromBNToBuffer(new bn_js_1.default(0), 4));
        const transferableInput = new inputs_1.TransferableInput(txid, outputIndex, avaxAssetID, input);
        ins.push(transferableInput);
        const baseTx = new basetx_1.BaseTx(netid, blockchainID, outs, ins);
        const unsignedTx = new tx_1.UnsignedTx(baseTx);
        expect(yield api.checkGooseEgg(unsignedTx)).toBe(true);
    }));
    test('Create large BaseTx that is Goose Egg Tx', () => __awaiter(void 0, void 0, void 0, function* () {
        const outs = [];
        const ins = [];
        const outputAmt = new bn_js_1.default("609555500000");
        const output = new outputs_1.SECPTransferOutput(outputAmt, addrs1, new bn_js_1.default(0), 1);
        const transferableOutput = new outputs_1.TransferableOutput(avaxAssetID, output);
        outs.push(transferableOutput);
        const inputAmt = new bn_js_1.default("45000000000000000");
        const input = new inputs_1.SECPTransferInput(inputAmt);
        input.addSignatureIdx(0, addrs1[0]);
        const txid = bintools.cb58Decode("n8XH5JY1EX5VYqDeAhB4Zd4GKxi9UNQy6oPpMsCAj1Q6xkiiL");
        const outputIndex = buffer_1.Buffer.from(bintools.fromBNToBuffer(new bn_js_1.default(0), 4));
        const transferableInput = new inputs_1.TransferableInput(txid, outputIndex, avaxAssetID, input);
        ins.push(transferableInput);
        const baseTx = new basetx_1.BaseTx(netid, blockchainID, outs, ins);
        const unsignedTx = new tx_1.UnsignedTx(baseTx);
        expect(yield api.checkGooseEgg(unsignedTx)).toBe(false);
    }));
    test("Create large BaseTx that isn't Goose Egg Tx", () => __awaiter(void 0, void 0, void 0, function* () {
        const outs = [];
        const ins = [];
        const outputAmt = new bn_js_1.default("44995609555500000");
        const output = new outputs_1.SECPTransferOutput(outputAmt, addrs1, new bn_js_1.default(0), 1);
        const transferableOutput = new outputs_1.TransferableOutput(avaxAssetID, output);
        outs.push(transferableOutput);
        const inputAmt = new bn_js_1.default("45000000000000000");
        const input = new inputs_1.SECPTransferInput(inputAmt);
        input.addSignatureIdx(0, addrs1[0]);
        const txid = bintools.cb58Decode("n8XH5JY1EX5VYqDeAhB4Zd4GKxi9UNQy6oPpMsCAj1Q6xkiiL");
        const outputIndex = buffer_1.Buffer.from(bintools.fromBNToBuffer(new bn_js_1.default(0), 4));
        const transferableInput = new inputs_1.TransferableInput(txid, outputIndex, avaxAssetID, input);
        ins.push(transferableInput);
        const baseTx = new basetx_1.BaseTx(netid, blockchainID, outs, ins);
        const unsignedTx = new tx_1.UnsignedTx(baseTx);
        expect(yield api.checkGooseEgg(unsignedTx)).toBe(true);
    }));
    test('Creation UnsignedTx', () => {
        const baseTx = new basetx_1.BaseTx(netid, blockchainID, outputs, inputs);
        const txu = new tx_1.UnsignedTx(baseTx);
        const txins = txu.getTransaction().getIns();
        const txouts = txu.getTransaction().getOuts();
        expect(txins.length).toBe(inputs.length);
        expect(txouts.length).toBe(outputs.length);
        expect(txu.getTransaction().getTxType()).toBe(0);
        expect(txu.getTransaction().getNetworkID()).toBe(12345);
        expect(txu.getTransaction().getBlockchainID().toString('hex')).toBe(blockchainID.toString('hex'));
        let a = [];
        let b = [];
        for (let i = 0; i < txins.length; i++) {
            a.push(txins[i].toString());
            b.push(inputs[i].toString());
        }
        expect(JSON.stringify(a.sort())).toBe(JSON.stringify(b.sort()));
        a = [];
        b = [];
        for (let i = 0; i < txouts.length; i++) {
            a.push(txouts[i].toString());
            b.push(outputs[i].toString());
        }
        expect(JSON.stringify(a.sort())).toBe(JSON.stringify(b.sort()));
        const txunew = new tx_1.UnsignedTx();
        txunew.fromBuffer(txu.toBuffer());
        expect(txunew.toBuffer().toString('hex')).toBe(txu.toBuffer().toString('hex'));
        expect(txunew.toString()).toBe(txu.toString());
    });
    test('Creation UnsignedTx Check Amount', () => {
        expect(() => {
            set.buildBaseTx(netid, blockchainID, constants_4.ONEAVAX.mul(new bn_js_1.default(amnt * 10000)), assetID, addrs3, addrs1, addrs1);
        }).toThrow();
    });
    test('CreateAssetTX', () => {
        const secpbase1 = new outputs_1.SECPTransferOutput(new bn_js_1.default(777), addrs3, locktime, 1);
        const secpbase2 = new outputs_1.SECPTransferOutput(new bn_js_1.default(888), addrs2, locktime, 1);
        const secpbase3 = new outputs_1.SECPTransferOutput(new bn_js_1.default(999), addrs2, locktime, 1);
        const initialState = new initialstates_1.InitialStates();
        initialState.addOutput(secpbase1, constants_1.AVMConstants.SECPFXID);
        initialState.addOutput(secpbase2, constants_1.AVMConstants.SECPFXID);
        initialState.addOutput(secpbase3, constants_1.AVMConstants.SECPFXID);
        const name = 'Rickcoin is the most intelligent coin';
        const symbol = 'RICK';
        const denomination = 9;
        const txu = new createassettx_1.CreateAssetTx(netid, blockchainID, outputs, inputs, new payload_1.UTF8Payload("hello world").getPayload(), name, symbol, denomination, initialState);
        const txins = txu.getIns();
        const txouts = txu.getOuts();
        const initState = txu.getInitialStates();
        expect(txins.length).toBe(inputs.length);
        expect(txouts.length).toBe(outputs.length);
        expect(initState.toBuffer().toString('hex')).toBe(initialState.toBuffer().toString('hex'));
        expect(txu.getTxType()).toBe(constants_1.AVMConstants.CREATEASSETTX);
        expect(txu.getNetworkID()).toBe(12345);
        expect(txu.getBlockchainID().toString('hex')).toBe(blockchainID.toString('hex'));
        expect(txu.getName()).toBe(name);
        expect(txu.getSymbol()).toBe(symbol);
        expect(txu.getDenomination()).toBe(denomination);
        expect(txu.getDenominationBuffer().readUInt8(0)).toBe(denomination);
        let a = [];
        let b = [];
        for (let i = 0; i < txins.length; i++) {
            a.push(txins[i].toString());
            b.push(inputs[i].toString());
        }
        expect(JSON.stringify(a.sort())).toBe(JSON.stringify(b.sort()));
        a = [];
        b = [];
        for (let i = 0; i < txouts.length; i++) {
            a.push(txouts[i].toString());
            b.push(outputs[i].toString());
        }
        expect(JSON.stringify(a.sort())).toBe(JSON.stringify(b.sort()));
        const txunew = new createassettx_1.CreateAssetTx();
        txunew.fromBuffer(txu.toBuffer());
        expect(txunew.toBuffer().toString('hex')).toBe(txu.toBuffer().toString('hex'));
        expect(txunew.toString()).toBe(txu.toString());
    });
    test('Creation OperationTx', () => {
        const optx = new operationtx_1.OperationTx(netid, blockchainID, outputs, inputs, new payload_1.UTF8Payload("hello world").getPayload(), ops);
        const txunew = new operationtx_1.OperationTx();
        const opbuff = optx.toBuffer();
        txunew.fromBuffer(opbuff);
        expect(txunew.toBuffer().toString('hex')).toBe(opbuff.toString('hex'));
        expect(txunew.toString()).toBe(optx.toString());
        expect(optx.getOperations().length).toBe(ops.length);
    });
    test('Creation ImportTx', () => {
        const bombtx = new importtx_1.ImportTx(netid, blockchainID, outputs, inputs, new payload_1.UTF8Payload("hello world").getPayload(), undefined, importIns);
        expect(() => {
            bombtx.toBuffer();
        }).toThrow();
        const importtx = new importtx_1.ImportTx(netid, blockchainID, outputs, inputs, new payload_1.UTF8Payload("hello world").getPayload(), bintools.cb58Decode(constants_2.PlatformChainID), importIns);
        const txunew = new importtx_1.ImportTx();
        const importbuff = importtx.toBuffer();
        txunew.fromBuffer(importbuff);
        expect(txunew.toBuffer().toString('hex')).toBe(importbuff.toString('hex'));
        expect(txunew.toString()).toBe(importtx.toString());
        expect(importtx.getImportInputs().length).toBe(importIns.length);
    });
    test('Creation ExportTx', () => {
        const bombtx = new exporttx_1.ExportTx(netid, blockchainID, outputs, inputs, undefined, undefined, exportOuts);
        expect(() => {
            bombtx.toBuffer();
        }).toThrow();
        const exporttx = new exporttx_1.ExportTx(netid, blockchainID, outputs, inputs, undefined, bintools.cb58Decode(constants_2.PlatformChainID), exportOuts);
        const txunew = new exporttx_1.ExportTx();
        const exportbuff = exporttx.toBuffer();
        txunew.fromBuffer(exportbuff);
        expect(txunew.toBuffer().toString('hex')).toBe(exportbuff.toString('hex'));
        expect(txunew.toString()).toBe(exporttx.toString());
        expect(exporttx.getExportOutputs().length).toBe(exportOuts.length);
    });
    test('Creation Tx1 with asof, locktime, threshold', () => {
        const txu = set.buildBaseTx(netid, blockchainID, new bn_js_1.default(9000), assetID, addrs3, addrs1, addrs1, undefined, undefined, undefined, helperfunctions_1.UnixNow(), helperfunctions_1.UnixNow().add(new bn_js_1.default(50)), 1);
        const tx = txu.sign(keymgr1);
        const tx2 = new tx_1.Tx();
        tx2.fromString(tx.toString());
        expect(tx2.toBuffer().toString('hex')).toBe(tx.toBuffer().toString('hex'));
        expect(tx2.toString()).toBe(tx.toString());
    });
    test('Creation Tx2 without asof, locktime, threshold', () => {
        const txu = set.buildBaseTx(netid, blockchainID, new bn_js_1.default(9000), assetID, addrs3, addrs1, addrs1);
        const tx = txu.sign(keymgr1);
        const tx2 = new tx_1.Tx();
        tx2.fromBuffer(tx.toBuffer());
        expect(tx2.toBuffer().toString('hex')).toBe(tx.toBuffer().toString('hex'));
        expect(tx2.toString()).toBe(tx.toString());
    });
    test('Creation Tx3 using OperationTx', () => {
        const txu = set.buildNFTTransferTx(netid, blockchainID, addrs3, addrs1, addrs2, nftutxoids, new bn_js_1.default(90), avaxAssetID, undefined, helperfunctions_1.UnixNow(), helperfunctions_1.UnixNow().add(new bn_js_1.default(50)), 1);
        const tx = txu.sign(keymgr1);
        const tx2 = new tx_1.Tx();
        tx2.fromBuffer(tx.toBuffer());
        expect(tx2.toBuffer().toString('hex')).toBe(tx.toBuffer().toString('hex'));
    });
    test('Creation Tx4 using ImportTx', () => {
        const txu = set.buildImportTx(netid, blockchainID, addrs3, addrs1, addrs2, importUTXOs, bintools.cb58Decode(constants_2.PlatformChainID), new bn_js_1.default(90), assetID, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow());
        const tx = txu.sign(keymgr1);
        const tx2 = new tx_1.Tx();
        tx2.fromBuffer(tx.toBuffer());
        expect(tx2.toBuffer().toString('hex')).toBe(tx.toBuffer().toString('hex'));
    });
    test('Creation Tx5 using ExportTx', () => {
        const txu = set.buildExportTx(netid, blockchainID, new bn_js_1.default(90), avaxAssetID, addrs3, addrs1, addrs2, bintools.cb58Decode(constants_2.PlatformChainID), undefined, undefined, new payload_1.UTF8Payload("hello world").getPayload(), helperfunctions_1.UnixNow());
        const tx = txu.sign(keymgr1);
        const tx2 = new tx_1.Tx();
        tx2.fromBuffer(tx.toBuffer());
        expect(tx.toBuffer().toString('hex')).toBe(tx2.toBuffer().toString('hex'));
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHgudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3RzL2FwaXMvYXZtL3R4LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxzRUFBdUM7QUFDdkMsOENBQWtEO0FBQ2xELDBDQUF5QztBQUN6Qyx3Q0FBZ0Q7QUFDaEQsb0RBQWdEO0FBQ2hELGdEQUEwRTtBQUMxRSw4REFBb0M7QUFDcEMsa0VBQXlDO0FBQ3pDLGtEQUFzQjtBQUN0QixvQ0FBZ0M7QUFDaEMsa0RBQWdHO0FBQ2hHLHNEQUFxRDtBQUNyRCwwQ0FBOEU7QUFDOUUscUNBQXFDO0FBQ3JDLCtDQUErQztBQUMvQyw4REFBMEQ7QUFDMUQsK0RBQW1EO0FBQ25ELGdEQUE0QztBQUM1Qyw4REFBMEQ7QUFDMUQsMERBQXNEO0FBQ3RELG9EQUFnRDtBQUNoRCxvREFBZ0Q7QUFDaEQsbURBQXFEO0FBQ3JELG1EQUE4QztBQUM5Qyw0REFBc0Q7QUFHdEQ7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELFFBQVEsQ0FBQyxjQUFjLEVBQUUsR0FBUyxFQUFFO0lBQ2xDLElBQUksR0FBWSxDQUFBO0lBQ2hCLElBQUksT0FBaUIsQ0FBQTtJQUNyQixJQUFJLE9BQWlCLENBQUE7SUFDckIsSUFBSSxPQUFpQixDQUFBO0lBQ3JCLElBQUksTUFBZ0IsQ0FBQTtJQUNwQixJQUFJLE1BQWdCLENBQUE7SUFDcEIsSUFBSSxNQUFnQixDQUFBO0lBQ3BCLElBQUksS0FBYSxDQUFBO0lBQ2pCLElBQUksTUFBMkIsQ0FBQTtJQUMvQixJQUFJLE9BQTZCLENBQUE7SUFDakMsSUFBSSxHQUE0QixDQUFBO0lBQ2hDLElBQUksU0FBOEIsQ0FBQTtJQUNsQyxJQUFJLFdBQW1CLENBQUE7SUFDdkIsSUFBSSxVQUFnQyxDQUFBO0lBQ3BDLElBQUksU0FBaUIsQ0FBQTtJQUNyQixJQUFJLGFBQXVC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LENBQUMsYUFBYSxDQUN0QyxLQUFLLEVBQUUsWUFBWSxFQUFFLElBQUksZUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFdBQVcsRUFDNUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQywyQkFBZSxDQUFDLEVBQzVELFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxxQkFBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLHlCQUFPLEVBQUUsQ0FDN0UsQ0FBQTtRQUNELE1BQU0sRUFBRSxHQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDaEMsTUFBTSxHQUFHLEdBQU8sSUFBSSxPQUFFLEVBQUUsQ0FBQTtRQUN4QixHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQzdCLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUM1RSxDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vY2tBeGlvcyBmcm9tICdqZXN0LW1vY2stYXhpb3MnXG5pbXBvcnQgeyBVVFhPU2V0LCBVVFhPIH0gZnJvbSAnc3JjL2FwaXMvYXZtL3V0eG9zJ1xuaW1wb3J0IHsgQVZNQVBJIH0gZnJvbSAnc3JjL2FwaXMvYXZtL2FwaSdcbmltcG9ydCB7IFVuc2lnbmVkVHgsIFR4IH0gZnJvbSAnc3JjL2FwaXMvYXZtL3R4J1xuaW1wb3J0IHsgS2V5Q2hhaW4gfSBmcm9tICdzcmMvYXBpcy9hdm0va2V5Y2hhaW4nXG5pbXBvcnQgeyBTRUNQVHJhbnNmZXJJbnB1dCwgVHJhbnNmZXJhYmxlSW5wdXQgfSBmcm9tICdzcmMvYXBpcy9hdm0vaW5wdXRzJ1xuaW1wb3J0IGNyZWF0ZUhhc2ggZnJvbSAnY3JlYXRlLWhhc2gnXG5pbXBvcnQgQmluVG9vbHMgZnJvbSAnc3JjL3V0aWxzL2JpbnRvb2xzJ1xuaW1wb3J0IEJOIGZyb20gJ2JuLmpzJ1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLydcbmltcG9ydCB7IFNFQ1BUcmFuc2Zlck91dHB1dCwgTkZUVHJhbnNmZXJPdXRwdXQsIFRyYW5zZmVyYWJsZU91dHB1dCB9IGZyb20gJ3NyYy9hcGlzL2F2bS9vdXRwdXRzJ1xuaW1wb3J0IHsgQVZNQ29uc3RhbnRzIH0gZnJvbSAnc3JjL2FwaXMvYXZtL2NvbnN0YW50cydcbmltcG9ydCB7IFRyYW5zZmVyYWJsZU9wZXJhdGlvbiwgTkZUVHJhbnNmZXJPcGVyYXRpb24gfSBmcm9tICdzcmMvYXBpcy9hdm0vb3BzJ1xuaW1wb3J0IHsgQXZhbGFuY2hlIH0gZnJvbSAnc3JjL2luZGV4J1xuaW1wb3J0IHsgVVRGOFBheWxvYWQgfSBmcm9tICdzcmMvdXRpbHMvcGF5bG9hZCdcbmltcG9ydCB7IEluaXRpYWxTdGF0ZXMgfSBmcm9tICdzcmMvYXBpcy9hdm0vaW5pdGlhbHN0YXRlcydcbmltcG9ydCB7IFVuaXhOb3cgfSBmcm9tICdzcmMvdXRpbHMvaGVscGVyZnVuY3Rpb25zJ1xuaW1wb3J0IHsgQmFzZVR4IH0gZnJvbSAnc3JjL2FwaXMvYXZtL2Jhc2V0eCdcbmltcG9ydCB7IENyZWF0ZUFzc2V0VHggfSBmcm9tICdzcmMvYXBpcy9hdm0vY3JlYXRlYXNzZXR0eCdcbmltcG9ydCB7IE9wZXJhdGlvblR4IH0gZnJvbSAnc3JjL2FwaXMvYXZtL29wZXJhdGlvbnR4J1xuaW1wb3J0IHsgSW1wb3J0VHggfSBmcm9tICdzcmMvYXBpcy9hdm0vaW1wb3J0dHgnXG5pbXBvcnQgeyBFeHBvcnRUeCB9IGZyb20gJ3NyYy9hcGlzL2F2bS9leHBvcnR0eCdcbmltcG9ydCB7IFBsYXRmb3JtQ2hhaW5JRCB9IGZyb20gJ3NyYy91dGlscy9jb25zdGFudHMnXG5pbXBvcnQgeyBEZWZhdWx0cyB9IGZyb20gJ3NyYy91dGlscy9jb25zdGFudHMnXG5pbXBvcnQgeyBPTkVBVkFYIH0gZnJvbSAnLi4vLi4vLi4vc3JjL3V0aWxzL2NvbnN0YW50cydcbmltcG9ydCB7IEh0dHBSZXNwb25zZSB9IGZyb20gJ2plc3QtbW9jay1heGlvcy9kaXN0L2xpYi9tb2NrLWF4aW9zLXR5cGVzJ1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuZGVzY3JpYmUoJ1RyYW5zYWN0aW9ucycsICgpOiB2b2lkID0+IHtcbiAgbGV0IHNldDogVVRYT1NldFxuICBsZXQga2V5bWdyMTogS2V5Q2hhaW5cbiAgbGV0IGtleW1ncjI6IEtleUNoYWluXG4gIGxldCBrZXltZ3IzOiBLZXlDaGFpblxuICBsZXQgYWRkcnMxOiBCdWZmZXJbXVxuICBsZXQgYWRkcnMyOiBCdWZmZXJbXVxuICBsZXQgYWRkcnMzOiBCdWZmZXJbXVxuICBsZXQgdXR4b3M6IFVUWE9bXVxuICBsZXQgaW5wdXRzOiBUcmFuc2ZlcmFibGVJbnB1dFtdXG4gIGxldCBvdXRwdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXVxuICBsZXQgb3BzOiBUcmFuc2ZlcmFibGVPcGVyYXRpb25bXVxuICBsZXQgaW1wb3J0SW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdXG4gIGxldCBpbXBvcnRVVFhPczogVVRYT1tdXG4gIGxldCBleHBvcnRPdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXVxuICBsZXQgZnVuZ3V0eG9zOiBVVFhPW11cbiAgbGV0IGV4cG9ydFVUWE9JRFM6IHN0cmluZ1tdXG4gIGxldCBhcGk6IEFWTUFQSVxuICBjb25zdCBhbW50OiBudW1iZXIgPSAxMDAwMFxuICBjb25zdCBuZXRpZDogbnVtYmVyID0gMTIzNDVcbiAgY29uc3QgbWVtbzogQnVmZmVyID0gQnVmZmVyLmZyb20oXCJBdmFsYW5jaGVKU1wiKVxuICBjb25zdCBiSUQ6IHN0cmluZyA9IERlZmF1bHRzLm5ldHdvcmtbbmV0aWRdLlguYmxvY2tjaGFpbklEXG4gIGNvbnN0IGFsaWFzOiBzdHJpbmcgPSAnWCdcbiAgY29uc3QgYXNzZXRJRDogQnVmZmVyID0gQnVmZmVyLmZyb20oY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKFwiV2VsbCwgbm93LCBkb24ndCB5b3UgdGVsbCBtZSB0byBzbWlsZSwgeW91IHN0aWNrIGFyb3VuZCBJJ2xsIG1ha2UgaXQgd29ydGggeW91ciB3aGlsZS5cIikuZGlnZXN0KCkpXG4gIGNvbnN0IE5GVGFzc2V0SUQ6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGNyZWF0ZUhhc2goJ3NoYTI1NicpLnVwZGF0ZShcIkkgY2FuJ3Qgc3RhbmQgaXQsIEkga25vdyB5b3UgcGxhbm5lZCBpdCwgSSdtbWEgc2V0IHN0cmFpZ2h0IHRoaXMgV2F0ZXJnYXRlLidcIikuZGlnZXN0KCkpXG4gIGNvbnN0IGNvZGVjSURfemVybzogbnVtYmVyID0gMFxuICBjb25zdCBjb2RlY0lEX29uZTogbnVtYmVyID0gMVxuICBsZXQgYW1vdW50OiBCTlxuICBsZXQgYWRkcmVzc2VzOiBCdWZmZXJbXVxuICBsZXQgZmFsbEFkZHJlc3NlczogQnVmZmVyW11cbiAgbGV0IGxvY2t0aW1lOiBCTlxuICBsZXQgZmFsbExvY2t0aW1lOiBCTlxuICBsZXQgdGhyZXNob2xkOiBudW1iZXJcbiAgbGV0IGZhbGxUaHJlc2hvbGQ6IG51bWJlclxuICBjb25zdCBuZnR1dHhvaWRzOiBzdHJpbmdbXSA9IFtdXG4gIGNvbnN0IGlwID0gJzEyNy4wLjAuMSdcbiAgY29uc3QgcG9ydCA9IDgwODBcbiAgY29uc3QgcHJvdG9jb2wgPSAnaHR0cCdcbiAgbGV0IGF2YWxhbmNoZTogQXZhbGFuY2hlXG4gIGNvbnN0IGJsb2NrY2hhaW5JRDogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZShiSUQpXG4gIGNvbnN0IG5hbWU6IHN0cmluZyA9ICdNb3J0eWNvaW4gaXMgdGhlIGR1bWIgYXMgYSBzYWNrIG9mIGhhbW1lcnMuJ1xuICBjb25zdCBzeW1ib2w6IHN0cmluZyA9ICdtb3JUJ1xuICBjb25zdCBkZW5vbWluYXRpb246IG51bWJlciA9IDhcbiAgbGV0IGF2YXhBc3NldElEOiBCdWZmZXJcblxuICBiZWZvcmVBbGwoYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGF2YWxhbmNoZSA9IG5ldyBBdmFsYW5jaGUoaXAsIHBvcnQsIHByb3RvY29sLCBuZXRpZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG51bGwsIHRydWUpXG4gICAgYXBpID0gbmV3IEFWTUFQSShhdmFsYW5jaGUsICcvZXh0L2JjL2F2bScsIGJJRClcblxuICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxCdWZmZXI+ID0gYXBpLmdldEFWQVhBc3NldElEKClcbiAgICBjb25zdCBwYXlsb2FkOm9iamVjdCA9IHtcbiAgICAgIHJlc3VsdDoge1xuICAgICAgICBuYW1lLFxuICAgICAgICBzeW1ib2wsXG4gICAgICAgIGFzc2V0SUQ6IGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRCksXG4gICAgICAgIGRlbm9taW5hdGlvbjogYCR7ZGVub21pbmF0aW9ufWAsXG4gICAgICB9LFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZU9iajogSHR0cFJlc3BvbnNlID0ge1xuICAgICAgZGF0YTogcGF5bG9hZCxcbiAgICB9XG5cbiAgICBtb2NrQXhpb3MubW9ja1Jlc3BvbnNlKHJlc3BvbnNlT2JqKVxuICAgIGF2YXhBc3NldElEID0gYXdhaXQgcmVzdWx0XG4gIH0pXG5cbiAgYmVmb3JlRWFjaCgoKTogdm9pZCA9PiB7XG4gICAgc2V0ID0gbmV3IFVUWE9TZXQoKVxuICAgIGtleW1ncjEgPSBuZXcgS2V5Q2hhaW4oYXZhbGFuY2hlLmdldEhSUCgpLCBhbGlhcylcbiAgICBrZXltZ3IyID0gbmV3IEtleUNoYWluKGF2YWxhbmNoZS5nZXRIUlAoKSwgYWxpYXMpXG4gICAga2V5bWdyMyA9IG5ldyBLZXlDaGFpbihhdmFsYW5jaGUuZ2V0SFJQKCksIGFsaWFzKVxuICAgIGFkZHJzMSA9IFtdXG4gICAgYWRkcnMyID0gW11cbiAgICBhZGRyczMgPSBbXVxuICAgIHV0eG9zID0gW11cbiAgICBpbnB1dHMgPSBbXVxuICAgIG91dHB1dHMgPSBbXVxuICAgIGltcG9ydElucyA9IFtdXG4gICAgaW1wb3J0VVRYT3MgPSBbXVxuICAgIGV4cG9ydE91dHMgPSBbXVxuICAgIGZ1bmd1dHhvcyA9IFtdXG4gICAgZXhwb3J0VVRYT0lEUyA9IFtdXG4gICAgb3BzID0gW11cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICBhZGRyczEucHVzaChrZXltZ3IxLm1ha2VLZXkoKS5nZXRBZGRyZXNzKCkpXG4gICAgICBhZGRyczIucHVzaChrZXltZ3IyLm1ha2VLZXkoKS5nZXRBZGRyZXNzKCkpXG4gICAgICBhZGRyczMucHVzaChrZXltZ3IzLm1ha2VLZXkoKS5nZXRBZGRyZXNzKCkpXG4gICAgfVxuICAgIGFtb3VudCA9IE9ORUFWQVgubXVsKG5ldyBCTihhbW50KSlcbiAgICBhZGRyZXNzZXMgPSBrZXltZ3IxLmdldEFkZHJlc3NlcygpXG4gICAgZmFsbEFkZHJlc3NlcyA9IGtleW1ncjIuZ2V0QWRkcmVzc2VzKClcbiAgICBsb2NrdGltZSA9IG5ldyBCTig1NDMyMSlcbiAgICBmYWxsTG9ja3RpbWUgPSBsb2NrdGltZS5hZGQobmV3IEJOKDUwKSlcbiAgICB0aHJlc2hvbGQgPSAzXG4gICAgZmFsbFRocmVzaG9sZCA9IDFcblxuICAgIGNvbnN0IHBheWxvYWQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygxMDI0KVxuICAgIHBheWxvYWQud3JpdGUoXCJBbGwgeW91IFRyZWtraWVzIGFuZCBUViBhZGRpY3RzLCBEb24ndCBtZWFuIHRvIGRpc3MgZG9uJ3QgbWVhbiB0byBicmluZyBzdGF0aWMuXCIsIDAsIDEwMjQsICd1dGY4JylcblxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgIGxldCB0eGlkOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShjcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUoYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobmV3IEJOKGkpLCAzMikpLmRpZ2VzdCgpKVxuICAgICAgbGV0IHR4aWR4OiBCdWZmZXIgPSBCdWZmZXIuZnJvbShiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihuZXcgQk4oaSksIDQpKVxuICAgICAgY29uc3Qgb3V0OiBTRUNQVHJhbnNmZXJPdXRwdXQgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KGFtb3VudCwgYWRkcmVzc2VzLCBsb2NrdGltZSwgdGhyZXNob2xkKVxuICAgICAgY29uc3QgeGZlcm91dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChhc3NldElELCBvdXQpXG4gICAgICBvdXRwdXRzLnB1c2goeGZlcm91dClcblxuICAgICAgY29uc3QgdTogVVRYTyA9IG5ldyBVVFhPKEFWTUNvbnN0YW50cy5MQVRFU1RDT0RFQywgdHhpZCwgdHhpZHgsIGFzc2V0SUQsIG91dClcbiAgICAgIHV0eG9zLnB1c2godSlcbiAgICAgIGZ1bmd1dHhvcy5wdXNoKHUpXG4gICAgICBpbXBvcnRVVFhPcy5wdXNoKHUpXG5cbiAgICAgIHR4aWQgPSB1LmdldFR4SUQoKVxuICAgICAgdHhpZHggPSB1LmdldE91dHB1dElkeCgpXG5cbiAgICAgIGNvbnN0IGlucHV0OiBTRUNQVHJhbnNmZXJJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChhbW91bnQpXG4gICAgICBjb25zdCB4ZmVyaW46IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KHR4aWQsIHR4aWR4LCBhc3NldElELCBpbnB1dClcbiAgICAgIGlucHV0cy5wdXNoKHhmZXJpbilcblxuICAgICAgY29uc3Qgbm91dDogTkZUVHJhbnNmZXJPdXRwdXQgPSBuZXcgTkZUVHJhbnNmZXJPdXRwdXQoMTAwMCArIGksIHBheWxvYWQsIGFkZHJlc3NlcywgbG9ja3RpbWUsIHRocmVzaG9sZClcbiAgICAgIGNvbnN0IG9wOiBORlRUcmFuc2Zlck9wZXJhdGlvbiA9IG5ldyBORlRUcmFuc2Zlck9wZXJhdGlvbihub3V0KVxuICAgICAgY29uc3QgbmZ0dHhpZDogQnVmZmVyID0gQnVmZmVyLmZyb20oY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG5ldyBCTigxMDAwICsgaSksIDMyKSkuZGlnZXN0KCkpXG4gICAgICBjb25zdCBuZnR1dHhvOiBVVFhPID0gbmV3IFVUWE8oQVZNQ29uc3RhbnRzLkxBVEVTVENPREVDLCBuZnR0eGlkLCAxMDAwICsgaSwgTkZUYXNzZXRJRCwgbm91dClcbiAgICAgIG5mdHV0eG9pZHMucHVzaChuZnR1dHhvLmdldFVUWE9JRCgpKVxuICAgICAgY29uc3QgeGZlcm9wOiBUcmFuc2ZlcmFibGVPcGVyYXRpb24gPSBuZXcgVHJhbnNmZXJhYmxlT3BlcmF0aW9uKE5GVGFzc2V0SUQsIFtuZnR1dHhvLmdldFVUWE9JRCgpXSwgb3ApXG4gICAgICBvcHMucHVzaCh4ZmVyb3ApXG4gICAgICB1dHhvcy5wdXNoKG5mdHV0eG8pXG4gICAgfVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDE7IGkgPCA0OyBpKyspIHtcbiAgICAgIGltcG9ydElucy5wdXNoKGlucHV0c1tpXSlcbiAgICAgIGV4cG9ydE91dHMucHVzaChvdXRwdXRzW2ldKVxuICAgICAgZXhwb3J0VVRYT0lEUy5wdXNoKGZ1bmd1dHhvc1tpXS5nZXRVVFhPSUQoKSlcbiAgICB9XG4gICAgc2V0LmFkZEFycmF5KHV0eG9zKVxuICB9KVxuXG4gIHRlc3QoXCJCYXNlVHggY29kZWNJRHNcIiwgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGJhc2VUeDogQmFzZVR4ID0gbmV3IEJhc2VUeCgpXG4gICAgZXhwZWN0KGJhc2VUeC5nZXRDb2RlY0lEKCkpLnRvQmUoY29kZWNJRF96ZXJvKVxuICAgIGV4cGVjdChiYXNlVHguZ2V0VHlwZUlEKCkpLnRvQmUoQVZNQ29uc3RhbnRzLkJBU0VUWClcbiAgICBiYXNlVHguc2V0Q29kZWNJRChjb2RlY0lEX29uZSlcbiAgICBleHBlY3QoYmFzZVR4LmdldENvZGVjSUQoKSkudG9CZShjb2RlY0lEX29uZSlcbiAgICBleHBlY3QoYmFzZVR4LmdldFR5cGVJRCgpKS50b0JlKEFWTUNvbnN0YW50cy5CQVNFVFhfQ09ERUNPTkUpXG4gICAgYmFzZVR4LnNldENvZGVjSUQoY29kZWNJRF96ZXJvKVxuICAgIGV4cGVjdChiYXNlVHguZ2V0Q29kZWNJRCgpKS50b0JlKGNvZGVjSURfemVybylcbiAgICBleHBlY3QoYmFzZVR4LmdldFR5cGVJRCgpKS50b0JlKEFWTUNvbnN0YW50cy5CQVNFVFgpXG4gIH0pXG5cbiAgdGVzdChcIkludmFsaWQgQmFzZVR4IGNvZGVjSURcIiwgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGJhc2VUeDogQmFzZVR4ID0gbmV3IEJhc2VUeCgpXG4gICAgZXhwZWN0KCgpOiB2b2lkID0+IHtcbiAgICAgIGJhc2VUeC5zZXRDb2RlY0lEKDIpXG4gICAgfSkudG9UaHJvdyhcIkVycm9yIC0gQmFzZVR4LnNldENvZGVjSUQ6IGludmFsaWQgY29kZWNJRC4gVmFsaWQgY29kZWNJRHMgYXJlIDAgYW5kIDEuXCIpXG4gIH0pXG5cbiAgdGVzdChcIkNyZWF0ZUFzc2V0VHggY29kZWNJRHNcIiwgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGNyZWF0ZUFzc2V0VHg6IENyZWF0ZUFzc2V0VHggPSBuZXcgQ3JlYXRlQXNzZXRUeCgpXG4gICAgZXhwZWN0KGNyZWF0ZUFzc2V0VHguZ2V0Q29kZWNJRCgpKS50b0JlKGNvZGVjSURfemVybylcbiAgICBleHBlY3QoY3JlYXRlQXNzZXRUeC5nZXRUeXBlSUQoKSkudG9CZShBVk1Db25zdGFudHMuQ1JFQVRFQVNTRVRUWClcbiAgICBjcmVhdGVBc3NldFR4LnNldENvZGVjSUQoY29kZWNJRF9vbmUpXG4gICAgZXhwZWN0KGNyZWF0ZUFzc2V0VHguZ2V0Q29kZWNJRCgpKS50b0JlKGNvZGVjSURfb25lKVxuICAgIGV4cGVjdChjcmVhdGVBc3NldFR4LmdldFR5cGVJRCgpKS50b0JlKEFWTUNvbnN0YW50cy5DUkVBVEVBU1NFVFRYX0NPREVDT05FKVxuICAgIGNyZWF0ZUFzc2V0VHguc2V0Q29kZWNJRChjb2RlY0lEX3plcm8pXG4gICAgZXhwZWN0KGNyZWF0ZUFzc2V0VHguZ2V0Q29kZWNJRCgpKS50b0JlKGNvZGVjSURfemVybylcbiAgICBleHBlY3QoY3JlYXRlQXNzZXRUeC5nZXRUeXBlSUQoKSkudG9CZShBVk1Db25zdGFudHMuQ1JFQVRFQVNTRVRUWClcbiAgfSlcblxuICB0ZXN0KFwiSW52YWxpZCBDcmVhdGVBc3NldFR4IGNvZGVjSURcIiwgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGNyZWF0ZUFzc2V0VHg6IENyZWF0ZUFzc2V0VHggPSBuZXcgQ3JlYXRlQXNzZXRUeCgpXG4gICAgZXhwZWN0KCgpOiB2b2lkID0+IHtcbiAgICAgIGNyZWF0ZUFzc2V0VHguc2V0Q29kZWNJRCgyKVxuICAgIH0pLnRvVGhyb3coXCJFcnJvciAtIENyZWF0ZUFzc2V0VHguc2V0Q29kZWNJRDogaW52YWxpZCBjb2RlY0lELiBWYWxpZCBjb2RlY0lEcyBhcmUgMCBhbmQgMS5cIilcbiAgfSlcblxuICB0ZXN0KFwiT3BlcmF0aW9uVHggY29kZWNJRHNcIiwgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IG9wZXJhdGlvblR4OiBPcGVyYXRpb25UeCA9IG5ldyBPcGVyYXRpb25UeCgpXG4gICAgZXhwZWN0KG9wZXJhdGlvblR4LmdldENvZGVjSUQoKSkudG9CZShjb2RlY0lEX3plcm8pXG4gICAgZXhwZWN0KG9wZXJhdGlvblR4LmdldFR5cGVJRCgpKS50b0JlKEFWTUNvbnN0YW50cy5PUEVSQVRJT05UWClcbiAgICBvcGVyYXRpb25UeC5zZXRDb2RlY0lEKGNvZGVjSURfb25lKVxuICAgIGV4cGVjdChvcGVyYXRpb25UeC5nZXRDb2RlY0lEKCkpLnRvQmUoY29kZWNJRF9vbmUpXG4gICAgZXhwZWN0KG9wZXJhdGlvblR4LmdldFR5cGVJRCgpKS50b0JlKEFWTUNvbnN0YW50cy5PUEVSQVRJT05UWF9DT0RFQ09ORSlcbiAgICBvcGVyYXRpb25UeC5zZXRDb2RlY0lEKGNvZGVjSURfemVybylcbiAgICBleHBlY3Qob3BlcmF0aW9uVHguZ2V0Q29kZWNJRCgpKS50b0JlKGNvZGVjSURfemVybylcbiAgICBleHBlY3Qob3BlcmF0aW9uVHguZ2V0VHlwZUlEKCkpLnRvQmUoQVZNQ29uc3RhbnRzLk9QRVJBVElPTlRYKVxuICB9KVxuXG4gIHRlc3QoXCJJbnZhbGlkIE9wZXJhdGlvblR4IGNvZGVjSURcIiwgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IG9wZXJhdGlvblR4OiBPcGVyYXRpb25UeCA9IG5ldyBPcGVyYXRpb25UeCgpXG4gICAgZXhwZWN0KCgpOiB2b2lkID0+IHtcbiAgICAgIG9wZXJhdGlvblR4LnNldENvZGVjSUQoMilcbiAgICB9KS50b1Rocm93KFwiRXJyb3IgLSBPcGVyYXRpb25UeC5zZXRDb2RlY0lEOiBpbnZhbGlkIGNvZGVjSUQuIFZhbGlkIGNvZGVjSURzIGFyZSAwIGFuZCAxLlwiKVxuICB9KVxuXG4gIHRlc3QoXCJJbXBvcnRUeCBjb2RlY0lEc1wiLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3QgaW1wb3J0VHg6IEltcG9ydFR4ID0gbmV3IEltcG9ydFR4KClcbiAgICBleHBlY3QoaW1wb3J0VHguZ2V0Q29kZWNJRCgpKS50b0JlKGNvZGVjSURfemVybylcbiAgICBleHBlY3QoaW1wb3J0VHguZ2V0VHlwZUlEKCkpLnRvQmUoQVZNQ29uc3RhbnRzLklNUE9SVFRYKVxuICAgIGltcG9ydFR4LnNldENvZGVjSUQoY29kZWNJRF9vbmUpXG4gICAgZXhwZWN0KGltcG9ydFR4LmdldENvZGVjSUQoKSkudG9CZShjb2RlY0lEX29uZSlcbiAgICBleHBlY3QoaW1wb3J0VHguZ2V0VHlwZUlEKCkpLnRvQmUoQVZNQ29uc3RhbnRzLklNUE9SVFRYX0NPREVDT05FKVxuICAgIGltcG9ydFR4LnNldENvZGVjSUQoY29kZWNJRF96ZXJvKVxuICAgIGV4cGVjdChpbXBvcnRUeC5nZXRDb2RlY0lEKCkpLnRvQmUoY29kZWNJRF96ZXJvKVxuICAgIGV4cGVjdChpbXBvcnRUeC5nZXRUeXBlSUQoKSkudG9CZShBVk1Db25zdGFudHMuSU1QT1JUVFgpXG4gIH0pXG5cbiAgdGVzdChcIkludmFsaWQgSW1wb3J0VHggY29kZWNJRFwiLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3QgaW1wb3J0VHg6IEltcG9ydFR4ID0gbmV3IEltcG9ydFR4KClcbiAgICBleHBlY3QoKCk6IHZvaWQgPT4ge1xuICAgICAgaW1wb3J0VHguc2V0Q29kZWNJRCgyKVxuICAgIH0pLnRvVGhyb3coXCJFcnJvciAtIEltcG9ydFR4LnNldENvZGVjSUQ6IGludmFsaWQgY29kZWNJRC4gVmFsaWQgY29kZWNJRHMgYXJlIDAgYW5kIDEuXCIpXG4gIH0pXG5cbiAgdGVzdChcIkV4cG9ydFR4IGNvZGVjSURzXCIsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBleHBvcnRUeDogRXhwb3J0VHggPSBuZXcgRXhwb3J0VHgoKVxuICAgIGV4cGVjdChleHBvcnRUeC5nZXRDb2RlY0lEKCkpLnRvQmUoY29kZWNJRF96ZXJvKVxuICAgIGV4cGVjdChleHBvcnRUeC5nZXRUeXBlSUQoKSkudG9CZShBVk1Db25zdGFudHMuRVhQT1JUVFgpXG4gICAgZXhwb3J0VHguc2V0Q29kZWNJRChjb2RlY0lEX29uZSlcbiAgICBleHBlY3QoZXhwb3J0VHguZ2V0Q29kZWNJRCgpKS50b0JlKGNvZGVjSURfb25lKVxuICAgIGV4cGVjdChleHBvcnRUeC5nZXRUeXBlSUQoKSkudG9CZShBVk1Db25zdGFudHMuRVhQT1JUVFhfQ09ERUNPTkUpXG4gICAgZXhwb3J0VHguc2V0Q29kZWNJRChjb2RlY0lEX3plcm8pXG4gICAgZXhwZWN0KGV4cG9ydFR4LmdldENvZGVjSUQoKSkudG9CZShjb2RlY0lEX3plcm8pXG4gICAgZXhwZWN0KGV4cG9ydFR4LmdldFR5cGVJRCgpKS50b0JlKEFWTUNvbnN0YW50cy5FWFBPUlRUWClcbiAgfSlcblxuICB0ZXN0KFwiSW52YWxpZCBFeHBvcnRUeCBjb2RlY0lEXCIsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBleHBvcnRUeDogRXhwb3J0VHggPSBuZXcgRXhwb3J0VHgoKVxuICAgIGV4cGVjdCgoKTogdm9pZCA9PiB7XG4gICAgICBleHBvcnRUeC5zZXRDb2RlY0lEKDIpXG4gICAgfSkudG9UaHJvdyhcIkVycm9yIC0gRXhwb3J0VHguc2V0Q29kZWNJRDogaW52YWxpZCBjb2RlY0lELiBWYWxpZCBjb2RlY0lEcyBhcmUgMCBhbmQgMS5cIilcbiAgfSlcblxuICB0ZXN0KCdDcmVhdGUgc21hbGwgQmFzZVR4IHRoYXQgaXMgR29vc2UgRWdnIFR4JywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW11cbiAgICBjb25zdCBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXVxuICAgIGNvbnN0IG91dHB1dEFtdDogQk4gPSBuZXcgQk4oXCIyNjZcIilcbiAgICBjb25zdCBvdXRwdXQ6IFNFQ1BUcmFuc2Zlck91dHB1dCA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQob3V0cHV0QW10LCBhZGRyczEsIG5ldyBCTigwKSwgMSlcbiAgICBjb25zdCB0cmFuc2ZlcmFibGVPdXRwdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYXZheEFzc2V0SUQsIG91dHB1dClcbiAgICBvdXRzLnB1c2godHJhbnNmZXJhYmxlT3V0cHV0KVxuICAgIGNvbnN0IGlucHV0QW10OiBCTiA9IG5ldyBCTihcIjQwMFwiKVxuICAgIGNvbnN0IGlucHV0OiBTRUNQVHJhbnNmZXJJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChpbnB1dEFtdClcbiAgICBpbnB1dC5hZGRTaWduYXR1cmVJZHgoMCwgYWRkcnMxWzBdKVxuICAgIGNvbnN0IHR4aWQ6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUoXCJuOFhINUpZMUVYNVZZcURlQWhCNFpkNEdLeGk5VU5ReTZvUHBNc0NBajFRNnhraWlMXCIpXG4gICAgY29uc3Qgb3V0cHV0SW5kZXg6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG5ldyBCTigwKSwgNCkpXG4gICAgY29uc3QgdHJhbnNmZXJhYmxlSW5wdXQ6IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KHR4aWQsIG91dHB1dEluZGV4LCBhdmF4QXNzZXRJRCwgaW5wdXQpXG4gICAgaW5zLnB1c2godHJhbnNmZXJhYmxlSW5wdXQpXG4gICAgY29uc3QgYmFzZVR4OiBCYXNlVHggPSBuZXcgQmFzZVR4KG5ldGlkLCBibG9ja2NoYWluSUQsIG91dHMsIGlucylcbiAgICBjb25zdCB1bnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gbmV3IFVuc2lnbmVkVHgoYmFzZVR4KVxuICAgIGV4cGVjdChhd2FpdCBhcGkuY2hlY2tHb29zZUVnZyh1bnNpZ25lZFR4KSkudG9CZSh0cnVlKVxuICB9KVxuXG4gIHRlc3QoJ2NvbmZpcm0gaW5wdXRUb3RhbCwgb3V0cHV0VG90YWwgYW5kIGZlZSBhcmUgY29ycmVjdCcsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICAvLyBBVkFYIGFzc2V0SURcbiAgICBjb25zdCBhc3NldElEOiBCdWZmZXIgPSBiaW50b29scy5jYjU4RGVjb2RlKFwibjhYSDVKWTFFWDVWWXFEZUFoQjRaZDRHS3hpOVVOUXk2b1BwTXNDQWoxUTZ4a2lpTFwiKVxuICAgIGNvbnN0IG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW11cbiAgICBjb25zdCBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXVxuICAgIGNvbnN0IG91dHB1dEFtdDogQk4gPSBuZXcgQk4oXCIyNjZcIilcbiAgICBjb25zdCBvdXRwdXQ6IFNFQ1BUcmFuc2Zlck91dHB1dCA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQob3V0cHV0QW10LCBhZGRyczEsIG5ldyBCTigwKSwgMSlcbiAgICBjb25zdCB0cmFuc2ZlcmFibGVPdXRwdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYXNzZXRJRCwgb3V0cHV0KVxuICAgIG91dHMucHVzaCh0cmFuc2ZlcmFibGVPdXRwdXQpXG4gICAgY29uc3QgaW5wdXRBbXQ6IEJOID0gbmV3IEJOKFwiNDAwXCIpXG4gICAgY29uc3QgaW5wdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KGlucHV0QW10KVxuICAgIGlucHV0LmFkZFNpZ25hdHVyZUlkeCgwLCBhZGRyczFbMF0pXG4gICAgY29uc3QgdHhpZDogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZShcIm44WEg1SlkxRVg1VllxRGVBaEI0WmQ0R0t4aTlVTlF5Nm9QcE1zQ0FqMVE2eGtpaUxcIilcbiAgICBjb25zdCBvdXRwdXRJbmRleDogQnVmZmVyID0gQnVmZmVyLmZyb20oYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobmV3IEJOKDApLCA0KSlcbiAgICBjb25zdCB0cmFuc2ZlcmFibGVJbnB1dDogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQodHhpZCwgb3V0cHV0SW5kZXgsIGFzc2V0SUQsIGlucHV0KVxuICAgIGlucy5wdXNoKHRyYW5zZmVyYWJsZUlucHV0KVxuICAgIGNvbnN0IGJhc2VUeDogQmFzZVR4ID0gbmV3IEJhc2VUeChuZXRpZCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMpXG4gICAgY29uc3QgdW5zaWduZWRUeDogVW5zaWduZWRUeCA9IG5ldyBVbnNpZ25lZFR4KGJhc2VUeClcbiAgICBjb25zdCBpbnB1dFRvdGFsOiBCTiA9IHVuc2lnbmVkVHguZ2V0SW5wdXRUb3RhbChhc3NldElEKVxuICAgIGNvbnN0IG91dHB1dFRvdGFsOiBCTiA9IHVuc2lnbmVkVHguZ2V0T3V0cHV0VG90YWwoYXNzZXRJRClcbiAgICBjb25zdCBidXJuOiBCTiA9IHVuc2lnbmVkVHguZ2V0QnVybihhc3NldElEKVxuICAgIGV4cGVjdChpbnB1dFRvdGFsLnRvTnVtYmVyKCkpLnRvRXF1YWwobmV3IEJOKDQwMCkudG9OdW1iZXIoKSlcbiAgICBleHBlY3Qob3V0cHV0VG90YWwudG9OdW1iZXIoKSkudG9FcXVhbChuZXcgQk4oMjY2KS50b051bWJlcigpKVxuICAgIGV4cGVjdChidXJuLnRvTnVtYmVyKCkpLnRvRXF1YWwobmV3IEJOKDEzNCkudG9OdW1iZXIoKSlcbiAgfSlcblxuXG4gIHRlc3QoXCJDcmVhdGUgc21hbGwgQmFzZVR4IHRoYXQgaXNuJ3QgR29vc2UgRWdnIFR4XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IFtdXG4gICAgY29uc3QgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cbiAgICBjb25zdCBvdXRwdXRBbXQ6IEJOID0gbmV3IEJOKFwiMjY3XCIpXG4gICAgY29uc3Qgb3V0cHV0OiBTRUNQVHJhbnNmZXJPdXRwdXQgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KG91dHB1dEFtdCwgYWRkcnMxLCBuZXcgQk4oMCksIDEpXG4gICAgY29uc3QgdHJhbnNmZXJhYmxlT3V0cHV0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KGF2YXhBc3NldElELCBvdXRwdXQpXG4gICAgb3V0cy5wdXNoKHRyYW5zZmVyYWJsZU91dHB1dClcbiAgICBjb25zdCBpbnB1dEFtdDogQk4gPSBuZXcgQk4oXCI0MDBcIilcbiAgICBjb25zdCBpbnB1dDogU0VDUFRyYW5zZmVySW5wdXQgPSBuZXcgU0VDUFRyYW5zZmVySW5wdXQoaW5wdXRBbXQpXG4gICAgaW5wdXQuYWRkU2lnbmF0dXJlSWR4KDAsIGFkZHJzMVswXSlcbiAgICBjb25zdCB0eGlkOiBCdWZmZXIgPSBiaW50b29scy5jYjU4RGVjb2RlKFwibjhYSDVKWTFFWDVWWXFEZUFoQjRaZDRHS3hpOVVOUXk2b1BwTXNDQWoxUTZ4a2lpTFwiKVxuICAgIGNvbnN0IG91dHB1dEluZGV4OiBCdWZmZXIgPSBCdWZmZXIuZnJvbShiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihuZXcgQk4oMCksIDQpKVxuICAgIGNvbnN0IHRyYW5zZmVyYWJsZUlucHV0OiBUcmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBUcmFuc2ZlcmFibGVJbnB1dCh0eGlkLCBvdXRwdXRJbmRleCwgYXZheEFzc2V0SUQsIGlucHV0KVxuICAgIGlucy5wdXNoKHRyYW5zZmVyYWJsZUlucHV0KVxuICAgIGNvbnN0IGJhc2VUeDogQmFzZVR4ID0gbmV3IEJhc2VUeChuZXRpZCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMpXG4gICAgY29uc3QgdW5zaWduZWRUeDogVW5zaWduZWRUeCA9IG5ldyBVbnNpZ25lZFR4KGJhc2VUeClcbiAgICBleHBlY3QoYXdhaXQgYXBpLmNoZWNrR29vc2VFZ2codW5zaWduZWRUeCkpLnRvQmUodHJ1ZSlcbiAgfSlcblxuICB0ZXN0KCdDcmVhdGUgbGFyZ2UgQmFzZVR4IHRoYXQgaXMgR29vc2UgRWdnIFR4JywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW11cbiAgICBjb25zdCBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXVxuICAgIGNvbnN0IG91dHB1dEFtdDogQk4gPSBuZXcgQk4oXCI2MDk1NTU1MDAwMDBcIilcbiAgICBjb25zdCBvdXRwdXQ6IFNFQ1BUcmFuc2Zlck91dHB1dCA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQob3V0cHV0QW10LCBhZGRyczEsIG5ldyBCTigwKSwgMSlcbiAgICBjb25zdCB0cmFuc2ZlcmFibGVPdXRwdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYXZheEFzc2V0SUQsIG91dHB1dClcbiAgICBvdXRzLnB1c2godHJhbnNmZXJhYmxlT3V0cHV0KVxuICAgIGNvbnN0IGlucHV0QW10OiBCTiA9IG5ldyBCTihcIjQ1MDAwMDAwMDAwMDAwMDAwXCIpXG4gICAgY29uc3QgaW5wdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KGlucHV0QW10KVxuICAgIGlucHV0LmFkZFNpZ25hdHVyZUlkeCgwLCBhZGRyczFbMF0pXG4gICAgY29uc3QgdHhpZDogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZShcIm44WEg1SlkxRVg1VllxRGVBaEI0WmQ0R0t4aTlVTlF5Nm9QcE1zQ0FqMVE2eGtpaUxcIilcbiAgICBjb25zdCBvdXRwdXRJbmRleDogQnVmZmVyID0gQnVmZmVyLmZyb20oYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobmV3IEJOKDApLCA0KSlcbiAgICBjb25zdCB0cmFuc2ZlcmFibGVJbnB1dDogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQodHhpZCwgb3V0cHV0SW5kZXgsIGF2YXhBc3NldElELCBpbnB1dClcbiAgICBpbnMucHVzaCh0cmFuc2ZlcmFibGVJbnB1dClcbiAgICBjb25zdCBiYXNlVHg6IEJhc2VUeCA9IG5ldyBCYXNlVHgobmV0aWQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zKVxuICAgIGNvbnN0IHVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSBuZXcgVW5zaWduZWRUeChiYXNlVHgpXG4gICAgZXhwZWN0KGF3YWl0IGFwaS5jaGVja0dvb3NlRWdnKHVuc2lnbmVkVHgpKS50b0JlKGZhbHNlKVxuICB9KVxuXG4gIHRlc3QoXCJDcmVhdGUgbGFyZ2UgQmFzZVR4IHRoYXQgaXNuJ3QgR29vc2UgRWdnIFR4XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IFtdXG4gICAgY29uc3QgaW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdID0gW11cbiAgICBjb25zdCBvdXRwdXRBbXQ6IEJOID0gbmV3IEJOKFwiNDQ5OTU2MDk1NTU1MDAwMDBcIilcbiAgICBjb25zdCBvdXRwdXQ6IFNFQ1BUcmFuc2Zlck91dHB1dCA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQob3V0cHV0QW10LCBhZGRyczEsIG5ldyBCTigwKSwgMSlcbiAgICBjb25zdCB0cmFuc2ZlcmFibGVPdXRwdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYXZheEFzc2V0SUQsIG91dHB1dClcbiAgICBvdXRzLnB1c2godHJhbnNmZXJhYmxlT3V0cHV0KVxuICAgIGNvbnN0IGlucHV0QW10OiBCTiA9IG5ldyBCTihcIjQ1MDAwMDAwMDAwMDAwMDAwXCIpXG4gICAgY29uc3QgaW5wdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KGlucHV0QW10KVxuICAgIGlucHV0LmFkZFNpZ25hdHVyZUlkeCgwLCBhZGRyczFbMF0pXG4gICAgY29uc3QgdHhpZDogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZShcIm44WEg1SlkxRVg1VllxRGVBaEI0WmQ0R0t4aTlVTlF5Nm9QcE1zQ0FqMVE2eGtpaUxcIilcbiAgICBjb25zdCBvdXRwdXRJbmRleDogQnVmZmVyID0gQnVmZmVyLmZyb20oYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobmV3IEJOKDApLCA0KSlcbiAgICBjb25zdCB0cmFuc2ZlcmFibGVJbnB1dDogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQodHhpZCwgb3V0cHV0SW5kZXgsIGF2YXhBc3NldElELCBpbnB1dClcbiAgICBpbnMucHVzaCh0cmFuc2ZlcmFibGVJbnB1dClcbiAgICBjb25zdCBiYXNlVHg6IEJhc2VUeCA9IG5ldyBCYXNlVHgobmV0aWQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zKVxuICAgIGNvbnN0IHVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSBuZXcgVW5zaWduZWRUeChiYXNlVHgpXG4gICAgZXhwZWN0KGF3YWl0IGFwaS5jaGVja0dvb3NlRWdnKHVuc2lnbmVkVHgpKS50b0JlKHRydWUpXG4gIH0pXG5cbiAgdGVzdCgnQ3JlYXRpb24gVW5zaWduZWRUeCcsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBiYXNlVHg6IEJhc2VUeCA9IG5ldyBCYXNlVHgobmV0aWQsIGJsb2NrY2hhaW5JRCwgb3V0cHV0cywgaW5wdXRzKVxuICAgIGNvbnN0IHR4dTogVW5zaWduZWRUeCA9IG5ldyBVbnNpZ25lZFR4KGJhc2VUeClcbiAgICBjb25zdCB0eGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHR4dS5nZXRUcmFuc2FjdGlvbigpLmdldElucygpXG4gICAgY29uc3QgdHhvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHR4dS5nZXRUcmFuc2FjdGlvbigpLmdldE91dHMoKVxuICAgIGV4cGVjdCh0eGlucy5sZW5ndGgpLnRvQmUoaW5wdXRzLmxlbmd0aClcbiAgICBleHBlY3QodHhvdXRzLmxlbmd0aCkudG9CZShvdXRwdXRzLmxlbmd0aClcblxuICAgIGV4cGVjdCh0eHUuZ2V0VHJhbnNhY3Rpb24oKS5nZXRUeFR5cGUoKSkudG9CZSgwKVxuICAgIGV4cGVjdCh0eHUuZ2V0VHJhbnNhY3Rpb24oKS5nZXROZXR3b3JrSUQoKSkudG9CZSgxMjM0NSlcbiAgICBleHBlY3QodHh1LmdldFRyYW5zYWN0aW9uKCkuZ2V0QmxvY2tjaGFpbklEKCkudG9TdHJpbmcoJ2hleCcpKS50b0JlKGJsb2NrY2hhaW5JRC50b1N0cmluZygnaGV4JykpXG5cbiAgICBsZXQgYTogc3RyaW5nW10gPSBbXVxuICAgIGxldCBiOiBzdHJpbmdbXSA9IFtdXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHR4aW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhLnB1c2godHhpbnNbaV0udG9TdHJpbmcoKSlcbiAgICAgIGIucHVzaChpbnB1dHNbaV0udG9TdHJpbmcoKSlcbiAgICB9XG4gICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KGEuc29ydCgpKSkudG9CZShKU09OLnN0cmluZ2lmeShiLnNvcnQoKSkpXG5cbiAgICBhID0gW11cbiAgICBiID0gW11cblxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0eG91dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGEucHVzaCh0eG91dHNbaV0udG9TdHJpbmcoKSlcbiAgICAgIGIucHVzaChvdXRwdXRzW2ldLnRvU3RyaW5nKCkpXG4gICAgfVxuICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShhLnNvcnQoKSkpLnRvQmUoSlNPTi5zdHJpbmdpZnkoYi5zb3J0KCkpKVxuXG4gICAgY29uc3QgdHh1bmV3OiBVbnNpZ25lZFR4ID0gbmV3IFVuc2lnbmVkVHgoKVxuICAgIHR4dW5ldy5mcm9tQnVmZmVyKHR4dS50b0J1ZmZlcigpKVxuICAgIGV4cGVjdCh0eHVuZXcudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpLnRvQmUodHh1LnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKVxuICAgIGV4cGVjdCh0eHVuZXcudG9TdHJpbmcoKSkudG9CZSh0eHUudG9TdHJpbmcoKSlcbiAgfSlcblxuICB0ZXN0KCdDcmVhdGlvbiBVbnNpZ25lZFR4IENoZWNrIEFtb3VudCcsICgpOiB2b2lkID0+IHtcbiAgICBleHBlY3QoKCk6IHZvaWQgPT4ge1xuICAgICAgc2V0LmJ1aWxkQmFzZVR4KFxuICAgICAgICBuZXRpZCwgYmxvY2tjaGFpbklELFxuICAgICAgICBPTkVBVkFYLm11bChuZXcgQk4oYW1udCAqIDEwMDAwKSksIGFzc2V0SUQsXG4gICAgICAgIGFkZHJzMywgYWRkcnMxLCBhZGRyczEsIFxuICAgICAgKVxuICAgIH0pLnRvVGhyb3coKVxuICB9KVxuXG4gIHRlc3QoJ0NyZWF0ZUFzc2V0VFgnLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3Qgc2VjcGJhc2UxOiBTRUNQVHJhbnNmZXJPdXRwdXQgPSBuZXcgU0VDUFRyYW5zZmVyT3V0cHV0KG5ldyBCTig3NzcpLCBhZGRyczMsIGxvY2t0aW1lLCAxKVxuICAgIGNvbnN0IHNlY3BiYXNlMjogU0VDUFRyYW5zZmVyT3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChuZXcgQk4oODg4KSwgYWRkcnMyLCBsb2NrdGltZSwgMSlcbiAgICBjb25zdCBzZWNwYmFzZTM6IFNFQ1BUcmFuc2Zlck91dHB1dCA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQobmV3IEJOKDk5OSksIGFkZHJzMiwgbG9ja3RpbWUsIDEpXG4gICAgY29uc3QgaW5pdGlhbFN0YXRlOiBJbml0aWFsU3RhdGVzID0gbmV3IEluaXRpYWxTdGF0ZXMoKVxuICAgIGluaXRpYWxTdGF0ZS5hZGRPdXRwdXQoc2VjcGJhc2UxLCBBVk1Db25zdGFudHMuU0VDUEZYSUQpXG4gICAgaW5pdGlhbFN0YXRlLmFkZE91dHB1dChzZWNwYmFzZTIsIEFWTUNvbnN0YW50cy5TRUNQRlhJRClcbiAgICBpbml0aWFsU3RhdGUuYWRkT3V0cHV0KHNlY3BiYXNlMywgQVZNQ29uc3RhbnRzLlNFQ1BGWElEKVxuICAgIGNvbnN0IG5hbWU6IHN0cmluZyA9ICdSaWNrY29pbiBpcyB0aGUgbW9zdCBpbnRlbGxpZ2VudCBjb2luJ1xuICAgIGNvbnN0IHN5bWJvbDogc3RyaW5nID0gJ1JJQ0snXG4gICAgY29uc3QgZGVub21pbmF0aW9uOiBudW1iZXIgPSA5XG4gICAgY29uc3QgdHh1OiBDcmVhdGVBc3NldFR4ID0gbmV3IENyZWF0ZUFzc2V0VHgobmV0aWQsIGJsb2NrY2hhaW5JRCwgb3V0cHV0cywgaW5wdXRzLCBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKS5nZXRQYXlsb2FkKCksIG5hbWUsIHN5bWJvbCwgZGVub21pbmF0aW9uLCBpbml0aWFsU3RhdGUpXG4gICAgY29uc3QgdHhpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSB0eHUuZ2V0SW5zKClcbiAgICBjb25zdCB0eG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gdHh1LmdldE91dHMoKVxuICAgIGNvbnN0IGluaXRTdGF0ZTogSW5pdGlhbFN0YXRlcyA9IHR4dS5nZXRJbml0aWFsU3RhdGVzKClcbiAgICBleHBlY3QodHhpbnMubGVuZ3RoKS50b0JlKGlucHV0cy5sZW5ndGgpXG4gICAgZXhwZWN0KHR4b3V0cy5sZW5ndGgpLnRvQmUob3V0cHV0cy5sZW5ndGgpXG4gICAgZXhwZWN0KGluaXRTdGF0ZS50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSkudG9CZShpbml0aWFsU3RhdGUudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpXG5cbiAgICBleHBlY3QodHh1LmdldFR4VHlwZSgpKS50b0JlKEFWTUNvbnN0YW50cy5DUkVBVEVBU1NFVFRYKVxuICAgIGV4cGVjdCh0eHUuZ2V0TmV0d29ya0lEKCkpLnRvQmUoMTIzNDUpXG4gICAgZXhwZWN0KHR4dS5nZXRCbG9ja2NoYWluSUQoKS50b1N0cmluZygnaGV4JykpLnRvQmUoYmxvY2tjaGFpbklELnRvU3RyaW5nKCdoZXgnKSlcblxuICAgIGV4cGVjdCh0eHUuZ2V0TmFtZSgpKS50b0JlKG5hbWUpXG4gICAgZXhwZWN0KHR4dS5nZXRTeW1ib2woKSkudG9CZShzeW1ib2wpXG4gICAgZXhwZWN0KHR4dS5nZXREZW5vbWluYXRpb24oKSkudG9CZShkZW5vbWluYXRpb24pXG4gICAgZXhwZWN0KHR4dS5nZXREZW5vbWluYXRpb25CdWZmZXIoKS5yZWFkVUludDgoMCkpLnRvQmUoZGVub21pbmF0aW9uKVxuXG4gICAgbGV0IGE6IHN0cmluZ1tdID0gW11cbiAgICBsZXQgYjogc3RyaW5nW10gPSBbXVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0eGlucy5sZW5ndGg7IGkrKykge1xuICAgICAgYS5wdXNoKHR4aW5zW2ldLnRvU3RyaW5nKCkpXG4gICAgICBiLnB1c2goaW5wdXRzW2ldLnRvU3RyaW5nKCkpXG4gICAgfVxuICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShhLnNvcnQoKSkpLnRvQmUoSlNPTi5zdHJpbmdpZnkoYi5zb3J0KCkpKVxuXG4gICAgYSA9IFtdXG4gICAgYiA9IFtdXG5cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdHhvdXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhLnB1c2godHhvdXRzW2ldLnRvU3RyaW5nKCkpXG4gICAgICBiLnB1c2gob3V0cHV0c1tpXS50b1N0cmluZygpKVxuICAgIH1cbiAgICBleHBlY3QoSlNPTi5zdHJpbmdpZnkoYS5zb3J0KCkpKS50b0JlKEpTT04uc3RyaW5naWZ5KGIuc29ydCgpKSlcblxuICAgIGNvbnN0IHR4dW5ldzogQ3JlYXRlQXNzZXRUeCA9IG5ldyBDcmVhdGVBc3NldFR4KClcbiAgICB0eHVuZXcuZnJvbUJ1ZmZlcih0eHUudG9CdWZmZXIoKSlcbiAgICBleHBlY3QodHh1bmV3LnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKS50b0JlKHR4dS50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSlcbiAgICBleHBlY3QodHh1bmV3LnRvU3RyaW5nKCkpLnRvQmUodHh1LnRvU3RyaW5nKCkpXG4gIH0pXG5cbiAgdGVzdCgnQ3JlYXRpb24gT3BlcmF0aW9uVHgnLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3Qgb3B0eDpPcGVyYXRpb25UeCA9IG5ldyBPcGVyYXRpb25UeChcbiAgICAgIG5ldGlkLCBibG9ja2NoYWluSUQsIG91dHB1dHMsIGlucHV0cywgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIikuZ2V0UGF5bG9hZCgpLCBvcHMsXG4gICAgKVxuICAgIGNvbnN0IHR4dW5ldzogT3BlcmF0aW9uVHggPSBuZXcgT3BlcmF0aW9uVHgoKVxuICAgIGNvbnN0IG9wYnVmZjogQnVmZmVyID0gb3B0eC50b0J1ZmZlcigpXG4gICAgdHh1bmV3LmZyb21CdWZmZXIob3BidWZmKVxuICAgIGV4cGVjdCh0eHVuZXcudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpLnRvQmUob3BidWZmLnRvU3RyaW5nKCdoZXgnKSlcbiAgICBleHBlY3QodHh1bmV3LnRvU3RyaW5nKCkpLnRvQmUob3B0eC50b1N0cmluZygpKVxuICAgIGV4cGVjdChvcHR4LmdldE9wZXJhdGlvbnMoKS5sZW5ndGgpLnRvQmUob3BzLmxlbmd0aClcbiAgfSlcblxuICB0ZXN0KCdDcmVhdGlvbiBJbXBvcnRUeCcsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBib21idHg6SW1wb3J0VHggPSBuZXcgSW1wb3J0VHgoXG4gICAgICBuZXRpZCwgYmxvY2tjaGFpbklELCAgb3V0cHV0cywgaW5wdXRzLCBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKS5nZXRQYXlsb2FkKCksIHVuZGVmaW5lZCwgaW1wb3J0SW5zXG4gICAgKVxuXG4gICAgZXhwZWN0KCgpOiB2b2lkID0+IHtcbiAgICAgIGJvbWJ0eC50b0J1ZmZlcigpXG4gICAgfSkudG9UaHJvdygpXG5cbiAgICBjb25zdCBpbXBvcnR0eDpJbXBvcnRUeCA9IG5ldyBJbXBvcnRUeChcbiAgICAgIG5ldGlkLCBibG9ja2NoYWluSUQsICBvdXRwdXRzLCBpbnB1dHMsIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSwgYmludG9vbHMuY2I1OERlY29kZShQbGF0Zm9ybUNoYWluSUQpLCBpbXBvcnRJbnNcbiAgICApXG4gICAgY29uc3QgdHh1bmV3OiBJbXBvcnRUeCA9IG5ldyBJbXBvcnRUeCgpXG4gICAgY29uc3QgaW1wb3J0YnVmZjogQnVmZmVyID0gaW1wb3J0dHgudG9CdWZmZXIoKVxuICAgIHR4dW5ldy5mcm9tQnVmZmVyKGltcG9ydGJ1ZmYpXG5cbiAgICBleHBlY3QodHh1bmV3LnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKS50b0JlKGltcG9ydGJ1ZmYudG9TdHJpbmcoJ2hleCcpKVxuICAgIGV4cGVjdCh0eHVuZXcudG9TdHJpbmcoKSkudG9CZShpbXBvcnR0eC50b1N0cmluZygpKVxuICAgIGV4cGVjdChpbXBvcnR0eC5nZXRJbXBvcnRJbnB1dHMoKS5sZW5ndGgpLnRvQmUoaW1wb3J0SW5zLmxlbmd0aClcbiAgfSlcblxuICB0ZXN0KCdDcmVhdGlvbiBFeHBvcnRUeCcsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBib21idHg6RXhwb3J0VHggPSBuZXcgRXhwb3J0VHgoXG4gICAgICBuZXRpZCwgYmxvY2tjaGFpbklELCBvdXRwdXRzLCBpbnB1dHMsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBleHBvcnRPdXRzXG4gICAgKVxuXG4gICAgZXhwZWN0KCgpOiB2b2lkID0+IHtcbiAgICAgIGJvbWJ0eC50b0J1ZmZlcigpXG4gICAgfSkudG9UaHJvdygpXG5cbiAgICBjb25zdCBleHBvcnR0eDpFeHBvcnRUeCA9IG5ldyBFeHBvcnRUeChcbiAgICAgIG5ldGlkLCBibG9ja2NoYWluSUQsIG91dHB1dHMsIGlucHV0cywgdW5kZWZpbmVkLCBiaW50b29scy5jYjU4RGVjb2RlKFBsYXRmb3JtQ2hhaW5JRCksIGV4cG9ydE91dHNcbiAgICApXG4gICAgY29uc3QgdHh1bmV3OiBFeHBvcnRUeCA9IG5ldyBFeHBvcnRUeCgpXG4gICAgY29uc3QgZXhwb3J0YnVmZjogQnVmZmVyID0gZXhwb3J0dHgudG9CdWZmZXIoKVxuICAgIHR4dW5ldy5mcm9tQnVmZmVyKGV4cG9ydGJ1ZmYpXG5cbiAgICBleHBlY3QodHh1bmV3LnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKS50b0JlKGV4cG9ydGJ1ZmYudG9TdHJpbmcoJ2hleCcpKVxuICAgIGV4cGVjdCh0eHVuZXcudG9TdHJpbmcoKSkudG9CZShleHBvcnR0eC50b1N0cmluZygpKVxuICAgIGV4cGVjdChleHBvcnR0eC5nZXRFeHBvcnRPdXRwdXRzKCkubGVuZ3RoKS50b0JlKGV4cG9ydE91dHMubGVuZ3RoKVxuICB9KVxuXG4gIHRlc3QoJ0NyZWF0aW9uIFR4MSB3aXRoIGFzb2YsIGxvY2t0aW1lLCB0aHJlc2hvbGQnLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3QgdHh1OlVuc2lnbmVkVHggPSBzZXQuYnVpbGRCYXNlVHgoXG4gICAgICBuZXRpZCwgYmxvY2tjaGFpbklELFxuICAgICAgbmV3IEJOKDkwMDApLCBhc3NldElELCBhZGRyczMsIGFkZHJzMSwgYWRkcnMxLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLFxuICAgICAgVW5peE5vdygpLCBVbml4Tm93KCkuYWRkKG5ldyBCTig1MCkpLCAxLFxuICAgIClcbiAgICBjb25zdCB0eDogVHggPSB0eHUuc2lnbihrZXltZ3IxKVxuXG4gICAgY29uc3QgdHgyOiBUeCA9IG5ldyBUeCgpXG4gICAgdHgyLmZyb21TdHJpbmcodHgudG9TdHJpbmcoKSlcbiAgICBleHBlY3QodHgyLnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKS50b0JlKHR4LnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKVxuICAgIGV4cGVjdCh0eDIudG9TdHJpbmcoKSkudG9CZSh0eC50b1N0cmluZygpKVxuICB9KVxuICB0ZXN0KCdDcmVhdGlvbiBUeDIgd2l0aG91dCBhc29mLCBsb2NrdGltZSwgdGhyZXNob2xkJywgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHR4dTpVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkQmFzZVR4KFxuICAgICAgbmV0aWQsIGJsb2NrY2hhaW5JRCxcbiAgICAgIG5ldyBCTig5MDAwKSwgYXNzZXRJRCxcbiAgICAgIGFkZHJzMywgYWRkcnMxLCBhZGRyczFcbiAgICApXG4gICAgY29uc3QgdHg6IFR4ID0gdHh1LnNpZ24oa2V5bWdyMSlcbiAgICBjb25zdCB0eDI6IFR4ID0gbmV3IFR4KClcbiAgICB0eDIuZnJvbUJ1ZmZlcih0eC50b0J1ZmZlcigpKVxuICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpLnRvQmUodHgudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpXG4gICAgZXhwZWN0KHR4Mi50b1N0cmluZygpKS50b0JlKHR4LnRvU3RyaW5nKCkpXG4gIH0pXG5cbiAgdGVzdCgnQ3JlYXRpb24gVHgzIHVzaW5nIE9wZXJhdGlvblR4JywgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHR4dTpVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkTkZUVHJhbnNmZXJUeChcbiAgICAgIG5ldGlkLCBibG9ja2NoYWluSUQsIFxuICAgICAgYWRkcnMzLCBhZGRyczEsIGFkZHJzMiwgbmZ0dXR4b2lkcywgbmV3IEJOKDkwKSwgYXZheEFzc2V0SUQsIHVuZGVmaW5lZCxcbiAgICAgIFVuaXhOb3coKSwgVW5peE5vdygpLmFkZChuZXcgQk4oNTApKSwgMSxcbiAgICApXG4gICAgY29uc3QgdHg6IFR4ID0gdHh1LnNpZ24oa2V5bWdyMSlcbiAgICBjb25zdCB0eDI6IFR4ID0gbmV3IFR4KClcbiAgICB0eDIuZnJvbUJ1ZmZlcih0eC50b0J1ZmZlcigpKVxuICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpLnRvQmUodHgudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpXG4gIH0pXG5cbiAgdGVzdCgnQ3JlYXRpb24gVHg0IHVzaW5nIEltcG9ydFR4JywgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHR4dTpVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkSW1wb3J0VHgoXG4gICAgICBuZXRpZCwgYmxvY2tjaGFpbklELCBhZGRyczMsIGFkZHJzMSwgYWRkcnMyLCBpbXBvcnRVVFhPcywgYmludG9vbHMuY2I1OERlY29kZShQbGF0Zm9ybUNoYWluSUQpLCBuZXcgQk4oOTApLCBhc3NldElELFxuICAgICAgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIikuZ2V0UGF5bG9hZCgpLCBVbml4Tm93KCkpXG4gICAgY29uc3QgdHg6IFR4ID0gdHh1LnNpZ24oa2V5bWdyMSlcbiAgICBjb25zdCB0eDI6IFR4ID0gbmV3IFR4KClcbiAgICB0eDIuZnJvbUJ1ZmZlcih0eC50b0J1ZmZlcigpKVxuICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpLnRvQmUodHgudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpXG4gIH0pXG5cbiAgdGVzdCgnQ3JlYXRpb24gVHg1IHVzaW5nIEV4cG9ydFR4JywgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHR4dTpVbnNpZ25lZFR4ID0gc2V0LmJ1aWxkRXhwb3J0VHgoXG4gICAgICBuZXRpZCwgYmxvY2tjaGFpbklELCBuZXcgQk4oOTApLCBhdmF4QXNzZXRJRCxcbiAgICAgIGFkZHJzMywgYWRkcnMxLCBhZGRyczIsIGJpbnRvb2xzLmNiNThEZWNvZGUoUGxhdGZvcm1DaGFpbklEKSwgXG4gICAgICB1bmRlZmluZWQsIHVuZGVmaW5lZCwgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIikuZ2V0UGF5bG9hZCgpLCBVbml4Tm93KClcbiAgICApXG4gICAgY29uc3QgdHg6IFR4ID0gdHh1LnNpZ24oa2V5bWdyMSlcbiAgICBjb25zdCB0eDI6IFR4ID0gbmV3IFR4KClcbiAgICB0eDIuZnJvbUJ1ZmZlcih0eC50b0J1ZmZlcigpKVxuICAgIGV4cGVjdCh0eC50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSkudG9CZSh0eDIudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpXG4gIH0pXG59KVxuIl19