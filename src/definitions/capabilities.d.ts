interface Dimentions {
    width: number,
    height: number
}
interface MinMax {
    min: number,
    max: number
}

interface TilesDef {
    scaleDenominator: number,
    origin: number[],
    tileSize: Dimentions,
    matrixSize: Dimentions,
    limits: {
        row: MinMax,
        col: MinMax
    }
}
export interface Capabilities {
    name: string,
    format: string,
    tiles: {
        EPSG_2180: TilesDef[],
        EPSG_4326: TilesDef[]
    },
    url: string
}