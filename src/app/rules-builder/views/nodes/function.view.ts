import { SimpleBaseView } from "./base/simple-base.view";
import { ElementRef } from "@angular/core";

export class FunctionView extends SimpleBaseView {
    constructor(elementRef: ElementRef<HTMLDivElement>) {
        super(elementRef.nativeElement);
    }
}