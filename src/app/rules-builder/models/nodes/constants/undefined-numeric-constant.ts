import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression } from "../../../common-interfaces";

export default class UndefinedNumericConstant extends SimpleNodeViewModel {

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel);
    }

    getExpression(): IExpression {
        return this.buildExpression("undefined", "1/0");
    }

    getSignal() {
        return Signal.create(undefined, this.getExpression());
    }
}