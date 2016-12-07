import React from 'react';
import './ChosenProduct.css';

class ChosenProduct extends React.Component {
  render() {
    return (
      <p className="ChosenProduct">Your chosen product: <strong>{this.props.product.name}</strong></p>
    );
  }
}

export default ChosenProduct;
