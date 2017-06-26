import React from 'react';
import { connect } from 'react-redux';
import { Back } from '../../chrome/link';
import Chrome from '../../layout/chrome';
import { performUpdateItem } from '../../actions/update-item';

const FormElement = ({ id, description, value, handler }) => (
  <p>
    <label htmlFor="name">{description}</label>
    <input
      id={id}
      type="text"
      value={value || ''}
      className="input"
      onChange={handler}
    />
  </p>
);

class MarketplaceItemDetailsEdit extends React.Component {
  constructor(props) {
    super(props);
    const { item } = this.props;
    this.state = {
      ...item
    };
  }

  updateState(e) {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  handleUpdateItemSubmit() {
    const { id: _id, ...details } = this.state;
    const { performUpdateItem, item: { id } } = this.props;

    performUpdateItem({
      id,
      details
    });
  }

  render() {
    const {
      name,
      qualifier,
      genericName,
      genericNamePlural,
      unit,
      unitPlural,
      image
    } = this.state;
    return (
      <Chrome left={<Back />} title="Edit Item">
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
              id="genericName"
              description="Category"
              value={genericName}
              handler={e => this.updateState(e)}
            />
            <FormElement
              id="genericNamePlural"
              description="Category plural"
              value={genericNamePlural}
              handler={e => this.updateState(e)}
            />
            <FormElement
              id="unit"
              description="Unit"
              value={unit}
              handler={e => this.updateState(e)}
            />
            <FormElement
              id="unitPlural"
              description="Unit plural"
              value={unitPlural}
              handler={e => this.updateState(e)}
            />
            <FormElement
              id="image"
              description="Image"
              value={image}
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
      </Chrome>
    );
  }
}

const mapStateToProps = ({ marketplace }, { params: { itemId } }) => {
  if (marketplace == null) {
    return {};
  }
  const item = marketplace.items.find(({ id }) => id === itemId);
  return {
    item
  };
};

export default connect(mapStateToProps, { performUpdateItem })(
  MarketplaceItemDetailsEdit
);
