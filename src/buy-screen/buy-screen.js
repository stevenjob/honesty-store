import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Balance from './balance';
import SignUpForm from './sign-up-form';
import TopUpForm from './top-up-form';
import ChosenProduct from './chosen-product';
import BuyButton from './buy-button';
import store from '../product-store';

class BuyScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isSignedUp: false,
      balance: 0,
      emailAddress: ''
    };

    this.handleSignUpFormSubmit = this.handleSignUpFormSubmit.bind(this);
  }

  handleSignUpFormSubmit(emailAddress) {
    // API: Is email address is registered?
    // API: If not, create a new account with zero balance
    // API: Return account balance
    // TODO magic links etc
    this.setState({
      isSignedUp: true,
      balance: 0,
      emailAddress: emailAddress
    });
  }

  isBuyButtonActive(isSignedUp, balance, productPrice) {
    return isSignedUp && balance >= productPrice;
  }

  render() {
    const isSignedUp = this.state.isSignedUp;
    const chosenProductID = Number(this.props.params.productId);
    const chosenProduct = store.getProduct(chosenProductID);
    const isBuyButtonActive = this.isBuyButtonActive(this.state.isSignedUp, this.state.balance, chosenProduct.price);

    return (
      <Grid>

        <Row>
          <Col xs={12}>
            {isSignedUp
              ? <Balance balance={this.state.balance} emailAddress={this.state.emailAddress}/>
              : <SignUpForm handleEmailAddressSubmit={this.handleSignUpFormSubmit}/>
            }
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
            <BuyButton active={isBuyButtonActive}/>
          </Col>
        </Row>

      </Grid>
    );
  }
}

export default BuyScreen;
