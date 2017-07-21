import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { performUpdateStockCount } from '../actions/update-stock-count';
import Full from '../layout/full';
import { BackToPage } from '../chrome/link';
import { StockLevel } from './stocklevel';

export const Report = ({ itemId, children }) => (
  <Link to={`/help/item/${itemId}`}>
    {children}
  </Link>
);

class UpdateStockCount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      updatedStockCount: props.item.count
    };
  }
  render() {
    const {
      item: { id: itemId, name, count },
      storeCode,
      performUpdateStockCount
    } = this.props;
    const { updatedStockCount } = this.state;
    return (
      <Full left={<BackToPage title="Item" path={`/item/${itemId}`} />}>
        <h1>
          Update stock level
        </h1>
        <h2>
          {name}
        </h2>
        <div className="mb3">
          {count <= 0
            ? <p className="red">This item has been reported out of stock</p>
            : <StockLevel count={count} />}
        </div>
        <p>
          We estimate stock levels by keeping track of purchases, but it doesn't always work out.
        </p>
        <p>
          We think there are
          {' '}
          <span className="bold">{count}</span>
          {' '}
          remaining. If this isn't quite right, please enter the current count below.
        </p>
        <input
          className="col-6 md-col-3 block input mx-auto"
          value={updatedStockCount}
          placeholder="10"
          onChange={e =>
            this.setState({ updatedStockCount: Number(e.target.value) })}
          type="number"
          min="0"
          step="any"
        />
        <div className="my3">
          <Link
            className="btn btn-primary"
            onClick={() =>
              performUpdateStockCount({
                itemId,
                storeCode,
                count: updatedStockCount
              })}
          >
            Update stock count
          </Link>
        </div>
        <Report itemId={itemId}>
          Report a problem
        </Report>
      </Full>
    );
  }
}

const mapStateToProps = (
  { store: { items, code: storeCode } },
  { params: { itemId } }
) => {
  const item = items.find(({ id }) => id === itemId);

  return {
    item,
    storeCode
  };
};

const mapDispatchToProps = { performUpdateStockCount };
export default connect(mapStateToProps, mapDispatchToProps)(UpdateStockCount);
