import Signal from "../../states/signal";
import Port from "../../models/layout/port";
import FunctionalNode from "../../models/layout/node";
import Connection from "../../models/layout/connection";
import { PortType } from "../../common-enums";
import { IPortDescriptor, IOutputMetrics } from "../../common-interfaces";

export default class OutputPort extends Port {

    inputMetrics: number[];
    outputMetrics: IOutputMetrics;

    constructor(
        parentNode: FunctionalNode,        
        portDescriptor: IPortDescriptor) {
        super(parentNode, PortType.Output, portDescriptor);

        this.inputMetrics = [];
        this.outputMetrics = {
            oldMetric: this.seqNumberOfNode,
            newMetric: this.seqNumberOfNode,
            setEqual: function () { this.oldMetric = this.newMetric; }
        }
    }

    setMetrics(inputPortsMetrics: number[]) {
        this.outputMetrics.setEqual();
        this.inputMetrics = inputPortsMetrics;

        if (inputPortsMetrics.length === 0) { //the node was fully disconnected
            this.outputMetrics.oldMetric = this.outputMetrics.newMetric = this.seqNumberOfNode;
            return;
        }

        this.outputMetrics.newMetric = this.seqNumberOfNode;
        for (let mi = inputPortsMetrics.length; mi--;) {
            this.outputMetrics.newMetric += inputPortsMetrics[mi];
        }
    }

    setSignal(
        signalToSet: Signal,
        connection: Connection = undefined,
        isDisconnected: boolean = false) {
        //get OutputStates of node to which belong this OutputPort 
        var outputStatesOfNode = this.parentNode.model.outputStates,
            isStateChanged = (outputStatesOfNode.singleState && outputStatesOfNode.singleState.value !== signalToSet.value) || !outputStatesOfNode.singleState;

        this.signal = signalToSet;
        outputStatesOfNode.setSingle(this);

        if (isStateChanged) {
            this.parentNode.debugValueChanged(outputStatesOfNode.getValueForDebug());
        }

        outputStatesOfNode.spreadToDownStreamInputPorts(this, connection, isDisconnected);
    }
}