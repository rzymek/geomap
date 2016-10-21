import * as React from "react";
import * as _ from "lodash";
import {CoordinatesXY} from "../logic/proj4defs";
import {calc} from "../logic/calc";
import {MapParams} from "../fetch";
import {Capabilities} from "../definitions/capabilities";

interface MapTilesProps{
    params: MapParams,
    def: Capabilities
}
export class MapTiles extends React.Component<MapTilesProps,{}> {
    render() {
        const {params, def} = this.props;

        const {tileExact, tileSize} = calc(
            params,
            def
        );
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
            .replace('{{z}}', Math.floor(params.z).toString())
            .replace('{{x}}', Math.floor(tile.x).toString())
            .replace('{{y}}', Math.floor(tile.y).toString());

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
            ).value();

        return <g>{tiles}</g>
    }
}