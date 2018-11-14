import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { IControlAttrs, IExpression, INodeDescriptor } from "../../../common-interfaces";
import { ValidatorNames } from "../validation/validators";

export default class IsMatch extends SimpleNodeViewModel {

    controlAttrs: IControlAttrs;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, true, "REGEXDEFINITION");

        this.buildValidation([ValidatorNames.required, ValidatorNames.regexDefinition]);
        this.isValueValid();

        if (isViewModel) {
            this.controlAttrs = {
                fieldLength: descriptor.fieldLength,
                fieldPlaceholder: "?"
            };            
        }
    }

    getValue(args: any[]) {
        var emitterValue = args[0];

        if (emitterValue === undefined || !this.isValid) {
            return undefined;
        }

        try {
            var regex = new RegExp(`^${this.value.replace(/[\^\$]/g, '')}$`, "gi");
            return regex.test(emitterValue.replace(/\'/g, ""));
        }
        catch (e) {
            return undefined;
        }
    }

    getExpression(args: IExpression[]): IExpression {
        var emitterExpr = args[0],            
            isMatchClause = this.isValid ? `'${this.value}'` : `'?'`,
            exprToExport = `IsMatch(${emitterExpr.exprToExport}, ${isMatchClause})`,
            exprToShow = this.isViewModel ? `IsMatch(${emitterExpr.exprToShow}, ${isMatchClause})` : undefined;

        return this.buildExpression(exprToShow, exprToExport);
    }

    getSignal() {
        var emitterValue = this.inputStates.getValue("V"),
            emitterExpr = this.inputStates.getExpression("V");

        this.isValueValid();
        this.selfStates[this.selfStatesKey] = this.value;

        return Signal.create(this.getValue([emitterValue]), this.getExpression([emitterExpr]));
    }
}