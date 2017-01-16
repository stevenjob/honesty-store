import React from 'react';
import { connect } from 'react-redux';
import { performFullRegistration } from '../actions/register';
import './fonts.css';
import './root.css';

class Root extends React.Component {
  componentDidMount() {
    const { dispatch, routeParams: { storeId }} = this.props;
    dispatch(performFullRegistration(storeId));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.routeParams.storeId !== this.props.routeParams.storeId) {
      const { dispatch, routeParams: { storeId } } = nextProps;
      dispatch(performFullRegistration(storeId));
    }
  }

  render() {
    return this.props.children;
  }
}

export default connect(() => ({}))(Root);
