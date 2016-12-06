import React from 'react';
import { ListGroupItem, Button, Grid, Col, Row } from 'react-bootstrap';
import './Product.css'

class Product extends React.Component {
  render() {
    return (
      <ListGroupItem className="Product">
        <Grid>
          <Row className="product-row">
            <Col xs={8}>
              <p className="product-name">{this.props.name}</p>
            </Col>
            <Col xs={4}>
                <Button
                  bsStyle="success"
                  bsSize="small"
                  onClick={() => this.props.clickHandler(this.props.id)}
                >
                  Buy (£{this.props.price.toFixed(2)})
                </Button>
            </Col>
          </Row>
        </Grid>
      </ListGroupItem>
    )
  }
}

export default Product;
