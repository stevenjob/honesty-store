import React from 'react';
import { connect } from 'react-redux';
import { performOutOfStock } from '../actions/out-of-stock';

const OutOfStock = ({ itemId, performOutOfStock }) => (
  <p
    className="btn white bg-red"
    onClick={() => performOutOfStock({ itemId })}
  >
    {`Report Out of Stock`}
  </p>
);

const mapStateToProps = () => ({});

const mapDispatchToProps = { performOutOfStock };

export default connect(mapStateToProps, mapDispatchToProps)(OutOfStock);
