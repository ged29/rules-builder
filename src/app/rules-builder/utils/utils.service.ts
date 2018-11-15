class Utils {

    //static $inject = ["Coordinate"];
    //constructor(private Coordinate) { }

    trim = (text) => {
        return text == null ?
            "" :
            (text + "").replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    };

    loadScript = (src, callback) => {
        var script = document.createElement("script");
        var loaded = false;
        script.setAttribute("src", src);
        if (callback) {
            script.onload = () => {
                if (!loaded) {
                    callback();
                }
                loaded = true;
            };
        }
        document.getElementsByTagName("head")[0].appendChild(script);
    };

    getInheritableProperty = (dict, name) => {
        while (dict && !dict.has(name)) {
            dict = dict.get("Parent");
        }
        if (!dict) {
            return null;
        }
        return dict.get(name);
    };

    prependToArray = (arr1, arr2) => {
        Array.prototype.unshift.apply(arr1, arr2);
    };

    appendToArray = (arr1, arr2) => {
        Array.prototype.push.apply(arr1, arr2);
    };

    sign = (num) => {
        return num < 0 ? -1 : 1;
    };

    unwrapRadians = radians => {
        return this.posMod(radians, Math.PI * 2);
    };

    proxyEvent = event => {
        event = event.originalEvent || event;
        event.stopImmediatePropagation();
        return event;
    };

    floatEquals = (valA, valB) => {
        return Math.abs(valA - valB) <= 0.0001;
    };

    isFloat = (number: number) => {
        return (number | 0) !== number;
    };

    getFloatFraction = (number: number) => {
        return this.toFixedFloat(number % 1, 2) * 10;
    };

    truncateFloatFraction = (number: number): number => {
        return number - (number % 1);
    };

    toFixedFloat = (number: number, fraction: number = 2) => {
        var n = 1;
        for (var inx = 0; inx < fraction; inx++) {
            n *= 10;
        }

        return this.isFloat(number) ? Math.round(number * n) / n : number;
    };

    posMod = (x, y) => {
        if (y === 0) {
            return x;
        }
        return x - y * Math.floor(x / y);
    };

    getSnappedCoordinate = (coordinate, snapDistance) => {
        return {
            x: Math.floor(coordinate.x / snapDistance) * snapDistance,
            y: Math.floor(coordinate.y / snapDistance) * snapDistance,
        };
    };

    // Convert from Degrees to Radians
    degreesToRadians = degrees => {
        return degrees * (Math.PI / 180);
    };

    // Convert from Radians to Degrees
    radiansToDegrees = radians => {
        return radians * (180 / Math.PI);
    };

    /**
        * Inherit the prototype methods from one constructor into another.
        *            
        * @param {Function} childCtor Child class.
        * @param {Function} parentCtor Parent class.
    */
    inherits = (childCtor, parentCtor) => {
        /** @constructor */
        var tmpCtor = () => { };
        tmpCtor.prototype = parentCtor.prototype;
        childCtor.uber = parentCtor.prototype;
        childCtor.prototype = new tmpCtor();
        childCtor.prototype.constructor = childCtor;
    };

    mix = (...args) => {
        var arg, prop, child = {};
        for (arg = 0; arg < args.length; arg += 1) {
            for (prop in args[arg]) {
                if (args[arg].hasOwnProperty(prop)) {
                    child[prop] = args[arg][prop];
                }
            }
        }
        return child;
    };

    isInBoundaryOfRect = (rect, x, y) => {
        return x >= rect.left
            && x <= rect.right
            && y >= rect.top
            && y <= rect.bottom;
    };

    getMillisecOfDateFromStandartFormedString = (dt: string): number => {
        if (!dt) {
            return undefined;
        }

        var dtParts = dt.toUpperCase().split("-"); //DD-MMM-YYYY input format

        return Date.UTC(
            parseInt(dtParts[2]),
            this.Constants.MonthsNumbers.indexOf(dtParts[1]),
            parseInt(dtParts[0]), 0, 0, 0, 0);
    };

    getDateInStandartFormedString = (dt: Date): string => {
        if (!dt) {
            return undefined;
        }

        var dd = dt.getDate().toString(),
            dd = dd.length === 1 ? `0${dd}` : dd,
            mmm = this.Constants.MonthsNumbers[dt.getMonth()],
            yyyy = dt.getFullYear();

        return `${dd}-${mmm}-${yyyy}`;
    };

    deepcopy<Tp>(tgt: Tp): Tp {
        let cp: Tp;

        if (tgt === null) {
            cp = tgt;
        }
        else if (tgt instanceof Date) {
            cp = new Date((tgt as any).getTime()) as any;
        }
        else if (Array.isArray(tgt)) {
            cp = [] as any;
            (tgt as any[]).forEach((v, i, arr) => { (cp as any).push(v); });
            cp = (cp as any).map((n: any) => this.deepcopy<any>(n));
        } 
        else if ((typeof (tgt) === 'object') && (tgt !== {})) {
            cp = { ...(tgt as Object) } as Tp;
            Object.keys(cp).forEach(k => {
                (cp as any)[k] = this.deepcopy<any>((cp as any)[k]);
            });
        } 
        else {
            cp = tgt;
        }
        return cp;
    }

    Constants = {
        MonthsNumbers: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
        Keys: {
            A: 65,
            B: 66,
            D: 68,
            C: 67,
            I: 73,
            V: 86,
            X: 88,
            INSERT: 45,
            DELETE: 46,
            BACKSPACE: 8,
            TAB: 9,
            ENTER: 13,
            ESC: 27,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            END: 35,
            HOME: 36,
            SPACEBAR: 32,
            PAGEUP: 33,
            PAGEDOWN: 34,
            //esc, end, home, left arrow, up arrow, right arrow, down arrow, delete, backspace, tab 
            CONTROL_KEYS_SET: [27, 35, 36, 37, 38, 39, 40, 46, 8, 9],
            //esc, end, home, left arrow, up arrow, right arrow, down arrow
            INPUTCNTR_KEYS_SET: [27, 35, 36, 37, 38, 39, 40]
        }
    };
}

export const utils = new Utils();