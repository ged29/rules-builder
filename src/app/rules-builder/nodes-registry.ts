import { EvaluationSource, PortType, NodeType, DragSource } from "./common-enums";
import { IDroppableToolboxItem, INodeDescriptor, IPortDescriptor } from "./common-interfaces";
import descriptorsGroups from "./config/descriptors-groups";
import { utils } from "./utils/utils.service";

class NodesRegistry {
    //inner cached groups of descriptors
    private _allDescriptorsGroups: { [index: string]: { [index: string]: INodeDescriptor } } = {};
    private _toolboxItems: IDroppableToolboxItem[] = [];

    constructor() {
        //fill up a local cache
        for (let groupName in descriptorsGroups) {
            let descriptorsGroup = descriptorsGroups[groupName];
            this.initDescriptors(groupName, descriptorsGroup.nodes, descriptorsGroup.typeOfNodesInGroup, descriptorsGroup.isDebugPresent);

            if (descriptorsGroup.isToolboxGroup) {
                this.initToolboxItems(groupName, descriptorsGroup.caption);
            }
        }
        //sort the group items by caption in the alphabetical order
        this._toolboxItems = this._toolboxItems.sort((a, b) => { return a.caption.localeCompare(b.caption); });
    }

    private initToolboxItems(groupName: string, groupCaption: string) {
        var items: IDroppableToolboxItem[] = [],
            itemDescriptor: INodeDescriptor;
        //create the toolbox items from the precompiled descriptors
        for (let descriptorName in this._allDescriptorsGroups[groupName]) {
            itemDescriptor = this._allDescriptorsGroups[groupName][descriptorName];
            if (!itemDescriptor.isHidden) {
                items.push({
                    name: itemDescriptor.name,
                    caption: itemDescriptor.toolboxCaption || itemDescriptor.caption,
                    title: itemDescriptor.title,
                    groupName: groupName,
                    isMatch: true,
                    dragSource: DragSource.NodesToolbox
                });
            }
        }
        //then sort them by caption in the alphabetical order
        if (items.length) {
            items = items.sort((a, b) => { return a.caption.localeCompare(b.caption); });
        }

        this._toolboxItems.push({
            name: groupName,
            caption: groupCaption,
            title: groupCaption,
            isMatch: true,
            items: items,
            dragSource: DragSource.NodesToolbox
        });
    }

    private initDescriptors(
        groupName: string,
        nodeDescriptors: INodeDescriptor[],
        typeOfNodesInGroup: NodeType,
        isDebugPresent: boolean) {

        let nodeDescriptorByName: { [nodeName: string]: INodeDescriptor } = {};

        for (let nodeDescriptor of nodeDescriptors) {
            let nodeName = nodeDescriptor.name;
            //inject additional attributes                         
            nodeDescriptor.groupName = groupName;
            nodeDescriptor.nodeType = nodeDescriptor.nodeType || typeOfNodesInGroup;
            nodeDescriptor.exprAlias = nodeDescriptor.exprAlias || nodeDescriptor.caption;
            nodeDescriptor.hasInputPorts = nodeDescriptor.ports.hasOwnProperty("input");
            nodeDescriptor.evaluationSource = nodeDescriptor.evaluationSource || EvaluationSource.Local;
            nodeDescriptor.firstOutputPort = nodeDescriptor.ports.output[0];
            nodeDescriptor.caption = !!nodeDescriptor.fieldId ? nodeDescriptor.fieldName : nodeDescriptor.caption;
            nodeDescriptor.title = nodeDescriptor.title || `BehaviorDesigner.Layout.Nodes.${nodeName}.title`;
            nodeDescriptor.portMarkerToIndexMap = {};
            nodeDescriptor.isHidden = !!nodeDescriptor.isHidden;
            nodeDescriptor.isDebugPresent = nodeDescriptor.isDebugPresent || isDebugPresent;

            if (nodeDescriptor.hasInputPorts) {
                nodeDescriptor.portMarkerToIndexMap[PortType.Input] = {};
                this.initPortDescriptors(nodeDescriptor, PortType.Input);
            }

            nodeDescriptor.portMarkerToIndexMap[PortType.Output] = {};
            this.initPortDescriptors(nodeDescriptor, PortType.Output);

            nodeDescriptorByName[nodeName] = nodeDescriptor;
        }

        this._allDescriptorsGroups[groupName] = nodeDescriptorByName;
    }

    initPortDescriptors(nodeDescriptor: INodeDescriptor, portType: PortType) {
        var nodeName = nodeDescriptor.name,
            portMarkerToIndexMap = nodeDescriptor.portMarkerToIndexMap[portType],
            portTypeName = portType === PortType.Input ? "input" : "output",
            pds: IPortDescriptor[] = nodeDescriptor.ports[portTypeName],
            pd: IPortDescriptor;
        //reinit the PortDescriptors collection of nodeDescriptor
        for (var index = 0, len = pds.length; index < len; index++) {
            pd = pds[index];
            pd.index = index;
            pd.title = pd.title || `BehaviorDesigner.Layout.Nodes.${nodeName}.${portTypeName}.${pd.marker}`;
            pd.isDynamic = false;

            if (portType === PortType.Input) {
                pd.isMultiplyConnected = !pd.isHidden && (!pd.maxConnCount || pd.maxConnCount > 1);
            }

            portMarkerToIndexMap[pd.marker] = index;
        }
    }

    addDynamicPortDescriptors(nodeDescriptor: INodeDescriptor, portType: PortType, portDescriptorsToAdd: IPortDescriptor[]) {
        var targetPds: IPortDescriptor[] = portType === PortType.Input ? nodeDescriptor.ports.input : nodeDescriptor.ports.output,
            portMarkerToIndexMap = nodeDescriptor.portMarkerToIndexMap[portType],
            pd: IPortDescriptor;

        for (let pdi = portDescriptorsToAdd.length; pdi--;) {
            pd = portDescriptorsToAdd[pdi];
            pd.isDynamic = true;
            pd.isMultiplyConnected = !pd.maxConnCount || pd.maxConnCount > 1;
            targetPds[pd.index] = pd;

            portMarkerToIndexMap[pd.marker] = pd.index;
        }
    }

    getToolboxGroups() {
        return this._toolboxItems;
    }

    getDescriptorByGroupAndName(groupName: string, descriptorName: string) {
        if (!this._allDescriptorsGroups.hasOwnProperty(groupName)) {
            throw `Can't find node descriptors for group = "${groupName}"`;
        }

        if (!this._allDescriptorsGroups[groupName].hasOwnProperty(descriptorName)) {
            throw `Can't find node descriptors for group = "${groupName}" and name = "${descriptorName}"`;
        }

        return utils.deepcopy(this._allDescriptorsGroups[groupName][descriptorName]);
    }

    getDescriptorForResultingField() {
        return this.getDescriptorByGroupAndName("resultingFields", "resultingField");
    }
}

export default new NodesRegistry();
