import React from 'react';
import { ListGroup } from 'react-bootstrap';
import Product from './Product';

class ProductList extends React.Component {
  render() {
    return (
        <ListGroup>
          <Product name="Extra Peppermint" price="0.25"/>
          <Product name="Snickers" price="0.20"/>
          <Product name="Twix" price="0.20"/>
        </ListGroup>
    );
  }
}

export default ProductList;
