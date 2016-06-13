interface Dim {
    width:number,
    height:number
}
interface  Point {
    x:number,
    y:number
}

interface  Tile {
    scaleDenominator:number,
    matrixSize:Dim
}
interface TileSource {
    url:string,
    name:string,
    format:string,
    tiles:{
        EPSG_2180:Tile[]
    }
}
interface Box {
    x1:number,
    y1:number,
    x2:number,
    y2:number
}
interface Params {
    z:number
}
