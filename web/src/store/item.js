import React from 'react';
import { Link } from 'react-router';
import Image from '../chrome/image';
import './item.css';

export default ({ item: { id, name, price, image } }) =>
  <div className="store-item">
    <Link to={`/item/${id}`}>
      <Image
        className="store-item-image"
        imageName={image}
        alt={name}
        />
      <div className="store-item-description">
        <p>{name}</p>
        <p>{price}<small>p</small></p>
      </div>
    </Link>
  </div>;
