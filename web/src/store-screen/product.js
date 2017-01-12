import React from 'react';
import { ListGroupItem, Button, Col, Row } from 'react-bootstrap';
import './product.css';

class Product extends React.Component {
  render() {
    return (
      <ListGroupItem className="product">
        <Row className="product-row">
          <Col xs={8}>
            <p className="product-name">{this.props.product.name}</p>
          </Col>
          <Col xs={4}>
            <Button
              bsStyle="success"
              bsSize="small"
              // Just pass the product back
              onClick={() => this.props.buyButtonClickHandler(this.props.product)}
            >
              Buy (£{this.props.product.price.toFixed(2)})
            </Button>
          </Col>
        </Row>
      </ListGroupItem>
    );
  }
}

export default Product;
