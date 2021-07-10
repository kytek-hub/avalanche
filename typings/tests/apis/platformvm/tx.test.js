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
const utxos_1 = require("src/apis/platformvm/utxos");
const api_1 = require("src/apis/platformvm/api");
const tx_1 = require("src/apis/platformvm/tx");
const keychain_1 = require("src/apis/platformvm/keychain");
const inputs_1 = require("src/apis/platformvm/inputs");
const create_hash_1 = __importDefault(require("create-hash"));
const bintools_1 = __importDefault(require("src/utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const outputs_1 = require("src/apis/platformvm/outputs");
const constants_1 = require("src/apis/platformvm/constants");
const index_1 = require("src/index");
const payload_1 = require("src/utils/payload");
const helperfunctions_1 = require("src/utils/helperfunctions");
const basetx_1 = require("src/apis/platformvm/basetx");
const importtx_1 = require("src/apis/platformvm/importtx");
const exporttx_1 = require("src/apis/platformvm/exporttx");
const constants_2 = require("src/utils/constants");
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
    let importIns;
    let importUTXOs;
    let exportOuts;
    let fungutxos;
    let exportUTXOIDS;
    let api;
    const amnt = 10000;
    const netid = 12345;
    const blockchainID = bintools.cb58Decode(constants_2.PlatformChainID);
    const alias = 'X';
    const assetID = buffer_1.Buffer.from(create_hash_1.default('sha256').update("Well, now, don't you tell me to smile, you stick around I'll make it worth your while.").digest());
    let amount;
    let addresses;
    let fallAddresses;
    let locktime;
    let fallLocktime;
    let threshold;
    let fallThreshold;
    const ip = '127.0.0.1';
    const port = 8080;
    const protocol = 'http';
    let avalanche;
    const name = 'Mortycoin is the dumb as a sack of hammers.';
    const symbol = 'morT';
    const denomination = 8;
    let avaxAssetID;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        avalanche = new index_1.Avalanche(ip, port, protocol, 12345, undefined, undefined, null, true);
        api = new api_1.PlatformVMAPI(avalanche, '/ext/bc/P');
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
        for (let i = 0; i < 3; i++) {
            addrs1.push(keymgr1.makeKey().getAddress());
            addrs2.push(keymgr2.makeKey().getAddress());
            addrs3.push(keymgr3.makeKey().getAddress());
        }
        amount = new bn_js_1.default(amnt);
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
            const u = new utxos_1.UTXO(constants_1.PlatformVMConstants.LATESTCODEC, txid, txidx, assetID, out);
            utxos.push(u);
            fungutxos.push(u);
            importUTXOs.push(u);
            txid = u.getTxID();
            txidx = u.getOutputIdx();
            const input = new inputs_1.SECPTransferInput(amount);
            const xferin = new inputs_1.TransferableInput(txid, txidx, assetID, input);
            inputs.push(xferin);
        }
        for (let i = 1; i < 4; i++) {
            importIns.push(inputs[i]);
            exportOuts.push(outputs[i]);
            exportUTXOIDS.push(fungutxos[i].getUTXOID());
        }
        set.addArray(utxos);
    });
    test('Create small BaseTx that is Goose Egg Tx', () => __awaiter(void 0, void 0, void 0, function* () {
        const bintools = bintools_1.default.getInstance();
        const networkID = 12345;
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
        const baseTx = new basetx_1.BaseTx(networkID, blockchainID, outs, ins);
        const unsignedTx = new tx_1.UnsignedTx(baseTx);
        expect(yield api.checkGooseEgg(unsignedTx)).toBe(true);
    }));
    test('confirm inputTotal, outputTotal and fee are correct', () => __awaiter(void 0, void 0, void 0, function* () {
        const bintools = bintools_1.default.getInstance();
        const networkID = 12345;
        // local network P Chain ID
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
        const baseTx = new basetx_1.BaseTx(networkID, blockchainID, outs, ins);
        const unsignedTx = new tx_1.UnsignedTx(baseTx);
        const inputTotal = unsignedTx.getInputTotal(assetID);
        const outputTotal = unsignedTx.getOutputTotal(assetID);
        const burn = unsignedTx.getBurn(assetID);
        expect(inputTotal.toNumber()).toEqual(new bn_js_1.default(400).toNumber());
        expect(outputTotal.toNumber()).toEqual(new bn_js_1.default(266).toNumber());
        expect(burn.toNumber()).toEqual(new bn_js_1.default(134).toNumber());
    }));
    test("Create small BaseTx that isn't Goose Egg Tx", () => __awaiter(void 0, void 0, void 0, function* () {
        const bintools = bintools_1.default.getInstance();
        const networkID = 12345;
        // local network X Chain ID
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
        const baseTx = new basetx_1.BaseTx(networkID, blockchainID, outs, ins);
        const unsignedTx = new tx_1.UnsignedTx(baseTx);
        expect(yield api.checkGooseEgg(unsignedTx)).toBe(true);
    }));
    test('Create large BaseTx that is Goose Egg Tx', () => __awaiter(void 0, void 0, void 0, function* () {
        const bintools = bintools_1.default.getInstance();
        const networkID = 12345;
        // local network P Chain ID
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
        const baseTx = new basetx_1.BaseTx(networkID, blockchainID, outs, ins);
        const unsignedTx = new tx_1.UnsignedTx(baseTx);
        expect(yield api.checkGooseEgg(unsignedTx)).toBe(false);
    }));
    test("Create large BaseTx that isn't Goose Egg Tx", () => __awaiter(void 0, void 0, void 0, function* () {
        const bintools = bintools_1.default.getInstance();
        const networkID = 12345;
        // local network P Chain ID
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
        const baseTx = new basetx_1.BaseTx(networkID, blockchainID, outs, ins);
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
            set.buildBaseTx(netid, blockchainID, new bn_js_1.default(amnt * 1000), assetID, addrs3, addrs1, addrs1);
        }).toThrow();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHgudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3RzL2FwaXMvcGxhdGZvcm12bS90eC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsc0VBQXVDO0FBQ3ZDLHFEQUF5RDtBQUN6RCxpREFBdUQ7QUFDdkQsK0NBQXVEO0FBQ3ZELDJEQUF1RDtBQUN2RCx1REFBaUY7QUFDakYsOERBQW9DO0FBQ3BDLGtFQUF5QztBQUN6QyxrREFBc0I7QUFDdEIsb0NBQWdDO0FBQ2hDLHlEQUFvRjtBQUNwRiw2REFBbUU7QUFDbkUscUNBQXFDO0FBQ3JDLCtDQUErQztBQUMvQywrREFBbUQ7QUFDbkQsdURBQW1EO0FBQ25ELDJEQUF1RDtBQUN2RCwyREFBdUQ7QUFDdkQsbURBQXFEO0FBR3JEOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxRQUFRLENBQUMsY0FBYyxFQUFFLEdBQVMsRUFBRTtJQUNsQyxJQUFJLEdBQVksQ0FBQTtJQUNoQixJQUFJLE9BQWlCLENBQUE7SUFDckIsSUFBSSxPQUFpQixDQUFBO0lBQ3JCLElBQUksT0FBaUIsQ0FBQTtJQUNyQixJQUFJLE1BQWdCLENBQUE7SUFDcEIsSUFBSSxNQUFnQixDQUFBO0lBQ3BCLElBQUksTUFBZ0IsQ0FBQTtJQUNwQixJQUFJLEtBQWEsQ0FBQTtJQUNqQixJQUFJLE1BQTJCLENBQUE7SUFDL0IsSUFBSSxPQUE2QixDQUFBO0lBQ2pDLElBQUksU0FBOEIsQ0FBQTtJQUNsQyxJQUFJLFdBQW1CLENBQUE7SUFDdkIsSUFBSSxVQUFnQyxDQUFBO0lBQ3BDLElBQUksU0FBaUIsQ0FBQTtJQUNyQixJQUFJLGFBQXVCLENBQUE7SUFDM0IsSUFBSSxHQUFrQixDQUFBO0lBQ3RCLE1BQU0sSUFBSSxHQUFXLEtBQUssQ0FBQTtJQUMxQixNQUFNLEtBQUssR0FBVyxLQUFLLENBQUE7SUFD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Q0FBQyxDQUFDLENBQUE7UUFFakcsSUFBSSxDQUFDLEdBQWEsRUFBRSxDQUFBO1FBQ3BCLElBQUksQ0FBQyxHQUFhLEVBQUUsQ0FBQTtRQUNwQixLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM3QyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1lBQzNCLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7U0FDN0I7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFFL0QsQ0FBQyxHQUFHLEVBQUUsQ0FBQTtRQUNOLENBQUMsR0FBRyxFQUFFLENBQUE7UUFFTixLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUM5QyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1lBQzVCLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7U0FDOUI7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFFL0QsTUFBTSxNQUFNLEdBQWUsSUFBSSxlQUFVLEVBQUUsQ0FBQTtRQUMz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QUFPLElBQUksT0FBRSxFQUFFLENBQUE7UUFDeEIsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQTtRQUM3QixNQUFNLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDNUUsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb2NrQXhpb3MgZnJvbSAnamVzdC1tb2NrLWF4aW9zJ1xuaW1wb3J0IHsgVVRYT1NldCwgVVRYTyB9IGZyb20gJ3NyYy9hcGlzL3BsYXRmb3Jtdm0vdXR4b3MnXG5pbXBvcnQgeyBQbGF0Zm9ybVZNQVBJIH0gZnJvbSAnc3JjL2FwaXMvcGxhdGZvcm12bS9hcGknXG5pbXBvcnQgeyBVbnNpZ25lZFR4LCBUeCB9IGZyb20gJ3NyYy9hcGlzL3BsYXRmb3Jtdm0vdHgnXG5pbXBvcnQgeyBLZXlDaGFpbiB9IGZyb20gJ3NyYy9hcGlzL3BsYXRmb3Jtdm0va2V5Y2hhaW4nXG5pbXBvcnQgeyBTRUNQVHJhbnNmZXJJbnB1dCwgVHJhbnNmZXJhYmxlSW5wdXQgfSBmcm9tICdzcmMvYXBpcy9wbGF0Zm9ybXZtL2lucHV0cydcbmltcG9ydCBjcmVhdGVIYXNoIGZyb20gJ2NyZWF0ZS1oYXNoJ1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJ3NyYy91dGlscy9iaW50b29scydcbmltcG9ydCBCTiBmcm9tICdibi5qcydcbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nXG5pbXBvcnQgeyBTRUNQVHJhbnNmZXJPdXRwdXQsIFRyYW5zZmVyYWJsZU91dHB1dCB9IGZyb20gJ3NyYy9hcGlzL3BsYXRmb3Jtdm0vb3V0cHV0cydcbmltcG9ydCB7IFBsYXRmb3JtVk1Db25zdGFudHMgfSBmcm9tICdzcmMvYXBpcy9wbGF0Zm9ybXZtL2NvbnN0YW50cydcbmltcG9ydCB7IEF2YWxhbmNoZSB9IGZyb20gJ3NyYy9pbmRleCdcbmltcG9ydCB7IFVURjhQYXlsb2FkIH0gZnJvbSAnc3JjL3V0aWxzL3BheWxvYWQnXG5pbXBvcnQgeyBVbml4Tm93IH0gZnJvbSAnc3JjL3V0aWxzL2hlbHBlcmZ1bmN0aW9ucydcbmltcG9ydCB7IEJhc2VUeCB9IGZyb20gJ3NyYy9hcGlzL3BsYXRmb3Jtdm0vYmFzZXR4J1xuaW1wb3J0IHsgSW1wb3J0VHggfSBmcm9tICdzcmMvYXBpcy9wbGF0Zm9ybXZtL2ltcG9ydHR4J1xuaW1wb3J0IHsgRXhwb3J0VHggfSBmcm9tICdzcmMvYXBpcy9wbGF0Zm9ybXZtL2V4cG9ydHR4J1xuaW1wb3J0IHsgUGxhdGZvcm1DaGFpbklEIH0gZnJvbSAnc3JjL3V0aWxzL2NvbnN0YW50cydcbmltcG9ydCB7IEh0dHBSZXNwb25zZSB9IGZyb20gJ2plc3QtbW9jay1heGlvcy9kaXN0L2xpYi9tb2NrLWF4aW9zLXR5cGVzJ1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuZGVzY3JpYmUoJ1RyYW5zYWN0aW9ucycsICgpOiB2b2lkID0+IHtcbiAgbGV0IHNldDogVVRYT1NldFxuICBsZXQga2V5bWdyMTogS2V5Q2hhaW5cbiAgbGV0IGtleW1ncjI6IEtleUNoYWluXG4gIGxldCBrZXltZ3IzOiBLZXlDaGFpblxuICBsZXQgYWRkcnMxOiBCdWZmZXJbXVxuICBsZXQgYWRkcnMyOiBCdWZmZXJbXVxuICBsZXQgYWRkcnMzOiBCdWZmZXJbXVxuICBsZXQgdXR4b3M6IFVUWE9bXVxuICBsZXQgaW5wdXRzOiBUcmFuc2ZlcmFibGVJbnB1dFtdXG4gIGxldCBvdXRwdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXVxuICBsZXQgaW1wb3J0SW5zOiBUcmFuc2ZlcmFibGVJbnB1dFtdXG4gIGxldCBpbXBvcnRVVFhPczogVVRYT1tdXG4gIGxldCBleHBvcnRPdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXVxuICBsZXQgZnVuZ3V0eG9zOiBVVFhPW11cbiAgbGV0IGV4cG9ydFVUWE9JRFM6IHN0cmluZ1tdXG4gIGxldCBhcGk6IFBsYXRmb3JtVk1BUElcbiAgY29uc3QgYW1udDogbnVtYmVyID0gMTAwMDBcbiAgY29uc3QgbmV0aWQ6IG51bWJlciA9IDEyMzQ1XG4gIGNvbnN0IGJsb2NrY2hhaW5JRDogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZShQbGF0Zm9ybUNoYWluSUQpXG4gIGNvbnN0IGFsaWFzOiBzdHJpbmcgPSAnWCdcbiAgY29uc3QgYXNzZXRJRDogQnVmZmVyID0gQnVmZmVyLmZyb20oY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKFwiV2VsbCwgbm93LCBkb24ndCB5b3UgdGVsbCBtZSB0byBzbWlsZSwgeW91IHN0aWNrIGFyb3VuZCBJJ2xsIG1ha2UgaXQgd29ydGggeW91ciB3aGlsZS5cIikuZGlnZXN0KCkpXG4gIGxldCBhbW91bnQ6IEJOXG4gIGxldCBhZGRyZXNzZXM6IEJ1ZmZlcltdXG4gIGxldCBmYWxsQWRkcmVzc2VzOiBCdWZmZXJbXVxuICBsZXQgbG9ja3RpbWU6IEJOXG4gIGxldCBmYWxsTG9ja3RpbWU6IEJOXG4gIGxldCB0aHJlc2hvbGQ6IG51bWJlclxuICBsZXQgZmFsbFRocmVzaG9sZDogbnVtYmVyXG4gIGNvbnN0IGlwOiBzdHJpbmcgPSAnMTI3LjAuMC4xJ1xuICBjb25zdCBwb3J0OiBudW1iZXIgPSA4MDgwXG4gIGNvbnN0IHByb3RvY29sOiBzdHJpbmcgPSAnaHR0cCdcbiAgbGV0IGF2YWxhbmNoZTogQXZhbGFuY2hlXG4gIGNvbnN0IG5hbWU6IHN0cmluZyA9ICdNb3J0eWNvaW4gaXMgdGhlIGR1bWIgYXMgYSBzYWNrIG9mIGhhbW1lcnMuJ1xuICBjb25zdCBzeW1ib2w6IHN0cmluZyA9ICdtb3JUJ1xuICBjb25zdCBkZW5vbWluYXRpb246IG51bWJlciA9IDhcbiAgbGV0IGF2YXhBc3NldElEOiBCdWZmZXJcblxuICBiZWZvcmVBbGwoYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGF2YWxhbmNoZSA9IG5ldyBBdmFsYW5jaGUoaXAsIHBvcnQsIHByb3RvY29sLCAxMjM0NSwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG51bGwsIHRydWUpXG4gICAgYXBpID0gbmV3IFBsYXRmb3JtVk1BUEkoYXZhbGFuY2hlLCAnL2V4dC9iYy9QJylcbiAgICBjb25zdCByZXN1bHQ6IFByb21pc2U8QnVmZmVyPiA9IGFwaS5nZXRBVkFYQXNzZXRJRCgpXG4gICAgY29uc3QgcGF5bG9hZDpvYmplY3QgPSB7XG4gICAgICByZXN1bHQ6IHtcbiAgICAgICAgbmFtZSxcbiAgICAgICAgc3ltYm9sLFxuICAgICAgICBhc3NldElEOiBiaW50b29scy5jYjU4RW5jb2RlKGFzc2V0SUQpLFxuICAgICAgICBkZW5vbWluYXRpb246IGAke2Rlbm9taW5hdGlvbn1gLFxuICAgICAgfSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2VPYmo6IEh0dHBSZXNwb25zZSA9IHtcbiAgICAgIGRhdGE6IHBheWxvYWQsXG4gICAgfVxuXG4gICAgbW9ja0F4aW9zLm1vY2tSZXNwb25zZShyZXNwb25zZU9iailcbiAgICBhdmF4QXNzZXRJRCA9IGF3YWl0IHJlc3VsdFxuICB9KVxuXG4gIGJlZm9yZUVhY2goKCk6IHZvaWQgPT4ge1xuICAgIHNldCA9IG5ldyBVVFhPU2V0KClcbiAgICBrZXltZ3IxID0gbmV3IEtleUNoYWluKGF2YWxhbmNoZS5nZXRIUlAoKSwgYWxpYXMpXG4gICAga2V5bWdyMiA9IG5ldyBLZXlDaGFpbihhdmFsYW5jaGUuZ2V0SFJQKCksIGFsaWFzKVxuICAgIGtleW1ncjMgPSBuZXcgS2V5Q2hhaW4oYXZhbGFuY2hlLmdldEhSUCgpLCBhbGlhcylcbiAgICBhZGRyczEgPSBbXVxuICAgIGFkZHJzMiA9IFtdXG4gICAgYWRkcnMzID0gW11cbiAgICB1dHhvcyA9IFtdXG4gICAgaW5wdXRzID0gW11cbiAgICBvdXRwdXRzID0gW11cbiAgICBpbXBvcnRJbnMgPSBbXVxuICAgIGltcG9ydFVUWE9zID0gW11cbiAgICBleHBvcnRPdXRzID0gW11cbiAgICBmdW5ndXR4b3MgPSBbXVxuICAgIGV4cG9ydFVUWE9JRFMgPSBbXVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgIGFkZHJzMS5wdXNoKGtleW1ncjEubWFrZUtleSgpLmdldEFkZHJlc3MoKSlcbiAgICAgIGFkZHJzMi5wdXNoKGtleW1ncjIubWFrZUtleSgpLmdldEFkZHJlc3MoKSlcbiAgICAgIGFkZHJzMy5wdXNoKGtleW1ncjMubWFrZUtleSgpLmdldEFkZHJlc3MoKSlcbiAgICB9XG4gICAgYW1vdW50ID0gbmV3IEJOKGFtbnQpXG4gICAgYWRkcmVzc2VzID0ga2V5bWdyMS5nZXRBZGRyZXNzZXMoKVxuICAgIGZhbGxBZGRyZXNzZXMgPSBrZXltZ3IyLmdldEFkZHJlc3NlcygpXG4gICAgbG9ja3RpbWUgPSBuZXcgQk4oNTQzMjEpXG4gICAgZmFsbExvY2t0aW1lID0gbG9ja3RpbWUuYWRkKG5ldyBCTig1MCkpXG4gICAgdGhyZXNob2xkID0gM1xuICAgIGZhbGxUaHJlc2hvbGQgPSAxXG5cbiAgICBjb25zdCBwYXlsb2FkOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMTAyNClcbiAgICBwYXlsb2FkLndyaXRlKFwiQWxsIHlvdSBUcmVra2llcyBhbmQgVFYgYWRkaWN0cywgRG9uJ3QgbWVhbiB0byBkaXNzIGRvbid0IG1lYW4gdG8gYnJpbmcgc3RhdGljLlwiLCAwLCAxMDI0LCAndXRmOCcpXG5cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICBsZXQgdHhpZDogQnVmZmVyID0gQnVmZmVyLmZyb20oY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG5ldyBCTihpKSwgMzIpKS5kaWdlc3QoKSlcbiAgICAgIGxldCB0eGlkeDogQnVmZmVyID0gQnVmZmVyLmZyb20oYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobmV3IEJOKGkpLCA0KSlcbiAgICAgIGNvbnN0IG91dDogU0VDUFRyYW5zZmVyT3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChhbW91bnQsIGFkZHJlc3NlcywgbG9ja3RpbWUsIHRocmVzaG9sZClcbiAgICAgIGNvbnN0IHhmZXJvdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYXNzZXRJRCwgb3V0KVxuICAgICAgb3V0cHV0cy5wdXNoKHhmZXJvdXQpXG5cbiAgICAgIGNvbnN0IHU6IFVUWE8gPSBuZXcgVVRYTyhQbGF0Zm9ybVZNQ29uc3RhbnRzLkxBVEVTVENPREVDLCB0eGlkLCB0eGlkeCwgYXNzZXRJRCwgb3V0KVxuICAgICAgdXR4b3MucHVzaCh1KVxuICAgICAgZnVuZ3V0eG9zLnB1c2godSlcbiAgICAgIGltcG9ydFVUWE9zLnB1c2godSlcblxuICAgICAgdHhpZCA9IHUuZ2V0VHhJRCgpXG4gICAgICB0eGlkeCA9IHUuZ2V0T3V0cHV0SWR4KClcblxuICAgICAgY29uc3QgaW5wdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KGFtb3VudClcbiAgICAgIGNvbnN0IHhmZXJpbjogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQodHhpZCwgdHhpZHgsIGFzc2V0SUQsIGlucHV0KVxuICAgICAgaW5wdXRzLnB1c2goeGZlcmluKVxuICAgIH1cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAxOyBpIDwgNDsgaSsrKSB7XG4gICAgICBpbXBvcnRJbnMucHVzaChpbnB1dHNbaV0pXG4gICAgICBleHBvcnRPdXRzLnB1c2gob3V0cHV0c1tpXSlcbiAgICAgIGV4cG9ydFVUWE9JRFMucHVzaChmdW5ndXR4b3NbaV0uZ2V0VVRYT0lEKCkpXG4gICAgfVxuICAgIHNldC5hZGRBcnJheSh1dHhvcylcbiAgfSlcblxuICB0ZXN0KCdDcmVhdGUgc21hbGwgQmFzZVR4IHRoYXQgaXMgR29vc2UgRWdnIFR4JywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbiAgICBjb25zdCBuZXR3b3JrSUQ6IG51bWJlciA9IDEyMzQ1XG4gICAgXG4gICAgY29uc3Qgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXVxuICAgIGNvbnN0IGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IFtdXG4gICAgY29uc3Qgb3V0cHV0QW10OiBCTiA9IG5ldyBCTihcIjI2NlwiKVxuICAgIGNvbnN0IG91dHB1dDogU0VDUFRyYW5zZmVyT3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChvdXRwdXRBbXQsIGFkZHJzMSwgbmV3IEJOKDApLCAxKVxuICAgIGNvbnN0IHRyYW5zZmVyYWJsZU91dHB1dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChhdmF4QXNzZXRJRCwgb3V0cHV0KVxuICAgIG91dHMucHVzaCh0cmFuc2ZlcmFibGVPdXRwdXQpXG4gICAgY29uc3QgaW5wdXRBbXQ6IEJOID0gbmV3IEJOKFwiNDAwXCIpXG4gICAgY29uc3QgaW5wdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KGlucHV0QW10KVxuICAgIGlucHV0LmFkZFNpZ25hdHVyZUlkeCgwLCBhZGRyczFbMF0pXG4gICAgY29uc3QgdHhpZDogQnVmZmVyID0gYmludG9vbHMuY2I1OERlY29kZShcIm44WEg1SlkxRVg1VllxRGVBaEI0WmQ0R0t4aTlVTlF5Nm9QcE1zQ0FqMVE2eGtpaUxcIilcbiAgICBjb25zdCBvdXRwdXRJbmRleDogQnVmZmVyID0gQnVmZmVyLmZyb20oYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobmV3IEJOKDApLCA0KSlcbiAgICBjb25zdCB0cmFuc2ZlcmFibGVJbnB1dDogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQodHhpZCwgb3V0cHV0SW5kZXgsIGF2YXhBc3NldElELCBpbnB1dClcbiAgICBpbnMucHVzaCh0cmFuc2ZlcmFibGVJbnB1dClcbiAgICBjb25zdCBiYXNlVHg6IEJhc2VUeCA9IG5ldyBCYXNlVHgobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucylcbiAgICBjb25zdCB1bnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gbmV3IFVuc2lnbmVkVHgoYmFzZVR4KVxuICAgIGV4cGVjdChhd2FpdCBhcGkuY2hlY2tHb29zZUVnZyh1bnNpZ25lZFR4KSkudG9CZSh0cnVlKVxuICB9KVxuXG4gIHRlc3QoJ2NvbmZpcm0gaW5wdXRUb3RhbCwgb3V0cHV0VG90YWwgYW5kIGZlZSBhcmUgY29ycmVjdCcsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG4gICAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSAxMjM0NVxuICAgIC8vIGxvY2FsIG5ldHdvcmsgUCBDaGFpbiBJRFxuICAgIC8vIEFWQVggYXNzZXRJRFxuICAgIGNvbnN0IGFzc2V0SUQ6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUoXCJuOFhINUpZMUVYNVZZcURlQWhCNFpkNEdLeGk5VU5ReTZvUHBNc0NBajFRNnhraWlMXCIpXG4gICAgY29uc3Qgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXVxuICAgIGNvbnN0IGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IFtdXG4gICAgY29uc3Qgb3V0cHV0QW10OiBCTiA9IG5ldyBCTihcIjI2NlwiKVxuICAgIGNvbnN0IG91dHB1dDogU0VDUFRyYW5zZmVyT3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChvdXRwdXRBbXQsIGFkZHJzMSwgbmV3IEJOKDApLCAxKVxuICAgIGNvbnN0IHRyYW5zZmVyYWJsZU91dHB1dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChhc3NldElELCBvdXRwdXQpXG4gICAgb3V0cy5wdXNoKHRyYW5zZmVyYWJsZU91dHB1dClcbiAgICBjb25zdCBpbnB1dEFtdDogQk4gPSBuZXcgQk4oXCI0MDBcIilcbiAgICBjb25zdCBpbnB1dDogU0VDUFRyYW5zZmVySW5wdXQgPSBuZXcgU0VDUFRyYW5zZmVySW5wdXQoaW5wdXRBbXQpXG4gICAgaW5wdXQuYWRkU2lnbmF0dXJlSWR4KDAsIGFkZHJzMVswXSlcbiAgICBjb25zdCB0eGlkOiBCdWZmZXIgPSBiaW50b29scy5jYjU4RGVjb2RlKFwibjhYSDVKWTFFWDVWWXFEZUFoQjRaZDRHS3hpOVVOUXk2b1BwTXNDQWoxUTZ4a2lpTFwiKVxuICAgIGNvbnN0IG91dHB1dEluZGV4OiBCdWZmZXIgPSBCdWZmZXIuZnJvbShiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihuZXcgQk4oMCksIDQpKVxuICAgIGNvbnN0IHRyYW5zZmVyYWJsZUlucHV0OiBUcmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBUcmFuc2ZlcmFibGVJbnB1dCh0eGlkLCBvdXRwdXRJbmRleCwgYXNzZXRJRCwgaW5wdXQpXG4gICAgaW5zLnB1c2godHJhbnNmZXJhYmxlSW5wdXQpXG4gICAgY29uc3QgYmFzZVR4OiBCYXNlVHggPSBuZXcgQmFzZVR4KG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMpXG4gICAgY29uc3QgdW5zaWduZWRUeDogVW5zaWduZWRUeCA9IG5ldyBVbnNpZ25lZFR4KGJhc2VUeClcbiAgICBjb25zdCBpbnB1dFRvdGFsOiBCTiA9IHVuc2lnbmVkVHguZ2V0SW5wdXRUb3RhbChhc3NldElEKVxuICAgIGNvbnN0IG91dHB1dFRvdGFsOiBCTiA9IHVuc2lnbmVkVHguZ2V0T3V0cHV0VG90YWwoYXNzZXRJRClcbiAgICBjb25zdCBidXJuOiBCTiA9IHVuc2lnbmVkVHguZ2V0QnVybihhc3NldElEKVxuICAgIGV4cGVjdChpbnB1dFRvdGFsLnRvTnVtYmVyKCkpLnRvRXF1YWwobmV3IEJOKDQwMCkudG9OdW1iZXIoKSlcbiAgICBleHBlY3Qob3V0cHV0VG90YWwudG9OdW1iZXIoKSkudG9FcXVhbChuZXcgQk4oMjY2KS50b051bWJlcigpKVxuICAgIGV4cGVjdChidXJuLnRvTnVtYmVyKCkpLnRvRXF1YWwobmV3IEJOKDEzNCkudG9OdW1iZXIoKSlcbiAgfSlcblxuXG4gIHRlc3QoXCJDcmVhdGUgc21hbGwgQmFzZVR4IHRoYXQgaXNuJ3QgR29vc2UgRWdnIFR4XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG4gICAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSAxMjM0NVxuICAgIC8vIGxvY2FsIG5ldHdvcmsgWCBDaGFpbiBJRFxuICAgIGNvbnN0IG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW11cbiAgICBjb25zdCBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXVxuICAgIGNvbnN0IG91dHB1dEFtdDogQk4gPSBuZXcgQk4oXCIyNjdcIilcbiAgICBjb25zdCBvdXRwdXQ6IFNFQ1BUcmFuc2Zlck91dHB1dCA9IG5ldyBTRUNQVHJhbnNmZXJPdXRwdXQob3V0cHV0QW10LCBhZGRyczEsIG5ldyBCTigwKSwgMSlcbiAgICBjb25zdCB0cmFuc2ZlcmFibGVPdXRwdXQ6IFRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoYXZheEFzc2V0SUQsIG91dHB1dClcbiAgICBvdXRzLnB1c2godHJhbnNmZXJhYmxlT3V0cHV0KVxuICAgIGNvbnN0IGlucHV0QW10OiBCTiA9IG5ldyBCTihcIjQwMFwiKVxuICAgIGNvbnN0IGlucHV0OiBTRUNQVHJhbnNmZXJJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChpbnB1dEFtdClcbiAgICBpbnB1dC5hZGRTaWduYXR1cmVJZHgoMCwgYWRkcnMxWzBdKVxuICAgIGNvbnN0IHR4aWQ6IEJ1ZmZlciA9IGJpbnRvb2xzLmNiNThEZWNvZGUoXCJuOFhINUpZMUVYNVZZcURlQWhCNFpkNEdLeGk5VU5ReTZvUHBNc0NBajFRNnhraWlMXCIpXG4gICAgY29uc3Qgb3V0cHV0SW5kZXg6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKG5ldyBCTigwKSwgNCkpXG4gICAgY29uc3QgdHJhbnNmZXJhYmxlSW5wdXQ6IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KHR4aWQsIG91dHB1dEluZGV4LCBhdmF4QXNzZXRJRCwgaW5wdXQpXG4gICAgaW5zLnB1c2godHJhbnNmZXJhYmxlSW5wdXQpXG4gICAgY29uc3QgYmFzZVR4OiBCYXNlVHggPSBuZXcgQmFzZVR4KG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMpXG4gICAgY29uc3QgdW5zaWduZWRUeDogVW5zaWduZWRUeCA9IG5ldyBVbnNpZ25lZFR4KGJhc2VUeClcbiAgICBleHBlY3QoYXdhaXQgYXBpLmNoZWNrR29vc2VFZ2codW5zaWduZWRUeCkpLnRvQmUodHJ1ZSlcbiAgfSlcblxuICB0ZXN0KCdDcmVhdGUgbGFyZ2UgQmFzZVR4IHRoYXQgaXMgR29vc2UgRWdnIFR4JywgYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgIGNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbiAgICBjb25zdCBuZXR3b3JrSUQ6IG51bWJlciA9IDEyMzQ1XG4gICAgLy8gbG9jYWwgbmV0d29yayBQIENoYWluIElEXG4gICAgY29uc3Qgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSBbXVxuICAgIGNvbnN0IGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IFtdXG4gICAgY29uc3Qgb3V0cHV0QW10OiBCTiA9IG5ldyBCTihcIjYwOTU1NTUwMDAwMFwiKVxuICAgIGNvbnN0IG91dHB1dDogU0VDUFRyYW5zZmVyT3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChvdXRwdXRBbXQsIGFkZHJzMSwgbmV3IEJOKDApLCAxKVxuICAgIGNvbnN0IHRyYW5zZmVyYWJsZU91dHB1dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChhdmF4QXNzZXRJRCwgb3V0cHV0KVxuICAgIG91dHMucHVzaCh0cmFuc2ZlcmFibGVPdXRwdXQpXG4gICAgY29uc3QgaW5wdXRBbXQ6IEJOID0gbmV3IEJOKFwiNDUwMDAwMDAwMDAwMDAwMDBcIilcbiAgICBjb25zdCBpbnB1dDogU0VDUFRyYW5zZmVySW5wdXQgPSBuZXcgU0VDUFRyYW5zZmVySW5wdXQoaW5wdXRBbXQpXG4gICAgaW5wdXQuYWRkU2lnbmF0dXJlSWR4KDAsIGFkZHJzMVswXSlcbiAgICBjb25zdCB0eGlkOiBCdWZmZXIgPSBiaW50b29scy5jYjU4RGVjb2RlKFwibjhYSDVKWTFFWDVWWXFEZUFoQjRaZDRHS3hpOVVOUXk2b1BwTXNDQWoxUTZ4a2lpTFwiKVxuICAgIGNvbnN0IG91dHB1dEluZGV4OiBCdWZmZXIgPSBCdWZmZXIuZnJvbShiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihuZXcgQk4oMCksIDQpKVxuICAgIGNvbnN0IHRyYW5zZmVyYWJsZUlucHV0OiBUcmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBUcmFuc2ZlcmFibGVJbnB1dCh0eGlkLCBvdXRwdXRJbmRleCwgYXZheEFzc2V0SUQsIGlucHV0KVxuICAgIGlucy5wdXNoKHRyYW5zZmVyYWJsZUlucHV0KVxuICAgIGNvbnN0IGJhc2VUeDogQmFzZVR4ID0gbmV3IEJhc2VUeChuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zKVxuICAgIGNvbnN0IHVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSBuZXcgVW5zaWduZWRUeChiYXNlVHgpXG4gICAgZXhwZWN0KGF3YWl0IGFwaS5jaGVja0dvb3NlRWdnKHVuc2lnbmVkVHgpKS50b0JlKGZhbHNlKVxuICB9KVxuXG4gIHRlc3QoXCJDcmVhdGUgbGFyZ2UgQmFzZVR4IHRoYXQgaXNuJ3QgR29vc2UgRWdnIFR4XCIsIGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgICBjb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG4gICAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSAxMjM0NVxuICAgIC8vIGxvY2FsIG5ldHdvcmsgUCBDaGFpbiBJRFxuICAgIGNvbnN0IG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gW11cbiAgICBjb25zdCBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSBbXVxuICAgIGNvbnN0IG91dHB1dEFtdDogQk4gPSBuZXcgQk4oXCI0NDk5NTYwOTU1NTUwMDAwMFwiKVxuICAgIGNvbnN0IG91dHB1dDogU0VDUFRyYW5zZmVyT3V0cHV0ID0gbmV3IFNFQ1BUcmFuc2Zlck91dHB1dChvdXRwdXRBbXQsIGFkZHJzMSwgbmV3IEJOKDApLCAxKVxuICAgIGNvbnN0IHRyYW5zZmVyYWJsZU91dHB1dDogVHJhbnNmZXJhYmxlT3V0cHV0ID0gbmV3IFRyYW5zZmVyYWJsZU91dHB1dChhdmF4QXNzZXRJRCwgb3V0cHV0KVxuICAgIG91dHMucHVzaCh0cmFuc2ZlcmFibGVPdXRwdXQpXG4gICAgY29uc3QgaW5wdXRBbXQ6IEJOID0gbmV3IEJOKFwiNDUwMDAwMDAwMDAwMDAwMDBcIilcbiAgICBjb25zdCBpbnB1dDogU0VDUFRyYW5zZmVySW5wdXQgPSBuZXcgU0VDUFRyYW5zZmVySW5wdXQoaW5wdXRBbXQpXG4gICAgaW5wdXQuYWRkU2lnbmF0dXJlSWR4KDAsIGFkZHJzMVswXSlcbiAgICBjb25zdCB0eGlkOiBCdWZmZXIgPSBiaW50b29scy5jYjU4RGVjb2RlKFwibjhYSDVKWTFFWDVWWXFEZUFoQjRaZDRHS3hpOVVOUXk2b1BwTXNDQWoxUTZ4a2lpTFwiKVxuICAgIGNvbnN0IG91dHB1dEluZGV4OiBCdWZmZXIgPSBCdWZmZXIuZnJvbShiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihuZXcgQk4oMCksIDQpKVxuICAgIGNvbnN0IHRyYW5zZmVyYWJsZUlucHV0OiBUcmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBUcmFuc2ZlcmFibGVJbnB1dCh0eGlkLCBvdXRwdXRJbmRleCwgYXZheEFzc2V0SUQsIGlucHV0KVxuICAgIGlucy5wdXNoKHRyYW5zZmVyYWJsZUlucHV0KVxuICAgIGNvbnN0IGJhc2VUeDogQmFzZVR4ID0gbmV3IEJhc2VUeChuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zKVxuICAgIGNvbnN0IHVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSBuZXcgVW5zaWduZWRUeChiYXNlVHgpXG4gICAgZXhwZWN0KGF3YWl0IGFwaS5jaGVja0dvb3NlRWdnKHVuc2lnbmVkVHgpKS50b0JlKHRydWUpXG4gIH0pXG5cbiAgdGVzdCgnQ3JlYXRpb24gVW5zaWduZWRUeCcsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBiYXNlVHg6IEJhc2VUeCA9IG5ldyBCYXNlVHgobmV0aWQsIGJsb2NrY2hhaW5JRCwgb3V0cHV0cywgaW5wdXRzKVxuICAgIGNvbnN0IHR4dTogVW5zaWduZWRUeCA9IG5ldyBVbnNpZ25lZFR4KGJhc2VUeClcbiAgICBjb25zdCB0eGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHR4dS5nZXRUcmFuc2FjdGlvbigpLmdldElucygpXG4gICAgY29uc3QgdHhvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHR4dS5nZXRUcmFuc2FjdGlvbigpLmdldE91dHMoKVxuICAgIGV4cGVjdCh0eGlucy5sZW5ndGgpLnRvQmUoaW5wdXRzLmxlbmd0aClcbiAgICBleHBlY3QodHhvdXRzLmxlbmd0aCkudG9CZShvdXRwdXRzLmxlbmd0aClcblxuICAgIGV4cGVjdCh0eHUuZ2V0VHJhbnNhY3Rpb24oKS5nZXRUeFR5cGUoKSkudG9CZSgwKVxuICAgIGV4cGVjdCh0eHUuZ2V0VHJhbnNhY3Rpb24oKS5nZXROZXR3b3JrSUQoKSkudG9CZSgxMjM0NSlcbiAgICBleHBlY3QodHh1LmdldFRyYW5zYWN0aW9uKCkuZ2V0QmxvY2tjaGFpbklEKCkudG9TdHJpbmcoJ2hleCcpKS50b0JlKGJsb2NrY2hhaW5JRC50b1N0cmluZygnaGV4JykpXG5cbiAgICBsZXQgYTogc3RyaW5nW10gPSBbXVxuICAgIGxldCBiOiBzdHJpbmdbXSA9IFtdXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHR4aW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhLnB1c2godHhpbnNbaV0udG9TdHJpbmcoKSlcbiAgICAgIGIucHVzaChpbnB1dHNbaV0udG9TdHJpbmcoKSlcbiAgICB9XG4gICAgZXhwZWN0KEpTT04uc3RyaW5naWZ5KGEuc29ydCgpKSkudG9CZShKU09OLnN0cmluZ2lmeShiLnNvcnQoKSkpXG5cbiAgICBhID0gW11cbiAgICBiID0gW11cblxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0eG91dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGEucHVzaCh0eG91dHNbaV0udG9TdHJpbmcoKSlcbiAgICAgIGIucHVzaChvdXRwdXRzW2ldLnRvU3RyaW5nKCkpXG4gICAgfVxuICAgIGV4cGVjdChKU09OLnN0cmluZ2lmeShhLnNvcnQoKSkpLnRvQmUoSlNPTi5zdHJpbmdpZnkoYi5zb3J0KCkpKVxuXG4gICAgY29uc3QgdHh1bmV3OiBVbnNpZ25lZFR4ID0gbmV3IFVuc2lnbmVkVHgoKVxuICAgIHR4dW5ldy5mcm9tQnVmZmVyKHR4dS50b0J1ZmZlcigpKVxuICAgIGV4cGVjdCh0eHVuZXcudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpLnRvQmUodHh1LnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKVxuICAgIGV4cGVjdCh0eHVuZXcudG9TdHJpbmcoKSkudG9CZSh0eHUudG9TdHJpbmcoKSlcbiAgfSlcblxuICB0ZXN0KCdDcmVhdGlvbiBVbnNpZ25lZFR4IENoZWNrIEFtb3VudCcsICgpOiB2b2lkID0+IHtcbiAgICBleHBlY3QoKCk6IHZvaWQgPT4ge1xuICAgICAgc2V0LmJ1aWxkQmFzZVR4KFxuICAgICAgICBuZXRpZCwgYmxvY2tjaGFpbklELFxuICAgICAgICBuZXcgQk4oYW1udCAqIDEwMDApLCBhc3NldElELFxuICAgICAgICBhZGRyczMsIGFkZHJzMSwgYWRkcnMxLCBcbiAgICAgIClcbiAgICB9KS50b1Rocm93KClcbiAgfSlcblxuICB0ZXN0KCdDcmVhdGlvbiBJbXBvcnRUeCcsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBib21idHg6SW1wb3J0VHggPSBuZXcgSW1wb3J0VHgoXG4gICAgICBuZXRpZCwgYmxvY2tjaGFpbklELCBvdXRwdXRzLCBpbnB1dHMsIG5ldyBVVEY4UGF5bG9hZChcImhlbGxvIHdvcmxkXCIpLmdldFBheWxvYWQoKSwgdW5kZWZpbmVkLCBpbXBvcnRJbnNcbiAgICApXG5cbiAgICBleHBlY3QoKCk6IHZvaWQgPT4ge1xuICAgICAgYm9tYnR4LnRvQnVmZmVyKClcbiAgICB9KS50b1Rocm93KClcblxuICAgIGNvbnN0IGltcG9ydHR4OkltcG9ydFR4ID0gbmV3IEltcG9ydFR4KFxuICAgICAgbmV0aWQsIGJsb2NrY2hhaW5JRCwgIG91dHB1dHMsIGlucHV0cywgbmV3IFVURjhQYXlsb2FkKFwiaGVsbG8gd29ybGRcIikuZ2V0UGF5bG9hZCgpLCBiaW50b29scy5jYjU4RGVjb2RlKFBsYXRmb3JtQ2hhaW5JRCksIGltcG9ydEluc1xuICAgIClcbiAgICBjb25zdCB0eHVuZXc6IEltcG9ydFR4ID0gbmV3IEltcG9ydFR4KClcbiAgICBjb25zdCBpbXBvcnRidWZmOiBCdWZmZXIgPSBpbXBvcnR0eC50b0J1ZmZlcigpXG4gICAgdHh1bmV3LmZyb21CdWZmZXIoaW1wb3J0YnVmZilcblxuICAgIGV4cGVjdCh0eHVuZXcudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpLnRvQmUoaW1wb3J0YnVmZi50b1N0cmluZygnaGV4JykpXG4gICAgZXhwZWN0KHR4dW5ldy50b1N0cmluZygpKS50b0JlKGltcG9ydHR4LnRvU3RyaW5nKCkpXG4gICAgZXhwZWN0KGltcG9ydHR4LmdldEltcG9ydElucHV0cygpLmxlbmd0aCkudG9CZShpbXBvcnRJbnMubGVuZ3RoKVxuICB9KVxuXG4gIHRlc3QoJ0NyZWF0aW9uIEV4cG9ydFR4JywgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGJvbWJ0eDpFeHBvcnRUeCA9IG5ldyBFeHBvcnRUeChcbiAgICAgIG5ldGlkLCBibG9ja2NoYWluSUQsIG91dHB1dHMsIGlucHV0cywgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGV4cG9ydE91dHNcbiAgICApXG5cbiAgICBleHBlY3QoKCk6IHZvaWQgPT4ge1xuICAgICAgYm9tYnR4LnRvQnVmZmVyKClcbiAgICB9KS50b1Rocm93KClcblxuICAgIGNvbnN0IGV4cG9ydHR4OkV4cG9ydFR4ID0gbmV3IEV4cG9ydFR4KFxuICAgICAgbmV0aWQsIGJsb2NrY2hhaW5JRCwgb3V0cHV0cywgaW5wdXRzLCB1bmRlZmluZWQsIGJpbnRvb2xzLmNiNThEZWNvZGUoUGxhdGZvcm1DaGFpbklEKSwgZXhwb3J0T3V0c1xuICAgIClcbiAgICBjb25zdCB0eHVuZXc6IEV4cG9ydFR4ID0gbmV3IEV4cG9ydFR4KClcbiAgICBjb25zdCBleHBvcnRidWZmOiBCdWZmZXIgPSBleHBvcnR0eC50b0J1ZmZlcigpXG4gICAgdHh1bmV3LmZyb21CdWZmZXIoZXhwb3J0YnVmZilcblxuICAgIGV4cGVjdCh0eHVuZXcudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpLnRvQmUoZXhwb3J0YnVmZi50b1N0cmluZygnaGV4JykpXG4gICAgZXhwZWN0KHR4dW5ldy50b1N0cmluZygpKS50b0JlKGV4cG9ydHR4LnRvU3RyaW5nKCkpXG4gICAgZXhwZWN0KGV4cG9ydHR4LmdldEV4cG9ydE91dHB1dHMoKS5sZW5ndGgpLnRvQmUoZXhwb3J0T3V0cy5sZW5ndGgpXG4gIH0pXG5cbiAgdGVzdCgnQ3JlYXRpb24gVHgxIHdpdGggYXNvZiwgbG9ja3RpbWUsIHRocmVzaG9sZCcsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCB0eHU6VW5zaWduZWRUeCA9IHNldC5idWlsZEJhc2VUeChcbiAgICAgIG5ldGlkLCBibG9ja2NoYWluSUQsXG4gICAgICBuZXcgQk4oOTAwMCksIGFzc2V0SUQsIGFkZHJzMywgYWRkcnMxLCBhZGRyczEsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsXG4gICAgICBVbml4Tm93KCksIFVuaXhOb3coKS5hZGQobmV3IEJOKDUwKSksIDEsXG4gICAgKVxuICAgIGNvbnN0IHR4OiBUeCA9IHR4dS5zaWduKGtleW1ncjEpXG5cbiAgICBjb25zdCB0eDI6IFR4ID0gbmV3IFR4KClcbiAgICB0eDIuZnJvbVN0cmluZyh0eC50b1N0cmluZygpKVxuICAgIGV4cGVjdCh0eDIudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpLnRvQmUodHgudG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpXG4gICAgZXhwZWN0KHR4Mi50b1N0cmluZygpKS50b0JlKHR4LnRvU3RyaW5nKCkpXG4gIH0pXG4gIHRlc3QoJ0NyZWF0aW9uIFR4MiB3aXRob3V0IGFzb2YsIGxvY2t0aW1lLCB0aHJlc2hvbGQnLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3QgdHh1OlVuc2lnbmVkVHggPSBzZXQuYnVpbGRCYXNlVHgoXG4gICAgICBuZXRpZCwgYmxvY2tjaGFpbklELFxuICAgICAgbmV3IEJOKDkwMDApLCBhc3NldElELFxuICAgICAgYWRkcnMzLCBhZGRyczEsIGFkZHJzMVxuICAgIClcbiAgICBjb25zdCB0eDogVHggPSB0eHUuc2lnbihrZXltZ3IxKVxuICAgIGNvbnN0IHR4MjogVHggPSBuZXcgVHgoKVxuICAgIHR4Mi5mcm9tQnVmZmVyKHR4LnRvQnVmZmVyKCkpXG4gICAgZXhwZWN0KHR4Mi50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSkudG9CZSh0eC50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSlcbiAgICBleHBlY3QodHgyLnRvU3RyaW5nKCkpLnRvQmUodHgudG9TdHJpbmcoKSlcbiAgfSlcblxuICB0ZXN0KCdDcmVhdGlvbiBUeDQgdXNpbmcgSW1wb3J0VHgnLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3QgdHh1OlVuc2lnbmVkVHggPSBzZXQuYnVpbGRJbXBvcnRUeChcbiAgICAgIG5ldGlkLCBibG9ja2NoYWluSUQsIGFkZHJzMywgYWRkcnMxLCBhZGRyczIsIGltcG9ydFVUWE9zLCBiaW50b29scy5jYjU4RGVjb2RlKFBsYXRmb3JtQ2hhaW5JRCksIG5ldyBCTig5MCksIGFzc2V0SUQsXG4gICAgICBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKS5nZXRQYXlsb2FkKCksIFVuaXhOb3coKSlcbiAgICBjb25zdCB0eDogVHggPSB0eHUuc2lnbihrZXltZ3IxKVxuICAgIGNvbnN0IHR4MjogVHggPSBuZXcgVHgoKVxuICAgIHR4Mi5mcm9tQnVmZmVyKHR4LnRvQnVmZmVyKCkpXG4gICAgZXhwZWN0KHR4Mi50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSkudG9CZSh0eC50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSlcbiAgfSlcblxuICB0ZXN0KCdDcmVhdGlvbiBUeDUgdXNpbmcgRXhwb3J0VHgnLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3QgdHh1OlVuc2lnbmVkVHggPSBzZXQuYnVpbGRFeHBvcnRUeChcbiAgICAgIG5ldGlkLCBibG9ja2NoYWluSUQsIG5ldyBCTig5MCksIGF2YXhBc3NldElELFxuICAgICAgYWRkcnMzLCBhZGRyczEsIGFkZHJzMiwgYmludG9vbHMuY2I1OERlY29kZShQbGF0Zm9ybUNoYWluSUQpLCBcbiAgICAgIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBuZXcgVVRGOFBheWxvYWQoXCJoZWxsbyB3b3JsZFwiKS5nZXRQYXlsb2FkKCksIFVuaXhOb3coKVxuICAgIClcbiAgICBjb25zdCB0eDogVHggPSB0eHUuc2lnbihrZXltZ3IxKVxuICAgIGNvbnN0IHR4MjogVHggPSBuZXcgVHgoKVxuICAgIHR4Mi5mcm9tQnVmZmVyKHR4LnRvQnVmZmVyKCkpXG4gICAgZXhwZWN0KHR4LnRvQnVmZmVyKCkudG9TdHJpbmcoJ2hleCcpKS50b0JlKHR4Mi50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSlcbiAgfSlcbn0pXG4iXX0=