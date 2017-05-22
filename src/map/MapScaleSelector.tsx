import * as React from "react";
import { PageHeight} from "./mapScale";
import * as _ from "lodash";

export const MapScaleSelector = (props: {
    margin: number,
    onMarginChange: (value: number) => void,
    getScale: (pageType: PageHeight) => number
    onScaleChange: (value: number, pageSize: PageHeight) => void,
}) => <div>
        <label>
            Margines: <input type="number" min={0} max={100} step={1}
                size={3} maxLength={3} style={{width:51}}
                title="mm"
                value={props.margin}
                onChange={e => props.onMarginChange(Number(e.target.value))} />
        </label>
        {Object.keys(PageHeight).filter(v => _.isNaN(Number(v))).map(pageType => [
            <br />,
            <label>
                {pageType}: 1:<input
                    type="number"
                    min={100}
                    max={500000}
                    step={100}
                    value={_.defaultTo(props.getScale(PageHeight[pageType]) as any, '')}
                    onChange={e => props.onScaleChange(Number(e.target.value), PageHeight[pageType])} />
            </label>
        ])}
    </div>;