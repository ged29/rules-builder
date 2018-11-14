import Canvas from "../../models/layout/canvas";
import Connection from "../../models/layout/connection";
import { EventEmitter } from "../../utils/event-emitter";
import Port from "../../models/layout/port";
import OutputPort from "../../models/layout/output-port";
import InputPort from "../../models/layout/input-port";
import PortPositionsIndex from "../../interactions/ports/port-positions-index";
import { SimpleNodeViewModel } from "../../models/nodes/base/simple-node-view-model";
import { PortType, NodeType } from "../../common-enums";
import { INodeDescriptor, IPortDescriptor, INodePersistState } from "../../common-interfaces";
import { ICoordinate, IBBox, IGeometryItem } from "../../graphic-common-interfaces";
import { uuid } from "../../../services/utils/uuid";

export default class FunctionalNode extends EventEmitter implements IGeometryItem {
    canvas: Canvas;
    descriptor: INodeDescriptor;

    id: string;
    sequentialNumber: number;
    fieldId: string;
    isField: boolean;
    isResulting: boolean;
    isMultipleOutput: boolean;
    isSelected: boolean;
    isMoved: boolean;
    hasInputPorts: boolean;

    inputPort: InputPort;
    inputPorts: InputPort[];
    outputPort: OutputPort;
    outputPorts: OutputPort[];
    cachedPorts: Port[];
    portPositionsIndex: PortPositionsIndex;

    debugValueChanged: (value: string) => void;
    digest: () => void;
    removeView: () => void;
    drag: (moveOffset: ICoordinate) => void;
    toggleSelected: (isSelected?: boolean) => void;
    toggleMoved: (isMoved?: boolean) => void;

    left: number;
    top: number;
    width: number;
    height: number;
    leftInc: number;
    rightInc: number;
    prevBBox: IBBox;
    /**
     * @constructor
     * Creates a new FunctionalNode element which are not assigned to any Canvas.             
     *
     * @param {SimpleNodeViewModel} model This node model
     * @param {Canvas} canvas The Canvas to which the Node is added
     */
    constructor(public model: SimpleNodeViewModel, canvas: Canvas) {
        super();

        this.canvas = canvas;
        this.descriptor = model.descriptor;

        this.sequentialNumber = canvas.SequentialNumberOfNode;
        this.id = this.descriptor.id || uuid.get();
        this.fieldId = this.descriptor.fieldId;
        this.isField = !!this.descriptor.fieldId;
        this.isMultipleOutput = this.descriptor.ports.output.length > 1;
        this.isResulting = this.id === uuid.empty;
        this.isSelected = this.isMoved = false;
        this.hasInputPorts = this.descriptor.hasInputPorts;
        //build this Node input ports        
        this.inputPorts = this.hasInputPorts ? this.getPorts(this.descriptor.ports.input, PortType.Input) : [];
        //build this Node output ports
        this.outputPorts = this.getPorts(this.descriptor.ports.output, PortType.Output);
        //fillout all ports cache 
        this.cachedPorts = null;
        this.getAllPorts();
        //publish this node UI events        
        this.debugValueChanged = this.descriptor.isDebugPresent ? (value: string) => this.emit("node.debugValueChanged", value) : () => { return; };
        this.digest = () => this.emit("node.digest");
        this.removeView = () => this.emit("node.removeView");
        this.drag = (moveOffset: ICoordinate) => this.emit("node.drag", moveOffset);
        this.toggleSelected = (isSelected?: boolean) => this.emit("node.toggleSelected", isSelected);
        this.toggleMoved = (isMoved?: boolean) => this.emit("node.toggleMoved", isMoved);
    }

    private getPorts(portDescriptors: IPortDescriptor[], portType: PortType) {
        var portArray = [],
            construct = portType === PortType.Input ? InputPort : OutputPort;

        for (let pInx = portDescriptors.length, port: Port; pInx--;) {
            port = new construct(this, portDescriptors[pInx]);
            portArray[port.index] = port;
            //set the ports shortcuts
            if (portType === PortType.Input && !port.isHidden && this.inputPort === undefined) {
                this.inputPort = port as InputPort;
            }

            if (portType === PortType.Output && this.outputPort === undefined) {
                this.outputPort = port as OutputPort;
            }
        }

        return portArray;
    }

    /************************************** Ports behaviour **************************************************/
    // Just for Debug, should be removed  
    getOutputPortMetrics(portIndex) {
        var outPort = this.getOutputPortByIndex(portIndex);
        if (!outPort) {
            return null;
        }

        return outPort.outputMetrics.oldMetric + " | " +
            outPort.outputMetrics.newMetric + " [" + outPort.inputMetrics.join(",") + "]";
    }
    getInputPortMetrics(portIndex) {
        return this.getInputPortByIndex(portIndex).seqNumberOfNode;
    }

    addDynamicInputPort(newPortDescriptor: IPortDescriptor): InputPort {
        this.model.inputStates.init(newPortDescriptor);

        let newPort = new InputPort(this, newPortDescriptor);
        this.inputPorts.splice(newPort.index, 0, newPort);
        this.cachedPorts.splice(newPort.index, 0, newPort);

        return newPort;
    }

    removeDynamicInputPort(port: InputPort) {
        // drop the state of the removed port
        this.model.inputStates.removeState(port.marker);
        // drop the port from node collections
        this.inputPorts.splice(this.inputPorts.indexOf(port), 1);
        this.cachedPorts.splice(this.cachedPorts.indexOf(port), 1);
    }

    buildPortPositionsIndex() {
        this.portPositionsIndex = new PortPositionsIndex(this);
    }
    /** Return all connections of this node.
      *
      * @return  {Connections[]}
      **/
    getAllConnections(): Connection[] {
        var connections: Connection[] = [],
            allPorts = this.getAllPorts();

        for (let pi = allPorts.length; pi--;) {
            connections.push.apply(connections, allPorts[pi].connections);
        }

        return connections;
    }

    getAllOutputConnections(): Connection[] {
        var connections: Connection[] = [];

        for (let pi = this.outputPorts.length; pi--;) {
            connections.push.apply(connections, this.outputPorts[pi].connections);
        }

        return connections;
    }

    /** Return all ports of this node.
      *
      * @return  {Port[]}
      **/
    getAllPorts(): Port[] {
        if (this.cachedPorts === null) {
            this.cachedPorts = [];
            this.cachedPorts = this.cachedPorts.concat(this.inputPorts).concat(this.outputPorts);
        }

        return this.cachedPorts;
    };
    /**   
      * Return the port by the given Id.
      *    
      * @param {string} Id the Id of the port to return.
      * @return {Port} Returns the port with the requested id otherwise null.
      **/
    getPortById(id: string): Port {
        var allPorts = this.getAllPorts();

        for (let pi = allPorts.length; pi--;) {
            if (allPorts[pi].id === id) {
                return allPorts[pi];
            }
        }

        return null;
    }
    /**   
      * Returns the input port by the given Id.               
      *
      * @param {string} Id the Id of the input port to return.
      * @return {Port} Returns the input port with the requested id otherwise null.
      **/
    getInputPortById(id: string): InputPort {
        for (let pi = this.inputPorts.length; pi--;) {
            if (this.inputPorts[pi].id === id) {
                return this.inputPorts[pi];
            }
        }

        return null;
    }

    getInputPortByMarker(marker: string): InputPort {
        for (let pi = this.inputPorts.length; pi--;) {
            if (this.inputPorts[pi].marker === marker) {
                return this.inputPorts[pi];
            }
        }

        return null;
    }

    getInputPortByIndex(index: number): InputPort {
        return this.descriptor.hasInputPorts ? this.inputPorts[index] : null;
    }
    /**   
      * Return the output port by the given Id.
      *
      * @param {string} Id the Id of the output port to return.
      * @return {Port} Returns the output port with the requested id otherwise null.
      **/
    getOutputPortById(id: string): OutputPort {
        for (let pi = this.outputPorts.length; pi--;) {
            if (this.outputPorts[pi].id === id) {
                return this.outputPorts[pi];
            }
        }

        return null;
    }

    getOutputPortByMarker(marker: string): OutputPort {
        for (let pi = this.outputPorts.length; pi--;) {
            if (this.outputPorts[pi].marker === marker) {
                return this.outputPorts[pi];
            }
        }

        return null;
    }

    getOutputPortByIndex(index: number): OutputPort {
        return this.outputPorts.length === 0 ? null : this.outputPorts[index];
    }

    getFirstOutputPort(): OutputPort {
        return this.getOutputPortByIndex(0);
    }

    getFirstOutgoingConnection(): Connection {
        var outputPort = this.getOutputPortByIndex(0);
        return outputPort.getFirstConnection();
    }

    getFirstIngoingConnection(): Connection {
        var inputPort = this.getInputPortByIndex(0);
        return inputPort.getFirstConnection();
    }
    /**
     * Release all allocated by this Node resources
     */
    remove(silently: boolean = false) {
        this.removeView();
        this.allOff();

        this.portPositionsIndex = null;
        this.cachedPorts.forEach(port => port.remove(silently));

        if (!silently) {
            this.canvas.branchesOfExpressions.removeFor(this.outputPort);
        }

        this.cachedPorts = null;
        this.inputPorts = [];
        this.outputPorts = [];
    };

    /************************************** IGeometryItem **********************************************/
    saveBBox() {
        return this.prevBBox = this.getBBox();
    }

    getBBox(): IBBox {
        return {
            minX: this.left - this.leftInc,
            minY: this.top,
            maxX: this.left + this.width + this.rightInc,
            maxY: this.top + this.height
        }
    }

    isIntersectedWith(bbox: IBBox) {
        return this.left - this.leftInc <= bbox.maxX
            && this.top <= bbox.maxY
            && this.left + this.width + this.rightInc >= bbox.minX
            && this.top + this.height >= bbox.minY;
    }

    /************************************** Momento **************************************************/
    /** 
      * Return an objects with all attributes for this Node JSON serialization
      *
      * @returns {Object}
      */
    getToSave() {
        var modelStates,
            nodeConnectivity = [],
            momentoOfNode: INodePersistState = {
                id: this.id,
                left: this.left,
                top: this.top,
                descriptorName: this.descriptor.name,
                descriptorGroup: this.descriptor.groupName
            };

        if (modelStates = this.model.getToSave()) {
            momentoOfNode.states = modelStates;
        }

        if (this.isField) {
            momentoOfNode.fieldId = this.fieldId;
        }
        // this node is a functional node with the dynamic ports, so the new created dynamic port descriptors should be persisted
        if (this.descriptor.nodeType === NodeType.DynamicPortsFunction) {
            let portDescriptors: IPortDescriptor[] =
                this.inputPorts
                    .filter(port => port.isDynamic)
                    .map(port => ({
                        marker: port.marker,
                        index: port.index,
                        dataType: port.dataType,
                        title: port.title,
                        maxConnCount: port.maxConnCount
                    }));

            if (portDescriptors.length) {
                momentoOfNode.dynamicPortDescriptors = portDescriptors;
            }
        }

        this.outputPorts.forEach((port) => {
            var portConnectivity = port.getToSave();
            if (portConnectivity.length) {
                nodeConnectivity.push.apply(nodeConnectivity, portConnectivity);
            }
        });

        return {
            nodeState: momentoOfNode,
            connectivity: nodeConnectivity
        };
    };
}
