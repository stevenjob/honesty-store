import React from 'react';
import Page from './page';
import { MUTED_TEXT } from './colors';
import sucess from './assets/success.svg';
import './modal.css';

const Modal = ({
  title,
  subtitle,
  image,
  onClick,
  className
}) =>
  <Page invert={true}
    nav={false}
    fullscreen={true}
    >
    <div onClick={onClick} className={`chrome-modal ${className}`}>
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

export const Success = ({
  title = '',
  subtitle = '',
  image = sucess,
  ...other
}) =>
  <Modal title={title}
    subtitle={subtitle}
    image={image}
    className="chrome-modal-success"
    {...other} />;

export default Modal;
