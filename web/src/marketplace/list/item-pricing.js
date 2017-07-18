import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { performMarketplace } from '../../actions/marketplace';
import { BackToPage } from '../../chrome/link';
import Stepper from '../../chrome/stepper';
import Currency from '../../format/Currency';
import Full from '../../layout/full';

const ourFees = 0.1;

const formatItemCount = count => (count !== 1 ? `${count} items` : `1 item`);

const getShrinkageInfo = (quantity, itemPrice, shrinkage) => {
  const shrunkItemCount = Math.ceil(quantity * shrinkage);
  const itemsSoldAfterShrinkage = quantity - shrunkItemCount;
  return {
    revenue: itemsSoldAfterShrinkage * itemPrice,
    shrunkItemCount
  };
};

const ShrinkagePayoutRow = ({ className, quantity, price, shrinkage }) => {
  const { revenue, shrunkItemCount } = getShrinkageInfo(
    quantity,
    price,
    shrinkage
  );
  return (
    <tr className={className}>
      <td>
        {shrinkage === 0
          ? 'If everything sells'
          : `With ${shrinkage * 100}% shrinkage (${formatItemCount(shrunkItemCount)})`}
      </td>
      <td className="aqua right-align">
        <Currency amount={revenue} />
      </td>
    </tr>
  );
};

class MarketplaceAddItemPricing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sellerFee: this.calculateMinimumSellerFee()
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    const {
      performMarketplace,
      storeCode,
      name,
      qualifier,
      quantity
    } = this.props;

    performMarketplace({
      storeCode,
      name,
      qualifier,
      itemPrice: this.getItemTotal(),
      quantity
    });
  }

  updateSellerFee(sellerFee) {
    this.setState({
      sellerFee
    });
  }

  calculateMinimumSellerFee() {
    const shrinkage = 0.1;
    const { quantity, totalPaid } = this.props;
    const itemPrice = totalPaid / quantity;
    const {
      revenue: revenueAfterShrinkage,
      shrunkItemCount
    } = getShrinkageInfo(quantity, itemPrice, shrinkage);
    const itemsSoldAfterShrinkage = quantity - shrunkItemCount;
    const loss = totalPaid - revenueAfterShrinkage;
    const sellerFee = Math.ceil(loss / itemsSoldAfterShrinkage);
    return isFinite(sellerFee) ? sellerFee : 0;
  }

  getItemSubtotal() {
    const { quantity, totalPaid } = this.props;
    const { sellerFee } = this.state;
    const rawItemPrice = totalPaid / quantity;
    return rawItemPrice + sellerFee;
  }

  getItemTotal() {
    const subtotal = this.getItemSubtotal();
    return Math.ceil(subtotal * (1 + ourFees));
  }

  render() {
    const { sellerFee } = this.state;
    const { quantity } = this.props;
    const itemPriceWithSellerFee = this.getItemSubtotal();

    return (
      <Full left={<BackToPage path="/more/list/details" title="Details" />}>
        <div className="left-align">
          <h2 className="regular center">Pricing details</h2>
          <h3 className="bold mb0 mt3">Seller fee</h3>
          <p className="mt0">
            Sometimes people forget to pay or there's a problem with one of the items.
            We recommend adding a little extra to each item to cover shrinkage and expenses.
          </p>
          <div className="col-8 sm-col-4 mx-auto">
            <Stepper
              label=""
              value={<Currency amount={sellerFee || 0} />}
              onIncrement={() => this.updateSellerFee(sellerFee + 1)}
              onDecrement={() => this.updateSellerFee(sellerFee - 1)}
              incrementDisabled={false}
              decrementDisabled={sellerFee <= 0}
            />
          </div>
          <div className="flex mt3 justify-between">
            <div className="flex flex-column">
              <h3 className="bold my0">Total price per item</h3>
              <p className="my0">(including 10% service fee)</p>
            </div>
            <h2 className="my0">
              <Currency amount={this.getItemTotal()} />
            </h2>
          </div>
          <h3 className="mt3">Estimated payout</h3>
          <table className="table block col-12">
            <tbody>
              <ShrinkagePayoutRow
                quantity={quantity}
                price={itemPriceWithSellerFee}
                shrinkage={0}
              />
              <ShrinkagePayoutRow
                className="bold"
                quantity={quantity}
                price={itemPriceWithSellerFee}
                shrinkage={0.1}
              />
              <ShrinkagePayoutRow
                quantity={quantity}
                price={itemPriceWithSellerFee}
                shrinkage={0.2}
              />
            </tbody>
          </table>

          <p className="my3 center">
            <Link
              className="btn btn-primary btn-big"
              onClick={e => this.handleSubmit(e)}
            >
              Submit item
            </Link>
          </p>
        </div>
      </Full>
    );
  }
}
const mapStateToProps = (
  { store: { code } },
  { params: { name, qualifier, quantity, totalPaid } }
) => {
  return {
    storeCode: code,
    name,
    qualifier,
    quantity: Number(quantity),
    totalPaid: Number(totalPaid)
  };
};

export default connect(mapStateToProps, { performMarketplace })(
  MarketplaceAddItemPricing
);
