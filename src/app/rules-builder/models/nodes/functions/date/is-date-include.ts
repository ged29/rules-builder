import Signal from "../../../../states/signal";
import { SimpleNodeViewModel } from "../../base/simple-node-view-model";
import { IExpression, INodeDescriptor } from "../../../../common-interfaces";
import { DateFormat } from "../../../../common-enums";
import dateUtility from "../../utilities/date-utility";
import commonUtils from "../../utilities/common-utilities";
/**
 * Determines whether the passed date value is in the specified date format
 */
export default class IsDateInclude extends SimpleNodeViewModel {
    // dd - mmm - yyyy(all required);
    // dd(optional) - mmm(required) - yyyy(required);
    // dd(optional) - mmm(optional) - yyyy(required);
    // mmm(required) - yyyy(required);
    // mmm(optional) - yyyy(required);
    // yyyy(required).

    static dateCheckRegexes: { [configEmitterDateFormat: number]: { [selectedDateFormat: number]: string } } = {
        [DateFormat.isDateInDDMMYYYY]: {
            [DateFormat.isDateInDDMMYYYY]: "^\\d{1,2}-\\w{3}-\\d{4}$",          // DD-MMM-YYYY
            [DateFormat.isDateInMMYYYY]: "^(\\d{1,2}-){0,1}\\w{3}-\\d{4}$",     // (DD-)MMM-YYYY
            [DateFormat.isDateInYYYY]: "^(\\d{1,2}-){0,1}(\\w{3}-){0,1}\\d{4}$" // (DD-MMM-)YYYY
        },
        [DateFormat.isDateInMMYYYY]: {
            [DateFormat.isDateInMMYYYY]: "^\\w{3}-\\d{4}$",     // MMM-YYYY
            [DateFormat.isDateInYYYY]: "^(\\w{3}-){0,1}\\d{4}$" // (MMM-)YYYY
        },
        [DateFormat.isDateInYYYY]: {
            [DateFormat.isDateInYYYY]: "^\\d{4}$"    // YYYY
        }
    };

    dateFormatsLookup: { [dateFormatId: number]: string };
    selectedDateFormat: DateFormat;
    dateCheckRegex: string;
    isDisconnected: boolean;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, true, "OPTION");

        this.isDisconnected = true;
        this.selectedDateFormat = !isNaN(parseInt(this.value, 10)) ? this.value : DateFormat.none;

        if (isViewModel) {
            this.setDateFormatsLookup();
        }
    }

    setDateFormatsLookup() {
        this.dateFormatsLookup = {};

        for (let id in DateFormat) {
            let dateFormatId = Number(id);
            if (!isNaN(dateFormatId) && dateFormatId !== DateFormat.none) {
                this.dateFormatsLookup[dateFormatId] = dateUtility.getFormatString(dateFormatId);
            }
        }
    }

    getValue(args: any[]) {
        if (this.isDisconnected) {
            return undefined;
        }

        return args[0] ? new RegExp(this.dateCheckRegex).test(args[0]) : false;
    }

    getExpression(args: IExpression[]): IExpression {
        var emitterExpr = args[0],
            exprToExport: string,
            exprToShow: string;

        this.isDisconnected = emitterExpr.exprToExport === "?";

        if (this.isDisconnected) {
            return this.buildExpression(this.isViewModel ? "IsMatch(?, ?)" : undefined, null);
        }

        this.dateCheckRegex = IsDateInclude.dateCheckRegexes[emitterExpr.config][this.selectedDateFormat];
        exprToExport = `IsMatch(${commonUtils.extractFieldName(emitterExpr.exprToExport)}, '${this.dateCheckRegex}')`;

        if (this.isViewModel) {
            exprToShow = `IsMatch(${emitterExpr.exprToShow}, '${this.dateFormatsLookup[this.selectedDateFormat]}')`;
        }

        return this.buildExpression(exprToShow, exprToExport);
    }

    getSignal() {
        var emitterValue = this.inputStates.getValue("V"),
            emitterExpr = this.inputStates.getExpression("V"),
            expression = this.getExpression([emitterExpr]),
            value = this.getValue([emitterValue]);

        return Signal.create(value, expression);
    }

    getToSave() {
        this.selfStates[this.selfStatesKey] = this.selectedDateFormat;
        return this.selfStates;
    }
}