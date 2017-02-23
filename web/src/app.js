import React from 'react';
import Error from './chrome/error';
import Loading from './chrome/loading';
import { connect } from 'react-redux';

const App = ({ error, children, loading }) => {
  if (error) {
    return <Error />;
  }
  if (loading) {
    return <Loading />;
  }
  return children;
};


const mapStateToProps = ({ error, pending }) => ({
  error,
  loading: pending.length > 0
});

export default connect(mapStateToProps)(App);
