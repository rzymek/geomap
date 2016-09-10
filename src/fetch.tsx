import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {Select} from "./components/Select";

const LEVELS: {[zoom: number]: string} = _.chain({
    7: '1:50 000',
    8: '1:25 000',
    9: '1:10 000',
    10: '1:10 000',
    11: '1:10 000',
    12: '1:10 000'
}).mapValues((value, key) => `${key} - ${value}`).value();

const LAYERS = {
    topo: 'Mapa topograficzna',
    orto: 'Ortofotomapa'
};

interface FetchState {
    layer?: string,
    level?: string
}
class Fetch extends React.Component<{},FetchState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            layer: _(LAYERS).keys().head(),
            level: _(LEVELS).keys().head()
        }
    }

    render() {
        return <div>
            <Select values={LAYERS} onChange={(layer) => this.setState({layer})}/>
            <Select values={LEVELS} onChange={(level) => this.setState({level})}/>
        </div>;
    }
}


ReactDOM.render(
    <Fetch/>,
    document.getElementById("root")
);