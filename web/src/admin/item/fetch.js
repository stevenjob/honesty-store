import React from 'react';
import { connect } from 'react-redux';
import { performAllItems } from '../../actions/all-items';

class AdminItemsFetch extends React.Component {
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

const mapStateToProps = ({ admin: { items }, pending }) => ({
  items,
  pending
});

export default connect(mapStateToProps, { performAllItems })(AdminItemsFetch);
