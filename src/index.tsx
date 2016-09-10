import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";

ReactDOM.render(
    <h1>{_.range(0,10).join(', ')}</h1>,
    document.getElementById("root")
);