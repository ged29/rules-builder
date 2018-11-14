import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression, INodeOption } from "../../../common-interfaces";
import numToTextUtility, { FormattingType } from "../utilities/num-to-text-utility";

export default class NumToText extends SimpleNodeViewModel {

    options: INodeOption[];
    selectedOptionId: number;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, true, "OPTION");

        this.selectedOptionId = this.value || 0;

        if (isViewModel) {
            this.setOptions();
        }
    }

    setOptions() {
        var formatId;

        this.options = [];

        for (let key in FormattingType) {
            formatId = parseInt(key, 10);
            if (!isNaN(formatId) && formatId !== -1) {
                this.options.push({
                    id: formatId,
                    name: numToTextUtility.getOption(formatId)
                });
            }
        }
    }

    getValue(args: any[]) {
        return numToTextUtility.getValue(args[0], this.selectedOptionId);
    }

    getExpression(args: IExpression[]): IExpression {
        var emitterExpr = args[0],
            exprToExport = numToTextUtility.getExpression(emitterExpr.exprToExport, this.selectedOptionId),
            exprToShow = this.isViewModel
                ? numToTextUtility.getExpression(emitterExpr.exprToShow, this.selectedOptionId)
                : undefined;

        return this.buildExpression(exprToShow, exprToExport);
    }

    getSignal() {
        var emitterValue = this.inputStates.getValue("V"),
            emitterExpr = this.inputStates.getExpression("V");

        this.selfStates[this.selfStatesKey] = this.selectedOptionId;

        return Signal.create(this.getValue([emitterValue]), this.getExpression([emitterExpr]));
    }
}