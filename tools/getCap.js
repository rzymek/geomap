var http = require('http');
var fs = require('fs');
var vm = require('vm');
var parseString = require('xml2js').parseString;

function processCapabilites(cap) {
    try {
        var contents = cap.Capabilities.Contents[0];
        var layer = contents.Layer[0];
        var limits = layer.TileMatrixSetLink.map(function (set) {
            return {
                name: set.TileMatrixSet[0],
                limits: set.TileMatrixSetLimits[0].TileMatrixLimits.reduce(function (a, b) {
                    var idx = 'layer' + b.TileMatrix[0].split(':')[2]
                    a[idx] = {
                        row: {
                            min: parseFloat(b.MinTileRow[0]),
                            max: parseFloat(b.MaxTileRow[0])
                        },
                        col: {
                            min: parseFloat(b.MinTileCol[0]),
                            max: parseFloat(b.MaxTileCol[0])
                        }
                    };
                    return a;
                }, {})
            };
        }).reduce(function (a, b) {
            a[b.name.replace(':', '_')] = b.limits;
            return a;
        }, {});
        return {
            name: layer['ows:Identifier'][0],
            format: layer.Format[0],
            tiles: contents.TileMatrixSet.reduce(function (a, b) {
                var epgs = b['ows:Identifier'][0].replace(':', '_');
                a[epgs] = b.TileMatrix.reduce(function (a, b) {
                    var layerIdx = 'layer' + b['ows:Identifier'][0].split(':')[2];
                    a.push({
                        scaleDenominator: parseFloat(b.ScaleDenominator[0]),
                        origin: b.TopLeftCorner[0].split(' ').map(parseFloat),
                        tileSize: {
                            width: parseFloat(b.TileWidth[0]),
                            height: parseFloat(b.TileHeight[0])
                        },
                        matrixSize: {
                            width: parseFloat(b.MatrixWidth[0]),
                            height: parseFloat(b.MatrixHeight[0])
                        },
                        limits: limits[epgs][layerIdx]
                    });
                    return a;
                }, []);
                return a;
            }, {})
        };
    } catch (error) {
        console.error(error);
    }
}
function processXML(xml, callback) {
    parseString(xml, function (err, result) {
        callback(processCapabilites(result));
    });
}
var services = {
    topo: '/wss/service/WMTS/guest/wmts/TOPO',
    orto: '/wss/service/WMTS/guest/wmts/ORTO',
    vmap: '/wss/service/WMTS/guest/wmts/VMAP'
};
function fetch(type, callback) {
    http.get({
        host: 'mapy.geoportal.gov.pl',
        port: 80,
        path: services[type]
                + '?SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.3.0'
    }, function (res) {
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function () {
            processXML(data, callback);
        });
    }).on('error', function (e) {
        console.log(e);
    });
}

function read() {
    fs.readFile('../docs/GetCapabilities.xml', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        processXML(data);
    });
}

Object.keys(services).forEach(function (type) {
    fetch(type, function (info) {
        var js = 'var ' + type + ' = '
                + JSON.stringify(info, null, ' ');
        fs.writeFile('../capabilities/'+type+'.js', js);
    });
});



