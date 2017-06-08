import React from 'react';
import { connect } from 'react-redux';
import { performRefund } from '../actions/refund';
import { Back } from '../chrome/link';
import Full from '../layout/full';

const Radio = ({ name, value, onClick }) => <input type="radio" name={name} id={value} value={value} onClick={() => onClick(value)} />;

class RefundRequest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      refundReason: ''
    };
  }

  handleRadioClick(name) {
    this.setState({
      refundReason: name
    })
  }

  handleRefundRequest() {
    const { refundReason } = this.state;
    const valid = refundReason !== '';
    this.setState({
      valid: false
    });
    if (valid) {
      const { performRefund, params: { transactionId } } = this.props;
      performRefund({ transactionId, reason: refundReason });
    }
  }

  render() {

    const { itemName } = this.props;

    return (
      <Full left={<Back></Back>}>
        <h2 className="regular">Mind telling us why you'd like a refund for your {itemName}?</h2>
        <form className="col-10 mx-auto center">
          <div className="py2 left-align">
            <span className="mr2">
              <Radio name="refund" value="accidentalPurchase" onClick={() => this.handleRadioClick('accidentalPurchase')} />
            </span>
            <label htmlFor="accidentalPurchase" className="h3">I didn't mean to buy it</label>
          </div>
          <div className="py2 left-align">
            <span className="mr2">
              <Radio name="refund" value="outOfStock" onClick={() => this.handleRadioClick('outOfStock')} />
            </span>
            <label htmlFor="outOfStock" className="h3">It's out of stock</label>
          </div>
          <div className="py2 left-align">
            <span className="mr2">
             <Radio name="refund" value="stockExpired" onClick={() => this.handleRadioClick('stockExpired')} />
            </span>
            <label htmlFor="stockExpired" className="h3">It's passed its expiry date</label>
          </div>
          <p className="btn btn-primary btn-big center mt2 h3" onClick={() => this.handleRefundRequest()}>Submit refund request</p>
        </form>
      </Full>
    );
  }
}

const mapStateToProps = ({ user: { transactions }, store: { items } }, { params: { transactionId } }, ownProps) => {
  const { data: { itemId } } = transactions.find(({ id }) => id === transactionId);
  if (itemId == null) {
    console.error('Transaction cannot be refunded');
  }
  const { name: itemName } = items.find(({ id }) => id === itemId);
  return {
    ...ownProps,
    itemName
  }
}

export default connect(mapStateToProps, { performRefund })(RefundRequest);