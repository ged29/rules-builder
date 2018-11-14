import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { IExpression, INodeDescriptor } from "../../../common-interfaces";

export default class TextFormat extends SimpleNodeViewModel {

    regexStringFormat = /\{([1-9]?[0-9])\}/gm;
    markerIndexes: number[];

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, true, "markers");
        this.markerIndexes = Array.isArray(this.value) ? this.value : [];
    }
    // 1) parses the given formatString to get the given markers array => [{1}, {2}... {n}]
    // 2) if the given formatString is empty or doesn't contain markers empty array is returned
    //    otherwise we get a max marker index and create an array [0...maxMarkerIndex] 
    getMarkerIndexes(formatString: string = ""): number[] {
        let rawMarkers: RegExpMatchArray | null = formatString.match(this.regexStringFormat),
            maxMarkersCount = rawMarkers === null ? 0 : Math.max(...rawMarkers.map(marker => parseInt(marker.substr(1), 10))) + 1;

        return Array.apply(null, Array(maxMarkersCount)).map((value, index) => index);
    }

    getValue(args: string[]) {
        let formatString = args[0],
            result = undefined;

        if (formatString) {
            result = formatString.replace(this.regexStringFormat, match => {
                let argIndex = parseInt(match.substr(1), 10);

                return !isNaN(argIndex) && argIndex <= args.length - 1 && !!args[argIndex + 1]
                    ? args[argIndex + 1]
                    : match;

            }).replace(/\'/g, "");
        }

        return result;
    }

    getExpression(args: IExpression[]): IExpression {
        let isFormatStringProvided = args[0].exprToExport !== "?" && args[0].config;
        if (!isFormatStringProvided) {
            return this.buildExpression("Format(?)", "Format(?)");
        }

        let currentMarkerIndexes = this.getMarkerIndexes(args[0].config as string),
            isMarkersIdentical = this.isViewModel
                || (!this.isViewModel && currentMarkerIndexes.length === 0)
                || (!this.isViewModel
                    && this.markerIndexes.length === currentMarkerIndexes.length
                    && this.markerIndexes.every((marker, inx) => marker === currentMarkerIndexes[inx]));

        if (!isMarkersIdentical) {
            return this.buildExpression("Format(?)", "Format(?)");
        }
        //[R(TextResource1), TextField1, TextField2, TextField3]
        //if the expression that corespond to the marker index exist in the given arguments - extract it expression otherwise show "?"
        let exprToShow = this.isViewModel ? this.compileExpression(args, currentMarkerIndexes, (expr => expr.exprToShow)) : undefined,
            exprToExport = this.compileExpression(args, currentMarkerIndexes, (expr => expr.exprToExport));

        this.selfStates[this.selfStatesKey] = currentMarkerIndexes;
        return this.buildExpression(exprToShow, exprToExport);
    }

    compileExpression(args: IExpression[], markerIndexes: number[], mapFn: (expr: IExpression) => string): string {
        let exprResource = mapFn(args[0]),
            exprMarkers = markerIndexes.length
                ? markerIndexes.map(markerInx => args[markerInx + 1] ? mapFn(args[markerInx + 1]) : "?") //=>  Format(R(TextResource1), Keyboard1, Keyboard2)
                : ["''"], //=>  Format(R(TextResource2), '')
            exprBody = [exprResource, ...exprMarkers].join(", ");

        return `Format(${exprBody})`;
    }

    getSignal() {
        var inputValues = this.inputStates.getAllValues(),
            inputExprs = this.inputStates.getAllExpressions();

        return Signal.create(this.getValue(inputValues), this.getExpression(inputExprs));
    }
}