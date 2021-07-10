"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenesisData = void 0;
/**
* @packageDocumentation
* @module API-AVM-GenesisData
*/
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const serialization_1 = require("../../utils/serialization");
const constants_1 = require("./constants");
const _1 = require(".");
const utils_1 = require("../../utils");
/**
* @ignore
*/
const serialization = serialization_1.Serialization.getInstance();
const bintools = bintools_1.default.getInstance();
const decimalString = "decimalString";
const buffer = "Buffer";
class GenesisData extends serialization_1.Serializable {
    /**
    * Class representing AVM GenesisData
    *
    * @param genesisAssets Optional GenesisAsset[]
    * @param networkID Optional DefaultNetworkID
    */
    constructor(genesisAssets = [], networkID = utils_1.DefaultNetworkID) {
        super();
        this._typeName = "GenesisData";
        this._codecID = constants_1.AVMConstants.LATESTCODEC;
        this.networkID = buffer_1.Buffer.alloc(4);
        /**
        * Returns the GenesisAssets[]
        */
        this.getGenesisAssets = () => this.genesisAssets;
        /**
        * Returns the NetworkID as a number
        */
        this.getNetworkID = () => this.networkID.readUInt32BE(0);
        this.genesisAssets = genesisAssets;
        this.networkID.writeUInt32BE(networkID, 0);
    }
    // TODO - setCodecID?
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { genesisAssets: this.genesisAssets.map((genesisAsset) => genesisAsset.serialize(encoding)), networkID: serialization.encoder(this.networkID, encoding, buffer, decimalString) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.genesisAssets = fields["genesisAssets"].map((genesisAsset) => {
            let g = new _1.GenesisAsset();
            g.deserialize(genesisAsset, encoding);
            return g;
        });
        this.networkID = serialization.decoder(fields["networkID"], encoding, decimalString, buffer, 4);
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
        this._codecID = bintools.copyFrom(bytes, offset, offset + 2).readUInt16BE(0);
        offset += 2;
        const numGenesisAssets = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const assetCount = numGenesisAssets.readUInt32BE(0);
        this.genesisAssets = [];
        for (let i = 0; i < assetCount; i++) {
            const genesisAsset = new _1.GenesisAsset();
            offset = genesisAsset.fromBuffer(bytes, offset);
            this.genesisAssets.push(genesisAsset);
            if (i === 0) {
                this.networkID.writeUInt32BE(genesisAsset.getNetworkID(), 0);
            }
        }
        return offset;
    }
    /**
    * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[GenesisData]].
    */
    toBuffer() {
        // codec id
        const codecbuffSize = buffer_1.Buffer.alloc(2);
        codecbuffSize.writeUInt16BE(this._codecID, 0);
        // num assets
        const numAssetsbuffSize = buffer_1.Buffer.alloc(4);
        numAssetsbuffSize.writeUInt32BE(this.genesisAssets.length, 0);
        let bsize = codecbuffSize.length + numAssetsbuffSize.length;
        let barr = [codecbuffSize, numAssetsbuffSize];
        this.genesisAssets.forEach((genesisAsset) => {
            const b = genesisAsset.toBuffer(this.getNetworkID());
            bsize += b.length;
            barr.push(b);
        });
        return buffer_1.Buffer.concat(barr, bsize);
    }
}
exports.GenesisData = GenesisData;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXNpc2RhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9hdm0vZ2VuZXNpc2RhdGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUE7OztFQUdFO0FBQ0Ysb0NBQWdDO0FBQ2hDLG9FQUEyQztBQUMzQyw2REFBMkY7QUFDM0YsMkNBQTBDO0FBQzFDLHdCQUFnQztBQUNoQyx1Q0FBOEQ7QUFFOUQ7O0VBRUU7QUFDRixNQUFNLGFBQWEsR0FBa0IsNkJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNoRSxNQUFNLFFBQVEsR0FBYSxrQkFBUSxDQUFDLFdBQVcsRUFBRSxDQUFBO0FBQ2pELE1BQU0sYUFBYSxHQUFtQixlQUFlLENBQUE7QUFDckQsTUFBTSxNQUFNLEdBQW1CLFFBQVEsQ0FBQTtBQUV2QyxNQUFhLFdBQVksU0FBUSw0QkFBWTtJQXVGM0M7Ozs7O01BS0U7SUFDRixZQUFZLGdCQUFnQyxFQUFFLEVBQUUsWUFBb0Isd0JBQWdCO1FBQ2xGLEtBQUssRUFBRSxDQUFBO1FBN0ZDLGNBQVMsR0FBRyxhQUFhLENBQUE7UUFDekIsYUFBUSxHQUFHLHdCQUFZLENBQUMsV0FBVyxDQUFBO1FBdUJuQyxjQUFTLEdBQVcsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUU3Qzs7VUFFRTtRQUNGLHFCQUFnQixHQUFHLEdBQW1CLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFBO1FBRTNEOztVQUVFO1FBQ0YsaUJBQVksR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQTREekQsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUE7UUFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQzVDLENBQUM7SUE3RkQscUJBQXFCO0lBQ3JCLFNBQVMs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S0FBSyxHQUFXLGFBQWEsQ0FBQyxNQUFNLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFBO1FBQ25FLElBQUksSUFBSSxHQUFhLENBQUMsYUFBYSxFQUFFLGlCQUFpQixDQUFDLENBQUE7UUFFdkQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxZQUEwQixFQUFRLEVBQUU7WUFDOUQsTUFBTSxDQUFDLEdBQVcsWUFBWSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQTtZQUM1RCxLQUFLLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQTtZQUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2QsQ0FBQyxDQUFDLENBQUE7UUFDRixPQUFPLGVBQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO0lBQ25DLENBQUM7Q0FhRjtBQWxHRCxrQ0FrR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4qIEBtb2R1bGUgQVBJLUFWTS1HZW5lc2lzRGF0YVxuKi9cbmltcG9ydCB7IEJ1ZmZlciB9IGZyb20gXCJidWZmZXIvXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi4vLi4vdXRpbHMvYmludG9vbHNcIlxuaW1wb3J0IHsgU2VyaWFsaXphYmxlLCBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tIFwiLi4vLi4vdXRpbHMvc2VyaWFsaXphdGlvblwiXG5pbXBvcnQgeyBBVk1Db25zdGFudHMgfSBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgR2VuZXNpc0Fzc2V0IH0gZnJvbSBcIi5cIlxuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCwgU2VyaWFsaXplZFR5cGUgfSBmcm9tIFwiLi4vLi4vdXRpbHNcIlxuXG4vKipcbiogQGlnbm9yZVxuKi9cbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IGRlY2ltYWxTdHJpbmc6IFNlcmlhbGl6ZWRUeXBlID0gXCJkZWNpbWFsU3RyaW5nXCJcbmNvbnN0IGJ1ZmZlcjogU2VyaWFsaXplZFR5cGUgPSBcIkJ1ZmZlclwiXG5cbmV4cG9ydCBjbGFzcyBHZW5lc2lzRGF0YSBleHRlbmRzIFNlcmlhbGl6YWJsZSB7XG4gIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkdlbmVzaXNEYXRhXCJcbiAgcHJvdGVjdGVkIF9jb2RlY0lEID0gQVZNQ29uc3RhbnRzLkxBVEVTVENPREVDXG5cbiAgLy8gVE9ETyAtIHNldENvZGVjSUQ/XG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBnZW5lc2lzQXNzZXRzOiB0aGlzLmdlbmVzaXNBc3NldHMubWFwKChnZW5lc2lzQXNzZXQ6IEdlbmVzaXNBc3NldCkgPT4gZ2VuZXNpc0Fzc2V0LnNlcmlhbGl6ZShlbmNvZGluZykpLFxuICAgICAgbmV0d29ya0lEOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5uZXR3b3JrSUQsIGVuY29kaW5nLCBidWZmZXIsIGRlY2ltYWxTdHJpbmcpLFxuICAgIH1cbiAgfVxuXG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5nZW5lc2lzQXNzZXRzID0gZmllbGRzW1wiZ2VuZXNpc0Fzc2V0c1wiXS5tYXAoKGdlbmVzaXNBc3NldDogR2VuZXNpc0Fzc2V0KTogR2VuZXNpc0Fzc2V0ID0+IHtcbiAgICAgIGxldCBnOiBHZW5lc2lzQXNzZXQgPSBuZXcgR2VuZXNpc0Fzc2V0KClcbiAgICAgIGcuZGVzZXJpYWxpemUoZ2VuZXNpc0Fzc2V0LCBlbmNvZGluZylcbiAgICAgIHJldHVybiBnXG4gICAgfSlcbiAgICB0aGlzLm5ldHdvcmtJRCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJuZXR3b3JrSURcIl0sIGVuY29kaW5nLCBkZWNpbWFsU3RyaW5nLCBidWZmZXIsIDQpXG4gIH1cblxuICBwcm90ZWN0ZWQgZ2VuZXNpc0Fzc2V0czogR2VuZXNpc0Fzc2V0W11cbiAgcHJvdGVjdGVkIG5ldHdvcmtJRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG5cbiAgLyoqXG4gICogUmV0dXJucyB0aGUgR2VuZXNpc0Fzc2V0c1tdXG4gICovXG4gIGdldEdlbmVzaXNBc3NldHMgPSAoKTogR2VuZXNpc0Fzc2V0W10gPT4gdGhpcy5nZW5lc2lzQXNzZXRzXG5cbiAgLyoqXG4gICogUmV0dXJucyB0aGUgTmV0d29ya0lEIGFzIGEgbnVtYmVyXG4gICovXG4gIGdldE5ldHdvcmtJRCA9ICgpOiBudW1iZXIgPT4gdGhpcy5uZXR3b3JrSUQucmVhZFVJbnQzMkJFKDApXG5cbiAgLyoqXG4gICAqIFRha2VzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gY29udGFpbmluZyBhbiBbW0dlbmVzaXNBc3NldF1dLCBwYXJzZXMgaXQsIHBvcHVsYXRlcyB0aGUgY2xhc3MsIGFuZCByZXR1cm5zIHRoZSBsZW5ndGggb2YgdGhlIFtbR2VuZXNpc0Fzc2V0XV0gaW4gYnl0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBieXRlcyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYSByYXcgW1tHZW5lc2lzQXNzZXRdXVxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgbGVuZ3RoIG9mIHRoZSByYXcgW1tHZW5lc2lzQXNzZXRdXVxuICAgKlxuICAgKiBAcmVtYXJrcyBhc3N1bWUgbm90LWNoZWNrc3VtbWVkXG4gICAqL1xuICBmcm9tQnVmZmVyKGJ5dGVzOiBCdWZmZXIsIG9mZnNldDogbnVtYmVyID0gMCk6IG51bWJlciB7XG4gICAgdGhpcy5fY29kZWNJRCA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDIpLnJlYWRVSW50MTZCRSgwKVxuICAgIG9mZnNldCArPSAyXG4gICAgY29uc3QgbnVtR2VuZXNpc0Fzc2V0cyA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpXG4gICAgb2Zmc2V0ICs9IDRcbiAgICBjb25zdCBhc3NldENvdW50OiBudW1iZXIgPSBudW1HZW5lc2lzQXNzZXRzLnJlYWRVSW50MzJCRSgwKVxuICAgIHRoaXMuZ2VuZXNpc0Fzc2V0cyA9IFtdXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFzc2V0Q291bnQ7IGkrKykge1xuICAgICAgY29uc3QgZ2VuZXNpc0Fzc2V0OiBHZW5lc2lzQXNzZXQgPSBuZXcgR2VuZXNpc0Fzc2V0KClcbiAgICAgIG9mZnNldCA9IGdlbmVzaXNBc3NldC5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpXG4gICAgICB0aGlzLmdlbmVzaXNBc3NldHMucHVzaChnZW5lc2lzQXNzZXQpXG4gICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICB0aGlzLm5ldHdvcmtJRC53cml0ZVVJbnQzMkJFKGdlbmVzaXNBc3NldC5nZXROZXR3b3JrSUQoKSwgMClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9mZnNldFxuICB9XG5cbiAgLyoqXG4gICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW0dlbmVzaXNEYXRhXV0uXG4gICovXG4gIHRvQnVmZmVyKCk6IEJ1ZmZlciB7XG4gICAgLy8gY29kZWMgaWRcbiAgICBjb25zdCBjb2RlY2J1ZmZTaXplOiBCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMilcbiAgICBjb2RlY2J1ZmZTaXplLndyaXRlVUludDE2QkUodGhpcy5fY29kZWNJRCwgMClcblxuICAgIC8vIG51bSBhc3NldHNcbiAgICBjb25zdCBudW1Bc3NldHNidWZmU2l6ZTogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgbnVtQXNzZXRzYnVmZlNpemUud3JpdGVVSW50MzJCRSh0aGlzLmdlbmVzaXNBc3NldHMubGVuZ3RoLCAwKVxuXG4gICAgbGV0IGJzaXplOiBudW1iZXIgPSBjb2RlY2J1ZmZTaXplLmxlbmd0aCArIG51bUFzc2V0c2J1ZmZTaXplLmxlbmd0aFxuICAgIGxldCBiYXJyOiBCdWZmZXJbXSA9IFtjb2RlY2J1ZmZTaXplLCBudW1Bc3NldHNidWZmU2l6ZV1cblxuICAgIHRoaXMuZ2VuZXNpc0Fzc2V0cy5mb3JFYWNoKChnZW5lc2lzQXNzZXQ6IEdlbmVzaXNBc3NldCk6IHZvaWQgPT4ge1xuICAgICAgY29uc3QgYjogQnVmZmVyID0gZ2VuZXNpc0Fzc2V0LnRvQnVmZmVyKHRoaXMuZ2V0TmV0d29ya0lEKCkpXG4gICAgICBic2l6ZSArPSBiLmxlbmd0aFxuICAgICAgYmFyci5wdXNoKGIpXG4gICAgfSlcbiAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSlcbiAgfVxuXG4gIC8qKlxuICAqIENsYXNzIHJlcHJlc2VudGluZyBBVk0gR2VuZXNpc0RhdGFcbiAgKlxuICAqIEBwYXJhbSBnZW5lc2lzQXNzZXRzIE9wdGlvbmFsIEdlbmVzaXNBc3NldFtdXG4gICogQHBhcmFtIG5ldHdvcmtJRCBPcHRpb25hbCBEZWZhdWx0TmV0d29ya0lEXG4gICovXG4gIGNvbnN0cnVjdG9yKGdlbmVzaXNBc3NldHM6IEdlbmVzaXNBc3NldFtdID0gW10sIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmdlbmVzaXNBc3NldHMgPSBnZW5lc2lzQXNzZXRzXG4gICAgdGhpcy5uZXR3b3JrSUQud3JpdGVVSW50MzJCRShuZXR3b3JrSUQsIDApXG4gIH1cbn0iXX0=