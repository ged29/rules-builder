// constants
import * as Constants from "./constants";
// fields
import * as Fields from "./fields";
// functions
import * as Functions from "./functions";
import SimpleFunction from "../models/nodes/functions/simple-function";

import { DataType, NodeType } from "../common-enums";
import { IDescriptorsGroup } from "../common-interfaces";
import { uuid } from "../../services/utils/uuid";
import { tmplsIndex } from "../views/nodes/templates/tmpls.index";
/**
 * Represents a dictionary of the logically grouped related NodeDescriptors configurations. 
 * It is a central storage of ExE configuration and it provides ExE as well as vForm Designer with the preconfigured metadata of fields and functions.
 */
let descriptorsGroups: { [groupName: string]: IDescriptorsGroup } = {
    "resultingFields": {
        isToolboxGroup: false,
        isDebugPresent: true,
        typeOfNodesInGroup: NodeType.PendingAssignment,
        nodes: [{
            id: uuid.empty,
            name: "resultingField",
            modelCtor: Fields.Resulting,
            ports: {
                input: [{ marker: "R", maxConnCount: 1, dataType: DataType.PendingAssignment }],
                output: [{ marker: "R", isHidden: true }]
            },
            templateId: tmplsIndex.resultingField,
            exportPriority: 0
        }]
    },
    "inputFields": {
        isToolboxGroup: false,
        isDebugPresent: false,
        typeOfNodesInGroup: NodeType.InputField,        
        nodes: [
            {
                name: "choiceField",
                modelCtor: Fields.SingleChoice,
                ports: {
                    output: [{ marker: "V", dataType: DataType.NumericField }]
                },
                templateId: tmplsIndex.fieldSelector,
                exportPriority: 0
            },
            {
                name: "multiChoiceField",
                modelCtor: Fields.MultiChoice,
                ports: {
                    output: [{ marker: "V", dataType: DataType.AggregatedField }]
                },
                templateId: tmplsIndex.multiChoiceField,
                exportPriority: 0
            },
            {
                name: "dateField",
                modelCtor: Fields.Date,
                ports: {
                    output: [{ marker: "V", dataType: DataType.DateField }]
                },
                templateId: tmplsIndex.emitter,
                exportPriority: 0
            },
            {
                name: "timeField",
                modelCtor: Fields.Time,
                ports: {
                    output: [{
                        marker: "V",
                        dataType: DataType.NumericTimeField,
                        isCompatibleBy: (check) => (check.dt & DataType.NumericTimeField) === DataType.NumericTimeField && check.nodeName !== "CDRGlobal"
                    }]
                },
                templateId: tmplsIndex.emitter,
                fieldLength: 5,
                exportPriority: 0
            },
            {
                name: "inputableField",
                modelCtor: Fields.Inputable,
                ports: {
                    output: [{ marker: "V", dataType: DataType.PendingAssignment }]
                },
                templateId: tmplsIndex.emitter,
                exportPriority: 0
            },
            {
                name: "numericField",
                modelCtor: Fields.Numeric,
                ports: {
                    output: [{ marker: "V", dataType: DataType.NumericField }]
                },
                templateId: tmplsIndex.emitter,
                fieldLength: 9,
                exportPriority: 0
            },
            {
                name: "textField",
                modelCtor: Fields.Text,
                ports: {
                    output: [{ marker: "V", dataType: DataType.TextField }]
                },
                templateId: tmplsIndex.emitter,
                fieldLength: 300,
                exportPriority: 0
            },
            {
                name: "noneField",
                modelCtor: Fields.None,
                ports: {
                    output: [{ marker: "V", dataType: DataType.BooleanField }]
                },
                templateId: tmplsIndex.fieldSelector,
                exportPriority: 0
            },
            {
                name: "textResourceField",
                modelCtor: Fields.TextResource,
                ports: {
                    output: [{ marker: "V", dataType: DataType.TextResourceField }]
                },
                templateId: tmplsIndex.textResourceField,
                exportPriority: 0
            },
            {
                name: "queryField",
                modelCtor: Fields.Query,
                ports: {
                    output: [{ marker: "V", dataType: DataType.BooleanField }]
                },
                templateId: tmplsIndex.innerSelector,
                exportPriority: 0
            }]
    },
    "outputFields": {
        isToolboxGroup: false,
        isDebugPresent: false,
        typeOfNodesInGroup: NodeType.OutputField,
        nodes: [
            {
                name: "outputField",
                modelCtor: Fields.Numeric,
                fieldLength: 9,
                ports: {
                    output: [{ marker: "V", dataType: DataType.NumericField }]
                },
                templateId: tmplsIndex.emitter,
                exportPriority: 0
            },
            {
                name: "snapshotField",
                modelCtor: Fields.Snapshot,
                ports: {
                    input: [{ marker: "I", maxConnCount: 1, dataType: DataType.NumericField }],
                    output: [{ marker: "V", dataType: DataType.NumericField }]
                },
                templateId: tmplsIndex.snapshotField,
                exportPriority: 0
            }]
    },
    "constants": {
        isToolboxGroup: true,
        isDebugPresent: false,
        typeOfNodesInGroup: NodeType.Constant,
        caption: "Constants",
        nodes: [
            {
                name: "numericConstant",
                caption: "Numeric",
                modelCtor: Constants.Numeric,
                ports: {
                    output: [{ marker: "V", dataType: DataType.Numeric }]
                },
                templateId: tmplsIndex.emitter,
                fieldLength: 9,
                exportPriority: 0
            },
            {
                name: "textConstant",
                caption: "Text",
                modelCtor: Constants.Text,
                ports: {
                    output: [{ marker: "V", dataType: DataType.Text }]
                },
                templateId: tmplsIndex.emitter,
                fieldLength: 20,
                exportPriority: 0
            },
            {
                name: "booleanConstant",
                caption: "Boolean",
                modelCtor: Constants.Boolean,
                ports: {
                    output: [{ marker: "V", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.innerSelector,
                exportPriority: 0
            },          
            {
                name: "dateConstant",
                caption: "Date",
                modelCtor: Constants.Date,
                ports: {
                    output: [{ marker: "V", dataType: DataType.Date }]
                },
                templateId: tmplsIndex.emitter,
                fieldLength: 11,
                exportPriority: 0
            },
            {
                name: "undefinedNumericConstant",
                caption: "Undefined (Numeric)",
                modelCtor: Constants.UndefinedNumeric,
                ports: {
                    output: [{ marker: "V", dataType: DataType.Numeric }]
                },
                templateId: tmplsIndex.undefinedConstant,
                exportPriority: 0
            }]
    },
    "aggregatedConditions": {
        isToolboxGroup: true,
        isDebugPresent: true,
        typeOfNodesInGroup: NodeType.SimpleFunction,
        caption: "Aggregated Conditions",
        nodes: [
            {
                name: "countOfSelected",
                caption: "CountOfSelected",
                modelCtor: Functions.CountOfSelected,
                ports: {
                    input: [{ marker: "V", maxConnCount: 1, dataType: DataType.AggregatedField }],
                    output: [{ marker: "R", dataType: DataType.Numeric }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2,
                isHidden: false
            },
            {
                name: "countOfUnselected",
                caption: "CountOfUnselected",
                modelCtor: Functions.CountOfUnselected,
                ports: {
                    input: [{ marker: "V", maxConnCount: 1, dataType: DataType.AggregatedField }],
                    output: [{ marker: "R", dataType: DataType.Numeric }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2,
                isHidden: true
            },
            {
                name: "itemsCount",
                caption: "ItemsCount",
                modelCtor: Functions.ItemsCount,
                ports: {
                    input: [{ marker: "V", maxConnCount: 1, dataType: DataType.AggregatedField }],
                    output: [{ marker: "R", dataType: DataType.Numeric }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2,
                isHidden: true
            }
        ]
    },
    "logicConditions": {
        isToolboxGroup: true,
        isDebugPresent: true,
        typeOfNodesInGroup: NodeType.SimpleFunction,
        caption: "Logic conditions",
        nodes: [
            {
                name: "andLogicalCondition",
                caption: "AND",
                modelCtor: SimpleFunction,
                ports: {
                    input: [{ marker: "V", dataType: DataType.Boolean }],
                    output: [{ marker: "R", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            },
            {
                name: "orLogicalCondition",
                caption: "OR",
                modelCtor: SimpleFunction,
                ports: {
                    input: [{ marker: "V", dataType: DataType.Boolean }],
                    output: [{ marker: "R", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            },
            {
                name: "notLogicalCondition",
                caption: "NOT",
                modelCtor: SimpleFunction,
                ports: {
                    input: [{ marker: "V", maxConnCount: 1, dataType: DataType.Boolean }],
                    output: [{ marker: "R", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            }]
    },
    "comparisonConditions": {
        isToolboxGroup: true,
        isDebugPresent: true,
        typeOfNodesInGroup: NodeType.SimpleFunction,
        caption: "Comparison conditions",
        nodes: [
            {
                name: "equalsAllComparisonCondition",
                caption: "EqualsAll",
                modelCtor: Functions.EqualsAll,
                ports: {
                    input: [{ marker: "V", maxConnCount: 1, dataType: DataType.AggregatedField }],
                    output: [{ marker: "R", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.equalsAll,
                exportPriority: 1
            },
            {
                name: "equalsAnyComparisonCondition",
                caption: "EqualsAny",
                modelCtor: Functions.EqualsAny,
                ports: {
                    input: [{ marker: "V", maxConnCount: 1, dataType: DataType.NumericField | DataType.AggregatedField }],
                    output: [{ marker: "R", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.equalsAny,
                fieldLength: 100,
                exportPriority: 1
            },
            {
                name: "ifThenElse",
                caption: "If A then B else C",
                toolboxCaption: "IfThenElse",
                exprAlias: "IfThenElse",
                modelCtor: SimpleFunction,
                ports: {
                    input: [
                        { marker: "A", maxConnCount: 1, dataType: DataType.Boolean },
                        { marker: "B", maxConnCount: 1, dataType: DataType.All },
                        { marker: "C", maxConnCount: 1, dataType: DataType.All }],
                    output: [{ marker: "R", dataType: DataType.All }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            },
            {
                name: "equalComparisonCondition",
                caption: "A = B",
                toolboxCaption: "Equal",
                modelCtor: SimpleFunction,
                ports: {
                    input: [
                        { marker: "A", maxConnCount: 1, dataType: DataType.All },
                        { marker: "B", maxConnCount: 1, dataType: DataType.All }],
                    output: [{ marker: "R", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            },
            {
                name: "notEqualComparisonCondition",
                caption: "A < > B",
                toolboxCaption: "NotEqual",
                modelCtor: SimpleFunction,
                ports: {
                    input: [
                        { marker: "A", maxConnCount: 1, dataType: DataType.All },
                        { marker: "B", maxConnCount: 1, dataType: DataType.All }],
                    output: [{ marker: "R", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            },
            {
                name: "lessComparisonCondition",
                caption: "A < B",
                toolboxCaption: "LessThan",
                modelCtor: SimpleFunction,
                ports: {
                    input: [
                        { marker: "A", maxConnCount: 1, dataType: DataType.NumericDateTimeField },
                        { marker: "B", maxConnCount: 1, dataType: DataType.NumericDateTimeField }],
                    output: [{ marker: "R", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            },
            {
                name: "greaterComparisonCondition",
                caption: "A > B",
                toolboxCaption: "GreaterThan",
                modelCtor: SimpleFunction,
                ports: {
                    input: [
                        { marker: "A", maxConnCount: 1, dataType: DataType.NumericDateTimeField },
                        { marker: "B", maxConnCount: 1, dataType: DataType.NumericDateTimeField }],
                    output: [{ marker: "R", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            },
            {
                name: "lessOrEqualComparisonCondition",
                caption: "A <= B",
                toolboxCaption: "LessOrEqual",
                modelCtor: SimpleFunction,
                ports: {
                    input: [
                        { marker: "A", maxConnCount: 1, dataType: DataType.NumericDateTimeField },
                        { marker: "B", maxConnCount: 1, dataType: DataType.NumericDateTimeField }],
                    output: [{ marker: "R", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            },
            {
                name: "greaterOrEqualComparisonCondition",
                caption: "A >= B",
                toolboxCaption: "GreaterOrEqual",
                modelCtor: SimpleFunction,
                ports: {
                    input: [
                        { marker: "A", maxConnCount: 1, dataType: DataType.NumericDateTimeField },
                        { marker: "B", maxConnCount: 1, dataType: DataType.NumericDateTimeField }],
                    output: [{ marker: "R", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            },
            {
                name: "hasValueComparisonCondition",
                caption: "HasValue",
                modelCtor: SimpleFunction,
                ports: {
                    input: [{
                        marker: "V",
                        maxConnCount: 1,
                        isCompatibleBy: (check) => ["snapshotField", "textResourceField", "queryField"].indexOf(check.nodeName) === -1
                            && (check.dt & DataType.Field) === DataType.Field
                    }],
                    output: [{ marker: "R", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            },
            {
                name: "inRangeComparisonCondition",
                caption: "InRange",
                modelCtor: Functions.InRange,
                ports: {
                    input: [{ marker: "V", maxConnCount: 1, dataType: DataType.Numeric }],
                    output: [{ marker: "R", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.inRange,
                fieldLength: 9,
                exportPriority: 1
            },
            {
                name: "isMatchComparisonCondition",
                caption: "IsMatch",
                modelCtor: Functions.IsMatch,
                ports: {
                    input: [{ marker: "V", maxConnCount: 1, dataType: DataType.Text }],
                    output: [{ marker: "R", dataType: DataType.Boolean }]
                },
                templateId: tmplsIndex.isMatch,
                fieldLength: 500,
                exportPriority: 1
            }]
    },
    "math": {
        isToolboxGroup: true,
        isDebugPresent: true,
        typeOfNodesInGroup: NodeType.SimpleFunction,
        caption: "Math",
        nodes: [
            {
                name: "numericDaysBetween",
                caption: "DaysBetween",
                modelCtor: SimpleFunction,
                ports: {
                    input: [
                        { marker: "A", maxConnCount: 1, dataType: DataType.Date },
                        { marker: "B", maxConnCount: 1, dataType: DataType.Date }],
                    output: [{ marker: "R", dataType: DataType.Numeric }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            },
            {
                name: "numericSum",
                caption: "Sum",
                modelCtor: SimpleFunction,
                ports: {
                    input: [{ marker: "V", dataType: DataType.Numeric }],
                    output: [{ marker: "R", dataType: DataType.Numeric }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            },
            {
                name: "numericDifference",
                caption: "A - B",
                toolboxCaption: "Difference",
                modelCtor: SimpleFunction,
                ports: {
                    input: [
                        { marker: "A", maxConnCount: 1, dataType: DataType.Numeric },
                        { marker: "B", maxConnCount: 1, dataType: DataType.Numeric }],
                    output: [{ marker: "R", dataType: DataType.Numeric }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            },
            {
                name: "numericMultiplication",
                caption: "Multiply",
                toolboxCaption: "Multiplication",
                modelCtor: SimpleFunction,
                ports: {
                    input: [{ marker: "V", dataType: DataType.Numeric }],
                    output: [{ marker: "R", dataType: DataType.Numeric }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            },
            {
                name: "numericDivision",
                caption: "A / B",
                toolboxCaption: "Division",
                modelCtor: SimpleFunction,
                ports: {
                    input: [
                        { marker: "A", maxConnCount: 1, dataType: DataType.Numeric },
                        { marker: "B", maxConnCount: 1, dataType: DataType.Numeric }],
                    output: [{ marker: "R", dataType: DataType.Numeric }]
                },
                templateId: tmplsIndex.function,
                exportPriority: 2
            }]
    },
    "formatting": {
        isToolboxGroup: true,
        isDebugPresent: true,
        typeOfNodesInGroup: NodeType.ChoiceFunction,
        caption: "Formatting",
        nodes: [{
            name: "numToText",
            caption: "NumToText",
            modelCtor: Functions.NumToText,
            ports: {
                input: [{ marker: "V", maxConnCount: 1, dataType: DataType.Numeric }],
                output: [{ marker: "V", maxConnCount: 1, dataType: DataType.Text }]
            },
            templateId: tmplsIndex.innerSelector,
            exportPriority: 1
        },
        {
            name: "dateToText",
            caption: "DateToText",
            modelCtor: Functions.DateToText,
            ports: {
                input: [{ marker: "V", maxConnCount: 1, dataType: DataType.Date }],
                output: [{ marker: "V", maxConnCount: 1, dataType: DataType.Text }]
            },
            templateId: tmplsIndex.innerSelector,
            exportPriority: 1
        },
        {
            name: "textJoin",
            caption: "Text Join",
            modelCtor: Functions.TextJoin,
            nodeType: NodeType.DynamicPortsFunction,
            ports: {
                input: [
                    { marker: "1", maxConnCount: 1, dataType: DataType.TextField },
                    { marker: "2", maxConnCount: 1, dataType: DataType.TextField }],
                output: [{ marker: "R", dataType: DataType.Text }]
            },
            templateId: tmplsIndex.textJoin,
            fieldLength: 1,
            exportPriority: 1
        },
        {
            name: "textFormat",
            caption: "Text Format",
            modelCtor: Functions.TextFormat,
            nodeType: NodeType.DynamicPortsFunction,
            ports: {
                input: [{ marker: "T", maxConnCount: 1, dataType: DataType.TextResourceField, isDataTypeExactMatch: true }],
                output: [{ marker: "R", dataType: DataType.Text }]
            },
            templateId: tmplsIndex.textFormat,
            exportPriority: 1
        }]
    },
    "dateFunctions": {
        isToolboxGroup: true,
        isDebugPresent: true,
        typeOfNodesInGroup: NodeType.SimpleFunction,
        caption: "Date functions",
        nodes: [{
            name: "isDateInclude",
            caption: "IsDateInclude",
            modelCtor: Functions.IsDateInclude,
            ports: {
                input: [{ marker: "V", maxConnCount: 1, dataType: DataType.DateField, isDataTypeExactMatch: true }],
                output: [{ marker: "R", dataType: DataType.Boolean }]
            },
            templateId: tmplsIndex.isDateInclude,
            exportPriority: 1
        },
        {
            name: "getDay",
            caption: "GetDay",
            modelCtor: Functions.GetDay,
            ports: {
                input: [{ marker: "V", maxConnCount: 1, dataType: DataType.DateField, isDataTypeExactMatch: true }],
                output: [{ marker: "R", dataType: DataType.Numeric }]
            },
            templateId: tmplsIndex.function,
            exportPriority: 1
        },
        {
            name: "getMonth",
            caption: "GetMonth",
            modelCtor: Functions.GetMonth,
            ports: {
                input: [{ marker: "V", maxConnCount: 1, dataType: DataType.DateField, isDataTypeExactMatch: true }],
                output: [{ marker: "R", dataType: DataType.Numeric }]
            },
            templateId: tmplsIndex.function,
            exportPriority: 1
        },
        {
            name: "getYear",
            caption: "GetYear",
            modelCtor: Functions.GetYear,
            ports: {
                input: [{ marker: "V", maxConnCount: 1, dataType: DataType.DateField, isDataTypeExactMatch: true }],
                output: [{ marker: "R", dataType: DataType.Numeric }]
            },
            templateId: tmplsIndex.function,
            exportPriority: 1
        }]
    }
};

export default descriptorsGroups;