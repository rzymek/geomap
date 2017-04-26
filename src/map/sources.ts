import * as _ from "lodash";

export interface Sources {
    [name: string]: ol.source.Tile
}
export function createSources(): Sources {
    return _.assign({
        'OpenStreetMap': new ol.source.OSM(),
        'OpenCycleMap': new ol.source.XYZ({
            url: 'http://tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
        }),
        'UMP': new ol.source.XYZ({
            url: 'http://tiles.ump.waw.pl/ump_tiles/{z}/{x}/{y}.png'
        })
    }, ...[
        'Road',
        'Aerial',
        'AerialWithLabels'
    ].map((style: string) => ({
        ['Bing: ' + style]: new ol.source.BingMaps({
            key: 'Apszeg5_v01g6cZjl_9VTYEcC_qchUYPEfVR64qdbgV5aRKfbYTbMeitv3bLEPkq',
            imagerySet: style
        })
    }))/*, ...['osm', 'sat'].map((style: string) => ({
     ['MapQuest: ' + style]: new ol.source.MapQuest({
     layer: style
     })
     }))*/) as Sources;
}