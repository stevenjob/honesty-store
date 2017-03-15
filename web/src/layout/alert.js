import React from 'react';
import sucess from '../chrome/assets/success.svg';
import './alert.css';

const Alert = ({
  title,
  subtitle,
  image,
  onClick,
  className,
  dismissalText = 'Tap to dismiss'
}) =>
  <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center" onClick={onClick}>
    <div className="px2 center navy sm-col-10 md-col-8 lg-col-6 mx-auto">
      <h3>{subtitle}</h3>
      <div className={`col-6 mx-auto ${className}`}>
        {
          typeof(image) === 'string'
            ? <img src={image} alt="" />
            : image
        }
      </div>
      <h2>{title}</h2>
      {
        onClick &&
        <p className="gray">{dismissalText}</p>
      }
    </div>
  </div>;

export const Success = ({
  title = '',
  subtitle = '',
  image = sucess,
  ...other
}) =>
  <Alert title={title}
    subtitle={subtitle}
    image={image}
    className="layout-alert-success"
    {...other} />;

export default Alert;
