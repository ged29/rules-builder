class GetExprToShowExtension {

    private getInParentheses(resultExpr): string {
        return `(${resultExpr})`;
    }

    private getExpressionFromArgs(
        inputArgs: IArguments,
        operationName: string): string {
        var arrayOfExpr = Array.prototype.slice.call(inputArgs, 0);

        if (!arrayOfExpr.length || arrayOfExpr.every(expr => expr === "?")) {
            return "?";
        }

        return this.getInParentheses(arrayOfExpr.join(` ${operationName} `));
    }

    //---------------------- Logic conditions utility functions
    andLogicalCondition(arrayOfExprValues) {
        return this.getExpressionFromArgs(arrayOfExprValues, "and");
    }

    orLogicalCondition(arrayOfExprValues) {
        return this.getExpressionFromArgs(arrayOfExprValues, "or");
    }

    notLogicalCondition(exprValue) {
        return `Not(${exprValue})`;
    }
    //---------------------- Comparison conditions utility functions
    ifThenElse(ifExprValue, thenExprValue, elseExprValue) {
        return `IF(${ifExprValue}, ${thenExprValue}, ${elseExprValue})`;
    }

    equalComparisonCondition(aExprValue, bExprValue) {
        return this.getExpressionFromArgs(arguments, "=");
    }

    notEqualComparisonCondition(aExprValue, bExprValue) {
        return this.getExpressionFromArgs(arguments, "<>");
    }

    lessComparisonCondition(aExprValue, bExprValue) {
        return this.getExpressionFromArgs(arguments, "<");
    }

    greaterComparisonCondition(aExprValue, bExprValue) {
        return this.getExpressionFromArgs(arguments, ">");
    }

    lessOrEqualComparisonCondition(aExprValue, bExprValue) {
        return this.getExpressionFromArgs(arguments, "<=");
    }

    greaterOrEqualComparisonCondition(aExprValue, bExprValue) {
        return this.getExpressionFromArgs(arguments, ">=");
    }

    hasValueComparisonCondition(exprValue) {
        //TODO: disclose possible appearence of NoneField
        return `HasValue(${exprValue})`;
    }    
    //---------------------- Math utility functions
    numericDaysBetween(aExprValue, bExprValue) {
        return `DaysBetween(${aExprValue}, ${bExprValue})`;
    }

    numericSum(arrayOfExprValues) {
        return this.getExpressionFromArgs(arrayOfExprValues, "+");
    }

    numericDifference(aExprValue, bExprValue) {
        return this.getExpressionFromArgs(arguments, "-");
    }

    numericMultiplication(arrayOfExprValues) {
        return this.getExpressionFromArgs(arrayOfExprValues, "*");
    }

    numericDivision(aExprValue, bExprValue) {
        return this.getExpressionFromArgs(arguments, "/");
    }
}

export default new GetExprToShowExtension();