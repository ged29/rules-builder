import dateUtility from "../utilities/date-utility";
import { DateFormat } from "../../../common-enums";

export enum ValidatorNames {
    required, decimalNumber, positiveDecimalNumber, integerNumber, regexDefinition,
    dateInYYYY, dateInMMYYYY, dateInDDMMYYYY, datePartialyValid,
    time, numericSet, numericSetValuesDuplication
}
// all available checks
let validators = {
    // checks for non-empty values
    required: {
        isValid: function (value) {
            return (value !== undefined && value.length !== 0);
        },
        validityKey: "required",
        instruction: "BehaviorDesigner.ValidationMessages.IsRequiredViolation"
    },
    // checks if a value is a decimal number
    decimalNumber: {
        config: {
            numericRegex: /^[-]{0,1}(([1-9][0-9]*)|(0))([.][0-9]*[1-9])?$/
        },
        isValid: function (value) {
            return this.config.numericRegex.test(value) && value !== "-0";
        },
        validityKey: "pattern",
        instruction: "BehaviorDesigner.ValidationMessages.IsNumberViolation"
    },
    // checks if a value is a positive decimal number
    positiveDecimalNumber: {
        config: {
            positiveNumericRegex: /^(([1-9][0-9]*)|(0))([.][0-9]*[1-9])?$/
        },
        isValid: function (value) {
            return this.config.positiveNumericRegex.test(value);
        },
        validityKey: "pattern",
        instruction: "BehaviorDesigner.ValidationMessages.IsPositiveDecimalNumber"
    },
    // checks if a value is a integer number
    integerNumber: {
        config: {
            integerNumberRegex: /^(([1-9][0-9]*)|(0))$/
        },
        isValid: function (value) {
            return this.config.integerNumberRegex.test(value) && value !== "-0";
        },
        validityKey: "pattern",
        instruction: "BehaviorDesigner.ValidationMessages.IsIntegerNumberViolation"
    },
    // checks if value to be the correct regex definition
    regexDefinition: {
        isValid: function (regexDefinitionString) {
            var test;

            try {
                test = new RegExp(regexDefinitionString);
                return true;
            } catch (e) {
                return false;
            }
        },
        validityKey: "isRegexDefinition",
        instruction: "BehaviorDesigner.ValidationMessages.IsRegexDefinitionViolation"
    },
    // checks if a given date value is fit to YYYY format exactly
    dateInYYYY: {
        isValid: function (value: string) {
            return dateUtility.isDateExactlyValid(value, DateFormat.isDateInYYYY);
        },
        validityKey: "dateInYYYY",
        instruction: "BehaviorDesigner.ValidationMessages.isDateInYYYYViolation"
    },
    // checks if a given date value is fit to MMM-YYYY format exactly
    dateInMMYYYY: {
        isValid: function (value: string) {
            return dateUtility.isDateExactlyValid(value, DateFormat.isDateInMMYYYY);
        },
        validityKey: "dateInMMYYYY",
        instruction: "BehaviorDesigner.ValidationMessages.isDateInMMYYYYViolation"
    },
    // checks if a given date value is fit to DD-MMM-YYYY format exactly
    dateInDDMMYYYY: {
        isValid: function (value: string) {
            return dateUtility.isDateExactlyValid(value, DateFormat.isDateInDDMMYYYY);
        },
        validityKey: "dateInDDMMYYYY",
        instruction: "BehaviorDesigner.ValidationMessages.isDateInDDMMYYYYViolation"
    },
    datePartialyValid: {
        isValid: function (value: string) {
            return dateUtility.isDatePartialyValid(value);
        },
        validityKey: "datePartialyValid",
        instruction: "BehaviorDesigner.ValidationMessages.dateInArbitraryFormat"
    },
    // checks if a given date value is valid time
    time: {
        config: {
            timeRegex: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
        },
        isValid: function (value) {
            if (value.length != 5) { //expect at least 5 characters (22:13)
                return false;
            }
            return this.config.timeRegex.test(value);
        },
        validityKey: "pattern",
        instruction: "BehaviorDesigner.ValidationMessages.IsTimeViolation"
    },
    // checks if value to be the correct numeric set
    numericSet: {
        isValid: function (value: string) {
            var numberValidator = validators.decimalNumber,
                isNumberValid = numberValidator.isValid.bind(numberValidator),
                hasInvalidItem = value.split(",").some(v => !isNumberValid(v.trim()));

            return !hasInvalidItem;
        },
        validityKey: "isNumericSet",
        instruction: "BehaviorDesigner.ValidationMessages.IsNumericSetViolation"
    },
    // checks the given numeric set for the duplication
    numericSetValuesDuplication: {
        isValid: function (value: string) {
            var arr = value.split(",").map(v => v.trim()).sort();

            for (let ai = 0, len = arr.length; ai < len - 1; ai++) {
                if (arr[ai] === arr[ai + 1]) {
                    return false;
                }
            }

            return true;
        },
        validityKey: "isNumericSetValuesDuplication",
        instruction: "BehaviorDesigner.ValidationMessages.isNumericSetValuesDuplicationViolation"
    }
};

interface IValidator {
    isValid: (...params: any[]) => boolean;
    validityKey: string;
    instruction: string;
    config?: any;
}

export default validators;