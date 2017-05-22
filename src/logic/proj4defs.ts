import * as _ from "lodash";
import * as proj4js from 'proj4';
import * as mgrs from "mgrs";
const proj4 = (proj4js as any).default;
// const proj4 = proj4js;

export const PUGW92 = "EPSG:2180";
export const WEB_MERCATOR = "EPSG:3857";
export const WGS84 = 'EPSG:4326';

export function setupProjections() {
    proj4.defs(PUGW92, "+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +units=m +no_defs");
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
    return proj4cache.get(PUGW92, WGS84).forward(puwg);
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
export function ll2utm<K extends Coordinates>(zone: number, latLon: K): K {
    return proj4cache.get(WGS84, "+proj=utm +zone=" + zone + " +north +ellps=WGS84 +datum=WGS84 +units=m +no_defs")
        .forward(_.clone(latLon));
}
export function utm2ll<K extends Coordinates>(zone: number, utm: K): K {
    return proj4cache.get("+proj=utm +zone=" + zone + " +north +ellps=WGS84 +datum=WGS84 +units=m +no_defs", WGS84)
        .forward(_.clone(utm));
}
export function utm2puwg(zone: number, utm: CoordinatesXY): CoordinatesXY {
    return proj4cache.get("+proj=utm +zone=" + zone + " +north +ellps=WGS84 +datum=WGS84 +units=m +no_defs", PUGW92)
        .forward(_.clone(utm));
}
export function puwg2utm(zone: number, puwg: CoordinatesArray): CoordinatesArray {
    return proj4cache.get(PUGW92, "+proj=utm +zone=" + zone + " +north +ellps=WGS84 +datum=WGS84 +units=m +no_defs")
        .forward(_.clone(puwg));
}

interface MGRS {
    zone: string,
    grid: string,
    x: string,
    y: string
}
export function utm2mgrs(zone: number, utm: CoordinatesXY): MGRS {
    const ll = utm2ll(zone, utm);
    return ll2mgrs([ll.x, ll.y]);
}

export function ll2mgrs(ll: CoordinatesArray) {
    const mgrsString = mgrs.forward(ll);
    const result = /(...)(..)(.....)(.....)/.exec(mgrsString);
    return {
        zone: result[1],
        grid: result[2],
        x: result[3],
        y: result[4]
    }
}