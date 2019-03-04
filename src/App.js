import React, {Component} from 'react';
import Calculator from "./components/Calculator";
import './App.css';
import globalStyles from './assets/styles/global.css';

class App extends Component {
    render() {
        return (
            <div className="App">
                <div className={globalStyles}>
                    <div id="wrapper">
                        <div id="calculator-wrapper">
                            <Calculator/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
