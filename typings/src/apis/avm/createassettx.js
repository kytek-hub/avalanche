"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAssetTx = void 0;
/**
 * @packageDocumentation
 * @module API-AVM-CreateAssetTx
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const constants_1 = require("./constants");
const initialstates_1 = require("./initialstates");
const basetx_1 = require("./basetx");
const constants_2 = require("../../utils/constants");
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
const utf8 = "utf8";
const decimalString = "decimalString";
const buffer = "Buffer";
class CreateAssetTx extends basetx_1.BaseTx {
    /**
     * Class representing an unsigned Create Asset transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param name String for the descriptive name of the asset
     * @param symbol String for the ticker symbol of the asset
     * @param denomination Optional number for the denomination which is 10^D. D must be >= 0 and <= 32. Ex: $1 AVAX = 10^9 $nAVAX
     * @param initialState Optional [[InitialStates]] that represent the intial state of a created asset
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, name = undefined, symbol = undefined, denomination = undefined, initialState = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "CreateAssetTx";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.CREATEASSETTX : constants_1.AVMConstants.CREATEASSETTX_CODECONE;
        this.name = "";
        this.symbol = "";
        this.denomination = buffer_1.Buffer.alloc(1);
        this.initialState = new initialstates_1.InitialStates();
        /**
         * Returns the id of the [[CreateAssetTx]]
         */
        this.getTxType = () => {
            return this._typeID;
        };
        /**
         * Returns the array of array of [[Output]]s for the initial state
         */
        this.getInitialStates = () => this.initialState;
        /**
         * Returns the string representation of the name
         */
        this.getName = () => this.name;
        /**
         * Returns the string representation of the symbol
         */
        this.getSymbol = () => this.symbol;
        /**
         * Returns the numeric representation of the denomination
         */
        this.getDenomination = () => this.denomination.readUInt8(0);
        /**
         * Returns the {@link https://github.com/feross/buffer|Buffer} representation of the denomination
         */
        this.getDenominationBuffer = () => {
            return this.denomination;
        };
        if (typeof name === "string" && typeof symbol === "string" && typeof denomination === "number"
            && denomination >= 0 && denomination <= 32 && typeof initialState !== "undefined") {
            this.initialState = initialState;
            this.name = name;
            this.symbol = symbol;
            this.denomination.writeUInt8(denomination, 0);
        }
    }
    serialize(encoding = "hex") {
        const fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { name: serialization.encoder(this.name, encoding, utf8, utf8), symbol: serialization.encoder(this.symbol, encoding, utf8, utf8), denomination: serialization.encoder(this.denomination, encoding, buffer, decimalString, 1), initialState: this.initialState.serialize(encoding) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.name = serialization.decoder(fields["name"], encoding, utf8, utf8);
        this.symbol = serialization.decoder(fields["symbol"], encoding, utf8, utf8);
        this.denomination = serialization.decoder(fields["denomination"], encoding, decimalString, buffer, 1);
        this.initialState = new initialstates_1.InitialStates();
        this.initialState.deserialize(fields["initialState"], encoding);
    }
    /**
    * Set the codecID
    *
    * @param codecID The codecID to set
    */
    setCodecID(codecID) {
        if (codecID !== 0 && codecID !== 1) {
            /* istanbul ignore next */
            throw new errors_1.CodecIdError("Error - CreateAssetTx.setCodecID: invalid codecID. Valid codecIDs are 0 and 1.");
        }
        this._codecID = codecID;
        this._typeID = this._codecID === 0 ? constants_1.AVMConstants.CREATEASSETTX : constants_1.AVMConstants.CREATEASSETTX_CODECONE;
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[CreateAssetTx]], parses it, populates the class, and returns the length of the [[CreateAssetTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[CreateAssetTx]]
     *
     * @returns The length of the raw [[CreateAssetTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        const namesize = bintools.copyFrom(bytes, offset, offset + 2).readUInt16BE(0);
        offset += 2;
        this.name = bintools.copyFrom(bytes, offset, offset + namesize).toString("utf8");
        offset += namesize;
        const symsize = bintools.copyFrom(bytes, offset, offset + 2).readUInt16BE(0);
        offset += 2;
        this.symbol = bintools.copyFrom(bytes, offset, offset + symsize).toString("utf8");
        offset += symsize;
        this.denomination = bintools.copyFrom(bytes, offset, offset + 1);
        offset += 1;
        const inits = new initialstates_1.InitialStates();
        offset = inits.fromBuffer(bytes, offset);
        this.initialState = inits;
        return offset;
    }
    /**
       * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[CreateAssetTx]].
       */
    toBuffer() {
        const superbuff = super.toBuffer();
        const initstatebuff = this.initialState.toBuffer();
        const namebuff = buffer_1.Buffer.alloc(this.name.length);
        namebuff.write(this.name, 0, this.name.length, utf8);
        const namesize = buffer_1.Buffer.alloc(2);
        namesize.writeUInt16BE(this.name.length, 0);
        const symbuff = buffer_1.Buffer.alloc(this.symbol.length);
        symbuff.write(this.symbol, 0, this.symbol.length, utf8);
        const symsize = buffer_1.Buffer.alloc(2);
        symsize.writeUInt16BE(this.symbol.length, 0);
        const bsize = superbuff.length + namesize.length + namebuff.length + symsize.length + symbuff.length + this.denomination.length + initstatebuff.length;
        const barr = [superbuff, namesize, namebuff, symsize, symbuff, this.denomination, initstatebuff];
        return buffer_1.Buffer.concat(barr, bsize);
    }
    clone() {
        let newbase = new CreateAssetTx();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new CreateAssetTx(...args);
    }
}
exports.CreateAssetTx = CreateAssetTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlYXNzZXR0eC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9hcGlzL2F2bS9jcmVhdGVhc3NldHR4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUNoQyxvRUFBMkM7QUFDM0MsMkNBQTBDO0FBRzFDLG1EQUErQztBQUMvQyxxQ0FBaUM7QUFDakMscURBQXdEO0FBQ3hELDZEQUE2RjtBQUM3RiwrQ0FBaUQ7QUFFakQ7O0dBRUc7QUFDSCxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFrQiw2QkFBYSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2hFLE1BQU0sSUFBSSxHQUFtQixNQUFNLENBQUE7QUFDbkMsTUFBTSxhQUFhLEdBQW1CLGVBQWUsQ0FBQTtBQUNyRCxNQUFNLE1BQU0sR0FBbUIsUUFBUSxDQUFBO0FBRXZDLE1BQWEsYUFBYyxTQUFRLGVBQU07SUE2SXZDOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILFlBQ0UsWUFBb0IsNEJBQWdCLEVBQUUsZUFBdUIsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ2pGLE9BQTZCLFNBQVMsRUFBRSxNQUEyQixTQUFTLEVBQzVFLE9BQWUsU0FBUyxFQUFFLE9BQWUsU0FBUyxFQUFFLFNBQWlCLFNBQVMsRUFBRSxlQUF1QixTQUFTLEVBQ2hILGVBQThCLFNBQVM7UUFFdkMsS0FBSyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQS9KdkMsY0FBUyxHQUFHLGVBQWUsQ0FBQTtRQUMzQixhQUFRLEdBQUcsd0JBQVksQ0FBQyxXQUFXLENBQUE7UUFDbkMsWUFBTyxHQUFHLElBQUksQ0FBQyxRQUFRLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyx3QkFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxzQkFBc0IsQ0FBQTtRQXFCaEcsU0FBSSxHQUFXLEVBQUUsQ0FBQTtRQUNqQixXQUFNLEdBQVcsRUFBRSxDQUFBO1FBQ25CLGlCQUFZLEdBQVcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN0QyxpQkFBWSxHQUFrQixJQUFJLDZCQUFhLEVBQUUsQ0FBQTtRQWdCM0Q7O1dBRUc7UUFDSCxjQUFTLEdBQUcsR0FBVyxFQUFFO1lBQ3ZCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQTtRQUNyQixDQUFDLENBQUE7UUFFRDs7V0FFRztRQUNILHFCQUFnQixHQUFHLEdBQWtCLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFBO1FBRXpEOztXQUVHO1FBQ0gsWUFBTyxHQUFHLEdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUE7UUFFakM7O1dBRUc7UUFDSCxjQUFTLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQTtRQUVyQzs7V0FFRztRQUNILG9CQUFlLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFFOUQ7O1dBRUc7UUFDSCwwQkFBcUIsR0FBRyxHQUFXLEVBQUU7WUFDbkMsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFBO1FBQzFCLENBQUMsQ0FBQTtRQXNGQyxJQUNFLE9BQU8sSUFBSSxLQUFLLFFBQVEsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksT0FBTyxZQUFZLEtBQUssUUFBUTtlQUN2RixZQUFZLElBQUksQ0FBQyxJQUFJLFlBQVksSUFBSSxFQUFFLElBQUksT0FBTyxZQUFZLEtBQUssV0FBVyxFQUNqRjtZQUNBLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO1lBQ2hDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFBO1lBQ2hCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFBO1lBQ3BCLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQTtTQUM5QztJQUNILENBQUM7SUFyS0QsU0FBUyxDQUFDLFdBQStCLEtBQUs7UUFDNUMsTUFBTSxNQUFNLEdBQVcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUNoRCx1Q0FDSyxNQUFNLEtBQ1QsSUFBSSxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUM1RCxNQUFNLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ2hFLFlBQVksRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDLEVBQzFGLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFDcEQ7SUFDSCxDQUFDO0lBQ0QsV0FBVyxDQUFDLE1BQWMsRUFBRSxXQUErQixLQUFLO1FBQzlELEtBQUssQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFBO1FBQ25DLElBQUksQ0FBQyxJQUFJLEdBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUN2RSxJQUFJLENBQUMsTUFBTSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDM0UsSUFBSSxDQUFDLFlBQVksR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQTtRQUNyRyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksNkJBQWEsRUFBRSxDQUFBO1FBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUNqRSxDQUFDO0lBT0Q7Ozs7TUFJRTtJQUNGLFVBQVUsQ0FBQyxPQUFlO1FBQ3hCLElBQUcsT0FBTyxLQUFLLENBQUMsSUFBSSxPQUFPLEtBQUssQ0FBQyxFQUFFO1lBQ2pDLDBCQUEwQjtZQUMxQixNQUFNLElBQUkscUJBQVksQ0FBQyxnRkFBZ0YsQ0FBQyxDQUFBO1NBQ3pHO1FBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUE7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsUUFBUSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsd0JBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLHdCQUFZLENBQUMsc0JBQXNCLENBQUE7SUFDdkcsQ0FBQztJQW9DRDs7Ozs7Ozs7T0FRRztJQUNILFVBQVUsQ0FBQyxLQUFhLEVBQUUsU0FBaUIsQ0FBQztRQUMxQyxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFFeEMsTUFBTSxRQUFRLEdBQVcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDckYsTUFBTSxJQUFJLENBQUMsQ0FBQTtRQUNYLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDaEYsTUFBTSxJQUFJLFFBQVEsQ0FBQTtRQUVsQixNQUFNLE9BQU8sR0FBVyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNwRixNQUFNLElBQUksQ0FBQyxDQUFBO1FBQ1gsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQTtRQUNqRixNQUFNLElBQUksT0FBTyxDQUFBO1FBRWpCLElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUNoRSxNQUFNLElBQUksQ0FBQyxDQUFBO1FBRVgsTUFBTSxLQUFLLEdBQWtCLElBQUksNkJBQWEsRUFBRSxDQUFBO1FBQ2hELE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUN4QyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQTtRQUV6QixPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7SUFFRDs7U0FFSztJQUNMLFFBQVE7UUFDTixNQUFNLFNBQVMsR0FBVyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUE7UUFDMUMsTUFBTSxhQUFhLEdBQVcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQTtRQUUxRCxNQUFNLFFBQVEsR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDdkQsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQTtRQUNwRCxNQUFNLFFBQVEsR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3hDLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFFM0MsTUFBTSxPQUFPLEdBQVcsZUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQ3hELE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUE7UUFDdkQsTUFBTSxPQUFPLEdBQVcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUN2QyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBRTVDLE1BQU0sS0FBSyxHQUFXLFNBQVMsQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFBO1FBQzlKLE1BQU0sSUFBSSxHQUFhLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFBO1FBQzFHLE9BQU8sZUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDbkMsQ0FBQztJQUVELEtBQUs7UUFDSCxJQUFJLE9BQU8sR0FBa0IsSUFBSSxhQUFhLEVBQUUsQ0FBQTtRQUNoRCxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQ25DLE9BQU8sT0FBZSxDQUFBO0lBQ3hCLENBQUM7SUFFRCxNQUFNLENBQUMsR0FBRyxJQUFXO1FBQ25CLE9BQU8sSUFBSSxhQUFhLENBQUMsR0FBRyxJQUFJLENBQVMsQ0FBQTtJQUMzQyxDQUFDO0NBZ0NGO0FBM0tELHNDQTJLQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1BVk0tQ3JlYXRlQXNzZXRUeFxuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IEFWTUNvbnN0YW50cyB9IGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tIFwiLi9vdXRwdXRzXCJcbmltcG9ydCB7IFRyYW5zZmVyYWJsZUlucHV0IH0gZnJvbSBcIi4vaW5wdXRzXCJcbmltcG9ydCB7IEluaXRpYWxTdGF0ZXMgfSBmcm9tIFwiLi9pbml0aWFsc3RhdGVzXCJcbmltcG9ydCB7IEJhc2VUeCB9IGZyb20gXCIuL2Jhc2V0eFwiXG5pbXBvcnQgeyBEZWZhdWx0TmV0d29ya0lEIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcsIFNlcmlhbGl6ZWRUeXBlIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb25cIlxuaW1wb3J0IHsgQ29kZWNJZEVycm9yIH0gZnJvbSBcIi4uLy4uL3V0aWxzL2Vycm9yc1wiXG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5jb25zdCB1dGY4OiBTZXJpYWxpemVkVHlwZSA9IFwidXRmOFwiXG5jb25zdCBkZWNpbWFsU3RyaW5nOiBTZXJpYWxpemVkVHlwZSA9IFwiZGVjaW1hbFN0cmluZ1wiXG5jb25zdCBidWZmZXI6IFNlcmlhbGl6ZWRUeXBlID0gXCJCdWZmZXJcIlxuXG5leHBvcnQgY2xhc3MgQ3JlYXRlQXNzZXRUeCBleHRlbmRzIEJhc2VUeCB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkNyZWF0ZUFzc2V0VHhcIlxuICBwcm90ZWN0ZWQgX2NvZGVjSUQgPSBBVk1Db25zdGFudHMuTEFURVNUQ09ERUNcbiAgcHJvdGVjdGVkIF90eXBlSUQgPSB0aGlzLl9jb2RlY0lEID09PSAwID8gQVZNQ29uc3RhbnRzLkNSRUFURUFTU0VUVFggOiBBVk1Db25zdGFudHMuQ1JFQVRFQVNTRVRUWF9DT0RFQ09ORVxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgY29uc3QgZmllbGRzOiBvYmplY3QgPSBzdXBlci5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIG5hbWU6IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLm5hbWUsIGVuY29kaW5nLCB1dGY4LCB1dGY4KSxcbiAgICAgIHN5bWJvbDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuc3ltYm9sLCBlbmNvZGluZywgdXRmOCwgdXRmOCksXG4gICAgICBkZW5vbWluYXRpb246IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLmRlbm9taW5hdGlvbiwgZW5jb2RpbmcsIGJ1ZmZlciwgZGVjaW1hbFN0cmluZywgMSksXG4gICAgICBpbml0aWFsU3RhdGU6IHRoaXMuaW5pdGlhbFN0YXRlLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICB9XG4gIH1cbiAgZGVzZXJpYWxpemUoZmllbGRzOiBvYmplY3QsIGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLm5hbWUgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wibmFtZVwiXSwgZW5jb2RpbmcsIHV0ZjgsIHV0ZjgpXG4gICAgdGhpcy5zeW1ib2wgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wic3ltYm9sXCJdLCBlbmNvZGluZywgdXRmOCwgdXRmOClcbiAgICB0aGlzLmRlbm9taW5hdGlvbiA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJkZW5vbWluYXRpb25cIl0sIGVuY29kaW5nLCBkZWNpbWFsU3RyaW5nLCBidWZmZXIsIDEpXG4gICAgdGhpcy5pbml0aWFsU3RhdGUgPSBuZXcgSW5pdGlhbFN0YXRlcygpXG4gICAgdGhpcy5pbml0aWFsU3RhdGUuZGVzZXJpYWxpemUoZmllbGRzW1wiaW5pdGlhbFN0YXRlXCJdLCBlbmNvZGluZylcbiAgfVxuXG4gIHByb3RlY3RlZCBuYW1lOiBzdHJpbmcgPSBcIlwiXG4gIHByb3RlY3RlZCBzeW1ib2w6IHN0cmluZyA9IFwiXCJcbiAgcHJvdGVjdGVkIGRlbm9taW5hdGlvbjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDEpXG4gIHByb3RlY3RlZCBpbml0aWFsU3RhdGU6IEluaXRpYWxTdGF0ZXMgPSBuZXcgSW5pdGlhbFN0YXRlcygpXG5cbiAgLyoqXG4gICogU2V0IHRoZSBjb2RlY0lEXG4gICpcbiAgKiBAcGFyYW0gY29kZWNJRCBUaGUgY29kZWNJRCB0byBzZXRcbiAgKi9cbiAgc2V0Q29kZWNJRChjb2RlY0lEOiBudW1iZXIpOiB2b2lkIHtcbiAgICBpZihjb2RlY0lEICE9PSAwICYmIGNvZGVjSUQgIT09IDEpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgQ29kZWNJZEVycm9yKFwiRXJyb3IgLSBDcmVhdGVBc3NldFR4LnNldENvZGVjSUQ6IGludmFsaWQgY29kZWNJRC4gVmFsaWQgY29kZWNJRHMgYXJlIDAgYW5kIDEuXCIpXG4gICAgfVxuICAgIHRoaXMuX2NvZGVjSUQgPSBjb2RlY0lEXG4gICAgdGhpcy5fdHlwZUlEID0gdGhpcy5fY29kZWNJRCA9PT0gMCA/IEFWTUNvbnN0YW50cy5DUkVBVEVBU1NFVFRYIDogQVZNQ29uc3RhbnRzLkNSRUFURUFTU0VUVFhfQ09ERUNPTkVcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBpZCBvZiB0aGUgW1tDcmVhdGVBc3NldFR4XV1cbiAgICovXG4gIGdldFR4VHlwZSA9ICgpOiBudW1iZXIgPT4ge1xuICAgIHJldHVybiB0aGlzLl90eXBlSURcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBhcnJheSBvZiBhcnJheSBvZiBbW091dHB1dF1dcyBmb3IgdGhlIGluaXRpYWwgc3RhdGVcbiAgICovXG4gIGdldEluaXRpYWxTdGF0ZXMgPSAoKTogSW5pdGlhbFN0YXRlcyA9PiB0aGlzLmluaXRpYWxTdGF0ZVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG5hbWVcbiAgICovXG4gIGdldE5hbWUgPSAoKTogc3RyaW5nID0+IHRoaXMubmFtZVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHN5bWJvbFxuICAgKi9cbiAgZ2V0U3ltYm9sID0gKCk6IHN0cmluZyA9PiB0aGlzLnN5bWJvbFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBudW1lcmljIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkZW5vbWluYXRpb25cbiAgICovXG4gIGdldERlbm9taW5hdGlvbiA9ICgpOiBudW1iZXIgPT4gdGhpcy5kZW5vbWluYXRpb24ucmVhZFVJbnQ4KDApXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkZW5vbWluYXRpb25cbiAgICovXG4gIGdldERlbm9taW5hdGlvbkJ1ZmZlciA9ICgpOiBCdWZmZXIgPT4ge1xuICAgIHJldHVybiB0aGlzLmRlbm9taW5hdGlvblxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhbiBbW0NyZWF0ZUFzc2V0VHhdXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBbW0NyZWF0ZUFzc2V0VHhdXSBpbiBieXRlcy5cbiAgICpcbiAgICogQHBhcmFtIGJ5dGVzIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhIHJhdyBbW0NyZWF0ZUFzc2V0VHhdXVxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tDcmVhdGVBc3NldFR4XV1cbiAgICpcbiAgICogQHJlbWFya3MgYXNzdW1lIG5vdC1jaGVja3N1bW1lZFxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcblxuICAgIGNvbnN0IG5hbWVzaXplOiBudW1iZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAyKS5yZWFkVUludDE2QkUoMClcbiAgICBvZmZzZXQgKz0gMlxuICAgIHRoaXMubmFtZSA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIG5hbWVzaXplKS50b1N0cmluZyhcInV0ZjhcIilcbiAgICBvZmZzZXQgKz0gbmFtZXNpemVcblxuICAgIGNvbnN0IHN5bXNpemU6IG51bWJlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDIpLnJlYWRVSW50MTZCRSgwKVxuICAgIG9mZnNldCArPSAyXG4gICAgdGhpcy5zeW1ib2wgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyBzeW1zaXplKS50b1N0cmluZyhcInV0ZjhcIilcbiAgICBvZmZzZXQgKz0gc3ltc2l6ZVxuXG4gICAgdGhpcy5kZW5vbWluYXRpb24gPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAxKVxuICAgIG9mZnNldCArPSAxXG5cbiAgICBjb25zdCBpbml0czogSW5pdGlhbFN0YXRlcyA9IG5ldyBJbml0aWFsU3RhdGVzKClcbiAgICBvZmZzZXQgPSBpbml0cy5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgdGhpcy5pbml0aWFsU3RhdGUgPSBpbml0c1xuXG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0NyZWF0ZUFzc2V0VHhdXS5cbiAgICAgKi9cbiAgdG9CdWZmZXIoKTogQnVmZmVyIHtcbiAgICBjb25zdCBzdXBlcmJ1ZmY6IEJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKClcbiAgICBjb25zdCBpbml0c3RhdGVidWZmOiBCdWZmZXIgPSB0aGlzLmluaXRpYWxTdGF0ZS50b0J1ZmZlcigpXG5cbiAgICBjb25zdCBuYW1lYnVmZjogQnVmZmVyID0gQnVmZmVyLmFsbG9jKHRoaXMubmFtZS5sZW5ndGgpXG4gICAgbmFtZWJ1ZmYud3JpdGUodGhpcy5uYW1lLCAwLCB0aGlzLm5hbWUubGVuZ3RoLCB1dGY4KVxuICAgIGNvbnN0IG5hbWVzaXplOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMilcbiAgICBuYW1lc2l6ZS53cml0ZVVJbnQxNkJFKHRoaXMubmFtZS5sZW5ndGgsIDApXG5cbiAgICBjb25zdCBzeW1idWZmOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2ModGhpcy5zeW1ib2wubGVuZ3RoKVxuICAgIHN5bWJ1ZmYud3JpdGUodGhpcy5zeW1ib2wsIDAsIHRoaXMuc3ltYm9sLmxlbmd0aCwgdXRmOClcbiAgICBjb25zdCBzeW1zaXplOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMilcbiAgICBzeW1zaXplLndyaXRlVUludDE2QkUodGhpcy5zeW1ib2wubGVuZ3RoLCAwKVxuXG4gICAgY29uc3QgYnNpemU6IG51bWJlciA9IHN1cGVyYnVmZi5sZW5ndGggKyBuYW1lc2l6ZS5sZW5ndGggKyBuYW1lYnVmZi5sZW5ndGggKyBzeW1zaXplLmxlbmd0aCArIHN5bWJ1ZmYubGVuZ3RoICsgdGhpcy5kZW5vbWluYXRpb24ubGVuZ3RoICsgaW5pdHN0YXRlYnVmZi5sZW5ndGhcbiAgICBjb25zdCBiYXJyOiBCdWZmZXJbXSA9IFtzdXBlcmJ1ZmYsIG5hbWVzaXplLCBuYW1lYnVmZiwgc3ltc2l6ZSwgc3ltYnVmZiwgdGhpcy5kZW5vbWluYXRpb24sIGluaXRzdGF0ZWJ1ZmZdXG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpXG4gIH1cblxuICBjbG9uZSgpOiB0aGlzIHtcbiAgICBsZXQgbmV3YmFzZTogQ3JlYXRlQXNzZXRUeCA9IG5ldyBDcmVhdGVBc3NldFR4KClcbiAgICBuZXdiYXNlLmZyb21CdWZmZXIodGhpcy50b0J1ZmZlcigpKVxuICAgIHJldHVybiBuZXdiYXNlIGFzIHRoaXNcbiAgfVxuXG4gIGNyZWF0ZSguLi5hcmdzOiBhbnlbXSk6IHRoaXMge1xuICAgIHJldHVybiBuZXcgQ3JlYXRlQXNzZXRUeCguLi5hcmdzKSBhcyB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIENyZWF0ZSBBc3NldCB0cmFuc2FjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIG5ldHdvcmtJRCBPcHRpb25hbCBuZXR3b3JrSUQsIFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgT3B0aW9uYWwgYmxvY2tjaGFpbklELCBkZWZhdWx0IEJ1ZmZlci5hbGxvYygzMiwgMTYpXG4gICAqIEBwYXJhbSBvdXRzIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZU91dHB1dF1dc1xuICAgKiBAcGFyYW0gaW5zIE9wdGlvbmFsIGFycmF5IG9mIHRoZSBbW1RyYW5zZmVyYWJsZUlucHV0XV1zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgbWVtbyBmaWVsZFxuICAgKiBAcGFyYW0gbmFtZSBTdHJpbmcgZm9yIHRoZSBkZXNjcmlwdGl2ZSBuYW1lIG9mIHRoZSBhc3NldFxuICAgKiBAcGFyYW0gc3ltYm9sIFN0cmluZyBmb3IgdGhlIHRpY2tlciBzeW1ib2wgb2YgdGhlIGFzc2V0XG4gICAqIEBwYXJhbSBkZW5vbWluYXRpb24gT3B0aW9uYWwgbnVtYmVyIGZvciB0aGUgZGVub21pbmF0aW9uIHdoaWNoIGlzIDEwXkQuIEQgbXVzdCBiZSA+PSAwIGFuZCA8PSAzMi4gRXg6ICQxIEFWQVggPSAxMF45ICRuQVZBWFxuICAgKiBAcGFyYW0gaW5pdGlhbFN0YXRlIE9wdGlvbmFsIFtbSW5pdGlhbFN0YXRlc11dIHRoYXQgcmVwcmVzZW50IHRoZSBpbnRpYWwgc3RhdGUgb2YgYSBjcmVhdGVkIGFzc2V0XG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBuZXR3b3JrSUQ6IG51bWJlciA9IERlZmF1bHROZXR3b3JrSUQsIGJsb2NrY2hhaW5JRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksXG4gICAgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB1bmRlZmluZWQsIGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBCdWZmZXIgPSB1bmRlZmluZWQsIG5hbWU6IHN0cmluZyA9IHVuZGVmaW5lZCwgc3ltYm9sOiBzdHJpbmcgPSB1bmRlZmluZWQsIGRlbm9taW5hdGlvbjogbnVtYmVyID0gdW5kZWZpbmVkLFxuICAgIGluaXRpYWxTdGF0ZTogSW5pdGlhbFN0YXRlcyA9IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihuZXR3b3JrSUQsIGJsb2NrY2hhaW5JRCwgb3V0cywgaW5zLCBtZW1vKVxuICAgIGlmIChcbiAgICAgIHR5cGVvZiBuYW1lID09PSBcInN0cmluZ1wiICYmIHR5cGVvZiBzeW1ib2wgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIGRlbm9taW5hdGlvbiA9PT0gXCJudW1iZXJcIlxuICAgICAgJiYgZGVub21pbmF0aW9uID49IDAgJiYgZGVub21pbmF0aW9uIDw9IDMyICYmIHR5cGVvZiBpbml0aWFsU3RhdGUgIT09IFwidW5kZWZpbmVkXCJcbiAgICApIHtcbiAgICAgIHRoaXMuaW5pdGlhbFN0YXRlID0gaW5pdGlhbFN0YXRlXG4gICAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgICB0aGlzLnN5bWJvbCA9IHN5bWJvbFxuICAgICAgdGhpcy5kZW5vbWluYXRpb24ud3JpdGVVSW50OChkZW5vbWluYXRpb24sIDApXG4gICAgfVxuICB9XG59Il19