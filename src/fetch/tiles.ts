import './getTileBounds.d.ts'

function tiles(source:TileSource, params:Params, box:Box) {
    const url = `${source.url}?SERVICE=WMTS&
    REQUEST=GetTile&
    VERSION=1.0.0&
    LAYER=${source.name}&
    STYLE=default&
    FORMAT=${source.format}&
    TILEMATRIXSET=EPSG:2180&
    TILEMATRIX=EPSG:2180:{{z}}&
    TILEROW={{x}}&
    TILECOL={{y}}`;

    function interpolate(tile) {
        return url
            .replace('{{z}}', Math.floor(params.z).toString())
            .replace('{{x}}', Math.floor(tile.x) as string)
            .replace('{{y}}', Math.floor(tile.y) as string);
    }

    const {bounds, exact, tileSize} = getTileBounds(source, box, params.z);

    const tiles = [];
    for (let x = bounds.x1; x <= bounds.x2; x++) {
        for (let y = bounds.y1; y <= bounds.y2; y++) {
            tiles.push({x: x, y: y});
        }
    }
    const total = tiles.length;
    const status = document.getElementById('status');
    const canvas = document.getElementById('canvas');
    const canvasSize = {
        height: (exact.x2 - exact.x1) * tileSize.width,
        width: (exact.y2 - exact.y1) * tileSize.height
    };
}