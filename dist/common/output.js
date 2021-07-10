"use strict";
/**
 * @packageDocumentation
 * @module Common-Output
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseNFTOutput = exports.StandardAmountOutput = exports.StandardTransferableOutput = exports.StandardParseableOutput = exports.Output = exports.OutputOwners = exports.Address = void 0;
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const bintools_1 = __importDefault(require("../utils/bintools"));
const nbytes_1 = require("./nbytes");
const helperfunctions_1 = require("../utils/helperfunctions");
const serialization_1 = require("../utils/serialization");
const errors_1 = require("../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Class for representing an address used in [[Output]] types
 */
class Address extends nbytes_1.NBytes {
    /**
     * Class for representing an address used in [[Output]] types
     */
    constructor() {
        super();
        this._typeName = "Address";
        this._typeID = undefined;
        //serialize and deserialize both are inherited
        this.bytes = buffer_1.Buffer.alloc(20);
        this.bsize = 20;
    }
    /**
       * Returns a base-58 representation of the [[Address]].
       */
    toString() {
        return bintools.cb58Encode(this.toBuffer());
    }
    /**
       * Takes a base-58 string containing an [[Address]], parses it, populates the class, and returns the length of the Address in bytes.
       *
       * @param bytes A base-58 string containing a raw [[Address]]
       *
       * @returns The length of the raw [[Address]]
       */
    fromString(addr) {
        const addrbuff = bintools.b58ToBuffer(addr);
        if (addrbuff.length === 24 && bintools.validateChecksum(addrbuff)) {
            const newbuff = bintools.copyFrom(addrbuff, 0, addrbuff.length - 4);
            if (newbuff.length === 20) {
                this.bytes = newbuff;
            }
        }
        else if (addrbuff.length === 24) {
            throw new errors_1.ChecksumError('Error - Address.fromString: invalid checksum on address');
        }
        else if (addrbuff.length === 20) {
            this.bytes = addrbuff;
        }
        else {
            /* istanbul ignore next */
            throw new errors_1.AddressError('Error - Address.fromString: invalid address');
        }
        return this.getSize();
    }
    clone() {
        let newbase = new Address();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new Address();
    }
}
exports.Address = Address;
/**
 * Returns a function used to sort an array of [[Address]]es
 */
Address.comparator = () => (a, b) => buffer_1.Buffer.compare(a.toBuffer(), b.toBuffer());
/**
 * Defines the most basic values for output ownership. Mostly inherited from, but can be used in population of NFT Owner data.
 */
class OutputOwners extends serialization_1.Serializable {
    /**
     * An [[Output]] class which contains addresses, locktimes, and thresholds.
     *
     * @param addresses An array of {@link https://github.com/feross/buffer|Buffer}s representing output owner's addresses
     * @param locktime A {@link https://github.com/indutny/bn.js/|BN} representing the locktime
     * @param threshold A number representing the the threshold number of signers required to sign the transaction
     */
    constructor(addresses = undefined, locktime = undefined, threshold = undefined) {
        super();
        this._typeName = "OutputOwners";
        this._typeID = undefined;
        this.locktime = buffer_1.Buffer.alloc(8);
        this.threshold = buffer_1.Buffer.alloc(4);
        this.numaddrs = buffer_1.Buffer.alloc(4);
        this.addresses = [];
        /**
         * Returns the threshold of signers required to spend this output.
         */
        this.getThreshold = () => this.threshold.readUInt32BE(0);
        /**
         * Returns the a {@link https://github.com/indutny/bn.js/|BN} repersenting the UNIX Timestamp when the lock is made available.
         */
        this.getLocktime = () => bintools.fromBufferToBN(this.locktime);
        /**
         * Returns an array of {@link https://github.com/feross/buffer|Buffer}s for the addresses.
         */
        this.getAddresses = () => {
            const result = [];
            for (let i = 0; i < this.addresses.length; i++) {
                result.push(this.addresses[i].toBuffer());
            }
            return result;
        };
        /**
         * Returns the index of the address.
         *
         * @param address A {@link https://github.com/feross/buffer|Buffer} of the address to look up to return its index.
         *
         * @returns The index of the address.
         */
        this.getAddressIdx = (address) => {
            for (let i = 0; i < this.addresses.length; i++) {
                if (this.addresses[i].toBuffer().toString('hex') === address.toString('hex')) {
                    return i;
                }
            }
            /* istanbul ignore next */
            return -1;
        };
        /**
         * Returns the address from the index provided.
         *
         * @param idx The index of the address.
         *
         * @returns Returns the string representing the address.
         */
        this.getAddress = (idx) => {
            if (idx < this.addresses.length) {
                return this.addresses[idx].toBuffer();
            }
            throw new errors_1.AddressIndexError('Error - Output.getAddress: idx out of range');
        };
        /**
         * Given an array of address {@link https://github.com/feross/buffer|Buffer}s and an optional timestamp, returns true if the addresses meet the threshold required to spend the output.
         */
        this.meetsThreshold = (addresses, asOf = undefined) => {
            let now;
            if (typeof asOf === 'undefined') {
                now = helperfunctions_1.UnixNow();
            }
            else {
                now = asOf;
            }
            const qualified = this.getSpenders(addresses, now);
            const threshold = this.threshold.readUInt32BE(0);
            if (qualified.length >= threshold) {
                return true;
            }
            return false;
        };
        /**
         * Given an array of addresses and an optional timestamp, select an array of address {@link https://github.com/feross/buffer|Buffer}s of qualified spenders for the output.
         */
        this.getSpenders = (addresses, asOf = undefined) => {
            const qualified = [];
            let now;
            if (typeof asOf === 'undefined') {
                now = helperfunctions_1.UnixNow();
            }
            else {
                now = asOf;
            }
            const locktime = bintools.fromBufferToBN(this.locktime);
            if (now.lte(locktime)) { // not unlocked, not spendable
                return qualified;
            }
            const threshold = this.threshold.readUInt32BE(0);
            for (let i = 0; i < this.addresses.length && qualified.length < threshold; i++) {
                for (let j = 0; j < addresses.length && qualified.length < threshold; j++) {
                    if (addresses[j].toString('hex') === this.addresses[i].toBuffer().toString('hex')) {
                        qualified.push(addresses[j]);
                    }
                }
            }
            return qualified;
        };
        if (typeof addresses !== "undefined" && addresses.length) {
            const addrs = [];
            for (let i = 0; i < addresses.length; i++) {
                addrs[i] = new Address();
                addrs[i].fromBuffer(addresses[i]);
            }
            this.addresses = addrs;
            this.addresses.sort(Address.comparator());
            this.numaddrs.writeUInt32BE(this.addresses.length, 0);
        }
        if (typeof threshold !== undefined) {
            this.threshold.writeUInt32BE((threshold || 1), 0);
        }
        if (typeof locktime !== "undefined") {
            this.locktime = bintools.fromBNToBuffer(locktime, 8);
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "locktime": serialization.encoder(this.locktime, encoding, "Buffer", "decimalString", 8), "threshold": serialization.encoder(this.threshold, encoding, "Buffer", "decimalString", 4), "addresses": this.addresses.map((a) => a.serialize(encoding)) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.locktime = serialization.decoder(fields["locktime"], encoding, "decimalString", "Buffer", 8);
        this.threshold = serialization.decoder(fields["threshold"], encoding, "decimalString", "Buffer", 4);
        this.addresses = fields["addresses"].map((a) => {
            let addr = new Address();
            addr.deserialize(a, encoding);
            return addr;
        });
        this.numaddrs = buffer_1.Buffer.alloc(4);
        this.numaddrs.writeUInt32BE(this.addresses.length, 0);
    }
    /**
     * Returns a base-58 string representing the [[Output]].
     */
    fromBuffer(bytes, offset = 0) {
        this.locktime = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.threshold = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.numaddrs = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const numaddrs = this.numaddrs.readUInt32BE(0);
        this.addresses = [];
        for (let i = 0; i < numaddrs; i++) {
            const addr = new Address();
            offset = addr.fromBuffer(bytes, offset);
            this.addresses.push(addr);
        }
        this.addresses.sort(Address.comparator());
        return offset;
    }
    /**
     * Returns the buffer representing the [[Output]] instance.
     */
    toBuffer() {
        this.addresses.sort(Address.comparator());
        this.numaddrs.writeUInt32BE(this.addresses.length, 0);
        let bsize = this.locktime.length + this.threshold.length + this.numaddrs.length;
        const barr = [this.locktime, this.threshold, this.numaddrs];
        for (let i = 0; i < this.addresses.length; i++) {
            const b = this.addresses[i].toBuffer();
            barr.push(b);
            bsize += b.length;
        }
        return buffer_1.Buffer.concat(barr, bsize);
    }
    /**
     * Returns a base-58 string representing the [[Output]].
     */
    toString() {
        return bintools.bufferToB58(this.toBuffer());
    }
}
exports.OutputOwners = OutputOwners;
OutputOwners.comparator = () => (a, b) => {
    const aoutid = buffer_1.Buffer.alloc(4);
    aoutid.writeUInt32BE(a.getOutputID(), 0);
    const abuff = a.toBuffer();
    const boutid = buffer_1.Buffer.alloc(4);
    boutid.writeUInt32BE(b.getOutputID(), 0);
    const bbuff = b.toBuffer();
    const asort = buffer_1.Buffer.concat([aoutid, abuff], aoutid.length + abuff.length);
    const bsort = buffer_1.Buffer.concat([boutid, bbuff], boutid.length + bbuff.length);
    return buffer_1.Buffer.compare(asort, bsort);
};
class Output extends OutputOwners {
    constructor() {
        super(...arguments);
        this._typeName = "Output";
        this._typeID = undefined;
    }
}
exports.Output = Output;
class StandardParseableOutput extends serialization_1.Serializable {
    /**
     * Class representing an [[ParseableOutput]] for a transaction.
     *
     * @param output A number representing the InputID of the [[ParseableOutput]]
     */
    constructor(output = undefined) {
        super();
        this._typeName = "StandardParseableOutput";
        this._typeID = undefined;
        this.getOutput = () => this.output;
        if (output instanceof Output) {
            this.output = output;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "output": this.output.serialize(encoding) });
    }
    toBuffer() {
        const outbuff = this.output.toBuffer();
        const outid = buffer_1.Buffer.alloc(4);
        outid.writeUInt32BE(this.output.getOutputID(), 0);
        const barr = [outid, outbuff];
        return buffer_1.Buffer.concat(barr, outid.length + outbuff.length);
    }
}
exports.StandardParseableOutput = StandardParseableOutput;
/**
 * Returns a function used to sort an array of [[ParseableOutput]]s
 */
StandardParseableOutput.comparator = () => (a, b) => {
    const sorta = a.toBuffer();
    const sortb = b.toBuffer();
    return buffer_1.Buffer.compare(sorta, sortb);
};
class StandardTransferableOutput extends StandardParseableOutput {
    /**
     * Class representing an [[StandardTransferableOutput]] for a transaction.
     *
     * @param assetID A {@link https://github.com/feross/buffer|Buffer} representing the assetID of the [[Output]]
     * @param output A number representing the InputID of the [[StandardTransferableOutput]]
     */
    constructor(assetID = undefined, output = undefined) {
        super(output);
        this._typeName = "StandardTransferableOutput";
        this._typeID = undefined;
        this.assetID = undefined;
        this.getAssetID = () => this.assetID;
        if (typeof assetID !== 'undefined') {
            this.assetID = assetID;
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "assetID": serialization.encoder(this.assetID, encoding, "Buffer", "cb58") });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.assetID = serialization.decoder(fields["assetID"], encoding, "cb58", "Buffer", 32);
    }
    toBuffer() {
        const parseableBuff = super.toBuffer();
        const barr = [this.assetID, parseableBuff];
        return buffer_1.Buffer.concat(barr, this.assetID.length + parseableBuff.length);
    }
}
exports.StandardTransferableOutput = StandardTransferableOutput;
/**
 * An [[Output]] class which specifies a token amount .
 */
class StandardAmountOutput extends Output {
    /**
     * A [[StandardAmountOutput]] class which issues a payment on an assetID.
     *
     * @param amount A {@link https://github.com/indutny/bn.js/|BN} representing the amount in the output
     * @param addresses An array of {@link https://github.com/feross/buffer|Buffer}s representing addresses
     * @param locktime A {@link https://github.com/indutny/bn.js/|BN} representing the locktime
     * @param threshold A number representing the the threshold number of signers required to sign the transaction
     */
    constructor(amount = undefined, addresses = undefined, locktime = undefined, threshold = undefined) {
        super(addresses, locktime, threshold);
        this._typeName = "StandardAmountOutput";
        this._typeID = undefined;
        this.amount = buffer_1.Buffer.alloc(8);
        this.amountValue = new bn_js_1.default(0);
        /**
         * Returns the amount as a {@link https://github.com/indutny/bn.js/|BN}.
         */
        this.getAmount = () => this.amountValue.clone();
        if (typeof amount !== "undefined") {
            this.amountValue = amount.clone();
            this.amount = bintools.fromBNToBuffer(amount, 8);
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "amount": serialization.encoder(this.amount, encoding, "Buffer", "decimalString", 8) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.amount = serialization.decoder(fields["amount"], encoding, "decimalString", "Buffer", 8);
        this.amountValue = bintools.fromBufferToBN(this.amount);
    }
    /**
     * Popuates the instance from a {@link https://github.com/feross/buffer|Buffer} representing the [[StandardAmountOutput]] and returns the size of the output.
     */
    fromBuffer(outbuff, offset = 0) {
        this.amount = bintools.copyFrom(outbuff, offset, offset + 8);
        this.amountValue = bintools.fromBufferToBN(this.amount);
        offset += 8;
        return super.fromBuffer(outbuff, offset);
    }
    /**
     * Returns the buffer representing the [[StandardAmountOutput]] instance.
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        const bsize = this.amount.length + superbuff.length;
        this.numaddrs.writeUInt32BE(this.addresses.length, 0);
        const barr = [this.amount, superbuff];
        return buffer_1.Buffer.concat(barr, bsize);
    }
}
exports.StandardAmountOutput = StandardAmountOutput;
/**
 * An [[Output]] class which specifies an NFT.
 */
class BaseNFTOutput extends Output {
    constructor() {
        super(...arguments);
        this._typeName = "BaseNFTOutput";
        this._typeID = undefined;
        this.groupID = buffer_1.Buffer.alloc(4);
        /**
         * Returns the groupID as a number.
         */
        this.getGroupID = () => {
            return this.groupID.readUInt32BE(0);
        };
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "groupID": serialization.encoder(this.groupID, encoding, "Buffer", "decimalString", 4) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.groupID = serialization.decoder(fields["groupID"], encoding, "decimalString", "Buffer", 4);
    }
}
exports.BaseNFTOutput = BaseNFTOutput;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbW1vbi9vdXRwdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBRUgsb0NBQWdDO0FBQ2hDLGtEQUFzQjtBQUN0QixpRUFBd0M7QUFDeEMscUNBQWlDO0FBQ2pDLDhEQUFrRDtBQUNsRCwwREFBd0Y7QUFDeEYsNENBQWdGO0FBRWhGOztHQUVHO0FBQ0gsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVoRTs7R0FFRztBQUNILE1BQWEsT0FBUSxTQUFRLGVBQU07SUEwRGpDOztPQUVHO0lBQ0g7UUFDRSxLQUFLLEVBQUUsQ0FBQTtRQTdEQyxjQUFTLEdBQUcsU0FBUyxDQUFBO1FBQ3JCLFlBQU8sR0FBRyxTQUFTLENBQUE7UUFFN0IsOENBQThDO1FBRXBDLFVBQUssR0FBRyxlQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1FBQ3hCLFVBQUssR0FBRyxFQUFFLENBQUE7SUF3RHBCLENBQUM7SUEvQ0Q7O1NBRUs7SUFDTCxRQUFRO1FBQ04sT0FBTyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO0lBQzdDLENBQUM7SUFFRDs7Ozs7O1NBTUs7SUFDTCxVQUFVLENBQUMsSUFBVztRQUNwQixNQUFNLFFBQVEsR0FBVyxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBO1FBQ25ELElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxFQUFFLElBQUksUUFBUSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ2pFLE1BQU0sT0FBTyxHQUFXLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxHQUFH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QUUzQzs7V0FFRztRQUNILGVBQVUsR0FBRyxHQUFXLEVBQUU7WUFDeEIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNyQyxDQUFDLENBQUE7SUFDSCxDQUFDO0lBcEJDLFNBQVMsQ0FBQyxXQUE4QixLQUFLO1FBQzNDLElBQUksTUFBTSxHQUFXLEtBQUssQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUE7UUFDOUMsdUNBQ0ssTUFBTSxLQUNULFNBQVMsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsQ0FBQyxDQUFDLElBQ3ZGO0lBQ0gsQ0FBQztJQUNELFdBQVcsQ0FBQyxNQUFjLEVBQUUsV0FBK0IsS0FBSztRQUM5RCxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQTtRQUNuQyxJQUFJLENBQUMsT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ2pHLENBQUM7Q0FVRjtBQXhCRCxzQ0F3QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBDb21tb24tT3V0cHV0XG4gKi9cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLydcbmltcG9ydCBCTiBmcm9tICdibi5qcydcbmltcG9ydCBCaW5Ub29scyBmcm9tICcuLi91dGlscy9iaW50b29scydcbmltcG9ydCB7IE5CeXRlcyB9IGZyb20gJy4vbmJ5dGVzJ1xuaW1wb3J0IHsgVW5peE5vdyB9IGZyb20gJy4uL3V0aWxzL2hlbHBlcmZ1bmN0aW9ucydcbmltcG9ydCB7IFNlcmlhbGl6YWJsZSwgU2VyaWFsaXphdGlvbiwgU2VyaWFsaXplZEVuY29kaW5nIH0gZnJvbSAnLi4vdXRpbHMvc2VyaWFsaXphdGlvbidcbmltcG9ydCB7IENoZWNrc3VtRXJyb3IsIEFkZHJlc3NFcnJvciwgQWRkcmVzc0luZGV4RXJyb3IgfSBmcm9tICcuLi91dGlscy9lcnJvcnMnXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogQ2xhc3MgZm9yIHJlcHJlc2VudGluZyBhbiBhZGRyZXNzIHVzZWQgaW4gW1tPdXRwdXRdXSB0eXBlc1xuICovXG5leHBvcnQgY2xhc3MgQWRkcmVzcyBleHRlbmRzIE5CeXRlcyB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkFkZHJlc3NcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuXG4gIC8vc2VyaWFsaXplIGFuZCBkZXNlcmlhbGl6ZSBib3RoIGFyZSBpbmhlcml0ZWRcblxuICBwcm90ZWN0ZWQgYnl0ZXMgPSBCdWZmZXIuYWxsb2MoMjApXG4gIHByb3RlY3RlZCBic2l6ZSA9IDIwXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBmdW5jdGlvbiB1c2VkIHRvIHNvcnQgYW4gYXJyYXkgb2YgW1tBZGRyZXNzXV1lc1xuICAgKi9cbiAgc3RhdGljIGNvbXBhcmF0b3IgPSAoKVxuICAgICAgOihhOkFkZHJlc3MsIGI6QWRkcmVzcykgPT4gKDF8LTF8MCkgPT4gKGE6QWRkcmVzcywgYjpBZGRyZXNzKVxuICAgICAgICA6ICgxIHwgLTEgfCAwKSA9PiBCdWZmZXIuY29tcGFyZShhLnRvQnVmZmVyKCksIGIudG9CdWZmZXIoKSkgYXMgKDEgfCAtMSB8IDApXG5cbiAgLyoqXG4gICAgICogUmV0dXJucyBhIGJhc2UtNTggcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbQWRkcmVzc11dLlxuICAgICAqL1xuICB0b1N0cmluZygpOnN0cmluZyB7XG4gICAgcmV0dXJuIGJpbnRvb2xzLmNiNThFbmNvZGUodGhpcy50b0J1ZmZlcigpKVxuICB9XG5cbiAgLyoqXG4gICAgICogVGFrZXMgYSBiYXNlLTU4IHN0cmluZyBjb250YWluaW5nIGFuIFtbQWRkcmVzc11dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIEFkZHJlc3MgaW4gYnl0ZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gYnl0ZXMgQSBiYXNlLTU4IHN0cmluZyBjb250YWluaW5nIGEgcmF3IFtbQWRkcmVzc11dXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tBZGRyZXNzXV1cbiAgICAgKi9cbiAgZnJvbVN0cmluZyhhZGRyOnN0cmluZyk6bnVtYmVyIHtcbiAgICBjb25zdCBhZGRyYnVmZjogQnVmZmVyID0gYmludG9vbHMuYjU4VG9CdWZmZXIoYWRkcilcbiAgICBpZiAoYWRkcmJ1ZmYubGVuZ3RoID09PSAyNCAmJiBiaW50b29scy52YWxpZGF0ZUNoZWNrc3VtKGFkZHJidWZmKSkge1xuICAgICAgY29uc3QgbmV3YnVmZjogQnVmZmVyID0gYmludG9vbHMuY29weUZyb20oYWRkcmJ1ZmYsIDAsIGFkZHJidWZmLmxlbmd0aCAtIDQpXG4gICAgICBpZiAobmV3YnVmZi5sZW5ndGggPT09IDIwKSB7XG4gICAgICAgIHRoaXMuYnl0ZXMgPSBuZXdidWZmXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChhZGRyYnVmZi5sZW5ndGggPT09IDI0KSB7XG4gICAgICB0aHJvdyBuZXcgQ2hlY2tzdW1FcnJvcignRXJyb3IgLSBBZGRyZXNzLmZyb21TdHJpbmc6IGludmFsaWQgY2hlY2tzdW0gb24gYWRkcmVzcycpXG4gICAgfSBlbHNlIGlmIChhZGRyYnVmZi5sZW5ndGggPT09IDIwKSB7XG4gICAgICB0aGlzLmJ5dGVzID0gYWRkcmJ1ZmZcbiAgICB9IGVsc2Uge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBBZGRyZXNzRXJyb3IoJ0Vycm9yIC0gQWRkcmVzcy5mcm9tU3RyaW5nOiBpbnZhbGlkIGFkZHJlc3MnKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5nZXRTaXplKClcbiAgfVxuXG4gIGNsb25lKCk6dGhpcyB7XG4gICAgbGV0IG5ld2Jhc2U6IEFkZHJlc3MgPSBuZXcgQWRkcmVzcygpXG4gICAgbmV3YmFzZS5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSlcbiAgICByZXR1cm4gbmV3YmFzZSBhcyB0aGlzXG4gIH1cblxuICBjcmVhdGUoLi4uYXJnczphbnlbXSk6dGhpcyB7XG4gICAgcmV0dXJuIG5ldyBBZGRyZXNzKCkgYXMgdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIENsYXNzIGZvciByZXByZXNlbnRpbmcgYW4gYWRkcmVzcyB1c2VkIGluIFtbT3V0cHV0XV0gdHlwZXNcbiAgICovXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKClcbiAgfVxufVxuXG4gIC8qKlxuICAgKiBEZWZpbmVzIHRoZSBtb3N0IGJhc2ljIHZhbHVlcyBmb3Igb3V0cHV0IG93bmVyc2hpcC4gTW9zdGx5IGluaGVyaXRlZCBmcm9tLCBidXQgY2FuIGJlIHVzZWQgaW4gcG9wdWxhdGlvbiBvZiBORlQgT3duZXIgZGF0YS5cbiAgICovXG5leHBvcnQgY2xhc3MgT3V0cHV0T3duZXJzIGV4dGVuZHMgU2VyaWFsaXphYmxlIHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiT3V0cHV0T3duZXJzXCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6b2JqZWN0IHtcbiAgICBsZXQgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIFwibG9ja3RpbWVcIjogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMubG9ja3RpbWUsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIiwgOCksXG4gICAgICBcInRocmVzaG9sZFwiOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy50aHJlc2hvbGQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIiwgNCksXG4gICAgICBcImFkZHJlc3Nlc1wiOiB0aGlzLmFkZHJlc3Nlcy5tYXAoKGE6IEFkZHJlc3MpOiBvYmplY3QgPT4gYS5zZXJpYWxpemUoZW5jb2RpbmcpKVxuICAgIH1cbiAgfVxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKVxuICAgIHRoaXMubG9ja3RpbWUgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wibG9ja3RpbWVcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJCdWZmZXJcIiwgOClcbiAgICB0aGlzLnRocmVzaG9sZCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJ0aHJlc2hvbGRcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJCdWZmZXJcIiwgNClcbiAgICB0aGlzLmFkZHJlc3NlcyA9IGZpZWxkc1tcImFkZHJlc3Nlc1wiXS5tYXAoKGE6b2JqZWN0KSA9PiB7XG4gICAgICBsZXQgYWRkcjogQWRkcmVzcyA9IG5ldyBBZGRyZXNzKClcbiAgICAgIGFkZHIuZGVzZXJpYWxpemUoYSwgZW5jb2RpbmcpXG4gICAgICByZXR1cm4gYWRkclxuICAgIH0pXG4gICAgdGhpcy5udW1hZGRycyA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIHRoaXMubnVtYWRkcnMud3JpdGVVSW50MzJCRSh0aGlzLmFkZHJlc3Nlcy5sZW5ndGgsIDApXG4gIH1cblxuICBwcm90ZWN0ZWQgbG9ja3RpbWU6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg4KVxuICBwcm90ZWN0ZWQgdGhyZXNob2xkOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgcHJvdGVjdGVkIG51bWFkZHJzOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgcHJvdGVjdGVkIGFkZHJlc3NlczogQWRkcmVzc1tdID0gW11cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdGhyZXNob2xkIG9mIHNpZ25lcnMgcmVxdWlyZWQgdG8gc3BlbmQgdGhpcyBvdXRwdXQuXG4gICAqL1xuICBnZXRUaHJlc2hvbGQgPSAoKTogbnVtYmVyID0+IHRoaXMudGhyZXNob2xkLnJlYWRVSW50MzJCRSgwKVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHJlcGVyc2VudGluZyB0aGUgVU5JWCBUaW1lc3RhbXAgd2hlbiB0aGUgbG9jayBpcyBtYWRlIGF2YWlsYWJsZS5cbiAgICovXG4gIGdldExvY2t0aW1lID0gKCk6IEJOID0+IGJpbnRvb2xzLmZyb21CdWZmZXJUb0JOKHRoaXMubG9ja3RpbWUpXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gYXJyYXkgb2Yge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1zIGZvciB0aGUgYWRkcmVzc2VzLlxuICAgKi9cbiAgZ2V0QWRkcmVzc2VzID0gKCk6IEJ1ZmZlcltdID0+IHtcbiAgICBjb25zdCByZXN1bHQ6IEJ1ZmZlcltdID0gW11cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5hZGRyZXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdC5wdXNoKHRoaXMuYWRkcmVzc2VzW2ldLnRvQnVmZmVyKCkpXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgYWRkcmVzcy5cbiAgICpcbiAgICogQHBhcmFtIGFkZHJlc3MgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvZiB0aGUgYWRkcmVzcyB0byBsb29rIHVwIHRvIHJldHVybiBpdHMgaW5kZXguXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBpbmRleCBvZiB0aGUgYWRkcmVzcy5cbiAgICovXG4gIGdldEFkZHJlc3NJZHggPSAoYWRkcmVzczogQnVmZmVyKTogbnVtYmVyID0+IHtcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5hZGRyZXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh0aGlzLmFkZHJlc3Nlc1tpXS50b0J1ZmZlcigpLnRvU3RyaW5nKCdoZXgnKSA9PT0gYWRkcmVzcy50b1N0cmluZygnaGV4JykpIHtcbiAgICAgICAgcmV0dXJuIGlcbiAgICAgIH1cbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICByZXR1cm4gLTFcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhZGRyZXNzIGZyb20gdGhlIGluZGV4IHByb3ZpZGVkLlxuICAgKlxuICAgKiBAcGFyYW0gaWR4IFRoZSBpbmRleCBvZiB0aGUgYWRkcmVzcy5cbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyB0aGUgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgYWRkcmVzcy5cbiAgICovXG4gIGdldEFkZHJlc3MgPSAoaWR4Om51bWJlcik6QnVmZmVyID0+IHtcbiAgICBpZiAoaWR4IDwgdGhpcy5hZGRyZXNzZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gdGhpcy5hZGRyZXNzZXNbaWR4XS50b0J1ZmZlcigpXG4gICAgfVxuICAgIHRocm93IG5ldyBBZGRyZXNzSW5kZXhFcnJvcignRXJyb3IgLSBPdXRwdXQuZ2V0QWRkcmVzczogaWR4IG91dCBvZiByYW5nZScpXG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYW4gYXJyYXkgb2YgYWRkcmVzcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfXMgYW5kIGFuIG9wdGlvbmFsIHRpbWVzdGFtcCwgcmV0dXJucyB0cnVlIGlmIHRoZSBhZGRyZXNzZXMgbWVldCB0aGUgdGhyZXNob2xkIHJlcXVpcmVkIHRvIHNwZW5kIHRoZSBvdXRwdXQuXG4gICAqL1xuICBtZWV0c1RocmVzaG9sZCA9IChhZGRyZXNzZXM6IEJ1ZmZlcltdLCBhc09mOiBCTiA9IHVuZGVmaW5lZCk6IGJvb2xlYW4gPT4ge1xuICAgIGxldCBub3c6IEJOXG4gICAgaWYgKHR5cGVvZiBhc09mID09PSAndW5kZWZpbmVkJykge1xuICAgICAgbm93ID0gVW5peE5vdygpXG4gICAgfSBlbHNlIHtcbiAgICAgIG5vdyA9IGFzT2ZcbiAgICB9XG4gICAgY29uc3QgcXVhbGlmaWVkOiBCdWZmZXJbXSA9IHRoaXMuZ2V0U3BlbmRlcnMoYWRkcmVzc2VzLCBub3cpXG4gICAgY29uc3QgdGhyZXNob2xkOiBudW1iZXIgPSB0aGlzLnRocmVzaG9sZC5yZWFkVUludDMyQkUoMClcbiAgICBpZiAocXVhbGlmaWVkLmxlbmd0aCA+PSB0aHJlc2hvbGQpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFuZCBhbiBvcHRpb25hbCB0aW1lc3RhbXAsIHNlbGVjdCBhbiBhcnJheSBvZiBhZGRyZXNzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9cyBvZiBxdWFsaWZpZWQgc3BlbmRlcnMgZm9yIHRoZSBvdXRwdXQuXG4gICAqL1xuICBnZXRTcGVuZGVycyA9IChhZGRyZXNzZXM6IEJ1ZmZlcltdLCBhc09mOiBCTiA9IHVuZGVmaW5lZCk6IEJ1ZmZlcltdID0+IHtcbiAgICBjb25zdCBxdWFsaWZpZWQ6IEJ1ZmZlcltdID0gW11cbiAgICBsZXQgbm93OiBCTlxuICAgIGlmICh0eXBlb2YgYXNPZiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG5vdyA9IFVuaXhOb3coKVxuICAgIH0gZWxzZSB7XG4gICAgICBub3cgPSBhc09mXG4gICAgfVxuICAgIGNvbnN0IGxvY2t0aW1lOiBCTiA9IGJpbnRvb2xzLmZyb21CdWZmZXJUb0JOKHRoaXMubG9ja3RpbWUpXG4gICAgaWYgKG5vdy5sdGUobG9ja3RpbWUpKSB7IC8vIG5vdCB1bmxvY2tlZCwgbm90IHNwZW5kYWJsZVxuICAgICAgcmV0dXJuIHF1YWxpZmllZFxuICAgIH1cblxuICAgIGNvbnN0IHRocmVzaG9sZDogbnVtYmVyID0gdGhpcy50aHJlc2hvbGQucmVhZFVJbnQzMkJFKDApXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMuYWRkcmVzc2VzLmxlbmd0aCAmJiBxdWFsaWZpZWQubGVuZ3RoIDwgdGhyZXNob2xkOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGo6IG51bWJlciA9IDA7IGogPCBhZGRyZXNzZXMubGVuZ3RoICYmIHF1YWxpZmllZC5sZW5ndGggPCB0aHJlc2hvbGQ7IGorKykge1xuICAgICAgICBpZiAoYWRkcmVzc2VzW2pdLnRvU3RyaW5nKCdoZXgnKSA9PT0gdGhpcy5hZGRyZXNzZXNbaV0udG9CdWZmZXIoKS50b1N0cmluZygnaGV4JykpIHtcbiAgICAgICAgICBxdWFsaWZpZWQucHVzaChhZGRyZXNzZXNbal0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcXVhbGlmaWVkXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGJhc2UtNTggc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgW1tPdXRwdXRdXS5cbiAgICovXG4gIGZyb21CdWZmZXIoYnl0ZXM6IEJ1ZmZlciwgb2Zmc2V0OiBudW1iZXIgPSAwKTogbnVtYmVyIHtcbiAgICB0aGlzLmxvY2t0aW1lID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOClcbiAgICBvZmZzZXQgKz0gOFxuICAgIHRoaXMudGhyZXNob2xkID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNClcbiAgICBvZmZzZXQgKz0gNFxuICAgIHRoaXMubnVtYWRkcnMgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KVxuICAgIG9mZnNldCArPSA0XG4gICAgY29uc3QgbnVtYWRkcnM6IG51bWJlciA9IHRoaXMubnVtYWRkcnMucmVhZFVJbnQzMkJFKDApXG4gICAgdGhpcy5hZGRyZXNzZXMgPSBbXVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBudW1hZGRyczsgaSsrKSB7XG4gICAgICBjb25zdCBhZGRyOiBBZGRyZXNzID0gbmV3IEFkZHJlc3MoKVxuICAgICAgb2Zmc2V0ID0gYWRkci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgICB0aGlzLmFkZHJlc3Nlcy5wdXNoKGFkZHIpXG4gICAgfVxuICAgIHRoaXMuYWRkcmVzc2VzLnNvcnQoQWRkcmVzcy5jb21wYXJhdG9yKCkpXG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIFtbT3V0cHV0XV0gaW5zdGFuY2UuXG4gICAqL1xuICB0b0J1ZmZlcigpOkJ1ZmZlciB7XG4gICAgdGhpcy5hZGRyZXNzZXMuc29ydChBZGRyZXNzLmNvbXBhcmF0b3IoKSlcbiAgICB0aGlzLm51bWFkZHJzLndyaXRlVUludDMyQkUodGhpcy5hZGRyZXNzZXMubGVuZ3RoLCAwKVxuICAgIGxldCBic2l6ZTogbnVtYmVyID0gdGhpcy5sb2NrdGltZS5sZW5ndGggKyB0aGlzLnRocmVzaG9sZC5sZW5ndGggKyB0aGlzLm51bWFkZHJzLmxlbmd0aFxuICAgIGNvbnN0IGJhcnI6IEJ1ZmZlcltdID0gW3RoaXMubG9ja3RpbWUsIHRoaXMudGhyZXNob2xkLCB0aGlzLm51bWFkZHJzXVxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmFkZHJlc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYjogQnVmZmVyID0gdGhpcy5hZGRyZXNzZXNbaV0udG9CdWZmZXIoKVxuICAgICAgYmFyci5wdXNoKGIpXG4gICAgICBic2l6ZSArPSBiLmxlbmd0aFxuICAgIH1cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYmFzZS01OCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBbW091dHB1dF1dLlxuICAgKi9cbiAgdG9TdHJpbmcoKTpzdHJpbmcge1xuICAgIHJldHVybiBiaW50b29scy5idWZmZXJUb0I1OCh0aGlzLnRvQnVmZmVyKCkpXG4gIH1cblxuICBzdGF0aWMgY29tcGFyYXRvciA9ICgpOihhOk91dHB1dCwgYjpPdXRwdXQpID0+ICgxfC0xfDApID0+IChhOk91dHB1dCwgYjpPdXRwdXQpOigxfC0xfDApID0+IHtcbiAgICBjb25zdCBhb3V0aWQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIGFvdXRpZC53cml0ZVVJbnQzMkJFKGEuZ2V0T3V0cHV0SUQoKSwgMClcbiAgICBjb25zdCBhYnVmZjogQnVmZmVyID0gYS50b0J1ZmZlcigpXG5cbiAgICBjb25zdCBib3V0aWQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIGJvdXRpZC53cml0ZVVJbnQzMkJFKGIuZ2V0T3V0cHV0SUQoKSwgMClcbiAgICBjb25zdCBiYnVmZjogQnVmZmVyID0gYi50b0J1ZmZlcigpXG5cbiAgICBjb25zdCBhc29ydDogQnVmZmVyID0gQnVmZmVyLmNvbmNhdChbYW91dGlkLCBhYnVmZl0sIGFvdXRpZC5sZW5ndGggKyBhYnVmZi5sZW5ndGgpXG4gICAgY29uc3QgYnNvcnQ6IEJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW2JvdXRpZCwgYmJ1ZmZdLCBib3V0aWQubGVuZ3RoICsgYmJ1ZmYubGVuZ3RoKVxuICAgIHJldHVybiBCdWZmZXIuY29tcGFyZShhc29ydCwgYnNvcnQpIGFzICgxIHwgLTEgfCAwKVxuICB9XG5cbiAgLyoqXG4gICAqIEFuIFtbT3V0cHV0XV0gY2xhc3Mgd2hpY2ggY29udGFpbnMgYWRkcmVzc2VzLCBsb2NrdGltZXMsIGFuZCB0aHJlc2hvbGRzLlxuICAgKlxuICAgKiBAcGFyYW0gYWRkcmVzc2VzIEFuIGFycmF5IG9mIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9cyByZXByZXNlbnRpbmcgb3V0cHV0IG93bmVyJ3MgYWRkcmVzc2VzXG4gICAqIEBwYXJhbSBsb2NrdGltZSBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHJlcHJlc2VudGluZyB0aGUgbG9ja3RpbWVcbiAgICogQHBhcmFtIHRocmVzaG9sZCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIHRoZSB0aHJlc2hvbGQgbnVtYmVyIG9mIHNpZ25lcnMgcmVxdWlyZWQgdG8gc2lnbiB0aGUgdHJhbnNhY3Rpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKGFkZHJlc3NlczogQnVmZmVyW10gPSB1bmRlZmluZWQsIGxvY2t0aW1lOiBCTiA9IHVuZGVmaW5lZCwgdGhyZXNob2xkOiBudW1iZXIgPSB1bmRlZmluZWQpIHtcbiAgICBzdXBlcigpXG4gICAgaWYodHlwZW9mIGFkZHJlc3NlcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBhZGRyZXNzZXMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBhZGRyczogQWRkcmVzc1tdID0gW11cbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBhZGRyZXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYWRkcnNbaV0gPSBuZXcgQWRkcmVzcygpXG4gICAgICAgIGFkZHJzW2ldLmZyb21CdWZmZXIoYWRkcmVzc2VzW2ldKVxuICAgICAgfVxuICAgICAgdGhpcy5hZGRyZXNzZXMgPSBhZGRyc1xuICAgICAgdGhpcy5hZGRyZXNzZXMuc29ydChBZGRyZXNzLmNvbXBhcmF0b3IoKSlcbiAgICAgIHRoaXMubnVtYWRkcnMud3JpdGVVSW50MzJCRSh0aGlzLmFkZHJlc3Nlcy5sZW5ndGgsIDApXG4gICAgfVxuICAgIGlmKHR5cGVvZiB0aHJlc2hvbGQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy50aHJlc2hvbGQud3JpdGVVSW50MzJCRSgodGhyZXNob2xkIHx8IDEpLCAwKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGxvY2t0aW1lICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmxvY2t0aW1lID0gYmludG9vbHMuZnJvbUJOVG9CdWZmZXIobG9ja3RpbWUsIDgpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBPdXRwdXQgZXh0ZW5kcyBPdXRwdXRPd25lcnMge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJPdXRwdXRcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuICBcbiAgLy9zZXJpYWxpemUgYW5kIGRlc2VyaWFsaXplIGJvdGggYXJlIGluaGVyaXRlZFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBvdXRwdXRJRCBmb3IgdGhlIG91dHB1dCB3aGljaCB0ZWxscyBwYXJzZXJzIHdoYXQgdHlwZSBpdCBpc1xuICAgKi9cbiAgYWJzdHJhY3QgZ2V0T3V0cHV0SUQoKTogbnVtYmVyXG5cbiAgYWJzdHJhY3QgY2xvbmUoKTogdGhpc1xuXG4gIGFic3RyYWN0IGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXNcblxuICBhYnN0cmFjdCBzZWxlY3QoaWQ6IG51bWJlciwgLi4uYXJnczogYW55W10pOiBPdXRwdXRcblxuICAvKipcbiAgICogXG4gICAqIEBwYXJhbSBhc3NldElEIEFuIGFzc2V0SUQgd2hpY2ggaXMgd3JhcHBlZCBhcm91bmQgdGhlIEJ1ZmZlciBvZiB0aGUgT3V0cHV0XG4gICAqIFxuICAgKiBNdXN0IGJlIGltcGxlbWVudGVkIHRvIHVzZSB0aGUgYXBwcm9wcmlhdGUgVHJhbnNmZXJhYmxlT3V0cHV0IGZvciB0aGUgVk0uXG4gICAqL1xuICBhYnN0cmFjdCBtYWtlVHJhbnNmZXJhYmxlKGFzc2V0SUQ6IEJ1ZmZlcik6IFN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0XG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBTdGFuZGFyZFBhcnNlYWJsZU91dHB1dCBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIlN0YW5kYXJkUGFyc2VhYmxlT3V0cHV0XCJcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB1bmRlZmluZWRcblxuICBzZXJpYWxpemUoZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOiBvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgXCJvdXRwdXRcIjogdGhpcy5vdXRwdXQuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIH1cbiAgfVxuXG4gIHByb3RlY3RlZCBvdXRwdXQ6IE91dHB1dFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgZnVuY3Rpb24gdXNlZCB0byBzb3J0IGFuIGFycmF5IG9mIFtbUGFyc2VhYmxlT3V0cHV0XV1zXG4gICAqL1xuICBzdGF0aWMgY29tcGFyYXRvciA9ICgpOihhOlN0YW5kYXJkUGFyc2VhYmxlT3V0cHV0LCBiOlN0YW5kYXJkUGFyc2VhYmxlT3V0cHV0KSA9PiAoMXwtMXwwKSA9PiAoYTpTdGFuZGFyZFBhcnNlYWJsZU91dHB1dCwgYjpTdGFuZGFyZFBhcnNlYWJsZU91dHB1dCk6KDF8LTF8MCkgPT4ge1xuICAgIGNvbnN0IHNvcnRhID0gYS50b0J1ZmZlcigpXG4gICAgY29uc3Qgc29ydGIgPSBiLnRvQnVmZmVyKClcbiAgICByZXR1cm4gQnVmZmVyLmNvbXBhcmUoc29ydGEsIHNvcnRiKSBhcyAoMSB8IC0xIHwgMClcbiAgfVxuXG4gIGdldE91dHB1dCA9ICgpOiBPdXRwdXQgPT4gdGhpcy5vdXRwdXRcblxuICAvLyBtdXN0IGJlIGltcGxlbWVudGVkIHRvIHNlbGVjdCBvdXRwdXQgdHlwZXMgZm9yIHRoZSBWTSBpbiBxdWVzdGlvblxuICBhYnN0cmFjdCBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldD86IG51bWJlcik6IG51bWJlclxuXG4gIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICBjb25zdCBvdXRidWZmOiBCdWZmZXIgPSB0aGlzLm91dHB1dC50b0J1ZmZlcigpXG4gICAgY29uc3Qgb3V0aWQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuICAgIG91dGlkLndyaXRlVUludDMyQkUodGhpcy5vdXRwdXQuZ2V0T3V0cHV0SUQoKSwgMClcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFtvdXRpZCwgb3V0YnVmZl1cbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBvdXRpZC5sZW5ndGggKyBvdXRidWZmLmxlbmd0aClcbiAgfVxuICBcbiAgLyoqXG4gICAqIENsYXNzIHJlcHJlc2VudGluZyBhbiBbW1BhcnNlYWJsZU91dHB1dF1dIGZvciBhIHRyYW5zYWN0aW9uLlxuICAgKiBcbiAgICogQHBhcmFtIG91dHB1dCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIElucHV0SUQgb2YgdGhlIFtbUGFyc2VhYmxlT3V0cHV0XV1cbiAgICovXG4gIGNvbnN0cnVjdG9yKG91dHB1dDpPdXRwdXQgPSB1bmRlZmluZWQpIHtcbiAgICBzdXBlcigpXG4gICAgaWYgKG91dHB1dCBpbnN0YW5jZW9mIE91dHB1dCkge1xuICAgICAgdGhpcy5vdXRwdXQgPSBvdXRwdXRcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFN0YW5kYXJkVHJhbnNmZXJhYmxlT3V0cHV0IGV4dGVuZHMgU3RhbmRhcmRQYXJzZWFibGVPdXRwdXQge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOm9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBcImFzc2V0SURcIjogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuYXNzZXRJRCwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiY2I1OFwiKVxuICAgIH1cbiAgfVxuICBkZXNlcmlhbGl6ZShmaWVsZHM6b2JqZWN0LCBlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLmFzc2V0SUQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wiYXNzZXRJRFwiXSwgZW5jb2RpbmcsIFwiY2I1OFwiLCBcIkJ1ZmZlclwiLCAzMilcbiAgfVxuXG4gIHByb3RlY3RlZCBhc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWRcblxuICBnZXRBc3NldElEID0gKCk6IEJ1ZmZlciA9PiB0aGlzLmFzc2V0SURcblxuICAvLyBtdXN0IGJlIGltcGxlbWVudGVkIHRvIHNlbGVjdCBvdXRwdXQgdHlwZXMgZm9yIHRoZSBWTSBpbiBxdWVzdGlvblxuICBhYnN0cmFjdCBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldD86IG51bWJlcik6IG51bWJlclxuXG4gIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICBjb25zdCBwYXJzZWFibGVCdWZmOiBCdWZmZXIgPSBzdXBlci50b0J1ZmZlcigpXG4gICAgY29uc3QgYmFycjogQnVmZmVyW10gPSBbdGhpcy5hc3NldElELCBwYXJzZWFibGVCdWZmXVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIsIHRoaXMuYXNzZXRJRC5sZW5ndGggKyBwYXJzZWFibGVCdWZmLmxlbmd0aClcbiAgfVxuXG4gIC8qKlxuICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gW1tTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dF1dIGZvciBhIHRyYW5zYWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0gYXNzZXRJRCBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGluZyB0aGUgYXNzZXRJRCBvZiB0aGUgW1tPdXRwdXRdXVxuICAgKiBAcGFyYW0gb3V0cHV0IEEgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgSW5wdXRJRCBvZiB0aGUgW1tTdGFuZGFyZFRyYW5zZmVyYWJsZU91dHB1dF1dXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihhc3NldElEOkJ1ZmZlciA9IHVuZGVmaW5lZCwgb3V0cHV0Ok91dHB1dCA9IHVuZGVmaW5lZCkge1xuICAgIHN1cGVyKG91dHB1dClcbiAgICBpZiAodHlwZW9mIGFzc2V0SUQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLmFzc2V0SUQgPSBhc3NldElEXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQW4gW1tPdXRwdXRdXSBjbGFzcyB3aGljaCBzcGVjaWZpZXMgYSB0b2tlbiBhbW91bnQgLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgU3RhbmRhcmRBbW91bnRPdXRwdXQgZXh0ZW5kcyBPdXRwdXQge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTdGFuZGFyZEFtb3VudE91dHB1dFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOm9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBcImFtb3VudFwiOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5hbW91bnQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIiwgOClcbiAgICB9XG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOm9iamVjdCwgZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5hbW91bnQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wiYW1vdW50XCJdLCBlbmNvZGluZywgXCJkZWNpbWFsU3RyaW5nXCIsIFwiQnVmZmVyXCIsIDgpXG4gICAgdGhpcy5hbW91bnRWYWx1ZSA9IGJpbnRvb2xzLmZyb21CdWZmZXJUb0JOKHRoaXMuYW1vdW50KVxuICB9XG5cbiAgcHJvdGVjdGVkIGFtb3VudDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDgpXG4gIHByb3RlY3RlZCBhbW91bnRWYWx1ZTogQk4gPSBuZXcgQk4oMClcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgYW1vdW50IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0uXG4gICAqL1xuICBnZXRBbW91bnQgPSAoKTogQk4gPT4gdGhpcy5hbW91bnRWYWx1ZS5jbG9uZSgpXG5cbiAgLyoqXG4gICAqIFBvcHVhdGVzIHRoZSBpbnN0YW5jZSBmcm9tIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50aW5nIHRoZSBbW1N0YW5kYXJkQW1vdW50T3V0cHV0XV0gYW5kIHJldHVybnMgdGhlIHNpemUgb2YgdGhlIG91dHB1dC5cbiAgICovXG4gIGZyb21CdWZmZXIob3V0YnVmZjpCdWZmZXIsIG9mZnNldDpudW1iZXIgPSAwKTpudW1iZXIge1xuICAgIHRoaXMuYW1vdW50ID0gYmludG9vbHMuY29weUZyb20ob3V0YnVmZiwgb2Zmc2V0LCBvZmZzZXQgKyA4KVxuICAgIHRoaXMuYW1vdW50VmFsdWUgPSBiaW50b29scy5mcm9tQnVmZmVyVG9CTih0aGlzLmFtb3VudClcbiAgICBvZmZzZXQgKz0gOFxuICAgIHJldHVybiBzdXBlci5mcm9tQnVmZmVyKG91dGJ1ZmYsIG9mZnNldClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBidWZmZXIgcmVwcmVzZW50aW5nIHRoZSBbW1N0YW5kYXJkQW1vdW50T3V0cHV0XV0gaW5zdGFuY2UuXG4gICAqL1xuICB0b0J1ZmZlcigpOkJ1ZmZlciB7XG4gICAgY29uc3Qgc3VwZXJidWZmOiBCdWZmZXIgPSBzdXBlci50b0J1ZmZlcigpXG4gICAgY29uc3QgYnNpemU6IG51bWJlciA9IHRoaXMuYW1vdW50Lmxlbmd0aCArIHN1cGVyYnVmZi5sZW5ndGhcbiAgICB0aGlzLm51bWFkZHJzLndyaXRlVUludDMyQkUodGhpcy5hZGRyZXNzZXMubGVuZ3RoLCAwKVxuICAgIGNvbnN0IGJhcnI6IEJ1ZmZlcltdID0gW3RoaXMuYW1vdW50LCBzdXBlcmJ1ZmZdXG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpXG4gIH1cblxuICAvKipcbiAgICogQSBbW1N0YW5kYXJkQW1vdW50T3V0cHV0XV0gY2xhc3Mgd2hpY2ggaXNzdWVzIGEgcGF5bWVudCBvbiBhbiBhc3NldElELlxuICAgKlxuICAgKiBAcGFyYW0gYW1vdW50IEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gcmVwcmVzZW50aW5nIHRoZSBhbW91bnQgaW4gdGhlIG91dHB1dFxuICAgKiBAcGFyYW0gYWRkcmVzc2VzIEFuIGFycmF5IG9mIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9cyByZXByZXNlbnRpbmcgYWRkcmVzc2VzXG4gICAqIEBwYXJhbSBsb2NrdGltZSBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHJlcHJlc2VudGluZyB0aGUgbG9ja3RpbWVcbiAgICogQHBhcmFtIHRocmVzaG9sZCBBIG51bWJlciByZXByZXNlbnRpbmcgdGhlIHRoZSB0aHJlc2hvbGQgbnVtYmVyIG9mIHNpZ25lcnMgcmVxdWlyZWQgdG8gc2lnbiB0aGUgdHJhbnNhY3Rpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKGFtb3VudDogQk4gPSB1bmRlZmluZWQsIGFkZHJlc3NlczogQnVmZmVyW10gPSB1bmRlZmluZWQsIGxvY2t0aW1lOiBCTiA9IHVuZGVmaW5lZCwgdGhyZXNob2xkOiBudW1iZXIgPSB1bmRlZmluZWQpIHtcbiAgICBzdXBlcihhZGRyZXNzZXMsIGxvY2t0aW1lLCB0aHJlc2hvbGQpXG4gICAgaWYgKHR5cGVvZiBhbW91bnQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuYW1vdW50VmFsdWUgPSBhbW91bnQuY2xvbmUoKVxuICAgICAgdGhpcy5hbW91bnQgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihhbW91bnQsIDgpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQW4gW1tPdXRwdXRdXSBjbGFzcyB3aGljaCBzcGVjaWZpZXMgYW4gTkZULlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQmFzZU5GVE91dHB1dCBleHRlbmRzIE91dHB1dCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkJhc2VORlRPdXRwdXRcIlxuICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZFxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTpvYmplY3Qge1xuICAgIGxldCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICByZXR1cm4ge1xuICAgICAgLi4uZmllbGRzLFxuICAgICAgXCJncm91cElEXCI6IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLmdyb3VwSUQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIiwgNClcbiAgICB9XG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLmdyb3VwSUQgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wiZ3JvdXBJRFwiXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJ1ZmZlclwiLCA0KVxuICB9XG5cbiAgcHJvdGVjdGVkIGdyb3VwSUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBncm91cElEIGFzIGEgbnVtYmVyLlxuICAgKi9cbiAgZ2V0R3JvdXBJRCA9ICgpOiBudW1iZXIgPT4ge1xuICAgIHJldHVybiB0aGlzLmdyb3VwSUQucmVhZFVJbnQzMkJFKDApXG4gIH1cbn0iXX0=