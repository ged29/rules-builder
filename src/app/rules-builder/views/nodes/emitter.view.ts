import { DataType } from "../../common-enums";
import { SimpleBaseView } from "./base/simple-base.view";
import { ElementRef } from "@angular/core";

export class EmitterView extends SimpleBaseView {
    isNumeric: boolean;

    constructor(elementRef: ElementRef<HTMLDivElement>) {
        super(elementRef.nativeElement);
        let dataTypeOfOutputPort = this.node.outputPort.dataType;
        this.isNumeric = dataTypeOfOutputPort === DataType.Numeric || dataTypeOfOutputPort === DataType.NumericField;
    }
}