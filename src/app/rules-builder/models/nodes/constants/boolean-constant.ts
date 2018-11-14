import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression, INodeOption } from "../../../common-interfaces";

export default class BooleanConstant extends SimpleNodeViewModel {

    options: INodeOption[];
    selectedOptionId: number;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, true);

        this.selectedOptionId = this.value === undefined || this.value === false ? 0 : 1;

        if (isViewModel) {
            this.options = [{ id: 0, name: "False" }, { id: 1, name: "True" }];
        }
    }

    getExpression(): IExpression {
        var exprValue = this.selectedOptionId === 0 ? "false" : "true";
        return this.buildExpression(exprValue);
    }

    getSignal() {
        var value = this.selectedOptionId === 0 ? false : true;
        this.selfStates[this.selfStatesKey] = value;

        return Signal.create(value, this.getExpression());
    }
}