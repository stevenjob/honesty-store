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
  const pathname = window.location.pathname;
  if (code === 'NetworkError' && pathname === '/store') {
    // try and re-fetch the session data, otherwise we'll show the user an empty store
    performSession()(dispatch, getState);
  } else if (code != null) {
    const { redirectionURL } = getErrorDefinition(code);
    if (redirectionURL != null) {
      history.push(redirectionURL);
    }
  }

  dispatch(dismiss());
};
