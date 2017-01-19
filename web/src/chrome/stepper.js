import React from 'react';
import Button from '../chrome/button';
import { BRAND_LIGHT, MUTED_TEXT } from '../chrome/colors';
import './stepper.css';

class Stepper extends React.Component {
  constructor(props) {
    super(props);
    const { initialValue } = props; 
    this.state = {
      value: initialValue
    };
  }

  render() {
    const { 
      label, formatValue, formatDescription,
      onIncrement, onDecrement
    } = this.props;

    const { value } = this.state;
   
    return (
      <div className="chrome-stepper">
      <h2>{label}</h2>
      <div className="chrome-stepper-amount">
        <Button onClick={() => this.updateValue(onDecrement)}>-</Button>
        <h1 style={{color: BRAND_LIGHT}}>
          {formatValue(value)}
        </h1>
        <Button onClick={() => this.updateValue(onIncrement) }>+</Button>
      </div>
      <p style={{color: MUTED_TEXT}}>{formatDescription(value)}</p>
        <p>{this.getFormattedButton()}</p>
      </div>
    );
  }

  updateValue(updateFn) {
    const updatedValue = updateFn(this.state.value);
    this.setState({ value: updatedValue });
  }

  getFormattedButton() {
    const { onClick, formatButton } = this.props;
    const { value } = this.state;
    const { disabled, text } = formatButton(value); 
    return (
      <Button 
        onClick={() => onClick(value)}
        type={disabled ? 'disabled' : ''}
      >
        {text}
      </Button>
    );
  }
}

Stepper.propTypes = {
  label: React.PropTypes.string,
  onClick: React.PropTypes.func.isRequired,
  onIncrement: React.PropTypes.func.isRequired,
  onDecrement: React.PropTypes.func.isRequired,
  formatDescription: React.PropTypes.func.isRequired,
  formatValue: React.PropTypes.func.isRequired,
  formatButton: React.PropTypes.func.isRequired,
  initialValue: React.PropTypes.number.isRequired
};

export default Stepper;
