import React from 'react';

class Stepper extends React.Component {
  render() {
    const {
      value,
      onIncrement,
      onDecrement,
      className,
      incrementDisabled,
      decrementDisabled
    } = this.props;

    return (
      <div className={`mt3 ${className}`}>
        <div className="flex justify-between items-center">
          <button
            className={`btn ${decrementDisabled ? 'rounded bg-gray white' : 'btn-primary'}`}
            onClick={() => !decrementDisabled && onDecrement()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              viewBox="0 0 100 100"
              width="1rem"
            >
              <polygon fill="#fff" points="100,37.5 0,37.5 0,62.5 100,62.5" />
            </svg>
          </button>
          <h2 className="my0" style={{ userSelect: 'none' }}>
            {value}
          </h2>
          <button
            className={`btn ${incrementDisabled ? 'rounded bg-gray white' : 'btn-primary'}`}
            onClick={() => !incrementDisabled && onIncrement()}
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
          </button>
        </div>
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
}

export default Stepper;
