import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import SignUpForm from './SignUpForm';

class BuyScreen extends React.Component {
  render() {
    return (
      <Grid>
        <Row>
          <Col xs={12}>
            <SignUpForm />
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default BuyScreen;
