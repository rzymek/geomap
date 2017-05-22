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
import { createAreaSelector, Orientation, toMapSelection } from "./areaSelector";
import { mapAreaToUrlParams, urlParamsToMapArea } from "../logic/url-parameters";
import { PUGW92, WEB_MERCATOR, WGS84, ll2mgrs, mgrs2webmercator } from "../logic/proj4defs";
import { Drag } from "./dragFeatures";
import { enumMap } from "../logic/enumValues";
import { Select } from "../components/Select";
import { PageHeight, getScale, getSelectionForScale } from "./mapScale";
import { MapScaleSelector } from "./MapScaleSelector";
import { WebMercatorMapArea, getUTMAreaBox } from "./utmArea"

ol.proj.setProj4(setupProjections());

interface MapProps {
}
interface MapState {
    selection: WebMercatorMapArea,
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
        selection => this.setState({ selection }),
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
            const geom = event.feature.getGeometry();
            if (geom instanceof ol.geom.Polygon) {
                this.setState({ selection: toMapSelection(geom) });
            }
        });
    }

    setAreaDragMode() {
        this.map.removeInteraction(this.areaSelectorInteraction);
        this.map.addInteraction(this.dragInteraction);
    }

    setAreaDrawMode() {
        this.map.removeInteraction(this.dragInteraction);
        this.map.addInteraction(this.areaSelectorInteraction);
    }

    private createMap() {
        return new ol.Map({
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
    }

    private updateSelectionFromUrlParams() {
        this.setSelection(urlParamsToMapArea());
    }

    componentDidMount() {
        this.map = this.createMap();
        this.updateSelectionFromUrlParams();
    }

    componentDidUpdate(prevProps, prevState) {
        window.history.replaceState(undefined, undefined,
            '?' + mapAreaToUrlParams(this.state.selection)
        );
    }


    private setSelection(selection: WebMercatorMapArea) {
        if (selection === undefined) {
            this.setAreaDrawMode();
        } else {
            this.setAreaDragMode();
        }
        this.selectionLayer.clear();
        if (_.isEmpty(selection)) {
            return;
        }
        this.setState({ selection });
        const geometry = getUTMAreaBox({ area: selection, getAspectRatioOrientation: () => this.state.orientation })
        const feature = new ol.Feature({ geometry });
        this.selectionLayer.addFeature(feature);
    }

    private getScale(pageType: PageHeight): number {
        const { orientation, margin, selection } = this.state;
        if (orientation === Orientation.NONE || selection === undefined) {
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
        const { orientation, margin, selection } = this.state;
        this.setSelection(getSelectionForScale({
            scale,
            selection,
            pageType,
            orientation,
            margin,
        }));
    }

    private getFetchParams(): string {
        return mapAreaToUrlParams(this.state.selection) + ':' + [
            this.state.source,
            this.state.z,
        ].join('-');
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
                    href={`fetch.html?${this.getFetchParams()}`}>
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
        </div >
    }
}

function formatToMGRS(pos: ol.Coordinate) {
    const mgrs = ll2mgrs(pos);
    return `${mgrs.zone} ${mgrs.grid} ${mgrs.x} ${mgrs.y}`;
}