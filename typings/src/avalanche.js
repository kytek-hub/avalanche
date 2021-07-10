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
/**
 * @packageDocumentation
 * @module AvalancheCore
 */
const axios_1 = __importDefault(require("axios"));
const apibase_1 = require("./common/apibase");
const helperfunctions_1 = require("./utils/helperfunctions");
/**
 * AvalancheCore is middleware for interacting with Avalanche node RPC APIs.
 *
 * Example usage:
 * ```js
 * let avalanche = new AvalancheCore("127.0.0.1", 9650, "https")
 * ```
 *
 */
class AvalancheCore {
    /**
    * Creates a new Avalanche instance. Sets the address and port of the main Avalanche Client.
    *
    * @param host The hostname to resolve to reach the Avalanche Client APIs
    * @param port The port to resolve to reach the Avalanche Client APIs
    * @param protocol The protocol string to use before a "://" in a request, ex: "http", "https", "git", "ws", etc ...
    */
    constructor(host, port, protocol = "http") {
        this.networkID = 0;
        this.hrp = "";
        this.auth = undefined;
        this.headers = {};
        this.requestConfig = {};
        this.apis = {};
        /**
           * Sets the address and port of the main Avalanche Client.
           *
           * @param host The hostname to resolve to reach the Avalanche Client RPC APIs
           * @param port The port to resolve to reach the Avalanche Client RPC APIs
           * @param protocol The protocol string to use before a "://" in a request,
           * ex: "http", "https", "git", "ws", etc ...
           */
        this.setAddress = (host, port, protocol = "http") => {
            this.host = host;
            this.port = port;
            this.protocol = protocol;
            let url = `${protocol}://${host}`;
            if (port != undefined && typeof port === "number" && port >= 0) {
                url = `${url}:${port}`;
            }
            this.url = url;
        };
        /**
           * Returns the protocol such as "http", "https", "git", "ws", etc.
           */
        this.getProtocol = () => this.protocol;
        /**
        * Returns the host for the Avalanche node.
        */
        this.getHost = () => this.host;
        /**
        * Returns the IP for the Avalanche node.
        */
        this.getIP = () => this.host;
        /**
        * Returns the port for the Avalanche node.
        */
        this.getPort = () => this.port;
        /**
        * Returns the URL of the Avalanche node (ip + port)
        */
        this.getURL = () => this.url;
        /**
        * Returns the custom headers
        */
        this.getHeaders = () => this.headers;
        /**
        * Returns the custom request config
        */
        this.getRequestConfig = () => this.requestConfig;
        /**
        * Returns the networkID
        */
        this.getNetworkID = () => this.networkID;
        /**
        * Sets the networkID
        */
        this.setNetworkID = (netid) => {
            this.networkID = netid;
            this.hrp = helperfunctions_1.getPreferredHRP(this.networkID);
        };
        /**
        * Returns the Human-Readable-Part of the network associated with this key.
        *
        * @returns The [[KeyPair]]'s Human-Readable-Part of the network's Bech32 addressing scheme
        */
        this.getHRP = () => this.hrp;
        /**
        * Sets the the Human-Readable-Part of the network associated with this key.
        *
        * @param hrp String for the Human-Readable-Part of Bech32 addresses
        */
        this.setHRP = (hrp) => {
            this.hrp = hrp;
        };
        /**
        * Adds a new custom header to be included with all requests.
        *
        * @param key Header name
        * @param value Header value
        */
        this.setHeader = (key, value) => {
            this.headers[key] = value;
        };
        /**
        * Removes a previously added custom header.
        *
        * @param key Header name
        */
        this.removeHeader = (key) => {
            delete this.headers[key];
        };
        /**
        * Removes all headers.
        */
        this.removeAllHeaders = () => {
            for (let prop in this.headers) {
                if (Object.prototype.hasOwnProperty.call(this.headers, prop)) {
                    delete this.headers[prop];
                }
            }
        };
        /**
        * Adds a new custom config value to be included with all requests.
        *
        * @param key Config name
        * @param value Config value
        */
        this.setRequestConfig = (key, value) => {
            this.requestConfig[key] = value;
        };
        /**
        * Removes a previously added request config.
        *
        * @param key Header name
        */
        this.removeRequestConfig = (key) => {
            delete this.requestConfig[key];
        };
        /**
        * Removes all request configs.
        */
        this.removeAllRequestConfigs = () => {
            for (let prop in this.requestConfig) {
                if (Object.prototype.hasOwnProperty.call(this.requestConfig, prop)) {
                    delete this.requestConfig[prop];
                }
            }
        };
        /**
        * Sets the temporary auth token used for communicating with the node.
        *
        * @param auth A temporary token provided by the node enabling access to the endpoints on the node.
        */
        this.setAuthToken = (auth) => {
            this.auth = auth;
        };
        this._setHeaders = (headers) => {
            if (typeof this.headers === "object") {
                for (const [key, value] of Object.entries(this.headers)) {
                    headers[key] = value;
                }
            }
            if (typeof this.auth === "string") {
                headers["Authorization"] = "Bearer " + this.auth;
            }
            return headers;
        };
        /**
        * Adds an API to the middleware. The API resolves to a registered blockchain's RPC.
        *
        * In TypeScript:
        * ```js
        * avalanche.addAPI<MyVMClass>("mychain", MyVMClass, "/ext/bc/mychain")
        * ```
        *
        * In Javascript:
        * ```js
        * avalanche.addAPI("mychain", MyVMClass, "/ext/bc/mychain")
        * ```
        *
        * @typeparam GA Class of the API being added
        * @param apiName A label for referencing the API in the future
        * @param ConstructorFN A reference to the class which instantiates the API
        * @param baseurl Path to resolve to reach the API
        *
        */
        this.addAPI = (apiName, ConstructorFN, baseurl = undefined, ...args) => {
            if (typeof baseurl === "undefined") {
                this.apis[apiName] = new ConstructorFN(this, undefined, ...args);
            }
            else {
                this.apis[apiName] = new ConstructorFN(this, baseurl, ...args);
            }
        };
        /**
        * Retrieves a reference to an API by its apiName label.
        *
        * @param apiName Name of the API to return
        */
        this.api = (apiName) => this.apis[apiName];
        /**
         * @ignore
         */
        this._request = (xhrmethod, baseurl, getdata, postdata, headers = {}, axiosConfig = undefined) => __awaiter(this, void 0, void 0, function* () {
            let config;
            if (axiosConfig) {
                config = Object.assign(Object.assign({}, axiosConfig), this.requestConfig);
            }
            else {
                config = Object.assign({ baseURL: `${this.protocol}://${this.ip}:${this.port}`, responseType: "text" }, this.requestConfig);
            }
            config.url = baseurl;
            config.method = xhrmethod;
            config.headers = headers;
            config.data = postdata;
            config.params = getdata;
            const resp = yield axios_1.default.request(config);
            // purging all that is axios
            const xhrdata = new apibase_1.RequestResponseData();
            xhrdata.data = resp.data;
            xhrdata.headers = resp.headers;
            xhrdata.request = resp.request;
            xhrdata.status = resp.status;
            xhrdata.statusText = resp.statusText;
            return xhrdata;
        });
        /**
        * Makes a GET call to an API.
        *
        * @param baseurl Path to the api
        * @param getdata Object containing the key value pairs sent in GET
        * @param parameters Object containing the parameters of the API call
        * @param headers An array HTTP Request Headers
        * @param axiosConfig Configuration for the axios javascript library that will be the
        * foundation for the rest of the parameters
        *
        * @returns A promise for [[RequestResponseData]]
        */
        this.get = (baseurl, getdata, headers = {}, axiosConfig = undefined) => this._request("GET", baseurl, getdata, {}, this._setHeaders(headers), axiosConfig);
        /**
        * Makes a DELETE call to an API.
        *
        * @param baseurl Path to the API
        * @param getdata Object containing the key value pairs sent in DELETE
        * @param parameters Object containing the parameters of the API call
        * @param headers An array HTTP Request Headers
        * @param axiosConfig Configuration for the axios javascript library that will be the
        * foundation for the rest of the parameters
        *
        * @returns A promise for [[RequestResponseData]]
        */
        this.delete = (baseurl, getdata, headers = {}, axiosConfig = undefined) => this._request("DELETE", baseurl, getdata, {}, this._setHeaders(headers), axiosConfig);
        /**
        * Makes a POST call to an API.
        *
        * @param baseurl Path to the API
        * @param getdata Object containing the key value pairs sent in POST
        * @param postdata Object containing the key value pairs sent in POST
        * @param parameters Object containing the parameters of the API call
        * @param headers An array HTTP Request Headers
        * @param axiosConfig Configuration for the axios javascript library that will be the
        * foundation for the rest of the parameters
        *
        * @returns A promise for [[RequestResponseData]]
        */
        this.post = (baseurl, getdata, postdata, headers = {}, axiosConfig = undefined) => this._request("POST", baseurl, getdata, postdata, this._setHeaders(headers), axiosConfig);
        /**
        * Makes a PUT call to an API.
        *
        * @param baseurl Path to the baseurl
        * @param getdata Object containing the key value pairs sent in PUT
        * @param postdata Object containing the key value pairs sent in PUT
        * @param parameters Object containing the parameters of the API call
        * @param headers An array HTTP Request Headers
        * @param axiosConfig Configuration for the axios javascript library that will be the
        * foundation for the rest of the parameters
        *
        * @returns A promise for [[RequestResponseData]]
        */
        this.put = (baseurl, getdata, postdata, headers = {}, axiosConfig = undefined) => this._request("PUT", baseurl, getdata, postdata, this._setHeaders(headers), axiosConfig);
        /**
        * Makes a PATCH call to an API.
        *
        * @param baseurl Path to the baseurl
        * @param getdata Object containing the key value pairs sent in PATCH
        * @param postdata Object containing the key value pairs sent in PATCH
        * @param parameters Object containing the parameters of the API call
        * @param headers An array HTTP Request Headers
        * @param axiosConfig Configuration for the axios javascript library that will be the
        * foundation for the rest of the parameters
        *
        * @returns A promise for [[RequestResponseData]]
        */
        this.patch = (baseurl, getdata, postdata, headers = {}, axiosConfig = undefined) => this._request("PATCH", baseurl, getdata, postdata, this._setHeaders(headers), axiosConfig);
        this.setAddress(host, port, protocol);
    }
}
exports.default = AvalancheCore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZhbGFuY2hlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2F2YWxhbmNoZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBOzs7R0FHRztBQUNILGtEQUF3RTtBQUN4RSw4Q0FBK0Q7QUFDL0QsNkRBQXlEO0FBRXpEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBcUIsYUFBYTtJQXNYaEM7Ozs7OztNQU1FO0lBQ0YsWUFBWSxJQUFZLEVBQUUsSUFBWSxFQUFFLFdBQW1CLE1BQU07UUE1WHZELGNBQVMsR0FBVyxDQUFDLENBQUE7UUFDckIsUUFBRyxHQUFXLEVBQUUsQ0FBQTtRQU1oQixTQUFJLEdBQVcsU0FBUyxDQUFBO1FBQ3hCLFlBQU8sR0FBNEIsRUFBRSxDQUFBO1FBQ3JDLGtCQUFhLEdBQXVCLEVBQUUsQ0FBQTtRQUN0QyxTQUFJLEdBQTZCLEVBQUUsQ0FBQTtRQUU3Qzs7Ozs7OzthQU9LO1FBQ0wsZUFBVSxHQUFHLENBQUMsSUFBWSxFQUFFLElBQVksRUFBRSxXQUFtQixNQUFNLEVBQUUsRUFBRTtZQUNyRSxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtZQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQTtZQUNoQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQTtZQUN4QixJQUFJLEdBQUcsR0FBVyxHQUFHLFFBQVEsTUFBTSxJQUFJLEVBQUUsQ0FBQTtZQUN6QyxJQUFJLElBQUksSUFBSSxTQUFTLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxJQUFJLElBQUksSUFBSSxDQUFDLEVBQUU7Z0JBQzlELEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQTthQUN2QjtZQUNELElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBO1FBQ2hCLENBQUMsQ0FBQTtRQUVEOzthQUVLO1FBQ0wsZ0JBQVcsR0FBRyxHQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFB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VyxDQUFDLENBQUE7UUFFaEI7Ozs7Ozs7Ozs7OztVQVlFO1FBQ0YsVUFBSyxHQUFHLENBQUMsT0FBZSxFQUN0QixPQUFlLEVBQ2YsUUFBeUQsRUFDekQsVUFBa0IsRUFBRSxFQUNwQixjQUFrQyxTQUFTLEVBQ1osRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUNyRCxPQUFPLEVBQ1AsT0FBTyxFQUNQLFFBQVEsRUFDUixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUN6QixXQUFXLENBQUMsQ0FBQTtRQVVkLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQTtJQUN2QyxDQUFDO0NBQ0Y7QUFoWUQsZ0NBZ1lDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQXZhbGFuY2hlQ29yZVxuICovXG5pbXBvcnQgYXhpb3MsIHsgQXhpb3NSZXF1ZXN0Q29uZmlnLCBBeGlvc1Jlc3BvbnNlLCBNZXRob2QgfSBmcm9tIFwiYXhpb3NcIlxuaW1wb3J0IHsgQVBJQmFzZSwgUmVxdWVzdFJlc3BvbnNlRGF0YSB9IGZyb20gXCIuL2NvbW1vbi9hcGliYXNlXCJcbmltcG9ydCB7IGdldFByZWZlcnJlZEhSUCB9IGZyb20gXCIuL3V0aWxzL2hlbHBlcmZ1bmN0aW9uc1wiXG5cbi8qKlxuICogQXZhbGFuY2hlQ29yZSBpcyBtaWRkbGV3YXJlIGZvciBpbnRlcmFjdGluZyB3aXRoIEF2YWxhbmNoZSBub2RlIFJQQyBBUElzLlxuICpcbiAqIEV4YW1wbGUgdXNhZ2U6XG4gKiBgYGBqc1xuICogbGV0IGF2YWxhbmNoZSA9IG5ldyBBdmFsYW5jaGVDb3JlKFwiMTI3LjAuMC4xXCIsIDk2NTAsIFwiaHR0cHNcIilcbiAqIGBgYFxuICpcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXZhbGFuY2hlQ29yZSB7XG4gIHByb3RlY3RlZCBuZXR3b3JrSUQ6IG51bWJlciA9IDBcbiAgcHJvdGVjdGVkIGhycDogc3RyaW5nID0gXCJcIlxuICBwcm90ZWN0ZWQgcHJvdG9jb2w6IHN0cmluZ1xuICBwcm90ZWN0ZWQgaXA6IHN0cmluZ1xuICBwcm90ZWN0ZWQgaG9zdDogc3RyaW5nXG4gIHByb3RlY3RlZCBwb3J0OiBudW1iZXJcbiAgcHJvdGVjdGVkIHVybDogc3RyaW5nXG4gIHByb3RlY3RlZCBhdXRoOiBzdHJpbmcgPSB1bmRlZmluZWRcbiAgcHJvdGVjdGVkIGhlYWRlcnM6IHsgW2s6IHN0cmluZ106IHN0cmluZyB9ID0ge31cbiAgcHJvdGVjdGVkIHJlcXVlc3RDb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHt9XG4gIHByb3RlY3RlZCBhcGlzOiB7IFtrOiBzdHJpbmddOiBBUElCYXNlIH0gPSB7fVxuXG4gIC8qKlxuICAgICAqIFNldHMgdGhlIGFkZHJlc3MgYW5kIHBvcnQgb2YgdGhlIG1haW4gQXZhbGFuY2hlIENsaWVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBob3N0IFRoZSBob3N0bmFtZSB0byByZXNvbHZlIHRvIHJlYWNoIHRoZSBBdmFsYW5jaGUgQ2xpZW50IFJQQyBBUElzXG4gICAgICogQHBhcmFtIHBvcnQgVGhlIHBvcnQgdG8gcmVzb2x2ZSB0byByZWFjaCB0aGUgQXZhbGFuY2hlIENsaWVudCBSUEMgQVBJc1xuICAgICAqIEBwYXJhbSBwcm90b2NvbCBUaGUgcHJvdG9jb2wgc3RyaW5nIHRvIHVzZSBiZWZvcmUgYSBcIjovL1wiIGluIGEgcmVxdWVzdCxcbiAgICAgKiBleDogXCJodHRwXCIsIFwiaHR0cHNcIiwgXCJnaXRcIiwgXCJ3c1wiLCBldGMgLi4uXG4gICAgICovXG4gIHNldEFkZHJlc3MgPSAoaG9zdDogc3RyaW5nLCBwb3J0OiBudW1iZXIsIHByb3RvY29sOiBzdHJpbmcgPSBcImh0dHBcIikgPT4ge1xuICAgIHRoaXMuaG9zdCA9IGhvc3RcbiAgICB0aGlzLnBvcnQgPSBwb3J0XG4gICAgdGhpcy5wcm90b2NvbCA9IHByb3RvY29sXG4gICAgbGV0IHVybDogc3RyaW5nID0gYCR7cHJvdG9jb2x9Oi8vJHtob3N0fWBcbiAgICBpZiAocG9ydCAhPSB1bmRlZmluZWQgJiYgdHlwZW9mIHBvcnQgPT09IFwibnVtYmVyXCIgJiYgcG9ydCA+PSAwKSB7XG4gICAgICB1cmwgPSBgJHt1cmx9OiR7cG9ydH1gXG4gICAgfVxuICAgIHRoaXMudXJsID0gdXJsXG4gIH1cblxuICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBwcm90b2NvbCBzdWNoIGFzIFwiaHR0cFwiLCBcImh0dHBzXCIsIFwiZ2l0XCIsIFwid3NcIiwgZXRjLlxuICAgICAqL1xuICBnZXRQcm90b2NvbCA9ICgpOiBzdHJpbmcgPT4gdGhpcy5wcm90b2NvbFxuXG4gIC8qKlxuICAqIFJldHVybnMgdGhlIGhvc3QgZm9yIHRoZSBBdmFsYW5jaGUgbm9kZS5cbiAgKi9cbiAgZ2V0SG9zdCA9ICgpOiBzdHJpbmcgPT4gdGhpcy5ob3N0XG5cbiAgLyoqXG4gICogUmV0dXJucyB0aGUgSVAgZm9yIHRoZSBBdmFsYW5jaGUgbm9kZS5cbiAgKi9cbiAgZ2V0SVAgPSAoKTogc3RyaW5nID0+IHRoaXMuaG9zdFxuXG4gIC8qKlxuICAqIFJldHVybnMgdGhlIHBvcnQgZm9yIHRoZSBBdmFsYW5jaGUgbm9kZS5cbiAgKi9cbiAgZ2V0UG9ydCA9ICgpOiBudW1iZXIgPT4gdGhpcy5wb3J0XG5cbiAgLyoqXG4gICogUmV0dXJucyB0aGUgVVJMIG9mIHRoZSBBdmFsYW5jaGUgbm9kZSAoaXAgKyBwb3J0KVxuICAqL1xuICBnZXRVUkwgPSAoKTogc3RyaW5nID0+IHRoaXMudXJsXG5cbiAgLyoqXG4gICogUmV0dXJucyB0aGUgY3VzdG9tIGhlYWRlcnNcbiAgKi9cbiAgZ2V0SGVhZGVycyA9ICgpOiBvYmplY3QgPT4gdGhpcy5oZWFkZXJzXG5cbiAgLyoqXG4gICogUmV0dXJucyB0aGUgY3VzdG9tIHJlcXVlc3QgY29uZmlnXG4gICovXG4gIGdldFJlcXVlc3RDb25maWcgPSAoKTogQXhpb3NSZXF1ZXN0Q29uZmlnID0+IHRoaXMucmVxdWVzdENvbmZpZ1xuXG4gIC8qKlxuICAqIFJldHVybnMgdGhlIG5ldHdvcmtJRFxuICAqL1xuICBnZXROZXR3b3JrSUQgPSAoKTogbnVtYmVyID0+IHRoaXMubmV0d29ya0lEXG5cbiAgLyoqXG4gICogU2V0cyB0aGUgbmV0d29ya0lEXG4gICovXG4gIHNldE5ldHdvcmtJRCA9IChuZXRpZDogbnVtYmVyKSA9PiB7XG4gICAgdGhpcy5uZXR3b3JrSUQgPSBuZXRpZFxuICAgIHRoaXMuaHJwID0gZ2V0UHJlZmVycmVkSFJQKHRoaXMubmV0d29ya0lEKVxuICB9XG5cbiAgLyoqXG4gICogUmV0dXJucyB0aGUgSHVtYW4tUmVhZGFibGUtUGFydCBvZiB0aGUgbmV0d29yayBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXkuXG4gICpcbiAgKiBAcmV0dXJucyBUaGUgW1tLZXlQYWlyXV0ncyBIdW1hbi1SZWFkYWJsZS1QYXJ0IG9mIHRoZSBuZXR3b3JrJ3MgQmVjaDMyIGFkZHJlc3Npbmcgc2NoZW1lXG4gICovXG4gIGdldEhSUCA9ICgpOiBzdHJpbmcgPT4gdGhpcy5ocnBcblxuICAvKipcbiAgKiBTZXRzIHRoZSB0aGUgSHVtYW4tUmVhZGFibGUtUGFydCBvZiB0aGUgbmV0d29yayBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXkuXG4gICpcbiAgKiBAcGFyYW0gaHJwIFN0cmluZyBmb3IgdGhlIEh1bWFuLVJlYWRhYmxlLVBhcnQgb2YgQmVjaDMyIGFkZHJlc3Nlc1xuICAqL1xuICBzZXRIUlAgPSAoaHJwOnN0cmluZyk6dm9pZCA9PiB7XG4gICAgdGhpcy5ocnAgPSBocnBcbiAgfVxuXG4gIC8qKlxuICAqIEFkZHMgYSBuZXcgY3VzdG9tIGhlYWRlciB0byBiZSBpbmNsdWRlZCB3aXRoIGFsbCByZXF1ZXN0cy5cbiAgKlxuICAqIEBwYXJhbSBrZXkgSGVhZGVyIG5hbWVcbiAgKiBAcGFyYW0gdmFsdWUgSGVhZGVyIHZhbHVlXG4gICovXG4gIHNldEhlYWRlciA9IChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgIHRoaXMuaGVhZGVyc1trZXldID0gdmFsdWVcbiAgfVxuXG4gIC8qKlxuICAqIFJlbW92ZXMgYSBwcmV2aW91c2x5IGFkZGVkIGN1c3RvbSBoZWFkZXIuXG4gICpcbiAgKiBAcGFyYW0ga2V5IEhlYWRlciBuYW1lXG4gICovXG4gIHJlbW92ZUhlYWRlciA9IChrZXk6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgIGRlbGV0ZSB0aGlzLmhlYWRlcnNba2V5XVxuICB9XG5cbiAgLyoqXG4gICogUmVtb3ZlcyBhbGwgaGVhZGVycy5cbiAgKi9cbiAgcmVtb3ZlQWxsSGVhZGVycyA9ICgpOiB2b2lkID0+IHtcbiAgICBmb3IgKGxldCBwcm9wIGluIHRoaXMuaGVhZGVycykge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmhlYWRlcnMsIHByb3ApKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmhlYWRlcnNbcHJvcF1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBBZGRzIGEgbmV3IGN1c3RvbSBjb25maWcgdmFsdWUgdG8gYmUgaW5jbHVkZWQgd2l0aCBhbGwgcmVxdWVzdHMuXG4gICpcbiAgKiBAcGFyYW0ga2V5IENvbmZpZyBuYW1lXG4gICogQHBhcmFtIHZhbHVlIENvbmZpZyB2YWx1ZVxuICAqL1xuICBzZXRSZXF1ZXN0Q29uZmlnID0gKGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nfGJvb2xlYW4pOiB2b2lkID0+IHtcbiAgICB0aGlzLnJlcXVlc3RDb25maWdba2V5XSA9IHZhbHVlXG4gIH1cblxuICAvKipcbiAgKiBSZW1vdmVzIGEgcHJldmlvdXNseSBhZGRlZCByZXF1ZXN0IGNvbmZpZy5cbiAgKlxuICAqIEBwYXJhbSBrZXkgSGVhZGVyIG5hbWVcbiAgKi9cbiAgcmVtb3ZlUmVxdWVzdENvbmZpZyA9IChrZXk6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgIGRlbGV0ZSB0aGlzLnJlcXVlc3RDb25maWdba2V5XVxuICB9XG5cbiAgLyoqXG4gICogUmVtb3ZlcyBhbGwgcmVxdWVzdCBjb25maWdzLlxuICAqL1xuICByZW1vdmVBbGxSZXF1ZXN0Q29uZmlncyA9ICgpOiB2b2lkID0+IHtcbiAgICBmb3IgKGxldCBwcm9wIGluIHRoaXMucmVxdWVzdENvbmZpZykge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLnJlcXVlc3RDb25maWcsIHByb3ApKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnJlcXVlc3RDb25maWdbcHJvcF1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgKiBTZXRzIHRoZSB0ZW1wb3JhcnkgYXV0aCB0b2tlbiB1c2VkIGZvciBjb21tdW5pY2F0aW5nIHdpdGggdGhlIG5vZGUuXG4gICpcbiAgKiBAcGFyYW0gYXV0aCBBIHRlbXBvcmFyeSB0b2tlbiBwcm92aWRlZCBieSB0aGUgbm9kZSBlbmFibGluZyBhY2Nlc3MgdG8gdGhlIGVuZHBvaW50cyBvbiB0aGUgbm9kZS5cbiAgKi9cbiAgc2V0QXV0aFRva2VuID0gKGF1dGg6IHN0cmluZyk6IHZvaWQgPT4ge1xuICAgIHRoaXMuYXV0aCA9IGF1dGhcbiAgfVxuXG4gIHByb3RlY3RlZCBfc2V0SGVhZGVycyA9IChoZWFkZXJzOiBvYmplY3QpOiBvYmplY3QgPT4ge1xuICAgIGlmICh0eXBlb2YgdGhpcy5oZWFkZXJzID09PSBcIm9iamVjdFwiKSB7XG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyh0aGlzLmhlYWRlcnMpKSB7XG4gICAgICAgIGhlYWRlcnNba2V5XSA9IHZhbHVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYodHlwZW9mIHRoaXMuYXV0aCA9PT0gXCJzdHJpbmdcIil7XG4gICAgICBoZWFkZXJzW1wiQXV0aG9yaXphdGlvblwiXSA9IFwiQmVhcmVyIFwiICsgdGhpcy5hdXRoXG4gICAgfVxuICAgIHJldHVybiBoZWFkZXJzXG4gIH1cblxuICAvKipcbiAgKiBBZGRzIGFuIEFQSSB0byB0aGUgbWlkZGxld2FyZS4gVGhlIEFQSSByZXNvbHZlcyB0byBhIHJlZ2lzdGVyZWQgYmxvY2tjaGFpbidzIFJQQy5cbiAgKlxuICAqIEluIFR5cGVTY3JpcHQ6XG4gICogYGBganNcbiAgKiBhdmFsYW5jaGUuYWRkQVBJPE15Vk1DbGFzcz4oXCJteWNoYWluXCIsIE15Vk1DbGFzcywgXCIvZXh0L2JjL215Y2hhaW5cIilcbiAgKiBgYGBcbiAgKlxuICAqIEluIEphdmFzY3JpcHQ6XG4gICogYGBganNcbiAgKiBhdmFsYW5jaGUuYWRkQVBJKFwibXljaGFpblwiLCBNeVZNQ2xhc3MsIFwiL2V4dC9iYy9teWNoYWluXCIpXG4gICogYGBgXG4gICpcbiAgKiBAdHlwZXBhcmFtIEdBIENsYXNzIG9mIHRoZSBBUEkgYmVpbmcgYWRkZWRcbiAgKiBAcGFyYW0gYXBpTmFtZSBBIGxhYmVsIGZvciByZWZlcmVuY2luZyB0aGUgQVBJIGluIHRoZSBmdXR1cmVcbiAgKiBAcGFyYW0gQ29uc3RydWN0b3JGTiBBIHJlZmVyZW5jZSB0byB0aGUgY2xhc3Mgd2hpY2ggaW5zdGFudGlhdGVzIHRoZSBBUElcbiAgKiBAcGFyYW0gYmFzZXVybCBQYXRoIHRvIHJlc29sdmUgdG8gcmVhY2ggdGhlIEFQSVxuICAqXG4gICovXG4gIGFkZEFQSSA9IDxHQSBleHRlbmRzIEFQSUJhc2U+KGFwaU5hbWU6IHN0cmluZyxcbiAgICBDb25zdHJ1Y3RvckZOOiBuZXcgKGF2YXg6IEF2YWxhbmNoZUNvcmUsIGJhc2V1cmw/OiBzdHJpbmcsIC4uLmFyZ3M6IGFueVtdKSA9PiBHQSxcbiAgICBiYXNldXJsOnN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICAuLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgIGlmICh0eXBlb2YgYmFzZXVybCA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5hcGlzW2FwaU5hbWVdID0gbmV3IENvbnN0cnVjdG9yRk4odGhpcywgdW5kZWZpbmVkLCAuLi5hcmdzKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFwaXNbYXBpTmFtZV0gPSBuZXcgQ29uc3RydWN0b3JGTih0aGlzLCBiYXNldXJsLCAuLi5hcmdzKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAqIFJldHJpZXZlcyBhIHJlZmVyZW5jZSB0byBhbiBBUEkgYnkgaXRzIGFwaU5hbWUgbGFiZWwuXG4gICpcbiAgKiBAcGFyYW0gYXBpTmFtZSBOYW1lIG9mIHRoZSBBUEkgdG8gcmV0dXJuXG4gICovXG4gIGFwaSA9IDxHQSBleHRlbmRzIEFQSUJhc2U+KGFwaU5hbWU6IHN0cmluZyk6IEdBID0+IHRoaXMuYXBpc1thcGlOYW1lXSBhcyBHQVxuXG4gIC8qKlxuICAgKiBAaWdub3JlXG4gICAqL1xuICBwcm90ZWN0ZWQgX3JlcXVlc3QgPSBhc3luYyAoeGhybWV0aG9kOiBNZXRob2QsXG4gICAgYmFzZXVybDogc3RyaW5nLFxuICAgIGdldGRhdGE6IG9iamVjdCxcbiAgICBwb3N0ZGF0YTogc3RyaW5nIHwgb2JqZWN0IHwgQXJyYXlCdWZmZXIgfCBBcnJheUJ1ZmZlclZpZXcsXG4gICAgaGVhZGVyczogb2JqZWN0ID0ge30sXG4gICAgYXhpb3NDb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHVuZGVmaW5lZCk6IFByb21pc2U8UmVxdWVzdFJlc3BvbnNlRGF0YT4gPT4ge1xuICAgIGxldCBjb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZ1xuICAgIGlmIChheGlvc0NvbmZpZykge1xuICAgICAgY29uZmlnID0ge1xuICAgICAgICAuLi5heGlvc0NvbmZpZyxcbiAgICAgICAgLi4udGhpcy5yZXF1ZXN0Q29uZmlnXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbmZpZyA9IHtcbiAgICAgICAgYmFzZVVSTDogYCR7dGhpcy5wcm90b2NvbH06Ly8ke3RoaXMuaXB9OiR7dGhpcy5wb3J0fWAsXG4gICAgICAgIHJlc3BvbnNlVHlwZTogXCJ0ZXh0XCIsXG4gICAgICAgIC4uLnRoaXMucmVxdWVzdENvbmZpZ1xuICAgICAgfVxuICAgIH1cbiAgICBjb25maWcudXJsID0gYmFzZXVybFxuICAgIGNvbmZpZy5tZXRob2QgPSB4aHJtZXRob2RcbiAgICBjb25maWcuaGVhZGVycyA9IGhlYWRlcnNcbiAgICBjb25maWcuZGF0YSA9IHBvc3RkYXRhXG4gICAgY29uZmlnLnBhcmFtcyA9IGdldGRhdGFcbiAgICBjb25zdCByZXNwOiBBeGlvc1Jlc3BvbnNlPGFueT4gPSBhd2FpdCBheGlvcy5yZXF1ZXN0KGNvbmZpZylcbiAgICAvLyBwdXJnaW5nIGFsbCB0aGF0IGlzIGF4aW9zXG4gICAgY29uc3QgeGhyZGF0YTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IG5ldyBSZXF1ZXN0UmVzcG9uc2VEYXRhKClcbiAgICB4aHJkYXRhLmRhdGEgPSByZXNwLmRhdGFcbiAgICB4aHJkYXRhLmhlYWRlcnMgPSByZXNwLmhlYWRlcnNcbiAgICB4aHJkYXRhLnJlcXVlc3QgPSByZXNwLnJlcXVlc3RcbiAgICB4aHJkYXRhLnN0YXR1cyA9IHJlc3Auc3RhdHVzXG4gICAgeGhyZGF0YS5zdGF0dXNUZXh0ID0gcmVzcC5zdGF0dXNUZXh0XG4gICAgcmV0dXJuIHhocmRhdGFcbiAgfVxuXG4gIC8qKlxuICAqIE1ha2VzIGEgR0VUIGNhbGwgdG8gYW4gQVBJLlxuICAqXG4gICogQHBhcmFtIGJhc2V1cmwgUGF0aCB0byB0aGUgYXBpXG4gICogQHBhcmFtIGdldGRhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGtleSB2YWx1ZSBwYWlycyBzZW50IGluIEdFVFxuICAqIEBwYXJhbSBwYXJhbWV0ZXJzIE9iamVjdCBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIG9mIHRoZSBBUEkgY2FsbFxuICAqIEBwYXJhbSBoZWFkZXJzIEFuIGFycmF5IEhUVFAgUmVxdWVzdCBIZWFkZXJzXG4gICogQHBhcmFtIGF4aW9zQ29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBheGlvcyBqYXZhc2NyaXB0IGxpYnJhcnkgdGhhdCB3aWxsIGJlIHRoZVxuICAqIGZvdW5kYXRpb24gZm9yIHRoZSByZXN0IG9mIHRoZSBwYXJhbWV0ZXJzXG4gICpcbiAgKiBAcmV0dXJucyBBIHByb21pc2UgZm9yIFtbUmVxdWVzdFJlc3BvbnNlRGF0YV1dXG4gICovXG4gIGdldCA9IChiYXNldXJsOiBzdHJpbmcsXG4gICAgZ2V0ZGF0YTogb2JqZWN0LFxuICAgIGhlYWRlcnM6IG9iamVjdCA9IHt9LFxuICAgIGF4aW9zQ29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB1bmRlZmluZWQpXG4gICAgOiBQcm9taXNlPFJlcXVlc3RSZXNwb25zZURhdGE+ID0+IHRoaXMuX3JlcXVlc3QoXCJHRVRcIixcbiAgICAgIGJhc2V1cmwsXG4gICAgICBnZXRkYXRhLFxuICAgICAge30sXG4gICAgICB0aGlzLl9zZXRIZWFkZXJzKGhlYWRlcnMpLFxuICAgICAgYXhpb3NDb25maWcpXG5cbiAgLyoqXG4gICogTWFrZXMgYSBERUxFVEUgY2FsbCB0byBhbiBBUEkuXG4gICpcbiAgKiBAcGFyYW0gYmFzZXVybCBQYXRoIHRvIHRoZSBBUElcbiAgKiBAcGFyYW0gZ2V0ZGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUga2V5IHZhbHVlIHBhaXJzIHNlbnQgaW4gREVMRVRFXG4gICogQHBhcmFtIHBhcmFtZXRlcnMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHBhcmFtZXRlcnMgb2YgdGhlIEFQSSBjYWxsXG4gICogQHBhcmFtIGhlYWRlcnMgQW4gYXJyYXkgSFRUUCBSZXF1ZXN0IEhlYWRlcnNcbiAgKiBAcGFyYW0gYXhpb3NDb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIGF4aW9zIGphdmFzY3JpcHQgbGlicmFyeSB0aGF0IHdpbGwgYmUgdGhlXG4gICogZm91bmRhdGlvbiBmb3IgdGhlIHJlc3Qgb2YgdGhlIHBhcmFtZXRlcnNcbiAgKlxuICAqIEByZXR1cm5zIEEgcHJvbWlzZSBmb3IgW1tSZXF1ZXN0UmVzcG9uc2VEYXRhXV1cbiAgKi9cbiAgZGVsZXRlID0gKGJhc2V1cmw6IHN0cmluZyxcbiAgICBnZXRkYXRhOiBvYmplY3QsXG4gICAgaGVhZGVyczogb2JqZWN0ID0ge30sXG4gICAgYXhpb3NDb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHVuZGVmaW5lZClcbiAgICA6IFByb21pc2U8UmVxdWVzdFJlc3BvbnNlRGF0YT4gPT4gdGhpcy5fcmVxdWVzdChcIkRFTEVURVwiLFxuICAgICAgYmFzZXVybCxcbiAgICAgIGdldGRhdGEsXG4gICAgICB7fSxcbiAgICAgIHRoaXMuX3NldEhlYWRlcnMoaGVhZGVycyksXG4gICAgICBheGlvc0NvbmZpZylcblxuICAvKipcbiAgKiBNYWtlcyBhIFBPU1QgY2FsbCB0byBhbiBBUEkuXG4gICpcbiAgKiBAcGFyYW0gYmFzZXVybCBQYXRoIHRvIHRoZSBBUElcbiAgKiBAcGFyYW0gZ2V0ZGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUga2V5IHZhbHVlIHBhaXJzIHNlbnQgaW4gUE9TVFxuICAqIEBwYXJhbSBwb3N0ZGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUga2V5IHZhbHVlIHBhaXJzIHNlbnQgaW4gUE9TVFxuICAqIEBwYXJhbSBwYXJhbWV0ZXJzIE9iamVjdCBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIG9mIHRoZSBBUEkgY2FsbFxuICAqIEBwYXJhbSBoZWFkZXJzIEFuIGFycmF5IEhUVFAgUmVxdWVzdCBIZWFkZXJzXG4gICogQHBhcmFtIGF4aW9zQ29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBheGlvcyBqYXZhc2NyaXB0IGxpYnJhcnkgdGhhdCB3aWxsIGJlIHRoZVxuICAqIGZvdW5kYXRpb24gZm9yIHRoZSByZXN0IG9mIHRoZSBwYXJhbWV0ZXJzXG4gICpcbiAgKiBAcmV0dXJucyBBIHByb21pc2UgZm9yIFtbUmVxdWVzdFJlc3BvbnNlRGF0YV1dXG4gICovXG4gIHBvc3QgPSAoYmFzZXVybDogc3RyaW5nLFxuICAgIGdldGRhdGE6IG9iamVjdCxcbiAgICBwb3N0ZGF0YTogc3RyaW5nIHwgb2JqZWN0IHwgQXJyYXlCdWZmZXIgfCBBcnJheUJ1ZmZlclZpZXcsXG4gICAgaGVhZGVyczogb2JqZWN0ID0ge30sXG4gICAgYXhpb3NDb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHVuZGVmaW5lZClcbiAgICA6IFByb21pc2U8UmVxdWVzdFJlc3BvbnNlRGF0YT4gPT4gdGhpcy5fcmVxdWVzdChcIlBPU1RcIixcbiAgICAgIGJhc2V1cmwsXG4gICAgICBnZXRkYXRhLFxuICAgICAgcG9zdGRhdGEsXG4gICAgICB0aGlzLl9zZXRIZWFkZXJzKGhlYWRlcnMpLFxuICAgICAgYXhpb3NDb25maWcpXG5cbiAgLyoqXG4gICogTWFrZXMgYSBQVVQgY2FsbCB0byBhbiBBUEkuXG4gICpcbiAgKiBAcGFyYW0gYmFzZXVybCBQYXRoIHRvIHRoZSBiYXNldXJsXG4gICogQHBhcmFtIGdldGRhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGtleSB2YWx1ZSBwYWlycyBzZW50IGluIFBVVFxuICAqIEBwYXJhbSBwb3N0ZGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUga2V5IHZhbHVlIHBhaXJzIHNlbnQgaW4gUFVUXG4gICogQHBhcmFtIHBhcmFtZXRlcnMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHBhcmFtZXRlcnMgb2YgdGhlIEFQSSBjYWxsXG4gICogQHBhcmFtIGhlYWRlcnMgQW4gYXJyYXkgSFRUUCBSZXF1ZXN0IEhlYWRlcnNcbiAgKiBAcGFyYW0gYXhpb3NDb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIGF4aW9zIGphdmFzY3JpcHQgbGlicmFyeSB0aGF0IHdpbGwgYmUgdGhlXG4gICogZm91bmRhdGlvbiBmb3IgdGhlIHJlc3Qgb2YgdGhlIHBhcmFtZXRlcnNcbiAgKlxuICAqIEByZXR1cm5zIEEgcHJvbWlzZSBmb3IgW1tSZXF1ZXN0UmVzcG9uc2VEYXRhXV1cbiAgKi9cbiAgcHV0ID0gKGJhc2V1cmw6IHN0cmluZyxcbiAgICBnZXRkYXRhOiBvYmplY3QsXG4gICAgcG9zdGRhdGE6IHN0cmluZyB8IG9iamVjdCB8IEFycmF5QnVmZmVyIHwgQXJyYXlCdWZmZXJWaWV3LFxuICAgIGhlYWRlcnM6IG9iamVjdCA9IHt9LFxuICAgIGF4aW9zQ29uZmlnOiBBeGlvc1JlcXVlc3RDb25maWcgPSB1bmRlZmluZWQpXG4gICAgOiBQcm9taXNlPFJlcXVlc3RSZXNwb25zZURhdGE+ID0+IHRoaXMuX3JlcXVlc3QoXCJQVVRcIixcbiAgICAgIGJhc2V1cmwsXG4gICAgICBnZXRkYXRhLFxuICAgICAgcG9zdGRhdGEsXG4gICAgICB0aGlzLl9zZXRIZWFkZXJzKGhlYWRlcnMpLFxuICAgICAgYXhpb3NDb25maWcpXG5cbiAgLyoqXG4gICogTWFrZXMgYSBQQVRDSCBjYWxsIHRvIGFuIEFQSS5cbiAgKlxuICAqIEBwYXJhbSBiYXNldXJsIFBhdGggdG8gdGhlIGJhc2V1cmxcbiAgKiBAcGFyYW0gZ2V0ZGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUga2V5IHZhbHVlIHBhaXJzIHNlbnQgaW4gUEFUQ0hcbiAgKiBAcGFyYW0gcG9zdGRhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGtleSB2YWx1ZSBwYWlycyBzZW50IGluIFBBVENIXG4gICogQHBhcmFtIHBhcmFtZXRlcnMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHBhcmFtZXRlcnMgb2YgdGhlIEFQSSBjYWxsXG4gICogQHBhcmFtIGhlYWRlcnMgQW4gYXJyYXkgSFRUUCBSZXF1ZXN0IEhlYWRlcnNcbiAgKiBAcGFyYW0gYXhpb3NDb25maWcgQ29uZmlndXJhdGlvbiBmb3IgdGhlIGF4aW9zIGphdmFzY3JpcHQgbGlicmFyeSB0aGF0IHdpbGwgYmUgdGhlXG4gICogZm91bmRhdGlvbiBmb3IgdGhlIHJlc3Qgb2YgdGhlIHBhcmFtZXRlcnNcbiAgKlxuICAqIEByZXR1cm5zIEEgcHJvbWlzZSBmb3IgW1tSZXF1ZXN0UmVzcG9uc2VEYXRhXV1cbiAgKi9cbiAgcGF0Y2ggPSAoYmFzZXVybDogc3RyaW5nLFxuICAgIGdldGRhdGE6IG9iamVjdCxcbiAgICBwb3N0ZGF0YTogc3RyaW5nIHwgb2JqZWN0IHwgQXJyYXlCdWZmZXIgfCBBcnJheUJ1ZmZlclZpZXcsXG4gICAgaGVhZGVyczogb2JqZWN0ID0ge30sXG4gICAgYXhpb3NDb25maWc6IEF4aW9zUmVxdWVzdENvbmZpZyA9IHVuZGVmaW5lZClcbiAgICA6IFByb21pc2U8UmVxdWVzdFJlc3BvbnNlRGF0YT4gPT4gdGhpcy5fcmVxdWVzdChcIlBBVENIXCIsXG4gICAgICBiYXNldXJsLFxuICAgICAgZ2V0ZGF0YSxcbiAgICAgIHBvc3RkYXRhLFxuICAgICAgdGhpcy5fc2V0SGVhZGVycyhoZWFkZXJzKSxcbiAgICAgIGF4aW9zQ29uZmlnKVxuXG4gIC8qKlxuICAqIENyZWF0ZXMgYSBuZXcgQXZhbGFuY2hlIGluc3RhbmNlLiBTZXRzIHRoZSBhZGRyZXNzIGFuZCBwb3J0IG9mIHRoZSBtYWluIEF2YWxhbmNoZSBDbGllbnQuXG4gICpcbiAgKiBAcGFyYW0gaG9zdCBUaGUgaG9zdG5hbWUgdG8gcmVzb2x2ZSB0byByZWFjaCB0aGUgQXZhbGFuY2hlIENsaWVudCBBUElzXG4gICogQHBhcmFtIHBvcnQgVGhlIHBvcnQgdG8gcmVzb2x2ZSB0byByZWFjaCB0aGUgQXZhbGFuY2hlIENsaWVudCBBUElzXG4gICogQHBhcmFtIHByb3RvY29sIFRoZSBwcm90b2NvbCBzdHJpbmcgdG8gdXNlIGJlZm9yZSBhIFwiOi8vXCIgaW4gYSByZXF1ZXN0LCBleDogXCJodHRwXCIsIFwiaHR0cHNcIiwgXCJnaXRcIiwgXCJ3c1wiLCBldGMgLi4uXG4gICovXG4gIGNvbnN0cnVjdG9yKGhvc3Q6IHN0cmluZywgcG9ydDogbnVtYmVyLCBwcm90b2NvbDogc3RyaW5nID0gXCJodHRwXCIpIHtcbiAgICB0aGlzLnNldEFkZHJlc3MoaG9zdCwgcG9ydCwgcHJvdG9jb2wpXG4gIH1cbn1cbiJdfQ==