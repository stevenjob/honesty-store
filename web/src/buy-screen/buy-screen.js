import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import { hashHistory } from 'react-router';
import Balance from './balance';
import SignUpForm from './sign-up-form';
import TopUpForm from './top-up-form';
import ChosenProduct from './chosen-product';
import BuyButton from './buy-button';
import ErrorMessage from './error-message';
import mockApi from '../mock-api';

class BuyScreen extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isSignedUp: false,
      balance: 0,
      showTopUpErrorMessage: false
    };

    this.handleSignUpFormSubmit = this.handleSignUpFormSubmit.bind(this);
    this.handleTopUpFormSubmit = this.handleTopUpFormSubmit.bind(this);
    this.handleTopUpErrorMessageOpen = this.handleTopUpErrorMessageOpen.bind(this);
    this.handleTopUpErrorMessageClose = this.handleTopUpErrorMessageClose.bind(this);
    this.handleBuyButtonClick = this.handleBuyButtonClick.bind(this);
  }

  handleSignUpFormSubmit(emailAddress) {
    // TODO magic links etc
    // TODO handle failure - use promises like we do with the top up submit
    const isRegistered = mockApi.isEmailAddressRegistered(emailAddress);
    if (!isRegistered) {
      mockApi.createAccount(emailAddress);
    }
    const balance = mockApi.getBalance();

    this.setState({
      isSignedUp: true,
      balance: balance,
    });
  }

  handleTopUpFormSubmit(topUpAmount, cardDetails) {
    mockApi.topUpAccount(topUpAmount, cardDetails).then((result) => {
      const newBalance = mockApi.getBalance();
      this.setState({balance: newBalance});
    }, (err) => {
      this.handleTopUpErrorMessageOpen();
    });
  }

  handleBuyButtonClick() {
    const product = this.getChosenProduct();
    mockApi.purchaseProduct(product);
    const successPath = `/${this.props.params.storeName}/success`;
    hashHistory.push(successPath);
  }

  isBuyButtonActive(isSignedUp, balance, productPrice) {
    return isSignedUp && balance >= productPrice;
  }

  handleTopUpErrorMessageOpen() {
    this.setState({showTopUpErrorMessage: true});
  }

  handleTopUpErrorMessageClose() {
    this.setState({
      isSignedUp: false,
      balance: 0,
      showTopUpErrorMessage: false
    });
  }

  getChosenProduct() {
    const chosenProductID = Number(this.props.params.productId);
    return mockApi.getProduct(chosenProductID);
  }

  render() {
    const chosenProduct = this.getChosenProduct();
    const isSignedUp = this.state.isSignedUp;
    const isBuyButtonActive = this.isBuyButtonActive(this.state.isSignedUp, this.state.balance, chosenProduct.price);
    const topUpErrorTitle = 'Top Up Failed';
    const topUpErrorMessage = 'Sorry, there was a problem topping up your account. Please try again.';

    return (
      <div>
        <Grid>

          <Row>
            <Col xs={12}>
              {isSignedUp
                ? <Balance balance={this.state.balance} emailAddress={mockApi.getCurrentUser()}/>
                : <SignUpForm handleEmailAddressSubmit={this.handleSignUpFormSubmit}/>
              }
            </Col>
          </Row>

          {isSignedUp &&
            <Row>
              <Col xs={12}>
                <TopUpForm amount={5} handleTopUpFormSubmit={this.handleTopUpFormSubmit} />
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
              <BuyButton active={isBuyButtonActive} clickHandler={this.handleBuyButtonClick}/>
            </Col>
          </Row>

        </Grid>

        <ErrorMessage show={this.state.showTopUpErrorMessage} onClose={this.handleTopUpErrorMessageClose} title={topUpErrorTitle} message={topUpErrorMessage}/>
      </div>
    );
  }
}

export default BuyScreen;
