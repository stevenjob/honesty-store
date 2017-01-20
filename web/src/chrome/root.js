import React from 'react';
import { connect } from 'react-redux';
import { performFullRegistration } from '../actions/register';
import './fonts.css';
import './form.css';
import './link.css';
import './root.css';

class Root extends React.Component {
  componentDidMount() {
    const { dispatch, routeParams: { storeId }} = this.props;
    // HACK!!! This is a short-term workaround to ensure Stripe is loaded before we dispatch our registration requests.
    setTimeout(() => dispatch(performFullRegistration(storeId)), 100);
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
