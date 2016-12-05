import React from 'react';
import ProductList from './ProductList';

class Store extends React.Component {
  render() {
    return (
      <div>
        <h2>{this.props.params.name}</h2>
        <ProductList />
      </div>
    );
  }
}

export default Store;
