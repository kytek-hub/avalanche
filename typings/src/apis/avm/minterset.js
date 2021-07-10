"use strict";
/**
 * @packageDocumentation
 * @module API-AVM-MinterSet
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinterSet = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const serialization_1 = require("../../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
const decimalString = "decimalString";
const cb58 = "cb58";
const num = "number";
const buffer = "Buffer";
/**
 * Class for representing a threshold and set of minting addresses in Avalanche.
 *
 * @typeparam MinterSet including a threshold and array of addresses
 */
class MinterSet extends serialization_1.Serializable {
    /**
     *
     * @param threshold The number of signatures required to mint more of an asset by signing a minting transaction
     * @param minters Array of addresss which are authorized to sign a minting transaction
     */
    constructor(threshold = 1, minters = []) {
        super();
        this._typeName = "MinterSet";
        this._typeID = undefined;
        this.minters = [];
        /**
         * Returns the threshold.
         */
        this.getThreshold = () => {
            return this.threshold;
        };
        /**
         * Returns the minters.
         */
        this.getMinters = () => {
            return this.minters;
        };
        this._cleanAddresses = (addresses) => {
            let addrs = [];
            for (let i = 0; i < addresses.length; i++) {
                if (typeof addresses[i] === "string") {
                    addrs.push(bintools.stringToAddress(addresses[i]));
                }
                else if (addresses[i] instanceof buffer_1.Buffer) {
                    addrs.push(addresses[i]);
                }
            }
            return addrs;
        };
        this.threshold = threshold;
        this.minters = this._cleanAddresses(minters);
    }
    serialize(encoding = "hex") {
        const fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { threshold: serialization.encoder(this.threshold, encoding, num, decimalString, 4), minters: this.minters.map((m) => serialization.encoder(m, encoding, buffer, cb58, 20)) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.threshold = serialization.decoder(fields["threshold"], encoding, decimalString, num, 4);
        this.minters = fields["minters"].map((m) => serialization.decoder(m, encoding, cb58, buffer, 20));
    }
}
exports.MinterSet = MinterSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWludGVyc2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvYXZtL21pbnRlcnNldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7QUFFSCxvQ0FBZ0M7QUFDaEMsb0VBQTJDO0FBQzNDLDZEQUEyRztBQUUzRzs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDaEUsTUFBTSxhQUFhLEdBQW1CLGVBQWUsQ0FBQTtBQUNyRCxNQUFNLElBQUksR0FBbUIsTUFBTSxDQUFBO0FBQ25DLE1BQU0sR0FBRyxHQUFtQixRQUFRLENBQUE7QUFDcEMsTUFBTSxNQUFNLEdBQW1CLFFBQVEsQ0FBQTtBQUV2Qzs7OztHQUlHO0FBQ0gsTUFBYSxTQUFVLFNBQVEsNEJBQVk7SUErQ3pDOzs7O09BSUc7SUFDSCxZQUFZLFlBQW9CLENBQUMsRUFBRSxVQUErQixFQUFFO1FBQ2xFLEtBQUssRUFBRSxDQUFBO1FBcERDLGNBQVMsR0FBRyxXQUFXLENBQUE7UUFDdkIsWUFBTyxHQUFHLFNBQVMsQ0FBQTtRQWlCbkIsWUFBTyxHQUFhLEVBQUUsQ0FBQTtRQUVoQzs7V0FFRztRQUNILGlCQUFZLEdBQUcsR0FBVyxFQUFFO1lBQzFCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQTtRQUN2QixDQUFDLENBQUE7UUFFRDs7V0FFRztRQUNILGVBQVUsR0FBRyxHQUFhLEVBQUU7WUFDMUIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFBO1FBQ3JCLENBQUMsQ0FBQTtRQUVTLG9CQUFlLEdBQUcsQ0FBQyxTQUE4QixFQUFZLEVBQUU7WUFDdkUsSUFBSSxLQUFLLEdBQWEsRUFBRSxDQUFBO1lBQ3hCLEtBQUssSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNqRCxJQUFJLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtvQkFDcEMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQVcsQ0FBQyxDQUFDLENBQUE7aUJBQzdEO3FCQUFNLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxZQUFZLGVBQU0sRUFBRTtvQkFDekMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFXLENBQUMsQ0FBQTtpQkFDbkM7YUFDRjtZQUNELE9BQU8sS0FBSyxDQUFBO1FBQ2QsQ0FBQyxDQUFBO1FBU0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7UUFDMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0lBQzlDLENBQUM7SUFwREQsU0FBUyxDQUFDLFdBQStCLEtBQUs7UUFDNUMsTUFBTSxNQUFNLEdBQVcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNoRCx1Q0FDSyxNQUFNLEtBQ1QsU0FBUyxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsRUFDakYsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUN2RjtJQUNILENBQUM7SUFDRCxXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDbkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUM1RixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFTLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUE7SUFDM0csQ0FBQztDQXlDRjtBQXpERCw4QkF5REMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktQVZNLU1pbnRlclNldFxuICovXG5cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi8uLi91dGlscy9iaW50b29scydcbmltcG9ydCB7IFNlcmlhbGl6YWJsZSwgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nLCBTZXJpYWxpemVkVHlwZSB9IGZyb20gJy4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb24nXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5jb25zdCBkZWNpbWFsU3RyaW5nOiBTZXJpYWxpemVkVHlwZSA9IFwiZGVjaW1hbFN0cmluZ1wiXG5jb25zdCBjYjU4OiBTZXJpYWxpemVkVHlwZSA9IFwiY2I1OFwiXG5jb25zdCBudW06IFNlcmlhbGl6ZWRUeXBlID0gXCJudW1iZXJcIlxuY29uc3QgYnVmZmVyOiBTZXJpYWxpemVkVHlwZSA9IFwiQnVmZmVyXCJcblxuLyoqXG4gKiBDbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEgdGhyZXNob2xkIGFuZCBzZXQgb2YgbWludGluZyBhZGRyZXNzZXMgaW4gQXZhbGFuY2hlLiBcbiAqIFxuICogQHR5cGVwYXJhbSBNaW50ZXJTZXQgaW5jbHVkaW5nIGEgdGhyZXNob2xkIGFuZCBhcnJheSBvZiBhZGRyZXNzZXNcbiAqL1xuZXhwb3J0IGNsYXNzIE1pbnRlclNldCBleHRlbmRzIFNlcmlhbGl6YWJsZXtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiTWludGVyU2V0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGNvbnN0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICB0aHJlc2hvbGQ6IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLnRocmVzaG9sZCwgZW5jb2RpbmcsIG51bSwgZGVjaW1hbFN0cmluZywgNCksXG4gICAgICBtaW50ZXJzOiB0aGlzLm1pbnRlcnMubWFwKChtKSA9PiBzZXJpYWxpemF0aW9uLmVuY29kZXIobSwgZW5jb2RpbmcsIGJ1ZmZlciwgY2I1OCwgMjApKVxuICAgIH1cbiAgfVxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMudGhyZXNob2xkID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKGZpZWxkc1tcInRocmVzaG9sZFwiXSwgZW5jb2RpbmcsIGRlY2ltYWxTdHJpbmcsIG51bSwgNClcbiAgICB0aGlzLm1pbnRlcnMgPSBmaWVsZHNbXCJtaW50ZXJzXCJdLm1hcCgobTogc3RyaW5nKSA9PiBzZXJpYWxpemF0aW9uLmRlY29kZXIobSwgZW5jb2RpbmcsIGNiNTgsIGJ1ZmZlciwgMjApKVxuICB9XG4gIFxuICBwcm90ZWN0ZWQgdGhyZXNob2xkOiBudW1iZXJcbiAgcHJvdGVjdGVkIG1pbnRlcnM6IEJ1ZmZlcltdID0gW11cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdGhyZXNob2xkLlxuICAgKi9cbiAgZ2V0VGhyZXNob2xkID0gKCk6IG51bWJlciA9PiB7XG4gICAgcmV0dXJuIHRoaXMudGhyZXNob2xkXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbWludGVycy5cbiAgICovXG4gIGdldE1pbnRlcnMgPSAoKTogQnVmZmVyW10gPT4ge1xuICAgIHJldHVybiB0aGlzLm1pbnRlcnNcbiAgfVxuXG4gIHByb3RlY3RlZCBfY2xlYW5BZGRyZXNzZXMgPSAoYWRkcmVzc2VzOiBzdHJpbmdbXSB8IEJ1ZmZlcltdKTogQnVmZmVyW10gPT4ge1xuICAgIGxldCBhZGRyczogQnVmZmVyW10gPSBbXVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBhZGRyZXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0eXBlb2YgYWRkcmVzc2VzW2ldID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGFkZHJzLnB1c2goYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGFkZHJlc3Nlc1tpXSBhcyBzdHJpbmcpKVxuICAgICAgfSBlbHNlIGlmIChhZGRyZXNzZXNbaV0gaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgYWRkcnMucHVzaChhZGRyZXNzZXNbaV0gYXMgQnVmZmVyKVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYWRkcnNcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKiBAcGFyYW0gdGhyZXNob2xkIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBtaW50IG1vcmUgb2YgYW4gYXNzZXQgYnkgc2lnbmluZyBhIG1pbnRpbmcgdHJhbnNhY3Rpb25cbiAgICogQHBhcmFtIG1pbnRlcnMgQXJyYXkgb2YgYWRkcmVzc3Mgd2hpY2ggYXJlIGF1dGhvcml6ZWQgdG8gc2lnbiBhIG1pbnRpbmcgdHJhbnNhY3Rpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKHRocmVzaG9sZDogbnVtYmVyID0gMSwgbWludGVyczogc3RyaW5nW10gfCBCdWZmZXJbXSA9IFtdKSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMudGhyZXNob2xkID0gdGhyZXNob2xkXG4gICAgdGhpcy5taW50ZXJzID0gdGhpcy5fY2xlYW5BZGRyZXNzZXMobWludGVycylcbiAgfVxufSJdfQ==