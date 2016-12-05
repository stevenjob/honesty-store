import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

class ProductList extends React.Component {
  render() {
    return (
        <ListGroup>
          <ListGroupItem>Extra Peppermint</ListGroupItem>
          <ListGroupItem>Snickers</ListGroupItem>
          <ListGroupItem>Twix</ListGroupItem>
        </ListGroup>
    );
  }
}

export default ProductList;
