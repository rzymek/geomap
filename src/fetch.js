import React from 'react';
import ReactDOM from 'react-dom';

class Fetch extends React.Component {
    render() {
        return <div>
            <h1>Fetch</h1>
        </div>
    }
}

ReactDOM.render(
    <Fetch/>,
    document.body.appendChild(document.createElement('div'))
);