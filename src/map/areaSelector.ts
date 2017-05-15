import * as ol from "openlayers";
import { getUTMGridFromArrayBox } from "../logic/utmGrid"
import { puwg2ll, utmZone, ll2utm, utm2ll } from "../logic/proj4defs"
import * as _ from "lodash";

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

export function createAreaSelector(
    selectionLayer: ol.source.Vector,
    getAspectRatioOrientation: ()=>Orientation,
    onSelection: (selected: ol.Extent) => void
): ol.interaction.Interaction {
    const component = this;
    const drawSelection = new ol.interaction.Draw({
        source: selectionLayer,
        type: 'Circle',
        geometryFunction(coordinates: ol.Coordinate[], opt_geometry: ol.geom.Polygon) {
            // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/16130
            const ll = coordinates
                .map(c => ol.proj.transform(c, "EPSG:3857", 'EPSG:4326'));
            const zone = utmZone(puwg2ll(ll[0]));
            const utm = ll.map(c => ll2utm(zone, c))
            const topLeft = utm[0];

            const ISO216PaperRatio = 1 / Math.sqrt(2);
            const bottomRight = keepAspectRatio(utm[0], utm[1], ISO216PaperRatio, getAspectRatioOrientation());

            const geometry = opt_geometry || new ol.geom.Polygon(null);
            geometry.setCoordinates([[
                utm2ll(zone, topLeft),
                utm2ll(zone, [bottomRight[0], topLeft[1]]),
                utm2ll(zone, bottomRight),
                utm2ll(zone, [topLeft[0], bottomRight[1]]),
                utm2ll(zone, topLeft)
            ].map(c => ol.proj.transform(c, 'EPSG:4326', "EPSG:3857"))]);
            return geometry;
        }
    });
    drawSelection.on('drawstart', (event: ol.interaction.Draw.Event) => {
        onSelection(undefined);
        selectionLayer.clear();
    });
    drawSelection.on('drawend', (event: ol.interaction.Draw.Event) => {
        onSelection(event.feature.getGeometry().getExtent());
    });
    return drawSelection;
}