import React from 'react';
import { ListGroupItem } from 'react-bootstrap';

class Product extends React.Component {

  render() {
    return (
      <ListGroupItem>{this.props.name} - £{this.props.price.toFixed(2)}</ListGroupItem>
    )
  }
}

export default Product;
