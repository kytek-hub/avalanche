"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenesisAsset = void 0;
/**
 * @packageDocumentation
 * @module API-AVM-GenesisAsset
 */
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const initialstates_1 = require("./initialstates");
const constants_1 = require("../../utils/constants");
const serialization_1 = require("../../utils/serialization");
const createassettx_1 = require("./createassettx");
const bn_js_1 = __importDefault(require("bn.js"));
/**
 * @ignore
 */
const serialization = serialization_1.Serialization.getInstance();
const bintools = bintools_1.default.getInstance();
const utf8 = "utf8";
const buffer = "Buffer";
const decimalString = "decimalString";
class GenesisAsset extends createassettx_1.CreateAssetTx {
    /**
    * Class representing a GenesisAsset
     *
     * @param assetAlias Optional String for the asset alias
     * @param name Optional String for the descriptive name of the asset
     * @param symbol Optional String for the ticker symbol of the asset
     * @param denomination Optional number for the denomination which is 10^D. D must be >= 0 and <= 32. Ex: $1 AVAX = 10^9 $nAVAX
     * @param initialState Optional [[InitialStates]] that represent the intial state of a created asset
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     */
    constructor(assetAlias = undefined, name = undefined, symbol = undefined, denomination = undefined, initialState = undefined, memo = undefined) {
        super(constants_1.DefaultNetworkID, buffer_1.Buffer.alloc(32), [], [], memo);
        this._typeName = "GenesisAsset";
        this._codecID = undefined;
        this._typeID = undefined;
        this.assetAlias = "";
        /**
         * Returns the string representation of the assetAlias
         */
        this.getAssetAlias = () => this.assetAlias;
        if (typeof assetAlias === "string" && typeof name === "string" &&
            typeof symbol === "string" && typeof denomination === "number" &&
            denomination >= 0 && denomination <= 32 && typeof initialState !== "undefined") {
            this.assetAlias = assetAlias;
            this.name = name;
            this.symbol = symbol;
            this.denomination.writeUInt8(denomination, 0);
            this.initialState = initialState;
        }
    }
    serialize(encoding = "hex") {
        const fields = super.serialize(encoding);
        delete fields["blockchainID"];
        delete fields["outs"];
        delete fields["ins"];
        return Object.assign(Object.assign({}, fields), { assetAlias: serialization.encoder(this.assetAlias, encoding, utf8, utf8), name: serialization.encoder(this.name, encoding, utf8, utf8), symbol: serialization.encoder(this.symbol, encoding, utf8, utf8), denomination: serialization.encoder(this.denomination, encoding, buffer, decimalString, 1), initialState: this.initialState.serialize(encoding) });
    }
    deserialize(fields, encoding = "hex") {
        fields["blockchainID"] = buffer_1.Buffer.alloc(32, 16).toString("hex");
        fields["outs"] = [];
        fields["ins"] = [];
        super.deserialize(fields, encoding);
        this.assetAlias = serialization.decoder(fields["assetAlias"], encoding, utf8, utf8);
        this.name = serialization.decoder(fields["name"], encoding, utf8, utf8);
        this.symbol = serialization.decoder(fields["symbol"], encoding, utf8, utf8);
        this.denomination = serialization.decoder(fields["denomination"], encoding, decimalString, buffer, 1);
        this.initialState = new initialstates_1.InitialStates();
        this.initialState.deserialize(fields["initialState"], encoding);
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[GenesisAsset]], parses it, populates the class, and returns the length of the [[GenesisAsset]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[GenesisAsset]]
     *
     * @returns The length of the raw [[GenesisAsset]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        const assetAliasSize = bintools.copyFrom(bytes, offset, offset + 2).readUInt16BE(0);
        offset += 2;
        this.assetAlias = bintools.copyFrom(bytes, offset, offset + assetAliasSize).toString("utf8");
        offset += assetAliasSize;
        offset += super.fromBuffer(bytes, offset);
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[GenesisAsset]].
     */
    toBuffer(networkID = constants_1.DefaultNetworkID) {
        // asset alias
        const assetAlias = this.getAssetAlias();
        const assetAliasbuffSize = buffer_1.Buffer.alloc(2);
        assetAliasbuffSize.writeUInt16BE(assetAlias.length, 0);
        let bsize = assetAliasbuffSize.length;
        let barr = [assetAliasbuffSize];
        const assetAliasbuff = buffer_1.Buffer.alloc(assetAlias.length);
        assetAliasbuff.write(assetAlias, 0, assetAlias.length, utf8);
        bsize += assetAliasbuff.length;
        barr.push(assetAliasbuff);
        const networkIDBuff = buffer_1.Buffer.alloc(4);
        networkIDBuff.writeUInt32BE(new bn_js_1.default(networkID).toNumber(), 0);
        bsize += networkIDBuff.length;
        barr.push(networkIDBuff);
        // Blockchain ID
        bsize += 32;
        barr.push(buffer_1.Buffer.alloc(32));
        // num Outputs
        bsize += 4;
        barr.push(buffer_1.Buffer.alloc(4));
        // num Inputs
        bsize += 4;
        barr.push(buffer_1.Buffer.alloc(4));
        // memo
        const memo = this.getMemo();
        const memobuffSize = buffer_1.Buffer.alloc(4);
        memobuffSize.writeUInt32BE(memo.length, 0);
        bsize += memobuffSize.length;
        barr.push(memobuffSize);
        bsize += memo.length;
        barr.push(memo);
        // asset name
        const name = this.getName();
        const namebuffSize = buffer_1.Buffer.alloc(2);
        namebuffSize.writeUInt16BE(name.length, 0);
        bsize += namebuffSize.length;
        barr.push(namebuffSize);
        const namebuff = buffer_1.Buffer.alloc(name.length);
        namebuff.write(name, 0, name.length, utf8);
        bsize += namebuff.length;
        barr.push(namebuff);
        // symbol
        const symbol = this.getSymbol();
        const symbolbuffSize = buffer_1.Buffer.alloc(2);
        symbolbuffSize.writeUInt16BE(symbol.length, 0);
        bsize += symbolbuffSize.length;
        barr.push(symbolbuffSize);
        const symbolbuff = buffer_1.Buffer.alloc(symbol.length);
        symbolbuff.write(symbol, 0, symbol.length, utf8);
        bsize += symbolbuff.length;
        barr.push(symbolbuff);
        // denomination
        const denomination = this.getDenomination();
        const denominationbuffSize = buffer_1.Buffer.alloc(1);
        denominationbuffSize.writeUInt8(denomination, 0);
        bsize += denominationbuffSize.length;
        barr.push(denominationbuffSize);
        bsize += this.initialState.toBuffer().length;
        barr.push(this.initialState.toBuffer());
        return buffer_1.Buffer.concat(barr, bsize);
    }
}
exports.GenesisAsset = GenesisAsset;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXNpc2Fzc2V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvYXZtL2dlbmVzaXNhc3NldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7O0dBR0c7QUFDSCxvQ0FBZ0M7QUFDaEMsb0VBQTJDO0FBQzNDLG1EQUErQztBQUMvQyxxREFBd0Q7QUFDeEQsNkRBQTZGO0FBQzdGLG1EQUErQztBQUMvQyxrREFBc0I7QUFFdEI7O0dBRUc7QUFDSCxNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNoRSxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sSUFBSSxHQUFtQixNQUFNLENBQUE7QUFDbkMsTUFBTSxNQUFNLEdBQW1CLFFBQVEsQ0FBQTtBQUN2QyxNQUFNLGFBQWEsR0FBbUIsZUFBZSxDQUFBO0FBRXJELE1BQWEsWUFBYSxTQUFRLDZCQUFhO0lBdUk3Qzs7Ozs7Ozs7O09BU0c7SUFDSCxZQUNFLGFBQXFCLFNBQVMsRUFDOUIsT0FBZSxTQUFTLEVBQ3hCLFNBQWlCLFNBQVMsRUFDMUIsZUFBdUIsU0FBUyxFQUNoQyxlQUE4QixTQUFTLEVBQ3ZDLE9BQWUsU0FBUztRQUV4QixLQUFLLENBQUMsNEJBQWdCLEVBQUUsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFBO1FBeEovQyxjQUFTLEdBQUcsY0FBYyxDQUFBO1FBQzFCLGFBQVEsR0FBRyxTQUFTLENBQUE7UUFDcEIsWUFBTyxHQUFHLFNBQVMsQ0FBQTtRQThCbkIsZUFBVSxHQUFXLEVBQUUsQ0FBQTtRQUVqQzs7V0FFRztRQUNILGtCQUFhLEdBQUcsR0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQTtRQW9IM0MsSUFDRSxPQUFPLFVBQVUsS0FBSyxRQUFRLElBQUksT0FB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QTtRQUNoRCxLQUFLLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQTtRQUMxQixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFBO1FBRXJCLGVBQWU7UUFDZixNQUFNLFlBQVksR0FBVyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUE7UUFDbkQsTUFBTSxvQkFBb0IsR0FBVyxlQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ3BELG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUE7UUFDaEQsS0FBSyxJQUFJLG9CQUFvQixDQUFDLE1BQU0sQ0FBQTtRQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUE7UUFFL0IsS0FBSyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFBO1FBQzVDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFBO1FBQ3ZDLE9BQU8sZUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUE7SUFDbkMsQ0FBQztDQWlDRjtBQXRLRCxvQ0FzS0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBBUEktQVZNLUdlbmVzaXNBc3NldFxuICovXG5pbXBvcnQgeyBCdWZmZXIgfSBmcm9tIFwiYnVmZmVyL1wiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IEluaXRpYWxTdGF0ZXMgfSBmcm9tIFwiLi9pbml0aWFsc3RhdGVzXCJcbmltcG9ydCB7IERlZmF1bHROZXR3b3JrSUQgfSBmcm9tIFwiLi4vLi4vdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRFbmNvZGluZywgU2VyaWFsaXplZFR5cGUgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5pbXBvcnQgeyBDcmVhdGVBc3NldFR4IH0gZnJvbSBcIi4vY3JlYXRlYXNzZXR0eFwiXG5pbXBvcnQgQk4gZnJvbSBcImJuLmpzXCJcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IHV0Zjg6IFNlcmlhbGl6ZWRUeXBlID0gXCJ1dGY4XCJcbmNvbnN0IGJ1ZmZlcjogU2VyaWFsaXplZFR5cGUgPSBcIkJ1ZmZlclwiXG5jb25zdCBkZWNpbWFsU3RyaW5nOiBTZXJpYWxpemVkVHlwZSA9IFwiZGVjaW1hbFN0cmluZ1wiXG5cbmV4cG9ydCBjbGFzcyBHZW5lc2lzQXNzZXQgZXh0ZW5kcyBDcmVhdGVBc3NldFR4IHtcbiAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiR2VuZXNpc0Fzc2V0XCJcbiAgcHJvdGVjdGVkIF9jb2RlY0lEID0gdW5kZWZpbmVkXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkXG5cbiAgc2VyaWFsaXplKGVuY29kaW5nOiBTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTogb2JqZWN0IHtcbiAgICBjb25zdCBmaWVsZHM6IG9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICBkZWxldGUgZmllbGRzW1wiYmxvY2tjaGFpbklEXCJdXG4gICAgZGVsZXRlIGZpZWxkc1tcIm91dHNcIl1cbiAgICBkZWxldGUgZmllbGRzW1wiaW5zXCJdXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLmZpZWxkcyxcbiAgICAgIGFzc2V0QWxpYXM6IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLmFzc2V0QWxpYXMsIGVuY29kaW5nLCB1dGY4LCB1dGY4KSxcbiAgICAgIG5hbWU6IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLm5hbWUsIGVuY29kaW5nLCB1dGY4LCB1dGY4KSxcbiAgICAgIHN5bWJvbDogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuc3ltYm9sLCBlbmNvZGluZywgdXRmOCwgdXRmOCksXG4gICAgICBkZW5vbWluYXRpb246IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLmRlbm9taW5hdGlvbiwgZW5jb2RpbmcsIGJ1ZmZlciwgZGVjaW1hbFN0cmluZywgMSksXG4gICAgICBpbml0aWFsU3RhdGU6IHRoaXMuaW5pdGlhbFN0YXRlLnNlcmlhbGl6ZShlbmNvZGluZylcbiAgICB9XG4gIH1cblxuICBkZXNlcmlhbGl6ZShmaWVsZHM6IG9iamVjdCwgZW5jb2Rpbmc6IFNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICBmaWVsZHNbXCJibG9ja2NoYWluSURcIl0gPSBCdWZmZXIuYWxsb2MoMzIsIDE2KS50b1N0cmluZyhcImhleFwiKVxuICAgIGZpZWxkc1tcIm91dHNcIl0gPSBbXVxuICAgIGZpZWxkc1tcImluc1wiXSA9IFtdXG4gICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZylcbiAgICB0aGlzLmFzc2V0QWxpYXMgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wiYXNzZXRBbGlhc1wiXSwgZW5jb2RpbmcsIHV0ZjgsIHV0ZjgpXG4gICAgdGhpcy5uYW1lID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKGZpZWxkc1tcIm5hbWVcIl0sIGVuY29kaW5nLCB1dGY4LCB1dGY4KVxuICAgIHRoaXMuc3ltYm9sID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKGZpZWxkc1tcInN5bWJvbFwiXSwgZW5jb2RpbmcsIHV0ZjgsIHV0ZjgpXG4gICAgdGhpcy5kZW5vbWluYXRpb24gPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wiZGVub21pbmF0aW9uXCJdLCBlbmNvZGluZywgZGVjaW1hbFN0cmluZywgYnVmZmVyLCAxKVxuICAgIHRoaXMuaW5pdGlhbFN0YXRlID0gbmV3IEluaXRpYWxTdGF0ZXMoKVxuICAgIHRoaXMuaW5pdGlhbFN0YXRlLmRlc2VyaWFsaXplKGZpZWxkc1tcImluaXRpYWxTdGF0ZVwiXSwgZW5jb2RpbmcpXG4gIH1cblxuICBwcm90ZWN0ZWQgYXNzZXRBbGlhczogc3RyaW5nID0gXCJcIlxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFzc2V0QWxpYXNcbiAgICovXG4gIGdldEFzc2V0QWxpYXMgPSAoKTogc3RyaW5nID0+IHRoaXMuYXNzZXRBbGlhc1xuXG4gIC8qKlxuICAgKiBUYWtlcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYW4gW1tHZW5lc2lzQXNzZXRdXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBbW0dlbmVzaXNBc3NldF1dIGluIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0gYnl0ZXMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGEgcmF3IFtbR2VuZXNpc0Fzc2V0XV1cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGxlbmd0aCBvZiB0aGUgcmF3IFtbR2VuZXNpc0Fzc2V0XV1cbiAgICpcbiAgICogQHJlbWFya3MgYXNzdW1lIG5vdC1jaGVja3N1bW1lZFxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIGNvbnN0IGFzc2V0QWxpYXNTaXplOiBudW1iZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyAyKS5yZWFkVUludDE2QkUoMClcbiAgICBvZmZzZXQgKz0gMlxuICAgIHRoaXMuYXNzZXRBbGlhcyA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIGFzc2V0QWxpYXNTaXplKS50b1N0cmluZyhcInV0ZjhcIilcbiAgICBvZmZzZXQgKz0gYXNzZXRBbGlhc1NpemVcbiAgICBvZmZzZXQgKz0gc3VwZXIuZnJvbUJ1ZmZlcihieXRlcywgb2Zmc2V0KVxuICAgIHJldHVybiBvZmZzZXRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gcmVwcmVzZW50YXRpb24gb2YgdGhlIFtbR2VuZXNpc0Fzc2V0XV0uXG4gICAqL1xuICB0b0J1ZmZlcihuZXR3b3JrSUQ6IG51bWJlciA9IERlZmF1bHROZXR3b3JrSUQpOiBCdWZmZXIge1xuICAgIC8vIGFzc2V0IGFsaWFzXG4gICAgY29uc3QgYXNzZXRBbGlhczogc3RyaW5nID0gdGhpcy5nZXRBc3NldEFsaWFzKClcbiAgICBjb25zdCBhc3NldEFsaWFzYnVmZlNpemU6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygyKVxuICAgIGFzc2V0QWxpYXNidWZmU2l6ZS53cml0ZVVJbnQxNkJFKGFzc2V0QWxpYXMubGVuZ3RoLCAwKVxuICAgIGxldCBic2l6ZTogbnVtYmVyID0gYXNzZXRBbGlhc2J1ZmZTaXplLmxlbmd0aFxuICAgIGxldCBiYXJyOiBCdWZmZXJbXSA9IFthc3NldEFsaWFzYnVmZlNpemVdXG4gICAgY29uc3QgYXNzZXRBbGlhc2J1ZmY6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyhhc3NldEFsaWFzLmxlbmd0aClcbiAgICBhc3NldEFsaWFzYnVmZi53cml0ZShhc3NldEFsaWFzLCAwLCBhc3NldEFsaWFzLmxlbmd0aCwgdXRmOClcbiAgICBic2l6ZSArPSBhc3NldEFsaWFzYnVmZi5sZW5ndGhcbiAgICBiYXJyLnB1c2goYXNzZXRBbGlhc2J1ZmYpXG5cbiAgICBjb25zdCBuZXR3b3JrSURCdWZmOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBuZXR3b3JrSURCdWZmLndyaXRlVUludDMyQkUobmV3IEJOKG5ldHdvcmtJRCkudG9OdW1iZXIoKSwgMClcbiAgICBic2l6ZSArPSBuZXR3b3JrSURCdWZmLmxlbmd0aFxuICAgIGJhcnIucHVzaChuZXR3b3JrSURCdWZmKVxuXG4gICAgLy8gQmxvY2tjaGFpbiBJRFxuICAgIGJzaXplICs9IDMyXG4gICAgYmFyci5wdXNoKEJ1ZmZlci5hbGxvYygzMikpXG5cbiAgICAvLyBudW0gT3V0cHV0c1xuICAgIGJzaXplICs9IDRcbiAgICBiYXJyLnB1c2goQnVmZmVyLmFsbG9jKDQpKVxuXG4gICAgLy8gbnVtIElucHV0c1xuICAgIGJzaXplICs9IDRcbiAgICBiYXJyLnB1c2goQnVmZmVyLmFsbG9jKDQpKVxuXG4gICAgLy8gbWVtb1xuICAgIGNvbnN0IG1lbW86IEJ1ZmZlciA9IHRoaXMuZ2V0TWVtbygpXG4gICAgY29uc3QgbWVtb2J1ZmZTaXplOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoNClcbiAgICBtZW1vYnVmZlNpemUud3JpdGVVSW50MzJCRShtZW1vLmxlbmd0aCwgMClcbiAgICBic2l6ZSArPSBtZW1vYnVmZlNpemUubGVuZ3RoXG4gICAgYmFyci5wdXNoKG1lbW9idWZmU2l6ZSlcblxuICAgIGJzaXplICs9IG1lbW8ubGVuZ3RoXG4gICAgYmFyci5wdXNoKG1lbW8pXG5cbiAgICAvLyBhc3NldCBuYW1lXG4gICAgY29uc3QgbmFtZTogc3RyaW5nID0gdGhpcy5nZXROYW1lKClcbiAgICBjb25zdCBuYW1lYnVmZlNpemU6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygyKVxuICAgIG5hbWVidWZmU2l6ZS53cml0ZVVJbnQxNkJFKG5hbWUubGVuZ3RoLCAwKVxuICAgIGJzaXplICs9IG5hbWVidWZmU2l6ZS5sZW5ndGhcbiAgICBiYXJyLnB1c2gobmFtZWJ1ZmZTaXplKVxuICAgIGNvbnN0IG5hbWVidWZmOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MobmFtZS5sZW5ndGgpXG4gICAgbmFtZWJ1ZmYud3JpdGUobmFtZSwgMCwgbmFtZS5sZW5ndGgsIHV0ZjgpXG4gICAgYnNpemUgKz0gbmFtZWJ1ZmYubGVuZ3RoXG4gICAgYmFyci5wdXNoKG5hbWVidWZmKVxuXG4gICAgLy8gc3ltYm9sXG4gICAgY29uc3Qgc3ltYm9sOiBzdHJpbmcgPSB0aGlzLmdldFN5bWJvbCgpXG4gICAgY29uc3Qgc3ltYm9sYnVmZlNpemU6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygyKVxuICAgIHN5bWJvbGJ1ZmZTaXplLndyaXRlVUludDE2QkUoc3ltYm9sLmxlbmd0aCwgMClcbiAgICBic2l6ZSArPSBzeW1ib2xidWZmU2l6ZS5sZW5ndGhcbiAgICBiYXJyLnB1c2goc3ltYm9sYnVmZlNpemUpXG5cbiAgICBjb25zdCBzeW1ib2xidWZmOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2Moc3ltYm9sLmxlbmd0aClcbiAgICBzeW1ib2xidWZmLndyaXRlKHN5bWJvbCwgMCwgc3ltYm9sLmxlbmd0aCwgdXRmOClcbiAgICBic2l6ZSArPSBzeW1ib2xidWZmLmxlbmd0aFxuICAgIGJhcnIucHVzaChzeW1ib2xidWZmKVxuXG4gICAgLy8gZGVub21pbmF0aW9uXG4gICAgY29uc3QgZGVub21pbmF0aW9uOiBudW1iZXIgPSB0aGlzLmdldERlbm9taW5hdGlvbigpXG4gICAgY29uc3QgZGVub21pbmF0aW9uYnVmZlNpemU6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygxKVxuICAgIGRlbm9taW5hdGlvbmJ1ZmZTaXplLndyaXRlVUludDgoZGVub21pbmF0aW9uLCAwKVxuICAgIGJzaXplICs9IGRlbm9taW5hdGlvbmJ1ZmZTaXplLmxlbmd0aFxuICAgIGJhcnIucHVzaChkZW5vbWluYXRpb25idWZmU2l6ZSlcblxuICAgIGJzaXplICs9IHRoaXMuaW5pdGlhbFN0YXRlLnRvQnVmZmVyKCkubGVuZ3RoXG4gICAgYmFyci5wdXNoKHRoaXMuaW5pdGlhbFN0YXRlLnRvQnVmZmVyKCkpXG4gICAgcmV0dXJuIEJ1ZmZlci5jb25jYXQoYmFyciwgYnNpemUpXG4gIH1cblxuICAvKipcbiAgKiBDbGFzcyByZXByZXNlbnRpbmcgYSBHZW5lc2lzQXNzZXRcbiAgICpcbiAgICogQHBhcmFtIGFzc2V0QWxpYXMgT3B0aW9uYWwgU3RyaW5nIGZvciB0aGUgYXNzZXQgYWxpYXNcbiAgICogQHBhcmFtIG5hbWUgT3B0aW9uYWwgU3RyaW5nIGZvciB0aGUgZGVzY3JpcHRpdmUgbmFtZSBvZiB0aGUgYXNzZXRcbiAgICogQHBhcmFtIHN5bWJvbCBPcHRpb25hbCBTdHJpbmcgZm9yIHRoZSB0aWNrZXIgc3ltYm9sIG9mIHRoZSBhc3NldFxuICAgKiBAcGFyYW0gZGVub21pbmF0aW9uIE9wdGlvbmFsIG51bWJlciBmb3IgdGhlIGRlbm9taW5hdGlvbiB3aGljaCBpcyAxMF5ELiBEIG11c3QgYmUgPj0gMCBhbmQgPD0gMzIuIEV4OiAkMSBBVkFYID0gMTBeOSAkbkFWQVhcbiAgICogQHBhcmFtIGluaXRpYWxTdGF0ZSBPcHRpb25hbCBbW0luaXRpYWxTdGF0ZXNdXSB0aGF0IHJlcHJlc2VudCB0aGUgaW50aWFsIHN0YXRlIG9mIGEgY3JlYXRlZCBhc3NldFxuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFzc2V0QWxpYXM6IHN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICBuYW1lOiBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgc3ltYm9sOiBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgZGVub21pbmF0aW9uOiBudW1iZXIgPSB1bmRlZmluZWQsXG4gICAgaW5pdGlhbFN0YXRlOiBJbml0aWFsU3RhdGVzID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IEJ1ZmZlciA9IHVuZGVmaW5lZFxuICApIHtcbiAgICBzdXBlcihEZWZhdWx0TmV0d29ya0lELCBCdWZmZXIuYWxsb2MoMzIpLCBbXSwgW10sIG1lbW8pXG4gICAgaWYgKFxuICAgICAgdHlwZW9mIGFzc2V0QWxpYXMgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIG5hbWUgPT09IFwic3RyaW5nXCIgJiZcbiAgICAgIHR5cGVvZiBzeW1ib2wgPT09IFwic3RyaW5nXCIgJiYgdHlwZW9mIGRlbm9taW5hdGlvbiA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgZGVub21pbmF0aW9uID49IDAgJiYgZGVub21pbmF0aW9uIDw9IDMyICYmIHR5cGVvZiBpbml0aWFsU3RhdGUgIT09IFwidW5kZWZpbmVkXCJcbiAgICApIHtcbiAgICAgIHRoaXMuYXNzZXRBbGlhcyA9IGFzc2V0QWxpYXNcbiAgICAgIHRoaXMubmFtZSA9IG5hbWVcbiAgICAgIHRoaXMuc3ltYm9sID0gc3ltYm9sXG4gICAgICB0aGlzLmRlbm9taW5hdGlvbi53cml0ZVVJbnQ4KGRlbm9taW5hdGlvbiwgMClcbiAgICAgIHRoaXMuaW5pdGlhbFN0YXRlID0gaW5pdGlhbFN0YXRlXG4gICAgfVxuICB9XG59Il19