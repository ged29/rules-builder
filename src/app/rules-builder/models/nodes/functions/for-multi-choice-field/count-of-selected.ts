import Signal from "../../../../states/signal";
import { SimpleNodeViewModel } from "../../base/simple-node-view-model";
import { IExpression, INodeDescriptor, IMultiChoiceDropdownOption } from "../../../../common-interfaces";

export default class CountOfSelected extends SimpleNodeViewModel {

    selectedCount: number;
    emptyExpression: IExpression;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel);

        this.emptyExpression = this.buildExpression(`${this.descriptor.exprAlias}(?)`, "?");
    }

    getValue(args: any[]) {
        return this.selectedCount;
    }

    getExpression(args: IExpression[]): IExpression {
        var emitterExpr = args[0],
            emitterNameToExport = emitterExpr.exprToExport,
            emitterOptions = emitterExpr.options,
            isNoneOptionPresent = false,
            aggregatedFieldNames = [],
            exprToShow = `CountOfSelected(${emitterExpr.exprToShow})`,
            countOfDefinedClause;

        if (emitterNameToExport === "?" || !emitterOptions || !emitterOptions.length) {
            this.selectedCount = undefined;
            return this.emptyExpression;
        }

        this.selectedCount = 0;

        for (let len = emitterOptions.length, inx = 0, option: IMultiChoiceDropdownOption; inx < len; inx++) {
            option = emitterOptions[inx];

            if (!option.isNoneOption) {
                aggregatedFieldNames.push(option.fieldName);

                if (!isNoneOptionPresent && option.checked) {
                    this.selectedCount += 1;
                }
            }
            else {
                isNoneOptionPresent = true;

                if (option.checked) {
                    this.selectedCount = 0;
                }
            }
        }

        countOfDefinedClause = `CountOfDefined(${aggregatedFieldNames.join(", ")})`;

        if (isNoneOptionPresent) {
            return this.buildExpression(exprToShow, `IF(HasValue(${emitterNameToExport}.None), 0, ${countOfDefinedClause})`);
        }

        return this.buildExpression(exprToShow, countOfDefinedClause);
    }

    getSignal() {
        return Signal.create(undefined, this.emptyExpression);
    }
}