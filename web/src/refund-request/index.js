import React from 'react';
import { connect } from 'react-redux';
import { performRefund } from '../actions/refund';
import { Back } from '../chrome/link';
import Full from '../layout/full';
import './index.css';

const Radio = ({ name, value, onClick, text }) => (
  <div>
    <input
      type="radio"
      name={name}
      id={value}
      value={value}
      onClick={() => onClick()}
    />
    <label htmlFor={value} className="h3 inline-block">
      <span className="mx2 radio" />{text}
    </label>
  </div>
);

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
    });
  }

  handleRefundRequest() {
    const { refundReason } = this.state;
    const valid = this.isValidReasonSelected();

    if (valid) {
      const { performRefund, params: { transactionId } } = this.props;
      performRefund({ transactionId, reason: refundReason });
    }
  }

  isValidReasonSelected() {
    const { refundReason } = this.state;
    return refundReason !== '';
  }

  render() {
    const { itemName } = this.props;

    return (
      <Full left={<Back fallbackPath="/profile" />}>
        <div className="refund-request">
          <h2 className="regular">
            Want a refund?
          </h2>
          <p>
            Please let us know why you'd like a refund for your {itemName}
          </p>
          <form className="col-11 sm-col-8 mx-auto center">
            <div className="py2 left-align">
              <Radio
                name="refund"
                value="accidentalPurchase"
                text="I didn't mean to buy it"
                onClick={() => this.handleRadioClick('accidentalPurchase')}
              />
            </div>
            <div className="py2 left-align">
              <Radio
                name="refund"
                value="outOfStock"
                text="The item's out of stock"
                onClick={() => this.handleRadioClick('outOfStock')}
              />
            </div>
            <div className="py2 left-align">
              <Radio
                name="refund"
                value="stockExpired"
                text="It's passed its expiry date"
                onClick={() => this.handleRadioClick('stockExpired')}
              />
            </div>
            <button
              type="button"
              className="btn btn-primary btn-big center mt2 h3"
              disabled={!this.isValidReasonSelected()}
              onClick={() => this.handleRefundRequest()}
            >
              Submit refund request
            </button>
          </form>
        </div>
      </Full>
    );
  }
}

const mapStateToProps = (
  { user: { transactions }, store: { items } },
  { params: { transactionId } },
  ownProps
) => {
  const { data: { itemId } } = transactions.find(
    ({ id }) => id === transactionId
  );
  const { name: itemName } = items.find(({ id }) => id === itemId);
  return {
    ...ownProps,
    itemName
  };
};

export default connect(mapStateToProps, { performRefund })(RefundRequest);
