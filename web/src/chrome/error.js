import React from 'react';
import { connect } from 'react-redux';
import { dismissError } from '../actions/dismissError';
import { errorDefinitions } from './errors';
import Modal from './modal';
import error from '../item/error.js';
import './error.css';

const defaultSubtitle = 'Oops! Something went wrong...';
const retryTitle = 'Can you try that again, please?';
const failureTitle = "I'm sorry Dave, I'm afraid I can't do that";

const ErrorInternal = ({
  title = retryTitle,
  subtitle = defaultSubtitle,
  image = error,
  dismissError,
  ...other
}) =>
  <Modal title={title}
    subtitle={subtitle}
    image={image}
    onClick={dismissError}
    className="chrome-error"
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
