import React from 'react';
import Error from './chrome/error';
import { connect } from 'react-redux';

const App = ({ error, children }) =>
  error ?
    <Error /> :
    children;

const mapStateToProps = ({ error }) => ({ error });

export default connect(mapStateToProps)(App);
