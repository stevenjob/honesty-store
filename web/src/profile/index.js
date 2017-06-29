import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Chrome from '../layout/chrome';
import StoreBrowser from '../chrome/store-browser';
import { performStoreChange } from '../actions/store';
import Currency from '../format/Currency';
import Transaction from './transaction';
import { determinePrepay } from '../balance/prepay';

const Profile = ({
  emailAddress,
  balance,
  storeCode,
  performStoreChange,
  latestTransaction,
  isPrepay
}) => (
  <Chrome>
    <div className="navy bg-white center py2">
      <h3 className="mt0 mb1 regular">Your account balance is</h3>
      <h1 className="mt1 mb1 regular"><Currency amount={balance} /></h1>
      <h3 className="regular my0 regular">
        {isPrepay
          ? <Link to="/topup/500">Topup now</Link>
          : <Link to="/balance">View card</Link>}
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
        <h3 className="mt2">Store</h3>
        <StoreBrowser
          onSubmit={storeCode => performStoreChange({ storeCode })}
          buttonText="Change Store"
          storePlaceholder={storeCode}
        />
      </div>
    </div>
    <div className="navy bg-white my1 p2">
      <div className="flex justify-between">
        <h3 className="mt0 mb1">Latest activity</h3>
        <Link to="profile/history">View history</Link>
      </div>
      <Transaction transaction={latestTransaction} />
    </div>
    <ul className="list-reset bg-white px1 mt1">
      <li className="border-bottom border-silver py1">
        <Link className="aqua btn block mxn1" to={`/profile/logout`}>
          Log out
        </Link>
      </li>
      <li className="py1">
        <Link className="red btn block mxn1" to={`/profile/close`}>
          Close account
        </Link>
      </li>
    </ul>
  </Chrome>
);

const mapStateToProps = ({
  user: { creditLimit, emailAddress, balance, transactions },
  store: { code }
}) => ({
  emailAddress,
  balance: balance || 0,
  storeCode: code,
  latestTransaction: transactions.length > 0 ? transactions[0] : undefined,
  isPrepay: determinePrepay(creditLimit)
});

const mapDispatchToProps = { performStoreChange };

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
