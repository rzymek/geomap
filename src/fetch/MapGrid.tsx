import * as React from "react";
import { CoordinatesXY, CoordinatesArray, utmZone, puwg2ll, puwg2utm, utm2puwg, utm2mgrs } from "../logic/proj4defs";
import { GridLine } from "./GridLine";
import { Label } from "./Label";
import { Box } from "../fetch";
import { Dimentions } from "../definitions/capabilities";
import * as _ from "lodash";
import { lineIntersecion } from "../logic/lineIntersection";
import { getUTMGrid } from "../logic/utmGrid";
import {NorthFixing} from "./NorthFixing";

interface MapGridProps {
    step?: number,
    box: Box,
    canvasSize: Dimentions,
    params: {
        fontSize: number,
        gridLineWidth: number,
        north: NorthFixing
    }
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
                    y: undefined,
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
                    x: undefined,
                    y: v.intersection.y,
                },
                label: v.label,
                rotation: -90
            }));
    }
    private getGridRotation(utmGrid: CoordinatesXY[]): string {
        const angle = angleDeg(
            this.utmToPx(utmGrid[0]),
            this.utmToPx({ x: utmGrid[1].x, y: utmGrid[0].y })
        );
        return `rotate(${-angle})`;
    }
    private utmToPx(coord: CoordinatesXY): CoordinatesXY {
        const { box, canvasSize } = this.props;
        const zone = utmZone(puwg2ll([box.x1, box.y1]));
        return this.puwgToPx(utm2puwg(zone, coord));
    }

    private puwgToPx(coord: CoordinatesXY): CoordinatesXY {
        const { box, canvasSize } = this.props;
        return {
            x: (coord.x - box.x1) / (box.x2 - box.x1) * canvasSize.width,
            y: (coord.y - box.y2) / (box.y1 - box.y2) * canvasSize.height
        }
    }
    private formatUTM(zone: number, x: number, y: number, field: string): string {
        const mgrs = utm2mgrs(zone, { x, y });
        return `${mgrs.grid} ${(mgrs as any)[field]}`
        // return `${mgrs.zone} ${mgrs.grid} ${(mgrs as any)[field]}`
        // return `${zone} ${({x,y}as any)[field]}`; //full UTM
    }
    render() {
        const { step = 1000, box, canvasSize } = this.props;
        const { zone, utmGrid } = getUTMGrid(box);

        const verticalLines: LabeledLine[] = _.range(utmGrid[0].x - step, utmGrid[1].x + step, step)
            .map(x => ({
                p1: this.utmToPx({ x, y: utmGrid[0].y - step }),
                p2: this.utmToPx({ x, y: utmGrid[2].y + step }),
                label: this.formatUTM(zone, x, utmGrid[0].y, 'x')
            }));
        const horizontalLines: LabeledLine[] = _.range(utmGrid[0].y - step, utmGrid[2].y + step, step)
            .map(y => ({
                p1: this.utmToPx({ x: utmGrid[0].x - step, y }),
                p2: this.utmToPx({ x: utmGrid[2].x + step, y }),
                label: this.formatUTM(zone, utmGrid[0].x, y, 'y')
            }));
        const rotateMap = this.props.params.north === NorthFixing.MGRS;
        return <g>
            <g transform={rotateMap ? this.getGridRotation(utmGrid) : undefined}>
                {this.props.children}
                <g id="grid-lines" >
                    {_.concat(
                        verticalLines,
                        horizontalLines
                    ).map((line, idx) =>
                        <GridLine key={idx}
                            strokeWidth={this.props.params.gridLineWidth}
                            line={line} />
                        )}
                </g>
            </g>
            <g id="grid-labels">
                {_.concat(
                    this.getLeftLabels(horizontalLines),
                    this.getTopLabels(verticalLines)
                ).map((value, idx) =>
                    <Label key={idx}
                        fontSize={this.props.params.fontSize}
                        position={value.position}
                        value={value.label}
                        rotate={value.rotation}
                    />)}
            </g>
        </g>
    }
}