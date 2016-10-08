interface Def {
    source?: string,
    z?: number,
    title?: string,
    box?: {
        x1: number,
        y1: number,
        x2: number,
        y2: number
    }
}
export function calc(def:Def, source:any) {
    const {box} = def;

    const scaleDenominators = source.tiles.EPSG_2180.map((it:any) => it.scaleDenominator);
    const matrixSizes = source.tiles.EPSG_2180.map((it:any) => it.matrixSize);
    const topLeftCorner = {
        y: 850000.0, //X
        x: 100000.0//Y
    };
    const tileWidth = 512;
    const tileHeight = 512;

    const tileZ = def.z;
    const bBoxMinX = box.x1;
    const bBoxMaxX = box.x2;
    const bBoxMinY = box.y1;
    const bBoxMaxY = box.y2;

    const scaleDenominator = scaleDenominators[tileZ];
    const matrixWidth = matrixSizes[tileZ].width;
    const matrixHeight = matrixSizes[tileZ].height;

    const metersPerUnit = 1;
    const pixelSpan = scaleDenominator * 0.28e-3 / metersPerUnit;

    const tileSpanX = tileWidth * pixelSpan;
    const tileSpanY = tileHeight * pixelSpan;

    const tileMatrixMinX = topLeftCorner.x;
    const tileMatrixMaxY = topLeftCorner.y;
    const tileMatrixMaxX = tileMatrixMinX + tileSpanX * matrixWidth;
    const tileMatrixMinY = tileMatrixMaxY - tileSpanY * matrixHeight;

    let tileMinCol = (bBoxMinX - tileMatrixMinX) / tileSpanX;
    let tileMaxCol = (bBoxMaxX - tileMatrixMinX) / tileSpanX;
    let tileMinRow = (tileMatrixMaxY - bBoxMaxY) / tileSpanY;
    let tileMaxRow = (tileMatrixMaxY - bBoxMinY) / tileSpanY;
    // to avoid requesting out-of-range tiles
    if (tileMinCol < 0)
        tileMinCol = 0;
    if (tileMaxCol >= matrixWidth)
        tileMaxCol = matrixWidth - 1;
    if (tileMinRow < 0)
        tileMinRow = 0;
    if (tileMaxRow >= matrixHeight)
        tileMaxRow = matrixHeight - 1;

    /*
     document.writeln(JSON.stringify([
     tileMinRow, tileMinCol,
     tileMaxRow, tileMaxCol
     ]));
     */
    return {
        tileSize: {
            width: tileWidth,
            height: tileHeight
        },
        tileExact: {
            x1: tileMinRow,
            y1: tileMinCol,
            x2: tileMaxRow,
            y2: tileMaxCol
        }
    };
}