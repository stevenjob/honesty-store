import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import SignUpForm from './SignUpForm';
import TopUpForm from './TopUpForm';
import store from '../ProductStore';
import './BuyScreen.css';

class BuyScreen extends React.Component {

  render() {
    const chosenProductID = Number(this.props.location.query.productID);
    const chosenProduct = store.productForID(chosenProductID);
    return (
      <Grid className="BuyScreen">
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
        <Row className="chosen-product">
          <Col xs={12}>
            <p>Your chosen product: <strong>{chosenProduct.name}</strong></p>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default BuyScreen;
