import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression, IControlAttrs, INodeDescriptorNumericConfig } from "../../../common-interfaces";
import { ValidatorNames } from "../validation/validators";
import { NumberFormat } from "../../../common-enums";
import { utils } from "../../../utils/utils.service";

export default class NumericField extends SimpleNodeViewModel {

    controlAttrs: IControlAttrs;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, isViewModel);

        if (isViewModel) {
            this.configControl();
        }
    }

    configControl() {
        var placeholder,
            validation = [ValidatorNames.required],
            format = this.descriptor.config
                && (this.descriptor.config as INodeDescriptorNumericConfig).format || NumberFormat.decimal;

        switch (format) {
            case NumberFormat.decimal:
                validation.push(ValidatorNames.decimalNumber);
                placeholder = "BehaviorDesigner.Layout.Dialog.PlaceholderDecimalValue";
                break;

            case NumberFormat.positiveDecimal:
                validation.push(ValidatorNames.positiveDecimalNumber);
                placeholder = "BehaviorDesigner.Layout.Dialog.PlaceholderDecimalValue";
                break;

            case NumberFormat.integer:
                validation.push(ValidatorNames.integerNumber);
                placeholder = "BehaviorDesigner.Layout.Dialog.PlaceholderIntegerValue";
                break;

            default: throw "Unexpected NumberFormat";
        }

        this.controlAttrs = {
            fieldLength: this.descriptor.fieldLength,
            fieldPlaceholder: placeholder
        };
        this.buildValidation(validation);

        if (!isNaN(this.value)
            && utils.isFloat(this.value)
            && format === NumberFormat.integer) {
            //-112.01 => 112
            this.value = Math.abs(utils.truncateFloatFraction(this.value));
        }
    }

    getExpression(): IExpression {
        var fieldName = this.descriptor.fieldName;
        return this.buildExpression(`${fieldName}.Value`, `N(${fieldName})`);
    }

    getSignal() {
        var value = this.isValueValid() ? parseFloat(this.value) : undefined;
        this.selfStates[this.selfStatesKey] = this.value;

        return Signal.create(value, this.getExpression());
    }
}
