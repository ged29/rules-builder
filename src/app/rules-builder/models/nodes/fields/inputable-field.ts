import { INodeDescriptor } from "../../../common-interfaces";
import { DataType } from "../../../common-enums";
import NumericField from "./numeric-field";
import TextField from "./text-field";

export default class InputableField {
    //In the previous version of ExE the Numeric and Text fields were implemented as InputableField
    //so this model was added to support the old serialization schema
    //In future should be removed
    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        return descriptor.firstOutputPort.dataType === DataType.NumericField
            ? new NumericField(descriptor, isViewModel)
            : new TextField(descriptor, isViewModel);
    }
}