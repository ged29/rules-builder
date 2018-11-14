import Line from "../models/layout/line";
import FunctionalNode from "../models/layout/node";
import { IBBox, IGeometryItem } from "../graphic-common-interfaces";

type TCompareFn = (a: IBBox, b: IBBox) => number;

export default class RTree {
    _maxEntries: number;
    _minEntries: number;
    data: IRBushNode;
    ctx: CanvasRenderingContext2D;

    isEqual: (a: IGeometryItem, b: IGeometryItem) => boolean;
    compareByMinX: TCompareFn;
    compareByMinY: TCompareFn;
    // max entries in a node is 9 by default; min node fill is 40% for best performance
    constructor(maxEntries) {
        this._maxEntries = Math.max(4, maxEntries || 9);
        this._minEntries = Math.max(2, Math.ceil(this._maxEntries * 0.4));
        this.clear();
        //defaults        
        this.isEqual = (a, b) => a.id === b.id;
        this.compareByMinX = (a, b) => a.minX - b.minX;
        this.compareByMinY = (a, b) => a.minY - b.minY;
    }

    clear() {
        this.data = this.createNode([]);
    }

    remove(item: IGeometryItem) {
        var node = this.data,
            bbox = item.getBBox(),
            path = [],
            indexes = [],
            inx, parent, index, goingUp;
        // depth-first iterative tree traversal
        while (node || path.length) {

            if (!node) { // go up
                node = path.pop();
                parent = path[path.length - 1];
                inx = indexes.pop();
                goingUp = true;
            }

            if (node.isLeaf) { // check current node
                index = this.findItem(item, node.children);

                if (index !== -1) {
                    // item found, remove the item and condense tree upwards
                    node.children.splice(index, 1);
                    path.push(node);
                    this.condense(path);
                    return this;
                }
            }

            if (!goingUp && !node.isLeaf && this.contains(node, bbox)) { // go down
                path.push(node);
                indexes.push(inx);
                inx = 0;
                parent = node;
                node = node.children[0];

            }
            else if (parent) { // go right
                inx++;
                node = parent.children[inx];
                goingUp = false;

            }
            else {                
                debugger
                node = null; // nothing found
            }
        }

        return this;
    }

    private condense(path: IRBushNode[]) {
        // go through the path, removing empty nodes and updating bboxes
        for (let inx = path.length - 1, siblings; inx >= 0; inx--) {
            if (path[inx].children.length === 0) {
                if (inx > 0) {
                    siblings = path[inx - 1].children;
                    siblings.splice(siblings.indexOf(path[inx]), 1);
                }
                else this.clear();
            }
            else this.calcBBox(path[inx]);
        }
    }

    all() {
        return this._all(this.data, []);
    }

    private _all(node: IRBushNode, result: IRBushNode[]) {
        var nodesToSearch = [];

        while (node) {
            if (node.isLeaf) {
                result.push.apply(result, node.children);
            }
            else {
                nodesToSearch.push.apply(nodesToSearch, node.children);
            }

            node = nodesToSearch.pop();
        }

        return result;
    }

    search(bbox: IBBox) {
        var node = this.data,
            result = [];

        if (!this.intersects(bbox, node)) return result;

        var nodesToSearch = [], child, childBBox;

        while (node) {
            for (let inx = 0, len = node.children.length; inx < len; inx++) {
                child = node.children[inx];
                childBBox = node.isLeaf ? child.getBBox() : child;

                if (this.intersects(bbox, childBBox)) {

                    if (node.isLeaf) {
                        if (child instanceof Line) {
                            if (child.isIntersectedWith(bbox)) {
                                result.push(child);
                            }
                        }
                        else {
                            result.push(child);
                        }
                    }
                    else if (this.contains(bbox, childBBox)) {
                        this._all(child, result);
                    }
                    else {
                        nodesToSearch.push(child);
                    }
                }
            }

            node = nodesToSearch.pop();
        }

        return result;
    }

    getCollidedWith(queryBBox: IBBox, accept: (item) => boolean) {
        var node = this.data;

        if (!this.intersects(queryBBox, node)) return null;

        var nodesToSearch = [], child, childBBox;

        while (node) {
            for (let inx = 0, len = node.children.length; inx < len; inx++) {
                child = node.children[inx];
                childBBox = node.isLeaf ? (child as IGeometryItem).getBBox() : child;

                if (this.intersects(queryBBox, childBBox)) {
                    if (node.isLeaf || this.contains(queryBBox, childBBox)) {
                        if (accept(child)) {
                            return child;
                        }
                    }
                    else {
                        nodesToSearch.push(child);
                    }
                }
            }
            node = nodesToSearch.pop();
        }

        return null;
    }

    insert(item: IGeometryItem) {
        if (item) {
            this._insert(item, this.data.height - 1);
        }

        return this;
    }

    private _insert(item, level: number) {
        let bbox: IBBox = item.getBBox(),
            insertPath: IRBushNode[] = [],
            // find the best node for accommodating the item, saving all nodes along the path too
            node = this.chooseSubtree(bbox, this.data, level, insertPath);

        // put the item into the node
        node.children.push(item);
        this.extend(node, bbox);
        // split on node overflow; propagate upwards if necessary
        while (level >= 0) {
            if (insertPath[level].children.length > this._maxEntries) {
                this.split(insertPath, level);
                level--;
            }
            else break;
        }
        // adjust bboxes along the insertion path
        for (let inx = level; inx >= 0; inx--) {
            this.extend(insertPath[inx], bbox);
        }
    }

    // Find the best node for accommodating the item
    private chooseSubtree(bbox: IBBox, node: IRBushNode, level: number, path: IBBox[]) {
        var child: IBBox,
            childArea: number, enlargement: number,
            targetNode,
            minArea, minEnlargement;

        while (true) {
            path.push(node);
            //Если N конечный узел, вернуть N
            if (node.isLeaf || path.length - 1 === level) break;

            minArea = minEnlargement = Infinity;

            for (let inx = 0, len = node.children.length; inx < len; inx++) {
                child = node.children[inx];
                //получить площадь дочернего узла
                childArea = this.getBBoxArea(child);
                //Выбрать дочерний узел N, чей MBR требует наименьшего увеличения перекрытия при вставке объекта в узел
                enlargement = this.getEnlargedArea(bbox, child) - childArea;
                // choose entry with the least area enlargement
                // выбрать из них тот, который требует наименьшего увеличения площади
                if (enlargement < minEnlargement) {
                    minEnlargement = enlargement;
                    minArea = childArea < minArea ? childArea : minArea;
                    targetNode = child;
                }
                else if (enlargement === minEnlargement) {
                    // otherwise choose one with the smallest area
                    // выбрать из них узел с наименьшей площадью
                    if (childArea < minArea) {
                        minArea = childArea;
                        targetNode = child;
                    }
                }
            }

            node = targetNode || node.children[0];
        }

        return node;
    }
    // split overflowed node into two
    private split(insertPath: IRBushNode[], level: number) {
        var node = insertPath[level],
            M = node.children.length,
            m = this._minEntries;

        this.chooseSplitAxis(node, m, M);

        let splitIndex = this.chooseSplitIndex(node, m, M);

        var newNode = this.createNode(node.children.splice(splitIndex, node.children.length - splitIndex));
        newNode.height = node.height;
        newNode.isLeaf = node.isLeaf;

        this.calcBBox(node);
        this.calcBBox(newNode);

        if (level) {
            insertPath[level - 1].children.push(newNode);
        }
        else {
            this.splitRoot(node, newNode);
        }
    }

    private splitRoot(node, newNode) {
        // split root node
        this.data = this.createNode([node, newNode]);
        this.data.height = node.height + 1;
        this.data.isLeaf = false;
        this.calcBBox(this.data);
    }
    // sorts node children by the best axis for split
    private chooseSplitAxis(node: IRBushNode, m: number, M: number) {
        //1. Для каждой из осей
        //2. Отсортировать узлы по левой, а затем по правой границах их MBR.
        //Распределить узлы как описано выше, вычислить S - сумму всех периметров каждого из распределений.
        //3. Выбрать ось, с минимальной S.
        var xMargin = this.getAllDistMargin(node, m, M, this.compareByMinX),
            yMargin = this.getAllDistMargin(node, m, M, this.compareByMinY);
        // if total distributions margin value is minimal for x, sort by minX, otherwise it's already sorted by minY
        if (xMargin < yMargin) {
            node.children.sort(this.compareByMinX);
        }
    }
    // total margin of all possible split distributions where each node is at least this._minEntries full
    private getAllDistMargin(node: IRBushNode, m: number, M: number, compare: TCompareFn) {

        node.children.sort(compare);

        var leftBBox = this.getDistBBox(node, 0, m),
            rightBBox = this.getDistBBox(node, M - m, M),
            margin = this.getBBoxMargin(leftBBox) + this.getBBoxMargin(rightBBox);

        for (let inx = m, child, bbox; inx < M - m; inx++) {
            child = node.children[inx];
            bbox = node.isLeaf ? child.getBBox() : child;
            this.extend(leftBBox, bbox);
            margin += this.getBBoxMargin(leftBBox);
        }

        for (let inx = M - m - 1, child, bbox; inx >= m; inx--) {
            child = node.children[inx];
            bbox = node.isLeaf ? child.getBBox() : child;
            this.extend(rightBBox, bbox);
            margin += this.getBBoxMargin(rightBBox);
        }

        return margin;
    }

    private chooseSplitIndex(node: IRBushNode, m: number, M: number) {
        //1. Вдоль выбранной оси выбрать распределение с минимальным параметром перекрытия
        //2. Если распределений с минимальным параметром перекрытия несколько, выбрать распределение с наименьшей площадью.
        var bbox1, bbox2, overlap, area, minOverlap, minArea, index;

        minOverlap = minArea = Infinity;

        for (let inx = m; inx <= M - m; inx++) {
            bbox1 = this.getDistBBox(node, 0, inx);
            bbox2 = this.getDistBBox(node, inx, M);

            overlap = this.getIntersectionArea(bbox1, bbox2);
            area = this.getBBoxArea(bbox1) + this.getBBoxArea(bbox2);

            // choose distribution with minimum overlap
            if (overlap < minOverlap) {
                minOverlap = overlap;
                index = inx;

                minArea = area < minArea ? area : minArea;

            } else if (overlap === minOverlap) {
                // otherwise choose distribution with minimum area
                if (area < minArea) {
                    minArea = area;
                    index = inx;
                }
            }
        }

        return index;
    }

    private findItem(item, items) {
        for (let ii = items.length; ii--;) {
            if (this.isEqual(item, items[ii])) {
                return ii;
            }
        }

        return -1;
    }

    // calculate node's bbox from bboxes of its children
    private calcBBox(node: IRBushNode) {
        this.getDistBBox(node, 0, node.children.length, node);
    }

    // returns min bounding rectangle of node children from k to p-1
    private getDistBBox(node: IRBushNode, k, p, destNode?: IRBushNode) {
        destNode = destNode || this.createNode(null);
        destNode.minX = Infinity;
        destNode.minY = Infinity;
        destNode.maxX = -Infinity;
        destNode.maxY = -Infinity;

        for (let inx = k, child, bbox: IBBox; inx < p; inx++) {
            child = node.children[inx];
            bbox = node.isLeaf ? child.getBBox() : child;
            this.extend(destNode, bbox);
        }

        return destNode;
    }

    private getBBoxArea(node: IBBox) {
        return (node.maxX - node.minX) * (node.maxY - node.minY);
    }

    private getBBoxMargin(node: IBBox) {
        return (node.maxX - node.minX) + (node.maxY - node.minY);
    }

    private getEnlargedArea(a: IBBox, b: IBBox) {
        return (Math.max(a.maxX, b.maxX) - Math.min(a.minX, b.minX)) *
            (Math.max(a.maxY, b.maxY) - Math.min(a.minY, b.minY));
    }

    private getIntersectionArea(a: IBBox, b: IBBox) {
        var minX = Math.max(a.minX, b.minX),
            minY = Math.max(a.minY, b.minY),
            maxX = Math.min(a.maxX, b.maxX),
            maxY = Math.min(a.maxY, b.maxY);

        return Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
    }

    private contains(a: IBBox, b: IBBox) {
        return a.minX <= b.minX
            && a.minY <= b.minY
            && b.maxX <= a.maxX
            && b.maxY <= a.maxY;
    }

    private intersects(a: IBBox, b: IBBox) {
        return b.minX <= a.maxX
            && b.minY <= a.maxY
            && b.maxX >= a.minX
            && b.maxY >= a.minY;
    }

    private extend(a: IBBox, b: IBBox) {
        a.minX = Math.min(a.minX, b.minX);
        a.minY = Math.min(a.minY, b.minY);
        a.maxX = Math.max(a.maxX, b.maxX);
        a.maxY = Math.max(a.maxY, b.maxY);

        return a;
    }

    private createNode(children: IRBushNode[]): IRBushNode {
        return {
            children: children,
            height: 1,
            isLeaf: true,
            minX: Infinity,
            minY: Infinity,
            maxX: -Infinity,
            maxY: -Infinity
        };
    }

    private drawTree(node: IRBushNode, level: number, rects: any[], info: { [id: string]: any[] }) {
        var colors = ['#f40', '#0b0', '#37f'];

        if (!node) return;

        let rect = [],
            lbl: string,
            rndBBox = [
                Math.round(node.minX),
                Math.round(node.minY),
                Math.round(node.maxX - node.minX),
                Math.round(node.maxY - node.minY)
            ];

        rect.push(level ? colors[(node.height - 1) % colors.length] : 'grey');
        rect.push(level ? 1 / Math.pow(level, 1.2) : 0.5);
        rect.push(rndBBox);
        rect.push(node.height);

        lbl = `H:${node.height} [x:${rndBBox[0]}, y:${rndBBox[1]}, X:${rndBBox[2]}, Y:${rndBBox[3]}]`
        rect.push(lbl);
        rects.push(rect);

        if (node.isLeaf) {
            let conns = [], nodes = [], pc;

            for (let ci = node.children.length; ci--;) {
                if (node.children[ci] instanceof Line) {
                    conns.push(node.children[ci]);
                }

                if (node.children[ci] instanceof FunctionalNode) {
                    nodes.push(node.children[ci]);
                }
            }

            if (conns.length || nodes.length || pc) {
                lbl = rect[4] += ` (c:${conns.length}, n:${nodes.length}${pc ? ', pc:1' : ''})`;
            }

            if (!info.hasOwnProperty(lbl)) {
                info[lbl] = (pc ? [pc] : []).concat(nodes).concat(conns);
            }

            return;
        }

        for (var i = 0; i < node.children.length; i++) {
            this.drawTree(node.children[i], level + 1, rects, info);
        }
    }

    drawDebug() {
        var rects = [],
            info: { [id: string]: any[] } = {},
            bbox: number[],
            lbl: string,
            height: number;

        if (!this.ctx) {
            var canvas = document.getElementById("debug-canvas") as HTMLCanvasElement;
            canvas.style.display = "inline-block";
            canvas.height = canvas.width = 3000;
            this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            this.ctx.font = "12px arial";
        }

        this.drawTree(this.data, 0, rects, info);

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (var i = rects.length - 1; i >= 0; i--) {
            this.ctx.strokeStyle = rects[i][0];
            this.ctx.globalAlpha = rects[i][1];

            bbox = rects[i][2];
            height = rects[i][3];
            lbl = rects[i][4];

            this.ctx.strokeRect.apply(this.ctx, bbox);

            if (height > 1) {
                this.ctx.fillText(lbl, bbox[0] + (this.ctx.measureText(lbl).width * height), bbox[1] + 12);
            }
            else {
                this.ctx.fillText(lbl, bbox[0] + 5, bbox[1] + 12);
            }
        }

        console.clear();

        let entityIds: { [entityId: string]: boolean } = {};

        for (let id in info) {
            console.groupCollapsed(id);

            for (let entity of info[id]) {
                console.log(entity);

                if (!entityIds[entity.id]) {
                    entityIds[entity.id] = true;
                }
                else break;
            }

            console.groupEnd();
        }
    }
}

interface IRBushNode extends IBBox {
    children: IRBushNode[];
    height: number;
    isLeaf: boolean;
}