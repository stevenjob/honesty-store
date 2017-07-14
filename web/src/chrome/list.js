import React from 'react';

export default ({ data, itemRenderer, className }) => (
  <ul className={`list-reset my0 px1 bg-white ${className}`}>
    {data == null
      ? <p>'No Data'</p>
      : data.map((item, index) => (
          <li
            key={index}
            className={`border-silver ${index > 0 ? 'border-top' : ''}`}
          >
            <div className="mxn1">
              {itemRenderer(item, index)}
            </div>
          </li>
        ))}
  </ul>
);
