
function getOziMap(filename, calibrations, width, height) {
    var corners = [
        {x: 0, y: 0},
        {x: width, y: 0},
        {x: width, y: height},
        {x: 0, y: height}
    ];
    return  'OziExplorer Map Data File Version 2.2\n' +
            filename + '\n' +
            filename + '.png\n' +
            '1 ,Map Code,\n' +
            'WGS 84,WGS 84,   0.0000,   0.0000,WGS 84\n' +
            'Reserved 1\n' +
            'Reserved 2\n' +
            'Magnetic Variation, , , E\n'+
            'Map Projection, Latitude / Longitude, Polycal, No, AutoCalOnly, No, BSBUseWPX, No\n'+
            calibrations.map(function (p, idx) {
                return 'Point' + dig2(idx + 1) + ', xy , ' + corners[idx].x + ', ' + corners[idx].y + ', in, deg, ' + toDegMin(p.lat) + ', N, ' + toDegMin(p.lon) + ', E, grid, , , , N';
            }).join('\n') + '\n' +
            range(calibrations.length + 1, 30, function (i) {
                return 'Point' + dig2(i) + ',xy,  ,  ,in, deg,   , ,N, ,  ,W, grid,   ,           ,           ,N';
            }).join('\n') + '\n' +
            'Projection Setup,,,,,,,,,,\n' +
            'Map Feature = MF ; Map Comment = MC     These follow if they exist\n' +
            'Track File = TF      These follow if they exist\n' +
            'Moving Map Parameters = MM?    These follow if they exist\n' +
            'MM0,Yes\n' +
            'MMPNUM,' + calibrations.length + '\n' +
            calibrations.map(function (p, idx) {
                return 'MMPXY, ' + (idx + 1) + ', ' + corners[idx].x + ', ' + corners[idx].y
            }).join('\n') + '\n' +
            calibrations.map(function (p, idx) {
                return 'MMPLL, ' + (idx + 1) + ', ' + p.lon + ', ' + p.lat;
            }).join('\n') + '\n' +
            'MOP,Map Open Position,0,0\n' +
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