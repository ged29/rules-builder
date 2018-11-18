import Canvas from "../../../models/layout/canvas";
import InputPort from "../../../models/layout/input-port";
import OutputPort from "../../../models/layout/output-port";
import FunctionalNode from "../../../models/layout/node";
import validators from "../../../models/nodes/validation/validators";
import { SimpleNodeViewModel } from "../../../models/nodes/base/simple-node-view-model";
import { PortType } from "../../../common-enums";
import { ICoordinate } from "../../../graphic-common-interfaces";
import { utils } from "../../../utils/utils.service";

const enum InputRestriction {
    AllButWhiteSpace = 'AllButWhiteSpace',
    OnlyNumeric = 'OnlyNumeric',
    AllButNewLine = 'AllButNewLine'
}

export class SimpleBaseView {
    canvas: Canvas;
    node: FunctionalNode;
    nodeTitle: string;
    nodeCaption: string;
    viewModel: SimpleNodeViewModel;

    constructor(protected elementOfNode: HTMLDivElement) { }

    subscribe() {
        this.node
            .on("node.digest", this.onNodeDigest, this)
            .on("node.drag", this.onNodeDrag, this)
            .on("node.removeView", this.onNodeRemoved, this)
            .on("node.toggleSelected", (isSelected?: boolean) => {
                if (this.node.isSelected === isSelected) return;

                this.node.isSelected = isSelected !== undefined ? isSelected : !this.node.isSelected;
                this.elementOfNode.classList.toggle("selected", this.node.isSelected);
            }, this)
            .on("node.toggleMoved", (isMoved?: boolean) => {
                if (this.node.isMoved === isMoved) return;

                this.node.isMoved = isMoved !== undefined ? isMoved : !this.node.isMoved;
                this.elementOfNode.classList.toggle("moved", this.node.isMoved);
            }, this)
            .on("port.setTerminationState", (portId: string, isTerminator: boolean) => {
                if (this.setTerminationStateOfPort(portId, isTerminator)) { // first call the handler, inplemented in the derived controller class
                    this.elementOfNode.querySelector(`#${portId}`).classList.toggle("is-terminator", isTerminator);
                }
            }, this)
            .on("port.toggleSelection", (portId: string) => {
                this.elementOfNode.querySelector(`#${portId}`).classList.toggle("selected");
            }, this);
        //if this node handles the debugValueChanged event, subscribe on it
        if (this.node.descriptor.isDebugPresent) {
            this.node.on("node.debugValueChanged", (value: string) => {
                //this.elementOfNode.querySelector(".node-debug").text(value).attr("title", value);
            }, this);
        }
    }

    onNodeDigest() {      
    }

    onNodeDrag(offset: ICoordinate) {
        this.node.left += offset.x;
        this.node.top += offset.y;

        for (let port of this.node.getAllPorts()) {
            port.cx += offset.x;
            port.cy += offset.y;

            for (let connection of port.connections) {
                connection.onPortPositionChanged(port);
            }
        }

        //this.elementOfNode.css({ left: this.node.left, top: this.node.top });
    }

    onNodeRemoved() {
        // this.elementOfNode.on("$destroy", () => {
        //     this.elementOfNode = null;
        //     this.$scope.$destroy();
        // });
        // this.elementOfNode.remove();
    }

    onKeyDown(event: KeyboardEvent, restriction: InputRestriction) {
        if (utils.Constants.Keys.CONTROL_KEYS_SET.indexOf(event.keyCode || event.which) >= 0
            || event.altKey || event.ctrlKey || event.metaKey) {
            return true;
        }

        var isRestricted =
            (restriction === InputRestriction.OnlyNumeric && /[-.0-9]/.test(event.key) === false)
            ||
            (restriction === InputRestriction.AllButWhiteSpace && event.key === " ")
            ||
            (restriction === InputRestriction.AllButNewLine && event.key === "Enter");

        if (isRestricted) {
            event.preventDefault();
            return false;
        }

        return true;
    }

    onPaste(event, restriction: InputRestriction) {
        var textToPaste: string = undefined,
            thisWindow = window as any,
            isRestricted: boolean;

        if (event.originalEvent.clipboardData && event.originalEvent.clipboardData.getData) {
            textToPaste = event.originalEvent.clipboardData.getData("text/plain");
        } else if (thisWindow.clipboardData && thisWindow.clipboardData.getData) {
            textToPaste = thisWindow.clipboardData.getData("Text");
        }

        isRestricted = !textToPaste
            ||
            (restriction === InputRestriction.OnlyNumeric && validators.decimalNumber.isValid(textToPaste) === false)
            ||
            (restriction === InputRestriction.AllButWhiteSpace && textToPaste === " ")
            ||
            (restriction === InputRestriction.AllButNewLine && /(?:\r?\n)/.test(textToPaste));

        if (isRestricted) {
            event.preventDefault();
        }
    }

    emitSignal() {
        var signal = this.viewModel.getSignal(this.canvas),
            portToSignalDescriptor = this.viewModel.portToSignal,
            port: InputPort | OutputPort;

        if (portToSignalDescriptor.portType === PortType.Output) {
            port = this.node.getOutputPortByMarker(portToSignalDescriptor.marker);
            port.outputMetrics.setEqual();
        }
        else {
            port = this.node.getInputPortByMarker(portToSignalDescriptor.marker);
        }

        port.setSignal(signal, this.node.getFirstOutgoingConnection());
    }
    // the dummy implementation, should be overrided in the derived controller class
    setTerminationStateOfPort(portId: string, isTerminator: boolean) {
        return true;
    }
}