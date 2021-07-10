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
exports.AVMAPI = void 0;
/**
* @packageDocumentation
* @module API-AVM
*/
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer/");
const bintools_1 = __importDefault(require("../../utils/bintools"));
const utxos_1 = require("./utxos");
const constants_1 = require("./constants");
const keychain_1 = require("./keychain");
const tx_1 = require("./tx");
const payload_1 = require("../../utils/payload");
const helperfunctions_1 = require("../../utils/helperfunctions");
const jrpcapi_1 = require("../../common/jrpcapi");
const constants_2 = require("../../utils/constants");
const output_1 = require("../../common/output");
const errors_1 = require("../../utils/errors");
const utils_1 = require("../../utils");
/**
* @ignore
*/
const bintools = bintools_1.default.getInstance();
const serialization = utils_1.Serialization.getInstance();
/**
* Class for interacting with a node endpoint that is using the AVM.
*
* @category RPCAPIs
*
* @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
*/
class AVMAPI extends jrpcapi_1.JRPCAPI {
    /**
     * This class should not be instantiated directly. Instead use the [[Avalanche.addAPI]] method.
     *
     * @param core A reference to the Avalanche class
     * @param baseurl Defaults to the string "/ext/bc/X" as the path to blockchain"s baseurl
     * @param blockchainID The Blockchain"s ID. Defaults to an empty string: ""
     */
    constructor(core, baseurl = "/ext/bc/X", blockchainID = "") {
        super(core, baseurl);
        /**
        * @ignore
        */
        this.keychain = new keychain_1.KeyChain("", "");
        this.blockchainID = "";
        this.blockchainAlias = undefined;
        this.AVAXAssetID = undefined;
        this.txFee = undefined;
        this.creationTxFee = undefined;
        /**
         * Gets the alias for the blockchainID if it exists, otherwise returns `undefined`.
         *
         * @returns The alias for the blockchainID
         */
        this.getBlockchainAlias = () => {
            if (typeof this.blockchainAlias === "undefined") {
                const netid = this.core.getNetworkID();
                if (netid in constants_2.Defaults.network && this.blockchainID in constants_2.Defaults.network[netid]) {
                    this.blockchainAlias = constants_2.Defaults.network[netid][this.blockchainID].alias;
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
            if (typeof blockchainID === "undefined" && typeof constants_2.Defaults.network[netid] !== "undefined") {
                this.blockchainID = constants_2.Defaults.network[netid].X.blockchainID; //default to X-Chain
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
            return bintools.parseAddress(addr, blockchainID, alias, constants_1.AVMConstants.ADDRESSLENGTH);
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
                const asset = yield this.getAssetDescription(constants_2.PrimaryAssetAlias);
                this.AVAXAssetID = asset.assetID;
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
            return this.core.getNetworkID() in constants_2.Defaults.network ? new bn_js_1.default(constants_2.Defaults.network[this.core.getNetworkID()]["X"]["txFee"]) : new bn_js_1.default(0);
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
            return this.core.getNetworkID() in constants_2.Defaults.network ? new bn_js_1.default(constants_2.Defaults.network[this.core.getNetworkID()]["X"]["creationTxFee"]) : new bn_js_1.default(0);
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
         * @returns The instance of [[KeyChain]] for this class
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
            if (fee.lte(constants_2.ONEAVAX.mul(new bn_js_1.default(10))) || fee.lte(outputTotal)) {
                return true;
            }
            else {
                return false;
            }
        });
        /**
           * Gets the balance of a particular asset on a blockchain.
           *
           * @param address The address to pull the asset balance from
           * @param assetID The assetID to pull the balance from
           *
           * @returns Promise with the balance of the assetID as a {@link https://github.com/indutny/bn.js/|BN} on the provided address for the blockchain.
           */
        this.getBalance = (address, assetID) => __awaiter(this, void 0, void 0, function* () {
            if (typeof this.parseAddress(address) === "undefined") {
                /* istanbul ignore next */
                throw new errors_1.AddressError("Error - AVMAPI.getBalance: Invalid address format");
            }
            const params = {
                address,
                assetID
            };
            const response = yield this.callMethod("avm.getBalance", params);
            return response.data.result;
        });
        /**
           * Creates an address (and associated private keys) on a user on a blockchain.
           *
           * @param username Name of the user to create the address under
           * @param password Password to unlock the user and encrypt the private key
           *
           * @returns Promise for a string representing the address created by the vm.
           */
        this.createAddress = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password
            };
            const response = yield this.callMethod("avm.createAddress", params);
            return response.data.result.address;
        });
        /**
         * Create a new fixed-cap, fungible asset. A quantity of it is created at initialization and there no more is ever created.
         *
         * @param username The user paying the transaction fee (in $AVAX) for asset creation
         * @param password The password for the user paying the transaction fee (in $AVAX) for asset creation
         * @param name The human-readable name for the asset
         * @param symbol Optional. The shorthand symbol for the asset. Between 0 and 4 characters
         * @param denomination Optional. Determines how balances of this asset are displayed by user interfaces. Default is 0
         * @param initialHolders An array of objects containing the field "address" and "amount" to establish the genesis values for the new asset
         *
         * ```js
         * Example initialHolders:
         * [
         *     {
         *         "address": "X-avax1kj06lhgx84h39snsljcey3tpc046ze68mek3g5",
         *         "amount": 10000
         *     },
         *     {
         *         "address": "X-avax1am4w6hfrvmh3akduzkjthrtgtqafalce6an8cr",
         *         "amount": 50000
         *     }
         * ]
         * ```
         *
         * @returns Returns a Promise<string> containing the base 58 string representation of the ID of the newly created asset.
         */
        this.createFixedCapAsset = (username, password, name, symbol, denomination, initialHolders) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                name,
                symbol,
                denomination,
                username,
                password,
                initialHolders
            };
            const response = yield this.callMethod("avm.createFixedCapAsset", params);
            return response.data.result.assetID;
        });
        /**
           * Create a new variable-cap, fungible asset. No units of the asset exist at initialization. Minters can mint units of this asset using createMintTx, signMintTx and sendMintTx.
           *
           * @param username The user paying the transaction fee (in $AVAX) for asset creation
           * @param password The password for the user paying the transaction fee (in $AVAX) for asset creation
           * @param name The human-readable name for the asset
           * @param symbol Optional. The shorthand symbol for the asset -- between 0 and 4 characters
           * @param denomination Optional. Determines how balances of this asset are displayed by user interfaces. Default is 0
           * @param minterSets is a list where each element specifies that threshold of the addresses in minters may together mint more of the asset by signing a minting transaction
           *
           * ```js
           * Example minterSets:
           * [
           *      {
           *          "minters":[
           *              "X-avax1am4w6hfrvmh3akduzkjthrtgtqafalce6an8cr"
           *          ],
           *          "threshold": 1
           *      },
           *      {
           *          "minters": [
           *              "X-avax1am4w6hfrvmh3akduzkjthrtgtqafalce6an8cr",
           *              "X-avax1kj06lhgx84h39snsljcey3tpc046ze68mek3g5",
           *              "X-avax1yell3e4nln0m39cfpdhgqprsd87jkh4qnakklx"
           *          ],
           *          "threshold": 2
           *      }
           * ]
           * ```
           *
           * @returns Returns a Promise<string> containing the base 58 string representation of the ID of the newly created asset.
           */
        this.createVariableCapAsset = (username, password, name, symbol, denomination, minterSets) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                name,
                symbol,
                denomination,
                username,
                password,
                minterSets
            };
            const response = yield this.callMethod("avm.createVariableCapAsset", params);
            return response.data.result.assetID;
        });
        /**
           * Create an unsigned transaction to mint more of an asset.
           *
           * @param amount The units of the asset to mint
           * @param assetID The ID of the asset to mint
           * @param to The address to assign the units of the minted asset
           * @param minters Addresses of the minters responsible for signing the transaction
           *
           * @returns Returns a Promise<string> containing the base 58 string representation of the unsigned transaction.
           */
        this.mint = (username, password, amount, assetID, to, minters) => __awaiter(this, void 0, void 0, function* () {
            let asset;
            let amnt;
            if (typeof assetID !== "string") {
                asset = bintools.cb58Encode(assetID);
            }
            else {
                asset = assetID;
            }
            if (typeof amount === "number") {
                amnt = new bn_js_1.default(amount);
            }
            else {
                amnt = amount;
            }
            const params = {
                username: username,
                password: password,
                amount: amnt.toString(10),
                assetID: asset,
                to,
                minters
            };
            const response = yield this.callMethod("avm.mint", params);
            return response.data.result.txID;
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
            if (typeof this.parseAddress(address) === "undefined") {
                /* istanbul ignore next */
                throw new errors_1.AddressError("Error - AVMAPI.exportKey: Invalid address format");
            }
            const params = {
                username,
                password,
                address
            };
            const response = yield this.callMethod("avm.exportKey", params);
            return response.data.result.privateKey;
        });
        /**
           * Imports a private key into the node's keystore under an user and for a blockchain.
           *
           * @param username The name of the user to store the private key
           * @param password The password that unlocks the user
           * @param privateKey A string representing the private key in the vm's format
           *
           * @returns The address for the imported private key.
           */
        this.importKey = (username, password, privateKey) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password,
                privateKey
            };
            const response = yield this.callMethod("avm.importKey", params);
            return response.data.result.address;
        });
        /**
          * Send ANT (Avalanche Native Token) assets including AVAX from the X-Chain to an account on the P-Chain or C-Chain.
          *
          * After calling this method, you must call the P-Chain's `importAVAX` or the C-Chain’s `import` method to complete the transfer.
          *
          * @param username The Keystore user that controls the P-Chain or C-Chain account specified in `to`
          * @param password The password of the Keystore user
          * @param to The account on the P-Chain or C-Chain to send the asset to.
          * @param amount Amount of asset to export as a {@link https://github.com/indutny/bn.js/|BN}
          * @param assetID The asset id which is being sent
          *
          * @returns String representing the transaction id
          */
        this.export = (username, password, to, amount, assetID) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                to,
                amount: amount.toString(10),
                username,
                password,
                assetID
            };
            const response = yield this.callMethod("avm.export", params);
            return response.data.result.txID;
        });
        /**
           * Send AVAX from the X-Chain to an account on the P-Chain or C-Chain.
           *
           * After calling this method, you must call the P-Chain’s or C-Chain's importAVAX method to complete the transfer.
           *
           * @param username The Keystore user that controls the P-Chain account specified in `to`
           * @param password The password of the Keystore user
           * @param to The account on the P-Chain or C-Chain to send the AVAX to.
           * @param amount Amount of AVAX to export as a {@link https://github.com/indutny/bn.js/|BN}
           *
           * @returns String representing the transaction id
           */
        this.exportAVAX = (username, password, to, amount) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                to,
                amount: amount.toString(10),
                username,
                password
            };
            const response = yield this.callMethod("avm.exportAVAX", params);
            return response.data.result.txID;
        });
        /**
         * Send ANT (Avalanche Native Token) assets including AVAX from an account on the P-Chain or C-Chain to an address on the X-Chain. This transaction
         * must be signed with the key of the account that the asset is sent from and which pays
         * the transaction fee.
         *
         * @param username The Keystore user that controls the account specified in `to`
         * @param password The password of the Keystore user
         * @param to The address of the account the asset is sent to.
         * @param sourceChain The chainID where the funds are coming from. Ex: "C"
         *
         * @returns Promise for a string for the transaction, which should be sent to the network
         * by calling issueTx.
         */
        this.import = (username, password, to, sourceChain) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                to,
                sourceChain,
                username,
                password
            };
            const response = yield this.callMethod("avm.import", params);
            return response.data.result.txID;
        });
        /**
           * Finalize a transfer of AVAX from the P-Chain to the X-Chain.
           *
           * Before this method is called, you must call the P-Chain’s `exportAVAX` method to initiate the transfer.
           * @param username The Keystore user that controls the address specified in `to`
           * @param password The password of the Keystore user
           * @param to The address the AVAX is sent to. This must be the same as the to argument in the corresponding call to the P-Chain’s exportAVAX, except that the prepended X- should be included in this argument
           * @param sourceChain Chain the funds are coming from.
           *
           * @returns String representing the transaction id
           */
        this.importAVAX = (username, password, to, sourceChain) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                to,
                sourceChain,
                username,
                password
            };
            const response = yield this.callMethod("avm.importAVAX", params);
            return response.data.result.txID;
        });
        /**
           * Lists all the addresses under a user.
           *
           * @param username The user to list addresses
           * @param password The password of the user to list the addresses
           *
           * @returns Promise of an array of address strings in the format specified by the blockchain.
           */
        this.listAddresses = (username, password) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                username,
                password
            };
            const response = yield this.callMethod("avm.listAddresses", params);
            return response.data.result.addresses;
        });
        /**
           * Retrieves all assets for an address on a server and their associated balances.
           *
           * @param address The address to get a list of assets
           *
           * @returns Promise of an object mapping assetID strings with {@link https://github.com/indutny/bn.js/|BN} balance for the address on the blockchain.
           */
        this.getAllBalances = (address) => __awaiter(this, void 0, void 0, function* () {
            if (typeof this.parseAddress(address) === "undefined") {
                /* istanbul ignore next */
                throw new errors_1.AddressError("Error - AVMAPI.getAllBalances: Invalid address format");
            }
            const params = {
                address
            };
            const response = yield this.callMethod("avm.getAllBalances", params);
            return response.data.result.balances;
        });
        /**
        * Retrieves an assets name and symbol.
        *
        * @param assetID Either a {@link https://github.com/feross/buffer|Buffer} or an b58 serialized string for the AssetID or its alias.
        *
        * @returns Returns a Promise<object> with keys "name" and "symbol".
        */
        this.getAssetDescription = (assetID) => __awaiter(this, void 0, void 0, function* () {
            let asset;
            if (typeof assetID !== "string") {
                asset = bintools.cb58Encode(assetID);
            }
            else {
                asset = assetID;
            }
            const params = {
                assetID: asset
            };
            const response = yield this.callMethod("avm.getAssetDescription", params);
            return {
                name: response.data.result.name,
                symbol: response.data.result.symbol,
                assetID: bintools.cb58Decode(response.data.result.assetID),
                denomination: parseInt(response.data.result.denomination, 10)
            };
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
            const response = yield this.callMethod("avm.getTx", params);
            return response.data.result.tx;
        });
        /**
         * Returns the status of a provided transaction ID by calling the node's `getTxStatus` method.
         *
         * @param txid The string representation of the transaction ID
         *
         * @returns Returns a Promise<string> containing the status retrieved from the node
         */
        this.getTxStatus = (txid) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                txID: txid
            };
            const response = yield this.callMethod("avm.getTxStatus", params);
            return response.data.result.status;
        });
        /**
         * Retrieves the UTXOs related to the addresses provided from the node's `getUTXOs` method.
         *
         * @param addresses An array of addresses as cb58 strings or addresses as {@link https://github.com/feross/buffer|Buffer}s
         * @param sourceChain A string for the chain to look for the UTXO's. Default is to use this chain, but if exported UTXOs exist from other chains, this can used to pull them instead.
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
            const response = yield this.callMethod("avm.getUTXOs", params);
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
            return response.data.result;
        });
        /**
         * Helper function which creates an unsigned transaction. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param amount The amount of AssetID to be spent in its smallest denomination, represented as {@link https://github.com/indutny/bn.js/|BN}.
         * @param assetID The assetID of the value being sent
         * @param toAddresses The addresses to send the funds
         * @param fromAddresses The addresses being used to send the funds from the UTXOs provided
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains a [[BaseTx]].
         *
         * @remarks
         * This helper exists because the endpoint API should be the primary point of entry for most functionality.
         */
        this.buildBaseTx = (utxoset, amount, assetID = undefined, toAddresses, fromAddresses, changeAddresses, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const to = this._cleanAddressArray(toAddresses, "buildBaseTx").map((a) => bintools.stringToAddress(a));
            const from = this._cleanAddressArray(fromAddresses, "buildBaseTx").map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, "buildBaseTx").map((a) => bintools.stringToAddress(a));
            if (typeof assetID === "string") {
                assetID = bintools.cb58Decode(assetID);
            }
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const builtUnsignedTx = utxoset.buildBaseTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), amount, assetID, to, from, change, this.getTxFee(), yield this.getAVAXAssetID(), memo, asOf, locktime, threshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildBaseTx:Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Helper function which creates an unsigned NFT Transfer. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset  A set of UTXOs that the transaction is built on
         * @param toAddresses The addresses to send the NFT
         * @param fromAddresses The addresses being used to send the NFT from the utxoID provided
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param utxoid A base58 utxoID or an array of base58 utxoIDs for the nfts this transaction is sending
         * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains a [[NFTTransferTx]].
         *
         * @remarks
         * This helper exists because the endpoint API should be the primary point of entry for most functionality.
         */
        this.buildNFTTransferTx = (utxoset, toAddresses, fromAddresses, changeAddresses, utxoid, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1) => __awaiter(this, void 0, void 0, function* () {
            const to = this._cleanAddressArray(toAddresses, "buildNFTTransferTx").map((a) => bintools.stringToAddress(a));
            const from = this._cleanAddressArray(fromAddresses, "buildNFTTransferTx").map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, "buildCreateNFTAssetTx").map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            let utxoidArray = [];
            if (typeof utxoid === "string") {
                utxoidArray = [utxoid];
            }
            else if (Array.isArray(utxoid)) {
                utxoidArray = utxoid;
            }
            const builtUnsignedTx = utxoset.buildNFTTransferTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), to, from, change, utxoidArray, this.getTxFee(), avaxAssetID, memo, asOf, locktime, threshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildNFTTransferTx:Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Helper function which creates an unsigned Import Tx. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset  A set of UTXOs that the transaction is built on
         * @param ownerAddresses The addresses being used to import
         * @param sourceChain The chainid for where the import is coming from
         * @param toAddresses The addresses to send the funds
         * @param fromAddresses The addresses being used to send the funds from the UTXOs provided
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
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
            const to = this._cleanAddressArray(toAddresses, "buildImportTx").map((a) => bintools.stringToAddress(a));
            const from = this._cleanAddressArray(fromAddresses, "buildImportTx").map((a) => bintools.stringToAddress(a));
            const change = this._cleanAddressArray(changeAddresses, "buildImportTx").map((a) => bintools.stringToAddress(a));
            let srcChain = undefined;
            if (typeof sourceChain === "undefined") {
                throw new errors_1.ChainIdError("Error - AVMAPI.buildImportTx: Source ChainID is undefined.");
            }
            else if (typeof sourceChain === "string") {
                srcChain = sourceChain;
                sourceChain = bintools.cb58Decode(sourceChain);
            }
            else if (!(sourceChain instanceof buffer_1.Buffer)) {
                srcChain = bintools.cb58Encode(sourceChain);
                throw new errors_1.ChainIdError("Error - AVMAPI.buildImportTx: Invalid destinationChain type: " + (typeof sourceChain));
            }
            const atomicUTXOs = (yield this.getUTXOs(ownerAddresses, srcChain, 0, undefined)).utxos;
            const avaxAssetID = yield this.getAVAXAssetID();
            const atomics = atomicUTXOs.getAllUTXOs();
            if (atomics.length === 0) {
                throw new errors_1.NoAtomicUTXOsError("Error - AVMAPI.buildImportTx: No atomic UTXOs to import from " + srcChain + " using addresses: " + ownerAddresses.join(", "));
            }
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            const builtUnsignedTx = utxoset.buildImportTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), to, from, change, atomics, sourceChain, this.getTxFee(), avaxAssetID, memo, asOf, locktime, threshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildImportTx:Failed Goose Egg Check");
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
         * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         * @param locktime Optional. The locktime field created in the resulting outputs
         * @param threshold Optional. The number of signatures required to spend the funds in the resultant UTXO
         * @param assetID Optional. The assetID of the asset to send. Defaults to AVAX assetID.
         * Regardless of the asset which you"re exporting, all fees are paid in AVAX.
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains an [[ExportTx]].
         */
        this.buildExportTx = (utxoset, amount, destinationChain, toAddresses, fromAddresses, changeAddresses = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0), threshold = 1, assetID = undefined) => __awaiter(this, void 0, void 0, function* () {
            let prefixes = {};
            toAddresses.map((a) => {
                prefixes[a.split("-")[0]] = true;
            });
            if (Object.keys(prefixes).length !== 1) {
                throw new errors_1.AddressError("Error - AVMAPI.buildExportTx: To addresses must have the same chainID prefix.");
            }
            if (typeof destinationChain === "undefined") {
                throw new errors_1.ChainIdError("Error - AVMAPI.buildExportTx: Destination ChainID is undefined.");
            }
            else if (typeof destinationChain === "string") {
                destinationChain = bintools.cb58Decode(destinationChain); //
            }
            else if (!(destinationChain instanceof buffer_1.Buffer)) {
                throw new errors_1.ChainIdError("Error - AVMAPI.buildExportTx: Invalid destinationChain type: " + (typeof destinationChain));
            }
            if (destinationChain.length !== 32) {
                throw new errors_1.ChainIdError("Error - AVMAPI.buildExportTx: Destination ChainID must be 32 bytes in length.");
            }
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
            if (typeof assetID === "undefined") {
                assetID = bintools.cb58Encode(avaxAssetID);
            }
            const builtUnsignedTx = utxoset.buildExportTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), amount, bintools.cb58Decode(assetID), to, from, change, destinationChain, this.getTxFee(), avaxAssetID, memo, asOf, locktime, threshold);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildExportTx:Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Creates an unsigned transaction. For more granular control, you may create your own
         * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
         *
         * @param utxoset A set of UTXOs that the transaction is built on
         * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
         * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
         * @param initialState The [[InitialStates]] that represent the intial state of a created asset
         * @param name String for the descriptive name of the asset
         * @param symbol String for the ticker symbol of the asset
         * @param denomination Number for the denomination which is 10^D. D must be >= 0 and <= 32. Ex: $1 AVAX = 10^9 $nAVAX
         * @param mintOutputs Optional. Array of [[SECPMintOutput]]s to be included in the transaction. These outputs can be spent to mint more tokens.
         * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
         * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
         *
         * @returns An unsigned transaction ([[UnsignedTx]]) which contains a [[CreateAssetTx]].
         *
         */
        this.buildCreateAssetTx = (utxoset, fromAddresses, changeAddresses, initialStates, name, symbol, denomination, mintOutputs = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow()) => __awaiter(this, void 0, void 0, function* () {
            let from = this._cleanAddressArray(fromAddresses, "buildCreateAssetTx").map((a) => bintools.stringToAddress(a));
            let change = this._cleanAddressArray(changeAddresses, "buildCreateNFTAssetTx").map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            /* istanbul ignore next */
            if (symbol.length > constants_1.AVMConstants.SYMBOLMAXLEN) {
                /* istanbul ignore next */
                throw new errors_1.SymbolError("Error - AVMAPI.buildCreateAssetTx: Symbols may not exceed length of " + constants_1.AVMConstants.SYMBOLMAXLEN);
            }
            /* istanbul ignore next */
            if (name.length > constants_1.AVMConstants.ASSETNAMELEN) {
                /* istanbul ignore next */
                throw new errors_1.NameError("Error - AVMAPI.buildCreateAssetTx: Names may not exceed length of " + constants_1.AVMConstants.ASSETNAMELEN);
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const builtUnsignedTx = utxoset.buildCreateAssetTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), from, change, initialStates, name, symbol, denomination, mintOutputs, this.getCreationTxFee(), avaxAssetID, memo, asOf);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildCreateAssetTx:Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        this.buildSECPMintTx = (utxoset, mintOwner, transferOwner, fromAddresses, changeAddresses, mintUTXOID, memo = undefined, asOf = helperfunctions_1.UnixNow()) => __awaiter(this, void 0, void 0, function* () {
            let from = this._cleanAddressArray(fromAddresses, "buildSECPMintTx").map((a) => bintools.stringToAddress(a));
            let change = this._cleanAddressArray(changeAddresses, "buildSECPMintTx").map((a) => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            let avaxAssetID = yield this.getAVAXAssetID();
            const builtUnsignedTx = utxoset.buildSECPMintTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), mintOwner, transferOwner, from, change, mintUTXOID, this.getTxFee(), avaxAssetID, memo, asOf);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildSECPMintTx:Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
        * Creates an unsigned transaction. For more granular control, you may create your own
        * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
        *
        * @param utxoset A set of UTXOs that the transaction is built on
        * @param fromAddresses The addresses being used to send the funds from the UTXOs {@link https://github.com/feross/buffer|Buffer}
        * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
        * @param minterSets is a list where each element specifies that threshold of the addresses in minters may together mint more of the asset by signing a minting transaction
        * @param name String for the descriptive name of the asset
        * @param symbol String for the ticker symbol of the asset
        * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        * @param locktime Optional. The locktime field created in the resulting mint output
        *
        * ```js
        * Example minterSets:
        * [
        *      {
        *          "minters":[
        *              "X-avax1ghstjukrtw8935lryqtnh643xe9a94u3tc75c7"
        *          ],
        *          "threshold": 1
        *      },
        *      {
        *          "minters": [
        *              "X-avax1yell3e4nln0m39cfpdhgqprsd87jkh4qnakklx",
        *              "X-avax1k4nr26c80jaquzm9369j5a4shmwcjn0vmemcjz",
        *              "X-avax1ztkzsrjnkn0cek5ryvhqswdtcg23nhge3nnr5e"
        *          ],
        *          "threshold": 2
        *      }
        * ]
        * ```
        *
        * @returns An unsigned transaction ([[UnsignedTx]]) which contains a [[CreateAssetTx]].
        *
        */
        this.buildCreateNFTAssetTx = (utxoset, fromAddresses, changeAddresses, minterSets, name, symbol, memo = undefined, asOf = helperfunctions_1.UnixNow(), locktime = new bn_js_1.default(0)) => __awaiter(this, void 0, void 0, function* () {
            let from = this._cleanAddressArray(fromAddresses, "buildCreateNFTAssetTx").map(a => bintools.stringToAddress(a));
            let change = this._cleanAddressArray(changeAddresses, "buildCreateNFTAssetTx").map(a => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            if (name.length > constants_1.AVMConstants.ASSETNAMELEN) {
                /* istanbul ignore next */
                throw new errors_1.NameError("Error - AVMAPI.buildCreateNFTAssetTx: Names may not exceed length of " + constants_1.AVMConstants.ASSETNAMELEN);
            }
            if (symbol.length > constants_1.AVMConstants.SYMBOLMAXLEN) {
                /* istanbul ignore next */
                throw new errors_1.SymbolError("Error - AVMAPI.buildCreateNFTAssetTx: Symbols may not exceed length of " + constants_1.AVMConstants.SYMBOLMAXLEN);
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            const builtUnsignedTx = utxoset.buildCreateNFTAssetTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), from, change, minterSets, name, symbol, this.getCreationTxFee(), avaxAssetID, memo, asOf, locktime);
            if (!(yield this.checkGooseEgg(builtUnsignedTx, this.getCreationTxFee()))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildCreateNFTAssetTx:Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
        * Creates an unsigned transaction. For more granular control, you may create your own
        * [[UnsignedTx]] manually (with their corresponding [[TransferableInput]]s, [[TransferableOutput]]s, and [[TransferOperation]]s).
        *
        * @param utxoset  A set of UTXOs that the transaction is built on
        * @param owners Either a single or an array of [[OutputOwners]] to send the nft output
        * @param fromAddresses The addresses being used to send the NFT from the utxoID provided
        * @param changeAddresses The addresses that can spend the change remaining from the spent UTXOs
        * @param utxoid A base58 utxoID or an array of base58 utxoIDs for the nft mint output this transaction is sending
        * @param groupID Optional. The group this NFT is issued to.
        * @param payload Optional. Data for NFT Payload as either a [[PayloadBase]] or a {@link https://github.com/feross/buffer|Buffer}
        * @param memo Optional CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
        * @param asOf Optional. The timestamp to verify the transaction against as a {@link https://github.com/indutny/bn.js/|BN}
        *
        * @returns An unsigned transaction ([[UnsignedTx]]) which contains an [[OperationTx]].
        *
        */
        this.buildCreateNFTMintTx = (utxoset, owners, fromAddresses, changeAddresses, utxoid, groupID = 0, payload = undefined, memo = undefined, asOf = helperfunctions_1.UnixNow()) => __awaiter(this, void 0, void 0, function* () {
            let from = this._cleanAddressArray(fromAddresses, "buildCreateNFTMintTx").map(a => bintools.stringToAddress(a));
            let change = this._cleanAddressArray(changeAddresses, "buildCreateNFTMintTx").map(a => bintools.stringToAddress(a));
            if (memo instanceof payload_1.PayloadBase) {
                memo = memo.getPayload();
            }
            if (payload instanceof payload_1.PayloadBase) {
                payload = payload.getPayload();
            }
            if (typeof utxoid === "string") {
                utxoid = [utxoid];
            }
            const avaxAssetID = yield this.getAVAXAssetID();
            if (owners instanceof output_1.OutputOwners) {
                owners = [owners];
            }
            const builtUnsignedTx = utxoset.buildCreateNFTMintTx(this.core.getNetworkID(), bintools.cb58Decode(this.blockchainID), owners, from, change, utxoid, groupID, payload, this.getTxFee(), avaxAssetID, memo, asOf);
            if (!(yield this.checkGooseEgg(builtUnsignedTx))) {
                /* istanbul ignore next */
                throw new errors_1.GooseEggCheckError("Error - AVMAPI.buildCreateNFTMintTx:Failed Goose Egg Check");
            }
            return builtUnsignedTx;
        });
        /**
         * Helper function which takes an unsigned transaction and signs it, returning the resulting [[Tx]].
        *
        * @param utx The unsigned transaction of type [[UnsignedTx]]
        *
        * @returns A signed transaction of type [[Tx]]
        */
        this.signTx = (utx) => utx.sign(this.keychain);
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
                throw new errors_1.TransactionError("Error - AVMAPI.issueTx: provided tx is not expected type of string, Buffer, or Tx");
            }
            const params = {
                tx: Transaction.toString(),
            };
            const response = yield this.callMethod("avm.issueTx", params);
            return response.data.result.txID;
        });
        /**
         * Sends an amount of assetID to the specified address from a list of owned of addresses.
         *
         * @param username The user that owns the private keys associated with the `from` addresses
         * @param password The password unlocking the user
         * @param assetID The assetID of the asset to send
         * @param amount The amount of the asset to be sent
         * @param to The address of the recipient
         * @param from Optional. An array of addresses managed by the node's keystore for this blockchain which will fund this transaction
         * @param changeAddr Optional. An address to send the change
         * @param memo Optional. CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
         *
         * @returns Promise for the string representing the transaction's ID.
         */
        this.send = (username, password, assetID, amount, to, from = undefined, changeAddr = undefined, memo = undefined) => __awaiter(this, void 0, void 0, function* () {
            let asset;
            let amnt;
            if (typeof this.parseAddress(to) === "undefined") {
                /* istanbul ignore next */
                throw new errors_1.AddressError("Error - AVMAPI.send: Invalid address format");
            }
            if (typeof assetID !== "string") {
                asset = bintools.cb58Encode(assetID);
            }
            else {
                asset = assetID;
            }
            if (typeof amount === "number") {
                amnt = new bn_js_1.default(amount);
            }
            else {
                amnt = amount;
            }
            const params = {
                username: username,
                password: password,
                assetID: asset,
                amount: amnt.toString(10),
                to: to
            };
            from = this._cleanAddressArray(from, "send");
            if (typeof from !== "undefined") {
                params["from"] = from;
            }
            if (typeof changeAddr !== "undefined") {
                if (typeof this.parseAddress(changeAddr) === "undefined") {
                    /* istanbul ignore next */
                    throw new errors_1.AddressError("Error - AVMAPI.send: Invalid address format");
                }
                params["changeAddr"] = changeAddr;
            }
            if (typeof memo !== "undefined") {
                if (typeof memo !== "string") {
                    params["memo"] = bintools.cb58Encode(memo);
                }
                else {
                    params["memo"] = memo;
                }
            }
            const response = yield this.callMethod("avm.send", params);
            return response.data.result;
        });
        /**
         * Sends an amount of assetID to an array of specified addresses from a list of owned of addresses.
         *
         * @param username The user that owns the private keys associated with the `from` addresses
         * @param password The password unlocking the user
         * @param sendOutputs The array of SendOutputs. A SendOutput is an object literal which contains an assetID, amount, and to.
         * @param from Optional. An array of addresses managed by the node's keystore for this blockchain which will fund this transaction
         * @param changeAddr Optional. An address to send the change
         * @param memo Optional. CB58 Buffer or String which contains arbitrary bytes, up to 256 bytes
         *
         * @returns Promise for the string representing the transaction"s ID.
         */
        this.sendMultiple = (username, password, sendOutputs, from = undefined, changeAddr = undefined, memo = undefined) => __awaiter(this, void 0, void 0, function* () {
            let asset;
            let amnt;
            let sOutputs = [];
            sendOutputs.forEach((output) => {
                if (typeof this.parseAddress(output.to) === "undefined") {
                    /* istanbul ignore next */
                    throw new errors_1.AddressError("Error - AVMAPI.sendMultiple: Invalid address format");
                }
                if (typeof output.assetID !== "string") {
                    asset = bintools.cb58Encode(output.assetID);
                }
                else {
                    asset = output.assetID;
                }
                if (typeof output.amount === "number") {
                    amnt = new bn_js_1.default(output.amount);
                }
                else {
                    amnt = output.amount;
                }
                sOutputs.push({ to: output.to, assetID: asset, amount: amnt.toString(10) });
            });
            const params = {
                username: username,
                password: password,
                outputs: sOutputs,
            };
            from = this._cleanAddressArray(from, "send");
            if (typeof from !== "undefined") {
                params["from"] = from;
            }
            if (typeof changeAddr !== "undefined") {
                if (typeof this.parseAddress(changeAddr) === "undefined") {
                    /* istanbul ignore next */
                    throw new errors_1.AddressError("Error - AVMAPI.send: Invalid address format");
                }
                params["changeAddr"] = changeAddr;
            }
            if (typeof memo !== "undefined") {
                if (typeof memo !== "string") {
                    params["memo"] = bintools.cb58Encode(memo);
                }
                else {
                    params["memo"] = memo;
                }
            }
            const response = yield this.callMethod("avm.sendMultiple", params);
            return response.data.result;
        });
        /**
         * Given a JSON representation of this Virtual Machine’s genesis state, create the byte representation of that state.
         *
         * @param genesisData The blockchain"s genesis data object
         *
         * @returns Promise of a string of bytes
         */
        this.buildGenesis = (genesisData) => __awaiter(this, void 0, void 0, function* () {
            const params = {
                genesisData,
            };
            const response = yield this.callMethod("avm.buildGenesis", params);
            return response.data.result.bytes;
        });
        this.blockchainID = blockchainID;
        const netid = core.getNetworkID();
        if (netid in constants_2.Defaults.network && blockchainID in constants_2.Defaults.network[netid]) {
            const { alias } = constants_2.Defaults.network[netid][blockchainID];
            this.keychain = new keychain_1.KeyChain(this.core.getHRP(), alias);
        }
        else {
            this.keychain = new keychain_1.KeyChain(this.core.getHRP(), blockchainID);
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
                        throw new errors_1.AddressError("Error - AVMAPI.${caller}: Invalid address format");
                    }
                    addrs.push(addresses[i]);
                }
                else {
                    const type = "bech32";
                    addrs.push(serialization.bufferToType(addresses[i], type, this.core.getHRP(), chainid));
                }
            }
        }
        return addrs;
    }
}
exports.AVMAPI = AVMAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FwaXMvYXZtL2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7O0VBR0U7QUFDRixrREFBc0I7QUFDdEIsb0NBQWdDO0FBRWhDLG9FQUEyQztBQUMzQyxtQ0FBdUM7QUFDdkMsMkNBQTBDO0FBQzFDLHlDQUFxQztBQUNyQyw2QkFBcUM7QUFDckMsaURBQWlEO0FBR2pELGlFQUFxRDtBQUNyRCxrREFBOEM7QUFFOUMscURBQTRFO0FBRzVFLGdEQUFrRDtBQUVsRCwrQ0FPMkI7QUFDM0IsdUNBQTJEO0FBRTNEOztFQUVFO0FBQ0YsTUFBTSxRQUFRLEdBQWEsa0JBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUNqRCxNQUFNLGFBQWEsR0FBa0IscUJBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQTtBQUVoRTs7Ozs7O0VBTUU7QUFDRixNQUFhLE1BQU8sU0FBUSxpQkFBTztJQXc2Q2pDOzs7Ozs7T0FNRztJQUNILFlBQVksSUFBbUIsRUFBRSxVQUFrQixXQUFXLEVBQUUsZUFBdUIsRUFBRTtRQUN2RixLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBLzZDdEI7O1VBRUU7UUFDUSxhQUFRLEdBQWEsSUFBSSxtQkFBUSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQTtRQUN6QyxpQkFBWSxHQUFXLEVBQUUsQ0FBQTtRQUN6QixvQkFBZSxHQUFXLFNBQVMsQ0FBQTtRQUNuQyxnQkFBVyxHQUFXLFNBQVMsQ0FBQTtRQUMvQixVQUFLLEdBQU8sU0FBUyxDQUFBO1FBQ3JCLGtCQUFhLEdBQU8sU0FBUyxDQUFBO1FBRXZDOzs7O1dBSUc7UUFDSCx1QkFBa0IsR0FBRyxHQUFVLEVBQUU7WUFDL0IsSUFBRyxPQUFPLElBQUksQ0FBQyxlQUFlLEtBQUssV0FBVyxFQUFDO2dCQUM3QyxNQUFNLEtBQUssR0FBVyxJQUFJLENBQUMs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LFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ2pELElBQUksT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO29CQUNwQyxJQUFJLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFXLENBQUMsS0FBSyxXQUFXLEVBQUU7d0JBQ3BFLDBCQUEwQjt3QkFDMUIsTUFBTSxJQUFJLHFCQUFZLENBQUMsa0RBQWtELENBQUMsQ0FBQTtxQkFDM0U7b0JBQ0QsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFXLENBQUMsQ0FBQTtpQkFDbkM7cUJBQU07b0JBQ0wsTUFBTSxJQUFJLEdBQW1CLFFBQVEsQ0FBQTtvQkFDckMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQVcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFBO2lCQUNsRzthQUNGO1NBQ0Y7UUFDRCxPQUFPLEtBQUssQ0FBQTtJQUNkLENBQUM7Q0FvQkY7QUExN0NELHdCQTA3Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4qIEBtb2R1bGUgQVBJLUFWTVxuKi9cbmltcG9ydCBCTiBmcm9tIFwiYm4uanNcIlxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcImJ1ZmZlci9cIlxuaW1wb3J0IEF2YWxhbmNoZUNvcmUgZnJvbSBcIi4uLy4uL2F2YWxhbmNoZVwiXG5pbXBvcnQgQmluVG9vbHMgZnJvbSBcIi4uLy4uL3V0aWxzL2JpbnRvb2xzXCJcbmltcG9ydCB7IFVUWE8sIFVUWE9TZXQgfSBmcm9tIFwiLi91dHhvc1wiXG5pbXBvcnQgeyBBVk1Db25zdGFudHMgfSBmcm9tIFwiLi9jb25zdGFudHNcIlxuaW1wb3J0IHsgS2V5Q2hhaW4gfSBmcm9tIFwiLi9rZXljaGFpblwiXG5pbXBvcnQgeyBUeCwgVW5zaWduZWRUeCB9IGZyb20gXCIuL3R4XCJcbmltcG9ydCB7IFBheWxvYWRCYXNlIH0gZnJvbSBcIi4uLy4uL3V0aWxzL3BheWxvYWRcIlxuaW1wb3J0IHsgU0VDUE1pbnRPdXRwdXQgfSBmcm9tIFwiLi9vdXRwdXRzXCJcbmltcG9ydCB7IEluaXRpYWxTdGF0ZXMgfSBmcm9tIFwiLi9pbml0aWFsc3RhdGVzXCJcbmltcG9ydCB7IFVuaXhOb3cgfSBmcm9tIFwiLi4vLi4vdXRpbHMvaGVscGVyZnVuY3Rpb25zXCJcbmltcG9ydCB7IEpSUENBUEkgfSBmcm9tIFwiLi4vLi4vY29tbW9uL2pycGNhcGlcIlxuaW1wb3J0IHsgUmVxdWVzdFJlc3BvbnNlRGF0YSB9IGZyb20gXCIuLi8uLi9jb21tb24vYXBpYmFzZVwiXG5pbXBvcnQgeyBEZWZhdWx0cywgUHJpbWFyeUFzc2V0QWxpYXMsIE9ORUFWQVggfSBmcm9tIFwiLi4vLi4vdXRpbHMvY29uc3RhbnRzXCJcbmltcG9ydCB7IE1pbnRlclNldCB9IGZyb20gXCIuL21pbnRlcnNldFwiXG5pbXBvcnQgeyBQZXJzaXN0YW5jZU9wdGlvbnMgfSBmcm9tIFwiLi4vLi4vdXRpbHMvcGVyc2lzdGVuY2VvcHRpb25zXCJcbmltcG9ydCB7IE91dHB1dE93bmVycyB9IGZyb20gXCIuLi8uLi9jb21tb24vb3V0cHV0XCJcbmltcG9ydCB7IFNFQ1BUcmFuc2Zlck91dHB1dCB9IGZyb20gXCIuL291dHB1dHNcIlxuaW1wb3J0IHsgQWRkcmVzc0Vycm9yLCBcbiAgR29vc2VFZ2dDaGVja0Vycm9yLFxuICBDaGFpbklkRXJyb3IsXG4gIE5vQXRvbWljVVRYT3NFcnJvcixcbiAgU3ltYm9sRXJyb3IsXG4gIE5hbWVFcnJvcixcbiAgVHJhbnNhY3Rpb25FcnJvclxufSBmcm9tIFwiLi4vLi4vdXRpbHMvZXJyb3JzXCJcbmltcG9ydCB7IFNlcmlhbGl6YXRpb24sIFNlcmlhbGl6ZWRUeXBlIH0gZnJvbSBcIi4uLy4uL3V0aWxzXCJcblxuLyoqXG4qIEBpZ25vcmVcbiovXG5jb25zdCBiaW50b29sczogQmluVG9vbHMgPSBCaW5Ub29scy5nZXRJbnN0YW5jZSgpXG5jb25zdCBzZXJpYWxpemF0aW9uOiBTZXJpYWxpemF0aW9uID0gU2VyaWFsaXphdGlvbi5nZXRJbnN0YW5jZSgpXG5cbi8qKlxuKiBDbGFzcyBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBhIG5vZGUgZW5kcG9pbnQgdGhhdCBpcyB1c2luZyB0aGUgQVZNLlxuKlxuKiBAY2F0ZWdvcnkgUlBDQVBJc1xuKlxuKiBAcmVtYXJrcyBUaGlzIGV4dGVuZHMgdGhlIFtbSlJQQ0FQSV1dIGNsYXNzLiBUaGlzIGNsYXNzIHNob3VsZCBub3QgYmUgZGlyZWN0bHkgY2FsbGVkLiBJbnN0ZWFkLCB1c2UgdGhlIFtbQXZhbGFuY2hlLmFkZEFQSV1dIGZ1bmN0aW9uIHRvIHJlZ2lzdGVyIHRoaXMgaW50ZXJmYWNlIHdpdGggQXZhbGFuY2hlLlxuKi9cbmV4cG9ydCBjbGFzcyBBVk1BUEkgZXh0ZW5kcyBKUlBDQVBJIHtcbiAgLyoqXG4gICogQGlnbm9yZVxuICAqL1xuICBwcm90ZWN0ZWQga2V5Y2hhaW46IEtleUNoYWluID0gbmV3IEtleUNoYWluKFwiXCIsIFwiXCIpXG4gIHByb3RlY3RlZCBibG9ja2NoYWluSUQ6IHN0cmluZyA9IFwiXCJcbiAgcHJvdGVjdGVkIGJsb2NrY2hhaW5BbGlhczogc3RyaW5nID0gdW5kZWZpbmVkXG4gIHByb3RlY3RlZCBBVkFYQXNzZXRJRDogQnVmZmVyID0gdW5kZWZpbmVkXG4gIHByb3RlY3RlZCB0eEZlZTogQk4gPSB1bmRlZmluZWRcbiAgcHJvdGVjdGVkIGNyZWF0aW9uVHhGZWU6IEJOID0gdW5kZWZpbmVkXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGFsaWFzIGZvciB0aGUgYmxvY2tjaGFpbklEIGlmIGl0IGV4aXN0cywgb3RoZXJ3aXNlIHJldHVybnMgYHVuZGVmaW5lZGAuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBhbGlhcyBmb3IgdGhlIGJsb2NrY2hhaW5JRFxuICAgKi9cbiAgZ2V0QmxvY2tjaGFpbkFsaWFzID0gKCk6c3RyaW5nID0+IHtcbiAgICBpZih0eXBlb2YgdGhpcy5ibG9ja2NoYWluQWxpYXMgPT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgY29uc3QgbmV0aWQ6IG51bWJlciA9IHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKVxuICAgICAgaWYgKG5ldGlkIGluIERlZmF1bHRzLm5ldHdvcmsgJiYgdGhpcy5ibG9ja2NoYWluSUQgaW4gRGVmYXVsdHMubmV0d29ya1tuZXRpZF0pIHtcbiAgICAgICAgdGhpcy5ibG9ja2NoYWluQWxpYXMgPSBEZWZhdWx0cy5uZXR3b3JrW25ldGlkXVt0aGlzLmJsb2NrY2hhaW5JRF0uYWxpYXNcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tjaGFpbkFsaWFzXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgfSBcbiAgICByZXR1cm4gdGhpcy5ibG9ja2NoYWluQWxpYXNcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHRoZSBhbGlhcyBmb3IgdGhlIGJsb2NrY2hhaW5JRC5cbiAgICogXG4gICAqIEBwYXJhbSBhbGlhcyBUaGUgYWxpYXMgZm9yIHRoZSBibG9ja2NoYWluSUQuXG4gICAqIFxuICAgKi9cbiAgc2V0QmxvY2tjaGFpbkFsaWFzID0gKGFsaWFzOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgIHRoaXMuYmxvY2tjaGFpbkFsaWFzID0gYWxpYXNcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBibG9ja2NoYWluSUQgYW5kIHJldHVybnMgaXQuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBibG9ja2NoYWluSURcbiAgICovXG4gIGdldEJsb2NrY2hhaW5JRCA9ICgpOiBzdHJpbmcgPT4gdGhpcy5ibG9ja2NoYWluSURcblxuICAvKipcbiAgICogUmVmcmVzaCBibG9ja2NoYWluSUQsIGFuZCBpZiBhIGJsb2NrY2hhaW5JRCBpcyBwYXNzZWQgaW4sIHVzZSB0aGF0LlxuICAgKlxuICAgKiBAcGFyYW0gT3B0aW9uYWwuIEJsb2NrY2hhaW5JRCB0byBhc3NpZ24sIGlmIG5vbmUsIHVzZXMgdGhlIGRlZmF1bHQgYmFzZWQgb24gbmV0d29ya0lELlxuICAgKlxuICAgKiBAcmV0dXJucyBUaGUgYmxvY2tjaGFpbklEXG4gICAqL1xuICByZWZyZXNoQmxvY2tjaGFpbklEID0gKGJsb2NrY2hhaW5JRDpzdHJpbmcgPSB1bmRlZmluZWQpOmJvb2xlYW4gPT4ge1xuICAgIGNvbnN0IG5ldGlkOiBudW1iZXIgPSB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKClcbiAgICBpZiAodHlwZW9mIGJsb2NrY2hhaW5JRCA9PT0gXCJ1bmRlZmluZWRcIiAmJiB0eXBlb2YgRGVmYXVsdHMubmV0d29ya1tuZXRpZF0gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuYmxvY2tjaGFpbklEID0gRGVmYXVsdHMubmV0d29ya1tuZXRpZF0uWC5ibG9ja2NoYWluSUQgLy9kZWZhdWx0IHRvIFgtQ2hhaW5cbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBpZiAodHlwZW9mIGJsb2NrY2hhaW5JRCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgdGhpcy5ibG9ja2NoYWluSUQgPSBibG9ja2NoYWluSURcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLyoqXG4gICAqIFRha2VzIGFuIGFkZHJlc3Mgc3RyaW5nIGFuZCByZXR1cm5zIGl0cyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSByZXByZXNlbnRhdGlvbiBpZiB2YWxpZC5cbiAgICpcbiAgICogQHJldHVybnMgQSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBmb3IgdGhlIGFkZHJlc3MgaWYgdmFsaWQsIHVuZGVmaW5lZCBpZiBub3QgdmFsaWQuXG4gICAqL1xuICBwYXJzZUFkZHJlc3MgPSAoYWRkcjogc3RyaW5nKTogQnVmZmVyID0+IHtcbiAgICBjb25zdCBhbGlhczogc3RyaW5nID0gdGhpcy5nZXRCbG9ja2NoYWluQWxpYXMoKVxuICAgIGNvbnN0IGJsb2NrY2hhaW5JRDogc3RyaW5nID0gdGhpcy5nZXRCbG9ja2NoYWluSUQoKVxuICAgIHJldHVybiBiaW50b29scy5wYXJzZUFkZHJlc3MoYWRkciwgYmxvY2tjaGFpbklELCBhbGlhcywgQVZNQ29uc3RhbnRzLkFERFJFU1NMRU5HVEgpXG4gIH1cblxuICBhZGRyZXNzRnJvbUJ1ZmZlciA9IChhZGRyZXNzOkJ1ZmZlcik6c3RyaW5nID0+IHtcbiAgICBjb25zdCBjaGFpbmlkOiBzdHJpbmcgPSB0aGlzLmdldEJsb2NrY2hhaW5BbGlhcygpID8gdGhpcy5nZXRCbG9ja2NoYWluQWxpYXMoKSA6IHRoaXMuZ2V0QmxvY2tjaGFpbklEKClcbiAgICBjb25zdCB0eXBlOiBTZXJpYWxpemVkVHlwZSA9IFwiYmVjaDMyXCJcbiAgICByZXR1cm4gc2VyaWFsaXphdGlvbi5idWZmZXJUb1R5cGUoYWRkcmVzcywgdHlwZSwgdGhpcy5jb3JlLmdldEhSUCgpLCBjaGFpbmlkKVxuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIEFWQVggQXNzZXRJRCBhbmQgcmV0dXJucyBpdCBpbiBhIFByb21pc2UuXG4gICAqXG4gICAqIEBwYXJhbSByZWZyZXNoIFRoaXMgZnVuY3Rpb24gY2FjaGVzIHRoZSByZXNwb25zZS4gUmVmcmVzaCA9IHRydWUgd2lsbCBidXN0IHRoZSBjYWNoZS5cbiAgICogXG4gICAqIEByZXR1cm5zIFRoZSB0aGUgcHJvdmlkZWQgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgQVZBWCBBc3NldElEXG4gICAqL1xuICBnZXRBVkFYQXNzZXRJRCA9IGFzeW5jIChyZWZyZXNoOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPEJ1ZmZlcj4gPT4ge1xuICAgIGlmICh0eXBlb2YgdGhpcy5BVkFYQXNzZXRJRCA9PT0gXCJ1bmRlZmluZWRcIiB8fCByZWZyZXNoKSB7XG4gICAgICBjb25zdCBhc3NldDp7XG4gICAgICAgIG5hbWU6IHN0cmluZ1xuICAgICAgICBzeW1ib2w6IHN0cmluZ1xuICAgICAgICBhc3NldElEOiBCdWZmZXJcbiAgICAgICAgZGVub21pbmF0aW9uOiBudW1iZXJcbiAgICAgIH0gPSBhd2FpdCB0aGlzLmdldEFzc2V0RGVzY3JpcHRpb24oUHJpbWFyeUFzc2V0QWxpYXMpXG4gICAgICB0aGlzLkFWQVhBc3NldElEID0gYXNzZXQuYXNzZXRJRFxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5BVkFYQXNzZXRJRFxuICB9XG4gIFxuICAvKipcbiAgICogT3ZlcnJpZGVzIHRoZSBkZWZhdWx0cyBhbmQgc2V0cyB0aGUgY2FjaGUgdG8gYSBzcGVjaWZpYyBBVkFYIEFzc2V0SURcbiAgICogXG4gICAqIEBwYXJhbSBhdmF4QXNzZXRJRCBBIGNiNTggc3RyaW5nIG9yIEJ1ZmZlciByZXByZXNlbnRpbmcgdGhlIEFWQVggQXNzZXRJRFxuICAgKiBcbiAgICogQHJldHVybnMgVGhlIHRoZSBwcm92aWRlZCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBBVkFYIEFzc2V0SURcbiAgICovXG4gIHNldEFWQVhBc3NldElEID0gKGF2YXhBc3NldElEOnN0cmluZyB8IEJ1ZmZlcikgPT4ge1xuICAgIGlmKHR5cGVvZiBhdmF4QXNzZXRJRCA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgYXZheEFzc2V0SUQgPSBiaW50b29scy5jYjU4RGVjb2RlKGF2YXhBc3NldElEKVxuICAgIH1cbiAgICB0aGlzLkFWQVhBc3NldElEID0gYXZheEFzc2V0SURcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBkZWZhdWx0IHR4IGZlZSBmb3IgdGhpcyBjaGFpbi5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGRlZmF1bHQgdHggZmVlIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICovXG4gIGdldERlZmF1bHRUeEZlZSA9ICAoKTpCTiA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKSBpbiBEZWZhdWx0cy5uZXR3b3JrID8gbmV3IEJOKERlZmF1bHRzLm5ldHdvcmtbdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpXVtcIlhcIl1bXCJ0eEZlZVwiXSkgOiBuZXcgQk4oMClcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSB0eCBmZWUgZm9yIHRoaXMgY2hhaW4uXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSB0eCBmZWUgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKi9cbiAgZ2V0VHhGZWUgPSAoKTpCTiA9PiB7XG4gICAgaWYodHlwZW9mIHRoaXMudHhGZWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMudHhGZWUgPSB0aGlzLmdldERlZmF1bHRUeEZlZSgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnR4RmVlXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgdHggZmVlIGZvciB0aGlzIGNoYWluLlxuICAgKlxuICAgKiBAcGFyYW0gZmVlIFRoZSB0eCBmZWUgYW1vdW50IHRvIHNldCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKi9cbiAgc2V0VHhGZWUgPSAoZmVlOkJOKSA9PiB7XG4gICAgdGhpcy50eEZlZSA9IGZlZVxuICB9XG5cblxuICAvKipcbiAgICogR2V0cyB0aGUgZGVmYXVsdCBjcmVhdGlvbiBmZWUgZm9yIHRoaXMgY2hhaW4uXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBkZWZhdWx0IGNyZWF0aW9uIGZlZSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqL1xuICBnZXREZWZhdWx0Q3JlYXRpb25UeEZlZSA9ICAoKTpCTiA9PiB7XG4gICAgcmV0dXJuIHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKSBpbiBEZWZhdWx0cy5uZXR3b3JrID8gbmV3IEJOKERlZmF1bHRzLm5ldHdvcmtbdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpXVtcIlhcIl1bXCJjcmVhdGlvblR4RmVlXCJdKSA6IG5ldyBCTigwKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGNyZWF0aW9uIGZlZSBmb3IgdGhpcyBjaGFpbi5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGNyZWF0aW9uIGZlZSBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqL1xuICBnZXRDcmVhdGlvblR4RmVlID0gKCk6Qk4gPT4ge1xuICAgIGlmKHR5cGVvZiB0aGlzLmNyZWF0aW9uVHhGZWUgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuY3JlYXRpb25UeEZlZSA9IHRoaXMuZ2V0RGVmYXVsdENyZWF0aW9uVHhGZWUoKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jcmVhdGlvblR4RmVlXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgY3JlYXRpb24gZmVlIGZvciB0aGlzIGNoYWluLlxuICAgKlxuICAgKiBAcGFyYW0gZmVlIFRoZSBjcmVhdGlvbiBmZWUgYW1vdW50IHRvIHNldCBhcyB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKi9cbiAgc2V0Q3JlYXRpb25UeEZlZSA9IChmZWU6Qk4pID0+IHtcbiAgICB0aGlzLmNyZWF0aW9uVHhGZWUgPSBmZWVcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgcmVmZXJlbmNlIHRvIHRoZSBrZXljaGFpbiBmb3IgdGhpcyBjbGFzcy5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIGluc3RhbmNlIG9mIFtbS2V5Q2hhaW5dXSBmb3IgdGhpcyBjbGFzc1xuICAgKi9cbiAga2V5Q2hhaW4gPSAoKTogS2V5Q2hhaW4gPT4gdGhpcy5rZXljaGFpblxuXG4gIC8qKlxuICAgKiBAaWdub3JlXG4gICAqL1xuICBuZXdLZXlDaGFpbiA9ICgpOktleUNoYWluID0+IHtcbiAgICAvLyB3YXJuaW5nLCBvdmVyd3JpdGVzIHRoZSBvbGQga2V5Y2hhaW5cbiAgICBjb25zdCBhbGlhcyA9IHRoaXMuZ2V0QmxvY2tjaGFpbkFsaWFzKClcbiAgICBpZiAoYWxpYXMpIHtcbiAgICAgIHRoaXMua2V5Y2hhaW4gPSBuZXcgS2V5Q2hhaW4odGhpcy5jb3JlLmdldEhSUCgpLCBhbGlhcylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5rZXljaGFpbiA9IG5ldyBLZXlDaGFpbih0aGlzLmNvcmUuZ2V0SFJQKCksIHRoaXMuYmxvY2tjaGFpbklEKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5rZXljaGFpblxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCBkZXRlcm1pbmVzIGlmIGEgdHggaXMgYSBnb29zZSBlZ2cgdHJhbnNhY3Rpb24uIFxuICAgKlxuICAgKiBAcGFyYW0gdXR4IEFuIFVuc2lnbmVkVHhcbiAgICpcbiAgICogQHJldHVybnMgYm9vbGVhbiB0cnVlIGlmIHBhc3NlcyBnb29zZSBlZ2cgdGVzdCBhbmQgZmFsc2UgaWYgZmFpbHMuXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIEEgXCJHb29zZSBFZ2cgVHJhbnNhY3Rpb25cIiBpcyB3aGVuIHRoZSBmZWUgZmFyIGV4Y2VlZHMgYSByZWFzb25hYmxlIGFtb3VudFxuICAgKi9cbiAgY2hlY2tHb29zZUVnZyA9IGFzeW5jICh1dHg6VW5zaWduZWRUeCwgb3V0VG90YWw6Qk4gPSBuZXcgQk4oMCkpOiBQcm9taXNlPGJvb2xlYW4+ID0+IHtcbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG4gICAgbGV0IG91dHB1dFRvdGFsOiBCTiA9IG91dFRvdGFsLmd0KG5ldyBCTigwKSkgPyBvdXRUb3RhbCA6IHV0eC5nZXRPdXRwdXRUb3RhbChhdmF4QXNzZXRJRClcbiAgICBjb25zdCBmZWU6IEJOID0gdXR4LmdldEJ1cm4oYXZheEFzc2V0SUQpXG4gICAgaWYoZmVlLmx0ZShPTkVBVkFYLm11bChuZXcgQk4oMTApKSkgfHwgZmVlLmx0ZShvdXRwdXRUb3RhbCkpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgICAqIEdldHMgdGhlIGJhbGFuY2Ugb2YgYSBwYXJ0aWN1bGFyIGFzc2V0IG9uIGEgYmxvY2tjaGFpbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhZGRyZXNzIFRoZSBhZGRyZXNzIHRvIHB1bGwgdGhlIGFzc2V0IGJhbGFuY2UgZnJvbVxuICAgICAqIEBwYXJhbSBhc3NldElEIFRoZSBhc3NldElEIHRvIHB1bGwgdGhlIGJhbGFuY2UgZnJvbVxuICAgICAqXG4gICAgICogQHJldHVybnMgUHJvbWlzZSB3aXRoIHRoZSBiYWxhbmNlIG9mIHRoZSBhc3NldElEIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0gb24gdGhlIHByb3ZpZGVkIGFkZHJlc3MgZm9yIHRoZSBibG9ja2NoYWluLlxuICAgICAqL1xuICBnZXRCYWxhbmNlID0gYXN5bmMgKGFkZHJlc3M6IHN0cmluZywgYXNzZXRJRDogc3RyaW5nKTogUHJvbWlzZTxvYmplY3Q+ID0+IHtcbiAgICBpZiAodHlwZW9mIHRoaXMucGFyc2VBZGRyZXNzKGFkZHJlc3MpID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihcIkVycm9yIC0gQVZNQVBJLmdldEJhbGFuY2U6IEludmFsaWQgYWRkcmVzcyBmb3JtYXRcIilcbiAgICB9XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICBhZGRyZXNzLFxuICAgICAgYXNzZXRJRFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcImF2bS5nZXRCYWxhbmNlXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgICAqIENyZWF0ZXMgYW4gYWRkcmVzcyAoYW5kIGFzc29jaWF0ZWQgcHJpdmF0ZSBrZXlzKSBvbiBhIHVzZXIgb24gYSBibG9ja2NoYWluLlxuICAgICAqXG4gICAgICogQHBhcmFtIHVzZXJuYW1lIE5hbWUgb2YgdGhlIHVzZXIgdG8gY3JlYXRlIHRoZSBhZGRyZXNzIHVuZGVyXG4gICAgICogQHBhcmFtIHBhc3N3b3JkIFBhc3N3b3JkIHRvIHVubG9jayB0aGUgdXNlciBhbmQgZW5jcnlwdCB0aGUgcHJpdmF0ZSBrZXlcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFByb21pc2UgZm9yIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgYWRkcmVzcyBjcmVhdGVkIGJ5IHRoZSB2bS5cbiAgICAgKi9cbiAgY3JlYXRlQWRkcmVzcyA9IGFzeW5jICh1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmRcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJhdm0uY3JlYXRlQWRkcmVzc1wiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LmFkZHJlc3NcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgZml4ZWQtY2FwLCBmdW5naWJsZSBhc3NldC4gQSBxdWFudGl0eSBvZiBpdCBpcyBjcmVhdGVkIGF0IGluaXRpYWxpemF0aW9uIGFuZCB0aGVyZSBubyBtb3JlIGlzIGV2ZXIgY3JlYXRlZC5cbiAgICpcbiAgICogQHBhcmFtIHVzZXJuYW1lIFRoZSB1c2VyIHBheWluZyB0aGUgdHJhbnNhY3Rpb24gZmVlIChpbiAkQVZBWCkgZm9yIGFzc2V0IGNyZWF0aW9uXG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgZm9yIHRoZSB1c2VyIHBheWluZyB0aGUgdHJhbnNhY3Rpb24gZmVlIChpbiAkQVZBWCkgZm9yIGFzc2V0IGNyZWF0aW9uXG4gICAqIEBwYXJhbSBuYW1lIFRoZSBodW1hbi1yZWFkYWJsZSBuYW1lIGZvciB0aGUgYXNzZXRcbiAgICogQHBhcmFtIHN5bWJvbCBPcHRpb25hbC4gVGhlIHNob3J0aGFuZCBzeW1ib2wgZm9yIHRoZSBhc3NldC4gQmV0d2VlbiAwIGFuZCA0IGNoYXJhY3RlcnNcbiAgICogQHBhcmFtIGRlbm9taW5hdGlvbiBPcHRpb25hbC4gRGV0ZXJtaW5lcyBob3cgYmFsYW5jZXMgb2YgdGhpcyBhc3NldCBhcmUgZGlzcGxheWVkIGJ5IHVzZXIgaW50ZXJmYWNlcy4gRGVmYXVsdCBpcyAwXG4gICAqIEBwYXJhbSBpbml0aWFsSG9sZGVycyBBbiBhcnJheSBvZiBvYmplY3RzIGNvbnRhaW5pbmcgdGhlIGZpZWxkIFwiYWRkcmVzc1wiIGFuZCBcImFtb3VudFwiIHRvIGVzdGFibGlzaCB0aGUgZ2VuZXNpcyB2YWx1ZXMgZm9yIHRoZSBuZXcgYXNzZXRcbiAgICpcbiAgICogYGBganNcbiAgICogRXhhbXBsZSBpbml0aWFsSG9sZGVyczpcbiAgICogW1xuICAgKiAgICAge1xuICAgKiAgICAgICAgIFwiYWRkcmVzc1wiOiBcIlgtYXZheDFrajA2bGhneDg0aDM5c25zbGpjZXkzdHBjMDQ2emU2OG1lazNnNVwiLFxuICAgKiAgICAgICAgIFwiYW1vdW50XCI6IDEwMDAwXG4gICAqICAgICB9LFxuICAgKiAgICAge1xuICAgKiAgICAgICAgIFwiYWRkcmVzc1wiOiBcIlgtYXZheDFhbTR3NmhmcnZtaDNha2R1emtqdGhydGd0cWFmYWxjZTZhbjhjclwiLFxuICAgKiAgICAgICAgIFwiYW1vdW50XCI6IDUwMDAwXG4gICAqICAgICB9XG4gICAqIF1cbiAgICogYGBgXG4gICAqXG4gICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPHN0cmluZz4gY29udGFpbmluZyB0aGUgYmFzZSA1OCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIElEIG9mIHRoZSBuZXdseSBjcmVhdGVkIGFzc2V0LlxuICAgKi9cbiAgY3JlYXRlRml4ZWRDYXBBc3NldCA9IGFzeW5jICh1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBuYW1lOiBzdHJpbmcsIHN5bWJvbDogc3RyaW5nLCBkZW5vbWluYXRpb246IG51bWJlciwgaW5pdGlhbEhvbGRlcnM6IG9iamVjdFtdKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIG5hbWUsXG4gICAgICBzeW1ib2wsXG4gICAgICBkZW5vbWluYXRpb24sXG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgaW5pdGlhbEhvbGRlcnNcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJhdm0uY3JlYXRlRml4ZWRDYXBBc3NldFwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LmFzc2V0SURcbiAgfVxuXG4gIC8qKlxuICAgICAqIENyZWF0ZSBhIG5ldyB2YXJpYWJsZS1jYXAsIGZ1bmdpYmxlIGFzc2V0LiBObyB1bml0cyBvZiB0aGUgYXNzZXQgZXhpc3QgYXQgaW5pdGlhbGl6YXRpb24uIE1pbnRlcnMgY2FuIG1pbnQgdW5pdHMgb2YgdGhpcyBhc3NldCB1c2luZyBjcmVhdGVNaW50VHgsIHNpZ25NaW50VHggYW5kIHNlbmRNaW50VHguXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXIgcGF5aW5nIHRoZSB0cmFuc2FjdGlvbiBmZWUgKGluICRBVkFYKSBmb3IgYXNzZXQgY3JlYXRpb25cbiAgICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIGZvciB0aGUgdXNlciBwYXlpbmcgdGhlIHRyYW5zYWN0aW9uIGZlZSAoaW4gJEFWQVgpIGZvciBhc3NldCBjcmVhdGlvblxuICAgICAqIEBwYXJhbSBuYW1lIFRoZSBodW1hbi1yZWFkYWJsZSBuYW1lIGZvciB0aGUgYXNzZXRcbiAgICAgKiBAcGFyYW0gc3ltYm9sIE9wdGlvbmFsLiBUaGUgc2hvcnRoYW5kIHN5bWJvbCBmb3IgdGhlIGFzc2V0IC0tIGJldHdlZW4gMCBhbmQgNCBjaGFyYWN0ZXJzXG4gICAgICogQHBhcmFtIGRlbm9taW5hdGlvbiBPcHRpb25hbC4gRGV0ZXJtaW5lcyBob3cgYmFsYW5jZXMgb2YgdGhpcyBhc3NldCBhcmUgZGlzcGxheWVkIGJ5IHVzZXIgaW50ZXJmYWNlcy4gRGVmYXVsdCBpcyAwXG4gICAgICogQHBhcmFtIG1pbnRlclNldHMgaXMgYSBsaXN0IHdoZXJlIGVhY2ggZWxlbWVudCBzcGVjaWZpZXMgdGhhdCB0aHJlc2hvbGQgb2YgdGhlIGFkZHJlc3NlcyBpbiBtaW50ZXJzIG1heSB0b2dldGhlciBtaW50IG1vcmUgb2YgdGhlIGFzc2V0IGJ5IHNpZ25pbmcgYSBtaW50aW5nIHRyYW5zYWN0aW9uXG4gICAgICogXG4gICAgICogYGBganNcbiAgICAgKiBFeGFtcGxlIG1pbnRlclNldHM6XG4gICAgICogW1xuICAgICAqICAgICAge1xuICAgICAqICAgICAgICAgIFwibWludGVyc1wiOltcbiAgICAgKiAgICAgICAgICAgICAgXCJYLWF2YXgxYW00dzZoZnJ2bWgzYWtkdXpranRocnRndHFhZmFsY2U2YW44Y3JcIlxuICAgICAqICAgICAgICAgIF0sXG4gICAgICogICAgICAgICAgXCJ0aHJlc2hvbGRcIjogMVxuICAgICAqICAgICAgfSxcbiAgICAgKiAgICAgIHtcbiAgICAgKiAgICAgICAgICBcIm1pbnRlcnNcIjogW1xuICAgICAqICAgICAgICAgICAgICBcIlgtYXZheDFhbTR3NmhmcnZtaDNha2R1emtqdGhydGd0cWFmYWxjZTZhbjhjclwiLFxuICAgICAqICAgICAgICAgICAgICBcIlgtYXZheDFrajA2bGhneDg0aDM5c25zbGpjZXkzdHBjMDQ2emU2OG1lazNnNVwiLFxuICAgICAqICAgICAgICAgICAgICBcIlgtYXZheDF5ZWxsM2U0bmxuMG0zOWNmcGRoZ3FwcnNkODdqa2g0cW5ha2tseFwiXG4gICAgICogICAgICAgICAgXSxcbiAgICAgKiAgICAgICAgICBcInRocmVzaG9sZFwiOiAyXG4gICAgICogICAgICB9XG4gICAgICogXVxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2U8c3RyaW5nPiBjb250YWluaW5nIHRoZSBiYXNlIDU4IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgSUQgb2YgdGhlIG5ld2x5IGNyZWF0ZWQgYXNzZXQuXG4gICAgICovXG4gIGNyZWF0ZVZhcmlhYmxlQ2FwQXNzZXQgPSBhc3luYyAodXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZywgbmFtZTogc3RyaW5nLCBzeW1ib2w6IHN0cmluZywgZGVub21pbmF0aW9uOiBudW1iZXIsIG1pbnRlclNldHM6IG9iamVjdFtdKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIG5hbWUsXG4gICAgICBzeW1ib2wsXG4gICAgICBkZW5vbWluYXRpb24sXG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgbWludGVyU2V0c1xuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcImF2bS5jcmVhdGVWYXJpYWJsZUNhcEFzc2V0XCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuYXNzZXRJRFxuICB9XG5cbiAgLyoqXG4gICAgICogQ3JlYXRlIGFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIHRvIG1pbnQgbW9yZSBvZiBhbiBhc3NldC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhbW91bnQgVGhlIHVuaXRzIG9mIHRoZSBhc3NldCB0byBtaW50XG4gICAgICogQHBhcmFtIGFzc2V0SUQgVGhlIElEIG9mIHRoZSBhc3NldCB0byBtaW50XG4gICAgICogQHBhcmFtIHRvIFRoZSBhZGRyZXNzIHRvIGFzc2lnbiB0aGUgdW5pdHMgb2YgdGhlIG1pbnRlZCBhc3NldFxuICAgICAqIEBwYXJhbSBtaW50ZXJzIEFkZHJlc3NlcyBvZiB0aGUgbWludGVycyByZXNwb25zaWJsZSBmb3Igc2lnbmluZyB0aGUgdHJhbnNhY3Rpb25cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPHN0cmluZz4gY29udGFpbmluZyB0aGUgYmFzZSA1OCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHVuc2lnbmVkIHRyYW5zYWN0aW9uLlxuICAgICAqL1xuICBtaW50ID0gYXN5bmMgKHVzZXJuYW1lOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIGFtb3VudDogbnVtYmVyIHwgQk4sIGFzc2V0SUQ6IEJ1ZmZlciB8IHN0cmluZywgdG86IHN0cmluZywgbWludGVyczogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGxldCBhc3NldDogc3RyaW5nXG4gICAgbGV0IGFtbnQ6IEJOXG4gICAgaWYgKHR5cGVvZiBhc3NldElEICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICBhc3NldCA9IGJpbnRvb2xzLmNiNThFbmNvZGUoYXNzZXRJRClcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzZXQgPSBhc3NldElEXG4gICAgfVxuICAgIGlmICh0eXBlb2YgYW1vdW50ID09PSBcIm51bWJlclwiKSB7XG4gICAgICBhbW50ID0gbmV3IEJOKGFtb3VudClcbiAgICB9IGVsc2Uge1xuICAgICAgYW1udCA9IGFtb3VudFxuICAgIH1cbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgIGFtb3VudDogYW1udC50b1N0cmluZygxMCksXG4gICAgICBhc3NldElEOiBhc3NldCxcbiAgICAgIHRvLFxuICAgICAgbWludGVyc1xuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcImF2bS5taW50XCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQudHhJRFxuICB9XG5cbiAgLyoqXG4gICAgICogRXhwb3J0cyB0aGUgcHJpdmF0ZSBrZXkgZm9yIGFuIGFkZHJlc3MuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIG5hbWUgb2YgdGhlIHVzZXIgd2l0aCB0aGUgcHJpdmF0ZSBrZXlcbiAgICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIHVzZWQgdG8gZGVjcnlwdCB0aGUgcHJpdmF0ZSBrZXlcbiAgICAgKiBAcGFyYW0gYWRkcmVzcyBUaGUgYWRkcmVzcyB3aG9zZSBwcml2YXRlIGtleSBzaG91bGQgYmUgZXhwb3J0ZWRcbiAgICAgKlxuICAgICAqIEByZXR1cm5zIFByb21pc2Ugd2l0aCB0aGUgZGVjcnlwdGVkIHByaXZhdGUga2V5IGFzIHN0b3JlIGluIHRoZSBkYXRhYmFzZVxuICAgICAqL1xuICBleHBvcnRLZXkgPSBhc3luYyAodXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZywgYWRkcmVzczogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBpZiAodHlwZW9mIHRoaXMucGFyc2VBZGRyZXNzKGFkZHJlc3MpID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihcIkVycm9yIC0gQVZNQVBJLmV4cG9ydEtleTogSW52YWxpZCBhZGRyZXNzIGZvcm1hdFwiKVxuICAgIH1cbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBhZGRyZXNzXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwiYXZtLmV4cG9ydEtleVwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnByaXZhdGVLZXlcbiAgfVxuXG4gIC8qKlxuICAgICAqIEltcG9ydHMgYSBwcml2YXRlIGtleSBpbnRvIHRoZSBub2RlJ3Mga2V5c3RvcmUgdW5kZXIgYW4gdXNlciBhbmQgZm9yIGEgYmxvY2tjaGFpbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgbmFtZSBvZiB0aGUgdXNlciB0byBzdG9yZSB0aGUgcHJpdmF0ZSBrZXlcbiAgICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIHRoYXQgdW5sb2NrcyB0aGUgdXNlclxuICAgICAqIEBwYXJhbSBwcml2YXRlS2V5IEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgcHJpdmF0ZSBrZXkgaW4gdGhlIHZtJ3MgZm9ybWF0XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBUaGUgYWRkcmVzcyBmb3IgdGhlIGltcG9ydGVkIHByaXZhdGUga2V5LlxuICAgICAqL1xuICBpbXBvcnRLZXkgPSBhc3luYyAodXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZywgcHJpdmF0ZUtleTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgICBwcml2YXRlS2V5XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwiYXZtLmltcG9ydEtleVwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LmFkZHJlc3NcbiAgfVxuXG4gIC8qKlxuICAgICogU2VuZCBBTlQgKEF2YWxhbmNoZSBOYXRpdmUgVG9rZW4pIGFzc2V0cyBpbmNsdWRpbmcgQVZBWCBmcm9tIHRoZSBYLUNoYWluIHRvIGFuIGFjY291bnQgb24gdGhlIFAtQ2hhaW4gb3IgQy1DaGFpbi5cbiAgICAqXG4gICAgKiBBZnRlciBjYWxsaW5nIHRoaXMgbWV0aG9kLCB5b3UgbXVzdCBjYWxsIHRoZSBQLUNoYWluJ3MgYGltcG9ydEFWQVhgIG9yIHRoZSBDLUNoYWlu4oCZcyBgaW1wb3J0YCBtZXRob2QgdG8gY29tcGxldGUgdGhlIHRyYW5zZmVyLlxuICAgICpcbiAgICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgS2V5c3RvcmUgdXNlciB0aGF0IGNvbnRyb2xzIHRoZSBQLUNoYWluIG9yIEMtQ2hhaW4gYWNjb3VudCBzcGVjaWZpZWQgaW4gYHRvYFxuICAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgICogQHBhcmFtIHRvIFRoZSBhY2NvdW50IG9uIHRoZSBQLUNoYWluIG9yIEMtQ2hhaW4gdG8gc2VuZCB0aGUgYXNzZXQgdG8uIFxuICAgICogQHBhcmFtIGFtb3VudCBBbW91bnQgb2YgYXNzZXQgdG8gZXhwb3J0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICAqIEBwYXJhbSBhc3NldElEIFRoZSBhc3NldCBpZCB3aGljaCBpcyBiZWluZyBzZW50XG4gICAgKlxuICAgICogQHJldHVybnMgU3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdHJhbnNhY3Rpb24gaWRcbiAgICAqL1xuICBleHBvcnQgPSBhc3luYyAodXNlcm5hbWU6IHN0cmluZywgcGFzc3dvcmQ6IHN0cmluZywgdG86IHN0cmluZywgYW1vdW50OiBCTiwgYXNzZXRJRDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHRvLFxuICAgICAgYW1vdW50OiBhbW91bnQudG9TdHJpbmcoMTApLFxuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZCxcbiAgICAgIGFzc2V0SURcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJhdm0uZXhwb3J0XCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQudHhJRFxuICB9XG5cbiAgLyoqXG4gICAgICogU2VuZCBBVkFYIGZyb20gdGhlIFgtQ2hhaW4gdG8gYW4gYWNjb3VudCBvbiB0aGUgUC1DaGFpbiBvciBDLUNoYWluLlxuICAgICAqXG4gICAgICogQWZ0ZXIgY2FsbGluZyB0aGlzIG1ldGhvZCwgeW91IG11c3QgY2FsbCB0aGUgUC1DaGFpbuKAmXMgb3IgQy1DaGFpbidzIGltcG9ydEFWQVggbWV0aG9kIHRvIGNvbXBsZXRlIHRoZSB0cmFuc2Zlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgS2V5c3RvcmUgdXNlciB0aGF0IGNvbnRyb2xzIHRoZSBQLUNoYWluIGFjY291bnQgc3BlY2lmaWVkIGluIGB0b2BcbiAgICAgKiBAcGFyYW0gcGFzc3dvcmQgVGhlIHBhc3N3b3JkIG9mIHRoZSBLZXlzdG9yZSB1c2VyXG4gICAgICogQHBhcmFtIHRvIFRoZSBhY2NvdW50IG9uIHRoZSBQLUNoYWluIG9yIEMtQ2hhaW4gdG8gc2VuZCB0aGUgQVZBWCB0by5cbiAgICAgKiBAcGFyYW0gYW1vdW50IEFtb3VudCBvZiBBVkFYIHRvIGV4cG9ydCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBTdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB0cmFuc2FjdGlvbiBpZFxuICAgICAqL1xuICBleHBvcnRBVkFYID0gYXN5bmMgKHVzZXJuYW1lOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIHRvOiBzdHJpbmcsIGFtb3VudDogQk4pOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgdG8sXG4gICAgICBhbW91bnQ6IGFtb3VudC50b1N0cmluZygxMCksXG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwiYXZtLmV4cG9ydEFWQVhcIiwgcGFyYW1zKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC50eElEXG4gIH1cblxuICAvKipcbiAgICogU2VuZCBBTlQgKEF2YWxhbmNoZSBOYXRpdmUgVG9rZW4pIGFzc2V0cyBpbmNsdWRpbmcgQVZBWCBmcm9tIGFuIGFjY291bnQgb24gdGhlIFAtQ2hhaW4gb3IgQy1DaGFpbiB0byBhbiBhZGRyZXNzIG9uIHRoZSBYLUNoYWluLiBUaGlzIHRyYW5zYWN0aW9uXG4gICAqIG11c3QgYmUgc2lnbmVkIHdpdGggdGhlIGtleSBvZiB0aGUgYWNjb3VudCB0aGF0IHRoZSBhc3NldCBpcyBzZW50IGZyb20gYW5kIHdoaWNoIHBheXNcbiAgICogdGhlIHRyYW5zYWN0aW9uIGZlZS5cbiAgICpcbiAgICogQHBhcmFtIHVzZXJuYW1lIFRoZSBLZXlzdG9yZSB1c2VyIHRoYXQgY29udHJvbHMgdGhlIGFjY291bnQgc3BlY2lmaWVkIGluIGB0b2BcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCBvZiB0aGUgS2V5c3RvcmUgdXNlclxuICAgKiBAcGFyYW0gdG8gVGhlIGFkZHJlc3Mgb2YgdGhlIGFjY291bnQgdGhlIGFzc2V0IGlzIHNlbnQgdG8uXG4gICAqIEBwYXJhbSBzb3VyY2VDaGFpbiBUaGUgY2hhaW5JRCB3aGVyZSB0aGUgZnVuZHMgYXJlIGNvbWluZyBmcm9tLiBFeDogXCJDXCJcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBmb3IgYSBzdHJpbmcgZm9yIHRoZSB0cmFuc2FjdGlvbiwgd2hpY2ggc2hvdWxkIGJlIHNlbnQgdG8gdGhlIG5ldHdvcmtcbiAgICogYnkgY2FsbGluZyBpc3N1ZVR4LlxuICAgKi9cbiAgaW1wb3J0ID0gYXN5bmMgKHVzZXJuYW1lOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIHRvOiBzdHJpbmcsIHNvdXJjZUNoYWluOiBzdHJpbmcpXG4gICAgOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgdG8sXG4gICAgICBzb3VyY2VDaGFpbixcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmRcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJhdm0uaW1wb3J0XCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQudHhJRFxuICB9XG5cbiAgLyoqXG4gICAgICogRmluYWxpemUgYSB0cmFuc2ZlciBvZiBBVkFYIGZyb20gdGhlIFAtQ2hhaW4gdG8gdGhlIFgtQ2hhaW4uXG4gICAgICpcbiAgICAgKiBCZWZvcmUgdGhpcyBtZXRob2QgaXMgY2FsbGVkLCB5b3UgbXVzdCBjYWxsIHRoZSBQLUNoYWlu4oCZcyBgZXhwb3J0QVZBWGAgbWV0aG9kIHRvIGluaXRpYXRlIHRoZSB0cmFuc2Zlci5cbiAgICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIEtleXN0b3JlIHVzZXIgdGhhdCBjb250cm9scyB0aGUgYWRkcmVzcyBzcGVjaWZpZWQgaW4gYHRvYFxuICAgICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIEtleXN0b3JlIHVzZXJcbiAgICAgKiBAcGFyYW0gdG8gVGhlIGFkZHJlc3MgdGhlIEFWQVggaXMgc2VudCB0by4gVGhpcyBtdXN0IGJlIHRoZSBzYW1lIGFzIHRoZSB0byBhcmd1bWVudCBpbiB0aGUgY29ycmVzcG9uZGluZyBjYWxsIHRvIHRoZSBQLUNoYWlu4oCZcyBleHBvcnRBVkFYLCBleGNlcHQgdGhhdCB0aGUgcHJlcGVuZGVkIFgtIHNob3VsZCBiZSBpbmNsdWRlZCBpbiB0aGlzIGFyZ3VtZW50XG4gICAgICogQHBhcmFtIHNvdXJjZUNoYWluIENoYWluIHRoZSBmdW5kcyBhcmUgY29taW5nIGZyb20uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBTdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB0cmFuc2FjdGlvbiBpZFxuICAgICAqL1xuICBpbXBvcnRBVkFYID0gYXN5bmMgKHVzZXJuYW1lOiBzdHJpbmcsIHBhc3N3b3JkOiBzdHJpbmcsIHRvOiBzdHJpbmcsIHNvdXJjZUNoYWluOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgdG8sXG4gICAgICBzb3VyY2VDaGFpbixcbiAgICAgIHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmRcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJhdm0uaW1wb3J0QVZBWFwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SURcbiAgfVxuXG4gIC8qKlxuICAgICAqIExpc3RzIGFsbCB0aGUgYWRkcmVzc2VzIHVuZGVyIGEgdXNlci5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgdXNlciB0byBsaXN0IGFkZHJlc3Nlc1xuICAgICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgb2YgdGhlIHVzZXIgdG8gbGlzdCB0aGUgYWRkcmVzc2VzXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIGFuIGFycmF5IG9mIGFkZHJlc3Mgc3RyaW5ncyBpbiB0aGUgZm9ybWF0IHNwZWNpZmllZCBieSB0aGUgYmxvY2tjaGFpbi5cbiAgICAgKi9cbiAgbGlzdEFkZHJlc3NlcyA9IGFzeW5jICh1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmdbXT4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZFxuICAgIH1cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcImF2bS5saXN0QWRkcmVzc2VzXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuYWRkcmVzc2VzXG4gIH1cblxuICAvKipcbiAgICAgKiBSZXRyaWV2ZXMgYWxsIGFzc2V0cyBmb3IgYW4gYWRkcmVzcyBvbiBhIHNlcnZlciBhbmQgdGhlaXIgYXNzb2NpYXRlZCBiYWxhbmNlcy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBhZGRyZXNzIFRoZSBhZGRyZXNzIHRvIGdldCBhIGxpc3Qgb2YgYXNzZXRzXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyBQcm9taXNlIG9mIGFuIG9iamVjdCBtYXBwaW5nIGFzc2V0SUQgc3RyaW5ncyB3aXRoIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59IGJhbGFuY2UgZm9yIHRoZSBhZGRyZXNzIG9uIHRoZSBibG9ja2NoYWluLlxuICAgICAqL1xuICBnZXRBbGxCYWxhbmNlcyA9IGFzeW5jIChhZGRyZXNzOiBzdHJpbmcpOiBQcm9taXNlPG9iamVjdFtdPiA9PiB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnBhcnNlQWRkcmVzcyhhZGRyZXNzKSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBBZGRyZXNzRXJyb3IoXCJFcnJvciAtIEFWTUFQSS5nZXRBbGxCYWxhbmNlczogSW52YWxpZCBhZGRyZXNzIGZvcm1hdFwiKVxuICAgIH1cbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIGFkZHJlc3NcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJhdm0uZ2V0QWxsQmFsYW5jZXNcIiwgcGFyYW1zKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC5iYWxhbmNlc1xuICB9XG5cbiAgLyoqXG4gICogUmV0cmlldmVzIGFuIGFzc2V0cyBuYW1lIGFuZCBzeW1ib2wuXG4gICpcbiAgKiBAcGFyYW0gYXNzZXRJRCBFaXRoZXIgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXJ8QnVmZmVyfSBvciBhbiBiNTggc2VyaWFsaXplZCBzdHJpbmcgZm9yIHRoZSBBc3NldElEIG9yIGl0cyBhbGlhcy5cbiAgKlxuICAqIEByZXR1cm5zIFJldHVybnMgYSBQcm9taXNlPG9iamVjdD4gd2l0aCBrZXlzIFwibmFtZVwiIGFuZCBcInN5bWJvbFwiLlxuICAqL1xuICBnZXRBc3NldERlc2NyaXB0aW9uID0gYXN5bmMgKGFzc2V0SUQ6IEJ1ZmZlciB8IHN0cmluZyk6IFByb21pc2U8eyBuYW1lOiBzdHJpbmc7IHN5bWJvbDogc3RyaW5nOyBhc3NldElEOiBCdWZmZXI7IGRlbm9taW5hdGlvbjogbnVtYmVyIH0+ID0+IHtcbiAgICBsZXQgYXNzZXQ6IHN0cmluZ1xuICAgIGlmICh0eXBlb2YgYXNzZXRJRCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgYXNzZXQgPSBiaW50b29scy5jYjU4RW5jb2RlKGFzc2V0SUQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2V0ID0gYXNzZXRJRFxuICAgIH1cbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIGFzc2V0SUQ6IGFzc2V0XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwiYXZtLmdldEFzc2V0RGVzY3JpcHRpb25cIiwgcGFyYW1zKVxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiByZXNwb25zZS5kYXRhLnJlc3VsdC5uYW1lLFxuICAgICAgc3ltYm9sOiByZXNwb25zZS5kYXRhLnJlc3VsdC5zeW1ib2wsXG4gICAgICBhc3NldElEOiBiaW50b29scy5jYjU4RGVjb2RlKHJlc3BvbnNlLmRhdGEucmVzdWx0LmFzc2V0SUQpLFxuICAgICAgZGVub21pbmF0aW9uOiBwYXJzZUludChyZXNwb25zZS5kYXRhLnJlc3VsdC5kZW5vbWluYXRpb24sIDEwKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB0cmVhbnNhY3Rpb24gZGF0YSBvZiBhIHByb3ZpZGVkIHRyYW5zYWN0aW9uIElEIGJ5IGNhbGxpbmcgdGhlIG5vZGUncyBgZ2V0VHhgIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIHR4aWQgVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHJhbnNhY3Rpb24gSURcbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2U8c3RyaW5nPiBjb250YWluaW5nIHRoZSBieXRlcyByZXRyaWV2ZWQgZnJvbSB0aGUgbm9kZVxuICAgKi9cbiAgZ2V0VHggPSBhc3luYyAodHhpZDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHR4SUQ6IHR4aWRcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJhdm0uZ2V0VHhcIiwgcGFyYW1zKVxuICAgIHJldHVybiByZXNwb25zZS5kYXRhLnJlc3VsdC50eFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN0YXR1cyBvZiBhIHByb3ZpZGVkIHRyYW5zYWN0aW9uIElEIGJ5IGNhbGxpbmcgdGhlIG5vZGUncyBgZ2V0VHhTdGF0dXNgIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIHR4aWQgVGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdHJhbnNhY3Rpb24gSURcbiAgICpcbiAgICogQHJldHVybnMgUmV0dXJucyBhIFByb21pc2U8c3RyaW5nPiBjb250YWluaW5nIHRoZSBzdGF0dXMgcmV0cmlldmVkIGZyb20gdGhlIG5vZGVcbiAgICovXG4gIGdldFR4U3RhdHVzID0gYXN5bmMgKHR4aWQ6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiA9PiB7XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICB0eElEOiB0eGlkXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwiYXZtLmdldFR4U3RhdHVzXCIsIHBhcmFtcylcbiAgICByZXR1cm4gcmVzcG9uc2UuZGF0YS5yZXN1bHQuc3RhdHVzXG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBVVFhPcyByZWxhdGVkIHRvIHRoZSBhZGRyZXNzZXMgcHJvdmlkZWQgZnJvbSB0aGUgbm9kZSdzIGBnZXRVVFhPc2AgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0gYWRkcmVzc2VzIEFuIGFycmF5IG9mIGFkZHJlc3NlcyBhcyBjYjU4IHN0cmluZ3Mgb3IgYWRkcmVzc2VzIGFzIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9c1xuICAgKiBAcGFyYW0gc291cmNlQ2hhaW4gQSBzdHJpbmcgZm9yIHRoZSBjaGFpbiB0byBsb29rIGZvciB0aGUgVVRYTydzLiBEZWZhdWx0IGlzIHRvIHVzZSB0aGlzIGNoYWluLCBidXQgaWYgZXhwb3J0ZWQgVVRYT3MgZXhpc3QgZnJvbSBvdGhlciBjaGFpbnMsIHRoaXMgY2FuIHVzZWQgdG8gcHVsbCB0aGVtIGluc3RlYWQuXG4gICAqIEBwYXJhbSBsaW1pdCBPcHRpb25hbC4gUmV0dXJucyBhdCBtb3N0IFtsaW1pdF0gYWRkcmVzc2VzLiBJZiBbbGltaXRdID09IDAgb3IgPiBbbWF4VVRYT3NUb0ZldGNoXSwgZmV0Y2hlcyB1cCB0byBbbWF4VVRYT3NUb0ZldGNoXS5cbiAgICogQHBhcmFtIHN0YXJ0SW5kZXggT3B0aW9uYWwuIFtTdGFydEluZGV4XSBkZWZpbmVzIHdoZXJlIHRvIHN0YXJ0IGZldGNoaW5nIFVUWE9zIChmb3IgcGFnaW5hdGlvbi4pXG4gICAqIFVUWE9zIGZldGNoZWQgYXJlIGZyb20gYWRkcmVzc2VzIGVxdWFsIHRvIG9yIGdyZWF0ZXIgdGhhbiBbU3RhcnRJbmRleC5BZGRyZXNzXVxuICAgKiBGb3IgYWRkcmVzcyBbU3RhcnRJbmRleC5BZGRyZXNzXSwgb25seSBVVFhPcyB3aXRoIElEcyBncmVhdGVyIHRoYW4gW1N0YXJ0SW5kZXguVXR4b10gd2lsbCBiZSByZXR1cm5lZC5cbiAgICogQHBhcmFtIHBlcnNpc3RPcHRzIE9wdGlvbnMgYXZhaWxhYmxlIHRvIHBlcnNpc3QgdGhlc2UgVVRYT3MgaW4gbG9jYWwgc3RvcmFnZVxuICAgKlxuICAgKiBAcmVtYXJrc1xuICAgKiBwZXJzaXN0T3B0cyBpcyBvcHRpb25hbCBhbmQgbXVzdCBiZSBvZiB0eXBlIFtbUGVyc2lzdGFuY2VPcHRpb25zXV1cbiAgICpcbiAgICovXG4gIGdldFVUWE9zID0gYXN5bmMgKFxuICAgIGFkZHJlc3Nlczogc3RyaW5nW10gfCBzdHJpbmcsXG4gICAgc291cmNlQ2hhaW46IHN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICBsaW1pdDogbnVtYmVyID0gMCxcbiAgICBzdGFydEluZGV4OiB7IGFkZHJlc3M6IHN0cmluZywgdXR4bzogc3RyaW5nIH0gPSB1bmRlZmluZWQsXG4gICAgcGVyc2lzdE9wdHM6IFBlcnNpc3RhbmNlT3B0aW9ucyA9IHVuZGVmaW5lZFxuICApOiBQcm9taXNlPHtcbiAgICBudW1GZXRjaGVkOm51bWJlcixcbiAgICB1dHhvczpVVFhPU2V0LFxuICAgIGVuZEluZGV4OiB7IGFkZHJlc3M6IHN0cmluZywgdXR4bzogc3RyaW5nIH1cbiAgfT4gPT4ge1xuICAgIFxuICAgIGlmKHR5cGVvZiBhZGRyZXNzZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIGFkZHJlc3NlcyA9IFthZGRyZXNzZXNdXG4gICAgfVxuXG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICBhZGRyZXNzZXM6IGFkZHJlc3NlcyxcbiAgICAgIGxpbWl0XG4gICAgfVxuICAgIGlmKHR5cGVvZiBzdGFydEluZGV4ICE9PSBcInVuZGVmaW5lZFwiICYmIHN0YXJ0SW5kZXgpIHtcbiAgICAgIHBhcmFtcy5zdGFydEluZGV4ID0gc3RhcnRJbmRleFxuICAgIH1cblxuICAgIGlmKHR5cGVvZiBzb3VyY2VDaGFpbiAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgcGFyYW1zLnNvdXJjZUNoYWluID0gc291cmNlQ2hhaW5cbiAgICB9XG5cbiAgICBjb25zdCByZXNwb25zZTogUmVxdWVzdFJlc3BvbnNlRGF0YSA9IGF3YWl0IHRoaXMuY2FsbE1ldGhvZChcImF2bS5nZXRVVFhPc1wiLCBwYXJhbXMpXG4gICAgY29uc3QgdXR4b3M6IFVUWE9TZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgbGV0IGRhdGEgPSByZXNwb25zZS5kYXRhLnJlc3VsdC51dHhvc1xuICAgIGlmIChwZXJzaXN0T3B0cyAmJiB0eXBlb2YgcGVyc2lzdE9wdHMgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgIGlmICh0aGlzLmRiLmhhcyhwZXJzaXN0T3B0cy5nZXROYW1lKCkpKSB7XG4gICAgICAgIGNvbnN0IHNlbGZBcnJheTogc3RyaW5nW10gPSB0aGlzLmRiLmdldChwZXJzaXN0T3B0cy5nZXROYW1lKCkpXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHNlbGZBcnJheSkpIHtcbiAgICAgICAgICB1dHhvcy5hZGRBcnJheShkYXRhKVxuICAgICAgICAgIGNvbnN0IHNlbGY6IFVUWE9TZXQgPSBuZXcgVVRYT1NldCgpXG4gICAgICAgICAgc2VsZi5hZGRBcnJheShzZWxmQXJyYXkpXG4gICAgICAgICAgc2VsZi5tZXJnZUJ5UnVsZSh1dHhvcywgcGVyc2lzdE9wdHMuZ2V0TWVyZ2VSdWxlKCkpXG4gICAgICAgICAgZGF0YSA9IHNlbGYuZ2V0QWxsVVRYT1N0cmluZ3MoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmRiLnNldChwZXJzaXN0T3B0cy5nZXROYW1lKCksIGRhdGEsIHBlcnNpc3RPcHRzLmdldE92ZXJ3cml0ZSgpKVxuICAgIH1cbiAgICB1dHhvcy5hZGRBcnJheShkYXRhLCBmYWxzZSlcbiAgICByZXNwb25zZS5kYXRhLnJlc3VsdC51dHhvcyA9IHV0eG9zXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHdoaWNoIGNyZWF0ZXMgYW4gdW5zaWduZWQgdHJhbnNhY3Rpb24uIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICAqIFtbVW5zaWduZWRUeF1dIG1hbnVhbGx5ICh3aXRoIHRoZWlyIGNvcnJlc3BvbmRpbmcgW1tUcmFuc2ZlcmFibGVJbnB1dF1dcywgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXMsIGFuZCBbW1RyYW5zZmVyT3BlcmF0aW9uXV1zKS5cbiAgICpcbiAgICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgICogQHBhcmFtIGFtb3VudCBUaGUgYW1vdW50IG9mIEFzc2V0SUQgdG8gYmUgc3BlbnQgaW4gaXRzIHNtYWxsZXN0IGRlbm9taW5hdGlvbiwgcmVwcmVzZW50ZWQgYXMge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn0uXG4gICAqIEBwYXJhbSBhc3NldElEIFRoZSBhc3NldElEIG9mIHRoZSB2YWx1ZSBiZWluZyBzZW50XG4gICAqIEBwYXJhbSB0b0FkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRvIHNlbmQgdGhlIGZ1bmRzXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBmdW5kcyBmcm9tIHRoZSBVVFhPcyBwcm92aWRlZFxuICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3NcbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgQ0I1OCBCdWZmZXIgb3IgU3RyaW5nIHdoaWNoIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBvdXRwdXRzXG4gICAqIEBwYXJhbSB0aHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIChbW1Vuc2lnbmVkVHhdXSkgd2hpY2ggY29udGFpbnMgYSBbW0Jhc2VUeF1dLlxuICAgKlxuICAgKiBAcmVtYXJrc1xuICAgKiBUaGlzIGhlbHBlciBleGlzdHMgYmVjYXVzZSB0aGUgZW5kcG9pbnQgQVBJIHNob3VsZCBiZSB0aGUgcHJpbWFyeSBwb2ludCBvZiBlbnRyeSBmb3IgbW9zdCBmdW5jdGlvbmFsaXR5LlxuICAgKi9cbiAgYnVpbGRCYXNlVHggPSBhc3luYyAoXG4gICAgdXR4b3NldDogVVRYT1NldCxcbiAgICBhbW91bnQ6IEJOLFxuICAgIGFzc2V0SUQ6IEJ1ZmZlciB8IHN0cmluZyA9IHVuZGVmaW5lZCxcbiAgICB0b0FkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgZnJvbUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgICBsb2NrdGltZTogQk4gPSBuZXcgQk4oMCksXG4gICAgdGhyZXNob2xkOiBudW1iZXIgPSAxXG4gICk6IFByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIGNvbnN0IHRvOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KHRvQWRkcmVzc2VzLCBcImJ1aWxkQmFzZVR4XCIpLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcbiAgICBjb25zdCBmcm9tOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGZyb21BZGRyZXNzZXMsIFwiYnVpbGRCYXNlVHhcIikubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKVxuICAgIGNvbnN0IGNoYW5nZTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShjaGFuZ2VBZGRyZXNzZXMsIFwiYnVpbGRCYXNlVHhcIikubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKVxuXG4gICAgaWYgKHR5cGVvZiBhc3NldElEID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBhc3NldElEID0gYmludG9vbHMuY2I1OERlY29kZShhc3NldElEKVxuICAgIH1cblxuICAgIGlmKCBtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIGNvbnN0IGJ1aWx0VW5zaWduZWRUeDpVbnNpZ25lZFR4ID0gdXR4b3NldC5idWlsZEJhc2VUeChcbiAgICAgIHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKSwgXG4gICAgICBiaW50b29scy5jYjU4RGVjb2RlKHRoaXMuYmxvY2tjaGFpbklEKSxcbiAgICAgIGFtb3VudCwgXG4gICAgICBhc3NldElELCBcbiAgICAgIHRvLCBcbiAgICAgIGZyb20sIFxuICAgICAgY2hhbmdlLCBcbiAgICAgIHRoaXMuZ2V0VHhGZWUoKSwgXG4gICAgICBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKCksXG4gICAgICBtZW1vLCBhc09mLCBsb2NrdGltZSwgdGhyZXNob2xkXG4gICAgKVxuXG4gICAgaWYgKCFhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4KSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXCJFcnJvciAtIEFWTUFQSS5idWlsZEJhc2VUeDpGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeFxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCBjcmVhdGVzIGFuIHVuc2lnbmVkIE5GVCBUcmFuc2Zlci4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgICogW1tVbnNpZ25lZFR4XV0gbWFudWFsbHkgKHdpdGggdGhlaXIgY29ycmVzcG9uZGluZyBbW1RyYW5zZmVyYWJsZUlucHV0XV1zLCBbW1RyYW5zZmVyYWJsZU91dHB1dF1dcywgYW5kIFtbVHJhbnNmZXJPcGVyYXRpb25dXXMpLlxuICAgKlxuICAgKiBAcGFyYW0gdXR4b3NldCAgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgICogQHBhcmFtIHRvQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdG8gc2VuZCB0aGUgTkZUXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBORlQgZnJvbSB0aGUgdXR4b0lEIHByb3ZpZGVkXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0aGF0IGNhbiBzcGVuZCB0aGUgY2hhbmdlIHJlbWFpbmluZyBmcm9tIHRoZSBzcGVudCBVVFhPc1xuICAgKiBAcGFyYW0gdXR4b2lkIEEgYmFzZTU4IHV0eG9JRCBvciBhbiBhcnJheSBvZiBiYXNlNTggdXR4b0lEcyBmb3IgdGhlIG5mdHMgdGhpcyB0cmFuc2FjdGlvbiBpcyBzZW5kaW5nXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIENCNTggQnVmZmVyIG9yIFN0cmluZyB3aGljaCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gbG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0c1xuICAgKiBAcGFyYW0gdGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgVVRYT1xuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiAoW1tVbnNpZ25lZFR4XV0pIHdoaWNoIGNvbnRhaW5zIGEgW1tORlRUcmFuc2ZlclR4XV0uXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIFRoaXMgaGVscGVyIGV4aXN0cyBiZWNhdXNlIHRoZSBlbmRwb2ludCBBUEkgc2hvdWxkIGJlIHRoZSBwcmltYXJ5IHBvaW50IG9mIGVudHJ5IGZvciBtb3N0IGZ1bmN0aW9uYWxpdHkuXG4gICAqL1xuICBidWlsZE5GVFRyYW5zZmVyVHggPSBhc3luYyAoXG4gICAgdXR4b3NldDogVVRYT1NldCxcbiAgICB0b0FkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgZnJvbUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICB1dHhvaWQ6IHN0cmluZyB8IHN0cmluZ1tdLFxuICAgIG1lbW86IFBheWxvYWRCYXNlIHwgQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIGFzT2Y6IEJOID0gVW5peE5vdygpLFxuICAgIGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKSxcbiAgICB0aHJlc2hvbGQ6IG51bWJlciA9IDEsXG4gICk6IFByb21pc2U8VW5zaWduZWRUeD4gPT4ge1xuICAgIGNvbnN0IHRvOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KHRvQWRkcmVzc2VzLCBcImJ1aWxkTkZUVHJhbnNmZXJUeFwiKS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG4gICAgY29uc3QgZnJvbTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tQWRkcmVzc2VzLCBcImJ1aWxkTkZUVHJhbnNmZXJUeFwiKS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG4gICAgY29uc3QgY2hhbmdlOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGNoYW5nZUFkZHJlc3NlcywgXCJidWlsZENyZWF0ZU5GVEFzc2V0VHhcIikubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKVxuXG4gICAgaWYoIG1lbW8gaW5zdGFuY2VvZiBQYXlsb2FkQmFzZSkge1xuICAgICAgbWVtbyA9IG1lbW8uZ2V0UGF5bG9hZCgpXG4gICAgfVxuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcblxuICAgIGxldCB1dHhvaWRBcnJheTogc3RyaW5nW10gPSBbXVxuICAgIGlmICh0eXBlb2YgdXR4b2lkID09PSBcInN0cmluZ1wiKSB7XG4gICAgICB1dHhvaWRBcnJheSA9IFt1dHhvaWRdXG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHV0eG9pZCkpIHtcbiAgICAgIHV0eG9pZEFycmF5ID0gdXR4b2lkXG4gICAgfVxuXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gdXR4b3NldC5idWlsZE5GVFRyYW5zZmVyVHgoXG4gICAgICB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKCksIFxuICAgICAgYmludG9vbHMuY2I1OERlY29kZSh0aGlzLmJsb2NrY2hhaW5JRCksIFxuICAgICAgdG8sIFxuICAgICAgZnJvbSxcbiAgICAgIGNoYW5nZSxcbiAgICAgIHV0eG9pZEFycmF5LCBcbiAgICAgIHRoaXMuZ2V0VHhGZWUoKSxcbiAgICAgIGF2YXhBc3NldElELCBcbiAgICAgIG1lbW8sIGFzT2YsIGxvY2t0aW1lLCB0aHJlc2hvbGRcbiAgICApXG5cbiAgICBpZighIGF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEdvb3NlRWdnQ2hlY2tFcnJvcihcIkVycm9yIC0gQVZNQVBJLmJ1aWxkTkZUVHJhbnNmZXJUeDpGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeFxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCBjcmVhdGVzIGFuIHVuc2lnbmVkIEltcG9ydCBUeC4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgICogW1tVbnNpZ25lZFR4XV0gbWFudWFsbHkgKHdpdGggdGhlaXIgY29ycmVzcG9uZGluZyBbW1RyYW5zZmVyYWJsZUlucHV0XV1zLCBbW1RyYW5zZmVyYWJsZU91dHB1dF1dcywgYW5kIFtbVHJhbnNmZXJPcGVyYXRpb25dXXMpLlxuICAgKlxuICAgKiBAcGFyYW0gdXR4b3NldCAgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgICogQHBhcmFtIG93bmVyQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBpbXBvcnRcbiAgICogQHBhcmFtIHNvdXJjZUNoYWluIFRoZSBjaGFpbmlkIGZvciB3aGVyZSB0aGUgaW1wb3J0IGlzIGNvbWluZyBmcm9tXG4gICAqIEBwYXJhbSB0b0FkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRvIHNlbmQgdGhlIGZ1bmRzXG4gICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBmdW5kcyBmcm9tIHRoZSBVVFhPcyBwcm92aWRlZFxuICAgKiBAcGFyYW0gY2hhbmdlQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgdGhhdCBjYW4gc3BlbmQgdGhlIGNoYW5nZSByZW1haW5pbmcgZnJvbSB0aGUgc3BlbnQgVVRYT3NcbiAgICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgQ0I1OCBCdWZmZXIgb3IgU3RyaW5nIHdoaWNoIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqIEBwYXJhbSBhc09mIE9wdGlvbmFsLiBUaGUgdGltZXN0YW1wIHRvIHZlcmlmeSB0aGUgdHJhbnNhY3Rpb24gYWdhaW5zdCBhcyBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vaW5kdXRueS9ibi5qcy98Qk59XG4gICAqIEBwYXJhbSBsb2NrdGltZSBPcHRpb25hbC4gVGhlIGxvY2t0aW1lIGZpZWxkIGNyZWF0ZWQgaW4gdGhlIHJlc3VsdGluZyBvdXRwdXRzXG4gICAqIEBwYXJhbSB0aHJlc2hvbGQgT3B0aW9uYWwuIFRoZSBudW1iZXIgb2Ygc2lnbmF0dXJlcyByZXF1aXJlZCB0byBzcGVuZCB0aGUgZnVuZHMgaW4gdGhlIHJlc3VsdGFudCBVVFhPXG4gICAqXG4gICAqIEByZXR1cm5zIEFuIHVuc2lnbmVkIHRyYW5zYWN0aW9uIChbW1Vuc2lnbmVkVHhdXSkgd2hpY2ggY29udGFpbnMgYSBbW0ltcG9ydFR4XV0uXG4gICAqXG4gICAqIEByZW1hcmtzXG4gICAqIFRoaXMgaGVscGVyIGV4aXN0cyBiZWNhdXNlIHRoZSBlbmRwb2ludCBBUEkgc2hvdWxkIGJlIHRoZSBwcmltYXJ5IHBvaW50IG9mIGVudHJ5IGZvciBtb3N0IGZ1bmN0aW9uYWxpdHkuXG4gICAqL1xuICBidWlsZEltcG9ydFR4ID0gYXN5bmMgKFxuICAgIHV0eG9zZXQ6IFVUWE9TZXQsXG4gICAgb3duZXJBZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIHNvdXJjZUNoYWluOiBCdWZmZXIgfCBzdHJpbmcsXG4gICAgdG9BZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIGZyb21BZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIGNoYW5nZUFkZHJlc3Nlczogc3RyaW5nW10gPSB1bmRlZmluZWQsXG4gICAgbWVtbzogUGF5bG9hZEJhc2UgfCBCdWZmZXIgPSB1bmRlZmluZWQsXG4gICAgYXNPZjogQk4gPSBVbml4Tm93KCksXG4gICAgbG9ja3RpbWU6IEJOID0gbmV3IEJOKDApLFxuICAgIHRocmVzaG9sZDogbnVtYmVyID0gMVxuICApOiBQcm9taXNlPFVuc2lnbmVkVHg+ID0+IHtcbiAgICBjb25zdCB0bzogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheSh0b0FkZHJlc3NlcywgXCJidWlsZEltcG9ydFR4XCIpLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcbiAgICBjb25zdCBmcm9tOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGZyb21BZGRyZXNzZXMsIFwiYnVpbGRJbXBvcnRUeFwiKS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG4gICAgY29uc3QgY2hhbmdlOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGNoYW5nZUFkZHJlc3NlcywgXCJidWlsZEltcG9ydFR4XCIpLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcblxuICAgIGxldCBzcmNDaGFpbjogc3RyaW5nID0gdW5kZWZpbmVkXG5cbiAgICBpZih0eXBlb2Ygc291cmNlQ2hhaW4gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRocm93IG5ldyBDaGFpbklkRXJyb3IoXCJFcnJvciAtIEFWTUFQSS5idWlsZEltcG9ydFR4OiBTb3VyY2UgQ2hhaW5JRCBpcyB1bmRlZmluZWQuXCIpXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc291cmNlQ2hhaW4gPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHNyY0NoYWluID0gc291cmNlQ2hhaW5cbiAgICAgIHNvdXJjZUNoYWluID0gYmludG9vbHMuY2I1OERlY29kZShzb3VyY2VDaGFpbilcbiAgICB9IGVsc2UgaWYoIShzb3VyY2VDaGFpbiBpbnN0YW5jZW9mIEJ1ZmZlcikpIHtcbiAgICAgIHNyY0NoYWluID0gYmludG9vbHMuY2I1OEVuY29kZShzb3VyY2VDaGFpbilcbiAgICAgIHRocm93IG5ldyBDaGFpbklkRXJyb3IoXCJFcnJvciAtIEFWTUFQSS5idWlsZEltcG9ydFR4OiBJbnZhbGlkIGRlc3RpbmF0aW9uQ2hhaW4gdHlwZTogXCIgKyAodHlwZW9mIHNvdXJjZUNoYWluKSlcbiAgfVxuICBcbiAgICBjb25zdCBhdG9taWNVVFhPczogVVRYT1NldCA9IChhd2FpdCB0aGlzLmdldFVUWE9zKG93bmVyQWRkcmVzc2VzLCBzcmNDaGFpbiwgMCwgdW5kZWZpbmVkKSkudXR4b3NcbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG4gICAgY29uc3QgYXRvbWljczogVVRYT1tdID0gYXRvbWljVVRYT3MuZ2V0QWxsVVRYT3MoKVxuXG4gIGlmKGF0b21pY3MubGVuZ3RoID09PSAwKXtcbiAgICB0aHJvdyBuZXcgTm9BdG9taWNVVFhPc0Vycm9yKFwiRXJyb3IgLSBBVk1BUEkuYnVpbGRJbXBvcnRUeDogTm8gYXRvbWljIFVUWE9zIHRvIGltcG9ydCBmcm9tIFwiICsgc3JjQ2hhaW4gKyBcIiB1c2luZyBhZGRyZXNzZXM6IFwiICsgb3duZXJBZGRyZXNzZXMuam9pbihcIiwgXCIpKVxuICB9XG5cbiAgaWYoIG1lbW8gaW5zdGFuY2VvZiBQYXlsb2FkQmFzZSkge1xuICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICB9XG5cbiAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OlVuc2lnbmVkVHggPSB1dHhvc2V0LmJ1aWxkSW1wb3J0VHgoXG4gICAgdGhpcy5jb3JlLmdldE5ldHdvcmtJRCgpLCBcbiAgICBiaW50b29scy5jYjU4RGVjb2RlKHRoaXMuYmxvY2tjaGFpbklEKSwgXG4gICAgdG8sXG4gICAgZnJvbSxcbiAgICBjaGFuZ2UsXG4gICAgYXRvbWljcywgXG4gICAgc291cmNlQ2hhaW4sXG4gICAgdGhpcy5nZXRUeEZlZSgpLCBcbiAgICBhdmF4QXNzZXRJRCwgXG4gICAgbWVtbywgYXNPZiwgbG9ja3RpbWUsIHRocmVzaG9sZFxuICApXG5cbiAgICBpZiAoIWF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEdvb3NlRWdnQ2hlY2tFcnJvcihcIkVycm9yIC0gQVZNQVBJLmJ1aWxkSW1wb3J0VHg6RmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiKVxuICAgIH1cblxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIC8qKlxuICAgKiBIZWxwZXIgZnVuY3Rpb24gd2hpY2ggY3JlYXRlcyBhbiB1bnNpZ25lZCBFeHBvcnQgVHguIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICAqIFtbVW5zaWduZWRUeF1dIG1hbnVhbGx5ICh3aXRoIHRoZWlyIGNvcnJlc3BvbmRpbmcgW1tUcmFuc2ZlcmFibGVJbnB1dF1dcywgW1tUcmFuc2ZlcmFibGVPdXRwdXRdXXMsIGFuZCBbW1RyYW5zZmVyT3BlcmF0aW9uXV1zKS5cbiAgICpcbiAgICogQHBhcmFtIHV0eG9zZXQgQSBzZXQgb2YgVVRYT3MgdGhhdCB0aGUgdHJhbnNhY3Rpb24gaXMgYnVpbHQgb25cbiAgICogQHBhcmFtIGFtb3VudCBUaGUgYW1vdW50IGJlaW5nIGV4cG9ydGVkIGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgICogQHBhcmFtIGRlc3RpbmF0aW9uQ2hhaW4gVGhlIGNoYWluaWQgZm9yIHdoZXJlIHRoZSBhc3NldHMgd2lsbCBiZSBzZW50LlxuICAgKiBAcGFyYW0gdG9BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyB0byBzZW5kIHRoZSBmdW5kc1xuICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3MgcHJvdmlkZWRcbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIENCNTggQnVmZmVyIG9yIFN0cmluZyB3aGljaCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKiBAcGFyYW0gbG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0c1xuICAgKiBAcGFyYW0gdGhyZXNob2xkIE9wdGlvbmFsLiBUaGUgbnVtYmVyIG9mIHNpZ25hdHVyZXMgcmVxdWlyZWQgdG8gc3BlbmQgdGhlIGZ1bmRzIGluIHRoZSByZXN1bHRhbnQgVVRYT1xuICAgKiBAcGFyYW0gYXNzZXRJRCBPcHRpb25hbC4gVGhlIGFzc2V0SUQgb2YgdGhlIGFzc2V0IHRvIHNlbmQuIERlZmF1bHRzIHRvIEFWQVggYXNzZXRJRC4gXG4gICAqIFJlZ2FyZGxlc3Mgb2YgdGhlIGFzc2V0IHdoaWNoIHlvdVwicmUgZXhwb3J0aW5nLCBhbGwgZmVlcyBhcmUgcGFpZCBpbiBBVkFYLlxuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiAoW1tVbnNpZ25lZFR4XV0pIHdoaWNoIGNvbnRhaW5zIGFuIFtbRXhwb3J0VHhdXS5cbiAgICovXG4gIGJ1aWxkRXhwb3J0VHggPSBhc3luYyAoXG4gICAgdXR4b3NldDogVVRYT1NldCxcbiAgICBhbW91bnQ6IEJOLFxuICAgIGRlc3RpbmF0aW9uQ2hhaW46IEJ1ZmZlciB8IHN0cmluZyxcbiAgICB0b0FkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgZnJvbUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKSxcbiAgICBsb2NrdGltZTogQk4gPSBuZXcgQk4oMCksXG4gICAgdGhyZXNob2xkOiBudW1iZXIgPSAxLFxuICAgIGFzc2V0SUQ6IHN0cmluZyA9IHVuZGVmaW5lZFxuICApOiBQcm9taXNlPFVuc2lnbmVkVHg+ID0+IHtcbiAgICBcbiAgICBsZXQgcHJlZml4ZXM6IG9iamVjdCA9IHt9XG4gICAgdG9BZGRyZXNzZXMubWFwKChhOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgICAgIHByZWZpeGVzW2Euc3BsaXQoXCItXCIpWzBdXSA9IHRydWVcbiAgICB9KVxuICAgIGlmIChPYmplY3Qua2V5cyhwcmVmaXhlcykubGVuZ3RoICE9PSAxKSB7XG4gICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKFwiRXJyb3IgLSBBVk1BUEkuYnVpbGRFeHBvcnRUeDogVG8gYWRkcmVzc2VzIG11c3QgaGF2ZSB0aGUgc2FtZSBjaGFpbklEIHByZWZpeC5cIilcbiAgICB9XG4gICAgXG4gICAgaWYgKHR5cGVvZiBkZXN0aW5hdGlvbkNoYWluID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB0aHJvdyBuZXcgQ2hhaW5JZEVycm9yKFwiRXJyb3IgLSBBVk1BUEkuYnVpbGRFeHBvcnRUeDogRGVzdGluYXRpb24gQ2hhaW5JRCBpcyB1bmRlZmluZWQuXCIpXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZGVzdGluYXRpb25DaGFpbiA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgZGVzdGluYXRpb25DaGFpbiA9IGJpbnRvb2xzLmNiNThEZWNvZGUoZGVzdGluYXRpb25DaGFpbikgLy9cbiAgICB9IGVsc2UgaWYoIShkZXN0aW5hdGlvbkNoYWluIGluc3RhbmNlb2YgQnVmZmVyKSkge1xuICAgICAgdGhyb3cgbmV3IENoYWluSWRFcnJvcihcIkVycm9yIC0gQVZNQVBJLmJ1aWxkRXhwb3J0VHg6IEludmFsaWQgZGVzdGluYXRpb25DaGFpbiB0eXBlOiBcIiArICh0eXBlb2YgZGVzdGluYXRpb25DaGFpbikpXG4gICAgfVxuICAgIGlmIChkZXN0aW5hdGlvbkNoYWluLmxlbmd0aCAhPT0gMzIpIHtcbiAgICAgIHRocm93IG5ldyBDaGFpbklkRXJyb3IoXCJFcnJvciAtIEFWTUFQSS5idWlsZEV4cG9ydFR4OiBEZXN0aW5hdGlvbiBDaGFpbklEIG11c3QgYmUgMzIgYnl0ZXMgaW4gbGVuZ3RoLlwiKVxuICAgIH1cblxuICAgIGxldCB0bzogQnVmZmVyW10gPSBbXVxuICAgIHRvQWRkcmVzc2VzLm1hcCgoYTogc3RyaW5nKTogdm9pZCA9PiB7XG4gICAgICB0by5wdXNoKGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcbiAgICB9KVxuXG4gICAgY29uc3QgZnJvbTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tQWRkcmVzc2VzLCBcImJ1aWxkRXhwb3J0VHhcIikubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKVxuICAgIGNvbnN0IGNoYW5nZTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShjaGFuZ2VBZGRyZXNzZXMsIFwiYnVpbGRFeHBvcnRUeFwiKS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG5cbiAgICBpZiAobWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKClcbiAgICB9XG5cbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG4gICAgaWYodHlwZW9mIGFzc2V0SUQgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGFzc2V0SUQgPSBiaW50b29scy5jYjU4RW5jb2RlKGF2YXhBc3NldElEKVxuICAgIH1cblxuICAgIGNvbnN0IGJ1aWx0VW5zaWduZWRUeDogVW5zaWduZWRUeCA9IHV0eG9zZXQuYnVpbGRFeHBvcnRUeChcbiAgICAgIHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKSwgXG4gICAgICBiaW50b29scy5jYjU4RGVjb2RlKHRoaXMuYmxvY2tjaGFpbklEKSwgXG4gICAgICBhbW91bnQsXG4gICAgICBiaW50b29scy5jYjU4RGVjb2RlKGFzc2V0SUQpLCBcbiAgICAgIHRvLFxuICAgICAgZnJvbSxcbiAgICAgIGNoYW5nZSxcbiAgICAgIGRlc3RpbmF0aW9uQ2hhaW4sXG4gICAgICB0aGlzLmdldFR4RmVlKCksIFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBtZW1vLCBhc09mLCBsb2NrdGltZSwgdGhyZXNob2xkXG4gICAgKVxuXG4gICAgaWYgKCFhd2FpdCB0aGlzLmNoZWNrR29vc2VFZ2coYnVpbHRVbnNpZ25lZFR4KSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXCJFcnJvciAtIEFWTUFQSS5idWlsZEV4cG9ydFR4OkZhaWxlZCBHb29zZSBFZ2cgQ2hlY2tcIilcbiAgICB9XG5cbiAgICByZXR1cm4gYnVpbHRVbnNpZ25lZFR4XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhbiB1bnNpZ25lZCB0cmFuc2FjdGlvbi4gRm9yIG1vcmUgZ3JhbnVsYXIgY29udHJvbCwgeW91IG1heSBjcmVhdGUgeW91ciBvd25cbiAgICogW1tVbnNpZ25lZFR4XV0gbWFudWFsbHkgKHdpdGggdGhlaXIgY29ycmVzcG9uZGluZyBbW1RyYW5zZmVyYWJsZUlucHV0XV1zLCBbW1RyYW5zZmVyYWJsZU91dHB1dF1dcywgYW5kIFtbVHJhbnNmZXJPcGVyYXRpb25dXXMpLlxuICAgKlxuICAgKiBAcGFyYW0gdXR4b3NldCBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvblxuICAgKiBAcGFyYW0gZnJvbUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIGJlaW5nIHVzZWQgdG8gc2VuZCB0aGUgZnVuZHMgZnJvbSB0aGUgVVRYT3Mge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyfEJ1ZmZlcn1cbiAgICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zXG4gICAqIEBwYXJhbSBpbml0aWFsU3RhdGUgVGhlIFtbSW5pdGlhbFN0YXRlc11dIHRoYXQgcmVwcmVzZW50IHRoZSBpbnRpYWwgc3RhdGUgb2YgYSBjcmVhdGVkIGFzc2V0XG4gICAqIEBwYXJhbSBuYW1lIFN0cmluZyBmb3IgdGhlIGRlc2NyaXB0aXZlIG5hbWUgb2YgdGhlIGFzc2V0XG4gICAqIEBwYXJhbSBzeW1ib2wgU3RyaW5nIGZvciB0aGUgdGlja2VyIHN5bWJvbCBvZiB0aGUgYXNzZXRcbiAgICogQHBhcmFtIGRlbm9taW5hdGlvbiBOdW1iZXIgZm9yIHRoZSBkZW5vbWluYXRpb24gd2hpY2ggaXMgMTBeRC4gRCBtdXN0IGJlID49IDAgYW5kIDw9IDMyLiBFeDogJDEgQVZBWCA9IDEwXjkgJG5BVkFYXG4gICAqIEBwYXJhbSBtaW50T3V0cHV0cyBPcHRpb25hbC4gQXJyYXkgb2YgW1tTRUNQTWludE91dHB1dF1dcyB0byBiZSBpbmNsdWRlZCBpbiB0aGUgdHJhbnNhY3Rpb24uIFRoZXNlIG91dHB1dHMgY2FuIGJlIHNwZW50IHRvIG1pbnQgbW9yZSB0b2tlbnMuXG4gICAqIEBwYXJhbSBtZW1vIE9wdGlvbmFsIENCNTggQnVmZmVyIG9yIFN0cmluZyB3aGljaCBjb250YWlucyBhcmJpdHJhcnkgYnl0ZXMsIHVwIHRvIDI1NiBieXRlc1xuICAgKiBAcGFyYW0gYXNPZiBPcHRpb25hbC4gVGhlIHRpbWVzdGFtcCB0byB2ZXJpZnkgdGhlIHRyYW5zYWN0aW9uIGFnYWluc3QgYXMgYSB7QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2luZHV0bnkvYm4uanMvfEJOfVxuICAgKlxuICAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiAoW1tVbnNpZ25lZFR4XV0pIHdoaWNoIGNvbnRhaW5zIGEgW1tDcmVhdGVBc3NldFR4XV0uXG4gICAqIFxuICAgKi9cbiAgYnVpbGRDcmVhdGVBc3NldFR4ID0gYXN5bmMgKFxuICAgIHV0eG9zZXQ6IFVUWE9TZXQsXG4gICAgZnJvbUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgY2hhbmdlQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBpbml0aWFsU3RhdGVzOiBJbml0aWFsU3RhdGVzLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzeW1ib2w6IHN0cmluZyxcbiAgICBkZW5vbWluYXRpb246IG51bWJlcixcbiAgICBtaW50T3V0cHV0czogU0VDUE1pbnRPdXRwdXRbXSA9IHVuZGVmaW5lZCxcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCxcbiAgICBhc09mOiBCTiA9IFVuaXhOb3coKVxuICApOiBQcm9taXNlPFVuc2lnbmVkVHg+ID0+IHtcbiAgICBsZXQgZnJvbTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tQWRkcmVzc2VzLCBcImJ1aWxkQ3JlYXRlQXNzZXRUeFwiKS5tYXAoKGE6IHN0cmluZyk6IEJ1ZmZlciA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG4gICAgbGV0IGNoYW5nZTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShjaGFuZ2VBZGRyZXNzZXMsIFwiYnVpbGRDcmVhdGVORlRBc3NldFR4XCIpLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcblxuICAgIGlmKCBtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYoc3ltYm9sLmxlbmd0aCA+IEFWTUNvbnN0YW50cy5TWU1CT0xNQVhMRU4pe1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IFN5bWJvbEVycm9yKFwiRXJyb3IgLSBBVk1BUEkuYnVpbGRDcmVhdGVBc3NldFR4OiBTeW1ib2xzIG1heSBub3QgZXhjZWVkIGxlbmd0aCBvZiBcIiArIEFWTUNvbnN0YW50cy5TWU1CT0xNQVhMRU4pXG4gICAgfVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgaWYobmFtZS5sZW5ndGggPiBBVk1Db25zdGFudHMuQVNTRVROQU1FTEVOKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IE5hbWVFcnJvcihcIkVycm9yIC0gQVZNQVBJLmJ1aWxkQ3JlYXRlQXNzZXRUeDogTmFtZXMgbWF5IG5vdCBleGNlZWQgbGVuZ3RoIG9mIFwiICsgQVZNQ29uc3RhbnRzLkFTU0VUTkFNRUxFTilcbiAgICB9XG5cbiAgICBjb25zdCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG4gICAgY29uc3QgYnVpbHRVbnNpZ25lZFR4OiBVbnNpZ25lZFR4ID0gdXR4b3NldC5idWlsZENyZWF0ZUFzc2V0VHgoXG4gICAgICB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKCksIFxuICAgICAgYmludG9vbHMuY2I1OERlY29kZSh0aGlzLmJsb2NrY2hhaW5JRCksIFxuICAgICAgZnJvbSxcbiAgICAgIGNoYW5nZSxcbiAgICAgIGluaXRpYWxTdGF0ZXMsXG4gICAgICBuYW1lLCBcbiAgICAgIHN5bWJvbCwgXG4gICAgICBkZW5vbWluYXRpb24sIFxuICAgICAgbWludE91dHB1dHMsXG4gICAgICB0aGlzLmdldENyZWF0aW9uVHhGZWUoKSwgXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sIGFzT2ZcbiAgICApXG5cbiAgICBpZiAoIWF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgsIHRoaXMuZ2V0Q3JlYXRpb25UeEZlZSgpKSkge1xuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIHRocm93IG5ldyBHb29zZUVnZ0NoZWNrRXJyb3IoXCJFcnJvciAtIEFWTUFQSS5idWlsZENyZWF0ZUFzc2V0VHg6RmFpbGVkIEdvb3NlIEVnZyBDaGVja1wiKVxuICAgIH1cblxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIGJ1aWxkU0VDUE1pbnRUeCA9IGFzeW5jIChcbiAgICB1dHhvc2V0OiBVVFhPU2V0LFxuICAgIG1pbnRPd25lcjogU0VDUE1pbnRPdXRwdXQsXG4gICAgdHJhbnNmZXJPd25lcjogU0VDUFRyYW5zZmVyT3V0cHV0LFxuICAgIGZyb21BZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIGNoYW5nZUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgbWludFVUWE9JRDogc3RyaW5nLFxuICAgIG1lbW86IFBheWxvYWRCYXNlIHwgQnVmZmVyID0gdW5kZWZpbmVkLCBhc09mOiBCTiA9IFVuaXhOb3coKVxuICApOiBQcm9taXNlPGFueT4gPT4ge1xuICAgIGxldCBmcm9tOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGZyb21BZGRyZXNzZXMsIFwiYnVpbGRTRUNQTWludFR4XCIpLm1hcCgoYTogc3RyaW5nKTogQnVmZmVyID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcbiAgICBsZXQgY2hhbmdlOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGNoYW5nZUFkZHJlc3NlcywgXCJidWlsZFNFQ1BNaW50VHhcIikubWFwKChhOiBzdHJpbmcpOiBCdWZmZXIgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKVxuICAgIFxuICAgIGlmKCBtZW1vIGluc3RhbmNlb2YgUGF5bG9hZEJhc2UpIHtcbiAgICAgIG1lbW8gPSBtZW1vLmdldFBheWxvYWQoKVxuICAgIH1cblxuICAgIGxldCBhdmF4QXNzZXRJRDogQnVmZmVyID0gYXdhaXQgdGhpcy5nZXRBVkFYQXNzZXRJRCgpXG5cbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSB1dHhvc2V0LmJ1aWxkU0VDUE1pbnRUeChcbiAgICAgIHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKSxcbiAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpLFxuICAgICAgbWludE93bmVyLFxuICAgICAgdHJhbnNmZXJPd25lcixcbiAgICAgIGZyb20sXG4gICAgICBjaGFuZ2UsXG4gICAgICBtaW50VVRYT0lELFxuICAgICAgdGhpcy5nZXRUeEZlZSgpLFxuICAgICAgYXZheEFzc2V0SUQsXG4gICAgICBtZW1vLCBhc09mXG4gICAgKVxuICAgIGlmICghIGF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEdvb3NlRWdnQ2hlY2tFcnJvcihcIkVycm9yIC0gQVZNQVBJLmJ1aWxkU0VDUE1pbnRUeDpGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG4gICAgfVxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIC8qKlxuICAqIENyZWF0ZXMgYW4gdW5zaWduZWQgdHJhbnNhY3Rpb24uIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICogW1tVbnNpZ25lZFR4XV0gbWFudWFsbHkgKHdpdGggdGhlaXIgY29ycmVzcG9uZGluZyBbW1RyYW5zZmVyYWJsZUlucHV0XV1zLCBbW1RyYW5zZmVyYWJsZU91dHB1dF1dcywgYW5kIFtbVHJhbnNmZXJPcGVyYXRpb25dXXMpLlxuICAqIFxuICAqIEBwYXJhbSB1dHhvc2V0IEEgc2V0IG9mIFVUWE9zIHRoYXQgdGhlIHRyYW5zYWN0aW9uIGlzIGJ1aWx0IG9uXG4gICogQHBhcmFtIGZyb21BZGRyZXNzZXMgVGhlIGFkZHJlc3NlcyBiZWluZyB1c2VkIHRvIHNlbmQgdGhlIGZ1bmRzIGZyb20gdGhlIFVUWE9zIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zXG4gICogQHBhcmFtIG1pbnRlclNldHMgaXMgYSBsaXN0IHdoZXJlIGVhY2ggZWxlbWVudCBzcGVjaWZpZXMgdGhhdCB0aHJlc2hvbGQgb2YgdGhlIGFkZHJlc3NlcyBpbiBtaW50ZXJzIG1heSB0b2dldGhlciBtaW50IG1vcmUgb2YgdGhlIGFzc2V0IGJ5IHNpZ25pbmcgYSBtaW50aW5nIHRyYW5zYWN0aW9uXG4gICogQHBhcmFtIG5hbWUgU3RyaW5nIGZvciB0aGUgZGVzY3JpcHRpdmUgbmFtZSBvZiB0aGUgYXNzZXRcbiAgKiBAcGFyYW0gc3ltYm9sIFN0cmluZyBmb3IgdGhlIHRpY2tlciBzeW1ib2wgb2YgdGhlIGFzc2V0XG4gICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgQ0I1OCBCdWZmZXIgb3IgU3RyaW5nIHdoaWNoIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgKiBAcGFyYW0gbG9ja3RpbWUgT3B0aW9uYWwuIFRoZSBsb2NrdGltZSBmaWVsZCBjcmVhdGVkIGluIHRoZSByZXN1bHRpbmcgbWludCBvdXRwdXRcbiAgKiBcbiAgKiBgYGBqc1xuICAqIEV4YW1wbGUgbWludGVyU2V0czpcbiAgKiBbXG4gICogICAgICB7XG4gICogICAgICAgICAgXCJtaW50ZXJzXCI6W1xuICAqICAgICAgICAgICAgICBcIlgtYXZheDFnaHN0anVrcnR3ODkzNWxyeXF0bmg2NDN4ZTlhOTR1M3RjNzVjN1wiXG4gICogICAgICAgICAgXSxcbiAgKiAgICAgICAgICBcInRocmVzaG9sZFwiOiAxXG4gICogICAgICB9LFxuICAqICAgICAge1xuICAqICAgICAgICAgIFwibWludGVyc1wiOiBbXG4gICogICAgICAgICAgICAgIFwiWC1hdmF4MXllbGwzZTRubG4wbTM5Y2ZwZGhncXByc2Q4N2praDRxbmFra2x4XCIsXG4gICogICAgICAgICAgICAgIFwiWC1hdmF4MWs0bnIyNmM4MGphcXV6bTkzNjlqNWE0c2htd2NqbjB2bWVtY2p6XCIsXG4gICogICAgICAgICAgICAgIFwiWC1hdmF4MXp0a3pzcmpua24wY2VrNXJ5dmhxc3dkdGNnMjNuaGdlM25ucjVlXCJcbiAgKiAgICAgICAgICBdLFxuICAqICAgICAgICAgIFwidGhyZXNob2xkXCI6IDJcbiAgKiAgICAgIH1cbiAgKiBdXG4gICogYGBgXG4gICogXG4gICogQHJldHVybnMgQW4gdW5zaWduZWQgdHJhbnNhY3Rpb24gKFtbVW5zaWduZWRUeF1dKSB3aGljaCBjb250YWlucyBhIFtbQ3JlYXRlQXNzZXRUeF1dLlxuICAqIFxuICAqL1xuICBidWlsZENyZWF0ZU5GVEFzc2V0VHggPSBhc3luYyAoXG4gICAgdXR4b3NldDogVVRYT1NldCxcbiAgICBmcm9tQWRkcmVzc2VzOiBzdHJpbmdbXSxcbiAgICBjaGFuZ2VBZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIG1pbnRlclNldHM6IE1pbnRlclNldFtdLFxuICAgIG5hbWU6IHN0cmluZyxcbiAgICBzeW1ib2w6IHN0cmluZyxcbiAgICBtZW1vOiBQYXlsb2FkQmFzZSB8IEJ1ZmZlciA9IHVuZGVmaW5lZCwgYXNPZjogQk4gPSBVbml4Tm93KCksIGxvY2t0aW1lOiBCTiA9IG5ldyBCTigwKVxuICApOiBQcm9taXNlPFVuc2lnbmVkVHg+ID0+IHtcbiAgICBsZXQgZnJvbTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tQWRkcmVzc2VzLCBcImJ1aWxkQ3JlYXRlTkZUQXNzZXRUeFwiKS5tYXAoYSA9PiBiaW50b29scy5zdHJpbmdUb0FkZHJlc3MoYSkpXG4gICAgbGV0IGNoYW5nZTogQnVmZmVyW10gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShjaGFuZ2VBZGRyZXNzZXMsIFwiYnVpbGRDcmVhdGVORlRBc3NldFR4XCIpLm1hcChhID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcbiAgICBcbiAgICBpZiggbWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKClcbiAgICB9XG5cbiAgICBpZihuYW1lLmxlbmd0aCA+IEFWTUNvbnN0YW50cy5BU1NFVE5BTUVMRU4pIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgTmFtZUVycm9yKFwiRXJyb3IgLSBBVk1BUEkuYnVpbGRDcmVhdGVORlRBc3NldFR4OiBOYW1lcyBtYXkgbm90IGV4Y2VlZCBsZW5ndGggb2YgXCIgKyBBVk1Db25zdGFudHMuQVNTRVROQU1FTEVOKVxuICAgIH1cbiAgICBpZihzeW1ib2wubGVuZ3RoID4gQVZNQ29uc3RhbnRzLlNZTUJPTE1BWExFTil7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IFN5bWJvbEVycm9yKFwiRXJyb3IgLSBBVk1BUEkuYnVpbGRDcmVhdGVORlRBc3NldFR4OiBTeW1ib2xzIG1heSBub3QgZXhjZWVkIGxlbmd0aCBvZiBcIiArIEFWTUNvbnN0YW50cy5TWU1CT0xNQVhMRU4pXG4gICAgfVxuICAgIGNvbnN0IGF2YXhBc3NldElEOiBCdWZmZXIgPSBhd2FpdCB0aGlzLmdldEFWQVhBc3NldElEKClcbiAgICBjb25zdCBidWlsdFVuc2lnbmVkVHg6IFVuc2lnbmVkVHggPSB1dHhvc2V0LmJ1aWxkQ3JlYXRlTkZUQXNzZXRUeChcbiAgICAgIHRoaXMuY29yZS5nZXROZXR3b3JrSUQoKSxcbiAgICAgIGJpbnRvb2xzLmNiNThEZWNvZGUodGhpcy5ibG9ja2NoYWluSUQpLFxuICAgICAgZnJvbSxcbiAgICAgIGNoYW5nZSxcbiAgICAgIG1pbnRlclNldHMsXG4gICAgICBuYW1lLFxuICAgICAgc3ltYm9sLFxuICAgICAgdGhpcy5nZXRDcmVhdGlvblR4RmVlKCksXG4gICAgICBhdmF4QXNzZXRJRCxcbiAgICAgIG1lbW8sIGFzT2YsIGxvY2t0aW1lXG4gICAgKVxuICAgIGlmICghYXdhaXQgdGhpcy5jaGVja0dvb3NlRWdnKGJ1aWx0VW5zaWduZWRUeCwgdGhpcy5nZXRDcmVhdGlvblR4RmVlKCkpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEdvb3NlRWdnQ2hlY2tFcnJvcihcIkVycm9yIC0gQVZNQVBJLmJ1aWxkQ3JlYXRlTkZUQXNzZXRUeDpGYWlsZWQgR29vc2UgRWdnIENoZWNrXCIpXG4gICAgfVxuICAgIHJldHVybiBidWlsdFVuc2lnbmVkVHhcbiAgfVxuXG4gIC8qKlxuICAqIENyZWF0ZXMgYW4gdW5zaWduZWQgdHJhbnNhY3Rpb24uIEZvciBtb3JlIGdyYW51bGFyIGNvbnRyb2wsIHlvdSBtYXkgY3JlYXRlIHlvdXIgb3duXG4gICogW1tVbnNpZ25lZFR4XV0gbWFudWFsbHkgKHdpdGggdGhlaXIgY29ycmVzcG9uZGluZyBbW1RyYW5zZmVyYWJsZUlucHV0XV1zLCBbW1RyYW5zZmVyYWJsZU91dHB1dF1dcywgYW5kIFtbVHJhbnNmZXJPcGVyYXRpb25dXXMpLlxuICAqIFxuICAqIEBwYXJhbSB1dHhvc2V0ICBBIHNldCBvZiBVVFhPcyB0aGF0IHRoZSB0cmFuc2FjdGlvbiBpcyBidWlsdCBvblxuICAqIEBwYXJhbSBvd25lcnMgRWl0aGVyIGEgc2luZ2xlIG9yIGFuIGFycmF5IG9mIFtbT3V0cHV0T3duZXJzXV0gdG8gc2VuZCB0aGUgbmZ0IG91dHB1dFxuICAqIEBwYXJhbSBmcm9tQWRkcmVzc2VzIFRoZSBhZGRyZXNzZXMgYmVpbmcgdXNlZCB0byBzZW5kIHRoZSBORlQgZnJvbSB0aGUgdXR4b0lEIHByb3ZpZGVkXG4gICogQHBhcmFtIGNoYW5nZUFkZHJlc3NlcyBUaGUgYWRkcmVzc2VzIHRoYXQgY2FuIHNwZW5kIHRoZSBjaGFuZ2UgcmVtYWluaW5nIGZyb20gdGhlIHNwZW50IFVUWE9zXG4gICogQHBhcmFtIHV0eG9pZCBBIGJhc2U1OCB1dHhvSUQgb3IgYW4gYXJyYXkgb2YgYmFzZTU4IHV0eG9JRHMgZm9yIHRoZSBuZnQgbWludCBvdXRwdXQgdGhpcyB0cmFuc2FjdGlvbiBpcyBzZW5kaW5nXG4gICogQHBhcmFtIGdyb3VwSUQgT3B0aW9uYWwuIFRoZSBncm91cCB0aGlzIE5GVCBpcyBpc3N1ZWQgdG8uXG4gICogQHBhcmFtIHBheWxvYWQgT3B0aW9uYWwuIERhdGEgZm9yIE5GVCBQYXlsb2FkIGFzIGVpdGhlciBhIFtbUGF5bG9hZEJhc2VdXSBvciBhIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9XG4gICogQHBhcmFtIG1lbW8gT3B0aW9uYWwgQ0I1OCBCdWZmZXIgb3IgU3RyaW5nIHdoaWNoIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICogQHBhcmFtIGFzT2YgT3B0aW9uYWwuIFRoZSB0aW1lc3RhbXAgdG8gdmVyaWZ5IHRoZSB0cmFuc2FjdGlvbiBhZ2FpbnN0IGFzIGEge0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9pbmR1dG55L2JuLmpzL3xCTn1cbiAgKiBcbiAgKiBAcmV0dXJucyBBbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiAoW1tVbnNpZ25lZFR4XV0pIHdoaWNoIGNvbnRhaW5zIGFuIFtbT3BlcmF0aW9uVHhdXS5cbiAgKiBcbiAgKi9cbiAgYnVpbGRDcmVhdGVORlRNaW50VHggPSBhc3luYyAoXG4gICAgdXR4b3NldDogVVRYT1NldCxcbiAgICBvd25lcnM6IE91dHB1dE93bmVyc1tdIHwgT3V0cHV0T3duZXJzLFxuICAgIGZyb21BZGRyZXNzZXM6IHN0cmluZ1tdLFxuICAgIGNoYW5nZUFkZHJlc3Nlczogc3RyaW5nW10sXG4gICAgdXR4b2lkOiBzdHJpbmcgfCBzdHJpbmdbXSxcbiAgICBncm91cElEOiBudW1iZXIgPSAwLFxuICAgIHBheWxvYWQ6IFBheWxvYWRCYXNlIHwgQnVmZmVyID0gdW5kZWZpbmVkLFxuICAgIG1lbW86IFBheWxvYWRCYXNlIHwgQnVmZmVyID0gdW5kZWZpbmVkLCBhc09mOiBCTiA9IFVuaXhOb3coKVxuICApOiBQcm9taXNlPGFueT4gPT4ge1xuICAgIGxldCBmcm9tOiBCdWZmZXJbXSA9IHRoaXMuX2NsZWFuQWRkcmVzc0FycmF5KGZyb21BZGRyZXNzZXMsIFwiYnVpbGRDcmVhdGVORlRNaW50VHhcIikubWFwKGEgPT4gYmludG9vbHMuc3RyaW5nVG9BZGRyZXNzKGEpKVxuICAgIGxldCBjaGFuZ2U6IEJ1ZmZlcltdID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkoY2hhbmdlQWRkcmVzc2VzLCBcImJ1aWxkQ3JlYXRlTkZUTWludFR4XCIpLm1hcChhID0+IGJpbnRvb2xzLnN0cmluZ1RvQWRkcmVzcyhhKSlcbiAgICBcbiAgICBpZiggbWVtbyBpbnN0YW5jZW9mIFBheWxvYWRCYXNlKSB7XG4gICAgICBtZW1vID0gbWVtby5nZXRQYXlsb2FkKClcbiAgICB9XG5cbiAgICBpZihwYXlsb2FkIGluc3RhbmNlb2YgUGF5bG9hZEJhc2Upe1xuICAgICAgcGF5bG9hZCA9IHBheWxvYWQuZ2V0UGF5bG9hZCgpXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB1dHhvaWQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHV0eG9pZCA9IFt1dHhvaWRdXG4gICAgfVxuXG4gICAgY29uc3QgYXZheEFzc2V0SUQ6IEJ1ZmZlciA9IGF3YWl0IHRoaXMuZ2V0QVZBWEFzc2V0SUQoKVxuXG4gICAgaWYob3duZXJzIGluc3RhbmNlb2YgT3V0cHV0T3duZXJzKSB7XG4gICAgICBvd25lcnMgPSBbb3duZXJzXVxuICAgIH1cblxuICAgIGNvbnN0IGJ1aWx0VW5zaWduZWRUeDogVW5zaWduZWRUeCA9IHV0eG9zZXQuYnVpbGRDcmVhdGVORlRNaW50VHgoXG4gICAgICB0aGlzLmNvcmUuZ2V0TmV0d29ya0lEKCksXG4gICAgICBiaW50b29scy5jYjU4RGVjb2RlKHRoaXMuYmxvY2tjaGFpbklEKSxcbiAgICAgIG93bmVycyxcbiAgICAgIGZyb20sXG4gICAgICBjaGFuZ2UsXG4gICAgICB1dHhvaWQsXG4gICAgICBncm91cElELFxuICAgICAgcGF5bG9hZCxcbiAgICAgIHRoaXMuZ2V0VHhGZWUoKSxcbiAgICAgIGF2YXhBc3NldElELFxuICAgICAgbWVtbywgYXNPZlxuICAgIClcbiAgICBpZiAoIWF3YWl0IHRoaXMuY2hlY2tHb29zZUVnZyhidWlsdFVuc2lnbmVkVHgpKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IEdvb3NlRWdnQ2hlY2tFcnJvcihcIkVycm9yIC0gQVZNQVBJLmJ1aWxkQ3JlYXRlTkZUTWludFR4OkZhaWxlZCBHb29zZSBFZ2cgQ2hlY2tcIilcbiAgICB9XG4gICAgcmV0dXJuIGJ1aWx0VW5zaWduZWRUeFxuICB9XG5cbiAgLyoqXG4gICAqIEhlbHBlciBmdW5jdGlvbiB3aGljaCB0YWtlcyBhbiB1bnNpZ25lZCB0cmFuc2FjdGlvbiBhbmQgc2lnbnMgaXQsIHJldHVybmluZyB0aGUgcmVzdWx0aW5nIFtbVHhdXS5cbiAgKlxuICAqIEBwYXJhbSB1dHggVGhlIHVuc2lnbmVkIHRyYW5zYWN0aW9uIG9mIHR5cGUgW1tVbnNpZ25lZFR4XV1cbiAgKlxuICAqIEByZXR1cm5zIEEgc2lnbmVkIHRyYW5zYWN0aW9uIG9mIHR5cGUgW1tUeF1dXG4gICovXG4gIHNpZ25UeCA9ICh1dHg6IFVuc2lnbmVkVHgpOiBUeCA9PiB1dHguc2lnbih0aGlzLmtleWNoYWluKVxuXG4gIC8qKlxuICAgKiBDYWxscyB0aGUgbm9kZSdzIGlzc3VlVHggbWV0aG9kIGZyb20gdGhlIEFQSSBhbmQgcmV0dXJucyB0aGUgcmVzdWx0aW5nIHRyYW5zYWN0aW9uIElEIGFzIGEgc3RyaW5nLlxuICAgKlxuICAgKiBAcGFyYW0gdHggQSBzdHJpbmcsIHtAbGluayBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlcnxCdWZmZXJ9LCBvciBbW1R4XV0gcmVwcmVzZW50aW5nIGEgdHJhbnNhY3Rpb25cbiAgICpcbiAgICogQHJldHVybnMgQSBQcm9taXNlPHN0cmluZz4gcmVwcmVzZW50aW5nIHRoZSB0cmFuc2FjdGlvbiBJRCBvZiB0aGUgcG9zdGVkIHRyYW5zYWN0aW9uLlxuICAgKi9cbiAgaXNzdWVUeCA9IGFzeW5jICh0eDogc3RyaW5nIHwgQnVmZmVyIHwgVHgpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGxldCBUcmFuc2FjdGlvbiA9IFwiXCJcbiAgICBpZiAodHlwZW9mIHR4ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICBUcmFuc2FjdGlvbiA9IHR4XG4gICAgfSBlbHNlIGlmICh0eCBpbnN0YW5jZW9mIEJ1ZmZlcikge1xuICAgICAgY29uc3QgdHhvYmo6IFR4ID0gbmV3IFR4KClcbiAgICAgIHR4b2JqLmZyb21CdWZmZXIodHgpXG4gICAgICBUcmFuc2FjdGlvbiA9IHR4b2JqLnRvU3RyaW5nKClcbiAgICB9IGVsc2UgaWYgKHR4IGluc3RhbmNlb2YgVHgpIHtcbiAgICAgIFRyYW5zYWN0aW9uID0gdHgudG9TdHJpbmcoKVxuICAgIH0gZWxzZSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgdGhyb3cgbmV3IFRyYW5zYWN0aW9uRXJyb3IoXCJFcnJvciAtIEFWTUFQSS5pc3N1ZVR4OiBwcm92aWRlZCB0eCBpcyBub3QgZXhwZWN0ZWQgdHlwZSBvZiBzdHJpbmcsIEJ1ZmZlciwgb3IgVHhcIilcbiAgICB9XG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICB0eDogVHJhbnNhY3Rpb24udG9TdHJpbmcoKSxcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJhdm0uaXNzdWVUeFwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LnR4SURcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyBhbiBhbW91bnQgb2YgYXNzZXRJRCB0byB0aGUgc3BlY2lmaWVkIGFkZHJlc3MgZnJvbSBhIGxpc3Qgb2Ygb3duZWQgb2YgYWRkcmVzc2VzLlxuICAgKlxuICAgKiBAcGFyYW0gdXNlcm5hbWUgVGhlIHVzZXIgdGhhdCBvd25zIHRoZSBwcml2YXRlIGtleXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBgZnJvbWAgYWRkcmVzc2VzXG4gICAqIEBwYXJhbSBwYXNzd29yZCBUaGUgcGFzc3dvcmQgdW5sb2NraW5nIHRoZSB1c2VyXG4gICAqIEBwYXJhbSBhc3NldElEIFRoZSBhc3NldElEIG9mIHRoZSBhc3NldCB0byBzZW5kXG4gICAqIEBwYXJhbSBhbW91bnQgVGhlIGFtb3VudCBvZiB0aGUgYXNzZXQgdG8gYmUgc2VudFxuICAgKiBAcGFyYW0gdG8gVGhlIGFkZHJlc3Mgb2YgdGhlIHJlY2lwaWVudFxuICAgKiBAcGFyYW0gZnJvbSBPcHRpb25hbC4gQW4gYXJyYXkgb2YgYWRkcmVzc2VzIG1hbmFnZWQgYnkgdGhlIG5vZGUncyBrZXlzdG9yZSBmb3IgdGhpcyBibG9ja2NoYWluIHdoaWNoIHdpbGwgZnVuZCB0aGlzIHRyYW5zYWN0aW9uXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyIE9wdGlvbmFsLiBBbiBhZGRyZXNzIHRvIHNlbmQgdGhlIGNoYW5nZVxuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbC4gQ0I1OCBCdWZmZXIgb3IgU3RyaW5nIHdoaWNoIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIHRoZSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB0cmFuc2FjdGlvbidzIElELlxuICAgKi9cbiAgc2VuZCA9IGFzeW5jICh1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLCBhc3NldElEOiBzdHJpbmcgfCBCdWZmZXIsIGFtb3VudDogbnVtYmVyIHwgQk4sIHRvOiBzdHJpbmcsIGZyb206IHN0cmluZ1tdIHwgQnVmZmVyW10gPSB1bmRlZmluZWQsIGNoYW5nZUFkZHI6IHN0cmluZyA9IHVuZGVmaW5lZCwgbWVtbzogc3RyaW5nIHwgQnVmZmVyID0gdW5kZWZpbmVkKTogUHJvbWlzZTx7IHR4SUQ6IHN0cmluZywgY2hhbmdlQWRkcjogc3RyaW5nIH0+ID0+IHtcbiAgICBsZXQgYXNzZXQ6IHN0cmluZ1xuICAgIGxldCBhbW50OiBCTlxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLnBhcnNlQWRkcmVzcyh0bykgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKFwiRXJyb3IgLSBBVk1BUEkuc2VuZDogSW52YWxpZCBhZGRyZXNzIGZvcm1hdFwiKVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYXNzZXRJRCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgYXNzZXQgPSBiaW50b29scy5jYjU4RW5jb2RlKGFzc2V0SUQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2V0ID0gYXNzZXRJRFxuICAgIH1cbiAgICBpZiAodHlwZW9mIGFtb3VudCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgYW1udCA9IG5ldyBCTihhbW91bnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGFtbnQgPSBhbW91bnRcbiAgICB9XG5cbiAgICBjb25zdCBwYXJhbXM6IGFueSA9IHtcbiAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgIGFzc2V0SUQ6IGFzc2V0LFxuICAgICAgYW1vdW50OiBhbW50LnRvU3RyaW5nKDEwKSxcbiAgICAgIHRvOiB0b1xuICAgIH1cblxuICAgIGZyb20gPSB0aGlzLl9jbGVhbkFkZHJlc3NBcnJheShmcm9tLCBcInNlbmRcIilcbiAgICBpZih0eXBlb2YgZnJvbSAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICBwYXJhbXNbXCJmcm9tXCJdID0gZnJvbVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgY2hhbmdlQWRkciAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLnBhcnNlQWRkcmVzcyhjaGFuZ2VBZGRyKSA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKFwiRXJyb3IgLSBBVk1BUEkuc2VuZDogSW52YWxpZCBhZGRyZXNzIGZvcm1hdFwiKVxuICAgICAgfVxuICAgICAgcGFyYW1zW1wiY2hhbmdlQWRkclwiXSA9IGNoYW5nZUFkZHJcbiAgICB9IFxuXG4gICAgaWYodHlwZW9mIG1lbW8gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmICh0eXBlb2YgbWVtbyAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICBwYXJhbXNbXCJtZW1vXCJdID0gYmludG9vbHMuY2I1OEVuY29kZShtZW1vKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGFyYW1zW1wibWVtb1wiXSA9IG1lbW9cbiAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2U6IFJlcXVlc3RSZXNwb25zZURhdGEgPSBhd2FpdCB0aGlzLmNhbGxNZXRob2QoXCJhdm0uc2VuZFwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgYW4gYW1vdW50IG9mIGFzc2V0SUQgdG8gYW4gYXJyYXkgb2Ygc3BlY2lmaWVkIGFkZHJlc3NlcyBmcm9tIGEgbGlzdCBvZiBvd25lZCBvZiBhZGRyZXNzZXMuXG4gICAqXG4gICAqIEBwYXJhbSB1c2VybmFtZSBUaGUgdXNlciB0aGF0IG93bnMgdGhlIHByaXZhdGUga2V5cyBhc3NvY2lhdGVkIHdpdGggdGhlIGBmcm9tYCBhZGRyZXNzZXNcbiAgICogQHBhcmFtIHBhc3N3b3JkIFRoZSBwYXNzd29yZCB1bmxvY2tpbmcgdGhlIHVzZXJcbiAgICogQHBhcmFtIHNlbmRPdXRwdXRzIFRoZSBhcnJheSBvZiBTZW5kT3V0cHV0cy4gQSBTZW5kT3V0cHV0IGlzIGFuIG9iamVjdCBsaXRlcmFsIHdoaWNoIGNvbnRhaW5zIGFuIGFzc2V0SUQsIGFtb3VudCwgYW5kIHRvLlxuICAgKiBAcGFyYW0gZnJvbSBPcHRpb25hbC4gQW4gYXJyYXkgb2YgYWRkcmVzc2VzIG1hbmFnZWQgYnkgdGhlIG5vZGUncyBrZXlzdG9yZSBmb3IgdGhpcyBibG9ja2NoYWluIHdoaWNoIHdpbGwgZnVuZCB0aGlzIHRyYW5zYWN0aW9uXG4gICAqIEBwYXJhbSBjaGFuZ2VBZGRyIE9wdGlvbmFsLiBBbiBhZGRyZXNzIHRvIHNlbmQgdGhlIGNoYW5nZVxuICAgKiBAcGFyYW0gbWVtbyBPcHRpb25hbC4gQ0I1OCBCdWZmZXIgb3IgU3RyaW5nIHdoaWNoIGNvbnRhaW5zIGFyYml0cmFyeSBieXRlcywgdXAgdG8gMjU2IGJ5dGVzXG4gICAqXG4gICAqIEByZXR1cm5zIFByb21pc2UgZm9yIHRoZSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB0cmFuc2FjdGlvblwicyBJRC5cbiAgICovXG4gIHNlbmRNdWx0aXBsZSA9IGFzeW5jICh1c2VybmFtZTogc3RyaW5nLCBwYXNzd29yZDogc3RyaW5nLFxuICAgIHNlbmRPdXRwdXRzOiB7IGFzc2V0SUQ6IHN0cmluZyB8IEJ1ZmZlciwgYW1vdW50OiBudW1iZXIgfCBCTiwgdG86IHN0cmluZyB9W10sXG4gICAgZnJvbTogc3RyaW5nW10gfCBCdWZmZXJbXSA9IHVuZGVmaW5lZCxcbiAgICBjaGFuZ2VBZGRyOiBzdHJpbmcgPSB1bmRlZmluZWQsXG4gICAgbWVtbzogc3RyaW5nIHwgQnVmZmVyID0gdW5kZWZpbmVkXG4gICk6IFByb21pc2U8eyB0eElEOiBzdHJpbmcsIGNoYW5nZUFkZHI6IHN0cmluZyB9PiA9PiB7XG4gICAgbGV0IGFzc2V0OiBzdHJpbmdcbiAgICBsZXQgYW1udDogQk5cbiAgICBsZXQgc091dHB1dHM6IHsgYXNzZXRJRDogc3RyaW5nLCBhbW91bnQ6IHN0cmluZywgdG86IHN0cmluZyB9W10gPSBbXVxuXG4gICAgc2VuZE91dHB1dHMuZm9yRWFjaCgob3V0cHV0OiB7XG4gICAgICBhc3NldElEOiBzdHJpbmcgfCBCdWZmZXJcbiAgICAgIGFtb3VudDogbnVtYmVyIHwgQk5cbiAgICAgIHRvOiBzdHJpbmdcbiAgICB9KSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHRoaXMucGFyc2VBZGRyZXNzKG91dHB1dC50bykgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihcIkVycm9yIC0gQVZNQVBJLnNlbmRNdWx0aXBsZTogSW52YWxpZCBhZGRyZXNzIGZvcm1hdFwiKVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvdXRwdXQuYXNzZXRJRCAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICBhc3NldCA9IGJpbnRvb2xzLmNiNThFbmNvZGUob3V0cHV0LmFzc2V0SUQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhc3NldCA9IG91dHB1dC5hc3NldElEXG4gICAgICB9XG4gICAgICBpZiAodHlwZW9mIG91dHB1dC5hbW91bnQgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgYW1udCA9IG5ldyBCTihvdXRwdXQuYW1vdW50KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYW1udCA9IG91dHB1dC5hbW91bnRcbiAgICAgIH1cbiAgICAgIHNPdXRwdXRzLnB1c2goe3RvOiBvdXRwdXQudG8sIGFzc2V0SUQ6IGFzc2V0LCBhbW91bnQ6IGFtbnQudG9TdHJpbmcoMTApfSlcbiAgICB9KVxuXG4gICAgY29uc3QgcGFyYW1zOiBhbnkgPSB7XG4gICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICBwYXNzd29yZDogcGFzc3dvcmQsXG4gICAgICBvdXRwdXRzOiBzT3V0cHV0cyxcbiAgICB9XG5cbiAgICBmcm9tID0gdGhpcy5fY2xlYW5BZGRyZXNzQXJyYXkoZnJvbSwgXCJzZW5kXCIpXG4gICAgaWYodHlwZW9mIGZyb20gIT09IFwidW5kZWZpbmVkXCIpe1xuICAgICAgcGFyYW1zW1wiZnJvbVwiXSA9IGZyb21cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGNoYW5nZUFkZHIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJzZUFkZHJlc3MoY2hhbmdlQWRkcikgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgdGhyb3cgbmV3IEFkZHJlc3NFcnJvcihcIkVycm9yIC0gQVZNQVBJLnNlbmQ6IEludmFsaWQgYWRkcmVzcyBmb3JtYXRcIilcbiAgICAgIH1cbiAgICAgIHBhcmFtc1tcImNoYW5nZUFkZHJcIl0gPSBjaGFuZ2VBZGRyXG4gICAgfSBcblxuICAgIGlmKHR5cGVvZiBtZW1vICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAodHlwZW9mIG1lbW8gIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcGFyYW1zW1wibWVtb1wiXSA9IGJpbnRvb2xzLmNiNThFbmNvZGUobWVtbylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcmFtc1tcIm1lbW9cIl0gPSBtZW1vXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwiYXZtLnNlbmRNdWx0aXBsZVwiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogR2l2ZW4gYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgVmlydHVhbCBNYWNoaW5l4oCZcyBnZW5lc2lzIHN0YXRlLCBjcmVhdGUgdGhlIGJ5dGUgcmVwcmVzZW50YXRpb24gb2YgdGhhdCBzdGF0ZS5cbiAgICpcbiAgICogQHBhcmFtIGdlbmVzaXNEYXRhIFRoZSBibG9ja2NoYWluXCJzIGdlbmVzaXMgZGF0YSBvYmplY3RcbiAgICpcbiAgICogQHJldHVybnMgUHJvbWlzZSBvZiBhIHN0cmluZyBvZiBieXRlc1xuICAgKi9cbiAgYnVpbGRHZW5lc2lzID0gYXN5bmMgKGdlbmVzaXNEYXRhOiBvYmplY3QpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICAgIGNvbnN0IHBhcmFtczogYW55ID0ge1xuICAgICAgZ2VuZXNpc0RhdGEsXG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlOiBSZXF1ZXN0UmVzcG9uc2VEYXRhID0gYXdhaXQgdGhpcy5jYWxsTWV0aG9kKFwiYXZtLmJ1aWxkR2VuZXNpc1wiLCBwYXJhbXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEucmVzdWx0LmJ5dGVzXG4gIH1cblxuICAvKipcbiAgICogQGlnbm9yZVxuICAgKi9cbiAgcHJvdGVjdGVkIF9jbGVhbkFkZHJlc3NBcnJheShhZGRyZXNzZXM6IHN0cmluZ1tdIHwgQnVmZmVyW10sIGNhbGxlcjogc3RyaW5nKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGFkZHJzOiBzdHJpbmdbXSA9IFtdXG4gICAgY29uc3QgY2hhaW5pZDogc3RyaW5nID0gdGhpcy5nZXRCbG9ja2NoYWluQWxpYXMoKSA/IHRoaXMuZ2V0QmxvY2tjaGFpbkFsaWFzKCkgOiB0aGlzLmdldEJsb2NrY2hhaW5JRCgpXG4gICAgaWYgKGFkZHJlc3NlcyAmJiBhZGRyZXNzZXMubGVuZ3RoID4gMCkge1xuICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGFkZHJlc3Nlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodHlwZW9mIGFkZHJlc3Nlc1tpXSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJzZUFkZHJlc3MoYWRkcmVzc2VzW2ldIGFzIHN0cmluZykgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICB0aHJvdyBuZXcgQWRkcmVzc0Vycm9yKFwiRXJyb3IgLSBBVk1BUEkuJHtjYWxsZXJ9OiBJbnZhbGlkIGFkZHJlc3MgZm9ybWF0XCIpXG4gICAgICAgICAgfVxuICAgICAgICAgIGFkZHJzLnB1c2goYWRkcmVzc2VzW2ldIGFzIHN0cmluZylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCB0eXBlOiBTZXJpYWxpemVkVHlwZSA9IFwiYmVjaDMyXCJcbiAgICAgICAgICBhZGRycy5wdXNoKHNlcmlhbGl6YXRpb24uYnVmZmVyVG9UeXBlKGFkZHJlc3Nlc1tpXSBhcyBCdWZmZXIsIHR5cGUsIHRoaXMuY29yZS5nZXRIUlAoKSwgY2hhaW5pZCkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFkZHJzXG4gIH1cblxuICAvKipcbiAgICogVGhpcyBjbGFzcyBzaG91bGQgbm90IGJlIGluc3RhbnRpYXRlZCBkaXJlY3RseS4gSW5zdGVhZCB1c2UgdGhlIFtbQXZhbGFuY2hlLmFkZEFQSV1dIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIGNvcmUgQSByZWZlcmVuY2UgdG8gdGhlIEF2YWxhbmNoZSBjbGFzc1xuICAgKiBAcGFyYW0gYmFzZXVybCBEZWZhdWx0cyB0byB0aGUgc3RyaW5nIFwiL2V4dC9iYy9YXCIgYXMgdGhlIHBhdGggdG8gYmxvY2tjaGFpblwicyBiYXNldXJsXG4gICAqIEBwYXJhbSBibG9ja2NoYWluSUQgVGhlIEJsb2NrY2hhaW5cInMgSUQuIERlZmF1bHRzIHRvIGFuIGVtcHR5IHN0cmluZzogXCJcIlxuICAgKi9cbiAgY29uc3RydWN0b3IoY29yZTogQXZhbGFuY2hlQ29yZSwgYmFzZXVybDogc3RyaW5nID0gXCIvZXh0L2JjL1hcIiwgYmxvY2tjaGFpbklEOiBzdHJpbmcgPSBcIlwiKSB7XG4gICAgc3VwZXIoY29yZSwgYmFzZXVybClcbiAgICB0aGlzLmJsb2NrY2hhaW5JRCA9IGJsb2NrY2hhaW5JRFxuICAgIGNvbnN0IG5ldGlkOiBudW1iZXIgPSBjb3JlLmdldE5ldHdvcmtJRCgpXG4gICAgaWYgKG5ldGlkIGluIERlZmF1bHRzLm5ldHdvcmsgJiYgYmxvY2tjaGFpbklEIGluIERlZmF1bHRzLm5ldHdvcmtbbmV0aWRdKSB7XG4gICAgICBjb25zdCB7IGFsaWFzIH0gPSBEZWZhdWx0cy5uZXR3b3JrW25ldGlkXVtibG9ja2NoYWluSURdXG4gICAgICB0aGlzLmtleWNoYWluID0gbmV3IEtleUNoYWluKHRoaXMuY29yZS5nZXRIUlAoKSwgYWxpYXMpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMua2V5Y2hhaW4gPSBuZXcgS2V5Q2hhaW4odGhpcy5jb3JlLmdldEhSUCgpLCBibG9ja2NoYWluSUQpXG4gICAgfVxuICB9XG59XG4iXX0=