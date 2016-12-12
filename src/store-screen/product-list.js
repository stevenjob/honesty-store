import React from 'react';
import { ListGroup } from 'react-bootstrap';
import Product from './product';

class ProductList extends React.Component {

  constructor(props) {
    super(props);
    this.products = this.props.products.map(product =>
      <Product
        key={product.id}
        product={product}
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
