import * as React from "react";
import * as _ from "lodash";

interface SelectProps {
    values: {[value: string]: string}
    value: string,
    onChange(v: string): void
}

export const Select = (props: SelectProps): JSX.Element => {
    return <select onChange={e => props.onChange((e.target as HTMLSelectElement).value)}
                   value={props.value}>
        {
            _.toPairs(props.values).map(entry =>
                <option key={entry[0]} value={entry[0]}>{entry[1]}</option>
            )
        }
    </select>
}
