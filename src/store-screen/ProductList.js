import React from 'react';
import { ListGroup } from 'react-bootstrap';
import Product from './Product';

class ProductList extends React.Component {
  render() {
    const products = this.props.products.map(product =>
      <Product key={product.name} name={product.name} price={product.price} clickHandler={this.props.clickHandler}/>
    );
    return (
        <ListGroup>
          {products}
        </ListGroup>
    );
  }
}

export default ProductList;
