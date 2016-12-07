import React from 'react';
import { ListGroupItem, Button, Grid, Col, Row } from 'react-bootstrap';
import './product.css'

class Product extends React.Component {
  render() {
    return (
      <ListGroupItem className="product">
        {/* Get rid of this nested grid */}
        <Grid>
          <Row className="product-row">
            <Col xs={8}>
              <p className="product-name">{this.props.name}</p>
            </Col>
            <Col xs={4}>
                <Button
                  bsStyle="success"
                  bsSize="small"
                  // Just pass the product back
                  onClick={() => this.props.buyButtonClickHandler(this.props.id)}
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
