import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import SignUpForm from './SignUpForm';
import TopUpForm from './TopUpForm';
import ChosenProduct from './ChosenProduct';
import store from '../ProductStore';

class BuyScreen extends React.Component {

  render() {
    const chosenProductID = Number(this.props.location.query.productID);
    const chosenProduct = store.productForID(chosenProductID);
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
