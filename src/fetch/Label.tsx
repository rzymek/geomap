import * as React from "react";
import { CoordinatesXY } from "../logic/proj4defs";

interface LabelProps {
    position: CoordinatesXY,
    value: string,
    rotate?: number
}
interface LabelState {
    bbox: SVGRect
}

export class Label extends React.Component<LabelProps, LabelState> {
    private textRef: SVGTextElement;

    constructor() {
        super();
        this.state = {
            bbox: {} as SVGRect
        }
    }
    private getTranform() {
        const { rotate } = this.props;
        const { bbox } = this.state;
        if (rotate === undefined || bbox.x === undefined) {
            return undefined;
        }
        return `rotate(
            ${rotate} 
            ${(bbox.x + bbox.width / 2)} 
            ${(bbox.y + bbox.height / 2)}
        )`;
    }
    componentDidMount() {
        this.setState({
            bbox: this.textRef.getBBox()
        })
    }
    render() {
        const { x, y } = this.props.position;
        const { bbox } = this.state;
        const style = {
            textAnchor: 'middle',
            textAlign: 'center',
            fontSize: 25,
        };
        return <g>
            <rect fill="white"
                transform={this.getTranform()}
                x={bbox.x} y={bbox.y}
                width={bbox.width} height={bbox.height} />
            <text
                transform={this.getTranform()}
                ref={node => { this.textRef = node }}
                x={x} y={y}
                fill="#000"
                style={style}
            >{this.props.value}</text>
        </g >
    }
}