import "jquery";

export interface IBBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

export interface IIdentifiable {
    id: string;
}

export interface IGeometryItem extends IIdentifiable {
    prevBBox: IBBox;
    saveBBox(): IBBox;
    getBBox(): IBBox;
    isIntersectedWith(bbox: IBBox): boolean;
}

export interface ILineDescriptor {
    start: ICoordinate;
    end: ICoordinate;
    id?: string;
    svgContainer?: JQuery;
}

export interface ICoordinate {
    x: number;
    y: number;
}

export interface IDimension {
    height: number;
    width: number;
}