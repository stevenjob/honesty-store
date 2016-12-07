import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import SignUpForm from './sign-up-form';
import TopUpForm from './top-up-form';
import ChosenProduct from './chosen-product';
import store from '../product-store';

class BuyScreen extends React.Component {

  render() {
    const chosenProductID = Number(this.props.params.productId);
    const chosenProduct = store.getProduct(chosenProductID);
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
        <Row>
          <Col xs={12}>
            <ChosenProduct product={chosenProduct}/>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default BuyScreen;
