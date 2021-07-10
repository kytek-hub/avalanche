"use strict";
/**
 * @packageDocumentation
 * @module Common-KeyChain
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardKeyChain = exports.StandardKeyPair = void 0;
const buffer_1 = require("buffer/");
/**
 * Class for representing a private and public keypair in Avalanche.
 * All APIs that need key pairs should extend on this class.
 */
class StandardKeyPair {
    constructor() {
        /**
           * Returns a reference to the private key.
           *
           * @returns A {@link https://github.com/feross/buffer|Buffer} containing the private key
           */
        this.getPrivateKey = () => this.privk;
        /**
           * Returns a reference to the public key.
           *
           * @returns A {@link https://github.com/feross/buffer|Buffer} containing the public key
           */
        this.getPublicKey = () => this.pubk;
    }
}
exports.StandardKeyPair = StandardKeyPair;
/**
 * Class for representing a key chain in Avalanche.
 * All endpoints that need key chains should extend on this class.
 *
 * @typeparam KPClass extending [[StandardKeyPair]] which is used as the key in [[StandardKeyChain]]
 */
class StandardKeyChain {
    constructor() {
        this.keys = {};
        /**
           * Gets an array of addresses stored in the [[StandardKeyChain]].
           *
           * @returns An array of {@link https://github.com/feross/buffer|Buffer}  representations
           * of the addresses
           */
        this.getAddresses = () => Object.values(this.keys).map((kp) => kp.getAddress());
        /**
           * Gets an array of addresses stored in the [[StandardKeyChain]].
           *
           * @returns An array of string representations of the addresses
           */
        this.getAddressStrings = () => Object.values(this.keys)
            .map((kp) => kp.getAddressString());
        /**
           * Removes the key pair from the list of they keys managed in the [[StandardKeyChain]].
           *
           * @param key A {@link https://github.com/feross/buffer|Buffer} for the address or
           * KPClass to remove
           *
           * @returns The boolean true if a key was removed.
           */
        this.removeKey = (key) => {
            let kaddr;
            if (key instanceof buffer_1.Buffer) {
                kaddr = key.toString('hex');
            }
            else {
                kaddr = key.getAddress().toString('hex');
            }
            if (kaddr in this.keys) {
                delete this.keys[kaddr];
                return true;
            }
            return false;
        };
        /**
           * Checks if there is a key associated with the provided address.
           *
           * @param address The address to check for existence in the keys database
           *
           * @returns True on success, false if not found
           */
        this.hasKey = (address) => (address.toString('hex') in this.keys);
        /**
           * Returns the [[StandardKeyPair]] listed under the provided address
           *
           * @param address The {@link https://github.com/feross/buffer|Buffer} of the address to
           * retrieve from the keys database
           *
           * @returns A reference to the [[StandardKeyPair]] in the keys database
           */
        this.getKey = (address) => this.keys[address.toString('hex')];
    }
    /**
       * Adds the key pair to the list of the keys managed in the [[StandardKeyChain]].
       *
       * @param newKey A key pair of the appropriate class to be added to the [[StandardKeyChain]]
       */
    addKey(newKey) {
        this.keys[newKey.getAddress().toString('hex')] = newKey;
    }
    ;
}
exports.StandardKeyChain = StandardKeyChain;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Y2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2tleWNoYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7OztBQUVILG9DQUFpQztBQUVqQzs7O0dBR0c7QUFDSCxNQUFzQixlQUFlO0lBQXJDO1FBb0RJOzs7O2FBSUs7UUFDTCxrQkFBYSxHQUFHLEdBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7UUFFeEM7Ozs7YUFJSztRQUNMLGlCQUFZLEdBQUcsR0FBVSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztJQWtDeEMsQ0FBQztDQUFBO0FBbEdILDBDQWtHRztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBc0IsZ0JBQWdCO0lBQXRDO1FBQ1ksU0FBSSxHQUFnQyxFQUFFLENBQUM7UUFrQmpEOzs7OzthQUtLO1FBQ0wsaUJBQVksR0FBRyxHQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO1FBRXJGOzs7O2FBSUs7UUFDTCxzQkFBaUIsR0FBRyxHQUFhLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7YUFDekQsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBV3RDOzs7Ozs7O2FBT0s7UUFDTCxjQUFTLEdBQUcsQ0FBQyxHQUFvQixFQUFFLEVBQUU7WUFDbkMsSUFBSSxLQUFZLENBQUM7WUFDakIsSUFBSSxHQUFHLFlBQVksZUFBTSxFQUFFO2dCQUN6QixLQUFLLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUM3QjtpQkFBTTtnQkFDTCxLQUFLLEdBQUcsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMxQztZQUNELElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ3RCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDeEIsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQyxDQUFDO1FBRUY7Ozs7OzthQU1LO1FBQ0wsV0FBTSxHQUFHLENBQUMsT0FBYyxFQUFVLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTVFOzs7Ozs7O2FBT0s7UUFDTCxXQUFNLEdBQUcsQ0FBQyxPQUFjLEVBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBUTNFLENBQUM7SUF4REM7Ozs7U0FJSztJQUNMLE1BQU0sQ0FBQyxNQUFjO1FBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztJQUMxRCxDQUFDO0lBQUEsQ0FBQztDQWlESDtBQTNGRCw0Q0EyRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBDb21tb24tS2V5Q2hhaW5cbiAqL1xuXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiO1xuXG4vKipcbiAqIENsYXNzIGZvciByZXByZXNlbnRpbmcgYSBwcml2YXRlIGFuZCBwdWJsaWMga2V5cGFpciBpbiBBdmFsYW5jaGUuIFxuICogQWxsIEFQSXMgdGhhdCBuZWVkIGtleSBwYWlycyBzaG91bGQgZXh0ZW5kIG9uIHRoaXMgY2xhc3MuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdGFuZGFyZEtleVBhaXIge1xuICAgIHByb3RlY3RlZCBwdWJrOkJ1ZmZlcjtcbiAgICBwcm90ZWN0ZWQgcHJpdms6QnVmZmVyO1xuICBcbiAgICAvKipcbiAgICAgICAqIEdlbmVyYXRlcyBhIG5ldyBrZXlwYWlyLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSBlbnRyb3B5IE9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IG1heSBiZSBuZWNlc3NhcnkgdG8gcHJvZHVjZSBzZWN1cmUga2V5c1xuICAgICAgICovXG4gICAgZ2VuZXJhdGVLZXk6KGVudHJvcHk/OkJ1ZmZlcikgPT4gdm9pZDtcbiAgXG4gICAgLyoqXG4gICAgICAgKiBJbXBvcnRzIGEgcHJpdmF0ZSBrZXkgYW5kIGdlbmVyYXRlcyB0aGUgYXBwcm9wcmlhdGUgcHVibGljIGtleS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gcHJpdmsgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRpbmcgdGhlIHByaXZhdGUga2V5XG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMgdHJ1ZSBvbiBzdWNjZXNzLCBmYWxzZSBvbiBmYWlsdXJlXG4gICAgICAgKi9cbiAgICBpbXBvcnRLZXk6KHByaXZrOkJ1ZmZlcikgPT4gYm9vbGVhbjtcbiAgXG4gICAgLyoqXG4gICAgICAgKiBUYWtlcyBhIG1lc3NhZ2UsIHNpZ25zIGl0LCBhbmQgcmV0dXJucyB0aGUgc2lnbmF0dXJlLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSBtc2cgVGhlIG1lc3NhZ2UgdG8gc2lnblxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyB0aGUgc2lnbmF0dXJlXG4gICAgICAgKi9cbiAgICBzaWduOihtc2c6QnVmZmVyKSA9PiBCdWZmZXI7XG4gIFxuICAgIC8qKlxuICAgICAgICogUmVjb3ZlcnMgdGhlIHB1YmxpYyBrZXkgb2YgYSBtZXNzYWdlIHNpZ25lciBmcm9tIGEgbWVzc2FnZSBhbmQgaXRzIGFzc29jaWF0ZWQgc2lnbmF0dXJlLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSBtc2cgVGhlIG1lc3NhZ2UgdGhhdCdzIHNpZ25lZFxuICAgICAgICogQHBhcmFtIHNpZyBUaGUgc2lnbmF0dXJlIHRoYXQncyBzaWduZWQgb24gdGhlIG1lc3NhZ2VcbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgdGhlIHB1YmxpY1xuICAgICAgICoga2V5IG9mIHRoZSBzaWduZXJcbiAgICAgICAqL1xuICAgIHJlY292ZXI6KG1zZzpCdWZmZXIsIHNpZzpCdWZmZXIpID0+IEJ1ZmZlcjtcbiAgXG4gICAgLyoqXG4gICAgICAgKiBWZXJpZmllcyB0aGF0IHRoZSBwcml2YXRlIGtleSBhc3NvY2lhdGVkIHdpdGggdGhlIHByb3ZpZGVkIHB1YmxpYyBrZXkgcHJvZHVjZXMgdGhlXG4gICAgICAgKiBzaWduYXR1cmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBnaXZlbiBtZXNzYWdlLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSBtc2cgVGhlIG1lc3NhZ2UgYXNzb2NpYXRlZCB3aXRoIHRoZSBzaWduYXR1cmVcbiAgICAgICAqIEBwYXJhbSBzaWcgVGhlIHNpZ25hdHVyZSBvZiB0aGUgc2lnbmVkIG1lc3NhZ2VcbiAgICAgICAqIEBwYXJhbSBwdWJrIFRoZSBwdWJsaWMga2V5IGFzc29jaWF0ZWQgd2l0aCB0aGUgbWVzc2FnZSBzaWduYXR1cmVcbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyBUcnVlIG9uIHN1Y2Nlc3MsIGZhbHNlIG9uIGZhaWx1cmVcbiAgICAgICAqL1xuICAgIHZlcmlmeToobXNnOkJ1ZmZlciwgc2lnOkJ1ZmZlciwgcHViazpCdWZmZXIpID0+IGJvb2xlYW47XG4gIFxuICAgIC8qKlxuICAgICAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgcHJpdmF0ZSBrZXkuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIHRoZSBwcml2YXRlIGtleVxuICAgICAgICovXG4gICAgZ2V0UHJpdmF0ZUtleSA9ICgpOkJ1ZmZlciA9PiB0aGlzLnByaXZrO1xuICBcbiAgICAvKipcbiAgICAgICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIHB1YmxpYyBrZXkuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIHRoZSBwdWJsaWMga2V5XG4gICAgICAgKi9cbiAgICBnZXRQdWJsaWNLZXkgPSAoKTpCdWZmZXIgPT4gdGhpcy5wdWJrO1xuICBcbiAgICAvKipcbiAgICAgICAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHByaXZhdGUga2V5LlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwdWJsaWMga2V5XG4gICAgICAgKi9cbiAgICBnZXRQcml2YXRlS2V5U3RyaW5nOigpID0+IHN0cmluZztcbiAgXG4gICAgLyoqXG4gICAgICAgKiBSZXR1cm5zIHRoZSBwdWJsaWMga2V5LlxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIEEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBwdWJsaWMga2V5XG4gICAgICAgKi9cbiAgICBnZXRQdWJsaWNLZXlTdHJpbmc6KCkgPT4gc3RyaW5nO1xuICBcbiAgICAvKipcbiAgICAgICAqIFJldHVybnMgdGhlIGFkZHJlc3MuXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSAgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFkZHJlc3NcbiAgICAgICAqL1xuICAgIGdldEFkZHJlc3M6KCkgPT4gQnVmZmVyO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYWRkcmVzcydzIHN0cmluZyByZXByZXNlbnRhdGlvbi5cbiAgICAgKiBcbiAgICAgKiBAcmV0dXJucyBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgYWRkcmVzc1xuICAgICAqL1xuICAgIGdldEFkZHJlc3NTdHJpbmc6KCkgPT4gc3RyaW5nXG5cbiAgICBhYnN0cmFjdCBjcmVhdGUoLi4uYXJnczphbnlbXSk6dGhpcztcblxuICAgIGFic3RyYWN0IGNsb25lKCk6dGhpcztcbiAgXG4gIH1cbiAgXG4gIC8qKlxuICAgKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEga2V5IGNoYWluIGluIEF2YWxhbmNoZS5cbiAgICogQWxsIGVuZHBvaW50cyB0aGF0IG5lZWQga2V5IGNoYWlucyBzaG91bGQgZXh0ZW5kIG9uIHRoaXMgY2xhc3MuXG4gICAqXG4gICAqIEB0eXBlcGFyYW0gS1BDbGFzcyBleHRlbmRpbmcgW1tTdGFuZGFyZEtleVBhaXJdXSB3aGljaCBpcyB1c2VkIGFzIHRoZSBrZXkgaW4gW1tTdGFuZGFyZEtleUNoYWluXV1cbiAgICovXG4gIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdGFuZGFyZEtleUNoYWluPEtQQ2xhc3MgZXh0ZW5kcyBTdGFuZGFyZEtleVBhaXI+IHtcbiAgICBwcm90ZWN0ZWQga2V5czp7W2FkZHJlc3M6IHN0cmluZ106IEtQQ2xhc3N9ID0ge307XG4gIFxuICAgIC8qKlxuICAgICAgICogTWFrZXMgYSBuZXcgW1tTdGFuZGFyZEtleVBhaXJdXSwgcmV0dXJucyB0aGUgYWRkcmVzcy5cbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyBBZGRyZXNzIG9mIHRoZSBuZXcgW1tTdGFuZGFyZEtleVBhaXJdXVxuICAgICAgICovXG4gICAgbWFrZUtleTooKSA9PiBLUENsYXNzO1xuICBcbiAgICAvKipcbiAgICAgICAqIEdpdmVuIGEgcHJpdmF0ZSBrZXksIG1ha2VzIGEgbmV3IFtbU3RhbmRhcmRLZXlQYWlyXV0sIHJldHVybnMgdGhlIGFkZHJlc3MuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHByaXZrIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBwcml2YXRlIGtleVxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIEEgbmV3IFtbU3RhbmRhcmRLZXlQYWlyXV1cbiAgICAgICAqL1xuICAgIGltcG9ydEtleToocHJpdms6QnVmZmVyKSA9PiBLUENsYXNzO1xuICBcbiAgICAvKipcbiAgICAgICAqIEdldHMgYW4gYXJyYXkgb2YgYWRkcmVzc2VzIHN0b3JlZCBpbiB0aGUgW1tTdGFuZGFyZEtleUNoYWluXV0uXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMgQW4gYXJyYXkgb2Yge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gIHJlcHJlc2VudGF0aW9uc1xuICAgICAgICogb2YgdGhlIGFkZHJlc3Nlc1xuICAgICAgICovXG4gICAgZ2V0QWRkcmVzc2VzID0gKCk6IEJ1ZmZlcltdID0+IE9iamVjdC52YWx1ZXModGhpcy5rZXlzKS5tYXAoKGtwKSA9PiBrcC5nZXRBZGRyZXNzKCkpO1xuICBcbiAgICAvKipcbiAgICAgICAqIEdldHMgYW4gYXJyYXkgb2YgYWRkcmVzc2VzIHN0b3JlZCBpbiB0aGUgW1tTdGFuZGFyZEtleUNoYWluXV0uXG4gICAgICAgKlxuICAgICAgICogQHJldHVybnMgQW4gYXJyYXkgb2Ygc3RyaW5nIHJlcHJlc2VudGF0aW9ucyBvZiB0aGUgYWRkcmVzc2VzXG4gICAgICAgKi9cbiAgICBnZXRBZGRyZXNzU3RyaW5ncyA9ICgpOiBzdHJpbmdbXSA9PiBPYmplY3QudmFsdWVzKHRoaXMua2V5cylcbiAgICAgIC5tYXAoKGtwKSA9PiBrcC5nZXRBZGRyZXNzU3RyaW5nKCkpO1xuICBcbiAgICAvKipcbiAgICAgICAqIEFkZHMgdGhlIGtleSBwYWlyIHRvIHRoZSBsaXN0IG9mIHRoZSBrZXlzIG1hbmFnZWQgaW4gdGhlIFtbU3RhbmRhcmRLZXlDaGFpbl1dLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSBuZXdLZXkgQSBrZXkgcGFpciBvZiB0aGUgYXBwcm9wcmlhdGUgY2xhc3MgdG8gYmUgYWRkZWQgdG8gdGhlIFtbU3RhbmRhcmRLZXlDaGFpbl1dXG4gICAgICAgKi9cbiAgICBhZGRLZXkobmV3S2V5OktQQ2xhc3MpIHtcbiAgICAgIHRoaXMua2V5c1tuZXdLZXkuZ2V0QWRkcmVzcygpLnRvU3RyaW5nKCdoZXgnKV0gPSBuZXdLZXk7XG4gICAgfTtcbiAgXG4gICAgLyoqXG4gICAgICAgKiBSZW1vdmVzIHRoZSBrZXkgcGFpciBmcm9tIHRoZSBsaXN0IG9mIHRoZXkga2V5cyBtYW5hZ2VkIGluIHRoZSBbW1N0YW5kYXJkS2V5Q2hhaW5dXS5cbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0ga2V5IEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBhZGRyZXNzIG9yXG4gICAgICAgKiBLUENsYXNzIHRvIHJlbW92ZVxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIFRoZSBib29sZWFuIHRydWUgaWYgYSBrZXkgd2FzIHJlbW92ZWQuXG4gICAgICAgKi9cbiAgICByZW1vdmVLZXkgPSAoa2V5OktQQ2xhc3MgfCBCdWZmZXIpID0+IHtcbiAgICAgIGxldCBrYWRkcjpzdHJpbmc7XG4gICAgICBpZiAoa2V5IGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICAgIGthZGRyID0ga2V5LnRvU3RyaW5nKCdoZXgnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGthZGRyID0ga2V5LmdldEFkZHJlc3MoKS50b1N0cmluZygnaGV4Jyk7XG4gICAgICB9XG4gICAgICBpZiAoa2FkZHIgaW4gdGhpcy5rZXlzKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmtleXNba2FkZHJdO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICBcbiAgICAvKipcbiAgICAgICAqIENoZWNrcyBpZiB0aGVyZSBpcyBhIGtleSBhc3NvY2lhdGVkIHdpdGggdGhlIHByb3ZpZGVkIGFkZHJlc3MuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIGFkZHJlc3MgVGhlIGFkZHJlc3MgdG8gY2hlY2sgZm9yIGV4aXN0ZW5jZSBpbiB0aGUga2V5cyBkYXRhYmFzZVxuICAgICAgICpcbiAgICAgICAqIEByZXR1cm5zIFRydWUgb24gc3VjY2VzcywgZmFsc2UgaWYgbm90IGZvdW5kXG4gICAgICAgKi9cbiAgICBoYXNLZXkgPSAoYWRkcmVzczpCdWZmZXIpOmJvb2xlYW4gPT4gKGFkZHJlc3MudG9TdHJpbmcoJ2hleCcpIGluIHRoaXMua2V5cyk7XG4gIFxuICAgIC8qKlxuICAgICAgICogUmV0dXJucyB0aGUgW1tTdGFuZGFyZEtleVBhaXJdXSBsaXN0ZWQgdW5kZXIgdGhlIHByb3ZpZGVkIGFkZHJlc3NcbiAgICAgICAqXG4gICAgICAgKiBAcGFyYW0gYWRkcmVzcyBUaGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb2YgdGhlIGFkZHJlc3MgdG9cbiAgICAgICAqIHJldHJpZXZlIGZyb20gdGhlIGtleXMgZGF0YWJhc2VcbiAgICAgICAqXG4gICAgICAgKiBAcmV0dXJucyBBIHJlZmVyZW5jZSB0byB0aGUgW1tTdGFuZGFyZEtleVBhaXJdXSBpbiB0aGUga2V5cyBkYXRhYmFzZVxuICAgICAgICovXG4gICAgZ2V0S2V5ID0gKGFkZHJlc3M6QnVmZmVyKTogS1BDbGFzcyA9PiB0aGlzLmtleXNbYWRkcmVzcy50b1N0cmluZygnaGV4JyldO1xuXG4gICAgYWJzdHJhY3QgY3JlYXRlKC4uLmFyZ3M6YW55W10pOnRoaXM7XG5cbiAgICBhYnN0cmFjdCBjbG9uZSgpOnRoaXM7XG5cbiAgICBhYnN0cmFjdCB1bmlvbihrYzp0aGlzKTp0aGlzO1xuICAgIFxuICB9Il19