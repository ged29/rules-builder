import Signal from "../../../../states/signal";
import { SimpleNodeViewModel } from "../../base/simple-node-view-model";
import { IExpression, INodeDescriptor, IMultiChoiceDropdownOption } from "../../../../common-interfaces";

export default class ItemsCount extends SimpleNodeViewModel {

    itemsCount: number;
    emptyExpression: IExpression;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel);

        this.emptyExpression = this.buildExpression(`${this.descriptor.exprAlias}(?)`, "?");
    }

    getValue(args: any[]) {
        return this.itemsCount;
    }

    getExpression(args: IExpression[]): IExpression {
        var emitterExpr = args[0],
            emitterOptions = emitterExpr.options,
            exprToShow = `ItemsCount(${emitterExpr.exprToShow})`,
            lastOption: IMultiChoiceDropdownOption;

        if (emitterExpr.exprToExport === "?" || !emitterOptions || !emitterOptions.length) {
            this.itemsCount = undefined;
            return this.emptyExpression;
        }

        this.itemsCount = emitterOptions.length;
        lastOption = emitterOptions[this.itemsCount - 1];

        if (lastOption.isNoneOption) {
            this.itemsCount -= 1;
            return this.buildExpression(exprToShow, `IF(HasValue(${lastOption.fieldName}), 0, ${this.itemsCount})`);
        }

        return this.buildExpression(exprToShow, `${this.itemsCount}`);
    }

    getSignal() {
        return Signal.create(undefined, this.emptyExpression);
    }
}