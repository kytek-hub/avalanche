"use strict";
/**
 * @packageDocumentation
 * @module API-EVM-KeyChain
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyChain = exports.KeyPair = void 0;
const bintools_1 = __importDefault(require("../../utils/bintools"));
const secp256k1_1 = require("../../common/secp256k1");
const utils_1 = require("../../utils");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = utils_1.Serialization.getInstance();
/**
 * Class for representing a private and public keypair on an AVM Chain.
 */
class KeyPair extends secp256k1_1.SECP256k1KeyPair {
    constructor(hrp, chainid) {
        super();
        this.chainID = '';
        this.hrp = '';
        /**
         * Returns the address's string representation.
          *
          * @returns A string representation of the address
          */
        this.getAddressString = () => {
            const addr = this.addressFromPublicKey(this.pubk);
            const type = "bech32";
            return serialization.bufferToType(addr, type, this.hrp, this.chainID);
        };
        /**
          * Returns the chainID associated with this key.
          *
          * @returns The [[KeyPair]]'s chainID
          */
        this.getChainID = () => this.chainID;
        /**
          * Sets the the chainID associated with this key.
          *
          * @param chainID String for the chainID
          */
        this.setChainID = (chainID) => {
            this.chainID = chainID;
        };
        /**
          * Returns the Human-Readable-Part of the network associated with this key.
          *
          * @returns The [[KeyPair]]'s Human-Readable-Part of the network's Bech32 addressing scheme
          */
        this.getHRP = () => this.hrp;
        /**
          * Sets the the Human-Readable-Part of the network associated with this key.
          *
          * @param hrp String for the Human-Readable-Part of Bech32 addresses
          */
        this.setHRP = (hrp) => {
            this.hrp = hrp;
        };
        this.chainID = chainid;
        this.hrp = hrp;
        this.generateKey();
    }
    clone() {
        let newkp = new KeyPair(this.hrp, this.chainID);
        newkp.importKey(bintools.copyFrom(this.getPrivateKey()));
        return newkp;
    }
    create(...args) {
        if (args.length == 2) {
            return new KeyPair(args[0], args[1]);
        }
        return new KeyPair(this.hrp, this.chainID);
    }
}
exports.KeyPair = KeyPair;
/**
  * Class for representing a key chain in Avalanche.
  *
  * @typeparam KeyPair Class extending [[SECP256k1KeyChain]] which is used as the key in [[KeyChain]]
  */
class KeyChain extends secp256k1_1.SECP256k1KeyChain {
    /**
      * Returns instance of KeyChain.
      */
    constructor(hrp, chainID) {
        super();
        this.hrp = '';
        this.chainID = '';
        /**
          * Makes a new key pair, returns the address.
          *
          * @returns The new key pair
          */
        this.makeKey = () => {
            let keypair = new KeyPair(this.hrp, this.chainID);
            this.addKey(keypair);
            return keypair;
        };
        this.addKey = (newKey) => {
            newKey.setChainID(this.chainID);
            super.addKey(newKey);
        };
        /**
          * Given a private key, makes a new key pair, returns the address.
          *
          * @param privk A {@link https://github.com/feross/buffer|Buffer}
          * or cb58 serialized string representing the private key
          *
          * @returns The new key pair
          */
        this.importKey = (privk) => {
            let keypair = new KeyPair(this.hrp, this.chainID);
            let pk;
            if (typeof privk === 'string') {
                pk = bintools.cb58Decode(privk.split('-')[1]);
            }
            else {
                pk = bintools.copyFrom(privk);
            }
            keypair.importKey(pk);
            if (!(keypair.getAddress().toString("hex") in this.keys)) {
                this.addKey(keypair);
            }
            return keypair;
        };
        this.hrp = hrp;
        this.chainID = chainID;
    }
    create(...args) {
        if (args.length == 2) {
            return new KeyChain(args[0], args[1]);
        }
        return new KeyChain(this.hrp, this.chainID);
    }
    ;
    clone() {
        const newkc = new KeyChain(this.hrp, this.chainID);
        for (let k in this.keys) {
            newkc.addKey(this.keys[k].clone());
        }
        return newkc;
    }
    ;
    union(kc) {
        let newkc = kc.clone();
        for (let k in this.keys) {
            newkc.addKey(this.keys[k].clone());
        }
        return newkc;
    }
}
exports.KeyChain = KeyChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Y2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9ldm0va2V5Y2hhaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBR0gsb0VBQTRDO0FBQzVDLHNEQUdnQztBQUNoQyx1Q0FBMkQ7QUFFM0Q7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ2xELE1BQU0sYUFBYSxHQUFrQixxQkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWhFOztHQUVHO0FBQ0gsTUFBYSxPQUFRLFNBQVEsNEJBQWdCO0lBNEQzQyxZQUFZLEdBQVcsRUFBRSxPQUFlO1FBQ3RDLEtBQUssRUFBRSxDQUFDO1FBNURBLFlBQU8sR0FBVyxFQUFFLENBQUM7UUFDckIsUUFBRyxHQUFXLEVBQUUsQ0FBQztRQUUzQjs7OztZQUlJO1FBQ0oscUJBQWdCLEdBQUcsR0FBVyxFQUFFO1lBQzlCLE1BQU0sSUFBSSxHQUFXLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDMUQsTUFBTSxJQUFJLEdBQW1CLFFBQVEsQ0FBQTtZQUNyQyxPQUFPLGFBQWEsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUN2RSxDQUFDLENBQUE7UUFFRDs7OztZQUlJO1FBQ0osZUFBVSxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFFeEM7Ozs7WUFJSTtRQUNKLGVBQVUsR0FBRyxDQUFDLE9BQWUsRUFBUSxFQUFFO1lBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3pCLENBQUMsQ0FBQztRQUVGOzs7O1lBSUk7UUFDSixXQUFNLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcs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QU8sQ0FBQztJQUN6QixDQUFDO0lBOUJELE1BQU0sQ0FBQyxHQUFHLElBQVc7UUFDbkIsSUFBRyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQztZQUNsQixPQUFPLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQVMsQ0FBQztTQUMvQztRQUNELE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFTLENBQUM7SUFDdEQsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLO1FBQ0gsTUFBTSxLQUFLLEdBQWEsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0QsS0FBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFDO1lBQ3JCLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQ3BDO1FBQ0QsT0FBTyxLQUFhLENBQUM7SUFDdkIsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsRUFBUTtRQUNaLElBQUksS0FBSyxHQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQyxLQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUM7WUFDckIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDcEM7UUFDRCxPQUFPLEtBQWEsQ0FBQztJQUN2QixDQUFDO0NBVUY7QUExRUQsNEJBMEVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLUVWTS1LZXlDaGFpblxuICovXG5cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nO1xuaW1wb3J0IEJpblRvb2xzIGZyb20gJy4uLy4uL3V0aWxzL2JpbnRvb2xzJztcbmltcG9ydCB7IFxuICBTRUNQMjU2azFLZXlDaGFpbiwgXG4gIFNFQ1AyNTZrMUtleVBhaXIgXG59IGZyb20gJy4uLy4uL2NvbW1vbi9zZWNwMjU2azEnO1xuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZFR5cGUgfSBmcm9tICcuLi8uLi91dGlscydcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKCk7XG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIHByaXZhdGUgYW5kIHB1YmxpYyBrZXlwYWlyIG9uIGFuIEFWTSBDaGFpbi4gXG4gKi9cbmV4cG9ydCBjbGFzcyBLZXlQYWlyIGV4dGVuZHMgU0VDUDI1NmsxS2V5UGFpciB7XG4gIHByb3RlY3RlZCBjaGFpbklEOiBzdHJpbmcgPSAnJztcbiAgcHJvdGVjdGVkIGhycDogc3RyaW5nID0gJyc7XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGFkZHJlc3MncyBzdHJpbmcgcmVwcmVzZW50YXRpb24uXG4gICAgKiBcbiAgICAqIEByZXR1cm5zIEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhZGRyZXNzXG4gICAgKi9cbiAgZ2V0QWRkcmVzc1N0cmluZyA9ICgpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IGFkZHI6IEJ1ZmZlciA9IHRoaXMuYWRkcmVzc0Zyb21QdWJsaWNLZXkodGhpcy5wdWJrKTtcbiAgICBjb25zdCB0eXBlOiBTZXJpYWxpemVkVHlwZSA9IFwiYmVjaDMyXCJcbiAgICByZXR1cm4gc2VyaWFsaXphdGlvbi5idWZmZXJUb1R5cGUoYWRkciwgdHlwZSwgdGhpcy5ocnAsIHRoaXMuY2hhaW5JRClcbiAgfVxuXG4gIC8qKlxuICAgICogUmV0dXJucyB0aGUgY2hhaW5JRCBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXkuXG4gICAgKlxuICAgICogQHJldHVybnMgVGhlIFtbS2V5UGFpcl1dJ3MgY2hhaW5JRFxuICAgICovXG4gIGdldENoYWluSUQgPSAoKTogc3RyaW5nID0+IHRoaXMuY2hhaW5JRDtcblxuICAvKipcbiAgICAqIFNldHMgdGhlIHRoZSBjaGFpbklEIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGtleS5cbiAgICAqXG4gICAgKiBAcGFyYW0gY2hhaW5JRCBTdHJpbmcgZm9yIHRoZSBjaGFpbklEXG4gICAgKi9cbiAgc2V0Q2hhaW5JRCA9IChjaGFpbklEOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICB0aGlzLmNoYWluSUQgPSBjaGFpbklEO1xuICB9O1xuXG4gIC8qKlxuICAgICogUmV0dXJucyB0aGUgSHVtYW4tUmVhZGFibGUtUGFydCBvZiB0aGUgbmV0d29yayBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXkuXG4gICAgKlxuICAgICogQHJldHVybnMgVGhlIFtbS2V5UGFpcl1dJ3MgSHVtYW4tUmVhZGFibGUtUGFydCBvZiB0aGUgbmV0d29yaydzIEJlY2gzMiBhZGRyZXNzaW5nIHNjaGVtZVxuICAgICovXG4gIGdldEhSUCA9ICgpOiBzdHJpbmcgPT4gdGhpcy5ocnA7XG4gIFxuICAvKipcbiAgICAqIFNldHMgdGhlIHRoZSBIdW1hbi1SZWFkYWJsZS1QYXJ0IG9mIHRoZSBuZXR3b3JrIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGtleS5cbiAgICAqXG4gICAgKiBAcGFyYW0gaHJwIFN0cmluZyBmb3IgdGhlIEh1bWFuLVJlYWRhYmxlLVBhcnQgb2YgQmVjaDMyIGFkZHJlc3Nlc1xuICAgICovXG4gIHNldEhSUCA9IChocnA6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgIHRoaXMuaHJwID0gaHJwO1xuICB9O1xuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGxldCBuZXdrcDogS2V5UGFpciA9IG5ldyBLZXlQYWlyKHRoaXMuaHJwLCB0aGlzLmNoYWluSUQpO1xuICAgIG5ld2twLmltcG9ydEtleShiaW50b29scy5jb3B5RnJvbSh0aGlzLmdldFByaXZhdGVLZXkoKSkpO1xuICAgIHJldHVybiBuZXdrcCBhcyB0aGlzO1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6IGFueVtdKTogdGhpcyB7XG4gICAgaWYoYXJncy5sZW5ndGggPT0gMil7XG4gICAgICByZXR1cm4gbmV3IEtleVBhaXIoYXJnc1swXSwgYXJnc1sxXSkgYXMgdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBLZXlQYWlyKHRoaXMuaHJwLCB0aGlzLmNoYWluSUQpIGFzIHRoaXM7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihocnA6IHN0cmluZywgY2hhaW5pZDogc3RyaW5nKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmNoYWluSUQgPSBjaGFpbmlkO1xuICAgIHRoaXMuaHJwID0gaHJwO1xuICAgIHRoaXMuZ2VuZXJhdGVLZXkoKTtcbiAgfVxufVxuXG4vKipcbiAgKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEga2V5IGNoYWluIGluIEF2YWxhbmNoZS4gXG4gICogXG4gICogQHR5cGVwYXJhbSBLZXlQYWlyIENsYXNzIGV4dGVuZGluZyBbW1NFQ1AyNTZrMUtleUNoYWluXV0gd2hpY2ggaXMgdXNlZCBhcyB0aGUga2V5IGluIFtbS2V5Q2hhaW5dXVxuICAqL1xuZXhwb3J0IGNsYXNzIEtleUNoYWluIGV4dGVuZHMgU0VDUDI1NmsxS2V5Q2hhaW48S2V5UGFpcj4ge1xuICBocnA6IHN0cmluZyA9ICcnO1xuICBjaGFpbklEOiBzdHJpbmcgPSAnJztcblxuICAvKipcbiAgICAqIE1ha2VzIGEgbmV3IGtleSBwYWlyLCByZXR1cm5zIHRoZSBhZGRyZXNzLlxuICAgICogXG4gICAgKiBAcmV0dXJucyBUaGUgbmV3IGtleSBwYWlyXG4gICAgKi9cbiAgbWFrZUtleSA9ICgpOiBLZXlQYWlyID0+IHtcbiAgICBsZXQga2V5cGFpcjogS2V5UGFpciA9IG5ldyBLZXlQYWlyKHRoaXMuaHJwLCB0aGlzLmNoYWluSUQpO1xuICAgIHRoaXMuYWRkS2V5KGtleXBhaXIpO1xuICAgIHJldHVybiBrZXlwYWlyXG4gIH1cblxuICBhZGRLZXkgPSAobmV3S2V5OiBLZXlQYWlyKSA9PiB7XG4gICAgbmV3S2V5LnNldENoYWluSUQodGhpcy5jaGFpbklEKTtcbiAgICBzdXBlci5hZGRLZXkobmV3S2V5KTtcbiAgfVxuXG4gIC8qKlxuICAgICogR2l2ZW4gYSBwcml2YXRlIGtleSwgbWFrZXMgYSBuZXcga2V5IHBhaXIsIHJldHVybnMgdGhlIGFkZHJlc3MuXG4gICAgKiBcbiAgICAqIEBwYXJhbSBwcml2ayBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IFxuICAgICogb3IgY2I1OCBzZXJpYWxpemVkIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHByaXZhdGUga2V5IFxuICAgICogXG4gICAgKiBAcmV0dXJucyBUaGUgbmV3IGtleSBwYWlyXG4gICAgKi9cbiAgaW1wb3J0S2V5ID0gKHByaXZrOiBCdWZmZXIgfCBzdHJpbmcpOiBLZXlQYWlyID0+IHtcbiAgICBsZXQga2V5cGFpcjogS2V5UGFpciA9IG5ldyBLZXlQYWlyKHRoaXMuaHJwLCB0aGlzLmNoYWluSUQpO1xuICAgIGxldCBwazogQnVmZmVyO1xuICAgIGlmKHR5cGVvZiBwcml2ayA9PT0gJ3N0cmluZycpe1xuICAgICAgcGsgPSBiaW50b29scy5jYjU4RGVjb2RlKHByaXZrLnNwbGl0KCctJylbMV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwayA9IGJpbnRvb2xzLmNvcHlGcm9tKHByaXZrKTtcbiAgICB9XG4gICAga2V5cGFpci5pbXBvcnRLZXkocGspO1xuICAgIGlmKCEoa2V5cGFpci5nZXRBZGRyZXNzKCkudG9TdHJpbmcoXCJoZXhcIikgaW4gdGhpcy5rZXlzKSl7XG4gICAgICB0aGlzLmFkZEtleShrZXlwYWlyKTtcbiAgICB9XG4gICAgcmV0dXJuIGtleXBhaXI7XG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICBpZihhcmdzLmxlbmd0aCA9PSAyKXtcbiAgICAgIHJldHVybiBuZXcgS2V5Q2hhaW4oYXJnc1swXSwgYXJnc1sxXSkgYXMgdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBLZXlDaGFpbih0aGlzLmhycCwgdGhpcy5jaGFpbklEKSBhcyB0aGlzO1xuICB9O1xuXG4gIGNsb25lKCk6IHRoaXMge1xuICAgIGNvbnN0IG5ld2tjOiBLZXlDaGFpbiA9IG5ldyBLZXlDaGFpbih0aGlzLmhycCwgdGhpcy5jaGFpbklEKTtcbiAgICBmb3IobGV0IGsgaW4gdGhpcy5rZXlzKXtcbiAgICAgIG5ld2tjLmFkZEtleSh0aGlzLmtleXNba10uY2xvbmUoKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdrYyBhcyB0aGlzO1xuICB9O1xuXG4gIHVuaW9uKGtjOiB0aGlzKTogdGhpcyB7XG4gICAgbGV0IG5ld2tjOktleUNoYWluID0ga2MuY2xvbmUoKTtcbiAgICBmb3IobGV0IGsgaW4gdGhpcy5rZXlzKXtcbiAgICAgIG5ld2tjLmFkZEtleSh0aGlzLmtleXNba10uY2xvbmUoKSk7XG4gICAgfVxuICAgIHJldHVybiBuZXdrYyBhcyB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAgKiBSZXR1cm5zIGluc3RhbmNlIG9mIEtleUNoYWluLlxuICAgICovXG4gIGNvbnN0cnVjdG9yKGhycDogc3RyaW5nLCBjaGFpbklEOiBzdHJpbmcpe1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5ocnAgPSBocnA7XG4gICAgdGhpcy5jaGFpbklEID0gY2hhaW5JRDtcbiAgfVxufVxuIl19