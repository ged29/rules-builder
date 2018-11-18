import { SimpleBaseView } from "./base/simple-base.view";
import { ElementRef } from "@angular/core";

export class SelectorView extends SimpleBaseView {
    isNumeric: boolean;

    constructor(elementRef: ElementRef<HTMLDivElement>) {
        super(elementRef.nativeElement);
    }

    onChanged(optionId) {
        (this.viewModel as any).selectedOptionId = optionId;
        this.emitSignal();
    }
}