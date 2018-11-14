import Signal from "../../states/signal";
import Canvas from "../../models/layout/canvas";
import FunctionalNode from "../../models/layout/node";
import Connection from "../../models/layout/connection";
import portDynamicDataTypeRule from "../../interactions/ports/port-dynamic-data-type-rule";
import { DataType, PortType } from "../../common-enums";
import { IPortDescriptor, TIsCompatibleByFn } from "../../common-interfaces";
import { IIdentifiable } from "../../graphic-common-interfaces";

export default class Port implements IIdentifiable {
    id: string;
    parentNode: FunctionalNode;
    title: string;
    marker: string;
    index: number;
    type: PortType;

    isHidden: boolean;
    isDynamic: boolean;
    isDynamicDataType: boolean;
    isDataTypeExactMatch: boolean;
    isCompatibleBy: TIsCompatibleByFn;
    maxConnCount: number;
    dataType: DataType;
    initDataType: DataType;
    seqNumberOfNode: number;

    cx: number;
    cy: number;
    radius: number;

    canvas: Canvas;
    signal: Signal;

    connections: Connection[];

    isTerminator: boolean;
    setTerminationState: (isTerminator: boolean) => void;
    toggleSelection: () => void;

    constructor(
        parentNode: FunctionalNode,
        type: PortType,
        portDescriptor: IPortDescriptor) {

        this.parentNode = parentNode;
        this.title = portDescriptor.title;
        this.marker = portDescriptor.marker.toUpperCase(); //input.[V]
        this.id = PortType[type].toLowerCase() + "." + this.marker; //[input].V        
        this.index = portDescriptor.index;
        this.type = type; //PortType.Input | PortType.Output

        this.dataType = portDescriptor.dataType;
        this.isHidden = portDescriptor.isHidden || false;
        this.isDynamic = portDescriptor.isDynamic;
        this.isDynamicDataType = !this.isHidden && !parentNode.isResulting && portDynamicDataTypeRule.isDynamicDataTypeNow(this);
        this.isDataTypeExactMatch = portDescriptor.hasOwnProperty("isDataTypeExactMatch") ? portDescriptor.isDataTypeExactMatch : false;
        this.isCompatibleBy = portDescriptor.isCompatibleBy;
        this.maxConnCount = portDescriptor.maxConnCount || 100;
        this.seqNumberOfNode = this.isHidden ? 0 : parentNode.sequentialNumber;

        this.cy = this.cx = 0;
        this.radius = 0;

        this.canvas = parentNode.canvas;
        // attached connections to this Port
        this.connections = [];

        this.isTerminator = true;
        this.setTerminationState = (isTerminator) => this.parentNode.emit("port.setTerminationState", this.id, this.isTerminator = isTerminator);
        this.toggleSelection = () => this.parentNode.emit("port.toggleSelection", this.id);
        //the signal related to this port, in init state it's undefined
        this.signal = Signal.createEmpty();
    }
    /**
     * Indicates whether this port was connected to and was connected to the given port.
     **/
    isConnectedTo(port?: Port): boolean {
        if (this.connections.length === 0) {
            return false;
        }

        if (port) {
            return this.connections.some(connection => connection.getAdjacentPort(this) === port);
        }

        return true;
    }
    /**
     * Indicates whether this port can be connected to.
     **/
    canBeConnectedTo(): boolean {
        return this.connections.length < this.maxConnCount;
    }
    /**
     * Callback method if a new connection has created with this port.
     * This callback only been triggered on the InputPort of connection.
     * 
     * @param {Connection} the connection which has been created             
     **/
    onConnected(connection: Connection) {
        var inputPort = connection.inputPort,
            outputPort = connection.outputPort;

        portDynamicDataTypeRule.onConnected(connection);

        inputPort.setTerminationState(false);
        outputPort.setTerminationState(false);
        //set the signal of outputPort pointer to the related inputPort
        inputPort.setSignal(outputPort.signal, connection);
    }
    /**             
     * Callback method if a connection has been dropped with this port
     * This callback been triggered on the both type of ports in connection.
     * 
     * @param {Connection} the connection which has been dropped             
     **/
    onDisconnect(connection: Connection) {

        portDynamicDataTypeRule.onDisconnect(this);

        if (this.type === PortType.Input) {
            connection.inputPort.setSignal(Signal.createEmpty(), connection, true);
        }

        if (!this.isConnectedTo()) {
            this.setTerminationState(true);
        }

    }
    /**             
     * Returns a first Port connection
     * 
     * @returns {Connection} 
     **/
    getFirstConnection(): Connection {
        return this.connections.length === 0
            ? undefined
            : this.connections[0];
    }

    addConnection(connection: Connection) {
        this.connections.push(connection);
    }

    removeConnection(connection: Connection) {
        var indexToRemove = this.connections.indexOf(connection);
        this.connections.splice(indexToRemove, 1);
    }

    remove(silently: boolean) {
        while (this.connections.length) {
            this.connections[0].remove(silently);
        }
    }

    /*********************************** Persistence ********************************************/
    getToSave() {
        return this.connections.map(connection => connection.id);
    }
}