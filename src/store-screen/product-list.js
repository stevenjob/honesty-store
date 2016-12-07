import React from 'react';
import { ListGroup } from 'react-bootstrap';
import Product from './product';

class ProductList extends React.Component {

  constructor(props) {
    super(props);
    this.products = this.props.products.map(product =>
      <Product
        key={product.id}
        // pass product instead of each thing (but still do key separately)
        id={product.id}
        name={product.name}
        price={product.price}
        buyButtonClickHandler={this.props.buyButtonClickHandler}
      />
    );
  }

  render() {
    return (
        <ListGroup>
          {this.products}
        </ListGroup>
    );
  }
}

export default ProductList;
