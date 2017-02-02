import React from 'react';
import { Link, browserHistory } from 'react-router';
import { BRAND_LIGHT } from '../chrome/colors';

// Doing some runtime checking here as these components are so commonly used

export const Back = (props) => {
  if (props.to || props.children === 'Back') {
    throw new Error(`Don't specify to or 'Back' as children`);
  }
  return <Link className="chrome-link-back"
    style={{ color: BRAND_LIGHT }}
    onClick={browserHistory.goBack}>
    {props.children || 'Back'}
  </Link>;
};

export const NotNow = (props) => {
  if (props.to || props.children) {
    throw new Error(`Don't specify to or children`);
  }
  return <Link className="chrome-link"
    style={{ color: BRAND_LIGHT }}
    onClick={browserHistory.goBack}>
    Not Now
    </Link>;
};

export const Close = (props) => {
  if (props.children) {
    throw new Error(`Don't specify children`);
  }
  return <Link className="chrome-link"
    style={{ color: BRAND_LIGHT }}
    to={props.to}>
    Close
    </Link>;
};