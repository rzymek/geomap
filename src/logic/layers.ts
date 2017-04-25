import { orto } from "../capabilities/orto";
import { topo } from "../capabilities/topo";
import { Capabilities } from "../definitions/capabilities";

export const LAYERS: { [key: string]: { label: string, def: Capabilities } } = {
    topo: {
        label: 'Mapa topograficzna',
        def: topo
    },
    orto: {
        label: 'Ortofotomapa',
        def: orto
    }
};