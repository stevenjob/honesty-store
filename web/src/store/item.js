import React from 'react';
import './item.css';

export default ({ image, name, price }) => 
  <div className="store-item">
    <img 
      src={require(`./assets/${image}`)}
      alt={name}
    />
    <div className="store-item-description">
      <p>{name}</p>
      <p></p>
      <p>{price}<small>p</small></p>
    </div>
  </div>;