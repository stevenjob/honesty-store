import React from 'react';
import { Link } from 'react-router';
import history from '../history';

// Doing some runtime checking here as these components are so commonly used

export const BackToPage = ({ title, path }) => {
  return (
    <Link className={`btn aqua`} onClick={() => history.replace(path)}>
      <span className="h2">&lt;&nbsp;</span>
      {title}
    </Link>
  );
};

export const NotNow = props => {
  if (props.to || props.children) {
    throw new Error(`Don't specify to or children`);
  }
  return (
    <Link className={`btn aqua ${props.className}`} onClick={history.goBack}>
      Not Now
    </Link>
  );
};

export const Close = props => {
  if (props.children) {
    throw new Error(`Don't specify children`);
  }
  return (
    <Link className={`btn aqua ${props.className}`} to={props.to}>
      Close
    </Link>
  );
};
