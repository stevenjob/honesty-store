import React from 'react';

class Store extends React.Component {
  render() {
    return (
      <h2>{this.props.params.name}</h2>
    );
  }
}

export default Store;
