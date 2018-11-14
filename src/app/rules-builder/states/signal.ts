import { DataType } from "../common-enums";
import { IExpression } from "../common-interfaces";

export default class Signal {
    value: any;
    expression: IExpression;

    constructor(value: any, expression: IExpression) {
        this.value = value;
        this.expression = expression;
    }

    static create(value: any, expression: IExpression): Signal {
        return new Signal(value, expression);
    }

    static createEmpty() {
        return Signal.create(undefined, Signal.getEmptyExpr());
    }

    static getEmptyExpr(): IExpression {
        return {
            exprToShow: "?",
            exprToExport: "?",
            dataType: DataType.PendingAssignment,
            isFromField: false
        };
    }
}
