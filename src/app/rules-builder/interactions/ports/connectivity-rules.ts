import Port from "../../models/layout/port";
import { PortType, NodeType } from "../../common-enums";

export default class ConnectivityRules {

    compatibleByDataTypes(sourcePort: Port, portCandidate: Port): boolean {
        var sourcePortParentNodeName = sourcePort.parentNode.descriptor.name,
            portCandidateParentNodeName = portCandidate.parentNode.descriptor.name,
            isOk: boolean;

        if (sourcePort.isDataTypeExactMatch || portCandidate.isDataTypeExactMatch) {
            return sourcePort.dataType === portCandidate.dataType;
        }

        if (sourcePort.isCompatibleBy) {
            return sourcePort.isCompatibleBy({ dt: portCandidate.dataType, nodeName: portCandidateParentNodeName });
        }
        else if (portCandidate.isCompatibleBy) {
            return portCandidate.isCompatibleBy({ dt: sourcePort.dataType, nodeName: sourcePortParentNodeName });
        }

        isOk =
            ((portCandidate.dataType & sourcePort.dataType) === sourcePort.dataType)
            ||
            ((portCandidate.dataType & sourcePort.dataType) === portCandidate.dataType);

        return isOk;
    }

    cyclicalLinkCanNotOccur(sourcePort: Port, portCandidate: Port): boolean {
        var sourceNode = sourcePort.parentNode,
            sourceNodeType = sourceNode.descriptor.nodeType,
            sourceNodeSeqNumber: string,

            candidateNode = portCandidate.parentNode,
            candidateNodeType = candidateNode.descriptor.nodeType,
            candidateNodeSeqNumber: string,

            branchesOfExpressions = sourcePort.parentNode.canvas.branchesOfExpressions,
            isPathExist: boolean;
        //it's just a value emitter so we don't have the recursive expectation 
        if (((sourceNodeType & NodeType.AllValueEmitter) + (candidateNodeType & NodeType.AllValueEmitter)) > 0) {
            return true;
        }

        if (sourcePort.type === PortType.Output) {
            sourceNodeSeqNumber = sourceNode.sequentialNumber.toString();
            candidateNodeSeqNumber = candidateNode.sequentialNumber.toString();
        }
        else {
            sourceNodeSeqNumber = candidateNode.sequentialNumber.toString();
            candidateNodeSeqNumber = sourceNode.sequentialNumber.toString();
        }

        return !branchesOfExpressions.isPathExist(sourceNodeSeqNumber, candidateNodeSeqNumber);
    }

    satisfied(sourcePort: Port, portCandidate: Port): boolean {
        return portCandidate.canBeConnectedTo()
            && !portCandidate.isConnectedTo(sourcePort)
            && this.compatibleByDataTypes(sourcePort, portCandidate)
            && this.cyclicalLinkCanNotOccur(sourcePort, portCandidate);
    }
}