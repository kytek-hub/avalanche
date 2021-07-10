"use strict";
/**
 * @packageDocumentation
 * @module API-PlatformVM-ValidationTx
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddValidatorTx = exports.AddDelegatorTx = exports.WeightedValidatorTx = exports.ValidatorTx = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const bintools_1 = __importDefault(require("../../utils/bintools"));
const basetx_1 = require("./basetx");
const outputs_1 = require("../platformvm/outputs");
const buffer_1 = require("buffer/");
const constants_1 = require("./constants");
const constants_2 = require("../../utils/constants");
const helperfunctions_1 = require("../../utils/helperfunctions");
const outputs_2 = require("./outputs");
const serialization_1 = require("../../utils/serialization");
const errors_1 = require("../../utils/errors");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = serialization_1.Serialization.getInstance();
/**
 * Abstract class representing an transactions with validation information.
 */
class ValidatorTx extends basetx_1.BaseTx {
    constructor(networkID, blockchainID, outs, ins, memo, nodeID, startTime, endTime) {
        super(networkID, blockchainID, outs, ins, memo);
        this._typeName = "ValidatorTx";
        this._typeID = undefined;
        this.nodeID = buffer_1.Buffer.alloc(20);
        this.startTime = buffer_1.Buffer.alloc(8);
        this.endTime = buffer_1.Buffer.alloc(8);
        this.nodeID = nodeID;
        this.startTime = bintools.fromBNToBuffer(startTime, 8);
        this.endTime = bintools.fromBNToBuffer(endTime, 8);
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "nodeID": serialization.encoder(this.nodeID, encoding, "Buffer", "nodeID"), "startTime": serialization.encoder(this.startTime, encoding, "Buffer", "decimalString"), "endTime": serialization.encoder(this.endTime, encoding, "Buffer", "decimalString") });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.nodeID = serialization.decoder(fields["nodeID"], encoding, "nodeID", "Buffer", 20);
        this.startTime = serialization.decoder(fields["startTime"], encoding, "decimalString", "Buffer", 8);
        this.endTime = serialization.decoder(fields["endTime"], encoding, "decimalString", "Buffer", 8);
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the stake amount.
     */
    getNodeID() {
        return this.nodeID;
    }
    /**
     * Returns a string for the nodeID amount.
     */
    getNodeIDString() {
        return helperfunctions_1.bufferToNodeIDString(this.nodeID);
    }
    /**
     * Returns a {@link https://github.com/indutny/bn.js/|BN} for the stake amount.
     */
    getStartTime() {
        return bintools.fromBufferToBN(this.startTime);
    }
    /**
     * Returns a {@link https://github.com/indutny/bn.js/|BN} for the stake amount.
     */
    getEndTime() {
        return bintools.fromBufferToBN(this.endTime);
    }
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.nodeID = bintools.copyFrom(bytes, offset, offset + 20);
        offset += 20;
        this.startTime = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        this.endTime = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[ValidatorTx]].
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        const bsize = superbuff.length + this.nodeID.length + this.startTime.length + this.endTime.length;
        return buffer_1.Buffer.concat([
            superbuff,
            this.nodeID,
            this.startTime,
            this.endTime
        ], bsize);
    }
}
exports.ValidatorTx = ValidatorTx;
class WeightedValidatorTx extends ValidatorTx {
    /**
     * Class representing an unsigned AddSubnetValidatorTx transaction.
     *
     * @param networkID Optional. Networkid, [[DefaultNetworkID]]
     * @param blockchainID Optional. Blockchainid, default Buffer.alloc(32, 16)
     * @param outs Optional. Array of the [[TransferableOutput]]s
     * @param ins Optional. Array of the [[TransferableInput]]s
     * @param memo Optional. {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param nodeID Optional. The node ID of the validator being added.
     * @param startTime Optional. The Unix time when the validator starts validating the Primary Network.
     * @param endTime Optional. The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
     * @param weight Optional. The amount of nAVAX the validator is staking.
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, nodeID = undefined, startTime = undefined, endTime = undefined, weight = undefined) {
        super(networkID, blockchainID, outs, ins, memo, nodeID, startTime, endTime);
        this._typeName = "WeightedValidatorTx";
        this._typeID = undefined;
        this.weight = buffer_1.Buffer.alloc(8);
        if (typeof weight !== undefined) {
            this.weight = bintools.fromBNToBuffer(weight, 8);
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "weight": serialization.encoder(this.weight, encoding, "Buffer", "decimalString") });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.weight = serialization.decoder(fields["weight"], encoding, "decimalString", "Buffer", 8);
    }
    /**
     * Returns a {@link https://github.com/indutny/bn.js/|BN} for the stake amount.
     */
    getWeight() {
        return bintools.fromBufferToBN(this.weight);
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the stake amount.
     */
    getWeightBuffer() {
        return this.weight;
    }
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        this.weight = bintools.copyFrom(bytes, offset, offset + 8);
        offset += 8;
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddSubnetValidatorTx]].
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        return buffer_1.Buffer.concat([superbuff, this.weight]);
    }
}
exports.WeightedValidatorTx = WeightedValidatorTx;
/* Must implement later, the signing process isn't friendly to AvalancheJS

export class AddSubnetValidatorTx extends WeightedValidatorTx {
    protected subnetID:Buffer = Buffer.alloc(32);
    protected subnetAddrs:Buffer[] = [];
    protected subnetAuthIdxs:Buffer[] = [];


    getTxType = ():number => {
        return PlatformVMConstants.ADDSUBNETVALIDATORTX;
    }


    getSubnetID = ():Buffer => {
        return this.subnetID;
    }


    getSubnetIDString = ():string => {
        return bintools.cb58Encode(this.subnetID);
    }


    getSubnetAuthAddresses = ():Buffer[] => {
        return this.subnetAddrs;
    }


    setSubnetAuthAddresses = (addrs:Buffer[]):void => {
        this.subnetAddrs = addrs;
    }

    calcSubnetAuthIdxs = (addrs:Buffer[]):Buffer[] => {
        let idxs:Buffer[] = [];
        addrs = addrs.sort();
        for(let i: number = 0; i < addrs.length; i++){
            let idx:Buffer = Buffer.alloc(4);
            idx.writeUInt32BE(i,0);
            idxs.push(idx);
        }
    }


    getSubnetAuthIdxs = ():Buffer[] => {
        return this.subnetAddrs;
    }

    fromBuffer(bytes:Buffer, offset:number = 0):number {
        offset = super.fromBuffer(bytes, offset);
        this.subnetID = bintools.copyFrom(bytes, offset, offset + 32);
        offset += 32;
        let sublenbuff:Buffer = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        let sublen:number = sublenbuff.readUInt32BE(0);
        for(let i: number = 0; i < sublen; i++){

        }
        offset = this.subnetAuth.fromBuffer(bytes, offset);
        return offset;
    }


    toBuffer():Buffer {
        const superbuff:Buffer = super.toBuffer();

        return Buffer.concat([superbuff, this.subnetID, subAuth], superbuff.length + this.subnetID.length + subAuth.length);
    }


    sign(msg:Buffer, kc:KeyChain):Credential[] {
        let creds:SECPCredential[] = super.sign(msg, kc);
        const cred:SECPCredential = SelectCredentialClass(PlatformVMConstants.SECPCREDENTIAL) as SECPCredential;
        for(let i: number = 0; i  < this.subnetAuth.length ; i++) {
            if(!kc.hasKey(this.subnetAuth[i])) {
                throw new Error("AddSubnetValidatorTx.sign -- specified address in subnetAuth not existent in provided keychain.");
            }
            
            let kp:KeyPair = kc.getKey(this.subnetAuth[i]);
            const signval:Buffer = kp.sign(msg);
            const sig:Signature = new Signature();
            sig.fromBuffer(signval);
            cred.addSignature(sig);
        }
        creds.push(cred);
        return creds;
    }


    constructor(
        networkID:number = DefaultNetworkID,
        blockchainID:Buffer = Buffer.alloc(32, 16),
        outs:TransferableOutput[] = undefined,
        ins:TransferableInput[] = undefined,
        memo:Buffer = undefined,
        nodeID:Buffer = undefined,
        startTime:BN = undefined,
        endTime:BN = undefined,
        weight:BN = undefined,
        subnetID:Buffer = undefined,
        subnetAuth:Buffer[] = undefined
    ) {
        super(networkID, blockchainID, outs, ins, memo, nodeID, startTime, endTime, weight);
        if(typeof subnetID !== undefined){
            this.subnetID = subnetID;
        }
        if(typeof subnetAuth !== undefined) {
            this.subnetAuth = subnetAuth;
        }
    }

}
*/
/**
 * Class representing an unsigned AddDelegatorTx transaction.
 */
class AddDelegatorTx extends WeightedValidatorTx {
    /**
     * Class representing an unsigned AddDelegatorTx transaction.
     *
     * @param networkID Optional. Networkid, [[DefaultNetworkID]]
     * @param blockchainID Optional. Blockchainid, default Buffer.alloc(32, 16)
     * @param outs Optional. Array of the [[TransferableOutput]]s
     * @param ins Optional. Array of the [[TransferableInput]]s
     * @param memo Optional. {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param nodeID Optional. The node ID of the validator being added.
     * @param startTime Optional. The Unix time when the validator starts validating the Primary Network.
     * @param endTime Optional. The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
     * @param stakeAmount Optional. The amount of nAVAX the validator is staking.
     * @param stakeOuts Optional. The outputs used in paying the stake.
     * @param rewardOwners Optional. The [[ParseableOutput]] containing a [[SECPOwnerOutput]] for the rewards.
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, nodeID = undefined, startTime = undefined, endTime = undefined, stakeAmount = undefined, stakeOuts = undefined, rewardOwners = undefined) {
        super(networkID, blockchainID, outs, ins, memo, nodeID, startTime, endTime, stakeAmount);
        this._typeName = "AddDelegatorTx";
        this._typeID = constants_1.PlatformVMConstants.ADDDELEGATORTX;
        this.stakeOuts = [];
        this.rewardOwners = undefined;
        /**
           * Returns the id of the [[AddDelegatorTx]]
           */
        this.getTxType = () => {
            return this._typeID;
        };
        if (typeof stakeOuts !== undefined) {
            this.stakeOuts = stakeOuts;
        }
        this.rewardOwners = rewardOwners;
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "stakeOuts": this.stakeOuts.map((s) => s.serialize(encoding)), "rewardOwners": this.rewardOwners.serialize(encoding) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        this.stakeOuts = fields["stakeOuts"].map((s) => {
            let xferout = new outputs_1.TransferableOutput();
            xferout.deserialize(s, encoding);
            return xferout;
        });
        this.rewardOwners = new outputs_2.ParseableOutput();
        this.rewardOwners.deserialize(fields["rewardOwners"], encoding);
    }
    /**
     * Returns a {@link https://github.com/indutny/bn.js/|BN} for the stake amount.
     */
    getStakeAmount() {
        return this.getWeight();
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the stake amount.
     */
    getStakeAmountBuffer() {
        return this.weight;
    }
    /**
     * Returns the array of outputs being staked.
     */
    getStakeOuts() {
        return this.stakeOuts;
    }
    /**
     * Should match stakeAmount. Used in sanity checking.
     */
    getStakeOutsTotal() {
        let val = new bn_js_1.default(0);
        for (let i = 0; i < this.stakeOuts.length; i++) {
            val = val.add(this.stakeOuts[i].getOutput().getAmount());
        }
        return val;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} for the reward address.
     */
    getRewardOwners() {
        return this.rewardOwners;
    }
    getTotalOuts() {
        return [...this.getOuts(), ...this.getStakeOuts()];
    }
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        const numstakeouts = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        const outcount = numstakeouts.readUInt32BE(0);
        this.stakeOuts = [];
        for (let i = 0; i < outcount; i++) {
            const xferout = new outputs_1.TransferableOutput();
            offset = xferout.fromBuffer(bytes, offset);
            this.stakeOuts.push(xferout);
        }
        this.rewardOwners = new outputs_2.ParseableOutput();
        offset = this.rewardOwners.fromBuffer(bytes, offset);
        return offset;
    }
    /**
     * Returns a {@link https://github.com/feross/buffer|Buffer} representation of the [[AddDelegatorTx]].
     */
    toBuffer() {
        const superbuff = super.toBuffer();
        let bsize = superbuff.length;
        const numouts = buffer_1.Buffer.alloc(4);
        numouts.writeUInt32BE(this.stakeOuts.length, 0);
        let barr = [super.toBuffer(), numouts];
        bsize += numouts.length;
        this.stakeOuts = this.stakeOuts.sort(outputs_1.TransferableOutput.comparator());
        for (let i = 0; i < this.stakeOuts.length; i++) {
            let out = this.stakeOuts[i].toBuffer();
            barr.push(out);
            bsize += out.length;
        }
        let ro = this.rewardOwners.toBuffer();
        barr.push(ro);
        bsize += ro.length;
        return buffer_1.Buffer.concat(barr, bsize);
    }
    clone() {
        let newbase = new AddDelegatorTx();
        newbase.fromBuffer(this.toBuffer());
        return newbase;
    }
    create(...args) {
        return new AddDelegatorTx(...args);
    }
}
exports.AddDelegatorTx = AddDelegatorTx;
class AddValidatorTx extends AddDelegatorTx {
    /**
     * Class representing an unsigned AddValidatorTx transaction.
     *
     * @param networkID Optional. Networkid, [[DefaultNetworkID]]
     * @param blockchainID Optional. Blockchainid, default Buffer.alloc(32, 16)
     * @param outs Optional. Array of the [[TransferableOutput]]s
     * @param ins Optional. Array of the [[TransferableInput]]s
     * @param memo Optional. {@link https://github.com/feross/buffer|Buffer} for the memo field
     * @param nodeID Optional. The node ID of the validator being added.
     * @param startTime Optional. The Unix time when the validator starts validating the Primary Network.
     * @param endTime Optional. The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
     * @param stakeAmount Optional. The amount of nAVAX the validator is staking.
     * @param stakeOuts Optional. The outputs used in paying the stake.
     * @param rewardOwners Optional. The [[ParseableOutput]] containing the [[SECPOwnerOutput]] for the rewards.
     * @param delegationFee Optional. The percent fee this validator charges when others delegate stake to them.
     * Up to 4 decimal places allowed; additional decimal places are ignored. Must be between 0 and 100, inclusive.
     * For example, if delegationFeeRate is 1.2345 and someone delegates to this validator, then when the delegation
     * period is over, 1.2345% of the reward goes to the validator and the rest goes to the delegator.
     */
    constructor(networkID = constants_2.DefaultNetworkID, blockchainID = buffer_1.Buffer.alloc(32, 16), outs = undefined, ins = undefined, memo = undefined, nodeID = undefined, startTime = undefined, endTime = undefined, stakeAmount = undefined, stakeOuts = undefined, rewardOwners = undefined, delegationFee = undefined) {
        super(networkID, blockchainID, outs, ins, memo, nodeID, startTime, endTime, stakeAmount, stakeOuts, rewardOwners);
        this._typeName = "AddValidatorTx";
        this._typeID = constants_1.PlatformVMConstants.ADDVALIDATORTX;
        this.delegationFee = 0;
        /**
           * Returns the id of the [[AddValidatorTx]]
           */
        this.getTxType = () => {
            return this._typeID;
        };
        if (typeof delegationFee === "number") {
            if (delegationFee >= 0 && delegationFee <= 100) {
                this.delegationFee = parseFloat(delegationFee.toFixed(4));
            }
            else {
                throw new errors_1.DelegationFeeError("AddValidatorTx.constructor -- delegationFee must be in the range of 0 and 100, inclusively.");
            }
        }
    }
    serialize(encoding = "hex") {
        let fields = super.serialize(encoding);
        return Object.assign(Object.assign({}, fields), { "delegationFee": serialization.encoder(this.getDelegationFeeBuffer(), encoding, "Buffer", "decimalString", 4) });
    }
    ;
    deserialize(fields, encoding = "hex") {
        super.deserialize(fields, encoding);
        let dbuff = serialization.decoder(fields["delegationFee"], encoding, "decimalString", "Buffer", 4);
        this.delegationFee = dbuff.readUInt32BE(0) / AddValidatorTx.delegatorMultiplier;
    }
    /**
     * Returns the delegation fee (represents a percentage from 0 to 100);
     */
    getDelegationFee() {
        return this.delegationFee;
    }
    /**
     * Returns the binary representation of the delegation fee as a {@link https://github.com/feross/buffer|Buffer}.
     */
    getDelegationFeeBuffer() {
        let dBuff = buffer_1.Buffer.alloc(4);
        let buffnum = parseFloat(this.delegationFee.toFixed(4)) * AddValidatorTx.delegatorMultiplier;
        dBuff.writeUInt32BE(buffnum, 0);
        return dBuff;
    }
    fromBuffer(bytes, offset = 0) {
        offset = super.fromBuffer(bytes, offset);
        let dbuff = bintools.copyFrom(bytes, offset, offset + 4);
        offset += 4;
        this.delegationFee = dbuff.readUInt32BE(0) / AddValidatorTx.delegatorMultiplier;
        return offset;
    }
    toBuffer() {
        let superBuff = super.toBuffer();
        let feeBuff = this.getDelegationFeeBuffer();
        return buffer_1.Buffer.concat([superBuff, feeBuff]);
    }
}
exports.AddValidatorTx = AddValidatorTx;
AddValidatorTx.delegatorMultiplier = 10000;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGlvbnR4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS92YWxpZGF0aW9udHgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7R0FHRzs7Ozs7O0FBRUgsa0RBQXVCO0FBQ3ZCLG9FQUE0QztBQUM1QyxxQ0FBa0M7QUFDbEMsbURBQTJEO0FBRTNELG9DQUFpQztBQUNqQywyQ0FBa0Q7QUFDbEQscURBQXlEO0FBQ3pELGlFQUFtRTtBQUNuRSx1Q0FBMEQ7QUFDMUQsNkRBQThFO0FBQzlFLCtDQUF3RDtBQUV4RDs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLDZCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFaEU7O0dBRUc7QUFDSCxNQUFzQixXQUFZLFNBQVEsZUFBTTtJQTRFNUMsWUFDRSxTQUFpQixFQUNqQixZQUFvQixFQUNwQixJQUEwQixFQUMxQixHQUF3QixFQUN0QixJQUFZLEVBQ1osTUFBYyxFQUNkLFNBQWEsRUFDYixPQUFXO1FBRWIsS0FBSyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQXJGeEMsY0FBUyxHQUFHLGFBQWEsQ0FBQztRQUMxQixZQUFPLEdBQUcsU0FBUyxDQUFDO1FBa0JwQixXQUFNLEdBQVUsZUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNqQyxjQUFTLEdBQVUsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNuQyxZQUFPLEdBQVUsZUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQWlFdkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFNB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QUFVLEtBQUssQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKiBAbW9kdWxlIEFQSS1QbGF0Zm9ybVZNLVZhbGlkYXRpb25UeFxuICovXG5cbmltcG9ydCBCTiBmcm9tICdibi5qcyc7XG5pbXBvcnQgQmluVG9vbHMgZnJvbSAnLi4vLi4vdXRpbHMvYmludG9vbHMnO1xuaW1wb3J0IHsgQmFzZVR4IH0gZnJvbSAnLi9iYXNldHgnO1xuaW1wb3J0IHsgVHJhbnNmZXJhYmxlT3V0cHV0IH0gZnJvbSAnLi4vcGxhdGZvcm12bS9vdXRwdXRzJztcbmltcG9ydCB7IFRyYW5zZmVyYWJsZUlucHV0IH0gZnJvbSAnLi4vcGxhdGZvcm12bS9pbnB1dHMnO1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSAnYnVmZmVyLyc7XG5pbXBvcnQgeyBQbGF0Zm9ybVZNQ29uc3RhbnRzIH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHsgRGVmYXVsdE5ldHdvcmtJRCB9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBidWZmZXJUb05vZGVJRFN0cmluZyB9IGZyb20gJy4uLy4uL3V0aWxzL2hlbHBlcmZ1bmN0aW9ucyc7XG5pbXBvcnQgeyBBbW91bnRPdXRwdXQsIFBhcnNlYWJsZU91dHB1dCB9IGZyb20gJy4vb3V0cHV0cyc7XG5pbXBvcnQgeyBTZXJpYWxpemF0aW9uLCBTZXJpYWxpemVkRW5jb2RpbmcgfSBmcm9tICcuLi8uLi91dGlscy9zZXJpYWxpemF0aW9uJztcbmltcG9ydCB7IERlbGVnYXRpb25GZWVFcnJvciB9IGZyb20gJy4uLy4uL3V0aWxzL2Vycm9ycyc7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuICogQWJzdHJhY3QgY2xhc3MgcmVwcmVzZW50aW5nIGFuIHRyYW5zYWN0aW9ucyB3aXRoIHZhbGlkYXRpb24gaW5mb3JtYXRpb24uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBWYWxpZGF0b3JUeCBleHRlbmRzIEJhc2VUeCB7XG4gICAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiVmFsaWRhdG9yVHhcIjtcbiAgICBwcm90ZWN0ZWQgX3R5cGVJRCA9IHVuZGVmaW5lZDtcblxuICAgIHNlcmlhbGl6ZShlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTpvYmplY3Qge1xuICAgICAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5maWVsZHMsXG4gICAgICAgICAgXCJub2RlSURcIjogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMubm9kZUlELCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJub2RlSURcIiksXG4gICAgICAgICAgXCJzdGFydFRpbWVcIjogc2VyaWFsaXphdGlvbi5lbmNvZGVyKHRoaXMuc3RhcnRUaW1lLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJkZWNpbWFsU3RyaW5nXCIpLFxuICAgICAgICAgIFwiZW5kVGltZVwiOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy5lbmRUaW1lLCBlbmNvZGluZywgXCJCdWZmZXJcIiwgXCJkZWNpbWFsU3RyaW5nXCIpXG4gICAgICAgIH1cbiAgICB9O1xuICAgIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICAgICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgICB0aGlzLm5vZGVJRCA9IHNlcmlhbGl6YXRpb24uZGVjb2RlcihmaWVsZHNbXCJub2RlSURcIl0sIGVuY29kaW5nLCBcIm5vZGVJRFwiLCBcIkJ1ZmZlclwiLCAyMClcbiAgICAgIHRoaXMuc3RhcnRUaW1lID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKGZpZWxkc1tcInN0YXJ0VGltZVwiXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJ1ZmZlclwiLCA4KVxuICAgICAgdGhpcy5lbmRUaW1lID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKGZpZWxkc1tcImVuZFRpbWVcIl0sIGVuY29kaW5nLCBcImRlY2ltYWxTdHJpbmdcIiwgXCJCdWZmZXJcIiwgOCk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG5vZGVJRDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMjApO1xuICAgIHByb3RlY3RlZCBzdGFydFRpbWU6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDgpO1xuICAgIHByb3RlY3RlZCBlbmRUaW1lOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg4KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIHN0YWtlIGFtb3VudC5cbiAgICAgKi9cbiAgICBnZXROb2RlSUQoKTpCdWZmZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5ub2RlSUQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHN0cmluZyBmb3IgdGhlIG5vZGVJRCBhbW91bnQuXG4gICAgICovXG4gICAgZ2V0Tm9kZUlEU3RyaW5nKCk6c3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIGJ1ZmZlclRvTm9kZUlEU3RyaW5nKHRoaXMubm9kZUlEKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IGZvciB0aGUgc3Rha2UgYW1vdW50LlxuICAgICAqL1xuICAgIGdldFN0YXJ0VGltZSgpe1xuICAgICAgICByZXR1cm4gYmludG9vbHMuZnJvbUJ1ZmZlclRvQk4odGhpcy5zdGFydFRpbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBmb3IgdGhlIHN0YWtlIGFtb3VudC5cbiAgICAgKi9cbiAgICBnZXRFbmRUaW1lKCkge1xuICAgICAgICByZXR1cm4gYmludG9vbHMuZnJvbUJ1ZmZlclRvQk4odGhpcy5lbmRUaW1lKTtcbiAgICB9XG5cbiAgICBmcm9tQnVmZmVyKGJ5dGVzOkJ1ZmZlciwgb2Zmc2V0Om51bWJlciA9IDApOm51bWJlciB7XG4gICAgICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gICAgICAgIHRoaXMubm9kZUlEID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMjApO1xuICAgICAgICBvZmZzZXQgKz0gMjA7XG4gICAgICAgIHRoaXMuc3RhcnRUaW1lID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOCk7XG4gICAgICAgIG9mZnNldCArPSA4O1xuICAgICAgICB0aGlzLmVuZFRpbWUgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA4KTtcbiAgICAgICAgb2Zmc2V0ICs9IDg7XG4gICAgICAgIHJldHVybiBvZmZzZXQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBbW1ZhbGlkYXRvclR4XV0uXG4gICAgICovXG4gICAgdG9CdWZmZXIoKTpCdWZmZXIge1xuICAgICAgICBjb25zdCBzdXBlcmJ1ZmY6QnVmZmVyID0gc3VwZXIudG9CdWZmZXIoKTtcbiAgICAgICAgY29uc3QgYnNpemU6bnVtYmVyID0gc3VwZXJidWZmLmxlbmd0aCArIHRoaXMubm9kZUlELmxlbmd0aCArIHRoaXMuc3RhcnRUaW1lLmxlbmd0aCArIHRoaXMuZW5kVGltZS5sZW5ndGg7XG4gICAgICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFtcbiAgICAgICAgICAgIHN1cGVyYnVmZixcbiAgICAgICAgICAgIHRoaXMubm9kZUlELFxuICAgICAgICAgICAgdGhpcy5zdGFydFRpbWUsXG4gICAgICAgICAgICB0aGlzLmVuZFRpbWVcbiAgICAgICAgXSwgYnNpemUpO1xuICAgIH1cbiAgICBcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgIG5ldHdvcmtJRDogbnVtYmVyLFxuICAgICAgYmxvY2tjaGFpbklEOiBCdWZmZXIsXG4gICAgICBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSxcbiAgICAgIGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSxcbiAgICAgICAgbWVtbz86QnVmZmVyLCBcbiAgICAgICAgbm9kZUlEPzpCdWZmZXIsIFxuICAgICAgICBzdGFydFRpbWU/OkJOLCBcbiAgICAgICAgZW5kVGltZT86Qk5cbiAgICApIHtcbiAgICAgIHN1cGVyKG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMsIG1lbW8pO1xuICAgICAgICB0aGlzLm5vZGVJRCA9IG5vZGVJRDtcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihzdGFydFRpbWUsIDgpO1xuICAgICAgICB0aGlzLmVuZFRpbWUgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcihlbmRUaW1lLCA4KTtcbiAgICB9XG5cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFdlaWdodGVkVmFsaWRhdG9yVHggZXh0ZW5kcyBWYWxpZGF0b3JUeCB7XG4gICAgcHJvdGVjdGVkIF90eXBlTmFtZSA9IFwiV2VpZ2h0ZWRWYWxpZGF0b3JUeFwiO1xuICAgIHByb3RlY3RlZCBfdHlwZUlEID0gdW5kZWZpbmVkO1xuXG4gICAgc2VyaWFsaXplKGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOm9iamVjdCB7XG4gICAgICAgIGxldCBmaWVsZHM6b2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLmZpZWxkcyxcbiAgICAgICAgICBcIndlaWdodFwiOiBzZXJpYWxpemF0aW9uLmVuY29kZXIodGhpcy53ZWlnaHQsIGVuY29kaW5nLCBcIkJ1ZmZlclwiLCBcImRlY2ltYWxTdHJpbmdcIilcbiAgICAgICAgfVxuICAgIH07XG4gICAgZGVzZXJpYWxpemUoZmllbGRzOm9iamVjdCwgZW5jb2Rpbmc6U2VyaWFsaXplZEVuY29kaW5nID0gXCJoZXhcIikge1xuICAgICAgICBzdXBlci5kZXNlcmlhbGl6ZShmaWVsZHMsIGVuY29kaW5nKTtcbiAgICAgIHRoaXMud2VpZ2h0ID0gc2VyaWFsaXphdGlvbi5kZWNvZGVyKGZpZWxkc1tcIndlaWdodFwiXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJ1ZmZlclwiLCA4KTtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgd2VpZ2h0OkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg4KTtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBmb3IgdGhlIHN0YWtlIGFtb3VudC5cbiAgICAgKi9cbiAgICBnZXRXZWlnaHQoKTpCTiB7XG4gICAgICAgIHJldHVybiBiaW50b29scy5mcm9tQnVmZmVyVG9CTih0aGlzLndlaWdodCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgc3Rha2UgYW1vdW50LlxuICAgICAqL1xuICAgIGdldFdlaWdodEJ1ZmZlcigpOkJ1ZmZlciB7XG4gICAgICAgIHJldHVybiB0aGlzLndlaWdodDtcbiAgICB9XG5cbiAgICBmcm9tQnVmZmVyKGJ5dGVzOkJ1ZmZlciwgb2Zmc2V0Om51bWJlciA9IDApOm51bWJlciB7XG4gICAgICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gICAgICAgIHRoaXMud2VpZ2h0ID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgOCk7XG4gICAgICAgIG9mZnNldCArPSA4O1xuICAgICAgICByZXR1cm4gb2Zmc2V0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tBZGRTdWJuZXRWYWxpZGF0b3JUeF1dLlxuICAgICAqL1xuICAgIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICAgICAgY29uc3Qgc3VwZXJidWZmOkJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKCk7XG4gICAgICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFtzdXBlcmJ1ZmYsIHRoaXMud2VpZ2h0XSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIEFkZFN1Ym5ldFZhbGlkYXRvclR4IHRyYW5zYWN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIG5ldHdvcmtJRCBPcHRpb25hbC4gTmV0d29ya2lkLCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgICAqIEBwYXJhbSBibG9ja2NoYWluSUQgT3B0aW9uYWwuIEJsb2NrY2hhaW5pZCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgICAqIEBwYXJhbSBvdXRzIE9wdGlvbmFsLiBBcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICAgKiBAcGFyYW0gaW5zIE9wdGlvbmFsLiBBcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsLiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICAgKiBAcGFyYW0gbm9kZUlEIE9wdGlvbmFsLiBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yIGJlaW5nIGFkZGVkLlxuICAgICAqIEBwYXJhbSBzdGFydFRpbWUgT3B0aW9uYWwuIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0YXJ0cyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAgICogQHBhcmFtIGVuZFRpbWUgT3B0aW9uYWwuIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgICAgKiBAcGFyYW0gd2VpZ2h0IE9wdGlvbmFsLiBUaGUgYW1vdW50IG9mIG5BVkFYIHRoZSB2YWxpZGF0b3IgaXMgc3Rha2luZy5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCxcbiAgICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksXG4gICAgICBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHVuZGVmaW5lZCxcbiAgICAgIGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHVuZGVmaW5lZCxcbiAgICAgICAgbWVtbzpCdWZmZXIgPSB1bmRlZmluZWQsIFxuICAgICAgICBub2RlSUQ6QnVmZmVyID0gdW5kZWZpbmVkLCBcbiAgICAgICAgc3RhcnRUaW1lOkJOID0gdW5kZWZpbmVkLCBcbiAgICAgICAgZW5kVGltZTpCTiA9IHVuZGVmaW5lZCxcbiAgICAgICAgd2VpZ2h0OkJOID0gdW5kZWZpbmVkLFxuICAgICkge1xuICAgICAgc3VwZXIobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbywgbm9kZUlELCBzdGFydFRpbWUsIGVuZFRpbWUpO1xuICAgICAgICBpZih0eXBlb2Ygd2VpZ2h0ICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgdGhpcy53ZWlnaHQgPSBiaW50b29scy5mcm9tQk5Ub0J1ZmZlcih3ZWlnaHQsIDgpO1xuICAgICAgICB9XG4gICAgfVxuXG59XG4vKiBNdXN0IGltcGxlbWVudCBsYXRlciwgdGhlIHNpZ25pbmcgcHJvY2VzcyBpc24ndCBmcmllbmRseSB0byBBdmFsYW5jaGVKU1xuXG5leHBvcnQgY2xhc3MgQWRkU3VibmV0VmFsaWRhdG9yVHggZXh0ZW5kcyBXZWlnaHRlZFZhbGlkYXRvclR4IHtcbiAgICBwcm90ZWN0ZWQgc3VibmV0SUQ6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyKTtcbiAgICBwcm90ZWN0ZWQgc3VibmV0QWRkcnM6QnVmZmVyW10gPSBbXTtcbiAgICBwcm90ZWN0ZWQgc3VibmV0QXV0aElkeHM6QnVmZmVyW10gPSBbXTtcblxuXG4gICAgZ2V0VHhUeXBlID0gKCk6bnVtYmVyID0+IHtcbiAgICAgICAgcmV0dXJuIFBsYXRmb3JtVk1Db25zdGFudHMuQUREU1VCTkVUVkFMSURBVE9SVFg7XG4gICAgfVxuXG5cbiAgICBnZXRTdWJuZXRJRCA9ICgpOkJ1ZmZlciA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1Ym5ldElEO1xuICAgIH1cblxuXG4gICAgZ2V0U3VibmV0SURTdHJpbmcgPSAoKTpzdHJpbmcgPT4ge1xuICAgICAgICByZXR1cm4gYmludG9vbHMuY2I1OEVuY29kZSh0aGlzLnN1Ym5ldElEKTtcbiAgICB9XG5cblxuICAgIGdldFN1Ym5ldEF1dGhBZGRyZXNzZXMgPSAoKTpCdWZmZXJbXSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN1Ym5ldEFkZHJzO1xuICAgIH1cblxuXG4gICAgc2V0U3VibmV0QXV0aEFkZHJlc3NlcyA9IChhZGRyczpCdWZmZXJbXSk6dm9pZCA9PiB7XG4gICAgICAgIHRoaXMuc3VibmV0QWRkcnMgPSBhZGRycztcbiAgICB9XG5cbiAgICBjYWxjU3VibmV0QXV0aElkeHMgPSAoYWRkcnM6QnVmZmVyW10pOkJ1ZmZlcltdID0+IHtcbiAgICAgICAgbGV0IGlkeHM6QnVmZmVyW10gPSBbXTtcbiAgICAgICAgYWRkcnMgPSBhZGRycy5zb3J0KCk7XG4gICAgICAgIGZvcihsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFkZHJzLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGxldCBpZHg6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgICAgICAgICAgaWR4LndyaXRlVUludDMyQkUoaSwwKTtcbiAgICAgICAgICAgIGlkeHMucHVzaChpZHgpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBnZXRTdWJuZXRBdXRoSWR4cyA9ICgpOkJ1ZmZlcltdID0+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3VibmV0QWRkcnM7XG4gICAgfVxuXG4gICAgZnJvbUJ1ZmZlcihieXRlczpCdWZmZXIsIG9mZnNldDpudW1iZXIgPSAwKTpudW1iZXIge1xuICAgICAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpO1xuICAgICAgICB0aGlzLnN1Ym5ldElEID0gYmludG9vbHMuY29weUZyb20oYnl0ZXMsIG9mZnNldCwgb2Zmc2V0ICsgMzIpO1xuICAgICAgICBvZmZzZXQgKz0gMzI7XG4gICAgICAgIGxldCBzdWJsZW5idWZmOkJ1ZmZlciA9IGJpbnRvb2xzLmNvcHlGcm9tKGJ5dGVzLCBvZmZzZXQsIG9mZnNldCArIDQpO1xuICAgICAgICBvZmZzZXQgKz0gNDtcbiAgICAgICAgbGV0IHN1YmxlbjpudW1iZXIgPSBzdWJsZW5idWZmLnJlYWRVSW50MzJCRSgwKTtcbiAgICAgICAgZm9yKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgc3VibGVuOyBpKyspe1xuXG4gICAgICAgIH1cbiAgICAgICAgb2Zmc2V0ID0gdGhpcy5zdWJuZXRBdXRoLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gICAgICAgIHJldHVybiBvZmZzZXQ7XG4gICAgfVxuXG5cbiAgICB0b0J1ZmZlcigpOkJ1ZmZlciB7XG4gICAgICAgIGNvbnN0IHN1cGVyYnVmZjpCdWZmZXIgPSBzdXBlci50b0J1ZmZlcigpO1xuXG4gICAgICAgIHJldHVybiBCdWZmZXIuY29uY2F0KFtzdXBlcmJ1ZmYsIHRoaXMuc3VibmV0SUQsIHN1YkF1dGhdLCBzdXBlcmJ1ZmYubGVuZ3RoICsgdGhpcy5zdWJuZXRJRC5sZW5ndGggKyBzdWJBdXRoLmxlbmd0aCk7XG4gICAgfVxuXG5cbiAgICBzaWduKG1zZzpCdWZmZXIsIGtjOktleUNoYWluKTpDcmVkZW50aWFsW10ge1xuICAgICAgICBsZXQgY3JlZHM6U0VDUENyZWRlbnRpYWxbXSA9IHN1cGVyLnNpZ24obXNnLCBrYyk7XG4gICAgICAgIGNvbnN0IGNyZWQ6U0VDUENyZWRlbnRpYWwgPSBTZWxlY3RDcmVkZW50aWFsQ2xhc3MoUGxhdGZvcm1WTUNvbnN0YW50cy5TRUNQQ1JFREVOVElBTCkgYXMgU0VDUENyZWRlbnRpYWw7XG4gICAgICAgIGZvcihsZXQgaTogbnVtYmVyID0gMDsgaSAgPCB0aGlzLnN1Ym5ldEF1dGgubGVuZ3RoIDsgaSsrKSB7XG4gICAgICAgICAgICBpZigha2MuaGFzS2V5KHRoaXMuc3VibmV0QXV0aFtpXSkpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJBZGRTdWJuZXRWYWxpZGF0b3JUeC5zaWduIC0tIHNwZWNpZmllZCBhZGRyZXNzIGluIHN1Ym5ldEF1dGggbm90IGV4aXN0ZW50IGluIHByb3ZpZGVkIGtleWNoYWluLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgbGV0IGtwOktleVBhaXIgPSBrYy5nZXRLZXkodGhpcy5zdWJuZXRBdXRoW2ldKTtcbiAgICAgICAgICAgIGNvbnN0IHNpZ252YWw6QnVmZmVyID0ga3Auc2lnbihtc2cpO1xuICAgICAgICAgICAgY29uc3Qgc2lnOlNpZ25hdHVyZSA9IG5ldyBTaWduYXR1cmUoKTtcbiAgICAgICAgICAgIHNpZy5mcm9tQnVmZmVyKHNpZ252YWwpO1xuICAgICAgICAgICAgY3JlZC5hZGRTaWduYXR1cmUoc2lnKTtcbiAgICAgICAgfVxuICAgICAgICBjcmVkcy5wdXNoKGNyZWQpO1xuICAgICAgICByZXR1cm4gY3JlZHM7XG4gICAgfVxuXG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgbmV0d29ya0lEOm51bWJlciA9IERlZmF1bHROZXR3b3JrSUQsXG4gICAgICAgIGJsb2NrY2hhaW5JRDpCdWZmZXIgPSBCdWZmZXIuYWxsb2MoMzIsIDE2KSxcbiAgICAgICAgb3V0czpUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHVuZGVmaW5lZCxcbiAgICAgICAgaW5zOlRyYW5zZmVyYWJsZUlucHV0W10gPSB1bmRlZmluZWQsXG4gICAgICAgIG1lbW86QnVmZmVyID0gdW5kZWZpbmVkLCBcbiAgICAgICAgbm9kZUlEOkJ1ZmZlciA9IHVuZGVmaW5lZCwgXG4gICAgICAgIHN0YXJ0VGltZTpCTiA9IHVuZGVmaW5lZCwgXG4gICAgICAgIGVuZFRpbWU6Qk4gPSB1bmRlZmluZWQsXG4gICAgICAgIHdlaWdodDpCTiA9IHVuZGVmaW5lZCxcbiAgICAgICAgc3VibmV0SUQ6QnVmZmVyID0gdW5kZWZpbmVkLFxuICAgICAgICBzdWJuZXRBdXRoOkJ1ZmZlcltdID0gdW5kZWZpbmVkXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKG5ldHdvcmtJRCwgYmxvY2tjaGFpbklELCBvdXRzLCBpbnMsIG1lbW8sIG5vZGVJRCwgc3RhcnRUaW1lLCBlbmRUaW1lLCB3ZWlnaHQpO1xuICAgICAgICBpZih0eXBlb2Ygc3VibmV0SUQgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICB0aGlzLnN1Ym5ldElEID0gc3VibmV0SUQ7XG4gICAgICAgIH1cbiAgICAgICAgaWYodHlwZW9mIHN1Ym5ldEF1dGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhpcy5zdWJuZXRBdXRoID0gc3VibmV0QXV0aDtcbiAgICAgICAgfVxuICAgIH1cblxufVxuKi9cblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgQWRkRGVsZWdhdG9yVHggdHJhbnNhY3Rpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBBZGREZWxlZ2F0b3JUeCBleHRlbmRzIFdlaWdodGVkVmFsaWRhdG9yVHgge1xuICAgIHByb3RlY3RlZCBfdHlwZU5hbWUgPSBcIkFkZERlbGVnYXRvclR4XCI7XG4gICAgcHJvdGVjdGVkIF90eXBlSUQgPSBQbGF0Zm9ybVZNQ29uc3RhbnRzLkFERERFTEVHQVRPUlRYO1xuXG4gICAgc2VyaWFsaXplKGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpOm9iamVjdCB7XG4gICAgICAgIGxldCBmaWVsZHM6b2JqZWN0ID0gc3VwZXIuc2VyaWFsaXplKGVuY29kaW5nKTtcbiAgICAgICAgcmV0dXJuICB7XG4gICAgICAgICAgICAuLi5maWVsZHMsXG4gICAgICAgICAgICBcInN0YWtlT3V0c1wiOiB0aGlzLnN0YWtlT3V0cy5tYXAoKHMpID0+IHMuc2VyaWFsaXplKGVuY29kaW5nKSksXG4gICAgICAgICAgICBcInJld2FyZE93bmVyc1wiOiB0aGlzLnJld2FyZE93bmVycy5zZXJpYWxpemUoZW5jb2RpbmcpXG4gICAgICAgIH1cbiAgICB9O1xuICAgIGRlc2VyaWFsaXplKGZpZWxkczpvYmplY3QsIGVuY29kaW5nOlNlcmlhbGl6ZWRFbmNvZGluZyA9IFwiaGV4XCIpIHtcbiAgICAgICAgc3VwZXIuZGVzZXJpYWxpemUoZmllbGRzLCBlbmNvZGluZyk7XG4gICAgICAgIHRoaXMuc3Rha2VPdXRzID0gZmllbGRzW1wic3Rha2VPdXRzXCJdLm1hcCgoczpvYmplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCB4ZmVyb3V0OlRyYW5zZmVyYWJsZU91dHB1dCA9IG5ldyBUcmFuc2ZlcmFibGVPdXRwdXQoKTtcbiAgICAgICAgICAgIHhmZXJvdXQuZGVzZXJpYWxpemUocywgZW5jb2RpbmcpO1xuICAgICAgICAgICAgcmV0dXJuIHhmZXJvdXQ7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnJld2FyZE93bmVycyA9IG5ldyBQYXJzZWFibGVPdXRwdXQoKTtcbiAgICAgICAgdGhpcy5yZXdhcmRPd25lcnMuZGVzZXJpYWxpemUoZmllbGRzW1wicmV3YXJkT3duZXJzXCJdLCBlbmNvZGluZyk7XG4gICAgfVxuICAgIFxuICBwcm90ZWN0ZWQgc3Rha2VPdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IFtdO1xuICAgIHByb3RlY3RlZCByZXdhcmRPd25lcnM6UGFyc2VhYmxlT3V0cHV0ID0gdW5kZWZpbmVkO1xuICBcbiAgICAvKipcbiAgICAgICAqIFJldHVybnMgdGhlIGlkIG9mIHRoZSBbW0FkZERlbGVnYXRvclR4XV1cbiAgICAgICAqL1xuICAgIGdldFR4VHlwZSA9ICgpOm51bWJlciA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5fdHlwZUlEO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfSBmb3IgdGhlIHN0YWtlIGFtb3VudC5cbiAgICAgKi9cbiAgICBnZXRTdGFrZUFtb3VudCgpOkJOIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0V2VpZ2h0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgc3Rha2UgYW1vdW50LlxuICAgICAqL1xuICAgIGdldFN0YWtlQW1vdW50QnVmZmVyKCk6QnVmZmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2VpZ2h0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGFycmF5IG9mIG91dHB1dHMgYmVpbmcgc3Rha2VkLlxuICAgICAqL1xuICBnZXRTdGFrZU91dHMoKTogVHJhbnNmZXJhYmxlT3V0cHV0W10ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFrZU91dHM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2hvdWxkIG1hdGNoIHN0YWtlQW1vdW50LiBVc2VkIGluIHNhbml0eSBjaGVja2luZy5cbiAgICAgKi9cbiAgICBnZXRTdGFrZU91dHNUb3RhbCgpOkJOIHtcbiAgICAgICAgbGV0IHZhbDpCTiA9IG5ldyBCTigwKTtcbiAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLnN0YWtlT3V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhbCA9IHZhbC5hZGQoKHRoaXMuc3Rha2VPdXRzW2ldLmdldE91dHB1dCgpIGFzIEFtb3VudE91dHB1dCkuZ2V0QW1vdW50KCkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIFxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIHJld2FyZCBhZGRyZXNzLlxuICAgICAqL1xuICAgIGdldFJld2FyZE93bmVycygpOlBhcnNlYWJsZU91dHB1dCB7XG4gICAgICAgIHJldHVybiB0aGlzLnJld2FyZE93bmVycztcbiAgICB9XG4gICAgXG4gIGdldFRvdGFsT3V0cygpOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSB7XG4gICAgcmV0dXJuIFsuLi50aGlzLmdldE91dHMoKSBhcyBUcmFuc2ZlcmFibGVPdXRwdXRbXSwgLi4udGhpcy5nZXRTdGFrZU91dHMoKV07XG4gICAgfVxuXG4gICAgZnJvbUJ1ZmZlcihieXRlczpCdWZmZXIsIG9mZnNldDpudW1iZXIgPSAwKTpudW1iZXIge1xuICAgICAgICBvZmZzZXQgPSBzdXBlci5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpO1xuICAgICAgICBjb25zdCBudW1zdGFrZW91dHMgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KTtcbiAgICAgICAgb2Zmc2V0ICs9IDQ7XG4gICAgICAgIGNvbnN0IG91dGNvdW50Om51bWJlciA9IG51bXN0YWtlb3V0cy5yZWFkVUludDMyQkUoMCk7XG4gICAgICAgIHRoaXMuc3Rha2VPdXRzID0gW107XG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgb3V0Y291bnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgeGZlcm91dDpUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KCk7XG4gICAgICAgICAgICBvZmZzZXQgPSB4ZmVyb3V0LmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gICAgICAgICAgICB0aGlzLnN0YWtlT3V0cy5wdXNoKHhmZXJvdXQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmV3YXJkT3duZXJzID0gbmV3IFBhcnNlYWJsZU91dHB1dCgpO1xuICAgICAgICBvZmZzZXQgPSB0aGlzLnJld2FyZE93bmVycy5mcm9tQnVmZmVyKGJ5dGVzLCBvZmZzZXQpO1xuICAgICAgICByZXR1cm4gb2Zmc2V0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBvZiB0aGUgW1tBZGREZWxlZ2F0b3JUeF1dLlxuICAgICAqL1xuICAgIHRvQnVmZmVyKCk6QnVmZmVyIHtcbiAgICAgICAgY29uc3Qgc3VwZXJidWZmOkJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKCk7XG4gICAgICAgIGxldCBic2l6ZTpudW1iZXIgPSBzdXBlcmJ1ZmYubGVuZ3RoO1xuICAgICAgICBjb25zdCBudW1vdXRzOkJ1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KTtcbiAgICAgICAgbnVtb3V0cy53cml0ZVVJbnQzMkJFKHRoaXMuc3Rha2VPdXRzLmxlbmd0aCwgMCk7XG4gICAgICBsZXQgYmFycjogQnVmZmVyW10gPSBbc3VwZXIudG9CdWZmZXIoKSwgbnVtb3V0c107XG4gICAgICAgIGJzaXplICs9IG51bW91dHMubGVuZ3RoO1xuICAgICAgICB0aGlzLnN0YWtlT3V0cyA9IHRoaXMuc3Rha2VPdXRzLnNvcnQoVHJhbnNmZXJhYmxlT3V0cHV0LmNvbXBhcmF0b3IoKSk7XG4gICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5zdGFrZU91dHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGxldCBvdXQ6QnVmZmVyID0gdGhpcy5zdGFrZU91dHNbaV0udG9CdWZmZXIoKTtcbiAgICAgICAgICAgIGJhcnIucHVzaChvdXQpO1xuICAgICAgICAgICAgYnNpemUgKz0gb3V0Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcm86QnVmZmVyID0gdGhpcy5yZXdhcmRPd25lcnMudG9CdWZmZXIoKTtcbiAgICAgICAgYmFyci5wdXNoKHJvKTtcbiAgICAgICAgYnNpemUgKz0gcm8ubGVuZ3RoO1xuICAgICAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChiYXJyLCBic2l6ZSk7XG4gICAgfVxuXG4gICAgY2xvbmUoKTp0aGlzIHtcbiAgICAgICAgbGV0IG5ld2Jhc2U6QWRkRGVsZWdhdG9yVHggPSBuZXcgQWRkRGVsZWdhdG9yVHgoKTtcbiAgICAgICAgbmV3YmFzZS5mcm9tQnVmZmVyKHRoaXMudG9CdWZmZXIoKSk7XG4gICAgICAgIHJldHVybiBuZXdiYXNlIGFzIHRoaXM7XG4gICAgfVxuXG4gICAgY3JlYXRlKC4uLmFyZ3M6YW55W10pOnRoaXMge1xuICAgICAgICByZXR1cm4gbmV3IEFkZERlbGVnYXRvclR4KC4uLmFyZ3MpIGFzIHRoaXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIEFkZERlbGVnYXRvclR4IHRyYW5zYWN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIG5ldHdvcmtJRCBPcHRpb25hbC4gTmV0d29ya2lkLCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgICAqIEBwYXJhbSBibG9ja2NoYWluSUQgT3B0aW9uYWwuIEJsb2NrY2hhaW5pZCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgICAqIEBwYXJhbSBvdXRzIE9wdGlvbmFsLiBBcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICAgKiBAcGFyYW0gaW5zIE9wdGlvbmFsLiBBcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsLiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICAgKiBAcGFyYW0gbm9kZUlEIE9wdGlvbmFsLiBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yIGJlaW5nIGFkZGVkLlxuICAgICAqIEBwYXJhbSBzdGFydFRpbWUgT3B0aW9uYWwuIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0YXJ0cyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAgICogQHBhcmFtIGVuZFRpbWUgT3B0aW9uYWwuIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgICAgKiBAcGFyYW0gc3Rha2VBbW91bnQgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgbkFWQVggdGhlIHZhbGlkYXRvciBpcyBzdGFraW5nLlxuICAgICAqIEBwYXJhbSBzdGFrZU91dHMgT3B0aW9uYWwuIFRoZSBvdXRwdXRzIHVzZWQgaW4gcGF5aW5nIHRoZSBzdGFrZS5cbiAgICAgKiBAcGFyYW0gcmV3YXJkT3duZXJzIE9wdGlvbmFsLiBUaGUgW1tQYXJzZWFibGVPdXRwdXRdXSBjb250YWluaW5nIGEgW1tTRUNQT3duZXJPdXRwdXRdXSBmb3IgdGhlIHJld2FyZHMuXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoXG4gICAgICBuZXR3b3JrSUQ6IG51bWJlciA9IERlZmF1bHROZXR3b3JrSUQsXG4gICAgICBibG9ja2NoYWluSUQ6IEJ1ZmZlciA9IEJ1ZmZlci5hbGxvYygzMiwgMTYpLFxuICAgICAgb3V0czogVHJhbnNmZXJhYmxlT3V0cHV0W10gPSB1bmRlZmluZWQsXG4gICAgICBpbnM6IFRyYW5zZmVyYWJsZUlucHV0W10gPSB1bmRlZmluZWQsXG4gICAgICAgIG1lbW86QnVmZmVyID0gdW5kZWZpbmVkLCBcbiAgICAgICAgbm9kZUlEOkJ1ZmZlciA9IHVuZGVmaW5lZCwgXG4gICAgICAgIHN0YXJ0VGltZTpCTiA9IHVuZGVmaW5lZCwgXG4gICAgICAgIGVuZFRpbWU6Qk4gPSB1bmRlZmluZWQsXG4gICAgICAgIHN0YWtlQW1vdW50OkJOID0gdW5kZWZpbmVkLFxuICAgICAgc3Rha2VPdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHVuZGVmaW5lZCxcbiAgICAgICAgcmV3YXJkT3duZXJzOlBhcnNlYWJsZU91dHB1dCA9IHVuZGVmaW5lZFxuICAgICkge1xuICAgICAgc3VwZXIobmV0d29ya0lELCBibG9ja2NoYWluSUQsIG91dHMsIGlucywgbWVtbywgbm9kZUlELCBzdGFydFRpbWUsIGVuZFRpbWUsIHN0YWtlQW1vdW50KTtcbiAgICAgICAgaWYodHlwZW9mIHN0YWtlT3V0cyAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHRoaXMuc3Rha2VPdXRzID0gc3Rha2VPdXRzXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZXdhcmRPd25lcnMgPSByZXdhcmRPd25lcnM7XG4gICAgfVxuICB9XG5cbmV4cG9ydCBjbGFzcyBBZGRWYWxpZGF0b3JUeCBleHRlbmRzIEFkZERlbGVnYXRvclR4IHtcbiAgICBwcm90ZWN0ZWQgX3R5cGVOYW1lID0gXCJBZGRWYWxpZGF0b3JUeFwiO1xuICAgIHByb3RlY3RlZCBfdHlwZUlEID0gUGxhdGZvcm1WTUNvbnN0YW50cy5BRERWQUxJREFUT1JUWDtcblxuICAgIHNlcmlhbGl6ZShlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKTpvYmplY3Qge1xuICAgICAgICBsZXQgZmllbGRzOm9iamVjdCA9IHN1cGVyLnNlcmlhbGl6ZShlbmNvZGluZyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAuLi5maWVsZHMsXG4gICAgICAgICAgXCJkZWxlZ2F0aW9uRmVlXCI6IHNlcmlhbGl6YXRpb24uZW5jb2Rlcih0aGlzLmdldERlbGVnYXRpb25GZWVCdWZmZXIoKSwgZW5jb2RpbmcsIFwiQnVmZmVyXCIsIFwiZGVjaW1hbFN0cmluZ1wiLCA0KVxuICAgICAgICB9XG4gICAgfTtcbiAgICBkZXNlcmlhbGl6ZShmaWVsZHM6b2JqZWN0LCBlbmNvZGluZzpTZXJpYWxpemVkRW5jb2RpbmcgPSBcImhleFwiKSB7XG4gICAgICAgIHN1cGVyLmRlc2VyaWFsaXplKGZpZWxkcywgZW5jb2RpbmcpO1xuICAgICAgbGV0IGRidWZmOiBCdWZmZXIgPSBzZXJpYWxpemF0aW9uLmRlY29kZXIoZmllbGRzW1wiZGVsZWdhdGlvbkZlZVwiXSwgZW5jb2RpbmcsIFwiZGVjaW1hbFN0cmluZ1wiLCBcIkJ1ZmZlclwiLCA0KTtcbiAgICAgICAgdGhpcy5kZWxlZ2F0aW9uRmVlID0gZGJ1ZmYucmVhZFVJbnQzMkJFKDApIC8gQWRkVmFsaWRhdG9yVHguZGVsZWdhdG9yTXVsdGlwbGllcjtcbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgZGVsZWdhdGlvbkZlZTpudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgc3RhdGljIGRlbGVnYXRvck11bHRpcGxpZXI6bnVtYmVyID0gMTAwMDA7XG5cbiAgICAvKipcbiAgICAgICAqIFJldHVybnMgdGhlIGlkIG9mIHRoZSBbW0FkZFZhbGlkYXRvclR4XV1cbiAgICAgICAqL1xuICAgIGdldFR4VHlwZSA9ICgpOm51bWJlciA9PiB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVJRDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBkZWxlZ2F0aW9uIGZlZSAocmVwcmVzZW50cyBhIHBlcmNlbnRhZ2UgZnJvbSAwIHRvIDEwMCk7XG4gICAgICovXG4gICAgZ2V0RGVsZWdhdGlvbkZlZSgpOm51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlbGVnYXRpb25GZWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYmluYXJ5IHJlcHJlc2VudGF0aW9uIG9mIHRoZSBkZWxlZ2F0aW9uIGZlZSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9LlxuICAgICAqL1xuICAgIGdldERlbGVnYXRpb25GZWVCdWZmZXIoKTpCdWZmZXIge1xuICAgICAgICBsZXQgZEJ1ZmY6QnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgICAgICBsZXQgYnVmZm51bTpudW1iZXIgPSBwYXJzZUZsb2F0KHRoaXMuZGVsZWdhdGlvbkZlZS50b0ZpeGVkKDQpKSAqIEFkZFZhbGlkYXRvclR4LmRlbGVnYXRvck11bHRpcGxpZXI7XG4gICAgICAgIGRCdWZmLndyaXRlVUludDMyQkUoYnVmZm51bSwgMCk7XG4gICAgICAgIHJldHVybiBkQnVmZjtcbiAgICB9XG5cbiAgICBmcm9tQnVmZmVyKGJ5dGVzOkJ1ZmZlciwgb2Zmc2V0Om51bWJlciA9IDApOm51bWJlciB7XG4gICAgICAgIG9mZnNldCA9IHN1cGVyLmZyb21CdWZmZXIoYnl0ZXMsIG9mZnNldCk7XG4gICAgICAgIGxldCBkYnVmZjpCdWZmZXIgPSBiaW50b29scy5jb3B5RnJvbShieXRlcywgb2Zmc2V0LCBvZmZzZXQgKyA0KTtcbiAgICAgICAgb2Zmc2V0ICs9IDQ7XG4gICAgICAgIHRoaXMuZGVsZWdhdGlvbkZlZSA9IGRidWZmLnJlYWRVSW50MzJCRSgwKSAvIEFkZFZhbGlkYXRvclR4LmRlbGVnYXRvck11bHRpcGxpZXI7XG4gICAgICAgIHJldHVybiBvZmZzZXQ7XG4gICAgfVxuXG4gICAgdG9CdWZmZXIoKTpCdWZmZXIge1xuICAgICAgICBsZXQgc3VwZXJCdWZmOkJ1ZmZlciA9IHN1cGVyLnRvQnVmZmVyKCk7XG4gICAgICAgIGxldCBmZWVCdWZmOkJ1ZmZlciA9IHRoaXMuZ2V0RGVsZWdhdGlvbkZlZUJ1ZmZlcigpO1xuICAgICAgICByZXR1cm4gQnVmZmVyLmNvbmNhdChbc3VwZXJCdWZmLCBmZWVCdWZmXSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2xhc3MgcmVwcmVzZW50aW5nIGFuIHVuc2lnbmVkIEFkZFZhbGlkYXRvclR4IHRyYW5zYWN0aW9uLlxuICAgICAqXG4gICAgICogQHBhcmFtIG5ldHdvcmtJRCBPcHRpb25hbC4gTmV0d29ya2lkLCBbW0RlZmF1bHROZXR3b3JrSURdXVxuICAgICAqIEBwYXJhbSBibG9ja2NoYWluSUQgT3B0aW9uYWwuIEJsb2NrY2hhaW5pZCwgZGVmYXVsdCBCdWZmZXIuYWxsb2MoMzIsIDE2KVxuICAgICAqIEBwYXJhbSBvdXRzIE9wdGlvbmFsLiBBcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXNcbiAgICAgKiBAcGFyYW0gaW5zIE9wdGlvbmFsLiBBcnJheSBvZiB0aGUgW1tUcmFuc2ZlcmFibGVJbnB1dF1dc1xuICAgICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsLiB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIG1lbW8gZmllbGRcbiAgICAgKiBAcGFyYW0gbm9kZUlEIE9wdGlvbmFsLiBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yIGJlaW5nIGFkZGVkLlxuICAgICAqIEBwYXJhbSBzdGFydFRpbWUgT3B0aW9uYWwuIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0YXJ0cyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAgICogQHBhcmFtIGVuZFRpbWUgT3B0aW9uYWwuIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgICAgKiBAcGFyYW0gc3Rha2VBbW91bnQgT3B0aW9uYWwuIFRoZSBhbW91bnQgb2YgbkFWQVggdGhlIHZhbGlkYXRvciBpcyBzdGFraW5nLlxuICAgICAqIEBwYXJhbSBzdGFrZU91dHMgT3B0aW9uYWwuIFRoZSBvdXRwdXRzIHVzZWQgaW4gcGF5aW5nIHRoZSBzdGFrZS5cbiAgICAgKiBAcGFyYW0gcmV3YXJkT3duZXJzIE9wdGlvbmFsLiBUaGUgW1tQYXJzZWFibGVPdXRwdXRdXSBjb250YWluaW5nIHRoZSBbW1NFQ1BPd25lck91dHB1dF1dIGZvciB0aGUgcmV3YXJkcy5cbiAgICAgKiBAcGFyYW0gZGVsZWdhdGlvbkZlZSBPcHRpb25hbC4gVGhlIHBlcmNlbnQgZmVlIHRoaXMgdmFsaWRhdG9yIGNoYXJnZXMgd2hlbiBvdGhlcnMgZGVsZWdhdGUgc3Rha2UgdG8gdGhlbS4gXG4gICAgICogVXAgdG8gNCBkZWNpbWFsIHBsYWNlcyBhbGxvd2VkOyBhZGRpdGlvbmFsIGRlY2ltYWwgcGxhY2VzIGFyZSBpZ25vcmVkLiBNdXN0IGJlIGJldHdlZW4gMCBhbmQgMTAwLCBpbmNsdXNpdmUuIFxuICAgICAqIEZvciBleGFtcGxlLCBpZiBkZWxlZ2F0aW9uRmVlUmF0ZSBpcyAxLjIzNDUgYW5kIHNvbWVvbmUgZGVsZWdhdGVzIHRvIHRoaXMgdmFsaWRhdG9yLCB0aGVuIHdoZW4gdGhlIGRlbGVnYXRpb24gXG4gICAgICogcGVyaW9kIGlzIG92ZXIsIDEuMjM0NSUgb2YgdGhlIHJld2FyZCBnb2VzIHRvIHRoZSB2YWxpZGF0b3IgYW5kIHRoZSByZXN0IGdvZXMgdG8gdGhlIGRlbGVnYXRvci5cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgIG5ldHdvcmtJRDogbnVtYmVyID0gRGVmYXVsdE5ldHdvcmtJRCxcbiAgICAgIGJsb2NrY2hhaW5JRDogQnVmZmVyID0gQnVmZmVyLmFsbG9jKDMyLCAxNiksXG4gICAgICBvdXRzOiBUcmFuc2ZlcmFibGVPdXRwdXRbXSA9IHVuZGVmaW5lZCxcbiAgICAgIGluczogVHJhbnNmZXJhYmxlSW5wdXRbXSA9IHVuZGVmaW5lZCxcbiAgICAgICAgbWVtbzpCdWZmZXIgPSB1bmRlZmluZWQsIFxuICAgICAgICBub2RlSUQ6QnVmZmVyID0gdW5kZWZpbmVkLCBcbiAgICAgICAgc3RhcnRUaW1lOkJOID0gdW5kZWZpbmVkLCBcbiAgICAgICAgZW5kVGltZTpCTiA9IHVuZGVmaW5lZCxcbiAgICAgICAgc3Rha2VBbW91bnQ6Qk4gPSB1bmRlZmluZWQsXG4gICAgICBzdGFrZU91dHM6IFRyYW5zZmVyYWJsZU91dHB1dFtdID0gdW5kZWZpbmVkLFxuICAgICAgICByZXdhcmRPd25lcnM6UGFyc2VhYmxlT3V0cHV0ID0gdW5kZWZpbmVkLFxuICAgICAgICBkZWxlZ2F0aW9uRmVlOm51bWJlciA9IHVuZGVmaW5lZFxuICAgICkge1xuICAgICAgICBzdXBlcihcbiAgICAgICAgICBuZXR3b3JrSUQsXG4gICAgICAgICAgYmxvY2tjaGFpbklELFxuICAgICAgICAgICAgb3V0cywgXG4gICAgICAgICAgICBpbnMsIFxuICAgICAgICAgICAgbWVtbywgXG4gICAgICAgICAgICBub2RlSUQsIFxuICAgICAgICAgICAgc3RhcnRUaW1lLCBcbiAgICAgICAgICAgIGVuZFRpbWUsXG4gICAgICAgICAgICBzdGFrZUFtb3VudCxcbiAgICAgICAgICAgIHN0YWtlT3V0cyxcbiAgICAgICAgICAgIHJld2FyZE93bmVyc1xuICAgICAgICApO1xuICAgICAgICBpZih0eXBlb2YgZGVsZWdhdGlvbkZlZSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgaWYoZGVsZWdhdGlvbkZlZSA+PSAwICYmIGRlbGVnYXRpb25GZWUgPD0gMTAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWxlZ2F0aW9uRmVlID0gcGFyc2VGbG9hdChkZWxlZ2F0aW9uRmVlLnRvRml4ZWQoNCkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRGVsZWdhdGlvbkZlZUVycm9yKFwiQWRkVmFsaWRhdG9yVHguY29uc3RydWN0b3IgLS0gZGVsZWdhdGlvbkZlZSBtdXN0IGJlIGluIHRoZSByYW5nZSBvZiAwIGFuZCAxMDAsIGluY2x1c2l2ZWx5LlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn0iXX0=