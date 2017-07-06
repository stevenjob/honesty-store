import React from 'react';
import Chrome from '../layout/chrome';
import List from '../chrome/list';

const More = () =>
  <Chrome>
    <List itemRenderer={item => JSON.stringify(item)}/>
  </Chrome>;

export default More;
