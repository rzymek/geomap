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

declare module "mgrs" {
    /**
     * Conversion of lat/lon to MGRS.
     *
     * @param {object} ll Object literal with lat and lon properties on a
     *     WGS84 ellipsoid.
     * @param {int} accuracy Accuracy in digits (5 for 1 m, 4 for 10 m, 3 for
     *      100 m, 2 for 1000 m or 1 for 10000 m). Optional, default is 5.
     * @return {string} the MGRS string for the given location and accuracy.
     */
    export function forward(ll: [number, number], accuracy?: number): string;
    /**
     * Conversion of MGRS to lat/lon.
     *
     * @param {string} mgrs MGRS string.
     * @return {array} An array with left (longitude), bottom (latitude), right
     *     (longitude) and top (latitude) values in WGS84, representing the
     *     bounding box for the provided MGRS reference.
     */
    export function inverse(mgrs: string): [number, number, number, number];
    export function toPoint(mgrs: string): [number, number];
}