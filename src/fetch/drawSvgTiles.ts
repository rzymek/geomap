export  default function drawSvgTiles(url:string, tileBounds:Box, tileExact, canvas:SVGSVGElement, tileDim:Dim, tileZ:number) {

    const tiles = [];
    for (var x = tileBounds.x1; x <= tileBounds.x2; x++) {
        for (var y = tileBounds.y1; y <= tileBounds.y2; y++) {
            tiles.push({x: x, y: y});
        }
    }
    var total = tiles.length;
    var status = document.getElementById('status');
    var canvas = document.getElementById('canvas');
    var canvasSize = {
        height: (tileExact.x2 - tileExact.x1) * tileDim.width,
        width: (tileExact.y2 - tileExact.y1) * tileDim.height
    };
    canvas.setAttribute('width', canvasSize.width);
    canvas.setAttribute('height', canvasSize.height);
//            canvas.viewBox.baseVal.x = -canvasSize.width;
//            canvas.viewBox.baseVal.y = -canvasSize.height;
//            canvas.viewBox.baseVal.width = 3*canvasSize.width;
//            canvas.viewBox.baseVal.height = 3*canvasSize.height;
    canvas.setAttribute('viewBox', `0 0 ${canvasSize.width} ${canvasSize.height}`);
    document.getElementById('info').innerHTML = canvasSize.width.toFixed(0) + ' x ' + canvasSize.height.toFixed(0);
    var offset = {
        y: (tileExact.x1 - Math.floor(tileExact.x1)) * tileDim.height,
        x: (tileExact.y1 - Math.floor(tileExact.y1)) * tileDim.width
    };
    const layer = svgLayer(canvas as SVGSVGElement, 'tiles');
    tiles.forEach(function (tile) {
        var x = tile.y - tileBounds.y1;
        var y = tile.x - tileBounds.x1;
        const image = svgNew('image')as SVGImageElement;
        image.width.baseVal.value = tileDim.width;
        image.height.baseVal.value = tileDim.height;
        image.x.baseVal.value = -offset.x + x * tileDim.width;
        image.y.baseVal.value = -offset.y + y * tileDim.height;
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', interpolate(url, tile, tileZ));
        layer.appendChild(image);
    });
}

function svgLayer(svg:SVGSVGElement, name:string):SVGGElement {
    var layer = svgNew('g') as SVGGElement;
    layer.setAttribute('inkscape:groupmode', 'layer');
    layer.setAttribute('inkscape:label', name);
    svg.appendChild(layer);
    return layer;
}

function svgLine(p1:Point, p2:Point):SVGLineElement {
    var line = svgNew('line') as SVGLineElement;
    line.setAttribute('x1', p1.x as string);
    line.setAttribute('y1', p1.y as string);
    line.setAttribute('x2', p2.x as string);
    line.setAttribute('y2', p2.y as string);
    line.style.stroke = 'black';
    line.style.strokeOpacity = 0.8 as string;
    line.style.strokeWidth = '1mm';
    return line;
}

function svgNew(tag):SVGElement {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}
function interpolate(url:string, tile:Point, tileZ:number):string {
    return url
        .replace('{{z}}', Math.floor(tileZ).toString())
        .replace('{{x}}', Math.floor(tile.x).toString())
        .replace('{{y}}', Math.floor(tile.y).toString());
}
