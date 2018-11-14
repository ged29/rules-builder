import Signal from "../states/signal";
import Port from "../models/layout/port";
import { PortType, TypeOfState } from "../common-enums";
import { INodeState, INodeDescriptor, IExpression, IPortDescriptor } from "../common-interfaces";

export abstract class NodeStates {
    type: PortType;
    //stores state of node's port by port id
    states: { [stateId: string]: INodeState };
    //the descriptor of node which is own this state
    ownerDescriptor: INodeDescriptor;

    constructor(
        nodeDescriptor: INodeDescriptor,
        type: PortType) {

        this.ownerDescriptor = nodeDescriptor;
        this.type = type;
        this.states = {};
    }

    init(portDescriptor: IPortDescriptor) {
        var stateId = portDescriptor.marker,
            stateValue = undefined;

        if (portDescriptor.isMultiplyConnected) {
            this.states[stateId] = { subStates: {}, subStatesCount: 0 };
            //the multiply connected states is used for the stateless functional nodes, 
            //so doesn't make sense to continue here    
            return;
        }

        this.states[stateId] = { value: undefined, expression: Signal.getEmptyExpr() };

        if (this.type === PortType.Input) {
            this.states[stateId].index = portDescriptor.index;
            this.states[stateId].seqNumberOfNode = 0;
        }
    }

    removeState(stateId: string) {
        delete this.states[stateId];
    }

    resetState(stateId: string) {
        this.states[stateId].value = undefined;
        this.states[stateId].expression = Signal.getEmptyExpr();
    }

    getInputStatesByTypeAsArray(
        isMultiplyConnected: boolean,
        typeOfState: TypeOfState,
        states?: any): any[] {

        var result = [], stateValue,
            statesToGet = states || this.states,
            statesIds = Object.keys(statesToGet);

        for (let si = statesIds.length, stateId, state: INodeState; si--;) {
            stateId = statesIds[si];
            state = statesToGet[stateId];

            if (isMultiplyConnected) {
                return this.getInputStatesByTypeAsArray(false, typeOfState, state.subStates);
            }
            else {
                stateValue = state[TypeOfState[typeOfState]];

                if (typeOfState !== TypeOfState.seqNumberOfNode) {
                    result[state.index] = stateValue;
                }
                else if (stateValue !== 0) { //typeOfState === TypeOfState.seqNumberOfNode
                    result.push(stateValue);
                }
            }
        }

        return result;
    }

    getInputStatesByTypeAsDictionary(
        typeOfState: TypeOfState) {
        var stateId, state,
            result: { [index: string]: string } = {};

        for (stateId in this.states) {
            state = this.states[stateId];
            result[stateId] = state[TypeOfState[typeOfState]];
        }

        return result;
    }

    setSingle(byPort: Port) {
        var state = this.states[byPort.marker];
        state.value = byPort.signal.value;
        state.expression = byPort.signal.expression;
        state.seqNumberOfNode = byPort.seqNumberOfNode;
    }

    getValue(stateId: string): any {
        return this.states[stateId].value;
    }

    getAllValues(): any[] {
        return this.getInputStatesByTypeAsArray(false, TypeOfState.value);
    }

    getExpression(stateId: string): IExpression {
        return this.states[stateId].expression;
    }

    getMultiStateExpressions(stateId: string): IExpression[] {
        let multiState = this.states[stateId],
            result: IExpression[] = [];

        if (multiState.subStatesCount > 0) {
            for (var connectionId in multiState.subStates) {
                let subState = multiState.subStates[connectionId];
                result[subState.index] = subState.expression;
            }
        }

        return result;
    }

    getAllExpressions(): IExpression[] {
        return this.getInputStatesByTypeAsArray(false, TypeOfState.expression);
    }
}