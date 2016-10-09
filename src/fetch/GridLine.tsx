import * as React from "react";
import {CoordinatesXY} from "../logic/proj4defs";

interface GridLineProps {
    line: {
        p1: CoordinatesXY,
        p2: CoordinatesXY
    }
}

export class GridLine extends React.Component<GridLineProps,{}> {
    render() {
        const {p1, p2} = this.props.line;
        const style = {
            stroke: 'black',
            strokeOpacity: 0.8,
            strokeWidth: '0.8mm'
        };
        return <line
            x1={p1.x} y1={p1.y}
            x2={p2.x} y2={p2.y}
            style={style as any}
        />
    }
}