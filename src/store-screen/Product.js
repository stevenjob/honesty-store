import React from 'react';
import { ListGroupItem, Button, Grid, Col, Row } from 'react-bootstrap';
import './Product.css'

class Product extends React.Component {

  render() {
    return (
      <ListGroupItem>
        <Grid>
          <Row className="vertical-align">
            <Col xs={9}>
              <p className="product-name">{this.props.name} - £{this.props.price.toFixed(2)}</p>
            </Col>
            <Col xs={3}>
              <Button bsStyle="success" bsSize="small">Buy</Button>
            </Col>
          </Row>
        </Grid>
      </ListGroupItem>
    )
  }
}

export default Product;
