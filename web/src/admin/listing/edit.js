import React from 'react';
import { connect } from 'react-redux';
import {
  performUpdateListingDetails
} from '../../actions/update-listing-details';
import { BackToPage } from '../../chrome/link';
import Full from '../../layout/full';
import FormElement from '../shared/form-element';
import convertEmptyStringToNull from '../convertToNull';
import { formatWithSymbol } from '../../format/Currency';

const parsePriceInPounds = price => Number(price.replace(/^£/, '')) * 100;

class EditListingDetails extends React.Component {
  constructor(props) {
    super(props);
    const { details } = this.props;
    const { name, qualifier, image, price } = details || {};
    const priceInPounds = formatWithSymbol(price);
    this.state = {
      name,
      qualifier,
      image,
      priceInPounds
    };
  }

  updateState(e) {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  handleUpdateItemSubmit() {
    const {
      params: { code, itemId },
      performUpdateListingDetails
    } = this.props;
    const { priceInPounds, listCount, ...other } = this.state;
    const listingDetails = {
      ...other,
      price: parsePriceInPounds(priceInPounds)
    };
    performUpdateListingDetails({
      storeCode: code,
      itemId,
      details: convertEmptyStringToNull(listingDetails)
    });
  }

  render() {
    const { name, qualifier, image, priceInPounds } = this.state;
    const { params: { code }, isAdmin } = this.props;
    return (
      <Full
        left={<BackToPage path={`/admin/listing/${code}`} title="Listings" />}
      >
        <div className="px2 center">
          <form>
            <FormElement
              id="name"
              description="Name"
              value={name}
              disabled={!isAdmin}
              handler={e => this.updateState(e)}
            />
            <FormElement
              id="qualifier"
              description="Qualifier"
              value={qualifier}
              disabled={!isAdmin}
              handler={e => this.updateState(e)}
            />
            <FormElement
              id="image"
              description="Image"
              value={image}
              disabled={!isAdmin}
              handler={e => this.updateState(e)}
            />
            <FormElement
              id="priceInPounds"
              description="Price per item including all fees (£)"
              value={priceInPounds || ''}
              handler={e => this.updateState(e)}
              placeholder="1.50"
            />
            <button
              type="button"
              className="btn btn-primary btn-big center mt2 h3"
              onClick={() => this.handleUpdateItemSubmit()}
            >
              Save
            </button>
          </form>
        </div>
      </Full>
    );
  }
}

const mapStateToProps = (
  { admin, user: { flags } },
  { params: { itemId } }
) => {
  const items = admin.store.items || [];
  const item = items.find(({ id }) => id === itemId);
  return {
    details: item,
    isAdmin: !!flags.admin
  };
};

export default connect(mapStateToProps, { performUpdateListingDetails })(
  EditListingDetails
);
