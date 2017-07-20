import React from 'react';
import { connect } from 'react-redux';
import { performCreateListing } from '../../actions/create-listing';
import { BackToPage } from '../../chrome/link';
import Full from '../../layout/full';
import FormElement from '../shared/form-element';
import convertEmptyStringToNull from '../convertToNull';

const scottLogicId = '9127e1db-2a2c-41c5-908f-781ac816b633';

class NewListingDetails extends React.Component {
  constructor(props) {
    super(props);
    const { details } = this.props;
    const { name, qualifier, image, price, listCount } = details || {};
    this.state = {
      name,
      qualifier,
      image,
      price,
      sellerId: scottLogicId,
      listCount
    };
  }

  isScottLogicSelected() {
    const { sellerId } = this.state;
    return sellerId === scottLogicId;
  }

  updateState(e) {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  handleRadioButtonChange(e) {
    const seller = e.target.id;
    if (seller === 'scott-logic') {
      this.setState({
        sellerId: scottLogicId
      });
    } else {
      this.setState({
        sellerId: undefined
      });
    }
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
            <div className="mt3 mb2">
              <p className="mt0 mb1">Who's selling the items?</p>
              <input
                type="radio"
                name="sellerId"
                id="scott-logic"
                value="scott-logic"
                checked={this.isScottLogicSelected()}
                onChange={e => this.handleRadioButtonChange(e)}
              />
              <label htmlFor="scott-logic" className="ml1 h4 inline-block">
                Scott Logic
              </label>
              <input
                className="ml3"
                type="radio"
                name="sellerId"
                id="marketplace"
                value="marketplace"
                checked={!this.isScottLogicSelected()}
                onChange={e => this.handleRadioButtonChange(e)}
              />
              <label htmlFor="marketplace" className="ml1 h4 inline-block">
                Other
              </label>
            </div>
            <FormElement
              id="sellerId"
              className={`${this.isScottLogicSelected() ? 'display-none' : ''}`}
              value={sellerId}
              placeholder="Seller id"
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
