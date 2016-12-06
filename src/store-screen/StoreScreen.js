import React from 'react';
import { hashHistory } from 'react-router'
import { Grid } from 'react-bootstrap';
import ProductList from './ProductList';

class StoreScreen extends React.Component {

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    hashHistory.push(`/${this.props.params.name}/buy`);
  }

  render() {
    const products = [
      { name: "Snickers", price: 0.20 },
      { name: "Extra Peppermint", price: 0.25 },
      { name: "Twix", price: 0.20 }
    ];

    return (
      <Grid>
          <h2>{this.props.params.name}</h2>
          <ProductList products={products} clickHandler={this.handleClick}/>
      </Grid>
    );
  }
}

export default StoreScreen;
