import "jest";
import { parseUrlParameters } from "./url-parameters";

describe("url-parameters", () => {
    const url = "?34UEC0835998832;34UEC2364188026";
    it(url, () => {
        expect(parseUrlParameters(url)).toEqual(['34UEC0835998832', '34UEC2364188026']);
    })
    it('empty', () => {
        expect(parseUrlParameters('')).toEqual([]);
    })
});