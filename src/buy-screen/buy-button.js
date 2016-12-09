import React from 'react';
import { Button } from 'react-bootstrap';

class BuyButton extends React.Component {
  render() {
    const buttonStyle = this.props.active ? "success" : "default";
    return (
      <Button bsStyle={buttonStyle} disabled={!this.props.active}>Buy</Button>
    );
  }
}

export default BuyButton;
