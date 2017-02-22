import React from 'react';
import { connect } from 'react-redux';
import Page from '../chrome/page';
import Button from '../chrome/button';
import { performStoreChange } from '../actions/store';
import history from '../history';

const ConfirmStoreChange = ({ params: { storeCode }, performStoreChange }) =>
  <Page title="Confirm Store Change"
    invert={true}
    nav={false}
    fullscreen={true}
  >
    <div>
      <h1>Would you like to change stores?</h1>
      <p>{storeCode} isn't your usual store, are you sure you want to change?</p>
      <p><Button onClick={() => performStoreChange({ storeCode })}>Yes please</Button></p>
      <p><Button onClick={() => history.push('/store')}>No thanks</Button></p>
    </div>
  </Page>;

export default connect(() => ({}), { performStoreChange })(ConfirmStoreChange);
