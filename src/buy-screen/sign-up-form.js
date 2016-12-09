import React from 'react';
import { FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';

class SignUpForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {emailAddress: ''};

    this.handleEmailAddressChange = this.handleEmailAddressChange.bind(this);
    this.handleEmailAddressSubmit = this.handleEmailAddressSubmit.bind(this);
  }

  handleEmailAddressChange(event) {
    this.setState({emailAddress: event.target.value});
  }

  handleEmailAddressSubmit(event) {
    event.preventDefault();
    // TODO: handle empty address
    this.props.handleEmailAddressSubmit(this.state.emailAddress);
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleEmailAddressSubmit}>
          <FormGroup>
            <ControlLabel>Please enter your email address to create an account</ControlLabel>
            <FormControl
              type="text"
              value={this.state.emailAddress}
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
