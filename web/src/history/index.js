import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import List from '../chrome/list';
import Chrome from '../layout/chrome';
import HistoryItem from './item';
import Currency from '../format/Currency';

const itemRenderer = transaction => <HistoryItem transaction={transaction} />;

const History = ({ transactions, balance }) => (
  <Chrome>
    <div className="border-gray border-top border-bottom bg-white mt3 mb3">
      <Link
        to="/topup"
        className="btn regular flex items-center justify-between navy"
      >
        <div>
          <h3>
            Your balance is <Currency amount={balance} />
          </h3>
          <p className="aqua">
            Tap here to top up using your registered card.
          </p>
        </div>
      </Link>
    </div>
    <List data={transactions} itemRenderer={itemRenderer} />
  </Chrome>
);

const mapStateToProps = ({ user: { transactions, balance } }) => {
  const refundTransactions = transactions.filter(
    ({ type }) => type === 'refund'
  );
  const mergedTransactions = transactions.filter(
    ({ id, type, other }) =>
      !(type === 'purchase' &&
        refundTransactions.some(({ other }) => other === id))
  );

  return {
    transactions: mergedTransactions,
    balance: balance || 0
  };
};

export default connect(mapStateToProps)(History);
