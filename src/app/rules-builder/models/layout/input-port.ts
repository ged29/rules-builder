import Signal from "../../states/signal";
import Port from "../../models/layout/port";
import FunctionalNode from "../../models/layout/node";
import Connection from "../../models/layout/connection";
import { PortType } from "../../common-enums";
import { IPortDescriptor } from "../../common-interfaces";

export default class InputPort extends Port {

    isMultiplyConnected: boolean;

    constructor(
        parentNode: FunctionalNode,        
        portDescriptor: IPortDescriptor) {
        super(parentNode, PortType.Input, portDescriptor);

        this.isMultiplyConnected = portDescriptor.isMultiplyConnected;
    }

    setSignal(
        signalToSet: Signal,
        connection: Connection = undefined,
        isDisconnected: boolean = false) {
        //get InputStates of node to which belong this InputPort 
        var inputStatesOfNode = this.parentNode.model.inputStates;

        if (connection && !this.isHidden) {
            this.seqNumberOfNode = isDisconnected ? 0 : connection.outputPort.seqNumberOfNode;
        }
        //set the new signal to this InputPort
        this.signal = signalToSet;

        inputStatesOfNode.set(this, connection, isDisconnected);
        inputStatesOfNode.spreadToLocalOutputPort(this, connection, isDisconnected);
    }
}