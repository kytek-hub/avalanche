"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoAPI = void 0;
const jrpcapi_1 = require("../../common/jrpcapi");
const bn_js_1 = __importDefault(require("bn.js"));
/**
 * Class for interacting with a node's InfoAPI.
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
class InfoAPI extends jrpcapi_1.JRPCAPI {
    constructor(core, baseurl = '/ext/info') {
        super(core, baseurl);
        /**
         * Fetches the blockchainID from the node for a given alias.
         *
         * @param alias The blockchain alias to get the blockchainID
         *
         * @returns Returns a Promise<string> containing the base 58 string representation of the blockchainID.
         */
        this.getBlockchainID = (alias) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                alias,
            };
            const response = yield this.callMethod('info.getBlockchainID', params);
            return response.data.result.blockchainID;
        });
        /**
         * Fetches the networkID from the node.
         *
         * @returns Returns a Promise<number> of the networkID.
         */
        this.getNetworkID = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod('info.getNetworkID');
            return response.data.result.networkID;
        });
        /**
         * Fetches the network name this node is running on
         *
         * @returns Returns a Promise<string> containing the network name.
         */
        this.getNetworkName = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod('info.getNetworkName');
            return response.data.result.networkName;
        });
        /**
         * Fetches the nodeID from the node.
         *
         * @returns Returns a Promise<string> of the nodeID.
         */
        this.getNodeID = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod('info.getNodeID');
            return response.data.result.nodeID;
        });
        /**
         * Fetches the version of Gecko this node is running
         *
         * @returns Returns a Promise<string> containing the version of Gecko.
         */
        this.getNodeVersion = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod('info.getNodeVersion');
            return response.data.result.version;
        });
        /**
         * Fetches the transaction fee from the node.
         *
         * @returns Returns a Promise<object> of the transaction fee in nAVAX.
         */
        this.getTxFee = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod('info.getTxFee');
            return {
                txFee: new bn_js_1.default(response.data.result.txFee, 10),
                creationTxFee: new bn_js_1.default(response.data.result.creationTxFee, 10)
            };
        });
        /**
         * Check whether a given chain is done bootstrapping
         * @param chain The ID or alias of a chain.
         *
         * @returns Returns a Promise<boolean> of whether the chain has completed bootstrapping.
         */
        this.isBootstrapped = (chain) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                chain
            };
            const response = yield this.callMethod('info.isBootstrapped', params);
            return response.data.result.isBootstrapped;
        });
        /**
         * Returns the peers connected to the node.
         * @param nodeIDs an optional parameter to specify what nodeID's descriptions should be returned.
         * If this parameter is left empty, descriptions for all active connections will be returned.
         * If the node is not connected to a specified nodeID, it will be omitted from the response.
         *
         * @returns Promise for the list of connected peers in PeersResponse format.
         */
        this.peers = (nodeIDs = []) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                nodeIDs
            };
            const response = yield this.callMethod('info.peers', params);
            return response.data.result.peers;
        });
    }
}
exports.InfoAPI = InfoAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvaW5mby9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBS0Esa0RBQStDO0FBRS9DLGtEQUF1QjtBQVF2Qjs7Ozs7O0dBTUc7QUFDSCxNQUFhLE9BQVEsU0FBUSxpQkFBTztJQW9HbEMsWUFBWSxJQUFrQixFQUFFLFVBQWlCLFdBQVc7UUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBbkdyRjs7Ozs7O1dBTUc7UUFDSCxvQkFBZSxHQUFHLENBQU8sS0FBYSxFQUFtQixFQUFFO1lBQ3pELE1BQU0sTUFBTSxHQUEwQjtnQkFDcEMsS0FBSzthQUNOLENBQUM7WUFFRixNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLHNCQUFzQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzVGLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDO1FBQzNDLENBQUMsQ0FBQSxDQUFDO1FBRUY7Ozs7V0FJRztRQUNILGlCQUFZLEdBQUcsR0FBMEIsRUFBRTtZQUN6QyxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDakYsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDeEMsQ0FBQyxDQUFBLENBQUM7UUFFRjs7OztXQUlHO1FBQ0gsbUJBQWMsR0FBRyxHQUEwQixFQUFFO1lBQzNDLE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUNuRixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUMxQyxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7O1dBSUc7UUFDSCxjQUFTLEdBQUcsR0FBMEIsRUFBRTtZQUN0QyxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDOUUsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDckMsQ0FBQyxDQUFBLENBQUM7UUFFRjs7OztXQUlHO1FBQ0gsbUJBQWMsR0FBRyxHQUEwQixFQUFFO1lBQzNDLE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUNuRixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUN0QyxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7O1dBSUc7UUFDSCxhQUFRLEdBQUcsR0FBa0QsRUFBRTtZQUM3RCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1lBQzdFLE9BQVE7Z0JBQ04sS0FBSyxFQUFFLElBQUksZUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7Z0JBQzdDLGFBQWEsRUFBRSxJQUFJLGVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDO2FBQzlELENBQUM7UUFDSixDQUFDLENBQUEsQ0FBQztRQUVGOzs7OztXQUtHO1FBQ0gsbUJBQWMsR0FBRyxDQUFPLEtBQWEsRUFBb0IsRUFBRTtZQUN6RCxNQUFNLE1BQU0sR0FBeUI7Z0JBQ25DLEtBQUs7YUFDTixDQUFDO1lBQ0YsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMzRixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztRQUM3QyxDQUFDLENBQUEsQ0FBQztRQUVGOzs7Ozs7O1dBT0c7UUFDSCxVQUFLLEdBQUcsQ0FBTyxVQUFvQixFQUFFLEVBQTRCLEVBQUU7WUFDakUsTUFBTSxNQUFNLEdBQWdCO2dCQUMxQixPQUFPO2FBQ1IsQ0FBQztZQUNGLE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxDQUFBO1lBQ2pGLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQ3BDLENBQUMsQ0FBQSxDQUFBO0lBRXFGLENBQUM7Q0FDeEY7QUFyR0QsMEJBcUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLUluZm9cbiAqL1xuaW1wb3J0IEF2YWxhbmNoZUNvcmUgZnJvbSAnLi4vLi4vYXZhbGFuY2hlJztcbmltcG9ydCB7IEpSUENBUEkgfSBmcm9tICcuLi8uLi9jb21tb24vanJwY2FwaSc7XG5pbXBvcnQgeyBSZXF1ZXN0UmVzcG9uc2VEYXRhIH0gZnJvbSAnLi4vLi4vY29tbW9uL2FwaWJhc2UnO1xuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiO1xuaW1wb3J0IHsgXG4gIEdldEJsb2NrY2hhaW5JRFBhcmFtcywgXG4gIElzQm9vdHN0cmFwcGVkUGFyYW1zLCBcbiAgUGVlcnNQYXJhbXMsIFxuICBQZWVyc1Jlc3BvbnNlXG59IGZyb20gJy4uLy4uL2NvbW1vbi9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBDbGFzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIG5vZGUncyBJbmZvQVBJLlxuICpcbiAqIEBjYXRlZ29yeSBSUENBUElzXG4gKlxuICogQHJlbWFya3MgVGhpcyBleHRlbmRzIHRoZSBbW0pSUENBUEldXSBjbGFzcy4gVGhpcyBjbGFzcyBzaG91bGQgbm90IGJlIGRpcmVjdGx5IGNhbGxlZC4gSW5zdGVhZCwgdXNlIHRoZSBbW0F2YWxhbmNoZS5hZGRBUEldXSBmdW5jdGlvbiB0byByZWdpc3RlciB0aGlzIGludGVyZmFjZSB3aXRoIEF2YWxhbmNoZS5cbiAqL1xuZXhwb3J0IGNsYXNzIEluZm9BUEkgZXh0ZW5kcyBKUlBDQVBJIHtcbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIGJsb2NrY2hhaW5JRCBmcm9tIHRoZSBub2RlIGZvciBhIGdpdmVuIGFsaWFzLlxuICAgKlxuICAgKiBAcGFyYW0gYWxpYXMgVGhlIGJsb2NrY2hhaW4gYWxpYXMgdG8gZ2V0IHRoZSBibG9ja2NoYWluSURcbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2U8c3RyaW5nPiBjb250YWluaW5nIHRoZSBiYXNlIDU4IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgYmxvY2tjaGFpbklELlxuICAgKi9cbiAgZ2V0QmxvY2tjaGFpbklEID0gYXN5bmMgKGFsaWFzOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogR2V0QmxvY2tjaGFpbklEUGFyYW1zID0ge1xuICAgICAgYWxpYXMsXG4gICAgfTtcblxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKCdpbmZvLmdldEJsb2NrY2hhaW5JRCcsIHBhcmFtcyk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LmJsb2NrY2hhaW5JRDtcbiAgfTtcblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgbmV0d29ya0lEIGZyb20gdGhlIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPG51bWJlcj4gb2YgdGhlIG5ldHdvcmtJRC5cbiAgICovXG4gIGdldE5ldHdvcmtJRCA9IGFzeW5jICgpOiBQcm9taXNlPG51bWJlcj4gPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKCdpbmZvLmdldE5ldHdvcmtJRCcpO1xuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5uZXR3b3JrSUQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIG5ldHdvcmsgbmFtZSB0aGlzIG5vZGUgaXMgcnVubmluZyBvblxuICAgKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZTxzdHJpbmc+IGNvbnRhaW5pbmcgdGhlIG5ldHdvcmsgbmFtZS5cbiAgICovXG4gIGdldE5ldHdvcmtOYW1lID0gYXN5bmMgKCk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoJ2luZm8uZ2V0TmV0d29ya05hbWUnKTtcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQubmV0d29ya05hbWU7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgbm9kZUlEIGZyb20gdGhlIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPHN0cmluZz4gb2YgdGhlIG5vZGVJRC5cbiAgICovXG4gIGdldE5vZGVJRCA9IGFzeW5jICgpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKCdpbmZvLmdldE5vZGVJRCcpO1xuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5ub2RlSUQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIHZlcnNpb24gb2YgR2Vja28gdGhpcyBub2RlIGlzIHJ1bm5pbmdcbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2U8c3RyaW5nPiBjb250YWluaW5nIHRoZSB2ZXJzaW9uIG9mIEdlY2tvLlxuICAgKi9cbiAgZ2V0Tm9kZVZlcnNpb24gPSBhc3luYyAoKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZCgnaW5mby5nZXROb2RlVmVyc2lvbicpO1xuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC52ZXJzaW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIHRyYW5zYWN0aW9uIGZlZSBmcm9tIHRoZSBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZTxvYmplY3Q+IG9mIHRoZSB0cmFuc2FjdGlvbiBmZWUgaW4gbkFWQVguXG4gICAqL1xuICBnZXRUeEZlZSA9IGFzeW5jICgpOiBQcm9taXNlPHt0eEZlZTogQk4sIGNyZWF0aW9uVHhGZWU6IEJOfT4gPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKCdpbmZvLmdldFR4RmVlJyk7XG4gICAgcmV0dXJuICB7XG4gICAgICB0eEZlZTogbmV3IEJOKHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4RmVlLCAxMCksXG4gICAgICBjcmVhdGlvblR4RmVlOiBuZXcgQk4ocmVzcG9uc2UuZGF0YS5yZXN1bHQuY3JlYXRpb25UeEZlZSwgMTApXG4gICAgfTtcbiAgfTtcblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhIGdpdmVuIGNoYWluIGlzIGRvbmUgYm9vdHN0cmFwcGluZ1xuICAgKiBAcGFyYW0gY2hhaW4gVGhlIElEIG9yIGFsaWFzIG9mIGEgY2hhaW4uXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPGJvb2xlYW4+IG9mIHdoZXRoZXIgdGhlIGNoYWluIGhhcyBjb21wbGV0ZWQgYm9vdHN0cmFwcGluZy5cbiAgICovXG4gIGlzQm9vdHN0cmFwcGVkID0gYXN5bmMgKGNoYWluOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IElzQm9vdHN0cmFwcGVkUGFyYW1zID0ge1xuICAgICAgY2hhaW5cbiAgICB9O1xuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKCdpbmZvLmlzQm9vdHN0cmFwcGVkJywgcGFyYW1zKTtcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuaXNCb290c3RyYXBwZWQ7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHBlZXJzIGNvbm5lY3RlZCB0byB0aGUgbm9kZS5cbiAgICogQHBhcmFtIG5vZGVJRHMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRvIHNwZWNpZnkgd2hhdCBub2RlSUQncyBkZXNjcmlwdGlvbnMgc2hvdWxkIGJlIHJldHVybmVkLiBcbiAgICogSWYgdGhpcyBwYXJhbWV0ZXIgaXMgbGVmdCBlbXB0eSwgZGVzY3JpcHRpb25zIGZvciBhbGwgYWN0aXZlIGNvbm5lY3Rpb25zIHdpbGwgYmUgcmV0dXJuZWQuIFxuICAgKiBJZiB0aGUgbm9kZSBpcyBub3QgY29ubmVjdGVkIHRvIGEgc3BlY2lmaWVkIG5vZGVJRCwgaXQgd2lsbCBiZSBvbWl0dGVkIGZyb20gdGhlIHJlc3BvbnNlLlxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciB0aGUgbGlzdCBvZiBjb25uZWN0ZWQgcGVlcnMgaW4gUGVlcnNSZXNwb25zZSBmb3JtYXQuXG4gICAqL1xuICBwZWVycyA9IGFzeW5jIChub2RlSURzOiBzdHJpbmdbXSA9IFtdKTogUHJvbWlzZTxQZWVyc1Jlc3BvbnNlW10+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IFBlZXJzUGFyYW1zID0ge1xuICAgICAgbm9kZUlEc1xuICAgIH07XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoJ2luZm8ucGVlcnMnLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnBlZXJzO1xuICB9XG5cbiAgY29uc3RydWN0b3IoY29yZTpBdmFsYW5jaGVDb3JlLCBiYXNldXJsOnN0cmluZyA9ICcvZXh0L2luZm8nKSB7IHN1cGVyKGNvcmUsIGJhc2V1cmwpOyB9XG59XG4iXX0=