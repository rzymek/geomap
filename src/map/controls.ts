import * as ol from "openlayers";
import * as _ from "lodash";

export type CoordsDisplayDefs = {
    projection?: string,
    id: string,
    formatter(coordinate: ol.Coordinate): string;
}[];

export function createControls(defs: CoordsDisplayDefs) {
    return ol.control.defaults().extend(
        defs.map(def => new ol.control.MousePosition({
            coordinateFormat: def.formatter,
            projection: _.defaultTo(def.projection,'EPSG:4326'),
            target: document.getElementById(def.id)
        }) as ol.control.Control).concat([
            new ol.control.ScaleLine(),
            new ol.control.ZoomSlider()
        ])
    );
}