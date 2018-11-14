import Port from "../../models/layout/port";
import FunctionalNode from "../../models/layout/node";
import { PortType } from "../../common-enums";
import { IBBox } from "../../graphic-common-interfaces";

export default class PortPositionsIndex {
    private portIndexes: { [portType: number]: IBBox[] };

    constructor(private parentNode: FunctionalNode) {
        var parentNodeBBox = parentNode.getBBox(),
            allPorts = parentNode.getAllPorts();

        this.portIndexes = {};

        for (let port of allPorts) {
            if (port.isHidden) continue; // don't make sence to create the geometrical port index for the hidden port

            if (!this.portIndexes[port.type]) {
                this.portIndexes[port.type] = [];
            }

            this.add(port, parentNodeBBox);
        }
    }

    add(port: Port, parentNodeBBox: IBBox = this.parentNode.getBBox()) {
        var leftOffset = Math.abs(parentNodeBBox.minX - port.cx),
            topOffset = Math.abs(parentNodeBBox.minY - port.cy),
            portRadius = port.radius;

        this.portIndexes[port.type][port.index] = {
            minX: leftOffset - portRadius,
            minY: topOffset - portRadius,
            maxX: leftOffset + portRadius,
            maxY: topOffset + portRadius
        };
    }

    remove(port: Port) {
        this.portIndexes[port.type][port.index];
    }

    getCollided(queryBBox: IBBox, portType: PortType): ICollideResult {
        var parentNodeBBox = this.parentNode.getBBox(),
            queryPortType = portType === PortType.Input ? PortType.Output : PortType.Input,
            portIndexes = this.portIndexes[queryPortType],
            queryBBox: IBBox;

        if (!this.intersects(parentNodeBBox, queryBBox) || !portIndexes) {
            return { collidedNode: null, portCandidate: null };
        }

        queryBBox = {
            minX: queryBBox.minX - parentNodeBBox.minX,
            minY: queryBBox.minY - parentNodeBBox.minY,
            maxX: queryBBox.maxX - parentNodeBBox.minX,
            maxY: queryBBox.maxY - parentNodeBBox.minY
        };

        for (let portIndex = portIndexes.length; portIndex--;) {
            if (this.intersects(queryBBox, portIndexes[portIndex])) {
                return {
                    collidedNode: this.parentNode,
                    portCandidate: queryPortType === PortType.Input
                        ? this.parentNode.getInputPortByIndex(portIndex)
                        : this.parentNode.getOutputPortByIndex(portIndex)
                };
            }
        }

        return { collidedNode: this.parentNode, portCandidate: null };
    }

    private intersects(a: IBBox, b: IBBox) {
        return b.minX <= a.maxX
            && b.minY <= a.maxY
            && b.maxX >= a.minX
            && b.maxY >= a.minY;
    }
}

export interface ICollideResult {
    collidedNode: FunctionalNode;
    portCandidate: Port;
}