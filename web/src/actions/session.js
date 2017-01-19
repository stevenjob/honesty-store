import { hashHistory } from 'react-router';

export const SESSION_REQUEST = 'SESSION_REQUEST';
export const SESSION_SUCCESS = 'SESSION_SUCCESS';
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

const sessionFailure = () => {
  return {
    type: SESSION_FAILURE
  };
};

export const performSession = ({ storeId }) => async (dispatch, getState) => {
  dispatch(sessionRequest());
  try {
    const refreshToken = getState().refreshToken;
    const response = await fetch('/api/v1/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer: ${refreshToken}`
      }
    });
    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    const session = json.response;
    if (storeId != null && session.store.code !== storeId) {
        throw new Error(`Attempt to load non-default store ${storeId} ${session.store.code}`);
    }
    dispatch(sessionSuccess(session));
    hashHistory.push(`/${session.store.code}`);
  }
  catch (e) {
    dispatch(sessionFailure());
    hashHistory.push(`/error`);
  }
};
