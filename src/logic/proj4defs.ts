import * as _ from "lodash";
import * as proj4js from 'proj4';
import * as mgrs from "mgrs";
const proj4 = (proj4js as any).default;
// const proj4 = proj4js;

export function setupProjections() {
    proj4.defs("PUWG92", "+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +units=m +no_defs");
    return proj4;
}

export interface CoordinatesXY {
    x: number,
    y: number
}
export type CoordinatesArray = [number, number];

export type Coordinates = CoordinatesXY | CoordinatesArray;

/**
 * @param {number[2]} puwg
 */
export function puwg2ll(puwg: CoordinatesArray): CoordinatesArray {
    return proj4cache.get("PUWG92", "WGS84").forward(puwg);
}
export function utmZone(latLon: CoordinatesArray): number {
    return 1 + Math.floor((latLon[0] + 180) / 6);
}

const proj4cache = new class Proj4Cache {
    private cache = {};
    public get(proj1: string, proj2: string) {
        const cachePath = [proj1, proj2];
        const cached = _.get(this.cache, cachePath);
        if (cached === undefined) {
            console.log(`new proj4 [${proj1}]->[${proj2}]`);
            const fresh = proj4(proj1, proj2);
            _.set(this.cache, cachePath, fresh);
            return fresh;
        } else {
            return cached;
        }
    }
};


/**
 * @param {number[2]} latLon
 */
export function ll2utm(zone: number, latLon: Coordinates): Coordinates {
    return proj4cache.get("WGS84", "+proj=utm +zone=" + zone + " +north +ellps=WGS84 +datum=WGS84 +units=m +no_defs")
        .forward(_.clone(latLon));
}
export function utm2ll(zone: number, utm: Coordinates): CoordinatesXY {
    return proj4cache.get("+proj=utm +zone=" + zone + " +north +ellps=WGS84 +datum=WGS84 +units=m +no_defs", "WGS84")
        .forward(_.clone(utm));
}
export function utm2puwg(zone: number, utm: CoordinatesXY): CoordinatesXY {
    return proj4cache.get("+proj=utm +zone=" + zone + " +north +ellps=WGS84 +datum=WGS84 +units=m +no_defs", "PUWG92")
        .forward(_.clone(utm));
}
export function puwg2utm(zone: number, puwg: CoordinatesArray): CoordinatesArray {
    return proj4cache.get("PUWG92", "+proj=utm +zone=" + zone + " +north +ellps=WGS84 +datum=WGS84 +units=m +no_defs")
        .forward(_.clone(puwg));
}

export function utm2mgrs(zone: number, utm: CoordinatesXY): { zone: string, grid: string, x: string, y: string } {
    const ll = utm2ll(zone, utm);
    const mgrsString = mgrs.forward([ll.x, ll.y]);
    const result = /(...)(..)(.....)(.....)/.exec(mgrsString);
    return {
        zone: result[1],
        grid: result[2],
        x: result[3],
        y: result[4]
    }
}