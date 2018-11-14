import Signal from "../../../states/signal";
import Canvas from "../../../models/layout/canvas";
import EqualsAll from "./equals-all";
import { ValidatorNames } from "../validation/validators";
import { INodeDescriptor, IExpression, IControlAttrs } from "../../../common-interfaces";
import { DataType } from "../../../common-enums";

export const enum ModelType { In = 0, EqualsAny = 1 }

export default class EqualsAny extends EqualsAll {

    modelType: ModelType;
    inValues: number[];
    controlAttrs: IControlAttrs;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel)

        this.exprToShowEqualsClause = "EqualsAny";
        this.exprToExportJoinClause = " or ";
        this.modelType = this.checkedFieldIds.length ? ModelType.EqualsAny : ModelType.In;

        if (isViewModel) {
            this.controlAttrs = {
                fieldLength: descriptor.fieldLength,
                fieldPlaceholder: "?"
            };

            this.buildValidation([ValidatorNames.required, ValidatorNames.numericSet, ValidatorNames.numericSetValuesDuplication]);
        }
    }

    getEqualsAnyValue(emitterValue: any[]) {
        if (!this.options.length || !this.checkedFieldIds.length) {
            return undefined;
        }

        if (emitterValue === undefined) {
            return false;
        }

        return this.checkedFieldIds.some(checkedFieldId => emitterValue.indexOf(checkedFieldId) >= 0);
    }

    getInValue(emitterValue: number) {
        if (this.inValues === undefined) {
            return undefined;
        }

        if (emitterValue === undefined) {
            return false;
        }

        return this.inValues.some(value => value === emitterValue);
    }

    getValue(args: any[]) {
        return this.modelType === ModelType.EqualsAny
            ? this.getEqualsAnyValue(args[0])
            : this.getInValue(args[0]);
    }

    getInExpression(emitterExpr: IExpression) {
        var isValid = (!this.isViewModel && this.value && this.value.length) || (this.isViewModel && this.isValid),
            values = isValid ? (this.isViewModel ? this.inValues.join(",") : this.value) : "?";

        return this.buildExpression(
            `(${emitterExpr.exprToShow} EqualsAny[${values}])`,
            isValid ? `(${emitterExpr.exprToExport} in [${values}])` : "?");
    }

    getExpression(args: IExpression[], isMultiplyConnected: boolean, canvas: Canvas): IExpression {
        var emitterExpr = args[0];

        if (emitterExpr.exprToShow === "?" || (emitterExpr.dataType & DataType.NumericField) > 0) {
            //if the node with EqualsAny type was disconnected, some grooming to move to In model type is required
            if (this.modelType === ModelType.EqualsAny) {
                this.updateFor(emitterExpr, canvas);
                //this.value = undefined;
                this.isValueValid();
            }
            this.modelType = ModelType.In;
            return this.getInExpression(emitterExpr);
        }

        if (emitterExpr.dataType === DataType.AggregatedField) {
            this.modelType = ModelType.EqualsAny;
            return super.getExpression(args, false, canvas);
        }
    }

    getSignal(canvas: Canvas) {
        var emitterValue = this.inputStates.getValue("V"),
            emitterExpr = this.inputStates.getExpression("V");

        if (this.modelType === ModelType.In) {
            this.inValues = this.isValueValid() ? this.value.split(",").map(v => parseFloat(v)) : undefined;
            return Signal.create(this.getInValue(emitterValue), this.getInExpression(emitterExpr));
        }
        else {
            return Signal.create(this.getEqualsAnyValue(emitterValue), super.getExpression([emitterExpr], false, canvas));
        }
    }

    getToSave() {
        if (this.modelType === ModelType.In) {
            return this.value && this.value.length ? { "CONFIG": this.value } : undefined;
        }
        return super.getToSave();
    }
}