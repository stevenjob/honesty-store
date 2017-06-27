import React from 'react';
import { connect } from 'react-redux';
import { performAllItems } from '../../actions/all-items';

class ItemFetch extends React.Component {
  componentWillMount() {
    const { items, pending, performAllItems } = this.props;
    if (items == null && !pending.some(el => el === 'all-items')) {
      performAllItems();
    }
  }

  render() {
    return this.props.children;
  }
}

const mapStateToProps = ({ marketplace: { items }, pending }) => ({
  items,
  pending
});

const mapDispatchToProps = { performAllItems };

export default connect(mapStateToProps, mapDispatchToProps)(ItemFetch);
