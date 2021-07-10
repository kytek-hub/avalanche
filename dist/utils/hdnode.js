"use strict";
/**
 * @packageDocumentation
 * @module Utils-HDNode
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("buffer/");
const hdkey_1 = __importDefault(require("hdkey"));
const bintools_1 = __importDefault(require("./bintools"));
const bintools = bintools_1.default.getInstance();
/**
 * BIP32 hierarchical deterministic keys.
 */
class HDNode {
    /**
    * Creates an HDNode from a master seed or an extended public/private key
    * @param from seed or key to create HDNode from
    */
    constructor(from) {
        if (typeof from === "string" && from.substring(0, 2) === "xp") {
            this.hdkey = hdkey_1.default.fromExtendedKey(from);
        }
        else if (buffer_1.Buffer.isBuffer(from)) {
            this.hdkey = hdkey_1.default.fromMasterSeed(from);
        }
        else {
            this.hdkey = hdkey_1.default.fromMasterSeed(buffer_1.Buffer.from(from));
        }
        this.publicKey = this.hdkey.publicKey;
        this.privateKey = this.hdkey.privateKey;
        if (this.privateKey) {
            this.privateKeyCB58 = `PrivateKey-${bintools.cb58Encode(this.privateKey)}`;
        }
        else {
            this.privateExtendedKey = null;
        }
        this.chainCode = this.hdkey.chainCode;
        this.privateExtendedKey = this.hdkey.privateExtendedKey;
        this.publicExtendedKey = this.hdkey.publicExtendedKey;
    }
    /**
    * Derives the HDNode at path from the current HDNode.
    * @param path
    * @returns derived child HDNode
    */
    derive(path) {
        const hdKey = this.hdkey.derive(path);
        let hdNode;
        if (hdKey.privateExtendedKey != null) {
            hdNode = new HDNode(hdKey.privateExtendedKey);
        }
        else {
            hdNode = new HDNode(hdKey.publicExtendedKey);
        }
        return hdNode;
    }
    /**
    * Signs the buffer hash with the private key using secp256k1 and returns the signature as a buffer.
    * @param hash
    * @returns signature as a Buffer
    */
    sign(hash) {
        const sig = this.hdkey.sign(hash);
        return buffer_1.Buffer.from(sig);
    }
    /**
    * Verifies that the signature is valid for hash and the HDNode's public key using secp256k1.
    * @param hash
    * @param signature
    * @returns true for valid, false for invalid.
    * @throws if the hash or signature is the wrong length.
    */
    verify(hash, signature) {
        return this.hdkey.verify(hash, signature);
    }
    /**
    * Wipes all record of the private key from the HDNode instance.
    * After calling this method, the instance will behave as if it was created via an xpub.
    */
    wipePrivateData() {
        this.privateKey = null;
        this.privateExtendedKey = null;
        this.privateKeyCB58 = null;
        this.hdkey.wipePrivateData();
    }
}
exports.default = HDNode;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGRub2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL2hkbm9kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7OztBQUVILG9DQUFnQztBQUNoQyxrREFBMEI7QUFDMUIsMERBQWlDO0FBQ2pDLE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFakQ7O0dBRUc7QUFFSCxNQUFxQixNQUFNO0lBMER6Qjs7O01BR0U7SUFDRixZQUFZLElBQXFCO1FBQy9CLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUM3RCxJQUFJLENBQUMsS0FBSyxHQUFHLGVBQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDMUM7YUFBTSxJQUFJLGVBQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDaEMsSUFBSSxDQUFDLEtBQUssR0FBRyxlQUFNLENBQUMsY0FBYyxDQUFDLElBQW9DLENBQUMsQ0FBQTtTQUN6RTthQUFNO1lBQ0wsSUFBSSxDQUFDLEtBQUssR0FBRyxlQUFNLENBQUMsY0FBYyxDQUFDLGVBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFpQyxDQUFDLENBQUE7U0FDdEY7UUFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFBO1FBQ3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUE7UUFDdkMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ25CLElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFBO1NBQzNFO2FBQU07WUFDTCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFBO1NBQy9CO1FBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQTtRQUNyQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQTtRQUN2RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQTtJQUN2RCxDQUFDO0lBdkVEOzs7O01BSUU7SUFDRixNQUFNLENBQUMsSUFBWTtRQUNqQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUNyQyxJQUFJLE1BQWMsQ0FBQTtRQUNsQixJQUFJLEtBQUssQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLEVBQUU7WUFDcEMsTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFBO1NBQzlDO2FBQU07WUFDTCxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUE7U0FDN0M7UUFDRCxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7SUFFRDs7OztNQUlFO0lBQ0YsSUFBSSxDQUFDLElBQVk7UUFDZixNQUFNLEdBQUcsR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUN6QyxPQUFPLGVBQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDekIsQ0FBQztJQUVEOzs7Ozs7TUFNRTtJQUNGLE1BQU0sQ0FBQyxJQUFZLEVBQUUsU0FBaUI7UUFDcEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUE7SUFDM0MsQ0FBQztJQUVEOzs7TUFHRTtJQUNGLGVBQWU7UUFDYixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQTtRQUN0QixJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFBO1FBQzlCLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFBO1FBQzFCLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUE7SUFDOUIsQ0FBQztDQTBCRjtBQWpGRCx5QkFpRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBVdGlscy1IRE5vZGVcbiAqL1xuXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tICdidWZmZXIvJ1xuaW1wb3J0IGhkbm9kZSBmcm9tICdoZGtleSdcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuL2JpbnRvb2xzJ1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKVxuXG4vKipcbiAqIEJJUDMyIGhpZXJhcmNoaWNhbCBkZXRlcm1pbmlzdGljIGtleXMuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSEROb2RlIHtcbiAgcHJpdmF0ZSBoZGtleTogYW55XG4gIHB1YmxpY0tleTogQnVmZmVyXG4gIHByaXZhdGVLZXk6IEJ1ZmZlclxuICBwcml2YXRlS2V5Q0I1ODogc3RyaW5nXG4gIGNoYWluQ29kZTogQnVmZmVyXG4gIHByaXZhdGVFeHRlbmRlZEtleTogc3RyaW5nXG4gIHB1YmxpY0V4dGVuZGVkS2V5OiBzdHJpbmdcblxuICAvKipcbiAgKiBEZXJpdmVzIHRoZSBIRE5vZGUgYXQgcGF0aCBmcm9tIHRoZSBjdXJyZW50IEhETm9kZS5cbiAgKiBAcGFyYW0gcGF0aCBcbiAgKiBAcmV0dXJucyBkZXJpdmVkIGNoaWxkIEhETm9kZVxuICAqL1xuICBkZXJpdmUocGF0aDogc3RyaW5nKTogSEROb2RlIHtcbiAgICBjb25zdCBoZEtleSA9IHRoaXMuaGRrZXkuZGVyaXZlKHBhdGgpXG4gICAgbGV0IGhkTm9kZTogSEROb2RlXG4gICAgaWYgKGhkS2V5LnByaXZhdGVFeHRlbmRlZEtleSAhPSBudWxsKSB7XG4gICAgICBoZE5vZGUgPSBuZXcgSEROb2RlKGhkS2V5LnByaXZhdGVFeHRlbmRlZEtleSlcbiAgICB9IGVsc2Uge1xuICAgICAgaGROb2RlID0gbmV3IEhETm9kZShoZEtleS5wdWJsaWNFeHRlbmRlZEtleSlcbiAgICB9XG4gICAgcmV0dXJuIGhkTm9kZVxuICB9XG5cbiAgLyoqXG4gICogU2lnbnMgdGhlIGJ1ZmZlciBoYXNoIHdpdGggdGhlIHByaXZhdGUga2V5IHVzaW5nIHNlY3AyNTZrMSBhbmQgcmV0dXJucyB0aGUgc2lnbmF0dXJlIGFzIGEgYnVmZmVyLlxuICAqIEBwYXJhbSBoYXNoIFxuICAqIEByZXR1cm5zIHNpZ25hdHVyZSBhcyBhIEJ1ZmZlclxuICAqL1xuICBzaWduKGhhc2g6IEJ1ZmZlcik6IEJ1ZmZlciB7XG4gICAgY29uc3Qgc2lnOiBCdWZmZXIgPSB0aGlzLmhka2V5LnNpZ24oaGFzaClcbiAgICByZXR1cm4gQnVmZmVyLmZyb20oc2lnKVxuICB9XG5cbiAgLyoqXG4gICogVmVyaWZpZXMgdGhhdCB0aGUgc2lnbmF0dXJlIGlzIHZhbGlkIGZvciBoYXNoIGFuZCB0aGUgSEROb2RlJ3MgcHVibGljIGtleSB1c2luZyBzZWNwMjU2azEuXG4gICogQHBhcmFtIGhhc2ggXG4gICogQHBhcmFtIHNpZ25hdHVyZSBcbiAgKiBAcmV0dXJucyB0cnVlIGZvciB2YWxpZCwgZmFsc2UgZm9yIGludmFsaWQuXG4gICogQHRocm93cyBpZiB0aGUgaGFzaCBvciBzaWduYXR1cmUgaXMgdGhlIHdyb25nIGxlbmd0aC5cbiAgKi9cbiAgdmVyaWZ5KGhhc2g6IEJ1ZmZlciwgc2lnbmF0dXJlOiBCdWZmZXIpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5oZGtleS52ZXJpZnkoaGFzaCwgc2lnbmF0dXJlKVxuICB9XG5cbiAgLyoqXG4gICogV2lwZXMgYWxsIHJlY29yZCBvZiB0aGUgcHJpdmF0ZSBrZXkgZnJvbSB0aGUgSEROb2RlIGluc3RhbmNlLlxuICAqIEFmdGVyIGNhbGxpbmcgdGhpcyBtZXRob2QsIHRoZSBpbnN0YW5jZSB3aWxsIGJlaGF2ZSBhcyBpZiBpdCB3YXMgY3JlYXRlZCB2aWEgYW4geHB1Yi5cbiAgKi9cbiAgd2lwZVByaXZhdGVEYXRhKCkge1xuICAgIHRoaXMucHJpdmF0ZUtleSA9IG51bGxcbiAgICB0aGlzLnByaXZhdGVFeHRlbmRlZEtleSA9IG51bGxcbiAgICB0aGlzLnByaXZhdGVLZXlDQjU4ID0gbnVsbFxuICAgIHRoaXMuaGRrZXkud2lwZVByaXZhdGVEYXRhKClcbiAgfVxuXG5cbiAgLyoqXG4gICogQ3JlYXRlcyBhbiBIRE5vZGUgZnJvbSBhIG1hc3RlciBzZWVkIG9yIGFuIGV4dGVuZGVkIHB1YmxpYy9wcml2YXRlIGtleVxuICAqIEBwYXJhbSBmcm9tIHNlZWQgb3Iga2V5IHRvIGNyZWF0ZSBIRE5vZGUgZnJvbVxuICAqL1xuICBjb25zdHJ1Y3Rvcihmcm9tOiBzdHJpbmcgfCBCdWZmZXIpIHtcbiAgICBpZiAodHlwZW9mIGZyb20gPT09IFwic3RyaW5nXCIgJiYgZnJvbS5zdWJzdHJpbmcoMCwgMikgPT09IFwieHBcIikge1xuICAgICAgdGhpcy5oZGtleSA9IGhkbm9kZS5mcm9tRXh0ZW5kZWRLZXkoZnJvbSlcbiAgICB9IGVsc2UgaWYgKEJ1ZmZlci5pc0J1ZmZlcihmcm9tKSkge1xuICAgICAgdGhpcy5oZGtleSA9IGhkbm9kZS5mcm9tTWFzdGVyU2VlZChmcm9tIGFzIHVua25vd24gYXMgZ2xvYmFsVGhpcy5CdWZmZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaGRrZXkgPSBoZG5vZGUuZnJvbU1hc3RlclNlZWQoQnVmZmVyLmZyb20oZnJvbSkgYXMgdW5rbm93biBhcyBnbG9iYWxUaGlzLkJ1ZmZlcilcbiAgICB9XG4gICAgdGhpcy5wdWJsaWNLZXkgPSB0aGlzLmhka2V5LnB1YmxpY0tleVxuICAgIHRoaXMucHJpdmF0ZUtleSA9IHRoaXMuaGRrZXkucHJpdmF0ZUtleVxuICAgIGlmICh0aGlzLnByaXZhdGVLZXkpIHtcbiAgICAgIHRoaXMucHJpdmF0ZUtleUNCNTggPSBgUHJpdmF0ZUtleS0ke2JpbnRvb2xzLmNiNThFbmNvZGUodGhpcy5wcml2YXRlS2V5KX1gXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJpdmF0ZUV4dGVuZGVkS2V5ID0gbnVsbFxuICAgIH1cbiAgICB0aGlzLmNoYWluQ29kZSA9IHRoaXMuaGRrZXkuY2hhaW5Db2RlXG4gICAgdGhpcy5wcml2YXRlRXh0ZW5kZWRLZXkgPSB0aGlzLmhka2V5LnByaXZhdGVFeHRlbmRlZEtleVxuICAgIHRoaXMucHVibGljRXh0ZW5kZWRLZXkgPSB0aGlzLmhka2V5LnB1YmxpY0V4dGVuZGVkS2V5XG4gIH1cbn0iXX0=