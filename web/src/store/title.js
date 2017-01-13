import React from 'react';
import TitleBar from '../chrome/title-bar';

export default ({ params: { storeId } }) => (
  <TitleBar title="Store" subtitle={`@${storeId}`}/>
);


