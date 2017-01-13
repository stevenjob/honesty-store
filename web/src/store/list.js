import React from 'react';
import List from '../chrome/list';
import './list.css'

const itemRenderer = (storeId) => (data, index) => (
  <b>{storeId} Item {data}</b>
);

export default ({ params: { storeId } }) => (
  <List data={[1,2,3,4,5]} itemRenderer={itemRenderer(storeId)}/>
);
