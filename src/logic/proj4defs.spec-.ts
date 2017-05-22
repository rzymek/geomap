import { PUGW92, WGS84, setupProjections, utm2mgrs } from "./proj4defs";
import * as proj4 from "proj4";
import * as _ from "lodash";

declare var __filename: string;

describe(__filename, () => {
    setupProjections();
    it('pugw', () => {
        const puwg = { x: 46000, y: 500100 };
        const latLon = proj4(PUGW92, WGS84, _.clone(puwg));

        const back = _.mapValues(proj4(WGS84, PUGW92, _.clone(latLon)), Math.round);
        expect(puwg).toEqual(back);
        expect(_.mapValues(latLon, v => _.round(v, 2))).toEqual({
            x: 12.35,
            y: 52.18
        });
    });
    it('mgrs', () => {
        expect(utm2mgrs(34, { x: 502049, y: 5785508 })).toEqual({
            zone: '34U',
            grid: 'EC',
            x: '02049',
            y: '85508'
        });
    })
});