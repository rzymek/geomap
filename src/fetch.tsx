import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {Select} from "./components/Select";
import {setupProjections} from "./logic/proj4defs";

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


function getParameters() {
    const query = location.search
        .substr(1) //skip '?'
        .split('|')
        .map(decodeURIComponent);
    return {
        source: query[0],
        z: Number(query[1]),
        title: query[2],
        box: {
            x1: Number(query[3]),
            y1: Number(query[4]),
            x2: Number(query[5]),
            y2: Number(query[6])
        }
    };
}
interface FetchState {
    source?: string,
    z?: number,
    title?: string,
    box?: {
        x1: number,
        y1: number,
        x2: number,
        y2: number
    }
}
class Fetch extends React.Component<{},FetchState> {

    constructor(props: {}) {
        super(props);
        this.state = {
            source: _(LAYERS).keys().head(),
            z: _(LEVELS).keys().map(Number).head()
        }
    }

    componentDidMount() {
        this.setState(getParameters());
    }

    render() {
        return <div>
            <Select values={LAYERS}
                    value={this.state.source}
                    onChange={(layer) => this.setState({source: layer})}/>
            <Select values={LEVELS}
                    value={String(this.state.z)}
                    onChange={(level) => this.setState({z: Number(level)})}/>
            <svg id="canvas"
                 width="1" height="1"
                 style={{
                    border: 'solid 1px black',
                    transformOrigin: '0 0',
                    width: '99%',
                    height: 'auto'
            }}/>
        </div>;
    }
}

setupProjections();

ReactDOM.render(
    <Fetch/>,
    document.getElementById("root")
);