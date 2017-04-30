import { utmZone, puwg2ll, CoordinatesArray, puwg2utm } from "./proj4defs";

export interface Box {
    x1: number,
    y1: number,
    x2: number,
    y2: number
}

function pairToObj(arr: CoordinatesArray) {
    return {
        x: arr[0],
        y: arr[1]
    }
}

function toKM(v: number) {
    return Math.round(v / 1000) * 1000;
}

export function getUTMGrid(box: Box) {
    const puwg: CoordinatesArray[] = [
        [box.x1, box.y1],
        [box.x2, box.y1],
        [box.x2, box.y2],
        [box.x1, box.y2],
    ];
    return getUTMGridFromArrayBox(puwg);
}

export function getUTMGridFromArrayBox(box: [number, number][]) {
    const zone = utmZone(puwg2ll([box[0][0], box[0][1]]));
    const utmGrid = box
        .map(c => puwg2utm(zone, c))
        .map(c => c.map(toKM))
        .map(pairToObj);
    return {
        zone,
        utmGrid
    }
}