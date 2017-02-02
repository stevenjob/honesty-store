import React from 'react';
import { Link } from 'react-router';
import './item.css';

export default ({ item: { id, name, price, image } }) =>
  <div className="store-item">
    <Link to={`/item/${id}`}>
      <div
        className="store-item-image"
        style={{ backgroundImage: `url(${require(`../item/assets/${image}`)})` }}
        alt={name}
        />
      <div className="store-item-description">
        <p>{name}</p>
        <p>{price}<small>p</small></p>
      </div>
    </Link>
  </div>;
