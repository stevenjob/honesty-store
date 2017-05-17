import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { performOutOfStock } from '../actions/out-of-stock';

const OutOfStock = ({ itemId, performOutOfStock }) => (
  <Link className="aqua" onClick={() => performOutOfStock({ itemId })}>
    Report out of stock
  </Link>
);

const mapStateToProps = () => ({});

const mapDispatchToProps = { performOutOfStock };

export default connect(mapStateToProps, mapDispatchToProps)(OutOfStock);
