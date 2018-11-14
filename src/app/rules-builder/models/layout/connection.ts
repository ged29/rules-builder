import Line from "../../models/layout/line";
import Port from "../../models/layout/port";
import InputPort from "../../models/layout/input-port";
import OutputPort from "../../models/layout/output-port";
import { PortType } from "../../common-enums";
import { IPortPositionChangeListener } from "../../common-interfaces";
import { ILineDescriptor } from "../../graphic-common-interfaces";

export default class Connection extends Line implements IPortPositionChangeListener {

    inputPort: InputPort;
    outputPort: OutputPort;
    /**
     * @constructor
     * Creates a new Connection element which is used to display a line between two points.             
     *   
     * @param {ILineDescriptor} lineDescriptor The configuration of the Line     
     */
    constructor(lineDescriptor: ILineDescriptor) {
        super(lineDescriptor);

        this.outputPort = null;
        this.inputPort = null;
    }

    static parseId(connectivity: string) {
        let [outputNodeId, inputNodeId, outputPortMarker, inputPortMarker] = connectivity.split(":");
        return {
            outputNodeId: outputNodeId,
            inputNodeId: inputNodeId,
            outputPortMarker: outputPortMarker,
            inputPortMarker: inputPortMarker
        };
    }

    static compileId(outputNodeId: string, inputNodeId: string, outputPortMarker: string, inputPortMarker: string): string {
        return `${outputNodeId}:${inputNodeId}:${outputPortMarker}:${inputPortMarker}`;
    }

    static compileIdByPorts(outputPort: Port, inputPort: Port): string {
        return `${outputPort.parentNode.id}:${inputPort.parentNode.id}:${outputPort.marker}:${inputPort.marker}`;
    }
    /**              
     * Factory method creates a new Connection between the given ports.
     *
     * @param {Port} outputPort The Output Port for the connection to create
     * @param {Port} inputPort The Input Port for the connection to create     
     */
    static create(outputPort: Port, inputPort: Port, svgContainer?: JQuery): Connection {
        var outPort: OutputPort = (outputPort.type === PortType.Output ? outputPort : inputPort) as OutputPort,
            inPort: InputPort = (inputPort.type === PortType.Input ? inputPort : outputPort) as InputPort,
            connection = new Connection({
                id: Connection.compileIdByPorts(outPort, inPort),
                start: { x: outPort.cx, y: outPort.cy },
                end: { x: inPort.cx, y: inPort.cy },
                svgContainer: svgContainer
            });

        connection.setOutputPort(outPort);
        connection.setInputPort(inPort);

        return connection;
    }
    /**             
      * Set the OutputPort of this connection. 
      *
      * @param {OutputPort} outputPort The new OutputPort of this connection.
      **/
    setOutputPort(outputPort: OutputPort) {
        this.outputPort = outputPort;
        this.outputPort.addConnection(this);
        //waiting while inputPort will be specified for this connection                
        if (this.inputPort !== null) {
            this.inputPort.onConnected(this);
        }
    }

    removeOutputPort(silently: boolean) {
        this.outputPort.removeConnection(this);

        if (!silently) {
            this.outputPort.onDisconnect(this);
        }
    }
    /**             
     * Set the InputPort of this connection.
     * 
     * @param {InputPort} inputPort The new InputPort of this connection
     **/
    setInputPort(inputPort: InputPort) {
        this.inputPort = inputPort;
        this.inputPort.addConnection(this);

        //waiting while outputPort will be specified for this connection        
        if (this.outputPort !== null) {
            this.inputPort.onConnected(this);
        }
    }

    removeInputPort(silently: boolean) {
        this.inputPort.removeConnection(this);

        if (!silently) {
            this.inputPort.onDisconnect(this);
        }
    }
    /**              
      * Returns the adjacent port of this connection for the given port.
      *
      * @return {Port}
      **/
    getAdjacentPort(port) {
        return port.type === PortType.Input ? this.outputPort : this.inputPort;
    }
    /**              
     * Release all allocated by this connection resources         
     **/
    remove(silently: boolean) {
        this.group.remove();
        this.removeInputPort(silently);
        this.removeOutputPort(silently);
    }
    /**            
      * Fired by the given figure if the UI state of the figure has been changed.
      *              
      * @param {Port} the Port which has been moved
      **/
    onPortPositionChanged(port: Port) {
        if (port.type === PortType.Output) {
            this.setStartPoint(port.cx, port.cy);
        }
        else {
            this.setEndPoint(port.cx, port.cy);
        }
    }

    refreshPortsPositions() {
        this.setStartPoint(this.outputPort.cx, this.outputPort.cy);
        this.setEndPoint(this.inputPort.cx, this.inputPort.cy);
    }

    toggleSelected() {
        this.toggleClass("selected");
    }
}