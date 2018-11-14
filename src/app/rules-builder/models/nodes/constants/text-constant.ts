import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { IControlAttrs, INodeDescriptor, IExpression } from "../../../common-interfaces";
import { ValidatorNames } from "../validation/validators";

export default class TextConstant extends SimpleNodeViewModel {

    controlAttrs: IControlAttrs;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, true);

        this.value = typeof this.value === "string" && this.value.length ? this.value.replace(/\'/g, "") : undefined;
        this.buildValidation([ValidatorNames.required]);
        this.isValueValid();

        if (isViewModel) {
            this.controlAttrs = {
                fieldLength: descriptor.fieldLength,
                fieldPlaceholder: "?"
            };
        }
    }

    getExpression(): IExpression {
        var exprValue = this.isValid ? `'${this.value}'` : `${this.descriptor.exprAlias}(?)`;
        return this.buildExpression(exprValue);
    }

    getSignal() {
        var value = this.isValueValid() ? `'${this.value}'` : undefined;
        this.selfStates[this.selfStatesKey] = this.value;

        return Signal.create(value, this.getExpression());
    }
}