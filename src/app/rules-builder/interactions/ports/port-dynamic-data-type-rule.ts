import Port from "../../models/layout/port";
import FunctionalNode from "../../models/layout/node";
import Connection from "../../models/layout/connection";
import { DataType, PortType } from "../../common-enums";
import { IPortDescriptor } from "../../common-interfaces";

class PortDynamicDataTypeRule {

    private set(parentNode: FunctionalNode, dataTypeToSet?: DataType) {
        var port: Port,
            indexer: string,
            portDescriptor: IPortDescriptor,
            allPorts = parentNode.getAllPorts();

        for (let pi = allPorts.length; pi--;) {
            port = allPorts[pi];
            indexer = PortType[port.type].toLowerCase();
            portDescriptor = parentNode.descriptor.ports[indexer][port.index];

            if (!port.isDynamicDataType) {
                continue;
            }

            if (dataTypeToSet) {
                port.initDataType = port.initDataType || port.dataType;
                portDescriptor.dataType = port.dataType = dataTypeToSet;
            }
            else if (port.initDataType) {
                portDescriptor.dataType = port.dataType = port.initDataType;
            }
        }
    }

    isDynamicDataTypeNow(port: Port) {
        return port.dataType === DataType.All
            || port.dataType === DataType.NumericTimeTextField
            || port.dataType === DataType.NumericDateTimeField;
    }

    onConnected(connection: Connection) {
        var dataTypeToSet: DataType,
            inputPort = connection.inputPort,
            outputPort = connection.outputPort,
            portWithDynamicDataType = (
                (outputPort.isDynamicDataType && this.isDynamicDataTypeNow(outputPort) && outputPort)
                || (inputPort.isDynamicDataType && this.isDynamicDataTypeNow(inputPort) && inputPort));

        if (portWithDynamicDataType) {
            dataTypeToSet = connection.getAdjacentPort(portWithDynamicDataType).dataType;
            this.set(portWithDynamicDataType.parentNode, dataTypeToSet);
        }
    }

    onDisconnect(port: Port) {
        var parentNode = port.parentNode, dataTypeToSet: DataType;

        if (!port.isDynamicDataType
            || parentNode.inputPorts.some(p => p.isDynamicDataType && p.isConnectedTo())) {
            return;
        }
        //at this point we can have only the OutputPort connected to or fully disconnected state of Node
        var outputPort = parentNode.getFirstOutputPort();
        //fully disconnected Node, the init state of Node should be restored
        if (!outputPort.isConnectedTo()) {
            this.set(parentNode);
            return;
        }
        //have only the OutputPort connected to
        if (!this.isDynamicDataTypeNow(outputPort) && outputPort.connections.length === 1) {
            let inputPort = outputPort.getFirstConnection().inputPort;
            //restore dynamic DataType on all ports of node if OutputPort has only one connection
            //and the OutputPort DataType isn't dynamic by connected InputPort is dynamic
            if (this.isDynamicDataTypeNow(inputPort)) {
                this.set(parentNode, inputPort.dataType);
            }
        }
    }
}

export default new PortDynamicDataTypeRule();