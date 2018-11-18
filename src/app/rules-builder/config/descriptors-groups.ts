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
import { SelectorView } from "../views/nodes/selector.view";
import { EmitterView } from "../views/nodes/emitter.view";
import { FunctionView } from "../views/nodes/function.view";

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
            viewClass: FunctionView,
            template: tmplsIndex.resultingField,
            exportPriority: 0
        }]
    },
    "inputFields": {
        isToolboxGroup: false,
        isDebugPresent: false,
        typeOfNodesInGroup: NodeType.InputField,
        nodes: [
            {
                name: "dateField",
                modelCtor: Fields.Date,
                ports: {
                    output: [{ marker: "V", dataType: DataType.DateField }]
                },
                viewClass: EmitterView,
                template: tmplsIndex.emitter,
                exportPriority: 0
            },
            {
                name: "timeField",
                modelCtor: Fields.Time,
                ports: {
                    output: [{ marker: "V", dataType: DataType.NumericTimeField }]
                },
                viewClass: EmitterView,
                template: tmplsIndex.emitter,
                fieldLength: 5,
                exportPriority: 0
            },
            {
                name: "numericField",
                modelCtor: Fields.Numeric,
                ports: {
                    output: [{ marker: "V", dataType: DataType.NumericField }]
                },
                viewClass: EmitterView,
                template: tmplsIndex.emitter,
                fieldLength: 9,
                exportPriority: 0
            },
            {
                name: "textField",
                modelCtor: Fields.Text,
                ports: {
                    output: [{ marker: "V", dataType: DataType.TextField }]
                },
                viewClass: EmitterView,
                template: tmplsIndex.emitter,
                fieldLength: 300,
                exportPriority: 0
            },
            {
                name: "booleanField",
                modelCtor: Fields.None,
                ports: {
                    output: [{ marker: "V", dataType: DataType.BooleanField }]
                },
                viewClass: SelectorView,
                template: tmplsIndex.fieldSelector,
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
                viewClass: EmitterView,
                template: tmplsIndex.emitter,
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
                viewClass: EmitterView,
                template: tmplsIndex.emitter,
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
                viewClass: SelectorView,
                template: tmplsIndex.innerSelector,
                exportPriority: 0
            },
            {
                name: "dateConstant",
                caption: "Date",
                modelCtor: Constants.Date,
                ports: {
                    output: [{ marker: "V", dataType: DataType.Date }]
                },
                viewClass: EmitterView,
                template: tmplsIndex.emitter,
                fieldLength: 11,
                exportPriority: 0
            }]
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.inRange,
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
                viewClass: FunctionView,
                template: tmplsIndex.isMatch,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
                viewClass: FunctionView,
                template: tmplsIndex.function,
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
            viewClass: SelectorView,
            template: tmplsIndex.innerSelector,
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
            viewClass: SelectorView,
            template: tmplsIndex.innerSelector,
            exportPriority: 1
        }]
    }
};

export default descriptorsGroups;