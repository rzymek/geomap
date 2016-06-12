import React from 'react';
import ReactDOM from 'react-dom';

export function renderInBody(component) {
    ReactDOM.render(
        component,
        document.body.appendChild(
            document.createElement('div')
        )
    );
}