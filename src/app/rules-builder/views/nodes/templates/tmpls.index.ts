const emitter = require("./emitter-node.html");
const equalsAll = require("./equals-all-node.html");
const equalsAny = require("./equals-any-node.html");
const fieldSelector = require("./field-selector-node.html");
const func = require("./function-node.html");
const inRange = require("./in-range-node.html");
const innerSelector = require("./inner-selector-node.html");
const isDateInclude = require("./is-date-include-node.html");
const isMatch = require("./is-match-node.html");
const multiChoiceField = require("./multi-choice-field-node.html");
const resultingField = require("./resulting-field.html");
const today = require("./today-node.html");
const undefinedConstant = require("./undefined-constant.html");
const textJoin = require("./text-join-node.html");
const textFormat = require("./text-format-node.html");
const snapshotField = require("./snapshot-field.html");
const textResourceField = require("./text-resource-field.html");

export const tmplsIndex = {    
    emitter,    
    equalsAll,
    equalsAny,
    fieldSelector,
    "function": func,
    inRange,
    innerSelector,
    isDateInclude,
    isMatch,
    multiChoiceField,
    resultingField,    
    today,
    undefinedConstant,
    snapshotField,
    textJoin,
    textFormat,
    textResourceField
};