import { orto } from "../capabilities/orto";
import { topo } from "../capabilities/topo";
import { vmap } from "../capabilities/vmap";
import { Capabilities } from "../definitions/capabilities";

export const LAYERS: { [key: string]: { label: string, def: Capabilities } } = {
    topo: {
        label: 'Mapa topograficzna',
        def: topo
    },
    orto: {
        label: 'Ortofotomapa',
        def: orto
    },
    vmap: {
      label: 'Topograficzna wektorowa',
      def: vmap
  }
};