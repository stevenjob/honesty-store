import React from 'react';
import safeLookupItemImage from '../item/safeLookupItemImage';
import './item.css';

export default ({ item: { name, image }, delta, outro=true }) => {
  const value = 500;
  const scale = 1 + delta / value;
  const clamped = Math.max(Math.min(scale, 1.2), 0.8);
  const className = outro ? `survey-item-outro-${(delta > 0 ? 'win' : 'lose')}` : '';
  return (
    <div className="flex flex-column m1"
      style={{
        opacity: delta < 0 ? 0.25 : 1
      }}>
      <div className={className}>
        <div className="bg-center bg-no-repeat m2"
          style={{
            backgroundImage: `url(${safeLookupItemImage(image)})`,
            paddingBottom: '100%',
            transform: `scale(${clamped})`
          }}>
          {'\u00a0'}
        </div>
      </div>
      <h3 className="">
        {name}
      </h3>
    </div>
  );
};
