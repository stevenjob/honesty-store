import React from 'react';
import { Link } from 'react-router';

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
      <div className="mt3">
        <h2>{label}</h2>
        <div className="flex justify-center items-center">
          <Link className="btn btn-primary"
            type={decrementDisabled ? 'disabled' : ''}
            onClick={() => this.updateValue(onDecrement)}>
            -
          </Link>
          <h2 className="mt0 mb0 mx3">
            {formatValue(value)}
          </h2>
          <Link className="btn btn-primary"
            type={incrementDisabled ? 'disabled' : ''}
            onClick={() => this.updateValue(onIncrement)}>
            +
          </Link>
        </div>
        <p className="gray">{formatDescription(value)}</p>
        <p className="mt3">{this.getFormattedButton()}</p>
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
      <Link
        className="btn btn-primary"
        onClick={() => onClick(value)}
        type={disabled ? 'disabled' : ''}
        >
        {text}
      </Link>
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
