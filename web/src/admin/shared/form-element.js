import React from 'react';

export default ({ id, description, value, handler, ...other }) => (
  <p>
    <label htmlFor="name">{description}</label>
    <input
      id={id}
      type="text"
      value={value || ''}
      className="input"
      onChange={handler}
      {...other}
    />
  </p>
);
