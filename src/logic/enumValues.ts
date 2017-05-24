import * as _ from "lodash";

export function enumKeys(anyEnum: {}): string[] {
    return Object.keys(anyEnum)
        .map(key => anyEnum[key])
        .filter(value => typeof value === 'string');
}

export function enumMap(anyEnum: {}) {
    return _.pickBy(anyEnum,value => typeof value === 'string') as {[key:string]:number};
}