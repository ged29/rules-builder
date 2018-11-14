import Signal from "../../../../states/signal";
import { SimpleNodeViewModel } from "../../base/simple-node-view-model";
import { IExpression, INodeDescriptor } from "../../../../common-interfaces";
import dateUtility, { ISplitDate } from "../../utilities/date-utility";
import commonUtils from "../../utilities/common-utilities";
/**
 * Returns the day of the month represented in the specified date
 */
export default class GetDay extends SimpleNodeViewModel {
    isDisconnected: boolean;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel);
        this.isDisconnected = true;
    }

    getValue(args: any[]) {
        var emitterValue = args[0],
            splitDate: ISplitDate;

        if (this.isDisconnected) {
            return undefined;
        }

        if (emitterValue === undefined) {
            return 0;
        }

        splitDate = dateUtility.split(emitterValue);

        return splitDate.length === 3 ? splitDate.date : 0;
    }

    getExpression(args: IExpression[]): IExpression {
        var emitterExpr = args[0],
            exprToExport: string,
            exprToShow: string;

        this.isDisconnected = emitterExpr.exprToExport === "?";

        if (this.isDisconnected) {
            return this.buildExpression("GetDay(?)");
        }

        exprToExport = `GetDay(${commonUtils.extractFieldName(emitterExpr.exprToExport)})`;
        exprToShow = this.isViewModel ? `GetDay(${emitterExpr.exprToShow})` : undefined;

        return this.buildExpression(exprToShow, exprToExport);
    }

    getSignal() {
        var emitterValue = this.inputStates.getValue("V"),
            emitterExpr = this.inputStates.getExpression("V");

        return Signal.create(this.getValue([emitterValue]), this.getExpression([emitterExpr]));
    }
}