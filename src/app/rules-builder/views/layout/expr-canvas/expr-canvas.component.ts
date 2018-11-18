import { Component, OnInit, ElementRef, OnDestroy, ViewContainerRef, ViewChild, ComponentFactoryResolver, Compiler, NgModule, ModuleWithComponentFactories } from '@angular/core';
import { IDroppableToolboxItem } from '../../../common-interfaces';
import Canvas from "../../../models/layout/canvas";
import { ICoordinate } from "../../../graphic-common-interfaces";
import nodesRegistry from "../../../nodes-registry";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'expr-canvas',
  templateUrl: './expr-canvas.component.html',
  styleUrls: ['./expr-canvas.component.less']
})
export class ExprCanvasComponent implements OnInit, OnDestroy {
  snapDistance = 10;

  canvas: Canvas;
  exprCanvasHost: HTMLDivElement;

  lasso: HTMLDivElement;
  phantomPort: HTMLDivElement;
  pasteContainerTemplate: HTMLDivElement;
  svgBaseConnectionsContainer: Element;

  @ViewChild('vc', { read: ViewContainerRef }) exprCanvas: ViewContainerRef;

  constructor(
    hostElementRef: ElementRef<HTMLDivElement>,
    private componentFactoryResolver: ComponentFactoryResolver,
    private compiler: Compiler) {
    this.exprCanvasHost = hostElementRef.nativeElement;
  }

  ngOnInit() {
    this.lasso = this.exprCanvasHost.querySelector("#lasso");
    this.phantomPort = this.exprCanvasHost.querySelector("#phantom-port");
    this.pasteContainerTemplate = this.exprCanvasHost.querySelector("#paste-container-template");
    this.svgBaseConnectionsContainer = this.exprCanvasHost.querySelector("#svg-base-connections-container");
  }

  onDrop(drop: TDrop) {
    let { event, data: toolboxNode } = drop,
      canvasCoordinate = this.fromDocumentToCanvasCoordinate({ x: event.clientX, y: event.clientY }, true),
      nodeDescriptor = nodesRegistry.getDescriptorByGroupAndName(toolboxNode.groupName, toolboxNode.name),
      modelCtor = nodeDescriptor.modelCtor,
      model = new modelCtor(nodeDescriptor, true),
      decoratedCmp = Component({
        template: nodeDescriptor.template,
        selector: nodeDescriptor.name,
      })(nodeDescriptor.viewClass);

      debugger;

      this.exprCanvas.createEmbeddedView()

    let factory = this.componentFactoryResolver.resolveComponentFactory(decoratedCmp);
    let ComponentRef = this.exprCanvas.createComponent(factory);
  }
  /**
     * Transforms a document coordinate to the Canvas coordinate.
     *
     * @param {ICoordinate} the x,y coordinate relative to the window
     *
     * @returns {ICoordinate} The coordinate in relation to the canvas [0,0] position
     */
  fromDocumentToCanvasCoordinate(coordinate: ICoordinate, shouldBeSnapped: boolean = false): ICoordinate {
    let x = Math.ceil(coordinate.x - this.getAbsoluteLeft() + this.getScrollLeft()),
      y = Math.ceil(coordinate.y - this.getAbsoluteTop() + this.getScrollTop());

    if (x < 0) x = 0;
    if (y < 0) y = 0;

    if (!shouldBeSnapped) {
      return { x: x, y: y };
    }

    return {
      x: x > 0 ? Math.floor(x / this.snapDistance) * this.snapDistance : 0,
      y: y > 0 ? Math.floor(y / this.snapDistance) * this.snapDistance : 0,
    };
  }
  /**
   * Returns the horizontal scroll position of an expr-canvas
   */
  getScrollLeft(): number {
    return this.exprCanvasHost.scrollLeft;
  }
  /**
   * Returns the vertical scroll position of an expr-canvas
   */
  getScrollTop(): number {
    return this.exprCanvasHost.scrollTop;
  }
  /**
   * Returns the left position of an element relative to the document
   */
  getAbsoluteLeft(): number {
    return this.getScrollLeft() + this.exprCanvasHost.getBoundingClientRect().left;
  }
  /**
   * Returns the top position of an element relative to the document
   */
  getAbsoluteTop(): number {
    return this.getScrollTop() + this.exprCanvasHost.getBoundingClientRect().top;
  }

  isPointInContainer(point: ICoordinate): boolean {
    let rect = this.exprCanvasHost.getBoundingClientRect();

    return rect.left < point.x && point.x < rect.right
      && rect.top < point.y && point.y < rect.bottom;
  }

  ngOnDestroy(): void {

  }

}

type TDrop = { event: DragEvent, isExternal: boolean, data: IDroppableToolboxItem, index: number, type: string }; 