"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PubSub {
    newSet() {
        return JSON.stringify({ newSet: {} });
    }
    newBloom(maxElements = 1000, collisionProb = 0.01) {
        return JSON.stringify({
            newBloom: {
                maxElements: maxElements,
                collisionProb: collisionProb
            }
        });
    }
    addAddresses(addresses) {
        return JSON.stringify({
            addAddresses: {
                addresses: addresses
            }
        });
    }
}
exports.default = PubSub;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVic3ViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3V0aWxzL3B1YnN1Yi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE1BQXFCLE1BQU07SUFDekIsTUFBTTtRQUNKLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFDLE1BQU0sRUFBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFDRCxRQUFRLENBQUMsY0FBc0IsSUFBSSxFQUFFLGdCQUF3QixJQUFJO1FBQy9ELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNwQixRQUFRLEVBQUU7Z0JBQ1IsV0FBVyxFQUFFLFdBQVc7Z0JBQ3hCLGFBQWEsRUFBRSxhQUFhO2FBQzdCO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNELFlBQVksQ0FBQyxTQUFtQjtRQUM5QixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDcEIsWUFBWSxFQUFFO2dCQUNaLFNBQVMsRUFBRSxTQUFTO2FBQ3JCO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBbkJELHlCQW1CQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGNsYXNzIFB1YlN1YiB7XG4gIG5ld1NldCgpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoe25ld1NldDp7fX0pO1xuICB9XG4gIG5ld0Jsb29tKG1heEVsZW1lbnRzOiBudW1iZXIgPSAxMDAwLCBjb2xsaXNpb25Qcm9iOiBudW1iZXIgPSAwLjAxKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIG5ld0Jsb29tOiB7XG4gICAgICAgIG1heEVsZW1lbnRzOiBtYXhFbGVtZW50cyxcbiAgICAgICAgY29sbGlzaW9uUHJvYjogY29sbGlzaW9uUHJvYlxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGFkZEFkZHJlc3NlcyhhZGRyZXNzZXM6IHN0cmluZ1tdKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgIGFkZEFkZHJlc3Nlczoge1xuICAgICAgICBhZGRyZXNzZXM6IGFkZHJlc3Nlc1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59Il19