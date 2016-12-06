import React from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';

class SignUpForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    // TODO
  }

  render() {
    return (
      <form>
        <FormGroup>
          <ControlLabel>Please enter your email address to create an account</ControlLabel>
          <FormControl
            type="text"
            value={this.state.value}
            placeholder="Enter email address"
            onChange={this.handleChange} />
        </FormGroup>
      </form>
    );
  }
}

export default SignUpForm;
