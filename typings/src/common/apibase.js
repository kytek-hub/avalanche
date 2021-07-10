"use strict";
/**
 * @packageDocumentation
 * @module Common-APIBase
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIBase = exports.RequestResponseData = void 0;
const db_1 = __importDefault(require("../utils/db"));
/**
 * Response data for HTTP requests.
 */
class RequestResponseData {
}
exports.RequestResponseData = RequestResponseData;
/**
 * Abstract class defining a generic endpoint that all endpoints must implement (extend).
 */
class APIBase {
    /**
       *
       * @param core Reference to the Avalanche instance using this baseurl
       * @param baseurl Path to the baseurl - ex: "/ext/bc/X"
       */
    constructor(core, baseurl) {
        /**
           * Sets the path of the APIs baseurl.
           *
           * @param baseurl Path of the APIs baseurl - ex: "/ext/bc/X"
           */
        this.setBaseURL = (baseurl) => {
            if (this.db && this.baseurl !== baseurl) {
                const backup = this.db.getAll();
                this.db.clearAll();
                this.baseurl = baseurl;
                this.db = db_1.default.getNamespace(baseurl);
                this.db.setAll(backup, true);
            }
            else {
                this.baseurl = baseurl;
                this.db = db_1.default.getNamespace(baseurl);
            }
        };
        /**
           * Returns the baseurl's path.
           */
        this.getBaseURL = () => this.baseurl;
        /**
           * Returns the baseurl's database.
           */
        this.getDB = () => this.db;
        this.core = core;
        this.setBaseURL(baseurl);
    }
}
exports.APIBase = APIBase;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb21tb24vYXBpYmFzZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztHQUdHOzs7Ozs7QUFJSCxxREFBNkI7QUFHN0I7O0dBRUc7QUFDSCxNQUFhLG1CQUFtQjtDQU0vQjtBQU5ELGtEQU1DO0FBRUQ7O0dBRUc7QUFDSCxNQUFzQixPQUFPO0lBbUMzQjs7OztTQUlLO0lBQ0wsWUFBWSxJQUFrQixFQUFFLE9BQWM7UUFqQzlDOzs7O2FBSUs7UUFDTCxlQUFVLEdBQUcsQ0FBQyxPQUFjLEVBQUUsRUFBRTtZQUM5QixJQUFJLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxPQUFPLEVBQUU7Z0JBQ3ZDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2hDLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO2dCQUN2QixJQUFJLENBQUMsRUFBRSxHQUFHLFlBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ25DLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzthQUM5QjtpQkFBTTtnQkFDTCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztnQkFDdkIsSUFBSSxDQUFDLEVBQUUsR0FBRyxZQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3BDO1FBQ0gsQ0FBQyxDQUFDO1FBRUY7O2FBRUs7UUFDTCxlQUFVLEdBQUcsR0FBWSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUV6Qzs7YUFFSztRQUNMLFVBQUssR0FBRyxHQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1FBUTdCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDM0IsQ0FBQztDQUNGO0FBNUNELDBCQTRDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIENvbW1vbi1BUElCYXNlXG4gKi9cblxuaW1wb3J0IHsgU3RvcmVBUEkgfSBmcm9tICdzdG9yZTInO1xuaW1wb3J0IHsgQ2xpZW50UmVxdWVzdCB9IGZyb20gJ2h0dHAnO1xuaW1wb3J0IERCIGZyb20gJy4uL3V0aWxzL2RiJztcbmltcG9ydCBBdmFsYW5jaGVDb3JlIGZyb20gJy4uL2F2YWxhbmNoZSc7XG5cbi8qKlxuICogUmVzcG9uc2UgZGF0YSBmb3IgSFRUUCByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlcXVlc3RSZXNwb25zZURhdGEge1xuICBkYXRhOiBhbnk7XG4gIGhlYWRlcnM6IGFueTtcbiAgc3RhdHVzOiBudW1iZXI7XG4gIHN0YXR1c1RleHQ6IHN0cmluZztcbiAgcmVxdWVzdDpDbGllbnRSZXF1ZXN0IHwgWE1MSHR0cFJlcXVlc3Q7XG59XG5cbi8qKlxuICogQWJzdHJhY3QgY2xhc3MgZGVmaW5pbmcgYSBnZW5lcmljIGVuZHBvaW50IHRoYXQgYWxsIGVuZHBvaW50cyBtdXN0IGltcGxlbWVudCAoZXh0ZW5kKS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFQSUJhc2Uge1xuICBwcm90ZWN0ZWQgY29yZTpBdmFsYW5jaGVDb3JlO1xuXG4gIHByb3RlY3RlZCBiYXNldXJsOnN0cmluZztcblxuICBwcm90ZWN0ZWQgZGI6U3RvcmVBUEk7XG5cbiAgLyoqXG4gICAgICogU2V0cyB0aGUgcGF0aCBvZiB0aGUgQVBJcyBiYXNldXJsLlxuICAgICAqXG4gICAgICogQHBhcmFtIGJhc2V1cmwgUGF0aCBvZiB0aGUgQVBJcyBiYXNldXJsIC0gZXg6IFwiL2V4dC9iYy9YXCJcbiAgICAgKi9cbiAgc2V0QmFzZVVSTCA9IChiYXNldXJsOnN0cmluZykgPT4ge1xuICAgIGlmICh0aGlzLmRiICYmIHRoaXMuYmFzZXVybCAhPT0gYmFzZXVybCkge1xuICAgICAgY29uc3QgYmFja3VwID0gdGhpcy5kYi5nZXRBbGwoKTtcbiAgICAgIHRoaXMuZGIuY2xlYXJBbGwoKTtcbiAgICAgIHRoaXMuYmFzZXVybCA9IGJhc2V1cmw7XG4gICAgICB0aGlzLmRiID0gREIuZ2V0TmFtZXNwYWNlKGJhc2V1cmwpO1xuICAgICAgdGhpcy5kYi5zZXRBbGwoYmFja3VwLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5iYXNldXJsID0gYmFzZXVybDtcbiAgICAgIHRoaXMuZGIgPSBEQi5nZXROYW1lc3BhY2UoYmFzZXVybCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGJhc2V1cmwncyBwYXRoLlxuICAgICAqL1xuICBnZXRCYXNlVVJMID0gKCkgOiBzdHJpbmcgPT4gdGhpcy5iYXNldXJsO1xuXG4gIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGJhc2V1cmwncyBkYXRhYmFzZS5cbiAgICAgKi9cbiAgZ2V0REIgPSAoKTpTdG9yZUFQSSA9PiB0aGlzLmRiO1xuXG4gIC8qKlxuICAgICAqXG4gICAgICogQHBhcmFtIGNvcmUgUmVmZXJlbmNlIHRvIHRoZSBBdmFsYW5jaGUgaW5zdGFuY2UgdXNpbmcgdGhpcyBiYXNldXJsXG4gICAgICogQHBhcmFtIGJhc2V1cmwgUGF0aCB0byB0aGUgYmFzZXVybCAtIGV4OiBcIi9leHQvYmMvWFwiXG4gICAgICovXG4gIGNvbnN0cnVjdG9yKGNvcmU6QXZhbGFuY2hlQ29yZSwgYmFzZXVybDpzdHJpbmcpIHtcbiAgICB0aGlzLmNvcmUgPSBjb3JlO1xuICAgIHRoaXMuc2V0QmFzZVVSTChiYXNldXJsKTtcbiAgfVxufVxuXG4iXX0=