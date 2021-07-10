"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("src/utils/bintools"));
const utxos_1 = require("src/apis/platformvm/utxos");
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
        const u1hex = u1.toBuffer().toString("hex");
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
    test("Serialization", () => {
        const set = new utxos_1.UTXOSet();
        set.addArray([...utxostrs]);
        let setobj = set.serialize("cb58");
        let setstr = JSON.stringify(setobj);
        let set2newobj = JSON.parse(setstr);
        let set2 = new utxos_1.UTXOSet();
        set2.deserialize(set2newobj, "cb58");
        let set2obj = set2.serialize("cb58");
        let set2str = JSON.stringify(set2obj);
        expect(set2.getAllUTXOStrings().sort().join(",")).toBe(set.getAllUTXOStrings().sort().join(","));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXR4b3MudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3RzL2FwaXMvcGxhdGZvcm12bS91dHhvcy50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsa0RBQXNCO0FBQ3RCLG9DQUFnQztBQUNoQyxrRUFBeUM7QUFDekMscURBQXlEO0FBRXpELCtEQUFtRDtBQUduRCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sT0FBTyxHQUF1QixTQUFTLENBQUE7QUFFN0MsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFTLEVBQUU7SUFDMUIsTUFBTSxPQUFPLEdBQVcsOE9BQThPLENBQUE7SUFDdFEsTUFBTSxTQUFTLEdBQVcsVUFBVSxDQUFBO0lBQ3BDLE1BQU0sT0FBTyxHQUFXLGtFQUFrRSxDQUFBO0lBQzFGLE1BQU0sTUFBTSxHQUFXLGtFQUFrRSxDQUFBO0lBQ3pGLE1BQU0sUUFBUSxHQUFXLGVBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBRXBELFVBQVU7SUFDVixNQUFNLFNBQVMsR0FBVyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3ZELHlLQUF5SztJQUV6SyxvQ0FBb0M7SUFDcEMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFTLEVBQUU7UUFDMUIsTUFBTSxFQUFFLEdBQVMsSUFBSSxZQUFJLEVBQUUsQ0FBQTtRQUMzQixFQUFFLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQ3ZCLE1BQU0sS0FBSyxHQUFXLEVBQUUsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDbkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtJQUM3QixDQUFDLENBQUMsQ0FBQTtJQUVGLElBQUksQ0FBQyxnQkFBZ0IsRUFB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QWdCLENBQUE7Z0JBQ3BCLElBQUksSUFBYSxDQUFBO2dCQUVqQixPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUE7Z0JBQ2hELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUV2QixPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUE7Z0JBQ2hELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUV2QixPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUE7Z0JBQ2hELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUV2QixPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUE7Z0JBQ2hELElBQUksR0FBRyxjQUFjLENB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SUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUV2QixPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUE7Z0JBQ2hELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUV2QixPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUE7Z0JBQ2hELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUV2QixPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLENBQUE7Z0JBQ2hELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3pCLENBQUMsQ0FBQyxDQUFBO1lBRUYsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQVMsRUFBRTtnQkFDaEMsSUFBSSxPQUFnQixDQUFBO2dCQUNwQixJQUFJLElBQWEsQ0FBQTtnQkFFakIsT0FBTyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUE7Z0JBQ2pELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUV2QixPQUFPLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQTtnQkFDakQsSUFBSSxHQUFHLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7Z0JBQ2xGLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7Z0JBRXZCLE9BQU8sR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFBO2dCQUNqRCxJQUFJLEdBQUcsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQTtnQkFDbEYsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFFdkIsT0FBTyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUE7Z0JBQ2pELElBQUksR0FBRyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBO2dCQUNsRixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3pCLENBQUMsQ0FBQyxDQUFBO1FBQ0osQ0FBQyxDQUFDLENBQUE7SUFDSixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcInNyYy91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgeyBVVFhPLCBVVFhPU2V0IH0gZnJvbSBcInNyYy9hcGlzL3BsYXRmb3Jtdm0vdXR4b3NcIlxuaW1wb3J0IHsgQW1vdW50T3V0cHV0IH0gZnJvbSBcInNyYy9hcGlzL3BsYXRmb3Jtdm0vb3V0cHV0c1wiXG5pbXBvcnQgeyBVbml4Tm93IH0gZnJvbSBcInNyYy91dGlscy9oZWxwZXJmdW5jdGlvbnNcIlxuaW1wb3J0IHsgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSBcInNyYy91dGlsc1wiXG5cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IGRpc3BsYXk6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiZGlzcGxheVwiXG5cbmRlc2NyaWJlKFwiVVRYT1wiLCAoKTogdm9pZCA9PiB7XG4gIGNvbnN0IHV0eG9oZXg6IHN0cmluZyA9IFwiMDAwMDM4ZDFiOWYxMTM4NjcyZGE2ZmI2YzM1MTI1NTM5Mjc2YTlhY2MyYTY2OGQ2M2JlYTZiYTNjNzk1ZTJlZGIwZjUwMDAwMDAwMTNlMDdlMzhlMmYyMzEyMWJlODc1NjQxMmMxOGRiNzI0NmExNmQyNmVlOTkzNmYzY2JhMjhiZTE0OWNmZDM1NTgwMDAwMDAwNzAwMDAwMDAwMDAwMDRkZDUwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMWEzNmZkMGMyZGJjYWIzMTE3MzFkZGU3ZWYxNTE0YmQyNmZjZGM3NGRcIlxuICBjb25zdCBvdXRwdXRpZHg6IHN0cmluZyA9IFwiMDAwMDAwMDFcIlxuICBjb25zdCBvdXR0eGlkOiBzdHJpbmcgPSBcIjM4ZDFiOWYxMTM4NjcyZGE2ZmI2YzM1MTI1NTM5Mjc2YTlhY2MyYTY2OGQ2M2JlYTZiYTNjNzk1ZTJlZGIwZjVcIlxuICBjb25zdCBvdXRhaWQ6IHN0cmluZyA9IFwiM2UwN2UzOGUyZjIzMTIxYmU4NzU2NDEyYzE4ZGI3MjQ2YTE2ZDI2ZWU5OTM2ZjNjYmEyOGJlMTQ5Y2ZkMzU1OFwiXG4gIGNvbnN0IHV0eG9idWZmOiBCdWZmZXIgPSBCdWZmZXIuZnJvbSh1dHhvaGV4LCBcImhleFwiKVxuXG4gIC8vIFBheW1lbnRcbiAgY29uc3QgT1BVVFhPc3RyOiBzdHJpbmcgPSBiaW50b29scy5jYjU4RW5jb2RlKHV0eG9idWZmKVxuICAvLyBcIlU5ckZnSzVqamRYbVY4azV0cHFlWGtpbXpyTjNvOWVDQ2NYZXN5aE1CQlp1OU1RSkNEVERvNVduNXBzS3Z6SlZNSnBpTWJka2ZEWGtwN3NLWmRkZkNaZHhwdURteU55N1ZGa2ExOXpNVzRqY3o2RFJRdk5mQTJrdkpZS2s5NnpjN3VpemdwM2kyRllXckI4bXIxc1BKOG9QOVRoNjRHUTV5SGQ4XCJcblxuICAvLyBpbXBsaWVzIGZyb21TdHJpbmcgYW5kIGZyb21CdWZmZXJcbiAgdGVzdChcIkNyZWF0aW9uXCIsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCB1MTogVVRYTyA9IG5ldyBVVFhPKClcbiAgICB1MS5mcm9tQnVmZmVyKHV0eG9idWZmKVxuICAgIGNvbnN0IHUxaGV4OiBzdHJpbmcgPSB1MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgZXhwZWN0KHUxaGV4KS50b0JlKHV0eG9oZXgpXG4gIH0pXG5cbiAgdGVzdChcIkVtcHR5IENyZWF0aW9uXCIsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCB1MTogVVRYTyA9IG5ldyBVVFhPKClcbiAgICBleHBlY3QoKCkgPT4ge1xuICAgICAgdTEudG9CdWZmZXIoKVxuICAgIH0pLnRvVGhyb3coKVxuICB9KVxuXG4gIHRlc3QoXCJDcmVhdGlvbiBvZiBUeXBlXCIsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBvcDogVVRYTyA9IG5ldyBVVFhPKClcbiAgICBvcC5mcm9tU3RyaW5nKE9QVVRYT3N0cilcbiAgICBleHBlY3Qob3AuZ2V0T3V0cHV0KCkuZ2V0T3V0cHV0SUQoKSkudG9CZSg3KVxuICB9KVxuXG4gIGRlc2NyaWJlKFwiRnVudGlvbmFsaXR5XCIsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCB1MTogVVRYTyA9IG5ldyBVVFhPKClcbiAgICB1MS5mcm9tQnVmZmVyKHV0eG9idWZmKVxuICAgIGNvbnN0IHUxaGV4OiBzdHJpbmcgPSB1MS50b0J1ZmZlcigpLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgdGVzdChcImdldEFzc2V0SUQgTm9uQ0FcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3QgYXNzZXRJRDogQnVmZmVyID0gdTEuZ2V0QXNzZXRJRCgpXG4gICAgICBleHBlY3QoYXNzZXRJRC50b1N0cmluZyhcImhleFwiLCAwLCBhc3NldElELmxlbmd0aCkpLnRvQmUob3V0YWlkKVxuICAgIH0pXG4gICAgdGVzdChcImdldFR4SURcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3QgdHhpZDogQnVmZmVyID0gdTEuZ2V0VHhJRCgpXG4gICAgICBleHBlY3QodHhpZC50b1N0cmluZyhcImhleFwiLCAwLCB0eGlkLmxlbmd0aCkpLnRvQmUob3V0dHhpZClcbiAgICB9KVxuICAgIHRlc3QoXCJnZXRPdXRwdXRJZHhcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3QgdHhpZHg6IEJ1ZmZlciA9IHUxLmdldE91dHB1dElkeCgpXG4gICAgICBleHBlY3QodHhpZHgudG9TdHJpbmcoXCJoZXhcIiwgMCwgdHhpZHgubGVuZ3RoKSkudG9CZShvdXRwdXRpZHgpXG4gICAgfSlcbiAgICB0ZXN0KFwiZ2V0VVRYT0lEXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGNvbnN0IHR4aWQ6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKG91dHR4aWQsIFwiaGV4XCIpXG4gICAgICBjb25zdCB0eGlkeDogQnVmZmVyID0gQnVmZmVyLmZyb20ob3V0cHV0aWR4LCBcImhleFwiKVxuICAgICAgY29uc3QgdXR4b2lkOiBzdHJpbmcgPSBiaW50b29scy5idWZmZXJUb0I1OChCdWZmZXIuY29uY2F0KFt0eGlkLCB0eGlkeF0pKVxuICAgICAgZXhwZWN0KHUxLmdldFVUWE9JRCgpKS50b0JlKHV0eG9pZClcbiAgICB9KVxuICAgIHRlc3QoXCJ0b1N0cmluZ1wiLCAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCBzZXJpYWxpemVkOiBzdHJpbmcgPSB1MS50b1N0cmluZygpXG4gICAgICBleHBlY3Qoc2VyaWFsaXplZCkudG9CZShiaW50b29scy5jYjU4RW5jb2RlKHV0eG9idWZmKSlcbiAgICB9KVxuICB9KVxufSlcblxuY29uc3Qgc2V0TWVyZ2VUZXN0ZXIgPSAoaW5wdXQ6IFVUWE9TZXQsIGVxdWFsOiBVVFhPU2V0W10sIG5vdEVxdWFsOiBVVFhPU2V0W10pOiBib29sZWFuID0+IHtcbiAgY29uc3QgaW5zdHI6IHN0cmluZyA9IEpTT04uc3RyaW5naWZ5KGlucHV0LmdldFVUWE9JRHMoKS5zb3J0KCkpXG4gIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBlcXVhbC5sZW5ndGg7IGkrKykge1xuICAgIGlmIChKU09OLnN0cmluZ2lmeShlcXVhbFtpXS5nZXRVVFhPSURzKCkuc29ydCgpKSAhPSBpbnN0cikge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IG5vdEVxdWFsLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KG5vdEVxdWFsW2ldLmdldFVUWE9JRHMoKS5zb3J0KCkpID09IGluc3RyKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWVcbn1cblxuZGVzY3JpYmUoXCJVVFhPU2V0XCIsICgpOiB2b2lkID0+IHtcbiAgY29uc3QgdXR4b3N0cnM6IHN0cmluZ1tdID0gW1xuICAgIGJpbnRvb2xzLmNiNThFbmNvZGUoQnVmZmVyLmZyb20oXCIwMDAwMzhkMWI5ZjExMzg2NzJkYTZmYjZjMzUxMjU1MzkyNzZhOWFjYzJhNjY4ZDYzYmVhNmJhM2M3OTVlMmVkYjBmNTAwMDAwMDAxM2UwN2UzOGUyZjIzMTIxYmU4NzU2NDEyYzE4ZGI3MjQ2YTE2ZDI2ZWU5OTM2ZjNjYmEyOGJlMTQ5Y2ZkMzU1ODAwMDAwMDA3MDAwMDAwMDAwMDAwNGRkNTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAxYTM2ZmQwYzJkYmNhYjMxMTczMWRkZTdlZjE1MTRiZDI2ZmNkYzc0ZFwiLCBcImhleFwiKSksXG4gICAgYmludG9vbHMuY2I1OEVuY29kZShCdWZmZXIuZnJvbShcIjAwMDBjM2U0ODIzNTcxNTg3ZmUyYmRmYzUwMjY4OWY1YTgyMzhiOWQwZWE3ZjMyNzcxMjRkMTZhZjlkZTBkMmQ5OTExMDAwMDAwMDAzZTA3ZTM4ZTJmMjMxMjFiZTg3NTY0MTJjMThkYjcyNDZhMTZkMjZlZTk5MzZmM2NiYTI4YmUxNDljZmQzNTU4MDAwMDAwMDcwMDAwMDAwMDAwMDAwMDE5MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDFlMWI2YjZhNGJhZDk0ZDJlM2YyMDczMDM3OWI5YmNkNmYxNzYzMThlXCIsIFwiaGV4XCIpKSxcbiAgICBiaW50b29scy5jYjU4RW5jb2RlKEJ1ZmZlci5mcm9tKFwiMDAwMGYyOWRiYTYxZmRhOGQ1N2E5MTFlN2Y4ODEwZjkzNWJkZTgxMGQzZjhkNDk1NDA0Njg1YmRiOGQ5ZDg1NDVlODYwMDAwMDAwMDNlMDdlMzhlMmYyMzEyMWJlODc1NjQxMmMxOGRiNzI0NmExNmQyNmVlOTkzNmYzY2JhMjhiZTE0OWNmZDM1NTgwMDAwMDAwNzAwMDAwMDAwMDAwMDAwMTkwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDEwMDAwMDAwMWUxYjZiNmE0YmFkOTRkMmUzZjIwNzMwMzc5YjliY2Q2ZjE3NjMxOGVcIiwgXCJoZXhcIikpLFxuICBdXG4gIGNvbnN0IGFkZHJzOiBCdWZmZXJbXSA9IFtcbiAgICBiaW50b29scy5jYjU4RGVjb2RlKFwiRnVCNkx3MkQ2Mk51TTh6cEdMQTRBdmVwcTdlR3NaUmlHXCIpLFxuICAgIGJpbnRvb2xzLmNiNThEZWNvZGUoXCJNYVR2S0djY2JZekN4ekJrSnBiMnpIVzdFMVdSZVpxQjhcIiksXG4gIF1cbiAgdGVzdChcIkNyZWF0aW9uXCIsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBzZXQ6IFVUWE9TZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgc2V0LmFkZCh1dHhvc3Ryc1swXSlcbiAgICBjb25zdCB1dHhvOiBVVFhPID0gbmV3IFVUWE8oKVxuICAgIHV0eG8uZnJvbVN0cmluZyh1dHhvc3Ryc1swXSlcbiAgICBjb25zdCBzZXRBcnJheTogVVRYT1tdID0gc2V0LmdldEFsbFVUWE9zKClcbiAgICBleHBlY3QodXR4by50b1N0cmluZygpKS50b0JlKHNldEFycmF5WzBdLnRvU3RyaW5nKCkpXG5cbiAgfSlcblxuICB0ZXN0KFwiU2VyaWFsaXphdGlvblwiLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3Qgc2V0OiBVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKVxuICAgIHNldC5hZGRBcnJheShbLi4udXR4b3N0cnNdKVxuICAgIGxldCBzZXRvYmo6IG9iamVjdCA9IHNldC5zZXJpYWxpemUoXCJjYjU4XCIpXG4gICAgbGV0IHNldHN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoc2V0b2JqKVxuICAgIGxldCBzZXQybmV3b2JqOiBvYmplY3QgPSBKU09OLnBhcnNlKHNldHN0cilcbiAgICBsZXQgc2V0MjogVVRYT1NldCA9IG5ldyBVVFhPU2V0KClcbiAgICBzZXQyLmRlc2VyaWFsaXplKHNldDJuZXdvYmosIFwiY2I1OFwiKVxuICAgIGxldCBzZXQyb2JqOiBvYmplY3QgPSBzZXQyLnNlcmlhbGl6ZShcImNiNThcIilcbiAgICBsZXQgc2V0MnN0cjogc3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoc2V0Mm9iailcbiAgICBleHBlY3Qoc2V0Mi5nZXRBbGxVVFhPU3RyaW5ncygpLnNvcnQoKS5qb2luKFwiLFwiKSkudG9CZShzZXQuZ2V0QWxsVVRYT1N0cmluZ3MoKS5zb3J0KCkuam9pbihcIixcIikpXG4gIH0pXG5cbiAgdGVzdChcIk11dGxpcGxlIGFkZFwiLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3Qgc2V0OiBVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKVxuICAgIC8vIGZpcnN0IGFkZFxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB1dHhvc3Rycy5sZW5ndGg7IGkrKykge1xuICAgICAgc2V0LmFkZCh1dHhvc3Ryc1tpXSlcbiAgICB9XG4gICAgLy8gdGhlIHZlcmlmeSAoZG8gdGhlc2Ugc3RlcHMgc2VwYXJhdGUgdG8gZW5zdXJlIG5vIG92ZXJ3cml0ZXMpXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHV0eG9zdHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBleHBlY3Qoc2V0LmluY2x1ZGVzKHV0eG9zdHJzW2ldKSkudG9CZSh0cnVlKVxuICAgICAgY29uc3QgdXR4bzogVVRYTyA9IG5ldyBVVFhPKClcbiAgICAgIHV0eG8uZnJvbVN0cmluZyh1dHhvc3Ryc1tpXSlcbiAgICAgIGNvbnN0IHZlcml1dHhvOiBVVFhPID0gc2V0LmdldFVUWE8odXR4by5nZXRVVFhPSUQoKSkgYXMgVVRYT1xuICAgICAgZXhwZWN0KHZlcml1dHhvLnRvU3RyaW5nKCkpLnRvQmUodXR4b3N0cnNbaV0pXG4gICAgfVxuICB9KVxuXG4gIHRlc3QoXCJhZGRBcnJheVwiLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3Qgc2V0OiBVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKVxuICAgIHNldC5hZGRBcnJheSh1dHhvc3RycylcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdXR4b3N0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGUxOiBVVFhPID0gbmV3IFVUWE8oKVxuICAgICAgZTEuZnJvbVN0cmluZyh1dHhvc3Ryc1tpXSlcbiAgICAgIGV4cGVjdChzZXQuaW5jbHVkZXMoZTEpKS50b0JlKHRydWUpXG4gICAgICBjb25zdCB1dHhvOiBVVFhPID0gbmV3IFVUWE8oKVxuICAgICAgdXR4by5mcm9tU3RyaW5nKHV0eG9zdHJzW2ldKVxuICAgICAgY29uc3QgdmVyaXV0eG86IFVUWE8gPSBzZXQuZ2V0VVRYTyh1dHhvLmdldFVUWE9JRCgpKSBhcyBVVFhPXG4gICAgICBleHBlY3QodmVyaXV0eG8udG9TdHJpbmcoKSkudG9CZSh1dHhvc3Ryc1tpXSlcbiAgICB9XG5cbiAgICBzZXQuYWRkQXJyYXkoc2V0LmdldEFsbFVUWE9zKCkpXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHV0eG9zdHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCB1dHhvOiBVVFhPID0gbmV3IFVUWE8oKVxuICAgICAgdXR4by5mcm9tU3RyaW5nKHV0eG9zdHJzW2ldKVxuICAgICAgZXhwZWN0KHNldC5pbmNsdWRlcyh1dHhvKSkudG9CZSh0cnVlKVxuXG4gICAgICBjb25zdCB2ZXJpdXR4bzogVVRYTyA9IHNldC5nZXRVVFhPKHV0eG8uZ2V0VVRYT0lEKCkpIGFzIFVUWE9cbiAgICAgIGV4cGVjdCh2ZXJpdXR4by50b1N0cmluZygpKS50b0JlKHV0eG9zdHJzW2ldKVxuICAgIH1cbiAgICBsZXQgbzogb2JqZWN0ID0gc2V0LnNlcmlhbGl6ZShcImhleFwiKVxuICAgIGxldCBzOiBVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKVxuICAgIHMuZGVzZXJpYWxpemUobylcbiAgICBsZXQgdDogb2JqZWN0ID0gc2V0LnNlcmlhbGl6ZShkaXNwbGF5KVxuICAgIGxldCByOiBVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKVxuICAgIHIuZGVzZXJpYWxpemUodClcbiAgfSlcblxuICB0ZXN0KFwib3ZlcndyaXRpbmcgVVRYT1wiLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3Qgc2V0OiBVVFhPU2V0ID0gbmV3IFVUWE9TZXQoKVxuICAgIHNldC5hZGRBcnJheSh1dHhvc3RycylcbiAgICBjb25zdCB0ZXN0dXR4bzogVVRYTyA9IG5ldyBVVFhPKClcbiAgICB0ZXN0dXR4by5mcm9tU3RyaW5nKHV0eG9zdHJzWzBdKVxuICAgIGV4cGVjdChzZXQuYWRkKHV0eG9zdHJzWzBdLCB0cnVlKS50b1N0cmluZygpKS50b0JlKHRlc3R1dHhvLnRvU3RyaW5nKCkpXG4gICAgZXhwZWN0KHNldC5hZGQodXR4b3N0cnNbMF0sIGZhbHNlKSkudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KHNldC5hZGRBcnJheSh1dHhvc3RycywgdHJ1ZSkubGVuZ3RoKS50b0JlKDMpXG4gICAgZXhwZWN0KHNldC5hZGRBcnJheSh1dHhvc3RycywgZmFsc2UpLmxlbmd0aCkudG9CZSgwKVxuICB9KVxuXG4gIGRlc2NyaWJlKFwiRnVuY3Rpb25hbGl0eVwiLCAoKTogdm9pZCA9PiB7XG4gICAgbGV0IHNldDogVVRYT1NldFxuICAgIGxldCB1dHhvczogVVRYT1tdXG4gICAgYmVmb3JlRWFjaCgoKSA9PiB7XG4gICAgICBzZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgICBzZXQuYWRkQXJyYXkodXR4b3N0cnMpXG4gICAgICB1dHhvcyA9IHNldC5nZXRBbGxVVFhPcygpXG4gICAgfSlcblxuICAgIHRlc3QoXCJyZW1vdmVcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3QgdGVzdHV0eG86IFVUWE8gPSBuZXcgVVRYTygpXG4gICAgICB0ZXN0dXR4by5mcm9tU3RyaW5nKHV0eG9zdHJzWzBdKVxuICAgICAgZXhwZWN0KHNldC5yZW1vdmUodXR4b3N0cnNbMF0pLnRvU3RyaW5nKCkpLnRvQmUodGVzdHV0eG8udG9TdHJpbmcoKSlcbiAgICAgIGV4cGVjdChzZXQucmVtb3ZlKHV0eG9zdHJzWzBdKSkudG9CZVVuZGVmaW5lZCgpXG4gICAgICBleHBlY3Qoc2V0LmFkZCh1dHhvc3Ryc1swXSwgZmFsc2UpLnRvU3RyaW5nKCkpLnRvQmUodGVzdHV0eG8udG9TdHJpbmcoKSlcbiAgICAgIGV4cGVjdChzZXQucmVtb3ZlKHV0eG9zdHJzWzBdKS50b1N0cmluZygpKS50b0JlKHRlc3R1dHhvLnRvU3RyaW5nKCkpXG4gICAgfSlcblxuICAgIHRlc3QoXCJyZW1vdmVBcnJheVwiLCAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCB0ZXN0dXR4bzogVVRYTyA9IG5ldyBVVFhPKClcbiAgICAgIHRlc3R1dHhvLmZyb21TdHJpbmcodXR4b3N0cnNbMF0pXG4gICAgICBleHBlY3Qoc2V0LnJlbW92ZUFycmF5KHV0eG9zdHJzKS5sZW5ndGgpLnRvQmUoMylcbiAgICAgIGV4cGVjdChzZXQucmVtb3ZlQXJyYXkodXR4b3N0cnMpLmxlbmd0aCkudG9CZSgwKVxuICAgICAgZXhwZWN0KHNldC5hZGQodXR4b3N0cnNbMF0sIGZhbHNlKS50b1N0cmluZygpKS50b0JlKHRlc3R1dHhvLnRvU3RyaW5nKCkpXG4gICAgICBleHBlY3Qoc2V0LnJlbW92ZUFycmF5KHV0eG9zdHJzKS5sZW5ndGgpLnRvQmUoMSlcbiAgICAgIGV4cGVjdChzZXQuYWRkQXJyYXkodXR4b3N0cnMsIGZhbHNlKS5sZW5ndGgpLnRvQmUoMylcbiAgICAgIGV4cGVjdChzZXQucmVtb3ZlQXJyYXkodXR4b3MpLmxlbmd0aCkudG9CZSgzKVxuICAgIH0pXG5cbiAgICB0ZXN0KFwiZ2V0VVRYT0lEc1wiLCAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCB1aWRzOiBzdHJpbmdbXSA9IHNldC5nZXRVVFhPSURzKClcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB1dHhvcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBleHBlY3QodWlkcy5pbmRleE9mKHV0eG9zW2ldLmdldFVUWE9JRCgpKSkubm90LnRvQmUoLTEpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRlc3QoXCJnZXRBbGxVVFhPc1wiLCAoKTogdm9pZCA9PiB7XG4gICAgICBjb25zdCBhbGx1dHhvczogVVRYT1tdID0gc2V0LmdldEFsbFVUWE9zKClcbiAgICAgIGNvbnN0IHVzdHJzOiBzdHJpbmdbXSA9IFtdXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgYWxsdXR4b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdXN0cnMucHVzaChhbGx1dHhvc1tpXS50b1N0cmluZygpKVxuICAgICAgfVxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHV0eG9zdHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGV4cGVjdCh1c3Rycy5pbmRleE9mKHV0eG9zdHJzW2ldKSkubm90LnRvQmUoLTEpXG4gICAgICB9XG4gICAgICBjb25zdCB1aWRzOiBzdHJpbmdbXSA9IHNldC5nZXRVVFhPSURzKClcbiAgICAgIGNvbnN0IGFsbHV0eG9zMjogVVRYT1tdID0gc2V0LmdldEFsbFVUWE9zKHVpZHMpXG4gICAgICBjb25zdCB1c3RyczI6IHN0cmluZ1tdID0gW11cbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBhbGx1dHhvcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB1c3RyczIucHVzaChhbGx1dHhvczJbaV0udG9TdHJpbmcoKSlcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB1dHhvc3Rycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBleHBlY3QodXN0cnMyLmluZGV4T2YodXR4b3N0cnNbaV0pKS5ub3QudG9CZSgtMSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGVzdChcImdldFVUWE9JRHMgQnkgQWRkcmVzc1wiLCAoKTogdm9pZCA9PiB7XG4gICAgICBsZXQgdXR4b2lkczogc3RyaW5nW11cbiAgICAgIHV0eG9pZHMgPSBzZXQuZ2V0VVRYT0lEcyhbYWRkcnNbMF1dKVxuICAgICAgZXhwZWN0KHV0eG9pZHMubGVuZ3RoKS50b0JlKDEpXG4gICAgICB1dHhvaWRzID0gc2V0LmdldFVUWE9JRHMoYWRkcnMpXG4gICAgICBleHBlY3QodXR4b2lkcy5sZW5ndGgpLnRvQmUoMylcbiAgICAgIHV0eG9pZHMgPSBzZXQuZ2V0VVRYT0lEcyhhZGRycywgZmFsc2UpXG4gICAgICBleHBlY3QodXR4b2lkcy5sZW5ndGgpLnRvQmUoMylcbiAgICB9KVxuXG4gICAgdGVzdChcImdldEFsbFVUWE9TdHJpbmdzXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGNvbnN0IHVzdHJzOiBzdHJpbmdbXSA9IHNldC5nZXRBbGxVVFhPU3RyaW5ncygpXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdXR4b3N0cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZXhwZWN0KHVzdHJzLmluZGV4T2YodXR4b3N0cnNbaV0pKS5ub3QudG9CZSgtMSlcbiAgICAgIH1cbiAgICAgIGNvbnN0IHVpZHM6IHN0cmluZ1tdID0gc2V0LmdldFVUWE9JRHMoKVxuICAgICAgY29uc3QgdXN0cnMyOiBzdHJpbmdbXSA9IHNldC5nZXRBbGxVVFhPU3RyaW5ncyh1aWRzKVxuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHV0eG9zdHJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGV4cGVjdCh1c3RyczIuaW5kZXhPZih1dHhvc3Ryc1tpXSkpLm5vdC50b0JlKC0xKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0ZXN0KFwiZ2V0QWRkcmVzc2VzXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGV4cGVjdChzZXQuZ2V0QWRkcmVzc2VzKCkuc29ydCgpKS50b1N0cmljdEVxdWFsKGFkZHJzLnNvcnQoKSlcbiAgICB9KVxuXG4gICAgdGVzdChcImdldEJhbGFuY2VcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgbGV0IGJhbGFuY2UxOiBCTlxuICAgICAgbGV0IGJhbGFuY2UyOiBCTlxuICAgICAgYmFsYW5jZTEgPSBuZXcgQk4oMClcbiAgICAgIGJhbGFuY2UyID0gbmV3IEJOKDApXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdXR4b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgYXNzZXRJRCA9IHV0eG9zW2ldLmdldEFzc2V0SUQoKVxuICAgICAgICBiYWxhbmNlMS5hZGQoc2V0LmdldEJhbGFuY2UoYWRkcnMsIGFzc2V0SUQpKVxuICAgICAgICBiYWxhbmNlMi5hZGQoKHV0eG9zW2ldLmdldE91dHB1dCgpIGFzIEFtb3VudE91dHB1dCkuZ2V0QW1vdW50KCkpXG4gICAgICB9XG4gICAgICBleHBlY3QoYmFsYW5jZTEudG9TdHJpbmcoKSkudG9CZShiYWxhbmNlMi50b1N0cmluZygpKVxuXG4gICAgICBiYWxhbmNlMSA9IG5ldyBCTigwKVxuICAgICAgYmFsYW5jZTIgPSBuZXcgQk4oMClcbiAgICAgIGNvbnN0IG5vdzogQk4gPSBVbml4Tm93KClcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB1dHhvcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBhc3NldElEID0gYmludG9vbHMuY2I1OEVuY29kZSh1dHhvc1tpXS5nZXRBc3NldElEKCkpXG4gICAgICAgIGJhbGFuY2UxLmFkZChzZXQuZ2V0QmFsYW5jZShhZGRycywgYXNzZXRJRCwgbm93KSlcbiAgICAgICAgYmFsYW5jZTIuYWRkKCh1dHhvc1tpXS5nZXRPdXRwdXQoKSBhcyBBbW91bnRPdXRwdXQpLmdldEFtb3VudCgpKVxuICAgICAgfVxuICAgICAgZXhwZWN0KGJhbGFuY2UxLnRvU3RyaW5nKCkpLnRvQmUoYmFsYW5jZTIudG9TdHJpbmcoKSlcbiAgICB9KVxuXG4gICAgdGVzdChcImdldEFzc2V0SURzXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGNvbnN0IGFzc2V0SURzOiBCdWZmZXJbXSA9IHNldC5nZXRBc3NldElEcygpXG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdXR4b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZXhwZWN0KGFzc2V0SURzKS50b0NvbnRhaW4odXR4b3NbaV0uZ2V0QXNzZXRJRCgpKVxuICAgICAgfVxuICAgICAgY29uc3QgYWRkcmVzc2VzOiBCdWZmZXJbXSA9IHNldC5nZXRBZGRyZXNzZXMoKVxuICAgICAgZXhwZWN0KHNldC5nZXRBc3NldElEcyhhZGRyZXNzZXMpKS50b0VxdWFsKHNldC5nZXRBc3NldElEcygpKVxuICAgIH0pXG5cbiAgICBkZXNjcmliZShcIk1lcmdlIFJ1bGVzXCIsICgpOiB2b2lkID0+IHtcbiAgICAgIGxldCBzZXRBOiBVVFhPU2V0XG4gICAgICBsZXQgc2V0QjogVVRYT1NldFxuICAgICAgbGV0IHNldEM6IFVUWE9TZXRcbiAgICAgIGxldCBzZXREOiBVVFhPU2V0XG4gICAgICBsZXQgc2V0RTogVVRYT1NldFxuICAgICAgbGV0IHNldEY6IFVUWE9TZXRcbiAgICAgIGxldCBzZXRHOiBVVFhPU2V0XG4gICAgICBsZXQgc2V0SDogVVRYT1NldFxuICAgICAgLy8gVGFrZS1vci1MZWF2ZVxuICAgICAgY29uc3QgbmV3dXR4bzogc3RyaW5nID0gYmludG9vbHMuY2I1OEVuY29kZShCdWZmZXIuZnJvbShcIjAwMDBhY2Y4ODY0N2IzZmJhYTlmZGY0Mzc4ZjNhMGRmNmE1ZDE1ZDhlZmIwMThhZDc4ZjEyNjkwMzkwZTc5ZTE2ODc2MDAwMDAwMDNhY2Y4ODY0N2IzZmJhYTlmZGY0Mzc4ZjNhMGRmNmE1ZDE1ZDhlZmIwMThhZDc4ZjEyNjkwMzkwZTc5ZTE2ODc2MDAwMDAwMDcwMDAwMDAwMDAwMDE4NmEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMDAwMDAwMDFmY2VkYThmOTBmY2I1ZDMwNjE0Yjk5ZDc5ZmM0YmFhMjkzMDc3NjI2XCIsIFwiaGV4XCIpKVxuXG4gICAgICBiZWZvcmVFYWNoKCgpOiB2b2lkID0+IHtcbiAgICAgICAgc2V0QSA9IG5ldyBVVFhPU2V0KClcbiAgICAgICAgc2V0QS5hZGRBcnJheShbdXR4b3N0cnNbMF0sIHV0eG9zdHJzWzJdXSlcblxuICAgICAgICBzZXRCID0gbmV3IFVUWE9TZXQoKVxuICAgICAgICBzZXRCLmFkZEFycmF5KFt1dHhvc3Ryc1sxXSwgdXR4b3N0cnNbMl1dKVxuXG4gICAgICAgIHNldEMgPSBuZXcgVVRYT1NldCgpXG4gICAgICAgIHNldEMuYWRkQXJyYXkoW3V0eG9zdHJzWzBdLCB1dHhvc3Ryc1sxXV0pXG5cbiAgICAgICAgc2V0RCA9IG5ldyBVVFhPU2V0KClcbiAgICAgICAgc2V0RC5hZGRBcnJheShbdXR4b3N0cnNbMV1dKVxuXG4gICAgICAgIHNldEUgPSBuZXcgVVRYT1NldCgpXG4gICAgICAgIHNldEUuYWRkQXJyYXkoW10pLy8gZW1wdHkgc2V0XG5cbiAgICAgICAgc2V0RiA9IG5ldyBVVFhPU2V0KClcbiAgICAgICAgc2V0Ri5hZGRBcnJheSh1dHhvc3RycykgLy8gZnVsbCBzZXQsIHNlcGFyYXRlIGZyb20gc2VsZlxuXG4gICAgICAgIHNldEcgPSBuZXcgVVRYT1NldCgpXG4gICAgICAgIHNldEcuYWRkQXJyYXkoW25ld3V0eG8sIC4uLnV0eG9zdHJzXSkgLy8gZnVsbCBzZXQgd2l0aCBuZXcgZWxlbWVudFxuXG4gICAgICAgIHNldEggPSBuZXcgVVRYT1NldCgpXG4gICAgICAgIHNldEguYWRkQXJyYXkoW25ld3V0eG9dKSAvLyBzZXQgd2l0aCBvbmx5IGEgbmV3IGVsZW1lbnRcbiAgICAgIH0pXG5cbiAgICAgIHRlc3QoXCJ1bmtub3duIG1lcmdlIHJ1bGVcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgICBleHBlY3QoKCk6IHZvaWQgPT4ge1xuICAgICAgICAgIHNldC5tZXJnZUJ5UnVsZShzZXRBLCBcIkVSUk9SXCIpXG4gICAgICAgIH0pLnRvVGhyb3coKVxuICAgICAgICBjb25zdCBzZXRBcnJheTogVVRYT1tdID0gc2V0Ry5nZXRBbGxVVFhPcygpXG4gICAgICB9KVxuXG4gICAgICB0ZXN0KFwiaW50ZXJzZWN0aW9uXCIsICgpOiB2b2lkID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdHM6IFVUWE9TZXRcbiAgICAgICAgbGV0IHRlc3Q6IGJvb2xlYW5cblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEEsIFwiaW50ZXJzZWN0aW9uXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0QV0sIFtzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRGLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEYsIFwiaW50ZXJzZWN0aW9uXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0Rl0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEcsIFwiaW50ZXJzZWN0aW9uXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0Rl0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEgsIFwiaW50ZXJzZWN0aW9uXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RV0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRGLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHRlc3QoXCJkaWZmZXJlbmNlU2VsZlwiLCAoKTogdm9pZCA9PiB7XG4gICAgICAgIGxldCByZXN1bHRzOiBVVFhPU2V0XG4gICAgICAgIGxldCB0ZXN0OiBib29sZWFuXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRBLCBcImRpZmZlcmVuY2VTZWxmXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RF0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRFLCBzZXRGLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEYsIFwiZGlmZmVyZW5jZVNlbGZcIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RywgXCJkaWZmZXJlbmNlU2VsZlwiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEVdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0Riwgc2V0Rywgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRILCBcImRpZmZlcmVuY2VTZWxmXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0Rl0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHRlc3QoXCJkaWZmZXJlbmNlTmV3XCIsICgpOiB2b2lkID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdHM6IFVUWE9TZXRcbiAgICAgICAgbGV0IHRlc3Q6IGJvb2xlYW5cblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEEsIFwiZGlmZmVyZW5jZU5ld1wiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEVdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0Riwgc2V0Rywgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRGLCBcImRpZmZlcmVuY2VOZXdcIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RywgXCJkaWZmZXJlbmNlTmV3XCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0SF0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRGLCBzZXRHXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEgsIFwiZGlmZmVyZW5jZU5ld1wiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEhdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0R10pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG4gICAgICB9KVxuXG4gICAgICB0ZXN0KFwic3ltRGlmZmVyZW5jZVwiLCAoKTogdm9pZCA9PiB7XG4gICAgICAgIGxldCByZXN1bHRzOiBVVFhPU2V0XG4gICAgICAgIGxldCB0ZXN0OiBib29sZWFuXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRBLCBcInN5bURpZmZlcmVuY2VcIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXREXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEUsIHNldEYsIHNldEcsIHNldEhdKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RiwgXCJzeW1EaWZmZXJlbmNlXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RV0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRGLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEcsIFwic3ltRGlmZmVyZW5jZVwiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEhdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0R10pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRILCBcInN5bURpZmZlcmVuY2VcIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRHXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEYsIHNldEhdKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuICAgICAgfSlcblxuICAgICAgdGVzdChcInVuaW9uXCIsICgpOiB2b2lkID0+IHtcbiAgICAgICAgbGV0IHJlc3VsdHM6IFVUWE9TZXRcbiAgICAgICAgbGV0IHRlc3Q6IGJvb2xlYW5cblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEEsIFwidW5pb25cIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRGXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEcsIHNldEhdKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RiwgXCJ1bmlvblwiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEZdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Rywgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRHLCBcInVuaW9uXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0R10sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRGLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEgsIFwidW5pb25cIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRHXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEUsIHNldEYsIHNldEhdKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuICAgICAgfSlcblxuICAgICAgdGVzdChcInVuaW9uTWludXNOZXdcIiwgKCk6IHZvaWQgPT4ge1xuICAgICAgICBsZXQgcmVzdWx0czogVVRYT1NldFxuICAgICAgICBsZXQgdGVzdDogYm9vbGVhblxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0QSwgXCJ1bmlvbk1pbnVzTmV3XCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RF0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRFLCBzZXRGLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEYsIFwidW5pb25NaW51c05ld1wiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEVdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0Riwgc2V0Rywgc2V0SF0pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRHLCBcInVuaW9uTWludXNOZXdcIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0SCwgXCJ1bmlvbk1pbnVzTmV3XCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0Rl0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHRlc3QoXCJ1bmlvbk1pbnVzU2VsZlwiLCAoKTogdm9pZCA9PiB7XG4gICAgICAgIGxldCByZXN1bHRzOiBVVFhPU2V0XG4gICAgICAgIGxldCB0ZXN0OiBib29sZWFuXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRBLCBcInVuaW9uTWludXNTZWxmXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0RV0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRGLCBzZXRHLCBzZXRIXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcblxuICAgICAgICByZXN1bHRzID0gc2V0Lm1lcmdlQnlSdWxlKHNldEYsIFwidW5pb25NaW51c1NlbGZcIilcbiAgICAgICAgdGVzdCA9IHNldE1lcmdlVGVzdGVyKHJlc3VsdHMsIFtzZXRFXSwgW3NldEEsIHNldEIsIHNldEMsIHNldEQsIHNldEYsIHNldEcsIHNldEhdKVxuICAgICAgICBleHBlY3QodGVzdCkudG9CZSh0cnVlKVxuXG4gICAgICAgIHJlc3VsdHMgPSBzZXQubWVyZ2VCeVJ1bGUoc2V0RywgXCJ1bmlvbk1pbnVzU2VsZlwiKVxuICAgICAgICB0ZXN0ID0gc2V0TWVyZ2VUZXN0ZXIocmVzdWx0cywgW3NldEhdLCBbc2V0QSwgc2V0Qiwgc2V0Qywgc2V0RCwgc2V0RSwgc2V0Riwgc2V0R10pXG4gICAgICAgIGV4cGVjdCh0ZXN0KS50b0JlKHRydWUpXG5cbiAgICAgICAgcmVzdWx0cyA9IHNldC5tZXJnZUJ5UnVsZShzZXRILCBcInVuaW9uTWludXNTZWxmXCIpXG4gICAgICAgIHRlc3QgPSBzZXRNZXJnZVRlc3RlcihyZXN1bHRzLCBbc2V0SF0sIFtzZXRBLCBzZXRCLCBzZXRDLCBzZXRELCBzZXRFLCBzZXRGLCBzZXRHXSlcbiAgICAgICAgZXhwZWN0KHRlc3QpLnRvQmUodHJ1ZSlcbiAgICAgIH0pXG4gICAgfSlcbiAgfSlcbn0pXG4iXX0=