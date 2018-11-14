import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression, IControlAttrs, INodeDescriptorDateConfig } from "../../../common-interfaces";
import { DateFormat } from "../../../common-enums";
import { ValidatorNames } from "../validation/validators";
import dateUtility from "../utilities/date-utility";

export default class DateField extends SimpleNodeViewModel {

    controlAttrs: IControlAttrs;
    configDateFormat: DateFormat;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, isViewModel);

        this.configDateFormat = this.descriptor.config && (this.descriptor.config as INodeDescriptorDateConfig).format || DateFormat.isDateInDDMMYYYY;

        if (isViewModel) {
            this.configControl();
        }
    }

    configControl() {
        switch (this.configDateFormat) {
            case DateFormat.isDateInDDMMYYYY:
                this.controlAttrs = { fieldLength: 11, fieldPlaceholder: "DD-MMM-YYYY" };
                break;

            case DateFormat.isDateInMMYYYY:
                this.controlAttrs = { fieldLength: 8, fieldPlaceholder: "MMM-YYYY" };
                break;

            case DateFormat.isDateInYYYY:
                this.controlAttrs = { fieldLength: 4, fieldPlaceholder: "YYYY" };
                break;

            default: throw "Unexpected DateFormat";
        }

        this.buildValidation([ValidatorNames.required, ValidatorNames.datePartialyValid]);

        if (this.value && this.isValueValid()) {
            this.value = dateUtility.reFormat(this.value, this.configDateFormat);
        }
    }

    getExpression(): IExpression {
        var fieldName = this.descriptor.fieldName,
            expr = this.buildExpression(`${fieldName}.Value`, `D(${fieldName})`);

        expr.config = this.configDateFormat;
        return expr;
    }

    getSignal() {
        var value = this.isValueValid() ? this.value : undefined;
        this.selfStates[this.selfStatesKey] = this.value;

        return Signal.create(value, this.getExpression());
    }
}
