import * as React from "react";
import * as ol from "openlayers";
import * as _ from "lodash";
import { setupProjections } from "../logic/proj4defs";
import "openlayers/css/ol.css";
import "./MapView.less";
import { LayerSelector } from "../components/LayerSelector";
import { LAYERS } from "../logic/layers";
import { createSources } from "./sources";
import { createControls, CoordsDisplayDefs } from "./controls";
import { createLayers } from "./layers";
import { createAreaSelector } from "./areaSelector";
import { parseUrlParameters } from "../logic/url-parameters";
import { ll2mgrs } from "../logic/proj4defs";

const puwg92 = "PUWG92";//'EPSG:2180";
ol.proj.setProj4(setupProjections());

interface MapProps {
}
interface MapState {
    selection: ol.Extent,
    source: string,
    z: number
}
export class MapView extends React.Component<MapProps, MapState> {
    private selectionLayer = new ol.source.Vector();

    constructor() {
        super();
        this.state = {
            selection: undefined,
            source: 'topo',
            z: 9
        }
    }

    componentDidMount() {
        new ol.Map({
            target: 'map',
            controls: ol.control.defaults().extend([
                new ol.control.MousePosition({
                    coordinateFormat: formatToMGRS,
                    projection: 'EPSG:4326'
                }),
                new ol.control.ScaleLine(),
                new ol.control.ZoomSlider()
            ]),
            layers: createLayers(this.selectionLayer),
            view: new ol.View({
                center: ol.proj.transform([21.03, 52.22], 'EPSG:4326', 'EPSG:3857'),
                zoom: 10
            }),
            interactions: ol.interaction.defaults().extend([
                createAreaSelector(this.selectionLayer, selection => {
                    this.setState({ selection })
                })
            ])
        });
        this.setSelection(parseUrlParameters().map(Number));
    }

    componentDidUpdate() {
        const query = _.flatten(this.getSelection()).join('|');
        window.history.replaceState(undefined, undefined, `?${query}`);
    }

    private setSelection(selection: number[]) {
        this.selectionLayer.clear();
        if (_.isEmpty(selection)) {
            return;
        }
        const coords = _.chunk(selection, 2).map((coord: ol.Coordinate) =>
            ol.proj.transform(coord, puwg92, 'EPSG:3857')
        );
        this.setState({
            selection: _.flatten(coords) as ol.Extent
        })
        const geometry = (ol.interaction.Draw as any).createBox()(coords);
        this.selectionLayer.addFeature(new ol.Feature({ geometry }));
    }

    private getSelection(): ol.Coordinate[] {
        return _.chunk(this.state.selection, 2).map((coord: ol.Coordinate) =>
            ol.proj.transform(coord, 'EPSG:3857', puwg92)
        );
    }

    private getFetchParams(): (string | number)[] {
        return [
            this.state.source,
            this.state.z,
            'map',
        ].concat(...this.getSelection());
    }

    render() {
        return <div className="MapView">
            <div className="panel">
                <LayerSelector layers={LAYERS} onChange={value => this.setState(value)} />
                {this.state.selection && <a className="button"
                    target="printable"
                    href={`fetch.html?${this.getFetchParams().join('|')}`}>
                    Mapa
                </a>}
                <a className="button"
                    onClick={() => {
                        this.setState({ selection: undefined });
                        this.setSelection(undefined);
                    }}>Reset</a>
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

function formatToMGRS(pos: ol.Coordinate) {
    const mgrs = ll2mgrs(pos);
    return `${mgrs.zone} ${mgrs.grid} ${mgrs.x} ${mgrs.y}`;
}