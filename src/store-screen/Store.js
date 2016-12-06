import React from 'react';
import { Grid } from 'react-bootstrap';
import ProductList from './ProductList';

class Store extends React.Component {
  render() {
    const products = [
      { name: "Snickers", price: 0.20 },
      { name: "Extra Peppermint", price: 0.25 },
      { name: "Twix", price: 0.20 }
    ];

    return (
      <Grid>
          <h2>{this.props.params.name}</h2>
          <ProductList products={products}/>
      </Grid>
    );
  }
}

export default Store;
