import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { IExpression, INodeDescriptor } from "../../../common-interfaces";

export default class TextJoin extends SimpleNodeViewModel {

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, true, "SEPARATOR");
        //we use white space as separator by default here
        this.value = typeof this.value === "string" && this.value.length === 3 ? this.value.replace(/\'/g, "") : " ";
        //in case of view mode the white space should be substituted to undefined to show placeholder in the related control
        if (isViewModel && this.value === " ") {
            this.value = undefined;
        }
    }

    getSeparatorValue() {
        return this.value || " ";
    }

    filterArgs<TArg>(args: TArg[], filter: (arg: TArg) => boolean, projection: (arg: TArg) => string) {
        var requiredArgs = args.slice(0, 2), // the first two are required, the rest is optional
            optionalArgs = args.length > 2 ? args.filter((arg: TArg, index: number) => index > 1 && filter(arg)) : [];

        return requiredArgs.concat(optionalArgs).map(projection);
    }

    getValue(args: string[]) {
        if (args[0] === undefined || args[1] === undefined) {
            return undefined;
        }

        var values = this.filterArgs(args, arg => arg !== undefined, arg => arg.replace(/\'/g, ""));

        return `'${values.join(this.getSeparatorValue())}'`;
    }

    getExpression(args: IExpression[]): IExpression {
        var separator = this.getSeparatorValue(),
            toExportArgs = this.filterArgs(args, arg => arg.exprToExport !== "?", arg => arg.exprToExport).join(" , "),
            exprToExport = `Join('${separator}' , ${toExportArgs})`,
            exprToShow;

        if (this.isViewModel) {
            let toShowArgs = this.filterArgs(args, arg => arg.exprToShow !== "?", arg => arg.exprToShow).join(" , ");
            exprToShow = `Join('${separator}' , ${toShowArgs})`;
        }

        return this.buildExpression(exprToShow, exprToExport);
    }

    getSignal() {
        var inputValues = this.inputStates.getAllValues(),
            inputExprs = this.inputStates.getAllExpressions();

        return Signal.create(this.getValue(inputValues), this.getExpression(inputExprs));
    }

    getToSave() {
        this.selfStates[this.selfStatesKey] = this.value ? `'${this.value}'` : "' '";
        return this.selfStates;
    }
}