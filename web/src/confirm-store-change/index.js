import React from 'react';
import { connect } from 'react-redux';
import Page from '../chrome/page';
import Button from '../chrome/button';
import { performStoreChange } from '../actions/store';
import history from '../history';

const ConfirmStoreChange = ({ params: { storeCode }, defaultStoreCode, performStoreChange }) =>
  <Page title="Confirm Store Change"
    invert={true}
    nav={false}
    fullscreen={true}
  >
    <div>
      <h1>Changing stores?</h1>
      <p>We've detected that {storeCode} isn't your usual store and at the moment you can only be associated with a single store. Would you like us to move you over to {storeCode} (you can always change your association back on the profile screen)?</p>
      <p><Button onClick={() => performStoreChange({ storeCode })}>Change to {storeCode}</Button></p>
      <p><Button onClick={() => history.push('/store')}>Show {defaultStoreCode}</Button></p>
    </div>
  </Page>;

const mapStateToProps = ({ store: { code } }) => ({ defaultStoreCode: code });

export default connect(mapStateToProps, { performStoreChange })(ConfirmStoreChange);
