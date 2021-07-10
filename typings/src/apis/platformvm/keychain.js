"use strict";
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
 * Class for representing a private and public keypair on the Platform Chain.
 */
class KeyPair extends secp256k1_1.SECP256k1KeyPair {
    constructor(hrp, chainid) {
        super();
        this.chainid = '';
        this.hrp = '';
        /**
         * Returns the address's string representation.
         *
         * @returns A string representation of the address
         */
        this.getAddressString = () => {
            const addr = this.addressFromPublicKey(this.pubk);
            const type = "bech32";
            return serialization.bufferToType(addr, type, this.hrp, this.chainid);
        };
        /**
           * Returns the chainID associated with this key.
           *
           * @returns The [[KeyPair]]'s chainID
           */
        this.getChainID = () => this.chainid;
        /**
         * Sets the the chainID associated with this key.
         *
         * @param chainid String for the chainID
         */
        this.setChainID = (chainid) => {
            this.chainid = chainid;
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
        this.chainid = chainid;
        this.hrp = hrp;
        this.generateKey();
    }
    clone() {
        let newkp = new KeyPair(this.hrp, this.chainid);
        newkp.importKey(bintools.copyFrom(this.getPrivateKey()));
        return newkp;
    }
    create(...args) {
        if (args.length == 2) {
            return new KeyPair(args[0], args[1]);
        }
        return new KeyPair(this.hrp, this.chainid);
    }
}
exports.KeyPair = KeyPair;
/**
 * Class for representing a key chain in Avalanche.
 *
 * @typeparam KeyPair Class extending [[KeyPair]] which is used as the key in [[KeyChain]]
 */
class KeyChain extends secp256k1_1.SECP256k1KeyChain {
    /**
     * Returns instance of KeyChain.
     */
    constructor(hrp, chainid) {
        super();
        this.hrp = '';
        this.chainid = '';
        /**
         * Makes a new key pair, returns the address.
         *
         * @returns The new key pair
         */
        this.makeKey = () => {
            let keypair = new KeyPair(this.hrp, this.chainid);
            this.addKey(keypair);
            return keypair;
        };
        this.addKey = (newKey) => {
            newKey.setChainID(this.chainid);
            super.addKey(newKey);
        };
        /**
         * Given a private key, makes a new key pair, returns the address.
         *
         * @param privk A {@link https://github.com/feross/buffer|Buffer} or cb58 serialized string representing the private key
         *
         * @returns The new key pair
         */
        this.importKey = (privk) => {
            let keypair = new KeyPair(this.hrp, this.chainid);
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
        this.chainid = chainid;
    }
    create(...args) {
        if (args.length == 2) {
            return new KeyChain(args[0], args[1]);
        }
        return new KeyChain(this.hrp, this.chainid);
    }
    ;
    clone() {
        const newkc = new KeyChain(this.hrp, this.chainid);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Y2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL2tleWNoYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUtBLG9FQUE0QztBQUM1QyxzREFBNkU7QUFDN0UsdUNBQTJEO0FBRTNEOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUNsRCxNQUFNLGFBQWEsR0FBa0IscUJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVoRTs7R0FFRztBQUNILE1BQWEsT0FBUSxTQUFRLDRCQUFnQjtJQThEekMsWUFBWSxHQUFVLEVBQUUsT0FBYztRQUNsQyxLQUFLLEVBQUUsQ0FBQztRQTdERixZQUFPLEdBQVUsRUFBRSxDQUFDO1FBQ3BCLFFBQUcsR0FBVSxFQUFFLENBQUM7UUFFMUI7Ozs7V0FJRztRQUNMLHFCQUFnQixHQUFHLEdBQVcsRUFBRTtZQUM5QixNQUFNLElBQUksR0FBVyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3pELE1BQU0sSUFBSSxHQUFtQixRQUFRLENBQUE7WUFDckMsT0FBTyxhQUFhLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDdkUsQ0FBQyxDQUFBO1FBRUM7Ozs7YUFJSztRQUNMLGVBQVUsR0FBRyxHQUFVLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRXZDOzs7O1dBSUc7UUFDSCxlQUFVLEdBQUcsQ0FBQyxPQUFjLEVBQU8sRUFBRTtZQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUMzQixDQUFDLENBQUM7UUFHRjs7OztXQUlHO1FBQ0gsV0FBTSxHQUFHLEdBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFFL0I7Ozs7V0FJRztRQUNILFdBQU0sR0FBRyxDQUFDLEdBQVUsRUFBTyxFQUFFO1lBQzNCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2pCLENBQUMsQ0FBQztRQWlCRSxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUN2QixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNmLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBbEJELEtBQUs7UUFDRCxJQUFJLEtBQUssR0FBVyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4RCxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN6RCxPQUFPLEtBQWEsQ0FBQztJQUN6QixDQUFDO0lBRUQsTUFBTSxDQUFDLEdBQUcsSUFBVTtRQUNoQixJQUFHLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFDO1lBQ2hCLE9BQU8sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBUyxDQUFDO1NBQ2hEO1FBQ0QsT0FBTyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQVMsQ0FBQztJQUN2RCxDQUFDO0NBU0o7QUFyRUQsMEJBcUVDO0FBRUQ7Ozs7R0FJRztBQUNILE1BQWEsUUFBUyxTQUFRLDZCQUEwQjtJQWtFcEQ7O09BRUc7SUFDSCxZQUFZLEdBQVUsRUFBRSxPQUFjO1FBQ2xDLEtBQUssRUFBRSxDQUFDO1FBcEVaLFFBQUcsR0FBVSxFQUFFLENBQUM7UUFDaEIsWUFBTyxHQUFVLEVBQUUsQ0FBQztRQUVwQjs7OztXQUlHO1FBQ0gsWUFBTyxHQUFHLEdBQVcsRUFBRTtZQUNuQixJQUFJLE9BQU8sR0FBVyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3JCLE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUMsQ0FBQTtRQUVELFdBQU0sR0FBRyxDQUFDLE1BQWMsRUFBRSxFQUFFO1lBQ3hCLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2hDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUFBO1FBRUQ7Ozs7OztXQU1HO1FBQ0gsY0FBUyxHQUFHLENBQUMsS0FBcUIsRUFBVSxFQUFFO1lBQzFDLElBQUksT0FBTyxHQUFXLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFELElBQUksRUFBUyxDQUFDO1lBQ2QsSUFBRyxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUM7Z0JBQ3pCLEVBQUUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNqRDtpQkFBTTtnQkFDSCxFQUFFLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNqQztZQUNELE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdEIsSUFBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUM7Z0JBQ3BELElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDeEI7WUFDRCxPQUFPLE9BQU8sQ0FBQztRQUNuQixDQUFDLENBQUE7UUE4QkcsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBOUJELE1BQU0sQ0FBQyxHQUFHLElBQVU7UUFDaEIsSUFBRyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBQztZQUNoQixPQUFPLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQVMsQ0FBQztTQUNqRDtRQUNELE9BQU8sSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFTLENBQUM7SUFDeEQsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLO1FBQ0QsTUFBTSxLQUFLLEdBQVksSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDNUQsS0FBSSxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFDO1lBQ25CLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQ3RDO1FBQ0QsT0FBTyxLQUFhLENBQUM7SUFDekIsQ0FBQztJQUFBLENBQUM7SUFFRixLQUFLLENBQUMsRUFBTztRQUNULElBQUksS0FBSyxHQUFZLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNoQyxLQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUM7WUFDbkIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDdEM7UUFDRCxPQUFPLEtBQWEsQ0FBQztJQUN6QixDQUFDO0NBVUo7QUExRUQsNEJBMEVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVBsYXRmb3JtVk0tS2V5Q2hhaW5cbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIjtcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi8uLi91dGlscy9iaW50b29scyc7XG5pbXBvcnQgeyBTRUNQMjU2azFLZXlDaGFpbiwgU0VDUDI1NmsxS2V5UGFpciB9IGZyb20gJy4uLy4uL2NvbW1vbi9zZWNwMjU2azEnO1xuaW1wb3J0IHsgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZFR5cGUgfSBmcm9tICcuLi8uLi91dGlscydcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKCk7XG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhIHByaXZhdGUgYW5kIHB1YmxpYyBrZXlwYWlyIG9uIHRoZSBQbGF0Zm9ybSBDaGFpbi4gXG4gKi9cbmV4cG9ydCBjbGFzcyBLZXlQYWlyIGV4dGVuZHMgU0VDUDI1NmsxS2V5UGFpciB7XG5cbiAgICBwcm90ZWN0ZWQgY2hhaW5pZDpzdHJpbmcgPSAnJztcbiAgICBwcm90ZWN0ZWQgaHJwOnN0cmluZyA9ICcnO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYWRkcmVzcydzIHN0cmluZyByZXByZXNlbnRhdGlvbi5cbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgYWRkcmVzc1xuICAgICAqL1xuICBnZXRBZGRyZXNzU3RyaW5nID0gKCk6IHN0cmluZyA9PiB7XG4gICAgY29uc3QgYWRkcjogQnVmZmVyID0gdGhpcy5hZGRyZXNzRnJvbVB1YmxpY0tleSh0aGlzLnB1YmspXG4gICAgY29uc3QgdHlwZTogU2VyaWFsaXplZFR5cGUgPSBcImJlY2gzMlwiXG4gICAgcmV0dXJuIHNlcmlhbGl6YXRpb24uYnVmZmVyVG9UeXBlKGFkZHIsIHR5cGUsIHRoaXMuaHJwLCB0aGlzLmNoYWluaWQpXG4gIH1cblxuICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0aGUgY2hhaW5JRCBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXkuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMgVGhlIFtbS2V5UGFpcl1dJ3MgY2hhaW5JRFxuICAgICAgICovXG4gICAgZ2V0Q2hhaW5JRCA9ICgpOnN0cmluZyA9PiB0aGlzLmNoYWluaWQ7XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoZSB0aGUgY2hhaW5JRCBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXkuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY2hhaW5pZCBTdHJpbmcgZm9yIHRoZSBjaGFpbklEXG4gICAgICovXG4gICAgc2V0Q2hhaW5JRCA9IChjaGFpbmlkOnN0cmluZyk6dm9pZCA9PiB7XG4gICAgICAgIHRoaXMuY2hhaW5pZCA9IGNoYWluaWQ7XG4gICAgfTtcbiAgICBcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIEh1bWFuLVJlYWRhYmxlLVBhcnQgb2YgdGhlIG5ldHdvcmsgYXNzb2NpYXRlZCB3aXRoIHRoaXMga2V5LlxuICAgICAqXG4gICAgICogQHJldHVybnMgVGhlIFtbS2V5UGFpcl1dJ3MgSHVtYW4tUmVhZGFibGUtUGFydCBvZiB0aGUgbmV0d29yaydzIEJlY2gzMiBhZGRyZXNzaW5nIHNjaGVtZVxuICAgICAqL1xuICAgIGdldEhSUCA9ICgpOnN0cmluZyA9PiB0aGlzLmhycDtcbiAgXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgdGhlIEh1bWFuLVJlYWRhYmxlLVBhcnQgb2YgdGhlIG5ldHdvcmsgYXNzb2NpYXRlZCB3aXRoIHRoaXMga2V5LlxuICAgICAqXG4gICAgICogQHBhcmFtIGhycCBTdHJpbmcgZm9yIHRoZSBIdW1hbi1SZWFkYWJsZS1QYXJ0IG9mIEJlY2gzMiBhZGRyZXNzZXNcbiAgICAgKi9cbiAgICBzZXRIUlAgPSAoaHJwOnN0cmluZyk6dm9pZCA9PiB7XG4gICAgICB0aGlzLmhycCA9IGhycDtcbiAgICB9O1xuXG4gICAgY2xvbmUoKTp0aGlzIHtcbiAgICAgICAgbGV0IG5ld2twOktleVBhaXIgPSBuZXcgS2V5UGFpcih0aGlzLmhycCwgdGhpcy5jaGFpbmlkKTtcbiAgICAgICAgbmV3a3AuaW1wb3J0S2V5KGJpbnRvb2xzLmNvcHlGcm9tKHRoaXMuZ2V0UHJpdmF0ZUtleSgpKSk7XG4gICAgICAgIHJldHVybiBuZXdrcCBhcyB0aGlzO1xuICAgIH1cblxuICAgIGNyZWF0ZSguLi5hcmdzOmFueVtdKTp0aGlzIHtcbiAgICAgICAgaWYoYXJncy5sZW5ndGggPT0gMil7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEtleVBhaXIoYXJnc1swXSwgYXJnc1sxXSkgYXMgdGhpcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEtleVBhaXIodGhpcy5ocnAsIHRoaXMuY2hhaW5pZCkgYXMgdGhpcztcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihocnA6c3RyaW5nLCBjaGFpbmlkOnN0cmluZykge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmNoYWluaWQgPSBjaGFpbmlkO1xuICAgICAgICB0aGlzLmhycCA9IGhycDtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZUtleSgpO1xuICAgIH1cbiAgICBcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEga2V5IGNoYWluIGluIEF2YWxhbmNoZS4gXG4gKiBcbiAqIEB0eXBlcGFyYW0gS2V5UGFpciBDbGFzcyBleHRlbmRpbmcgW1tLZXlQYWlyXV0gd2hpY2ggaXMgdXNlZCBhcyB0aGUga2V5IGluIFtbS2V5Q2hhaW5dXVxuICovXG5leHBvcnQgY2xhc3MgS2V5Q2hhaW4gZXh0ZW5kcyBTRUNQMjU2azFLZXlDaGFpbjxLZXlQYWlyPiB7XG5cbiAgICBocnA6c3RyaW5nID0gJyc7XG4gICAgY2hhaW5pZDpzdHJpbmcgPSAnJztcblxuICAgIC8qKlxuICAgICAqIE1ha2VzIGEgbmV3IGtleSBwYWlyLCByZXR1cm5zIHRoZSBhZGRyZXNzLlxuICAgICAqIFxuICAgICAqIEByZXR1cm5zIFRoZSBuZXcga2V5IHBhaXJcbiAgICAgKi9cbiAgICBtYWtlS2V5ID0gKCk6S2V5UGFpciA9PiB7XG4gICAgICAgIGxldCBrZXlwYWlyOktleVBhaXIgPSBuZXcgS2V5UGFpcih0aGlzLmhycCwgdGhpcy5jaGFpbmlkKTtcbiAgICAgICAgdGhpcy5hZGRLZXkoa2V5cGFpcik7XG4gICAgICAgIHJldHVybiBrZXlwYWlyO1xuICAgIH1cblxuICAgIGFkZEtleSA9IChuZXdLZXk6S2V5UGFpcikgPT4ge1xuICAgICAgICBuZXdLZXkuc2V0Q2hhaW5JRCh0aGlzLmNoYWluaWQpO1xuICAgICAgICBzdXBlci5hZGRLZXkobmV3S2V5KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIHByaXZhdGUga2V5LCBtYWtlcyBhIG5ldyBrZXkgcGFpciwgcmV0dXJucyB0aGUgYWRkcmVzcy5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gcHJpdmsgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBjYjU4IHNlcmlhbGl6ZWQgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgcHJpdmF0ZSBrZXkgXG4gICAgICogXG4gICAgICogQHJldHVybnMgVGhlIG5ldyBrZXkgcGFpclxuICAgICAqL1xuICAgIGltcG9ydEtleSA9IChwcml2azpCdWZmZXIgfCBzdHJpbmcpOktleVBhaXIgPT4ge1xuICAgICAgICBsZXQga2V5cGFpcjpLZXlQYWlyID0gbmV3IEtleVBhaXIodGhpcy5ocnAsIHRoaXMuY2hhaW5pZCk7XG4gICAgICAgIGxldCBwazpCdWZmZXI7XG4gICAgICAgIGlmKHR5cGVvZiBwcml2ayA9PT0gJ3N0cmluZycpe1xuICAgICAgICAgICAgcGsgPSBiaW50b29scy5jYjU4RGVjb2RlKHByaXZrLnNwbGl0KCctJylbMV0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGsgPSBiaW50b29scy5jb3B5RnJvbShwcml2ayk7XG4gICAgICAgIH1cbiAgICAgICAga2V5cGFpci5pbXBvcnRLZXkocGspO1xuICAgICAgICBpZighKGtleXBhaXIuZ2V0QWRkcmVzcygpLnRvU3RyaW5nKFwiaGV4XCIpIGluIHRoaXMua2V5cykpe1xuICAgICAgICAgICAgdGhpcy5hZGRLZXkoa2V5cGFpcik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleXBhaXI7XG4gICAgfVxuXG4gICAgY3JlYXRlKC4uLmFyZ3M6YW55W10pOnRoaXMge1xuICAgICAgICBpZihhcmdzLmxlbmd0aCA9PSAyKXtcbiAgICAgICAgICAgIHJldHVybiBuZXcgS2V5Q2hhaW4oYXJnc1swXSwgYXJnc1sxXSkgYXMgdGhpcztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEtleUNoYWluKHRoaXMuaHJwLCB0aGlzLmNoYWluaWQpIGFzIHRoaXM7XG4gICAgfTtcblxuICAgIGNsb25lKCk6dGhpcyB7XG4gICAgICAgIGNvbnN0IG5ld2tjOktleUNoYWluID0gbmV3IEtleUNoYWluKHRoaXMuaHJwLCB0aGlzLmNoYWluaWQpO1xuICAgICAgICBmb3IobGV0IGsgaW4gdGhpcy5rZXlzKXtcbiAgICAgICAgICAgIG5ld2tjLmFkZEtleSh0aGlzLmtleXNba10uY2xvbmUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld2tjIGFzIHRoaXM7XG4gICAgfTtcblxuICAgIHVuaW9uKGtjOnRoaXMpOnRoaXMge1xuICAgICAgICBsZXQgbmV3a2M6S2V5Q2hhaW4gPSBrYy5jbG9uZSgpO1xuICAgICAgICBmb3IobGV0IGsgaW4gdGhpcy5rZXlzKXtcbiAgICAgICAgICAgIG5ld2tjLmFkZEtleSh0aGlzLmtleXNba10uY2xvbmUoKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ld2tjIGFzIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBpbnN0YW5jZSBvZiBLZXlDaGFpbi5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihocnA6c3RyaW5nLCBjaGFpbmlkOnN0cmluZyl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuaHJwID0gaHJwO1xuICAgICAgICB0aGlzLmNoYWluaWQgPSBjaGFpbmlkO1xuICAgIH1cbn0iXX0=