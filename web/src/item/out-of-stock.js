import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { performOutOfStock } from '../actions/out-of-stock';

const OutOfStock = ({ itemId, performOutOfStock }) => (
  <Link
    className="btn white bg-red"
    onClick={() => performOutOfStock({ itemId })}
  >
    Report Out of Stock
  </Link>
);

const mapStateToProps = () => ({});

const mapDispatchToProps = { performOutOfStock };

export default connect(mapStateToProps, mapDispatchToProps)(OutOfStock);
