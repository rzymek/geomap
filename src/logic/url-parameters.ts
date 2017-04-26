import * as _ from "lodash";

export function parseUrlParameters() {
    return location.search
        .substr(1) //skip '?'
        .split('|')
        .filter(v => !_.isEmpty(v))
        .map(decodeURIComponent)
}