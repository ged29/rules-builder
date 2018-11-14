import FunctionalNode from "../../models/layout/node";
import { IConnectivityDescriptor } from "../../common-interfaces";
import { uuid } from "../../../services/utils/uuid";

export default class CanvasCache {
    cacheOfNodes: { [id: string]: FunctionalNode };
    cacheOfConnectivity: IConnectivityDescriptor[];
    tempCacheOfNodes: { [id: string]: FunctionalNode };

    usedFieldIds: { [id: string]: string };
    private _countersOfUsedFieldIds: { [id: string]: number };

    constructor() {
        this.cacheOfNodes = {};
        this.tempCacheOfNodes = {};
        this.cacheOfConnectivity = [];

        this.usedFieldIds = {};
        this._countersOfUsedFieldIds = {};
    }

    get nodesCount() {
        return Object.keys(this.cacheOfNodes).length;
    }

    getResultingNode(): FunctionalNode {
        return this.getNodeById(uuid.empty);
    }
    /**
     * Says if this cache is empty
     *  (there is can be a Input Field Node with Empty GUID for which a Canvas is created, but it is added automatically)
     *         
     * @return {Node} Returns true if the cache of Nodes is empty otherwise false.
     **/
    isEmpty(): boolean {
        return this.nodesCount === 1 && this.getNodeById(uuid.empty) !== null;
    }

    getNodeById(nodeId: string): FunctionalNode {
        return this.cacheOfNodes[nodeId] || this.tempCacheOfNodes[nodeId];
    }
    /**
     * Adds the given Node to the related cache.
     *
     * @param {Node} node The node to be added to the related cache.     
     **/
    addNode(node: FunctionalNode) {
        this.cacheOfNodes[node.id] = node;

        if (node.isField) {
            this.registerField(node.fieldId, node.descriptor.fieldName);
        }
    }

    addTempNode(node: FunctionalNode) {
        this.tempCacheOfNodes[node.id] = node;
    }
    /**
     * Removes the given Node from the related cache.
     *
     * @param {Node} node The node to be removed from the related cache.
     **/
    removeNode(node: FunctionalNode) {
        delete this.cacheOfNodes[node.id];

        if (node.isField) {
            delete this.usedFieldIds[node.fieldId];
        }
    }

    registerField(fieldId: string, fieldName: string) {
        this.usedFieldIds[fieldId] = fieldName;
        if (!this._countersOfUsedFieldIds.hasOwnProperty(fieldId)) {
            this._countersOfUsedFieldIds[fieldId] = 0;
        }
        this._countersOfUsedFieldIds[fieldId] += 1;
    }

    unregisterField(fieldId: string) {
        this._countersOfUsedFieldIds[fieldId] -= 1;
        if (this._countersOfUsedFieldIds[fieldId] === 0) {
            delete this.usedFieldIds[fieldId];
        }
    }

    isFieldRegistered(fieldId: string) {
        return this.usedFieldIds.hasOwnProperty(fieldId);
    }

    mergeTempCache() {
        for (let id in this.tempCacheOfNodes) {
            this.addNode(this.tempCacheOfNodes[id]);
        }

        this.resetTempCache();
    }

    resetTempCache() {
        this.tempCacheOfNodes = {};
    }

    /**
      * Clears all of caches
      **/
    clear() {
        this.cacheOfNodes = {};
        this.cacheOfConnectivity = [];
        this.tempCacheOfNodes = {};
        this.usedFieldIds = {};
        this._countersOfUsedFieldIds = {};
    }
}
