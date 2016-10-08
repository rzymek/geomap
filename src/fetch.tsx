import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {Select} from "./components/Select";
import {
    setupProjections, puwg2ll, utmZone, puwg2utm, CoordinatesArray, CoordinatesXY,
    utm2puwg
} from "./logic/proj4defs";
import {orto} from "./capabilities/orto";
import {topo} from "./capabilities/topo";
import {calc} from "./logic/calc";

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

interface FetchState {
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
function toKM(v: number) {
    return Math.round(v / 1000) * 1000;
}
function pairToObj(arr: CoordinatesArray) {
    return {
        x: arr[0],
        y: arr[1]
    }
}
class Fetch extends React.Component<{},FetchState> {

    constructor(props: {}) {
        super(props);
        this.state = getParameters();/*{
            source: _(LAYERS).keys().head(),
            z: _(LEVELS).keys().map(Number).head(),
            box: {
                x1: NaN,
                y1: NaN,
                x2: NaN,
                y2: NaN
            }
        }*/
    }

    componentDidMount() {
        this.setState(getParameters());
    }

    render() {
        const {box} = this.state;
        const zone = utmZone(puwg2ll([box.x1, box.y1]));
        const puwg: CoordinatesArray[] = [
            [box.x1, box.y1],
            [box.x2, box.y1],
            [box.x2, box.y2],
            [box.x1, box.y2],
        ];
        var utmGrid = puwg
            .map(c => puwg2utm(zone, c))
            .map(c => c.map(toKM))
            .map(pairToObj);
        const {tileExact, tileSize} = calc(
            this.state,
            LAYERS[this.state.source].def
        );
        const canvasSize = {
            height: (tileExact.x2 - tileExact.x1) * tileSize.width,
            width: (tileExact.y2 - tileExact.y1) * tileSize.height
        };

        function puwgToPx(coord: CoordinatesXY): CoordinatesXY {
            return {
                x: (coord.x - box.x1) / (box.x2 - box.x1) * canvasSize.width,
                y: (coord.y - box.y2) / (box.y1 - box.y2) * canvasSize.height
            }
        }

        function utmToPx(coord: CoordinatesXY): CoordinatesXY {
            return puwgToPx(utm2puwg(zone, coord));
        }

        return <div>
            <Select values={_.mapValues(LAYERS, v=>v.label)}
                    value={this.state.source}
                    onChange={(layer) => this.setState({source: layer})}/>
            <Select values={LEVELS}
                    value={String(this.state.z)}
                    onChange={(level) => this.setState({z: Number(level)})}/>
            <svg id="canvas"
                 width={canvasSize.width} height={canvasSize.height}
                 style={{
                    border: 'solid 1px black',
                    transformOrigin: '0 0',
                    width: '99%',
                    height: 'auto'
            }}>
                {_.range(utmGrid[0].x - 1000, utmGrid[1].x + 1000, 1000).map(x => {
                    var p1 = utmToPx({x: x, y: utmGrid[0].y - 1000});
                    var p2 = utmToPx({x: x, y: utmGrid[2].y + 1000});
                    return <line
                        key={x}
                        x1={p1.x} y1={p1.y}
                        x2={p2.x} y2={p2.y}
                        style={{
                            stroke:'black',
                            strokeOpacity: 0.8,
                            strokeWidth: '1mm'
                        } as any}
                    />
                })}
            </svg>
        </div>;
    }
}

setupProjections();

ReactDOM.render(
    <Fetch/>,
    document.getElementById("root")
);