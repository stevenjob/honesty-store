import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
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
      emailAddress: '',
      showTopUpErrorMessage: false
    };

    this.handleSignUpFormSubmit = this.handleSignUpFormSubmit.bind(this);
    this.handleTopUpFormSubmit = this.handleTopUpFormSubmit.bind(this);
    this.handleTopUpErrorMessageOpen = this.handleTopUpErrorMessageOpen.bind(this);
    this.handleTopUpErrorMessageClose = this.handleTopUpErrorMessageClose.bind(this);
  }

  handleSignUpFormSubmit(emailAddress) {
    // TODO magic links etc
    // TODO handle failure - use promises like we do with the top up submit
    const isRegistered = mockApi.isEmailAddressRegistered(emailAddress);
    if (!isRegistered) {
      mockApi.createAccount(emailAddress);
    }
    const balance = mockApi.getBalance(emailAddress);

    this.setState({
      isSignedUp: true,
      balance: balance,
      emailAddress: emailAddress
    });
  }

  handleTopUpFormSubmit(topUpAmount, cardDetails) {
    mockApi.topUpAccount(topUpAmount, cardDetails).then((result) => {
      this.setState({balance: this.state.balance + topUpAmount});
    }, (err) => {
      this.handleTopUpErrorMessageOpen();
    });
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
      emailAddress: '',
      showTopUpErrorMessage: false
    });
  }

  render() {
    const isSignedUp = this.state.isSignedUp;
    const chosenProductID = Number(this.props.params.productId);
    const chosenProduct = mockApi.getProduct(chosenProductID);
    const isBuyButtonActive = this.isBuyButtonActive(this.state.isSignedUp, this.state.balance, chosenProduct.price);
    const topUpErrorTitle = 'Top Up Failed';
    const topUpErrorMessage = 'Sorry, there was a problem topping up your account. Please try again.';

    return (
      <div>
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
              <BuyButton active={isBuyButtonActive}/>
            </Col>
          </Row>

        </Grid>

        <ErrorMessage show={this.state.showTopUpErrorMessage} onClose={this.handleTopUpErrorMessageClose} title={topUpErrorTitle} message={topUpErrorMessage}/>
      </div>
    );
  }
}

export default BuyScreen;
