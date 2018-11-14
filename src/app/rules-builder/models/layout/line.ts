import { IBBox, ICoordinate, ILineDescriptor, IGeometryItem } from "../../graphic-common-interfaces";

export default class Line implements IGeometryItem {

    id: string;
    group: SVGGElement;
    start: ICoordinate;
    end: ICoordinate;
    prevBBox: IBBox;

    constructor(lineDescriptor?: ILineDescriptor) {
        this.start = { x: 0, y: 0 };
        this.end = { x: 0, y: 0 };

        if (lineDescriptor) {
            this.build(lineDescriptor);
        }
    }

    build(lineDescriptor: ILineDescriptor) {
        this.id = lineDescriptor.id;
        this.group = this.getGroupTemplate();
        this.group.setAttribute("id", this.id);
        this.setBoundaries(lineDescriptor);

        if (lineDescriptor.svgContainer) {
            lineDescriptor.svgContainer.append(this.group);
            this.saveBBox();
        }
    }

    private getGroupTemplate() {
        var groupTmpl = <SVGGElement>document.createElementNS("http://www.w3.org/2000/svg", "g");
        groupTmpl.setAttribute("class", "connection-group");
        groupTmpl.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "line")).setAttribute("class", "connection");
        groupTmpl.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "line")).setAttribute("class", "connection-underlayer");

        return groupTmpl;
    }

    private setPoint(x: string, y: string, inx: string) {
        this.group.children[0].setAttribute(`x${inx}`, x);
        this.group.children[0].setAttribute(`y${inx}`, y);
        this.group.children[1].setAttribute(`x${inx}`, x);
        this.group.children[1].setAttribute(`y${inx}`, y);
    }

    setStartPoint(x: number, y: number) {
        if ((x === 0 && y === 0) || (x === this.start.x && y === this.start.y)) {
            return this;
        }

        this.start.x = x;
        this.start.y = y;
        this.setPoint(x.toString(), y.toString(), "1");

        return this;
    }

    setEndPoint(x: number, y: number) {
        if ((x === 0 && y === 0) || (x === this.end.x && y === this.end.y)) {
            return this;
        }

        this.end.x = x;
        this.end.y = y;
        this.setPoint(x.toString(), y.toString(), "2");

        return this;
    }

    setBoundaries(lineDescriptor: ILineDescriptor) {
        var startPoint: ICoordinate = lineDescriptor.start,
            endPoint: ICoordinate = lineDescriptor.end;

        this.setStartPoint(startPoint.x, startPoint.y);
        this.setEndPoint(endPoint.x, endPoint.y);

        return this;
    }

    static wrap(extGroup: SVGGElement) {
        let line = new Line();
        line.group = extGroup;

        return line;
    }

    /******************************************** CSS **************************************************/
    hasClass(className) {
        return (this.group.children[0] as Element).classList.contains(className);
    }

    addClass(className) {
        if (!this.hasClass(className)) {
            (this.group.children[0] as Element).classList.add(className);
        }

        return this;
    }

    removeClass(className) {
        if (this.hasClass(className)) {
            (this.group.children[0] as Element).classList.remove(className);
        }

        return this;
    }

    toggleClass(className) {
        return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
    }

    show() {
        this.group.style.display = "inline";
        return this;
    }

    hide() {
        this.group.style.display = "none";
        return this;
    }

    /************************************** IGeometryItem **********************************************/
    saveBBox() {
        return this.prevBBox = this.getBBox();
    }

    getBBox(): IBBox {
        var { x: x1, y: y1 } = this.start,
            { x: x2, y: y2 } = this.end;

        return {
            minX: Math.min(x1, x2),
            minY: Math.min(y1, y2),
            maxX: Math.max(x1, x2),
            maxY: Math.max(y1, y2)
        };
    }

    isIntersectedWith(bbox: IBBox) {
        var { x: x1, y: y1 } = this.start,
            { x: x2, y: y2 } = this.end,
            { minX, minY, maxX, maxY } = bbox,
            m, y, x: number;
        // outside of bbox
        if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) ||
            (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY)) {
            return false;
        }

        m = (y2 - y1) / (x2 - x1); //slope of the line
        y = m * (minX - x1) + y1;
        if (y > minY && y < maxY) return true;

        y = m * (maxX - x1) + y1;
        if (y > minY && y < maxY) return true;

        x = (minY - y1) / m + x1;
        if (x > minX && x < maxX) return true;

        x = (maxY - y1) / m + x1;
        if (x > minX && x < maxX) return true;

        return false;
    }
}
