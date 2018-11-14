import Signal from "../../../states/signal";
import { SimpleNodeViewModel, ValidationFunc } from "../base/simple-node-view-model";
import { ValidatorNames } from "../validation/validators";
import { INodeDescriptor, IExpression } from "../../../common-interfaces";

export default class InRange extends SimpleNodeViewModel {

    from: any;
    isFromValid: boolean;
    fromValidationError: string;
    private _fromValidationChain: ValidationFunc[];

    to: any;
    isToValid: boolean;
    toValidationError: string;
    private _toValidationChain: ValidationFunc[];

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, false);

        this.from = this.selfStates["FROM"];
        this.to = this.selfStates["TO"];

        var validation = [ValidatorNames.required, ValidatorNames.decimalNumber];

        this._fromValidationChain = [];
        this.buildValidation(validation, this._fromValidationChain, (validator) => {
            this.isFromValid = validator.isValid(this.from);
            this.fromValidationError = this.isFromValid ? null : validator.instruction;
            return this.isFromValid;
        });

        this._toValidationChain = [];
        this.buildValidation(validation, this._toValidationChain, (validator) => {
            this.isToValid = validator.isValid(this.to);
            this.toValidationError = this.isToValid ? null : validator.instruction;
            return this.isToValid;
        });

        this.isRangeValid();
    }

    isRangeValid() {
        this.isValueValid(this._fromValidationChain);
        this.isValueValid(this._toValidationChain);

        if (!this.isFromValid || !this.isToValid) {
            return false;
        }

        if (parseFloat(this.from) >= parseFloat(this.to)) {
            this.isFromValid = this.isToValid = false;
            this.fromValidationError = this.toValidationError = "BehaviorDesigner.ValidationMessages.InRangeViolation";
            return false;
        }

        this.fromValidationError = this.toValidationError = null;
        return true;
    }

    getValue(args: any[]) {
        var emitterValue = args[0];

        if (emitterValue === undefined || !this.isFromValid || !this.isToValid) {
            return undefined;
        }

        return emitterValue >= this.from && emitterValue <= this.to;
    }

    getExpression(args: IExpression[]): IExpression {
        var emitterExpr = args[0],
            isValid = this.isFromValid && this.isToValid,
            InRangeClause = isValid ? `InRange[${this.from}, ${this.to}]` : `InRange[?, ?]`,
            exprToExport = `(${emitterExpr.exprToExport} ${InRangeClause})`,
            exprToShow = this.isViewModel ? `(${emitterExpr.exprToShow} ${InRangeClause})` : undefined;

        return this.buildExpression(exprToShow, exprToExport);
    }

    getSignal() {
        var emitterValue = this.inputStates.getValue("V"),
            emitterExpr = this.inputStates.getExpression("V");

        this.isRangeValid();
        this.selfStates["FROM"] = this.from;
        this.selfStates["TO"] = this.to;

        return Signal.create(this.getValue([emitterValue]), this.getExpression([emitterExpr]));
    }

    getToSave() {
        return this.selfStates;
    }
}