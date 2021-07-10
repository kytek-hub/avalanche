"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Serialization = exports.Serializable = exports.SERIALIZATIONVERSION = void 0;
/**
 * @packageDocumentation
 * @module Utils-Serialization
 */
const bintools_1 = __importDefault(require("../utils/bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const helperfunctions_1 = require("./helperfunctions");
const errors_1 = require("../utils/errors");
exports.SERIALIZATIONVERSION = 0;
class Serializable {
    constructor() {
        this._typeName = undefined;
        this._typeID = undefined;
        this._codecID = undefined;
    }
    /**
     * Used in serialization. TypeName is a string name for the type of object being output.
     */
    getTypeName() {
        return this._typeName;
    }
    /**
     * Used in serialization. Optional. TypeID is a number for the typeID of object being output.
     */
    getTypeID() {
        return this._typeID;
    }
    /**
     * Used in serialization. Optional. TypeID is a number for the typeID of object being output.
     */
    getCodecID() {
        return this._codecID;
    }
    //sometimes the parent class manages the fields
    //these are so you can say super.serialize(encoding) 
    serialize(encoding) {
        return {
            "_typeName": this._typeName,
            "_typeID": (typeof this._typeID === "undefined" ? null : this._typeID),
            "_codecID": (typeof this._codecID === "undefined" ? null : this._codecID)
        };
    }
    deserialize(fields, encoding) {
        if (typeof fields["_typeName"] !== "string") {
            throw new errors_1.TypeNameError("Error - Serializable.deserialize: _typeName must be a string, found: " + typeof fields["_typeName"]);
        }
        if (fields["_typeName"] !== this._typeName) {
            throw new errors_1.TypeNameError("Error - Serializable.deserialize: _typeName mismatch -- expected: " + this._typeName + " -- received: " + fields["_typeName"]);
        }
        if (typeof fields["_typeID"] !== "undefined" && fields["_typeID"] !== null) {
            if (typeof fields["_typeID"] !== "number") {
                throw new errors_1.TypeIdError("Error - Serializable.deserialize: _typeID must be a number, found: " + typeof fields["_typeID"]);
            }
            if (fields["_typeID"] !== this._typeID) {
                throw new errors_1.TypeIdError("Error - Serializable.deserialize: _typeID mismatch -- expected: " + this._typeID + " -- received: " + fields["_typeID"]);
            }
        }
        if (typeof fields["_codecID"] !== "undefined" && fields["_codecID"] !== null) {
            if (typeof fields["_codecID"] !== "number") {
                throw new errors_1.CodecIdError("Error - Serializable.deserialize: _codecID must be a number, found: " + typeof fields["_codecID"]);
            }
            if (fields["_codecID"] !== this._codecID) {
                throw new errors_1.CodecIdError("Error - Serializable.deserialize: _codecID mismatch -- expected: " + this._codecID + " -- received: " + fields["_codecID"]);
            }
        }
    }
}
exports.Serializable = Serializable;
class Serialization {
    constructor() {
        this.bintools = bintools_1.default.getInstance();
    }
    /**
     * Retrieves the Serialization singleton.
     */
    static getInstance() {
        if (!Serialization.instance) {
            Serialization.instance = new Serialization();
        }
        return Serialization.instance;
    }
    /**
     * Convert {@link https://github.com/feross/buffer|Buffer} to [[SerializedType]]
     *
     * @param vb {@link https://github.com/feross/buffer|Buffer}
     * @param type [[SerializedType]]
     * @param ...args remaining arguments
     * @returns type of [[SerializedType]]
     */
    bufferToType(vb, type, ...args) {
        if (type === "BN") {
            return new bn_js_1.default(vb.toString("hex"), "hex");
        }
        else if (type === "Buffer") {
            if (args.length == 1 && typeof args[0] === "number") {
                vb = buffer_1.Buffer.from(vb.toString("hex").padStart(args[0] * 2, "0"), "hex");
            }
            return vb;
        }
        else if (type === "bech32") {
            return this.bintools.addressToString(args[0], args[1], vb);
        }
        else if (type === "nodeID") {
            return helperfunctions_1.bufferToNodeIDString(vb);
        }
        else if (type === "privateKey") {
            return helperfunctions_1.bufferToPrivateKeyString(vb);
        }
        else if (type === "cb58") {
            return this.bintools.cb58Encode(vb);
        }
        else if (type === "base58") {
            return this.bintools.bufferToB58(vb);
        }
        else if (type === "base64") {
            return vb.toString("base64");
        }
        else if (type === "hex") {
            return vb.toString("hex");
        }
        else if (type === "decimalString") {
            return new bn_js_1.default(vb.toString("hex"), "hex").toString(10);
        }
        else if (type === "number") {
            return new bn_js_1.default(vb.toString("hex"), "hex").toNumber();
        }
        else if (type === "utf8") {
            return vb.toString("utf8");
        }
        return undefined;
    }
    /**
     * Convert [[SerializedType]] to {@link https://github.com/feross/buffer|Buffer}
     *
     * @param v type of [[SerializedType]]
     * @param type [[SerializedType]]
     * @param ...args remaining arguments
     * @returns {@link https://github.com/feross/buffer|Buffer}
     */
    typeToBuffer(v, type, ...args) {
        if (type === "BN") {
            let str = v.toString("hex");
            if (args.length == 1 && typeof args[0] === "number") {
                return buffer_1.Buffer.from(str.padStart(args[0] * 2, "0"), "hex");
            }
            return buffer_1.Buffer.from(str, "hex");
        }
        else if (type === "Buffer") {
            return v;
        }
        else if (type === "bech32") {
            return this.bintools.stringToAddress(v, ...args);
        }
        else if (type === "nodeID") {
            return helperfunctions_1.NodeIDStringToBuffer(v);
        }
        else if (type === "privateKey") {
            return helperfunctions_1.privateKeyStringToBuffer(v);
        }
        else if (type === "cb58") {
            return this.bintools.cb58Decode(v);
        }
        else if (type === "base58") {
            return this.bintools.b58ToBuffer(v);
        }
        else if (type === "base64") {
            return buffer_1.Buffer.from(v, "base64");
        }
        else if (type === "hex") {
            if (v.startsWith("0x")) {
                v = v.slice(2);
            }
            return buffer_1.Buffer.from(v, "hex");
        }
        else if (type === "decimalString") {
            let str = new bn_js_1.default(v, 10).toString("hex");
            if (args.length == 1 && typeof args[0] === "number") {
                return buffer_1.Buffer.from(str.padStart(args[0] * 2, "0"), "hex");
            }
            return buffer_1.Buffer.from(str, "hex");
        }
        else if (type === "number") {
            let str = new bn_js_1.default(v, 10).toString("hex");
            if (args.length == 1 && typeof args[0] === "number") {
                return buffer_1.Buffer.from(str.padStart(args[0] * 2, "0"), "hex");
            }
            return buffer_1.Buffer.from(str, "hex");
        }
        else if (type === "utf8") {
            if (args.length == 1 && typeof args[0] === "number") {
                let b = buffer_1.Buffer.alloc(args[0]);
                b.write(v);
                return b;
            }
            return buffer_1.Buffer.from(v, "utf8");
        }
        return undefined;
    }
    /**
     * Convert value to type of [[SerializedType]] or [[SerializedEncoding]]
     *
     * @param value
     * @param encoding [[SerializedEncoding]]
     * @param intype [[SerializedType]]
     * @param outtype [[SerializedType]]
     * @param ...args remaining arguments
     * @returns type of [[SerializedType]] or [[SerializedEncoding]]
     */
    encoder(value, encoding, intype, outtype, ...args) {
        if (typeof value === "undefined") {
            throw new errors_1.UnknownTypeError("Error - Serializable.encoder: value passed is undefined");
        }
        if (encoding !== "display") {
            outtype = encoding;
        }
        const vb = this.typeToBuffer(value, intype, ...args);
        return this.bufferToType(vb, outtype, ...args);
    }
    /**
     * Convert value to type of [[SerializedType]] or [[SerializedEncoding]]
     *
     * @param value
     * @param encoding [[SerializedEncoding]]
     * @param intype [[SerializedType]]
     * @param outtype [[SerializedType]]
     * @param ...args remaining arguments
     * @returns type of [[SerializedType]] or [[SerializedEncoding]]
     */
    decoder(value, encoding, intype, outtype, ...args) {
        if (typeof value === "undefined") {
            throw new errors_1.UnknownTypeError("Error - Serializable.decoder: value passed is undefined");
        }
        if (encoding !== "display") {
            intype = encoding;
        }
        const vb = this.typeToBuffer(value, intype, ...args);
        return this.bufferToType(vb, outtype, ...args);
    }
    serialize(serialize, vm, encoding = "display", notes = undefined) {
        if (typeof notes === "undefined") {
            notes = serialize.getTypeName();
        }
        return {
            vm,
            encoding,
            version: exports.SERIALIZATIONVERSION,
            notes,
            fields: serialize.serialize(encoding)
        };
    }
    deserialize(input, output) {
        output.deserialize(input.fields, input.encoding);
    }
}
exports.Serialization = Serialization;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXphdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9zZXJpYWxpemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILGlFQUF3QztBQUN4QyxrREFBc0I7QUFDdEIsb0NBQWdDO0FBQ2hDLHVEQUFrSTtBQUNsSSw0Q0FBNEY7QUFHL0UsUUFBQSxvQkFBb0IsR0FBVyxDQUFDLENBQUE7QUF5QjdDLE1BQXNCLFlBQVk7SUFBbEM7UUFDWSxjQUFTLEdBQVcsU0FBUyxDQUFBO1FBQzdCLFlBQU8sR0FBVyxTQUFTLENBQUE7UUFDM0IsYUFBUSxHQUFXLFNBQVMsQ0FBQTtJQXdEeEMsQ0FBQztJQXREQzs7T0FFRztJQUNILFdBQVc7UUFDVCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUE7SUFDdkIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUztRQUNQLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtJQUNyQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxVQUFVO1FBQ1IsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFBO0lBQ3RCLENBQUM7SUFFRCwrQ0FBK0M7SUFDL0MscURBQXFEO0lBQ3JELFNBQVMsQ0FBQyxRQUE2QjtRQUNyQyxPQUFPO1lBQ0wsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTO1lBQzNCLFNBQVMsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUN0RSxVQUFVLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7U0FDMUUsQ0FBQTtJQUNILENBQUM7SUFDRCxXQUFXLENBQUMsTUFBYyxFQUFFLFFBQTZCO1FBQ3ZE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S0Qsc0NBNktDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgVXRpbHMtU2VyaWFsaXphdGlvblxuICovXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IHsgTm9kZUlEU3RyaW5nVG9CdWZmZXIsIHByaXZhdGVLZXlTdHJpbmdUb0J1ZmZlciwgYnVmZmVyVG9Ob2RlSURTdHJpbmcsIGJ1ZmZlclRvUHJpdmF0ZUtleVN0cmluZyB9IGZyb20gXCIuL2hlbHBlcmZ1bmN0aW9uc1wiXG5pbXBvcnQgeyBDb2RlY0lkRXJyb3IsIFR5cGVJZEVycm9yLCBUeXBlTmFtZUVycm9yLCBVbmtub3duVHlwZUVycm9yIH0gZnJvbSBcIi4uL3V0aWxzL2Vycm9yc1wiXG5pbXBvcnQgeyBTZXJpYWxpemVkIH0gZnJvbSBcInNyYy9jb21tb25cIlxuXG5leHBvcnQgY29uc3QgU0VSSUFMSVpBVElPTlZFUlNJT046IG51bWJlciA9IDBcbmV4cG9ydCB0eXBlIFNlcmlhbGl6ZWRUeXBlID0gXG4gIFwiaGV4XCJcbiAgfCBcIkJOXCJcbiAgfCBcIkJ1ZmZlclwiXG4gIHwgXCJiZWNoMzJcIlxuICB8IFwibm9kZUlEXCJcbiAgfCBcInByaXZhdGVLZXlcIlxuICB8IFwiY2I1OFwiXG4gIHwgXCJiYXNlNThcIlxuICB8IFwiYmFzZTY0XCJcbiAgfCBcImRlY2ltYWxTdHJpbmdcIlxuICB8IFwibnVtYmVyXCJcbiAgfCBcInV0ZjhcIlxuXG5leHBvcnQgdHlwZSBTZXJpYWxpemVkRW5jb2RpbmcgPSBcbiAgXCJoZXhcIlxuICB8IFwiY2I1OFwiXG4gIHwgXCJiYXNlNThcIlxuICB8IFwiYmFzZTY0XCJcbiAgfCBcImRlY2ltYWxTdHJpbmdcIlxuICB8IFwibnVtYmVyXCJcbiAgfCBcInV0ZjhcIlxuICB8IFwiZGlzcGxheVwiXG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTZXJpYWxpemFibGUge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lOiBzdHJpbmcgPSB1bmRlZmluZWRcbiAgcHJvdGVjdGVkIF90eXBlSUQ6IG51bWJlciA9IHVuZGVmaW5lZFxuICBwcm90ZWN0ZWQgX2NvZGVjSUQ6IG51bWJlciA9IHVuZGVmaW5lZFxuXG4gIC8qKlxuICAgKiBVc2VkIGluIHNlcmlhbGl6YXRpb24uIFR5cGVOYW1lIGlzIGEgc3RyaW5nIG5hbWUgZm9yIHRoZSB0eXBlIG9mIG9iamVjdCBiZWluZyBvdXRwdXQuXG4gICAqL1xuICBnZXRUeXBlTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl90eXBlTmFtZVxuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgaW4gc2VyaWFsaXphdGlvbi4gT3B0aW9uYWwuIFR5cGVJRCBpcyBhIG51bWJlciBmb3IgdGhlIHR5cGVJRCBvZiBvYmplY3QgYmVpbmcgb3V0cHV0LlxuICAgKi9cbiAgZ2V0VHlwZUlEKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRFxuICB9XG5cbiAgLyoqXG4gICAqIFVzZWQgaW4gc2VyaWFsaXphdGlvbi4gT3B0aW9uYWwuIFR5cGVJRCBpcyBhIG51bWJlciBmb3IgdGhlIHR5cGVJRCBvZiBvYmplY3QgYmVpbmcgb3V0cHV0LlxuICAgKi9cbiAgZ2V0Q29kZWNJRCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jb2RlY0lEXG4gIH1cblxuICAvL3NvbWV0aW1lcyB0aGUgcGFyZW50IGNsYXNzIG1hbmFnZXMgdGhlIGZpZWxkc1xuICAvL3RoZXNlIGFyZSBzbyB5b3UgY2FuIHNheSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpIFxuICBzZXJpYWxpemUoZW5jb2Rpbmc/OiBTZXJpYWxpemVkRW5jb2RpbmcpOiBvYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICBcIl90eXBlTmFtZVwiOiB0aGlzLl90eXBlTmFtZSxcbiAgICAgIFwiX3R5cGVJRFwiOiAodHlwZW9mIHRoaXMuX3R5cGVJRCA9PT0gXCJ1bmRlZmluZWRcIiA/IG51bGwgOiB0aGlzLl90eXBlSUQpLFxuICAgICAgXCJfY29kZWNJRFwiOiAodHlwZW9mIHRoaXMuX2NvZGVjSUQgPT09IFwidW5kZWZpbmVkXCIgPyBudWxsIDogdGhpcy5fY29kZWNJRClcbiAgICB9XG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nPzogU2VyaWFsaXplZEVuY29kaW5nKSB7XG4gICAgaWYgKHR5cGVvZiBmaWVsZHNbXCJfdHlwZU5hbWVcIl0gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlTmFtZUVycm9yKFwiRXJyb3IgLSBTZXJpYWxpemFibGUuZGVzZXJpYWxpemU6IF90eXBlTmFtZSBtdXN0IGJlIGEgc3RyaW5nLCBmb3VuZDogXCIgKyB0eXBlb2YgZmllbGRzW1wiX3R5cGVOYW1lXCJdKVxuICAgIH1cbiAgICBpZiAoZmllbGRzW1wiX3R5cGVOYW1lXCJdICE9PSB0aGlzLl90eXBlTmFtZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVOYW1lRXJyb3IoXCJFcnJvciAtIFNlcmlhbGl6YWJsZS5kZXNlcmlhbGl6ZTogX3R5cGVOYW1lIG1pc21hdGNoIC0tIGV4cGVjdGVkOiBcIiArIHRoaXMuX3R5cGVOYW1lICsgXCIgLS0gcmVjZWl2ZWQ6IFwiICsgZmllbGRzW1wiX3R5cGVOYW1lXCJdKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGZpZWxkc1tcIl90eXBlSURcIl0gIT09IFwidW5kZWZpbmVkXCIgJiYgZmllbGRzW1wiX3R5cGVJRFwiXSAhPT0gbnVsbCkge1xuICAgICAgaWYgKHR5cGVvZiBmaWVsZHNbXCJfdHlwZUlEXCJdICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlSWRFcnJvcihcIkVycm9yIC0gU2VyaWFsaXphYmxlLmRlc2VyaWFsaXplOiBfdHlwZUlEIG11c3QgYmUgYSBudW1iZXIsIGZvdW5kOiBcIiArIHR5cGVvZiBmaWVsZHNbXCJfdHlwZUlEXCJdKVxuICAgICAgfVxuICAgICAgaWYgKGZpZWxkc1tcIl90eXBlSURcIl0gIT09IHRoaXMuX3R5cGVJRCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUlkRXJyb3IoXCJFcnJvciAtIFNlcmlhbGl6YWJsZS5kZXNlcmlhbGl6ZTogX3R5cGVJRCBtaXNtYXRjaCAtLSBleHBlY3RlZDogXCIgKyB0aGlzLl90eXBlSUQgKyBcIiAtLSByZWNlaXZlZDogXCIgKyBmaWVsZHNbXCJfdHlwZUlEXCJdKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGZpZWxkc1tcIl9jb2RlY0lEXCJdICE9PSBcInVuZGVmaW5lZFwiICYmIGZpZWxkc1tcIl9jb2RlY0lEXCJdICE9PSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIGZpZWxkc1tcIl9jb2RlY0lEXCJdICE9PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHRocm93IG5ldyBDb2RlY0lkRXJyb3IoXCJFcnJvciAtIFNlcmlhbGl6YWJsZS5kZXNlcmlhbGl6ZTogX2NvZGVjSUQgbXVzdCBiZSBhIG51bWJlciwgZm91bmQ6IFwiICsgdHlwZW9mIGZpZWxkc1tcIl9jb2RlY0lEXCJdKVxuICAgICAgfVxuICAgICAgaWYgKGZpZWxkc1tcIl9jb2RlY0lEXCJdICE9PSB0aGlzLl9jb2RlY0lEKSB7XG4gICAgICAgIHRocm93IG5ldyBDb2RlY0lkRXJyb3IoXCJFcnJvciAtIFNlcmlhbGl6YWJsZS5kZXNlcmlhbGl6ZTogX2NvZGVjSUQgbWlzbWF0Y2ggLS0gZXhwZWN0ZWQ6IFwiICsgdGhpcy5fY29kZWNJRCArIFwiIC0tIHJlY2VpdmVkOiBcIiArIGZpZWxkc1tcIl9jb2RlY0lEXCJdKVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgU2VyaWFsaXphdGlvbiB7XG4gIHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBTZXJpYWxpemF0aW9uXG4gIFxuICBwcml2YXRlIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuYmludG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG4gIH1cbiAgcHJpdmF0ZSBiaW50b29sczogQmluVG9vbHNcblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBTZXJpYWxpemF0aW9uIHNpbmdsZXRvbi5cbiAgICovXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBTZXJpYWxpemF0aW9uIHtcbiAgICBpZiAoIVNlcmlhbGl6YXRpb24uaW5zdGFuY2UpIHtcbiAgICAgIFNlcmlhbGl6YXRpb24uaW5zdGFuY2UgPSBuZXcgU2VyaWFsaXphdGlvbigpXG4gICAgfVxuICAgIHJldHVybiBTZXJpYWxpemF0aW9uLmluc3RhbmNlXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB0byBbW1NlcmlhbGl6ZWRUeXBlXV1cbiAgICpcbiAgICogQHBhcmFtIHZiIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqIEBwYXJhbSB0eXBlIFtbU2VyaWFsaXplZFR5cGVdXVxuICAgKiBAcGFyYW0gLi4uYXJncyByZW1haW5pbmcgYXJndW1lbnRzXG4gICAqIEByZXR1cm5zIHR5cGUgb2YgW1tTZXJpYWxpemVkVHlwZV1dXG4gICAqL1xuICBidWZmZXJUb1R5cGUodmI6IEJ1ZmZlciwgdHlwZTogU2VyaWFsaXplZFR5cGUsIC4uLmFyZ3M6IGFueVtdKTogYW55IHtcbiAgICBpZiAodHlwZSA9PT0gXCJCTlwiKSB7XG4gICAgICByZXR1cm4gbmV3IEJOKHZiLnRvU3RyaW5nKFwiaGV4XCIpLCBcImhleFwiKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJCdWZmZXJcIikge1xuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09IDEgJiYgdHlwZW9mIGFyZ3NbMF0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgdmIgPSBCdWZmZXIuZnJvbSh2Yi50b1N0cmluZyhcImhleFwiKS5wYWRTdGFydChhcmdzWzBdICogMiwgXCIwXCIpLCBcImhleFwiKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZiXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImJlY2gzMlwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW50b29scy5hZGRyZXNzVG9TdHJpbmcoYXJnc1swXSwgYXJnc1sxXSwgdmIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcIm5vZGVJRFwiKSB7XG4gICAgICByZXR1cm4gYnVmZmVyVG9Ob2RlSURTdHJpbmcodmIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcInByaXZhdGVLZXlcIikge1xuICAgICAgcmV0dXJuIGJ1ZmZlclRvUHJpdmF0ZUtleVN0cmluZyh2YilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiY2I1OFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW50b29scy5jYjU4RW5jb2RlKHZiKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJiYXNlNThcIikge1xuICAgICAgcmV0dXJuIHRoaXMuYmludG9vbHMuYnVmZmVyVG9CNTgodmIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImJhc2U2NFwiKSB7XG4gICAgICByZXR1cm4gdmIudG9TdHJpbmcoXCJiYXNlNjRcIilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiaGV4XCIpIHtcbiAgICAgIHJldHVybiB2Yi50b1N0cmluZyhcImhleFwiKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJkZWNpbWFsU3RyaW5nXCIpIHtcbiAgICAgIHJldHVybiBuZXcgQk4odmIudG9TdHJpbmcoXCJoZXhcIiksIFwiaGV4XCIpLnRvU3RyaW5nKDEwKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgcmV0dXJuIG5ldyBCTih2Yi50b1N0cmluZyhcImhleFwiKSwgXCJoZXhcIikudG9OdW1iZXIoKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJ1dGY4XCIpIHtcbiAgICAgIHJldHVybiB2Yi50b1N0cmluZyhcInV0ZjhcIilcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgW1tTZXJpYWxpemVkVHlwZV1dIHRvIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqXG4gICAqIEBwYXJhbSB2IHR5cGUgb2YgW1tTZXJpYWxpemVkVHlwZV1dXG4gICAqIEBwYXJhbSB0eXBlIFtbU2VyaWFsaXplZFR5cGVdXVxuICAgKiBAcGFyYW0gLi4uYXJncyByZW1haW5pbmcgYXJndW1lbnRzXG4gICAqIEByZXR1cm5zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICAqL1xuICB0eXBlVG9CdWZmZXIodjogYW55LCB0eXBlOiBTZXJpYWxpemVkVHlwZSwgLi4uYXJnczogYW55W10pOiBCdWZmZXIge1xuICAgIGlmICh0eXBlID09PSBcIkJOXCIpIHtcbiAgICAgIGxldCBzdHI6IHN0cmluZyA9ICh2IGFzIEJOKS50b1N0cmluZyhcImhleFwiKVxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09IDEgJiYgdHlwZW9mIGFyZ3NbMF0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHN0ci5wYWRTdGFydChhcmdzWzBdICogMiwgXCIwXCIpLCBcImhleFwiKVxuICAgICAgfVxuICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHN0ciwgXCJoZXhcIilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiQnVmZmVyXCIpIHtcbiAgICAgIHJldHVybiB2XG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImJlY2gzMlwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW50b29scy5zdHJpbmdUb0FkZHJlc3ModiwgLi4uYXJncylcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwibm9kZUlEXCIpIHtcbiAgICAgIHJldHVybiBOb2RlSURTdHJpbmdUb0J1ZmZlcih2KVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJwcml2YXRlS2V5XCIpIHtcbiAgICAgIHJldHVybiBwcml2YXRlS2V5U3RyaW5nVG9CdWZmZXIodilcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09IFwiY2I1OFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW50b29scy5jYjU4RGVjb2RlKHYpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImJhc2U1OFwiKSB7XG4gICAgICByZXR1cm4gdGhpcy5iaW50b29scy5iNThUb0J1ZmZlcih2KVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJiYXNlNjRcIikge1xuICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHYgYXMgc3RyaW5nLCBcImJhc2U2NFwiKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJoZXhcIikge1xuICAgICAgaWYgKCh2IGFzIHN0cmluZykuc3RhcnRzV2l0aChcIjB4XCIpKSB7XG4gICAgICAgIHYgPSAodiBhcyBzdHJpbmcpLnNsaWNlKDIpXG4gICAgICB9XG4gICAgICByZXR1cm4gQnVmZmVyLmZyb20odiBhcyBzdHJpbmcsIFwiaGV4XCIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcImRlY2ltYWxTdHJpbmdcIikge1xuICAgICAgbGV0IHN0cjogc3RyaW5nID0gbmV3IEJOKHYgYXMgc3RyaW5nLCAxMCkudG9TdHJpbmcoXCJoZXhcIilcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PSAxICYmIHR5cGVvZiBhcmdzWzBdID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIHJldHVybiBCdWZmZXIuZnJvbShzdHIucGFkU3RhcnQoYXJnc1swXSAqIDIsIFwiMFwiKSwgXCJoZXhcIilcbiAgICAgIH1cbiAgICAgIHJldHVybiBCdWZmZXIuZnJvbShzdHIsIFwiaGV4XCIpXG4gICAgfSBlbHNlIGlmICh0eXBlID09PSBcIm51bWJlclwiKSB7XG4gICAgICBsZXQgc3RyOiBzdHJpbmcgPSBuZXcgQk4odiwgMTApLnRvU3RyaW5nKFwiaGV4XCIpXG4gICAgICBpZiAoYXJncy5sZW5ndGggPT0gMSAmJiB0eXBlb2YgYXJnc1swXSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXR1cm4gQnVmZmVyLmZyb20oc3RyLnBhZFN0YXJ0KGFyZ3NbMF0gKiAyLCBcIjBcIiksIFwiaGV4XCIpXG4gICAgICB9XG4gICAgICByZXR1cm4gQnVmZmVyLmZyb20oc3RyLCBcImhleFwiKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJ1dGY4XCIpIHtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PSAxICYmIHR5cGVvZiBhcmdzWzBdID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgIGxldCBiOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoYXJnc1swXSlcbiAgICAgICAgYi53cml0ZSh2KVxuICAgICAgICByZXR1cm4gYlxuICAgICAgfVxuICAgICAgcmV0dXJuIEJ1ZmZlci5mcm9tKHYsIFwidXRmOFwiKVxuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB2YWx1ZSB0byB0eXBlIG9mIFtbU2VyaWFsaXplZFR5cGVdXSBvciBbW1NlcmlhbGl6ZWRFbmNvZGluZ11dXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcGFyYW0gZW5jb2RpbmcgW1tTZXJpYWxpemVkRW5jb2RpbmddXVxuICAgKiBAcGFyYW0gaW50eXBlIFtbU2VyaWFsaXplZFR5cGVdXVxuICAgKiBAcGFyYW0gb3V0dHlwZSBbW1NlcmlhbGl6ZWRUeXBlXV1cbiAgICogQHBhcmFtIC4uLmFyZ3MgcmVtYWluaW5nIGFyZ3VtZW50c1xuICAgKiBAcmV0dXJucyB0eXBlIG9mIFtbU2VyaWFsaXplZFR5cGVdXSBvciBbW1NlcmlhbGl6ZWRFbmNvZGluZ11dXG4gICAqL1xuICBlbmNvZGVyKHZhbHVlOiBhbnksIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcsIGludHlwZTogU2VyaWFsaXplZFR5cGUsIG91dHR5cGU6IFNlcmlhbGl6ZWRUeXBlLCAuLi5hcmdzOiBhbnlbXSk6IGFueSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhyb3cgbmV3IFVua25vd25UeXBlRXJyb3IoXCJFcnJvciAtIFNlcmlhbGl6YWJsZS5lbmNvZGVyOiB2YWx1ZSBwYXNzZWQgaXMgdW5kZWZpbmVkXCIpXG4gICAgfVxuICAgIGlmIChlbmNvZGluZyAhPT0gXCJkaXNwbGF5XCIpIHtcbiAgICAgIG91dHR5cGUgPSBlbmNvZGluZ1xuICAgIH1cbiAgICBjb25zdCB2YjogQnVmZmVyID0gdGhpcy50eXBlVG9CdWZmZXIodmFsdWUsIGludHlwZSwgLi4uYXJncylcbiAgICByZXR1cm4gdGhpcy5idWZmZXJUb1R5cGUodmIsIG91dHR5cGUsIC4uLmFyZ3MpXG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCB2YWx1ZSB0byB0eXBlIG9mIFtbU2VyaWFsaXplZFR5cGVdXSBvciBbW1NlcmlhbGl6ZWRFbmNvZGluZ11dXG4gICAqXG4gICAqIEBwYXJhbSB2YWx1ZVxuICAgKiBAcGFyYW0gZW5jb2RpbmcgW1tTZXJpYWxpemVkRW5jb2RpbmddXVxuICAgKiBAcGFyYW0gaW50eXBlIFtbU2VyaWFsaXplZFR5cGVdXVxuICAgKiBAcGFyYW0gb3V0dHlwZSBbW1NlcmlhbGl6ZWRUeXBlXV1cbiAgICogQHBhcmFtIC4uLmFyZ3MgcmVtYWluaW5nIGFyZ3VtZW50c1xuICAgKiBAcmV0dXJucyB0eXBlIG9mIFtbU2VyaWFsaXplZFR5cGVdXSBvciBbW1NlcmlhbGl6ZWRFbmNvZGluZ11dXG4gICAqL1xuICBkZWNvZGVyKHZhbHVlOiBzdHJpbmcsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcsIGludHlwZTogU2VyaWFsaXplZFR5cGUsIG91dHR5cGU6IFNlcmlhbGl6ZWRUeXBlLCAuLi5hcmdzOiBhbnlbXSk6IGFueSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhyb3cgbmV3IFVua25vd25UeXBlRXJyb3IoXCJFcnJvciAtIFNlcmlhbGl6YWJsZS5kZWNvZGVyOiB2YWx1ZSBwYXNzZWQgaXMgdW5kZWZpbmVkXCIpXG4gICAgfVxuICAgIGlmIChlbmNvZGluZyAhPT0gXCJkaXNwbGF5XCIpIHtcbiAgICAgIGludHlwZSA9IGVuY29kaW5nXG4gICAgfVxuICAgIGNvbnN0IHZiOiBCdWZmZXIgPSB0aGlzLnR5cGVUb0J1ZmZlcih2YWx1ZSwgaW50eXBlLCAuLi5hcmdzKVxuICAgIHJldHVybiB0aGlzLmJ1ZmZlclRvVHlwZSh2Yiwgb3V0dHlwZSwgLi4uYXJncylcbiAgfVxuXG4gIHNlcmlhbGl6ZShzZXJpYWxpemU6IFNlcmlhbGl6YWJsZSwgdm06IHN0cmluZywgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiZGlzcGxheVwiLCBub3Rlczogc3RyaW5nID0gdW5kZWZpbmVkKTogU2VyaWFsaXplZCB7XG4gICAgaWYgKHR5cGVvZiBub3RlcyA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgbm90ZXMgPSBzZXJpYWxpemUuZ2V0VHlwZU5hbWUoKVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgdm0sXG4gICAgICBlbmNvZGluZyxcbiAgICAgIHZlcnNpb246IFNFUklBTElaQVRJT05WRVJTSU9OLFxuICAgICAgbm90ZXMsXG4gICAgICBmaWVsZHM6IHNlcmlhbGl6ZS5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgfVxuICB9XG5cbiAgZGVzZXJpYWxpemUoaW5wdXQ6IFNlcmlhbGl6ZWQsIG91dHB1dDogU2VyaWFsaXphYmxlKSB7XG4gICAgb3V0cHV0LmRlc2VyaWFsaXplKGlucHV0LmZpZWxkcywgaW5wdXQuZW5jb2RpbmcpXG4gIH1cbn0iXX0=