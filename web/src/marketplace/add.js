import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { performMarketplace } from '../actions/marketplace';
import { Back } from '../chrome/link';
import Full from '../layout/full';

class MarketplaceAdd extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      description: '',
      totalPrice: '',
      quantity: '',
      location: '',
      expiry: '',
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
    });;
  }

  handleQuantityChange(event) {
    this.setState({
      quantity: event.target.value
    });
  }

  handleLocationChange(event) {
    this.setState({
      location: event.target.value
    });
  }

  handleExpiryChange(event) {
    this.setState({
      expiry: event.target.value
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    const { performMarketplace } = this.props;
    const {
      description,
      totalPrice,
      quantity,
      location,
      expiry
    } = this.state;

    const validity = (
      description.length &&
      totalPrice.length &&
      quantity.length &&
      location.length &&
      expiry.length
    ) ? 'valid' : 'invalid';

    this.setState({ validity });

    if (validity === 'valid') {
      performMarketplace({
        description,
        totalPrice,
        quantity,
        location,
        expiry
      });
    }
  }

  render() {
    const { validity } = this.state;

    return (
      <Full top={<Back />}>
        <form className="center px2 navy" onSubmit={(e) => this.handleSubmit(e)}>
          <p>Please fill in the details for your marketplace items</p>
          {
            validity === 'invalid' &&
            <p className="red">Please fill out every field</p>
          }
          <p>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Diet Coke 330ml can"
              onChange={(e) => this.handleDescriptionChange(e)}
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
              onChange={(e) => this.handlePriceChange(e)}
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
              onChange={(e) => this.handleQuantityChange(e)}
              value={this.state.quantity}
              className="input"
              noValidate
              type="number"
              min="1"
              step="1"
              />
          </p>
          <p>
            <label htmlFor="location">Location</label>
            <input
              id="location"
              placeholder="Fridge"
              onChange={(e) => this.handleLocationChange(e)}
              value={this.state.location}
              className="input"
              noValidate
              />
          </p>
          <p>
            <label htmlFor="expiry">Expiry Date</label>
            <input
              id="expiry"
              onChange={(e) => this.handleExpiryChange(e)}
              value={this.state.expiry}
              className="input"
              noValidate
              type="date"
              />
          </p>
          <Link className="btn btn-primary" onClick={(e) => this.handleSubmit(e)}>
            Submit marketplace item
          </Link>
        </form>
      </Full>
    );
  }
};

export default connect(() => ({}), { performMarketplace })(MarketplaceAdd);
