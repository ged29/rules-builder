import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression, IControlAttrs } from "../../../common-interfaces";
import { ValidatorNames } from "../validation/validators";

export default class NumericConstant extends SimpleNodeViewModel {

    controlAttrs: IControlAttrs;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, true);

        this.buildValidation([ValidatorNames.required, ValidatorNames.decimalNumber]);
        this.isValueValid();

        if (isViewModel) {
            this.controlAttrs = {
                fieldLength: descriptor.fieldLength,
                fieldPlaceholder: "?"
            };
        }
    }

    getExpression(): IExpression {
        var exprValue = this.isValid ? this.value.toString() : `${this.descriptor.exprAlias}(?)`;
        return this.buildExpression(exprValue);
    }

    getSignal() {
        var value = this.isValueValid() ? parseFloat(this.value) : undefined;
        this.selfStates[this.selfStatesKey] = this.value;

        return Signal.create(value, this.getExpression());
    }
}