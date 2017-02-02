import React from 'react';
import { browserHistory } from 'react-router';
import Page from './page';
import { MUTED_TEXT } from './colors';
import sucess from './assets/success.svg';
import error from './assets/error.svg';
import './modal.css';

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

export const Error = ({
  title = 'Can you try that again, please?',
  subtitle = 'Oops! Something went wrong...',
  image = error,
  onClick = () => browserHistory.goBack(),
  ...other
}) =>
  <Modal title={title}
    subtitle={subtitle}
    image={image}
    onClick={onClick}
    {...other} />;

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