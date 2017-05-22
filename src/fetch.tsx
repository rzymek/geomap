import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMServer from "react-dom/server";
import * as _ from "lodash";
import { LayerSelector } from "./components/LayerSelector";
import { LAYERS } from "./logic/layers";
import { setupProjections, ll2pugw } from "./logic/proj4defs";
import { SVGMap } from "./fetch/SVGMap";
import { WebMercatorMapArea } from "./map/utmArea";
import { parseUrlParameters, urlParamsToMapArea } from "./logic/url-parameters";
import * as mgrs from "mgrs";

const DEFAULT_FONT_SIZE = 16;
const DEFAULT_GRID_LINE_WIDTH = 1;

function mgrsBoundsToPuwgBox(area: string[]): Box {
    const [topLeftPUWG, bottomRightPUWG] = area
        .map(mgrsCoord => mgrs.toPoint(mgrsCoord))
        .map(ll2pugw);
    const box = {
        x1: topLeftPUWG[0],
        y1: topLeftPUWG[1],
        x2: bottomRightPUWG[0],
        y2: bottomRightPUWG[1]
    }
    return {
        x1: Math.min(box.x1, box.x2),
        y1: Math.min(box.y1, box.y2),
        x2: Math.max(box.x1, box.x2),
        y2: Math.max(box.y1, box.y2),
    }
}

function getParameters(url?: string): MapParams {
    const [coords, mapParams] = _.defaultTo(url, location.search).split(/:/);
    const area = parseUrlParameters(coords);
    const [source, z, fontSize, gridLineWidth] = mapParams.split(/-/);
    return {
        source,
        z: Number(z),
        title: coords,
        box: mgrsBoundsToPuwgBox(area),
        fontSize: _.defaultTo(Number(fontSize), DEFAULT_FONT_SIZE),
        gridLineWidth: _.defaultTo(Number(gridLineWidth), DEFAULT_GRID_LINE_WIDTH)
    }
}
export interface Box {
    x1: number,
    y1: number,
    x2: number,
    y2: number
}

export interface MapParams {
    source?: string,
    z?: number,
    title?: string,
    box?: Box,
    fontSize: number,
    gridLineWidth: number
}
class Fetch extends React.Component<{}, MapParams> {

    constructor(props: {}) {
        super(props);
        this.state = getParameters();
    }

    componentDidMount() {
        this.setState(getParameters());
    }

    componentDidUpdate() {
        const coords = location.search.split(/:/)[0];
        const mapParams = [
            this.state.source, 
            this.state.z, 
            this.state.fontSize,
            this.state.gridLineWidth
        ].join('-');
        window.history.replaceState(undefined, undefined, `${coords}:${mapParams}`);
        document.title = this.state.title;
    }

    render() {
        const def = LAYERS[this.state.source].def;
        const svg = <SVGMap def={def} params={this.state} />;
        return <div>
            <div className="no-print">
                <LayerSelector onChange={value => this.setState(value)}
                    layers={LAYERS} />
                <input type="number"
                    min={0}
                    style={{ width: 50 }}
                    title="Rozmiar czcionki"
                    value={this.state.fontSize}
                    onChange={e => this.setState({ fontSize: _.toNumber((e as any).target.value) })} />
                <input type="number"
                    min={0}
                    style={{ width: 50 }}
                    step="0.2"
                    title="Grubość linii"
                    value={this.state.gridLineWidth}
                    onChange={e => this.setState({ gridLineWidth: _.toNumber((e as any).target.value) })} />
                <button onClick={e => window.print()} title="Ctrl+P">Drukuj</button>
                {/*<a href={this.dataURL(ReactDOMServer.renderToStaticMarkup(svg))} 
                download={`${this.state.title}.svg`}>SVG</a>*/}
            </div>
            {svg}
        </div>;
    }

    private dataURL(data: string) {
        return 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(data)
    }
}

setupProjections();

ReactDOM.render(
    <Fetch />,
    document.getElementById("root")
);