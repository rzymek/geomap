import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {puwg2ll, utmZone, puwg2utm, CoordinatesArray, CoordinatesXY, utm2puwg} from "../logic/proj4defs";
import {calc} from "../logic/calc";
import {GridLine} from "./GridLine";
import {MapTiles} from "./MapTiles";
import {MapParams} from "../fetch";


function toKM(v: number) {
    return Math.round(v / 1000) * 1000;
}
function pairToObj(arr: CoordinatesArray) {
    return {
        x: arr[0],
        y: arr[1]
    }
}
interface SVGMapProps {
    params: MapParams
    def: any
}
export class SVGMap extends React.Component<SVGMapProps,{}> {
    render() {
        const {params} = this.props;
        const {def} = this.props;
        const {box} = params;

        const zone = utmZone(puwg2ll([box.x1, box.y1]));
        const puwg: CoordinatesArray[] = [
            [box.x1, box.y1],
            [box.x2, box.y1],
            [box.x2, box.y2],
            [box.x1, box.y2],
        ];

        const utmGrid = puwg
            .map(c => puwg2utm(zone, c))
            .map(c => c.map(toKM))
            .map(pairToObj);
        const {tileExact, tileSize} = calc(
            params,
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

        const GRID_STEP = 1000;
        return <svg id="canvas"
                    viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
                    width={canvasSize.width} height={canvasSize.height}
                    style={{
            border: 'solid 1px black',
            transformOrigin: '0 0',
            width: '99%',
            height: 'auto'
        }}>
            <MapTiles def={def} params={params}/>
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
        </svg>;
    }
}
