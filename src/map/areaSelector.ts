import * as ol from "openlayers";

export function createAreaSelector(
    selectionLayer: ol.source.Vector,
    onSelection: (selected: ol.Extent) => void
): ol.interaction.Interaction {
    const component = this;
    const drawSelection = new ol.interaction.Draw({
        source: selectionLayer,
        type: 'Circle',
        geometryFunction(coordinates, geometry: ol.geom.SimpleGeometry) {
            // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/16130
            const createBox = (ol.interaction.Draw as any/*missing typing*/).createBox();
            return createBox(coordinates, geometry);
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