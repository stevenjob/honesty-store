import React from 'react';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import SignUpForm from './sign-up-form';
import TopUpForm from './top-up-form';
import ChosenProduct from './chosen-product';
import store from '../product-store';

class BuyScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {isSignedUp: false};
  }

  render() {
    const isSignedUp = this.state.isSignedUp;
    const buyButtonStyle = isSignedUp ? "success" : "default";
    const chosenProductID = Number(this.props.params.productId);
    const chosenProduct = store.getProduct(chosenProductID);

    return (
      <Grid>

        <Row>
          <Col xs={12}>
            {isSignedUp ? <p>Balance: £0.00</p> : <SignUpForm />}
          </Col>
        </Row>

        {isSignedUp &&
          <Row>
            <Col xs={12}>
              <TopUpForm />
            </Col>
          </Row>
        }

        <Row>
          <Col xs={12}>
            <ChosenProduct product={chosenProduct}/>
          </Col>
        </Row>

        <Row>
          <Col xs={12}>
            <Button bsStyle={buyButtonStyle} disabled={!isSignedUp}>Buy</Button>
          </Col>
        </Row>

      </Grid>
    );
  }
}

export default BuyScreen;
