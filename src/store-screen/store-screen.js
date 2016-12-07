import React from 'react';
import { hashHistory } from 'react-router'
import { Grid } from 'react-bootstrap';
import ProductList from './product-list';
import store from '../product-store';

class StoreScreen extends React.Component {

  // Put store array in here

  constructor(props) {
    super(props);
    this.handleBuyButtonClick = this.handleBuyButtonClick.bind(this);
  }

  handleBuyButtonClick(id) {
    // don't do this as query param, do as another level (just id, no productID=)
    // const queryParams = `?productID=${id}`;
    // hashHistory.push(`/${this.props.params.name}/buy${queryParams}`);

    hashHistory.push(`/${this.props.params.storeName}/buy/${id}`);
  }

  render() {
    return (
      <Grid>
          <h2>{this.props.params.storeName}</h2>
          <ProductList products={store.inventory} buyButtonClickHandler={this.handleBuyButtonClick}/>
      </Grid>
    );
  }
}

export default StoreScreen;
