import * as ol from "openlayers";
import { getUTMGridFromArrayBox } from "../logic/utmGrid"
import { puwg2ll, utmZone, ll2utm, utm2ll } from "../logic/proj4defs"
import * as _ from "lodash";

export function createAreaSelector(
    selectionLayer: ol.source.Vector,
    onSelection: (selected: ol.Extent) => void
): ol.interaction.Interaction {
    const component = this;
    const drawSelection = new ol.interaction.Draw({
        source: selectionLayer,
        type: 'Circle',
        geometryFunction(coordinates: ol.Coordinate[], opt_geometry: ol.geom.Polygon) {
            // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/16130
            console.log(JSON.stringify(coordinates));
            const ll = coordinates
                .map(c => ol.proj.transform(c, "EPSG:3857", 'EPSG:4326'));
            const zone = utmZone(puwg2ll(ll[0]));
            const utm = ll.map(c => ll2utm(zone, c))
            const topLeft = utm[0];
            const bottomRight = utm[1];

            const geometry = opt_geometry || new ol.geom.Polygon(null);
            geometry.setCoordinates([[
                utm2ll(zone, topLeft),
                utm2ll(zone, [bottomRight[0],topLeft[1]] ),
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