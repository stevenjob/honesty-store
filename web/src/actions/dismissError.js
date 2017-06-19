import getErrorDefinition from '../error/errors';
import history from '../history';
import { performSession } from './session';

export const DISMISS_ERROR = 'DISMISS_ERROR';

const dismiss = () => {
  return {
    type: DISMISS_ERROR
  };
};

export const dismissError = code => async (dispatch, getState) => {
  if (code === 'NetworkError') {
    const pathname = window.location.pathname;
    if (pathname === '/store') {
      performSession()(dispatch, getState);
    }
  } else {
    const { redirectionPath } = getErrorDefinition(code);
    if (redirectionPath != null) {
      history.push(redirectionPath);
    }
  }
  dispatch(dismiss());
};
