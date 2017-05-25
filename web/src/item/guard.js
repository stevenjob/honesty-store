import React from 'react';
import { connect } from 'react-redux';
import { unknownItem } from '../actions/unknown-item';

class ItemGuard extends React.Component {
  componentWillMount() {
    const { items, itemId, unknownItem } = this.props;

    if (items != null) {
      const item = items.find(item => item.id === itemId);
      if (item == null) {
        unknownItem(itemId);

        this.setState({ valid: false });
        return;
      }
    }

    this.setState({ valid: true });
  }

  render() {
    return this.state.valid ? this.props.children : null;
  }
}

const mapStateToProps = ({ store: { items } }, { params: { itemId } }) => ({
  items,
  itemId
});

const mapDispatchToProps = { unknownItem };

export default connect(mapStateToProps, mapDispatchToProps)(ItemGuard);
