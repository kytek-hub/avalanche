"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const keychain_1 = require("src/apis/avm/keychain");
const index_1 = require("src/index");
const buffer_1 = require("buffer/");
const create_hash_1 = __importDefault(require("create-hash"));
const bintools_1 = __importDefault(require("src/utils/bintools"));
const bintools = bintools_1.default.getInstance();
const alias = 'X';
const hrp = "tests";
describe('AVMKeyPair', () => {
    const networkID = 12345;
    const ip = '127.0.0.1';
    const port = 9650;
    const protocol = 'https';
    const avalanche = new index_1.Avalanche(ip, port, protocol, networkID, undefined, undefined, undefined, true);
    test('human readable part', () => {
        let hrp = avalanche.getHRP();
        let networkID = avalanche.getNetworkID();
        expect(hrp).toBe("local");
        expect(networkID).toBe(12345);
        avalanche.setNetworkID(2);
        hrp = avalanche.getHRP();
        networkID = avalanche.getNetworkID();
        expect(hrp).toBe("cascade");
        expect(networkID).toBe(2);
        avalanche.setNetworkID(3);
        hrp = avalanche.getHRP();
        networkID = avalanche.getNetworkID();
        expect(hrp).toBe("denali");
        expect(networkID).toBe(3);
        avalanche.setNetworkID(4);
        hrp = avalanche.getHRP();
        networkID = avalanche.getNetworkID();
        expect(hrp).toBe("everest");
        expect(networkID).toBe(4);
        avalanche.setNetworkID(0);
        hrp = avalanche.getHRP();
        networkID = avalanche.getNetworkID();
        expect(hrp).toBe("custom");
        expect(networkID).toBe(0);
        avalanche.setNetworkID(1);
        hrp = avalanche.getHRP();
        networkID = avalanche.getNetworkID();
        expect(hrp).toBe("avax");
        expect(networkID).toBe(1);
        avalanche.setNetworkID(12345);
        hrp = avalanche.getHRP();
        networkID = avalanche.getNetworkID();
        expect(hrp).toBe("local");
        expect(networkID).toBe(12345);
    });
    test('repeatable 1', () => {
        const kp = new keychain_1.KeyPair(hrp, alias);
        kp.importKey(buffer_1.Buffer.from('ef9bf2d4436491c153967c9709dd8e82795bdb9b5ad44ee22c2903005d1cf676', 'hex'));
        expect(kp.getPublicKey().toString('hex')).toBe('033fad3644deb20d7a210d12757092312451c112d04773cee2699fbb59dc8bb2ef');
        const msg = buffer_1.Buffer.from(create_hash_1.default('sha256').update(buffer_1.Buffer.from('09090909', 'hex')).digest('hex'), 'hex');
        const sig = kp.sign(msg);
        expect(sig.length).toBe(65);
        expect(kp.verify(msg, sig)).toBe(true);
        expect(kp.recover(msg, sig).toString('hex')).toBe(kp.getPublicKey().toString('hex'));
    });
    test('repeatable 2', () => {
        const kp = new keychain_1.KeyPair(hrp, alias);
        kp.importKey(buffer_1.Buffer.from('17c692d4a99d12f629d9f0ff92ec0dba15c9a83e85487b085c1a3018286995c6', 'hex'));
        expect(kp.getPublicKey().toString('hex')).toBe('02486553b276cfe7abf0efbcd8d173e55db9c03da020c33d0b219df24124da18ee');
        const msg = buffer_1.Buffer.from(create_hash_1.default('sha256').update(buffer_1.Buffer.from('09090909', 'hex')).digest('hex'), 'hex');
        const sig = kp.sign(msg);
        expect(sig.length).toBe(65);
        expect(kp.verify(msg, sig)).toBe(true);
        expect(kp.recover(msg, sig).toString('hex')).toBe(kp.getPublicKey().toString('hex'));
    });
    test('repeatable 3', () => {
        const kp = new keychain_1.KeyPair(hrp, alias);
        kp.importKey(buffer_1.Buffer.from('d0e17d4b31380f96a42b3e9ffc4c1b2a93589a1e51d86d7edc107f602fbc7475', 'hex'));
        expect(kp.getPublicKey().toString('hex')).toBe('031475b91d4fcf52979f1cf107f058088cc2bea6edd51915790f27185a7586e2f2');
        const msg = buffer_1.Buffer.from(create_hash_1.default('sha256').update(buffer_1.Buffer.from('09090909', 'hex')).digest('hex'), 'hex');
        const sig = kp.sign(msg);
        expect(sig.length).toBe(65);
        expect(kp.verify(msg, sig)).toBe(true);
        expect(kp.recover(msg, sig).toString('hex')).toBe(kp.getPublicKey().toString('hex'));
    });
    test('Creation Empty', () => {
        const kp = new keychain_1.KeyPair(hrp, alias);
        expect(kp.getPrivateKey()).not.toBeUndefined();
        expect(kp.getAddress()).not.toBeUndefined();
        expect(kp.getPrivateKeyString()).not.toBeUndefined();
        expect(kp.getPublicKey()).not.toBeUndefined();
        expect(kp.getPublicKeyString()).not.toBeUndefined();
        const msg = buffer_1.Buffer.from(create_hash_1.default('sha256').update(buffer_1.Buffer.from('09090909', 'hex')).digest('hex'), 'hex');
        const sig = kp.sign(msg);
        expect(sig.length).toBe(65);
        expect(kp.verify(msg, sig)).toBe(true);
        expect(kp.recover(msg, sig).toString('hex')).toBe(kp.getPublicKey().toString('hex'));
    });
});
describe('AVMKeyChain', () => {
    test('importKey from Buffer', () => {
        const keybuff = buffer_1.Buffer.from('d0e17d4b31380f96a42b3e9ffc4c1b2a93589a1e51d86d7edc107f602fbc7475', 'hex');
        const kc = new keychain_1.KeyChain(hrp, alias);
        const kp2 = new keychain_1.KeyPair(hrp, alias);
        const addr1 = kc.importKey(keybuff).getAddress();
        const kp1 = kc.getKey(addr1);
        kp2.importKey(keybuff);
        const addr2 = kp1.getAddress();
        expect(addr1.toString('hex')).toBe(addr2.toString('hex'));
        expect(kp1.getPrivateKeyString()).toBe(kp2.getPrivateKeyString());
        expect(kp1.getPublicKeyString()).toBe(kp2.getPublicKeyString());
        expect(kc.hasKey(addr1)).toBe(true);
    });
    test('importKey from Buffer with leading zeros', () => {
        const keybuff = buffer_1.Buffer.from('00007d4b31380f96a42b3e9ffc4c1b2a93589a1e51d86d7edc107f602fbc7475', 'hex');
        expect(keybuff.length).toBe(32);
        const kc = new keychain_1.KeyChain(hrp, alias);
        const kp2 = new keychain_1.KeyPair(hrp, alias);
        const addr1 = kc.importKey(keybuff).getAddress();
        const kp1 = kc.getKey(addr1);
        kp2.importKey(keybuff);
        const addr2 = kp1.getAddress();
        expect(addr1.toString('hex')).toBe(addr2.toString('hex'));
        expect(kp1.getPrivateKeyString()).toBe(kp2.getPrivateKeyString());
        expect(kp1.getPrivateKey().length).toBe(32);
        expect(kp2.getPrivateKey().length).toBe(32);
        expect(kp1.getPublicKeyString()).toBe(kp2.getPublicKeyString());
        expect(kp1.getPublicKey().length).toBe(33);
        expect(kp2.getPublicKey().length).toBe(33);
        expect(kc.hasKey(addr1)).toBe(true);
    });
    test('importKey from serialized string', () => {
        const keybuff = buffer_1.Buffer.from('d0e17d4b31380f96a42b3e9ffc4c1b2a93589a1e51d86d7edc107f602fbc7475', 'hex');
        const kc = new keychain_1.KeyChain(hrp, alias);
        const kp2 = new keychain_1.KeyPair(hrp, alias);
        const addr1 = kc.importKey("PrivateKey-" + bintools.cb58Encode(keybuff)).getAddress();
        const kp1 = kc.getKey(addr1);
        kp2.importKey(keybuff);
        const addr2 = kp1.getAddress();
        expect(addr1.toString('hex')).toBe(addr2.toString('hex'));
        expect(kp1.getPrivateKeyString()).toBe(kp2.getPrivateKeyString());
        expect(kp1.getPublicKeyString()).toBe(kp2.getPublicKeyString());
        expect(kc.hasKey(addr1)).toBe(true);
    });
    test('removeKey via keypair', () => {
        const keybuff = buffer_1.Buffer.from('d0e17d4b31380f96a42b3e9ffc4c1b2a93589a1e51d86d7edc107f602fbc7475', 'hex');
        const kc = new keychain_1.KeyChain(hrp, alias);
        const kp1 = new keychain_1.KeyPair(hrp, alias);
        const addr1 = kc.importKey(keybuff).getAddress();
        kp1.importKey(keybuff);
        expect(kc.hasKey(addr1)).toBe(true);
        kc.removeKey(kp1);
        expect(kc.hasKey(addr1)).toBe(false);
    });
    test('removeKey via string', () => {
        const keybuff = buffer_1.Buffer.from('d0e17d4b31380f96a42b3e9ffc4c1b2a93589a1e51d86d7edc107f602fbc7475', 'hex');
        const kc = new keychain_1.KeyChain(hrp, alias);
        const addr1 = kc.importKey(keybuff).getAddress();
        expect(kc.hasKey(addr1)).toBe(true);
        kc.removeKey(addr1);
        expect(kc.hasKey(addr1)).toBe(false);
    });
    test('removeKey bad keys', () => {
        const keybuff = buffer_1.Buffer.from('d0e17d4b31380f96a42b3e9ffc4c1b2a93589a1e51d86d7edc107f602fbc7475', 'hex');
        const kc = new keychain_1.KeyChain(hrp, alias);
        const addr1 = kc.importKey(keybuff).getAddress();
        expect(kc.hasKey(addr1)).toBe(true);
        expect(kc.removeKey(bintools.cb58Decode('6Y3kysjF9jnHnYkdS9yGAuoHyae2eNmeV'))).toBe(false);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Y2hhaW4udGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3RzL2FwaXMvYXZtL2tleWNoYWluLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSxvREFBeUQ7QUFDekQscUNBQXFDO0FBQ3JDLG9DQUFnQztBQUNoQyw4REFBb0M7QUFDcEMsa0VBQXlDO0FBRXpDLE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxLQUFLLEdBQVcsR0FBRyxDQUFBO0FBQ3pCLE1BQU0sR0FBRyxHQUFXLE9BQU8sQ0FBQTtBQUUzQixRQUFRLENBQUMsWUFBWSxFQUFFLEdBQVMsRUFBRTtJQUNoQyxNQUFNLFNBQVMsR0FBVyxLQUFLLENBQUE7SUFDL0IsTUFBTSxFQUFFLEdBQVcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sSUFBSSxHQUFXLElBQUksQ0FBQTtJQUN6QixNQUFNLFFBQVEsR0FBVyxPQUFPLENBQUE7SUFDaEMsTUFBTSxTQUFTLEdBQWMsSUFBSSxpQkFBUyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUVoSCxJQUFJLENBQUMscUJBQXFCLEVBQUUsR0FBUyxFQUFFO1FBQ3JDLElBQUksR0FBRyxHQUFXLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtRQUNwQyxJQUFJLFNBQVMsR0FBVyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUE7UUFDaEQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN6QixNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBRTdCLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxHQUFHLFNBQVMs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LElBQUksbUJBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDN0MsTUFBTSxLQUFLLEdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUN4RCxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNuQyxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLG1DQUFtQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUM1RixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgS2V5Q2hhaW4sIEtleVBhaXIgfSBmcm9tICdzcmMvYXBpcy9hdm0va2V5Y2hhaW4nXG5pbXBvcnQgeyBBdmFsYW5jaGUgfSBmcm9tICdzcmMvaW5kZXgnXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJ1xuaW1wb3J0IGNyZWF0ZUhhc2ggZnJvbSAnY3JlYXRlLWhhc2gnXG5pbXBvcnQgQmluVG9vbHMgZnJvbSAnc3JjL3V0aWxzL2JpbnRvb2xzJ1xuXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBhbGlhczogc3RyaW5nID0gJ1gnXG5jb25zdCBocnA6IHN0cmluZyA9IFwidGVzdHNcIlxuXG5kZXNjcmliZSgnQVZNS2V5UGFpcicsICgpOiB2b2lkID0+IHtcbiAgY29uc3QgbmV0d29ya0lEOiBudW1iZXIgPSAxMjM0NVxuICBjb25zdCBpcDogc3RyaW5nID0gJzEyNy4wLjAuMSdcbiAgY29uc3QgcG9ydDogbnVtYmVyID0gOTY1MFxuICBjb25zdCBwcm90b2NvbDogc3RyaW5nID0gJ2h0dHBzJ1xuICBjb25zdCBhdmFsYW5jaGU6IEF2YWxhbmNoZSA9IG5ldyBBdmFsYW5jaGUoaXAsIHBvcnQsIHByb3RvY29sLCBuZXR3b3JrSUQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHRydWUpXG5cbiAgdGVzdCgnaHVtYW4gcmVhZGFibGUgcGFydCcsICgpOiB2b2lkID0+IHtcbiAgICBsZXQgaHJwOiBzdHJpbmcgPSBhdmFsYW5jaGUuZ2V0SFJQKClcbiAgICBsZXQgbmV0d29ya0lEOiBudW1iZXIgPSBhdmFsYW5jaGUuZ2V0TmV0d29ya0lEKClcbiAgICBleHBlY3QoaHJwKS50b0JlKFwibG9jYWxcIilcbiAgICBleHBlY3QobmV0d29ya0lEKS50b0JlKDEyMzQ1KVxuXG4gICAgYXZhbGFuY2hlLnNldE5ldHdvcmtJRCgyKVxuICAgIGhycCA9IGF2YWxhbmNoZS5nZXRIUlAoKVxuICAgIG5ldHdvcmtJRCA9IGF2YWxhbmNoZS5nZXROZXR3b3JrSUQoKVxuICAgIGV4cGVjdChocnApLnRvQmUoXCJjYXNjYWRlXCIpXG4gICAgZXhwZWN0KG5ldHdvcmtJRCkudG9CZSgyKVxuXG4gICAgYXZhbGFuY2hlLnNldE5ldHdvcmtJRCgzKVxuICAgIGhycCA9IGF2YWxhbmNoZS5nZXRIUlAoKVxuICAgIG5ldHdvcmtJRCA9IGF2YWxhbmNoZS5nZXROZXR3b3JrSUQoKVxuICAgIGV4cGVjdChocnApLnRvQmUoXCJkZW5hbGlcIilcbiAgICBleHBlY3QobmV0d29ya0lEKS50b0JlKDMpXG5cbiAgICBhdmFsYW5jaGUuc2V0TmV0d29ya0lEKDQpXG4gICAgaHJwID0gYXZhbGFuY2hlLmdldEhSUCgpXG4gICAgbmV0d29ya0lEID0gYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpXG4gICAgZXhwZWN0KGhycCkudG9CZShcImV2ZXJlc3RcIilcbiAgICBleHBlY3QobmV0d29ya0lEKS50b0JlKDQpXG5cbiAgICBhdmFsYW5jaGUuc2V0TmV0d29ya0lEKDApXG4gICAgaHJwID0gYXZhbGFuY2hlLmdldEhSUCgpXG4gICAgbmV0d29ya0lEID0gYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpXG4gICAgZXhwZWN0KGhycCkudG9CZShcImN1c3RvbVwiKVxuICAgIGV4cGVjdChuZXR3b3JrSUQpLnRvQmUoMClcblxuICAgIGF2YWxhbmNoZS5zZXROZXR3b3JrSUQoMSlcbiAgICBocnAgPSBhdmFsYW5jaGUuZ2V0SFJQKClcbiAgICBuZXR3b3JrSUQgPSBhdmFsYW5jaGUuZ2V0TmV0d29ya0lEKClcbiAgICBleHBlY3QoaHJwKS50b0JlKFwiYXZheFwiKVxuICAgIGV4cGVjdChuZXR3b3JrSUQpLnRvQmUoMSlcblxuICAgIGF2YWxhbmNoZS5zZXROZXR3b3JrSUQoMTIzNDUpXG4gICAgaHJwID0gYXZhbGFuY2hlLmdldEhSUCgpXG4gICAgbmV0d29ya0lEID0gYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpXG4gICAgZXhwZWN0KGhycCkudG9CZShcImxvY2FsXCIpXG4gICAgZXhwZWN0KG5ldHdvcmtJRCkudG9CZSgxMjM0NSlcbiAgfSlcblxuICB0ZXN0KCdyZXBlYXRhYmxlIDEnLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3Qga3A6IEtleVBhaXIgPSBuZXcgS2V5UGFpcihocnAsIGFsaWFzKVxuICAgIGtwLmltcG9ydEtleShCdWZmZXIuZnJvbSgnZWY5YmYyZDQ0MzY0OTFjMTUzOTY3Yzk3MDlkZDhlODI3OTViZGI5YjVhZDQ0ZWUyMmMyOTAzMDA1ZDFjZjY3NicsICdoZXgnKSlcbiAgICBleHBlY3Qoa3AuZ2V0UHVibGljS2V5KCkudG9TdHJpbmcoJ2hleCcpKS50b0JlKCcwMzNmYWQzNjQ0ZGViMjBkN2EyMTBkMTI3NTcwOTIzMTI0NTFjMTEyZDA0NzczY2VlMjY5OWZiYjU5ZGM4YmIyZWYnKVxuXG4gICAgY29uc3QgbXNnOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShjcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUoQnVmZmVyLmZyb20oJzA5MDkwOTA5JywgJ2hleCcpKS5kaWdlc3QoJ2hleCcpLCAnaGV4JylcbiAgICBjb25zdCBzaWc6IEJ1ZmZlciA9IGtwLnNpZ24obXNnKVxuXG4gICAgZXhwZWN0KHNpZy5sZW5ndGgpLnRvQmUoNjUpXG4gICAgZXhwZWN0KGtwLnZlcmlmeShtc2csIHNpZykpLnRvQmUodHJ1ZSlcbiAgICBleHBlY3Qoa3AucmVjb3Zlcihtc2csIHNpZykudG9TdHJpbmcoJ2hleCcpKS50b0JlKGtwLmdldFB1YmxpY0tleSgpLnRvU3RyaW5nKCdoZXgnKSlcbiAgfSlcblxuICB0ZXN0KCdyZXBlYXRhYmxlIDInLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3Qga3A6IEtleVBhaXIgPSBuZXcgS2V5UGFpcihocnAsIGFsaWFzKVxuICAgIGtwLmltcG9ydEtleShCdWZmZXIuZnJvbSgnMTdjNjkyZDRhOTlkMTJmNjI5ZDlmMGZmOTJlYzBkYmExNWM5YTgzZTg1NDg3YjA4NWMxYTMwMTgyODY5OTVjNicsICdoZXgnKSlcbiAgICBleHBlY3Qoa3AuZ2V0UHVibGljS2V5KCkudG9TdHJpbmcoJ2hleCcpKS50b0JlKCcwMjQ4NjU1M2IyNzZjZmU3YWJmMGVmYmNkOGQxNzNlNTVkYjljMDNkYTAyMGMzM2QwYjIxOWRmMjQxMjRkYTE4ZWUnKVxuXG4gICAgY29uc3QgbXNnOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShjcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUoQnVmZmVyLmZyb20oJzA5MDkwOTA5JywgJ2hleCcpKS5kaWdlc3QoJ2hleCcpLCAnaGV4JylcbiAgICBjb25zdCBzaWc6IEJ1ZmZlciA9IGtwLnNpZ24obXNnKVxuXG4gICAgZXhwZWN0KHNpZy5sZW5ndGgpLnRvQmUoNjUpXG4gICAgZXhwZWN0KGtwLnZlcmlmeShtc2csIHNpZykpLnRvQmUodHJ1ZSlcbiAgICBleHBlY3Qoa3AucmVjb3Zlcihtc2csIHNpZykudG9TdHJpbmcoJ2hleCcpKS50b0JlKGtwLmdldFB1YmxpY0tleSgpLnRvU3RyaW5nKCdoZXgnKSlcbiAgfSlcblxuICB0ZXN0KCdyZXBlYXRhYmxlIDMnLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3Qga3A6IEtleVBhaXIgPSBuZXcgS2V5UGFpcihocnAsIGFsaWFzKVxuICAgIGtwLmltcG9ydEtleShCdWZmZXIuZnJvbSgnZDBlMTdkNGIzMTM4MGY5NmE0MmIzZTlmZmM0YzFiMmE5MzU4OWExZTUxZDg2ZDdlZGMxMDdmNjAyZmJjNzQ3NScsICdoZXgnKSlcbiAgICBleHBlY3Qoa3AuZ2V0UHVibGljS2V5KCkudG9TdHJpbmcoJ2hleCcpKS50b0JlKCcwMzE0NzViOTFkNGZjZjUyOTc5ZjFjZjEwN2YwNTgwODhjYzJiZWE2ZWRkNTE5MTU3OTBmMjcxODVhNzU4NmUyZjInKVxuXG4gICAgY29uc3QgbXNnOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShjcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUoQnVmZmVyLmZyb20oJzA5MDkwOTA5JywgJ2hleCcpKS5kaWdlc3QoJ2hleCcpLCAnaGV4JylcbiAgICBjb25zdCBzaWc6IEJ1ZmZlciA9IGtwLnNpZ24obXNnKVxuXG4gICAgZXhwZWN0KHNpZy5sZW5ndGgpLnRvQmUoNjUpXG4gICAgZXhwZWN0KGtwLnZlcmlmeShtc2csIHNpZykpLnRvQmUodHJ1ZSlcbiAgICBleHBlY3Qoa3AucmVjb3Zlcihtc2csIHNpZykudG9TdHJpbmcoJ2hleCcpKS50b0JlKGtwLmdldFB1YmxpY0tleSgpLnRvU3RyaW5nKCdoZXgnKSlcbiAgfSlcblxuICB0ZXN0KCdDcmVhdGlvbiBFbXB0eScsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBrcDogS2V5UGFpciA9IG5ldyBLZXlQYWlyKGhycCwgYWxpYXMpXG4gICAgZXhwZWN0KGtwLmdldFByaXZhdGVLZXkoKSkubm90LnRvQmVVbmRlZmluZWQoKVxuICAgIGV4cGVjdChrcC5nZXRBZGRyZXNzKCkpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3Qoa3AuZ2V0UHJpdmF0ZUtleVN0cmluZygpKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KGtwLmdldFB1YmxpY0tleSgpKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KGtwLmdldFB1YmxpY0tleVN0cmluZygpKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgY29uc3QgbXNnOiBCdWZmZXIgPSBCdWZmZXIuZnJvbShjcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUoQnVmZmVyLmZyb20oJzA5MDkwOTA5JywgJ2hleCcpKS5kaWdlc3QoJ2hleCcpLCAnaGV4JylcbiAgICBjb25zdCBzaWc6IEJ1ZmZlciA9IGtwLnNpZ24obXNnKVxuXG4gICAgZXhwZWN0KHNpZy5sZW5ndGgpLnRvQmUoNjUpXG4gICAgZXhwZWN0KGtwLnZlcmlmeShtc2csIHNpZykpLnRvQmUodHJ1ZSlcbiAgICBleHBlY3Qoa3AucmVjb3Zlcihtc2csIHNpZykudG9TdHJpbmcoJ2hleCcpKS50b0JlKGtwLmdldFB1YmxpY0tleSgpLnRvU3RyaW5nKCdoZXgnKSlcbiAgfSlcbn0pXG5cbmRlc2NyaWJlKCdBVk1LZXlDaGFpbicsICgpOiB2b2lkID0+IHtcbiAgdGVzdCgnaW1wb3J0S2V5IGZyb20gQnVmZmVyJywgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGtleWJ1ZmY6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKCdkMGUxN2Q0YjMxMzgwZjk2YTQyYjNlOWZmYzRjMWIyYTkzNTg5YTFlNTFkODZkN2VkYzEwN2Y2MDJmYmM3NDc1JywgJ2hleCcpXG4gICAgY29uc3Qga2M6IEtleUNoYWluID0gbmV3IEtleUNoYWluKGhycCwgYWxpYXMpXG4gICAgY29uc3Qga3AyOiBLZXlQYWlyID0gbmV3IEtleVBhaXIoaHJwLCBhbGlhcylcbiAgICBjb25zdCBhZGRyMTogQnVmZmVyID0ga2MuaW1wb3J0S2V5KGtleWJ1ZmYpLmdldEFkZHJlc3MoKVxuICAgIGNvbnN0IGtwMTogS2V5UGFpciA9IGtjLmdldEtleShhZGRyMSlcbiAgICBrcDIuaW1wb3J0S2V5KGtleWJ1ZmYpXG4gICAgY29uc3QgYWRkcjIgPSBrcDEuZ2V0QWRkcmVzcygpXG4gICAgZXhwZWN0KGFkZHIxLnRvU3RyaW5nKCdoZXgnKSkudG9CZShhZGRyMi50b1N0cmluZygnaGV4JykpXG4gICAgZXhwZWN0KGtwMS5nZXRQcml2YXRlS2V5U3RyaW5nKCkpLnRvQmUoa3AyLmdldFByaXZhdGVLZXlTdHJpbmcoKSlcbiAgICBleHBlY3Qoa3AxLmdldFB1YmxpY0tleVN0cmluZygpKS50b0JlKGtwMi5nZXRQdWJsaWNLZXlTdHJpbmcoKSlcbiAgICBleHBlY3Qoa2MuaGFzS2V5KGFkZHIxKSkudG9CZSh0cnVlKVxuICB9KVxuXG5cbiAgdGVzdCgnaW1wb3J0S2V5IGZyb20gQnVmZmVyIHdpdGggbGVhZGluZyB6ZXJvcycsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBrZXlidWZmOiBCdWZmZXIgPSBCdWZmZXIuZnJvbSgnMDAwMDdkNGIzMTM4MGY5NmE0MmIzZTlmZmM0YzFiMmE5MzU4OWExZTUxZDg2ZDdlZGMxMDdmNjAyZmJjNzQ3NScsICdoZXgnKVxuICAgIGV4cGVjdChrZXlidWZmLmxlbmd0aCkudG9CZSgzMilcbiAgICBjb25zdCBrYzogS2V5Q2hhaW4gPSBuZXcgS2V5Q2hhaW4oaHJwLCBhbGlhcylcbiAgICBjb25zdCBrcDI6IEtleVBhaXIgPSBuZXcgS2V5UGFpcihocnAsIGFsaWFzKVxuICAgIGNvbnN0IGFkZHIxOiBCdWZmZXIgPSBrYy5pbXBvcnRLZXkoa2V5YnVmZikuZ2V0QWRkcmVzcygpXG4gICAgY29uc3Qga3AxOiBLZXlQYWlyID0ga2MuZ2V0S2V5KGFkZHIxKVxuICAgIGtwMi5pbXBvcnRLZXkoa2V5YnVmZilcbiAgICBjb25zdCBhZGRyMiA9IGtwMS5nZXRBZGRyZXNzKClcbiAgICBleHBlY3QoYWRkcjEudG9TdHJpbmcoJ2hleCcpKS50b0JlKGFkZHIyLnRvU3RyaW5nKCdoZXgnKSlcbiAgICBleHBlY3Qoa3AxLmdldFByaXZhdGVLZXlTdHJpbmcoKSkudG9CZShrcDIuZ2V0UHJpdmF0ZUtleVN0cmluZygpKVxuICAgIGV4cGVjdChrcDEuZ2V0UHJpdmF0ZUtleSgpLmxlbmd0aCkudG9CZSgzMilcbiAgICBleHBlY3Qoa3AyLmdldFByaXZhdGVLZXkoKS5sZW5ndGgpLnRvQmUoMzIpXG4gICAgZXhwZWN0KGtwMS5nZXRQdWJsaWNLZXlTdHJpbmcoKSkudG9CZShrcDIuZ2V0UHVibGljS2V5U3RyaW5nKCkpXG4gICAgZXhwZWN0KGtwMS5nZXRQdWJsaWNLZXkoKS5sZW5ndGgpLnRvQmUoMzMpXG4gICAgZXhwZWN0KGtwMi5nZXRQdWJsaWNLZXkoKS5sZW5ndGgpLnRvQmUoMzMpXG4gICAgZXhwZWN0KGtjLmhhc0tleShhZGRyMSkpLnRvQmUodHJ1ZSlcbiAgfSlcblxuICB0ZXN0KCdpbXBvcnRLZXkgZnJvbSBzZXJpYWxpemVkIHN0cmluZycsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBrZXlidWZmOiBCdWZmZXIgPSBCdWZmZXIuZnJvbSgnZDBlMTdkNGIzMTM4MGY5NmE0MmIzZTlmZmM0YzFiMmE5MzU4OWExZTUxZDg2ZDdlZGMxMDdmNjAyZmJjNzQ3NScsICdoZXgnKVxuICAgIGNvbnN0IGtjOiBLZXlDaGFpbiA9IG5ldyBLZXlDaGFpbihocnAsIGFsaWFzKVxuICAgIGNvbnN0IGtwMjogS2V5UGFpciA9IG5ldyBLZXlQYWlyKGhycCwgYWxpYXMpXG4gICAgY29uc3QgYWRkcjE6IEJ1ZmZlciA9IGtjLmltcG9ydEtleShcIlByaXZhdGVLZXktXCIgKyBiaW50b29scy5jYjU4RW5jb2RlKGtleWJ1ZmYpKS5nZXRBZGRyZXNzKClcbiAgICBjb25zdCBrcDE6IEtleVBhaXIgPSBrYy5nZXRLZXkoYWRkcjEpXG4gICAga3AyLmltcG9ydEtleShrZXlidWZmKVxuICAgIGNvbnN0IGFkZHIyID0ga3AxLmdldEFkZHJlc3MoKVxuICAgIGV4cGVjdChhZGRyMS50b1N0cmluZygnaGV4JykpLnRvQmUoYWRkcjIudG9TdHJpbmcoJ2hleCcpKVxuICAgIGV4cGVjdChrcDEuZ2V0UHJpdmF0ZUtleVN0cmluZygpKS50b0JlKGtwMi5nZXRQcml2YXRlS2V5U3RyaW5nKCkpXG4gICAgZXhwZWN0KGtwMS5nZXRQdWJsaWNLZXlTdHJpbmcoKSkudG9CZShrcDIuZ2V0UHVibGljS2V5U3RyaW5nKCkpXG4gICAgZXhwZWN0KGtjLmhhc0tleShhZGRyMSkpLnRvQmUodHJ1ZSlcbiAgfSlcblxuICB0ZXN0KCdyZW1vdmVLZXkgdmlhIGtleXBhaXInLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3Qga2V5YnVmZjogQnVmZmVyID0gQnVmZmVyLmZyb20oJ2QwZTE3ZDRiMzEzODBmOTZhNDJiM2U5ZmZjNGMxYjJhOTM1ODlhMWU1MWQ4NmQ3ZWRjMTA3ZjYwMmZiYzc0NzUnLCAnaGV4JylcbiAgICBjb25zdCBrYzogS2V5Q2hhaW4gPSBuZXcgS2V5Q2hhaW4oaHJwLCBhbGlhcylcbiAgICBjb25zdCBrcDE6IEtleVBhaXIgPSBuZXcgS2V5UGFpcihocnAsIGFsaWFzKVxuICAgIGNvbnN0IGFkZHIxOiBCdWZmZXIgPSBrYy5pbXBvcnRLZXkoa2V5YnVmZikuZ2V0QWRkcmVzcygpXG4gICAga3AxLmltcG9ydEtleShrZXlidWZmKVxuICAgIGV4cGVjdChrYy5oYXNLZXkoYWRkcjEpKS50b0JlKHRydWUpXG4gICAga2MucmVtb3ZlS2V5KGtwMSlcbiAgICBleHBlY3Qoa2MuaGFzS2V5KGFkZHIxKSkudG9CZShmYWxzZSlcbiAgfSlcblxuICB0ZXN0KCdyZW1vdmVLZXkgdmlhIHN0cmluZycsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBrZXlidWZmOiBCdWZmZXIgPSBCdWZmZXIuZnJvbSgnZDBlMTdkNGIzMTM4MGY5NmE0MmIzZTlmZmM0YzFiMmE5MzU4OWExZTUxZDg2ZDdlZGMxMDdmNjAyZmJjNzQ3NScsICdoZXgnKVxuICAgIGNvbnN0IGtjOiBLZXlDaGFpbiA9IG5ldyBLZXlDaGFpbihocnAsIGFsaWFzKVxuICAgIGNvbnN0IGFkZHIxOiBCdWZmZXIgPSBrYy5pbXBvcnRLZXkoa2V5YnVmZikuZ2V0QWRkcmVzcygpXG4gICAgZXhwZWN0KGtjLmhhc0tleShhZGRyMSkpLnRvQmUodHJ1ZSlcbiAgICBrYy5yZW1vdmVLZXkoYWRkcjEpXG4gICAgZXhwZWN0KGtjLmhhc0tleShhZGRyMSkpLnRvQmUoZmFsc2UpXG4gIH0pXG5cbiAgdGVzdCgncmVtb3ZlS2V5IGJhZCBrZXlzJywgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGtleWJ1ZmY6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKCdkMGUxN2Q0YjMxMzgwZjk2YTQyYjNlOWZmYzRjMWIyYTkzNTg5YTFlNTFkODZkN2VkYzEwN2Y2MDJmYmM3NDc1JywgJ2hleCcpXG4gICAgY29uc3Qga2M6IEtleUNoYWluID0gbmV3IEtleUNoYWluKGhycCwgYWxpYXMpXG4gICAgY29uc3QgYWRkcjE6IEJ1ZmZlciA9IGtjLmltcG9ydEtleShrZXlidWZmKS5nZXRBZGRyZXNzKClcbiAgICBleHBlY3Qoa2MuaGFzS2V5KGFkZHIxKSkudG9CZSh0cnVlKVxuICAgIGV4cGVjdChrYy5yZW1vdmVLZXkoYmludG9vbHMuY2I1OERlY29kZSgnNlkza3lzakY5am5IbllrZFM5eUdBdW9IeWFlMmVObWVWJykpKS50b0JlKGZhbHNlKVxuICB9KVxufSlcbiJdfQ==