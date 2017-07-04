import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Chrome from '../layout/chrome';
import StoreBrowser from '../chrome/store-browser';
import { performStoreChange } from '../actions/store';
import Currency from '../format/Currency';

const Profile = ({ emailAddress, balance, storeCode, performStoreChange }) => (
  <Chrome>
    <div className="navy bg-white center py2">
      <h3 className="mt0 mb1 regular">Your balance is</h3>
      <h1 className="mt1 mb1 regular"><Currency amount={balance} /></h1>
      <h3 className="regular my0 regular">
        <Link to="/topup/500">Topup</Link>
      </h3>
    </div>
    <div className="navy bg-white p2 mt1 col-12">
      <div className="flex border-bottom border-silver">
        <div className="col-9">
          <h3 className="mt2 mb1">Email</h3>
          <p className="mt1">{emailAddress}</p>
        </div>
        <div className="col-3 flex justify-end items-center">
          <Link to={`/profile/edit`}>Edit</Link>
        </div>
      </div>
      <div>
        <h3 className="mt2">Default Store</h3>
        <StoreBrowser
          onSubmit={storeCode => performStoreChange({ storeCode })}
          buttonText="Change Store"
          storePlaceholder={storeCode}
        />
      </div>
    </div>
    <div className="navy bg-white mt1 p2">
      <div className="flex">
        <h3 className="mt0 mb1 col-9">Latest Transaction</h3>
        <Link to="profile/history">View history</Link>
      </div>

    </div>
    <ul className="list-reset bg-white px1 mt1">
      <li className="border-bottom border-silver">
        <Link className="aqua btn block mxn1" to={`/profile/logout`}>
          Log Out
        </Link>
      </li>
      <li>
        <Link className="red btn block mxn1" to={`/profile/close`}>
          Close Account
        </Link>
      </li>
    </ul>
  </Chrome>
);

const mapStateToProps = ({
  user: { emailAddress, balance, transactions },
  store: { code }
}) => ({
  emailAddress,
  balance: balance || 0,
  storeCode: code,
  latestTransaction: (transactions.length > 0 ? transactions[0] : undefined)
});

const mapDispatchToProps = { performStoreChange };

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
