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
exports.SECP256k1KeyChain = exports.SECP256k1KeyPair = void 0;
/**
 * @packageDocumentation
 * @module Common-SECP256k1KeyChain
 */
const buffer_1 = require("buffer/");
const elliptic = __importStar(require("elliptic"));
const create_hash_1 = __importDefault(require("create-hash"));
const bintools_1 = __importDefault(require("../utils/bintools"));
const keychain_1 = require("./keychain");
const errors_1 = require("../utils/errors");
/**
 * @ignore
 */
const EC = elliptic.ec;
/**
 * @ignore
 */
const ec = new EC('secp256k1');
/**
 * @ignore
 */
const ecparams = ec.curve;
/**
 * @ignore
 */
const BN = ecparams.n.constructor;
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
/**
 * Class for representing a private and public keypair on the Platform Chain.
 */
class SECP256k1KeyPair extends keychain_1.StandardKeyPair {
    /**
     * Class for representing a private and public keypair in Avalanche PlatformVM.
     */
    constructor() {
        super();
        /**
         * @ignore
         */
        this._sigFromSigBuffer = (sig) => {
            const r = new BN(bintools.copyFrom(sig, 0, 32));
            const s = new BN(bintools.copyFrom(sig, 32, 64));
            const recoveryParam = bintools.copyFrom(sig, 64, 65).readUIntBE(0, 1);
            const sigOpt = {
                r: r,
                s: s,
                recoveryParam: recoveryParam
            };
            return sigOpt;
        };
        /**
           * Generates a new keypair.
           */
        this.generateKey = () => {
            this.keypair = ec.genKeyPair();
            // doing hex translation to get Buffer class
            this.privk = buffer_1.Buffer.from(this.keypair.getPrivate('hex').padStart(64, '0'), 'hex');
            this.pubk = buffer_1.Buffer.from(this.keypair.getPublic(true, 'hex').padStart(66, '0'), 'hex');
        };
        /**
           * Imports a private key and generates the appropriate public key.
           *
           * @param privk A {@link https://github.com/feross/buffer|Buffer} representing the private key
           *
           * @returns true on success, false on failure
           */
        this.importKey = (privk) => {
            this.keypair = ec.keyFromPrivate(privk.toString('hex'), 'hex');
            // doing hex translation to get Buffer class
            this.privk = buffer_1.Buffer.from(this.keypair.getPrivate('hex').padStart(64, '0'), 'hex');
            this.pubk = buffer_1.Buffer.from(this.keypair.getPublic(true, 'hex').padStart(66, '0'), 'hex');
            return true; // silly I know, but the interface requires so it returns true on success, so if Buffer fails validation...
        };
        /**
         * Returns the address as a {@link https://github.com/feross/buffer|Buffer}.
         *
         * @returns A {@link https://github.com/feross/buffer|Buffer} representation of the address
         */
        this.getAddress = () => {
            return this.addressFromPublicKey(this.pubk);
        };
        /**
           * Returns an address given a public key.
           *
           * @param pubk A {@link https://github.com/feross/buffer|Buffer} representing the public key
           *
           * @returns A {@link https://github.com/feross/buffer|Buffer} for the address of the public key.
           */
        this.addressFromPublicKey = (pubk) => {
            if (pubk.length === 65) {
                /* istanbul ignore next */
                pubk = buffer_1.Buffer.from(ec.keyFromPublic(pubk).getPublic(true, 'hex').padStart(66, '0'), 'hex'); // make compact, stick back into buffer
            }
            if (pubk.length === 33) {
                const sha256 = buffer_1.Buffer.from(create_hash_1.default('sha256').update(pubk).digest());
                const ripesha = buffer_1.Buffer.from(create_hash_1.default('ripemd160').update(sha256).digest());
                return ripesha;
            }
            /* istanbul ignore next */
            throw new errors_1.PublicKeyError('Unable to make address.');
        };
        /**
         * Returns a string representation of the private key.
         *
         * @returns A cb58 serialized string representation of the private key
         */
        this.getPrivateKeyString = () => {
            return "PrivateKey-" + bintools.cb58Encode(this.privk);
        };
        /**
         * Returns the public key.
         *
         * @returns A cb58 serialized string representation of the public key
         */
        this.getPublicKeyString = () => {
            return bintools.cb58Encode(this.pubk);
        };
        /**
         * Takes a message, signs it, and returns the signature.
         *
         * @param msg The message to sign, be sure to hash first if expected
         *
         * @returns A {@link https://github.com/feross/buffer|Buffer} containing the signature
         */
        this.sign = (msg) => {
            const sigObj = this.keypair.sign(msg, undefined, { canonical: true });
            const recovery = buffer_1.Buffer.alloc(1);
            recovery.writeUInt8(sigObj.recoveryParam, 0);
            const r = buffer_1.Buffer.from(sigObj.r.toArray("be", 32)); //we have to skip native Buffer class, so this is the way
            const s = buffer_1.Buffer.from(sigObj.s.toArray("be", 32)); //we have to skip native Buffer class, so this is the way
            const result = buffer_1.Buffer.concat([r, s, recovery], 65);
            return result;
        };
        /**
         * Verifies that the private key associated with the provided public key produces the signature associated with the given message.
         *
         * @param msg The message associated with the signature
         * @param sig The signature of the signed message
         *
         * @returns True on success, false on failure
         */
        this.verify = (msg, sig) => {
            const sigObj = this._sigFromSigBuffer(sig);
            return ec.verify(msg, sigObj, this.keypair);
        };
        /**
         * Recovers the public key of a message signer from a message and its associated signature.
         *
         * @param msg The message that's signed
         * @param sig The signature that's signed on the message
         *
         * @returns A {@link https://github.com/feross/buffer|Buffer} containing the public key of the signer
         */
        this.recover = (msg, sig) => {
            const sigObj = this._sigFromSigBuffer(sig);
            const pubk = ec.recoverPubKey(msg, sigObj, sigObj.recoveryParam);
            return buffer_1.Buffer.from(pubk.encodeCompressed());
        };
    }
}
exports.SECP256k1KeyPair = SECP256k1KeyPair;
/**
 * Class for representing a key chain in Avalanche.
 *
 * @typeparam SECP256k1KeyPair Class extending [[StandardKeyPair]] which is used as the key in [[SECP256k1KeyChain]]
 */
class SECP256k1KeyChain extends keychain_1.StandardKeyChain {
    addKey(newKey) {
        super.addKey(newKey);
    }
}
exports.SECP256k1KeyChain = SECP256k1KeyChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VjcDI1NmsxLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1vbi9zZWNwMjU2azEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFpQztBQUNqQyxtREFBcUM7QUFDckMsOERBQXFDO0FBQ3JDLGlFQUF5QztBQUN6Qyx5Q0FBK0Q7QUFDL0QsNENBQWlEO0FBRWpEOztHQUVHO0FBQ0gsTUFBTSxFQUFFLEdBQXVCLFFBQVEsQ0FBQyxFQUFFLENBQUM7QUFFM0M7O0dBRUc7QUFDSCxNQUFNLEVBQUUsR0FBZ0IsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7QUFFNUM7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDO0FBRTFCOztHQUVHO0FBQ0gsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7QUFFbEM7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBR2xEOztHQUVHO0FBQ0gsTUFBc0IsZ0JBQWlCLFNBQVEsMEJBQWU7SUFnSjFEOztPQUVHO0lBQ0g7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQWpKWjs7V0FFRztRQUNPLHNCQUFpQixHQUFHLENBQUMsR0FBVSxFQUErQixFQUFFO1lBQ3RFLE1BQU0sQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hELE1BQU0sQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pELE1BQU0sYUFBYSxHQUFVLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLEVBQUUs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QUFDO1FBQ2xCLENBQUMsQ0FBQTtRQUVEOzs7Ozs7O1dBT0c7UUFDSCxXQUFNLEdBQUcsQ0FBQyxHQUFVLEVBQUUsR0FBVSxFQUFVLEVBQUU7WUFDeEMsTUFBTSxNQUFNLEdBQWdDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN4RSxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFBO1FBRUQ7Ozs7Ozs7V0FPRztRQUNILFlBQU8sR0FBRyxDQUFDLEdBQVUsRUFBRSxHQUFVLEVBQVMsRUFBRTtZQUN4QyxNQUFNLE1BQU0sR0FBZ0MsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hFLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDakUsT0FBTyxlQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFDaEQsQ0FBQyxDQUFBO0lBT0QsQ0FBQztDQUVKO0FBdkpELDRDQXVKQztBQUVEOzs7O0dBSUc7QUFDSCxNQUFzQixpQkFBd0QsU0FBUSwyQkFBNkI7SUFTL0csTUFBTSxDQUFDLE1BQWtCO1FBQ3JCLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDekIsQ0FBQztDQVdKO0FBdEJELDhDQXNCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIENvbW1vbi1TRUNQMjU2azFLZXlDaGFpblxuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiO1xuaW1wb3J0ICogYXMgZWxsaXB0aWMgZnJvbSBcImVsbGlwdGljXCI7XG5pbXBvcnQgY3JlYXRlSGFzaCBmcm9tIFwiY3JlYXRlLWhhc2hcIjtcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi91dGlscy9iaW50b29scyc7XG5pbXBvcnQgeyBTdGFuZGFyZEtleVBhaXIsIFN0YW5kYXJkS2V5Q2hhaW4gfSBmcm9tICcuL2tleWNoYWluJztcbmltcG9ydCB7IFB1YmxpY0tleUVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3JzJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IEVDOiB0eXBlb2YgZWxsaXB0aWMuZWMgPSBlbGxpcHRpYy5lYztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGVjOiBlbGxpcHRpYy5lYyA9IG5ldyBFQygnc2VjcDI1NmsxJyk7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBlY3BhcmFtcyA9IGVjLmN1cnZlO1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgQk4gPSBlY3BhcmFtcy5uLmNvbnN0cnVjdG9yO1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuY29uc3QgYmludG9vbHM6IEJpblRvb2xzID0gQmluVG9vbHMuZ2V0SW5zdGFuY2UoKTtcblxuXG4vKipcbiAqIENsYXNzIGZvciByZXByZXNlbnRpbmcgYSBwcml2YXRlIGFuZCBwdWJsaWMga2V5cGFpciBvbiB0aGUgUGxhdGZvcm0gQ2hhaW4uIFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU0VDUDI1NmsxS2V5UGFpciBleHRlbmRzIFN0YW5kYXJkS2V5UGFpciB7XG4gICAgcHJvdGVjdGVkIGtleXBhaXI6ZWxsaXB0aWMuZWMuS2V5UGFpclxuXG4gICAgLyoqXG4gICAgICogQGlnbm9yZVxuICAgICAqL1xuICAgIHByb3RlY3RlZCBfc2lnRnJvbVNpZ0J1ZmZlciA9IChzaWc6QnVmZmVyKTplbGxpcHRpYy5lYy5TaWduYXR1cmVPcHRpb25zID0+IHtcbiAgICAgICAgY29uc3QgciA9IG5ldyBCTihiaW50b29scy5jb3B5RnJvbShzaWcsIDAsIDMyKSk7XG4gICAgICAgIGNvbnN0IHMgPSBuZXcgQk4oYmludG9vbHMuY29weUZyb20oc2lnLCAzMiwgNjQpKTtcbiAgICAgICAgY29uc3QgcmVjb3ZlcnlQYXJhbTpudW1iZXIgPSBiaW50b29scy5jb3B5RnJvbShzaWcsIDY0LCA2NSkucmVhZFVJbnRCRSgwLCAxKTtcbiAgICAgICAgY29uc3Qgc2lnT3B0ID0ge1xuICAgICAgICAgICAgcjpyLFxuICAgICAgICAgICAgczpzLFxuICAgICAgICAgICAgcmVjb3ZlcnlQYXJhbTpyZWNvdmVyeVBhcmFtXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBzaWdPcHQ7XG4gICAgfVxuXG4gIC8qKlxuICAgICAqIEdlbmVyYXRlcyBhIG5ldyBrZXlwYWlyLlxuICAgICAqL1xuICAgIGdlbmVyYXRlS2V5ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmtleXBhaXIgPSBlYy5nZW5LZXlQYWlyKCk7XG4gICAgXG4gICAgICAgIC8vIGRvaW5nIGhleCB0cmFuc2xhdGlvbiB0byBnZXQgQnVmZmVyIGNsYXNzXG4gICAgICAgIHRoaXMucHJpdmsgPSBCdWZmZXIuZnJvbSh0aGlzLmtleXBhaXIuZ2V0UHJpdmF0ZSgnaGV4JykucGFkU3RhcnQoNjQsICcwJyksICdoZXgnKTtcbiAgICAgICAgdGhpcy5wdWJrID0gQnVmZmVyLmZyb20odGhpcy5rZXlwYWlyLmdldFB1YmxpYyh0cnVlLCAnaGV4JykucGFkU3RhcnQoNjYsICcwJyksICdoZXgnKTtcbiAgICAgIH07XG5cbiAgLyoqXG4gICAgICogSW1wb3J0cyBhIHByaXZhdGUga2V5IGFuZCBnZW5lcmF0ZXMgdGhlIGFwcHJvcHJpYXRlIHB1YmxpYyBrZXkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gcHJpdmsgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRpbmcgdGhlIHByaXZhdGUga2V5XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB0cnVlIG9uIHN1Y2Nlc3MsIGZhbHNlIG9uIGZhaWx1cmVcbiAgICAgKi9cbiAgICBpbXBvcnRLZXkgPSAocHJpdms6QnVmZmVyKTpib29sZWFuID0+IHtcbiAgICAgICAgdGhpcy5rZXlwYWlyID0gZWMua2V5RnJvbVByaXZhdGUocHJpdmsudG9TdHJpbmcoJ2hleCcpLCAnaGV4Jyk7XG4gICAgICAgIC8vIGRvaW5nIGhleCB0cmFuc2xhdGlvbiB0byBnZXQgQnVmZmVyIGNsYXNzXG4gICAgICAgIHRoaXMucHJpdmsgPSBCdWZmZXIuZnJvbSh0aGlzLmtleXBhaXIuZ2V0UHJpdmF0ZSgnaGV4JykucGFkU3RhcnQoNjQsICcwJyksICdoZXgnKTtcbiAgICAgICAgdGhpcy5wdWJrID0gQnVmZmVyLmZyb20odGhpcy5rZXlwYWlyLmdldFB1YmxpYyh0cnVlLCAnaGV4JykucGFkU3RhcnQoNjYsICcwJyksICdoZXgnKTtcbiAgICAgICAgcmV0dXJuIHRydWU7IC8vIHNpbGx5IEkga25vdywgYnV0IHRoZSBpbnRlcmZhY2UgcmVxdWlyZXMgc28gaXQgcmV0dXJucyB0cnVlIG9uIHN1Y2Nlc3MsIHNvIGlmIEJ1ZmZlciBmYWlscyB2YWxpZGF0aW9uLi4uXG4gICAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYWRkcmVzcyBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9LlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIGFkZHJlc3NcbiAgICAgKi9cbiAgICBnZXRBZGRyZXNzID0gKCk6QnVmZmVyID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkcmVzc0Zyb21QdWJsaWNLZXkodGhpcy5wdWJrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBhZGRyZXNzJ3Mgc3RyaW5nIHJlcHJlc2VudGF0aW9uLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhZGRyZXNzXG4gICAgICovXG4gICAgZ2V0QWRkcmVzc1N0cmluZzooKSA9PiBzdHJpbmc7XG5cbiAgLyoqXG4gICAgICogUmV0dXJucyBhbiBhZGRyZXNzIGdpdmVuIGEgcHVibGljIGtleS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwdWJrIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBwdWJsaWMga2V5XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgYWRkcmVzcyBvZiB0aGUgcHVibGljIGtleS5cbiAgICAgKi9cbiAgICBhZGRyZXNzRnJvbVB1YmxpY0tleSA9IChwdWJrOkJ1ZmZlcik6IEJ1ZmZlciA9PiB7XG4gICAgICAgIGlmIChwdWJrLmxlbmd0aCA9PT0gNjUpIHtcbiAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgIHB1YmsgPSBCdWZmZXIuZnJvbShlYy5rZXlGcm9tUHVibGljKHB1YmspLmdldFB1YmxpYyh0cnVlLCAnaGV4JykucGFkU3RhcnQoNjYsICcwJyksICdoZXgnKTsgLy8gbWFrZSBjb21wYWN0LCBzdGljayBiYWNrIGludG8gYnVmZmVyXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHB1YmsubGVuZ3RoID09PSAzMykge1xuICAgICAgICAgIGNvbnN0IHNoYTI1NjpCdWZmZXIgPSBCdWZmZXIuZnJvbShjcmVhdGVIYXNoKCdzaGEyNTYnKS51cGRhdGUocHViaykuZGlnZXN0KCkpO1xuICAgICAgICAgIGNvbnN0IHJpcGVzaGE6QnVmZmVyID0gQnVmZmVyLmZyb20oY3JlYXRlSGFzaCgncmlwZW1kMTYwJykudXBkYXRlKHNoYTI1NikuZGlnZXN0KCkpO1xuICAgICAgICAgIHJldHVybiByaXBlc2hhO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHRocm93IG5ldyBQdWJsaWNLZXlFcnJvcignVW5hYmxlIHRvIG1ha2UgYWRkcmVzcy4nKTtcbiAgICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwcml2YXRlIGtleS5cbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHByaXZhdGUga2V5XG4gICAgICovXG4gICAgZ2V0UHJpdmF0ZUtleVN0cmluZyA9ICgpOnN0cmluZyA9PiB7XG4gICAgICAgIHJldHVybiBcIlByaXZhdGVLZXktXCIgKyBiaW50b29scy5jYjU4RW5jb2RlKHRoaXMucHJpdmspO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHB1YmxpYyBrZXkuXG4gICAgICogXG4gICAgICogQHJldHVybnMgQSBjYjU4IHNlcmlhbGl6ZWQgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwdWJsaWMga2V5XG4gICAgICovXG4gICAgZ2V0UHVibGljS2V5U3RyaW5nID0gKCk6c3RyaW5nID0+IHtcbiAgICAgICAgcmV0dXJuIGJpbnRvb2xzLmNiNThFbmNvZGUodGhpcy5wdWJrKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFRha2VzIGEgbWVzc2FnZSwgc2lnbnMgaXQsIGFuZCByZXR1cm5zIHRoZSBzaWduYXR1cmUuXG4gICAgICogXG4gICAgICogQHBhcmFtIG1zZyBUaGUgbWVzc2FnZSB0byBzaWduLCBiZSBzdXJlIHRvIGhhc2ggZmlyc3QgaWYgZXhwZWN0ZWRcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgdGhlIHNpZ25hdHVyZVxuICAgICAqL1xuICAgIHNpZ24gPSAobXNnOkJ1ZmZlcik6QnVmZmVyID0+IHtcbiAgICAgICAgY29uc3Qgc2lnT2JqID0gdGhpcy5rZXlwYWlyLnNpZ24obXNnLCB1bmRlZmluZWQsIHsgY2Fub25pY2FsOiB0cnVlIH0pO1xuICAgICAgICBjb25zdCByZWNvdmVyeTpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMSk7XG4gICAgICAgIHJlY292ZXJ5LndyaXRlVUludDgoc2lnT2JqLnJlY292ZXJ5UGFyYW0sIDApO1xuICAgICAgICBjb25zdCByOkJ1ZmZlciA9IEJ1ZmZlci5mcm9tKHNpZ09iai5yLnRvQXJyYXkoXCJiZVwiLCAzMikpOyAvL3dlIGhhdmUgdG8gc2tpcCBuYXRpdmUgQnVmZmVyIGNsYXNzLCBzbyB0aGlzIGlzIHRoZSB3YXlcbiAgICAgICAgY29uc3QgczpCdWZmZXIgPSBCdWZmZXIuZnJvbShzaWdPYmoucy50b0FycmF5KFwiYmVcIiwgMzIpKTsgLy93ZSBoYXZlIHRvIHNraXAgbmF0aXZlIEJ1ZmZlciBjbGFzcywgc28gdGhpcyBpcyB0aGUgd2F5XG4gICAgICAgIGNvbnN0IHJlc3VsdDpCdWZmZXIgPSBCdWZmZXIuY29uY2F0KFtyLHMsIHJlY292ZXJ5XSwgNjUpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBWZXJpZmllcyB0aGF0IHRoZSBwcml2YXRlIGtleSBhc3NvY2lhdGVkIHdpdGggdGhlIHByb3ZpZGVkIHB1YmxpYyBrZXkgcHJvZHVjZXMgdGhlIHNpZ25hdHVyZSBhc3NvY2lhdGVkIHdpdGggdGhlIGdpdmVuIG1lc3NhZ2UuXG4gICAgICogXG4gICAgICogQHBhcmFtIG1zZyBUaGUgbWVzc2FnZSBhc3NvY2lhdGVkIHdpdGggdGhlIHNpZ25hdHVyZVxuICAgICAqIEBwYXJhbSBzaWcgVGhlIHNpZ25hdHVyZSBvZiB0aGUgc2lnbmVkIG1lc3NhZ2VcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBUcnVlIG9uIHN1Y2Nlc3MsIGZhbHNlIG9uIGZhaWx1cmVcbiAgICAgKi9cbiAgICB2ZXJpZnkgPSAobXNnOkJ1ZmZlciwgc2lnOkJ1ZmZlcik6Ym9vbGVhbiA9PiB7IFxuICAgICAgICBjb25zdCBzaWdPYmo6ZWxsaXB0aWMuZWMuU2lnbmF0dXJlT3B0aW9ucyA9IHRoaXMuX3NpZ0Zyb21TaWdCdWZmZXIoc2lnKTtcbiAgICAgICAgcmV0dXJuIGVjLnZlcmlmeShtc2csIHNpZ09iaiwgdGhpcy5rZXlwYWlyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZWNvdmVycyB0aGUgcHVibGljIGtleSBvZiBhIG1lc3NhZ2Ugc2lnbmVyIGZyb20gYSBtZXNzYWdlIGFuZCBpdHMgYXNzb2NpYXRlZCBzaWduYXR1cmUuXG4gICAgICogXG4gICAgICogQHBhcmFtIG1zZyBUaGUgbWVzc2FnZSB0aGF0J3Mgc2lnbmVkXG4gICAgICogQHBhcmFtIHNpZyBUaGUgc2lnbmF0dXJlIHRoYXQncyBzaWduZWQgb24gdGhlIG1lc3NhZ2VcbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgdGhlIHB1YmxpYyBrZXkgb2YgdGhlIHNpZ25lclxuICAgICAqL1xuICAgIHJlY292ZXIgPSAobXNnOkJ1ZmZlciwgc2lnOkJ1ZmZlcik6QnVmZmVyID0+IHtcbiAgICAgICAgY29uc3Qgc2lnT2JqOmVsbGlwdGljLmVjLlNpZ25hdHVyZU9wdGlvbnMgPSB0aGlzLl9zaWdGcm9tU2lnQnVmZmVyKHNpZyk7XG4gICAgICAgIGNvbnN0IHB1YmsgPSBlYy5yZWNvdmVyUHViS2V5KG1zZywgc2lnT2JqLCBzaWdPYmoucmVjb3ZlcnlQYXJhbSk7XG4gICAgICAgIHJldHVybiBCdWZmZXIuZnJvbShwdWJrLmVuY29kZUNvbXByZXNzZWQoKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIHByaXZhdGUgYW5kIHB1YmxpYyBrZXlwYWlyIGluIEF2YWxhbmNoZSBQbGF0Zm9ybVZNLiBcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG4gICAgXG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIGtleSBjaGFpbiBpbiBBdmFsYW5jaGUuIFxuICogXG4gKiBAdHlwZXBhcmFtIFNFQ1AyNTZrMUtleVBhaXIgQ2xhc3MgZXh0ZW5kaW5nIFtbU3RhbmRhcmRLZXlQYWlyXV0gd2hpY2ggaXMgdXNlZCBhcyB0aGUga2V5IGluIFtbU0VDUDI1NmsxS2V5Q2hhaW5dXVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU0VDUDI1NmsxS2V5Q2hhaW48U0VDUEtQQ2xhc3MgZXh0ZW5kcyBTRUNQMjU2azFLZXlQYWlyPiBleHRlbmRzIFN0YW5kYXJkS2V5Q2hhaW48U0VDUEtQQ2xhc3M+IHtcblxuICAgIC8qKlxuICAgICAqIE1ha2VzIGEgbmV3IGtleSBwYWlyLCByZXR1cm5zIHRoZSBhZGRyZXNzLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIEFkZHJlc3Mgb2YgdGhlIG5ldyBrZXkgcGFpclxuICAgICAqL1xuICAgIG1ha2VLZXk6KCkgPT4gU0VDUEtQQ2xhc3M7IFxuXG4gICAgYWRkS2V5KG5ld0tleTpTRUNQS1BDbGFzcykge1xuICAgICAgICBzdXBlci5hZGRLZXkobmV3S2V5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIHByaXZhdGUga2V5LCBtYWtlcyBhIG5ldyBrZXkgcGFpciwgcmV0dXJucyB0aGUgYWRkcmVzcy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gcHJpdmsgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBjYjU4IHNlcmlhbGl6ZWQgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgcHJpdmF0ZSBrZXkgXG4gICAgICogXG4gICAgICogQHJldHVybnMgQWRkcmVzcyBvZiB0aGUgbmV3IGtleSBwYWlyXG4gICAgICovXG4gICAgaW1wb3J0S2V5Oihwcml2azpCdWZmZXIgfCBzdHJpbmcpID0+IFNFQ1BLUENsYXNzO1xuXG59XG4iXX0=