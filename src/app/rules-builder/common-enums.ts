/*tslint:disable: no-bitwise */
export const enum DragSource {
    Navigation = 0,
    NodesToolbox = 1
}

export const enum VisualStateType {
    None = -1,
    Restored = 0,   // the visual state of whole expression
    PasteToThisCanvas = 1 << 0, // the visual state that was copied and then pasted on the same expression canvas
    PasteToSlideContainer = 1 << 1, // the visual state that was copied and then visualized to the dedicated slide container
    FromSameCanvas = Restored | PasteToThisCanvas
}

export enum PortType {
    Input = 0, Output = 1, All = -1
}

export const enum CanvasInteractionMode {
    Service = 0,
    ReadOnly = 1 << 0,
    RegularComponent = 1 << 1,
    UnitTests = 1 << 2,
    asViewModel = ReadOnly | RegularComponent | UnitTests
}

export const enum CalculationType {
    SingleOutput, MultipleOutput
}

export const enum EvaluationSource {
    Local, CalcEngineResource
}

export const enum NodeType {
    PendingAssignment = 0,         // 0
    Constant = 1 << 0,             // 1
    SimpleFunction = 1 << 1,       // 2
    ChoiceFunction = 1 << 2,       // 4
    RemoteCalculation = 1 << 3,    // 8
    InputField = 1 << 4,           // 16
    OutputField = 1 << 5,          // 32
    ResultingInputField = 1 << 6,  // 64
    ResultingOutputField = 1 << 7, // 128
    ResultingDynamicMessageField = 1 << 8, // 256
    ResultingIndexField = 1 << 9,  // 512
    DynamicPortsFunction = 1 << 10, // 1024
    AllResultingFields = ResultingInputField | ResultingOutputField | ResultingDynamicMessageField | ResultingIndexField,
    Field = InputField | OutputField,
    AllValueEmitter = Constant | InputField | OutputField
}

export enum DataType {
    PendingAssignment = 0,    // 0
    Numeric = 1 << 0,         // 1
    Text = 1 << 1,            // 2
    Boolean = 1 << 2,         // 4  
    Date = 1 << 3,            // 8
    Time = 1 << 4,            // 16
    Field = 1 << 5,           // 32
    AggregatedField = 1 << 6, // 64
    Set = 1 << 7,             // 128
    Resource = 1 << 8,        // 256  

    NumericSet = Numeric | Set,            // 129    
    NumericField = Numeric | Field,        // 33 
    TextField = Text | Field,              // 34
    BooleanField = Boolean | Field,        // 36
    DateField = Date | Field,              // 40  
    NumericTimeField = Numeric | Time | Field,            // 49
    NumericTimeTextField = Numeric | Time | Text | Field, // 51
    NumericDateTimeField = Numeric | Date | Time | Field, // 57
    All = Numeric | Text | Boolean | Date | Time | Field | Resource, // 319
    TextResourceField = Text | Resource | Field           // 290  
}

export const enum ViolatedInteractionRule {
    None = 0,
    NumberOfConnectionsExceeded = 1,
    AlreadyConnected = 2,
    InCompatibleDataType = 3,
    CyclicalLinkCanOccur = 4
}

export enum TypeOfState {
    value, expression, seqNumberOfNode
}

export enum DateFormat { none = -1, isDateInDDMMYYYY = 0, isDateInMMYYYY = 1, isDateInYYYY = 2 }

export const enum NumberFormat { none = -1, decimal = 0, integer = 1, positiveDecimal = 2 }
