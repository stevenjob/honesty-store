import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import SignUpForm from './SignUpForm';
import TopUpForm from './TopUpForm';

class BuyScreen extends React.Component {
  render() {
    return (
      <Grid>
        <Row>
          <Col xs={12}>
            <SignUpForm />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <TopUpForm />
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default BuyScreen;
