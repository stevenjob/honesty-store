import React from 'react';
import { connect } from 'react-redux';
import { performLoad } from '../actions/load';
import './fonts.css';
import './form.css';
import './link.css';
import './root.css';

class Root extends React.Component {
  componentDidMount() {
    const { dispatch, params: { storeId }, location: { query: { code: emailToken } } } = this.props;
    dispatch(performLoad({ storeId, emailToken }));
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch, params: { storeId }, location: { query: { code: emailToken } } } = nextProps;
    const existingStoreId = this.props.params.storeId;
    if (storeId !== existingStoreId || emailToken != null) {
      dispatch(performLoad({ storeId, emailToken }));
    }
  }

  render() {
    return this.props.children;
  }
}

export default connect(() => ({}))(Root);
