import { Orientation } from "./areaSelector";
import * as _ from "lodash";

export enum PageHeight {
    A3 = 297,
    A4 = 210
}
const PAGE_MARGIN = 10 /*mm*/;

export function getScale({ selection, pageType, orientation, margin = PAGE_MARGIN }: {
    selection: ol.Coordinate[],
    pageType: PageHeight,
    orientation: Orientation,
    margin?: number/*mm*/
}):number {
    const index = orientation === Orientation.LANDSCAPE ? 1 : 0;
    const mapAreaLength = Math.abs(selection[1][index] - selection[0][index]);
    const pageLength = (pageType /*mm*/ - 2 * margin) / 1000; /*m*/
    return Math.round(mapAreaLength / pageLength);
}

export function getSelectionForScale({ scale, selection, pageType, orientation, margin = PAGE_MARGIN }: {
    scale: number,
    selection: ol.Coordinate[],
    pageType: PageHeight,
    orientation: Orientation,
    margin?: number/*mm*/
}):ol.Extent {
    const index = orientation === Orientation.LANDSCAPE ? 1 : 0;
    const otherIndex = (index + 1) % 2;
    const ISO216PaperRatio = 1 / Math.sqrt(2);
    const pageLength = (pageType /*mm*/ - 2 * PAGE_MARGIN) / 1000; /*m*/
    selection[1][index] = selection[0][index] + pageLength * scale;
    selection[1][otherIndex] = selection[0][otherIndex] + pageLength * scale / ISO216PaperRatio;
    return _.flatten(selection) as ol.Extent;
}