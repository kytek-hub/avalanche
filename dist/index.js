"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Socket = exports.PubSub = exports.Mnemonic = exports.GenesisData = exports.GenesisAsset = exports.HDNode = exports.DB = exports.Buffer = exports.BN = exports.BinTools = exports.AvalancheCore = exports.Avalanche = void 0;
/**
 * @packageDocumentation
 * @module Avalanche
 */
const avalanche_1 = __importDefault(require("./avalanche"));
exports.AvalancheCore = avalanche_1.default;
const api_1 = require("./apis/admin/api");
const api_2 = require("./apis/auth/api");
const api_3 = require("./apis/avm/api");
const api_4 = require("./apis/evm/api");
const genesisasset_1 = require("./apis/avm/genesisasset");
Object.defineProperty(exports, "GenesisAsset", { enumerable: true, get: function () { return genesisasset_1.GenesisAsset; } });
const genesisdata_1 = require("./apis/avm/genesisdata");
Object.defineProperty(exports, "GenesisData", { enumerable: true, get: function () { return genesisdata_1.GenesisData; } });
const api_5 = require("./apis/health/api");
const api_6 = require("./apis/index/api");
const api_7 = require("./apis/info/api");
const api_8 = require("./apis/keystore/api");
const api_9 = require("./apis/metrics/api");
const api_10 = require("./apis/platformvm/api");
const socket_1 = require("./apis/socket/socket");
Object.defineProperty(exports, "Socket", { enumerable: true, get: function () { return socket_1.Socket; } });
const constants_1 = require("./utils/constants");
const helperfunctions_1 = require("./utils/helperfunctions");
const bintools_1 = __importDefault(require("./utils/bintools"));
exports.BinTools = bintools_1.default;
const db_1 = __importDefault(require("./utils/db"));
exports.DB = db_1.default;
const mnemonic_1 = __importDefault(require("./utils/mnemonic"));
exports.Mnemonic = mnemonic_1.default;
const pubsub_1 = __importDefault(require("./utils/pubsub"));
exports.PubSub = pubsub_1.default;
const hdnode_1 = __importDefault(require("./utils/hdnode"));
exports.HDNode = hdnode_1.default;
const bn_js_1 = __importDefault(require("bn.js"));
exports.BN = bn_js_1.default;
const buffer_1 = require("buffer/");
Object.defineProperty(exports, "Buffer", { enumerable: true, get: function () { return buffer_1.Buffer; } });
/**
 * AvalancheJS is middleware for interacting with Avalanche node RPC APIs.
 *
 * Example usage:
 * ```js
 * let avalanche = new Avalanche("127.0.0.1", 9650, "https")
 * ```
 *
 */
class Avalanche extends avalanche_1.default {
    /**
    * Creates a new Avalanche instance. Sets the address and port of the main Avalanche Client.
    *
    * @param host The hostname to resolve to reach the Avalanche Client RPC APIs
    * @param port The port to resolve to reach the Avalanche Client RPC APIs
    * @param protocol The protocol string to use before a "://" in a request,
    * ex: "http", "https", "git", "ws", etc ...
    * @param networkID Sets the NetworkID of the class. Default [[DefaultNetworkID]]
    * @param XChainID Sets the blockchainID for the AVM. Will try to auto-detect,
    * otherwise default "4R5p2RXDGLqaifZE4hHWH9owe34pfoBULn1DrQTWivjg8o4aH"
    * @param CChainID Sets the blockchainID for the EVM. Will try to auto-detect,
    * otherwise default "2q9e4r6Mu3U68nU1fYjgbR6JvwrRx36CohpAX5UQxse55x1Q5"
    * @param hrp The human-readable part of the bech32 addresses
    * @param skipinit Skips creating the APIs
    */
    constructor(host, port, protocol = "http", networkID = constants_1.DefaultNetworkID, XChainID = undefined, CChainID = undefined, hrp = undefined, skipinit = false) {
        super(host, port, protocol);
        /**
           * Returns a reference to the Admin RPC.
           */
        this.Admin = () => this.apis.admin;
        /**
           * Returns a reference to the Auth RPC.
           */
        this.Auth = () => this.apis.auth;
        /**
         * Returns a reference to the EVMAPI RPC pointed at the C-Chain.
         */
        this.CChain = () => this.apis.cchain;
        /**
           * Returns a reference to the AVM RPC pointed at the X-Chain.
           */
        this.XChain = () => this.apis.xchain;
        /**
           * Returns a reference to the Health RPC for a node.
           */
        this.Health = () => this.apis.health;
        /**
           * Returns a reference to the Index RPC for a node.
           */
        this.Index = () => this.apis.index;
        /**
           * Returns a reference to the Info RPC for a node.
           */
        this.Info = () => this.apis.info;
        /**
           * Returns a reference to the Metrics RPC.
           */
        this.Metrics = () => this.apis.metrics;
        /**
           * Returns a reference to the Keystore RPC for a node. We label it "NodeKeys" to reduce
           * confusion about what it's accessing.
           */
        this.NodeKeys = () => this.apis.keystore;
        /**
           * Returns a reference to the PlatformVM RPC pointed at the P-Chain.
           */
        this.PChain = () => this.apis.pchain;
        let xchainid = XChainID;
        let cchainid = CChainID;
        if (typeof XChainID === "undefined" || !XChainID || XChainID.toLowerCase() === "x") {
            if (networkID.toString() in constants_1.Defaults.network) {
                xchainid = constants_1.Defaults.network[networkID].X.blockchainID;
            }
            else {
                xchainid = constants_1.Defaults.network[12345].X.blockchainID;
            }
        }
        if (typeof CChainID === "undefined" || !CChainID || CChainID.toLowerCase() === "c") {
            if (networkID.toString() in constants_1.Defaults.network) {
                cchainid = constants_1.Defaults.network[networkID].C.blockchainID;
            }
            else {
                cchainid = constants_1.Defaults.network[12345].C.blockchainID;
            }
        }
        if (typeof networkID === "number" && networkID >= 0) {
            this.networkID = networkID;
        }
        else if (typeof networkID === "undefined") {
            networkID = constants_1.DefaultNetworkID;
        }
        if (typeof hrp !== "undefined") {
            this.hrp = hrp;
        }
        else {
            this.hrp = helperfunctions_1.getPreferredHRP(this.networkID);
        }
        if (!skipinit) {
            this.addAPI("admin", api_1.AdminAPI);
            this.addAPI("auth", api_2.AuthAPI);
            this.addAPI("xchain", api_3.AVMAPI, "/ext/bc/X", xchainid);
            this.addAPI("cchain", api_4.EVMAPI, "/ext/bc/C/avax", cchainid);
            this.addAPI("health", api_5.HealthAPI);
            this.addAPI("info", api_7.InfoAPI);
            this.addAPI("index", api_6.IndexAPI);
            this.addAPI("keystore", api_8.KeystoreAPI);
            this.addAPI("metrics", api_9.MetricsAPI);
            this.addAPI("pchain", api_10.PlatformVMAPI);
        }
    }
}
exports.default = Avalanche;
exports.Avalanche = Avalanche;
exports.admin = __importStar(require("./apis/admin"));
exports.auth = __importStar(require("./apis/auth"));
exports.avm = __importStar(require("./apis/avm"));
exports.common = __importStar(require("./common"));
exports.evm = __importStar(require("./apis/evm"));
exports.health = __importStar(require("./apis/health"));
exports.index = __importStar(require("./apis/index"));
exports.info = __importStar(require("./apis/info"));
exports.keystore = __importStar(require("./apis/keystore"));
exports.metrics = __importStar(require("./apis/metrics"));
exports.platformvm = __importStar(require("./apis/platformvm"));
exports.utils = __importStar(require("./utils"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7R0FHRztBQUNILDREQUF1QztBQTJKOUIsd0JBM0pGLG1CQUFhLENBMkpFO0FBMUp0QiwwQ0FBMkM7QUFDM0MseUNBQXlDO0FBQ3pDLHdDQUF1QztBQUN2Qyx3Q0FBdUM7QUFDdkMsMERBQXNEO0FBNEo3Qyw2RkE1SkEsMkJBQVksT0E0SkE7QUEzSnJCLHdEQUFvRDtBQTRKM0MsNEZBNUpBLHlCQUFXLE9BNEpBO0FBM0pwQiwyQ0FBNkM7QUFDN0MsMENBQTJDO0FBQzNDLHlDQUF5QztBQUN6Qyw2Q0FBaUQ7QUFDakQsNENBQStDO0FBQy9DLGdEQUFxRDtBQUNyRCxpREFBNkM7QUF3SnBDLHVGQXhKQSxlQUFNLE9Bd0pBO0FBdkpmLGlEQUE4RDtBQUM5RCw2REFBeUQ7QUFDekQsZ0VBQXVDO0FBNEk5QixtQkE1SUYsa0JBQVEsQ0E0SUU7QUEzSWpCLG9EQUEyQjtBQThJbEIsYUE5SUYsWUFBRSxDQThJRTtBQTdJWCxnRUFBdUM7QUFpSjlCLG1CQWpKRixrQkFBUSxDQWlKRTtBQWhKakIsNERBQW1DO0FBaUoxQixpQkFqSkYsZ0JBQU0sQ0FpSkU7QUFoSmYsNERBQW1DO0FBNEkxQixpQkE1SUYsZ0JBQU0sQ0E0SUU7QUEzSWYsa0RBQXNCO0FBd0liLGFBeElGLGVBQUUsQ0F3SUU7QUF2SVgsb0NBQWdDO0FBd0l2Qix1RkF4SUEsZUFBTSxPQXdJQTtBQXRJZjs7Ozs7Ozs7R0FRRztBQUNILE1BQXFCLFNBQVUsU0FBUSxtQkFBYTtJQW9EbEQ7Ozs7Ozs7Ozs7Ozs7O01BY0U7SUFDRixZQUNFLElBQVksRUFDWixJQUFZLEVBQ1osV0FBbUIsTUFBTSxFQUN6QixZQUFvQiw0QkFBZ0IsRUFDcEMsV0FBbUIsU0FBUyxFQUM1QixXQUFtQixTQUFTLEVBQzVCLE1BQWMsU0FB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RUQsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLGNBQVEsQ0FBQyxDQUFBO1lBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGFBQU8sQ0FBQyxDQUFBO1lBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLFlBQU0sRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUE7WUFDcEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsWUFBTSxFQUFFLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxDQUFBO1lBQ3pELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLGVBQVMsQ0FBQyxDQUFBO1lBQ2hDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLGFBQU8sQ0FBQyxDQUFBO1lBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLGNBQVEsQ0FBQyxDQUFBO1lBQzlCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLGlCQUFXLENBQUMsQ0FBQTtZQUNwQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxnQkFBVSxDQUFDLENBQUE7WUFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsb0JBQWEsQ0FBQyxDQUFBO1NBQ3JDO0lBQ0gsQ0FBQztDQUNGO0FBdkhELDRCQXVIQztBQUVRLDhCQUFTO0FBYWxCLHNEQUFxQztBQUNyQyxvREFBbUM7QUFDbkMsa0RBQWlDO0FBQ2pDLG1EQUFrQztBQUNsQyxrREFBaUM7QUFDakMsd0RBQXVDO0FBQ3ZDLHNEQUFxQztBQUNyQyxvREFBbUM7QUFDbkMsNERBQTJDO0FBQzNDLDBEQUF5QztBQUN6QyxnRUFBK0M7QUFDL0MsaURBQWdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQXZhbGFuY2hlXG4gKi9cbmltcG9ydCBBdmFsYW5jaGVDb3JlIGZyb20gXCIuL2F2YWxhbmNoZVwiXG5pbXBvcnQgeyBBZG1pbkFQSSB9IGZyb20gXCIuL2FwaXMvYWRtaW4vYXBpXCJcbmltcG9ydCB7IEF1dGhBUEkgfSBmcm9tIFwiLi9hcGlzL2F1dGgvYXBpXCJcbmltcG9ydCB7IEFWTUFQSSB9IGZyb20gXCIuL2FwaXMvYXZtL2FwaVwiXG5pbXBvcnQgeyBFVk1BUEkgfSBmcm9tIFwiLi9hcGlzL2V2bS9hcGlcIlxuaW1wb3J0IHsgR2VuZXNpc0Fzc2V0IH0gZnJvbSBcIi4vYXBpcy9hdm0vZ2VuZXNpc2Fzc2V0XCJcbmltcG9ydCB7IEdlbmVzaXNEYXRhIH0gZnJvbSBcIi4vYXBpcy9hdm0vZ2VuZXNpc2RhdGFcIlxuaW1wb3J0IHsgSGVhbHRoQVBJIH0gZnJvbSBcIi4vYXBpcy9oZWFsdGgvYXBpXCJcbmltcG9ydCB7IEluZGV4QVBJIH0gZnJvbSBcIi4vYXBpcy9pbmRleC9hcGlcIlxuaW1wb3J0IHsgSW5mb0FQSSB9IGZyb20gXCIuL2FwaXMvaW5mby9hcGlcIlxuaW1wb3J0IHsgS2V5c3RvcmVBUEkgfSBmcm9tIFwiLi9hcGlzL2tleXN0b3JlL2FwaVwiXG5pbXBvcnQgeyBNZXRyaWNzQVBJIH0gZnJvbSBcIi4vYXBpcy9tZXRyaWNzL2FwaVwiXG5pbXBvcnQgeyBQbGF0Zm9ybVZNQVBJIH0gZnJvbSBcIi4vYXBpcy9wbGF0Zm9ybXZtL2FwaVwiXG5pbXBvcnQgeyBTb2NrZXQgfSBmcm9tIFwiLi9hcGlzL3NvY2tldC9zb2NrZXRcIlxuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCwgRGVmYXVsdHMgfSBmcm9tIFwiLi91dGlscy9jb25zdGFudHNcIlxuaW1wb3J0IHsgZ2V0UHJlZmVycmVkSFJQIH0gZnJvbSBcIi4vdXRpbHMvaGVscGVyZnVuY3Rpb25zXCJcbmltcG9ydCBCaW5Ub29scyBmcm9tIFwiLi91dGlscy9iaW50b29sc1wiXG5pbXBvcnQgREIgZnJvbSBcIi4vdXRpbHMvZGJcIlxuaW1wb3J0IE1uZW1vbmljIGZyb20gXCIuL3V0aWxzL21uZW1vbmljXCJcbmltcG9ydCBQdWJTdWIgZnJvbSBcIi4vdXRpbHMvcHVic3ViXCJcbmltcG9ydCBIRE5vZGUgZnJvbSBcIi4vdXRpbHMvaGRub2RlXCJcbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuXG4vKipcbiAqIEF2YWxhbmNoZUpTIGlzIG1pZGRsZXdhcmUgZm9yIGludGVyYWN0aW5nIHdpdGggQXZhbGFuY2hlIG5vZGUgUlBDIEFQSXMuXG4gKlxuICogRXhhbXBsZSB1c2FnZTpcbiAqIGBgYGpzXG4gKiBsZXQgYXZhbGFuY2hlID0gbmV3IEF2YWxhbmNoZShcIjEyNy4wLjAuMVwiLCA5NjUwLCBcImh0dHBzXCIpXG4gKiBgYGBcbiAqXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF2YWxhbmNoZSBleHRlbmRzIEF2YWxhbmNoZUNvcmUge1xuICAvKipcbiAgICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBBZG1pbiBSUEMuXG4gICAgICovXG4gIEFkbWluID0gKCkgPT4gdGhpcy5hcGlzLmFkbWluIGFzIEFkbWluQVBJXG5cbiAgLyoqXG4gICAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgQXV0aCBSUEMuXG4gICAgICovXG4gIEF1dGggPSAoKSA9PiB0aGlzLmFwaXMuYXV0aCBhcyBBdXRoQVBJXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIEVWTUFQSSBSUEMgcG9pbnRlZCBhdCB0aGUgQy1DaGFpbi5cbiAgICovXG4gIENDaGFpbiA9ICgpID0+IHRoaXMuYXBpcy5jY2hhaW4gYXMgRVZNQVBJXG5cbiAgLyoqXG4gICAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgQVZNIFJQQyBwb2ludGVkIGF0IHRoZSBYLUNoYWluLlxuICAgICAqL1xuICBYQ2hhaW4gPSAoKSA9PiB0aGlzLmFwaXMueGNoYWluIGFzIEFWTUFQSVxuXG4gIC8qKlxuICAgICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIEhlYWx0aCBSUEMgZm9yIGEgbm9kZS5cbiAgICAgKi9cbiAgSGVhbHRoID0gKCkgPT4gdGhpcy5hcGlzLmhlYWx0aCBhcyBIZWFsdGhBUElcblxuICAvKipcbiAgICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBJbmRleCBSUEMgZm9yIGEgbm9kZS5cbiAgICAgKi9cbiAgSW5kZXggPSAoKSA9PiB0aGlzLmFwaXMuaW5kZXggYXMgSW5kZXhBUElcblxuICAvKipcbiAgICAgKiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBJbmZvIFJQQyBmb3IgYSBub2RlLlxuICAgICAqL1xuICBJbmZvID0gKCkgPT4gdGhpcy5hcGlzLmluZm8gYXMgSW5mb0FQSVxuXG4gIC8qKlxuICAgICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIE1ldHJpY3MgUlBDLlxuICAgICAqL1xuICBNZXRyaWNzID0gKCkgPT4gdGhpcy5hcGlzLm1ldHJpY3MgYXMgTWV0cmljc0FQSVxuXG4gIC8qKlxuICAgICAqIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIEtleXN0b3JlIFJQQyBmb3IgYSBub2RlLiBXZSBsYWJlbCBpdCBcIk5vZGVLZXlzXCIgdG8gcmVkdWNlXG4gICAgICogY29uZnVzaW9uIGFib3V0IHdoYXQgaXQncyBhY2Nlc3NpbmcuXG4gICAgICovXG4gIE5vZGVLZXlzID0gKCkgPT4gdGhpcy5hcGlzLmtleXN0b3JlIGFzIEtleXN0b3JlQVBJXG5cbiAgLyoqXG4gICAgICogUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgUGxhdGZvcm1WTSBSUEMgcG9pbnRlZCBhdCB0aGUgUC1DaGFpbi5cbiAgICAgKi9cbiAgUENoYWluID0gKCkgPT4gdGhpcy5hcGlzLnBjaGFpbiBhcyBQbGF0Zm9ybVZNQVBJXG5cbiAgLyoqXG4gICogQ3JlYXRlcyBhIG5ldyBBdmFsYW5jaGUgaW5zdGFuY2UuIFNldHMgdGhlIGFkZHJlc3MgYW5kIHBvcnQgb2YgdGhlIG1haW4gQXZhbGFuY2hlIENsaWVudC5cbiAgKlxuICAqIEBwYXJhbSBob3N0IFRoZSBob3N0bmFtZSB0byByZXNvbHZlIHRvIHJlYWNoIHRoZSBBdmFsYW5jaGUgQ2xpZW50IFJQQyBBUElzXG4gICogQHBhcmFtIHBvcnQgVGhlIHBvcnQgdG8gcmVzb2x2ZSB0byByZWFjaCB0aGUgQXZhbGFuY2hlIENsaWVudCBSUEMgQVBJc1xuICAqIEBwYXJhbSBwcm90b2NvbCBUaGUgcHJvdG9jb2wgc3RyaW5nIHRvIHVzZSBiZWZvcmUgYSBcIjovL1wiIGluIGEgcmVxdWVzdCxcbiAgKiBleDogXCJodHRwXCIsIFwiaHR0cHNcIiwgXCJnaXRcIiwgXCJ3c1wiLCBldGMgLi4uXG4gICogQHBhcmFtIG5ldHdvcmtJRCBTZXRzIHRoZSBOZXR3b3JrSUQgb2YgdGhlIGNsYXNzLiBEZWZhdWx0IFtbRGVmYXVsdE5ldHdvcmtJRF1dXG4gICogQHBhcmFtIFhDaGFpbklEIFNldHMgdGhlIGJsb2NrY2hhaW5JRCBmb3IgdGhlIEFWTS4gV2lsbCB0cnkgdG8gYXV0by1kZXRlY3QsXG4gICogb3RoZXJ3aXNlIGRlZmF1bHQgXCI0UjVwMlJYREdMcWFpZlpFNGhIV0g5b3dlMzRwZm9CVUxuMURyUVRXaXZqZzhvNGFIXCJcbiAgKiBAcGFyYW0gQ0NoYWluSUQgU2V0cyB0aGUgYmxvY2tjaGFpbklEIGZvciB0aGUgRVZNLiBXaWxsIHRyeSB0byBhdXRvLWRldGVjdCxcbiAgKiBvdGhlcndpc2UgZGVmYXVsdCBcIjJxOWU0cjZNdTNVNjhuVTFmWWpnYlI2SnZ3clJ4MzZDb2hwQVg1VVF4c2U1NXgxUTVcIlxuICAqIEBwYXJhbSBocnAgVGhlIGh1bWFuLXJlYWRhYmxlIHBhcnQgb2YgdGhlIGJlY2gzMiBhZGRyZXNzZXNcbiAgKiBAcGFyYW0gc2tpcGluaXQgU2tpcHMgY3JlYXRpbmcgdGhlIEFQSXNcbiAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgaG9zdDogc3RyaW5nLFxuICAgIHBvcnQ6IG51bWJlcixcbiAgICBwcm90b2NvbDogc3RyaW5nID0gXCJodHRwXCIsXG4gICAgbmV0d29ya0lEOiBudW1iZXIgPSBEZWZhdWx0TmV0d29ya0lELFxuICAgIFhDaGFpbklEOiBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgQ0NoYWluSUQ6IHN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICBocnA6IHN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICBza2lwaW5pdDogYm9vbGVhbiA9IGZhbHNlXG4gICkge1xuICAgIHN1cGVyKGhvc3QsIHBvcnQsIHByb3RvY29sKVxuICAgIGxldCB4Y2hhaW5pZDogc3RyaW5nID0gWENoYWluSURcbiAgICBsZXQgY2NoYWluaWQ6IHN0cmluZyA9IENDaGFpbklEXG5cbiAgICBpZiAodHlwZW9mIFhDaGFpbklEID09PSBcInVuZGVmaW5lZFwiIHx8ICFYQ2hhaW5JRCB8fCBYQ2hhaW5JRC50b0xvd2VyQ2FzZSgpID09PSBcInhcIikge1xuICAgICAgaWYgKG5ldHdvcmtJRC50b1N0cmluZygpIGluIERlZmF1bHRzLm5ldHdvcmspIHtcbiAgICAgICAgeGNoYWluaWQgPSBEZWZhdWx0cy5uZXR3b3JrW25ldHdvcmtJRF0uWC5ibG9ja2NoYWluSURcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHhjaGFpbmlkID0gRGVmYXVsdHMubmV0d29ya1sxMjM0NV0uWC5ibG9ja2NoYWluSURcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBDQ2hhaW5JRCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhQ0NoYWluSUQgfHwgQ0NoYWluSUQudG9Mb3dlckNhc2UoKSA9PT0gXCJjXCIpIHtcbiAgICAgIGlmIChuZXR3b3JrSUQudG9TdHJpbmcoKSBpbiBEZWZhdWx0cy5uZXR3b3JrKSB7XG4gICAgICAgIGNjaGFpbmlkID0gRGVmYXVsdHMubmV0d29ya1tuZXR3b3JrSURdLkMuYmxvY2tjaGFpbklEXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjY2hhaW5pZCA9IERlZmF1bHRzLm5ldHdvcmtbMTIzNDVdLkMuYmxvY2tjaGFpbklEXG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0eXBlb2YgbmV0d29ya0lEID09PSBcIm51bWJlclwiICYmIG5ldHdvcmtJRCA+PSAwKSB7XG4gICAgICB0aGlzLm5ldHdvcmtJRCA9IG5ldHdvcmtJRFxuICAgIH0gZWxzZSBpZih0eXBlb2YgbmV0d29ya0lEID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgIG5ldHdvcmtJRCA9IERlZmF1bHROZXR3b3JrSURcbiAgICB9XG4gICAgaWYodHlwZW9mIGhycCAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICB0aGlzLmhycCA9IGhycFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmhycCA9IGdldFByZWZlcnJlZEhSUCh0aGlzLm5ldHdvcmtJRClcbiAgICB9XG4gICAgXG4gICAgaWYgKCFza2lwaW5pdCkge1xuICAgICAgdGhpcy5hZGRBUEkoXCJhZG1pblwiLCBBZG1pbkFQSSlcbiAgICAgIHRoaXMuYWRkQVBJKFwiYXV0aFwiLCBBdXRoQVBJKVxuICAgICAgdGhpcy5hZGRBUEkoXCJ4Y2hhaW5cIiwgQVZNQVBJLCBcIi9leHQvYmMvWFwiLCB4Y2hhaW5pZClcbiAgICAgIHRoaXMuYWRkQVBJKFwiY2NoYWluXCIsIEVWTUFQSSwgXCIvZXh0L2JjL0MvYXZheFwiLCBjY2hhaW5pZClcbiAgICAgIHRoaXMuYWRkQVBJKFwiaGVhbHRoXCIsIEhlYWx0aEFQSSlcbiAgICAgIHRoaXMuYWRkQVBJKFwiaW5mb1wiLCBJbmZvQVBJKVxuICAgICAgdGhpcy5hZGRBUEkoXCJpbmRleFwiLCBJbmRleEFQSSlcbiAgICAgIHRoaXMuYWRkQVBJKFwia2V5c3RvcmVcIiwgS2V5c3RvcmVBUEkpXG4gICAgICB0aGlzLmFkZEFQSShcIm1ldHJpY3NcIiwgTWV0cmljc0FQSSlcbiAgICAgIHRoaXMuYWRkQVBJKFwicGNoYWluXCIsIFBsYXRmb3JtVk1BUEkpXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IEF2YWxhbmNoZSB9XG5leHBvcnQgeyBBdmFsYW5jaGVDb3JlIH1cbmV4cG9ydCB7IEJpblRvb2xzIH1cbmV4cG9ydCB7IEJOIH1cbmV4cG9ydCB7IEJ1ZmZlciB9XG5leHBvcnQgeyBEQiB9XG5leHBvcnQgeyBIRE5vZGUgfVxuZXhwb3J0IHsgR2VuZXNpc0Fzc2V0IH1cbmV4cG9ydCB7IEdlbmVzaXNEYXRhIH1cbmV4cG9ydCB7IE1uZW1vbmljIH1cbmV4cG9ydCB7IFB1YlN1YiB9XG5leHBvcnQgeyBTb2NrZXQgfVxuXG5leHBvcnQgKiBhcyBhZG1pbiBmcm9tIFwiLi9hcGlzL2FkbWluXCJcbmV4cG9ydCAqIGFzIGF1dGggZnJvbSBcIi4vYXBpcy9hdXRoXCJcbmV4cG9ydCAqIGFzIGF2bSBmcm9tIFwiLi9hcGlzL2F2bVwiXG5leHBvcnQgKiBhcyBjb21tb24gZnJvbSBcIi4vY29tbW9uXCJcbmV4cG9ydCAqIGFzIGV2bSBmcm9tIFwiLi9hcGlzL2V2bVwiXG5leHBvcnQgKiBhcyBoZWFsdGggZnJvbSBcIi4vYXBpcy9oZWFsdGhcIlxuZXhwb3J0ICogYXMgaW5kZXggZnJvbSBcIi4vYXBpcy9pbmRleFwiXG5leHBvcnQgKiBhcyBpbmZvIGZyb20gXCIuL2FwaXMvaW5mb1wiXG5leHBvcnQgKiBhcyBrZXlzdG9yZSBmcm9tIFwiLi9hcGlzL2tleXN0b3JlXCJcbmV4cG9ydCAqIGFzIG1ldHJpY3MgZnJvbSBcIi4vYXBpcy9tZXRyaWNzXCJcbmV4cG9ydCAqIGFzIHBsYXRmb3Jtdm0gZnJvbSBcIi4vYXBpcy9wbGF0Zm9ybXZtXCJcbmV4cG9ydCAqIGFzIHV0aWxzIGZyb20gXCIuL3V0aWxzXCIiXX0=