import React, {Component} from 'react';
import math from 'mathjs';

const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const operators = ['/', '*', '-', '+', '='];

const maxCharsAtFullSize = 6;
const scaleFactor = 'scale(0.36)';

const maxPrecision = 16;

function CalculatorDisplay(props) {
    const value = props.value;
    const pointAt = `${value}`.indexOf('.');
    const decimalValue = value.substring(pointAt, math.eval(value.length));
    const precisionWithFraction = (pointAt === -1 ) ? 0 : math.eval(decimalValue.length - 1);
    let formattedValue = null;
    let scaleDown = null;

    formattedValue = parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: precisionWithFraction});
    if (formattedValue === 'NaN') {
        formattedValue = 'Error';
    } else {
        if (formattedValue.length > (maxPrecision - 1)) {
            formattedValue = parseFloat(value).toExponential(maxPrecision - 4);
            if (formattedValue === 'NaN') {
                formattedValue = 'Overflow\xA0Error';
            }
        }
    }

    scaleDown = (`${formattedValue}`.length) > maxCharsAtFullSize ? scaleFactor : 'scale(1)';
    return (
        <div className="calculator-display">
            <div className="auto-scaling-text" style={{transform: scaleDown}}>
                {formattedValue}
            </div>
            <hr align="right" width="209" size="1" color="#5DBCD2" />
        </div>
    );
}

class Calculator extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displayValue: '0',
            operator: null,
            waitingForOperand: false,
            firstOperand: '0',
            clearAll: true
        };

        this.handleClick = this.handleClick.bind(this);
    }

    processDigit(newKeyValue) {
        const { displayValue, waitingForOperand } = this.state;

        if (waitingForOperand) {
            this.setState({displayValue: `${newKeyValue}`, waitingForOperand: false, clearAll: false});
        } else {
            let newDisplayValue = (displayValue === '0')?`${newKeyValue}`:`${(displayValue)}${newKeyValue}`;
            this.setState({displayValue: `${newDisplayValue}`, waitingForOperand: false, clearAll: false});
        }
    }

    processOperator(newKeyValue) {
        const { displayValue, operator, waitingForOperand, firstOperand } = this.state;
        let newDisplayValue = null;
        let newOperator = null;
        let stringToEvaluate = null;

        console.log('first', firstOperand);
        console.log('disp', displayValue);

        if (firstOperand == null) {
            this.setState({firstOperand: displayValue, operator: newKeyValue, clearAll: false});
        }

        if (firstOperand === '0' || operator == null || operator === '=') {
            this.setState({waitingForOperand: true, firstOperand: displayValue, operator: newKeyValue, clearAll: false});
            return;
        } else {
            stringToEvaluate = `${firstOperand}${operator}${displayValue}`;
            try {
                newDisplayValue = `${math.eval(stringToEvaluate)}`
            } catch (e) {
                newDisplayValue = 'Error';
            }
            if (newDisplayValue === "Infinity") {
                newDisplayValue = 'Error';
            }
            newOperator = (newKeyValue === "=")? null : newKeyValue;
            this.setState({displayValue: `${newDisplayValue}`, waitingForOperand: true, firstOperand: `${newDisplayValue}`, operator: newOperator, clearAll: false})
        }
    }

    processPoint(newKeyValue) {
        const { displayValue, waitingForOperand } = this.state;
        const needPoint = `${displayValue}`.indexOf('.') === -1 ? true : false;
        let newDisplayValue = null;

        if (waitingForOperand) { // allow point if starting on a new operand
            this.setState({displayValue: '0.', waitingForOperand: false, clearAll: false})
        } else {
            if (needPoint) { //if not inputting new operand, only allow point if it's not already present
                newDisplayValue = `${displayValue}${newKeyValue}`;
                this.setState({displayValue: `${newDisplayValue}`, waitingForOperand: false, clearAll: false})
            }
        }
    }

    processPercentage(newKeyValue) {
        const { displayValue } = this.state;
        const newDisplayValue = parseFloat(displayValue).toPrecision(maxPrecision) / 100;
        this.setState({displayValue: `${newDisplayValue}`, waitingForOperand: false, clearAll: false});
    }

    processDelete(newKeyValue) {
        const { displayValue } = this.state;
        const newDisplayValue = displayValue.length > 1 ? displayValue.slice(0, displayValue.length - 1) : '0';
        this.setState({displayValue: `${newDisplayValue}`, waitingForOperand: false, clearAll: false})
    }

    processClear() {
        const { clearAll } = this.state;
        console.log('clearAll', clearAll);
        if ( clearAll ) {
            this.setState({displayValue: '0', firstOperand: '0', operator: null, waitingForOperand: false, clearAll: true})
        } else {
            this.setState({displayValue: '0', clearAll: true})
        }
    }


    processUnknownKey(newKeyValue) {
        console.log('Unexpected input: ', newKeyValue);
    }

    processFunctionKey(newKeyValue) {
        switch (newKeyValue) {
            case "C":
                this.processClear(newKeyValue);
                break;
            case "DEL":
                this.processDelete(newKeyValue);
                break;
            case ".":
                this.processPoint(newKeyValue);
                break;
            case "%":
                this.processPercentage(newKeyValue);
                break;
            default:
                this.processUnknownKey(newKeyValue);
        }
    }

    handleClick(e) {
        this.processNewKey(`${e.target.value}`);
    }

    processNewKey(newKeyValue) {
        const isDigit = digits.includes(newKeyValue);
        const isOperator = operators.includes(newKeyValue);

        if (isDigit) {
            this.processDigit(newKeyValue);
        } else {
            if (isOperator) {
                this.processOperator(newKeyValue);
            } else {
                this.processFunctionKey(newKeyValue);
            }
        }
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleClick)
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleClick)
    }

    render() {
        return (<div className="calculator">
            <CalculatorDisplay value={this.state.displayValue}/>

            <div className="calculator-keypad">
                <div className="input-keys">
                    <div className="function-keys">
                        <button id="key-clear" value="C" className="calculator-key key-clear" onClick={this.handleClick}>C</button>
                        <button id="key-sign" value="DEL" className="calculator-key key-sign" onClick={this.handleClick}>DEL</button>
                        <button id="key-percent" value="%" className="calculator-key key-percent" onClick={this.handleClick}>%</button>
                    </div>

                    <div className="digit-keys">
                        <button id="key-0" value="0" className="calculator-key key-0" onClick={this.handleClick}>0</button>
                        <button id="key-dot" value="." className="calculator-key key-dot" onClick={this.handleClick}>&middot;</button>
                        <button id="key-1" value="1" className="calculator-key key-1" onClick={this.handleClick}>1</button>
                        <button id="key-2" value="2" className="calculator-key key-2" onClick={this.handleClick}>2</button>
                        <button id="key-3" value="3" className="calculator-key key-3" onClick={this.handleClick}>3</button>
                        <button id="key-4" value="4" className="calculator-key key-4" onClick={this.handleClick}>4</button>
                        <button id="key-5" value="5" className="calculator-key key-5" onClick={this.handleClick}>5</button>
                        <button id="key-6" value="6" className="calculator-key key-6" onClick={this.handleClick}>6</button>
                        <button id="key-7" value="7" className="calculator-key key-7" onClick={this.handleClick}>7</button>
                        <button id="key-8" value="8" className="calculator-key key-8" onClick={this.handleClick}>8</button>
                        <button id="key-9" value="9" className="calculator-key key-9" onClick={this.handleClick}>9</button>
                    </div>
                </div>

                <div className="operator-keys">
                    <button id="key-divide" value="/" className="calculator-key key-divide" onClick={this.handleClick}>/</button>
                    <button id="key-multiply" value="*" className="calculator-key key-multiply" onClick={this.handleClick}>&times;</button>
                    <button id="key-subtract" value="-" className="calculator-key key-subtract" onClick={this.handleClick}>&ndash;</button>
                    <button id="key-add" value="+" className="calculator-key key-add" onClick={this.handleClick}>+</button>
                    <button id="key-equals" value="=" className="calculator-key key-equals" onClick={this.handleClick}>=</button>
                </div>
            </div>
        </div>)
    }
}

export default Calculator;
