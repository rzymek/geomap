import * as React from "react";
import * as ol from "openlayers";
import * as _ from "lodash";
import { setupProjections } from "../logic/proj4defs";
import "openlayers/css/ol.css";
import "./MapView.less";
import { LayerSelector } from "../components/LayerSelector";
import { LAYERS } from "../logic/layers";

interface MapProps {
}
interface MapState {
    selection: ol.Extent,
    source: string,
    z: number
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
const puwg92 = "PUWG92";//'EPSG:2180";
ol.proj.setProj4(setupProjections());

export class MapView extends React.Component<MapProps, MapState> {
    componentDidMount() {
        const component = this;
        const centerOfPoland = [17.2385334, 52.0688155]; //Piątek
        const selectionLayer = new ol.source.Vector();
        const sources = createSources();
        const layers = createLayers(sources, selectionLayer);
        const map = new ol.Map({
            target: 'map',
            controls: ol.control.defaults().extend(
                [
                    new ol.control.MousePosition({
                        coordinateFormat: function (coordinate) {
                            // return formatMGRS(coordinate);
                            return "TODO";
                        },
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
        const drawSelection = new ol.interaction.Draw({
            source: selectionLayer,
            type: 'Circle',
            geometryFunction(coordinates, geometry: ol.geom.SimpleGeometry) {
                const createBox = (ol.interaction.Draw as any/*missing typing*/).createBox();
                return createBox(coordinates, geometry);
            }
        });
        drawSelection.on('drawstart', (event: ol.interaction.Draw.Event) => {
            component.setState({
                selection: undefined
            });
            selectionLayer.clear();
        });
        drawSelection.on('drawend', (event: ol.interaction.Draw.Event) => {
            component.setState({
                selection: event.feature.getGeometry().getExtent()
            });
        });
        map.addInteraction(drawSelection);
    }
    getFetchParams() {
        if (!this.state) {
            return [];
        }
        const { selection } = this.state;
        if (selection === undefined) {
            return [];
        }
        const coords = _.chunk(selection, 2).map((coord: ol.Coordinate) =>
            ol.proj.transform(coord, 'EPSG:3857', puwg92)
        );
        return [this.state.source||'topo', this.state.z||9, 'map'].concat(...coords);
    }
    render() {
        const params = this.getFetchParams();
        return <div className="MapView">
            <div className="panel">
                <table className="coords">
                    <tr>
                        <td>MGRS:</td><td id="mgrs"></td>
                    </tr>
                    <tr>
                        <td>LatLon:</td><td id="latlon"></td>
                    </tr>
                </table>
                <LayerSelector layers={LAYERS} onChange={value => this.setState(value)} />
                {!_.isEmpty(params) && <a className="button"
                    href={`fetch.html?${params.join('|')}`}>
                    Mapa
                </a>}
            </div>
            <div id="map" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 0
            }} />
        </div>
    }
}