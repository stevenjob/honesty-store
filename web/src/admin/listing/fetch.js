import React from 'react';
import { connect } from 'react-redux';
import { performAllListings } from '../../actions/all-listings';

class AdminListingsFetch extends React.Component {
  componentWillMount() {
    const {
      listings,
      pending,
      performAllListings,
      params: { code }
    } = this.props;
    if (listings == null && !pending.some(el => el === 'all-listings')) {
      performAllListings({ storeCode: code });
    }
  }

  render() {
    return this.props.children;
  }
}

const mapStateToProps = ({ admin: { listings }, pending }) => ({
  listings,
  pending
});

const mapDispatchToProps = { performAllListings };

export default connect(mapStateToProps, mapDispatchToProps)(AdminListingsFetch);
