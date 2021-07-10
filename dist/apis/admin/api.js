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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminAPI = void 0;
const jrpcapi_1 = require("../../common/jrpcapi");
/**
* Class for interacting with a node's AdminAPI.
*
* @category RPCAPIs
*
* @remarks This extends the [[JRPCAPI]] class. This class should not be directly called.
* Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
*/
class AdminAPI extends jrpcapi_1.JRPCAPI {
    /**
    * This class should not be instantiated directly. Instead use the [[Avalanche.addAPI]]
    * method.
    *
    * @param core A reference to the Avalanche class
    * @param baseurl Defaults to the string "/ext/admin" as the path to rpc's baseurl
    */
    constructor(core, baseurl = "/ext/admin") {
        super(core, baseurl);
        /**
        * Assign an API an alias, a different endpoint for the API. The original endpoint will still
        * work. This change only affects this node other nodes will not know about this alias.
        *
        * @param endpoint The original endpoint of the API. endpoint should only include the part of
        * the endpoint after /ext/
        * @param alias The API being aliased can now be called at ext/alias
        *
        * @returns Returns a Promise<boolean> containing success, true for success, false for failure.
        */
        this.alias = (endpoint, alias) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                endpoint,
                alias,
            };
            const response = yield this.callMethod("admin.alias", params);
            return response.data.result.success;
        });
        /**
        * Give a blockchain an alias, a different name that can be used any place the blockchain’s
        * ID is used.
        *
        * @param endpoint The blockchain’s ID
        * @param alias Can now be used in place of the blockchain’s ID (in API endpoints, for example)
        *
        * @returns Returns a Promise<boolean> containing success, true for success, false for failure.
        */
        this.aliasChain = (chain, alias) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                chain,
                alias
            };
            const response = yield this.callMethod("admin.aliasChain", params);
            return response.data.result.success;
        });
        /**
        * Get all aliases for given blockchain
        *
        * @param chain The blockchain’s ID
        *
        * @returns Returns a Promise<string[]> containing aliases of the blockchain.
        */
        this.getChainAliases = (chain) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                chain
            };
            const response = yield this.callMethod("admin.getChainAliases", params);
            return response.data.result.aliases;
        });
        /**
        * Dump the mutex statistics of the node to the specified file.
        *
        * @returns Promise for a boolean that is true on success.
        */
        this.lockProfile = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("admin.lockProfile");
            return response.data.result.success;
        });
        /**
        * Dump the current memory footprint of the node to the specified file.
        *
        * @returns Promise for a boolean that is true on success.
        */
        this.memoryProfile = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("admin.memoryProfile");
            return response.data.result.success;
        });
        /**
        * Start profiling the cpu utilization of the node. Will dump the profile information into
        * the specified file on stop.
        *
        * @returns Promise for a boolean that is true on success.
        */
        this.startCPUProfiler = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("admin.startCPUProfiler");
            return response.data.result.success;
        });
        /**
        * Stop the CPU profile that was previously started.
        *
        * @returns Promise for a boolean that is true on success.
        */
        this.stopCPUProfiler = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("admin.stopCPUProfiler");
            return response.data.result.success;
        });
    }
}
exports.AdminAPI = AdminAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvYWRtaW4vYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUtBLGtEQUE4QztBQUk5Qzs7Ozs7OztFQU9FO0FBRUYsTUFBYSxRQUFTLFNBQVEsaUJBQU87SUErRm5DOzs7Ozs7TUFNRTtJQUNGLFlBQVksSUFBbUIsRUFBRSxVQUFrQixZQUFZO1FBQUksS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQTtRQXBHdkY7Ozs7Ozs7OztVQVNFO1FBQ0YsVUFBSyxHQUFHLENBQU8sUUFBZ0IsRUFBRSxLQUFhLEVBQW9CLEVBQUU7WUFDbEUsTUFBTSxNQUFNLEdBQVE7Z0JBQ2xCLFFBQVE7Z0JBQ1IsS0FBSzthQUNOLENBQUE7WUFDRCxNQUFNLFFBQVEsR0FBd0IsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxNQUFNLENBQUMsQ0FBQTtZQUNsRixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQTtRQUNyQyxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7Ozs7OztVQVFFO1FBQ0YsZUFBVSxHQUFHLENBQU8sS0FBYSxFQUFFLEtBQWEsRUFBb0IsRUFBRTtZQUNwRSxNQUFNLE1BQU0sR0FBUTtnQkFDbEIsS0FBSztnQkFDTCxLQUFLO2FBQ04sQ0FBQTtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFDdkYsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUE7UUFDckMsQ0FBQyxDQUFBLENBQUE7UUFFRDs7Ozs7O1VBTUU7UUFDRixvQkFBZSxHQUFHLENBQU8sS0FBYSxFQUFxQixFQUFFO1lBQzNELE1BQU0sTUFBTSxHQUFRO2dCQUNsQixLQUFLO2FBQ04sQ0FBQTtZQUNELE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsdUJBQXVCLEVBQUUsTUFBTSxDQUFDLENBQUE7WUFDNUYsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUE7UUFDckMsQ0FBQyxDQUFBLENBQUE7UUFFRDs7OztVQUlFO1FBQ0YsZ0JBQVcsR0FBRyxHQUEyQixFQUFFO1lBQ3pDLE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsbUJBQW1CLENBQUMsQ0FBQTtZQUNoRixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQTtRQUNyQyxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7O1VBSUU7UUFDRixrQkFBYSxHQUFHLEdBQTJCLEVBQUU7WUFDM0MsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO1lBQ2xGLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFBO1FBQ3JDLENBQUMsQ0FBQSxDQUFBO1FBRUQ7Ozs7O1VBS0U7UUFDRixxQkFBZ0IsR0FBRyxHQUEyQixFQUFFO1lBQzlDLE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsd0JBQXdCLENBQUMsQ0FBQTtZQUNyRixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQTtRQUNyQyxDQUFDLENBQUEsQ0FBQTtRQUVEOzs7O1VBSUU7UUFDRixvQkFBZSxHQUFHLEdBQTJCLEVBQUU7WUFDN0MsTUFBTSxRQUFRLEdBQXdCLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFBO1lBQ3BGLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFBO1FBQ3JDLENBQUMsQ0FBQSxDQUFBO0lBU3VGLENBQUM7Q0FDMUY7QUF2R0QsNEJBdUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLUFkbWluXG4gKi9cbmltcG9ydCBBdmFsYW5jaGVDb3JlIGZyb20gXCIuLi8uLi9hdmFsYW5jaGVcIlxuaW1wb3J0IHsgSlJQQ0FQSSB9IGZyb20gXCIuLi8uLi9jb21tb24vanJwY2FwaVwiXG5pbXBvcnQgeyBSZXF1ZXN0UmVzcG9uc2VEYXRhIH0gZnJvbSBcIi4uLy4uL2NvbW1vbi9hcGliYXNlXCJcblxuXG4vKipcbiogQ2xhc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBub2RlJ3MgQWRtaW5BUEkuXG4qXG4qIEBjYXRlZ29yeSBSUENBUElzXG4qXG4qIEByZW1hcmtzIFRoaXMgZXh0ZW5kcyB0aGUgW1tKUlBDQVBJXV0gY2xhc3MuIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBkaXJlY3RseSBjYWxsZWQuXG4qIEluc3RlYWQsIHVzZSB0aGUgW1tBdmFsYW5jaGUuYWRkQVBJXV0gZnVuY3Rpb24gdG8gcmVnaXN0ZXIgdGhpcyBpbnRlcmZhY2Ugd2l0aCBBdmFsYW5jaGUuXG4qL1xuXG5leHBvcnQgY2xhc3MgQWRtaW5BUEkgZXh0ZW5kcyBKUlBDQVBJIHtcblxuICAvKipcbiAgKiBBc3NpZ24gYW4gQVBJIGFuIGFsaWFzLCBhIGRpZmZlcmVudCBlbmRwb2ludCBmb3IgdGhlIEFQSS4gVGhlIG9yaWdpbmFsIGVuZHBvaW50IHdpbGwgc3RpbGxcbiAgKiB3b3JrLiBUaGlzIGNoYW5nZSBvbmx5IGFmZmVjdHMgdGhpcyBub2RlIG90aGVyIG5vZGVzIHdpbGwgbm90IGtub3cgYWJvdXQgdGhpcyBhbGlhcy5cbiAgKlxuICAqIEBwYXJhbSBlbmRwb2ludCBUaGUgb3JpZ2luYWwgZW5kcG9pbnQgb2YgdGhlIEFQSS4gZW5kcG9pbnQgc2hvdWxkIG9ubHkgaW5jbHVkZSB0aGUgcGFydCBvZlxuICAqIHRoZSBlbmRwb2ludCBhZnRlciAvZXh0L1xuICAqIEBwYXJhbSBhbGlhcyBUaGUgQVBJIGJlaW5nIGFsaWFzZWQgY2FuIG5vdyBiZSBjYWxsZWQgYXQgZXh0L2FsaWFzXG4gICpcbiAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZTxib29sZWFuPiBjb250YWluaW5nIHN1Y2Nlc3MsIHRydWUgZm9yIHN1Y2Nlc3MsIGZhbHNlIGZvciBmYWlsdXJlLlxuICAqL1xuICBhbGlhcyA9IGFzeW5jIChlbmRwb2ludDogc3RyaW5nLCBhbGlhczogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICBlbmRwb2ludCxcbiAgICAgIGFsaWFzLFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcImFkbWluLmFsaWFzXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuc3VjY2Vzc1xuICB9XG5cbiAgLyoqXG4gICogR2l2ZSBhIGJsb2NrY2hhaW4gYW4gYWxpYXMsIGEgZGlmZmVyZW50IG5hbWUgdGhhdCBjYW4gYmUgdXNlZCBhbnkgcGxhY2UgdGhlIGJsb2NrY2hhaW7igJlzXG4gICogSUQgaXMgdXNlZC5cbiAgKlxuICAqIEBwYXJhbSBlbmRwb2ludCBUaGUgYmxvY2tjaGFpbuKAmXMgSURcbiAgKiBAcGFyYW0gYWxpYXMgQ2FuIG5vdyBiZSB1c2VkIGluIHBsYWNlIG9mIHRoZSBibG9ja2NoYWlu4oCZcyBJRCAoaW4gQVBJIGVuZHBvaW50cywgZm9yIGV4YW1wbGUpXG4gICpcbiAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZTxib29sZWFuPiBjb250YWluaW5nIHN1Y2Nlc3MsIHRydWUgZm9yIHN1Y2Nlc3MsIGZhbHNlIGZvciBmYWlsdXJlLlxuICAqL1xuICBhbGlhc0NoYWluID0gYXN5bmMgKGNoYWluOiBzdHJpbmcsIGFsaWFzOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIGNoYWluLFxuICAgICAgYWxpYXNcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJhZG1pbi5hbGlhc0NoYWluXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuc3VjY2Vzc1xuICB9XG5cbiAgLyoqXG4gICogR2V0IGFsbCBhbGlhc2VzIGZvciBnaXZlbiBibG9ja2NoYWluXG4gICpcbiAgKiBAcGFyYW0gY2hhaW4gVGhlIGJsb2NrY2hhaW7igJlzIElEXG4gICpcbiAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZTxzdHJpbmdbXT4gY29udGFpbmluZyBhbGlhc2VzIG9mIHRoZSBibG9ja2NoYWluLlxuICAqL1xuICBnZXRDaGFpbkFsaWFzZXMgPSBhc3luYyAoY2hhaW46IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIGNoYWluXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwiYWRtaW4uZ2V0Q2hhaW5BbGlhc2VzXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuYWxpYXNlc1xuICB9XG5cbiAgLyoqXG4gICogRHVtcCB0aGUgbXV0ZXggc3RhdGlzdGljcyBvZiB0aGUgbm9kZSB0byB0aGUgc3BlY2lmaWVkIGZpbGUuXG4gICpcbiAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhIGJvb2xlYW4gdGhhdCBpcyB0cnVlIG9uIHN1Y2Nlc3MuXG4gICovXG4gIGxvY2tQcm9maWxlID0gYXN5bmMgKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwiYWRtaW4ubG9ja1Byb2ZpbGVcIilcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuc3VjY2Vzc1xuICB9XG5cbiAgLyoqXG4gICogRHVtcCB0aGUgY3VycmVudCBtZW1vcnkgZm9vdHByaW50IG9mIHRoZSBub2RlIHRvIHRoZSBzcGVjaWZpZWQgZmlsZS5cbiAgKlxuICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGEgYm9vbGVhbiB0aGF0IGlzIHRydWUgb24gc3VjY2Vzcy5cbiAgKi9cbiAgbWVtb3J5UHJvZmlsZSA9IGFzeW5jICgpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcImFkbWluLm1lbW9yeVByb2ZpbGVcIilcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuc3VjY2Vzc1xuICB9XG5cbiAgLyoqXG4gICogU3RhcnQgcHJvZmlsaW5nIHRoZSBjcHUgdXRpbGl6YXRpb24gb2YgdGhlIG5vZGUuIFdpbGwgZHVtcCB0aGUgcHJvZmlsZSBpbmZvcm1hdGlvbiBpbnRvXG4gICogdGhlIHNwZWNpZmllZCBmaWxlIG9uIHN0b3AuXG4gICpcbiAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhIGJvb2xlYW4gdGhhdCBpcyB0cnVlIG9uIHN1Y2Nlc3MuXG4gICovXG4gIHN0YXJ0Q1BVUHJvZmlsZXIgPSBhc3luYyAoKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJhZG1pbi5zdGFydENQVVByb2ZpbGVyXCIpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnN1Y2Nlc3NcbiAgfVxuXG4gIC8qKlxuICAqIFN0b3AgdGhlIENQVSBwcm9maWxlIHRoYXQgd2FzIHByZXZpb3VzbHkgc3RhcnRlZC5cbiAgKlxuICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGEgYm9vbGVhbiB0aGF0IGlzIHRydWUgb24gc3VjY2Vzcy5cbiAgKi9cbiAgc3RvcENQVVByb2ZpbGVyID0gYXN5bmMgKCk6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwiYWRtaW4uc3RvcENQVVByb2ZpbGVyXCIpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnN1Y2Nlc3NcbiAgfVxuXG4gIC8qKlxuICAqIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBpbnN0YW50aWF0ZWQgZGlyZWN0bHkuIEluc3RlYWQgdXNlIHRoZSBbW0F2YWxhbmNoZS5hZGRBUEldXVxuICAqIG1ldGhvZC5cbiAgKlxuICAqIEBwYXJhbSBjb3JlIEEgcmVmZXJlbmNlIHRvIHRoZSBBdmFsYW5jaGUgY2xhc3NcbiAgKiBAcGFyYW0gYmFzZXVybCBEZWZhdWx0cyB0byB0aGUgc3RyaW5nIFwiL2V4dC9hZG1pblwiIGFzIHRoZSBwYXRoIHRvIHJwYydzIGJhc2V1cmxcbiAgKi9cbiAgY29uc3RydWN0b3IoY29yZTogQXZhbGFuY2hlQ29yZSwgYmFzZXVybDogc3RyaW5nID0gXCIvZXh0L2FkbWluXCIpIHsgc3VwZXIoY29yZSwgYmFzZXVybCkgfVxufVxuIl19