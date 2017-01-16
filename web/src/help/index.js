import React from 'react';
import Page from '../chrome/page';
import './index.css';

export default ({ params: { storeId } }) => (
  <Page title="Help"
    storeId={storeId}>
    <b>Help</b>
  </Page>
);
