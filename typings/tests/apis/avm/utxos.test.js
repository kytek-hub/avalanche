"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("src/utils/bintools"));
const utxos_1 = require("src/apis/avm/utxos");
const helperfunctions_1 = require("src/utils/helperfunctions");
const bintools = bintools_1.default.getInstance();
const display = "display";
describe("UTXO", () => {
    const utxohex = "000038d1b9f1138672da6fb6c35125539276a9acc2a668d63bea6ba3c795e2edb0f5000000013e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd3558000000070000000000004dd500000000000000000000000100000001a36fd0c2dbcab311731dde7ef1514bd26fcdc74d";
    const outputidx = "00000001";
    const outtxid = "38d1b9f1138672da6fb6c35125539276a9acc2a668d63bea6ba3c795e2edb0f5";
    const outaid = "3e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd3558";
    const utxobuff = buffer_1.Buffer.from(utxohex, "hex");
    // Payment
    const OPUTXOstr = bintools.cb58Encode(utxobuff);
    // "U9rFgK5jjdXmV8k5tpqeXkimzrN3o9eCCcXesyhMBBZu9MQJCDTDo5Wn5psKvzJVMJpiMbdkfDXkp7sKZddfCZdxpuDmyNy7VFka19zMW4jcz6DRQvNfA2kvJYKk96zc7uizgp3i2FYWrB8mr1sPJ8oP9Th64GQ5yHd8"
    // implies fromString and fromBuffer
    test("Creation", () => {
        const u1 = new utxos_1.UTXO();
        u1.fromBuffer(utxobuff);
        const u1hex = u1.toBuffer().toString("hex");
        expect(u1hex).toBe(utxohex);
    });
    test("Empty Creation", () => {
        const u1 = new utxos_1.UTXO();
        expect(() => {
            u1.toBuffer();
        }).toThrow();
    });
    test("Creation of Type", () => {
        const op = new utxos_1.UTXO();
        op.fromString(OPUTXOstr);
        expect(op.getOutput().getOutputID()).toBe(7);
    });
    describe("Funtionality", () => {
        const u1 = new utxos_1.UTXO();
        u1.fromBuffer(utxobuff);
        test("getAssetID NonCA", () => {
            const assetID = u1.getAssetID();
            expect(assetID.toString("hex", 0, assetID.length)).toBe(outaid);
        });
        test("getTxID", () => {
            const txid = u1.getTxID();
            expect(txid.toString("hex", 0, txid.length)).toBe(outtxid);
        });
        test("getOutputIdx", () => {
            const txidx = u1.getOutputIdx();
            expect(txidx.toString("hex", 0, txidx.length)).toBe(outputidx);
        });
        test("getUTXOID", () => {
            const txid = buffer_1.Buffer.from(outtxid, "hex");
            const txidx = buffer_1.Buffer.from(outputidx, "hex");
            const utxoid = bintools.bufferToB58(buffer_1.Buffer.concat([txid, txidx]));
            expect(u1.getUTXOID()).toBe(utxoid);
        });
        test("toString", () => {
            const serialized = u1.toString();
            expect(serialized).toBe(bintools.cb58Encode(utxobuff));
        });
    });
});
const setMergeTester = (input, equal, notEqual) => {
    const instr = JSON.stringify(input.getUTXOIDs().sort());
    for (let i = 0; i < equal.length; i++) {
        if (JSON.stringify(equal[i].getUTXOIDs().sort()) != instr) {
            return false;
        }
    }
    for (let i = 0; i < notEqual.length; i++) {
        if (JSON.stringify(notEqual[i].getUTXOIDs().sort()) == instr) {
            return false;
        }
    }
    return true;
};
describe("UTXOSet", () => {
    const utxostrs = [
        bintools.cb58Encode(buffer_1.Buffer.from("000038d1b9f1138672da6fb6c35125539276a9acc2a668d63bea6ba3c795e2edb0f5000000013e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd3558000000070000000000004dd500000000000000000000000100000001a36fd0c2dbcab311731dde7ef1514bd26fcdc74d", "hex")),
        bintools.cb58Encode(buffer_1.Buffer.from("0000c3e4823571587fe2bdfc502689f5a8238b9d0ea7f3277124d16af9de0d2d9911000000003e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd355800000007000000000000001900000000000000000000000100000001e1b6b6a4bad94d2e3f20730379b9bcd6f176318e", "hex")),
        bintools.cb58Encode(buffer_1.Buffer.from("0000f29dba61fda8d57a911e7f8810f935bde810d3f8d495404685bdb8d9d8545e86000000003e07e38e2f23121be8756412c18db7246a16d26ee9936f3cba28be149cfd355800000007000000000000001900000000000000000000000100000001e1b6b6a4bad94d2e3f20730379b9bcd6f176318e", "hex")),
    ];
    const addrs = [
        bintools.cb58Decode("FuB6Lw2D62NuM8zpGLA4Avepq7eGsZRiG"),
        bintools.cb58Decode("MaTvKGccbYzCxzBkJpb2zHW7E1WReZqB8"),
    ];
    test("Creation", () => {
        const set = new utxos_1.UTXOSet();
        set.add(utxostrs[0]);
        const utxo = new utxos_1.UTXO();
        utxo.fromString(utxostrs[0]);
        const setArray = set.getAllUTXOs();
        expect(utxo.toString()).toBe(setArray[0].toString());
    });
    test("Mutliple add", () => {
        const set = new utxos_1.UTXOSet();
        // first add
        for (let i = 0; i < utxostrs.length; i++) {
            set.add(utxostrs[i]);
        }
        // the verify (do these steps separate to ensure no overwrites)
        for (let i = 0; i < utxostrs.length; i++) {
            expect(set.includes(utxostrs[i])).toBe(true);
            const utxo = new utxos_1.UTXO();
            utxo.fromString(utxostrs[i]);
            const veriutxo = set.getUTXO(utxo.getUTXOID());
            expect(veriutxo.toString()).toBe(utxostrs[i]);
        }
    });
    test("addArray", () => {
        const set = new utxos_1.UTXOSet();
        set.addArray(utxostrs);
        for (let i = 0; i < utxostrs.length; i++) {
            const e1 = new utxos_1.UTXO();
            e1.fromString(utxostrs[i]);
            expect(set.includes(e1)).toBe(true);
            const utxo = new utxos_1.UTXO();
            utxo.fromString(utxostrs[i]);
            const veriutxo = set.getUTXO(utxo.getUTXOID());
            expect(veriutxo.toString()).toBe(utxostrs[i]);
        }
        set.addArray(set.getAllUTXOs());
        for (let i = 0; i < utxostrs.length; i++) {
            const utxo = new utxos_1.UTXO();
            utxo.fromString(utxostrs[i]);
            expect(set.includes(utxo)).toBe(true);
            const veriutxo = set.getUTXO(utxo.getUTXOID());
            expect(veriutxo.toString()).toBe(utxostrs[i]);
        }
        let o = set.serialize("hex");
        let s = new utxos_1.UTXOSet();
        s.deserialize(o);
        let t = set.serialize(display);
        let r = new utxos_1.UTXOSet();
        r.deserialize(t);
    });
    test("overwriting UTXO", () => {
        const set = new utxos_1.UTXOSet();
        set.addArray(utxostrs);
        const testutxo = new utxos_1.UTXO();
        testutxo.fromString(utxostrs[0]);
        expect(set.add(utxostrs[0], true).toString()).toBe(testutxo.toString());
        expect(set.add(utxostrs[0], false)).toBeUndefined();
        expect(set.addArray(utxostrs, true).length).toBe(3);
        expect(set.addArray(utxostrs, false).length).toBe(0);
    });
    describe("Functionality", () => {
        let set;
        let utxos;
        beforeEach(() => {
            set = new utxos_1.UTXOSet();
            set.addArray(utxostrs);
            utxos = set.getAllUTXOs();
        });
        test("remove", () => {
            const testutxo = new utxos_1.UTXO();
            testutxo.fromString(utxostrs[0]);
            expect(set.remove(utxostrs[0]).toString()).toBe(testutxo.toString());
            expect(set.remove(utxostrs[0])).toBeUndefined();
            expect(set.add(utxostrs[0], false).toString()).toBe(testutxo.toString());
            expect(set.remove(utxostrs[0]).toString()).toBe(testutxo.toString());
        });
        test("removeArray", () => {
            const testutxo = new utxos_1.UTXO();
            testutxo.fromString(utxostrs[0]);
            expect(set.removeArray(utxostrs).length).toBe(3);
            expect(set.removeArray(utxostrs).length).toBe(0);
            expect(set.add(utxostrs[0], false).toString()).toBe(testutxo.toString());
            expect(set.removeArray(utxostrs).length).toBe(1);
            expect(set.addArray(utxostrs, false).length).toBe(3);
            expect(set.removeArray(utxos).length).toBe(3);
        });
        test("getUTXOIDs", () => {
            const uids = set.getUTXOIDs();
            for (let i = 0; i < utxos.length; i++) {
                expect(uids.indexOf(utxos[i].getUTXOID())).not.toBe(-1);
            }
        });
        test("getAllUTXOs", () => {
            const allutxos = set.getAllUTXOs();
            const ustrs = [];
            for (let i = 0; i < allutxos.length; i++) {
                ustrs.push(allutxos[i].toString());
            }
            for (let i = 0; i < utxostrs.length; i++) {
                expect(ustrs.indexOf(utxostrs[i])).not.toBe(-1);
            }
            const uids = set.getUTXOIDs();
            const allutxos2 = set.getAllUTXOs(uids);
            const ustrs2 = [];
            for (let i = 0; i < allutxos.length; i++) {
                ustrs2.push(allutxos2[i].toString());
            }
            for (let i = 0; i < utxostrs.length; i++) {
                expect(ustrs2.indexOf(utxostrs[i])).not.toBe(-1);
            }
        });
        test("getUTXOIDs By Address", () => {
            let utxoids;
            utxoids = set.getUTXOIDs([addrs[0]]);
            expect(utxoids.length).toBe(1);
            utxoids = set.getUTXOIDs(addrs);
            expect(utxoids.length).toBe(3);
            utxoids = set.getUTXOIDs(addrs, false);
            expect(utxoids.length).toBe(3);
        });
        test("getAllUTXOStrings", () => {
            const ustrs = set.getAllUTXOStrings();
            for (let i = 0; i < utxostrs.length; i++) {
                expect(ustrs.indexOf(utxostrs[i])).not.toBe(-1);
            }
            const uids = set.getUTXOIDs();
            const ustrs2 = set.getAllUTXOStrings(uids);
            for (let i = 0; i < utxostrs.length; i++) {
                expect(ustrs2.indexOf(utxostrs[i])).not.toBe(-1);
            }
        });
        test("getAddresses", () => {
            expect(set.getAddresses().sort()).toStrictEqual(addrs.sort());
        });
        test("getBalance", () => {
            let balance1;
            let balance2;
            balance1 = new bn_js_1.default(0);
            balance2 = new bn_js_1.default(0);
            for (let i = 0; i < utxos.length; i++) {
                const assetID = utxos[i].getAssetID();
                balance1.add(set.getBalance(addrs, assetID));
                balance2.add(utxos[i].getOutput().getAmount());
            }
            expect(balance1.toString()).toBe(balance2.toString());
            balance1 = new bn_js_1.default(0);
            balance2 = new bn_js_1.default(0);
            const now = helperfunctions_1.UnixNow();
            for (let i = 0; i < utxos.length; i++) {
                const assetID = bintools.cb58Encode(utxos[i].getAssetID());
                balance1.add(set.getBalance(addrs, assetID, now));
                balance2.add(utxos[i].getOutput().getAmount());
            }
            expect(balance1.toString()).toBe(balance2.toString());
        });
        test("getAssetIDs", () => {
            const assetIDs = set.getAssetIDs();
            for (let i = 0; i < utxos.length; i++) {
                expect(assetIDs).toContain(utxos[i].getAssetID());
            }
            const addresses = set.getAddresses();
            expect(set.getAssetIDs(addresses)).toEqual(set.getAssetIDs());
        });
        describe("Merge Rules", () => {
            let setA;
            let setB;
            let setC;
            let setD;
            let setE;
            let setF;
            let setG;
            let setH;
            // Take-or-Leave
            const newutxo = bintools.cb58Encode(buffer_1.Buffer.from("0000acf88647b3fbaa9fdf4378f3a0df6a5d15d8efb018ad78f12690390e79e1687600000003acf88647b3fbaa9fdf4378f3a0df6a5d15d8efb018ad78f12690390e79e168760000000700000000000186a000000000000000000000000100000001fceda8f90fcb5d30614b99d79fc4baa293077626", "hex"));
            beforeEach(() => {
                setA = new utxos_1.UTXOSet();
                setA.addArray([utxostrs[0], utxostrs[2]]);
                setB = new utxos_1.UTXOSet();
                setB.addArray([utxostrs[1], utxostrs[2]]);
                setC = new utxos_1.UTXOSet();
                setC.addArray([utxostrs[0], utxostrs[1]]);
                setD = new utxos_1.UTXOSet();
                setD.addArray([utxostrs[1]]);
                setE = new utxos_1.UTXOSet();
                setE.addArray([]); // empty set
                setF = new utxos_1.UTXOSet();
                setF.addArray(utxostrs); // full set, separate from self
                setG = new utxos_1.UTXOSet();
                setG.addArray([newutxo, ...utxostrs]); // full set with new element
                setH = new utxos_1.UTXOSet();
                setH.addArray([newutxo]); // set with only a new element
            });
            test("unknown merge rule", () => {
                expect(() => {
                    set.mergeByRule(setA, "ERROR");
                }).toThrow();
                const setArray = setG.getAllUTXOs();
            });
            test("intersection", () => {
                let results;
                let test;
                results = set.mergeByRule(setA, "intersection");
                test = setMergeTester(results, [setA], [setB, setC, setD, setE, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setF, "intersection");
                test = setMergeTester(results, [setF], [setA, setB, setC, setD, setE, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setG, "intersection");
                test = setMergeTester(results, [setF], [setA, setB, setC, setD, setE, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setH, "intersection");
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
            });
            test("differenceSelf", () => {
                let results;
                let test;
                results = set.mergeByRule(setA, "differenceSelf");
                test = setMergeTester(results, [setD], [setA, setB, setC, setE, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setF, "differenceSelf");
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setG, "differenceSelf");
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setH, "differenceSelf");
                test = setMergeTester(results, [setF], [setA, setB, setC, setD, setE, setG, setH]);
                expect(test).toBe(true);
            });
            test("differenceNew", () => {
                let results;
                let test;
                results = set.mergeByRule(setA, "differenceNew");
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setF, "differenceNew");
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setG, "differenceNew");
                test = setMergeTester(results, [setH], [setA, setB, setC, setD, setE, setF, setG]);
                expect(test).toBe(true);
                results = set.mergeByRule(setH, "differenceNew");
                test = setMergeTester(results, [setH], [setA, setB, setC, setD, setE, setF, setG]);
                expect(test).toBe(true);
            });
            test("symDifference", () => {
                let results;
                let test;
                results = set.mergeByRule(setA, "symDifference");
                test = setMergeTester(results, [setD], [setA, setB, setC, setE, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setF, "symDifference");
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setG, "symDifference");
                test = setMergeTester(results, [setH], [setA, setB, setC, setD, setE, setF, setG]);
                expect(test).toBe(true);
                results = set.mergeByRule(setH, "symDifference");
                test = setMergeTester(results, [setG], [setA, setB, setC, setD, setE, setF, setH]);
                expect(test).toBe(true);
            });
            test("union", () => {
                let results;
                let test;
                results = set.mergeByRule(setA, "union");
                test = setMergeTester(results, [setF], [setA, setB, setC, setD, setE, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setF, "union");
                test = setMergeTester(results, [setF], [setA, setB, setC, setD, setE, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setG, "union");
                test = setMergeTester(results, [setG], [setA, setB, setC, setD, setE, setF, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setH, "union");
                test = setMergeTester(results, [setG], [setA, setB, setC, setD, setE, setF, setH]);
                expect(test).toBe(true);
            });
            test("unionMinusNew", () => {
                let results;
                let test;
                results = set.mergeByRule(setA, "unionMinusNew");
                test = setMergeTester(results, [setD], [setA, setB, setC, setE, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setF, "unionMinusNew");
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setG, "unionMinusNew");
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setH, "unionMinusNew");
                test = setMergeTester(results, [setF], [setA, setB, setC, setD, setE, setG, setH]);
                expect(test).toBe(true);
            });
            test("unionMinusSelf", () => {
                let results;
                let test;
                results = set.mergeByRule(setA, "unionMinusSelf");
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setF, "unionMinusSelf");
                test = setMergeTester(results, [setE], [setA, setB, setC, setD, setF, setG, setH]);
                expect(test).toBe(true);
                results = set.mergeByRule(setG, "unionMinusSelf");
                test = setMergeTester(results, [setH], [setA, setB, setC, setD, setE, setF, setG]);
                expect(test).toBe(true);
                results = set.mergeByRule(setH, "unionMinusSelf");
                test = setMergeTester(results, [setH], [setA, setB, setC, setD, setE, setF, setG]);
                expect(test).toBe(true);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXR4b3MudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3RzL2FwaXMvYXZtL3V0eG9zLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxrREFBc0I7QUFDdEIsb0NBQWdDO0FBQ2hDLGtFQUF5QztBQUN6Qyw4Q0FBa0Q7QUFFbEQsK0RBQW1EO0FBR25ELE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxPQUFPLEdBQXVCLFNBQVMsQ0FBQTtBQUU3QyxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQVMsRUFBRTtJQUMxQixNQUFNLE9BQU8sR0FBVyw4T0FBOE8sQ0FBQTtJQUN0USxNQUFNLFNBQVMsR0FBVyxVQUFVLENBQUE7SUFDcEMsTUFBTSxPQUFPLEdBQVcsa0VBQWtFLENBQUE7SUFDMUYsTUFBTSxNQUFNLEdBQVcsa0VBQWtFLENBQUE7SUFDekYsTUFBTSxRQUFRLEdBQVcsZUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFFcEQsVUFBVTtJQUNWLE1BQU0sU0FBUyxHQUFXLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDdkQseUtBQXlLO0lBRXpLLG9DQUFvQztJQUNwQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQVMsRUFBRTtRQUMxQixNQUFNLEVBQUUsR0FBUyxJQUFJLFlBQUksRUFBRSxDQUFBO1FBQzNCLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDdkIsTUFBTSxLQUFLLEdBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNuRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQzdCLENBQUMsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQVMs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QixPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUE7Z0JBQ2hELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUV2QixPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUE7Z0JBQ2hELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUV2QixPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUE7Z0JBQ2hELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUV2QixPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUE7Z0JBQ2hELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3pCLENBQUMsQ0FBQyxDQUFBO1lBRUYsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQVMsRUFBRTtnQkFDaEMsSUFBSSxPQUFnQixDQUFBO2dCQUNwQixJQUFJLElBQWEsQ0FBQTtnQkFFakIsT0FBTyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUE7Z0JBQ2pELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUV2QixPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtnQkFDakQsSUFBSSxHQUFHLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7Z0JBQ2xGLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBRXZCLE9BQU8sR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFBO2dCQUNqRCxJQUFJLEdBQUcsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtnQkFDbEYsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFFdkIsT0FBTyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUE7Z0JBQ2pELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3pCLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcInNyYy91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBVVFhPLCBVVFhPU2V0IH0gZnJvbSBcInNyYy9hcGlzL2F2bS91dHhvc1wiXG5pbXBvcnQgeyBBbW91bnRPdXRwdXQgfSBmcm9tIFwic3JjL2FwaXMvYXZtL291dHB1dHNcIlxuaW1wb3J0IHsgVW5peE5vdyB9IGZyb20gXCJzcmMvdXRpbHMvaGVscGVyZnVuY3Rpb25zXCJcbmltcG9ydCB7IFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gXCJzcmMvdXRpbHNcIlxuXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBkaXNwbGF5OiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImRpc3BsYXlcIlxuXG5kZXNjcmliZShcIlVUWE9cIiwgKCk6IHZvaWQgPT4ge1xuICBjb25zdCB1dHhvaGV4OiBzdHJpbmcgPSBcIjAwMDAzOGQxYjlmMTEzODY3MmRhNmZiNmMzNTEyNTUzOTI3NmE5YWNjMmE2NjhkNjNiZWE2YmEzYzc5NWUyZWRiMGY1MDAwMDAwMDEzZTA3ZTM4ZTJmMjMxMjFiZTg3NTY0MTJjMThkYjcyNDZhMTZkMjZlZTk5MzZmM2NiYTI4YmUxNDljZmQzNTU4MDAwMDAwMDcwMDAwMDAwMDAwMDA0ZGQ1MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDFhMzZmZDBjMmRiY2FiMzExNzMxZGRlN2VmMTUxNGJkMjZmY2RjNzRkXCJcbiAgY29uc3Qgb3V0cHV0aWR4OiBzdHJpbmcgPSBcIjAwMDAwMDAxXCJcbiAgY29uc3Qgb3V0dHhpZDogc3RyaW5nID0gXCIzOGQxYjlmMTEzODY3MmRhNmZiNmMzNTEyNTUzOTI3NmE5YWNjMmE2NjhkNjNiZWE2YmEzYzc5NWUyZWRiMGY1XCJcbiAgY29uc3Qgb3V0YWlkOiBzdHJpbmcgPSBcIjNlMDdlMzhlMmYyMzEyMWJlODc1NjQxMmMxOGRiNzI0NmExNmQyNmVlOTkzNmYzY2JhMjhiZTE0OWNmZDM1NThcIlxuICBjb25zdCB1dHhvYnVmZjogQnVmZmVyID0gQnVmZmVyLmZyb20odXR4b2hleCwgXCJoZXhcIilcblxuICAvLyBQYXltZW50XG4gIGNvbnN0IE9QVVRYT3N0cjogc3RyaW5nID0gYmludG9vbHMuY2I1OEVuY29kZSh1dHhvYnVmZilcbiAgLy8gXCJVOXJGZ0s1ampkWG1WOGs1dHBxZVhraW16ck4zbzllQ0NjWGVzeWhNQkJadTlNUUpDRFREbzVXbjVwc0t2ekpWTUpwaU1iZGtmRFhrcDdzS1pkZGZDWmR4cHVEbXlOeTdWRmthMTl6TVc0amN6NkRSUXZOZkEya3ZKWUtrOTZ6Yzd1aXpncDNpMkZZV3JCOG1yMXNQSjhvUDlUaDY0R1E1eUhkOFwiXG5cbiAgLy8gaW1wbGllcyBmcm9tU3RyaW5nIGFuZCBmcm9tQnVmZmVyXG4gIHRlc3QoXCJDcmVhdGlvblwiLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3QgdTE6IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgdTEuZnJvbUJ1ZmZlcih1dHhvYnVmZilcbiAgICBjb25zdCB1MWhleDogc3RyaW5nID0gdTEudG9CdWZmZXIoKS50b1N0cmluZyhcImhleFwiKVxuICAgIGV4cGVjdCh1MWhleCkudG9CZSh1dHhvaGV4KVxuICB9KVxuXG4gIHRlc3QoXCJFbXB0eSBDcmVhdGlvblwiLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3QgdTE6IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgZXhwZWN0KCgpOiB2b2lkID0+IHtcbiAgICAgIHUxLnRvQnVmZmVyKClcbiAgICB9KS50b1Rocm93KClcbiAgfSlcblxuICB0ZXN0KFwiQ3JlYXRpb24gb2YgVHlwZVwiLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3Qgb3A6IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgb3AuZnJvbVN0cmluZyhPUFVUWE9zdHIpXG4gICAgZXhwZWN0KG9wLmdldE91dHB1dCgpLmdldE91dHB1dElEKCkpLnRvQmUoNylcbiAgfSlcblxuICBkZXNjcmliZShcIkZ1bnRpb25hbGl0eVwiLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3QgdTE6IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgdTEuZnJvbUJ1ZmZlcih1dHhvYnVmZilcbiAgICB0ZXN0KFwiZ2V0QXNzZXRJRCBOb25DQVwiLCAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCBhc3NldElEOiBCdWZmZXIgPSB1MS5nZXRBc3NldElEKClcbiAgICAgIGV4cGVjdChhc3NldElELnRvU3RyaW5nKFwiaGV4XCIsIDAsIGFzc2V0SUQubGVuZ3RoKSkudG9CZShvdXRhaWQpXG4gICAgfSlcbiAgICB0ZXN0KFwiZ2V0VHhJRFwiLCAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCB0eGlkOiBCdWZmZXIgPSB1MS5nZXRUeElEKClcbiAgICAgIGV4cGVjdCh0eGlkLnRvU3RyaW5nKFwiaGV4XCIsIDAsIHR4aWQubGVuZ3RoKSkudG9CZShvdXR0eGlkKVxuICAgIH0pXG4gICAgdGVzdChcImdldE91dHB1dElkeFwiLCAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCB0eGlkeDogQnVmZmVyID0gdTEuZ2V0T3V0cHV0SWR4KClcbiAgICAgIGV4cGVjdCh0eGlkeC50b1N0cmluZyhcImhleFwiLCAwLCB0eGlkeC5sZW5ndGgpKS50b0JlKG91dHB1dGlkeClcbiAgICB9KVxuICAgIHRlc3QoXCJnZXRVVFhPSURcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3QgdHhpZDogQnVmZmVyID0gQnVmZmVyLmZyb20ob3V0dHhpZCwgXCJoZXhcIilcbiAgICAgIGNvbnN0IHR4aWR4OiBCdWZmZXIgPSBCdWZmZXIuZnJvbShvdXRwdXRpZHgsIFwiaGV4XCIpXG4gICAgICBjb25zdCB1dHhvaWQ6IHN0cmluZyA9IGJpbnRvb2xzLmJ1ZmZlclRvQjU4KEJ1ZmZlci5jb25jYXQoW3R4aWQsIHR4aWR4XSkpXG4gICAgICBleHBlY3QodTEuZ2V0VVRYT0lEKCkpLnRvQmUodXR4b2lkKVxuICAgIH0pXG4gICAgdGVzdChcInRvU3RyaW5nXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGNvbnN0IHNlcmlhbGl6ZWQ6IHN0cmluZyA9IHUxLnRvU3RyaW5nKClcbiAgICAgIGV4cGVjdChzZXJpYWxpemVkKS50b0JlKGJpbnRvb2xzLmNiNThFbmNvZGUodXR4b2J1ZmYpKVxuICAgIH0pXG4gIH0pXG59KVxuXG5jb25zdCBzZXRNZXJnZVRlc3RlciA9IChpbnB1dDogVVRYT1NldCwgZXF1YWw6IFVUWE9TZXRbXSwgbm90RXF1YWw6IFVUWE9TZXRbXSk6IGJvb2xlYW4gPT4ge1xuICBjb25zdCBpbnN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoaW5wdXQuZ2V0VVRYT0lEcygpLnNvcnQoKSlcbiAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGVxdWFsLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGVxdWFsW2ldLmdldFVUWE9JRHMoKS5zb3J0KCkpICE9IGluc3RyKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbm90RXF1YWwubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkobm90RXF1YWxbaV0uZ2V0VVRYT0lEcygpLnNvcnQoKSkgPT0gaW5zdHIpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZVxufVxuXG5kZXNjcmliZShcIlVUWE9TZXRcIiwgKCk6IHZvaWQgPT4ge1xuICBjb25zdCB1dHhvc3Ryczogc3RyaW5nW10gPSBbXG4gICAgYmludG9vbHMuY2I1OEVuY29kZShCdWZmZXIuZnJvbShcIjAwMDAzOGQxYjlmMTEzODY3MmRhNmZiNmMzNTEyNTUzOTI3NmE5YWNjMmE2NjhkNjNiZWE2YmEzYzc5NWUyZWRiMGY1MDAwMDAwMDEzZTA3ZTM4ZTJmMjMxMjFiZTg3NTY0MTJjMThkYjcyNDZhMTZkMjZlZTk5MzZmM2NiYTI4YmUxNDljZmQzNTU4MDAwMDAwMDcwMDAwMDAwMDAwMDA0ZGQ1MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDFhMzZmZDBjMmRiY2FiMzExNzMxZGRlN2VmMTUxNGJkMjZmY2RjNzRkXCIsIFwiaGV4XCIpKSxcbiAgICBiaW50b29scy5jYjU4RW5jb2RlKEJ1ZmZlci5mcm9tKFwiMDAwMGMzZTQ4MjM1NzE1ODdmZTJiZGZjNTAyNjg5ZjVhODIzOGI5ZDBlYTdmMzI3NzEyNGQxNmFmOWRlMGQyZDk5MTEwMDAwMDAwMDNlMDdlMzhlMmYyMzEyMWJlODc1NjQxMmMxOGRiNzI0NmExNmQyNmVlOTkzNmYzY2JhMjhiZTE0OWNmZDM1NTgwMDAwMDAwNzAwMDAwMDAwMDAwMDAwMTkwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMWUxYjZiNmE0YmFkOTRkMmUzZjIwNzMwMzc5YjliY2Q2ZjE3NjMxOGVcIiwgXCJoZXhcIikpLFxuICAgIGJpbnRvb2xzLmNiNThFbmNvZGUoQnVmZmVyLmZyb20oXCIwMDAwZjI5ZGJhNjFmZGE4ZDU3YTkxMWU3Zjg4MTBmOTM1YmRlODEwZDNmOGQ0OTU0MDQ2ODViZGI4ZDlkODU0NWU4NjAwMDAwMDAwM2UwN2UzOGUyZjIzMTIxYmU4NzU2NDEyYzE4ZGI3MjQ2YTE2ZDI2ZWU5OTM2ZjNjYmEyOGJlMTQ5Y2ZkMzU1ODAwMDAwMDA3MDAwMDAwMDAwMDAwMDAxOTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAxZTFiNmI2YTRiYWQ5NGQyZTNmMjA3MzAzNzliOWJjZDZmMTc2MzE4ZVwiLCBcImhleFwiKSksXG4gIF1cbiAgY29uc3QgYWRkcnM6IEJ1ZmZlcltdID0gW1xuICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoXCJGdUI2THcyRDYyTnVNOHpwR0xBNEF2ZXBxN2VHc1pSaUdcIiksXG4gICAgYmludG9vbHMuY2I1OERlY29kZShcIk1hVHZLR2NjYll6Q3h6QmtKcGIyekhXN0UxV1JlWnFCOFwiKSxcbiAgXVxuICB0ZXN0KFwiQ3JlYXRpb25cIiwgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHNldDogVVRYT1NldCA9IG5ldyBVVFhPU2V0KClcbiAgICBzZXQuYWRkKHV0eG9zdHJzWzBdKVxuICAgIGNvbnN0IHV0eG86IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgdXR4by5mcm9tU3RyaW5nKHV0eG9zdHJzWzBdKVxuICAgIGNvbnN0IHNldEFycmF5OiBVVFhPW10gPSBzZXQuZ2V0QWxsVVRYT3MoKVxuICAgIGV4cGVjdCh1dHhvLnRvU3RyaW5nKCkpLnRvQmUoc2V0QXJyYXlbMF0udG9TdHJpbmcoKSlcbiAgfSlcblxuICB0ZXN0KFwiTXV0bGlwbGUgYWRkXCIsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBzZXQ6IFVUWE9TZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgLy8gZmlyc3QgYWRkXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHV0eG9zdHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBzZXQuYWRkKHV0eG9zdHJzW2ldKVxuICAgIH1cbiAgICAvLyB0aGUgdmVyaWZ5IChkbyB0aGVzZSBzdGVwcyBzZXBhcmF0ZSB0byBlbnN1cmUgbm8gb3ZlcndyaXRlcylcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdXR4b3N0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGV4cGVjdChzZXQuaW5jbHVkZXModXR4b3N0cnNbaV0pKS50b0JlKHRydWUpXG4gICAgICBjb25zdCB1dHhvOiBVVFhPID0gbmV3IFVUWE8oKVxuICAgICAgdXR4by5mcm9tU3RyaW5nKHV0eG9zdHJzW2ldKVxuICAgICAgY29uc3QgdmVyaXV0eG86IFVUWE8gPSBzZXQuZ2V0VVRYTyh1dHhvLmdldFVUWE9JRCgpKSBhcyBVVFhPXG4gICAgICBleHBlY3QodmVyaXV0eG8udG9TdHJpbmcoKSkudG9CZSh1dHhvc3Ryc1tpXSlcbiAgICB9XG4gIH0pXG5cbiAgdGVzdChcImFkZEFycmF5XCIsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBzZXQ6IFVUWE9TZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgc2V0LmFkZEFycmF5KHV0eG9zdHJzKVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB1dHhvc3Rycy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZTE6IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgICBlMS5mcm9tU3RyaW5nKHV0eG9zdHJzW2ldKVxuICAgICAgZXhwZWN0KHNldC5pbmNsdWRlcyhlMSkpLnRvQmUodHJ1ZSlcbiAgICAgIGNvbnN0IHV0eG86IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgICB1dHhvLmZyb21TdHJpbmcodXR4b3N0cnNbaV0pXG4gICAgICBjb25zdCB2ZXJpdXR4bzogVVRYTyA9IHNldC5nZXRVVFhPKHV0eG8uZ2V0VVRYT0lEKCkpIGFzIFVUWE9cbiAgICAgIGV4cGVjdCh2ZXJpdXR4by50b1N0cmluZygpKS50b0JlKHV0eG9zdHJzW2ldKVxuICAgIH1cblxuICAgIHNldC5hZGRBcnJheShzZXQuZ2V0QWxsVVRYT3MoKSlcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdXR4b3N0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHV0eG86IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgICB1dHhvLmZyb21TdHJpbmcodXR4b3N0cnNbaV0pXG4gICAgICBleHBlY3Qoc2V0LmluY2x1ZGVzKHV0eG8pKS50b0JlKHRydWUpXG5cbiAgICAgIGNvbnN0IHZlcml1dHhvOiBVVFhPID0gc2V0LmdldFVUWE8odXR4by5nZXRVVFhPSUQoKSkgYXMgVVRYT1xuICAgICAgZXhwZWN0KHZlcml1dHhvLnRvU3RyaW5nKCkpLnRvQmUodXR4b3N0cnNbaV0pXG4gICAgfVxuXG4gICAgbGV0IG86IG9iamVjdCA9IHNldC5zZXJpYWxpemUoXCJoZXhcIilcbiAgICBsZXQgczogVVRYT1NldCA9IG5ldyBVVFhPU2V0KClcbiAgICBzLmRlc2VyaWFsaXplKG8pXG4gICAgbGV0IHQ6IG9iamVjdCA9IHNldC5zZXJpYWxpemUoZGlzcGxheSlcbiAgICBsZXQgcjogVVRYT1NldCA9IG5ldyBVVFhPU2V0KClcbiAgICByLmRlc2VyaWFsaXplKHQpXG4gIH0pXG5cbiAgdGVzdChcIm92ZXJ3cml0aW5nIFVUWE9cIiwgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IHNldDogVVRYT1NldCA9IG5ldyBVVFhPU2V0KClcbiAgICBzZXQuYWRkQXJyYXkodXR4b3N0cnMpXG4gICAgY29uc3QgdGVzdHV0eG86IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgdGVzdHV0eG8uZnJvbVN0cmluZyh1dHhvc3Ryc1swXSlcbiAgICBleHBlY3Qoc2V0LmFkZCh1dHhvc3Ryc1swXSwgdHJ1ZSkudG9TdHJpbmcoKSkudG9CZSh0ZXN0dXR4by50b1N0cmluZygpKVxuICAgIGV4cGVjdChzZXQuYWRkKHV0eG9zdHJzWzBdLCBmYWxzZSkpLnRvQmVVbmRlZmluZWQoKVxuICAgIGV4cGVjdChzZXQuYWRkQXJyYXkodXR4b3N0cnMsIHRydWUpLmxlbmd0aCkudG9CZSgzKVxuICAgIGV4cGVjdChzZXQuYWRkQXJyYXkodXR4b3N0cnMsIGZhbHNlKS5sZW5ndGgpLnRvQmUoMClcbiAgfSlcblxuICBkZXNjcmliZShcIkZ1bmN0aW9uYWxpdHlcIiwgKCk6IHZvaWQgPT4ge1xuICAgIGxldCBzZXQ6IFVUWE9TZXRcbiAgICBsZXQgdXR4b3M6IFVUWE9bXVxuICAgIGJlZm9yZUVhY2goKCk6IHZvaWQgPT4ge1xuICAgICAgc2V0ID0gbmV3IFVUWE9TZXQoKVxuICAgICAgc2V0LmFkZEFycmF5KHV0eG9zdHJzKVxuICAgICAgdXR4b3MgPSBzZXQuZ2V0QWxsVVRYT3MoKVxuICAgIH0pXG5cbiAgICB0ZXN0KFwicmVtb3ZlXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGNvbnN0IHRlc3R1dHhvOiBVVFhPID0gbmV3IFVUWE8oKVxuICAgICAgdGVzdHV0eG8uZnJvbVN0cmluZyh1dHhvc3Ryc1swXSlcbiAgICAgIGV4cGVjdChzZXQucmVtb3ZlKHV0eG9zdHJzWzBdKS50b1N0cmluZygpKS50b0JlKHRlc3R1dHhvLnRvU3RyaW5nKCkpXG4gICAgICBleHBlY3Qoc2V0LnJlbW92ZSh1dHhvc3Ryc1swXSkpLnRvQmVVbmRlZmluZWQoKVxuICAgICAgZXhwZWN0KHNldC5hZGQodXR4b3N0cnNbMF0sIGZhbHNlKS50b1N0cmluZygpKS50b0JlKHRlc3R1dHhvLnRvU3RyaW5nKCkpXG4gICAgICBleHBlY3Qoc2V0LnJlbW92ZSh1dHhvc3Ryc1swXSkudG9TdHJpbmcoKSkudG9CZSh0ZXN0dXR4by50b1N0cmluZygpKVxuICAgIH0pXG5cbiAgICB0ZXN0KFwicmVtb3ZlQXJyYXlcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3QgdGVzdHV0eG86IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgICB0ZXN0dXR4by5mcm9tU3RyaW5nKHV0eG9zdHJzWzBdKVxuICAgICAgZXhwZWN0KHNldC5yZW1vdmVBcnJheSh1dHhvc3RycykubGVuZ3RoKS50b0JlKDMpXG4gICAgICBleHBlY3Qoc2V0LnJlbW92ZUFycmF5KHV0eG9zdHJzKS5sZW5ndGgpLnRvQmUoMClcbiAgICAgIGV4cGVjdChzZXQuYWRkKHV0eG9zdHJzWzBdLCBmYWxzZSkudG9TdHJpbmcoKSkudG9CZSh0ZXN0dXR4by50b1N0cmluZygpKVxuICAgICAgZXhwZWN0KHNldC5yZW1vdmVBcnJheSh1dHhvc3RycykubGVuZ3RoKS50b0JlKDEpXG4gICAgICBleHBlY3Qoc2V0LmFkZEFycmF5KHV0eG9zdHJzLCBmYWxzZSkubGVuZ3RoKS50b0JlKDMpXG4gICAgICBleHBlY3Qoc2V0LnJlbW92ZUFycmF5KHV0eG9zKS5sZW5ndGgpLnRvQmUoMylcbiAgICB9KVxuXG4gICAgdGVzdChcImdldFVUWE9JRHNcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3QgdWlkczogc3RyaW5nW10gPSBzZXQuZ2V0VVRYT0lEcygpXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdXR4b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZXhwZWN0KHVpZHMuaW5kZXhPZih1dHhvc1tpXS5nZXRVVFhPSUQoKSkpLm5vdC50b0JlKC0xKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0ZXN0KFwiZ2V0QWxsVVRYT3NcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3QgYWxsdXR4b3M6IFVUWE9bXSA9IHNldC5nZXRBbGxVVFhPcygpXG4gICAgICBjb25zdCB1c3Ryczogc3RyaW5nW10gPSBbXVxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFsbHV0eG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHVzdHJzLnB1c2goYWxsdXR4b3NbaV0udG9TdHJpbmcoKSlcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB1dHhvc3Rycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBleHBlY3QodXN0cnMuaW5kZXhPZih1dHhvc3Ryc1tpXSkpLm5vdC50b0JlKC0xKVxuICAgICAgfVxuICAgICAgY29uc3QgdWlkczogc3RyaW5nW10gPSBzZXQuZ2V0VVRYT0lEcygpXG4gICAgICBjb25zdCBhbGx1dHhvczI6IFVUWE9bXSA9IHNldC5nZXRBbGxVVFhPcyh1aWRzKVxuICAgICAgY29uc3QgdXN0cnMyOiBzdHJpbmdbXSA9IFtdXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgYWxsdXR4b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdXN0cnMyLnB1c2goYWxsdXR4b3MyW2ldLnRvU3RyaW5nKCkpXG4gICAgICB9XG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdXR4b3N0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZXhwZWN0KHVzdHJzMi5pbmRleE9mKHV0eG9zdHJzW2ldKSkubm90LnRvQmUoLTEpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRlc3QoXCJnZXRVVFhPSURzIEJ5IEFkZHJlc3NcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgbGV0IHV0eG9pZHM6IHN0cmluZ1tdXG4gICAgICB1dHhvaWRzID0gc2V0LmdldFVUWE9JRHMoW2FkZHJzWzBdXSlcbiAgICAgIGV4cGVjdCh1dHhvaWRzLmxlbmd0aCkudG9CZSgxKVxuICAgICAgdXR4b2lkcyA9IHNldC5nZXRVVFhPSURzKGFkZHJzKVxuICAgICAgZXhwZWN0KHV0eG9pZHMubGVuZ3RoKS50b0JlKDMpXG4gICAgICB1dHhvaWRzID0gc2V0LmdldFVUWE9JRHMoYWRkcnMsIGZhbHNlKVxuICAgICAgZXhwZWN0KHV0eG9pZHMubGVuZ3RoKS50b0JlKDMpXG4gICAgfSlcblxuICAgIHRlc3QoXCJnZXRBbGxVVFhPU3RyaW5nc1wiLCAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCB1c3Ryczogc3RyaW5nW10gPSBzZXQuZ2V0QWxsVVRYT1N0cmluZ3MoKVxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHV0eG9zdHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGV4cGVjdCh1c3Rycy5pbmRleE9mKHV0eG9zdHJzW2ldKSkubm90LnRvQmUoLTEpXG4gICAgICB9XG4gICAgICBjb25zdCB1aWRzOiBzdHJpbmdbXSA9IHNldC5nZXRVVFhPSURzKClcbiAgICAgIGNvbnN0IHVzdHJzMjogc3RyaW5nW10gPSBzZXQuZ2V0QWxsVVRYT1N0cmluZ3ModWlkcylcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB1dHhvc3Rycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBleHBlY3QodXN0cnMyLmluZGV4T2YodXR4b3N0cnNbaV0pKS5ub3QudG9CZSgtMSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGVzdChcImdldEFkZHJlc3Nlc1wiLCAoKTogdm9pZCA9PiB7XG4gICAgICBleHBlY3Qoc2V0LmdldEFkZHJlc3NlcygpLnNvcnQoKSkudG9TdHJpY3RFcXVhbChhZGRycy5zb3J0KCkpXG4gICAgfSlcblxuICAgIHRlc3QoXCJnZXRCYWxhbmNlXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGxldCBiYWxhbmNlMTogQk5cbiAgICAgIGxldCBiYWxhbmNlMjogQk5cbiAgICAgIGJhbGFuY2UxID0gbmV3IEJOKDApXG4gICAgICBiYWxhbmNlMiA9IG5ldyBCTigwKVxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHV0eG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGFzc2V0SUQgPSB1dHhvc1tpXS5nZXRBc3NldElEKClcbiAgICAgICAgYmFsYW5jZTEuYWRkKHNldC5nZXRCYWxhbmNlKGFkZHJzLCBhc3NldElEKSlcbiAgICAgICAgYmFsYW5jZTIuYWRkKCh1dHhvc1tpXS5nZXRPdXRwdXQoKSBhcyBBbW91bnRPdXRwdXQpLmdldEFtb3VudCgpKVxuICAgICAgfVxuICAgICAgZXhwZWN0KGJhbGFuY2UxLnRvU3RyaW5nKCkpLnRvQmUoYmFsYW5jZTIudG9TdHJpbmcoKSlcblxuICAgICAgYmFsYW5jZTEgPSBuZXcgQk4oMClcbiAgICAgIGJhbGFuY2UyID0gbmV3IEJOKDApXG4gICAgICBjb25zdCBub3c6IEJOID0gVW5peE5vdygpXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdXR4b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgYXNzZXRJRCA9IGJpbnRvb2xzLmNiNThFbmNvZGUodXR4b3NbaV0uZ2V0QXNzZXRJRCgpKVxuICAgICAgICBiYWxhbmNlMS5hZGQoc2V0LmdldEJhbGFuY2UoYWRkcnMsIGFzc2V0SUQsIG5vdykpXG4gICAgICAgIGJhbGFuY2UyLmFkZCgodXR4b3NbaV0uZ2V0T3V0cHV0KCkgYXMgQW1vdW50T3V0cHV0KS5nZXRBbW91bnQoKSlcbiAgICAgIH1cbiAgICAgIGV4cGVjdChiYWxhbmNlMS50b1N0cmluZygpKS50b0JlKGJhbGFuY2UyLnRvU3RyaW5nKCkpXG4gICAgfSlcblxuICAgIHRlc3QoXCJnZXRBc3NldElEc1wiLCAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCBhc3NldElEczogQnVmZmVyW10gPSBzZXQuZ2V0QXNzZXRJRHMoKVxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHV0eG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGV4cGVjdChhc3NldElEcykudG9Db250YWluKHV0eG9zW2ldLmdldEFzc2V0SUQoKSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFkZHJlc3NlczogQnVmZmVyW10gPSBzZXQuZ2V0QWRkcmVzc2VzKClcbiAgICAgIGV4cGVjdChzZXQuZ2V0QXNzZXRJRHMoYWRkcmVzc2VzKSkudG9FcXVhbChzZXQuZ2V0QXNzZXRJRHMoKSlcbiAgICB9KVxuXG4gICAgZGVzY3JpYmUoXCJNZXJnZSBSdWxlc1wiLCAoKTogdm9pZCA9PiB7XG4gICAgICBsZXQgc2V0QTogVVRYT1NldFxuICAgICAgbGV0IHNldEI6IFVUWE9TZXRcbiAgICAgIGxldCBzZXRDOiBVVFhPU2V0XG4gICAgICBsZXQgc2V0RDogVVRYT1NldFxuICAgICAgbGV0IHNldEU6IFVUWE9TZXRcbiAgICAgIGxldCBzZXRGOiBVVFhPU2V0XG4gICAgICBsZXQgc2V0RzogVVRYT1NldFxuICAgICAgbGV0IHNldEg6IFVUWE9TZXRcbiAgICAgIC8vIFRha2Utb3ItTGVhdmVcbiAgICAgIGNvbnN0IG5ld3V0eG86IHN0cmluZyA9IGJpbnRvb2xzLmNiNThFbmNvZGUoQnVmZmVyLmZyb20oXCIwMDAwYWNmODg2NDdiM2ZiYWE5ZmRmNDM3OGYzYTBkZjZhNWQxNWQ4ZWZiMDE4YWQ3OGYxMjY5MDM5MGU3OWUxNjg3NjAwMDAwMDAzYWNmODg2NDdiM2ZiYWE5ZmRmNDM3OGYzYTBkZjZhNWQxNWQ4ZWZiMDE4YWQ3OGYxMjY5MDM5MGU3OWUxNjg3NjAwMDAwMDA3MDAwMDAwMDAwMDAxODZhMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAxZmNlZGE4ZjkwZmNiNWQzMDYxNGI5OWQ3OWZjNGJhYTI5MzA3NzYyNlwiLCBcImhleFwiKSlcblxuICAgICAgYmVmb3JlRWFjaCgoKTogdm9pZCA9PiB7XG4gICAgICAgIHNldEEgPSBuZXcgVVRYT1NldCgpXG4gICAgICAgIHNldEEuYWRkQXJyYXkoW3V0eG9zdHJzWzBdLCB1dHhvc3Ryc1syXV0pXG5cbiAgICAgICAgc2V0QiA9IG5ldyBVVFhPU2V0KClcbiAgICAgICAgc2V0Qi5hZGRBcnJheShbdXR4b3N0cnNbMV0sIHV0eG9zdHJzWzJdXSlcblxuICAgICAgICBzZXRDID0gbmV3IFVUWE9TZXQoKVxuICAgICAgICBzZXRDLmFkZEFycmF5KFt1dHhvc3Ryc1swXSwgdXR4b3N0cnNbMV1dKVxuXG4gICAgICAgIHNldEQgPSBuZXcgVVRYT1NldCgpXG4gICAgICAgIHNldEQuYWRkQXJyYXkoW3V0eG9zdHJzWzFdXSlcblxuICAgICAgICBzZXRFID0gbmV3IFVUWE9TZXQoKVxuICAgICAgICBzZXRFLmFkZEFycmF5KFtdKS8vIGVtcHR5IHNldFxuXG4gICAgICAgIHNldEYgPSBuZXcgVVRYT1NldCgpXG4gICAgICAgIHNldEYuYWRkQXJyYXkodXR4b3N0cnMpIC8vIGZ1bGwgc2V0LCBzZXBhcmF0ZSBmcm9tIHNlbGZcblxuICAgICAgICBzZXRHID0gbmV3IFVUWE9TZXQoKVxuICAgICAgICBzZXRHLmFkZEFycmF5KFtuZXd1dHhvLCAuLi51dHhvc3Ryc10pIC8vIGZ1bGwgc2V0IHdpdGggbmV3IGVsZW1lbnRcblxuICAgICAgICBzZXRIID0gbmV3IFVUWE9TZXQoKVxuICAgICAgICBzZXRILmFkZEFycmF5KFtuZXd1dHhvXSkgLy8gc2V0IHdpdGggb25seSBhIG5ldyBlbGVtZW50XG4gICAgICB9KVxuXG4gICAgICB0ZXN0KFwidW5rbm93biBtZXJnZSBydWxlXCIsICgpOiB2b2lkID0+IHtcbiAgICAgICAgZXhwZWN0KCgpOiB2b2lkID0+IHtcbiAgICAgICAgICBzZXQubWVyZ2VCeVJ1bGUoc2V0QSwgXCJFUlJPUlwiKVxuICAgICAgICB9KS50b1Rocm93KClcbiAgICAgICAgY29uc3Qgc2V0QXJyYXk6IFVUWE9bXSA9IHNldEcuZ2V0QWxsVVRYT3MoKVxuICAgICAgfSlcblxuICAgICAgdGVzdChcImludGVyc2VjdGlvblwiLCAoKTogdm9pZCA9PiB7XG4gICAgICAgIGxldCByZXN1bHRzOiBVVFhPU2V0XG4gICAgICAgIGxldCB0ZXN0OiBib29sZWFuXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRBLCBcImludGVyc2VjdGlvblwiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEFdLCBbc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0Rywgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRGLCBcImludGVyc2VjdGlvblwiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEZdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Rywgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRHLCBcImludGVyc2VjdGlvblwiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEZdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Rywgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRILCBcImludGVyc2VjdGlvblwiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEVdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0Riwgc2V0Rywgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG4gICAgICB9KVxuXG4gICAgICB0ZXN0KFwiZGlmZmVyZW5jZVNlbGZcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0czogVVRYT1NldFxuICAgICAgICBsZXQgdGVzdDogYm9vbGVhblxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0QSwgXCJkaWZmZXJlbmNlU2VsZlwiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldERdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RSwgc2V0Riwgc2V0Rywgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRGLCBcImRpZmZlcmVuY2VTZWxmXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RV0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRGLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEcsIFwiZGlmZmVyZW5jZVNlbGZcIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0SCwgXCJkaWZmZXJlbmNlU2VsZlwiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEZdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Rywgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG4gICAgICB9KVxuXG4gICAgICB0ZXN0KFwiZGlmZmVyZW5jZU5ld1wiLCAoKTogdm9pZCA9PiB7XG4gICAgICAgIGxldCByZXN1bHRzOiBVVFhPU2V0XG4gICAgICAgIGxldCB0ZXN0OiBib29sZWFuXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRBLCBcImRpZmZlcmVuY2VOZXdcIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RiwgXCJkaWZmZXJlbmNlTmV3XCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RV0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRGLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEcsIFwiZGlmZmVyZW5jZU5ld1wiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEhdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0R10pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRILCBcImRpZmZlcmVuY2VOZXdcIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRIXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEYsIHNldEddKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuICAgICAgfSlcblxuICAgICAgdGVzdChcInN5bURpZmZlcmVuY2VcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0czogVVRYT1NldFxuICAgICAgICBsZXQgdGVzdDogYm9vbGVhblxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0QSwgXCJzeW1EaWZmZXJlbmNlXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RF0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRFLCBzZXRGLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEYsIFwic3ltRGlmZmVyZW5jZVwiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEVdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0Riwgc2V0Rywgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRHLCBcInN5bURpZmZlcmVuY2VcIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRIXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEYsIHNldEddKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0SCwgXCJzeW1EaWZmZXJlbmNlXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0R10sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRGLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHRlc3QoXCJ1bmlvblwiLCAoKTogdm9pZCA9PiB7XG4gICAgICAgIGxldCByZXN1bHRzOiBVVFhPU2V0XG4gICAgICAgIGxldCB0ZXN0OiBib29sZWFuXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRBLCBcInVuaW9uXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0Rl0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEYsIFwidW5pb25cIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRGXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEcsIHNldEhdKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RywgXCJ1bmlvblwiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEddLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRILCBcInVuaW9uXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0R10sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRGLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHRlc3QoXCJ1bmlvbk1pbnVzTmV3XCIsICgpOiB2b2lkID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdHM6IFVUWE9TZXRcbiAgICAgICAgbGV0IHRlc3Q6IGJvb2xlYW5cblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEEsIFwidW5pb25NaW51c05ld1wiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldERdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RSwgc2V0Riwgc2V0Rywgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRGLCBcInVuaW9uTWludXNOZXdcIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RywgXCJ1bmlvbk1pbnVzTmV3XCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RV0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRGLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEgsIFwidW5pb25NaW51c05ld1wiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEZdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Rywgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG4gICAgICB9KVxuXG4gICAgICB0ZXN0KFwidW5pb25NaW51c1NlbGZcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0czogVVRYT1NldFxuICAgICAgICBsZXQgdGVzdDogYm9vbGVhblxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0QSwgXCJ1bmlvbk1pbnVzU2VsZlwiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEVdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0Riwgc2V0Rywgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRGLCBcInVuaW9uTWludXNTZWxmXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RV0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRGLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEcsIFwidW5pb25NaW51c1NlbGZcIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRIXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEYsIHNldEddKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0SCwgXCJ1bmlvbk1pbnVzU2VsZlwiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEhdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0R10pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG59KVxuIl19