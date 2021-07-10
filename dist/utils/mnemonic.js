"use strict";
/**
 * @packageDocumentation
 * @module Utils-Mnemonic
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_1 = require("buffer/");
const errors_1 = require("./errors");
const bip39 = require('bip39');
const randomBytes = require("randombytes");
/**
 * BIP39 Mnemonic code for generating deterministic keys.
 *
 */
class Mnemonic {
    constructor() {
        this.wordlists = bip39.wordlists;
    }
    /**
     * Retrieves the Mnemonic singleton.
     */
    static getInstance() {
        if (!Mnemonic.instance) {
            Mnemonic.instance = new Mnemonic();
        }
        return Mnemonic.instance;
    }
    /**
     * Return wordlists
     *
     * @param language a string specifying the language
     *
     * @returns A [[Wordlist]] object or array of strings
     */
    getWordlists(language) {
        if (language !== undefined) {
            return this.wordlists[language];
        }
        else {
            return this.wordlists;
        }
    }
    /**
     * Synchronously takes mnemonic and password and returns {@link https://github.com/feross/buffer|Buffer}
     *
     * @param mnemonic the mnemonic as a string
     * @param password the password as a string
     *
     * @returns A {@link https://github.com/feross/buffer|Buffer}
     */
    mnemonicToSeedSync(mnemonic, password = "") {
        const seed = bip39.mnemonicToSeedSync(mnemonic, password);
        return buffer_1.Buffer.from(seed);
    }
    /**
     * Asynchronously takes mnemonic and password and returns Promise<{@link https://github.com/feross/buffer|Buffer}>
     *
     * @param mnemonic the mnemonic as a string
     * @param password the password as a string
     *
     * @returns A {@link https://github.com/feross/buffer|Buffer}
     */
    mnemonicToSeed(mnemonic, password = "") {
        return __awaiter(this, void 0, void 0, function* () {
            const seed = yield bip39.mnemonicToSeed(mnemonic, password);
            return buffer_1.Buffer.from(seed);
        });
    }
    /**
     * Takes mnemonic and wordlist and returns buffer
     *
     * @param mnemonic the mnemonic as a string
     * @param wordlist Optional the wordlist as an array of strings
     *
     * @returns A string
     */
    mnemonicToEntropy(mnemonic, wordlist) {
        return bip39.mnemonicToEntropy(mnemonic, wordlist);
    }
    /**
     * Takes mnemonic and wordlist and returns buffer
     *
     * @param entropy the entropy as a {@link https://github.com/feross/buffer|Buffer} or as a string
     * @param wordlist Optional, the wordlist as an array of strings
     *
     * @returns A string
     */
    entropyToMnemonic(entropy, wordlist) {
        return bip39.entropyToMnemonic(entropy, wordlist);
    }
    /**
     * Validates a mnemonic
     11*
     * @param mnemonic the mnemonic as a string
     * @param wordlist Optional the wordlist as an array of strings
     *
     * @returns A string
     */
    validateMnemonic(mnemonic, wordlist) {
        return bip39.validateMnemonic(mnemonic, wordlist);
    }
    /**
     * Sets the default word list
     *
     * @param language the language as a string
     *
     */
    setDefaultWordlist(language) {
        bip39.setDefaultWordlist(language);
    }
    /**
     * Returns the language of the default word list
     *
     * @returns A string
     */
    getDefaultWordlist() {
        return bip39.getDefaultWordlist();
    }
    /**
     * Generate a random mnemonic (uses crypto.randomBytes under the hood), defaults to 256-bits of entropy
     *
     * @param strength Optional the strength as a number
     * @param rng Optional the random number generator. Defaults to crypto.randomBytes
     * @param wordlist Optional
     *
     */
    generateMnemonic(strength, rng, wordlist) {
        strength = strength || 256;
        if (strength % 32 !== 0) {
            throw new errors_1.InvalidEntropy('Error - Invalid entropy');
        }
        rng = rng || randomBytes;
        return bip39.generateMnemonic(strength, rng, wordlist);
    }
}
exports.default = Mnemonic;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW5lbW9uaWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdXRpbHMvbW5lbW9uaWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7Ozs7Ozs7QUFFSCxvQ0FBZ0M7QUFFaEMscUNBQXlDO0FBQ3pDLE1BQU0sS0FBSyxHQUFRLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNuQyxNQUFNLFdBQVcsR0FBUSxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUE7QUFFL0M7OztHQUdHO0FBQ0gsTUFBcUIsUUFBUTtJQUUzQjtRQUNVLGNBQVMsR0FBYSxLQUFLLENBQUMsU0FBUyxDQUFBO0lBRHZCLENBQUM7SUFHekI7O09BRUc7SUFDSCxNQUFNLENBQUMsV0FBVztRQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRTtZQUN0QixRQUFRLENBQUMsUUFBUSxHQUFHLElBQUksUUFBUSxFQUFFLENBQUE7U0FDbkM7UUFDRCxPQUFPLFFBQVEsQ0FBQyxRQUFRLENBQUE7SUFDMUIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILFlBQVksQ0FBQyxRQUFpQjtRQUM1QixJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDMUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1NBQ2hDO2FBQU07WUFDTCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUE7U0FDdEI7SUFDSCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILGtCQUFrQixDQUFDLFFBQWdCLEVBQUUsV0FBbUIsRUFBRTtRQUN4RCxNQUFNLElBQUksR0FBVyxLQUFLLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ2pFLE9BQU8sZUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUMxQixDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNHLGNBQWMsQ0FBQyxRQUFnQixFQUFFLFdBQW1CLEVBQUU7O1lBQzFELE1BQU0sSUFBSSxHQUFXLE1BQU0sS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7WUFDbkUsT0FBTyxlQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQzFCLENBQUM7S0FBQTtJQUVEOzs7Ozs7O09BT0c7SUFDSCxpQkFBaUIsQ0FBQyxRQUFnQixFQUFFLFFBQW1CO1FBQ3JELE9BQU8sS0FBSyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNwRCxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILGlCQUFpQixDQUFDLE9BQXdCLEVBQUUsUUFBbUI7UUFDN0QsT0FBTyxLQUFLLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ25ELENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxRQUFtQjtRQUNwRCxPQUFPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDbkQsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsa0JBQWtCLENBQUMsUUFBZ0I7UUFDakMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3BDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsa0JBQWtCO1FBQ2hCLE9BQU8sS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUE7SUFDbkMsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSCxnQkFBZ0IsQ0FBQyxRQUFpQixFQUNoQyxHQUE4QixFQUM5QixRQUFtQjtRQUVuQixRQUFRLEdBQUcsUUFBUSxJQUFJLEdBQUcsQ0FBQTtRQUMxQixJQUFJLFFBQVEsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQ3ZCLE1BQU0sSUFBSSx1QkFBYyxDQUFDLHlCQUF5QixDQUFDLENBQUE7U0FDcEQ7UUFDRCxHQUFHLEdBQUcsR0FBRyxJQUFJLFdBQVcsQ0FBQTtRQUN4QixPQUFPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFBO0lBQ3hELENBQUM7Q0FDRjtBQWxJRCwyQkFrSUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBVdGlscy1NbmVtb25pY1xuICovXG5cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gJ2J1ZmZlci8nXG5pbXBvcnQgeyBXb3JkbGlzdCB9IGZyb20gJ2V0aGVycydcbmltcG9ydCB7IEludmFsaWRFbnRyb3B5IH0gZnJvbSAnLi9lcnJvcnMnXG5jb25zdCBiaXAzOTogYW55ID0gcmVxdWlyZSgnYmlwMzknKVxuY29uc3QgcmFuZG9tQnl0ZXM6IGFueSA9IHJlcXVpcmUoXCJyYW5kb21ieXRlc1wiKVxuXG4vKipcbiAqIEJJUDM5IE1uZW1vbmljIGNvZGUgZm9yIGdlbmVyYXRpbmcgZGV0ZXJtaW5pc3RpYyBrZXlzLlxuICpcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW5lbW9uaWMge1xuICBwcml2YXRlIHN0YXRpYyBpbnN0YW5jZTogTW5lbW9uaWNcbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHsgfVxuICBwcm90ZWN0ZWQgd29yZGxpc3RzOiBzdHJpbmdbXSA9IGJpcDM5LndvcmRsaXN0c1xuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIE1uZW1vbmljIHNpbmdsZXRvbi5cbiAgICovXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBNbmVtb25pYyB7XG4gICAgaWYgKCFNbmVtb25pYy5pbnN0YW5jZSkge1xuICAgICAgTW5lbW9uaWMuaW5zdGFuY2UgPSBuZXcgTW5lbW9uaWMoKVxuICAgIH1cbiAgICByZXR1cm4gTW5lbW9uaWMuaW5zdGFuY2VcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gd29yZGxpc3RzXG4gICAqXG4gICAqIEBwYXJhbSBsYW5ndWFnZSBhIHN0cmluZyBzcGVjaWZ5aW5nIHRoZSBsYW5ndWFnZVxuICAgKlxuICAgKiBAcmV0dXJucyBBIFtbV29yZGxpc3RdXSBvYmplY3Qgb3IgYXJyYXkgb2Ygc3RyaW5nc1xuICAgKi9cbiAgZ2V0V29yZGxpc3RzKGxhbmd1YWdlPzogc3RyaW5nKTogc3RyaW5nW10gfCBXb3JkbGlzdCB7XG4gICAgaWYgKGxhbmd1YWdlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLndvcmRsaXN0c1tsYW5ndWFnZV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMud29yZGxpc3RzXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFN5bmNocm9ub3VzbHkgdGFrZXMgbW5lbW9uaWMgYW5kIHBhc3N3b3JkIGFuZCByZXR1cm5zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqXG4gICAqIEBwYXJhbSBtbmVtb25pYyB0aGUgbW5lbW9uaWMgYXMgYSBzdHJpbmdcbiAgICogQHBhcmFtIHBhc3N3b3JkIHRoZSBwYXNzd29yZCBhcyBhIHN0cmluZ1xuICAgKlxuICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqL1xuICBtbmVtb25pY1RvU2VlZFN5bmMobW5lbW9uaWM6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyA9IFwiXCIpOiBCdWZmZXIge1xuICAgIGNvbnN0IHNlZWQ6IEJ1ZmZlciA9IGJpcDM5Lm1uZW1vbmljVG9TZWVkU3luYyhtbmVtb25pYywgcGFzc3dvcmQpXG4gICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHNlZWQpXG4gIH1cblxuICAvKipcbiAgICogQXN5bmNocm9ub3VzbHkgdGFrZXMgbW5lbW9uaWMgYW5kIHBhc3N3b3JkIGFuZCByZXR1cm5zIFByb21pc2U8e0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0+XG4gICAqXG4gICAqIEBwYXJhbSBtbmVtb25pYyB0aGUgbW5lbW9uaWMgYXMgYSBzdHJpbmdcbiAgICogQHBhcmFtIHBhc3N3b3JkIHRoZSBwYXNzd29yZCBhcyBhIHN0cmluZ1xuICAgKlxuICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqL1xuICBhc3luYyBtbmVtb25pY1RvU2VlZChtbmVtb25pYzogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nID0gXCJcIik6IFByb21pc2U8QnVmZmVyPiB7XG4gICAgY29uc3Qgc2VlZDogQnVmZmVyID0gYXdhaXQgYmlwMzkubW5lbW9uaWNUb1NlZWQobW5lbW9uaWMsIHBhc3N3b3JkKVxuICAgIHJldHVybiBCdWZmZXIuZnJvbShzZWVkKVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIG1uZW1vbmljIGFuZCB3b3JkbGlzdCBhbmQgcmV0dXJucyBidWZmZXJcbiAgICpcbiAgICogQHBhcmFtIG1uZW1vbmljIHRoZSBtbmVtb25pYyBhcyBhIHN0cmluZ1xuICAgKiBAcGFyYW0gd29yZGxpc3QgT3B0aW9uYWwgdGhlIHdvcmRsaXN0IGFzIGFuIGFycmF5IG9mIHN0cmluZ3NcbiAgICpcbiAgICogQHJldHVybnMgQSBzdHJpbmdcbiAgICovXG4gIG1uZW1vbmljVG9FbnRyb3B5KG1uZW1vbmljOiBzdHJpbmcsIHdvcmRsaXN0Pzogc3RyaW5nW10pOiBzdHJpbmcge1xuICAgIHJldHVybiBiaXAzOS5tbmVtb25pY1RvRW50cm9weShtbmVtb25pYywgd29yZGxpc3QpXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgbW5lbW9uaWMgYW5kIHdvcmRsaXN0IGFuZCByZXR1cm5zIGJ1ZmZlclxuICAgKlxuICAgKiBAcGFyYW0gZW50cm9weSB0aGUgZW50cm9weSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9yIGFzIGEgc3RyaW5nXG4gICAqIEBwYXJhbSB3b3JkbGlzdCBPcHRpb25hbCwgdGhlIHdvcmRsaXN0IGFzIGFuIGFycmF5IG9mIHN0cmluZ3NcbiAgICpcbiAgICogQHJldHVybnMgQSBzdHJpbmdcbiAgICovXG4gIGVudHJvcHlUb01uZW1vbmljKGVudHJvcHk6IEJ1ZmZlciB8IHN0cmluZywgd29yZGxpc3Q/OiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGJpcDM5LmVudHJvcHlUb01uZW1vbmljKGVudHJvcHksIHdvcmRsaXN0KVxuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlcyBhIG1uZW1vbmljXG4gICAxMSpcbiAgICogQHBhcmFtIG1uZW1vbmljIHRoZSBtbmVtb25pYyBhcyBhIHN0cmluZ1xuICAgKiBAcGFyYW0gd29yZGxpc3QgT3B0aW9uYWwgdGhlIHdvcmRsaXN0IGFzIGFuIGFycmF5IG9mIHN0cmluZ3NcbiAgICpcbiAgICogQHJldHVybnMgQSBzdHJpbmdcbiAgICovXG4gIHZhbGlkYXRlTW5lbW9uaWMobW5lbW9uaWM6IHN0cmluZywgd29yZGxpc3Q/OiBzdHJpbmdbXSk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGJpcDM5LnZhbGlkYXRlTW5lbW9uaWMobW5lbW9uaWMsIHdvcmRsaXN0KVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGRlZmF1bHQgd29yZCBsaXN0XG4gICAqXG4gICAqIEBwYXJhbSBsYW5ndWFnZSB0aGUgbGFuZ3VhZ2UgYXMgYSBzdHJpbmdcbiAgICpcbiAgICovXG4gIHNldERlZmF1bHRXb3JkbGlzdChsYW5ndWFnZTogc3RyaW5nKTogdm9pZCB7XG4gICAgYmlwMzkuc2V0RGVmYXVsdFdvcmRsaXN0KGxhbmd1YWdlKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGxhbmd1YWdlIG9mIHRoZSBkZWZhdWx0IHdvcmQgbGlzdFxuICAgKiBcbiAgICogQHJldHVybnMgQSBzdHJpbmdcbiAgICovXG4gIGdldERlZmF1bHRXb3JkbGlzdCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBiaXAzOS5nZXREZWZhdWx0V29yZGxpc3QoKVxuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRlIGEgcmFuZG9tIG1uZW1vbmljICh1c2VzIGNyeXB0by5yYW5kb21CeXRlcyB1bmRlciB0aGUgaG9vZCksIGRlZmF1bHRzIHRvIDI1Ni1iaXRzIG9mIGVudHJvcHlcbiAgICogXG4gICAqIEBwYXJhbSBzdHJlbmd0aCBPcHRpb25hbCB0aGUgc3RyZW5ndGggYXMgYSBudW1iZXJcbiAgICogQHBhcmFtIHJuZyBPcHRpb25hbCB0aGUgcmFuZG9tIG51bWJlciBnZW5lcmF0b3IuIERlZmF1bHRzIHRvIGNyeXB0by5yYW5kb21CeXRlc1xuICAgKiBAcGFyYW0gd29yZGxpc3QgT3B0aW9uYWxcbiAgICogXG4gICAqL1xuICBnZW5lcmF0ZU1uZW1vbmljKHN0cmVuZ3RoPzogbnVtYmVyLFxuICAgIHJuZz86IChzaXplOiBudW1iZXIpID0+IEJ1ZmZlcixcbiAgICB3b3JkbGlzdD86IHN0cmluZ1tdLFxuICApOiBzdHJpbmcge1xuICAgIHN0cmVuZ3RoID0gc3RyZW5ndGggfHwgMjU2XG4gICAgaWYgKHN0cmVuZ3RoICUgMzIgIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBJbnZhbGlkRW50cm9weSgnRXJyb3IgLSBJbnZhbGlkIGVudHJvcHknKVxuICAgIH1cbiAgICBybmcgPSBybmcgfHwgcmFuZG9tQnl0ZXNcbiAgICByZXR1cm4gYmlwMzkuZ2VuZXJhdGVNbmVtb25pYyhzdHJlbmd0aCwgcm5nLCB3b3JkbGlzdClcbiAgfVxufSJdfQ==