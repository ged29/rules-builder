import commonUtils from "./common-utilities";
import { DateFormat } from "../../../common-enums";

class DateUtility {

    monthAbbrs = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    regexDateValueLightCheck = /^(\d{1,2}-)?(\w{3})-(\d{4})$/i;
    regexDateValueCloseCheck = /^((0?[1-9]|[12][0-9]|3[01])-(?=[A-Za-z]{3}))?((JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)-)?((19[0-9][0-9])|(2[0-1]00)|(20[0-9][0-9]))$/i;
    yearFrom = 1900;
    yearTo = 2100;

    split(dateString: string): ISplitDate {
        if (!dateString || dateString.length < 4) {
            return { length: 0 };
        }

        var comps = dateString.split("-"), result;

        if (comps.length === 2 && !isNaN(Number(comps[0]))) { // hack for the date without month -> DD-YYYYY
            comps[2] = comps[1];
            comps[1] = "Jan"; // here 29-2017 -> 29-JAN-2017
        }

        switch (comps.length) {
            case 3:
                result = {
                    date: parseInt(comps[0], 10),
                    month: comps[1],
                    year: parseInt(comps[2], 10)
                };
                break;

            case 2:
                result = {
                    month: comps[0],
                    year: parseInt(comps[1], 10)
                };
                break;

            case 1:
                result = {
                    year: parseInt(comps[0], 10)
                };
                break;
        }

        result.length = comps.length;

        return result;
    }

    getMonthNumberByAbbr(monthAbbr: string) {
        return this.monthAbbrs.indexOf(monthAbbr.toUpperCase()) + 1;
    }

    toMilliseconds(dateString: string) {
        var comps = this.split(dateString), month: number;

        if (comps.length === 2 || comps.length === 3) {
            month = this.getMonthNumberByAbbr(comps.month) - 1;;
        }

        switch (comps.length) {
            case 3:
                return Date.UTC(comps.year, month, comps.date, 0, 0, 0, 0);
            case 2:
                return Date.UTC(comps.year, month, 1, 0, 0, 0, 0);
            case 1:
                return Date.UTC(comps.year, 0, 1, 0, 0, 0, 0);
        }
    };

    /**
     * Returns a string representing the specified Date object in the given inFormat
     */
    getString(date: Date, inFormat: DateFormat = DateFormat.isDateInDDMMYYYY) {
        if (!date) {
            throw "The given date value is empty";
        }

        var mmm = this.monthAbbrs[date.getMonth()],
            yyyy = date.getFullYear();

        switch (inFormat) {
            case DateFormat.isDateInDDMMYYYY:
                let dayOfMonth = date.getDate(),
                    dd = dayOfMonth < 10 ? `0${dayOfMonth}` : dayOfMonth;

                return `${dd}-${mmm}-${yyyy}`;

            case DateFormat.isDateInMMYYYY:
                return `${mmm}-${yyyy}`;

            case DateFormat.isDateInYYYY:
                return `${yyyy}`;

            default: throw `Unexpected DateFormat ${inFormat}`;
        }
    }

    /**
     * Reformat the given string representing of Date object to another format
     */
    reFormat(dateString: string, toFormat: DateFormat) {
        var comps = this.split(dateString),
            compsLength = comps.length;

        if (toFormat === DateFormat.isDateInDDMMYYYY) {
            if (compsLength === 2) {
                return `01-${comps.month}-${comps.year}`;
            }
            if (compsLength === 1) {
                return `01-Jan-${comps.year}`;
            }
            return `${comps.date}-${comps.month}-${comps.year}`;  // hack for the date without month -> DD-YYYYY (21-2017 -> 21-Jan-2017)
        }

        if (toFormat === DateFormat.isDateInMMYYYY) {
            if (compsLength === 3) {
                return `${comps.month}-${comps.year}`;
            }
            if (compsLength === 1) {
                return `Jan-${comps.year}`;
            }
            return dateString;
        }

        if (toFormat === DateFormat.isDateInYYYY) {
            if (compsLength === 2 || compsLength === 3) {
                return `${comps.year}`;
            }

            return dateString;
        }

        throw `Unexpected DateFormat ${toFormat}`;
    }

    isYearValid(yearString: string) {
        var year = parseInt(yearString, 10);
        return !isNaN(year) && (year >= this.yearFrom && year <= this.yearTo);
    }

    isDateExactlyValid(dateString: string, byFormat: DateFormat) {
        //has dateString appropriate length?
        if (!dateString || ((len) => {
            switch (byFormat) { //21-oct-2011 11-10
                case DateFormat.isDateInDDMMYYYY: return len === 11 || len === 10;
                case DateFormat.isDateInMMYYYY: return len === 8;
                case DateFormat.isDateInYYYY: return len === 4;
                default: throw `Unexpected DateFormat ${byFormat}`;
            }
        })(dateString.length) === false) {
            return false;
        }

        if (byFormat === DateFormat.isDateInYYYY) {
            return this.isYearValid(dateString);
        }

        var match: RegExpMatchArray = dateString.match(this.regexDateValueLightCheck);
        if (!match || !this.isYearValid(match[3])) {
            return false;
        }

        var isValidDate,
            dd = parseInt(match[1] ? match[1].slice(0, -1) : "1", 10),
            mmm = this.monthAbbrs.indexOf(match[2].toUpperCase()),
            yyyy = parseInt(match[3], 10),
            date = new Date(yyyy, mmm, dd);

        return date.getDate() === dd && date.getMonth() === mmm && date.getFullYear() === yyyy;
    }

    isDatePartialyValid(dateString: string) {
        var splitDate = this.split(dateString);

        switch (splitDate.length) {
            case 3: return this.isDateExactlyValid(`${splitDate.date}-${splitDate.month}-${splitDate.year}`, DateFormat.isDateInDDMMYYYY);
            case 2: return this.isDateExactlyValid(dateString, DateFormat.isDateInMMYYYY);
            case 1: return this.isDateExactlyValid(dateString, DateFormat.isDateInYYYY);
            default: return false;
        };
    }

    getDateAsTextExpression(
        inExpr: string,
        byFormat: DateFormat,
        shouldDiscloseFieldName: boolean = true): string {
        var expr = shouldDiscloseFieldName ? commonUtils.extractFieldName(inExpr) : inExpr;
        return `DateAsText(${expr}, '${this.getRuntimeConvertionFormat(byFormat)}')`;
    }

    getRuntimeConvertionFormat(byFormat: DateFormat) {
        switch (byFormat) {
            case DateFormat.isDateInDDMMYYYY: return "dd-MMM-yyyy";
            case DateFormat.isDateInMMYYYY: return "MMM-yyyy";
            case DateFormat.isDateInYYYY: return "yyyy";
        }
    }

    getFormatString(byFormat: DateFormat) {

        switch (byFormat) {

            case DateFormat.isDateInDDMMYYYY:
                return "DD-MMM-YYYY";

            case DateFormat.isDateInMMYYYY:
                return "MMM-YYYY";

            case DateFormat.isDateInYYYY:
                return "YYYY";

            default: throw "Unexpected DateFormat";
        }
    }

    getValue(value: string, byDateFormat: DateFormat) {
        if (value === undefined) {
            return undefined;
        }

        return this.reFormat(value, byDateFormat);
    }
}

export default new DateUtility();

export interface ISplitDate {
    date?: number;
    month?: string;
    year?: number;
    length: number;
}