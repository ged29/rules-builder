import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression, IControlAttrs } from "../../../common-interfaces";
import { ValidatorNames } from "../validation/validators";

export default class TextField extends SimpleNodeViewModel {

    controlAttrs: IControlAttrs;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, isViewModel);

        if (isViewModel) {
            this.controlAttrs = {
                fieldLength: descriptor.fieldLength,
                fieldPlaceholder: "?"
            };
            this.buildValidation([ValidatorNames.required]);
        }
    }

    getExpression(): IExpression {
        var fieldName = this.descriptor.fieldName;
        return this.buildExpression(`${fieldName}.Value`, fieldName);
    }

    getSignal() {
        var value = this.isValueValid() ? `'${this.value}'` : undefined;
        this.selfStates[this.selfStatesKey] = this.value;

        return Signal.create(value, this.getExpression());
    }
}