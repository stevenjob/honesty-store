import { browserHistory } from 'react-router';

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

const logoutRequest = () => {
  return {
    type: LOGOUT_REQUEST
  };
};

const logoutSuccess = (response) => {
  return {
    type: LOGOUT_SUCCESS,
    response
  };
};

const logoutFailure = () => {
  return {
    type: LOGOUT_FAILURE
  };
};

export const performLogout = () => async (dispatch, getState) => {
  dispatch(logoutRequest());
  try {
    const { accessToken } = getState();
    const response = await fetch('/api/v1/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer: ${accessToken}`
      }
    });
    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    dispatch(logoutSuccess(json.response));
    browserHistory.push(`/`);
  }
  catch (e) {
    dispatch(logoutFailure());
  }
};
