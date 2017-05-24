import * as React from "react";
import * as _ from "lodash";
import { Select } from "./Select";
import { Capabilities } from "../definitions/capabilities";

const LEVELS: { [zoom: number]: string } = _.chain({
    7: '1:50 000',
    8: '1:25 000',
    9: '1:10 000',
    10: '1:10 000',
    11: '1:10 000',
    12: '1:10 000'
}).mapValues((value, key) => `${key} - skan ${value}`).value();

interface Props {
    layers: { [name: string]: { label: string } },
    onChange(state: State):void;
}
interface State {
    source: string,
    z: number
}

export class LayerSelector extends React.Component<Props, State>{
    constructor() {
        super();
        this.state = {
            source: undefined,
            z: 9
        }
    }
    handleChange<K extends keyof State>(state: Pick<State, K>) {
        this.setState(state, () => {
            this.props.onChange({
                source: _.defaultTo(this.state.source, _(this.props.layers).keys().head()),
                z: this.state.z
            });
        });
    }
    render() {
        return <span className="LayerSelector">
            <Select values={_.mapValues(this.props.layers, v => v.label)}
                value={this.state.source}
                onChange={(layer) => this.handleChange({ source: layer })} />
            <Select values={LEVELS}
                value={String(this.state.z)}
                onChange={(level) => this.handleChange({ z: Number(level) })} />
        </span>
    }
}
