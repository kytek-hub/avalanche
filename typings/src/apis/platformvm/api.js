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
exports.PlatformVMAPI = void 0;
/**
 * @packageDocumentation
 * @module API-PlatformVM
 */
const buffer_1 = require("buffer/");
const bn_js_1 = __importDefault(require("bn.js"));
const jrpcapi_1 = require("../../common/jrpcapi");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const keychain_1 = require("./keychain");
const constants_1 = require("../../utils/constants");
const constants_2 = require("./constants");
const tx_1 = require("./tx");
const payload_1 = require("../../utils/payload");
const helperfunctions_1 = require("../../utils/helperfunctions");
const utxos_1 = require("../platformvm/utxos");
const errors_1 = require("../../utils/errors");
const outputs_1 = require("../platformvm/outputs");
const utils_1 = require("../../utils");
/**
 * @ignore
 */
const bintools = bintools_1.default.getInstance();
const serialization = utils_1.Serialization.getInstance();
/**
 * Class for interacting with a node's PlatformVMAPI
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
class PlatformVMAPI extends jrpcapi_1.JRPCAPI {
    /**
     * This class should not be instantiated directly.
     * Instead use the [[Avalanche.addAPI]] method.
     *
     * @param core A reference to the Avalanche class
     * @param baseurl Defaults to the string "/ext/P" as the path to blockchain"s baseurl
     */
    constructor(core, baseurl = "/ext/bc/P") {
        super(core, baseurl);
        /**
         * @ignore
         */
        this.keychain = new keychain_1.KeyChain("", "");
        this.blockchainID = constants_1.PlatformChainID;
        this.blockchainAlias = undefined;
        this.AVAXAssetID = undefined;
        this.txFee = undefined;
        this.creationTxFee = undefined;
        this.minValidatorStake = undefined;
        this.minDelegatorStake = undefined;
        /**
         * Gets the alias for the blockchainID if it exists, otherwise returns `undefined`.
         *
         * @returns The alias for the blockchainID
         */
        this.getBlockchainAlias = () => {
            if (typeof this.blockchainAlias === "undefined") {
                const netid = this.core.getNetworkID();
                if (netid in constants_1.Defaults.network && this.blockchainID in constants_1.Defaults.network[netid]) {
                    this.blockchainAlias = constants_1.Defaults.network[netid][this.blockchainID].alias;
                    return this.blockchainAlias;
                }
                else {
                    /* istanbul ignore next */
                    return undefined;
                }
            }
            return this.blockchainAlias;
        };
        /**
         * Sets the alias for the blockchainID.
         *
         * @param alias The alias for the blockchainID.
         *
         */
        this.setBlockchainAlias = (alias) => {
            this.blockchainAlias = alias;
            /* istanbul ignore next */
            return undefined;
        };
        /**
         * Gets the blockchainID and returns it.
         *
         * @returns The blockchainID
         */
        this.getBlockchainID = () => this.blockchainID;
        /**
         * Refresh blockchainID, and if a blockchainID is passed in, use that.
         *
         * @param Optional. BlockchainID to assign, if none, uses the default based on networkID.
         *
         * @returns The blockchainID
         */
        this.refreshBlockchainID = (blockchainID = undefined) => {
            const netid = this.core.getNetworkID();
            if (typeof blockchainID === "undefined" && typeof constants_1.Defaults.network[netid] !== "undefined") {
                this.blockchainID = constants_1.PlatformChainID; //default to P-Chain
                return true;
            }
            if (typeof blockchainID === "string") {
                this.blockchainID = blockchainID;
                return true;
            }
            return false;
        };
        /**
         * Takes an address string and returns its {@link https://github.com/feross/buffer|Buffer} representation if valid.
         *
         * @returns A {@link https://github.com/feross/buffer|Buffer} for the address if valid, undefined if not valid.
         */
        this.parseAddress = (addr) => {
            const alias = this.getBlockchainAlias();
            const blockchainID = this.getBlockchainID();
            return bintools.parseAddress(addr, blockchainID, alias, constants_2.PlatformVMConstants.ADDRESSLENGTH);
        };
        this.addressFromBuffer = (address) => {
            const chainid = this.getBlockchainAlias() ? this.getBlockchainAlias() : this.getBlockchainID();
            const type = "bech32";
            return serialization.bufferToType(address, type, this.core.getHRP(), chainid);
        };
        /**
         * Fetches the AVAX AssetID and returns it in a Promise.
         *
         * @param refresh This function caches the response. Refresh = true will bust the cache.
         *
         * @returns The the provided string representing the AVAX AssetID
         */
        this.getAVAXAssetID = (refresh = false) => __awaiter(this, void 0, void 0, function* () {
            if (typeof this.AVAXAssetID === "undefined" || refresh) {
                const assetID = yield this.getStakingAssetID();
                this.AVAXAssetID = bintools.cb58Decode(assetID);
            }
            return this.AVAXAssetID;
        });
        /**
         * Overrides the defaults and sets the cache to a specific AVAX AssetID
         *
         * @param avaxAssetID A cb58 string or Buffer representing the AVAX AssetID
         *
         * @returns The the provided string representing the AVAX AssetID
         */
        this.setAVAXAssetID = (avaxAssetID) => {
            if (typeof avaxAssetID === "string") {
                avaxAssetID = bintools.cb58Decode(avaxAssetID);
            }
            this.AVAXAssetID = avaxAssetID;
        };
        /**
         * Gets the default tx fee for this chain.
         *
         * @returns The default tx fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getDefaultTxFee = () => {
            return this.core.getNetworkID() in constants_1.Defaults.network ? new bn_js_1.default(constants_1.Defaults.network[this.core.getNetworkID()]["P"]["txFee"]) : new bn_js_1.default(0);
        };
        /**
         * Gets the tx fee for this chain.
         *
         * @returns The tx fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getTxFee = () => {
            if (typeof this.txFee === "undefined") {
                this.txFee = this.getDefaultTxFee();
            }
            return this.txFee;
        };
        /**
         * Sets the tx fee for this chain.
         *
         * @param fee The tx fee amount to set as {@link https://github.com/indutny/bn.js/|BN}
         */
        this.setTxFee = (fee) => {
            this.txFee = fee;
        };
        /**
         * Gets the default creation fee for this chain.
         *
         * @returns The default creation fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getDefaultCreationTxFee = () => {
            return this.core.getNetworkID() in constants_1.Defaults.network ? new bn_js_1.default(constants_1.Defaults.network[this.core.getNetworkID()]["P"]["creationTxFee"]) : new bn_js_1.default(0);
        };
        /**
         * Gets the creation fee for this chain.
         *
         * @returns The creation fee as a {@link https://github.com/indutny/bn.js/|BN}
         */
        this.getCreationTxFee = () => {
            if (typeof this.creationTxFee === "undefined") {
                this.creationTxFee = this.getDefaultCreationTxFee();
            }
            return this.creationTxFee;
        };
        /**
         * Sets the creation fee for this chain.
         *
         * @param fee The creation fee amount to set as {@link https://github.com/indutny/bn.js/|BN}
         */
        this.setCreationTxFee = (fee) => {
            this.creationTxFee = fee;
        };
        /**
         * Gets a reference to the keychain for this class.
         *
         * @returns The instance of [[]] for this class
         */
        this.keyChain = () => this.keychain;
        /**
         * @ignore
         */
        this.newKeyChain = () => {
            // warning, overwrites the old keychain
            const alias = this.getBlockchainAlias();
            if (alias) {
                this.keychain = new keychain_1.KeyChain(this.core.getHRP(), alias);
            }
            else {
                this.keychain = new keychain_1.KeyChain(this.core.getHRP(), this.blockchainID);
            }
            return this.keychain;
        };
        /**
         * Helper function which determines if a tx is a goose egg transaction.
         *
         * @param utx An UnsignedTx
         *
         * @returns boolean true if passes goose egg test and false if fails.
         *
         * @remarks
         * A "Goose Egg Transaction" is when the fee far exceeds a reasonable amount
         */
        this.checkGooseEgg = (utx, outTotal = new bn_js_1.default(0)) => __awaiter(this, void 0, void 0, function* () {
            const avaxAssetID = yield this.getAVAXAssetID();
            let outputTotal = outTotal.gt(new bn_js_1.default(0)) ? outTotal : utx.getOutputTotal(avaxAssetID);
            const fee = utx.getBurn(avaxAssetID);
            if (fee.lte(constants_1.ONEAVAX.mul(new bn_js_1.default(10))) || fee.lte(outputTotal)) {
                return true;
            }
            else {
                return false;
            }
        });
        /**
         * Retrieves an assetID for a subnet"s staking assset.
         *
         * @returns Returns a Promise<string> with cb58 encoded value of the assetID.
         */
        this.getStakingAssetID = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("platform.getStakingAssetID");
            return response.data.result.assetID;
        });
        /**
         * Creates a new blockchain.
         *
         * @param username The username of the Keystore user that controls the new account
         * @param password The password of the Keystore user that controls the new account
         * @param subnetID Optional. Either a {@link https://github.com/feross/buffer|Buffer} or an cb58 serialized string for the SubnetID or its alias.
         * @param vmID The ID of the Virtual Machine the blockchain runs. Can also be an alias of the Virtual Machine.
         * @param FXIDs The ids of the FXs the VM is running.
         * @param name A human-readable name for the new blockchain
         * @param genesis The base 58 (with checksum) representation of the genesis state of the new blockchain. Virtual Machines should have a static API method named buildGenesis that can be used to generate genesisData.
         *
         * @returns Promise for the unsigned transaction to create this blockchain. Must be signed by a sufficient number of the Subnet’s control keys and by the account paying the transaction fee.
         */
        this.createBlockchain = (username, password, subnetID = undefined, vmID, fxIDs, name, genesis) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                fxIDs,
                vmID,
                name,
                genesisData: genesis,
            };
            if (typeof subnetID === "string") {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== "undefined") {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            const response = yield this.callMethod("platform.createBlockchain", params);
            return response.data.result.txID;
        });
        /**
         * Gets the status of a blockchain.
         *
         * @param blockchainID The blockchainID requesting a status update
         *
         * @returns Promise for a string of one of: "Validating", "Created", "Preferred", "Unknown".
         */
        this.getBlockchainStatus = (blockchainID) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                blockchainID,
            };
            const response = yield this.callMethod("platform.getBlockchainStatus", params);
            return response.data.result.status;
        });
        /**
         * Create an address in the node's keystore.
         *
         * @param username The username of the Keystore user that controls the new account
         * @param password The password of the Keystore user that controls the new account
         *
         * @returns Promise for a string of the newly created account address.
         */
        this.createAddress = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
            };
            const response = yield this.callMethod("platform.createAddress", params);
            return response.data.result.address;
        });
        /**
         * Gets the balance of a particular asset.
         *
         * @param address The address to pull the asset balance from
         *
         * @returns Promise with the balance as a {@link https://github.com/indutny/bn.js/|BN} on the provided address.
         */
        this.getBalance = (address) => __awaiter(this, void 0, void 0, function* () {
            if (typeof this.parseAddress(address) === "undefined") {
                /* istanbul ignore next */
                throw new errors_1.AddressError("Error - PlatformVMAPI.getBalance: Invalid address format");
            }
            const params = {
                address
            };
            const response = yield this.callMethod("platform.getBalance", params);
            return response.data.result;
        });
        /**
         * List the addresses controlled by the user.
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         *
         * @returns Promise for an array of addresses.
         */
        this.listAddresses = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password
            };
            const response = yield this.callMethod("platform.listAddresses", params);
            return response.data.result.addresses;
        });
        /**
         * Lists the set of current validators.
         *
         * @param subnetID Optional. Either a {@link https://github.com/feross/buffer|Buffer} or an
         * cb58 serialized string for the SubnetID or its alias.
         *
         * @returns Promise for an array of validators that are currently staking, see: {@link https://docs.avax.network/v1.0/en/api/platform/#platformgetcurrentvalidators|platform.getCurrentValidators documentation}.
         *
         */
        this.getCurrentValidators = (subnetID = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            if (typeof subnetID === "string") {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== "undefined") {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            const response = yield this.callMethod("platform.getCurrentValidators", params);
            return response.data.result;
        });
        /**
         * Lists the set of pending validators.
         *
         * @param subnetID Optional. Either a {@link https://github.com/feross/buffer|Buffer}
         * or a cb58 serialized string for the SubnetID or its alias.
         *
         * @returns Promise for an array of validators that are pending staking, see: {@link https://docs.avax.network/v1.0/en/api/platform/#platformgetpendingvalidators|platform.getPendingValidators documentation}.
         *
         */
        this.getPendingValidators = (subnetID = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            if (typeof subnetID === "string") {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== "undefined") {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            const response = yield this.callMethod("platform.getPendingValidators", params);
            return response.data.result;
        });
        /**
         * Samples `Size` validators from the current validator set.
         *
         * @param sampleSize Of the total universe of validators, select this many at random
         * @param subnetID Optional. Either a {@link https://github.com/feross/buffer|Buffer} or an
         * cb58 serialized string for the SubnetID or its alias.
         *
         * @returns Promise for an array of validator"s stakingIDs.
         */
        this.sampleValidators = (sampleSize, subnetID = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                size: sampleSize.toString()
            };
            if (typeof subnetID === "string") {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== "undefined") {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            const response = yield this.callMethod("platform.sampleValidators", params);
            return response.data.result.validators;
        });
        /**
         * Add a validator to the Primary Network.
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         * @param nodeID The node ID of the validator
         * @param startTime Javascript Date object for the start time to validate
         * @param endTime Javascript Date object for the end time to validate
         * @param stakeAmount The amount of nAVAX the validator is staking as
         * a {@link https://github.com/indutny/bn.js/|BN}
         * @param rewardAddress The address the validator reward will go to, if there is one.
         * @param delegationFeeRate Optional. A {@link https://github.com/indutny/bn.js/|BN} for the percent fee this validator
         * charges when others delegate stake to them. Up to 4 decimal places allowed additional decimal places are ignored.
         * Must be between 0 and 100, inclusive. For example, if delegationFeeRate is 1.2345 and someone delegates to this
         * validator, then when the delegation period is over, 1.2345% of the reward goes to the validator and the rest goes
         * to the delegator.
         *
         * @returns Promise for a base58 string of the unsigned transaction.
         */
        this.addValidator = (username, password, nodeID, startTime, endTime, stakeAmount, rewardAddress, delegationFeeRate = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                nodeID,
                startTime: startTime.getTime() / 1000,
                endTime: endTime.getTime() / 1000,
                stakeAmount: stakeAmount.toString(10),
                rewardAddress,
            };
            if (typeof delegationFeeRate !== "undefined") {
                params.delegationFeeRate = delegationFeeRate.toString(10);
            }
            const response = yield this.callMethod("platform.addValidator", params);
            return response.data.result.txID;
        });
        /**
         * Add a validator to a Subnet other than the Primary Network. The validator must validate the Primary Network for the entire duration they validate this Subnet.
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         * @param nodeID The node ID of the validator
         * @param subnetID Either a {@link https://github.com/feross/buffer|Buffer} or a cb58 serialized string for the SubnetID or its alias.
         * @param startTime Javascript Date object for the start time to validate
         * @param endTime Javascript Date object for the end time to validate
         * @param weight The validator’s weight used for sampling
         *
         * @returns Promise for the unsigned transaction. It must be signed (using sign) by the proper number of the Subnet’s control keys and by the key of the account paying the transaction fee before it can be issued.
         */
        this.addSubnetValidator = (username, password, nodeID, subnetID, startTime, endTime, weight) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                nodeID,
                startTime: startTime.getTime() / 1000,
                endTime: endTime.getTime() / 1000,
                weight
            };
            if (typeof subnetID === "string") {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== "undefined") {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            const response = yield this.callMethod("platform.addSubnetValidator", params);
            return response.data.result.txID;
        });
        /**
         * Add a delegator to the Primary Network.
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         * @param nodeID The node ID of the delegatee
         * @param startTime Javascript Date object for when the delegator starts delegating
         * @param endTime Javascript Date object for when the delegator starts delegating
         * @param stakeAmount The amount of nAVAX the delegator is staking as
         * a {@link https://github.com/indutny/bn.js/|BN}
         * @param rewardAddress The address of the account the staked AVAX and validation reward
         * (if applicable) are sent to at endTime
         *
         * @returns Promise for an array of validator"s stakingIDs.
         */
        this.addDelegator = (username, password, nodeID, startTime, endTime, stakeAmount, rewardAddress) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                nodeID,
                startTime: startTime.getTime() / 1000,
                endTime: endTime.getTime() / 1000,
                stakeAmount: stakeAmount.toString(10),
                rewardAddress
            };
            const response = yield this.callMethod("platform.addDelegator", params);
            return response.data.result.txID;
        });
        /**
         * Create an unsigned transaction to create a new Subnet. The unsigned transaction must be
         * signed with the key of the account paying the transaction fee. The Subnet’s ID is the ID of the transaction that creates it (ie the response from issueTx when issuing the signed transaction).
         *
         * @param username The username of the Keystore user
         * @param password The password of the Keystore user
         * @param controlKeys Array of platform addresses as strings
         * @param threshold To add a validator to this Subnet, a transaction must have threshold
         * signatures, where each signature is from a key whose address is an element of `controlKeys`
         *
         * @returns Promise for a string with the unsigned transaction encoded as base58.
         */
        this.createSubnet = (username, password, controlKeys, threshold) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                controlKeys,
                threshold
            };
            const response = yield this.callMethod("platform.createSubnet", params);
            return response.data.result.txID;
        });
        /**
         * Get the Subnet that validates a given blockchain.
         *
         * @param blockchainID Either a {@link https://github.com/feross/buffer|Buffer} or a cb58
         * encoded string for the blockchainID or its alias.
         *
         * @returns Promise for a string of the subnetID that validates the blockchain.
         */
        this.validatedBy = (blockchainID) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                blockchainID,
            };
            const response = yield this.callMethod("platform.validatedBy", params);
            return response.data.result.subnetID;
        });
        /**
         * Get the IDs of the blockchains a Subnet validates.
         *
         * @param subnetID Either a {@link https://github.com/feross/buffer|Buffer} or an AVAX
         * serialized string for the SubnetID or its alias.
         *
         * @returns Promise for an array of blockchainIDs the subnet validates.
         */
        this.validates = (subnetID) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                subnetID,
            };
            if (typeof subnetID === "string") {
                params.subnetID = subnetID;
            }
            else if (typeof subnetID !== "undefined") {
                params.subnetID = bintools.cb58Encode(subnetID);
            }
            const response = yield this.callMethod("platform.validates", params);
            return response.data.result.blockchainIDs;
        });
        /**
         * Get all the blockchains that exist (excluding the P-Chain).
         *
         * @returns Promise for an array of objects containing fields "id", "subnetID", and "vmID".
         */
        this.getBlockchains = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("platform.getBlockchains");
            return response.data.result.blockchains;
        });
        /**
         * Send AVAX from an account on the P-Chain to an address on the X-Chain. This transaction
         * must be signed with the key of the account that the AVAX is sent from and which pays the
         * transaction fee. After issuing this transaction, you must call the X-Chain’s importAVAX
         * method to complete the transfer.
         *
         * @param username The Keystore user that controls the account specified in `to`
         * @param password The password of the Keystore user
         * @param to The address on the X-Chain to send the AVAX to. Do not include X- in the address
         * @param amount Amount of AVAX to export as a {@link https://github.com/indutny/bn.js/|BN}
         *
         * @returns Promise for an unsigned transaction to be signed by the account the the AVAX is
         * sent from and pays the transaction fee.
         */
        this.exportAVAX = (username, password, amount, to) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                to,
                amount: amount.toString(10)
            };
            const response = yield this.callMethod("platform.exportAVAX", params);
            return response.data.result.txID;
        });
        /**
         * Send AVAX from an account on the P-Chain to an address on the X-Chain. This transaction
         * must be signed with the key of the account that the AVAX is sent from and which pays
         * the transaction fee. After issuing this transaction, you must call the X-Chain’s
         * importAVAX method to complete the transfer.
         *
         * @param username The Keystore user that controls the account specified in `to`
         * @param password The password of the Keystore user
         * @param to The ID of the account the AVAX is sent to. This must be the same as the to
         * argument in the corresponding call to the X-Chain’s exportAVAX
         * @param sourceChain The chainID where the funds are coming from.
         *
         * @returns Promise for a string for the transaction, which should be sent to the network
         * by calling issueTx.
         */
        this.importAVAX = (username, password, to, sourceChain) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                to,
                sourceChain,
                username,
                password
            };
            const response = yield this.callMethod("platform.importAVAX", params);
            return response.data.result.txID;
        });
        /**
         * Calls the node's issueTx method from the API and returns the resulting transaction ID as a string.
         *
         * @param tx A string, {@link https://github.com/feross/buffer|Buffer}, or [[Tx]] representing a transaction
         *
         * @returns A Promise<string> representing the transaction ID of the posted transaction.
         */
        this.issueTx = (tx) => __awaiter(this, void 0, void 0, function* () {
            let Transaction = "";
            if (typeof tx === "string") {
                Transaction = tx;
            }
            else if (tx instanceof buffer_1.Buffer) {
                const txobj = new tx_1.Tx();
                txobj.fromBuffer(tx);
                Transaction = txobj.toString();
            }
            else if (tx instanceof tx_1.Tx) {
                Transaction = tx.toString();
            }
            else {
                /* istanbul ignore next */
                throw new errors_1.TransactionError("Error - platform.issueTx: provided tx is not expected type of string, Buffer, or Tx");
            }
            const params = {
                tx: Transaction.toString()
            };
            const response = yield this.callMethod("platform.issueTx", params);
            return response.data.result.txID;
        });
        /**
         * Returns an upper bound on the amount of tokens that exist. Not monotonically increasing because this number can go down if a staker"s reward is denied.
         */
        this.getCurrentSupply = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("platform.getCurrentSupply");
            return new bn_js_1.default(response.data.result.supply, 10);
        });
        /**
         * Returns the height of the platform chain.
         */
        this.getHeight = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield this.callMethod("platform.getHeight");
            return new bn_js_1.default(response.data.result.height, 10);
        });
        /**
         * Gets the minimum staking amount.
         *
         * @param refresh A boolean to bypass the local cached value of Minimum Stake Amount, polling the node instead.
         */
        this.getMinStake = (refresh = false) => __awaiter(this, void 0, void 0, function* () {
            if (refresh !== true && typeof this.minValidatorStake !== "undefined" && typeof this.minDelegatorStake !== "undefined") {
                return {
                    minValidatorStake: this.minValidatorStake,
                    minDelegatorStake: this.minDelegatorStake
                };
            }
            const response = yield this.callMethod("platform.getMinStake");
            this.minValidatorStake = new bn_js_1.default(response.data.result.minValidatorStake, 10);
            this.minDelegatorStake = new bn_js_1.default(response.data.result.minDelegatorStake, 10);
            return {
                minValidatorStake: this.minValidatorStake,
                minDelegatorStake: this.minDelegatorStake
            };
        });
        /**
         * Sets the minimum stake cached in this class.
         * @param minValidatorStake A {@link https://github.com/indutny/bn.js/|BN} to set the minimum stake amount cached in this class.
         * @param minDelegatorStake A {@link https://github.com/indutny/bn.js/|BN} to set the minimum delegation amount cached in this class.
         */
        this.setMinStake = (minValidatorStake = undefined, minDelegatorStake = undefined) => {
            if (typeof minValidatorStake !== "undefined") {
                this.minValidatorStake = minValidatorStake;
            }
            if (typeof minDelegatorStake !== "undefined") {
                this.minDelegatorStake = minDelegatorStake;
            }
        };
        /**
         * Gets the total amount staked for an array of addresses.
         */
        this.getStake = (addresses, encoding = "cb58") => __awaiter(this, void 0, void 0, function* () {
            const params = {
                addresses,
                encoding
            };
            const response = yield this.callMethod("platform.getStake", params);
            return {
                staked: new bn_js_1.default(response.data.result.staked, 10),
                stakedOutputs: response.data.result.stakedOutputs.map((stakedOutput) => {
                    const transferableOutput = new outputs_1.TransferableOutput();
                    let buf;
                    if (encoding === "cb58") {
                        buf = bintools.cb58Decode(stakedOutput);
                    }
                    else {
                        buf = buffer_1.Buffer.from(stakedOutput.replace(/0x/g, ""), "hex");
                    }
                    transferableOutput.fromBuffer(buf, 2);
                    return transferableOutput;
                })
            };
        });
        /**
         * Get all the subnets that exist.
         *
         * @param ids IDs of the subnets to retrieve information about. If omitted, gets all subnets
         *
         * @returns Promise for an array of objects containing fields "id",
         * "controlKeys", and "threshold".
         */
        this.getSubnets = (ids = undefined) => __awaiter(this, void 0, void 0, function* () {
            const params = {};
            if (typeof ids !== undefined) {
                params.ids = ids;
            }
            const response = yield this.callMethod("platform.getSubnets", params);
            return response.data.result.subnets;
        });
        /**
         * Exports the private key for an address.
         *
         * @param username The name of the user with the private key
         * @param password The password used to decrypt the private key
         * @param address The address whose private key should be exported
         *
         * @returns Promise with the decrypted private key as store in the database
         */
        this.exportKey = (username, password, address) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                address
            };
            const response = yield this.callMethod("platform.exportKey", params);
            return response.data.result.privateKey;
        });
        /**
         * Give a user control over an address by providing the private key that controls the address.
         *
         * @param username The name of the user to store the private key
         * @param password The password that unlocks the user
         * @param privateKey A string representing the private key in the vm"s format
         *
         * @returns The address for the imported private key.
         */
        this.importKey = (username, password, privateKey) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                privateKey
            };
            const response = yield this.callMethod("platform.importKey", params);
            return response.data.result.address;
        });
        /**
         * Returns the treansaction data of a provided transaction ID by calling the node's `getTx` method.
         *
         * @param txid The string representation of the transaction ID
         *
         * @returns Returns a Promise<string> containing the bytes retrieved from the node
         */
        this.getTx = (txid) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                txID: txid
            };
            const response = yield this.callMethod("platform.getTx", params);
            return response.data.result.tx;
        });
        /**
         * Returns the status of a provided transaction ID by calling the node's `getTxStatus` method.
         *
         * @param txid The string representation of the transaction ID
         * @param includeReason Return the reason tx was dropped, if applicable. Defaults to true
         *
         * @returns Returns a Promise<string> containing the status retrieved from the node and the reason a tx was dropped, if applicable.
         */
        this.getTxStatus = (txid, includeReason = true) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                txID: txid,
                includeReason: includeReason
            };
            const response = yield this.callMethod("platform.getTxStatus", params);
            return response.data.result;
        });
        /**
         * Retrieves the UTXOs related to the addresses provided from the node's `getUTXOs` method.
         *
         * @param addresses An array of addresses as cb58 strings or addresses as {@link https://github.com/feross/buffer|Buffer}s
         * @param sourceChain A string for the chain to look for the UTXO"s. Default is to use this chain, but if exported UTXOs exist from other chains, this can used to pull them instead.
         * @param limit Optional. Returns at most [limit] addresses. If [limit] == 0 or > [maxUTXOsToFetch], fetches up to [maxUTXOsToFetch].
         * @param startIndex Optional. [StartIndex] defines where to start fetching UTXOs (for pagination.)
         * UTXOs fetched are from addresses equal to or greater than [StartIndex.Address]
         * For address [StartIndex.Address], only UTXOs with IDs greater than [StartIndex.Utxo] will be returned.
         * @param persistOpts Options available to persist these UTXOs in local storage
         *
         * @remarks
         * persistOpts is optional and must be of type [[PersistanceOptions]]
         *
         */
        this.getUTXOs = (addresses, sourceChain = undefined, limit = 0, startIndex = undefined, persistOpts = undefined) => __awaiter(this, void 0, void 0, function* () {
            if (typeof addresses === "string") {
                addresses = [addresses];
            }
            const params = {
                addresses: addresses,
                limit
            };
            if (typeof startIndex !== "undefined" && startIndex) {
                params.startIndex = startIndex;
            }
            if (typeof sourceChain !== "undefined") {
                params.sourceChain = sourceChain;
            }
            const response = yield this.callMethod("platform.getUTXOs", params);
            const utxos = new utxos_1.UTXOSet();
            let data = response.data.result.utxos;
            if (persistOpts && typeof persistOpts === "object") {
                if (this.db.has(persistOpts.getName())) {
                    const selfArray = this.db.get(persistOpts.getName());
                    if (Array.isArray(selfArray)) {
                        utxos.addArray(data);
                        const self = new utxos_1.UTXOSet();
                        self.addArray(selfArray);
                        self.mergeByRule(utxos, persistOpts.getMergeRule());
                        data = self.getAllUTXOStrings();
                    }
                }
                this.db.set(persistOpts.getName(), data, persistOpts.getOverwrite());
            }
            utxos.addArray(data, false);
            response.data.result.utxos = utxos;
            response.data.result.numFetched = parseInt(response.data.result.numFetched);
            return response.data.result;
        });
        /**
         * Helper function which creates an unsigned Import Tx. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param ownerAddresses The addresses being used to import
         * @param sourceChain The chainid for where the import is coming from.
         * @param toAddresses The addresses to send the funds
         * @param fromAddresses The addresses being used to send the funds from the UTXOs provided
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains a [[ImportTx]].
         *
         * @remarks
         * This helper exists because the endpoint API should be the primary point of entry for most functionality.
         */
        this.buildImportTx = (utxoset, ownerAddresses, sourceChain, toAddresses, fromAddresses, changeAddresses = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const to = this._cleanAddressArray(toAddresses, "buildBaseTx").map((a) => bintools.stringToAddress(a));
            const from = this._cleanAddressArray(fromAddresses, "buildBaseTx").map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, "buildBaseTx").map((a) => bintools.stringToAddress(a));
            let srcChain = undefined;
            if (typeof sourceChain === "undefined") {
                throw new errors_1.ChainIdError("Error - PlatformVMAPI.buildImportTx: Source ChainID is undefined.");
            }
            else if (typeof sourceChain === "string") {
                srcChain = sourceChain;
                sourceChain = bintools.cb58Decode(sourceChain);
            }
            else if (!(sourceChain instanceof buffer_1.Buffer)) {
                srcChain = bintools.cb58Encode(sourceChain);
                throw new errors_1.ChainIdError("Error - PlatformVMAPI.buildImportTx: Invalid destinationChain type: " + (typeof sourceChain));
            }
            const atomicUTXOs = yield (yield this.getUTXOs(ownerAddresses, srcChain, 0, undefined)).utxos;
            const avaxAssetID = yield this.getAVAXAssetID();
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const atomics = atomicUTXOs.getAllUTXOs();
            const builtUnsignedTx = utxoset.buildImportTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), to, from, change, atomics, sourceChain, this.getTxFee(), avaxAssetID, memo, asOf, locktime, threshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Helper function which creates an unsigned Export Tx. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param amount The amount being exported as a {@link https://github.com/indutny/bn.js/|BN}
         * @param destinationChain The chainid for where the assets will be sent.
         * @param toAddresses The addresses to send the funds
         * @param fromAddresses The addresses being used to send the funds from the UTXOs provided
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param memo Optional contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains an [[ExportTx]].
         */
        this.buildExportTx = (utxoset, amount, destinationChain, toAddresses, fromAddresses, changeAddresses = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => __awaiter(this, void 0, void 0, function* () {
            let prefixes = {};
            toAddresses.map((a) => {
                prefixes[a.split("-")[0]] = true;
            });
            if (Object.keys(prefixes).length !== 1) {
                throw new errors_1.AddressError("Error - PlatformVMAPI.buildExportTx: To addresses must have the same chainID prefix.");
            }
            if (typeof destinationChain === "undefined") {
                throw new errors_1.ChainIdError("Error - PlatformVMAPI.buildExportTx: Destination ChainID is undefined.");
            }
            else if (typeof destinationChain === "string") {
                destinationChain = bintools.cb58Decode(destinationChain); //
            }
            else if (!(destinationChain instanceof buffer_1.Buffer)) {
                throw new errors_1.ChainIdError("Error - PlatformVMAPI.buildExportTx: Invalid destinationChain type: " + (typeof destinationChain));
            }
            if (destinationChain.length !== 32) {
                throw new errors_1.ChainIdError("Error - PlatformVMAPI.buildExportTx: Destination ChainID must be 32 bytes in length.");
            }
            /*
            if(bintools.cb58Encode(destinationChain) !== Defaults.network[this.core.getNetworkID()].X["blockchainID"]) {
              throw new Error("Error - PlatformVMAPI.buildExportTx: Destination ChainID must The X-Chain ID in the current version of AvalancheJS.")
            }*/
            let to = [];
            toAddresses.map((a) => {
                to.push(bintools.stringToAddress(a));
            });
            const from = this._cleanAddressArray(fromAddresses, "buildExportTx").map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, "buildExportTx").map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const builtUnsignedTx = utxoset.buildExportTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), amount, avaxAssetID, to, from, change, destinationChain, this.getTxFee(), avaxAssetID, memo, asOf, locktime, threshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
        * Helper function which creates an unsigned [[AddSubnetValidatorTx]]. For more granular control, you may create your own
        * [[UnsignedTx]] manually and import the [[AddSubnetValidatorTx]] class directly.
        *
        * @param utxoset A set of UTXOs that the transaction is built on.
        * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who pays the fees in AVAX
        * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the fee payment
        * @param nodeID The node ID of the validator being added.
        * @param startTime The Unix time when the validator starts validating the Primary Network.
        * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
        * @param weight The amount of weight for this subnet validator.
        * @param memo Optional contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        *
        * @returns An unsigned transaction created from the passed in parameters.
        */
        /* Re-implement when subnetValidator signing process is clearer
        buildAddSubnetValidatorTx = async (
          utxoset:UTXOSet,
          fromAddresses:string[],
          changeAddresses:string[],
          nodeID:string,
          startTime:BN,
          endTime:BN,
          weight:BN,
          memo:PayloadBase|Buffer = undefined,
          asOf:BN = UnixNow()
        ):Promise<UnsignedTx> => {
          const from:Buffer[] = this._cleanAddressArray(fromAddresses, "buildAddSubnetValidatorTx").map((a): Buffer => bintools.stringToAddress(a))
          const change:Buffer[] = this._cleanAddressArray(changeAddresses, "buildAddSubnetValidatorTx").map((a): Buffer => bintools.stringToAddress(a))
      
          if( memo instanceof PayloadBase) {
            memo = memo.getPayload()
          }
      
          const avaxAssetID:Buffer = await this.getAVAXAssetID()
      
          const now:BN = UnixNow()
          if (startTime.lt(now) || endTime.lte(startTime)) {
            throw new Error("PlatformVMAPI.buildAddSubnetValidatorTx -- startTime must be in the future and endTime must come after startTime")
          }
      
          const builtUnsignedTx:UnsignedTx = utxoset.buildAddSubnetValidatorTx(
            this.core.getNetworkID(),
            bintools.cb58Decode(this.blockchainID),
            from,
            change,
            NodeIDStringToBuffer(nodeID),
            startTime, endTime,
            weight,
            this.getFee(),
            avaxAssetID,
            memo, asOf
          )
      
          if(! await this.checkGooseEgg(builtUnsignedTx)) {
            /* istanbul ignore next */ /*
  throw new Error("Failed Goose Egg Check")
  }
  
  return builtUnsignedTx
  }
  
  */
        /**
        * Helper function which creates an unsigned [[AddDelegatorTx]]. For more granular control, you may create your own
        * [[UnsignedTx]] manually and import the [[AddDelegatorTx]] class directly.
        *
        * @param utxoset A set of UTXOs that the transaction is built on
        * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who received the staked tokens at the end of the staking period
        * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who own the staking UTXOs the fees in AVAX
        * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the fee payment
        * @param nodeID The node ID of the validator being added.
        * @param startTime The Unix time when the validator starts validating the Primary Network.
        * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
        * @param stakeAmount The amount being delegated as a {@link https://github.com/indutny/bn.js/|BN}
        * @param rewardAddresses The addresses which will recieve the rewards from the delegated stake.
        * @param rewardLocktime Optional. The locktime field created in the resulting reward outputs
        * @param rewardThreshold Opional. The number of signatures required to spend the funds in the resultant reward UTXO. Default 1.
        * @param memo Optional contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        *
        * @returns An unsigned transaction created from the passed in parameters.
        */
        this.buildAddDelegatorTx = (utxoset, toAddresses, fromAddresses, changeAddresses, nodeID, startTime, endTime, stakeAmount, rewardAddresses, rewardLocktime = new bn_js_1.default(0), rewardThreshold = 1, memo = undefined, asOf = helperfunctions_1.UnixNow()) => __awaiter(this, void 0, void 0, function* () {
            const to = this._cleanAddressArray(toAddresses, "buildAddDelegatorTx").map((a) => bintools.stringToAddress(a));
            const from = this._cleanAddressArray(fromAddresses, "buildAddDelegatorTx").map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, "buildAddDelegatorTx").map((a) => bintools.stringToAddress(a));
            const rewards = this._cleanAddressArray(rewardAddresses, "buildAddValidatorTx").map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const minStake = (yield this.getMinStake())["minDelegatorStake"];
            if (stakeAmount.lt(minStake)) {
                throw new errors_1.StakeError("PlatformVMAPI.buildAddDelegatorTx -- stake amount must be at least " + minStake.toString(10));
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const now = helperfunctions_1.UnixNow();
            if (startTime.lt(now) || endTime.lte(startTime)) {
                throw new errors_1.TimeError("PlatformVMAPI.buildAddDelegatorTx -- startTime must be in the future and endTime must come after startTime");
            }
            const builtUnsignedTx = utxoset.buildAddDelegatorTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), avaxAssetID, to, from, change, helperfunctions_1.NodeIDStringToBuffer(nodeID), startTime, endTime, stakeAmount, rewardLocktime, rewardThreshold, rewards, new bn_js_1.default(0), avaxAssetID, memo, asOf);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
        * Helper function which creates an unsigned [[AddValidatorTx]]. For more granular control, you may create your own
        * [[UnsignedTx]] manually and import the [[AddValidatorTx]] class directly.
        *
        * @param utxoset A set of UTXOs that the transaction is built on
        * @param toAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who received the staked tokens at the end of the staking period
        * @param fromAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who own the staking UTXOs the fees in AVAX
        * @param changeAddresses An array of addresses as {@link https://github.com/feross/buffer|Buffer} who gets the change leftover from the fee payment
        * @param nodeID The node ID of the validator being added.
        * @param startTime The Unix time when the validator starts validating the Primary Network.
        * @param endTime The Unix time when the validator stops validating the Primary Network (and staked AVAX is returned).
        * @param stakeAmount The amount being delegated as a {@link https://github.com/indutny/bn.js/|BN}
        * @param rewardAddresses The addresses which will recieve the rewards from the delegated stake.
        * @param delegationFee A number for the percentage of reward to be given to the validator when someone delegates to them. Must be between 0 and 100.
        * @param rewardLocktime Optional. The locktime field created in the resulting reward outputs
        * @param rewardThreshold Opional. The number of signatures required to spend the funds in the resultant reward UTXO. Default 1.
        * @param memo Optional contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        *
        * @returns An unsigned transaction created from the passed in parameters.
        */
        this.buildAddValidatorTx = (utxoset, toAddresses, fromAddresses, changeAddresses, nodeID, startTime, endTime, stakeAmount, rewardAddresses, delegationFee, rewardLocktime = new bn_js_1.default(0), rewardThreshold = 1, memo = undefined, asOf = helperfunctions_1.UnixNow()) => __awaiter(this, void 0, void 0, function* () {
            const to = this._cleanAddressArray(toAddresses, "buildAddValidatorTx").map((a) => bintools.stringToAddress(a));
            const from = this._cleanAddressArray(fromAddresses, "buildAddValidatorTx").map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, "buildAddValidatorTx").map((a) => bintools.stringToAddress(a));
            const rewards = this._cleanAddressArray(rewardAddresses, "buildAddValidatorTx").map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const minStake = (yield this.getMinStake())["minValidatorStake"];
            if (stakeAmount.lt(minStake)) {
                throw new errors_1.StakeError("PlatformVMAPI.buildAddValidatorTx -- stake amount must be at least " + minStake.toString(10));
            }
            if (typeof delegationFee !== "number" || delegationFee > 100 || delegationFee < 0) {
                throw new errors_1.DelegationFeeError("PlatformVMAPI.buildAddValidatorTx -- delegationFee must be a number between 0 and 100");
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const now = helperfunctions_1.UnixNow();
            if (startTime.lt(now) || endTime.lte(startTime)) {
                throw new errors_1.TimeError("PlatformVMAPI.buildAddValidatorTx -- startTime must be in the future and endTime must come after startTime");
            }
            const builtUnsignedTx = utxoset.buildAddValidatorTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), avaxAssetID, to, from, change, helperfunctions_1.NodeIDStringToBuffer(nodeID), startTime, endTime, stakeAmount, rewardLocktime, rewardThreshold, rewards, delegationFee, new bn_js_1.default(0), avaxAssetID, memo, asOf);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
          * Class representing an unsigned [[CreateSubnetTx]] transaction.
          *
          * @param utxoset A set of UTXOs that the transaction is built on
          * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
          * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
          * @param subnetOwnerAddresses An array of addresses for owners of the new subnet
          * @param subnetOwnerThreshold A number indicating the amount of signatures required to add validators to a subnet
          * @param memo Optional contains arbitrary bytes, up to 256 bytes
          * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
          *
          * @returns An unsigned transaction created from the passed in parameters.
          */
        this.buildCreateSubnetTx = (utxoset, fromAddresses, changeAddresses, subnetOwnerAddresses, subnetOwnerThreshold, memo = undefined, asOf = helperfunctions_1.UnixNow()) => __awaiter(this, void 0, void 0, function* () {
            const from = this._cleanAddressArray(fromAddresses, "buildCreateSubnetTx").map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, "buildCreateSubnetTx").map((a) => bintools.stringToAddress(a));
            const owners = this._cleanAddressArray(subnetOwnerAddresses, "buildCreateSubnetTx").map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const builtUnsignedTx = utxoset.buildCreateSubnetTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), from, change, owners, subnetOwnerThreshold, this.getCreationTxFee(), avaxAssetID, memo, asOf);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * @returns the UTXOs that were rewarded after the provided transaction"s staking or delegation period ended.
         *
         * @returns the number fetched, an array of UTXOs and the encoding.
         */
        this.getRewardUTXOs = (txID, encoding) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                txID,
                encoding
            };
            const response = yield this.callMethod("platform.getRewardUTXOs", params);
            return response.data.result;
        });
        this.blockchainID = constants_1.PlatformChainID;
        const netid = core.getNetworkID();
        if (netid in constants_1.Defaults.network && this.blockchainID in constants_1.Defaults.network[netid]) {
            const { alias } = constants_1.Defaults.network[netid][this.blockchainID];
            this.keychain = new keychain_1.KeyChain(this.core.getHRP(), alias);
        }
        else {
            this.keychain = new keychain_1.KeyChain(this.core.getHRP(), this.blockchainID);
        }
    }
    /**
     * @ignore
     */
    _cleanAddressArray(addresses, caller) {
        const addrs = [];
        const chainid = this.getBlockchainAlias() ? this.getBlockchainAlias() : this.getBlockchainID();
        if (addresses && addresses.length > 0) {
            for (let i = 0; i < addresses.length; i++) {
                if (typeof addresses[i] === "string") {
                    if (typeof this.parseAddress(addresses[i]) === "undefined") {
                        /* istanbul ignore next */
                        throw new errors_1.AddressError("Error - Invalid address format");
                    }
                    addrs.push(addresses[i]);
                }
                else {
                    const bech32 = "bech32";
                    addrs.push(serialization.bufferToType(addresses[i], bech32, this.core.getHRP(), chainid));
                }
            }
        }
        return addrs;
    }
}
exports.PlatformVMAPI = PlatformVMAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvcGxhdGZvcm12bS9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7OztHQUdHO0FBQ0gsb0NBQWdDO0FBQ2hDLGtEQUFzQjtBQUV0QixrREFBOEM7QUFFOUMsb0VBQTJDO0FBQzNDLHlDQUFxQztBQUNyQyxxREFBMEU7QUFDMUUsMkNBQWlEO0FBQ2pELDZCQUFxQztBQUNyQyxpREFBaUQ7QUFDakQsaUVBQTJFO0FBQzNFLCtDQUFtRDtBQUVuRCwrQ0FRMkI7QUFFM0IsbURBQTBEO0FBQzFELHVDQUEyRDtBQUUzRDs7R0FFRztBQUNILE1BQU0sUUFBUSxHQUFhLGtCQUFRLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDakQsTUFBTSxhQUFhLEdBQWtCLHFCQUFhLENBQUMsV0FBVyxFQUFFLENBQUE7QUFFaEU7Ozs7OztHQU1HO0FBQ0gsTUFBYSxhQUFjLFNBQVEsaUJBQU87SUF3M0N4Qzs7Ozs7O09BTUc7SUFDSCxZQUFZLElBQW1CLEVBQUUsVUFBa0IsV0FBVztRQUM1RCxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBOTNDdEI7O1dBRUc7UUFDTyxhQUFRLEdBQWEsSUFBSSxtQkFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUV6QyxpQkFBWSxHQUFXLDJCQUFlLENBQUE7UUFFdEMsb0JBQWUsR0FBVyxTQUFTLENBQUE7UUFFbkMsZ0JBQVcsR0FBVyxTQUFTLENBQUE7UUFFL0IsVUFBSyxHQUFPLFNBQVMsQ0FBQTtRQUVyQixrQkFBYSxHQUFPLFNBQVMsQ0FBQTtRQUU3QixzQkFBaUIsR0FBTyxTQUFTLENBQUE7UUFFakMsc0JBQWlCLEdBQU8sU0FBUyxDQUFBO1FBRTNDOzs7O1dBSUc7UUFDSCx1QkFBa0IsR0FBRyxHQUFXLEVBQUU7WUFDaEMsSUFBSSxPQUFPLElBQUksQ0FBQyxlQUFl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Q0FBQyxTQUE4QixFQUFFLE1BQWM7UUFDekUsTUFBTSxLQUFLLEdBQWEsRUFBRSxDQUFBO1FBQzFCLE1BQU0sT0FBTyxHQUFXLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO1FBQ3RHLElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3JDLEtBQUssSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNqRCxJQUFJLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsRUFBRTtvQkFDcEMsSUFBSSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBVyxDQUFDLEtBQUssV0FBVyxFQUFFO3dCQUNwRSwwQkFBMEI7d0JBQzFCLE1BQU0sSUFBSSxxQkFBWSxDQUFDLGdDQUFnQyxDQUFDLENBQUE7cUJBQ3pEO29CQUNELEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBVyxDQUFDLENBQUE7aUJBQ25DO3FCQUFNO29CQUNMLE1BQU0sTUFBTSxHQUFtQixRQUFRLENBQUE7b0JBQ3ZDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFXLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQTtpQkFDcEc7YUFDRjtTQUNGO1FBQ0QsT0FBTyxLQUFLLENBQUE7SUFDZCxDQUFDO0NBa0NGO0FBeDVDRCxzQ0F3NUNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFja2FnZURvY3VtZW50YXRpb25cbiAqIEBtb2R1bGUgQVBJLVBsYXRmb3JtVk1cbiAqL1xuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEJOIGZyb20gXCJibi5qc1wiXG5pbXBvcnQgQXZhbGFuY2hlQ29yZSBmcm9tIFwiLi4vLi4vYXZhbGFuY2hlXCJcbmltcG9ydCB7IEpSUENBUEkgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2pycGNhcGlcIlxuaW1wb3J0IHsgUmVxdWVzdFJlc3BvbnNlRGF0YSB9IGZyb20gXCIuLi8uLi9jb21tb24vYXBpYmFzZVwiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IEtleUNoYWluIH0gZnJvbSBcIi4va2V5Y2hhaW5cIlxuaW1wb3J0IHsgRGVmYXVsdHMsIFBsYXRmb3JtQ2hhaW5JRCwgT05FQVZBWCB9IGZyb20gXCIuLi8uLi91dGlscy9jb25zdGFudHNcIlxuaW1wb3J0IHsgUGxhdGZvcm1WTUNvbnN0YW50cyB9IGZyb20gXCIuL2NvbnN0YW50c1wiXG5pbXBvcnQgeyBVbnNpZ25lZFR4LCBUeCB9IGZyb20gXCIuL3R4XCJcbmltcG9ydCB7IFBheWxvYWRCYXNlIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3BheWxvYWRcIlxuaW1wb3J0IHsgVW5peE5vdywgTm9kZUlEU3RyaW5nVG9CdWZmZXIgfSBmcm9tIFwiLi4vLi4vdXRpbHMvaGVscGVyZnVuY3Rpb25zXCJcbmltcG9ydCB7IFVUWE8sIFVUWE9TZXQgfSBmcm9tIFwiLi4vcGxhdGZvcm12bS91dHhvc1wiXG5pbXBvcnQgeyBQZXJzaXN0YW5jZU9wdGlvbnMgfSBmcm9tIFwiLi4vLi4vdXRpbHMvcGVyc2lzdGVuY2VvcHRpb25zXCJcbmltcG9ydCB7XG4gIEFkZHJlc3NFcnJvcixcbiAgVHJhbnNhY3Rpb25FcnJvcixcbiAgQ2hhaW5JZEVycm9yLFxuICBHb29zZUVnZ0NoZWNrRXJyb3IsXG4gIFRpbWVFcnJvcixcbiAgU3Rha2VFcnJvcixcbiAgRGVsZWdhdGlvbkZlZUVycm9yXG59IGZyb20gXCIuLi8uLi91dGlscy9lcnJvcnNcIlxuaW1wb3J0IHsgR2V0UmV3YXJkVVRYT3NQYXJhbXMsIEdldFJld2FyZFVUWE9zUmVzcG9uc2UsIEdldFN0YWtlUGFyYW1zLCBHZXRTdGFrZVJlc3BvbnNlIH0gZnJvbSBcIi4uLy4uL2NvbW1vblwiXG5pbXBvcnQgeyBUcmFuc2ZlcmFibGVPdXRwdXQgfSBmcm9tIFwiLi4vcGxhdGZvcm12bS9vdXRwdXRzXCJcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRUeXBlIH0gZnJvbSBcIi4uLy4uL3V0aWxzXCJcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmNvbnN0IGJpbnRvb2xzOiBCaW5Ub29scyA9IEJpblRvb2xzLmdldEluc3RhbmNlKClcbmNvbnN0IHNlcmlhbGl6YXRpb246IFNlcmlhbGl6YXRpb24gPSBTZXJpYWxpemF0aW9uLmdldEluc3RhbmNlKClcblxuLyoqXG4gKiBDbGFzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIG5vZGUncyBQbGF0Zm9ybVZNQVBJXG4gKlxuICogQGNhdGVnb3J5IFJQQ0FQSXNcbiAqXG4gKiBAcmVtYXJrcyBUaGlzIGV4dGVuZHMgdGhlIFtbSlJQQ0FQSV1dIGNsYXNzLiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgZGlyZWN0bHkgY2FsbGVkLiBJbnN0ZWFkLCB1c2UgdGhlIFtbQXZhbGFuY2hlLmFkZEFQSV1dIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIHRoaXMgaW50ZXJmYWNlIHdpdGggQXZhbGFuY2hlLlxuICovXG5leHBvcnQgY2xhc3MgUGxhdGZvcm1WTUFQSSBleHRlbmRzIEpSUENBUEkge1xuXG4gIC8qKlxuICAgKiBAaWdub3JlXG4gICAqL1xuICBwcm90ZWN0ZWQga2V5Y2hhaW46IEtleUNoYWluID0gbmV3IEtleUNoYWluKFwiXCIsIFwiXCIpXG5cbiAgcHJvdGVjdGVkIGJsb2NrY2hhaW5JRDogc3RyaW5nID0gUGxhdGZvcm1DaGFpbklEXG5cbiAgcHJvdGVjdGVkIGJsb2NrY2hhaW5BbGlhczogc3RyaW5nID0gdW5kZWZpbmVkXG5cbiAgcHJvdGVjdGVkIEFWQVhBc3NldElEOiBCdWZmZXIgPSB1bmRlZmluZWRcblxuICBwcm90ZWN0ZWQgdHhGZWU6IEJOID0gdW5kZWZpbmVkXG5cbiAgcHJvdGVjdGVkIGNyZWF0aW9uVHhGZWU6IEJOID0gdW5kZWZpbmVkXG5cbiAgcHJvdGVjdGVkIG1pblZhbGlkYXRvclN0YWtlOiBCTiA9IHVuZGVmaW5lZFxuXG4gIHByb3RlY3RlZCBtaW5EZWxlZ2F0b3JTdGFrZTogQk4gPSB1bmRlZmluZWRcblxuICAvKipcbiAgICogR2V0cyB0aGUgYWxpYXMgZm9yIHRoZSBibG9ja2NoYWluSUQgaWYgaXQgZXhpc3RzLCBvdGhlcndpc2UgcmV0dXJucyBgdW5kZWZpbmVkYC5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGFsaWFzIGZvciB0aGUgYmxvY2tjaGFpbklEXG4gICAqL1xuICBnZXRCbG9ja2NoYWluQWxpYXMgPSAoKTogc3RyaW5nID0+IHtcbiAgICBpZiAodHlwZW9mIHRoaXMuYmxvY2tjaGFpbkFsaWFzID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBjb25zdCBuZXRpZDogbnVtYmVyID0gdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpXG4gICAgICBpZiAobmV0aWQgaW4gRGVmYXVsdHMubmV0d29yayAmJiB0aGlzLmJsb2NrY2hhaW5JRCBpbiBEZWZhdWx0cy5uZXR3b3JrW25ldGlkXSkge1xuICAgICAgICB0aGlzLmJsb2NrY2hhaW5BbGlhcyA9IERlZmF1bHRzLm5ldHdvcmtbbmV0aWRdW3RoaXMuYmxvY2tjaGFpbklEXS5hbGlhc1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja2NoYWluQWxpYXNcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuYmxvY2tjaGFpbkFsaWFzXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgYWxpYXMgZm9yIHRoZSBibG9ja2NoYWluSUQuXG4gICAqXG4gICAqIEBwYXJhbSBhbGlhcyBUaGUgYWxpYXMgZm9yIHRoZSBibG9ja2NoYWluSUQuXG4gICAqXG4gICAqL1xuICBzZXRCbG9ja2NoYWluQWxpYXMgPSAoYWxpYXM6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgdGhpcy5ibG9ja2NoYWluQWxpYXMgPSBhbGlhc1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGJsb2NrY2hhaW5JRCBhbmQgcmV0dXJucyBpdC5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGJsb2NrY2hhaW5JRFxuICAgKi9cbiAgZ2V0QmxvY2tjaGFpbklEID0gKCk6IHN0cmluZyA9PiB0aGlzLmJsb2NrY2hhaW5JRFxuXG4gIC8qKlxuICAgKiBSZWZyZXNoIGJsb2NrY2hhaW5JRCwgYW5kIGlmIGEgYmxvY2tjaGFpbklEIGlzIHBhc3NlZCBpbiwgdXNlIHRoYXQuXG4gICAqXG4gICAqIEBwYXJhbSBPcHRpb25hbC4gQmxvY2tjaGFpbklEIHRvIGFzc2lnbiwgaWYgbm9uZSwgdXNlcyB0aGUgZGVmYXVsdCBiYXNlZCBvbiBuZXR3b3JrSUQuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBibG9ja2NoYWluSURcbiAgICovXG4gIHJlZnJlc2hCbG9ja2NoYWluSUQgPSAoYmxvY2tjaGFpbklEOiBzdHJpbmcgPSB1bmRlZmluZWQpOiBib29sZWFuID0+IHtcbiAgICBjb25zdCBuZXRpZDogbnVtYmVyID0gdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpXG4gICAgaWYgKHR5cGVvZiBibG9ja2NoYWluSUQgPT09IFwidW5kZWZpbmVkXCIgJiYgdHlwZW9mIERlZmF1bHRzLm5ldHdvcmtbbmV0aWRdICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aGlzLmJsb2NrY2hhaW5JRCA9IFBsYXRmb3JtQ2hhaW5JRCAvL2RlZmF1bHQgdG8gUC1DaGFpblxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGlmICh0eXBlb2YgYmxvY2tjaGFpbklEID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB0aGlzLmJsb2NrY2hhaW5JRCA9IGJsb2NrY2hhaW5JRFxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICAvKipcbiAgICogVGFrZXMgYW4gYWRkcmVzcyBzdHJpbmcgYW5kIHJldHVybnMgaXRzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHJlcHJlc2VudGF0aW9uIGlmIHZhbGlkLlxuICAgKlxuICAgKiBAcmV0dXJucyBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IGZvciB0aGUgYWRkcmVzcyBpZiB2YWxpZCwgdW5kZWZpbmVkIGlmIG5vdCB2YWxpZC5cbiAgICovXG4gIHBhcnNlQWRkcmVzcyA9IChhZGRyOiBzdHJpbmcpOiBCdWZmZXIgPT4ge1xuICAgIGNvbnN0IGFsaWFzOiBzdHJpbmcgPSB0aGlzLmdldEJsb2NrY2hhaW5BbGlhcygpXG4gICAgY29uc3QgYmxvY2tjaGFpbklEOiBzdHJpbmcgPSB0aGlzLmdldEJsb2NrY2hhaW5JRCgpXG4gICAgcmV0dXJuIGJpbnRvb2xzLnBhcnNlQWRkcmVzcyhhZGRyLCBibG9ja2NoYWluSUQsIGFsaWFzLCBQbGF0Zm9ybVZNQ29uc3RhbnRzLkFERFJFU1NMRU5HVEgpXG4gIH1cblxuICBhZGRyZXNzRnJvbUJ1ZmZlciA9IChhZGRyZXNzOiBCdWZmZXIpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IGNoYWluaWQ6IHN0cmluZyA9IHRoaXMuZ2V0QmxvY2tjaGFpbkFsaWFzKCkgPyB0aGlzLmdldEJsb2NrY2hhaW5BbGlhcygpIDogdGhpcy5nZXRCbG9ja2NoYWluSUQoKVxuICAgIGNvbnN0IHR5cGU6IFNlcmlhbGl6ZWRUeXBlID0gXCJiZWNoMzJcIlxuICAgIHJldHVybiBzZXJpYWxpemF0aW9uLmJ1ZmZlclRvVHlwZShhZGRyZXNzLCB0eXBlLCB0aGlzLmNvcmUuZ2V0SFJQKCksIGNoYWluaWQpXG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgQVZBWCBBc3NldElEIGFuZCByZXR1cm5zIGl0IGluIGEgUHJvbWlzZS5cbiAgICpcbiAgICogQHBhcmFtIHJlZnJlc2ggVGhpcyBmdW5jdGlvbiBjYWNoZXMgdGhlIHJlc3BvbnNlLiBSZWZyZXNoID0gdHJ1ZSB3aWxsIGJ1c3QgdGhlIGNhY2hlLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgdGhlIHByb3ZpZGVkIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIEFWQVggQXNzZXRJRFxuICAgKi9cbiAgZ2V0QVZBWEFzc2V0SUQgPSBhc3luYyAocmVmcmVzaDogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxCdWZmZXI+ID0+IHtcbiAgICBpZiAodHlwZW9mIHRoaXMuQVZBWEFzc2V0SUQgPT09IFwidW5kZWZpbmVkXCIgfHwgcmVmcmVzaCkge1xuICAgICAgY29uc3QgYXNzZXRJRDogc3RyaW5nID0gYXdhaXQgdGhpcy5nZXRTdGFraW5nQXNzZXRJRCgpXG4gICAgICB0aGlzLkFWQVhBc3NldElEID0gYmludG9vbHMuY2I1OERlY29kZShhc3NldElEKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5BVkFYQXNzZXRJRFxuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyB0aGUgZGVmYXVsdHMgYW5kIHNldHMgdGhlIGNhY2hlIHRvIGEgc3BlY2lmaWMgQVZBWCBBc3NldElEXG4gICAqXG4gICAqIEBwYXJhbSBhdmF4QXNzZXRJRCBBIGNiNTggc3RyaW5nIG9yIEJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIEFWQVggQXNzZXRJRFxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgdGhlIHByb3ZpZGVkIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIEFWQVggQXNzZXRJRFxuICAgKi9cbiAgc2V0QVZBWEFzc2V0SUQgPSAoYXZheEFzc2V0SUQ6IHN0cmluZyB8IEJ1ZmZlcikgPT4ge1xuICAgIGlmICh0eXBlb2YgYXZheEFzc2V0SUQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGF2YXhBc3NldElEID0gYmludG9vbHMuY2I1OERlY29kZShhdmF4QXNzZXRJRClcbiAgICB9XG4gICAgdGhpcy5BVkFYQXNzZXRJRCA9IGF2YXhBc3NldElEXG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgZGVmYXVsdCB0eCBmZWUgZm9yIHRoaXMgY2hhaW4uXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBkZWZhdWx0IHR4IGZlZSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqL1xuICBnZXREZWZhdWx0VHhGZWUgPSAoKTogQk4gPT4ge1xuICAgIHJldHVybiB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKCkgaW4gRGVmYXVsdHMubmV0d29yayA/IG5ldyBCTihEZWZhdWx0cy5uZXR3b3JrW3RoaXMuY29yZS5nZXROZXR3b3JrSUQoKV1bXCJQXCJdW1widHhGZWVcIl0pIDogbmV3IEJOKDApXG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgdHggZmVlIGZvciB0aGlzIGNoYWluLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgdHggZmVlIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICovXG4gIGdldFR4RmVlID0gKCk6IEJOID0+IHtcbiAgICBpZiAodHlwZW9mIHRoaXMudHhGZWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMudHhGZWUgPSB0aGlzLmdldERlZmF1bHRUeEZlZSgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnR4RmVlXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdHggZmVlIGZvciB0aGlzIGNoYWluLlxuICAgKlxuICAgKiBAcGFyYW0gZmVlIFRoZSB0eCBmZWUgYW1vdW50IHRvIHNldCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKi9cbiAgc2V0VHhGZWUgPSAoZmVlOiBCTikgPT4ge1xuICAgIHRoaXMudHhGZWUgPSBmZWVcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGRlZmF1bHQgY3JlYXRpb24gZmVlIGZvciB0aGlzIGNoYWluLlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgZGVmYXVsdCBjcmVhdGlvbiBmZWUgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKi9cbiAgZ2V0RGVmYXVsdENyZWF0aW9uVHhGZWUgPSAoKTogQk4gPT4ge1xuICAgIHJldHVybiB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKCkgaW4gRGVmYXVsdHMubmV0d29yayA/IG5ldyBCTihEZWZhdWx0cy5uZXR3b3JrW3RoaXMuY29yZS5nZXROZXR3b3JrSUQoKV1bXCJQXCJdW1wiY3JlYXRpb25UeEZlZVwiXSkgOiBuZXcgQk4oMClcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjcmVhdGlvbiBmZWUgZm9yIHRoaXMgY2hhaW4uXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBjcmVhdGlvbiBmZWUgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKi9cbiAgZ2V0Q3JlYXRpb25UeEZlZSA9ICgpOiBCTiA9PiB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmNyZWF0aW9uVHhGZWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuY3JlYXRpb25UeEZlZSA9IHRoaXMuZ2V0RGVmYXVsdENyZWF0aW9uVHhGZWUoKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jcmVhdGlvblR4RmVlXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY3JlYXRpb24gZmVlIGZvciB0aGlzIGNoYWluLlxuICAgKlxuICAgKiBAcGFyYW0gZmVlIFRoZSBjcmVhdGlvbiBmZWUgYW1vdW50IHRvIHNldCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKi9cbiAgc2V0Q3JlYXRpb25UeEZlZSA9IChmZWU6IEJOKSA9PiB7XG4gICAgdGhpcy5jcmVhdGlvblR4RmVlID0gZmVlXG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIHJlZmVyZW5jZSB0byB0aGUga2V5Y2hhaW4gZm9yIHRoaXMgY2xhc3MuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBpbnN0YW5jZSBvZiBbW11dIGZvciB0aGlzIGNsYXNzXG4gICAqL1xuICBrZXlDaGFpbiA9ICgpOiBLZXlDaGFpbiA9PiB0aGlzLmtleWNoYWluXG5cbiAgLyoqXG4gICAqIEBpZ25vcmVcbiAgICovXG4gIG5ld0tleUNoYWluID0gKCk6IEtleUNoYWluID0+IHtcbiAgICAvLyB3YXJuaW5nLCBvdmVyd3JpdGVzIHRoZSBvbGQga2V5Y2hhaW5cbiAgICBjb25zdCBhbGlhcyA9IHRoaXMuZ2V0QmxvY2tjaGFpbkFsaWFzKClcbiAgICBpZiAoYWxpYXMpIHtcbiAgICAgIHRoaXMua2V5Y2hhaW4gPSBuZXcgS2V5Q2hhaW4odGhpcy5jb3JlLmdldEhSUCgpLCBhbGlhcylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5rZXljaGFpbiA9IG5ldyBLZXlDaGFpbih0aGlzLmNvcmUuZ2V0SFJQKCksIHRoaXMuYmxvY2tjaGFpbklEKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5rZXljaGFpblxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCBkZXRlcm1pbmVzIGlmIGEgdHggaXMgYSBnb29zZSBlZ2cgdHJhbnNhY3Rpb24uXG4gICAqXG4gICAqIEBwYXJhbSB1dHggQW4gVW5zaWduZWRUeFxuICAgKlxuICAgKiBAcmV0dXJucyBib29sZWFuIHRydWUgaWYgcGFzc2VzIGdvb3NlIGVnZyB0ZXN0IGFuZCBmYWxzZSBpZiBmYWlscy5cbiAgICpcbiAgICogQHJlbWFya3NcbiAgICogQSBcIkdvb3NlIEVnZyBUcmFuc2FjdGlvblwiIGlzIHdoZW4gdGhlIGZlZSBmYXIgZXhjZWVkcyBhIHJlYXNvbmFibGUgYW1vdW50XG4gICAqL1xuICBjaGVja0dvb3NlRWdnID0gYXN5bmMgKHV0eDogVW5zaWduZWRUeCwgb3V0VG90YWw6IEJOID0gbmV3IEJOKDApKTogUHJvbWlzZTxib29sZWFuPiA9PiB7XG4gICAgY29uc3QgYXZheEFzc2V0SUQ6IEJ1ZmZlciA9IGF3YWl0IHRoaXMuZ2V0QVZBWEFzc2V0SUQoKVxuICAgIGxldCBvdXRwdXRUb3RhbDogQk4gPSBvdXRUb3RhbC5ndChuZXcgQk4oMCkpID8gb3V0VG90YWwgOiB1dHguZ2V0T3V0cHV0VG90YWwoYXZheEFzc2V0SUQpXG4gICAgY29uc3QgZmVlOiBCTiA9IHV0eC5nZXRCdXJuKGF2YXhBc3NldElEKVxuICAgIGlmIChmZWUubHRlKE9ORUFWQVgubXVsKG5ldyBCTigxMCkpKSB8fCBmZWUubHRlKG91dHB1dFRvdGFsKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyBhbiBhc3NldElEIGZvciBhIHN1Ym5ldFwicyBzdGFraW5nIGFzc3NldC5cbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2U8c3RyaW5nPiB3aXRoIGNiNTggZW5jb2RlZCB2YWx1ZSBvZiB0aGUgYXNzZXRJRC5cbiAgICovXG4gIGdldFN0YWtpbmdBc3NldElEID0gYXN5bmMgKCk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5nZXRTdGFraW5nQXNzZXRJRFwiKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5hc3NldElEXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBibG9ja2NoYWluLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXJuYW1lIG9mIHRoZSBLZXlzdG9yZSB1c2VyIHRoYXQgY29udHJvbHMgdGhlIG5ldyBhY2NvdW50XG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIEtleXN0b3JlIHVzZXIgdGhhdCBjb250cm9scyB0aGUgbmV3IGFjY291bnRcbiAgICogQHBhcmFtIHN1Ym5ldElEIE9wdGlvbmFsLiBFaXRoZXIgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBhbiBjYjU4IHNlcmlhbGl6ZWQgc3RyaW5nIGZvciB0aGUgU3VibmV0SUQgb3IgaXRzIGFsaWFzLlxuICAgKiBAcGFyYW0gdm1JRCBUaGUgSUQgb2YgdGhlIFZpcnR1YWwgTWFjaGluZSB0aGUgYmxvY2tjaGFpbiBydW5zLiBDYW4gYWxzbyBiZSBhbiBhbGlhcyBvZiB0aGUgVmlydHVhbCBNYWNoaW5lLlxuICAgKiBAcGFyYW0gRlhJRHMgVGhlIGlkcyBvZiB0aGUgRlhzIHRoZSBWTSBpcyBydW5uaW5nLlxuICAgKiBAcGFyYW0gbmFtZSBBIGh1bWFuLXJlYWRhYmxlIG5hbWUgZm9yIHRoZSBuZXcgYmxvY2tjaGFpblxuICAgKiBAcGFyYW0gZ2VuZXNpcyBUaGUgYmFzZSA1OCAod2l0aCBjaGVja3N1bSkgcmVwcmVzZW50YXRpb24gb2YgdGhlIGdlbmVzaXMgc3RhdGUgb2YgdGhlIG5ldyBibG9ja2NoYWluLiBWaXJ0dWFsIE1hY2hpbmVzIHNob3VsZCBoYXZlIGEgc3RhdGljIEFQSSBtZXRob2QgbmFtZWQgYnVpbGRHZW5lc2lzIHRoYXQgY2FuIGJlIHVzZWQgdG8gZ2VuZXJhdGUgZ2VuZXNpc0RhdGEuXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIHRoZSB1bnNpZ25lZCB0cmFuc2FjdGlvbiB0byBjcmVhdGUgdGhpcyBibG9ja2NoYWluLiBNdXN0IGJlIHNpZ25lZCBieSBhIHN1ZmZpY2llbnQgbnVtYmVyIG9mIHRoZSBTdWJuZXTigJlzIGNvbnRyb2wga2V5cyBhbmQgYnkgdGhlIGFjY291bnQgcGF5aW5nIHRoZSB0cmFuc2FjdGlvbiBmZWUuXG4gICAqL1xuICBjcmVhdGVCbG9ja2NoYWluID0gYXN5bmMgKFxuICAgIHVzZXJuYW1lOiBzdHJpbmcsXG4gICAgcGFzc3dvcmQ6IHN0cmluZyxcbiAgICBzdWJuZXRJRDogQnVmZmVyIHwgc3RyaW5nID0gdW5kZWZpbmVkLFxuICAgIHZtSUQ6IHN0cmluZyxcbiAgICBmeElEczogbnVtYmVyW10sXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGdlbmVzaXM6IHN0cmluZyxcbiAgKVxuICAgIDogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBmeElEcyxcbiAgICAgIHZtSUQsXG4gICAgICBuYW1lLFxuICAgICAgZ2VuZXNpc0RhdGE6IGdlbmVzaXMsXG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc3VibmV0SUQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IHN1Ym5ldElEXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc3VibmV0SUQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IGJpbnRvb2xzLmNiNThFbmNvZGUoc3VibmV0SUQpXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwicGxhdGZvcm0uY3JlYXRlQmxvY2tjaGFpblwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SURcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBzdGF0dXMgb2YgYSBibG9ja2NoYWluLlxuICAgKlxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIFRoZSBibG9ja2NoYWluSUQgcmVxdWVzdGluZyBhIHN0YXR1cyB1cGRhdGVcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYSBzdHJpbmcgb2Ygb25lIG9mOiBcIlZhbGlkYXRpbmdcIiwgXCJDcmVhdGVkXCIsIFwiUHJlZmVycmVkXCIsIFwiVW5rbm93blwiLlxuICAgKi9cbiAgZ2V0QmxvY2tjaGFpblN0YXR1cyA9IGFzeW5jIChibG9ja2NoYWluSUQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICBibG9ja2NoYWluSUQsXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwicGxhdGZvcm0uZ2V0QmxvY2tjaGFpblN0YXR1c1wiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnN0YXR1c1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBhZGRyZXNzIGluIHRoZSBub2RlJ3Mga2V5c3RvcmUuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgdXNlcm5hbWUgb2YgdGhlIEtleXN0b3JlIHVzZXIgdGhhdCBjb250cm9scyB0aGUgbmV3IGFjY291bnRcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvZiB0aGUgS2V5c3RvcmUgdXNlciB0aGF0IGNvbnRyb2xzIHRoZSBuZXcgYWNjb3VudFxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhIHN0cmluZyBvZiB0aGUgbmV3bHkgY3JlYXRlZCBhY2NvdW50IGFkZHJlc3MuXG4gICAqL1xuICBjcmVhdGVBZGRyZXNzID0gYXN5bmMgKFxuICAgIHVzZXJuYW1lOiBzdHJpbmcsXG4gICAgcGFzc3dvcmQ6IHN0cmluZ1xuICApXG4gICAgOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5jcmVhdGVBZGRyZXNzXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuYWRkcmVzc1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGJhbGFuY2Ugb2YgYSBwYXJ0aWN1bGFyIGFzc2V0LlxuICAgKlxuICAgKiBAcGFyYW0gYWRkcmVzcyBUaGUgYWRkcmVzcyB0byBwdWxsIHRoZSBhc3NldCBiYWxhbmNlIGZyb21cbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSB3aXRoIHRoZSBiYWxhbmNlIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gb24gdGhlIHByb3ZpZGVkIGFkZHJlc3MuXG4gICAqL1xuICBnZXRCYWxhbmNlID0gYXN5bmMgKGFkZHJlc3M6IHN0cmluZyk6IFByb21pc2U8b2JqZWN0PiA9PiB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnBhcnNlQWRkcmVzcyhhZGRyZXNzKSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBBZGRyZXNzRXJyb3IoXCJFcnJvciAtIFBsYXRmb3JtVk1BUEkuZ2V0QmFsYW5jZTogSW52YWxpZCBhZGRyZXNzIGZvcm1hdFwiKVxuICAgIH1cbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIGFkZHJlc3NcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5nZXRCYWxhbmNlXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0IHRoZSBhZGRyZXNzZXMgY29udHJvbGxlZCBieSB0aGUgdXNlci5cbiAgICpcbiAgICogQHBhcmFtIHVzZXJuYW1lIFRoZSB1c2VybmFtZSBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIG9mIHRoZSBLZXlzdG9yZSB1c2VyXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIGFkZHJlc3Nlcy5cbiAgICovXG4gIGxpc3RBZGRyZXNzZXMgPSBhc3luYyAodXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmRcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5saXN0QWRkcmVzc2VzXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuYWRkcmVzc2VzXG4gIH1cblxuICAvKipcbiAgICogTGlzdHMgdGhlIHNldCBvZiBjdXJyZW50IHZhbGlkYXRvcnMuXG4gICAqXG4gICAqIEBwYXJhbSBzdWJuZXRJRCBPcHRpb25hbC4gRWl0aGVyIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gb3IgYW5cbiAgICogY2I1OCBzZXJpYWxpemVkIHN0cmluZyBmb3IgdGhlIFN1Ym5ldElEIG9yIGl0cyBhbGlhcy5cbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgdmFsaWRhdG9ycyB0aGF0IGFyZSBjdXJyZW50bHkgc3Rha2luZywgc2VlOiB7QGxpbmsgaHR0cHM6Ly9kb2NzLmF2YXgubmV0d29yay92MS4wL2VuL2FwaS9wbGF0Zm9ybS8jcGxhdGZvcm1nZXRjdXJyZW50dmFsaWRhdG9yc3xwbGF0Zm9ybS5nZXRDdXJyZW50VmFsaWRhdG9ycyBkb2N1bWVudGF0aW9ufS5cbiAgICpcbiAgICovXG4gIGdldEN1cnJlbnRWYWxpZGF0b3JzID0gYXN5bmMgKHN1Ym5ldElEOiBCdWZmZXIgfCBzdHJpbmcgPSB1bmRlZmluZWQpOiBQcm9taXNlPG9iamVjdD4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge31cbiAgICBpZiAodHlwZW9mIHN1Ym5ldElEID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBzdWJuZXRJRFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHN1Ym5ldElEICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBiaW50b29scy5jYjU4RW5jb2RlKHN1Ym5ldElEKVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcInBsYXRmb3JtLmdldEN1cnJlbnRWYWxpZGF0b3JzXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgKiBMaXN0cyB0aGUgc2V0IG9mIHBlbmRpbmcgdmFsaWRhdG9ycy5cbiAgICpcbiAgICogQHBhcmFtIHN1Ym5ldElEIE9wdGlvbmFsLiBFaXRoZXIgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfVxuICAgKiBvciBhIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgZm9yIHRoZSBTdWJuZXRJRCBvciBpdHMgYWxpYXMuXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIHZhbGlkYXRvcnMgdGhhdCBhcmUgcGVuZGluZyBzdGFraW5nLCBzZWU6IHtAbGluayBodHRwczovL2RvY3MuYXZheC5uZXR3b3JrL3YxLjAvZW4vYXBpL3BsYXRmb3JtLyNwbGF0Zm9ybWdldHBlbmRpbmd2YWxpZGF0b3JzfHBsYXRmb3JtLmdldFBlbmRpbmdWYWxpZGF0b3JzIGRvY3VtZW50YXRpb259LlxuICAgKlxuICAgKi9cbiAgZ2V0UGVuZGluZ1ZhbGlkYXRvcnMgPSBhc3luYyAoc3VibmV0SUQ6IEJ1ZmZlciB8IHN0cmluZyA9IHVuZGVmaW5lZCk6IFByb21pc2U8b2JqZWN0PiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7fVxuICAgIGlmICh0eXBlb2Ygc3VibmV0SUQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IHN1Ym5ldElEXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc3VibmV0SUQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHBhcmFtcy5zdWJuZXRJRCA9IGJpbnRvb2xzLmNiNThFbmNvZGUoc3VibmV0SUQpXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5nZXRQZW5kaW5nVmFsaWRhdG9yc1wiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogU2FtcGxlcyBgU2l6ZWAgdmFsaWRhdG9ycyBmcm9tIHRoZSBjdXJyZW50IHZhbGlkYXRvciBzZXQuXG4gICAqXG4gICAqIEBwYXJhbSBzYW1wbGVTaXplIE9mIHRoZSB0b3RhbCB1bml2ZXJzZSBvZiB2YWxpZGF0b3JzLCBzZWxlY3QgdGhpcyBtYW55IGF0IHJhbmRvbVxuICAgKiBAcGFyYW0gc3VibmV0SUQgT3B0aW9uYWwuIEVpdGhlciBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9yIGFuXG4gICAqIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgZm9yIHRoZSBTdWJuZXRJRCBvciBpdHMgYWxpYXMuXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIHZhbGlkYXRvclwicyBzdGFraW5nSURzLlxuICAgKi9cbiAgc2FtcGxlVmFsaWRhdG9ycyA9IGFzeW5jIChzYW1wbGVTaXplOiBudW1iZXIsXG4gICAgc3VibmV0SUQ6IEJ1ZmZlciB8IHN0cmluZyA9IHVuZGVmaW5lZClcbiAgICA6IFByb21pc2U8c3RyaW5nW10+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHNpemU6IHNhbXBsZVNpemUudG9TdHJpbmcoKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHN1Ym5ldElEID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBzdWJuZXRJRFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHN1Ym5ldElEICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBiaW50b29scy5jYjU4RW5jb2RlKHN1Ym5ldElEKVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcInBsYXRmb3JtLnNhbXBsZVZhbGlkYXRvcnNcIiwgcGFyYW1zKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC52YWxpZGF0b3JzXG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgdmFsaWRhdG9yIHRvIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgdXNlcm5hbWUgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgKiBAcGFyYW0gbm9kZUlEIFRoZSBub2RlIElEIG9mIHRoZSB2YWxpZGF0b3JcbiAgICogQHBhcmFtIHN0YXJ0VGltZSBKYXZhc2NyaXB0IERhdGUgb2JqZWN0IGZvciB0aGUgc3RhcnQgdGltZSB0byB2YWxpZGF0ZVxuICAgKiBAcGFyYW0gZW5kVGltZSBKYXZhc2NyaXB0IERhdGUgb2JqZWN0IGZvciB0aGUgZW5kIHRpbWUgdG8gdmFsaWRhdGVcbiAgICogQHBhcmFtIHN0YWtlQW1vdW50IFRoZSBhbW91bnQgb2YgbkFWQVggdGhlIHZhbGlkYXRvciBpcyBzdGFraW5nIGFzXG4gICAqIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIHJld2FyZEFkZHJlc3MgVGhlIGFkZHJlc3MgdGhlIHZhbGlkYXRvciByZXdhcmQgd2lsbCBnbyB0bywgaWYgdGhlcmUgaXMgb25lLlxuICAgKiBAcGFyYW0gZGVsZWdhdGlvbkZlZVJhdGUgT3B0aW9uYWwuIEEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gZm9yIHRoZSBwZXJjZW50IGZlZSB0aGlzIHZhbGlkYXRvclxuICAgKiBjaGFyZ2VzIHdoZW4gb3RoZXJzIGRlbGVnYXRlIHN0YWtlIHRvIHRoZW0uIFVwIHRvIDQgZGVjaW1hbCBwbGFjZXMgYWxsb3dlZCBhZGRpdGlvbmFsIGRlY2ltYWwgcGxhY2VzIGFyZSBpZ25vcmVkLlxuICAgKiBNdXN0IGJlIGJldHdlZW4gMCBhbmQgMTAwLCBpbmNsdXNpdmUuIEZvciBleGFtcGxlLCBpZiBkZWxlZ2F0aW9uRmVlUmF0ZSBpcyAxLjIzNDUgYW5kIHNvbWVvbmUgZGVsZWdhdGVzIHRvIHRoaXNcbiAgICogdmFsaWRhdG9yLCB0aGVuIHdoZW4gdGhlIGRlbGVnYXRpb24gcGVyaW9kIGlzIG92ZXIsIDEuMjM0NSUgb2YgdGhlIHJld2FyZCBnb2VzIHRvIHRoZSB2YWxpZGF0b3IgYW5kIHRoZSByZXN0IGdvZXNcbiAgICogdG8gdGhlIGRlbGVnYXRvci5cbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYSBiYXNlNTggc3RyaW5nIG9mIHRoZSB1bnNpZ25lZCB0cmFuc2FjdGlvbi5cbiAgICovXG4gIGFkZFZhbGlkYXRvciA9IGFzeW5jIChcbiAgICB1c2VybmFtZTogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICAgbm9kZUlEOiBzdHJpbmcsXG4gICAgc3RhcnRUaW1lOiBEYXRlLFxuICAgIGVuZFRpbWU6IERhdGUsXG4gICAgc3Rha2VBbW91bnQ6IEJOLFxuICAgIHJld2FyZEFkZHJlc3M6IHN0cmluZyxcbiAgICBkZWxlZ2F0aW9uRmVlUmF0ZTogQk4gPSB1bmRlZmluZWRcbiAgKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBub2RlSUQsXG4gICAgICBzdGFydFRpbWU6IHN0YXJ0VGltZS5nZXRUaW1lKCkgLyAxMDAwLFxuICAgICAgZW5kVGltZTogZW5kVGltZS5nZXRUaW1lKCkgLyAxMDAwLFxuICAgICAgc3Rha2VBbW91bnQ6IHN0YWtlQW1vdW50LnRvU3RyaW5nKDEwKSxcbiAgICAgIHJld2FyZEFkZHJlc3MsXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZGVsZWdhdGlvbkZlZVJhdGUgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHBhcmFtcy5kZWxlZ2F0aW9uRmVlUmF0ZSA9IGRlbGVnYXRpb25GZWVSYXRlLnRvU3RyaW5nKDEwKVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcInBsYXRmb3JtLmFkZFZhbGlkYXRvclwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SURcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSB2YWxpZGF0b3IgdG8gYSBTdWJuZXQgb3RoZXIgdGhhbiB0aGUgUHJpbWFyeSBOZXR3b3JrLiBUaGUgdmFsaWRhdG9yIG11c3QgdmFsaWRhdGUgdGhlIFByaW1hcnkgTmV0d29yayBmb3IgdGhlIGVudGlyZSBkdXJhdGlvbiB0aGV5IHZhbGlkYXRlIHRoaXMgU3VibmV0LlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXJuYW1lIG9mIHRoZSBLZXlzdG9yZSB1c2VyXG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICogQHBhcmFtIG5vZGVJRCBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yXG4gICAqIEBwYXJhbSBzdWJuZXRJRCBFaXRoZXIgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBhIGNiNTggc2VyaWFsaXplZCBzdHJpbmcgZm9yIHRoZSBTdWJuZXRJRCBvciBpdHMgYWxpYXMuXG4gICAqIEBwYXJhbSBzdGFydFRpbWUgSmF2YXNjcmlwdCBEYXRlIG9iamVjdCBmb3IgdGhlIHN0YXJ0IHRpbWUgdG8gdmFsaWRhdGVcbiAgICogQHBhcmFtIGVuZFRpbWUgSmF2YXNjcmlwdCBEYXRlIG9iamVjdCBmb3IgdGhlIGVuZCB0aW1lIHRvIHZhbGlkYXRlXG4gICAqIEBwYXJhbSB3ZWlnaHQgVGhlIHZhbGlkYXRvcuKAmXMgd2VpZ2h0IHVzZWQgZm9yIHNhbXBsaW5nXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIHRoZSB1bnNpZ25lZCB0cmFuc2FjdGlvbi4gSXQgbXVzdCBiZSBzaWduZWQgKHVzaW5nIHNpZ24pIGJ5IHRoZSBwcm9wZXIgbnVtYmVyIG9mIHRoZSBTdWJuZXTigJlzIGNvbnRyb2wga2V5cyBhbmQgYnkgdGhlIGtleSBvZiB0aGUgYWNjb3VudCBwYXlpbmcgdGhlIHRyYW5zYWN0aW9uIGZlZSBiZWZvcmUgaXQgY2FuIGJlIGlzc3VlZC5cbiAgICovXG4gIGFkZFN1Ym5ldFZhbGlkYXRvciA9IGFzeW5jIChcbiAgICB1c2VybmFtZTogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICAgbm9kZUlEOiBzdHJpbmcsXG4gICAgc3VibmV0SUQ6IEJ1ZmZlciB8IHN0cmluZyxcbiAgICBzdGFydFRpbWU6IERhdGUsXG4gICAgZW5kVGltZTogRGF0ZSxcbiAgICB3ZWlnaHQ6IG51bWJlclxuICApXG4gICAgOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIG5vZGVJRCxcbiAgICAgIHN0YXJ0VGltZTogc3RhcnRUaW1lLmdldFRpbWUoKSAvIDEwMDAsXG4gICAgICBlbmRUaW1lOiBlbmRUaW1lLmdldFRpbWUoKSAvIDEwMDAsXG4gICAgICB3ZWlnaHRcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBzdWJuZXRJRCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgcGFyYW1zLnN1Ym5ldElEID0gc3VibmV0SURcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzdWJuZXRJRCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgcGFyYW1zLnN1Ym5ldElEID0gYmludG9vbHMuY2I1OEVuY29kZShzdWJuZXRJRClcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5hZGRTdWJuZXRWYWxpZGF0b3JcIiwgcGFyYW1zKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC50eElEXG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgZGVsZWdhdG9yIHRvIHRoZSBQcmltYXJ5IE5ldHdvcmsuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgdXNlcm5hbWUgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgKiBAcGFyYW0gbm9kZUlEIFRoZSBub2RlIElEIG9mIHRoZSBkZWxlZ2F0ZWVcbiAgICogQHBhcmFtIHN0YXJ0VGltZSBKYXZhc2NyaXB0IERhdGUgb2JqZWN0IGZvciB3aGVuIHRoZSBkZWxlZ2F0b3Igc3RhcnRzIGRlbGVnYXRpbmdcbiAgICogQHBhcmFtIGVuZFRpbWUgSmF2YXNjcmlwdCBEYXRlIG9iamVjdCBmb3Igd2hlbiB0aGUgZGVsZWdhdG9yIHN0YXJ0cyBkZWxlZ2F0aW5nXG4gICAqIEBwYXJhbSBzdGFrZUFtb3VudCBUaGUgYW1vdW50IG9mIG5BVkFYIHRoZSBkZWxlZ2F0b3IgaXMgc3Rha2luZyBhc1xuICAgKiBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSByZXdhcmRBZGRyZXNzIFRoZSBhZGRyZXNzIG9mIHRoZSBhY2NvdW50IHRoZSBzdGFrZWQgQVZBWCBhbmQgdmFsaWRhdGlvbiByZXdhcmRcbiAgICogKGlmIGFwcGxpY2FibGUpIGFyZSBzZW50IHRvIGF0IGVuZFRpbWVcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgdmFsaWRhdG9yXCJzIHN0YWtpbmdJRHMuXG4gICAqL1xuICBhZGREZWxlZ2F0b3IgPSBhc3luYyAoXG4gICAgdXNlcm5hbWU6IHN0cmluZyxcbiAgICBwYXNzd29yZDogc3RyaW5nLFxuICAgIG5vZGVJRDogc3RyaW5nLFxuICAgIHN0YXJ0VGltZTogRGF0ZSxcbiAgICBlbmRUaW1lOiBEYXRlLFxuICAgIHN0YWtlQW1vdW50OiBCTixcbiAgICByZXdhcmRBZGRyZXNzOiBzdHJpbmcpXG4gICAgOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIG5vZGVJRCxcbiAgICAgIHN0YXJ0VGltZTogc3RhcnRUaW1lLmdldFRpbWUoKSAvIDEwMDAsXG4gICAgICBlbmRUaW1lOiBlbmRUaW1lLmdldFRpbWUoKSAvIDEwMDAsXG4gICAgICBzdGFrZUFtb3VudDogc3Rha2VBbW91bnQudG9TdHJpbmcoMTApLFxuICAgICAgcmV3YXJkQWRkcmVzc1xuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcInBsYXRmb3JtLmFkZERlbGVnYXRvclwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SURcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gdG8gY3JlYXRlIGEgbmV3IFN1Ym5ldC4gVGhlIHVuc2lnbmVkIHRyYW5zYWN0aW9uIG11c3QgYmVcbiAgICogc2lnbmVkIHdpdGggdGhlIGtleSBvZiB0aGUgYWNjb3VudCBwYXlpbmcgdGhlIHRyYW5zYWN0aW9uIGZlZS4gVGhlIFN1Ym5ldOKAmXMgSUQgaXMgdGhlIElEIG9mIHRoZSB0cmFuc2FjdGlvbiB0aGF0IGNyZWF0ZXMgaXQgKGllIHRoZSByZXNwb25zZSBmcm9tIGlzc3VlVHggd2hlbiBpc3N1aW5nIHRoZSBzaWduZWQgdHJhbnNhY3Rpb24pLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXJuYW1lIG9mIHRoZSBLZXlzdG9yZSB1c2VyXG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICogQHBhcmFtIGNvbnRyb2xLZXlzIEFycmF5IG9mIHBsYXRmb3JtIGFkZHJlc3NlcyBhcyBzdHJpbmdzXG4gICAqIEBwYXJhbSB0aHJlc2hvbGQgVG8gYWRkIGEgdmFsaWRhdG9yIHRvIHRoaXMgU3VibmV0LCBhIHRyYW5zYWN0aW9uIG11c3QgaGF2ZSB0aHJlc2hvbGRcbiAgICogc2lnbmF0dXJlcywgd2hlcmUgZWFjaCBzaWduYXR1cmUgaXMgZnJvbSBhIGtleSB3aG9zZSBhZGRyZXNzIGlzIGFuIGVsZW1lbnQgb2YgYGNvbnRyb2xLZXlzYFxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhIHN0cmluZyB3aXRoIHRoZSB1bnNpZ25lZCB0cmFuc2FjdGlvbiBlbmNvZGVkIGFzIGJhc2U1OC5cbiAgICovXG4gIGNyZWF0ZVN1Ym5ldCA9IGFzeW5jIChcbiAgICB1c2VybmFtZTogc3RyaW5nLFxuICAgIHBhc3N3b3JkOiBzdHJpbmcsXG4gICAgY29udHJvbEtleXM6IHN0cmluZ1tdLFxuICAgIHRocmVzaG9sZDogbnVtYmVyXG4gIClcbiAgICA6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgY29udHJvbEtleXMsXG4gICAgICB0aHJlc2hvbGRcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5jcmVhdGVTdWJuZXRcIiwgcGFyYW1zKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC50eElEXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBTdWJuZXQgdGhhdCB2YWxpZGF0ZXMgYSBnaXZlbiBibG9ja2NoYWluLlxuICAgKlxuICAgKiBAcGFyYW0gYmxvY2tjaGFpbklEIEVpdGhlciBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9yIGEgY2I1OFxuICAgKiBlbmNvZGVkIHN0cmluZyBmb3IgdGhlIGJsb2NrY2hhaW5JRCBvciBpdHMgYWxpYXMuXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGEgc3RyaW5nIG9mIHRoZSBzdWJuZXRJRCB0aGF0IHZhbGlkYXRlcyB0aGUgYmxvY2tjaGFpbi5cbiAgICovXG4gIHZhbGlkYXRlZEJ5ID0gYXN5bmMgKGJsb2NrY2hhaW5JRDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIGJsb2NrY2hhaW5JRCxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS52YWxpZGF0ZWRCeVwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnN1Ym5ldElEXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBJRHMgb2YgdGhlIGJsb2NrY2hhaW5zIGEgU3VibmV0IHZhbGlkYXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHN1Ym5ldElEIEVpdGhlciBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IG9yIGFuIEFWQVhcbiAgICogc2VyaWFsaXplZCBzdHJpbmcgZm9yIHRoZSBTdWJuZXRJRCBvciBpdHMgYWxpYXMuXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIGJsb2NrY2hhaW5JRHMgdGhlIHN1Ym5ldCB2YWxpZGF0ZXMuXG4gICAqL1xuICB2YWxpZGF0ZXMgPSBhc3luYyAoc3VibmV0SUQ6IEJ1ZmZlciB8IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHN1Ym5ldElELFxuICAgIH1cbiAgICBpZiAodHlwZW9mIHN1Ym5ldElEID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBzdWJuZXRJRFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHN1Ym5ldElEICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBwYXJhbXMuc3VibmV0SUQgPSBiaW50b29scy5jYjU4RW5jb2RlKHN1Ym5ldElEKVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcInBsYXRmb3JtLnZhbGlkYXRlc1wiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LmJsb2NrY2hhaW5JRHNcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIHRoZSBibG9ja2NoYWlucyB0aGF0IGV4aXN0IChleGNsdWRpbmcgdGhlIFAtQ2hhaW4pLlxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhbiBhcnJheSBvZiBvYmplY3RzIGNvbnRhaW5pbmcgZmllbGRzIFwiaWRcIiwgXCJzdWJuZXRJRFwiLCBhbmQgXCJ2bUlEXCIuXG4gICAqL1xuICBnZXRCbG9ja2NoYWlucyA9IGFzeW5jICgpOiBQcm9taXNlPG9iamVjdFtdPiA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5nZXRCbG9ja2NoYWluc1wiKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5ibG9ja2NoYWluc1xuICB9XG5cbiAgLyoqXG4gICAqIFNlbmQgQVZBWCBmcm9tIGFuIGFjY291bnQgb24gdGhlIFAtQ2hhaW4gdG8gYW4gYWRkcmVzcyBvbiB0aGUgWC1DaGFpbi4gVGhpcyB0cmFuc2FjdGlvblxuICAgKiBtdXN0IGJlIHNpZ25lZCB3aXRoIHRoZSBrZXkgb2YgdGhlIGFjY291bnQgdGhhdCB0aGUgQVZBWCBpcyBzZW50IGZyb20gYW5kIHdoaWNoIHBheXMgdGhlXG4gICAqIHRyYW5zYWN0aW9uIGZlZS4gQWZ0ZXIgaXNzdWluZyB0aGlzIHRyYW5zYWN0aW9uLCB5b3UgbXVzdCBjYWxsIHRoZSBYLUNoYWlu4oCZcyBpbXBvcnRBVkFYXG4gICAqIG1ldGhvZCB0byBjb21wbGV0ZSB0aGUgdHJhbnNmZXIuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgS2V5c3RvcmUgdXNlciB0aGF0IGNvbnRyb2xzIHRoZSBhY2NvdW50IHNwZWNpZmllZCBpbiBgdG9gXG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICogQHBhcmFtIHRvIFRoZSBhZGRyZXNzIG9uIHRoZSBYLUNoYWluIHRvIHNlbmQgdGhlIEFWQVggdG8uIERvIG5vdCBpbmNsdWRlIFgtIGluIHRoZSBhZGRyZXNzXG4gICAqIEBwYXJhbSBhbW91bnQgQW1vdW50IG9mIEFWQVggdG8gZXhwb3J0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gdG8gYmUgc2lnbmVkIGJ5IHRoZSBhY2NvdW50IHRoZSB0aGUgQVZBWCBpc1xuICAgKiBzZW50IGZyb20gYW5kIHBheXMgdGhlIHRyYW5zYWN0aW9uIGZlZS5cbiAgICovXG4gIGV4cG9ydEFWQVggPSBhc3luYyAodXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZywgYW1vdW50OiBCTiwgdG86IHN0cmluZywpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIHRvLFxuICAgICAgYW1vdW50OiBhbW91bnQudG9TdHJpbmcoMTApXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwicGxhdGZvcm0uZXhwb3J0QVZBWFwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SURcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIEFWQVggZnJvbSBhbiBhY2NvdW50IG9uIHRoZSBQLUNoYWluIHRvIGFuIGFkZHJlc3Mgb24gdGhlIFgtQ2hhaW4uIFRoaXMgdHJhbnNhY3Rpb25cbiAgICogbXVzdCBiZSBzaWduZWQgd2l0aCB0aGUga2V5IG9mIHRoZSBhY2NvdW50IHRoYXQgdGhlIEFWQVggaXMgc2VudCBmcm9tIGFuZCB3aGljaCBwYXlzXG4gICAqIHRoZSB0cmFuc2FjdGlvbiBmZWUuIEFmdGVyIGlzc3VpbmcgdGhpcyB0cmFuc2FjdGlvbiwgeW91IG11c3QgY2FsbCB0aGUgWC1DaGFpbuKAmXNcbiAgICogaW1wb3J0QVZBWCBtZXRob2QgdG8gY29tcGxldGUgdGhlIHRyYW5zZmVyLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIEtleXN0b3JlIHVzZXIgdGhhdCBjb250cm9scyB0aGUgYWNjb3VudCBzcGVjaWZpZWQgaW4gYHRvYFxuICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIG9mIHRoZSBLZXlzdG9yZSB1c2VyXG4gICAqIEBwYXJhbSB0byBUaGUgSUQgb2YgdGhlIGFjY291bnQgdGhlIEFWQVggaXMgc2VudCB0by4gVGhpcyBtdXN0IGJlIHRoZSBzYW1lIGFzIHRoZSB0b1xuICAgKiBhcmd1bWVudCBpbiB0aGUgY29ycmVzcG9uZGluZyBjYWxsIHRvIHRoZSBYLUNoYWlu4oCZcyBleHBvcnRBVkFYXG4gICAqIEBwYXJhbSBzb3VyY2VDaGFpbiBUaGUgY2hhaW5JRCB3aGVyZSB0aGUgZnVuZHMgYXJlIGNvbWluZyBmcm9tLlxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIGZvciBhIHN0cmluZyBmb3IgdGhlIHRyYW5zYWN0aW9uLCB3aGljaCBzaG91bGQgYmUgc2VudCB0byB0aGUgbmV0d29ya1xuICAgKiBieSBjYWxsaW5nIGlzc3VlVHguXG4gICAqL1xuICBpbXBvcnRBVkFYID0gYXN5bmMgKHVzZXJuYW1lOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIHRvOiBzdHJpbmcsIHNvdXJjZUNoYWluOiBzdHJpbmcpXG4gICAgOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgdG8sXG4gICAgICBzb3VyY2VDaGFpbixcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmRcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5pbXBvcnRBVkFYXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQudHhJRFxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIHRoZSBub2RlJ3MgaXNzdWVUeCBtZXRob2QgZnJvbSB0aGUgQVBJIGFuZCByZXR1cm5zIHRoZSByZXN1bHRpbmcgdHJhbnNhY3Rpb24gSUQgYXMgYSBzdHJpbmcuXG4gICAqXG4gICAqIEBwYXJhbSB0eCBBIHN0cmluZywge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0sIG9yIFtbVHhdXSByZXByZXNlbnRpbmcgYSB0cmFuc2FjdGlvblxuICAgKlxuICAgKiBAcmV0dXJucyBBIFByb21pc2U8c3RyaW5nPiByZXByZXNlbnRpbmcgdGhlIHRyYW5zYWN0aW9uIElEIG9mIHRoZSBwb3N0ZWQgdHJhbnNhY3Rpb24uXG4gICAqL1xuICBpc3N1ZVR4ID0gYXN5bmMgKHR4OiBzdHJpbmcgfCBCdWZmZXIgfCBUeCk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgbGV0IFRyYW5zYWN0aW9uID0gXCJcIlxuICAgIGlmICh0eXBlb2YgdHggPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIFRyYW5zYWN0aW9uID0gdHhcbiAgICB9IGVsc2UgaWYgKHR4IGluc3RhbmNlb2YgQnVmZmVyKSB7XG4gICAgICBjb25zdCB0eG9iajogVHggPSBuZXcgVHgoKVxuICAgICAgdHhvYmouZnJvbUJ1ZmZlcih0eClcbiAgICAgIFRyYW5zYWN0aW9uID0gdHhvYmoudG9TdHJpbmcoKVxuICAgIH0gZWxzZSBpZiAodHggaW5zdGFuY2VvZiBUeCkge1xuICAgICAgVHJhbnNhY3Rpb24gPSB0eC50b1N0cmluZygpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgVHJhbnNhY3Rpb25FcnJvcihcIkVycm9yIC0gcGxhdGZvcm0uaXNzdWVUeDogcHJvdmlkZWQgdHggaXMgbm90IGV4cGVjdGVkIHR5cGUgb2Ygc3RyaW5nLCBCdWZmZXIsIG9yIFR4XCIpXG4gICAgfVxuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgdHg6IFRyYW5zYWN0aW9uLnRvU3RyaW5nKClcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5pc3N1ZVR4XCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQudHhJRFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gdXBwZXIgYm91bmQgb24gdGhlIGFtb3VudCBvZiB0b2tlbnMgdGhhdCBleGlzdC4gTm90IG1vbm90b25pY2FsbHkgaW5jcmVhc2luZyBiZWNhdXNlIHRoaXMgbnVtYmVyIGNhbiBnbyBkb3duIGlmIGEgc3Rha2VyXCJzIHJld2FyZCBpcyBkZW5pZWQuXG4gICAqL1xuICBnZXRDdXJyZW50U3VwcGx5ID0gYXN5bmMgKCk6IFByb21pc2U8Qk4+ID0+IHtcbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcInBsYXRmb3JtLmdldEN1cnJlbnRTdXBwbHlcIilcbiAgICByZXR1cm4gbmV3IEJOKHJlc3BvbnNlLmRhdGEucmVzdWx0LnN1cHBseSwgMTApXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgaGVpZ2h0IG9mIHRoZSBwbGF0Zm9ybSBjaGFpbi5cbiAgICovXG4gIGdldEhlaWdodCA9IGFzeW5jICgpOiBQcm9taXNlPEJOPiA9PiB7XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5nZXRIZWlnaHRcIilcbiAgICByZXR1cm4gbmV3IEJOKHJlc3BvbnNlLmRhdGEucmVzdWx0LmhlaWdodCwgMTApXG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgbWluaW11bSBzdGFraW5nIGFtb3VudC5cbiAgICpcbiAgICogQHBhcmFtIHJlZnJlc2ggQSBib29sZWFuIHRvIGJ5cGFzcyB0aGUgbG9jYWwgY2FjaGVkIHZhbHVlIG9mIE1pbmltdW0gU3Rha2UgQW1vdW50LCBwb2xsaW5nIHRoZSBub2RlIGluc3RlYWQuXG4gICAqL1xuICBnZXRNaW5TdGFrZSA9IGFzeW5jIChyZWZyZXNoOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPHsgbWluVmFsaWRhdG9yU3Rha2U6IEJOLCBtaW5EZWxlZ2F0b3JTdGFrZTogQk4gfT4gPT4ge1xuICAgIGlmIChyZWZyZXNoICE9PSB0cnVlICYmIHR5cGVvZiB0aGlzLm1pblZhbGlkYXRvclN0YWtlICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiB0aGlzLm1pbkRlbGVnYXRvclN0YWtlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtaW5WYWxpZGF0b3JTdGFrZTogdGhpcy5taW5WYWxpZGF0b3JTdGFrZSxcbiAgICAgICAgbWluRGVsZWdhdG9yU3Rha2U6IHRoaXMubWluRGVsZWdhdG9yU3Rha2VcbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5nZXRNaW5TdGFrZVwiKVxuICAgIHRoaXMubWluVmFsaWRhdG9yU3Rha2UgPSBuZXcgQk4ocmVzcG9uc2UuZGF0YS5yZXN1bHQubWluVmFsaWRhdG9yU3Rha2UsIDEwKVxuICAgIHRoaXMubWluRGVsZWdhdG9yU3Rha2UgPSBuZXcgQk4ocmVzcG9uc2UuZGF0YS5yZXN1bHQubWluRGVsZWdhdG9yU3Rha2UsIDEwKVxuICAgIHJldHVybiB7XG4gICAgICBtaW5WYWxpZGF0b3JTdGFrZTogdGhpcy5taW5WYWxpZGF0b3JTdGFrZSxcbiAgICAgIG1pbkRlbGVnYXRvclN0YWtlOiB0aGlzLm1pbkRlbGVnYXRvclN0YWtlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIG1pbmltdW0gc3Rha2UgY2FjaGVkIGluIHRoaXMgY2xhc3MuXG4gICAqIEBwYXJhbSBtaW5WYWxpZGF0b3JTdGFrZSBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHRvIHNldCB0aGUgbWluaW11bSBzdGFrZSBhbW91bnQgY2FjaGVkIGluIHRoaXMgY2xhc3MuXG4gICAqIEBwYXJhbSBtaW5EZWxlZ2F0b3JTdGFrZSBBIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IHRvIHNldCB0aGUgbWluaW11bSBkZWxlZ2F0aW9uIGFtb3VudCBjYWNoZWQgaW4gdGhpcyBjbGFzcy5cbiAgICovXG4gIHNldE1pblN0YWtlID0gKG1pblZhbGlkYXRvclN0YWtlOiBCTiA9IHVuZGVmaW5lZCwgbWluRGVsZWdhdG9yU3Rha2U6IEJOID0gdW5kZWZpbmVkKTogdm9pZCA9PiB7XG4gICAgaWYgKHR5cGVvZiBtaW5WYWxpZGF0b3JTdGFrZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgdGhpcy5taW5WYWxpZGF0b3JTdGFrZSA9IG1pblZhbGlkYXRvclN0YWtlXG4gICAgfVxuICAgIGlmICh0eXBlb2YgbWluRGVsZWdhdG9yU3Rha2UgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMubWluRGVsZWdhdG9yU3Rha2UgPSBtaW5EZWxlZ2F0b3JTdGFrZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSB0b3RhbCBhbW91bnQgc3Rha2VkIGZvciBhbiBhcnJheSBvZiBhZGRyZXNzZXMuXG4gICAqL1xuICBnZXRTdGFrZSA9IGFzeW5jIChhZGRyZXNzZXM6IHN0cmluZ1tdLCBlbmNvZGluZzogc3RyaW5nID0gXCJjYjU4XCIpOiBQcm9taXNlPEdldFN0YWtlUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IEdldFN0YWtlUGFyYW1zID0ge1xuICAgICAgYWRkcmVzc2VzLFxuICAgICAgZW5jb2RpbmdcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5nZXRTdGFrZVwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YWtlZDogbmV3IEJOKHJlc3BvbnNlLmRhdGEucmVzdWx0LnN0YWtlZCwgMTApLFxuICAgICAgc3Rha2VkT3V0cHV0czogcmVzcG9uc2UuZGF0YS5yZXN1bHQuc3Rha2VkT3V0cHV0cy5tYXAoKHN0YWtlZE91dHB1dDogc3RyaW5nKTogVHJhbnNmZXJhYmxlT3V0cHV0ID0+IHtcbiAgICAgICAgY29uc3QgdHJhbnNmZXJhYmxlT3V0cHV0OiBUcmFuc2ZlcmFibGVPdXRwdXQgPSBuZXcgVHJhbnNmZXJhYmxlT3V0cHV0KClcbiAgICAgICAgbGV0IGJ1ZjogQnVmZmVyXG4gICAgICAgIGlmKGVuY29kaW5nID09PSBcImNiNThcIikge1xuICAgICAgICAgIGJ1ZiA9IGJpbnRvb2xzLmNiNThEZWNvZGUoc3Rha2VkT3V0cHV0KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJ1ZiA9IEJ1ZmZlci5mcm9tKHN0YWtlZE91dHB1dC5yZXBsYWNlKC8weC9nLCBcIlwiKSwgXCJoZXhcIilcbiAgICAgICAgfVxuICAgICAgICB0cmFuc2ZlcmFibGVPdXRwdXQuZnJvbUJ1ZmZlcihidWYsIDIpXG4gICAgICAgIHJldHVybiB0cmFuc2ZlcmFibGVPdXRwdXRcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgdGhlIHN1Ym5ldHMgdGhhdCBleGlzdC5cbiAgICpcbiAgICogQHBhcmFtIGlkcyBJRHMgb2YgdGhlIHN1Ym5ldHMgdG8gcmV0cmlldmUgaW5mb3JtYXRpb24gYWJvdXQuIElmIG9taXR0ZWQsIGdldHMgYWxsIHN1Ym5ldHNcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYW4gYXJyYXkgb2Ygb2JqZWN0cyBjb250YWluaW5nIGZpZWxkcyBcImlkXCIsXG4gICAqIFwiY29udHJvbEtleXNcIiwgYW5kIFwidGhyZXNob2xkXCIuXG4gICAqL1xuICBnZXRTdWJuZXRzID0gYXN5bmMgKGlkczogc3RyaW5nW10gPSB1bmRlZmluZWQpOiBQcm9taXNlPG9iamVjdFtdPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7fVxuICAgIGlmICh0eXBlb2YgaWRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHBhcmFtcy5pZHMgPSBpZHNcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5nZXRTdWJuZXRzXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuc3VibmV0c1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9ydHMgdGhlIHByaXZhdGUga2V5IGZvciBhbiBhZGRyZXNzLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIG5hbWUgb2YgdGhlIHVzZXIgd2l0aCB0aGUgcHJpdmF0ZSBrZXlcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCB1c2VkIHRvIGRlY3J5cHQgdGhlIHByaXZhdGUga2V5XG4gICAqIEBwYXJhbSBhZGRyZXNzIFRoZSBhZGRyZXNzIHdob3NlIHByaXZhdGUga2V5IHNob3VsZCBiZSBleHBvcnRlZFxuICAgKlxuICAgKiBAcmV0dXJucyBQcm9taXNlIHdpdGggdGhlIGRlY3J5cHRlZCBwcml2YXRlIGtleSBhcyBzdG9yZSBpbiB0aGUgZGF0YWJhc2VcbiAgICovXG4gIGV4cG9ydEtleSA9IGFzeW5jICh1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBhZGRyZXNzOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIGFkZHJlc3NcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5leHBvcnRLZXlcIiwgcGFyYW1zKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5wcml2YXRlS2V5XG4gIH1cblxuICAvKipcbiAgICogR2l2ZSBhIHVzZXIgY29udHJvbCBvdmVyIGFuIGFkZHJlc3MgYnkgcHJvdmlkaW5nIHRoZSBwcml2YXRlIGtleSB0aGF0IGNvbnRyb2xzIHRoZSBhZGRyZXNzLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIG5hbWUgb2YgdGhlIHVzZXIgdG8gc3RvcmUgdGhlIHByaXZhdGUga2V5XG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgdGhhdCB1bmxvY2tzIHRoZSB1c2VyXG4gICAqIEBwYXJhbSBwcml2YXRlS2V5IEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgcHJpdmF0ZSBrZXkgaW4gdGhlIHZtXCJzIGZvcm1hdFxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgYWRkcmVzcyBmb3IgdGhlIGltcG9ydGVkIHByaXZhdGUga2V5LlxuICAgKi9cbiAgaW1wb3J0S2V5ID0gYXN5bmMgKHVzZXJuYW1lOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIHByaXZhdGVLZXk6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgcHJpdmF0ZUtleVxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcInBsYXRmb3JtLmltcG9ydEtleVwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LmFkZHJlc3NcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0cmVhbnNhY3Rpb24gZGF0YSBvZiBhIHByb3ZpZGVkIHRyYW5zYWN0aW9uIElEIGJ5IGNhbGxpbmcgdGhlIG5vZGUncyBgZ2V0VHhgIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIHR4aWQgVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHJhbnNhY3Rpb24gSURcbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2U8c3RyaW5nPiBjb250YWluaW5nIHRoZSBieXRlcyByZXRyaWV2ZWQgZnJvbSB0aGUgbm9kZVxuICAgKi9cbiAgZ2V0VHggPSBhc3luYyAodHhpZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHR4SUQ6IHR4aWRcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5nZXRUeFwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3RhdHVzIG9mIGEgcHJvdmlkZWQgdHJhbnNhY3Rpb24gSUQgYnkgY2FsbGluZyB0aGUgbm9kZSdzIGBnZXRUeFN0YXR1c2AgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0gdHhpZCBUaGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB0cmFuc2FjdGlvbiBJRFxuICAgKiBAcGFyYW0gaW5jbHVkZVJlYXNvbiBSZXR1cm4gdGhlIHJlYXNvbiB0eCB3YXMgZHJvcHBlZCwgaWYgYXBwbGljYWJsZS4gRGVmYXVsdHMgdG8gdHJ1ZVxuICAgKlxuICAgKiBAcmV0dXJucyBSZXR1cm5zIGEgUHJvbWlzZTxzdHJpbmc+IGNvbnRhaW5pbmcgdGhlIHN0YXR1cyByZXRyaWV2ZWQgZnJvbSB0aGUgbm9kZSBhbmQgdGhlIHJlYXNvbiBhIHR4IHdhcyBkcm9wcGVkLCBpZiBhcHBsaWNhYmxlLlxuICAgKi9cbiAgZ2V0VHhTdGF0dXMgPSBhc3luYyAodHhpZDogc3RyaW5nLCBpbmNsdWRlUmVhc29uOiBib29sZWFuID0gdHJ1ZSk6IFByb21pc2U8c3RyaW5nIHwgeyBzdGF0dXM6IHN0cmluZywgcmVhc29uOiBzdHJpbmcgfT4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgdHhJRDogdHhpZCxcbiAgICAgIGluY2x1ZGVSZWFzb246IGluY2x1ZGVSZWFzb25cbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJwbGF0Zm9ybS5nZXRUeFN0YXR1c1wiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBVVFhPcyByZWxhdGVkIHRvIHRoZSBhZGRyZXNzZXMgcHJvdmlkZWQgZnJvbSB0aGUgbm9kZSdzIGBnZXRVVFhPc2AgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0gYWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyBjYjU4IHN0cmluZ3Mgb3IgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9c1xuICAgKiBAcGFyYW0gc291cmNlQ2hhaW4gQSBzdHJpbmcgZm9yIHRoZSBjaGFpbiB0byBsb29rIGZvciB0aGUgVVRYT1wicy4gRGVmYXVsdCBpcyB0byB1c2UgdGhpcyBjaGFpbiwgYnV0IGlmIGV4cG9ydGVkIFVUWE9zIGV4aXN0IGZyb20gb3RoZXIgY2hhaW5zLCB0aGlzIGNhbiB1c2VkIHRvIHB1bGwgdGhlbSBpbnN0ZWFkLlxuICAgKiBAcGFyYW0gbGltaXQgT3B0aW9uYWwuIFJldHVybnMgYXQgbW9zdCBbbGltaXRdIGFkZHJlc3Nlcy4gSWYgW2xpbWl0XSA9PSAwIG9yID4gW21heFVUWE9zVG9GZXRjaF0sIGZldGNoZXMgdXAgdG8gW21heFVUWE9zVG9GZXRjaF0uXG4gICAqIEBwYXJhbSBzdGFydEluZGV4IE9wdGlvbmFsLiBbU3RhcnRJbmRleF0gZGVmaW5lcyB3aGVyZSB0byBzdGFydCBmZXRjaGluZyBVVFhPcyAoZm9yIHBhZ2luYXRpb24uKVxuICAgKiBVVFhPcyBmZXRjaGVkIGFyZSBmcm9tIGFkZHJlc3NlcyBlcXVhbCB0byBvciBncmVhdGVyIHRoYW4gW1N0YXJ0SW5kZXguQWRkcmVzc11cbiAgICogRm9yIGFkZHJlc3MgW1N0YXJ0SW5kZXguQWRkcmVzc10sIG9ubHkgVVRYT3Mgd2l0aCBJRHMgZ3JlYXRlciB0aGFuIFtTdGFydEluZGV4LlV0eG9dIHdpbGwgYmUgcmV0dXJuZWQuXG4gICAqIEBwYXJhbSBwZXJzaXN0T3B0cyBPcHRpb25zIGF2YWlsYWJsZSB0byBwZXJzaXN0IHRoZXNlIFVUWE9zIGluIGxvY2FsIHN0b3JhZ2VcbiAgICpcbiAgICogQHJlbWFya3NcbiAgICogcGVyc2lzdE9wdHMgaXMgb3B0aW9uYWwgYW5kIG11c3QgYmUgb2YgdHlwZSBbW1BlcnNpc3RhbmNlT3B0aW9uc11dXG4gICAqXG4gICAqL1xuICBnZXRVVFhPcyA9IGFzeW5jIChcbiAgICBhZGRyZXNzZXM6IHN0cmluZ1tdIHwgc3RyaW5nLFxuICAgIHNvdXJjZUNoYWluOiBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgbGltaXQ6IG51bWJlciA9IDAsXG4gICAgc3RhcnRJbmRleDogeyBhZGRyZXNzOiBzdHJpbmcsIHV0eG86IHN0cmluZyB9ID0gdW5kZWZpbmVkLFxuICAgIHBlcnNpc3RPcHRzOiBQZXJzaXN0YW5jZU9wdGlvbnMgPSB1bmRlZmluZWRcbiAgKTogUHJvbWlzZTx7XG4gICAgbnVtRmV0Y2hlZDogbnVtYmVyLFxuICAgIHV0eG9zOiBVVFhPU2V0LFxuICAgIGVuZEluZGV4OiB7IGFkZHJlc3M6IHN0cmluZywgdXR4bzogc3RyaW5nIH1cbiAgfT4gPT4ge1xuXG4gICAgaWYgKHR5cGVvZiBhZGRyZXNzZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGFkZHJlc3NlcyA9IFthZGRyZXNzZXNdXG4gICAgfVxuXG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICBhZGRyZXNzZXM6IGFkZHJlc3NlcyxcbiAgICAgIGxpbWl0XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc3RhcnRJbmRleCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBzdGFydEluZGV4KSB7XG4gICAgICBwYXJhbXMuc3RhcnRJbmRleCA9IHN0YXJ0SW5kZXhcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNvdXJjZUNoYWluICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBwYXJhbXMuc291cmNlQ2hhaW4gPSBzb3VyY2VDaGFpblxuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwicGxhdGZvcm0uZ2V0VVRYT3NcIiwgcGFyYW1zKVxuXG4gICAgY29uc3QgdXR4b3M6IFVUWE9TZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgbGV0IGRhdGEgPSByZXNwb25zZS5kYXRhLnJlc3VsdC51dHhvc1xuICAgIGlmIChwZXJzaXN0T3B0cyAmJiB0eXBlb2YgcGVyc2lzdE9wdHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGlmICh0aGlzLmRiLmhhcyhwZXJzaXN0T3B0cy5nZXROYW1lKCkpKSB7XG4gICAgICAgIGNvbnN0IHNlbGZBcnJheTogc3RyaW5nW10gPSB0aGlzLmRiLmdldChwZXJzaXN0T3B0cy5nZXROYW1lKCkpXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHNlbGZBcnJheSkpIHtcbiAgICAgICAgICB1dHhvcy5hZGRBcnJheShkYXRhKVxuICAgICAgICAgIGNvbnN0IHNlbGY6IFVUWE9TZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgICAgICAgc2VsZi5hZGRBcnJheShzZWxmQXJyYXkpXG4gICAgICAgICAgc2VsZi5tZXJnZUJ5UnVsZSh1dHhvcywgcGVyc2lzdE9wdHMuZ2V0TWVyZ2VSdWxlKCkpXG4gICAgICAgICAgZGF0YSA9IHNlbGYuZ2V0QWxsVVRYT1N0cmluZ3MoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmRiLnNldChwZXJzaXN0T3B0cy5nZXROYW1lKCksIGRhdGEsIHBlcnNpc3RPcHRzLmdldE92ZXJ3cml0ZSgpKVxuICAgIH1cbiAgICB1dHhvcy5hZGRBcnJheShkYXRhLCBmYWxzZSlcbiAgICByZXNwb25zZS5kYXRhLnJlc3VsdC51dHhvcyA9IHV0eG9zXG4gICAgcmVzcG9uc2UuZGF0YS5yZXN1bHQubnVtRmV0Y2hlZCA9IHBhcnNlSW50KHJlc3BvbnNlLmRhdGEucmVzdWx0Lm51bUZldGNoZWQpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhbiB1bnNpZ25lZCBJbXBvcnQgVHguIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICAqIFtbVW5zaWduZWRUeF1dIG1hbnVhbGx5ICh3aXRoIHRoZWlyIGNvcnJlc3BvbmRpbmcgW1tUcmFuc2ZlcmFibGVJbnB1dF1dcywgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXMsIGFuZCBbW1RyYW5zZmVyT3BlcmF0aW9uXV1zKS5cbiAgICpcbiAgICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgICogQHBhcmFtIG93bmVyQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBpbXBvcnRcbiAgICogQHBhcmFtIHNvdXJjZUNoYWluIFRoZSBjaGFpbmlkIGZvciB3aGVyZSB0aGUgaW1wb3J0IGlzIGNvbWluZyBmcm9tLlxuICAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0byBzZW5kIHRoZSBmdW5kc1xuICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3MgcHJvdmlkZWRcbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBvdXRwdXRzXG4gICAqIEBwYXJhbSB0aHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIChbW1Vuc2lnbmVkVHhdXSkgd2hpY2ggY29udGFpbnMgYSBbW0ltcG9ydFR4XV0uXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIFRoaXMgaGVscGVyIGV4aXN0cyBiZWNhdXNlIHRoZSBlbmRwb2ludCBBUEkgc2hvdWxkIGJlIHRoZSBwcmltYXJ5IHBvaW50IG9mIGVudHJ5IGZvciBtb3N0IGZ1bmN0aW9uYWxpdHkuXG4gICAqL1xuICBidWlsZEltcG9ydFR4ID0gYXN5bmMgKFxuICAgIHV0eG9zZXQ6IFVUWE9TZXQsXG4gICAgb3duZXJBZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIHNvdXJjZUNoYWluOiBCdWZmZXIgfCBzdHJpbmcsXG4gICAgdG9BZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIGZyb21BZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIGNoYW5nZUFkZHJlc3Nlczogc3RyaW5nW10gPSB1bmRlZmluZWQsXG4gICAgbWVtbzogUGF5bG9hZEJhc2UgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBVbml4Tm93KCksXG4gICAgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDApLFxuICAgIHRocmVzaG9sZDogbnVtYmVyID0gMVxuICApOiBQcm9taXNlPFVuc2lnbmVkVHg+ID0+IHtcbiAgICBjb25zdCB0bzogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheSh0b0FkZHJlc3NlcywgXCJidWlsZEJhc2VUeFwiKS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG4gICAgY29uc3QgZnJvbTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tQWRkcmVzc2VzLCBcImJ1aWxkQmFzZVR4XCIpLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcbiAgICBjb25zdCBjaGFuZ2U6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkoY2hhbmdlQWRkcmVzc2VzLCBcImJ1aWxkQmFzZVR4XCIpLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcblxuICAgIGxldCBzcmNDaGFpbjogc3RyaW5nID0gdW5kZWZpbmVkXG5cbiAgICBpZiAodHlwZW9mIHNvdXJjZUNoYWluID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgQ2hhaW5JZEVycm9yKFwiRXJyb3IgLSBQbGF0Zm9ybVZNQVBJLmJ1aWxkSW1wb3J0VHg6IFNvdXJjZSBDaGFpbklEIGlzIHVuZGVmaW5lZC5cIilcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBzb3VyY2VDaGFpbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgc3JjQ2hhaW4gPSBzb3VyY2VDaGFpblxuICAgICAgc291cmNlQ2hhaW4gPSBiaW50b29scy5jYjU4RGVjb2RlKHNvdXJjZUNoYWluKVxuICAgIH0gZWxzZSBpZiAoIShzb3VyY2VDaGFpbiBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICAgIHNyY0NoYWluID0gYmludG9vbHMuY2I1OEVuY29kZShzb3VyY2VDaGFpbilcbiAgICAgIHRocm93IG5ldyBDaGFpbklkRXJyb3IoXCJFcnJvciAtIFBsYXRmb3JtVk1BUEkuYnVpbGRJbXBvcnRUeDogSW52YWxpZCBkZXN0aW5hdGlvbkNoYWluIHR5cGU6IFwiICsgKHR5cGVvZiBzb3VyY2VDaGFpbikpXG4gICAgfVxuICAgIGNvbnN0IGF0b21pY1VUWE9zOiBVVFhPU2V0ID0gYXdhaXQgKGF3YWl0IHRoaXMuZ2V0VVRYT3Mob3duZXJBZGRyZXNzZXMsIHNyY0NoYWluLCAwLCB1bmRlZmluZWQpKS51dHhvc1xuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcblxuICAgIGlmIChtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIGNvbnN0IGF0b21pY3M6IFVUWE9bXSA9IGF0b21pY1VUWE9zLmdldEFsbFVUWE9zKClcblxuICAgIGNvbnN0IGJ1aWx0VW5zaWduZWRUeDogVW5zaWduZWRUeCA9IHV0eG9zZXQuYnVpbGRJbXBvcnRUeChcbiAgICAgIHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKSxcbiAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpLFxuICAgICAgdG8sXG4gICAgICBmcm9tLFxuICAgICAgY2hhbmdlLFxuICAgICAgYXRvbWljcyxcbiAgICAgIHNvdXJjZUNoYWluLFxuICAgICAgdGhpcy5nZXRUeEZlZSgpLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBtZW1vLCBhc09mLCBsb2NrdGltZSwgdGhyZXNob2xkXG4gICAgKVxuXG4gICAgaWYgKCEgYXdhaXQgdGhpcy5jaGVja0dvb3NlRWdnKGJ1aWx0VW5zaWduZWRUeCkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgR29vc2VFZ2dDaGVja0Vycm9yKFwiRmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiKVxuICAgIH1cblxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhbiB1bnNpZ25lZCBFeHBvcnQgVHguIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICAqIFtbVW5zaWduZWRUeF1dIG1hbnVhbGx5ICh3aXRoIHRoZWlyIGNvcnJlc3BvbmRpbmcgW1tUcmFuc2ZlcmFibGVJbnB1dF1dcywgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXMsIGFuZCBbW1RyYW5zZmVyT3BlcmF0aW9uXV1zKS5cbiAgICpcbiAgICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgICogQHBhcmFtIGFtb3VudCBUaGUgYW1vdW50IGJlaW5nIGV4cG9ydGVkIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGRlc3RpbmF0aW9uQ2hhaW4gVGhlIGNoYWluaWQgZm9yIHdoZXJlIHRoZSBhc3NldHMgd2lsbCBiZSBzZW50LlxuICAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0byBzZW5kIHRoZSBmdW5kc1xuICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3MgcHJvdmlkZWRcbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBvdXRwdXRzXG4gICAqIEBwYXJhbSB0aHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIChbW1Vuc2lnbmVkVHhdXSkgd2hpY2ggY29udGFpbnMgYW4gW1tFeHBvcnRUeF1dLlxuICAgKi9cbiAgYnVpbGRFeHBvcnRUeCA9IGFzeW5jIChcbiAgICB1dHhvc2V0OiBVVFhPU2V0LFxuICAgIGFtb3VudDogQk4sXG4gICAgZGVzdGluYXRpb25DaGFpbjogQnVmZmVyIHwgc3RyaW5nLFxuICAgIHRvQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBmcm9tQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IHN0cmluZ1tdID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IFBheWxvYWRCYXNlIHwgQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgIGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKSxcbiAgICB0aHJlc2hvbGQ6IG51bWJlciA9IDFcbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG5cbiAgICBsZXQgcHJlZml4ZXM6IG9iamVjdCA9IHt9XG4gICAgdG9BZGRyZXNzZXMubWFwKChhOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgIHByZWZpeGVzW2Euc3BsaXQoXCItXCIpWzBdXSA9IHRydWVcbiAgICB9KVxuICAgIGlmIChPYmplY3Qua2V5cyhwcmVmaXhlcykubGVuZ3RoICE9PSAxKSB7XG4gICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKFwiRXJyb3IgLSBQbGF0Zm9ybVZNQVBJLmJ1aWxkRXhwb3J0VHg6IFRvIGFkZHJlc3NlcyBtdXN0IGhhdmUgdGhlIHNhbWUgY2hhaW5JRCBwcmVmaXguXCIpXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBkZXN0aW5hdGlvbkNoYWluID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgQ2hhaW5JZEVycm9yKFwiRXJyb3IgLSBQbGF0Zm9ybVZNQVBJLmJ1aWxkRXhwb3J0VHg6IERlc3RpbmF0aW9uIENoYWluSUQgaXMgdW5kZWZpbmVkLlwiKVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGRlc3RpbmF0aW9uQ2hhaW4gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGRlc3RpbmF0aW9uQ2hhaW4gPSBiaW50b29scy5jYjU4RGVjb2RlKGRlc3RpbmF0aW9uQ2hhaW4pIC8vXG4gICAgfSBlbHNlIGlmICghKGRlc3RpbmF0aW9uQ2hhaW4gaW5zdGFuY2VvZiBCdWZmZXIpKSB7XG4gICAgICB0aHJvdyBuZXcgQ2hhaW5JZEVycm9yKFwiRXJyb3IgLSBQbGF0Zm9ybVZNQVBJLmJ1aWxkRXhwb3J0VHg6IEludmFsaWQgZGVzdGluYXRpb25DaGFpbiB0eXBlOiBcIiArICh0eXBlb2YgZGVzdGluYXRpb25DaGFpbikpXG4gICAgfVxuICAgIGlmIChkZXN0aW5hdGlvbkNoYWluLmxlbmd0aCAhPT0gMzIpIHtcbiAgICAgIHRocm93IG5ldyBDaGFpbklkRXJyb3IoXCJFcnJvciAtIFBsYXRmb3JtVk1BUEkuYnVpbGRFeHBvcnRUeDogRGVzdGluYXRpb24gQ2hhaW5JRCBtdXN0IGJlIDMyIGJ5dGVzIGluIGxlbmd0aC5cIilcbiAgICB9XG4gICAgLypcbiAgICBpZihiaW50b29scy5jYjU4RW5jb2RlKGRlc3RpbmF0aW9uQ2hhaW4pICE9PSBEZWZhdWx0cy5uZXR3b3JrW3RoaXMuY29yZS5nZXROZXR3b3JrSUQoKV0uWFtcImJsb2NrY2hhaW5JRFwiXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgLSBQbGF0Zm9ybVZNQVBJLmJ1aWxkRXhwb3J0VHg6IERlc3RpbmF0aW9uIENoYWluSUQgbXVzdCBUaGUgWC1DaGFpbiBJRCBpbiB0aGUgY3VycmVudCB2ZXJzaW9uIG9mIEF2YWxhbmNoZUpTLlwiKVxuICAgIH0qL1xuXG4gICAgbGV0IHRvOiBCdWZmZXJbXSA9IFtdXG4gICAgdG9BZGRyZXNzZXMubWFwKChhOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgIHRvLnB1c2goYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKVxuICAgIH0pXG4gICAgY29uc3QgZnJvbTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tQWRkcmVzc2VzLCBcImJ1aWxkRXhwb3J0VHhcIikubWFwKChhKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcbiAgICBjb25zdCBjaGFuZ2U6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkoY2hhbmdlQWRkcmVzc2VzLCBcImJ1aWxkRXhwb3J0VHhcIikubWFwKChhKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcblxuICAgIGlmIChtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcblxuICAgIGNvbnN0IGJ1aWx0VW5zaWduZWRUeDogVW5zaWduZWRUeCA9IHV0eG9zZXQuYnVpbGRFeHBvcnRUeChcbiAgICAgIHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKSxcbiAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpLFxuICAgICAgYW1vdW50LFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICB0byxcbiAgICAgIGZyb20sXG4gICAgICBjaGFuZ2UsXG4gICAgICBkZXN0aW5hdGlvbkNoYWluLFxuICAgICAgdGhpcy5nZXRUeEZlZSgpLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBtZW1vLCBhc09mLCBsb2NrdGltZSwgdGhyZXNob2xkXG4gICAgKVxuXG4gICAgaWYgKCEgYXdhaXQgdGhpcy5jaGVja0dvb3NlRWdnKGJ1aWx0VW5zaWduZWRUeCkpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgR29vc2VFZ2dDaGVja0Vycm9yKFwiRmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiKVxuICAgIH1cblxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIC8qKlxuICAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCBjcmVhdGVzIGFuIHVuc2lnbmVkIFtbQWRkU3VibmV0VmFsaWRhdG9yVHhdXS4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgKiBbW1Vuc2lnbmVkVHhdXSBtYW51YWxseSBhbmQgaW1wb3J0IHRoZSBbW0FkZFN1Ym5ldFZhbGlkYXRvclR4XV0gY2xhc3MgZGlyZWN0bHkuXG4gICpcbiAgKiBAcGFyYW0gdXR4b3NldCBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvbi5cbiAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIHBheXMgdGhlIGZlZXMgaW4gQVZBWFxuICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBnZXRzIHRoZSBjaGFuZ2UgbGVmdG92ZXIgZnJvbSB0aGUgZmVlIHBheW1lbnRcbiAgKiBAcGFyYW0gbm9kZUlEIFRoZSBub2RlIElEIG9mIHRoZSB2YWxpZGF0b3IgYmVpbmcgYWRkZWQuXG4gICogQHBhcmFtIHN0YXJ0VGltZSBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdGFydHMgdmFsaWRhdGluZyB0aGUgUHJpbWFyeSBOZXR3b3JrLlxuICAqIEBwYXJhbSBlbmRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgKiBAcGFyYW0gd2VpZ2h0IFRoZSBhbW91bnQgb2Ygd2VpZ2h0IGZvciB0aGlzIHN1Ym5ldCB2YWxpZGF0b3IuXG4gICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgY29udGFpbnMgYXJiaXRyYXJ5IGJ5dGVzLCB1cCB0byAyNTYgYnl0ZXNcbiAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAqXG4gICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gY3JlYXRlZCBmcm9tIHRoZSBwYXNzZWQgaW4gcGFyYW1ldGVycy5cbiAgKi9cblxuICAvKiBSZS1pbXBsZW1lbnQgd2hlbiBzdWJuZXRWYWxpZGF0b3Igc2lnbmluZyBwcm9jZXNzIGlzIGNsZWFyZXJcbiAgYnVpbGRBZGRTdWJuZXRWYWxpZGF0b3JUeCA9IGFzeW5jIChcbiAgICB1dHhvc2V0OlVUWE9TZXQsXG4gICAgZnJvbUFkZHJlc3NlczpzdHJpbmdbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6c3RyaW5nW10sXG4gICAgbm9kZUlEOnN0cmluZyxcbiAgICBzdGFydFRpbWU6Qk4sXG4gICAgZW5kVGltZTpCTixcbiAgICB3ZWlnaHQ6Qk4sXG4gICAgbWVtbzpQYXlsb2FkQmFzZXxCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjpCTiA9IFVuaXhOb3coKVxuICApOlByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIGNvbnN0IGZyb206QnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tQWRkcmVzc2VzLCBcImJ1aWxkQWRkU3VibmV0VmFsaWRhdG9yVHhcIikubWFwKChhKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcbiAgICBjb25zdCBjaGFuZ2U6QnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShjaGFuZ2VBZGRyZXNzZXMsIFwiYnVpbGRBZGRTdWJuZXRWYWxpZGF0b3JUeFwiKS5tYXAoKGEpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKVxuXG4gICAgaWYoIG1lbW8gaW5zdGFuY2VvZiBQYXlsb2FkQmFzZSkge1xuICAgICAgbWVtbyA9IG1lbW8uZ2V0UGF5bG9hZCgpXG4gICAgfVxuXG4gICAgY29uc3QgYXZheEFzc2V0SUQ6QnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG5cbiAgICBjb25zdCBub3c6Qk4gPSBVbml4Tm93KClcbiAgICBpZiAoc3RhcnRUaW1lLmx0KG5vdykgfHwgZW5kVGltZS5sdGUoc3RhcnRUaW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGxhdGZvcm1WTUFQSS5idWlsZEFkZFN1Ym5ldFZhbGlkYXRvclR4IC0tIHN0YXJ0VGltZSBtdXN0IGJlIGluIHRoZSBmdXR1cmUgYW5kIGVuZFRpbWUgbXVzdCBjb21lIGFmdGVyIHN0YXJ0VGltZVwiKVxuICAgIH1cblxuICAgIGNvbnN0IGJ1aWx0VW5zaWduZWRUeDpVbnNpZ25lZFR4ID0gdXR4b3NldC5idWlsZEFkZFN1Ym5ldFZhbGlkYXRvclR4KFxuICAgICAgdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpLFxuICAgICAgYmludG9vbHMuY2I1OERlY29kZSh0aGlzLmJsb2NrY2hhaW5JRCksXG4gICAgICBmcm9tLFxuICAgICAgY2hhbmdlLFxuICAgICAgTm9kZUlEU3RyaW5nVG9CdWZmZXIobm9kZUlEKSxcbiAgICAgIHN0YXJ0VGltZSwgZW5kVGltZSxcbiAgICAgIHdlaWdodCxcbiAgICAgIHRoaXMuZ2V0RmVlKCksXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sIGFzT2ZcbiAgICApXG5cbiAgICBpZighIGF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqLy8qXG50aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG59XG5cbnJldHVybiBidWlsdFVuc2lnbmVkVHhcbn1cblxuKi9cblxuICAvKipcbiAgKiBIZWxwZXIgZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhbiB1bnNpZ25lZCBbW0FkZERlbGVnYXRvclR4XV0uIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICogW1tVbnNpZ25lZFR4XV0gbWFudWFsbHkgYW5kIGltcG9ydCB0aGUgW1tBZGREZWxlZ2F0b3JUeF1dIGNsYXNzIGRpcmVjdGx5LlxuICAqXG4gICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyByZWNlaXZlZCB0aGUgc3Rha2VkIHRva2VucyBhdCB0aGUgZW5kIG9mIHRoZSBzdGFraW5nIHBlcmlvZFxuICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gb3duIHRoZSBzdGFraW5nIFVUWE9zIHRoZSBmZWVzIGluIEFWQVhcbiAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSB3aG8gZ2V0cyB0aGUgY2hhbmdlIGxlZnRvdmVyIGZyb20gdGhlIGZlZSBwYXltZW50XG4gICogQHBhcmFtIG5vZGVJRCBUaGUgbm9kZSBJRCBvZiB0aGUgdmFsaWRhdG9yIGJlaW5nIGFkZGVkLlxuICAqIEBwYXJhbSBzdGFydFRpbWUgVGhlIFVuaXggdGltZSB3aGVuIHRoZSB2YWxpZGF0b3Igc3RhcnRzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yay5cbiAgKiBAcGFyYW0gZW5kVGltZSBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdG9wcyB2YWxpZGF0aW5nIHRoZSBQcmltYXJ5IE5ldHdvcmsgKGFuZCBzdGFrZWQgQVZBWCBpcyByZXR1cm5lZCkuXG4gICogQHBhcmFtIHN0YWtlQW1vdW50IFRoZSBhbW91bnQgYmVpbmcgZGVsZWdhdGVkIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgKiBAcGFyYW0gcmV3YXJkQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgd2hpY2ggd2lsbCByZWNpZXZlIHRoZSByZXdhcmRzIGZyb20gdGhlIGRlbGVnYXRlZCBzdGFrZS5cbiAgKiBAcGFyYW0gcmV3YXJkTG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgcmV3YXJkIG91dHB1dHNcbiAgKiBAcGFyYW0gcmV3YXJkVGhyZXNob2xkIE9waW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCByZXdhcmQgVVRYTy4gRGVmYXVsdCAxLlxuICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgKlxuICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICovXG4gIGJ1aWxkQWRkRGVsZWdhdG9yVHggPSBhc3luYyAoXG4gICAgdXR4b3NldDogVVRYT1NldCxcbiAgICB0b0FkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgZnJvbUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBub2RlSUQ6IHN0cmluZyxcbiAgICBzdGFydFRpbWU6IEJOLFxuICAgIGVuZFRpbWU6IEJOLFxuICAgIHN0YWtlQW1vdW50OiBCTixcbiAgICByZXdhcmRBZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIHJld2FyZExvY2t0aW1lOiBCTiA9IG5ldyBCTigwKSxcbiAgICByZXdhcmRUaHJlc2hvbGQ6IG51bWJlciA9IDEsXG4gICAgbWVtbzogUGF5bG9hZEJhc2UgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBVbml4Tm93KClcbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgdG86IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkodG9BZGRyZXNzZXMsIFwiYnVpbGRBZGREZWxlZ2F0b3JUeFwiKS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG4gICAgY29uc3QgZnJvbTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tQWRkcmVzc2VzLCBcImJ1aWxkQWRkRGVsZWdhdG9yVHhcIikubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKVxuICAgIGNvbnN0IGNoYW5nZTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShjaGFuZ2VBZGRyZXNzZXMsIFwiYnVpbGRBZGREZWxlZ2F0b3JUeFwiKS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG4gICAgY29uc3QgcmV3YXJkczogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShyZXdhcmRBZGRyZXNzZXMsIFwiYnVpbGRBZGRWYWxpZGF0b3JUeFwiKS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG5cbiAgICBpZiAobWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKClcbiAgICB9XG5cbiAgICBjb25zdCBtaW5TdGFrZTogQk4gPSAoYXdhaXQgdGhpcy5nZXRNaW5TdGFrZSgpKVtcIm1pbkRlbGVnYXRvclN0YWtlXCJdXG4gICAgaWYgKHN0YWtlQW1vdW50Lmx0KG1pblN0YWtlKSkge1xuICAgICAgdGhyb3cgbmV3IFN0YWtlRXJyb3IoXCJQbGF0Zm9ybVZNQVBJLmJ1aWxkQWRkRGVsZWdhdG9yVHggLS0gc3Rha2UgYW1vdW50IG11c3QgYmUgYXQgbGVhc3QgXCIgKyBtaW5TdGFrZS50b1N0cmluZygxMCkpXG4gICAgfVxuXG4gICAgY29uc3QgYXZheEFzc2V0SUQ6IEJ1ZmZlciA9IGF3YWl0IHRoaXMuZ2V0QVZBWEFzc2V0SUQoKVxuXG4gICAgY29uc3Qgbm93OiBCTiA9IFVuaXhOb3coKVxuICAgIGlmIChzdGFydFRpbWUubHQobm93KSB8fCBlbmRUaW1lLmx0ZShzdGFydFRpbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVGltZUVycm9yKFwiUGxhdGZvcm1WTUFQSS5idWlsZEFkZERlbGVnYXRvclR4IC0tIHN0YXJ0VGltZSBtdXN0IGJlIGluIHRoZSBmdXR1cmUgYW5kIGVuZFRpbWUgbXVzdCBjb21lIGFmdGVyIHN0YXJ0VGltZVwiKVxuICAgIH1cblxuICAgIGNvbnN0IGJ1aWx0VW5zaWduZWRUeDogVW5zaWduZWRUeCA9IHV0eG9zZXQuYnVpbGRBZGREZWxlZ2F0b3JUeChcbiAgICAgIHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKSxcbiAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICB0byxcbiAgICAgIGZyb20sXG4gICAgICBjaGFuZ2UsXG4gICAgICBOb2RlSURTdHJpbmdUb0J1ZmZlcihub2RlSUQpLFxuICAgICAgc3RhcnRUaW1lLCBlbmRUaW1lLFxuICAgICAgc3Rha2VBbW91bnQsXG4gICAgICByZXdhcmRMb2NrdGltZSxcbiAgICAgIHJld2FyZFRocmVzaG9sZCxcbiAgICAgIHJld2FyZHMsXG4gICAgICBuZXcgQk4oMCksXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sIGFzT2ZcbiAgICApXG5cbiAgICBpZiAoIWF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEdvb3NlRWdnQ2hlY2tFcnJvcihcIkZhaWxlZCBHb29zZSBFZ2cgQ2hlY2tcIilcbiAgICB9XG5cbiAgICByZXR1cm4gYnVpbHRVbnNpZ25lZFR4XG4gIH1cblxuXG4gIC8qKlxuICAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCBjcmVhdGVzIGFuIHVuc2lnbmVkIFtbQWRkVmFsaWRhdG9yVHhdXS4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgKiBbW1Vuc2lnbmVkVHhdXSBtYW51YWxseSBhbmQgaW1wb3J0IHRoZSBbW0FkZFZhbGlkYXRvclR4XV0gY2xhc3MgZGlyZWN0bHkuXG4gICpcbiAgKiBAcGFyYW0gdXR4b3NldCBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvblxuICAqIEBwYXJhbSB0b0FkZHJlc3NlcyBBbiBhcnJheSBvZiBhZGRyZXNzZXMgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn0gd2hvIHJlY2VpdmVkIHRoZSBzdGFrZWQgdG9rZW5zIGF0IHRoZSBlbmQgb2YgdGhlIHN0YWtpbmcgcGVyaW9kXG4gICogQHBhcmFtIGZyb21BZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBvd24gdGhlIHN0YWtpbmcgVVRYT3MgdGhlIGZlZXMgaW4gQVZBWFxuICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgQW4gYXJyYXkgb2YgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9IHdobyBnZXRzIHRoZSBjaGFuZ2UgbGVmdG92ZXIgZnJvbSB0aGUgZmVlIHBheW1lbnRcbiAgKiBAcGFyYW0gbm9kZUlEIFRoZSBub2RlIElEIG9mIHRoZSB2YWxpZGF0b3IgYmVpbmcgYWRkZWQuXG4gICogQHBhcmFtIHN0YXJ0VGltZSBUaGUgVW5peCB0aW1lIHdoZW4gdGhlIHZhbGlkYXRvciBzdGFydHMgdmFsaWRhdGluZyB0aGUgUHJpbWFyeSBOZXR3b3JrLlxuICAqIEBwYXJhbSBlbmRUaW1lIFRoZSBVbml4IHRpbWUgd2hlbiB0aGUgdmFsaWRhdG9yIHN0b3BzIHZhbGlkYXRpbmcgdGhlIFByaW1hcnkgTmV0d29yayAoYW5kIHN0YWtlZCBBVkFYIGlzIHJldHVybmVkKS5cbiAgKiBAcGFyYW0gc3Rha2VBbW91bnQgVGhlIGFtb3VudCBiZWluZyBkZWxlZ2F0ZWQgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAqIEBwYXJhbSByZXdhcmRBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB3aGljaCB3aWxsIHJlY2lldmUgdGhlIHJld2FyZHMgZnJvbSB0aGUgZGVsZWdhdGVkIHN0YWtlLlxuICAqIEBwYXJhbSBkZWxlZ2F0aW9uRmVlIEEgbnVtYmVyIGZvciB0aGUgcGVyY2VudGFnZSBvZiByZXdhcmQgdG8gYmUgZ2l2ZW4gdG8gdGhlIHZhbGlkYXRvciB3aGVuIHNvbWVvbmUgZGVsZWdhdGVzIHRvIHRoZW0uIE11c3QgYmUgYmV0d2VlbiAwIGFuZCAxMDAuXG4gICogQHBhcmFtIHJld2FyZExvY2t0aW1lIE9wdGlvbmFsLiBUaGUgbG9ja3RpbWUgZmllbGQgY3JlYXRlZCBpbiB0aGUgcmVzdWx0aW5nIHJld2FyZCBvdXRwdXRzXG4gICogQHBhcmFtIHJld2FyZFRocmVzaG9sZCBPcGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgcmV3YXJkIFVUWE8uIERlZmF1bHQgMS5cbiAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICpcbiAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBjcmVhdGVkIGZyb20gdGhlIHBhc3NlZCBpbiBwYXJhbWV0ZXJzLlxuICAqL1xuICBidWlsZEFkZFZhbGlkYXRvclR4ID0gYXN5bmMgKFxuICAgIHV0eG9zZXQ6IFVUWE9TZXQsXG4gICAgdG9BZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIGZyb21BZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIGNoYW5nZUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgbm9kZUlEOiBzdHJpbmcsXG4gICAgc3RhcnRUaW1lOiBCTixcbiAgICBlbmRUaW1lOiBCTixcbiAgICBzdGFrZUFtb3VudDogQk4sXG4gICAgcmV3YXJkQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBkZWxlZ2F0aW9uRmVlOiBudW1iZXIsXG4gICAgcmV3YXJkTG9ja3RpbWU6IEJOID0gbmV3IEJOKDApLFxuICAgIHJld2FyZFRocmVzaG9sZDogbnVtYmVyID0gMSxcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKVxuICApOiBQcm9taXNlPFVuc2lnbmVkVHg+ID0+IHtcbiAgICBjb25zdCB0bzogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheSh0b0FkZHJlc3NlcywgXCJidWlsZEFkZFZhbGlkYXRvclR4XCIpLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcbiAgICBjb25zdCBmcm9tOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGZyb21BZGRyZXNzZXMsIFwiYnVpbGRBZGRWYWxpZGF0b3JUeFwiKS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG4gICAgY29uc3QgY2hhbmdlOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGNoYW5nZUFkZHJlc3NlcywgXCJidWlsZEFkZFZhbGlkYXRvclR4XCIpLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcbiAgICBjb25zdCByZXdhcmRzOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KHJld2FyZEFkZHJlc3NlcywgXCJidWlsZEFkZFZhbGlkYXRvclR4XCIpLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcblxuICAgIGlmIChtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIGNvbnN0IG1pblN0YWtlOiBCTiA9IChhd2FpdCB0aGlzLmdldE1pblN0YWtlKCkpW1wibWluVmFsaWRhdG9yU3Rha2VcIl1cbiAgICBpZiAoc3Rha2VBbW91bnQubHQobWluU3Rha2UpKSB7XG4gICAgICB0aHJvdyBuZXcgU3Rha2VFcnJvcihcIlBsYXRmb3JtVk1BUEkuYnVpbGRBZGRWYWxpZGF0b3JUeCAtLSBzdGFrZSBhbW91bnQgbXVzdCBiZSBhdCBsZWFzdCBcIiArIG1pblN0YWtlLnRvU3RyaW5nKDEwKSlcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRlbGVnYXRpb25GZWUgIT09IFwibnVtYmVyXCIgfHwgZGVsZWdhdGlvbkZlZSA+IDEwMCB8fCBkZWxlZ2F0aW9uRmVlIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IERlbGVnYXRpb25GZWVFcnJvcihcIlBsYXRmb3JtVk1BUEkuYnVpbGRBZGRWYWxpZGF0b3JUeCAtLSBkZWxlZ2F0aW9uRmVlIG11c3QgYmUgYSBudW1iZXIgYmV0d2VlbiAwIGFuZCAxMDBcIilcbiAgICB9XG5cbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG5cbiAgICBjb25zdCBub3c6IEJOID0gVW5peE5vdygpXG4gICAgaWYgKHN0YXJ0VGltZS5sdChub3cpIHx8IGVuZFRpbWUubHRlKHN0YXJ0VGltZSkpIHtcbiAgICAgIHRocm93IG5ldyBUaW1lRXJyb3IoXCJQbGF0Zm9ybVZNQVBJLmJ1aWxkQWRkVmFsaWRhdG9yVHggLS0gc3RhcnRUaW1lIG11c3QgYmUgaW4gdGhlIGZ1dHVyZSBhbmQgZW5kVGltZSBtdXN0IGNvbWUgYWZ0ZXIgc3RhcnRUaW1lXCIpXG4gICAgfVxuXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gdXR4b3NldC5idWlsZEFkZFZhbGlkYXRvclR4KFxuICAgICAgdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpLFxuICAgICAgYmludG9vbHMuY2I1OERlY29kZSh0aGlzLmJsb2NrY2hhaW5JRCksXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIHRvLFxuICAgICAgZnJvbSxcbiAgICAgIGNoYW5nZSxcbiAgICAgIE5vZGVJRFN0cmluZ1RvQnVmZmVyKG5vZGVJRCksXG4gICAgICBzdGFydFRpbWUsIGVuZFRpbWUsXG4gICAgICBzdGFrZUFtb3VudCxcbiAgICAgIHJld2FyZExvY2t0aW1lLFxuICAgICAgcmV3YXJkVGhyZXNob2xkLFxuICAgICAgcmV3YXJkcyxcbiAgICAgIGRlbGVnYXRpb25GZWUsXG4gICAgICBuZXcgQk4oMCksXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sIGFzT2ZcbiAgICApXG5cbiAgICBpZiAoISBhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4KSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXCJGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeFxuICB9XG5cbiAgLyoqXG4gICAgKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gdW5zaWduZWQgW1tDcmVhdGVTdWJuZXRUeF1dIHRyYW5zYWN0aW9uLlxuICAgICpcbiAgICAqIEBwYXJhbSB1dHhvc2V0IEEgc2V0IG9mIFVUWE9zIHRoYXQgdGhlIHRyYW5zYWN0aW9uIGlzIGJ1aWx0IG9uXG4gICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3Mge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPc1xuICAgICogQHBhcmFtIHN1Ym5ldE93bmVyQWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBmb3Igb3duZXJzIG9mIHRoZSBuZXcgc3VibmV0XG4gICAgKiBAcGFyYW0gc3VibmV0T3duZXJUaHJlc2hvbGQgQSBudW1iZXIgaW5kaWNhdGluZyB0aGUgYW1vdW50IG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gYWRkIHZhbGlkYXRvcnMgdG8gYSBzdWJuZXRcbiAgICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgICpcbiAgICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIGNyZWF0ZWQgZnJvbSB0aGUgcGFzc2VkIGluIHBhcmFtZXRlcnMuXG4gICAgKi9cbiAgYnVpbGRDcmVhdGVTdWJuZXRUeCA9IGFzeW5jIChcbiAgICB1dHhvc2V0OiBVVFhPU2V0LFxuICAgIGZyb21BZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIGNoYW5nZUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgc3VibmV0T3duZXJBZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIHN1Ym5ldE93bmVyVGhyZXNob2xkOiBudW1iZXIsXG4gICAgbWVtbzogUGF5bG9hZEJhc2UgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBVbml4Tm93KClcbiAgKTogUHJvbWlzZTxVbnNpZ25lZFR4PiA9PiB7XG4gICAgY29uc3QgZnJvbTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tQWRkcmVzc2VzLCBcImJ1aWxkQ3JlYXRlU3VibmV0VHhcIikubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKVxuICAgIGNvbnN0IGNoYW5nZTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShjaGFuZ2VBZGRyZXNzZXMsIFwiYnVpbGRDcmVhdGVTdWJuZXRUeFwiKS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG4gICAgY29uc3Qgb3duZXJzOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KHN1Ym5ldE93bmVyQWRkcmVzc2VzLCBcImJ1aWxkQ3JlYXRlU3VibmV0VHhcIikubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKVxuXG4gICAgaWYgKG1lbW8gaW5zdGFuY2VvZiBQYXlsb2FkQmFzZSkge1xuICAgICAgbWVtbyA9IG1lbW8uZ2V0UGF5bG9hZCgpXG4gICAgfVxuXG4gICAgY29uc3QgYXZheEFzc2V0SUQ6IEJ1ZmZlciA9IGF3YWl0IHRoaXMuZ2V0QVZBWEFzc2V0SUQoKVxuXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gdXR4b3NldC5idWlsZENyZWF0ZVN1Ym5ldFR4KFxuICAgICAgdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpLFxuICAgICAgYmludG9vbHMuY2I1OERlY29kZSh0aGlzLmJsb2NrY2hhaW5JRCksXG4gICAgICBmcm9tLFxuICAgICAgY2hhbmdlLFxuICAgICAgb3duZXJzLFxuICAgICAgc3VibmV0T3duZXJUaHJlc2hvbGQsXG4gICAgICB0aGlzLmdldENyZWF0aW9uVHhGZWUoKSxcbiAgICAgIGF2YXhBc3NldElELFxuICAgICAgbWVtbywgYXNPZlxuICAgIClcblxuICAgIGlmICghYXdhaXQgdGhpcy5jaGVja0dvb3NlRWdnKGJ1aWx0VW5zaWduZWRUeCwgdGhpcy5nZXRDcmVhdGlvblR4RmVlKCkpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEdvb3NlRWdnQ2hlY2tFcnJvcihcIkZhaWxlZCBHb29zZSBFZ2cgQ2hlY2tcIilcbiAgICB9XG5cbiAgICByZXR1cm4gYnVpbHRVbnNpZ25lZFR4XG4gIH1cblxuICAvKipcbiAgICogQGlnbm9yZVxuICAgKi9cbiAgcHJvdGVjdGVkIF9jbGVhbkFkZHJlc3NBcnJheShhZGRyZXNzZXM6IHN0cmluZ1tdIHwgQnVmZmVyW10sIGNhbGxlcjogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGFkZHJzOiBzdHJpbmdbXSA9IFtdXG4gICAgY29uc3QgY2hhaW5pZDogc3RyaW5nID0gdGhpcy5nZXRCbG9ja2NoYWluQWxpYXMoKSA/IHRoaXMuZ2V0QmxvY2tjaGFpbkFsaWFzKCkgOiB0aGlzLmdldEJsb2NrY2hhaW5JRCgpXG4gICAgaWYgKGFkZHJlc3NlcyAmJiBhZGRyZXNzZXMubGVuZ3RoID4gMCkge1xuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFkZHJlc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodHlwZW9mIGFkZHJlc3Nlc1tpXSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJzZUFkZHJlc3MoYWRkcmVzc2VzW2ldIGFzIHN0cmluZykgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKFwiRXJyb3IgLSBJbnZhbGlkIGFkZHJlc3MgZm9ybWF0XCIpXG4gICAgICAgICAgfVxuICAgICAgICAgIGFkZHJzLnB1c2goYWRkcmVzc2VzW2ldIGFzIHN0cmluZylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBiZWNoMzI6IFNlcmlhbGl6ZWRUeXBlID0gXCJiZWNoMzJcIlxuICAgICAgICAgIGFkZHJzLnB1c2goc2VyaWFsaXphdGlvbi5idWZmZXJUb1R5cGUoYWRkcmVzc2VzW2ldIGFzIEJ1ZmZlciwgYmVjaDMyLCB0aGlzLmNvcmUuZ2V0SFJQKCksIGNoYWluaWQpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhZGRyc1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY2xhc3Mgc2hvdWxkIG5vdCBiZSBpbnN0YW50aWF0ZWQgZGlyZWN0bHkuXG4gICAqIEluc3RlYWQgdXNlIHRoZSBbW0F2YWxhbmNoZS5hZGRBUEldXSBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSBjb3JlIEEgcmVmZXJlbmNlIHRvIHRoZSBBdmFsYW5jaGUgY2xhc3NcbiAgICogQHBhcmFtIGJhc2V1cmwgRGVmYXVsdHMgdG8gdGhlIHN0cmluZyBcIi9leHQvUFwiIGFzIHRoZSBwYXRoIHRvIGJsb2NrY2hhaW5cInMgYmFzZXVybFxuICAgKi9cbiAgY29uc3RydWN0b3IoY29yZTogQXZhbGFuY2hlQ29yZSwgYmFzZXVybDogc3RyaW5nID0gXCIvZXh0L2JjL1BcIikge1xuICAgIHN1cGVyKGNvcmUsIGJhc2V1cmwpXG4gICAgdGhpcy5ibG9ja2NoYWluSUQgPSBQbGF0Zm9ybUNoYWluSURcbiAgICBjb25zdCBuZXRpZDogbnVtYmVyID0gY29yZS5nZXROZXR3b3JrSUQoKVxuICAgIGlmIChuZXRpZCBpbiBEZWZhdWx0cy5uZXR3b3JrICYmIHRoaXMuYmxvY2tjaGFpbklEIGluIERlZmF1bHRzLm5ldHdvcmtbbmV0aWRdKSB7XG4gICAgICBjb25zdCB7IGFsaWFzIH0gPSBEZWZhdWx0cy5uZXR3b3JrW25ldGlkXVt0aGlzLmJsb2NrY2hhaW5JRF1cbiAgICAgIHRoaXMua2V5Y2hhaW4gPSBuZXcgS2V5Q2hhaW4odGhpcy5jb3JlLmdldEhSUCgpLCBhbGlhcylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5rZXljaGFpbiA9IG5ldyBLZXlDaGFpbih0aGlzLmNvcmUuZ2V0SFJQKCksIHRoaXMuYmxvY2tjaGFpbklEKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAcmV0dXJucyB0aGUgVVRYT3MgdGhhdCB3ZXJlIHJld2FyZGVkIGFmdGVyIHRoZSBwcm92aWRlZCB0cmFuc2FjdGlvblwicyBzdGFraW5nIG9yIGRlbGVnYXRpb24gcGVyaW9kIGVuZGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB0aGUgbnVtYmVyIGZldGNoZWQsIGFuIGFycmF5IG9mIFVUWE9zIGFuZCB0aGUgZW5jb2RpbmcuXG4gICAqL1xuICBnZXRSZXdhcmRVVFhPcyA9IGFzeW5jICh0eElEOiBzdHJpbmcsIGVuY29kaW5nPzogc3RyaW5nKTogUHJvbWlzZTxHZXRSZXdhcmRVVFhPc1Jlc3BvbnNlPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBHZXRSZXdhcmRVVFhPc1BhcmFtcyA9IHtcbiAgICAgIHR4SUQsXG4gICAgICBlbmNvZGluZ1xuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcInBsYXRmb3JtLmdldFJld2FyZFVUWE9zXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHRcbiAgfVxufVxuIl19