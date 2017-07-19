import React from 'react';
import { connect } from 'react-redux';
import { performAllListings } from '../../actions/all-listings';

class AdminListingsFetch extends React.Component {
  componentWillMount() {
    const { store, pending, performAllListings, params: { code } } = this.props;
    if (store == null && !pending.some(el => el === 'all-listings')) {
      performAllListings({ storeCode: code });
    }
  }

  render() {
    const { pending, children } = this.props;
    return pending.length === 0 ? children : null;
  }
}

const mapStateToProps = ({ admin: { store }, pending }) => ({
  store,
  pending
});

const mapDispatchToProps = { performAllListings };

export default connect(mapStateToProps, mapDispatchToProps)(AdminListingsFetch);
