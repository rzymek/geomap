import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMServer from "react-dom/server";
import * as _ from "lodash";
import { LayerSelector } from "./components/LayerSelector";
import { LAYERS } from "./logic/layers";
import { setupProjections } from "./logic/proj4defs";
import { SVGMap } from "./fetch/SVGMap";
import { parseUrlParameters } from "./logic/url-parameters";

const DEFAULT_FONT_SIZE = 16;
const DEFAULT_GRID_LINE_WIDTH = 1;

const parameterMapping = [
    { name: 'source', map: _.identity },
    { name: 'z', map: Number },
    { name: 'title', map: _.identity },
    { name: 'box.x1', map: Number },
    { name: 'box.y1', map: Number },
    { name: 'box.x2', map: Number },
    { name: 'box.y2', map: Number },
    { name: 'fontSize', map: (v: any) => Number(_.defaultTo(v, DEFAULT_FONT_SIZE)) },
    { name: 'gridLineWidth', map: (v: any) => Number(_.defaultTo(v, DEFAULT_GRID_LINE_WIDTH)) },
];

function getParameters(): MapParams {
    const query = parseUrlParameters();
    return parameterMapping.reduce(
        (result, entry, idx) => _.set(result, entry.name, entry.map(query[idx])),
        {}
    ) as MapParams;
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
        const query = parameterMapping
            .map(entry => _.get(this.state, entry.name))
            .join('|');
        window.history.replaceState(undefined, undefined, `?${query}`);
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
                <a href={this.dataURL(ReactDOMServer.renderToStaticMarkup(svg))} download={`${this.state.title}.svg`}>SVG</a>
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