import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression } from "../../../common-interfaces";

enum ExportPriorityUsage { AsField = 0, AsFunction = 1 };

export default class SnapshotField extends SimpleNodeViewModel {
    static stateKey = "exportPriority";

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, true, SnapshotField.stateKey);
        // determine how to use this node - as field or as function node
        this.descriptor.exportPriority = Number(this.value) || ExportPriorityUsage.AsField;
    }

    getValue(args: any[]) {        
        return "";
    }

    getExpression(args: IExpression[]): IExpression {        
        var snapshotIndexExpr = args && args[0], // the args can be undefined in backgrnd validation service proc, because the node can be used as field instead of function 
            isSnapshotIndexProvided = !!snapshotIndexExpr && snapshotIndexExpr.exprToExport !== "?",
            fieldName = this.descriptor.fieldName,
            exprToShow, exprToExpr, usage: ExportPriorityUsage;

        if (isSnapshotIndexProvided) {
            exprToShow = this.isViewModel ? `Snapshot('${fieldName}.Value', ${snapshotIndexExpr.exprToShow})` : undefined;
            exprToExpr = `N(Snapshot('${fieldName}', ${snapshotIndexExpr.exprToExport}))`;
            usage = ExportPriorityUsage.AsFunction;
        }
        else {
            exprToExpr = `N(${fieldName})`;

            if (this.isViewModel) {
                exprToShow = `${fieldName}.Value`;                
            }

            usage = ExportPriorityUsage.AsField;
        }

        this.selfStates[SnapshotField.stateKey] = usage;
        return this.buildExpression(exprToShow, exprToExpr);
    }

    getSignal(): Signal {
        var emitterValue = this.inputStates.getValue("I"),
            emitterExpr = this.inputStates.getExpression("I");

        return Signal.create(this.getValue([emitterValue]), this.getExpression([emitterExpr]));
    }
}