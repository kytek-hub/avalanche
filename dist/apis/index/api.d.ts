/**
 * @packageDocumentation
 * @module Index-Auth
 */
import AvalancheCore from '../../avalanche';
import { JRPCAPI } from '../../common/jrpcapi';
import { GetLastAcceptedResponse, GetContainerByIndexResponse, GetContainerByIDResponse, GetContainerRangeResponse } from '../../common/interfaces';
/**
 * Class for interacting with a node's IndexAPI.
 *
 * @category RPCAPIs
 *
 * @remarks This extends the [[JRPCAPI]] class. This class should not be directly called. Instead, use the [[Avalanche.addAPI]] function to register this interface with Avalanche.
 */
export declare class IndexAPI extends JRPCAPI {
    /**
     * Get last accepted tx, vtx or block
     *
     * @param encoding
     * @param baseurl
     *
     * @returns Returns a Promise<GetLastAcceptedResponse>.
     */
    getLastAccepted: (encoding?: string, baseurl?: string) => Promise<GetLastAcceptedResponse>;
    /**
     * Get container by index
     *
     * @param index
     * @param encoding
     * @param baseurl
     *
     * @returns Returns a Promise<GetContainerByIndexResponse>.
     */
    getContainerByIndex: (index?: string, encoding?: string, baseurl?: string) => Promise<GetContainerByIndexResponse>;
    /**
     * Get contrainer by ID
     *
     * @param containerID
     * @param encoding
     * @param baseurl
     *
     * @returns Returns a Promise<GetContainerByIDResponse>.
     */
    getContainerByID: (containerID?: string, encoding?: string, baseurl?: string) => Promise<GetContainerByIDResponse>;
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
    getContainerRange: (startIndex?: number, numToFetch?: number, encoding?: string, baseurl?: string) => Promise<GetContainerRangeResponse[]>;
    /**
     * Get index by containerID
     *
     * @param containerID
     * @param encoding
     * @param baseurl
     *
     * @returns Returns a Promise<GetIndexResponse>.
     */
    getIndex: (containerID?: string, encoding?: string, baseurl?: string) => Promise<string>;
    /**
     * Check if container is accepted
     *
     * @param containerID
     * @param encoding
     * @param baseurl
     *
     * @returns Returns a Promise<GetIsAcceptedResponse>.
     */
    isAccepted: (containerID?: string, encoding?: string, baseurl?: string) => Promise<boolean>;
    constructor(core: AvalancheCore, baseurl?: string);
}
//# sourceMappingURL=api.d.ts.map