"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Credential = exports.Signature = exports.SigIdx = void 0;
/**
 * @packageDocumentation
 * @module Common-Signature
 */
const nbytes_1 = require("./nbytes");
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../utils/bintools"));
const serialization_1 = require("../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Type representing a [[Signature]] index used in [[Input]]
 */
class SigIdx extends nbytes_1.NBytes {
    /**
     * Type representing a [[Signature]] index used in [[Input]]
     */
    constructor() {
        super();
        this._typeName = "SigIdx";
        this._typeID = undefined;
        this.source = buffer_1.Buffer.alloc(20);
        this.bytes = buffer_1.Buffer.alloc(4);
        this.bsize = 4;
        /**
         * Sets the source address for the signature
         */
        this.setSource = (address) => {
            this.source = address;
        };
        /**
         * Retrieves the source address for the signature
         */
        this.getSource = () => this.source;
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "source": serialization.encoder(this.source, encoding, "Buffer", "hex") });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.source = serialization.decoder(fields["source"], encoding, "hex", "Buffer");
    }
    clone() {
        let newbase = new SigIdx();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new SigIdx();
    }
}
exports.SigIdx = SigIdx;
/**
 * Signature for a [[Tx]]
 */
class Signature extends nbytes_1.NBytes {
    /**
     * Signature for a [[Tx]]
     */
    constructor() {
        super();
        this._typeName = "Signature";
        this._typeID = undefined;
        //serialize and deserialize both are inherited
        this.bytes = buffer_1.Buffer.alloc(65);
        this.bsize = 65;
    }
    clone() {
        let newbase = new Signature();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new Signature();
    }
}
exports.Signature = Signature;
class Credential extends serialization_1.Serializable {
    constructor(sigarray = undefined) {
        super();
        this._typeName = "Credential";
        this._typeID = undefined;
        this.sigArray = [];
        /**
           * Adds a signature to the credentials and returns the index off the added signature.
           */
        this.addSignature = (sig) => {
            this.sigArray.push(sig);
            return this.sigArray.length - 1;
        };
        if (typeof sigarray !== "undefined") {
            /* istanbul ignore next */
            this.sigArray = sigarray;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { sigArray: this.sigArray.map((s) => s.serialize(encoding)) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.sigArray = fields["sigArray"].map((s) => {
            let sig = new Signature();
            sig.deserialize(s, encoding);
            return sig;
        });
    }
    /**
    * Set the codecID
    *
    * @param codecID The codecID to set
    */
    setCodecID(codecID) { }
    fromBuffer(bytes, offset = 0) {
        const siglen = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.sigArray = [];
        for (let i = 0; i < siglen; i++) {
            const sig = new Signature();
            offset = sig.fromBuffer(bytes, offset);
            this.sigArray.push(sig);
        }
        return offset;
    }
    toBuffer() {
        const siglen = buffer_1.Buffer.alloc(4);
        siglen.writeInt32BE(this.sigArray.length, 0);
        const barr = [siglen];
        let bsize = siglen.length;
        for (let i = 0; i < this.sigArray.length; i++) {
            const sigbuff = this.sigArray[i].toBuffer();
            bsize += sigbuff.length;
            barr.push(sigbuff);
        }
        return buffer_1.Buffer.concat(barr, bsize);
    }
}
exports.Credential = Credential;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlZGVudGlhbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbW9uL2NyZWRlbnRpYWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILHFDQUFpQztBQUNqQyxvQ0FBZ0M7QUFDaEMsaUVBQXdDO0FBQ3hDLDBEQUF3RjtBQUd4Rjs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFaEU7O0dBRUc7QUFDSCxNQUFhLE1BQU8sU0FBUSxlQUFNO0lBMkNoQzs7T0FFRztJQUNIO1FBQ0UsS0FBSyxFQUFFLENBQUE7UUE5Q0MsY0FBUyxHQUFHLFFBQVEsQ0FBQTtRQUNwQixZQUFPLEdBQUcsU0FBUyxDQUFBO1FBY25CLFdBQU0sR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ2pDLFVBQUssR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3ZCLFVBQUssR0FBRyxDQUFDLENBQUE7UUFFbkI7O1dBRUc7UUFDSCxjQUFTLEdBQUcsQ0FBQyxPQUFjLEVBQUUsRUFBRTtZQUM3QixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQTtRQUN2QixDQUFDLENBQUE7UUFFRDs7V0FFRztRQUNILGNBQVMsR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFBO0lBa0JyQyxDQUFDO0lBNUNELFNBQVMsQ0FBQyxXQUErQixLQUFLO1FBQzVDLElBQUksTUFBTSxHQUFXLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDOUMsdUNBQ0ssTUFBTSxLQUNULFFBQVEsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFB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QUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFBO1lBQ25ELEtBQUssSUFBSSxPQUFPLENBQUMsTUFBTSxDQUFBO1lBQ3ZCLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUE7U0FDbkI7UUFDRCxPQUFPLGVBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ25DLENBQUM7Q0FZRjtBQTFFRCxnQ0EwRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBDb21tb24tU2lnbmF0dXJlXG4gKi9cbmltcG9ydCB7IE5CeXRlcyB9IGZyb20gXCIuL25ieXRlc1wiXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IFNlcmlhbGl6YWJsZSwgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSBcIi4uL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogVHlwZSByZXByZXNlbnRpbmcgYSBbW1NpZ25hdHVyZV1dIGluZGV4IHVzZWQgaW4gW1tJbnB1dF1dXG4gKi9cbmV4cG9ydCBjbGFzcyBTaWdJZHggZXh0ZW5kcyBOQnl0ZXMge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTaWdJZHhcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBcInNvdXJjZVwiOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5zb3VyY2UsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImhleFwiKVxuICAgIH1cbiAgfVxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMuc291cmNlID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKGZpZWxkc1tcInNvdXJjZVwiXSwgZW5jb2RpbmcsIFwiaGV4XCIsIFwiQnVmZmVyXCIpXG4gIH1cblxuICBwcm90ZWN0ZWQgc291cmNlOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMjApXG4gIHByb3RlY3RlZCBieXRlcyA9IEJ1ZmZlci5hbGxvYyg0KVxuICBwcm90ZWN0ZWQgYnNpemUgPSA0XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNvdXJjZSBhZGRyZXNzIGZvciB0aGUgc2lnbmF0dXJlXG4gICAqL1xuICBzZXRTb3VyY2UgPSAoYWRkcmVzczpCdWZmZXIpID0+IHtcbiAgICB0aGlzLnNvdXJjZSA9IGFkZHJlc3NcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZXMgdGhlIHNvdXJjZSBhZGRyZXNzIGZvciB0aGUgc2lnbmF0dXJlXG4gICAqL1xuICBnZXRTb3VyY2UgPSAoKTogQnVmZmVyID0+IHRoaXMuc291cmNlXG5cbiAgY2xvbmUoKTogdGhpcyB7XG4gICAgbGV0IG5ld2Jhc2U6IFNpZ0lkeCA9IG5ldyBTaWdJZHgoKVxuICAgIG5ld2Jhc2UuZnJvbUJ1ZmZlcih0aGlzLnRvQnVmZmVyKCkpXG4gICAgcmV0dXJuIG5ld2Jhc2UgYXMgdGhpc1xuICB9XG5cbiAgY3JlYXRlKC4uLmFyZ3M6YW55W10pOnRoaXMge1xuICAgIHJldHVybiBuZXcgU2lnSWR4KCkgYXMgdGhpc1xuICB9XG5cblxuICAvKipcbiAgICogVHlwZSByZXByZXNlbnRpbmcgYSBbW1NpZ25hdHVyZV1dIGluZGV4IHVzZWQgaW4gW1tJbnB1dF1dXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpXG4gIH1cbn1cblxuLyoqXG4gKiBTaWduYXR1cmUgZm9yIGEgW1tUeF1dXG4gKi9cbmV4cG9ydCBjbGFzcyBTaWduYXR1cmUgZXh0ZW5kcyBOQnl0ZXMge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTaWduYXR1cmVcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuXG4gIC8vc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBib3RoIGFyZSBpbmhlcml0ZWRcblxuICBwcm90ZWN0ZWQgYnl0ZXMgPSBCdWZmZXIuYWxsb2MoNjUpXG4gIHByb3RlY3RlZCBic2l6ZSA9IDY1XG5cbiAgY2xvbmUoKTp0aGlzIHtcbiAgICBsZXQgbmV3YmFzZTogU2lnbmF0dXJlID0gbmV3IFNpZ25hdHVyZSgpXG4gICAgbmV3YmFzZS5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3YmFzZSBhcyB0aGlzXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzIHtcbiAgICByZXR1cm4gbmV3IFNpZ25hdHVyZSgpIGFzIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBTaWduYXR1cmUgZm9yIGEgW1tUeF1dXG4gICAqL1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpXG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENyZWRlbnRpYWwgZXh0ZW5kcyBTZXJpYWxpemFibGV7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkNyZWRlbnRpYWxcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBzaWdBcnJheTogdGhpcy5zaWdBcnJheS5tYXAoKHMpID0+IHMuc2VyaWFsaXplKGVuY29kaW5nKSlcbiAgICB9XG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLnNpZ0FycmF5ID0gZmllbGRzW1wic2lnQXJyYXlcIl0ubWFwKChzOm9iamVjdCkgPT4ge1xuICAgICAgbGV0IHNpZzogU2lnbmF0dXJlID0gbmV3IFNpZ25hdHVyZSgpXG4gICAgICBzaWcuZGVzZXJpYWxpemUocywgZW5jb2RpbmcpXG4gICAgICByZXR1cm4gc2lnXG4gICAgfSlcbiAgfVxuXG4gIHByb3RlY3RlZCBzaWdBcnJheTogU2lnbmF0dXJlW10gPSBbXVxuXG4gIGFic3RyYWN0IGdldENyZWRlbnRpYWxJRCgpOiBudW1iZXJcblxuICAvKipcbiAgKiBTZXQgdGhlIGNvZGVjSURcbiAgKlxuICAqIEBwYXJhbSBjb2RlY0lEIFRoZSBjb2RlY0lEIHRvIHNldFxuICAqL1xuICBzZXRDb2RlY0lEKGNvZGVjSUQ6IG51bWJlcik6IHZvaWQgeyB9XG5cbiAgLyoqXG4gICAgICogQWRkcyBhIHNpZ25hdHVyZSB0byB0aGUgY3JlZGVudGlhbHMgYW5kIHJldHVybnMgdGhlIGluZGV4IG9mZiB0aGUgYWRkZWQgc2lnbmF0dXJlLlxuICAgICAqL1xuICBhZGRTaWduYXR1cmUgPSAoc2lnOlNpZ25hdHVyZSk6bnVtYmVyID0+IHtcbiAgICB0aGlzLnNpZ0FycmF5LnB1c2goc2lnKVxuICAgIHJldHVybiB0aGlzLnNpZ0FycmF5Lmxlbmd0aCAtIDFcbiAgfVxuXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICBjb25zdCBzaWdsZW46IG51bWJlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpLnJlYWRVSW50MzJCRSgwKVxuICAgIG9mZnNldCArPSA0XG4gICAgdGhpcy5zaWdBcnJheSA9IFtdXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHNpZ2xlbjsgaSsrKSB7XG4gICAgICBjb25zdCBzaWc6IFNpZ25hdHVyZSA9IG5ldyBTaWduYXR1cmUoKVxuICAgICAgb2Zmc2V0ID0gc2lnLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICAgIHRoaXMuc2lnQXJyYXkucHVzaChzaWcpXG4gICAgfVxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgY29uc3Qgc2lnbGVuOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBzaWdsZW4ud3JpdGVJbnQzMkJFKHRoaXMuc2lnQXJyYXkubGVuZ3RoLCAwKVxuICAgIGNvbnN0IGJhcnI6IEJ1ZmZlcltdID0gW3NpZ2xlbl1cbiAgICBsZXQgYnNpemU6IG51bWJlciA9IHNpZ2xlbi5sZW5ndGhcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5zaWdBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgc2lnYnVmZjogQnVmZmVyID0gdGhpcy5zaWdBcnJheVtpXS50b0J1ZmZlcigpXG4gICAgICBic2l6ZSArPSBzaWdidWZmLmxlbmd0aFxuICAgICAgYmFyci5wdXNoKHNpZ2J1ZmYpXG4gICAgfVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIGJzaXplKVxuICB9XG5cbiAgYWJzdHJhY3QgY2xvbmUoKTogdGhpc1xuICBhYnN0cmFjdCBjcmVhdGUoLi4uYXJnczogYW55W10pOiB0aGlzXG4gIGFic3RyYWN0IHNlbGVjdChpZDogbnVtYmVyLCAuLi5hcmdzOiBhbnlbXSk6IENyZWRlbnRpYWxcbiAgY29uc3RydWN0b3Ioc2lnYXJyYXk6IFNpZ25hdHVyZVtdID0gdW5kZWZpbmVkKSB7XG4gICAgc3VwZXIoKVxuICAgIGlmICh0eXBlb2Ygc2lnYXJyYXkgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aGlzLnNpZ0FycmF5ID0gc2lnYXJyYXlcbiAgICB9XG4gIH1cbn0iXX0=