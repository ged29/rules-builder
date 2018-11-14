import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { ValidatorNames } from "../validation/validators";
import { IExpression, INodeDescriptor, INodeDescriptorResourceConfig } from "../../../common-interfaces";

export default class TextResourceField extends SimpleNodeViewModel {
    
    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, false);
        this.value = (this.descriptor.config && (this.descriptor.config as INodeDescriptorResourceConfig).text) || undefined;

        if (isViewModel) {
            this.buildValidation([ValidatorNames.required]);
            this.isValueValid();
        }
    }

    getExpression(): IExpression {
        var fieldName = this.descriptor.fieldName,
            expression = this.buildExpression(`${fieldName}.Value`, `R(${fieldName})`);

        expression.config = this.value as string;

        return expression;
    }

    getSignal() {
        return Signal.create(this.value, this.getExpression());
    }
}