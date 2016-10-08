import * as proj4 from "proj4";

export function setupProjections() {
    proj4.defs("PUWG92", "+proj=tmerc +lat_0=0 +lon_0=19 +k=0.9993 +x_0=500000 +y_0=-5300000 +ellps=GRS80 +units=m +no_defs");
}

export interface CoordinatesXY {
    x: number,
    y: number
}
export type CoordinatesArray = number[];

export type Coordinates = CoordinatesXY | CoordinatesArray;

/**
 * @param {number[2]} puwg
 */
export function puwg2ll(puwg: CoordinatesArray): CoordinatesArray {
    return proj4("PUWG92", "WGS84", puwg);
}
export function utmZone(latLon: CoordinatesArray): number {
    return 1 + Math.floor((latLon[0] + 180) / 6);
}
/**
 * @param {number[2]} latLon
 */
export function ll2utm(zone: number, latLon: Coordinates): Coordinates {
    return proj4("WGS84", "+proj=utm +zone=" + zone + " +north +ellps=WGS84 +datum=WGS84 +units=m +no_defs", latLon);
}
export function utm2ll(zone: number, utm: Coordinates): Coordinates {
    return proj4("+proj=utm +zone=" + zone + " +north +ellps=WGS84 +datum=WGS84 +units=m +no_defs", "WGS84", utm);
}
export function utm2puwg(zone: number, utm: CoordinatesXY): CoordinatesXY {
    return proj4(
        "+proj=utm +zone=" + zone + " +north +ellps=WGS84 +datum=WGS84 +units=m +no_defs", "PUWG92",
        utm
    ) as any as CoordinatesXY;
}
export function puwg2utm(zone: number, puwg: CoordinatesArray): CoordinatesArray {
    return proj4("PUWG92", "+proj=utm +zone=" + zone + " +north +ellps=WGS84 +datum=WGS84 +units=m +no_defs", puwg);
}