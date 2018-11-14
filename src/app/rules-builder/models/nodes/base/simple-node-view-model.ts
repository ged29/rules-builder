import Canvas from "../../../models/layout/canvas";
import Signal from "../../../states/signal";
import LocalNodeInputStates from "../../../node-states/local-node-input-states";
import NodeOutputStates from "../../../node-states/node-output-states";
import { EvaluationSource, PortType, NodeType } from "../../../common-enums";
import { IExpression, INodeDescriptor, IPortToSignalDescriptor } from "../../../common-interfaces";
import validators, { ValidatorNames } from "../validation/validators";

export type ValidationFunc = () => boolean;

export abstract class SimpleNodeViewModel {

    value: any;
    isValid: boolean;
    validationError: string;

    inputStates: LocalNodeInputStates;
    outputStates: NodeOutputStates;
    selfStates: { [index: string]: any };

    portToSignal: IPortToSignalDescriptor;

    protected _validationChain: ValidationFunc[];

    constructor(
        public descriptor: INodeDescriptor,
        protected isViewModel: boolean,
        isSelfStatesShouldBeSet: boolean = false,
        protected selfStatesKey: string = undefined) {

        this.portToSignal = {
            portType: PortType.Output,
            marker: this.descriptor.firstOutputPort.marker
        };
        this._validationChain = [];

        if (isViewModel) {
            this.initViewModelStates();
        }

        this.selfStates = this.descriptor.persistedStates || {};
        this.selfStatesKey = selfStatesKey || this.portToSignal.marker;

        if (isSelfStatesShouldBeSet) {
            this.value = this.selfStates[this.selfStatesKey];
        }
    }

    private initViewModelStates() {
        //build input interface of node
        if (this.descriptor.hasInputPorts) {
            this.inputStates = new LocalNodeInputStates(this.descriptor);

            this.descriptor.ports.input.forEach(portDescriptor => {
                if (!portDescriptor.isHidden) {
                    this.inputStates.init(portDescriptor);
                }
            });
        }
        //build output interface of node
        this.outputStates = new NodeOutputStates(this.descriptor);
        this.descriptor.ports.output.forEach(portDescriptor => {
            this.outputStates.init(portDescriptor);
        });

        if (this.isViewModel) {
            let stateKeys = Object.keys(this.outputStates.states);
            this.outputStates.singleState = stateKeys.length === 1 ? this.outputStates.states[stateKeys[0]] : undefined;
        }
    }

    protected buildValidation(
        validation: ValidatorNames[],
        externalValidationChain?: ValidationFunc[],
        cbValidate?: (validator) => boolean) {

        var validationChain = externalValidationChain || this._validationChain,
            validate = cbValidate || ((validator) => {
                this.isValid = validator.isValid(this.value);
                this.validationError = this.isValid ? null : validator.instruction;
                return this.isValid;
            });
        //step through the requested validation chain to build the chained validation logic
        for (let inx = 0, len = validation.length, validatorName; inx < len; inx++) {
            validatorName = ValidatorNames[validation[inx]].toString(); //closed into closure
            validationChain[inx] = () => {
                return validate(validators[validatorName]);
            }
        }
    }

    protected isValueValid(externalValidationChain?: ValidationFunc[]) {
        var validationChain = externalValidationChain || this._validationChain;

        for (let inx = 0, len = validationChain.length; inx < len; inx++) {
            if (validationChain[inx]() === false) {
                return false;
            }
        }
        //validation chain was handled and has no error, therefore the this.value is valid
        this.validationError = null;
        return true;
    }

    protected buildExpression(exprToShow: string, exprToExport: string = exprToShow): IExpression {
        let expression: IExpression = {
            exprToShow: exprToShow,
            exprToExport: exprToExport,
            dataType: this.descriptor.firstOutputPort.dataType,
            isFromField: (this.descriptor.nodeType & NodeType.Field) > 0
        };

        if (expression.isFromField) {
            expression.fieldId = this.descriptor.fieldId;
        }

        return expression;
    }

    getToSave() {
        if (this.selfStates
            && Object.keys(this.selfStates).length
            && Object.keys(this.selfStates).every(key => this.selfStates[key] !== undefined && this.selfStates[key] !== "")) {
            return this.selfStates;
        }
        return undefined;
    }

    abstract getSignal(canvas?: Canvas): Signal;
    abstract getExpression(args?: IExpression[], isMultiplyConnected?: boolean, canvas?: Canvas): IExpression;
}
