import React from 'react';
import { connect } from 'react-redux';
import { nonRefundableTransaction } from '../actions/refund';

class RefundGuard extends React.Component {
  componentWillMount() {
    const {
      transactions,
      transactionId,
      nonRefundableTransaction
    } = this.props;

    if (transactions != null) {
      const transaction = transactions.find(({ id }) => id === transactionId);
      if (transaction == null || transaction.type !== 'purchase') {
        nonRefundableTransaction();

        this.setState({ valid: false });
        return;
      }
    }

    this.setState({ valid: true });
  }

  render() {
    return this.state.valid ? this.props.children : null;
  }
}

const mapStateToProps = (
  { user: { transactions } },
  { params: { transactionId } }
) => ({
  transactions,
  transactionId
});

const mapDispatchToProps = { nonRefundableTransaction };

export default connect(mapStateToProps, mapDispatchToProps)(RefundGuard);
