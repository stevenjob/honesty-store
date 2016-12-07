import React from 'react';
import { FormGroup, ControlLabel, FormControl, Button, Radio } from 'react-bootstrap';

class TopUpForm extends React.Component {

  render() {
    return (
      <div>
        <h2>Top Up</h2>
        <form>
          <FormGroup>
            <Radio checked readOnly>£5</Radio>
          </FormGroup>
          <FormGroup>
            <ControlLabel>Card Number</ControlLabel>
            <FormControl
              type="text"
              placeholder="0000000000000000" />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Expiry Date</ControlLabel>
            <FormControl
              type="text"
              placeholder="MM/YY" />
          </FormGroup>
          <FormGroup>
            <ControlLabel>CVC</ControlLabel>
            <FormControl
              type="text"
              placeholder="123" />
          </FormGroup>
          <Button type="submit">Top Up</Button>
        </form>
      </div>
    );
  }
}

export default TopUpForm;
