import * as React from "react";
import {CoordinatesXY, CoordinatesArray, utmZone, puwg2ll, puwg2utm, utm2puwg} from "../logic/proj4defs";
import {GridLine} from "./GridLine";
import {Box} from "../fetch";
import {Dimentions} from "../definitions/capabilities";

interface MapGridProps {
    step?: number,
    box: Box,
    canvasSize: Dimentions
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

function angleDeg(p1: CoordinatesXY, p2: CoordinatesXY): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
}

function toXY(coord: CoordinatesArray): CoordinatesXY {
    return {
        x: coord[0],
        y: coord[1]
    }
}
export class MapGrid extends React.Component<MapGridProps,{}> {
    render() {
        const {step = 1000, box, canvasSize} = this.props;
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

        function puwgToPx(coord: CoordinatesXY): CoordinatesXY {
            return {
                x: (coord.x - box.x1) / (box.x2 - box.x1) * canvasSize.width,
                y: (coord.y - box.y2) / (box.y1 - box.y2) * canvasSize.height
            }
        }

        function utmToPx(coord: CoordinatesXY): CoordinatesXY {
            return puwgToPx(utm2puwg(zone, coord));
        }

        console.log(utmGrid,
            utmToPx(pairToObj(puwg2utm(zone, puwg[0]))),
            utmToPx(pairToObj(puwg2utm(zone, puwg[1])))
        );
        // const angle = [utmToPx(utmGrid[0]), utmToPx(utmGrid[1])];

        const verticalLines = _.range(utmGrid[0].x - step, utmGrid[1].x + step, step)
            .map(x => ({
                p1: utmToPx({x, y: utmGrid[0].y - step}),
                p2: utmToPx({x, y: utmGrid[2].y + step})
            }))
            .map((line, idx) => <GridLine key={idx} line={line}/>);
        const horizontalLines = _.range(utmGrid[0].y - step, utmGrid[2].y + step, step)
            .map(y => ({
                p1: utmToPx({x: utmGrid[0].x - step, y}),
                p2: utmToPx({x: utmGrid[2].x + step, y})
            }))
            .map((line, idx) => <GridLine key={idx} line={line}/>);
        return <g>
            {verticalLines}
            {horizontalLines}
        </g>
    }
}