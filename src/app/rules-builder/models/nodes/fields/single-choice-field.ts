import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression, INodeOption, INodeIsCheckableConfig } from "../../../common-interfaces";
import { DataType } from "../../../common-enums";

export default class SingleChoiceField extends SimpleNodeViewModel {

    options: INodeOption[];
    selectedOptionId: any;

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, isViewModel);

        if (isViewModel) {
            this.configControl();
        }
    }

    configControl() {
        var options = this.descriptor.options,
            isCheckable = this.descriptor.config
                && (this.descriptor.config as INodeIsCheckableConfig).isCheckable === false ? false : true;

        this.options = [];
        this.selectedOptionId = "undefined";

        if (!options.length) return;

        this.options = options.map(opt => ({
            id: typeof opt.id === "number" ? opt.id : parseFloat(opt.id),
            name: `${opt.id} - ${opt.name}`
        }));
        this.options.unshift({ id: "undefined", name: `${isCheckable ? "Unchecked" : "Undefined"}` });

        if (this.value !== undefined
            && this.options.some(opt => opt.id === this.value)) {
            this.selectedOptionId = this.value;
        }
    }

    getExpression(): IExpression {
        var fieldName = this.descriptor.fieldName, exprToExport;

        switch (this.descriptor.firstOutputPort.dataType) {
            case DataType.NumericField: exprToExport = `N(${fieldName})`; break;
            case DataType.BooleanField: exprToExport = `HasValue(${fieldName})`; break;
            default: exprToExport = fieldName;
        }

        return this.buildExpression(`${fieldName}.Value`, exprToExport);
    }

    getSignal() {
        var value = this.selectedOptionId === "undefined" ? undefined : this.selectedOptionId;
        this.selfStates[this.selfStatesKey] = value;

        return Signal.create(value, this.getExpression());
    }
}