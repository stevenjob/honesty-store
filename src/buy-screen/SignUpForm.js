import React from 'react';
import { FormGroup, ControlLabel, FormControl, Button, Grid, Row, Col } from 'react-bootstrap';

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
      <Grid>
        <Row className="show-grid">
          <Col xs={12}>
            <form>
              <FormGroup>
                <ControlLabel>Please enter your email address to sign in!</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.value}
                  placeholder="Enter email address"
                  onChange={this.handleChange} />
              </FormGroup>
            </form>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default SignUpForm;
