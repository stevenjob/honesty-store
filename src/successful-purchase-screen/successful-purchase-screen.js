import React from 'react';
import { Grid, Row, Col, Jumbotron, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import mockApi from '../mock-api';

class SuccessfulPurchaseScreen extends React.Component {

  render() {
    const storeHomePage = `/${this.props.params.storeName}`;
    return (
      <Grid>
        <Row>
          <Col xs={12}>
            <Jumbotron>
              <h2>Purchase Successful</h2>
              <p>Your current balance is <strong>£{mockApi.getBalance().toFixed(2)}</strong></p>
              <Link to={storeHomePage}>
                <Button bsStyle="primary">Return to store</Button>
              </Link>
            </Jumbotron>
          </Col>
        </Row>
      </Grid>
    );
  }
}

export default SuccessfulPurchaseScreen;
