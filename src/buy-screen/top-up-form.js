import React from 'react';
import { FormGroup, ControlLabel, FormControl, Button, Radio } from 'react-bootstrap';

class TopUpForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      cardNumber: '',
      expiryDate: '',
      cvcNumber: ''
    };

    this.handleCardNumberChange = this.handleCardNumberChange.bind(this);
    this.handleExpiryDateChange = this.handleExpiryDateChange.bind(this);
    this.handleCVCNumberChange = this.handleCVCNumberChange.bind(this);
    this.handleCardDetailsSubmit = this.handleCardDetailsSubmit.bind(this);
  }

  handleCardNumberChange(event) {
    this.setState({cardNumber: event.target.value});
  }

  handleExpiryDateChange(event) {
    this.setState({expiryDate: event.target.value});
  }

  handleCVCNumberChange(event) {
    this.setState({cvcNumber: event.target.value});
  }

  handleCardDetailsSubmit(event) {
    // TODO
  }

  render() {
    return (
      <div>
        <h2>Top Up</h2>
        <form onSubmit={this.handleCardDetailsSubmit}>
          <FormGroup>
            <Radio checked readOnly>£5</Radio>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Card Number</ControlLabel>
            <FormControl
              type="text"
              value={this.state.cardNumber}
              placeholder="0000000000000000"
              onChange={this.handleCardNumberChange}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Expiry Date</ControlLabel>
            <FormControl
              type="text"
              value={this.state.expiryDate}
              placeholder="MM/YY"
              onChange={this.handleExpiryDateChange}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>CVC</ControlLabel>
            <FormControl
              type="text"
              value={this.state.cvcNumber}
              placeholder="123"
              onChange={this.handleCVCNumberChange}
            />
          </FormGroup>
          <Button type="submit">Top Up</Button>
        </form>
      </div>
    );
  }
}

export default TopUpForm;
