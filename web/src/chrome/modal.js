import React from 'react';
import { browserHistory } from 'react-router';
import { connect } from 'react-redux';
import Page from './page';
import { MUTED_TEXT } from './colors';
import sucess from './assets/success.svg';
import error from './assets/error.svg';
import './modal.css';
import { errorDefinitions } from './errors';

const Modal = ({
  title,
  subtitle,
  image,
  onClick
}) =>
  <Page invert={true}
    nav={false}
    fullscreen={true}
    >
    <div onClick={onClick} className="chrome-modal">
      <div>
        <h3>{subtitle}</h3>
        <img src={image} alt="" />
        <h2>{title}</h2>
        {
          onClick &&
          <p style={{ color: MUTED_TEXT }}>Tap to dismiss</p>
        }
      </div>
    </div>
  </Page>;

const defaultSubtitle = 'Oops! Something went wrong...';
const retryTitle = 'Can you try that again, please?';
const failureTitle = "I'm afraid I can't let you do that, Dave";

const ErrorInternal = ({
  title = retryTitle,
  subtitle = defaultSubtitle,
  image = error,
  onClick = () => browserHistory.goBack(),
  ...other
}) =>
  <Modal title={title}
    subtitle={subtitle}
    image={image}
    onClick={onClick}
    {...other} />;

const mapErrorStateToProps = ({ error }) => {
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

export const Error = connect(mapErrorStateToProps)(ErrorInternal);

export const Success = ({
  title = '',
  subtitle = '',
  image = sucess,
  ...other
}) =>
  <Modal title={title}
    subtitle={subtitle}
    image={image}
    {...other} />;

export default Modal;
