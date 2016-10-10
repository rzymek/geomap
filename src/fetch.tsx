import * as React from "react";
import * as ReactDOM from "react-dom";
import * as ReactDOMServer from "react-dom/server";
import * as _ from "lodash";
import {Select} from "./components/Select";
import {setupProjections} from "./logic/proj4defs";
import {orto} from "./capabilities/orto";
import {topo} from "./capabilities/topo";
import {SVGMap} from "./fetch/SVGMap";

const LEVELS: {[zoom: number]: string} = _.chain({
    7: '1:50 000',
    8: '1:25 000',
    9: '1:10 000',
    10: '1:10 000',
    11: '1:10 000',
    12: '1:10 000'
}).mapValues((value, key) => `${key} - ${value}`).value();

const LAYERS: {[key: string]: {label: string, def: {}}} = {
    topo: {
        label: 'Mapa topograficzna',
        def: topo
    },
    orto: {
        label: 'Ortofotomapa',
        def: orto
    }
};


function getParameters() {
    const query = location.search
        .substr(1) //skip '?'
        .split('|')
        .map(decodeURIComponent);
    return {
        source: query[0],
        z: Number(query[1]),
        title: query[2],
        box: {
            x1: Number(query[3]),
            y1: Number(query[4]),
            x2: Number(query[5]),
            y2: Number(query[6])
        }
    };
}

export interface MapParams {
    source?: string,
    z?: number,
    title?: string,
    box?: {
        x1: number,
        y1: number,
        x2: number,
        y2: number
    }
}
class Fetch extends React.Component<{},MapParams> {

    constructor(props: {}) {
        super(props);
        this.state = getParameters();
    }

    componentDidMount() {
        this.setState(getParameters());
    }

    render() {
        const def: any = LAYERS[this.state.source].def;
        const svg = <SVGMap def={def} params={this.state}/>;
        return <div>
            <div>
                <Select values={_.mapValues(LAYERS, v=>v.label)}
                        value={this.state.source}
                        onChange={(layer) => this.setState({source: layer})}/>
                <Select values={LEVELS}
                        value={String(this.state.z)}
                        onChange={(level) => this.setState({z: Number(level)})}/>
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
    <Fetch/>,
    document.getElementById("root")
);