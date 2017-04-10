import React from 'react';

export default () =>
  <img
    src={require('./assets/halo.svg')}
    alt="Liked"
    className="absolute"
    style={{ left: '-0.7rem', top: '-0.3rem', width: '1.5rem', transform: 'rotate(-10deg)' }}
    />;
