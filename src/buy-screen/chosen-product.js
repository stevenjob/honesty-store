import React from 'react';
import './chosen-product.css';

class ChosenProduct extends React.Component {
  render() {
    return (
      <p className="chosen-product">Your chosen product: <span className="chosen-product-label">{this.props.product.name}</span></p>
    );
  }
}

export default ChosenProduct;
