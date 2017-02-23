import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Full from '../layout/full';
import { performStoreChange } from '../actions/store';
import history from '../history';

const ConfirmStoreChange = ({ params: { storeCode }, defaultStoreCode, performStoreChange }) =>
  <Full>
    <h1>Changing stores?</h1>
    <p>We've detected that {storeCode} isn't your usual store and at the moment you can only be associated with one.</p>
    <p>Would you like us to move you over to {storeCode} (you can always change your association back on the profile screen)?</p>
    <p><Link className="btn btn-primary" onClick={() => performStoreChange({ storeCode })}>Change to {storeCode}</Link></p>
    <p><Link className="btn btn-primary" onClick={() => history.push('/store')}>Show {defaultStoreCode}</Link></p>
  </Full>;

const mapStateToProps = ({ store: { code } }) => ({ defaultStoreCode: code });

export default connect(mapStateToProps, { performStoreChange })(ConfirmStoreChange);
