import { PUGW92, WEB_MERCATOR, WGS84, ll2mgrs, ll2utm, utmZoneWM, webmercator2utm, utm2webmercator } from "../logic/proj4defs";

export interface WebMercatorMapArea {
    topLeft: ol.Coordinate,
    bottomRight: ol.Coordinate,
}

export enum Orientation {
    NONE, PORTRAIT, LANDSCAPE
}

function assertConsistency(v: never) {
    throw new Error(`Internal inconsistency. Unacounted value: ${JSON.stringify(v)}`);
}

function keepAspectRatio(start: ol.Coordinate, end: ol.Coordinate, ratio: number, orientation: Orientation): ol.Coordinate {
    const width = Math.abs(start[0] - end[0]);
    const height = Math.abs(start[1] - end[1]);

    switch (orientation) {
        case Orientation.PORTRAIT:
            return [end[0], start[1] - width / ratio];
        case Orientation.LANDSCAPE:
            return [start[0] + height / ratio, end[1]];
        case Orientation.NONE:
            return end;
    }
    assertConsistency(orientation);
}
const ISO216PaperRatio = 1 / Math.sqrt(2);

export function getUTMAreaBox({ area, getAspectRatioOrientation, polygon }: {
    area: WebMercatorMapArea,
    getAspectRatioOrientation: () => Orientation,
    polygon?:ol.geom.Polygon
}): ol.geom.Polygon {
    const zone = utmZoneWM(area.topLeft);
    const [topLeftUTM, bottomRightUTM] = [area.topLeft, area.bottomRight].map(c => webmercator2utm(zone, c))

    const bottomRightUTMWithAspect = keepAspectRatio(topLeftUTM, bottomRightUTM,
        ISO216PaperRatio, getAspectRatioOrientation());

    const p = polygon || new ol.geom.Polygon(null);
    p.setCoordinates([[
        utm2webmercator(zone, topLeftUTM),
        utm2webmercator(zone, [bottomRightUTMWithAspect[0], topLeftUTM[1]]),
        utm2webmercator(zone, bottomRightUTMWithAspect),
        utm2webmercator(zone, [topLeftUTM[0], bottomRightUTMWithAspect[1]]),
        utm2webmercator(zone, topLeftUTM)
    ]]);
    return p;
}