import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMServer from "react-dom/server";
import * as _ from "lodash";
import { Select } from "./components/Select";
import { setupProjections } from "./logic/proj4defs";
import { orto } from "./capabilities/orto";
import { topo } from "./capabilities/topo";
import { SVGMap } from "./fetch/SVGMap";
import { Capabilities } from "./definitions/capabilities";

const LEVELS: { [zoom: number]: string } = _.chain({
    7: '1:50 000',
    8: '1:25 000',
    9: '1:10 000',
    10: '1:10 000',
    11: '1:10 000',
    12: '1:10 000'
}).mapValues((value, key) => `${key} - ${value}`).value();

const DEFAULT_FONT_SIZE = 16;
const DEFAULT_GRID_LINE_WIDTH = 1;

const LAYERS: { [key: string]: { label: string, def: Capabilities } } = {
    topo: {
        label: 'Mapa topograficzna',
        def: topo
    },
    orto: {
        label: 'Ortofotomapa',
        def: orto
    }
};

const parameterMapping = [
    { name: 'source', map: _.identity },
    { name: 'z', map: Number },
    { name: 'title', map: _.identity },
    { name: 'box.x1', map: Number },
    { name: 'box.y1', map: Number },
    { name: 'box.x2', map: Number },
    { name: 'box.y2', map: Number },
    { name: 'fontSize', map: v => Number(_.defaultTo(v, DEFAULT_FONT_SIZE)) },
    { name: 'gridLineWidth', map: v => Number(_.defaultTo(v, DEFAULT_GRID_LINE_WIDTH)) },
];

function getParameters(): MapParams {
    const query = location.search
        .substr(1) //skip '?'
        .split('|')
        .map(decodeURIComponent);
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
        const def: Capabilities = LAYERS[this.state.source].def;
        const svg = <SVGMap def={def} params={this.state} />;
        return <div>
            <div className="no-print">
                <Select values={_.mapValues(LAYERS, v => v.label)}
                    value={this.state.source}
                    onChange={(layer) => this.setState({ source: layer })} />
                <Select values={LEVELS}
                    value={String(this.state.z)}
                    onChange={(level) => this.setState({ z: Number(level) })} />
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