import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression, INodeOption } from "../../../common-interfaces";

export default class NoneField extends SimpleNodeViewModel {

    options: INodeOption[];
    selectedOptionId: number;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, isViewModel);

        if (isViewModel) {
            this.configControl();
        }
    }

    configControl() {
        this.options = [{ id: 0, name: "Unchecked" }, { id: 1, name: "Checked" }];
        this.selectedOptionId = this.value === undefined || this.value === false ? 0 : 1;
    }

    getExpression(): IExpression {
        var fieldName = this.descriptor.fieldName;
        return this.buildExpression(`${fieldName}.Value`, `HasValue(${fieldName})`);
    }

    getSignal() {
        var value = this.selectedOptionId === 0 ? undefined : true;
        this.selfStates[this.selfStatesKey] = value;

        return Signal.create(value, this.getExpression());
    }
}