import Signal from "../../../states/signal";
import Canvas from "../../../models/layout/canvas";
import { SimpleNodeViewModel } from "../base/simple-node-view-model";
import { INodeDescriptor, IExpression, IMultiChoiceDropdownOption } from "../../../common-interfaces";
import { utils } from "../../../utils/utils.service";

export default class EqualsAll extends SimpleNodeViewModel {

    exprToShowEqualsClause: string;
    exprToExportJoinClause: string;

    options: IMultiChoiceDropdownOption[];
    optionsMap: { [indexer: string]: IMultiChoiceDropdownOption };

    prevCheckedFieldIds: string[];

    initEmitterFieldId: string;
    initCheckedFieldIds: string[];

    emitterFieldId: string;
    checkedFieldIds: string[];

    constructor(
        descriptor: INodeDescriptor,
        isViewModel: boolean) {
        super(descriptor, isViewModel, true, "CONFIG");

        this.exprToShowEqualsClause = "EqualsAll";
        this.exprToExportJoinClause = " and ";

        this.options = [];
        this.optionsMap = {};

        this.prevCheckedFieldIds = [];

        this.initSelfState();
    }

    initSelfState() {
        if (Array.isArray(this.value) && this.value.length) {
            let firstValue = this.value[0];

            if (typeof firstValue === "string") { //it's a multiChoice persisted state
                let fieldId = firstValue.split("@")[0];
                this.initEmitterFieldId = `${fieldId}@${fieldId}`;
                this.initCheckedFieldIds = this.value.slice();
                this.value = undefined; //don't need anymore for this type of configuration
            }
            else if (typeof firstValue === "number") { //used for backword compatibility with previous realization of EqualAny
                this.value = this.value.join(",");
            }
        }

        this.emitterFieldId = this.initEmitterFieldId || "na";
        this.checkedFieldIds = this.initCheckedFieldIds || [];
    }

    updateFor(newEmitterExpr: IExpression, canvas: Canvas) {
        if (newEmitterExpr.exprToShow === "?") { //this node input port was disconnected or it's an init signal
            this.options = []; //reset the options from the previously connected emitter or for a model init state
            this.optionsMap = {};
            this.emitterFieldId = "na";

            if (this.prevCheckedFieldIds.length) {
                this.prevCheckedFieldIds.forEach(prevCheckedFieldId => canvas.cache.unregisterField(prevCheckedFieldId));
                this.prevCheckedFieldIds = [];
            }
            return;
        }

        if (this.emitterFieldId === newEmitterExpr.fieldId) {
            return; //prevent the options reloading from the same options emitter (occur while the expr being debugging) 
        }

        this.emitterFieldId = newEmitterExpr.fieldId;
        this.checkedFieldIds = this.emitterFieldId === this.initEmitterFieldId ? this.initCheckedFieldIds.slice() : [];

        if (newEmitterExpr.options && newEmitterExpr.options.length) {
            this.options = utils.deepcopy(newEmitterExpr.options);
            this.options.forEach(opt => {
                this.optionsMap[opt.fieldId] = opt;
                opt.checked = this.checkedFieldIds.indexOf(opt.fieldId) !== -1;
            });
        }
    }

    getValue(args: any[]) {
        var emitterValue: string[] = args[0];
        
        if (!this.options.length || !this.checkedFieldIds.length) {
            return undefined;
        }

        if (emitterValue === undefined) {
            return false;
        }

        return this.checkedFieldIds.every(id => emitterValue.indexOf(id) >= 0);
    }

    getExpression(args: IExpression[], isMultiplyConnected: boolean, canvas: Canvas): IExpression {
        var emitterExpr = args[0],
            toShow: any[] = [], exprToShow: string,
            toExport: string[] = [], exprToExport: string,
            isEmpty = true;

        if (this.isViewModel) {
            this.updateFor(emitterExpr, canvas);
        }

        if (emitterExpr.exprToShow !== "?") {
            isEmpty = this.handleCheckedItems(emitterExpr.options, toShow, toExport, canvas);
        }

        exprToShow = `(${emitterExpr.exprToShow} ${this.exprToShowEqualsClause}[${isEmpty ? "?" : toShow.join(",")}])`;
        exprToExport = isEmpty ? "?" : `(${toExport.map(fieldName => `HasValue(${fieldName})`).join(this.exprToExportJoinClause)})`;

        return this.buildExpression(exprToShow, exprToExport);
    }

    private handleCheckedItems(emitterOptions: IMultiChoiceDropdownOption[], toShow: any[], toExport: string[], canvas: Canvas) {
        var checkedFieldIds = this.checkedFieldIds,
            checkedFieldId: string,
            prevCheckedFieldId: string,
            option: IMultiChoiceDropdownOption,
            isEmpty = true;

        if (Object.keys(this.optionsMap).length === 0) {
            this.optionsMap = {};

            for (let oi = emitterOptions.length; oi--;) {
                this.optionsMap[emitterOptions[oi].fieldId] = emitterOptions[oi];
            }
        }

        for (let inx = 0, len = checkedFieldIds.length; inx < len; inx++) {
            checkedFieldId = checkedFieldIds[inx];
            option = this.optionsMap[checkedFieldId];

            if (!option) continue;

            //var test = {};
            //test[checkedFieldId] = field;

            //console.log(JSON.stringify(test));
            //console.log("--------------------------------------");

            if (this.isViewModel) {
                toShow.push(option.value);
            }

            toExport.push(option.fieldName);
            isEmpty = false;

            if (this.prevCheckedFieldIds.indexOf(checkedFieldId) === -1) {
                canvas.cache.registerField(checkedFieldId, option.fieldName);
            }
        }

        for (let pfi = this.prevCheckedFieldIds.length; pfi--;) {
            prevCheckedFieldId = this.prevCheckedFieldIds[pfi];

            if (checkedFieldIds.indexOf(prevCheckedFieldId) === -1) {
                canvas.cache.unregisterField(prevCheckedFieldId);
            }
        }

        this.prevCheckedFieldIds = checkedFieldIds;

        return isEmpty;
    }

    getSignal(canvas: Canvas) {
        var emitterValue = this.inputStates.getValue("V"),
            emitterExpr = this.inputStates.getExpression("V");

        return Signal.create(this.getValue([emitterValue]), this.getExpression([emitterExpr], false, canvas));
    }

    getToSave() {
        return this.checkedFieldIds.length ? { "CONFIG": this.checkedFieldIds } : undefined;
    }
}