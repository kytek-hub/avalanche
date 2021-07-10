"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSubnetTx = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM-CreateSubnetTx
 */
const buffer_1 = require("buffer/");
const basetx_1 = require("./basetx");
const constants_1 = require("./constants");
const constants_2 = require("../../utils/constants");
const outputs_1 = require("./outputs");
const errors_1 = require("../../utils/errors");
class CreateSubnetTx extends basetx_1.BaseTx {
    /**
     * Class representing an unsigned Create Subnet transaction.
     *
     * @param networkID Optional networkID, [[DefaultNetworkID]]
     * @param blockchainID Optional blockchainID, default Buffer.alloc(32, 16)
     * @param outs Optional array of the [[TransferableOutput]]s
     * @param ins Optional array of the [[TransferableInput]]s
     * @param memo Optional {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param subnetOwners Optional [[SECPOwnerOutput]] class for specifying who owns the subnet.
    */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, subnetOwners = undefined) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "SECPCredential";
        this._typeID = constants_1.PlatformVMConstants.CREATESUBNETTX;
        this.subnetOwners = undefined;
        /**
         * Returns the id of the [[CreateSubnetTx]]
         */
        this.getTxType = () => {
            return this._typeID;
        };
        this.subnetOwners = subnetOwners;
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "subnetOwners": this.subnetOwners.serialize(encoding) });
    }
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.subnetOwners = new outputs_1.SECPOwnerOutput();
        this.subnetOwners.deserialize(fields["subnetOwners"], encoding);
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the reward address.
     */
    getSubnetOwners() {
        return this.subnetOwners;
    }
    /**
     * Takes a {@link https://github.com/feross/buffer|Buffer} containing an [[CreateSubnetTx]], parses it, populates the class, and returns the length of the [[CreateSubnetTx]] in bytes.
     *
     * @param bytes A {@link https://github.com/feross/buffer|Buffer} containing a raw [[CreateSubnetTx]]
     * @param offset A number for the starting position in the bytes.
     *
     * @returns The length of the raw [[CreateSubnetTx]]
     *
     * @remarks assume not-checksummed
     */
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.subnetOwners = new outputs_1.SECPOwnerOutput();
        offset = this.subnetOwners.fromBuffer(bytes, offset);
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[CreateSubnetTx]].
     */
    toBuffer() {
        if (typeof this.subnetOwners === "undefined" || !(this.subnetOwners instanceof outputs_1.SECPOwnerOutput)) {
            throw new errors_1.SubnetOwnerError("CreateSubnetTx.toBuffer -- this.subnetOwners is not a SECPOwnerOutput");
        }
        let typeID = buffer_1.Buffer.alloc(4);
        typeID.writeUInt32BE(this.subnetOwners.getOutputID(), 0);
        let barr = [super.toBuffer(), typeID, this.subnetOwners.toBuffer()];
        return buffer_1.Buffer.concat(barr);
    }
}
exports.CreateSubnetTx = CreateSubnetTx;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3JlYXRlc3VibmV0dHguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvYXBpcy9wbGF0Zm9ybXZtL2NyZWF0ZXN1Ym5ldHR4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7R0FHRztBQUNILG9DQUFnQztBQUNoQyxxQ0FBaUM7QUFDakMsMkNBQWlEO0FBQ2pELHFEQUF3RDtBQUN4RCx1Q0FBK0Q7QUFHL0QsK0NBQXFEO0FBRXJELE1BQWEsY0FBZSxTQUFRLGVBQU07SUErRHhDOzs7Ozs7Ozs7TUFTRTtJQUNGLFlBQ0UsWUFBb0IsNEJBQWdCLEVBQ3BDLGVBQXVCLGVBQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUMzQyxPQUE2QixTQUFTLEVBQ3RDLE1BQTJCLFNBQVMsRUFDcEMsT0FBYyxTQUFTLEVBQ3ZCLGVBQStCLFNBQVM7UUFFeEMsS0FBSyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTtRQWhGdkMsY0FBUyxHQUFHLGdCQUFnQixDQUFBO1FBQzVCLFlBQU8sR0FBRywrQkFBbUIsQ0FBQyxjQUFjLENBQUE7UUFlNUMsaUJBQVksR0FBb0IsU0FBUyxDQUFBO1FBRW5EOztXQUVHO1FBQ0gsY0FBUyxHQUFHLEdBQVUsRUFBRTtZQUN0QixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUE7UUFDckIsQ0FBQyxDQUFBO1FBMERDLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFBO0lBQ2xDLENBQUM7SUEvRUQsU0FBUyxDQUFDLFdBQStCLEtBQUs7UUFDNUMsSUFBSSxNQUFNLEdBQVcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUM5Qyx1Q0FDSyxNQUFNLEtBQ1QsY0FBYyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUN0RDtJQUNILENBQUM7SUFDRCxXQUFXLENBQUMsTUFBYyxFQUFFLFdBQStCLEtBQUs7UUFDOUQsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7UUFDbkMsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLHlCQUFlLEVBQUUsQ0FBQTtRQUN6QyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDakUsQ0FBQztJQVdEOztPQUVHO0lBQ0gsZUFBZTtRQUNiLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQTtJQUMxQixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0gsVUFBVSxDQUFDLEtBQWEsRUFBRSxTQUFpQixDQUFDO1FBQzFDLE1BQU0sR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQTtRQUN4QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUkseUJBQWUsRUFBRSxDQUFBO1FBQ3pDLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUE7UUFDcEQsT0FBTyxNQUFNLENBQUE7SUFDYixDQUFDO0lBRUg7O09BRUc7SUFDSCxRQUFRO1FBQ0osSUFBRyxPQUFPLElBQUksQ0FBQyxZQUFZLEtBQUssV0FBVyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxZQUFZLHlCQUFlLENBQUMsRUFBRTtZQUM5RixNQUFNLElBQUkseUJBQWdCLENBQUMsdUVBQXVFLENBQUMsQ0FBQTtTQUNwRztRQUNILElBQUksTUFBTSxHQUFXLGVBQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDcEMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO1FBQ3hELElBQUksSUFBSSxHQUFhLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUE7UUFDN0UsT0FBTyxlQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzVCLENBQUM7Q0F1QkY7QUFwRkQsd0NBb0ZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVBsYXRmb3JtVk0tQ3JlYXRlU3VibmV0VHhcbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLydcbmltcG9ydCB7IEJhc2VUeCB9IGZyb20gJy4vYmFzZXR4J1xuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gJy4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnN0YW50cydcbmltcG9ydCB7IFRyYW5zZmVyYWJsZU91dHB1dCwgU0VDUE93bmVyT3V0cHV0IH0gZnJvbSAnLi9vdXRwdXRzJ1xuaW1wb3J0IHsgVHJhbnNmZXJhYmxlSW5wdXQgfSBmcm9tICcuL2lucHV0cydcbmltcG9ydCB7IFNlcmlhbGl6ZWRFbmNvZGluZyB9IGZyb20gJy4uLy4uL3V0aWxzL3NlcmlhbGl6YXRpb24nXG5pbXBvcnQgeyBTdWJuZXRPd25lckVycm9yIH0gZnJvbSAnLi4vLi4vdXRpbHMvZXJyb3JzJ1xuXG5leHBvcnQgY2xhc3MgQ3JlYXRlU3VibmV0VHggZXh0ZW5kcyBCYXNlVHgge1xuICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJTRUNQQ3JlZGVudGlhbFwiXG4gIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5DUkVBVEVTVUJORVRUWFxuXG4gIHNlcmlhbGl6ZShlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIik6IG9iamVjdCB7XG4gICAgbGV0IGZpZWxkczogb2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKVxuICAgIHJldHVybiB7XG4gICAgICAuLi5maWVsZHMsXG4gICAgICBcInN1Ym5ldE93bmVyc1wiOiB0aGlzLnN1Ym5ldE93bmVycy5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgfVxuICB9XG4gIGRlc2VyaWFsaXplKGZpZWxkczogb2JqZWN0LCBlbmNvZGluZzogU2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpXG4gICAgdGhpcy5zdWJuZXRPd25lcnMgPSBuZXcgU0VDUE93bmVyT3V0cHV0KClcbiAgICB0aGlzLnN1Ym5ldE93bmVycy5kZXNlcmlhbGl6ZShmaWVsZHNbXCJzdWJuZXRPd25lcnNcIl0sIGVuY29kaW5nKVxuICB9XG5cbiAgcHJvdGVjdGVkIHN1Ym5ldE93bmVyczogU0VDUE93bmVyT3V0cHV0ID0gdW5kZWZpbmVkXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGlkIG9mIHRoZSBbW0NyZWF0ZVN1Ym5ldFR4XV1cbiAgICovXG4gIGdldFR4VHlwZSA9ICgpOm51bWJlciA9PiB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIHJld2FyZCBhZGRyZXNzLlxuICAgKi9cbiAgZ2V0U3VibmV0T3duZXJzKCk6IFNFQ1BPd25lck91dHB1dCB7XG4gICAgcmV0dXJuIHRoaXMuc3VibmV0T3duZXJzXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBjb250YWluaW5nIGFuIFtbQ3JlYXRlU3VibmV0VHhdXSwgcGFyc2VzIGl0LCBwb3B1bGF0ZXMgdGhlIGNsYXNzLCBhbmQgcmV0dXJucyB0aGUgbGVuZ3RoIG9mIHRoZSBbW0NyZWF0ZVN1Ym5ldFR4XV0gaW4gYnl0ZXMuXG4gICAqXG4gICAqIEBwYXJhbSBieXRlcyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGNvbnRhaW5pbmcgYSByYXcgW1tDcmVhdGVTdWJuZXRUeF1dXG4gICAqIEBwYXJhbSBvZmZzZXQgQSBudW1iZXIgZm9yIHRoZSBzdGFydGluZyBwb3NpdGlvbiBpbiB0aGUgYnl0ZXMuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBsZW5ndGggb2YgdGhlIHJhdyBbW0NyZWF0ZVN1Ym5ldFR4XV1cbiAgICpcbiAgICogQHJlbWFya3MgYXNzdW1lIG5vdC1jaGVja3N1bW1lZFxuICAgKi9cbiAgZnJvbUJ1ZmZlcihieXRlczogQnVmZmVyLCBvZmZzZXQ6IG51bWJlciA9IDApOiBudW1iZXIge1xuICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICB0aGlzLnN1Ym5ldE93bmVycyA9IG5ldyBTRUNQT3duZXJPdXRwdXQoKVxuICAgIG9mZnNldCA9IHRoaXMuc3VibmV0T3duZXJzLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldClcbiAgICByZXR1cm4gb2Zmc2V0XG4gICAgfVxuICBcbiAgLyoqXG4gICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tDcmVhdGVTdWJuZXRUeF1dLlxuICAgKi9cbiAgdG9CdWZmZXIoKTpCdWZmZXIge1xuICAgICAgaWYodHlwZW9mIHRoaXMuc3VibmV0T3duZXJzID09PSBcInVuZGVmaW5lZFwiIHx8ICEodGhpcy5zdWJuZXRPd25lcnMgaW5zdGFuY2VvZiBTRUNQT3duZXJPdXRwdXQpKSB7XG4gICAgICAgIHRocm93IG5ldyBTdWJuZXRPd25lckVycm9yKFwiQ3JlYXRlU3VibmV0VHgudG9CdWZmZXIgLS0gdGhpcy5zdWJuZXRPd25lcnMgaXMgbm90IGEgU0VDUE93bmVyT3V0cHV0XCIpXG4gICAgICB9XG4gICAgbGV0IHR5cGVJRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpXG4gICAgdHlwZUlELndyaXRlVUludDMyQkUodGhpcy5zdWJuZXRPd25lcnMuZ2V0T3V0cHV0SUQoKSwgMClcbiAgICBsZXQgYmFycjogQnVmZmVyW10gPSBbc3VwZXIudG9CdWZmZXIoKSwgdHlwZUlELCB0aGlzLnN1Ym5ldE93bmVycy50b0J1ZmZlcigpXVxuICAgIHJldHVybiBCdWZmZXIuY29uY2F0KGJhcnIpXG4gIH1cblxuICAvKipcbiAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIENyZWF0ZSBTdWJuZXQgdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSBuZXR3b3JrSUQgT3B0aW9uYWwgbmV0d29ya0lELCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIE9wdGlvbmFsIGJsb2NrY2hhaW5JRCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgKiBAcGFyYW0gb3V0cyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICogQHBhcmFtIGlucyBPcHRpb25hbCBhcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICogQHBhcmFtIHN1Ym5ldE93bmVycyBPcHRpb25hbCBbW1NFQ1BPd25lck91dHB1dF1dIGNsYXNzIGZvciBzcGVjaWZ5aW5nIHdobyBvd25zIHRoZSBzdWJuZXQuXG4gICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCxcbiAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMiwgMTYpLFxuICAgIG91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gdW5kZWZpbmVkLFxuICAgIGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOkJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBzdWJuZXRPd25lcnM6U0VDUE93bmVyT3V0cHV0ID0gdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMsIG1lbW8pXG4gICAgdGhpcy5zdWJuZXRPd25lcnMgPSBzdWJuZXRPd25lcnNcbiAgfVxufVxuICAiXX0=