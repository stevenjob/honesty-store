import React from 'react';
import { connect } from 'react-redux';
import { dismissError } from '../actions/dismissError';
import { errorDefinitions } from './errors';
import Alert from '../layout/alert';
import Error from '../item/error.js';
import './index.css';

const defaultSubtitle = 'Oops! Something went wrong...';
const retryTitle = 'Can you try that again, please?';
const failureTitle = "I'm sorry Dave, I'm afraid I can't do that";

const ErrorInternal = ({
  title = retryTitle,
  subtitle = defaultSubtitle,
  image = <Error />,
  dismissError,
  ...other
}) =>
  <Alert title={title}
    subtitle={subtitle}
    image={image}
    onClick={dismissError}
    className="error"
    {...other} />;

const mapStateToProps = ({ error }) => {
  if (!error) {
    return {};
  }

  const errorDef = errorDefinitions[error.code];
  if (!errorDef) {
    return {};
  }

  return {
    subtitle: errorDef.message,
    title: errorDef.retryable ? retryTitle : failureTitle
  };
};

const mapDispatchToProps = { dismissError };

export default connect(mapStateToProps, mapDispatchToProps)(ErrorInternal);
