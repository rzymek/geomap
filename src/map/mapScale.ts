import { Orientation } from "./areaSelector";
import * as _ from "lodash";
import { WebMercatorMapArea } from "./utmArea"

export enum PageHeight {
    A3 = 297,
    A4 = 210
}
const PAGE_MARGIN = 10 /*mm*/;

export function getScale({ selection, pageType, orientation, margin = PAGE_MARGIN }: {
    selection: WebMercatorMapArea,
    pageType: PageHeight,
    orientation: Orientation,
    margin?: number/*mm*/
}): number {
    const index = orientation === Orientation.LANDSCAPE ? 1 : 0;
    const mapAreaLength = Math.abs(selection.bottomRight[index] - selection.topLeft[index]);
    const pageLength = (pageType /*mm*/ - 2 * margin) / 1000; /*m*/
    return Math.round(mapAreaLength / pageLength);
}

export function getSelectionForScale({ scale, selection, pageType, orientation, margin = PAGE_MARGIN }: {
    scale: number,
    selection: WebMercatorMapArea,
    pageType: PageHeight,
    orientation: Orientation,
    margin?: number/*mm*/
}): WebMercatorMapArea {
    const index = orientation === Orientation.LANDSCAPE ? 1 : 0;
    const otherIndex = (index + 1) % 2;
    const ISO216PaperRatio = 1 / Math.sqrt(2);
    const pageLength = (pageType /*mm*/ - 2 * PAGE_MARGIN) / 1000; /*m*/
    selection.bottomRight[index] = selection.topLeft[index] - pageLength * scale;
    selection.bottomRight[otherIndex] = selection.topLeft[otherIndex] + pageLength * scale / ISO216PaperRatio;
    return selection;
}