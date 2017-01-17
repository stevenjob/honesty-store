import React from 'react';
import './item.css';

export default ({ image, name, price }) => 
  <div className="store-item">
    <img 
      src={require(`./assets/${image}`)}
      alt=""
    />
    <div className="store-item-description">
      <p>{name}</p>
      <p>{price}p</p>
    </div>
  </div>;