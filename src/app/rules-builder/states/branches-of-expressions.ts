import Signal from "./signal";
import FunctionalNode from "../models/layout/node";
import { NodeType, EvaluationSource } from "../common-enums";
import { IExpression, IBranch, IBranchesOfExpressionsState, IFinalExpression } from "../common-interfaces";

enum AddOrUpdateExprActions {
    AddBranch, UpdateBranch, MargeBranchesIntoNewOne, NotRequired
};

interface IExprPort {
    marker: string;
    parentNode: FunctionalNode;
    isTerminator: boolean;
    seqNumberOfNode: number;
    inputMetrics: number[];
    outputMetrics: {
        oldMetric: number,
        newMetric: number
    };
    signal: Signal;
}

export default class BranchesOfExpressions {
    //external callbackes interface
    private stateChangedListener = (...args) => { return; };

    private finalExpression: IExpression;
    private finalBranchIndex: number;
    private branches: { [index: number]: IBranch };

    constructor() {
        this.finalExpression = undefined;
        this.finalBranchIndex = 0;
        this.branches = {};
    }

    private branchesChanged(exprPort: IExprPort, isStateChanged: boolean, action) {

        if (isStateChanged) {
            this.stateChangedListener(this.getCurrentState());
            //console.log(exprPort.seqNumberOfNode, this.getUpStreamNodeIds(exprPort.seqNumberOfNode));
            //this.log(exprPort, action);
        }
    }

    private isBranchExistsFor(exprPort: IExprPort) {
        return this.branches.hasOwnProperty(exprPort.seqNumberOfNode.toString());
    }

    private getBranchFor(seqNumberOfNode): IBranch {
        return this.branches[seqNumberOfNode];
    }

    private getExprValue(exprPort: IExprPort): any {
        return {
            expression: exprPort.signal.expression,
            isExprResolved: exprPort.signal.expression.exprToShow.indexOf("?") === -1
        };
    }

    private excludeBranchFrom(currentBranch: IBranch, indexOfBranchToExclude: number) {
        var branchToExclude = this.getBranchFor(indexOfBranchToExclude);

        branchToExclude.numberOfInclusionsAsArg -= 1;

        if (branchToExclude.numberOfInclusionsAsArg === 0) {
            branchToExclude.isIncludedAsArg = false;
        }

        delete currentBranch.inArgs[indexOfBranchToExclude];
    }
    /**
     * Adds the new one branch for the Node dropped on the Canvas. 
     */
    private addBranchFor(exprPort: IExprPort) {
        var nodeType = exprPort.parentNode.descriptor.nodeType,
            isResultingExprNode = (nodeType & NodeType.AllResultingFields) > 0,
            exprValue = this.getExprValue(exprPort),
            thisBranch: IBranch;
        //debugger;
        thisBranch = this.branches[exprPort.seqNumberOfNode] = {
            nodeType: exprPort.parentNode.descriptor.nodeType,
            // the expression of Node
            expression: exprValue.expression,
            isExprResolved: exprValue.isExprResolved,
            // whether the Node is included as input argument into the downstream Nodes
            isIncludedAsArg: false,
            // the number of inclusion as input argument into the downstream Nodes
            numberOfInclusionsAsArg: 0,
            // flag shows whether the Node is a input field for which an finally expression is build
            isResultingExpr: isResultingExprNode,
            // the input arguments of Node
            inArgs: {}
        };
    }
    /**
     * Updates the exists brunch with the new expression.
     *
     * Returns true if expression was updated otherwise false
     */
    private updateBranchFor(exprPort: IExprPort): boolean {
        var currentBranch = this.getBranchFor(exprPort.seqNumberOfNode),
            updatedExprValue = this.getExprValue(exprPort);
        //nothing to update
        if (currentBranch.expression.exprToShow === updatedExprValue.expression.exprToShow) {
            return false;
        }

        currentBranch.isExprResolved = updatedExprValue.isExprResolved;
        currentBranch.expression = updatedExprValue.expression;
        //here we expect to be connected to the resulting node and be able to get the final expression value
        if (currentBranch.isResultingExpr) {
            this.finalExpression = currentBranch.isExprResolved
                ? exprPort.signal.expression
                : undefined;
        }

        return true;
    }
    /**
     * Marges two branches into new one with the updated expression.
     * The seqNumberOfBranchToInclude points on the branch which should be included as input argument.
     */
    private margeBranchesIntoNewOneFor(targetExprPort: IExprPort, seqNumberOfBranchToInclude: number) {
        var targetBranch = this.getBranchFor(targetExprPort.seqNumberOfNode),
            branchToInclude = this.getBranchFor(seqNumberOfBranchToInclude);

        if (this.isBranchExistsFor(targetExprPort)) {
            this.updateBranchFor(targetExprPort);
        }

        branchToInclude.numberOfInclusionsAsArg += 1;
        branchToInclude.isIncludedAsArg = true;

        targetBranch.inArgs[seqNumberOfBranchToInclude] = branchToInclude;
    }
    /**
     * Infers the action name that should be performed acording to
     * the ExprPort output and input metrics.         
     */
    private getAddOrUpdateActionFor(exprPort: IExprPort, seqNumberOfBranchToInclude: number): AddOrUpdateExprActions {
        var oldMetric = exprPort.outputMetrics.oldMetric,
            newMetric = exprPort.outputMetrics.newMetric,
            isInputMetricsEmpty = exprPort.inputMetrics.length === 0;

        if (oldMetric === newMetric && isInputMetricsEmpty) {
            if (this.isBranchExistsFor(exprPort)) {
                return AddOrUpdateExprActions.UpdateBranch; // the disconnected node config was changed or node without InputPort (FieldNode for ex.)
            }
            else {
                return AddOrUpdateExprActions.AddBranch;   // the new node was dropped onto expr canvas
            }
        }

        if ((oldMetric > newMetric || oldMetric === newMetric) && !isInputMetricsEmpty) {
            return AddOrUpdateExprActions.UpdateBranch; // the connected node config was changed
        }

        if (oldMetric < newMetric && !isInputMetricsEmpty) {
            return AddOrUpdateExprActions.MargeBranchesIntoNewOne; // // the exprPort was connected to
        }

        throw "Unsupported Action";
    }

    addOrUpdateFor(exprPort: IExprPort, seqNumberOfBranchToInclude?: number) {
        var isStateChanged = exprPort.isTerminator;
        var action = this.getAddOrUpdateActionFor(exprPort, seqNumberOfBranchToInclude);

        //console.log("%s[%s] %s", exprPort.parentNode.descriptor.name, exprPort.marker, AddOrUpdateExprActions[action].toString());

        switch (action) {
            case AddOrUpdateExprActions.AddBranch:
                this.addBranchFor(exprPort); //new node was added onto ExprCanvas
                break;

            case AddOrUpdateExprActions.UpdateBranch:
                isStateChanged = this.updateBranchFor(exprPort); //the value or param for one of node was changed 
                break;

            case AddOrUpdateExprActions.MargeBranchesIntoNewOne:
                this.margeBranchesIntoNewOneFor(exprPort, seqNumberOfBranchToInclude); //two nodes were connected to each other
                break;
        }

        this.branchesChanged(exprPort, isStateChanged, AddOrUpdateExprActions[action]);
    }

    excludeArgFrom(exprPort: IExprPort) {
        var indexOfIncudedBranch,
            currentBranch = this.getBranchFor(exprPort.seqNumberOfNode),
            exprValue = this.getExprValue(exprPort);

        for (let seqNumberOfNodeForArg in currentBranch.inArgs) {
            indexOfIncudedBranch = (seqNumberOfNodeForArg as any) * 1;
            //get the index of branch that missing in inputMetrics
            if (exprPort.inputMetrics.indexOf(indexOfIncudedBranch) === -1) {
                this.excludeBranchFrom(currentBranch, indexOfIncudedBranch);
                break;
            }
        }

        currentBranch.expression = exprValue.expression;
        currentBranch.isExprResolved = exprValue.isExprResolved;

        if (currentBranch.isResultingExpr) {
            this.finalExpression = undefined;
        }

        this.branchesChanged(exprPort, true, "excludeArgFrom");
    }

    removeFor(exprPort: IExprPort) {
        var currentBranch = this.getBranchFor(exprPort.seqNumberOfNode);
        delete this.branches[exprPort.seqNumberOfNode];
        //this.log(exprPort, "removeFor");
        this.branchesChanged(exprPort, true, "removeFor");
    }
    //used for expression-list directive to show the dynamicly compiled expression in real time 
    getCurrentState(): IBranchesOfExpressionsState {
        return {
            branches: this.branches,
            finalExpression: this.branches[this.finalBranchIndex].expression
        };
    }
    //used for connectivity rules to find possible circular connections
    isPathExist(sourceNodeId: string, destinationNodeId: string) {
        var argId = sourceNodeId,
            incArgIds: string[] = [],
            stack: string[] = [];

        while (argId) {
            incArgIds = Object.keys(this.branches[argId].inArgs);

            for (let ai = incArgIds.length, incArgId: string; ai--;) {
                incArgId = incArgIds[ai];

                if (incArgId === destinationNodeId) {
                    return true;
                }

                if ((this.branches[incArgId].nodeType & NodeType.AllValueEmitter) === 0) {
                    stack.push(incArgId);
                }
            }

            argId = stack.pop();
        }

        return false;
    }

    get finalExpressionForExport(): IFinalExpression {
        return {
            evaluationSource: EvaluationSource.Local,
            expression: this.finalExpression !== undefined ? this.finalExpression.exprToExport : undefined
        };
    }

    set onStateChanged(stateChangedListener: (state: IBranchesOfExpressionsState) => void) {
        this.stateChangedListener = stateChangedListener;
    }

    clear() {
        this.branches = {};
        this.stateChangedListener = null;
    }
}
