import * as React from "react";
import { calc } from "../logic/calc";
import { MapTiles } from "./MapTiles";
import { MapParams } from "../fetch";
import { MapGrid } from "./MapGrid";
import { Capabilities } from "../definitions/capabilities";

interface SVGMapProps {
    params: MapParams
    def: Capabilities
}
export class SVGMap extends React.Component<SVGMapProps, {}> {
    render() {
        const { params } = this.props;
        const { def } = this.props;
        const { box } = params;

        const { tileExact, tileSize } = calc(
            params,
            def
        );
        const canvasSize = {
            height: (tileExact.x2 - tileExact.x1) * tileSize.width,
            width: (tileExact.y2 - tileExact.y1) * tileSize.height
        };

        return <svg id="canvas"
            viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
            width={canvasSize.width} height={canvasSize.height}
            style={{
                border: 'solid 1px black',
                transformOrigin: '0 0',
                width: '99%',
                height: 'auto'
            }}>
            <MapGrid box={box} canvasSize={canvasSize} params={{
                fontSize: this.props.params.fontSize,
                gridLineWidth: this.props.params.gridLineWidth,
                north: this.props.params.north,
            }}>
                <MapTiles def={def} params={params} />
            </MapGrid>
        </svg>;
    }
}
