import React from 'react';
import { connect } from 'react-redux';
import { performUpdateListingCount } from '../../actions/update-listing-count';
import { BackToPage } from '../../chrome/link';
import Full from '../../layout/full';
import FormElement from '../shared/form-element';

class UpdateCount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      availableCount: props.item.count
    };
  }

  updateState(e) {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  handleUpdateCountSubmit() {
    const {
      params: { code: storeCode, itemId },
      performUpdateListingCount
    } = this.props;
    const { availableCount } = this.state;
    performUpdateListingCount({
      itemId,
      storeCode,
      count: Number(availableCount)
    });
  }

  render() {
    const { availableCount } = this.state;
    const { params: { code }, item: { name, qualifier } } = this.props;
    return (
      <Full
        left={<BackToPage path={`/admin/listing/${code}`} title="Listings" />}
      >
        <div className="px2 center">
          <p>Adjust availability of {name}{qualifier ? ` ${qualifier}` : ''}</p>
          <form>
            <FormElement
              id="availableCount"
              description="Available count"
              value={availableCount}
              handler={e => this.updateState(e)}
              noValidate
              type="number"
              min="1"
              step="any"
            />
            <button
              type="button"
              className="btn btn-primary btn-big center mt2 h3"
              onClick={() => this.handleUpdateCountSubmit()}
            >
              Add more
            </button>
          </form>
        </div>
      </Full>
    );
  }
}

export default connect(
  ({ store: { items } }, { params: { itemId } }) => ({
    item: items.find(({ id }) => id === itemId)
  }),
  { performUpdateListingCount }
)(UpdateCount);
