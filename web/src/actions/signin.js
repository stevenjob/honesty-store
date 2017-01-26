import { browserHistory } from 'react-router';

export const SIGNIN_REQUEST = 'SIGNIN_REQUEST';
export const SIGNIN_SUCCESS = 'SIGNIN_SUCCESS';
export const SIGNIN_FAILURE = 'SIGNIN_FAILURE';

const signinRequest = () => {
  return {
    type: SIGNIN_REQUEST,
  };
};

const signinSuccess = () => {
  return {
    type: SIGNIN_SUCCESS
  };
};

const signinFailure = () => {
  return {
    type: SIGNIN_FAILURE
  };
};

export const performSignin = ({ itemId, emailAddress }) => async (dispatch, getState) => {
  dispatch(signinRequest());
  try {
    const response = await fetch('/api/v1/signin', {
      method: 'POST',
      body: JSON.stringify({ emailAddress }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    dispatch(signinSuccess());
    browserHistory.push(`/signin/success`);
  }
  catch (e) {
    dispatch(signinFailure());
    if (e.message.match(/User not found/)) {
      // Register user
      browserHistory.push(`/register/${itemId}/${emailAddress}`);
    } else {
      browserHistory.push(`/error`);
    }
  }
};
