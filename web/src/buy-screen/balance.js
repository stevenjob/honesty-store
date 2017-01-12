import React from 'react';
import './balance.css';

class Balance extends React.Component {
  render() {
    return (
      <div className="balance">
        <h3 className="balance-amount">Balance: £{this.props.balance.toFixed(2)}</h3>
        <p className='balance-email'>{this.props.emailAddress}</p>
      </div>
    );
  }
}

export default Balance;
