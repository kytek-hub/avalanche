"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const keychain_1 = require("src/apis/platformvm/keychain");
const index_1 = require("src/index");
const buffer_1 = require("buffer/");
const create_hash_1 = __importDefault(require("create-hash"));
const bintools_1 = __importDefault(require("src/utils/bintools"));
const bintools = bintools_1.default.getInstance();
const alias = 'P';
const hrp = "tests";
describe('PlatformVMKeyPair', () => {
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
describe('PlatformVMKeyChain', () => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Y2hhaW4udGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3RzL2FwaXMvcGxhdGZvcm12bS9rZXljaGFpbi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsMkRBQWdFO0FBQ2hFLHFDQUFxQztBQUNyQyxvQ0FBZ0M7QUFDaEMsOERBQW9DO0FBQ3BDLGtFQUF5QztBQUV6QyxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sS0FBSyxHQUFXLEdBQUcsQ0FBQTtBQUN6QixNQUFNLEdBQUcsR0FBVyxPQUFPLENBQUE7QUFDM0IsUUFBUSxDQUFDLG1CQUFtQixFQUFFLEdBQVMsRUFBRTtJQUN2QyxNQUFNLFNBQVMsR0FBVyxLQUFLLENBQUE7SUFDL0IsTUFBTSxFQUFFLEdBQVcsV0FBVyxDQUFBO0lBQzlCLE1BQU0sSUFBSSxHQUFXLElBQUksQ0FBQTtJQUN6QixNQUFNLFFBQVEsR0FBVyxPQUFPLENBQUE7SUFDaEMsTUFBTSxTQUFTLEdBQWMsSUFBSSxpQkFBUyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQTtJQUVoSCxJQUFJLENBQUMscUJBQXFCLEVBQUUsR0FBUyxFQUFFO1FBQ3JDLElBQUksR0FBRyxHQUFXLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtRQUNwQyxJQUFJLFNBQVMsR0FBVyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUE7UUFDaEQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN6QixNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBRTdCLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtRQUN4QixTQUFTLEdBQUcsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFBO1FBQ3BDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7UUFDM0IsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUV6QixTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDeEIsU0FBUyxHQUFHLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQTtRQUNwQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzFCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFekIsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN6QixHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFBO1FBQ3hCLFNBQVMsR0FBRyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUE7UUFDcEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUMzQixNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBRXpCLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDekIsR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQTtRQUN4QixTQUFTLEdBQUcsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFBO1FBQ3BDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDMUIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUV6QixTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3pCLEdBQUcsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUE7UUFDeEIsU0FBUyxHQUFHLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQTtRQUNwQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3hCLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFekIsU0FBUyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUM3QixHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFBO1FBQ3hCLFNBQVMsR0FBRyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUE7UUFDcEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN6QixNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQy9CLENBQUMsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFTLEVBQUU7UUFDOUIsTUFBTSxFQUFFLEdBQVksSUFBSSxrQkFBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUMzQyxFQUFFLENBQUMsU0FBUyxDQUFDLGVBQU0sQ0FBQyxJQUFJLENBQUMsa0VBQWtFLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtRQUNwRyxNQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxvRUFBb0UsQ0FBQyxDQUFBO1FBRXBILE1BQU0sR0FBRyxHQUFXLGVBQU0sQ0FBQyxJQUFJLENBQUMscUJBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDakgsTUFBTSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtRQUVoQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQTtRQUMzQixNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7UUFDdEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDdEYsQ0FBQyxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMsY0FBYyxFQUFFLEdBQVMsRUFBRTtRQUM5QixNQUFNLEVBQUUsR0FBWSxJQUFJLGtCQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQzNDLEVBQUUsQ0FBQyxTQUFTLENBQUMsZUFBTSxDQUFDLElBQUksQ0FBQyxrRUFBa0UsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFBO1FBQ3BHLE1BQU0sQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLG9FQUFvRSxDQUFDLENBQUE7UUFFcEgsTUFBTSxHQUFHLEdBQVcsZUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUNqSCxNQUFNLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBRWhDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQzNCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN0QyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUN0RixDQUFDLENBQUMsQ0FBQTtJQUVGLElBQUksQ0FBQyxjQUFjLEVBQUUsR0FBUyxFQUFFO1FBQzlCLE1BQU0sRUFBRSxHQUFZLElBQUksa0JBQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDM0MsRUFBRSxDQUFDLFNBQVMsQ0FBQyxlQUFNLENBQUMsSUFBSSxDQUFDLGtFQUFrRSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUE7UUFDcEcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsb0VBQW9FLENBQUMsQ0FBQTtRQUVwSCxNQUFNLEdBQUcsR0FBVyxlQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUFDLGVBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQ2pILE1BQU0sR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFFaEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDM0IsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ3RDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0lBQ3RGLENBQUMsQ0FBQyxDQUFBO0lBRUYsSUFBSSxDQUFDLGdCQUFnQixFQUFFLEdBQVMsRUFBRTtRQUNoQyxNQUFNLEVBQUUsR0FBWSxJQUFJLGtCQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQzNDLE1BQU0sQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUE7UUFDOUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUMzQyxNQUFNLENBQUMsRUFBRSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUE7UUFDcEQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQTtRQUM3QyxNQUFNLENBQUMsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLENBQUE7UUFDbkQsTUFBTSxHQUFHLEdBQVcsZUFBTSxDQUFDLElBQUksQ0FBQyxxQkFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUNqSCxNQUFNLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1FBRWhDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQzNCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN0QyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtJQUN0RixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUMsQ0FBQyxDQUFBO0FBRUYsUUFBUSxDQUFDLG9CQUFvQixFQUFFLEdBQVMsRUFBRTtJQUN4QyxJQUFJLENBQUMsdUJBQXVCLEVBQUUsR0FBUyxFQUFFO1FBQ3ZDLE1BQU0sT0FBTyxHQUFXLGVBQU0sQ0FBQyxJQUFJLENBQUMsa0VBQWtFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDOUcsTUFBTSxFQUFFLEdBQWEsSUFBSSxtQkFBUSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUM3QyxNQUFNLEdBQUcsR0FBWSxJQUFJLGtCQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQzVDLE1BQU0sS0FBSyxHQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUE7UUFDeEQsTUFBTSxHQUFHLEdBQVksRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNyQyxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3RCLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUM5QixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7UUFDekQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUE7UUFDakUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUE7UUFDL0QsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDckMsQ0FBQyxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMsMENBQTBDLEVBQUUsR0FBUyxFQUFFO1FBQzFELE1BQU0sT0FBTyxHQUFXLGVBQU0sQ0FBQyxJQUFJLENBQUMsa0VBQWtFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDOUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDL0IsTUFBTSxFQUFFLEdBQWEsSUFBSSxtQkFBUSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUM3QyxNQUFNLEdBQUcsR0FBWSxJQUFJLGtCQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQzVDLE1BQU0sS0FBSyxHQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUE7UUFDeEQsTUFBTSxHQUFHLEdBQVksRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUNyQyxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3RCLE1BQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUM5QixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7UUFDekQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUE7UUFDakUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDM0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDM0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUE7UUFDL0QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDMUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUE7UUFDMUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDckMsQ0FBQyxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMsa0NBQWtDLEVBQUUsR0FBUyxFQUFFO1FBQ2xELE1BQU0sT0FBTyxHQUFXLGVBQU0sQ0FBQyxJQUFJLENBQUMsa0VBQWtFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDOUcsTUFBTSxFQUFFLEdBQWEsSUFBSSxtQkFBUSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUM3QyxNQUFNLEdBQUcsR0FBWSxJQUFJLGtCQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQzVDLE1BQU0sS0FBSyxHQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUM3RixNQUFNLEdBQUcsR0FBWSxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO1FBQ3JDLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDdEIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQzlCLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQTtRQUN6RCxNQUFNLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQTtRQUNqRSxNQUFNLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQTtRQUMvRCxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNyQyxDQUFDLENBQUMsQ0FBQTtJQUVGLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxHQUFTLEVBQUU7UUFDdkMsTUFBTSxPQUFPLEdBQVcsZUFBTSxDQUFDLElBQUksQ0FBQyxrRUFBa0UsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUM5RyxNQUFNLEVBQUUsR0FBYSxJQUFJLG1CQUFRLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO1FBQzdDLE1BQU0sR0FBRyxHQUFZLElBQUksa0JBQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDNUMsTUFBTSxLQUFLLEdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtRQUN4RCxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQ3RCLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ25DLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDakIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDdEMsQ0FBQyxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMsc0JBQXNCLEVBQUUsR0FBUyxFQUFFO1FBQ3RDLE1BQU0sT0FBTyxHQUFXLGVBQU0sQ0FBQyxJQUFJLENBQUMsa0VBQWtFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDOUcsTUFBTSxFQUFFLEdBQWEsSUFBSSxtQkFBUSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUM3QyxNQUFNLEtBQUssR0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3hELE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ25DLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDbkIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDdEMsQ0FBQyxDQUFDLENBQUE7SUFFRixJQUFJLENBQUMsb0JBQW9CLEVBQUUsR0FBUyxFQUFFO1FBQ3BDLE1BQU0sT0FBTyxHQUFXLGVBQU0sQ0FBQyxJQUFJLENBQUMsa0VBQWtFLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDOUcsTUFBTSxFQUFFLEdBQWEsSUFBSSxtQkFBUSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQTtRQUM3QyxNQUFNLEtBQUssR0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFBO1FBQ3hELE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ25DLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsbUNBQW1DLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQzVGLENBQUMsQ0FBQyxDQUFBO0FBQ0osQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBLZXlDaGFpbiwgS2V5UGFpciB9IGZyb20gJ3NyYy9hcGlzL3BsYXRmb3Jtdm0va2V5Y2hhaW4nXG5pbXBvcnQgeyBBdmFsYW5jaGUgfSBmcm9tICdzcmMvaW5kZXgnXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJ1xuaW1wb3J0IGNyZWF0ZUhhc2ggZnJvbSAnY3JlYXRlLWhhc2gnXG5pbXBvcnQgQmluVG9vbHMgZnJvbSAnc3JjL3V0aWxzL2JpbnRvb2xzJ1xuXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBhbGlhczogc3RyaW5nID0gJ1AnXG5jb25zdCBocnA6IHN0cmluZyA9IFwidGVzdHNcIlxuZGVzY3JpYmUoJ1BsYXRmb3JtVk1LZXlQYWlyJywgKCk6IHZvaWQgPT4ge1xuICBjb25zdCBuZXR3b3JrSUQ6IG51bWJlciA9IDEyMzQ1XG4gIGNvbnN0IGlwOiBzdHJpbmcgPSAnMTI3LjAuMC4xJ1xuICBjb25zdCBwb3J0OiBudW1iZXIgPSA5NjUwXG4gIGNvbnN0IHByb3RvY29sOiBzdHJpbmcgPSAnaHR0cHMnXG4gIGNvbnN0IGF2YWxhbmNoZTogQXZhbGFuY2hlID0gbmV3IEF2YWxhbmNoZShpcCwgcG9ydCwgcHJvdG9jb2wsIG5ldHdvcmtJRCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdHJ1ZSlcblxuICB0ZXN0KCdodW1hbiByZWFkYWJsZSBwYXJ0JywgKCk6IHZvaWQgPT4ge1xuICAgIGxldCBocnA6IHN0cmluZyA9IGF2YWxhbmNoZS5nZXRIUlAoKVxuICAgIGxldCBuZXR3b3JrSUQ6IG51bWJlciA9IGF2YWxhbmNoZS5nZXROZXR3b3JrSUQoKVxuICAgIGV4cGVjdChocnApLnRvQmUoXCJsb2NhbFwiKVxuICAgIGV4cGVjdChuZXR3b3JrSUQpLnRvQmUoMTIzNDUpXG5cbiAgICBhdmFsYW5jaGUuc2V0TmV0d29ya0lEKDIpXG4gICAgaHJwID0gYXZhbGFuY2hlLmdldEhSUCgpXG4gICAgbmV0d29ya0lEID0gYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpXG4gICAgZXhwZWN0KGhycCkudG9CZShcImNhc2NhZGVcIilcbiAgICBleHBlY3QobmV0d29ya0lEKS50b0JlKDIpXG5cbiAgICBhdmFsYW5jaGUuc2V0TmV0d29ya0lEKDMpXG4gICAgaHJwID0gYXZhbGFuY2hlLmdldEhSUCgpXG4gICAgbmV0d29ya0lEID0gYXZhbGFuY2hlLmdldE5ldHdvcmtJRCgpXG4gICAgZXhwZWN0KGhycCkudG9CZShcImRlbmFsaVwiKVxuICAgIGV4cGVjdChuZXR3b3JrSUQpLnRvQmUoMylcblxuICAgIGF2YWxhbmNoZS5zZXROZXR3b3JrSUQoNClcbiAgICBocnAgPSBhdmFsYW5jaGUuZ2V0SFJQKClcbiAgICBuZXR3b3JrSUQgPSBhdmFsYW5jaGUuZ2V0TmV0d29ya0lEKClcbiAgICBleHBlY3QoaHJwKS50b0JlKFwiZXZlcmVzdFwiKVxuICAgIGV4cGVjdChuZXR3b3JrSUQpLnRvQmUoNClcblxuICAgIGF2YWxhbmNoZS5zZXROZXR3b3JrSUQoMClcbiAgICBocnAgPSBhdmFsYW5jaGUuZ2V0SFJQKClcbiAgICBuZXR3b3JrSUQgPSBhdmFsYW5jaGUuZ2V0TmV0d29ya0lEKClcbiAgICBleHBlY3QoaHJwKS50b0JlKFwiY3VzdG9tXCIpXG4gICAgZXhwZWN0KG5ldHdvcmtJRCkudG9CZSgwKVxuXG4gICAgYXZhbGFuY2hlLnNldE5ldHdvcmtJRCgxKVxuICAgIGhycCA9IGF2YWxhbmNoZS5nZXRIUlAoKVxuICAgIG5ldHdvcmtJRCA9IGF2YWxhbmNoZS5nZXROZXR3b3JrSUQoKVxuICAgIGV4cGVjdChocnApLnRvQmUoXCJhdmF4XCIpXG4gICAgZXhwZWN0KG5ldHdvcmtJRCkudG9CZSgxKVxuXG4gICAgYXZhbGFuY2hlLnNldE5ldHdvcmtJRCgxMjM0NSlcbiAgICBocnAgPSBhdmFsYW5jaGUuZ2V0SFJQKClcbiAgICBuZXR3b3JrSUQgPSBhdmFsYW5jaGUuZ2V0TmV0d29ya0lEKClcbiAgICBleHBlY3QoaHJwKS50b0JlKFwibG9jYWxcIilcbiAgICBleHBlY3QobmV0d29ya0lEKS50b0JlKDEyMzQ1KVxuICB9KVxuXG4gIHRlc3QoJ3JlcGVhdGFibGUgMScsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBrcDogS2V5UGFpciA9IG5ldyBLZXlQYWlyKGhycCwgYWxpYXMpXG4gICAga3AuaW1wb3J0S2V5KEJ1ZmZlci5mcm9tKCdlZjliZjJkNDQzNjQ5MWMxNTM5NjdjOTcwOWRkOGU4Mjc5NWJkYjliNWFkNDRlZTIyYzI5MDMwMDVkMWNmNjc2JywgJ2hleCcpKVxuICAgIGV4cGVjdChrcC5nZXRQdWJsaWNLZXkoKS50b1N0cmluZygnaGV4JykpLnRvQmUoJzAzM2ZhZDM2NDRkZWIyMGQ3YTIxMGQxMjc1NzA5MjMxMjQ1MWMxMTJkMDQ3NzNjZWUyNjk5ZmJiNTlkYzhiYjJlZicpXG5cbiAgICBjb25zdCBtc2c6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGNyZWF0ZUhhc2goJ3NoYTI1NicpLnVwZGF0ZShCdWZmZXIuZnJvbSgnMDkwOTA5MDknLCAnaGV4JykpLmRpZ2VzdCgnaGV4JyksICdoZXgnKVxuICAgIGNvbnN0IHNpZzogQnVmZmVyID0ga3Auc2lnbihtc2cpXG5cbiAgICBleHBlY3Qoc2lnLmxlbmd0aCkudG9CZSg2NSlcbiAgICBleHBlY3Qoa3AudmVyaWZ5KG1zZywgc2lnKSkudG9CZSh0cnVlKVxuICAgIGV4cGVjdChrcC5yZWNvdmVyKG1zZywgc2lnKS50b1N0cmluZygnaGV4JykpLnRvQmUoa3AuZ2V0UHVibGljS2V5KCkudG9TdHJpbmcoJ2hleCcpKVxuICB9KVxuXG4gIHRlc3QoJ3JlcGVhdGFibGUgMicsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBrcDogS2V5UGFpciA9IG5ldyBLZXlQYWlyKGhycCwgYWxpYXMpXG4gICAga3AuaW1wb3J0S2V5KEJ1ZmZlci5mcm9tKCcxN2M2OTJkNGE5OWQxMmY2MjlkOWYwZmY5MmVjMGRiYTE1YzlhODNlODU0ODdiMDg1YzFhMzAxODI4Njk5NWM2JywgJ2hleCcpKVxuICAgIGV4cGVjdChrcC5nZXRQdWJsaWNLZXkoKS50b1N0cmluZygnaGV4JykpLnRvQmUoJzAyNDg2NTUzYjI3NmNmZTdhYmYwZWZiY2Q4ZDE3M2U1NWRiOWMwM2RhMDIwYzMzZDBiMjE5ZGYyNDEyNGRhMThlZScpXG5cbiAgICBjb25zdCBtc2c6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGNyZWF0ZUhhc2goJ3NoYTI1NicpLnVwZGF0ZShCdWZmZXIuZnJvbSgnMDkwOTA5MDknLCAnaGV4JykpLmRpZ2VzdCgnaGV4JyksICdoZXgnKVxuICAgIGNvbnN0IHNpZzogQnVmZmVyID0ga3Auc2lnbihtc2cpXG5cbiAgICBleHBlY3Qoc2lnLmxlbmd0aCkudG9CZSg2NSlcbiAgICBleHBlY3Qoa3AudmVyaWZ5KG1zZywgc2lnKSkudG9CZSh0cnVlKVxuICAgIGV4cGVjdChrcC5yZWNvdmVyKG1zZywgc2lnKS50b1N0cmluZygnaGV4JykpLnRvQmUoa3AuZ2V0UHVibGljS2V5KCkudG9TdHJpbmcoJ2hleCcpKVxuICB9KVxuXG4gIHRlc3QoJ3JlcGVhdGFibGUgMycsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBrcDogS2V5UGFpciA9IG5ldyBLZXlQYWlyKGhycCwgYWxpYXMpXG4gICAga3AuaW1wb3J0S2V5KEJ1ZmZlci5mcm9tKCdkMGUxN2Q0YjMxMzgwZjk2YTQyYjNlOWZmYzRjMWIyYTkzNTg5YTFlNTFkODZkN2VkYzEwN2Y2MDJmYmM3NDc1JywgJ2hleCcpKVxuICAgIGV4cGVjdChrcC5nZXRQdWJsaWNLZXkoKS50b1N0cmluZygnaGV4JykpLnRvQmUoJzAzMTQ3NWI5MWQ0ZmNmNTI5NzlmMWNmMTA3ZjA1ODA4OGNjMmJlYTZlZGQ1MTkxNTc5MGYyNzE4NWE3NTg2ZTJmMicpXG5cbiAgICBjb25zdCBtc2c6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGNyZWF0ZUhhc2goJ3NoYTI1NicpLnVwZGF0ZShCdWZmZXIuZnJvbSgnMDkwOTA5MDknLCAnaGV4JykpLmRpZ2VzdCgnaGV4JyksICdoZXgnKVxuICAgIGNvbnN0IHNpZzogQnVmZmVyID0ga3Auc2lnbihtc2cpXG5cbiAgICBleHBlY3Qoc2lnLmxlbmd0aCkudG9CZSg2NSlcbiAgICBleHBlY3Qoa3AudmVyaWZ5KG1zZywgc2lnKSkudG9CZSh0cnVlKVxuICAgIGV4cGVjdChrcC5yZWNvdmVyKG1zZywgc2lnKS50b1N0cmluZygnaGV4JykpLnRvQmUoa3AuZ2V0UHVibGljS2V5KCkudG9TdHJpbmcoJ2hleCcpKVxuICB9KVxuXG4gIHRlc3QoJ0NyZWF0aW9uIEVtcHR5JywgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGtwOiBLZXlQYWlyID0gbmV3IEtleVBhaXIoaHJwLCBhbGlhcylcbiAgICBleHBlY3Qoa3AuZ2V0UHJpdmF0ZUtleSgpKS5ub3QudG9CZVVuZGVmaW5lZCgpXG4gICAgZXhwZWN0KGtwLmdldEFkZHJlc3MoKSkubm90LnRvQmVVbmRlZmluZWQoKVxuICAgIGV4cGVjdChrcC5nZXRQcml2YXRlS2V5U3RyaW5nKCkpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3Qoa3AuZ2V0UHVibGljS2V5KCkpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBleHBlY3Qoa3AuZ2V0UHVibGljS2V5U3RyaW5nKCkpLm5vdC50b0JlVW5kZWZpbmVkKClcbiAgICBjb25zdCBtc2c6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKGNyZWF0ZUhhc2goJ3NoYTI1NicpLnVwZGF0ZShCdWZmZXIuZnJvbSgnMDkwOTA5MDknLCAnaGV4JykpLmRpZ2VzdCgnaGV4JyksICdoZXgnKVxuICAgIGNvbnN0IHNpZzogQnVmZmVyID0ga3Auc2lnbihtc2cpXG5cbiAgICBleHBlY3Qoc2lnLmxlbmd0aCkudG9CZSg2NSlcbiAgICBleHBlY3Qoa3AudmVyaWZ5KG1zZywgc2lnKSkudG9CZSh0cnVlKVxuICAgIGV4cGVjdChrcC5yZWNvdmVyKG1zZywgc2lnKS50b1N0cmluZygnaGV4JykpLnRvQmUoa3AuZ2V0UHVibGljS2V5KCkudG9TdHJpbmcoJ2hleCcpKVxuICB9KVxufSlcblxuZGVzY3JpYmUoJ1BsYXRmb3JtVk1LZXlDaGFpbicsICgpOiB2b2lkID0+IHtcbiAgdGVzdCgnaW1wb3J0S2V5IGZyb20gQnVmZmVyJywgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGtleWJ1ZmY6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKCdkMGUxN2Q0YjMxMzgwZjk2YTQyYjNlOWZmYzRjMWIyYTkzNTg5YTFlNTFkODZkN2VkYzEwN2Y2MDJmYmM3NDc1JywgJ2hleCcpXG4gICAgY29uc3Qga2M6IEtleUNoYWluID0gbmV3IEtleUNoYWluKGhycCwgYWxpYXMpXG4gICAgY29uc3Qga3AyOiBLZXlQYWlyID0gbmV3IEtleVBhaXIoaHJwLCBhbGlhcylcbiAgICBjb25zdCBhZGRyMTogQnVmZmVyID0ga2MuaW1wb3J0S2V5KGtleWJ1ZmYpLmdldEFkZHJlc3MoKVxuICAgIGNvbnN0IGtwMTogS2V5UGFpciA9IGtjLmdldEtleShhZGRyMSlcbiAgICBrcDIuaW1wb3J0S2V5KGtleWJ1ZmYpXG4gICAgY29uc3QgYWRkcjIgPSBrcDEuZ2V0QWRkcmVzcygpXG4gICAgZXhwZWN0KGFkZHIxLnRvU3RyaW5nKCdoZXgnKSkudG9CZShhZGRyMi50b1N0cmluZygnaGV4JykpXG4gICAgZXhwZWN0KGtwMS5nZXRQcml2YXRlS2V5U3RyaW5nKCkpLnRvQmUoa3AyLmdldFByaXZhdGVLZXlTdHJpbmcoKSlcbiAgICBleHBlY3Qoa3AxLmdldFB1YmxpY0tleVN0cmluZygpKS50b0JlKGtwMi5nZXRQdWJsaWNLZXlTdHJpbmcoKSlcbiAgICBleHBlY3Qoa2MuaGFzS2V5KGFkZHIxKSkudG9CZSh0cnVlKVxuICB9KVxuXG4gIHRlc3QoJ2ltcG9ydEtleSBmcm9tIEJ1ZmZlciB3aXRoIGxlYWRpbmcgemVyb3MnLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3Qga2V5YnVmZjogQnVmZmVyID0gQnVmZmVyLmZyb20oJzAwMDA3ZDRiMzEzODBmOTZhNDJiM2U5ZmZjNGMxYjJhOTM1ODlhMWU1MWQ4NmQ3ZWRjMTA3ZjYwMmZiYzc0NzUnLCAnaGV4JylcbiAgICBleHBlY3Qoa2V5YnVmZi5sZW5ndGgpLnRvQmUoMzIpXG4gICAgY29uc3Qga2M6IEtleUNoYWluID0gbmV3IEtleUNoYWluKGhycCwgYWxpYXMpXG4gICAgY29uc3Qga3AyOiBLZXlQYWlyID0gbmV3IEtleVBhaXIoaHJwLCBhbGlhcylcbiAgICBjb25zdCBhZGRyMTogQnVmZmVyID0ga2MuaW1wb3J0S2V5KGtleWJ1ZmYpLmdldEFkZHJlc3MoKVxuICAgIGNvbnN0IGtwMTogS2V5UGFpciA9IGtjLmdldEtleShhZGRyMSlcbiAgICBrcDIuaW1wb3J0S2V5KGtleWJ1ZmYpXG4gICAgY29uc3QgYWRkcjIgPSBrcDEuZ2V0QWRkcmVzcygpXG4gICAgZXhwZWN0KGFkZHIxLnRvU3RyaW5nKCdoZXgnKSkudG9CZShhZGRyMi50b1N0cmluZygnaGV4JykpXG4gICAgZXhwZWN0KGtwMS5nZXRQcml2YXRlS2V5U3RyaW5nKCkpLnRvQmUoa3AyLmdldFByaXZhdGVLZXlTdHJpbmcoKSlcbiAgICBleHBlY3Qoa3AxLmdldFByaXZhdGVLZXkoKS5sZW5ndGgpLnRvQmUoMzIpXG4gICAgZXhwZWN0KGtwMi5nZXRQcml2YXRlS2V5KCkubGVuZ3RoKS50b0JlKDMyKVxuICAgIGV4cGVjdChrcDEuZ2V0UHVibGljS2V5U3RyaW5nKCkpLnRvQmUoa3AyLmdldFB1YmxpY0tleVN0cmluZygpKVxuICAgIGV4cGVjdChrcDEuZ2V0UHVibGljS2V5KCkubGVuZ3RoKS50b0JlKDMzKVxuICAgIGV4cGVjdChrcDIuZ2V0UHVibGljS2V5KCkubGVuZ3RoKS50b0JlKDMzKVxuICAgIGV4cGVjdChrYy5oYXNLZXkoYWRkcjEpKS50b0JlKHRydWUpXG4gIH0pXG5cbiAgdGVzdCgnaW1wb3J0S2V5IGZyb20gc2VyaWFsaXplZCBzdHJpbmcnLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3Qga2V5YnVmZjogQnVmZmVyID0gQnVmZmVyLmZyb20oJ2QwZTE3ZDRiMzEzODBmOTZhNDJiM2U5ZmZjNGMxYjJhOTM1ODlhMWU1MWQ4NmQ3ZWRjMTA3ZjYwMmZiYzc0NzUnLCAnaGV4JylcbiAgICBjb25zdCBrYzogS2V5Q2hhaW4gPSBuZXcgS2V5Q2hhaW4oaHJwLCBhbGlhcylcbiAgICBjb25zdCBrcDI6IEtleVBhaXIgPSBuZXcgS2V5UGFpcihocnAsIGFsaWFzKVxuICAgIGNvbnN0IGFkZHIxOiBCdWZmZXIgPSBrYy5pbXBvcnRLZXkoXCJQcml2YXRlS2V5LVwiICsgYmludG9vbHMuY2I1OEVuY29kZShrZXlidWZmKSkuZ2V0QWRkcmVzcygpXG4gICAgY29uc3Qga3AxOiBLZXlQYWlyID0ga2MuZ2V0S2V5KGFkZHIxKVxuICAgIGtwMi5pbXBvcnRLZXkoa2V5YnVmZilcbiAgICBjb25zdCBhZGRyMiA9IGtwMS5nZXRBZGRyZXNzKClcbiAgICBleHBlY3QoYWRkcjEudG9TdHJpbmcoJ2hleCcpKS50b0JlKGFkZHIyLnRvU3RyaW5nKCdoZXgnKSlcbiAgICBleHBlY3Qoa3AxLmdldFByaXZhdGVLZXlTdHJpbmcoKSkudG9CZShrcDIuZ2V0UHJpdmF0ZUtleVN0cmluZygpKVxuICAgIGV4cGVjdChrcDEuZ2V0UHVibGljS2V5U3RyaW5nKCkpLnRvQmUoa3AyLmdldFB1YmxpY0tleVN0cmluZygpKVxuICAgIGV4cGVjdChrYy5oYXNLZXkoYWRkcjEpKS50b0JlKHRydWUpXG4gIH0pXG5cbiAgdGVzdCgncmVtb3ZlS2V5IHZpYSBrZXlwYWlyJywgKCk6IHZvaWQgPT4ge1xuICAgIGNvbnN0IGtleWJ1ZmY6IEJ1ZmZlciA9IEJ1ZmZlci5mcm9tKCdkMGUxN2Q0YjMxMzgwZjk2YTQyYjNlOWZmYzRjMWIyYTkzNTg5YTFlNTFkODZkN2VkYzEwN2Y2MDJmYmM3NDc1JywgJ2hleCcpXG4gICAgY29uc3Qga2M6IEtleUNoYWluID0gbmV3IEtleUNoYWluKGhycCwgYWxpYXMpXG4gICAgY29uc3Qga3AxOiBLZXlQYWlyID0gbmV3IEtleVBhaXIoaHJwLCBhbGlhcylcbiAgICBjb25zdCBhZGRyMTogQnVmZmVyID0ga2MuaW1wb3J0S2V5KGtleWJ1ZmYpLmdldEFkZHJlc3MoKVxuICAgIGtwMS5pbXBvcnRLZXkoa2V5YnVmZilcbiAgICBleHBlY3Qoa2MuaGFzS2V5KGFkZHIxKSkudG9CZSh0cnVlKVxuICAgIGtjLnJlbW92ZUtleShrcDEpXG4gICAgZXhwZWN0KGtjLmhhc0tleShhZGRyMSkpLnRvQmUoZmFsc2UpXG4gIH0pXG5cbiAgdGVzdCgncmVtb3ZlS2V5IHZpYSBzdHJpbmcnLCAoKTogdm9pZCA9PiB7XG4gICAgY29uc3Qga2V5YnVmZjogQnVmZmVyID0gQnVmZmVyLmZyb20oJ2QwZTE3ZDRiMzEzODBmOTZhNDJiM2U5ZmZjNGMxYjJhOTM1ODlhMWU1MWQ4NmQ3ZWRjMTA3ZjYwMmZiYzc0NzUnLCAnaGV4JylcbiAgICBjb25zdCBrYzogS2V5Q2hhaW4gPSBuZXcgS2V5Q2hhaW4oaHJwLCBhbGlhcylcbiAgICBjb25zdCBhZGRyMTogQnVmZmVyID0ga2MuaW1wb3J0S2V5KGtleWJ1ZmYpLmdldEFkZHJlc3MoKVxuICAgIGV4cGVjdChrYy5oYXNLZXkoYWRkcjEpKS50b0JlKHRydWUpXG4gICAga2MucmVtb3ZlS2V5KGFkZHIxKVxuICAgIGV4cGVjdChrYy5oYXNLZXkoYWRkcjEpKS50b0JlKGZhbHNlKVxuICB9KVxuXG4gIHRlc3QoJ3JlbW92ZUtleSBiYWQga2V5cycsICgpOiB2b2lkID0+IHtcbiAgICBjb25zdCBrZXlidWZmOiBCdWZmZXIgPSBCdWZmZXIuZnJvbSgnZDBlMTdkNGIzMTM4MGY5NmE0MmIzZTlmZmM0YzFiMmE5MzU4OWExZTUxZDg2ZDdlZGMxMDdmNjAyZmJjNzQ3NScsICdoZXgnKVxuICAgIGNvbnN0IGtjOiBLZXlDaGFpbiA9IG5ldyBLZXlDaGFpbihocnAsIGFsaWFzKVxuICAgIGNvbnN0IGFkZHIxOiBCdWZmZXIgPSBrYy5pbXBvcnRLZXkoa2V5YnVmZikuZ2V0QWRkcmVzcygpXG4gICAgZXhwZWN0KGtjLmhhc0tleShhZGRyMSkpLnRvQmUodHJ1ZSlcbiAgICBleHBlY3Qoa2MucmVtb3ZlS2V5KGJpbnRvb2xzLmNiNThEZWNvZGUoJzZZM2t5c2pGOWpuSG5Za2RTOXlHQXVvSHlhZTJlTm1lVicpKSkudG9CZShmYWxzZSlcbiAgfSlcbn0pIl19