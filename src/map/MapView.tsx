import * as React from "react";
import * as ol from "openlayers";
import * as _ from "lodash";
import "openlayers/css/ol.css"

interface MapProps {
}

interface Sources {
    [name: string]: ol.source.Tile
}

function createSources(): Sources {
    return _.assign({
        'OpenStreetMap': new ol.source.OSM(),
        'OpenCycleMap': new ol.source.XYZ({
            url: 'http://tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
        }),
        'UMP': new ol.source.XYZ({
            url: 'http://tiles.ump.waw.pl/ump_tiles/{z}/{x}/{y}.png'
        })
    }, ...[
        'Road',
        'Aerial',
        'AerialWithLabels'
    ].map((style: string) => ({
        ['Bing: ' + style]: new ol.source.BingMaps({
            key: 'Apszeg5_v01g6cZjl_9VTYEcC_qchUYPEfVR64qdbgV5aRKfbYTbMeitv3bLEPkq',
            imagerySet: style
        })
    }))/*, ...['osm', 'sat'].map((style: string) => ({
     ['MapQuest: ' + style]: new ol.source.MapQuest({
     layer: style
     })
     }))*/) as Sources;
}

function createLayers(sources: Sources, selectionLayer: ol.source.Vector) {
    const layers: ol.layer.Layer[] = Object.keys(sources).map(name => new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: sources[name]
    }));
    layers.push(new ol.layer.Vector({
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
    }));
    return layers;
}
const puwg92 = "EPSG:2180";
export class MapView extends React.Component<MapProps, {}> {
    componentDidMount() {
        const centerOfPoland = [17.2385334, 52.0688155]; //Piątek
        const selectionLayer = new ol.source.Vector();
        const sources = createSources();
        const layers = createLayers(sources, selectionLayer);
        const map = new ol.Map({
            target: 'map',
            controls: ol.control.defaults().extend(
                [
                    new ol.control.MousePosition({
                        // coordinateFormat: function (coordinate) {
                        //     return formatMGRS(coordinate);
                        // },
                        className: '',
                        projection: 'EPSG:4326',
                        target: document.getElementById('mgrs')
                    }),
                    new ol.control.MousePosition({
                        coordinateFormat: function (coordinate) {
                            return ol.coordinate.toStringXY(coordinate, 4);
                        },
                        className: '',
                        projection: 'EPSG:4326',
                        target: document.getElementById('latlon')
                    }),
                    new ol.control.MousePosition({
                        coordinateFormat: function (coordinate) {
                            return ol.coordinate.toStringXY(coordinate, 0); // 0 decimal places
                        },
                        className: '',
                        projection: puwg92,
                        target: document.getElementById('puwg')
                    }),
                    new ol.control.MousePosition({
                        coordinateFormat: (coordinate: ol.Coordinate) => ol.coordinate.toStringXY(coordinate, 0),
                        className: '',
                        projection: 'mercator',
                        target: document.getElementById('mercator')
                    }),
                    new ol.control.ScaleLine(),
                    new ol.control.ZoomSlider()
                ]),
            layers: layers,
            view: new ol.View({
                center: ol.proj.transform([21.03, 52.22], 'EPSG:4326', 'EPSG:3857'),
                zoom: 10
            })
        });
        layers[0].setVisible(true);
        console.log(map);
    }

    render() {
        return <div id="map" style={{
                position:'absolute',
                top:0,
                left:0,
                right:0,
                bottom:0,
                zIndex: 0
            }}></div>
    }
}