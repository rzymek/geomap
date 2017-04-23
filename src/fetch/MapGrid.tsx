import * as React from "react";
import { CoordinatesXY, CoordinatesArray, utmZone, puwg2ll, puwg2utm, utm2puwg } from "../logic/proj4defs";
import { GridLine } from "./GridLine";
import { Label } from "./Label";
import { Box } from "../fetch";
import { Dimentions } from "../definitions/capabilities";
import * as _ from "lodash";
import { lineIntersecion } from "../logic/lineIntersection";

interface MapGridProps {
    step?: number,
    box: Box,
    canvasSize: Dimentions
}

interface LabeledLine {
    p1: CoordinatesXY,
    p2: CoordinatesXY,
    label: string
}
interface LabelDefinition {
    position: CoordinatesXY,
    label: string,
    rotation?: number
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
export class MapGrid extends React.Component<MapGridProps, {}> {
    private getCorners() {
        const { canvasSize } = this.props;
        return {
            topLeft: { x: 0, y: 0 },
            topRight: { x: canvasSize.width, y: 0 },
            bottomRight: { x: canvasSize.width, y: canvasSize.height },
            bottomLeft: { x: 0, y: canvasSize.height }
        }
    }
    private getTopLabels(verticalLines: LabeledLine[]): LabelDefinition[] {
        const corners = this.getCorners();
        return verticalLines.map(line => ({
            intersection: lineIntersecion(
                { p1: corners.topLeft, p2: corners.topRight },
                line
            ),
            label: line.label
        }))
            .filter(v => v.intersection !== undefined)
            .map(v => ({
                position: {
                    x: v.intersection.x,
                    y: 16,
                },
                label: v.label
            }))
    }
    private getLeftLabels(horizontalLines: LabeledLine[]): LabelDefinition[] {
        const corners = this.getCorners();
        return horizontalLines.map(line => ({
            intersection: lineIntersecion(
                { p1: corners.topLeft, p2: corners.bottomLeft },
                line
            ),
            label: line.label
        }))
            .filter(v => v.intersection !== undefined)
            .map(v => ({
                position: {
                    x: 16,
                    y: v.intersection.y,
                },
                label: v.label,
                rotation: 90
            }));
    }
    render() {
        const { step = 1000, box, canvasSize } = this.props;
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

        // const angle = [utmToPx(utmGrid[0]), utmToPx(utmGrid[1])];

        const verticalLines: LabeledLine[] = _.range(utmGrid[0].x - step, utmGrid[1].x + step, step)
            .map(x => ({
                p1: utmToPx({ x, y: utmGrid[0].y - step }),
                p2: utmToPx({ x, y: utmGrid[2].y + step }),
                label: _.toString(x)
            }));
        const horizontalLines: LabeledLine[] = _.range(utmGrid[0].y - step, utmGrid[2].y + step, step)
            .map(y => ({
                p1: utmToPx({ x: utmGrid[0].x - step, y }),
                p2: utmToPx({ x: utmGrid[2].x + step, y }),
                label: _.toString(y)
            }));
        return <g>
            <g id="grid-lines">
                {_.concat(
                    verticalLines,
                    horizontalLines
                ).map(line =>
                    <GridLine key={line.label} line={line} />
                    )}
            </g>
            <g id="grid-labels">
                {_.concat(
                    this.getLeftLabels(horizontalLines),
                    this.getTopLabels(verticalLines)
                ).map((value, idx) =>
                    <Label key={idx}
                        position={value.position}
                        value={value.label}
                        rotate={value.rotation}
                    />)}
            </g>
        </g>
    }
}