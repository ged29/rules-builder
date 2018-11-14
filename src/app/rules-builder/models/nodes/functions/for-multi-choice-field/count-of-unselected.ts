import Signal from "../../../../states/signal";
import { SimpleNodeViewModel } from "../../base/simple-node-view-model";
import { IExpression, INodeDescriptor, IMultiChoiceDropdownOption } from "../../../../common-interfaces";

export default class CountOfUnselected extends SimpleNodeViewModel {

    unselectedCount: number;
    emptyExpression: IExpression;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel);

        this.emptyExpression = this.buildExpression(`${this.descriptor.exprAlias}(?)`, "?");
    }

    getValue(args: any[]) {
        return this.unselectedCount;
    }

    getExpression(args: IExpression[]): IExpression {
        var emitterExpr = args[0],
            emitterNameToExport = emitterExpr.exprToExport,
            emitterOptions = emitterExpr.options,
            isNoneOptionPresent = false,
            aggregatedFieldNames = [],
            exprToShow = `CountOfUnselected(${emitterExpr.exprToShow})`,
            countOfDefinedClause,
            emitterOptionsLength;

        if (emitterNameToExport === "?" || !emitterOptions || !emitterOptions.length) {
            this.unselectedCount = undefined;
            return this.emptyExpression;
        }

        this.unselectedCount = 0;
        emitterOptionsLength = emitterOptions.length;

        for (let inx = 0, option: IMultiChoiceDropdownOption; inx < emitterOptionsLength; inx++) {
            option = emitterOptions[inx];

            if (!option.isNoneOption) {
                aggregatedFieldNames.push(option.fieldName);

                if (!isNoneOptionPresent && !option.checked) {
                    this.unselectedCount += 1;
                }
            }
            else {
                isNoneOptionPresent = true;

                if (option.checked) {
                    this.unselectedCount = emitterOptionsLength - 1;
                }
            }
        }

        countOfDefinedClause = `CountOfDefined(${aggregatedFieldNames.join(", ")})`;

        if (isNoneOptionPresent) {
            return this.buildExpression(exprToShow, `IF(HasValue(${emitterNameToExport}.None), ${emitterOptionsLength - 1}, (${emitterOptionsLength - 1} - ${countOfDefinedClause}))`);
        }

        return this.buildExpression(exprToShow, `(${emitterOptionsLength} - ${countOfDefinedClause})`);
    }

    getSignal() {
        return Signal.create(undefined, this.emptyExpression);
    }
}