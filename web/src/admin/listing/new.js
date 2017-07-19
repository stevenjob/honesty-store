import React from 'react';
import { connect } from 'react-redux';
import { performCreateListing } from '../../actions/create-listing';
import { BackToPage } from '../../chrome/link';
import Full from '../../layout/full';
import FormElement from '../shared/form-element';
import convertEmptyStringToNull from '../convertToNull';

class NewListingDetails extends React.Component {
  constructor(props) {
    super(props);
    const { details } = this.props;
    const {
      name,
      qualifier,
      image,
      price,
      sellerId,
      listCount
    } = details || {};
    this.state = {
      name,
      qualifier,
      image,
      price,
      sellerId,
      listCount
    };
  }

  updateState(e) {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  handleUpdateItemSubmit() {
    const { params: { code, itemId }, performCreateListing } = this.props;
    const { price, listCount, ...other } = this.state;
    const listingDetails = {
      ...other,
      price: Number(price),
      listCount: Number(listCount)
    };
    performCreateListing({
      storeCode: code,
      itemId,
      details: convertEmptyStringToNull(listingDetails)
    });
  }

  render() {
    const { name, qualifier, image, price, sellerId, listCount } = this.state;
    const { params: { code } } = this.props;
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
              handler={e => this.updateState(e)}
            />
            <FormElement
              id="qualifier"
              description="Qualifier"
              value={qualifier}
              handler={e => this.updateState(e)}
            />
            <FormElement
              id="image"
              description="Image"
              value={image}
              handler={e => this.updateState(e)}
            />
            <FormElement
              id="price"
              description="Price, including all fees (p)"
              value={price || ''}
              handler={e => this.updateState(e)}
            />
            <FormElement
              id="listCount"
              description="Number of items"
              value={listCount}
              handler={e => this.updateState(e)}
            />
            <FormElement
              id="sellerId"
              description="Seller Id"
              value={sellerId}
              handler={e => this.updateState(e)}
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

const mapStateToProps = ({ admin }, { params: { itemId } }) => {
  const items = admin.items || [];
  const item = items.find(({ id }) => id === itemId);
  return {
    details: item
  };
};

export default connect(mapStateToProps, { performCreateListing })(
  NewListingDetails
);
