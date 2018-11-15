import Port from "./models/layout/port";
import FunctionalNode from "./models/layout/node";
import { CalculationType, DataType, EvaluationSource, NodeType, DateFormat, NumberFormat, PortType, DragSource } from "./common-enums";

export interface IDroppableToolboxItem {
    name: string;
    caption: string;
    title: string;    
    dragSource: DragSource;
    isMatch: boolean;
    groupName?: string;    
    items?: IDroppableToolboxItem[];
}

export interface IPortDescriptor {
    //a character that is uniquely address a particular port in node
    marker: string;
    //an index through which the port is accessible in the array of ports
    index?: number;
    //a type of date that is port correspond to, this value is used for the Connectivity Rules checks
    dataType?: DataType;
    //a flag to switch the port visibility off
    isHidden?: boolean;
    isDynamic?: boolean;
    isMultiplyConnected?: boolean;
    //a flag to check the type of data match exactly, this value is used for the Connectivity Rules checks
    isDataTypeExactMatch?: boolean;
    //specify the number of connections allowed for port, this value is used for the Connectivity Rules checks
    maxConnCount?: number;
    title?: string;
    isCompatibleBy?: TIsCompatibleByFn;
}

export type TIsCompatibleByFn = (check: { dt: DataType, nodeName: string }) => boolean;

export interface IPortToSignalDescriptor {
    portType: PortType;
    marker: string;
}

export interface IDescriptorsGroup {    
    isToolboxGroup: boolean;
    isDebugPresent: boolean;
    typeOfNodesInGroup: NodeType;    
    nodes: INodeDescriptor[];
    modelsPerFunctions?: { [index: string]: any };
    caption?: string; //tmp solution 
}

export interface INodePersistState {
    id: string;
    left?: number;
    top?: number;
    descriptorName?: string;
    descriptorGroup?: string;
    dynamicPortDescriptors?: IPortDescriptor[];

    fieldId?: string;
    inputStates?: { [index: string]: any };  //old form of node state persistance, TODO: must be removed after migration
    outputStates?: { [index: string]: any }; //old form of node state persistance, TODO: must be removed after migration
    states?: { [index: string]: any }; //new form of node state persistance
}

export interface IConnectivityDescriptor {
    output: Port;
    input: Port;
}

export interface INodeDescriptor {
    // unique name of node to address it individually in the processing logic
    name: string;
    // the pointer on a logical model constructor
    modelCtor: any;    
    //the value of PortDescriptor for input and output ports
    ports: {
        input?: IPortDescriptor[];
        output: IPortDescriptor[];
    };

    hasInputPorts?: boolean;
    firstOutputPort?: IPortDescriptor;
    //UI template to which the node is bound to
    templateId: string;
    //sets the number of the exporting turn of node during the persistence of expression canvas
    exportPriority: number;

    fieldLength?: number;
    title?: string;
    nodeType?: NodeType;
    evaluationSource?: EvaluationSource;
    //caption of node on the Toolbox, if not provided the value of caption is used
    toolboxCaption?: string;
    //caption of node on UI model
    caption?: string;
    exprAlias?: string;
    groupName?: string;

    id?: string;
    fieldId?: string;
    fieldName?: string;
    isAggregated?: boolean;
    behaviourProperty?: string;
    options?: INodeDescriptorOption[];
    config?: INodeDescriptorConfig;
    persistedStates?: { [index: string]: any }; //{ [index: number]: { [index: string]: any } };    
    portMarkerToIndexMap?: { [index: number]: { [index: string]: number } };
    isHidden?: boolean;
    isDebugPresent?: boolean;
}

export interface ICalcNodeDescriptor extends INodeDescriptor {
    library: string;
    function: string;
    calculationType: CalculationType;
}

export type INodeDescriptorConfig = INodeDescriptorDateConfig | INodeDescriptorNumericConfig | INodeIsCheckableConfig | INodeDescriptorResourceConfig;

export interface INodeDescriptorDateConfig {
    format: DateFormat;
}

export interface INodeDescriptorNumericConfig {
    format: NumberFormat;
}

export interface INodeIsCheckableConfig {
    isCheckable: boolean;
}

export interface INodeDescriptorResourceConfig {
    text: string;
}

export interface INodeOption {
    id: string | number;
    name: string;
}

export interface INodeDescriptorOption {
    id: string | number;
    name: string;
    fieldId?: string;
    uuid?: string;
    isNoneOption?: boolean;
}

export interface IOutputMetrics {
    oldMetric: number;
    newMetric: number;
    setEqual: () => void;
}

export interface INodeState {
    index?: number;
    seqNumberOfNode?: number;
    value?: any;
    expression?: IExpression;
    //for multiply connected node
    subStates?: { [index: string]: INodeState };
    subStatesCount?: number;
}

export interface IExpressionEvaluationDescriptor {
    evalNodeDescriptor: INodeDescriptor;
    isEvalInputPortMultiplyConnected: boolean;
    inputExpressions: IExpression[];
    connectedUpStreamNode: FunctionalNode;
}

export interface IPortPositionChangeListener {
    onPortPositionChanged(port): void;
}

export interface IMouseDownResult {
    canBeDragged: boolean;
    canBeSnapped: boolean;
}

export interface IMultiChoiceDropdownOption {
    value: number;
    name: string;
    fieldId: string;
    fieldName: string;
    isNoneOption: boolean;
    checked: boolean;
}

export interface IExpression {
    exprToShow: string;
    exprToExport: string;
    isFromField?: boolean;
    dataType?: DataType;
    options?: IMultiChoiceDropdownOption[];
    config?: DateFormat | string;
    fieldId?: string;
}

export interface ICalcExpression extends IExpression {
    library: string;
    func: string;
    calcType: CalculationType;
    inputExprs: { [index: string]: IExpression };
}

//Describes a input field attributes for which an expression is build 
export interface IForFieldAttributes {
    fieldName: string;
    fieldType: NodeType;
    behaviourProperty: string;
}

//Describes the Nodes as inclusion in an expression branch
export interface IBranch {
    nodeType: NodeType;
    // the expression of Node
    expression: IExpression;
    isExprResolved: boolean;
    // whether the Node is included as input argument into the downstream Nodes
    isIncludedAsArg: boolean;
    // the number of inclusion as input argument into the downstream Nodes
    numberOfInclusionsAsArg: number;
    // flag indicates whether the Node is a input field for which an finally expression is build
    isResultingExpr: boolean;
    // the input arguments of Node
    inArgs: {
        [index: number]: IBranch
    };
}

export interface IBranchesOfExpressionsState {
    branches: { [index: number]: IBranch };
    finalExpression: IExpression;
}

export interface IFinalExpression {
    evaluationSource: EvaluationSource;
    expression: any;
    outputFieldFormattingMarker?: string;
}

export interface IControlAttrs {
    fieldLength: number;
    fieldPlaceholder: string;
}
