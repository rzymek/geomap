import * as ol from "openlayers";
import { createSources } from "./sources";

export function createLayers(selectionLayer: ol.source.Vector): ol.layer.Layer[] {
    const sources = createSources();
    const layers= Object.keys(sources)
        .map(name =>
            new ol.layer.Tile({
                visible: false,
                preload: Infinity,
                source: sources[name]
            }) as ol.layer.Layer
        ).concat([new ol.layer.Vector({
            source: selectionLayer,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 0, 0, 0.2)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'red',
                    width: 2
                })
            })
        })]);
    layers[0].setVisible(true);
    return layers;
}