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
import { createAreaSelector, Orientation } from "./areaSelector";
import { parseUrlParameters } from "../logic/url-parameters";
import { PUGW92, WEB_MERCATOR, WGS84, ll2mgrs } from "../logic/proj4defs";
import { Drag } from "./dragFeatures";
import { enumMap } from "../logic/enumValues";
import { Select } from "../components/Select";
import { PageHeight, getScale, getSelectionForScale } from "./mapScale";

ol.proj.setProj4(setupProjections());

interface MapProps {
}
interface MapState {
    selection: ol.Extent,
    orientation: Orientation,
    source: string,
    margin: number,
    z: number
}
export class MapView extends React.Component<MapProps, MapState> {
    private selectionLayer = new ol.source.Vector();
    private map: ol.Map;
    areaSelectorInteraction = createAreaSelector(
        this.selectionLayer,
        () => this.state.orientation,
        selection => {
            this.setState({ selection })
        },
        () => this.setAreaDragMode());
    dragInteraction = new Drag();

    constructor() {
        super();
        this.state = {
            selection: undefined,
            orientation: Orientation.LANDSCAPE,
            source: 'topo',
            margin: 10,
            z: 9
        }
        this.dragInteraction.on('moveend', event => {
            const extent = event.feature.getGeometry().getExtent();
            this.setState({ selection: extent });
        });
    }

    setAreaDragMode() {
        this.map.removeInteraction(this.areaSelectorInteraction);
        this.map.addInteraction(this.dragInteraction);
    }
    componentDidMount() {
        this.map = new ol.Map({
            target: 'map',
            controls: ol.control.defaults().extend([
                new ol.control.MousePosition({
                    coordinateFormat: formatToMGRS,
                    projection: WGS84
                }),
                new ol.control.ScaleLine(),
                new ol.control.ZoomSlider()
            ]),
            layers: createLayers(this.selectionLayer),
            view: new ol.View({
                center: ol.proj.transform([21.03, 52.22], WGS84, WEB_MERCATOR),
                zoom: 10
            }),
            interactions: ol.interaction.defaults().extend([
                this.areaSelectorInteraction
            ])
        });
        const selectionParam = parseUrlParameters().map(Number);
        this.setSelection(selectionParam);
        if (!_.isEmpty(selectionParam)) {
            this.setAreaDragMode();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const query = _.flatten(this.getSelection()).join('|');
        window.history.replaceState(undefined, undefined, `?${query}`);
    }

    private setSelection(selection: number[]) {
        if (selection === undefined) {
            this.map.removeInteraction(this.dragInteraction);
            this.map.addInteraction(this.areaSelectorInteraction);
        }
        this.selectionLayer.clear();
        if (_.isEmpty(selection)) {
            return;
        }
        const coords = _.chunk(selection, 2).map((coord: ol.Coordinate) =>
            ol.proj.transform(coord, PUGW92, WEB_MERCATOR)
        );
        this.setState({
            selection: _.flatten(coords) as ol.Extent
        })
        const geometry = (ol.interaction.Draw as any).createBox()(coords);
        const feature = new ol.Feature({ geometry });
        this.selectionLayer.addFeature(feature);
    }

    private getSelection(): ol.Coordinate[] {
        return _.chunk(this.state.selection, 2).map((coord: ol.Coordinate) =>
            ol.proj.transform(coord, WEB_MERCATOR, PUGW92)
        );
    }

    private getScale(pageType: PageHeight): number {
        const { orientation, margin } = this.state;
        const selection = this.getSelection();
        if (orientation === Orientation.NONE || _.isEmpty(selection)) {
            return;
        }
        return getScale({
            selection,
            pageType,
            orientation,
            margin,
        });
    }
    private setScale(scale: number, pageType: PageHeight): void {
        const { orientation, margin } = this.state;
        const selection = this.getSelection();
        this.setSelection(getSelectionForScale({
            scale,
            selection,
            pageType,
            orientation,
            margin,
        }));
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
                <Select values={enumMap(Orientation)}
                    value={this.state.orientation.toString()}
                    onChange={(value) => this.setState({ orientation: Number(value) })} />
                {this.state.orientation !== Orientation.NONE && <MapScaleSelector
                    margin={this.state.margin}
                    onMarginChange={margin => this.setState({ margin })}
                    getScale={pageType => this.getScale(pageType)}
                    onScaleChange={(scale, pageType) => this.setScale(scale, pageType)}
                />}
                {this.state.selection && <a className="button"
                    target="printable"
                    href={`fetch.html?${this.getFetchParams().join('|')}`}>
                    Mapa
                </a>}
                < a className="button"
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
        </div >
    }
}

function formatToMGRS(pos: ol.Coordinate) {
    const mgrs = ll2mgrs(pos);
    return `${mgrs.zone} ${mgrs.grid} ${mgrs.x} ${mgrs.y}`;
}

const MapScaleSelector = (props: {
    margin: number,
    onMarginChange: (value: number) => void,
    getScale: (pageType: PageHeight) => number
    onScaleChange: (value: number, pageSize: PageHeight) => void,
}) => <div>
        <label>
            Margines: <input type="number" min={0} max={100} step={1}
                size={3} maxLength={3} style={{width:51}}
                title="mm"
                value={props.margin}
                onChange={e => props.onMarginChange(Number(e.target.value))} />
        </label>
        {Object.keys(PageHeight).filter(v => _.isNaN(Number(v))).map(pageType => [
            <br />,
            <label>
                {pageType}: 1:<input
                    type="number"
                    min={100}
                    max={500000}
                    step={100}
                    value={_.defaultTo(props.getScale(PageHeight[pageType]) as any, '')}
                    onChange={e => props.onScaleChange(Number(e.target.value), PageHeight[pageType])} />
            </label>
        ])}
    </div>;

    //_.defaultTo(this.getScale(PageHeight[pageType]) as any, '')