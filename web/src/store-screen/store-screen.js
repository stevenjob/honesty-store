import React from 'react';
import { hashHistory } from 'react-router';
import { Grid } from 'react-bootstrap';
import ProductList from './product-list';
import mockApi from '../mock-api';

class StoreScreen extends React.Component {

  constructor(props) {
    super(props);
    this.handleBuyButtonClick = this.handleBuyButtonClick.bind(this);
  }

  handleBuyButtonClick(product) {
    hashHistory.push(`/${this.props.params.storeName}/buy/${product.id}`);
  }

  render() {
    return (
      <Grid>
        <h2>{this.props.params.storeName}</h2>
        <ProductList products={mockApi.inventory} buyButtonClickHandler={this.handleBuyButtonClick}/>
      </Grid>
    );
  }
}

export default StoreScreen;
