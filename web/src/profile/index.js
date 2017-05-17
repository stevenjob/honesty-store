import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Chrome from '../layout/chrome';
import Balance from '../topup/balance';
import StoreBrowser from '../chrome/store-browser';
import { performStoreChange } from '../actions/store';

const Profile = ({ emailAddress, balance, storeCode, performStoreChange }) => (
  <Chrome title="Profile" right={<Balance balance={balance} />}>
    <div className="flex px2 navy bg-white border-bottom border-gray">
      <div className="col-9">
        <h2 className="mt2 mb1">Email</h2>
        <p className="mt1">{emailAddress}</p>
      </div>
      <div className="col-3 flex items-center justify-end">
        <Link to={`/profile/edit`}>Edit</Link>
      </div>
    </div>
    <div className="mt2 bg-white navy border-top border-bottom border-gray px1 center">
      <h2 className="mt2">Default Store</h2>
      <StoreBrowser
        onSubmit={storeCode => performStoreChange({ storeCode })}
        buttonText="Change Store"
        storePlaceholder={storeCode}
      />
    </div>
    <ul className="list-reset bg-white border-top border-bottom border-gray px1">
      <li className="border-bottom border-gray">
        <Link className="red btn block mxn1" to={`/profile/logout`}>
          Log Out
        </Link>
      </li>
      <li className="">
        <Link className="red btn block mxn1" to={`/profile/close`}>
          Close Account
        </Link>
      </li>
    </ul>
  </Chrome>
);

const mapStateToProps = ({
  user: { emailAddress, balance },
  store: { code }
}) => ({
  emailAddress,
  balance: balance || 0,
  storeCode: code
});

const mapDispatchToProps = { performStoreChange };

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
