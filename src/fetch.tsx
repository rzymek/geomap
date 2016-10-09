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
import {GridLine} from "./fetch/GridLine"

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
        this.state = getParameters();
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
        const def: any = LAYERS[this.state.source].def;
        const url: string = `${def.url}?
            SERVICE=WMTS&REQUEST=GetTile&
            VERSION=1.0.0&
            LAYER=${def.name}&
            STYLE=default&
            FORMAT=${def.format}&
            TILEMATRIXSET=EPSG:2180&
            TILEMATRIX=EPSG:2180:{{z}}&
            TILEROW={{x}}&
            TILECOL={{y}}`.replace(/\s/g, '');
        const interpolate = (tile: CoordinatesXY) => url
            .replace('{{z}}', Math.floor(this.state.z).toString())
            .replace('{{x}}', Math.floor(tile.x).toString())
            .replace('{{y}}', Math.floor(tile.y).toString());

        const utmGrid = puwg
            .map(c => puwg2utm(zone, c))
            .map(c => c.map(toKM))
            .map(pairToObj);
        const {tileExact, tileSize} = calc(
            this.state,
            def
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

        const epsilon = 1e-6;
        const tileBounds = {
            x1: Math.floor(tileExact.x1 + epsilon),
            y1: Math.floor(tileExact.y1 + epsilon),
            x2: Math.floor(tileExact.x2 - epsilon),
            y2: Math.floor(tileExact.y2 - epsilon)
        };
        const offset = {
            y: (tileExact.x1 - Math.floor(tileExact.x1)) * tileSize.height,
            x: (tileExact.y1 - Math.floor(tileExact.y1)) * tileSize.width
        };
        const tiles = _.chain(_.range(tileBounds.x1, tileBounds.x2 + 1))
            .map(x => _.range(tileBounds.y1, tileBounds.y2 + 1).map(y => ({x, y})))
            .flatten()
            .map((tile: CoordinatesXY) => ({
                x: tile.y - tileBounds.y1,
                y: tile.x - tileBounds.x1,
                url: interpolate(tile)
            })).map(pos => ({
                x: -offset.x + pos.x * tileSize.width,
                y: -offset.y + pos.y * tileSize.height,
                width: tileSize.width,
                height: tileSize.height,
                url: pos.url
            })).map(it =>
                <image key={it.url}
                       href={it.url}
                       x={it.x}
                       y={it.y}
                       width={it.width}
                       height={it.height}/>
            ).value()

        const GRID_STEP = 1000;
        return <div>
            <Select values={_.mapValues(LAYERS, v=>v.label)}
                    value={this.state.source}
                    onChange={(layer) => this.setState({source: layer})}/>
            <Select values={LEVELS}
                    value={String(this.state.z)}
                    onChange={(level) => this.setState({z: Number(level)})}/>
            <svg id="canvas"
                 viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
                 width={canvasSize.width} height={canvasSize.height}
                 style={{
                    border: 'solid 1px black',
                    transformOrigin: '0 0',
                    width: '99%',
                    height: 'auto'
            }}>
                {tiles}
                {_.range(utmGrid[0].x - GRID_STEP, utmGrid[1].x + GRID_STEP, GRID_STEP)
                    .map(x => ({
                        p1: utmToPx({x, y: utmGrid[0].y - GRID_STEP}),
                        p2: utmToPx({x, y: utmGrid[2].y + GRID_STEP})
                    }))
                    .map((line, idx) => <GridLine key={idx} line={line}/>)
                }
                {_.range(utmGrid[0].y - GRID_STEP, utmGrid[2].y + GRID_STEP, GRID_STEP)
                    .map(y => ({
                        p1: utmToPx({x: utmGrid[0].x - GRID_STEP, y}),
                        p2: utmToPx({x: utmGrid[2].x + GRID_STEP, y})
                    }))
                    .map((line, idx) => <GridLine key={idx} line={line}/>)
                }
            </svg>
        </div>;
    }
}

setupProjections();

ReactDOM.render(
    <Fetch/>,
    document.getElementById("root")
);