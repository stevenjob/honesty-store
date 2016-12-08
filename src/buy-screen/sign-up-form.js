import React from 'react';
import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';

class SignUpForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleEmailAddressChange = this.handleEmailAddressChange.bind(this);
    this.handleEmailAddressSubmit = this.handleEmailAddressSubmit.bind(this);
  }

  handleEmailAddressChange(event) {
    this.setState({value: event.target.value});
  }

  handleEmailAddressSubmit(event) {
    // TODO
    event.preventDefault();
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleEmailAddressSubmit}>
          <FormGroup>
            <ControlLabel>Please enter your email address to create an account</ControlLabel>
            <FormControl
              type="text"
              value={this.state.value}
              placeholder="Enter email address"
              onChange={this.handleEmailAddressChange} />
          </FormGroup>
          <Button type="submit">Submit</Button>
        </form>
      </div>
    );
  }
}

export default SignUpForm;
