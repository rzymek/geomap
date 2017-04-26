import * as React from "react";
import { CoordsDisplayDefs } from "./controls";

export const CoordsDisplay = (props: {
    defs: CoordsDisplayDefs
}) => <table className="coords">
        <tbody>
            {props.defs.map(def =>
                <tr key={def.id}>
                    <td>{def.id}:</td><td id={def.id}></td>
                </tr>
            )}
        </tbody>
    </table>;