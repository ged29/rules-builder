export enum FormattingType {
    AsItIs = 0,     //give input value without any changes (e.g. '1.789' -> '1.789')
    AsInteger = 1,  //"as integer" - give only integer part (e.g. '1.789' -> '1')
    AsNumberWOneDecimalPlaces = 2,  //round to integer part and one decimal digit (e.g. '1.789' -> '1.8')
    AsNumberWTwoDecimalPlaces = 3, //round to integer part and two decimal digits (e.g. '1.789' -> '1.79')
    AsPercentage = 4,   //number multiplied by 100, round to integer part and two decimal digits, 
    //and displayed with a percent symbol (e.g. '0.789' -> '78.9 %')    
}

class NumToTextUtility {

    getExpression(
        inExpr: string,
        byFormattingType: FormattingType = FormattingType.AsItIs) {

        switch (byFormattingType) {
            //give input value without any changes (e.g. '1.789' -> '1.789')
            case FormattingType.AsItIs:
                return `NumToText(${inExpr}, 'G')`;

            //"as integer" - give only integer part (e.g. '1.789' -> '2')
            case FormattingType.AsInteger:
                return `NumToText(${inExpr}, 'F0')`;

            //round to integer part and one decimal digit (e.g. '1.789' -> '1.8')
            case FormattingType.AsNumberWOneDecimalPlaces:
                return `NumToText(${inExpr}, 'F1')`;

            //round to integer part and two decimal digits (e.g. '1.789' -> '1.79')
            case FormattingType.AsNumberWTwoDecimalPlaces:
                return `NumToText(${inExpr}, 'F2')`;

            //number multiplied by 100, round to integer part and two decimal digits,
            case FormattingType.AsPercentage:
                return `NumToText(${inExpr}, 'P')`;

            default: throw `Unexpected FormattingType ${byFormattingType}`;
        }
    }

    getValue(
        value: number,
        byFormattingType: FormattingType = FormattingType.AsItIs) {

        if (value === undefined) {
            return undefined;
        }

        switch (byFormattingType) {
            //give input value without any changes (e.g. '1.789' -> '1.789')
            case FormattingType.AsItIs:
                return `'${value.toString()}'`;

            //"as integer" - give only integer part (e.g. '1.789' -> '2')
            case FormattingType.AsInteger:
                return `'${value.toFixed()}'`;

            //round to integer part and one decimal digit (e.g. '1.789' -> '1.8')
            case FormattingType.AsNumberWOneDecimalPlaces:
                return `'${value.toFixed(1)}'`;

            //round to integer part and two decimal digits (e.g. '1.789' -> '1.79')
            case FormattingType.AsNumberWTwoDecimalPlaces:
                return `'${value.toFixed(2)}'`;

            //number multiplied by 100, round to integer part and two decimal digits,
            case FormattingType.AsPercentage:
                return `'${(value * 100).toFixed(2)}%'`;

            default: throw `Unexpected FormattingType ${byFormattingType}`;
        }
    }

    getOption(byFormattingType: FormattingType) {
        switch (byFormattingType) {
            //give input value without any changes (e.g. '1.789' -> '1.789')
            case FormattingType.AsItIs:
                return "None";

            //"as integer" - give only integer part (e.g. '1.789' -> '2')
            case FormattingType.AsInteger:
                return "Integer";

            //round to integer part and one decimal digit (e.g. '1.789' -> '1.8')
            case FormattingType.AsNumberWOneDecimalPlaces:
                return "#.#";

            //round to integer part and two decimal digits (e.g. '1.789' -> '1.79')
            case FormattingType.AsNumberWTwoDecimalPlaces:
                return "#.##";

            //number multiplied by 100, round to integer part and two decimal digits,
            case FormattingType.AsPercentage:
                return "x100%";

            default: throw "Unexpected FormattingType";
        }
    }
}


export default new NumToTextUtility();