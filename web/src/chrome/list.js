import React from 'react';

export default ({ data, itemRenderer }) => (
  <ul className="list-reset my0 px1 bg-white border-bottom border-gray">
    {data == null
      ? <p>'No Data'</p>
      : data.map((item, index) => (
          <li
            key={index}
            className={`border-gray ${index > 0 ? 'border-top' : ''}`}
          >
            <div className="mxn1">
              {itemRenderer(item, index)}
            </div>
          </li>
        ))}
  </ul>
);
