import React from 'react';
import { connect } from 'react-redux';
import { performLoad } from '../actions/load';
import './fonts.css';
import './form.css';
import './link.css';
import './root.css';

class Root extends React.Component {
  componentDidMount() {
    const { dispatch, routeParams: { storeId }} = this.props;
    dispatch(performLoad({ storeId }));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.routeParams.storeId !== this.props.routeParams.storeId) {
      const { dispatch, routeParams: { storeId } } = nextProps;
      dispatch(performLoad({ storeId }));
    }
  }

  render() {
    return this.props.children;
  }
}

export default connect(() => ({}))(Root);
