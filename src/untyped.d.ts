// declare const __filename: string;

declare module "ol-react" {
    let result: {
        Map: any;
        View: any;
        layer: any;
        source: any;
        Feature: any;
        geom: any
    };
    export = result;
}

declare module "line-intersect" {
    export function checkIntersection(
        x1: number, y1: number,
        x2: number, y2: number,
        x3: number, y3: number,
        x4: number, y4: number): {
            type: string,
            point: { x: number, y: number }
        };
}