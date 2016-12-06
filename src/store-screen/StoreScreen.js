import React from 'react';
import { hashHistory } from 'react-router'
import { Grid } from 'react-bootstrap';
import ProductList from './ProductList';
import store from '../ProductStore';

class StoreScreen extends React.Component {

  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    hashHistory.push(`/${this.props.params.name}/buy`);
  }

  render() {
    return (
      <Grid>
          <h2>{this.props.params.name}</h2>
          <ProductList products={store.inventory} clickHandler={this.handleClick}/>
      </Grid>
    );
  }
}

export default StoreScreen;
