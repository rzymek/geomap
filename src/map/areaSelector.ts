import * as ol from "openlayers";
import { getUTMGridFromArrayBox } from "../logic/utmGrid"
import { puwg2ll, utmZone, ll2utm, utm2ll } from "../logic/proj4defs"
import * as _ from "lodash";
import { WebMercatorMapArea, getUTMAreaBox } from "./utmArea";

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

export function toMapSelection(polygon: ol.geom.Polygon): WebMercatorMapArea {
    const coords = polygon.getCoordinates()[0];
    return {
        topLeft: coords[0],
        bottomRight: coords[2]
    };
}
export function createAreaSelector(
    selectionLayer: ol.source.Vector,
    getAspectRatioOrientation: () => Orientation,
    onSelection: (selected: WebMercatorMapArea) => void,
    onDrawEnd: () => void,
): ol.interaction.Interaction {
    const component = this;
    const drawSelection = new ol.interaction.Draw({
        source: selectionLayer,
        type: 'Circle',//closes thing to a box
        geometryFunction(coordinates: ol.Coordinate[], polygon: ol.geom.Polygon): ol.geom.Polygon {
            const area = {
                topLeft: coordinates[0],
                bottomRight: _.defaultTo(coordinates[1], coordinates[0])
            };
            const box = getUTMAreaBox({ area, getAspectRatioOrientation, polygon });
            onSelection(toMapSelection(box))
            return box;
        }
    });
    drawSelection.on('drawstart', (event: ol.interaction.Draw.Event) => {
        selectionLayer.clear();
    });
    drawSelection.on('drawend', (event: ol.interaction.Draw.Event) => {
        onDrawEnd();
    });
    return drawSelection;
}