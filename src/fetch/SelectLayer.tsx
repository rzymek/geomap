import * as React from "react";
import * as _ from "lodash";
import {Select} from "../components/Select";

const LAYERS = {
    topo: 'Mapa topograficzna',
    ortp: 'Ortofotomapa'
};

export const SelectLayer = () => <Select values={LAYERS}/>
