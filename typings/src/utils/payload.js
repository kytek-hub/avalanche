"use strict";
/**
 * @packageDocumentation
 * @module Utils-Payload
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAGNETPayload = exports.ONIONPayload = exports.IPFSPayload = exports.URLPayload = exports.EMAILPayload = exports.YAMLPayload = exports.JSONPayload = exports.CSVPayload = exports.SVGPayload = exports.ICOPayload = exports.BMPPayload = exports.PNGPayload = exports.JPEGPayload = exports.SECPENCPayload = exports.SECPSIGPayload = exports.NODEIDPayload = exports.CHAINIDPayload = exports.SUBNETIDPayload = exports.NFTIDPayload = exports.UTXOIDPayload = exports.ASSETIDPayload = exports.TXIDPayload = exports.cb58EncodedPayload = exports.CCHAINADDRPayload = exports.PCHAINADDRPayload = exports.XCHAINADDRPayload = exports.ChainAddressPayload = exports.BIGNUMPayload = exports.B64STRPayload = exports.B58STRPayload = exports.HEXSTRPayload = exports.UTF8Payload = exports.BINPayload = exports.PayloadBase = exports.PayloadTypes = void 0;
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("./bintools"));
const bn_js_1 = __importDefault(require("bn.js"));
const errors_1 = require("../utils/errors");
const serialization_1 = require("../utils/serialization");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Class for determining payload types and managing the lookup table.
 */
class PayloadTypes {
    constructor() {
        this.types = [];
        this.types = [
            "BIN", "UTF8", "HEXSTR", "B58STR", "B64STR", "BIGNUM", "XCHAINADDR", "PCHAINADDR", "CCHAINADDR", "TXID",
            "ASSETID", "UTXOID", "NFTID", "SUBNETID", "CHAINID", "NODEID", "SECPSIG", "SECPENC", "JPEG", "PNG",
            "BMP", "ICO", "SVG", "CSV", "JSON", "YAML", "EMAIL", "URL", "IPFS", "ONION", "MAGNET"
        ];
    }
    /**
     * Given an encoded payload buffer returns the payload content (minus typeID).
     */
    getContent(payload) {
        const pl = bintools.copyFrom(payload, 5);
        return pl;
    }
    /**
     * Given an encoded payload buffer returns the payload (with typeID).
     */
    getPayload(payload) {
        const pl = bintools.copyFrom(payload, 4);
        return pl;
    }
    /**
     * Given a payload buffer returns the proper TypeID.
     */
    getTypeID(payload) {
        let offset = 0;
        const size = bintools.copyFrom(payload, offset, 4).readUInt32BE(0);
        offset += 4;
        const typeid = bintools.copyFrom(payload, offset, offset + 1).readUInt8(0);
        return typeid;
    }
    /**
     * Given a type string returns the proper TypeID.
     */
    lookupID(typestr) {
        return this.types.indexOf(typestr);
    }
    /**
     * Given a TypeID returns a string describing the payload type.
     */
    lookupType(value) {
        return this.types[value];
    }
    /**
     * Given a TypeID returns the proper [[PayloadBase]].
     */
    select(typeid, ...args) {
        switch (typeid) {
            case 0:
                return new BINPayload(...args);
            case 1:
                return new UTF8Payload(...args);
            case 2:
                return new HEXSTRPayload(...args);
            case 3:
                return new B58STRPayload(...args);
            case 4:
                return new B64STRPayload(...args);
            case 5:
                return new BIGNUMPayload(...args);
            case 6:
                return new XCHAINADDRPayload(...args);
            case 7:
                return new PCHAINADDRPayload(...args);
            case 8:
                return new CCHAINADDRPayload(...args);
            case 9:
                return new TXIDPayload(...args);
            case 10:
                return new ASSETIDPayload(...args);
            case 11:
                return new UTXOIDPayload(...args);
            case 12:
                return new NFTIDPayload(...args);
            case 13:
                return new SUBNETIDPayload(...args);
            case 14:
                return new CHAINIDPayload(...args);
            case 15:
                return new NODEIDPayload(...args);
            case 16:
                return new SECPSIGPayload(...args);
            case 17:
                return new SECPENCPayload(...args);
            case 18:
                return new JPEGPayload(...args);
            case 19:
                return new PNGPayload(...args);
            case 20:
                return new BMPPayload(...args);
            case 21:
                return new ICOPayload(...args);
            case 22:
                return new SVGPayload(...args);
            case 23:
                return new CSVPayload(...args);
            case 24:
                return new JSONPayload(...args);
            case 25:
                return new YAMLPayload(...args);
            case 26:
                return new EMAILPayload(...args);
            case 27:
                return new URLPayload(...args);
            case 28:
                return new IPFSPayload(...args);
            case 29:
                return new ONIONPayload(...args);
            case 30:
                return new MAGNETPayload(...args);
        }
        throw new errors_1.TypeIdError("Error - PayloadTypes.select: unknown typeid " + typeid);
    }
    /**
     * Given a [[PayloadBase]] which may not be cast properly, returns a properly cast [[PayloadBase]].
     */
    recast(unknowPayload) {
        return this.select(unknowPayload.typeID(), unknowPayload.returnType());
    }
    /**
     * Returns the [[PayloadTypes]] singleton.
     */
    static getInstance() {
        if (!PayloadTypes.instance) {
            PayloadTypes.instance = new PayloadTypes();
        }
        return PayloadTypes.instance;
    }
}
exports.PayloadTypes = PayloadTypes;
/**
 * Base class for payloads.
 */
class PayloadBase {
    constructor() {
        this.payload = buffer_1.Buffer.alloc(0);
        this.typeid = undefined;
    }
    /**
     * Returns the TypeID for the payload.
     */
    typeID() {
        return this.typeid;
    }
    /**
     * Returns the string name for the payload's type.
     */
    typeName() {
        return PayloadTypes.getInstance().lookupType(this.typeid);
    }
    /**
     * Returns the payload content (minus typeID).
     */
    getContent() {
        const pl = bintools.copyFrom(this.payload);
        return pl;
    }
    /**
     * Returns the payload (with typeID).
     */
    getPayload() {
        let typeid = buffer_1.Buffer.alloc(1);
        typeid.writeUInt8(this.typeid, 0);
        const pl = buffer_1.Buffer.concat([typeid, bintools.copyFrom(this.payload)]);
        return pl;
    }
    /**
     * Decodes the payload as a {@link https://github.com/feross/buffer|Buffer} including 4 bytes for the length and TypeID.
     */
    fromBuffer(bytes, offset = 0) {
        let size = bintools.copyFrom(bytes, offset, offset + 4).readUInt32BE(0);
        offset += 4;
        this.typeid = bintools.copyFrom(bytes, offset, offset + 1).readUInt8(0);
        offset += 1;
        this.payload = bintools.copyFrom(bytes, offset, offset + size - 1);
        offset += size - 1;
        return offset;
    }
    /**
     * Encodes the payload as a {@link https://github.com/feross/buffer|Buffer} including 4 bytes for the length and TypeID.
     */
    toBuffer() {
        let sizebuff = buffer_1.Buffer.alloc(4);
        sizebuff.writeUInt32BE(this.payload.length + 1, 0);
        let typebuff = buffer_1.Buffer.alloc(1);
        typebuff.writeUInt8(this.typeid, 0);
        return buffer_1.Buffer.concat([sizebuff, typebuff, this.payload]);
    }
}
exports.PayloadBase = PayloadBase;
/**
 * Class for payloads representing simple binary blobs.
 */
class BINPayload extends PayloadBase {
    /**
     * @param payload Buffer only
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 0;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = bintools.b58ToBuffer(payload);
        }
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the payload.
     */
    returnType() {
        return this.payload;
    }
}
exports.BINPayload = BINPayload;
/**
 * Class for payloads representing UTF8 encoding.
 */
class UTF8Payload extends PayloadBase {
    /**
     * @param payload Buffer utf8 string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 1;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = buffer_1.Buffer.from(payload, "utf8");
        }
    }
    /**
     * Returns a string for the payload.
     */
    returnType() {
        return this.payload.toString("utf8");
    }
}
exports.UTF8Payload = UTF8Payload;
/**
 * Class for payloads representing Hexadecimal encoding.
 */
class HEXSTRPayload extends PayloadBase {
    /**
     * @param payload Buffer or hex string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 2;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            if (payload.startsWith("0x") || !payload.match(/^[0-9A-Fa-f]+$/)) {
                throw new errors_1.HexError("HEXSTRPayload.constructor -- hex string may not start with 0x and must be in /^[0-9A-Fa-f]+$/: " + payload);
            }
            this.payload = buffer_1.Buffer.from(payload, "hex");
        }
    }
    /**
     * Returns a hex string for the payload.
     */
    returnType() {
        return this.payload.toString("hex");
    }
}
exports.HEXSTRPayload = HEXSTRPayload;
/**
 * Class for payloads representing Base58 encoding.
 */
class B58STRPayload extends PayloadBase {
    /**
     * @param payload Buffer or cb58 encoded string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 3;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = bintools.b58ToBuffer(payload);
        }
    }
    /**
     * Returns a base58 string for the payload.
     */
    returnType() {
        return bintools.bufferToB58(this.payload);
    }
}
exports.B58STRPayload = B58STRPayload;
/**
 * Class for payloads representing Base64 encoding.
 */
class B64STRPayload extends PayloadBase {
    /**
     * @param payload Buffer of base64 string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 4;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = buffer_1.Buffer.from(payload, "base64");
        }
    }
    /**
     * Returns a base64 string for the payload.
     */
    returnType() {
        return this.payload.toString("base64");
    }
}
exports.B64STRPayload = B64STRPayload;
/**
 * Class for payloads representing Big Numbers.
 *
 * @param payload Accepts a Buffer, BN, or base64 string
 */
class BIGNUMPayload extends PayloadBase {
    /**
     * @param payload Buffer, BN, or base64 string
     */
    constructor(payload = undefined) {
        super();
        this.typeid = 5;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (payload instanceof bn_js_1.default) {
            this.payload = bintools.fromBNToBuffer(payload);
        }
        else if (typeof payload === "string") {
            this.payload = buffer_1.Buffer.from(payload, "hex");
        }
    }
    /**
     * Returns a {@link https://github.com/indutny/bn.js/|BN} for the payload.
     */
    returnType() {
        return bintools.fromBufferToBN(this.payload);
    }
}
exports.BIGNUMPayload = BIGNUMPayload;
/**
 * Class for payloads representing chain addresses.
 *
 */
class ChainAddressPayload extends PayloadBase {
    /**
     * @param payload Buffer or address string
     */
    constructor(payload = undefined, hrp) {
        super();
        this.typeid = 6;
        this.chainid = "";
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            if (hrp != undefined) {
                this.payload = bintools.stringToAddress(payload, hrp);
            }
            else {
                this.payload = bintools.stringToAddress(payload);
            }
        }
    }
    /**
     * Returns the chainid.
     */
    returnChainID() {
        return this.chainid;
    }
    /**
     * Returns an address string for the payload.
     */
    returnType(hrp) {
        const type = "bech32";
        return serialization.bufferToType(this.payload, type, hrp, this.chainid);
    }
}
exports.ChainAddressPayload = ChainAddressPayload;
/**
 * Class for payloads representing X-Chin addresses.
 */
class XCHAINADDRPayload extends ChainAddressPayload {
    constructor() {
        super(...arguments);
        this.typeid = 6;
        this.chainid = "X";
    }
}
exports.XCHAINADDRPayload = XCHAINADDRPayload;
/**
 * Class for payloads representing P-Chain addresses.
 */
class PCHAINADDRPayload extends ChainAddressPayload {
    constructor() {
        super(...arguments);
        this.typeid = 7;
        this.chainid = "P";
    }
}
exports.PCHAINADDRPayload = PCHAINADDRPayload;
/**
 * Class for payloads representing C-Chain addresses.
 */
class CCHAINADDRPayload extends ChainAddressPayload {
    constructor() {
        super(...arguments);
        this.typeid = 8;
        this.chainid = "C";
    }
}
exports.CCHAINADDRPayload = CCHAINADDRPayload;
/**
 * Class for payloads representing data serialized by bintools.cb58Encode().
 */
class cb58EncodedPayload extends PayloadBase {
    /**
     * Returns a bintools.cb58Encoded string for the payload.
     */
    returnType() {
        return bintools.cb58Encode(this.payload);
    }
    /**
     * @param payload Buffer or cb58 encoded string
     */
    constructor(payload = undefined) {
        super();
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = bintools.cb58Decode(payload);
        }
    }
}
exports.cb58EncodedPayload = cb58EncodedPayload;
/**
 * Class for payloads representing TxIDs.
 */
class TXIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 9;
    }
}
exports.TXIDPayload = TXIDPayload;
/**
 * Class for payloads representing AssetIDs.
 */
class ASSETIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 10;
    }
}
exports.ASSETIDPayload = ASSETIDPayload;
/**
 * Class for payloads representing NODEIDs.
 */
class UTXOIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 11;
    }
}
exports.UTXOIDPayload = UTXOIDPayload;
/**
 * Class for payloads representing NFTIDs (UTXOIDs in an NFT context).
 */
class NFTIDPayload extends UTXOIDPayload {
    constructor() {
        super(...arguments);
        this.typeid = 12;
    }
}
exports.NFTIDPayload = NFTIDPayload;
/**
 * Class for payloads representing SubnetIDs.
 */
class SUBNETIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 13;
    }
}
exports.SUBNETIDPayload = SUBNETIDPayload;
/**
 * Class for payloads representing ChainIDs.
 */
class CHAINIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 14;
    }
}
exports.CHAINIDPayload = CHAINIDPayload;
/**
 * Class for payloads representing NodeIDs.
 */
class NODEIDPayload extends cb58EncodedPayload {
    constructor() {
        super(...arguments);
        this.typeid = 15;
    }
}
exports.NODEIDPayload = NODEIDPayload;
/**
 * Class for payloads representing secp256k1 signatures.
 * convention: secp256k1 signature (130 bytes)
 */
class SECPSIGPayload extends B58STRPayload {
    constructor() {
        super(...arguments);
        this.typeid = 16;
    }
}
exports.SECPSIGPayload = SECPSIGPayload;
/**
 * Class for payloads representing secp256k1 encrypted messages.
 * convention: public key (65 bytes) + secp256k1 encrypted message for that public key
 */
class SECPENCPayload extends B58STRPayload {
    constructor() {
        super(...arguments);
        this.typeid = 17;
    }
}
exports.SECPENCPayload = SECPENCPayload;
/**
 * Class for payloads representing JPEG images.
 */
class JPEGPayload extends BINPayload {
    constructor() {
        super(...arguments);
        this.typeid = 18;
    }
}
exports.JPEGPayload = JPEGPayload;
class PNGPayload extends BINPayload {
    constructor() {
        super(...arguments);
        this.typeid = 19;
    }
}
exports.PNGPayload = PNGPayload;
/**
 * Class for payloads representing BMP images.
 */
class BMPPayload extends BINPayload {
    constructor() {
        super(...arguments);
        this.typeid = 20;
    }
}
exports.BMPPayload = BMPPayload;
/**
 * Class for payloads representing ICO images.
 */
class ICOPayload extends BINPayload {
    constructor() {
        super(...arguments);
        this.typeid = 21;
    }
}
exports.ICOPayload = ICOPayload;
/**
 * Class for payloads representing SVG images.
 */
class SVGPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 22;
    }
}
exports.SVGPayload = SVGPayload;
/**
 * Class for payloads representing CSV files.
 */
class CSVPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 23;
    }
}
exports.CSVPayload = CSVPayload;
/**
 * Class for payloads representing JSON strings.
 */
class JSONPayload extends PayloadBase {
    constructor(payload = undefined) {
        super();
        this.typeid = 24;
        if (payload instanceof buffer_1.Buffer) {
            this.payload = payload;
        }
        else if (typeof payload === "string") {
            this.payload = buffer_1.Buffer.from(payload, "utf8");
        }
        else if (payload) {
            let jsonstr = JSON.stringify(payload);
            this.payload = buffer_1.Buffer.from(jsonstr, "utf8");
        }
    }
    /**
     * Returns a JSON-decoded object for the payload.
     */
    returnType() {
        return JSON.parse(this.payload.toString("utf8"));
    }
}
exports.JSONPayload = JSONPayload;
/**
 * Class for payloads representing YAML definitions.
 */
class YAMLPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 25;
    }
}
exports.YAMLPayload = YAMLPayload;
/**
 * Class for payloads representing email addresses.
 */
class EMAILPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 26;
    }
}
exports.EMAILPayload = EMAILPayload;
/**
 * Class for payloads representing URL strings.
 */
class URLPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 27;
    }
}
exports.URLPayload = URLPayload;
/**
 * Class for payloads representing IPFS addresses.
 */
class IPFSPayload extends B58STRPayload {
    constructor() {
        super(...arguments);
        this.typeid = 28;
    }
}
exports.IPFSPayload = IPFSPayload;
/**
 * Class for payloads representing onion URLs.
 */
class ONIONPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 29;
    }
}
exports.ONIONPayload = ONIONPayload;
/**
 * Class for payloads representing torrent magnet links.
 */
class MAGNETPayload extends UTF8Payload {
    constructor() {
        super(...arguments);
        this.typeid = 30;
    }
}
exports.MAGNETPayload = MAGNETPayload;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF5bG9hZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy91dGlscy9wYXlsb2FkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7O0dBR0c7Ozs7OztBQUVILG9DQUFpQztBQUNqQywwREFBbUM7QUFDbkMsa0RBQXVCO0FBQ3ZCLDRDQUF3RDtBQUN4RCwwREFBc0U7QUFFdEU7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBRWhFOztHQUVHO0FBQ0gsTUFBYSxZQUFZO0lBc0lyQjtRQXBJUSxVQUFLLEdBQWEsRUFBRSxDQUFDO1FBcUl6QixJQUFJLENBQUMsS0FBSyxHQUFHO1lBQ1QsS0FBSyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxZQUFZLEVBQUUsTUFBTTtZQUN2RyxTQUFTLEVBQUUsUUFBUSxFQUFHLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxLQUFLO1lBQ25HLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxRQUFRO1NBQ3hGLENBQUM7SUFDTixDQUFDO0lBeElEOztPQUVHO0lBQ0gsVUFBVSxDQUFDLE9BQWM7UUFDckIsTUFBTSxFQUFFLEdBQVcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDakQsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxVQUFVLENBQUMsT0FBYztRQUNyQixNQUFNLEVBQUUs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RDs7R0FFRztBQUNILE1BQWEsWUFBYSxTQUFRLFdBQVc7SUFBN0M7O1FBQ2MsV0FBTSxHQUFHLEVBQUUsQ0FBQztJQUMxQixDQUFDO0NBQUE7QUFGRCxvQ0FFQztBQUVEOztHQUVHO0FBQ0gsTUFBYSxVQUFXLFNBQVEsV0FBVztJQUEzQzs7UUFDYyxXQUFNLEdBQUcsRUFBRSxDQUFDO0lBQzFCLENBQUM7Q0FBQTtBQUZELGdDQUVDO0FBRUQ7O0dBRUc7QUFDSCxNQUFhLFdBQVksU0FBUSxhQUFhO0lBQTlDOztRQUNjLFdBQU0sR0FBRyxFQUFFLENBQUM7SUFDMUIsQ0FBQztDQUFBO0FBRkQsa0NBRUM7QUFFRDs7R0FFRztBQUNILE1BQWEsWUFBYSxTQUFRLFdBQVc7SUFBN0M7O1FBQ2MsV0FBTSxHQUFHLEVBQUUsQ0FBQztJQUMxQixDQUFDO0NBQUE7QUFGRCxvQ0FFQztBQUVEOztHQUVHO0FBQ0gsTUFBYSxhQUFjLFNBQVEsV0FBVztJQUE5Qzs7UUFDYyxXQUFNLEdBQUcsRUFBRSxDQUFDO0lBQzFCLENBQUM7Q0FBQTtBQUZELHNDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgVXRpbHMtUGF5bG9hZFxuICovXG5cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCI7XG5pbXBvcnQgQmluVG9vbHMgIGZyb20gJy4vYmludG9vbHMnO1xuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiO1xuaW1wb3J0IHsgVHlwZUlkRXJyb3IsIEhleEVycm9yIH0gZnJvbSAnLi4vdXRpbHMvZXJyb3JzJztcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRUeXBlIH0gZnJvbSAnLi4vdXRpbHMvc2VyaWFsaXphdGlvbidcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcblxuLyoqXG4gKiBDbGFzcyBmb3IgZGV0ZXJtaW5pbmcgcGF5bG9hZCB0eXBlcyBhbmQgbWFuYWdpbmcgdGhlIGxvb2t1cCB0YWJsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFBheWxvYWRUeXBlcyB7XG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IFBheWxvYWRUeXBlcztcbiAgcHJvdGVjdGVkIHR5cGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYW4gZW5jb2RlZCBwYXlsb2FkIGJ1ZmZlciByZXR1cm5zIHRoZSBwYXlsb2FkIGNvbnRlbnQgKG1pbnVzIHR5cGVJRCkuXG4gICAgICovXG4gICAgZ2V0Q29udGVudChwYXlsb2FkOkJ1ZmZlcik6QnVmZmVyIHtcbiAgICAgICAgY29uc3QgcGw6IEJ1ZmZlciA9IGJpbnRvb2xzLmNvcHlGcm9tKHBheWxvYWQsIDUpO1xuICAgICAgICByZXR1cm4gcGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYW4gZW5jb2RlZCBwYXlsb2FkIGJ1ZmZlciByZXR1cm5zIHRoZSBwYXlsb2FkICh3aXRoIHR5cGVJRCkuXG4gICAgICovXG4gICAgZ2V0UGF5bG9hZChwYXlsb2FkOkJ1ZmZlcik6QnVmZmVyIHtcbiAgICAgICAgY29uc3QgcGw6IEJ1ZmZlciA9IGJpbnRvb2xzLmNvcHlGcm9tKHBheWxvYWQsIDQpO1xuICAgICAgICByZXR1cm4gcGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYSBwYXlsb2FkIGJ1ZmZlciByZXR1cm5zIHRoZSBwcm9wZXIgVHlwZUlELlxuICAgICAqL1xuICAgIGdldFR5cGVJRChwYXlsb2FkOkJ1ZmZlcik6bnVtYmVyIHtcbiAgICAgICAgbGV0IG9mZnNldDpudW1iZXIgPSAwO1xuICAgICAgICBjb25zdCBzaXplOm51bWJlciA9IGJpbnRvb2xzLmNvcHlGcm9tKHBheWxvYWQsIG9mZnNldCwgNCkucmVhZFVJbnQzMkJFKDApO1xuICAgICAgICBvZmZzZXQgKz0gNDtcbiAgICAgICAgY29uc3QgdHlwZWlkOm51bWJlciA9IGJpbnRvb2xzLmNvcHlGcm9tKHBheWxvYWQsIG9mZnNldCwgb2Zmc2V0ICsgMSkucmVhZFVJbnQ4KDApO1xuICAgICAgICByZXR1cm4gdHlwZWlkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgdHlwZSBzdHJpbmcgcmV0dXJucyB0aGUgcHJvcGVyIFR5cGVJRC5cbiAgICAgKi9cbiAgICBsb29rdXBJRCh0eXBlc3RyOnN0cmluZyk6bnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZXMuaW5kZXhPZih0eXBlc3RyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHaXZlbiBhIFR5cGVJRCByZXR1cm5zIGEgc3RyaW5nIGRlc2NyaWJpbmcgdGhlIHBheWxvYWQgdHlwZS5cbiAgICAgKi9cbiAgICBsb29rdXBUeXBlKHZhbHVlOm51bWJlcik6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZXNbdmFsdWVdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdpdmVuIGEgVHlwZUlEIHJldHVybnMgdGhlIHByb3BlciBbW1BheWxvYWRCYXNlXV0uXG4gICAgICovXG4gIHNlbGVjdCh0eXBlaWQ6IG51bWJlciwgLi4uYXJnczogYW55W10pOiBQYXlsb2FkQmFzZSB7XG4gICAgICAgIHN3aXRjaCh0eXBlaWQpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJJTlBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVVEY4UGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEhFWFNUUlBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCNThTVFJQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQjY0U1RSUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJJR05VTVBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDY6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBYQ0hBSU5BRERSUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFBDSEFJTkFERFJQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSA4OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ0NIQUlOQUREUlBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUWElEUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBBU1NFVElEUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgMTE6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBVVFhPSURQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE5GVElEUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTVUJORVRJRFBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQ0hBSU5JRFBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTk9ERUlEUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTRUNQU0lHUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgMTc6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTRUNQRU5DUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgMTg6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBKUEVHUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgMTk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQTkdQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAyMDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJNUFBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDIxOlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgSUNPUGF5bG9hZCguLi5hcmdzKTtcbiAgICAgICAgICAgIGNhc2UgMjI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBTVkdQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAyMzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IENTVlBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDI0OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgSlNPTlBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDI1OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgWUFNTFBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDI2OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRU1BSUxQYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFVSTFBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDI4OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgSVBGU1BheWxvYWQoLi4uYXJncyk7XG4gICAgICAgICAgICBjYXNlIDI5OlxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgT05JT05QYXlsb2FkKC4uLmFyZ3MpO1xuICAgICAgICAgICAgY2FzZSAzMDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE1BR05FVFBheWxvYWQoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IFR5cGVJZEVycm9yKFwiRXJyb3IgLSBQYXlsb2FkVHlwZXMuc2VsZWN0OiB1bmtub3duIHR5cGVpZCBcIiArIHR5cGVpZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogR2l2ZW4gYSBbW1BheWxvYWRCYXNlXV0gd2hpY2ggbWF5IG5vdCBiZSBjYXN0IHByb3Blcmx5LCByZXR1cm5zIGEgcHJvcGVybHkgY2FzdCBbW1BheWxvYWRCYXNlXV0uXG4gICAgICovXG4gICAgcmVjYXN0KHVua25vd1BheWxvYWQ6UGF5bG9hZEJhc2UpOlBheWxvYWRCYXNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0KHVua25vd1BheWxvYWQudHlwZUlEKCksIHVua25vd1BheWxvYWQucmV0dXJuVHlwZSgpKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBbW1BheWxvYWRUeXBlc11dIHNpbmdsZXRvbi5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2V0SW5zdGFuY2UoKTogUGF5bG9hZFR5cGVzIHtcbiAgICAgICAgaWYgKCFQYXlsb2FkVHlwZXMuaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIFBheWxvYWRUeXBlcy5pbnN0YW5jZSA9IG5ldyBQYXlsb2FkVHlwZXMoKTtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICByZXR1cm4gUGF5bG9hZFR5cGVzLmluc3RhbmNlO1xuICAgICAgfVxuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy50eXBlcyA9IFtcbiAgICAgICAgICAgIFwiQklOXCIsIFwiVVRGOFwiLCBcIkhFWFNUUlwiLCBcIkI1OFNUUlwiLCBcIkI2NFNUUlwiLCBcIkJJR05VTVwiLCBcIlhDSEFJTkFERFJcIiwgXCJQQ0hBSU5BRERSXCIsIFwiQ0NIQUlOQUREUlwiLCBcIlRYSURcIiwgXG4gICAgICAgICAgICBcIkFTU0VUSURcIiwgXCJVVFhPSURcIiwgIFwiTkZUSURcIiwgXCJTVUJORVRJRFwiLCBcIkNIQUlOSURcIiwgXCJOT0RFSURcIiwgXCJTRUNQU0lHXCIsIFwiU0VDUEVOQ1wiLCBcIkpQRUdcIiwgXCJQTkdcIiwgXG4gICAgICAgICAgICBcIkJNUFwiLCBcIklDT1wiLCBcIlNWR1wiLCBcIkNTVlwiLCBcIkpTT05cIiwgXCJZQU1MXCIsIFwiRU1BSUxcIiwgXCJVUkxcIiwgXCJJUEZTXCIsIFwiT05JT05cIiwgXCJNQUdORVRcIlxuICAgICAgICBdO1xuICAgIH1cbn1cblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBwYXlsb2Fkcy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFBheWxvYWRCYXNlICB7XG4gICAgcHJvdGVjdGVkIHBheWxvYWQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDApO1xuICAgIHByb3RlY3RlZCB0eXBlaWQ6bnVtYmVyID0gdW5kZWZpbmVkO1xuICAgIFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIFR5cGVJRCBmb3IgdGhlIHBheWxvYWQuXG4gICAgICovXG4gICAgdHlwZUlEKCk6bnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHlwZWlkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHN0cmluZyBuYW1lIGZvciB0aGUgcGF5bG9hZCdzIHR5cGUuXG4gICAgICovXG4gICAgdHlwZU5hbWUoKTpzdHJpbmcge1xuICAgICAgICByZXR1cm4gUGF5bG9hZFR5cGVzLmdldEluc3RhbmNlKCkubG9va3VwVHlwZSh0aGlzLnR5cGVpZCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgcGF5bG9hZCBjb250ZW50IChtaW51cyB0eXBlSUQpLlxuICAgICAqL1xuICAgIGdldENvbnRlbnQoKTpCdWZmZXIge1xuICAgICAgICBjb25zdCBwbDogQnVmZmVyID0gYmludG9vbHMuY29weUZyb20odGhpcy5wYXlsb2FkKTtcbiAgICAgICAgcmV0dXJuIHBsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIHBheWxvYWQgKHdpdGggdHlwZUlEKS5cbiAgICAgKi9cbiAgICBnZXRQYXlsb2FkKCk6QnVmZmVyIHtcbiAgICAgICAgbGV0IHR5cGVpZDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMSk7XG4gICAgICAgIHR5cGVpZC53cml0ZVVJbnQ4KHRoaXMudHlwZWlkLCAwKTtcbiAgICAgICAgY29uc3QgcGw6IEJ1ZmZlciA9IEJ1ZmZlci5jb25jYXQoW3R5cGVpZCwgYmludG9vbHMuY29weUZyb20odGhpcy5wYXlsb2FkKV0pO1xuICAgICAgICByZXR1cm4gcGw7IFxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlY29kZXMgdGhlIHBheWxvYWQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBpbmNsdWRpbmcgNCBieXRlcyBmb3IgdGhlIGxlbmd0aCBhbmQgVHlwZUlELlxuICAgICAqL1xuICAgIGZyb21CdWZmZXIoYnl0ZXM6QnVmZmVyLCBvZmZzZXQ6bnVtYmVyID0gMCk6bnVtYmVyIHtcbiAgICAgICAgbGV0IHNpemU6bnVtYmVyID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgNCkucmVhZFVJbnQzMkJFKDApO1xuICAgICAgICBvZmZzZXQgKz0gNDtcbiAgICAgICAgdGhpcy50eXBlaWQgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAxKS5yZWFkVUludDgoMCk7XG4gICAgICAgIG9mZnNldCArPSAxXG4gICAgICAgIHRoaXMucGF5bG9hZCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIHNpemUgLSAxKTtcbiAgICAgICAgb2Zmc2V0ICs9IHNpemUtMVxuICAgICAgICByZXR1cm4gb2Zmc2V0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEVuY29kZXMgdGhlIHBheWxvYWQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBpbmNsdWRpbmcgNCBieXRlcyBmb3IgdGhlIGxlbmd0aCBhbmQgVHlwZUlELlxuICAgICAqL1xuICAgIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICAgICAgbGV0IHNpemVidWZmOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICAgICAgc2l6ZWJ1ZmYud3JpdGVVSW50MzJCRSh0aGlzLnBheWxvYWQubGVuZ3RoICsgMSwgMCk7XG4gICAgICAgIGxldCB0eXBlYnVmZjpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMSk7XG4gICAgICAgIHR5cGVidWZmLndyaXRlVUludDgodGhpcy50eXBlaWQsIDApO1xuICAgICAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChbc2l6ZWJ1ZmYsIHR5cGVidWZmLCB0aGlzLnBheWxvYWRdKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBleHBlY3RlZCB0eXBlIGZvciB0aGUgcGF5bG9hZC5cbiAgICAgKi9cbiAgICBhYnN0cmFjdCByZXR1cm5UeXBlKC4uLmFyZ3M6YW55KTphbnk7XG5cbiAgICBjb25zdHJ1Y3Rvcigpe31cblxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgc2ltcGxlIGJpbmFyeSBibG9icy5cbiAqL1xuZXhwb3J0IGNsYXNzIEJJTlBheWxvYWQgZXh0ZW5kcyBQYXlsb2FkQmFzZSB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDA7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gZm9yIHRoZSBwYXlsb2FkLlxuICAgICAqL1xuICAgIHJldHVyblR5cGUoKTpCdWZmZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXlsb2FkO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gcGF5bG9hZCBCdWZmZXIgb25seVxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHBheWxvYWQ6YW55ID0gdW5kZWZpbmVkKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYocGF5bG9hZCBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgICAgICAgdGhpcy5wYXlsb2FkID0gcGF5bG9hZDtcbiAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiBwYXlsb2FkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBiaW50b29scy5iNThUb0J1ZmZlcihwYXlsb2FkKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIFVURjggZW5jb2RpbmcuXG4gKi9cbmV4cG9ydCBjbGFzcyBVVEY4UGF5bG9hZCBleHRlbmRzIFBheWxvYWRCYXNlIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBzdHJpbmcgZm9yIHRoZSBwYXlsb2FkLlxuICAgICAqL1xuICAgIHJldHVyblR5cGUoKTpzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXlsb2FkLnRvU3RyaW5nKFwidXRmOFwiKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHBheWxvYWQgQnVmZmVyIHV0Zjggc3RyaW5nXG4gICAgICovXG4gICAgY29uc3RydWN0b3IocGF5bG9hZDphbnkgPSB1bmRlZmluZWQpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBpZihwYXlsb2FkIGluc3RhbmNlb2YgQnVmZmVyKXtcbiAgICAgICAgICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWQ7XG4gICAgICAgIH0gZWxzZSBpZih0eXBlb2YgcGF5bG9hZCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhpcy5wYXlsb2FkID0gQnVmZmVyLmZyb20ocGF5bG9hZCwgXCJ1dGY4XCIpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgSGV4YWRlY2ltYWwgZW5jb2RpbmcuXG4gKi9cbmV4cG9ydCBjbGFzcyBIRVhTVFJQYXlsb2FkIGV4dGVuZHMgUGF5bG9hZEJhc2Uge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAyO1xuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIGhleCBzdHJpbmcgZm9yIHRoZSBwYXlsb2FkLlxuICAgICAqL1xuICAgIHJldHVyblR5cGUoKTpzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXlsb2FkLnRvU3RyaW5nKFwiaGV4XCIpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gcGF5bG9hZCBCdWZmZXIgb3IgaGV4IHN0cmluZ1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHBheWxvYWQ6YW55ID0gdW5kZWZpbmVkKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYocGF5bG9hZCBpbnN0YW5jZW9mIEJ1ZmZlcil7XG4gICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBwYXlsb2FkO1xuICAgICAgICB9IGVsc2UgaWYodHlwZW9mIHBheWxvYWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGlmKHBheWxvYWQuc3RhcnRzV2l0aChcIjB4XCIpIHx8IXBheWxvYWQubWF0Y2goL15bMC05QS1GYS1mXSskLykgKXtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgSGV4RXJyb3IoXCJIRVhTVFJQYXlsb2FkLmNvbnN0cnVjdG9yIC0tIGhleCBzdHJpbmcgbWF5IG5vdCBzdGFydCB3aXRoIDB4IGFuZCBtdXN0IGJlIGluIC9eWzAtOUEtRmEtZl0rJC86IFwiICsgcGF5bG9hZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBCdWZmZXIuZnJvbShwYXlsb2FkLCBcImhleFwiKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEJhc2U1OCBlbmNvZGluZy5cbiAqL1xuZXhwb3J0IGNsYXNzIEI1OFNUUlBheWxvYWQgZXh0ZW5kcyBQYXlsb2FkQmFzZSB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDM7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGEgYmFzZTU4IHN0cmluZyBmb3IgdGhlIHBheWxvYWQuXG4gICAgICovXG4gICAgcmV0dXJuVHlwZSgpOnN0cmluZyB7XG4gICAgICAgIHJldHVybiBiaW50b29scy5idWZmZXJUb0I1OCh0aGlzLnBheWxvYWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gcGF5bG9hZCBCdWZmZXIgb3IgY2I1OCBlbmNvZGVkIHN0cmluZ1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHBheWxvYWQ6YW55ID0gdW5kZWZpbmVkKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYocGF5bG9hZCBpbnN0YW5jZW9mIEJ1ZmZlcil7XG4gICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBwYXlsb2FkO1xuICAgICAgICB9IGVsc2UgaWYodHlwZW9mIHBheWxvYWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMucGF5bG9hZCA9IGJpbnRvb2xzLmI1OFRvQnVmZmVyKHBheWxvYWQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgQmFzZTY0IGVuY29kaW5nLlxuICovXG5leHBvcnQgY2xhc3MgQjY0U1RSUGF5bG9hZCBleHRlbmRzIFBheWxvYWRCYXNlIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gNDtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBiYXNlNjQgc3RyaW5nIGZvciB0aGUgcGF5bG9hZC5cbiAgICAgKi9cbiAgICByZXR1cm5UeXBlKCk6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGF5bG9hZC50b1N0cmluZyhcImJhc2U2NFwiKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHBheWxvYWQgQnVmZmVyIG9mIGJhc2U2NCBzdHJpbmdcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihwYXlsb2FkOmFueSA9IHVuZGVmaW5lZCl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmKHBheWxvYWQgaW5zdGFuY2VvZiBCdWZmZXIpe1xuICAgICAgICAgICAgdGhpcy5wYXlsb2FkID0gcGF5bG9hZDtcbiAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiBwYXlsb2FkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBCdWZmZXIuZnJvbShwYXlsb2FkLCBcImJhc2U2NFwiKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEJpZyBOdW1iZXJzLlxuICogXG4gKiBAcGFyYW0gcGF5bG9hZCBBY2NlcHRzIGEgQnVmZmVyLCBCTiwgb3IgYmFzZTY0IHN0cmluZ1xuICovXG5leHBvcnQgY2xhc3MgQklHTlVNUGF5bG9hZCBleHRlbmRzIFBheWxvYWRCYXNlIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gNTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBmb3IgdGhlIHBheWxvYWQuXG4gICAgICovXG4gICAgcmV0dXJuVHlwZSgpOkJOIHtcbiAgICAgICAgcmV0dXJuIGJpbnRvb2xzLmZyb21CdWZmZXJUb0JOKHRoaXMucGF5bG9hZCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBwYXlsb2FkIEJ1ZmZlciwgQk4sIG9yIGJhc2U2NCBzdHJpbmdcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihwYXlsb2FkOmFueSA9IHVuZGVmaW5lZCl7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGlmKHBheWxvYWQgaW5zdGFuY2VvZiBCdWZmZXIpe1xuICAgICAgICAgICAgdGhpcy5wYXlsb2FkID0gcGF5bG9hZDtcbiAgICAgICAgfSBlbHNlIGlmIChwYXlsb2FkIGluc3RhbmNlb2YgQk4pIHtcbiAgICAgICAgICAgIHRoaXMucGF5bG9hZCA9IGJpbnRvb2xzLmZyb21CTlRvQnVmZmVyKHBheWxvYWQpO1xuICAgICAgICB9IGVsc2UgaWYodHlwZW9mIHBheWxvYWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMucGF5bG9hZCA9IEJ1ZmZlci5mcm9tKHBheWxvYWQsIFwiaGV4XCIpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgY2hhaW4gYWRkcmVzc2VzLlxuICogXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDaGFpbkFkZHJlc3NQYXlsb2FkIGV4dGVuZHMgUGF5bG9hZEJhc2Uge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSA2O1xuICAgIHByb3RlY3RlZCBjaGFpbmlkOnN0cmluZyA9IFwiXCI7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjaGFpbmlkLlxuICAgICAqL1xuICAgIHJldHVybkNoYWluSUQoKTpzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5jaGFpbmlkO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gYWRkcmVzcyBzdHJpbmcgZm9yIHRoZSBwYXlsb2FkLlxuICAgICAqL1xuICAgIHJldHVyblR5cGUoaHJwOnN0cmluZyk6c3RyaW5nIHtcbiAgICAgIGNvbnN0IHR5cGU6IFNlcmlhbGl6ZWRUeXBlID0gXCJiZWNoMzJcIlxuICAgICAgcmV0dXJuIHNlcmlhbGl6YXRpb24uYnVmZmVyVG9UeXBlKHRoaXMucGF5bG9hZCwgdHlwZSwgaHJwLCB0aGlzLmNoYWluaWQpXG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSBwYXlsb2FkIEJ1ZmZlciBvciBhZGRyZXNzIHN0cmluZ1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHBheWxvYWQ6YW55ID0gdW5kZWZpbmVkLCBocnA/OiBzdHJpbmcpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBpZihwYXlsb2FkIGluc3RhbmNlb2YgQnVmZmVyKXtcbiAgICAgICAgICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWQ7XG4gICAgICAgIH0gZWxzZSBpZih0eXBlb2YgcGF5bG9hZCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgaWYoaHJwICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MocGF5bG9hZCwgaHJwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMucGF5bG9hZCA9IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhwYXlsb2FkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIFgtQ2hpbiBhZGRyZXNzZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBYQ0hBSU5BRERSUGF5bG9hZCBleHRlbmRzIENoYWluQWRkcmVzc1BheWxvYWQge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSA2O1xuICAgIHByb3RlY3RlZCBjaGFpbmlkID0gXCJYXCI7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBQLUNoYWluIGFkZHJlc3Nlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFBDSEFJTkFERFJQYXlsb2FkIGV4dGVuZHMgQ2hhaW5BZGRyZXNzUGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDc7XG4gICAgcHJvdGVjdGVkIGNoYWluaWQgPSBcIlBcIjtcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEMtQ2hhaW4gYWRkcmVzc2VzLlxuICovXG5leHBvcnQgY2xhc3MgQ0NIQUlOQUREUlBheWxvYWQgZXh0ZW5kcyBDaGFpbkFkZHJlc3NQYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gODtcbiAgICBwcm90ZWN0ZWQgY2hhaW5pZCA9IFwiQ1wiO1xufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgZGF0YSBzZXJpYWxpemVkIGJ5IGJpbnRvb2xzLmNiNThFbmNvZGUoKS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIGNiNThFbmNvZGVkUGF5bG9hZCBleHRlbmRzIFBheWxvYWRCYXNlIHtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBiaW50b29scy5jYjU4RW5jb2RlZCBzdHJpbmcgZm9yIHRoZSBwYXlsb2FkLlxuICAgICAqL1xuICAgIHJldHVyblR5cGUoKTpzdHJpbmcge1xuICAgICAgICByZXR1cm4gYmludG9vbHMuY2I1OEVuY29kZSh0aGlzLnBheWxvYWQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBAcGFyYW0gcGF5bG9hZCBCdWZmZXIgb3IgY2I1OCBlbmNvZGVkIHN0cmluZ1xuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHBheWxvYWQ6YW55ID0gdW5kZWZpbmVkKXtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgaWYocGF5bG9hZCBpbnN0YW5jZW9mIEJ1ZmZlcil7XG4gICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBwYXlsb2FkO1xuICAgICAgICB9IGVsc2UgaWYodHlwZW9mIHBheWxvYWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHRoaXMucGF5bG9hZCA9IGJpbnRvb2xzLmNiNThEZWNvZGUocGF5bG9hZCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBUeElEcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFRYSURQYXlsb2FkIGV4dGVuZHMgY2I1OEVuY29kZWRQYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gOTtcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEFzc2V0SURzLlxuICovXG5leHBvcnQgY2xhc3MgQVNTRVRJRFBheWxvYWQgZXh0ZW5kcyBjYjU4RW5jb2RlZFBheWxvYWQge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAxMDtcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIE5PREVJRHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBVVFhPSURQYXlsb2FkIGV4dGVuZHMgY2I1OEVuY29kZWRQYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMTE7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBORlRJRHMgKFVUWE9JRHMgaW4gYW4gTkZUIGNvbnRleHQpLlxuICovXG5leHBvcnQgY2xhc3MgTkZUSURQYXlsb2FkIGV4dGVuZHMgVVRYT0lEUGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDEyO1xufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgU3VibmV0SURzLlxuICovXG5leHBvcnQgY2xhc3MgU1VCTkVUSURQYXlsb2FkIGV4dGVuZHMgY2I1OEVuY29kZWRQYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMTM7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBDaGFpbklEcy5cbiAqL1xuZXhwb3J0IGNsYXNzIENIQUlOSURQYXlsb2FkIGV4dGVuZHMgY2I1OEVuY29kZWRQYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMTQ7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBOb2RlSURzLlxuICovXG5leHBvcnQgY2xhc3MgTk9ERUlEUGF5bG9hZCBleHRlbmRzIGNiNThFbmNvZGVkUGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDE1O1xufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgc2VjcDI1NmsxIHNpZ25hdHVyZXMuXG4gKiBjb252ZW50aW9uOiBzZWNwMjU2azEgc2lnbmF0dXJlICgxMzAgYnl0ZXMpXG4gKi9cbmV4cG9ydCBjbGFzcyBTRUNQU0lHUGF5bG9hZCBleHRlbmRzIEI1OFNUUlBheWxvYWQge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAxNjtcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIHNlY3AyNTZrMSBlbmNyeXB0ZWQgbWVzc2FnZXMuXG4gKiBjb252ZW50aW9uOiBwdWJsaWMga2V5ICg2NSBieXRlcykgKyBzZWNwMjU2azEgZW5jcnlwdGVkIG1lc3NhZ2UgZm9yIHRoYXQgcHVibGljIGtleVxuICovXG5leHBvcnQgY2xhc3MgU0VDUEVOQ1BheWxvYWQgZXh0ZW5kcyBCNThTVFJQYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMTc7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBKUEVHIGltYWdlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEpQRUdQYXlsb2FkIGV4dGVuZHMgQklOUGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDE4O1xufVxuXG5leHBvcnQgY2xhc3MgUE5HUGF5bG9hZCBleHRlbmRzIEJJTlBheWxvYWQge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAxOTtcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEJNUCBpbWFnZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBCTVBQYXlsb2FkIGV4dGVuZHMgQklOUGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDIwO1xufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgSUNPIGltYWdlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIElDT1BheWxvYWQgZXh0ZW5kcyBCSU5QYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMjE7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBTVkcgaW1hZ2VzLlxuICovXG5leHBvcnQgY2xhc3MgU1ZHUGF5bG9hZCBleHRlbmRzIFVURjhQYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMjI7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBDU1YgZmlsZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDU1ZQYXlsb2FkIGV4dGVuZHMgVVRGOFBheWxvYWQge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAyMztcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIEpTT04gc3RyaW5ncy5cbiAqL1xuZXhwb3J0IGNsYXNzIEpTT05QYXlsb2FkIGV4dGVuZHMgUGF5bG9hZEJhc2Uge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAyNDtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBKU09OLWRlY29kZWQgb2JqZWN0IGZvciB0aGUgcGF5bG9hZC5cbiAgICAgKi9cbiAgICByZXR1cm5UeXBlKCk6YW55IHtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodGhpcy5wYXlsb2FkLnRvU3RyaW5nKFwidXRmOFwiKSk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocGF5bG9hZDphbnkgPSB1bmRlZmluZWQpe1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBpZihwYXlsb2FkIGluc3RhbmNlb2YgQnVmZmVyKXtcbiAgICAgICAgICAgIHRoaXMucGF5bG9hZCA9IHBheWxvYWQ7XG4gICAgICAgIH0gZWxzZSBpZih0eXBlb2YgcGF5bG9hZCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgdGhpcy5wYXlsb2FkID0gQnVmZmVyLmZyb20ocGF5bG9hZCwgXCJ1dGY4XCIpO1xuICAgICAgICB9IGVsc2UgaWYocGF5bG9hZCkge1xuICAgICAgICAgICAgbGV0IGpzb25zdHI6c3RyaW5nID0gSlNPTi5zdHJpbmdpZnkocGF5bG9hZCk7XG4gICAgICAgICAgICB0aGlzLnBheWxvYWQgPSBCdWZmZXIuZnJvbShqc29uc3RyLCBcInV0ZjhcIik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBZQU1MIGRlZmluaXRpb25zLlxuICovXG5leHBvcnQgY2xhc3MgWUFNTFBheWxvYWQgZXh0ZW5kcyBVVEY4UGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDI1O1xufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgZW1haWwgYWRkcmVzc2VzLlxuICovXG5leHBvcnQgY2xhc3MgRU1BSUxQYXlsb2FkIGV4dGVuZHMgVVRGOFBheWxvYWQge1xuICAgIHByb3RlY3RlZCB0eXBlaWQgPSAyNjtcbn1cblxuLyoqXG4gKiBDbGFzcyBmb3IgcGF5bG9hZHMgcmVwcmVzZW50aW5nIFVSTCBzdHJpbmdzLlxuICovXG5leHBvcnQgY2xhc3MgVVJMUGF5bG9hZCBleHRlbmRzIFVURjhQYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMjc7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyBJUEZTIGFkZHJlc3Nlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIElQRlNQYXlsb2FkIGV4dGVuZHMgQjU4U1RSUGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDI4O1xufVxuXG4vKipcbiAqIENsYXNzIGZvciBwYXlsb2FkcyByZXByZXNlbnRpbmcgb25pb24gVVJMcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE9OSU9OUGF5bG9hZCBleHRlbmRzIFVURjhQYXlsb2FkIHtcbiAgICBwcm90ZWN0ZWQgdHlwZWlkID0gMjk7XG59XG5cbi8qKlxuICogQ2xhc3MgZm9yIHBheWxvYWRzIHJlcHJlc2VudGluZyB0b3JyZW50IG1hZ25ldCBsaW5rcy5cbiAqL1xuZXhwb3J0IGNsYXNzIE1BR05FVFBheWxvYWQgZXh0ZW5kcyBVVEY4UGF5bG9hZCB7XG4gICAgcHJvdGVjdGVkIHR5cGVpZCA9IDMwO1xufVxuIl19