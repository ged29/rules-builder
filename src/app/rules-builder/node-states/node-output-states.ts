import OutputPort from "../models/layout/output-port";
import Connection from "../models/layout/connection";
import BranchesOfExpressions from "../states/branches-of-expressions";
import { INodeState } from "../common-interfaces";
import { PortType } from "../common-enums";
import { NodeStates } from "./node-states";

export default class NodeOutputStates extends NodeStates {
    branchesOfExpressions: BranchesOfExpressions;
    singleState: INodeState;

    constructor(nodeDescriptor) {
        super(nodeDescriptor, PortType.Output);        
    }

    spreadToDownStreamInputPorts(
        byOutputPort: OutputPort,
        connection?: Connection,
        isDisconnected?: boolean) {

        if (isDisconnected) {
            this.branchesOfExpressions.excludeArgFrom(byOutputPort);
        } else {
            this.branchesOfExpressions.addOrUpdateFor(byOutputPort,
                connection ? connection.inputPort.seqNumberOfNode : undefined);
        }
        //spread the changed output port state into the connected downstream input ports 
        byOutputPort.connections.forEach(function (connection) {
            connection.inputPort.setSignal(byOutputPort.signal, connection);
        });
    }

    getValueForDebug() {
        var result: string[] = [];

        for (var id in this.states) {
            result.push(("" + this.states[id].value).replace("undefined", "?"));
        }

        return result.join(",");
    }
}