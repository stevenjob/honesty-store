import React from 'react';
import Button from '../chrome/button';
import { BRAND_LIGHT, MUTED_TEXT } from '../chrome/colors';
import './stepper.css';

class Stepper extends React.Component {
  constructor(props) {
    super(props);
    const {
      initialValue,
      incrementDisabled,
      decrementDisabled
    } = props;
    this.state = {
      value: initialValue,
      incrementDisabled: incrementDisabled(initialValue),
      decrementDisabled: decrementDisabled(initialValue)
    };
  }

  render() {
    const {
      label,
      formatValue,
      formatDescription,
      onIncrement,
      onDecrement,
    } = this.props;

    const {
      value,
      incrementDisabled,
      decrementDisabled
    } = this.state;

    return (
      <div className="chrome-stepper">
        <h2>{label}</h2>
        <div className="chrome-stepper-amount">
          <Button type={decrementDisabled ? 'disabled' : ''}
            onClick={() => this.updateValue(onDecrement)}>
            -
          </Button>
          <h1 style={{ color: BRAND_LIGHT }}>
            {formatValue(value)}
          </h1>
          <Button type={incrementDisabled ? 'disabled' : ''}
            onClick={() => this.updateValue(onIncrement)}>
            +
          </Button>
        </div>
        <p style={{ color: MUTED_TEXT }}>{formatDescription(value)}</p>
        <p>{this.getFormattedButton()}</p>
      </div>
    );
  }

  updateValue(updateFn) {
    const updatedValue = updateFn(this.state.value);
    const incrementDisabled = this.props.incrementDisabled(updatedValue);
    const decrementDisabled = this.props.decrementDisabled(updatedValue);
    this.setState({
      value: updatedValue,
      incrementDisabled,
      decrementDisabled
    });
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
  incrementDisabled: React.PropTypes.func.isRequired,
  onDecrement: React.PropTypes.func.isRequired,
  decrementDisabled: React.PropTypes.func.isRequired,
  formatDescription: React.PropTypes.func.isRequired,
  formatValue: React.PropTypes.func.isRequired,
  formatButton: React.PropTypes.func.isRequired,
  initialValue: React.PropTypes.number.isRequired
};

export default Stepper;
