import React from 'react';
import { ListGroupItem, Button, Grid, Col, Row } from 'react-bootstrap';

class Product extends React.Component {

  render() {
    return (
      <ListGroupItem>
        <Grid>
          <Row>
            <Col xs={9}>
              <p>{this.props.name} - £{this.props.price.toFixed(2)}</p>
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
