"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("src/utils/bintools"));
const credentials_1 = require("src/common/credentials");
const output_1 = require("src/common/output");
const helperfunctions_1 = require("src/utils/helperfunctions");
const bintools = bintools_1.default.getInstance();
describe('UnixNow', () => {
    test('Does it return the right time?', () => {
        const now = Math.round((new Date()).getTime() / 1000);
        const unow = helperfunctions_1.UnixNow();
        expect(now / 10).toBeCloseTo(unow.divn(10).toNumber(), -1);
    });
});
describe('Signature & NBytes', () => {
    const sig = new credentials_1.Signature();
    const sigpop = [];
    for (let i = 0; i < sig.getSize(); i++) {
        sigpop[i] = i;
    }
    const sigbuff = buffer_1.Buffer.from(sigpop);
    const size = sig.fromBuffer(sigbuff);
    expect(sig.getSize()).toBe(size);
    expect(size).toBe(sig.getSize());
    const sigbuff2 = sig.toBuffer();
    for (let i = 0; i < sigbuff.length; i++) {
        expect(sigbuff2[i]).toBe(sigbuff[i]);
    }
    const sigbuffstr = bintools.bufferToB58(sigbuff);
    expect(sig.toString()).toBe(sigbuffstr);
    sig.fromString(sigbuffstr);
    expect(sig.toString()).toBe(sigbuffstr);
});
describe('SigIdx', () => {
    const sigidx = new credentials_1.SigIdx();
    expect(sigidx.getSize()).toBe(sigidx.toBuffer().length);
    sigidx.setSource(buffer_1.Buffer.from('abcd', 'hex'));
    expect(sigidx.getSource().toString('hex')).toBe('abcd');
});
describe('Address', () => {
    const addr1 = new output_1.Address();
    const addr2 = new output_1.Address();
    const smaller = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    const bigger = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];
    const addr1bytes = buffer_1.Buffer.from(smaller);
    const addr2bytes = buffer_1.Buffer.from(bigger);
    addr1.fromBuffer(addr1bytes);
    addr2.fromBuffer(addr2bytes);
    expect(output_1.Address.comparator()(addr1, addr2)).toBe(-1);
    expect(output_1.Address.comparator()(addr2, addr1)).toBe(1);
    const addr2str = addr2.toString();
    addr2.fromBuffer(addr1bytes);
    expect(output_1.Address.comparator()(addr1, addr2)).toBe(0);
    addr2.fromString(addr2str);
    expect(output_1.Address.comparator()(addr1, addr2)).toBe(-1);
    const a1b = addr1.toBuffer();
    const a1s = bintools.bufferToB58(a1b);
    addr2.fromString(a1s);
    expect(output_1.Address.comparator()(addr1, addr2)).toBe(0);
    const badbuff = bintools.copyFrom(addr1bytes);
    let badbuffout = buffer_1.Buffer.concat([badbuff, buffer_1.Buffer.from([1, 2])]);
    let badstr = bintools.bufferToB58(badbuffout);
    const badaddr = new output_1.Address();
    expect(() => {
        badaddr.fromString(badstr);
    }).toThrow('Error - Address.fromString: invalid address');
    badbuffout = buffer_1.Buffer.concat([badbuff, buffer_1.Buffer.from([1, 2, 3, 4])]);
    badstr = bintools.bufferToB58(badbuffout);
    expect(() => {
        badaddr.fromString(badstr);
    }).toThrow('Error - Address.fromString: invalid checksum on address');
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3RzL2FwaXMvYXZtL3R5cGVzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxvQ0FBZ0M7QUFDaEMsa0VBQXlDO0FBQ3pDLHdEQUEwRDtBQUMxRCw4Q0FBMkM7QUFDM0MsK0RBQW1EO0FBR25ELE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFakQsUUFBUSxDQUFDLFNBQVMsRUFBRSxHQUFTLEVBQUU7SUFDN0IsSUFBSSxDQUFDLGdDQUFnQyxFQUFFLEdBQVMsRUFBRTtRQUNoRCxNQUFNLEdBQUcsR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFBO1FBQzdELE1BQU0sSUFBSSxHQUFPLHlCQUFPLEVBQUUsQ0FBQTtRQUMxQixNQUFNLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDNUQsQ0FBQyxDQUFDLENBQUE7QUFDSixDQUFDLENBQUMsQ0FBQTtBQUVGLFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxHQUFTLEVBQUU7SUFDeEMsTUFBTSxHQUFHLEdBQWMsSUFBSSx1QkFBUyxFQUFFLENBQUE7SUFDdEMsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFBO0lBQzNCLEtBQUssSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDOUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTtLQUNkO0lBQ0QsTUFBTSxPQUFPLEdBQVcsZUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUMzQyxNQUFNLElBQUksR0FBVyxHQUFHLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQzVDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDaEMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtJQUNoQyxNQUFNLFFBQVEsR0FBVyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDdkMsS0FBSyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDL0MsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtLQUNyQztJQUNELE1BQU0sVUFBVSxHQUFXLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDeEQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUN2QyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUE7QUFDekMsQ0FBQyxDQUFDLENBQUE7QUFFRixRQUFRLENBQUMsUUFBUSxFQUFFLEdBQVMsRUFBRTtJQUM1QixNQUFNLE1BQU0sR0FBVyxJQUFJLG9CQUFNLEVBQUUsQ0FBQTtJQUNuQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUN2RCxNQUFNLENBQUMsU0FBUyxDQUFDLGVBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDNUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7QUFDekQsQ0FBQyxDQUFDLENBQUE7QUFFRixRQUFRLENBQUMsU0FBUyxFQUFFLEdBQVMsRUFBRTtJQUM3QixNQUFNLEtBQUssR0FBWSxJQUFJLGdCQUFPLEVBQUUsQ0FBQTtJQUNwQyxNQUFNLEtBQUssR0FBWSxJQUFJLGdCQUFPLEVBQUUsQ0FBQTtJQUNwQyxNQUFNLE9BQU8sR0FBYSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUN0RixNQUFNLE1BQU0sR0FBYSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUNyRixNQUFNLFVBQVUsR0FBVyxlQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQy9DLE1BQU0sVUFBVSxHQUFXLGVBQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7SUFDOUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUM1QixLQUFLLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQzVCLE1BQU0sQ0FBQyxnQkFBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ25ELE1BQU0sQ0FBQyxnQkFBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUVsRCxNQUFNLFFBQVEsR0FBVyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUE7SUFFekMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUM1QixNQUFNLENBQUMsZ0JBQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFbEQsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUMxQixNQUFNLENBQUMsZ0JBQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUNuRCxNQUFNLEdBQUcsR0FBVyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUE7SUFDcEMsTUFBTSxHQUFHLEdBQVcsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQTtJQUM3QyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQ3JCLE1BQU0sQ0FBQyxnQkFBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUVsRCxNQUFNLE9BQU8sR0FBVyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQ3JELElBQUksVUFBVSxHQUFXLGVBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsZUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN0RSxJQUFJLE1BQU0sR0FBVyxRQUFRLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFBO0lBQ3JELE1BQU0sT0FBTyxHQUFZLElBQUksZ0JBQU8sRUFBRSxDQUFBO0lBRXRDLE1BQU0sQ0FBQyxHQUFTLEVBQUU7UUFDaEIsT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQTtJQUM1QixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsNkNBQTZDLENBQUMsQ0FBQTtJQUV6RCxVQUFVLEdBQUcsZUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxlQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDaEUsTUFBTSxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUE7SUFDekMsTUFBTSxDQUFDLEdBQVMsRUFBRTtRQUNoQixPQUFPLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQzVCLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyx5REFBeUQsQ0FBQyxDQUFBO0FBQ3ZFLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLydcbmltcG9ydCBCaW5Ub29scyBmcm9tICdzcmMvdXRpbHMvYmludG9vbHMnXG5pbXBvcnQgeyBTaWdJZHgsIFNpZ25hdHVyZSB9IGZyb20gJ3NyYy9jb21tb24vY3JlZGVudGlhbHMnXG5pbXBvcnQgeyBBZGRyZXNzIH0gZnJvbSAnc3JjL2NvbW1vbi9vdXRwdXQnXG5pbXBvcnQgeyBVbml4Tm93IH0gZnJvbSAnc3JjL3V0aWxzL2hlbHBlcmZ1bmN0aW9ucydcbmltcG9ydCBCTiBmcm9tICdibi5qcydcblxuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuXG5kZXNjcmliZSgnVW5peE5vdycsICgpOiB2b2lkID0+IHtcbiAgdGVzdCgnRG9lcyBpdCByZXR1cm4gdGhlIHJpZ2h0IHRpbWU/JywgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IG5vdzogbnVtYmVyID0gTWF0aC5yb3VuZCgobmV3IERhdGUoKSkuZ2V0VGltZSgpIC8gMTAwMClcbiAgICBjb25zdCB1bm93OiBCTiA9IFVuaXhOb3coKVxuICAgIGV4cGVjdChub3cgLyAxMCkudG9CZUNsb3NlVG8odW5vdy5kaXZuKDEwKS50b051bWJlcigpLCAtMSlcbiAgfSlcbn0pXG5cbmRlc2NyaWJlKCdTaWduYXR1cmUgJiBOQnl0ZXMnLCAoKTogdm9pZCA9PiB7XG4gIGNvbnN0IHNpZzogU2lnbmF0dXJlID0gbmV3IFNpZ25hdHVyZSgpXG4gIGNvbnN0IHNpZ3BvcDogbnVtYmVyW10gPSBbXVxuICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgc2lnLmdldFNpemUoKTsgaSsrKSB7XG4gICAgc2lncG9wW2ldID0gaVxuICB9XG4gIGNvbnN0IHNpZ2J1ZmY6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKHNpZ3BvcClcbiAgY29uc3Qgc2l6ZTogbnVtYmVyID0gc2lnLmZyb21CdWZmZXIoc2lnYnVmZilcbiAgZXhwZWN0KHNpZy5nZXRTaXplKCkpLnRvQmUoc2l6ZSlcbiAgZXhwZWN0KHNpemUpLnRvQmUoc2lnLmdldFNpemUoKSlcbiAgY29uc3Qgc2lnYnVmZjI6IEJ1ZmZlciA9IHNpZy50b0J1ZmZlcigpXG4gIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBzaWdidWZmLmxlbmd0aDsgaSsrKSB7XG4gICAgZXhwZWN0KHNpZ2J1ZmYyW2ldKS50b0JlKHNpZ2J1ZmZbaV0pXG4gIH1cbiAgY29uc3Qgc2lnYnVmZnN0cjogc3RyaW5nID0gYmludG9vbHMuYnVmZmVyVG9CNTgoc2lnYnVmZilcbiAgZXhwZWN0KHNpZy50b1N0cmluZygpKS50b0JlKHNpZ2J1ZmZzdHIpXG4gIHNpZy5mcm9tU3RyaW5nKHNpZ2J1ZmZzdHIpXG4gIGV4cGVjdChzaWcudG9TdHJpbmcoKSkudG9CZShzaWdidWZmc3RyKVxufSlcblxuZGVzY3JpYmUoJ1NpZ0lkeCcsICgpOiB2b2lkID0+IHtcbiAgY29uc3Qgc2lnaWR4OiBTaWdJZHggPSBuZXcgU2lnSWR4KClcbiAgZXhwZWN0KHNpZ2lkeC5nZXRTaXplKCkpLnRvQmUoc2lnaWR4LnRvQnVmZmVyKCkubGVuZ3RoKVxuICBzaWdpZHguc2V0U291cmNlKEJ1ZmZlci5mcm9tKCdhYmNkJywgJ2hleCcpKVxuICBleHBlY3Qoc2lnaWR4LmdldFNvdXJjZSgpLnRvU3RyaW5nKCdoZXgnKSkudG9CZSgnYWJjZCcpXG59KVxuXG5kZXNjcmliZSgnQWRkcmVzcycsICgpOiB2b2lkID0+IHtcbiAgY29uc3QgYWRkcjE6IEFkZHJlc3MgPSBuZXcgQWRkcmVzcygpXG4gIGNvbnN0IGFkZHIyOiBBZGRyZXNzID0gbmV3IEFkZHJlc3MoKVxuICBjb25zdCBzbWFsbGVyOiBudW1iZXJbXSA9IFswLCAxLCAyLCAzLCA0LCA1LCA2LCA3LCA4LCA5LCA5LCA4LCA3LCA2LCA1LCA0LCAzLCAyLCAxLCAwXVxuICBjb25zdCBiaWdnZXI6IG51bWJlcltdID0gWzAsIDEsIDIsIDMsIDQsIDUsIDYsIDcsIDgsIDksIDksIDgsIDcsIDYsIDUsIDQsIDMsIDIsIDEsIDFdXG4gIGNvbnN0IGFkZHIxYnl0ZXM6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKHNtYWxsZXIpXG4gIGNvbnN0IGFkZHIyYnl0ZXM6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGJpZ2dlcilcbiAgYWRkcjEuZnJvbUJ1ZmZlcihhZGRyMWJ5dGVzKVxuICBhZGRyMi5mcm9tQnVmZmVyKGFkZHIyYnl0ZXMpXG4gIGV4cGVjdChBZGRyZXNzLmNvbXBhcmF0b3IoKShhZGRyMSwgYWRkcjIpKS50b0JlKC0xKVxuICBleHBlY3QoQWRkcmVzcy5jb21wYXJhdG9yKCkoYWRkcjIsIGFkZHIxKSkudG9CZSgxKVxuXG4gIGNvbnN0IGFkZHIyc3RyOiBzdHJpbmcgPSBhZGRyMi50b1N0cmluZygpXG5cbiAgYWRkcjIuZnJvbUJ1ZmZlcihhZGRyMWJ5dGVzKVxuICBleHBlY3QoQWRkcmVzcy5jb21wYXJhdG9yKCkoYWRkcjEsIGFkZHIyKSkudG9CZSgwKVxuXG4gIGFkZHIyLmZyb21TdHJpbmcoYWRkcjJzdHIpXG4gIGV4cGVjdChBZGRyZXNzLmNvbXBhcmF0b3IoKShhZGRyMSwgYWRkcjIpKS50b0JlKC0xKVxuICBjb25zdCBhMWI6IEJ1ZmZlciA9IGFkZHIxLnRvQnVmZmVyKClcbiAgY29uc3QgYTFzOiBzdHJpbmcgPSBiaW50b29scy5idWZmZXJUb0I1OChhMWIpXG4gIGFkZHIyLmZyb21TdHJpbmcoYTFzKVxuICBleHBlY3QoQWRkcmVzcy5jb21wYXJhdG9yKCkoYWRkcjEsIGFkZHIyKSkudG9CZSgwKVxuXG4gIGNvbnN0IGJhZGJ1ZmY6IEJ1ZmZlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGFkZHIxYnl0ZXMpXG4gIGxldCBiYWRidWZmb3V0OiBCdWZmZXIgPSBCdWZmZXIuY29uY2F0KFtiYWRidWZmLCBCdWZmZXIuZnJvbShbMSwgMl0pXSlcbiAgbGV0IGJhZHN0cjogc3RyaW5nID0gYmludG9vbHMuYnVmZmVyVG9CNTgoYmFkYnVmZm91dClcbiAgY29uc3QgYmFkYWRkcjogQWRkcmVzcyA9IG5ldyBBZGRyZXNzKClcblxuICBleHBlY3QoKCk6IHZvaWQgPT4ge1xuICAgIGJhZGFkZHIuZnJvbVN0cmluZyhiYWRzdHIpXG4gIH0pLnRvVGhyb3coJ0Vycm9yIC0gQWRkcmVzcy5mcm9tU3RyaW5nOiBpbnZhbGlkIGFkZHJlc3MnKVxuXG4gIGJhZGJ1ZmZvdXQgPSBCdWZmZXIuY29uY2F0KFtiYWRidWZmLCBCdWZmZXIuZnJvbShbMSwgMiwgMywgNF0pXSlcbiAgYmFkc3RyID0gYmludG9vbHMuYnVmZmVyVG9CNTgoYmFkYnVmZm91dClcbiAgZXhwZWN0KCgpOiB2b2lkID0+IHtcbiAgICBiYWRhZGRyLmZyb21TdHJpbmcoYmFkc3RyKVxuICB9KS50b1Rocm93KCdFcnJvciAtIEFkZHJlc3MuZnJvbVN0cmluZzogaW52YWxpZCBjaGVja3N1bSBvbiBhZGRyZXNzJylcbn0pXG4iXX0=