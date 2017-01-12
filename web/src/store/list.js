import React from 'react';
import List from '../chrome/list';
import './list.css'

const itemRenderer = (data, index) => (
  <b>Item {data}</b>
);

export default ({ children }) => (
  <List data={[1,2,3,4,5]} itemRenderer={itemRenderer}/>
);
