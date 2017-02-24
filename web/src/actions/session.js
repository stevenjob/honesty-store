import apifetch from './apirequest';
import history from '../history';

export const SESSION_REQUEST = 'SESSION_REQUEST';
export const SESSION_SUCCESS = 'SESSION_SUCCESS';
export const SESSION_RESET = 'SESSION_RESET';
export const SESSION_FAILURE = 'SESSION_FAILURE';

const sessionRequest = () => {
  return {
    type: SESSION_REQUEST,
  };
};

const sessionSuccess = (response) => {
  return {
    type: SESSION_SUCCESS,
    response
  };
};

const sessionFailure = (error) => {
  return {
    type: SESSION_FAILURE,
    error
  };
};

const sessionReset = (error) => {
  return {
    type: SESSION_RESET,
    error
  };
};

export const performSession = () => async (dispatch, getState) => {
  dispatch(sessionRequest());

  try {
    const response = await apifetch({
      url: '/api/v1/session',
      getToken: () => getState().refreshToken
    }, dispatch, getState);

    dispatch(sessionSuccess(response));

  } catch (e) {
    if (e.code === 'TokenError') {
      // Our refresh token hasn't expired (that's RefreshTokenExpired),
      // it's just totally mangled (for example, a non-live token used on live).

      dispatch(sessionReset(e));
      history.push(`/`);
      return;
    }

    dispatch(sessionFailure(e));
  }
};
