import { IExpression } from "../../../common-interfaces";
import commonUtils from "../utilities/common-utilities";

class GetExprToExportExtension {
    hasValueComparisonCondition(expr: IExpression) {
        return `HasValue(${commonUtils.extractFieldName(expr.exprToExport)})`;
    }
}

export default new GetExprToExportExtension();