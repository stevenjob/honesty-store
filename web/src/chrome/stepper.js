import React from 'react';
import { Link } from 'react-router';

class Stepper extends React.Component {
  constructor(props) {
    super(props);
    const { initialValue, incrementDisabled, decrementDisabled } = props;
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
      onDecrement
    } = this.props;

    const { value, incrementDisabled, decrementDisabled } = this.state;

    return (
      <div className="mt3">
        <h2>{label}</h2>
        <div className="flex justify-around items-center">
          <Link
            className={`btn btn-big ${decrementDisabled ? 'rounded bg-gray white' : 'btn-primary'}`}
            onClick={() => this.updateValue(onDecrement)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              viewBox="0 0 100 100"
              width="1rem"
            >
              <polygon fill="#fff" points="100,37.5 0,37.5 0,62.5 100,62.5" />
            </svg>
          </Link>
          <h2 className="mt0 mb0 mx3">
            {formatValue(value)}
          </h2>
          <Link
            className={`btn btn-big ${incrementDisabled ? 'rounded bg-gray white' : 'btn-primary'}`}
            onClick={() => this.updateValue(onIncrement)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              viewBox="0 0 100 100"
              width="1rem"
            >
              <polygon
                fill="#fff"
                points="100,37.5 62.5,37.5 62.5,0 37.5,0 37.5,37.5 0,37.5 0,62.5 37.5,62.5 37.5,100 62.5,100 62.5,62.5 100,62.5"
              />
            </svg>
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
        className={`btn btn-big ${disabled ? 'rounded bg-gray white' : 'btn-primary'}`}
        onClick={() => onClick(value)}
      >
        {text}
      </Link>
    );
  }
}

export default Stepper;
