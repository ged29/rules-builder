import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression, IControlAttrs } from "../../../common-interfaces";
import { ValidatorNames } from "../validation/validators";
import timeUtility from "../utilities/time-utility";

export default class TimeField extends SimpleNodeViewModel {

    controlAttrs: IControlAttrs;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, isViewModel);

        if (isViewModel) {
            this.configControl();
        }
    }

    configControl() {
        this.controlAttrs = {
            fieldLength: this.descriptor.fieldLength,
            fieldPlaceholder: "HH:MM"
        };
        this.buildValidation([ValidatorNames.required, ValidatorNames.time]);

        if (!isNaN(this.value) && this.value >= 0) {
            this.value = timeUtility.toTimeString(this.value);
        }
    }

    getExpression(): IExpression {
        var fieldName = this.descriptor.fieldName;
        return this.buildExpression(`${fieldName}.Value`, `T(${fieldName})`);
    }

    getSignal() {
        var value = this.isValueValid() ? timeUtility.getMinutes(this.value) : undefined;
        this.selfStates[this.selfStatesKey] = this.value;

        return Signal.create(value, this.getExpression());
    }
}