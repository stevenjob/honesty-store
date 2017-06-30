import React from 'react';
import Full from '../../layout/full';
import FormElement from '../shared/form-element';

export default class EditItemDetails extends React.Component {
  constructor(props) {
    super(props);
    const { item } = this.props;
    const {
      name,
      qualifier,
      genericName,
      genericNamePlural,
      unit,
      unitPlural,
      image
    } = item || {};
    this.state = {
      name,
      qualifier,
      genericName,
      genericNamePlural,
      unit,
      unitPlural,
      image
    };
  }

  updateState(e) {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  convertEmptyStringToNull(obj) {
    const objectWithConvertedValues = {};
    for (const key of Object.keys(obj)) {
      objectWithConvertedValues[key] = obj[key] === '' ? null : obj[key];
    }
    return objectWithConvertedValues;
  }

  handleUpdateItemSubmit() {
    const { onSubmit } = this.props;
    onSubmit(this.convertEmptyStringToNull(this.state));
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
    const { left } = this.props;
    return (
      <Full left={left}>
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
      </Full>
    );
  }
}
