import * as React from "react";
import { CoordinatesXY } from "../logic/proj4defs";
import * as _ from "lodash";

interface LabelProps {
    position: CoordinatesXY,
    value: string,
    fontSize: number | string
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
        const x = bbox.x + bbox.width / 2;
        const y = bbox.y + bbox.height / 2;
        return `rotate(${rotate} ${x} ${y})`;
    }
    componentDidUpdate() {
        if (this.state.bbox.x !== undefined) {
            return;
        }
        this.setState({
            bbox: this.textRef.getBBox()
        })
    }
    componentWillReceiveProps() {
        this.setState({
            bbox: {} as SVGRect
        })
    }
    private getTranslate() {
        const { bbox } = this.state;
        const { x, y } = this.props.position;
        const undefinedToBBox = (v:number) => v === undefined ? bbox.height : 0;
        const tx = undefinedToBBox(x)
        const ty = undefinedToBBox(y);
        if(_.some([tx,ty], _.isUndefined) || _.every([tx,ty], v => v === 0)) {
            return undefined;
        }
        return `translate(${tx}, ${ty})`
    }
    render() {
        const { bbox } = this.state;
        const { x = 0, y = 0 } = this.props.position;
        const { fontSize } = this.props;
        const style = {
            textAnchor: 'middle',
            textAlign: 'center',
            fontSize,
        };
        return <g transform={this.getTranslate()}>
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