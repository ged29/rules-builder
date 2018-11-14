import CanvasCache from "../../models/caches/canvas-cache";
import { EventEmitter } from "../../utils/event-emitter";
import FunctionalNode from "../../models/layout/node";
import BranchesOfExpressions from "../../states/branches-of-expressions";
import numToTextUtility, { FormattingType } from "../nodes/utilities/num-to-text-utility";
import NumToText from "../../models/nodes/formating/num-to-text";
import { CanvasInteractionMode, NodeType, VisualStateType } from "../../common-enums";
import { IForFieldAttributes, INodePersistState } from "../../common-interfaces";
import { uuid } from "../../../services/utils/uuid";

export default class Canvas extends EventEmitter {
    static CopiedVisualStateSlotName = "exe_copied_visual_state_fragment";

    id: string;
    cache: CanvasCache;    
    forFieldAttributes: IForFieldAttributes;
    visualStateType: VisualStateType = VisualStateType.Restored;

    branchesOfExpressions: BranchesOfExpressions;
    exprDefinition: string;

    isReady: boolean;
    isReadOnly: boolean;
    isViewModel: boolean;
    //canvas events
    ready: () => void;
    paste: () => void;

    private sequentialNumberOfNode: number = -1;

    constructor(
        forFieldAttributes: IForFieldAttributes,
        interactionMode: CanvasInteractionMode,
        exprDefinition: string) {
        super();

        this.id = uuid.get();
        this.cache = new CanvasCache();        
        this.forFieldAttributes = forFieldAttributes;
        this.isViewModel = (interactionMode & CanvasInteractionMode.asViewModel) > 0;

        if (this.isViewModel) {
            this.branchesOfExpressions = new BranchesOfExpressions();
            this.exprDefinition = exprDefinition;
            this.isReadOnly = interactionMode === CanvasInteractionMode.ReadOnly;
            //canvas events
            this.isReady = false;
            this.ready = () => {
                this.isReady = true;
                this.emit("canvas.ready"); // set this canvas to be restored and ready for interaction                
            }
            this.paste = () => this.emit("canvas.paste"); // trigger this canvas paste event
        }
    }
    /**
     * Subscribes on the Expression Canvas ready event that occurs only once per each of restored canvas instance.
     * (means that all assets of canvas instance was restored and ready for interaction with)
     * @param callback to call when the new Expression Canvas is restored and ready for interaction
     * @param context to be bind to event callback
     */
    onReady(callback: () => void, context: object, isHighPriority: boolean = false) {
        this.on("canvas.ready", callback, context, isHighPriority);
    }
    /**
     * Subscribes on the Expression Canvas paste event that occurs when the copied Visual State fragment 
     * has been restored and rendered on this or on the other instance of Canvas.
     * @param callback to call when the copied Visual State fragment has been restored and rendered on this or on the other instance of Canvas
     * @param context to be bind to event callback
     */
    onPaste(callback: () => void, context: object) {
        this.on("canvas.paste", callback, context);
    }

    get SequentialNumberOfNode(): number {
        return ++this.sequentialNumberOfNode;
    }
    
    getSplitByExportPriorities(nodes: Readonly<{ [id: string]: FunctionalNode }>): IExportPriorities {    
        return null;
    }

    setVisualState(visualState: IBehaviorVisualState, exportPriorities: Readonly<IExportPriorities>) {
        var exportPriority: IExportPriority,
            usedFieldsIds: { [index: string]: string } = {};

        for (let priority in exportPriorities) {
            exportPriority = exportPriorities[priority];

            visualState.nodes.push.apply(visualState.nodes, exportPriority.nodeStates);
            visualState.connectivity.push.apply(visualState.connectivity, exportPriority.conectivity);

            for (let fieldId in exportPriority.usedFieldsIds) {
                usedFieldsIds[fieldId] = exportPriority.usedFieldsIds[fieldId];
            }
        }

        visualState.usedFieldsIds = usedFieldsIds;
    }

    private getFormattingMarker() {
        var resultingNode = this.cache.getResultingNode(),
            upStreamNode = resultingNode.getFirstIngoingConnection().outputPort.parentNode,
            upStreamNodeModel = upStreamNode.model as NumToText;

        if (upStreamNode.descriptor.name === "numToText") {
            return numToTextUtility.getOption(upStreamNodeModel.selectedOptionId);
        }

        return numToTextUtility.getOption(FormattingType.AsItIs);
    }

    destroy() {
        if (this.isViewModel) {

            for (let nodeId in this.cache.cacheOfNodes) {
                this.cache.cacheOfNodes[nodeId].remove(true);
            }

            this.branchesOfExpressions.clear();
            this.allOff();
        }
        this.cache.clear();
    }
}

interface IExportPriority {
    nodeStates: INodePersistState[];
    conectivity: string[];
    usedFieldsIds: { [id: string]: string };
}

interface IExportPriorities {
    [id: number]: IExportPriority;
}

export interface IBehaviorVisualState {
    nodes: INodePersistState[];
    connectivity: any[];
    usedFieldsIds: { [index: string]: string };
    fieldsIndexes: {};
}
