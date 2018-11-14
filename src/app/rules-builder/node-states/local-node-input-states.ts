import Signal from "../states/signal";
import InputPort from "../models/layout/input-port";
import Connection from "../models/layout/connection";
import { NodeStates } from "./node-states";
import { PortType, DataType, TypeOfState } from "../common-enums";
import { INodeState, INodeDescriptor, IExpression } from "../common-interfaces";

export default class LocalNodeInputStates extends NodeStates {

    constructor(nodeDescriptor) {
        super(nodeDescriptor, PortType.Input);
    }

    private removeMultiplyState(
        connectionId: string,
        stateByPort: INodeState) {

        var subState: INodeState,
            subStates = stateByPort.subStates,
            stateIndexToRemove = subStates[connectionId].index;
        //remove state by dropped connection
        delete subStates[connectionId];
        stateByPort.subStatesCount -= 1;
        //the subStates is empty so should be treated as deleted 
        if (stateByPort.subStatesCount === 0) {
            return;
        }
        //normalize state indexes to prevent indexes gap
        for (let subStateId in subStates) {
            subState = subStates[subStateId];
            if (subState.index > stateIndexToRemove) {
                subState.index = stateIndexToRemove;
                stateIndexToRemove += 1;
            }
        }
    }

    private setMultiplyState(
        byInputPort: InputPort,
        connectionId: string,
        stateByPort: INodeState) {

        if (!stateByPort.subStates.hasOwnProperty(connectionId)) {
            stateByPort.subStates[connectionId] = {
                index: stateByPort.subStatesCount
            };
            stateByPort.subStatesCount += 1;
        }

        var state = stateByPort.subStates[connectionId];
        state.value = byInputPort.signal.value;
        state.expression = byInputPort.signal.expression;
        state.seqNumberOfNode = byInputPort.seqNumberOfNode;
    }

    private setMultiply(
        byInputPort: InputPort,
        connection: Connection,
        isDisconnected: boolean) {

        var connectionId = connection && connection.id,
            stateByPort = this.states[byInputPort.marker];

        if (isDisconnected) { //need to remove state             
            this.removeMultiplyState(connectionId, stateByPort);
        }
        else { //need to add state             
            this.setMultiplyState(byInputPort, connectionId, stateByPort);
        }
    }

    set(byInputPort: InputPort,
        connection: Connection,
        isDisconnected: boolean) {

        if (byInputPort.isMultiplyConnected) {
            this.setMultiply(byInputPort, connection, isDisconnected);
        }
        else {
            this.setSingle(byInputPort);
        }
    }

    overrideBefore(
        nodeDescriptor: INodeDescriptor,
        values: any[],
        exprs: IExpression[]) {

        var result = values.slice();

        for (let exi = exprs.length, expr: IExpression; exi--;) {
            expr = exprs[exi];
            // (FP-728) serialized expression which is constructed by Expression Editor should contain conversion
            // from String to Boolean with the help of supported HasValue function for each node for TakeAPhoto or Handwriting fields
            if (nodeDescriptor.name !== "hasValueComparisonCondition"
                && expr.isFromField
                && expr.dataType === DataType.BooleanField) {
                result[exi] = !!values[exi]; //treat the HandWriting and PhotoBlock selected values as boolean
            }
        }

        return result;
    }
    /**
     * Spreads the calculated signal into local OutputPort of the Node to which the byInputPort belong.
     */
    spreadToLocalOutputPort(
        byInputPort: InputPort,
        connection: Connection,
        isDisconnected: boolean) {

        var signalToSet: Signal,
            parentNode = byInputPort.parentNode,
            nodeDescriptor = parentNode.descriptor,
            model = parentNode.model as any,
            outputPort = parentNode.getFirstOutputPort(),
            isMultiplyConnected = byInputPort.isMultiplyConnected,
            inputExprs = this.getInputStatesByTypeAsArray(isMultiplyConnected, TypeOfState.expression),
            inputMetric = this.getInputStatesByTypeAsArray(isMultiplyConnected, TypeOfState.seqNumberOfNode),
            inputValues = this.getInputStatesByTypeAsArray(isMultiplyConnected, TypeOfState.value),
            inputValues = this.overrideBefore(nodeDescriptor, inputValues, inputExprs),
            isDate = connection && (connection.outputPort.dataType & DataType.Date) > 0,

            evaluatedExpr = model.getExpression(inputExprs, isMultiplyConnected, byInputPort.canvas),

            evaluatedValue = inputExprs.every((expr: IExpression) => expr.exprToShow === "?")
                ? undefined
                : model.getValue(inputValues, isMultiplyConnected, isDisconnected, isDate),

            signalToSet = Signal.create(evaluatedValue, evaluatedExpr);

        outputPort.setMetrics(inputMetric);
        outputPort.setSignal(signalToSet, connection, isDisconnected);
    }
}