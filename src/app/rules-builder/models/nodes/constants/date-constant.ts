import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression, IControlAttrs } from "../../../common-interfaces";
import { ValidatorNames } from "../validation/validators";

export default class DateConstant extends SimpleNodeViewModel {

    controlAttrs: IControlAttrs;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, true);

        this.buildValidation([ValidatorNames.required, ValidatorNames.dateInDDMMYYYY]);
        this.isValueValid();

        if (isViewModel) {
            this.controlAttrs = {
                fieldLength: descriptor.fieldLength,
                fieldPlaceholder: "DD-MMM-YYYY"
            };            
        }        
    }

    getExpression(): IExpression {
        var exprToShow = this.isValid ? `'${this.value}'` : `${this.descriptor.exprAlias}(?)`,
            exprToExport = this.isValid ? `D('${this.value}')` : "?";

        return this.buildExpression(exprToShow, exprToExport);
    }

    getSignal() {
        var value = this.isValueValid() ? this.value : undefined;
        this.selfStates[this.selfStatesKey] = this.value;

        return Signal.create(value, this.getExpression());
    }
}