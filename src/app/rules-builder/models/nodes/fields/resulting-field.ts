import Signal from "../../../states/signal";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression } from "../../../common-interfaces";
import { DataType, NodeType } from "../../../common-enums";
import numToTextUtility from "../utilities/num-to-text-utility";
import commonUtils from "../utilities/common-utilities";

export default class ResultingField extends SimpleNodeViewModel {

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel);
    }

    getValue(args: any[]) {
        return args[0];
    }

    getExpression(args: IExpression[]): IExpression {
        var arg = args[0],
            exprToShow = arg.exprToShow,
            exprToExport = arg.exprToExport,
            thisNodeType = this.descriptor.nodeType;
        //the Core workaround below
        if (arg.isFromField) {// disclose the field name wrapped into the type specifier
            if (arg.dataType !== DataType.BooleanField) { // the Core workaround for Boolean Field should be preserved                
                exprToExport = commonUtils.extractFieldName(exprToExport);
            }
        }
        else if ((thisNodeType === NodeType.ResultingOutputField || thisNodeType === NodeType.ResultingIndexField)
            && exprToExport.indexOf("ExtFunc") === -1  //it isn't a remote calculation, CDRGlobal for example
            && (arg.dataType === DataType.Numeric || arg.dataType === DataType.NumericField)) {
            exprToExport = numToTextUtility.getExpression(exprToExport);
        }

        return this.buildExpression(exprToShow, exprToExport);
    }

    getSignal() {
        return Signal.createEmpty();
    }
}