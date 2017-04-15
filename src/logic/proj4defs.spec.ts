import {setupProjections} from "./proj4defs";
import * as proj4 from "proj4";
import * as _ from "lodash";

declare var __filename:string;

describe(__filename, function () {
    setupProjections();
    it('pugw', function () {
        const puwg = {x: 46000, y: 500100};
        const latLon = proj4("PUWG92", "WGS84", _.clone(puwg));

        const back = _.mapValues(proj4("WGS84", "PUWG92", _.clone(latLon)), Math.round);
        expect(puwg).toEqual(back);
        expect(_.mapValues(latLon, v => _.round(v, 2))).toEqual({
            x: 12.35,
            y: 52.18
        });
    });
});