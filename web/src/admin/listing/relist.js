import React from 'react';
import { connect } from 'react-redux';
import { performRelist } from '../../actions/relist';
import { BackToPage } from '../../chrome/link';
import Full from '../../layout/full';
import FormElement from '../shared/form-element';

class RelistItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      additionalCount: 0
    };
  }

  updateState(e) {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  handleRelistItemSubmit() {
    const { params: { code, itemId }, performRelist } = this.props;
    const { additionalCount } = this.state;
    performRelist({
      storeCode: code,
      itemId,
      additionalCount: Number(additionalCount)
    });
  }

  render() {
    const { additionalCount } = this.state;
    const { params: { code }, item: { name, qualifier } } = this.props;
    return (
      <Full
        left={<BackToPage path={`/admin/listing/${code}`} title="Listings" />}
      >
        <div className="px2 center">
          <p>Add more {name}{qualifier ? ` ${qualifier}` : ''}</p>
          <form>
            <FormElement
              id="additionalCount"
              description="Additional count"
              value={additionalCount}
              handler={e => this.updateState(e)}
            />
            <button
              type="button"
              className="btn btn-primary btn-big center mt2 h3"
              onClick={() => this.handleRelistItemSubmit()}
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
  ({ admin: { store: { items } } }, { params: { itemId } }) => ({
    item: items.find(({ id }) => id === itemId)
  }),
  { performRelist }
)(RelistItem);
