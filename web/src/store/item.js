import React from 'react';
import './item.css';

export default ({ name, price }) => 
  <div className="store-item">
    <img 
      src={require("./assets/freddo.png")}
    />
    <div className="store-item-description">
      <p>{name}</p>
      <p>{price}p</p>
    </div>
  </div>;