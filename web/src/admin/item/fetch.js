import React from 'react';
import { connect } from 'react-redux';
import { performAllItems } from '../../actions/all-items';

class ItemFetch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      valid: false
    };
  }
  componentWillMount() {
    const { items, pending, performAllItems } = this.props;
    if (items == null && !pending.some(el => el === 'all-items')) {
      performAllItems();
    } else {
      this.setState({
        valid: true
      });
    }
  }

  render() {
    return this.state.valid ? this.props.children : null;
  }
}

const mapStateToProps = ({ marketplace: { items }, pending }) => ({
  items,
  pending
});

const mapDispatchToProps = { performAllItems };

export default connect(mapStateToProps, mapDispatchToProps)(ItemFetch);
