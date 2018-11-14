import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression, IMultiChoiceDropdownOption } from "../../../common-interfaces";
import { utils } from "../../../utils/utils.service";

export default class MultiChoiceField extends SimpleNodeViewModel {

    options: IMultiChoiceDropdownOption[];
    checkedFieldIds: string[];

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, isViewModel);

        this.configControl();
    }

    configControl() {
        var [blockUuid,] = this.descriptor.fieldId.split("@"),
            options = this.descriptor.options;

        this.checkedFieldIds = [];
        //filter out the persisted state by existing nodeDescriptor.options
        if (Array.isArray(this.value) && options.length) {
            this.checkedFieldIds = this.value.filter(v => options.some(opt => `${blockUuid}@${opt.uuid}` === v));
        }

        this.options = options.map(opt => {
            var fieldId = `${blockUuid}@${opt.uuid}`;
            return {
                value: typeof opt.id === "number" ? opt.id : parseFloat(opt.id),
                name: `${opt.id} - ${opt.name}`,
                fieldId: fieldId,
                fieldName: opt.fieldId,
                isNoneOption: opt.isNoneOption,
                checked: this.checkedFieldIds.indexOf(fieldId) !== -1
            };
        });
    }

    getExpression(): IExpression {
        var fieldName = this.descriptor.fieldName,
            expression = this.buildExpression(`${fieldName}.Value`, fieldName);

        expression.fieldId = this.descriptor.fieldId;
        expression.options = utils.deepcopy(this.options);

        return expression;
    }

    getSignal() {
        var value = this.checkedFieldIds.length ? this.checkedFieldIds : undefined;
        this.selfStates[this.selfStatesKey] = value;

        return Signal.create(value, this.getExpression());
    }
}
