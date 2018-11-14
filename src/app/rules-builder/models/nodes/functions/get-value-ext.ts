import { utils } from "../../../utils/utils.service";
import dateUtility from "../utilities/date-utility";

class GetValueExtension {
    //---------------------- Logic conditions utility functions
    andLogicalCondition(arrayOfValue) {
        var inx = 0, len = arrayOfValue.length, hasUndef = false;

        while (inx < len) {
            //If Input gets at least one Boolean value which is FALSE then output provides FALSE value no matter other input values defined or not
            if (arrayOfValue[inx] === false) {
                return false;
            }
            //If Input gets at least one undefined value and no values equal to FALSE then output provides undefined value
            if (!hasUndef && arrayOfValue[inx] === undefined) {
                hasUndef = true;
            }

            inx++;
        }

        return inx > 1 && !hasUndef ? true : undefined;
    }

    orLogicalCondition(arrayOfValue) {
        var inx = 0, len = arrayOfValue.length, hasUndef = false;

        while (inx < len) {
            //If Input gets at least one Boolean value which is TRUE then output provides TRUE value no matter other input values defined or not
            if (arrayOfValue[inx] === true) {
                return true;
            }
            //If Input gets at least one undefined values and no values equal to TRUE then output provides undefined value
            if (!hasUndef && arrayOfValue[inx] === undefined) {
                hasUndef = true;
            }

            inx++;
        }

        return inx > 1 && !hasUndef ? false : undefined;
    }

    notLogicalCondition(value) {
        if (value === undefined) {
            return undefined;
        }

        return !value;
    }
    //---------------------- Comparison conditions utility functions
    ifThenElse(condition, thenValue, elseValue) {
        if (condition === true && thenValue !== undefined) {
            return thenValue;
        }

        if (condition === false && elseValue !== undefined) {
            return elseValue;
        }

        return undefined;
    }

    equalComparisonCondition(a, b, isDate: boolean) {
        //if both inputs get undefined value then output provides TRUE value
        if (a === undefined && b === undefined) {
            return true;
        }

        if (isDate && a && b) {
            return dateUtility.toMilliseconds(a) === dateUtility.toMilliseconds(b);
        }

        return a === b;
    }

    notEqualComparisonCondition(a, b, isDate: boolean) {
        //if both inputs get undefined value then output provides FALSE value
        if (a === undefined && b === undefined) {
            return false;
        }

        if (isDate && a && b) {
            return dateUtility.toMilliseconds(a) !== dateUtility.toMilliseconds(b);
        }

        return a !== b;
    }

    lessComparisonCondition(a, b, isDate: boolean) {
        if (a === undefined || b === undefined) {
            return undefined;
        }

        if (isDate) {
            return dateUtility.toMilliseconds(a) < dateUtility.toMilliseconds(b);
        }

        return a < b;
    }

    greaterComparisonCondition(a, b, isDate: boolean) {
        if (a === undefined || b === undefined) {
            return undefined;
        }

        if (isDate) {
            return dateUtility.toMilliseconds(a) > dateUtility.toMilliseconds(b);
        }

        return a > b;
    }

    lessOrEqualComparisonCondition(a, b, isDate: boolean) {
        if (a === undefined || b === undefined) {
            return undefined;
        }

        if (isDate) {
            return dateUtility.toMilliseconds(a) <= dateUtility.toMilliseconds(b);
        }

        return a <= b;
    }

    greaterOrEqualComparisonCondition(a, b, isDate: boolean) {
        if (a === undefined || b === undefined) {
            return undefined;
        }

        if (isDate) {
            return dateUtility.toMilliseconds(a) >= dateUtility.toMilliseconds(b);
        }

        return a >= b;
    }

    hasValueComparisonCondition(value) {
        return value !== undefined;
    }
    //---------------------- Math utility functions
    numericDaysBetween(a, b) {
        if (a === undefined || b === undefined) {
            return undefined;
        }

        var dtA = dateUtility.toMilliseconds(a),
            dtB = dateUtility.toMilliseconds(b);

        return Math.floor(dtB - dtA) / 86400000; //86400000 => 1000*60*60*24
    }

    numericSum(arrayOfValue) {
        var result = 0;

        for (let vi = arrayOfValue.length; vi--;) {
            if (arrayOfValue[vi] === undefined) {
                return undefined;
            }
            result += arrayOfValue[vi];
        }

        return utils.toFixedFloat(result);
    }

    numericDifference(a, b) {
        if (a === undefined || b === undefined) {
            return undefined;
        }

        return utils.toFixedFloat(a - b);
    }

    numericMultiplication(arrayOfValue) {
        var result = 1;

        for (let vi = arrayOfValue.length; vi--;) {
            if (arrayOfValue[vi] === undefined) {
                return undefined;
            }
            result *= arrayOfValue[vi];
        }

        return utils.toFixedFloat(result);
    }

    numericDivision(a, b) {
        if (a === undefined || b === undefined || b === 0) {
            return undefined;
        }

        return utils.toFixedFloat(a / b);
    }
}

export default new GetValueExtension();
