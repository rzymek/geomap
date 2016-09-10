
function getOziMap(filename, calibrations, width, height) {
    var corners = [
        {x: 0, y: 0},
        {x: width, y: 0},
        {x: width, y: height},
        {x: 0, y: height}
    ];
    return  'OziExplorer Map Data File Version 2.2\r\n' +
            filename + '\r\n' +
            filename + '.png\r\n' +
            '1 ,Map Code,\r\n' +
            'WGS 84,WGS 84,   0.0000,   0.0000,WGS 84\r\n' +
            'Reserved 1\r\n' +
            'Reserved 2\r\n' +
            'Magnetic Variation, , , E\r\n'+
            'Map Projection, Latitude / Longitude, Polycal, No, AutoCalOnly, No, BSBUseWPX, No\r\n'+
            calibrations.map(function (p, idx) {
                return 'Point' + dig2(idx + 1) + ', xy , ' + corners[idx].x + ', ' + corners[idx].y + ', in, deg, ' + toDegMin(p.lat) + ', N, ' + toDegMin(p.lon) + ', E, grid, , , , N';
            }).join('\r\n') + '\r\n' +
            range(calibrations.length + 1, 30, function (i) {
                return 'Point' + dig2(i) + ',xy,  ,  ,in, deg,   , ,N, ,  ,W, grid,   ,           ,           ,N';
            }).join('\r\n') + '\r\n' +
            'Projection Setup,,,,,,,,,,\r\n' +
            'Map Feature = MF ; Map Comment = MC     These follow if they exist\r\n' +
            'Track File = TF      These follow if they exist\r\n' +
            'Moving Map Parameters = MM?    These follow if they exist\r\n' +
            'MM0,Yes\r\n' +
            'MMPNUM,' + calibrations.length + '\r\n' +
            calibrations.map(function (p, idx) {
                return 'MMPXY, ' + (idx + 1) + ', ' + corners[idx].x + ', ' + corners[idx].y
            }).join('\r\n') + '\r\n' +
            calibrations.map(function (p, idx) {
                return 'MMPLL, ' + (idx + 1) + ', ' + p.lon + ', ' + p.lat;
            }).join('\r\n') + '\r\n' +
            'MOP,Map Open Position,0,0\r\n' +
            'IWH,Map Image Width/Height, ' + width + ',' + height;

    function range(a, b, f) {
        var result = [];
        for (var i = a; i <= b; i++) {
            result.push(f(i));
        }
        return result;
    }

    function dig2(i) {
        return (i < 10) ? '0' + i : i;
    }

    function toDegMin(coord) {
        var deg = Math.floor(coord);
        var min = (coord - deg) * 60.0;
        return deg + ', ' + min;
    }
}