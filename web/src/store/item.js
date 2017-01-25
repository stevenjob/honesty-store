import React from 'react';
import { Link } from 'react-router';
import './item.css';

export default ({ item: { id, name, price }, image, storeId }) =>
  <div className="store-item">
    <Link to={`/${storeId}/item/${id}`}>
      <img
        src={require(`./assets/${image}`)}
        alt={name}
      />
      <div className="store-item-description">
        <p>{name}</p>
        <p>{price}<small>p</small></p>
      </div>
    </Link>
  </div>;