import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression, INodeOption } from "../../../common-interfaces";
import { DateFormat } from "../../../common-enums";
import dateUtility from "../utilities/date-utility";

export default class DateToText extends SimpleNodeViewModel {

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

        for (let key in DateFormat) {
            formatId = parseInt(key, 10);
            if (!isNaN(formatId) && formatId !== -1) {
                this.options.push({ id: formatId, name: dateUtility.getFormatString(formatId) });
            }
        }
    }

    getValue(args: any[]) {
        var result = dateUtility.getValue(args[0], this.selectedOptionId);
        return result ? `'${result}'` : undefined;
    }

    getExpression(args: IExpression[]): IExpression {
        var emitterExpr = args[0],
            exprToExport = dateUtility.getDateAsTextExpression(emitterExpr.exprToExport, this.selectedOptionId, emitterExpr.isFromField),
            exprToShow = this.isViewModel
                ? dateUtility.getDateAsTextExpression(emitterExpr.exprToShow, this.selectedOptionId, false)
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