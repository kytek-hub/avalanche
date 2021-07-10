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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @packageDocumentation
 * @module Utils-BinTools
 */
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const create_hash_1 = __importDefault(require("create-hash"));
const bech32 = __importStar(require("bech32"));
const base58_1 = require("./base58");
const errors_1 = require("../utils/errors");
const ethers_1 = require("ethers");
/**
 * A class containing tools useful in interacting with binary data cross-platform using
 * nodejs & javascript.
 *
 * This class should never be instantiated directly. Instead,
 * invoke the "BinTools.getInstance()" static * function to grab the singleton
 * instance of the tools.
 *
 * Everything in this library uses
 * the {@link https://github.com/feross/buffer|feross's Buffer class}.
 *
 * ```js
 * const bintools = BinTools.getInstance();
 * let b58str = bintools.bufferToB58(Buffer.from("Wubalubadubdub!"));
 * ```
 */
class BinTools {
    constructor() {
        /**
         * Returns true if meets requirements to parse as an address as Bech32 on X-Chain or P-Chain, otherwise false
         * @param address the string to verify is address
         */
        this.isPrimaryBechAddress = (address) => {
            const parts = address.trim().split('-');
            if (parts.length !== 2) {
                return false;
            }
            try {
                bech32.fromWords(bech32.decode(parts[1]).words);
            }
            catch (err) {
                return false;
            }
            return true;
        };
        /**
           * Produces a string from a {@link https://github.com/feross/buffer|Buffer}
           * representing a string. ONLY USED IN TRANSACTION FORMATTING, ASSUMED LENGTH IS PREPENDED.
           *
           * @param buff The {@link https://github.com/feross/buffer|Buffer} to convert to a string
           */
        this.bufferToString = (buff) => this.copyFrom(buff, 2).toString('utf8');
        /**
           * Produces a {@link https://github.com/feross/buffer|Buffer} from a string. ONLY USED IN TRANSACTION FORMATTING, LENGTH IS PREPENDED.
           *
           * @param str The string to convert to a {@link https://github.com/feross/buffer|Buffer}
           */
        this.stringToBuffer = (str) => {
            const buff = buffer_1.Buffer.alloc(2 + str.length);
            buff.writeUInt16BE(str.length, 0);
            buff.write(str, 2, str.length, 'utf8');
            return buff;
        };
        /**
           * Makes a copy (no reference) of a {@link https://github.com/feross/buffer|Buffer}
           * over provided indecies.
           *
           * @param buff The {@link https://github.com/feross/buffer|Buffer} to copy
           * @param start The index to start the copy
           * @param end The index to end the copy
           */
        this.copyFrom = (buff, start = 0, end = undefined) => {
            if (end === undefined) {
                end = buff.length;
            }
            return buffer_1.Buffer.from(Uint8Array.prototype.slice.call(buff.slice(start, end)));
        };
        /**
           * Takes a {@link https://github.com/feross/buffer|Buffer} and returns a base-58 string of
           * the {@link https://github.com/feross/buffer|Buffer}.
           *
           * @param buff The {@link https://github.com/feross/buffer|Buffer} to convert to base-58
           */
        this.bufferToB58 = (buff) => this.b58.encode(buff);
        /**
           * Takes a base-58 string and returns a {@link https://github.com/feross/buffer|Buffer}.
           *
           * @param b58str The base-58 string to convert
           * to a {@link https://github.com/feross/buffer|Buffer}
           */
        this.b58ToBuffer = (b58str) => this.b58.decode(b58str);
        /**
           * Takes a {@link https://github.com/feross/buffer|Buffer} and returns an ArrayBuffer.
           *
           * @param buff The {@link https://github.com/feross/buffer|Buffer} to
           * convert to an ArrayBuffer
           */
        this.fromBufferToArrayBuffer = (buff) => {
            const ab = new ArrayBuffer(buff.length);
            const view = new Uint8Array(ab);
            for (let i = 0; i < buff.length; ++i) {
                view[i] = buff[i];
            }
            return view;
        };
        /**
           * Takes an ArrayBuffer and converts it to a {@link https://github.com/feross/buffer|Buffer}.
           *
           * @param ab The ArrayBuffer to convert to a {@link https://github.com/feross/buffer|Buffer}
           */
        this.fromArrayBufferToBuffer = (ab) => {
            const buf = buffer_1.Buffer.alloc(ab.byteLength);
            for (let i = 0; i < ab.byteLength; ++i) {
                buf[i] = ab[i];
            }
            return buf;
        };
        /**
           * Takes a {@link https://github.com/feross/buffer|Buffer} and converts it
           * to a {@link https://github.com/indutny/bn.js/|BN}.
           *
           * @param buff The {@link https://github.com/feross/buffer|Buffer} to convert
           * to a {@link https://github.com/indutny/bn.js/|BN}
           */
        this.fromBufferToBN = (buff) => {
            if (typeof buff === "undefined") {
                return undefined;
            }
            return new bn_js_1.default(buff.toString('hex'), 16, 'be');
        };
        /**
         * Takes a {@link https://github.com/indutny/bn.js/|BN} and converts it
         * to a {@link https://github.com/feross/buffer|Buffer}.
         *
         * @param bn The {@link https://github.com/indutny/bn.js/|BN} to convert
         * to a {@link https://github.com/feross/buffer|Buffer}
         * @param length The zero-padded length of the {@link https://github.com/feross/buffer|Buffer}
         */
        this.fromBNToBuffer = (bn, length) => {
            if (typeof bn === "undefined") {
                return undefined;
            }
            const newarr = bn.toArray('be');
            /**
             * CKC: Still unsure why bn.toArray with a "be" and a length do not work right. Bug?
             */
            if (length) { // bn toArray with the length parameter doesn't work correctly, need this.
                const x = length - newarr.length;
                for (let i = 0; i < x; i++) {
                    newarr.unshift(0);
                }
            }
            return buffer_1.Buffer.from(newarr);
        };
        /**
           * Takes a {@link https://github.com/feross/buffer|Buffer} and adds a checksum, returning
           * a {@link https://github.com/feross/buffer|Buffer} with the 4-byte checksum appended.
           *
           * @param buff The {@link https://github.com/feross/buffer|Buffer} to append a checksum
           */
        this.addChecksum = (buff) => {
            const hashslice = buffer_1.Buffer.from(create_hash_1.default('sha256').update(buff).digest().slice(28));
            return buffer_1.Buffer.concat([buff, hashslice]);
        };
        /**
           * Takes a {@link https://github.com/feross/buffer|Buffer} with an appended 4-byte checksum
           * and returns true if the checksum is valid, otherwise false.
           *
           * @param b The {@link https://github.com/feross/buffer|Buffer} to validate the checksum
           */
        this.validateChecksum = (buff) => {
            const checkslice = buff.slice(buff.length - 4);
            const hashslice = buffer_1.Buffer.from(create_hash_1.default('sha256').update(buff.slice(0, buff.length - 4)).digest().slice(28));
            return checkslice.toString('hex') === hashslice.toString('hex');
        };
        /**
           * Takes a {@link https://github.com/feross/buffer|Buffer} and returns a base-58 string with
           * checksum as per the cb58 standard.
           *
           * @param bytes A {@link https://github.com/feross/buffer|Buffer} to serialize
           *
           * @returns A serialized base-58 string of the Buffer.
           */
        this.cb58Encode = (bytes) => {
            const x = this.addChecksum(bytes);
            return this.bufferToB58(x);
        };
        /**
           * Takes a cb58 serialized {@link https://github.com/feross/buffer|Buffer} or base-58 string
           * and returns a {@link https://github.com/feross/buffer|Buffer} of the original data. Throws on error.
           *
           * @param bytes A cb58 serialized {@link https://github.com/feross/buffer|Buffer} or base-58 string
           */
        this.cb58Decode = (bytes) => {
            if (typeof bytes === 'string') {
                bytes = this.b58ToBuffer(bytes);
            }
            if (this.validateChecksum(bytes)) {
                return this.copyFrom(bytes, 0, bytes.length - 4);
            }
            throw new errors_1.ChecksumError('Error - BinTools.cb58Decode: invalid checksum');
        };
        this.addressToString = (hrp, chainid, bytes) => `${chainid}-${bech32.encode(hrp, bech32.toWords(bytes))}`;
        this.stringToAddress = (address, hrp) => {
            if (address.substring(0, 2) === "0x") {
                // ETH-style address
                if (ethers_1.utils.isAddress(address)) {
                    return buffer_1.Buffer.from(address.substring(2), "hex");
                }
                else {
                    throw new errors_1.HexError('Error - Invalid address');
                }
            }
            // Bech32 addresses
            const parts = address.trim().split('-');
            if (parts.length < 2) {
                throw new errors_1.Bech32Error('Error - Valid address should include -');
            }
            if (parts[0].length < 1) {
                throw new errors_1.Bech32Error('Error - Valid address must have prefix before -');
            }
            const split = parts[1].lastIndexOf('1');
            if (split < 0) {
                throw new errors_1.Bech32Error('Error - Valid address must include separator (1)');
            }
            const humanReadablePart = parts[1].slice(0, split);
            if (humanReadablePart.length < 1) {
                throw new errors_1.Bech32Error('Error - HRP should be at least 1 character');
            }
            if (humanReadablePart !== 'avax' && humanReadablePart !== 'fuji' && humanReadablePart != 'local' && humanReadablePart != hrp) {
                throw new errors_1.Bech32Error('Error - Invalid HRP');
            }
            return buffer_1.Buffer.from(bech32.fromWords(bech32.decode(parts[1]).words));
        };
        /**
         * Takes an address and returns its {@link https://github.com/feross/buffer|Buffer}
         * representation if valid. A more strict version of stringToAddress.
         *
         * @param addr A string representation of the address
         * @param blockchainID A cb58 encoded string representation of the blockchainID
         * @param alias A chainID alias, if any, that the address can also parse from.
         * @param addrlen VMs can use any addressing scheme that they like, so this is the appropriate number of address bytes. Default 20.
         *
         * @returns A {@link https://github.com/feross/buffer|Buffer} for the address if valid,
         * undefined if not valid.
         */
        this.parseAddress = (addr, blockchainID, alias = undefined, addrlen = 20) => {
            const abc = addr.split('-');
            if (abc.length === 2 && ((alias && abc[0] === alias) || (blockchainID && abc[0] === blockchainID))) {
                const addrbuff = this.stringToAddress(addr);
                if ((addrlen && addrbuff.length === addrlen) || !(addrlen)) {
                    return addrbuff;
                }
            }
            return undefined;
        };
        this.b58 = base58_1.Base58.getInstance();
    }
    /**
     * Retrieves the BinTools singleton.
     */
    static getInstance() {
        if (!BinTools.instance) {
            BinTools.instance = new BinTools();
        }
        return BinTools.instance;
    }
    /**
     * Returns true if base64, otherwise false
     * @param str the string to verify is Base64
     */
    isBase64(str) {
        if (str === '' || str.trim() === '') {
            return false;
        }
        try {
            let b64 = buffer_1.Buffer.from(str, "base64");
            return b64.toString("base64") === str;
        }
        catch (err) {
            return false;
        }
    }
    /**
     * Returns true if cb58, otherwise false
     * @param cb58 the string to verify is cb58
     */
    isCB58(cb58) {
        return this.isBase58(cb58);
    }
    /**
     * Returns true if base58, otherwise false
     * @param base58 the string to verify is base58
     */
    isBase58(base58) {
        if (base58 === '' || base58.trim() === '') {
            return false;
        }
        try {
            return this.b58.encode(this.b58.decode(base58)) === base58;
        }
        catch (err) {
            return false;
        }
    }
    /**
     * Returns true if hexidecimal, otherwise false
     * @param hex the string to verify is hexidecimal
     */
    isHex(hex) {
        if (hex === '' || hex.trim() === '') {
            return false;
        }
        if ((hex.startsWith("0x") && hex.slice(2).match(/^[0-9A-Fa-f]/g) || hex.match(/^[0-9A-Fa-f]/g))) {
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * Returns true if decimal, otherwise false
     * @param str the string to verify is hexidecimal
     */
    isDecimal(str) {
        if (str === '' || str.trim() === '') {
            return false;
        }
        try {
            return new bn_js_1.default(str, 10).toString(10) === str.trim();
        }
        catch (err) {
            return false;
        }
    }
}
exports.default = BinTools;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmludG9vbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvYmludG9vbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsa0RBQXVCO0FBQ3ZCLG9DQUFpQztBQUNqQyw4REFBcUM7QUFDckMsK0NBQWlDO0FBQ2pDLHFDQUFrQztBQUVsQyw0Q0FBdUU7QUFDdkUsbUNBQStCO0FBRS9COzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNILE1BQXFCLFFBQVE7SUFHM0I7UUE2RUE7OztXQUdHO1FBQ0gseUJBQW9CLEdBQUcsQ0FBQyxPQUFjLEVBQVUsRUFBRTtZQUNoRCxNQUFNLEtBQUssR0FBYSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xELElBQUcsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ3JCLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxJQUFJO2dCQUNGLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNqRDtZQUFDLE9BQU0sR0FBRyxFQUFFO2dCQUNYLE9BQU8sS0FBSyxDQUFBO2FBQ2I7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUMsQ0FBQztRQUdGOzs7OzthQUtLO1FBQ0wsbUJBQWMsR0FBRyxDQUFDLElBQVcsRUFBUyxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRWpGOzs7O2FBSUs7UUFDTCxtQkFBYyxHQUFHLENBQUMsR0FBVSxFQUFTLEVBQUU7WUFDckMsTUFBTSxJQUFJLEdBQVUsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxD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QyxFQUFFO1lBQy9GLE9BQU8sSUFBSSxDQUFBO1NBQ1o7YUFBTTtZQUNMLE9BQU8sS0FBSyxDQUFBO1NBQ2I7SUFDSCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBUyxDQUFDLEdBQVU7UUFDbEIsSUFBSSxHQUFHLEtBQUksRUFBRSxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsS0FBSSxFQUFFLEVBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztTQUFFO1FBQ25ELElBQUk7WUFDRixPQUFPLElBQUksZUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ3BEO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNILENBQUM7Q0E2UEY7QUEzVUQsMkJBMlVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgVXRpbHMtQmluVG9vbHNcbiAqL1xuaW1wb3J0IEJOIGZyb20gJ2JuLmpzJztcbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nO1xuaW1wb3J0IGNyZWF0ZUhhc2ggZnJvbSAnY3JlYXRlLWhhc2gnO1xuaW1wb3J0ICogYXMgYmVjaDMyIGZyb20gJ2JlY2gzMic7XG5pbXBvcnQgeyBCYXNlNTggfSBmcm9tICcuL2Jhc2U1OCc7XG5pbXBvcnQgeyBEZWZhdWx0cyB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IEJlY2gzMkVycm9yLCBDaGVja3N1bUVycm9yLCBIZXhFcnJvciB9IGZyb20gJy4uL3V0aWxzL2Vycm9ycyc7XG5pbXBvcnQgeyB1dGlscyB9IGZyb20gXCJldGhlcnNcIjtcblxuLyoqXG4gKiBBIGNsYXNzIGNvbnRhaW5pbmcgdG9vbHMgdXNlZnVsIGluIGludGVyYWN0aW5nIHdpdGggYmluYXJ5IGRhdGEgY3Jvc3MtcGxhdGZvcm0gdXNpbmdcbiAqIG5vZGVqcyAmIGphdmFzY3JpcHQuXG4gKlxuICogVGhpcyBjbGFzcyBzaG91bGQgbmV2ZXIgYmUgaW5zdGFudGlhdGVkIGRpcmVjdGx5LiBJbnN0ZWFkLFxuICogaW52b2tlIHRoZSBcIkJpblRvb2xzLmdldEluc3RhbmNlKClcIiBzdGF0aWMgKiBmdW5jdGlvbiB0byBncmFiIHRoZSBzaW5nbGV0b25cbiAqIGluc3RhbmNlIG9mIHRoZSB0b29scy5cbiAqXG4gKiBFdmVyeXRoaW5nIGluIHRoaXMgbGlicmFyeSB1c2VzXG4gKiB0aGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfGZlcm9zcydzIEJ1ZmZlciBjbGFzc30uXG4gKlxuICogYGBganNcbiAqIGNvbnN0IGJpbnRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKTtcbiAqIGxldCBiNThzdHIgPSBiaW50b29scy5idWZmZXJUb0I1OChCdWZmZXIuZnJvbShcIld1YmFsdWJhZHViZHViIVwiKSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmluVG9vbHMge1xuICBwcml2YXRlIHN0YXRpYyBpbnN0YW5jZTpCaW5Ub29scztcblxuICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYjU4ID0gQmFzZTU4LmdldEluc3RhbmNlKCk7XG4gIH1cblxuICBwcml2YXRlIGI1ODpCYXNlNTg7XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgQmluVG9vbHMgc2luZ2xldG9uLlxuICAgKi9cbiAgc3RhdGljIGdldEluc3RhbmNlKCk6IEJpblRvb2xzIHtcbiAgICBpZiAoIUJpblRvb2xzLmluc3RhbmNlKSB7XG4gICAgICBCaW5Ub29scy5pbnN0YW5jZSA9IG5ldyBCaW5Ub29scygpO1xuICAgIH1cbiAgICByZXR1cm4gQmluVG9vbHMuaW5zdGFuY2U7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIGJhc2U2NCwgb3RoZXJ3aXNlIGZhbHNlXG4gICAqIEBwYXJhbSBzdHIgdGhlIHN0cmluZyB0byB2ZXJpZnkgaXMgQmFzZTY0XG4gICAqL1xuICBpc0Jhc2U2NChzdHI6c3RyaW5nKSB7XG4gICAgaWYgKHN0ciA9PT0nJyB8fCBzdHIudHJpbSgpID09PScnKXsgcmV0dXJuIGZhbHNlOyB9XG4gICAgdHJ5IHtcbiAgICAgICAgbGV0IGI2NDpCdWZmZXIgPSBCdWZmZXIuZnJvbShzdHIsIFwiYmFzZTY0XCIpO1xuICAgICAgICByZXR1cm4gYjY0LnRvU3RyaW5nKFwiYmFzZTY0XCIpID09PSBzdHI7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIGNiNTgsIG90aGVyd2lzZSBmYWxzZVxuICAgKiBAcGFyYW0gY2I1OCB0aGUgc3RyaW5nIHRvIHZlcmlmeSBpcyBjYjU4XG4gICAqL1xuICBpc0NCNTgoY2I1ODogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNCYXNlNTgoY2I1OClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgYmFzZTU4LCBvdGhlcndpc2UgZmFsc2VcbiAgICogQHBhcmFtIGJhc2U1OCB0aGUgc3RyaW5nIHRvIHZlcmlmeSBpcyBiYXNlNThcbiAgICovXG4gIGlzQmFzZTU4KGJhc2U1ODogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKGJhc2U1OCA9PT0gJycgfHwgYmFzZTU4LnRyaW0oKSA9PT0gJycpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHRoaXMuYjU4LmVuY29kZSh0aGlzLmI1OC5kZWNvZGUoYmFzZTU4KSkgPT09IGJhc2U1ODtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgaGV4aWRlY2ltYWwsIG90aGVyd2lzZSBmYWxzZVxuICAgKiBAcGFyYW0gaGV4IHRoZSBzdHJpbmcgdG8gdmVyaWZ5IGlzIGhleGlkZWNpbWFsXG4gICAqL1xuICBpc0hleChoZXg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmIChoZXggPT09ICcnIHx8IGhleC50cmltKCkgPT09ICcnKSB7IHJldHVybiBmYWxzZSB9XG4gICAgaWYgKChoZXguc3RhcnRzV2l0aChcIjB4XCIpICYmIGhleC5zbGljZSgyKS5tYXRjaCgvXlswLTlBLUZhLWZdL2cpIHx8IGhleC5tYXRjaCgvXlswLTlBLUZhLWZdL2cpKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiBkZWNpbWFsLCBvdGhlcndpc2UgZmFsc2VcbiAgICogQHBhcmFtIHN0ciB0aGUgc3RyaW5nIHRvIHZlcmlmeSBpcyBoZXhpZGVjaW1hbFxuICAgKi9cbiAgaXNEZWNpbWFsKHN0cjpzdHJpbmcpIHtcbiAgICBpZiAoc3RyID09PScnIHx8IHN0ci50cmltKCkgPT09JycpeyByZXR1cm4gZmFsc2U7IH1cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIG5ldyBCTihzdHIsIDEwKS50b1N0cmluZygxMCkgPT09IHN0ci50cmltKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0cnVlIGlmIG1lZXRzIHJlcXVpcmVtZW50cyB0byBwYXJzZSBhcyBhbiBhZGRyZXNzIGFzIEJlY2gzMiBvbiBYLUNoYWluIG9yIFAtQ2hhaW4sIG90aGVyd2lzZSBmYWxzZVxuICAgKiBAcGFyYW0gYWRkcmVzcyB0aGUgc3RyaW5nIHRvIHZlcmlmeSBpcyBhZGRyZXNzXG4gICAqL1xuICBpc1ByaW1hcnlCZWNoQWRkcmVzcyA9IChhZGRyZXNzOnN0cmluZyk6Ym9vbGVhbiA9PiB7XG4gICAgY29uc3QgcGFydHM6IHN0cmluZ1tdID0gYWRkcmVzcy50cmltKCkuc3BsaXQoJy0nKTtcbiAgICBpZihwYXJ0cy5sZW5ndGggIT09IDIpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgIGJlY2gzMi5mcm9tV29yZHMoYmVjaDMyLmRlY29kZShwYXJ0c1sxXSkud29yZHMpO1xuICAgIH0gY2F0Y2goZXJyKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cblxuICAvKipcbiAgICAgKiBQcm9kdWNlcyBhIHN0cmluZyBmcm9tIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICAgKiByZXByZXNlbnRpbmcgYSBzdHJpbmcuIE9OTFkgVVNFRCBJTiBUUkFOU0FDVElPTiBGT1JNQVRUSU5HLCBBU1NVTUVEIExFTkdUSCBJUyBQUkVQRU5ERUQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYnVmZiBUaGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gdG8gY29udmVydCB0byBhIHN0cmluZ1xuICAgICAqL1xuICBidWZmZXJUb1N0cmluZyA9IChidWZmOkJ1ZmZlcik6c3RyaW5nID0+IHRoaXMuY29weUZyb20oYnVmZiwgMikudG9TdHJpbmcoJ3V0ZjgnKTtcblxuICAvKipcbiAgICAgKiBQcm9kdWNlcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZyb20gYSBzdHJpbmcuIE9OTFkgVVNFRCBJTiBUUkFOU0FDVElPTiBGT1JNQVRUSU5HLCBMRU5HVEggSVMgUFJFUEVOREVELlxuICAgICAqXG4gICAgICogQHBhcmFtIHN0ciBUaGUgc3RyaW5nIHRvIGNvbnZlcnQgdG8gYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgICAqL1xuICBzdHJpbmdUb0J1ZmZlciA9IChzdHI6c3RyaW5nKTpCdWZmZXIgPT4ge1xuICAgIGNvbnN0IGJ1ZmY6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDIgKyBzdHIubGVuZ3RoKTtcbiAgICBidWZmLndyaXRlVUludDE2QkUoc3RyLmxlbmd0aCwgMCk7XG4gICAgYnVmZi53cml0ZShzdHIsIDIsIHN0ci5sZW5ndGgsICd1dGY4Jyk7XG4gICAgcmV0dXJuIGJ1ZmY7XG4gIH07XG5cbiAgLyoqXG4gICAgICogTWFrZXMgYSBjb3B5IChubyByZWZlcmVuY2UpIG9mIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICAgKiBvdmVyIHByb3ZpZGVkIGluZGVjaWVzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGJ1ZmYgVGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHRvIGNvcHlcbiAgICAgKiBAcGFyYW0gc3RhcnQgVGhlIGluZGV4IHRvIHN0YXJ0IHRoZSBjb3B5XG4gICAgICogQHBhcmFtIGVuZCBUaGUgaW5kZXggdG8gZW5kIHRoZSBjb3B5XG4gICAgICovXG4gIGNvcHlGcm9tID0gKGJ1ZmY6QnVmZmVyLCBzdGFydDpudW1iZXIgPSAwLCBlbmQ6bnVtYmVyID0gdW5kZWZpbmVkKTpCdWZmZXIgPT4ge1xuICAgIGlmIChlbmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZW5kID0gYnVmZi5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiBCdWZmZXIuZnJvbShVaW50OEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGJ1ZmYuc2xpY2Uoc3RhcnQsIGVuZCkpKTtcbiAgfTtcblxuICAvKipcbiAgICAgKiBUYWtlcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGFuZCByZXR1cm5zIGEgYmFzZS01OCBzdHJpbmcgb2ZcbiAgICAgKiB0aGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYnVmZiBUaGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gdG8gY29udmVydCB0byBiYXNlLTU4XG4gICAgICovXG4gIGJ1ZmZlclRvQjU4ID0gKGJ1ZmY6QnVmZmVyKTpzdHJpbmcgPT4gdGhpcy5iNTguZW5jb2RlKGJ1ZmYpO1xuXG4gIC8qKlxuICAgICAqIFRha2VzIGEgYmFzZS01OCBzdHJpbmcgYW5kIHJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBiNThzdHIgVGhlIGJhc2UtNTggc3RyaW5nIHRvIGNvbnZlcnRcbiAgICAgKiB0byBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAgICovXG4gIGI1OFRvQnVmZmVyID0gKGI1OHN0cjpzdHJpbmcpOkJ1ZmZlciA9PiB0aGlzLmI1OC5kZWNvZGUoYjU4c3RyKTtcblxuICAvKipcbiAgICAgKiBUYWtlcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGFuZCByZXR1cm5zIGFuIEFycmF5QnVmZmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIGJ1ZmYgVGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHRvXG4gICAgICogY29udmVydCB0byBhbiBBcnJheUJ1ZmZlclxuICAgICAqL1xuICBmcm9tQnVmZmVyVG9BcnJheUJ1ZmZlciA9IChidWZmOkJ1ZmZlcik6QXJyYXlCdWZmZXIgPT4ge1xuICAgIGNvbnN0IGFiID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmYubGVuZ3RoKTtcbiAgICBjb25zdCB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYWIpO1xuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBidWZmLmxlbmd0aDsgKytpKSB7XG4gICAgICB2aWV3W2ldID0gYnVmZltpXTtcbiAgICB9XG4gICAgcmV0dXJuIHZpZXc7XG4gIH07XG5cbiAgLyoqXG4gICAgICogVGFrZXMgYW4gQXJyYXlCdWZmZXIgYW5kIGNvbnZlcnRzIGl0IHRvIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYWIgVGhlIEFycmF5QnVmZmVyIHRvIGNvbnZlcnQgdG8gYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgICAqL1xuICBmcm9tQXJyYXlCdWZmZXJUb0J1ZmZlciA9IChhYjpBcnJheUJ1ZmZlcik6QnVmZmVyID0+IHtcbiAgICBjb25zdCBidWYgPSBCdWZmZXIuYWxsb2MoYWIuYnl0ZUxlbmd0aCk7XG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFiLmJ5dGVMZW5ndGg7ICsraSkge1xuICAgICAgYnVmW2ldID0gYWJbaV07XG4gICAgfVxuICAgIHJldHVybiBidWY7XG4gIH07XG5cbiAgLyoqXG4gICAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBhbmQgY29udmVydHMgaXRcbiAgICAgKiB0byBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59LlxuICAgICAqXG4gICAgICogQHBhcmFtIGJ1ZmYgVGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHRvIGNvbnZlcnRcbiAgICAgKiB0byBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAgICovXG4gIGZyb21CdWZmZXJUb0JOID0gKGJ1ZmY6QnVmZmVyKTpCTiA9PiB7XG4gICAgaWYodHlwZW9mIGJ1ZmYgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBuZXcgQk4oYnVmZi50b1N0cmluZygnaGV4JyksIDE2LCAnYmUnKVxuICB9O1xuICAgIC8qKlxuICAgICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gYW5kIGNvbnZlcnRzIGl0XG4gICAgICogdG8gYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBibiBUaGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gdG8gY29udmVydFxuICAgICAqIHRvIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICAgKiBAcGFyYW0gbGVuZ3RoIFRoZSB6ZXJvLXBhZGRlZCBsZW5ndGggb2YgdGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAgICovXG4gIGZyb21CTlRvQnVmZmVyID0gKGJuOkJOLCBsZW5ndGg/Om51bWJlcik6QnVmZmVyID0+IHtcbiAgICBpZih0eXBlb2YgYm4gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IG5ld2FyciA9IGJuLnRvQXJyYXkoJ2JlJyk7XG4gICAgLyoqXG4gICAgICogQ0tDOiBTdGlsbCB1bnN1cmUgd2h5IGJuLnRvQXJyYXkgd2l0aCBhIFwiYmVcIiBhbmQgYSBsZW5ndGggZG8gbm90IHdvcmsgcmlnaHQuIEJ1Zz9cbiAgICAgKi9cbiAgICBpZiAobGVuZ3RoKSB7IC8vIGJuIHRvQXJyYXkgd2l0aCB0aGUgbGVuZ3RoIHBhcmFtZXRlciBkb2Vzbid0IHdvcmsgY29ycmVjdGx5LCBuZWVkIHRoaXMuXG4gICAgICBjb25zdCB4ID0gbGVuZ3RoIC0gbmV3YXJyLmxlbmd0aDtcbiAgICAgIGZvciAobGV0IGk6bnVtYmVyID0gMDsgaSA8IHg7IGkrKykge1xuICAgICAgICBuZXdhcnIudW5zaGlmdCgwKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKG5ld2Fycik7XG4gIH07XG5cbiAgLyoqXG4gICAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBhbmQgYWRkcyBhIGNoZWNrc3VtLCByZXR1cm5pbmdcbiAgICAgKiBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdpdGggdGhlIDQtYnl0ZSBjaGVja3N1bSBhcHBlbmRlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBidWZmIFRoZSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB0byBhcHBlbmQgYSBjaGVja3N1bVxuICAgICAqL1xuICBhZGRDaGVja3N1bSA9IChidWZmOkJ1ZmZlcik6QnVmZmVyID0+IHtcbiAgICBjb25zdCBoYXNoc2xpY2U6QnVmZmVyID0gQnVmZmVyLmZyb20oY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKGJ1ZmYpLmRpZ2VzdCgpLnNsaWNlKDI4KSk7XG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoW2J1ZmYsIGhhc2hzbGljZV0pO1xuICB9O1xuXG4gIC8qKlxuICAgICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2l0aCBhbiBhcHBlbmRlZCA0LWJ5dGUgY2hlY2tzdW1cbiAgICAgKiBhbmQgcmV0dXJucyB0cnVlIGlmIHRoZSBjaGVja3N1bSBpcyB2YWxpZCwgb3RoZXJ3aXNlIGZhbHNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIGIgVGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHRvIHZhbGlkYXRlIHRoZSBjaGVja3N1bVxuICAgICAqL1xuICB2YWxpZGF0ZUNoZWNrc3VtID0gKGJ1ZmY6QnVmZmVyKTpib29sZWFuID0+IHtcbiAgICBjb25zdCBjaGVja3NsaWNlOkJ1ZmZlciA9IGJ1ZmYuc2xpY2UoYnVmZi5sZW5ndGggLSA0KTtcbiAgICBjb25zdCBoYXNoc2xpY2U6QnVmZmVyID0gQnVmZmVyLmZyb20oY3JlYXRlSGFzaCgnc2hhMjU2JykudXBkYXRlKGJ1ZmYuc2xpY2UoMCwgYnVmZi5sZW5ndGggLSA0KSkuZGlnZXN0KCkuc2xpY2UoMjgpKTtcbiAgICByZXR1cm4gY2hlY2tzbGljZS50b1N0cmluZygnaGV4JykgPT09IGhhc2hzbGljZS50b1N0cmluZygnaGV4Jyk7XG4gIH07XG5cbiAgLyoqXG4gICAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBhbmQgcmV0dXJucyBhIGJhc2UtNTggc3RyaW5nIHdpdGhcbiAgICAgKiBjaGVja3N1bSBhcyBwZXIgdGhlIGNiNTggc3RhbmRhcmQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB0byBzZXJpYWxpemVcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIEEgc2VyaWFsaXplZCBiYXNlLTU4IHN0cmluZyBvZiB0aGUgQnVmZmVyLlxuICAgICAqL1xuICBjYjU4RW5jb2RlID0gKGJ5dGVzOkJ1ZmZlcik6c3RyaW5nID0+IHtcbiAgICBjb25zdCB4OkJ1ZmZlciA9IHRoaXMuYWRkQ2hlY2tzdW0oYnl0ZXMpO1xuICAgIHJldHVybiB0aGlzLmJ1ZmZlclRvQjU4KHgpO1xuICB9O1xuXG4gIC8qKlxuICAgICAqIFRha2VzIGEgY2I1OCBzZXJpYWxpemVkIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9yIGJhc2UtNTggc3RyaW5nXG4gICAgICogYW5kIHJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgb3JpZ2luYWwgZGF0YS4gVGhyb3dzIG9uIGVycm9yLlxuICAgICAqXG4gICAgICogQHBhcmFtIGJ5dGVzIEEgY2I1OCBzZXJpYWxpemVkIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9yIGJhc2UtNTggc3RyaW5nXG4gICAgICovXG4gIGNiNThEZWNvZGUgPSAoYnl0ZXM6QnVmZmVyIHwgc3RyaW5nKTpCdWZmZXIgPT4ge1xuICAgIGlmICh0eXBlb2YgYnl0ZXMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBieXRlcyA9IHRoaXMuYjU4VG9CdWZmZXIoYnl0ZXMpO1xuICAgIH1cbiAgICBpZiAodGhpcy52YWxpZGF0ZUNoZWNrc3VtKGJ5dGVzKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29weUZyb20oYnl0ZXMsIDAsIGJ5dGVzLmxlbmd0aCAtIDQpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgQ2hlY2tzdW1FcnJvcignRXJyb3IgLSBCaW5Ub29scy5jYjU4RGVjb2RlOiBpbnZhbGlkIGNoZWNrc3VtJyk7XG4gIH07XG5cbiAgYWRkcmVzc1RvU3RyaW5nID0gKGhycDogc3RyaW5nLCBjaGFpbmlkOiBzdHJpbmcsIGJ5dGVzOiBCdWZmZXIpOiBzdHJpbmcgPT4gYCR7Y2hhaW5pZH0tJHtiZWNoMzIuZW5jb2RlKGhycCwgYmVjaDMyLnRvV29yZHMoYnl0ZXMpKX1gO1xuXG4gIHN0cmluZ1RvQWRkcmVzcyA9IChhZGRyZXNzOiBzdHJpbmcsIGhycD86IHN0cmluZyk6IEJ1ZmZlciA9PiB7XG4gICAgaWYoYWRkcmVzcy5zdWJzdHJpbmcoMCwgMikgPT09IFwiMHhcIikge1xuICAgICAgLy8gRVRILXN0eWxlIGFkZHJlc3NcbiAgICAgIGlmKHV0aWxzLmlzQWRkcmVzcyhhZGRyZXNzKSkge1xuICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20oYWRkcmVzcy5zdWJzdHJpbmcoMiwpLCBcImhleFwiKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBIZXhFcnJvcignRXJyb3IgLSBJbnZhbGlkIGFkZHJlc3MnKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQmVjaDMyIGFkZHJlc3Nlc1xuICAgIGNvbnN0IHBhcnRzOiBzdHJpbmdbXSA9IGFkZHJlc3MudHJpbSgpLnNwbGl0KCctJyk7XG5cbiAgICBpZihwYXJ0cy5sZW5ndGggPCAyKSB7XG4gICAgICB0aHJvdyBuZXcgQmVjaDMyRXJyb3IoJ0Vycm9yIC0gVmFsaWQgYWRkcmVzcyBzaG91bGQgaW5jbHVkZSAtJyk7XG4gICAgfVxuXG4gICAgaWYocGFydHNbMF0ubGVuZ3RoIDwgMSkge1xuICAgICAgdGhyb3cgbmV3IEJlY2gzMkVycm9yKCdFcnJvciAtIFZhbGlkIGFkZHJlc3MgbXVzdCBoYXZlIHByZWZpeCBiZWZvcmUgLScpO1xuICAgIH1cblxuICAgIGNvbnN0IHNwbGl0OiBudW1iZXIgPSBwYXJ0c1sxXS5sYXN0SW5kZXhPZignMScpO1xuICAgIGlmKHNwbGl0IDwgMCkge1xuICAgICAgdGhyb3cgbmV3IEJlY2gzMkVycm9yKCdFcnJvciAtIFZhbGlkIGFkZHJlc3MgbXVzdCBpbmNsdWRlIHNlcGFyYXRvciAoMSknKTtcbiAgICB9XG5cbiAgICBjb25zdCBodW1hblJlYWRhYmxlUGFydDogc3RyaW5nID0gcGFydHNbMV0uc2xpY2UoMCwgc3BsaXQpO1xuICAgIGlmKGh1bWFuUmVhZGFibGVQYXJ0Lmxlbmd0aCA8IDEpIHtcbiAgICAgIHRocm93IG5ldyBCZWNoMzJFcnJvcignRXJyb3IgLSBIUlAgc2hvdWxkIGJlIGF0IGxlYXN0IDEgY2hhcmFjdGVyJyk7XG4gICAgfVxuXG4gICAgaWYoaHVtYW5SZWFkYWJsZVBhcnQgIT09ICdhdmF4JyAmJiBodW1hblJlYWRhYmxlUGFydCAhPT0gJ2Z1amknICYmIGh1bWFuUmVhZGFibGVQYXJ0ICE9ICdsb2NhbCcgJiYgaHVtYW5SZWFkYWJsZVBhcnQgIT0gaHJwKSB7XG4gICAgICB0aHJvdyBuZXcgQmVjaDMyRXJyb3IoJ0Vycm9yIC0gSW52YWxpZCBIUlAnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gQnVmZmVyLmZyb20oYmVjaDMyLmZyb21Xb3JkcyhiZWNoMzIuZGVjb2RlKHBhcnRzWzFdKS53b3JkcykpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBUYWtlcyBhbiBhZGRyZXNzIGFuZCByZXR1cm5zIGl0cyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKiByZXByZXNlbnRhdGlvbiBpZiB2YWxpZC4gQSBtb3JlIHN0cmljdCB2ZXJzaW9uIG9mIHN0cmluZ1RvQWRkcmVzcy5cbiAgICpcbiAgICogQHBhcmFtIGFkZHIgQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFkZHJlc3NcbiAgICogQHBhcmFtIGJsb2NrY2hhaW5JRCBBIGNiNTggZW5jb2RlZCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGJsb2NrY2hhaW5JRFxuICAgKiBAcGFyYW0gYWxpYXMgQSBjaGFpbklEIGFsaWFzLCBpZiBhbnksIHRoYXQgdGhlIGFkZHJlc3MgY2FuIGFsc28gcGFyc2UgZnJvbS5cbiAgICogQHBhcmFtIGFkZHJsZW4gVk1zIGNhbiB1c2UgYW55IGFkZHJlc3Npbmcgc2NoZW1lIHRoYXQgdGhleSBsaWtlLCBzbyB0aGlzIGlzIHRoZSBhcHByb3ByaWF0ZSBudW1iZXIgb2YgYWRkcmVzcyBieXRlcy4gRGVmYXVsdCAyMC5cbiAgICpcbiAgICogQHJldHVybnMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIGFkZHJlc3MgaWYgdmFsaWQsXG4gICAqIHVuZGVmaW5lZCBpZiBub3QgdmFsaWQuXG4gICAqL1xuICBwYXJzZUFkZHJlc3MgPSAoYWRkcjpzdHJpbmcsXG4gICAgYmxvY2tjaGFpbklEOnN0cmluZyxcbiAgICBhbGlhczpzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgYWRkcmxlbjpudW1iZXIgPSAyMCk6QnVmZmVyID0+IHtcbiAgICBjb25zdCBhYmM6IHN0cmluZ1tdID0gYWRkci5zcGxpdCgnLScpO1xuICAgIGlmIChhYmMubGVuZ3RoID09PSAyICYmICgoYWxpYXMgJiYgYWJjWzBdID09PSBhbGlhcykgfHwgKGJsb2NrY2hhaW5JRCAmJiBhYmNbMF0gPT09IGJsb2NrY2hhaW5JRCkpKSB7XG4gICAgICAgIGNvbnN0IGFkZHJidWZmID0gdGhpcy5zdHJpbmdUb0FkZHJlc3MoYWRkcik7XG4gICAgICAgIGlmICgoYWRkcmxlbiAmJiBhZGRyYnVmZi5sZW5ndGggPT09IGFkZHJsZW4pIHx8ICEoYWRkcmxlbikpIHtcbiAgICAgICAgICByZXR1cm4gYWRkcmJ1ZmY7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfTtcbn1cbiJdfQ==