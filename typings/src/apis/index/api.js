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
exports.IndexAPI = void 0;
const jrpcapi_1 = require("../../common/jrpcapi");
/**
 * Class for interacting with a node's IndexAPI.
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
class IndexAPI extends jrpcapi_1.JRPCAPI {
    constructor(core, baseurl = "/ext/index/X/tx") {
        super(core, baseurl);
        /**
         * Get last accepted tx, vtx or block
         *
         * @param encoding
         * @param baseurl
         *
         * @returns Returns a Promise<GetLastAcceptedResponse>.
         */
        this.getLastAccepted = (encoding = "cb58", baseurl = this.getBaseURL()) => __awaiter(this, void 0, void 0, function* () {
            this.setBaseURL(baseurl);
            const params = {
                encoding
            };
            try {
                const response = yield this.callMethod("index.getLastAccepted", params);
                return response['data']['result'];
            }
            catch (error) {
                console.log(error);
            }
        });
        /**
         * Get container by index
         *
         * @param index
         * @param encoding
         * @param baseurl
         *
         * @returns Returns a Promise<GetContainerByIndexResponse>.
         */
        this.getContainerByIndex = (index = "0", encoding = "cb58", baseurl = this.getBaseURL()) => __awaiter(this, void 0, void 0, function* () {
            this.setBaseURL(baseurl);
            const params = {
                index,
                encoding
            };
            try {
                const response = yield this.callMethod("index.getContainerByIndex", params);
                return response['data']['result'];
            }
            catch (error) {
                console.log(error);
            }
        });
        /**
         * Get contrainer by ID
         *
         * @param containerID
         * @param encoding
         * @param baseurl
         *
         * @returns Returns a Promise<GetContainerByIDResponse>.
         */
        this.getContainerByID = (containerID = "0", encoding = "cb58", baseurl = this.getBaseURL()) => __awaiter(this, void 0, void 0, function* () {
            this.setBaseURL(baseurl);
            const params = {
                containerID,
                encoding
            };
            try {
                const response = yield this.callMethod("index.getContainerByID", params);
                return response['data']['result'];
            }
            catch (error) {
                console.log(error);
            }
        });
        /**
         * Get container range
         *
         * @param startIndex
         * @param numToFetch
         * @param encoding
         * @param baseurl
         *
         * @returns Returns a Promise<GetContainerRangeResponse>.
         */
        this.getContainerRange = (startIndex = 0, numToFetch = 100, encoding = "cb58", baseurl = this.getBaseURL()) => __awaiter(this, void 0, void 0, function* () {
            this.setBaseURL(baseurl);
            const params = {
                startIndex,
                numToFetch,
                encoding
            };
            try {
                const response = yield this.callMethod("index.getContainerRange", params);
                return response['data']['result'];
            }
            catch (error) {
                console.log(error);
            }
        });
        /**
         * Get index by containerID
         *
         * @param containerID
         * @param encoding
         * @param baseurl
         *
         * @returns Returns a Promise<GetIndexResponse>.
         */
        this.getIndex = (containerID = "", encoding = "cb58", baseurl = this.getBaseURL()) => __awaiter(this, void 0, void 0, function* () {
            this.setBaseURL(baseurl);
            const params = {
                containerID,
                encoding
            };
            try {
                const response = yield this.callMethod("index.getIndex", params);
                return response['data']['result']['index'];
            }
            catch (error) {
                console.log(error);
            }
        });
        /**
         * Check if container is accepted
         *
         * @param containerID
         * @param encoding
         * @param baseurl
         *
         * @returns Returns a Promise<GetIsAcceptedResponse>.
         */
        this.isAccepted = (containerID = "", encoding = "cb58", baseurl = this.getBaseURL()) => __awaiter(this, void 0, void 0, function* () {
            this.setBaseURL(baseurl);
            const params = {
                containerID,
                encoding
            };
            try {
                const response = yield this.callMethod("index.isAccepted", params);
                return response['data']['result'];
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
exports.IndexAPI = IndexAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvaW5kZXgvYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUtBLGtEQUErQztBQWUvQzs7Ozs7O0dBTUc7QUFDSCxNQUFhLFFBQVMsU0FBUSxpQkFBTztJQWlKakMsWUFBWSxJQUFtQixFQUFFLFVBQWtCLGlCQUFpQjtRQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFoSjdGOzs7Ozs7O1dBT0c7UUFDRixvQkFBZSxHQUFHLENBQU8sV0FBbUIsTUFBTSxFQUFFLFVBQWtCLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBb0MsRUFBRTtZQUM1SCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFBO1lBQ3hCLE1BQU0sTUFBTSxHQUEwQjtnQkFDcEMsUUFBUTthQUNULENBQUM7WUFFRixJQUFJO2dCQUNGLE1BQU0sUUFBUSxHQUF3QixNQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsdUJBQXVCLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzdGLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ25DO1lBQUMsT0FBTyxLQUFLLEVBQUU7Z0JBQ2QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTthQUNuQjtRQUNILENBQUMsQ0FBQSxDQUFDO1FBRUY7Ozs7Ozs7O1dBUUc7UUFDRix3QkFBbUIsR0FBRyxDQUFPLFFBQWdCLEdBQUcsRUFBRSxXQUFtQixNQUFNLEVBQUUsVUFBa0IsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUF3QyxFQUFFO1lBQ3pKLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUE7WUFDeEIsTUFBTSxNQUFNLEdBQThCO2dCQUN4QyxLQUFLO2dCQUNMLFFBQVE7YUFDVCxDQUFDO1lBRUYsSUFBSTtnQkFDRixNQUFNLFFBQVEsR0FBd0Is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a0IsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDeEYsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDbkM7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFBO2FBQ25CO1FBQ0osQ0FBQyxDQUFBLENBQUM7SUFFNEYsQ0FBQztDQUNsRztBQWxKRCw0QkFrSkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICogQG1vZHVsZSBJbmRleC1BdXRoXG4gKi9cbmltcG9ydCBBdmFsYW5jaGVDb3JlIGZyb20gJy4uLy4uL2F2YWxhbmNoZSc7XG5pbXBvcnQgeyBKUlBDQVBJIH0gZnJvbSAnLi4vLi4vY29tbW9uL2pycGNhcGknO1xuaW1wb3J0IHsgUmVxdWVzdFJlc3BvbnNlRGF0YSB9IGZyb20gJy4uLy4uL2NvbW1vbi9hcGliYXNlJztcbmltcG9ydCB7IFxuICAgIEdldExhc3RBY2NlcHRlZFBhcmFtcywgXG4gICAgR2V0TGFzdEFjY2VwdGVkUmVzcG9uc2UsXG4gICAgR2V0Q29udGFpbmVyQnlJbmRleFBhcmFtcyxcbiAgICBHZXRDb250YWluZXJCeUluZGV4UmVzcG9uc2UsXG4gICAgR2V0Q29udGFpbmVyQnlJRFBhcmFtcyxcbiAgICBHZXRDb250YWluZXJCeUlEUmVzcG9uc2UsXG4gICAgR2V0Q29udGFpbmVyUmFuZ2VQYXJhbXMsXG4gICAgR2V0Q29udGFpbmVyUmFuZ2VSZXNwb25zZSxcbiAgICBHZXRJbmRleFBhcmFtcyxcbiAgICBHZXRJc0FjY2VwdGVkUGFyYW1zLFxufSBmcm9tICcuLi8uLi9jb21tb24vaW50ZXJmYWNlcyc7XG5cbi8qKlxuICogQ2xhc3MgZm9yIGludGVyYWN0aW5nIHdpdGggYSBub2RlJ3MgSW5kZXhBUEkuXG4gKlxuICogQGNhdGVnb3J5IFJQQ0FQSXNcbiAqXG4gKiBAcmVtYXJrcyBUaGlzIGV4dGVuZHMgdGhlIFtbSlJQQ0FQSV1dIGNsYXNzLiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgZGlyZWN0bHkgY2FsbGVkLiBJbnN0ZWFkLCB1c2UgdGhlIFtbQXZhbGFuY2hlLmFkZEFQSV1dIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIHRoaXMgaW50ZXJmYWNlIHdpdGggQXZhbGFuY2hlLlxuICovXG5leHBvcnQgY2xhc3MgSW5kZXhBUEkgZXh0ZW5kcyBKUlBDQVBJIHtcbiAgICAvKipcbiAgICAgKiBHZXQgbGFzdCBhY2NlcHRlZCB0eCwgdnR4IG9yIGJsb2NrXG4gICAgICpcbiAgICAgKiBAcGFyYW0gZW5jb2RpbmcgXG4gICAgICogQHBhcmFtIGJhc2V1cmxcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPEdldExhc3RBY2NlcHRlZFJlc3BvbnNlPi5cbiAgICAgKi9cbiAgICAgZ2V0TGFzdEFjY2VwdGVkID0gYXN5bmMgKGVuY29kaW5nOiBzdHJpbmcgPSBcImNiNThcIiwgYmFzZXVybDogc3RyaW5nID0gdGhpcy5nZXRCYXNlVVJMKCkpOiBQcm9taXNlPEdldExhc3RBY2NlcHRlZFJlc3BvbnNlPiA9PiB7XG4gICAgICB0aGlzLnNldEJhc2VVUkwoYmFzZXVybClcbiAgICAgIGNvbnN0IHBhcmFtczogR2V0TGFzdEFjY2VwdGVkUGFyYW1zID0ge1xuICAgICAgICBlbmNvZGluZ1xuICAgICAgfTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJpbmRleC5nZXRMYXN0QWNjZXB0ZWRcIiwgcGFyYW1zKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlWydkYXRhJ11bJ3Jlc3VsdCddO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpXG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdldCBjb250YWluZXIgYnkgaW5kZXhcbiAgICAgKlxuICAgICAqIEBwYXJhbSBpbmRleFxuICAgICAqIEBwYXJhbSBlbmNvZGluZyBcbiAgICAgKiBAcGFyYW0gYmFzZXVybFxuICAgICAqXG4gICAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2U8R2V0Q29udGFpbmVyQnlJbmRleFJlc3BvbnNlPi5cbiAgICAgKi9cbiAgICAgZ2V0Q29udGFpbmVyQnlJbmRleCA9IGFzeW5jIChpbmRleDogc3RyaW5nID0gXCIwXCIsIGVuY29kaW5nOiBzdHJpbmcgPSBcImNiNThcIiwgYmFzZXVybDogc3RyaW5nID0gdGhpcy5nZXRCYXNlVVJMKCkpOiBQcm9taXNlPEdldENvbnRhaW5lckJ5SW5kZXhSZXNwb25zZT4gPT4ge1xuICAgICAgdGhpcy5zZXRCYXNlVVJMKGJhc2V1cmwpXG4gICAgICBjb25zdCBwYXJhbXM6IEdldENvbnRhaW5lckJ5SW5kZXhQYXJhbXMgPSB7XG4gICAgICAgIGluZGV4LFxuICAgICAgICBlbmNvZGluZ1xuICAgICAgfTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJpbmRleC5nZXRDb250YWluZXJCeUluZGV4XCIsIHBhcmFtcyk7XG4gICAgICAgIHJldHVybiByZXNwb25zZVsnZGF0YSddWydyZXN1bHQnXTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKVxuICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBHZXQgY29udHJhaW5lciBieSBJRFxuICAgICAqXG4gICAgICogQHBhcmFtIGNvbnRhaW5lcklEXG4gICAgICogQHBhcmFtIGVuY29kaW5nIFxuICAgICAqIEBwYXJhbSBiYXNldXJsXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZTxHZXRDb250YWluZXJCeUlEUmVzcG9uc2U+LlxuICAgICAqL1xuICAgICBnZXRDb250YWluZXJCeUlEID0gYXN5bmMgKGNvbnRhaW5lcklEOiBzdHJpbmcgPSBcIjBcIiwgZW5jb2Rpbmc6IHN0cmluZyA9IFwiY2I1OFwiLCBiYXNldXJsOiBzdHJpbmcgPSB0aGlzLmdldEJhc2VVUkwoKSk6IFByb21pc2U8R2V0Q29udGFpbmVyQnlJRFJlc3BvbnNlPiA9PiB7XG4gICAgICB0aGlzLnNldEJhc2VVUkwoYmFzZXVybClcbiAgICAgIGNvbnN0IHBhcmFtczogR2V0Q29udGFpbmVyQnlJRFBhcmFtcyA9IHtcbiAgICAgICAgY29udGFpbmVySUQsXG4gICAgICAgIGVuY29kaW5nXG4gICAgICB9O1xuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcImluZGV4LmdldENvbnRhaW5lckJ5SURcIiwgcGFyYW1zKTtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlWydkYXRhJ11bJ3Jlc3VsdCddO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpXG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEdldCBjb250YWluZXIgcmFuZ2VcbiAgICAgKlxuICAgICAqIEBwYXJhbSBzdGFydEluZGV4XG4gICAgICogQHBhcmFtIG51bVRvRmV0Y2hcbiAgICAgKiBAcGFyYW0gZW5jb2RpbmcgXG4gICAgICogQHBhcmFtIGJhc2V1cmxcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPEdldENvbnRhaW5lclJhbmdlUmVzcG9uc2U+LlxuICAgICAqL1xuICAgICBnZXRDb250YWluZXJSYW5nZSA9IGFzeW5jIChzdGFydEluZGV4OiBudW1iZXIgPSAwLCBudW1Ub0ZldGNoOiBudW1iZXIgPSAxMDAsIGVuY29kaW5nOiBzdHJpbmcgPSBcImNiNThcIiwgYmFzZXVybDogc3RyaW5nID0gdGhpcy5nZXRCYXNlVVJMKCkpOiBQcm9taXNlPEdldENvbnRhaW5lclJhbmdlUmVzcG9uc2VbXT4gPT4ge1xuICAgICAgdGhpcy5zZXRCYXNlVVJMKGJhc2V1cmwpXG4gICAgICBjb25zdCBwYXJhbXM6IEdldENvbnRhaW5lclJhbmdlUGFyYW1zID0ge1xuICAgICAgICBzdGFydEluZGV4LFxuICAgICAgICBudW1Ub0ZldGNoLFxuICAgICAgICBlbmNvZGluZ1xuICAgICAgfTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJpbmRleC5nZXRDb250YWluZXJSYW5nZVwiLCBwYXJhbXMpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2VbJ2RhdGEnXVsncmVzdWx0J107XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcilcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0IGluZGV4IGJ5IGNvbnRhaW5lcklEXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY29udGFpbmVySURcbiAgICAgKiBAcGFyYW0gZW5jb2RpbmcgXG4gICAgICogQHBhcmFtIGJhc2V1cmxcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPEdldEluZGV4UmVzcG9uc2U+LlxuICAgICAqL1xuICAgICBnZXRJbmRleCA9IGFzeW5jIChjb250YWluZXJJRDogc3RyaW5nID0gXCJcIiwgZW5jb2Rpbmc6IHN0cmluZyA9IFwiY2I1OFwiLCBiYXNldXJsOiBzdHJpbmcgPSB0aGlzLmdldEJhc2VVUkwoKSk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgICB0aGlzLnNldEJhc2VVUkwoYmFzZXVybClcbiAgICAgIGNvbnN0IHBhcmFtczogR2V0SW5kZXhQYXJhbXMgPSB7XG4gICAgICAgIGNvbnRhaW5lcklELFxuICAgICAgICBlbmNvZGluZ1xuICAgICAgfTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJpbmRleC5nZXRJbmRleFwiLCBwYXJhbXMpO1xuICAgICAgICByZXR1cm4gcmVzcG9uc2VbJ2RhdGEnXVsncmVzdWx0J11bJ2luZGV4J107XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnJvcilcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgY29udGFpbmVyIGlzIGFjY2VwdGVkXG4gICAgICpcbiAgICAgKiBAcGFyYW0gY29udGFpbmVySURcbiAgICAgKiBAcGFyYW0gZW5jb2RpbmcgXG4gICAgICogQHBhcmFtIGJhc2V1cmxcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPEdldElzQWNjZXB0ZWRSZXNwb25zZT4uXG4gICAgICovXG4gICAgIGlzQWNjZXB0ZWQgPSBhc3luYyAoY29udGFpbmVySUQ6IHN0cmluZyA9IFwiXCIsIGVuY29kaW5nOiBzdHJpbmcgPSBcImNiNThcIiwgYmFzZXVybDogc3RyaW5nID0gdGhpcy5nZXRCYXNlVVJMKCkpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICAgICB0aGlzLnNldEJhc2VVUkwoYmFzZXVybClcbiAgICAgICBjb25zdCBwYXJhbXM6IEdldElzQWNjZXB0ZWRQYXJhbXMgPSB7XG4gICAgICAgICBjb250YWluZXJJRCxcbiAgICAgICAgIGVuY29kaW5nXG4gICAgICAgfTtcblxuICAgICAgIHRyeSB7XG4gICAgICAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcImluZGV4LmlzQWNjZXB0ZWRcIiwgcGFyYW1zKTtcbiAgICAgICAgIHJldHVybiByZXNwb25zZVsnZGF0YSddWydyZXN1bHQnXTtcbiAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpXG4gICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdHJ1Y3Rvcihjb3JlOiBBdmFsYW5jaGVDb3JlLCBiYXNldXJsOiBzdHJpbmcgPSBcIi9leHQvaW5kZXgvWC90eFwiKSB7IHN1cGVyKGNvcmUsIGJhc2V1cmwpOyB9XG59XG4iXX0=