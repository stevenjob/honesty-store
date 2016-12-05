import React from 'react';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

class ProductList extends React.Component {
  render() {
    return (
        <ListGroup>
          <ListGroupItem>Extra Peppermint - £0.25</ListGroupItem>
          <ListGroupItem>Snickers - £0.19</ListGroupItem>
          <ListGroupItem>Twix - £0.20</ListGroupItem>
        </ListGroup>
    );
  }
}

export default ProductList;
