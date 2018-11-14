import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { IExpression, INodeDescriptor, INodeOption } from "../../../common-interfaces";

export default class QueryField extends SimpleNodeViewModel {
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
        this.options = [{ id: 0, name: "False" }, { id: 1, name: "True" }];
        this.selectedOptionId = this.value || 0;
    }

    getExpression(): IExpression {
        var fieldName = this.descriptor.fieldName;
        return this.buildExpression(`${fieldName}.Value`, `HasNonZeroNumericValue(${fieldName})`);
    }

    getSignal() {        
        this.selfStates[this.selfStatesKey] = this.selectedOptionId;
        return Signal.create(!!this.selectedOptionId, this.getExpression());
    }
}