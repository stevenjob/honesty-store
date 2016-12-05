import React from 'react';
import ProductList from './ProductList';

class Store extends React.Component {
  render() {
    const products = [
      { name: "Snickers", price: 0.20 },
      { name: "Extra Peppermint", price: 0.25 },
      { name: "Twix", price: 0.20 }
    ];

    return (
      <div>
        <h2>{this.props.params.name}</h2>
        <ProductList products={products}/>
      </div>
    );
  }
}

export default Store;
