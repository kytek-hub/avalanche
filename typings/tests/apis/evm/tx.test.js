"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const evm_1 = require("src/apis/evm");
const constants_1 = require("src/utils/constants");
const constants_2 = require("../../../src/utils/constants");
const evm_2 = require("src/apis/evm");
const bn_js_1 = __importDefault(require("bn.js"));
const src_1 = require("src");
const networkID = 12345;
const cHexAddress1 = "0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC";
const bintools = src_1.BinTools.getInstance();
const cHexAddress2 = "0xecC3B2968B277b837a81A7181e0b94EB1Ca54EdE";
const antAssetID = "F4MyJcUvq3Rxbqgd4Zs8sUpvwLHApyrp4yxJXe2bAV86Vvp38";
const avaxAssetID = constants_1.Defaults.network[networkID].X.avaxAssetID;
const txID = "QVb7DtKjcwVYLFWHgnGSdzQtQSc29KeRBYFNCBnbFu6dFqX7z";
const blockchainID = constants_1.Defaults.network[networkID].C.blockchainID;
const sourcechainID = constants_1.Defaults.network[networkID].X.blockchainID;
let evmOutputs;
let importedIns;
const fee = constants_1.Defaults.network[networkID].C.txFee;
beforeEach(() => {
    evmOutputs = [];
    importedIns = [];
});
describe('EVM Transactions', () => {
    describe('ImportTx', () => {
        test("Multiple AVAX EVMOutput fail", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(constants_2.ONEAVAX);
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(avaxAssetID), input);
            importedIns.push(xferin);
            // Creating 2 outputs with the same address and AVAX assetID is invalid
            let evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEAVAX, avaxAssetID);
            evmOutputs.push(evmOutput);
            evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEAVAX, avaxAssetID);
            evmOutputs.push(evmOutput);
            expect(() => {
                new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs);
            }).toThrow("Error - ImportTx: duplicate (address, assetId) pair found in outputs: (0x8db97c7cece249c2b98bdc0226cc4c2a57bf52fc, 2fombhL7aGPwj3KH4bfrmJwW6PVnMobf9Y2fn9GwxiAAJyFDbe)");
        });
        test("Multiple AVAX EVMOutput success", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(constants_2.ONEAVAX);
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(avaxAssetID), input);
            importedIns.push(xferin);
            // Creating 2 outputs with different addresses valid
            let evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEAVAX.div(new bn_js_1.default(3)), avaxAssetID);
            evmOutputs.push(evmOutput);
            evmOutput = new evm_2.EVMOutput(cHexAddress2, constants_2.ONEAVAX.div(new bn_js_1.default(3)), avaxAssetID);
            evmOutputs.push(evmOutput);
            const importTx = new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs);
            expect(importTx).toBeInstanceOf(evm_1.ImportTx);
        });
        test("Multiple ANT EVMOutput fail", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(new bn_js_1.default(507));
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(avaxAssetID), input);
            importedIns.push(xferin);
            // Creating 2 outputs with the same address and ANT assetID is invalid
            let evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEAVAX, antAssetID);
            evmOutputs.push(evmOutput);
            evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEAVAX, antAssetID);
            evmOutputs.push(evmOutput);
            expect(() => {
                new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs);
            }).toThrow("Error - ImportTx: duplicate (address, assetId) pair found in outputs: (0x8db97c7cece249c2b98bdc0226cc4c2a57bf52fc, F4MyJcUvq3Rxbqgd4Zs8sUpvwLHApyrp4yxJXe2bAV86Vvp38)");
        });
        test("Multiple ANT EVMOutput success", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(fee);
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(avaxAssetID), input);
            importedIns.push(xferin);
            let evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEAVAX, antAssetID);
            evmOutputs.push(evmOutput);
            evmOutput = new evm_2.EVMOutput(cHexAddress2, constants_2.ONEAVAX, antAssetID);
            evmOutputs.push(evmOutput);
            const importTx = new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs);
            expect(importTx).toBeInstanceOf(evm_1.ImportTx);
        });
        test("Single ANT EVMOutput fail", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(new bn_js_1.default(0));
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(avaxAssetID), input);
            importedIns.push(xferin);
            // If the output is a non-avax assetID then don't subtract a fee
            const evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEAVAX, antAssetID);
            evmOutputs.push(evmOutput);
            expect(() => {
                new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs);
            }).toThrow("Error - 1000000 AVAX required for fee and only 0 AVAX provided");
        });
        test("Single ANT EVMOutput success", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(constants_2.ONEAVAX);
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(avaxAssetID), input);
            importedIns.push(xferin);
            const evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEAVAX, antAssetID);
            evmOutputs.push(evmOutput);
            const importTx = new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs);
            expect(importTx).toBeInstanceOf(evm_1.ImportTx);
        });
        test("Single AVAX EVMOutput fail", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(new bn_js_1.default(507));
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(avaxAssetID), input);
            importedIns.push(xferin);
            const evmOutput = new evm_2.EVMOutput(cHexAddress1, new bn_js_1.default(0), avaxAssetID);
            evmOutputs.push(evmOutput);
            expect(() => {
                new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs);
            }).toThrow("Error - 1000000 AVAX required for fee and only 507 AVAX provided");
        });
        test("Single AVAX EVMOutput success", () => {
            const outputidx = src_1.Buffer.from("");
            const input = new evm_1.SECPTransferInput(constants_2.ONEAVAX);
            const xferin = new evm_1.TransferableInput(bintools.cb58Decode(txID), outputidx, bintools.cb58Decode(avaxAssetID), input);
            importedIns.push(xferin);
            const evmOutput = new evm_2.EVMOutput(cHexAddress1, constants_2.ONEAVAX.sub(constants_1.MILLIAVAX), avaxAssetID);
            evmOutputs.push(evmOutput);
            const importTx = new evm_1.ImportTx(networkID, bintools.cb58Decode(blockchainID), bintools.cb58Decode(sourcechainID), importedIns, evmOutputs);
            expect(importTx).toBeInstanceOf(evm_1.ImportTx);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHgudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3RzL2FwaXMvZXZtL3R4LnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxzQ0FJcUI7QUFDckIsbURBQXlEO0FBQ3pELDREQUFzRDtBQUN0RCxzQ0FBd0M7QUFDeEMsa0RBQXNCO0FBQ3RCLDZCQUdZO0FBQ1osTUFBTSxTQUFTLEdBQVcsS0FBSyxDQUFBO0FBQy9CLE1BQU0sWUFBWSxHQUFXLDRDQUE0QyxDQUFBO0FBQ3pFLE1BQU0sUUFBUSxHQUFhLGNBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLFlBQVksR0FBVyw0Q0FBNEMsQ0FBQTtBQUN6RSxNQUFNLFVBQVUsR0FBVyxtREFBbUQsQ0FBQTtBQUM5RSxNQUFNLFdBQVcsR0FBVyxvQkFBUSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFBO0FBQ3JFLE1BQU0sSUFBSSxHQUFXLG1EQUFtRCxDQUFBO0FBQ3hFLE1BQU0sWUFBWSxHQUFXLG9CQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUE7QUFDdkUsTUFBTSxhQUFhLEdBQVcsb0JBQVEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQTtBQUN4RSxJQUFJLFVBQXVCLENBQUE7QUFDM0IsSUFBSSxXQUFnQyxDQUFBO0FBQ3BDLE1BQU0sR0FBRyxHQUFPLG9CQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7QUFFbkQsVUFBVSxDQUFDLEdBQVMsRUFBRTtJQUNwQixVQUFVLEdBQUcsRUFBRSxDQUFBO0lBQ2YsV0FBVyxHQUFHLEVBQUUsQ0FBQTtBQUNsQixDQUFDLENBQUMsQ0FBQTtBQUVGLFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7SUFDaEMsUUFBUSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7UUFDeEIsSUFBSSxDQUFDLDhCQUE4QixFQUFFLEdBQVMsRUFBRTtZQUM5QyxNQUFNLFNBQVMsR0FBVyxZQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ3pDLE1BQU0sS0FBSyxHQUFzQixJQUFJLHVCQUFpQixDQUFDLG1CQUFPLENBQUMsQ0FBQTtZQUMvRCxNQUFNLE1BQU0sR0FBc0IsSUFBSSx1QkFBaUIsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO1lBQ3RJLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7WUFDeEIsdUVBQXVFO1lBQ3ZFLElBQUksU0FBUyxHQUFjLElBQUksZUFBUyxDQUFDLFlBQVksRUFBRSxtQkFBTyxFQUFFLFdBQVcsQ0FBQyxDQUFBO1lBQzVFLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDMUIsU0FBUyxHQUFHLElBQUksZUFBUyxDQUFDLFlBQVksRUFBRSxtQkFBTyxFQUFFLFdBQVcsQ0FBQyxDQUFBO1lBQzdELFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7WUFFMUIsTUFBTSxDQUFDLEdBQVMsRUFBRTtnQkFDaEIsSUFBSSxjQUFRLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUE7WUFDekgsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLHdLQUF3SyxDQUFDLENBQUE7UUFDdEwsQ0FBQyxDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsaUNBQWlDLEVBQUUsR0FBUyxFQUFFO1lBQ2pELE1BQU0sU0FBUyxHQUFXLFlBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDekMsTUFBTSxLQUFLLEdBQXNCLElBQUksdUJBQWlCLENBQUMsbUJBQU8sQ0FBQyxDQUFBO1lBQy9ELE1BQU0sTUFBTSxHQUFzQixJQUFJLHVCQUFpQixDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDdEksV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUN4QixvREFBb0Q7WUFDcEQsSUFBSSxTQUFTLEdBQWMsSUFBSSxlQUFTLENBQUMsWUFBWSxFQUFFLG1CQUFPLENBQUMsR0FBRyxDQUFDLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUE7WUFDM0YsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUMxQixTQUFTLEdBQUcsSUFBSSxlQUFTLENBQUMsWUFBWSxFQUFFLG1CQUFPLENBQUMsR0FBRyxDQUFDLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUE7WUFDNUUsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUUxQixNQUFNLFFBQVEsR0FBYSxJQUFJLGNBQVEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQTtZQUNsSixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsY0FBYyxDQUFDLGNBQVEsQ0FBQyxDQUFBO1FBQzNDLENBQUMsQ0FBQyxDQUFBO1FBRUYsSUFBSSxDQUFDLDZCQUE2QixFQUFFLEdBQVMsRUFBRTtZQUM3QyxNQUFNLFNBQVMsR0FBVyxZQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ3pDLE1BQU0sS0FBSyxHQUFzQixJQUFJLHVCQUFpQixDQUFDLElBQUksZUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7WUFDbkUsTUFBTSxNQUFNLEdBQXNCLElBQUksdUJBQWlCLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQTtZQUN0SSxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQ3hCLHNFQUFzRTtZQUN0RSxJQUFJLFNBQVMsR0FBYyxJQUFJLGVBQVMsQ0FBQyxZQUFZLEVBQUUsbUJBQU8sRUFBRSxVQUFVLENBQUMsQ0FBQTtZQUMzRSxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQzFCLFNBQVMsR0FBRyxJQUFJLGVBQVMsQ0FBQyxZQUFZLEVBQUUsbUJBQU8sRUFBRSxVQUFVLENBQUMsQ0FBQTtZQUM1RCxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQzFCLE1BQU0sQ0FBQyxHQUFTLEVBQUU7Z0JBQ2hCLElBQUksY0FBUSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFBO1lBQ3pILENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyx1S0FBdUssQ0FBQyxDQUFBO1FBQ3JMLENBQUMsQ0FBQyxDQUFBO1FBRUYsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLEdBQVMsRUFBRTtZQUNoRCxNQUFNLFNBQVMsR0FBVyxZQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ3pDLE1BQU0sS0FBSyxHQUFzQixJQUFJLHVCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQzNELE1BQU0sTUFBTSxHQUFzQixJQUFJLHVCQUFpQixDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDdEksV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUN4QixJQUFJLFNBQVMsR0FBYyxJQUFJLGVBQVMsQ0FBQyxZQUFZLEVBQUUsbUJBQU8sRUFBRSxVQUFVLENBQUMsQ0FBQTtZQUMzRSxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQzFCLFNBQVMsR0FBRyxJQUFJLGVBQVMsQ0FBQyxZQUFZLEVBQUUsbUJBQU8sRUFBRSxVQUFVLENBQUMsQ0FBQTtZQUM1RCxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBRTFCLE1BQU0sUUFBUSxHQUFhLElBQUksY0FBUSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFBO1lBQ2xKLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxjQUFjLENBQUMsY0FBUSxDQUFDLENBQUE7UUFDM0MsQ0FBQyxDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsMkJBQTJCLEVBQUUsR0FBUyxFQUFFO1lBQzNDLE1BQU0sU0FBUyxHQUFXLFlBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDekMsTUFBTSxLQUFLLEdBQXNCLElBQUksdUJBQWlCLENBQUMsSUFBSSxlQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUNqRSxNQUFNLE1BQU0sR0FBc0IsSUFBSSx1QkFBaUIsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO1lBQ3RJLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7WUFFeEIsZ0VBQWdFO1lBQ2hFLE1BQU0sU0FBUyxHQUFjLElBQUksZUFBUyxDQUFDLFlBQVksRUFBRSxtQkFBTyxFQUFFLFVBQVUsQ0FBQyxDQUFBO1lBQzdFLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDMUIsTUFBTSxDQUFDLEdBQVMsRUFBRTtnQkFDaEIsSUFBSSxjQUFRLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUE7WUFDekgsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGdFQUFnRSxDQUFDLENBQUE7UUFDOUUsQ0FBQyxDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsOEJBQThCLEVBQUUsR0FBUyxFQUFFO1lBQzlDLE1BQU0sU0FBUyxHQUFXLFlBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDekMsTUFBTSxLQUFLLEdBQXNCLElBQUksdUJBQWlCLENBQUMsbUJBQU8sQ0FBQyxDQUFBO1lBQy9ELE1BQU0sTUFBTSxHQUFzQixJQUFJLHVCQUFpQixDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDdEksV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUN4QixNQUFNLFNBQVMsR0FBYyxJQUFJLGVBQVMsQ0FBQyxZQUFZLEVBQUUsbUJBQU8sRUFBRSxVQUFVLENBQUMsQ0FBQTtZQUM3RSxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQzFCLE1BQU0sUUFBUSxHQUFhLElBQUksY0FBUSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFBO1lBQ2xKLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxjQUFjLENBQUMsY0FBUSxDQUFDLENBQUE7UUFDM0MsQ0FBQyxDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsNEJBQTRCLEVBQUUsR0FBUyxFQUFFO1lBQzVDLE1BQU0sU0FBUyxHQUFXLFlBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDekMsTUFBTSxLQUFLLEdBQXNCLElBQUksdUJBQWlCLENBQUMsSUFBSSxlQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtZQUNuRSxNQUFNLE1BQU0sR0FBc0IsSUFBSSx1QkFBaUIsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO1lBQ3RJLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7WUFFeEIsTUFBTSxTQUFTLEdBQWMsSUFBSSxlQUFTLENBQUMsWUFBWSxFQUFFLElBQUksZUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFBO1lBQ2hGLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDMUIsTUFBTSxDQUFDLEdBQVMsRUFBRTtnQkFDaEIsSUFBSSxjQUFRLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUE7WUFDekgsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGtFQUFrRSxDQUFDLENBQUE7UUFDaEYsQ0FBQyxDQUFDLENBQUE7UUFFRixJQUFJLENBQUMsK0JBQStCLEVBQUUsR0FBUyxFQUFFO1lBQy9DLE1BQU0sU0FBUyxHQUFXLFlBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7WUFDekMsTUFBTSxLQUFLLEdBQXNCLElBQUksdUJBQWlCLENBQUMsbUJBQU8sQ0FBQyxDQUFBO1lBQy9ELE1BQU0sTUFBTSxHQUFzQixJQUFJLHVCQUFpQixDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7WUFDdEksV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUN4QixNQUFNLFNBQVMsR0FBYyxJQUFJLGVBQVMsQ0FBQyxZQUFZLEVBQUUsbUJBQU8sQ0FBQyxHQUFHLENBQUMscUJBQVMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFBO1lBQzdGLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDMUIsTUFBTSxRQUFRLEdBQWEsSUFBSSxjQUFRLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLEVBQUUsUUFBUSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUE7WUFDbEosTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxjQUFRLENBQUMsQ0FBQTtRQUMzQyxDQUFDLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBcbiAgSW1wb3J0VHgsIFxuICBTRUNQVHJhbnNmZXJJbnB1dCwgXG4gIFRyYW5zZmVyYWJsZUlucHV0IFxufSBmcm9tICdzcmMvYXBpcy9ldm0nXG5pbXBvcnQgeyBEZWZhdWx0cywgTUlMTElBVkFYIH0gZnJvbSAnc3JjL3V0aWxzL2NvbnN0YW50cydcbmltcG9ydCB7IE9ORUFWQVggfSBmcm9tICcuLi8uLi8uLi9zcmMvdXRpbHMvY29uc3RhbnRzJ1xuaW1wb3J0IHsgRVZNT3V0cHV0IH0gZnJvbSAnc3JjL2FwaXMvZXZtJ1xuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiXG5pbXBvcnQgeyBcbiAgQmluVG9vbHMsXG4gIEJ1ZmZlciBcbn0gZnJvbSAnc3JjJ1xuY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSAxMjM0NVxuY29uc3QgY0hleEFkZHJlc3MxOiBzdHJpbmcgPSBcIjB4OGRiOTdDN2NFY0UyNDljMmI5OGJEQzAyMjZDYzRDMkE1N0JGNTJGQ1wiXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBjSGV4QWRkcmVzczI6IHN0cmluZyA9IFwiMHhlY0MzQjI5NjhCMjc3YjgzN2E4MUE3MTgxZTBiOTRFQjFDYTU0RWRFXCJcbmNvbnN0IGFudEFzc2V0SUQ6IHN0cmluZyA9IFwiRjRNeUpjVXZxM1J4YnFnZDRaczhzVXB2d0xIQXB5cnA0eXhKWGUyYkFWODZWdnAzOFwiXG5jb25zdCBhdmF4QXNzZXRJRDogc3RyaW5nID0gRGVmYXVsdHMubmV0d29ya1tuZXR3b3JrSURdLlguYXZheEFzc2V0SURcbmNvbnN0IHR4SUQ6IHN0cmluZyA9IFwiUVZiN0R0S2pjd1ZZTEZXSGduR1NkelF0UVNjMjlLZVJCWUZOQ0JuYkZ1NmRGcVg3elwiXG5jb25zdCBibG9ja2NoYWluSUQ6IHN0cmluZyA9IERlZmF1bHRzLm5ldHdvcmtbbmV0d29ya0lEXS5DLmJsb2NrY2hhaW5JRFxuY29uc3Qgc291cmNlY2hhaW5JRDogc3RyaW5nID0gRGVmYXVsdHMubmV0d29ya1tuZXR3b3JrSURdLlguYmxvY2tjaGFpbklEXG5sZXQgZXZtT3V0cHV0czogRVZNT3V0cHV0W11cbmxldCBpbXBvcnRlZEluczogVHJhbnNmZXJhYmxlSW5wdXRbXVxuY29uc3QgZmVlOiBCTiA9IERlZmF1bHRzLm5ldHdvcmtbbmV0d29ya0lEXS5DLnR4RmVlXG5cbmJlZm9yZUVhY2goKCk6IHZvaWQgPT4ge1xuICBldm1PdXRwdXRzID0gW11cbiAgaW1wb3J0ZWRJbnMgPSBbXVxufSlcblxuZGVzY3JpYmUoJ0VWTSBUcmFuc2FjdGlvbnMnLCAoKSA9PiB7XG4gIGRlc2NyaWJlKCdJbXBvcnRUeCcsICgpID0+IHtcbiAgICB0ZXN0KFwiTXVsdGlwbGUgQVZBWCBFVk1PdXRwdXQgZmFpbFwiLCAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCBvdXRwdXRpZHg6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKFwiXCIpXG4gICAgICBjb25zdCBpbnB1dDogU0VDUFRyYW5zZmVySW5wdXQgPSBuZXcgU0VDUFRyYW5zZmVySW5wdXQoT05FQVZBWClcbiAgICAgIGNvbnN0IHhmZXJpbjogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQoYmludG9vbHMuY2I1OERlY29kZSh0eElEKSwgb3V0cHV0aWR4LCBiaW50b29scy5jYjU4RGVjb2RlKGF2YXhBc3NldElEKSwgaW5wdXQpXG4gICAgICBpbXBvcnRlZElucy5wdXNoKHhmZXJpbilcbiAgICAgIC8vIENyZWF0aW5nIDIgb3V0cHV0cyB3aXRoIHRoZSBzYW1lIGFkZHJlc3MgYW5kIEFWQVggYXNzZXRJRCBpcyBpbnZhbGlkXG4gICAgICBsZXQgZXZtT3V0cHV0OiBFVk1PdXRwdXQgPSBuZXcgRVZNT3V0cHV0KGNIZXhBZGRyZXNzMSwgT05FQVZBWCwgYXZheEFzc2V0SUQpXG4gICAgICBldm1PdXRwdXRzLnB1c2goZXZtT3V0cHV0KVxuICAgICAgZXZtT3V0cHV0ID0gbmV3IEVWTU91dHB1dChjSGV4QWRkcmVzczEsIE9ORUFWQVgsIGF2YXhBc3NldElEKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcblxuICAgICAgZXhwZWN0KCgpOiB2b2lkID0+IHtcbiAgICAgICAgbmV3IEltcG9ydFR4KG5ldHdvcmtJRCwgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLCBiaW50b29scy5jYjU4RGVjb2RlKHNvdXJjZWNoYWluSUQpLCBpbXBvcnRlZElucywgZXZtT3V0cHV0cylcbiAgICAgIH0pLnRvVGhyb3coXCJFcnJvciAtIEltcG9ydFR4OiBkdXBsaWNhdGUgKGFkZHJlc3MsIGFzc2V0SWQpIHBhaXIgZm91bmQgaW4gb3V0cHV0czogKDB4OGRiOTdjN2NlY2UyNDljMmI5OGJkYzAyMjZjYzRjMmE1N2JmNTJmYywgMmZvbWJoTDdhR1B3ajNLSDRiZnJtSndXNlBWbk1vYmY5WTJmbjlHd3hpQUFKeUZEYmUpXCIpXG4gICAgfSlcblxuICAgIHRlc3QoXCJNdWx0aXBsZSBBVkFYIEVWTU91dHB1dCBzdWNjZXNzXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGNvbnN0IG91dHB1dGlkeDogQnVmZmVyID0gQnVmZmVyLmZyb20oXCJcIilcbiAgICAgIGNvbnN0IGlucHV0OiBTRUNQVHJhbnNmZXJJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChPTkVBVkFYKVxuICAgICAgY29uc3QgeGZlcmluOiBUcmFuc2ZlcmFibGVJbnB1dCA9IG5ldyBUcmFuc2ZlcmFibGVJbnB1dChiaW50b29scy5jYjU4RGVjb2RlKHR4SUQpLCBvdXRwdXRpZHgsIGJpbnRvb2xzLmNiNThEZWNvZGUoYXZheEFzc2V0SUQpLCBpbnB1dClcbiAgICAgIGltcG9ydGVkSW5zLnB1c2goeGZlcmluKVxuICAgICAgLy8gQ3JlYXRpbmcgMiBvdXRwdXRzIHdpdGggZGlmZmVyZW50IGFkZHJlc3NlcyB2YWxpZFxuICAgICAgbGV0IGV2bU91dHB1dDogRVZNT3V0cHV0ID0gbmV3IEVWTU91dHB1dChjSGV4QWRkcmVzczEsIE9ORUFWQVguZGl2KG5ldyBCTigzKSksIGF2YXhBc3NldElEKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcbiAgICAgIGV2bU91dHB1dCA9IG5ldyBFVk1PdXRwdXQoY0hleEFkZHJlc3MyLCBPTkVBVkFYLmRpdihuZXcgQk4oMykpLCBhdmF4QXNzZXRJRClcbiAgICAgIGV2bU91dHB1dHMucHVzaChldm1PdXRwdXQpXG5cbiAgICAgIGNvbnN0IGltcG9ydFR4OiBJbXBvcnRUeCA9IG5ldyBJbXBvcnRUeChuZXR3b3JrSUQsIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSwgYmludG9vbHMuY2I1OERlY29kZShzb3VyY2VjaGFpbklEKSwgaW1wb3J0ZWRJbnMsIGV2bU91dHB1dHMpXG4gICAgICBleHBlY3QoaW1wb3J0VHgpLnRvQmVJbnN0YW5jZU9mKEltcG9ydFR4KVxuICAgIH0pXG5cbiAgICB0ZXN0KFwiTXVsdGlwbGUgQU5UIEVWTU91dHB1dCBmYWlsXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGNvbnN0IG91dHB1dGlkeDogQnVmZmVyID0gQnVmZmVyLmZyb20oXCJcIilcbiAgICAgIGNvbnN0IGlucHV0OiBTRUNQVHJhbnNmZXJJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChuZXcgQk4oNTA3KSlcbiAgICAgIGNvbnN0IHhmZXJpbjogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQoYmludG9vbHMuY2I1OERlY29kZSh0eElEKSwgb3V0cHV0aWR4LCBiaW50b29scy5jYjU4RGVjb2RlKGF2YXhBc3NldElEKSwgaW5wdXQpXG4gICAgICBpbXBvcnRlZElucy5wdXNoKHhmZXJpbilcbiAgICAgIC8vIENyZWF0aW5nIDIgb3V0cHV0cyB3aXRoIHRoZSBzYW1lIGFkZHJlc3MgYW5kIEFOVCBhc3NldElEIGlzIGludmFsaWRcbiAgICAgIGxldCBldm1PdXRwdXQ6IEVWTU91dHB1dCA9IG5ldyBFVk1PdXRwdXQoY0hleEFkZHJlc3MxLCBPTkVBVkFYLCBhbnRBc3NldElEKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcbiAgICAgIGV2bU91dHB1dCA9IG5ldyBFVk1PdXRwdXQoY0hleEFkZHJlc3MxLCBPTkVBVkFYLCBhbnRBc3NldElEKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcbiAgICAgIGV4cGVjdCgoKTogdm9pZCA9PiB7XG4gICAgICAgIG5ldyBJbXBvcnRUeChuZXR3b3JrSUQsIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSwgYmludG9vbHMuY2I1OERlY29kZShzb3VyY2VjaGFpbklEKSwgaW1wb3J0ZWRJbnMsIGV2bU91dHB1dHMpXG4gICAgICB9KS50b1Rocm93KFwiRXJyb3IgLSBJbXBvcnRUeDogZHVwbGljYXRlIChhZGRyZXNzLCBhc3NldElkKSBwYWlyIGZvdW5kIGluIG91dHB1dHM6ICgweDhkYjk3YzdjZWNlMjQ5YzJiOThiZGMwMjI2Y2M0YzJhNTdiZjUyZmMsIEY0TXlKY1V2cTNSeGJxZ2Q0WnM4c1VwdndMSEFweXJwNHl4SlhlMmJBVjg2VnZwMzgpXCIpXG4gICAgfSlcblxuICAgIHRlc3QoXCJNdWx0aXBsZSBBTlQgRVZNT3V0cHV0IHN1Y2Nlc3NcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3Qgb3V0cHV0aWR4OiBCdWZmZXIgPSBCdWZmZXIuZnJvbShcIlwiKVxuICAgICAgY29uc3QgaW5wdXQ6IFNFQ1BUcmFuc2ZlcklucHV0ID0gbmV3IFNFQ1BUcmFuc2ZlcklucHV0KGZlZSlcbiAgICAgIGNvbnN0IHhmZXJpbjogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQoYmludG9vbHMuY2I1OERlY29kZSh0eElEKSwgb3V0cHV0aWR4LCBiaW50b29scy5jYjU4RGVjb2RlKGF2YXhBc3NldElEKSwgaW5wdXQpXG4gICAgICBpbXBvcnRlZElucy5wdXNoKHhmZXJpbilcbiAgICAgIGxldCBldm1PdXRwdXQ6IEVWTU91dHB1dCA9IG5ldyBFVk1PdXRwdXQoY0hleEFkZHJlc3MxLCBPTkVBVkFYLCBhbnRBc3NldElEKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcbiAgICAgIGV2bU91dHB1dCA9IG5ldyBFVk1PdXRwdXQoY0hleEFkZHJlc3MyLCBPTkVBVkFYLCBhbnRBc3NldElEKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcblxuICAgICAgY29uc3QgaW1wb3J0VHg6IEltcG9ydFR4ID0gbmV3IEltcG9ydFR4KG5ldHdvcmtJRCwgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLCBiaW50b29scy5jYjU4RGVjb2RlKHNvdXJjZWNoYWluSUQpLCBpbXBvcnRlZElucywgZXZtT3V0cHV0cylcbiAgICAgIGV4cGVjdChpbXBvcnRUeCkudG9CZUluc3RhbmNlT2YoSW1wb3J0VHgpXG4gICAgfSlcblxuICAgIHRlc3QoXCJTaW5nbGUgQU5UIEVWTU91dHB1dCBmYWlsXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGNvbnN0IG91dHB1dGlkeDogQnVmZmVyID0gQnVmZmVyLmZyb20oXCJcIilcbiAgICAgIGNvbnN0IGlucHV0OiBTRUNQVHJhbnNmZXJJbnB1dCA9IG5ldyBTRUNQVHJhbnNmZXJJbnB1dChuZXcgQk4oMCkpXG4gICAgICBjb25zdCB4ZmVyaW46IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KGJpbnRvb2xzLmNiNThEZWNvZGUodHhJRCksIG91dHB1dGlkeCwgYmludG9vbHMuY2I1OERlY29kZShhdmF4QXNzZXRJRCksIGlucHV0KVxuICAgICAgaW1wb3J0ZWRJbnMucHVzaCh4ZmVyaW4pXG5cbiAgICAgIC8vIElmIHRoZSBvdXRwdXQgaXMgYSBub24tYXZheCBhc3NldElEIHRoZW4gZG9uJ3Qgc3VidHJhY3QgYSBmZWVcbiAgICAgIGNvbnN0IGV2bU91dHB1dDogRVZNT3V0cHV0ID0gbmV3IEVWTU91dHB1dChjSGV4QWRkcmVzczEsIE9ORUFWQVgsIGFudEFzc2V0SUQpXG4gICAgICBldm1PdXRwdXRzLnB1c2goZXZtT3V0cHV0KVxuICAgICAgZXhwZWN0KCgpOiB2b2lkID0+IHtcbiAgICAgICAgbmV3IEltcG9ydFR4KG5ldHdvcmtJRCwgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLCBiaW50b29scy5jYjU4RGVjb2RlKHNvdXJjZWNoYWluSUQpLCBpbXBvcnRlZElucywgZXZtT3V0cHV0cylcbiAgICAgIH0pLnRvVGhyb3coXCJFcnJvciAtIDEwMDAwMDAgQVZBWCByZXF1aXJlZCBmb3IgZmVlIGFuZCBvbmx5IDAgQVZBWCBwcm92aWRlZFwiKVxuICAgIH0pXG5cbiAgICB0ZXN0KFwiU2luZ2xlIEFOVCBFVk1PdXRwdXQgc3VjY2Vzc1wiLCAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCBvdXRwdXRpZHg6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKFwiXCIpXG4gICAgICBjb25zdCBpbnB1dDogU0VDUFRyYW5zZmVySW5wdXQgPSBuZXcgU0VDUFRyYW5zZmVySW5wdXQoT05FQVZBWClcbiAgICAgIGNvbnN0IHhmZXJpbjogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQoYmludG9vbHMuY2I1OERlY29kZSh0eElEKSwgb3V0cHV0aWR4LCBiaW50b29scy5jYjU4RGVjb2RlKGF2YXhBc3NldElEKSwgaW5wdXQpXG4gICAgICBpbXBvcnRlZElucy5wdXNoKHhmZXJpbilcbiAgICAgIGNvbnN0IGV2bU91dHB1dDogRVZNT3V0cHV0ID0gbmV3IEVWTU91dHB1dChjSGV4QWRkcmVzczEsIE9ORUFWQVgsIGFudEFzc2V0SUQpXG4gICAgICBldm1PdXRwdXRzLnB1c2goZXZtT3V0cHV0KVxuICAgICAgY29uc3QgaW1wb3J0VHg6IEltcG9ydFR4ID0gbmV3IEltcG9ydFR4KG5ldHdvcmtJRCwgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLCBiaW50b29scy5jYjU4RGVjb2RlKHNvdXJjZWNoYWluSUQpLCBpbXBvcnRlZElucywgZXZtT3V0cHV0cylcbiAgICAgIGV4cGVjdChpbXBvcnRUeCkudG9CZUluc3RhbmNlT2YoSW1wb3J0VHgpXG4gICAgfSlcblxuICAgIHRlc3QoXCJTaW5nbGUgQVZBWCBFVk1PdXRwdXQgZmFpbFwiLCAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCBvdXRwdXRpZHg6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKFwiXCIpXG4gICAgICBjb25zdCBpbnB1dDogU0VDUFRyYW5zZmVySW5wdXQgPSBuZXcgU0VDUFRyYW5zZmVySW5wdXQobmV3IEJOKDUwNykpXG4gICAgICBjb25zdCB4ZmVyaW46IFRyYW5zZmVyYWJsZUlucHV0ID0gbmV3IFRyYW5zZmVyYWJsZUlucHV0KGJpbnRvb2xzLmNiNThEZWNvZGUodHhJRCksIG91dHB1dGlkeCwgYmludG9vbHMuY2I1OERlY29kZShhdmF4QXNzZXRJRCksIGlucHV0KVxuICAgICAgaW1wb3J0ZWRJbnMucHVzaCh4ZmVyaW4pXG5cbiAgICAgIGNvbnN0IGV2bU91dHB1dDogRVZNT3V0cHV0ID0gbmV3IEVWTU91dHB1dChjSGV4QWRkcmVzczEsIG5ldyBCTigwKSwgYXZheEFzc2V0SUQpXG4gICAgICBldm1PdXRwdXRzLnB1c2goZXZtT3V0cHV0KVxuICAgICAgZXhwZWN0KCgpOiB2b2lkID0+IHtcbiAgICAgICAgbmV3IEltcG9ydFR4KG5ldHdvcmtJRCwgYmludG9vbHMuY2I1OERlY29kZShibG9ja2NoYWluSUQpLCBiaW50b29scy5jYjU4RGVjb2RlKHNvdXJjZWNoYWluSUQpLCBpbXBvcnRlZElucywgZXZtT3V0cHV0cylcbiAgICAgIH0pLnRvVGhyb3coXCJFcnJvciAtIDEwMDAwMDAgQVZBWCByZXF1aXJlZCBmb3IgZmVlIGFuZCBvbmx5IDUwNyBBVkFYIHByb3ZpZGVkXCIpXG4gICAgfSlcblxuICAgIHRlc3QoXCJTaW5nbGUgQVZBWCBFVk1PdXRwdXQgc3VjY2Vzc1wiLCAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCBvdXRwdXRpZHg6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKFwiXCIpXG4gICAgICBjb25zdCBpbnB1dDogU0VDUFRyYW5zZmVySW5wdXQgPSBuZXcgU0VDUFRyYW5zZmVySW5wdXQoT05FQVZBWClcbiAgICAgIGNvbnN0IHhmZXJpbjogVHJhbnNmZXJhYmxlSW5wdXQgPSBuZXcgVHJhbnNmZXJhYmxlSW5wdXQoYmludG9vbHMuY2I1OERlY29kZSh0eElEKSwgb3V0cHV0aWR4LCBiaW50b29scy5jYjU4RGVjb2RlKGF2YXhBc3NldElEKSwgaW5wdXQpXG4gICAgICBpbXBvcnRlZElucy5wdXNoKHhmZXJpbilcbiAgICAgIGNvbnN0IGV2bU91dHB1dDogRVZNT3V0cHV0ID0gbmV3IEVWTU91dHB1dChjSGV4QWRkcmVzczEsIE9ORUFWQVguc3ViKE1JTExJQVZBWCksIGF2YXhBc3NldElEKVxuICAgICAgZXZtT3V0cHV0cy5wdXNoKGV2bU91dHB1dClcbiAgICAgIGNvbnN0IGltcG9ydFR4OiBJbXBvcnRUeCA9IG5ldyBJbXBvcnRUeChuZXR3b3JrSUQsIGJpbnRvb2xzLmNiNThEZWNvZGUoYmxvY2tjaGFpbklEKSwgYmludG9vbHMuY2I1OERlY29kZShzb3VyY2VjaGFpbklEKSwgaW1wb3J0ZWRJbnMsIGV2bU91dHB1dHMpXG4gICAgICBleHBlY3QoaW1wb3J0VHgpLnRvQmVJbnN0YW5jZU9mKEltcG9ydFR4KVxuICAgIH0pXG4gIH0pXG59KVxuIl19