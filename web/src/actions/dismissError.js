import getErrorDefinition from '../error/errors';
import history from '../history';
import { performSession, sessionReset } from './session';

export const DISMISS_ERROR = 'DISMISS_ERROR';

const dismiss = () => {
  return {
    type: DISMISS_ERROR
  };
};

export const dismissError = code => async (dispatch, getState) => {
  switch (code) {
    case 'NetworkError':
      const pathname = window.location.pathname;
      if (pathname === 'store') {
        performSession()(dispatch, getState);
      }
      break;
    case 'TokenError':
    case 'RefreshTokenExpired':
      history.push('/');
      dispatch(sessionReset());
      break;
    default:
      const { redirectionURL } = getErrorDefinition(code);
      if (redirectionURL != null) {
        history.push(redirectionURL);
      }
  }

  dispatch(dismiss());
};
