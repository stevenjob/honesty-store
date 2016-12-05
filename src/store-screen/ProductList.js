import React from 'react';
import { ListGroup } from 'react-bootstrap';
import Product from './Product';

class ProductList extends React.Component {
  render() {
    const products = this.props.products.map(function(product) {
      return (
        <Product key={product.name} name={product.name} price={product.price}/>
      );
    });
    return (
        <ListGroup>
          {products}
        </ListGroup>
    );
  }
}

export default ProductList;
