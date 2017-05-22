import * as _ from "lodash";
import { WebMercatorMapArea } from "../map/utmArea";
import { mgrs2webmercator, WEB_MERCATOR, WGS84 } from "../logic/proj4defs"
import * as mgrs from "mgrs";

export function parseUrlParameters(url?: string):string[] {
    return _.defaultTo(url, location.search)
        .substr(1) //skip '?'
        .split(';')
        .filter(v => !_.isEmpty(v))
        .map(decodeURIComponent)
}

export function urlParamsToMapArea(url?: string): WebMercatorMapArea {
    const selection = parseUrlParameters(url).map(mgrs2webmercator);
    return _.isEmpty(selection) ? undefined : {
        topLeft: selection[0],
        bottomRight: selection[1]
    }
}

export function mapAreaToUrlParams(selection: WebMercatorMapArea): string {
    if (selection !== undefined) {
        const query = [selection.topLeft, selection.bottomRight]
            .map(c => ol.proj.transform(c, WEB_MERCATOR, WGS84))
            .map(c => mgrs.forward(c, /*accuracy*/undefined))
            .join(";");
        return `${query}`;
    } else {
        return '';
    }
}