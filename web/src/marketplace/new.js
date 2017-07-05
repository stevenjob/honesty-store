import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { performMarketplace } from '../actions/marketplace';
import { BackToPage } from '../chrome/link';
import Full from '../layout/full';

const ourFees = 0.1;

class MarketplaceItemAdd extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      description: '',
      totalPrice: '',
      quantity: '',
      validity: 'not-submitted'
    };
  }

  handleDescriptionChange(event) {
    this.setState({
      description: event.target.value
    });
  }

  handlePriceChange(event) {
    this.setState({
      totalPrice: event.target.value
    });
  }

  handleQuantityChange(event) {
    this.setState({
      quantity: event.target.value
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    const { performMarketplace } = this.props;
    const { description, totalPrice, quantity } = this.state;

    const validity = description.length && totalPrice.length && quantity.length
      ? 'valid'
      : 'invalid';

    this.setState({ validity });

    if (validity === 'valid') {
      performMarketplace({
        description,
        totalPrice,
        quantity
      });
    }
  }

  calculatePerItemCost() {
    const price = Number(this.state.totalPrice);
    const quantity = Number(this.state.quantity);
    const result = price / quantity * (1 + ourFees);

    return !Number.isFinite(result) ? `` : `£${result.toFixed(2)}`;
  }

  render() {
    const { validity } = this.state;

    return (
      <Full left={<BackToPage path="/more" title="Marketplace" />}>
        <form className="center px2 navy" onSubmit={e => this.handleSubmit(e)}>
          <p>Please fill in the details for your items</p>
          {validity === 'invalid' &&
            <p className="red">Please fill out every field</p>}
          <p>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Diet Coke 330ml can"
              onChange={e => this.handleDescriptionChange(e)}
              value={this.state.description}
              className="textarea input"
              noValidate
              rows="1"
            />
          </p>
          <p>
            <label htmlFor="price">Total Price Paid (£)</label>
            <input
              id="price"
              placeholder="3"
              onChange={e => this.handlePriceChange(e)}
              value={this.state.price}
              className="input"
              noValidate
              type="number"
              min="1"
              step="any"
            />
          </p>
          <p>
            <label htmlFor="quantity">Item Quantity</label>
            <input
              id="quantity"
              placeholder="10"
              onChange={e => this.handleQuantityChange(e)}
              value={this.state.quantity}
              className="input"
              noValidate
              type="number"
              min="1"
              step="1"
            />
          </p>
          <p>
            <label htmlFor="pricingBreakdown">
              Per Item Cost (inc. Service Fee)
            </label>
            <input
              id="pricingBreakdown"
              placeholder="£0.33"
              value={this.calculatePerItemCost()}
              disabled={true}
              onChange={e => e.preventDefault()}
              className="input"
              noValidate
            />
          </p>
          <p className="my3">
            <Link
              className="btn btn-primary"
              onClick={e => this.handleSubmit(e)}
            >
              Submit item
            </Link>
          </p>
        </form>
      </Full>
    );
  }
}

export default connect(() => ({}), { performMarketplace })(MarketplaceItemAdd);
