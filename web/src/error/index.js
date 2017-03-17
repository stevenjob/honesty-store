import React from 'react';
import { connect } from 'react-redux';
import { dismissError } from '../actions/dismissError';
import { errorDefinitions } from './errors';
import Alert from '../layout/alert';
import Error from '../item/error.js';
import './index.css';

const ErrorInternal = ({
  title,
  subtitle,
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

const mapStateToProps = ({ error: { fullPage: error } }) => {
  if (!error) {
    return {};
  }

  let errorDef = errorDefinitions[error.code];
  if (!errorDef) {
    errorDef = errorDefinitions['Undefined'];
  }

  const { message, actionDescription, dismissalText } = errorDef;

  return {
    subtitle: message,
    title: actionDescription || '',
    errorCode: error.code,
    dismissalText
  };
};

const mapDispatchToProps = { dismissError };

export default connect(mapStateToProps, mapDispatchToProps)(ErrorInternal);
