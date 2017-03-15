import React from 'react';
import { connect } from 'react-redux';
import { dismissError } from '../actions/dismissError';
import { errorDefinitions } from './errors';
import Alert from '../layout/alert';
import Error from '../item/error.js';
import './index.css';

const defaultSubtitle = 'Oops! Something went wrong...';
const retryTitle = 'Can you try that again, please?';

const ErrorInternal = ({
  title = retryTitle,
  subtitle = defaultSubtitle,
  image = <Error />,
  dismissError,
  errorCode,
  ...other
}) =>
  <Alert title={title}
    subtitle={subtitle}
    image={image}
    onClick={() => dismissError(errorCode)}
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

  const { message, actionDescription, dismissalText } = errorDef;

  return {
    subtitle: message,
    title: actionDescription != null ? actionDescription : retryTitle,
    errorCode: error.code,
    dismissalText
  };
};

const mapDispatchToProps = { dismissError };

export default connect(mapStateToProps, mapDispatchToProps)(ErrorInternal);
