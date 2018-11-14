import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { IExpression, INodeDescriptor } from "../../../common-interfaces";
import { utils } from "../../../utils/utils.service";
import getValueExt from "./get-value-ext";
import getExprToShowExt from "./get-expr-to-show-ext";
import getExprToExportExt from "./get-expr-to-export-ext";

export default class SimpleFunction extends SimpleNodeViewModel {

    private getValueFn;
    private getExprToShowFn;
    private getExprToExportFn;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel);
        //preFetch
        var fnName = descriptor.name;
        this.getValueFn = getValueExt[fnName];
        this.getExprToShowFn = getExprToShowExt[fnName];
        this.getExprToExportFn = getExprToExportExt[fnName];
    }

    getValue(args: any[], isMultiplyConnected: boolean, isDisconnected: boolean, isDate: boolean) {
        if (this.descriptor.name === "hasValueComparisonCondition" && isDisconnected) {
            return undefined;
        }

        if (isDate) {
            args.push(true);
        }

        return this.getValueFn.apply(getValueExt, isMultiplyConnected ? [args] : args);
    }

    getExpression(args: IExpression[], isMultiplyConnected: boolean): IExpression {
        var params = utils.deepcopy(args),
            exprsToExportAndShowAreSame = this.getExprToExportFn === undefined,
            paramsToExport = params.map(p => p.exprToExport),
            exprToShow, exprToExport;

        //if (isMultiplyConnected && paramsToExport.length === 1) {
        //    paramsToExport.push("?");
        //}

        exprToExport = exprsToExportAndShowAreSame
            ? this.getExprToShowFn.apply(getExprToShowExt, isMultiplyConnected ? [paramsToExport] : paramsToExport)
            : this.getExprToExportFn.apply(getExprToExportExt, isMultiplyConnected ? [args] : args);

        if (this.isViewModel) {
            let paramsToShow = params.map(p => p.exprToShow);
            //the multiplyConnected operation requires at least one param to be given, 
            //so below we create the following patterns (1 + ?), ((1 = 2) and ?)
            if (isMultiplyConnected && paramsToShow.length === 1) {
                paramsToShow.push("?");
            }

            exprToShow = this.getExprToShowFn.apply(getExprToShowExt, isMultiplyConnected ? [paramsToShow] : paramsToShow);
            //TODO: if all of the given params are equal to "?"
            if (exprToShow === "?") {
                return this.buildExpression(`${this.descriptor.exprAlias}(?)`, "?");
            }
        }

        return this.buildExpression(exprToShow, exprToExport);
    }

    getSignal() {
        return Signal.create(undefined, this.buildExpression(`${this.descriptor.exprAlias}(?)`, "?"));
    }
}