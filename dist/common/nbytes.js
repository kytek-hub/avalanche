"use strict";
/**
 * @packageDocumentation
 * @module Common-NBytes
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NBytes = void 0;
const bintools_1 = __importDefault(require("../utils/bintools"));
const serialization_1 = require("../utils/serialization");
const errors_1 = require("../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Abstract class that implements basic functionality for managing a
 * {@link https://github.com/feross/buffer|Buffer} of an exact length.
 *
 * Create a class that extends this one and override bsize to make it validate for exactly
 * the correct length.
 */
class NBytes extends serialization_1.Serializable {
    constructor() {
        super(...arguments);
        this._typeName = "NBytes";
        this._typeID = undefined;
        /**
         * Returns the length of the {@link https://github.com/feross/buffer|Buffer}.
         *
         * @returns The exact length requirement of this class
         */
        this.getSize = () => this.bsize;
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "bsize": serialization.encoder(this.bsize, encoding, "number", "decimalString", 4), "bytes": serialization.encoder(this.bytes, encoding, "Buffer", "hex", this.bsize) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.bsize = serialization.decoder(fields["bsize"], encoding, "decimalString", "number", 4);
        this.bytes = serialization.decoder(fields["bytes"], encoding, "hex", "Buffer", this.bsize);
    }
    /**
     * Takes a base-58 encoded string, verifies its length, and stores it.
     *
     * @returns The size of the {@link https://github.com/feross/buffer|Buffer}
     */
    fromString(b58str) {
        try {
            this.fromBuffer(bintools.b58ToBuffer(b58str));
        }
        catch (e) {
            /* istanbul ignore next */
            const emsg = `Error - NBytes.fromString: ${e}`;
            /* istanbul ignore next */
            throw new Error(emsg);
        }
        return this.bsize;
    }
    /**
     * Takes a [[Buffer]], verifies its length, and stores it.
     *
     * @returns The size of the {@link https://github.com/feross/buffer|Buffer}
     */
    fromBuffer(buff, offset = 0) {
        try {
            if (buff.length - offset < this.bsize) {
                /* istanbul ignore next */
                throw new errors_1.BufferSizeError("Error - NBytes.fromBuffer: not enough space available in buffer.");
            }
            this.bytes = bintools.copyFrom(buff, offset, offset + this.bsize);
        }
        catch (e) {
            /* istanbul ignore next */
            const emsg = `Error - NBytes.fromBuffer: ${e}`;
            /* istanbul ignore next */
            throw new Error(emsg);
        }
        return offset + this.bsize;
    }
    /**
     * @returns A reference to the stored {@link https://github.com/feross/buffer|Buffer}
     */
    toBuffer() {
        return this.bytes;
    }
    /**
     * @returns A base-58 string of the stored {@link https://github.com/feross/buffer|Buffer}
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
}
exports.NBytes = NBytes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmJ5dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1vbi9uYnl0ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBR0gsaUVBQXdDO0FBQ3hDLDBEQUF3RjtBQUN4Riw0Q0FBaUQ7QUFFakQ7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWhFOzs7Ozs7R0FNRztBQUNILE1BQXNCLE1BQU8sU0FBUSw0QkFBWTtJQUFqRDs7UUFDWSxjQUFTLEdBQUcsUUFBUSxDQUFBO1FBQ3BCLFlBQU8sR0FBRyxTQUFTLENBQUE7UUFtQjdCOzs7O1dBSUc7UUFDSCxZQUFPLEdBQUcsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQTtJQXlENUIsQ0FBQztJQS9FQyxTQUFTLENBQUMsV0FBK0IsS0FBSztRQUM1QyxJQUFJLE1BQU0sR0FBVyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFBO1FBQzlDLHVDQUNLLE1BQU0sS0FDVCxPQUFPLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLENBQUMsQ0FBQyxFQUNsRixPQUFPLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFDbEY7SUFDSCxDQUFDO0lBQ0QsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ25DLElBQUksQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDM0YsSUFBSSxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDNUYsQ0FBQztJQVlEOzs7O09BSUc7SUFDSCxVQUFVLENBQUMsTUFBYztRQUN2QixJQUFJO1lBQ0YsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7U0FDOUM7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLDBCQUEwQjtZQUMxQixNQUFNLElBQUksR0FBVyw4QkFBOEIsQ0FBQyxFQUFFLENBQUE7WUFDdEQsMEJBQTBCO1lBQzFCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDdEI7UUFDRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUE7SUFDbkIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxVQUFVLENBQUMsSUFBWSxFQUFFLFNBQWlCLENBQUM7UUFDekMsSUFBSTtZQUNGLElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDckMsMEJBQTBCO2dCQUMxQixNQUFNLElBQUksd0JBQWUsQ0FBQyxrRUFBa0UsQ0FBQyxDQUFBO2FBQzlGO1lBRUQsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtTQUNsRTtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsMEJBQTBCO1lBQzFCLE1BQU0sSUFBSSxHQUFXLDhCQUE4QixDQUFDLEVBQUUsQ0FBQTtZQUN0RCwwQkFBMEI7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQTtTQUN0QjtRQUNELE9BQU8sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUE7SUFDNUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsUUFBUTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQTtJQUNuQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxRQUFRO1FBQ04sT0FBTyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0lBQzlDLENBQUM7Q0FJRjtBQW5GRCx3QkFtRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBDb21tb24tTkJ5dGVzXG4gKi9cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLydcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi91dGlscy9iaW50b29scydcbmltcG9ydCB7IFNlcmlhbGl6YWJsZSwgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSAnLi4vdXRpbHMvc2VyaWFsaXphdGlvbidcbmltcG9ydCB7IEJ1ZmZlclNpemVFcnJvciB9IGZyb20gJy4uL3V0aWxzL2Vycm9ycydcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcblxuLyoqXG4gKiBBYnN0cmFjdCBjbGFzcyB0aGF0IGltcGxlbWVudHMgYmFzaWMgZnVuY3Rpb25hbGl0eSBmb3IgbWFuYWdpbmcgYVxuICoge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb2YgYW4gZXhhY3QgbGVuZ3RoLlxuICpcbiAqIENyZWF0ZSBhIGNsYXNzIHRoYXQgZXh0ZW5kcyB0aGlzIG9uZSBhbmQgb3ZlcnJpZGUgYnNpemUgdG8gbWFrZSBpdCB2YWxpZGF0ZSBmb3IgZXhhY3RseVxuICogdGhlIGNvcnJlY3QgbGVuZ3RoLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTkJ5dGVzIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiTkJ5dGVzXCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgXCJic2l6ZVwiOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5ic2l6ZSwgZW5jb2RpbmcsIFwibnVtYmVyXCIsIFwiZGVjaW1hbFN0cmluZ1wiLCA0KSxcbiAgICAgIFwiYnl0ZXNcIjogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuYnl0ZXMsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImhleFwiLCB0aGlzLmJzaXplKVxuICAgIH1cbiAgfVxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMuYnNpemUgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wiYnNpemVcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJudW1iZXJcIiwgNClcbiAgICB0aGlzLmJ5dGVzID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKGZpZWxkc1tcImJ5dGVzXCJdLCBlbmNvZGluZywgXCJoZXhcIiwgXCJCdWZmZXJcIiwgdGhpcy5ic2l6ZSlcbiAgfVxuXG4gIHByb3RlY3RlZCBieXRlczogQnVmZmVyXG4gIHByb3RlY3RlZCBic2l6ZTogbnVtYmVyXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGxlbmd0aCBvZiB0aGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0uXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBleGFjdCBsZW5ndGggcmVxdWlyZW1lbnQgb2YgdGhpcyBjbGFzc1xuICAgKi9cbiAgZ2V0U2l6ZSA9ICgpID0+IHRoaXMuYnNpemVcblxuICAvKipcbiAgICogVGFrZXMgYSBiYXNlLTU4IGVuY29kZWQgc3RyaW5nLCB2ZXJpZmllcyBpdHMgbGVuZ3RoLCBhbmQgc3RvcmVzIGl0LlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgc2l6ZSBvZiB0aGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICovXG4gIGZyb21TdHJpbmcoYjU4c3RyOiBzdHJpbmcpOiBudW1iZXIge1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmZyb21CdWZmZXIoYmludG9vbHMuYjU4VG9CdWZmZXIoYjU4c3RyKSlcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgY29uc3QgZW1zZzogc3RyaW5nID0gYEVycm9yIC0gTkJ5dGVzLmZyb21TdHJpbmc6ICR7ZX1gXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGVtc2cpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmJzaXplXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSBbW0J1ZmZlcl1dLCB2ZXJpZmllcyBpdHMgbGVuZ3RoLCBhbmQgc3RvcmVzIGl0LlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgc2l6ZSBvZiB0aGUge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICovXG4gIGZyb21CdWZmZXIoYnVmZjogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIHRyeSB7XG4gICAgICBpZiAoYnVmZi5sZW5ndGggLSBvZmZzZXQgPCB0aGlzLmJzaXplKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHRocm93IG5ldyBCdWZmZXJTaXplRXJyb3IoXCJFcnJvciAtIE5CeXRlcy5mcm9tQnVmZmVyOiBub3QgZW5vdWdoIHNwYWNlIGF2YWlsYWJsZSBpbiBidWZmZXIuXCIpXG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnl0ZXMgPSBiaW50b29scy5jb3B5RnJvbShidWZmLCBvZmZzZXQsIG9mZnNldCArIHRoaXMuYnNpemUpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIGNvbnN0IGVtc2c6IHN0cmluZyA9IGBFcnJvciAtIE5CeXRlcy5mcm9tQnVmZmVyOiAke2V9YFxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBFcnJvcihlbXNnKVxuICAgIH1cbiAgICByZXR1cm4gb2Zmc2V0ICsgdGhpcy5ic2l6ZVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIEEgcmVmZXJlbmNlIHRvIHRoZSBzdG9yZWQge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICovXG4gIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICByZXR1cm4gdGhpcy5ieXRlc1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm5zIEEgYmFzZS01OCBzdHJpbmcgb2YgdGhlIHN0b3JlZCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKi9cbiAgdG9TdHJpbmcoKTpzdHJpbmcge1xuICAgIHJldHVybiBiaW50b29scy5idWZmZXJUb0I1OCh0aGlzLnRvQnVmZmVyKCkpXG4gIH1cblxuICBhYnN0cmFjdCBjbG9uZSgpOiB0aGlzXG4gIGFic3RyYWN0IGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXNcbn0iXX0=