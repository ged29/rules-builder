import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MainComponent } from './views/layout/main/main.component';
import { NodesToolboxComponent } from './views/layout/nodes-toolbox/nodes-toolbox.component';
import { ExprCanvasComponent } from './views/layout/expr-canvas/expr-canvas.component';
import { DndModule } from "ngx-drag-drop";

@NgModule({
    declarations: [MainComponent, NodesToolboxComponent, ExprCanvasComponent],
    imports: [BrowserModule, DndModule],
    providers: [],
    bootstrap: [MainComponent]
})
export class RulesBuilderModule { }