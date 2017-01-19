import { hashHistory } from 'react-router';

export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCESSS = 'REGISTER_SUCESSS';
export const REGISTER_FAILURE = 'REGISTER_FAILURE';

const registerRequest = () => ({
  type: REGISTER_REQUEST
});

const registerSuccess = ({ user, store, accessToken, refreshToken }) => ({
  type: REGISTER_SUCESSS,
  response: {
    user,
    store,
    accessToken,
    refreshToken
  }
});

const registerFailure = () => ({
  type: REGISTER_FAILURE
});

export const performRegister = ({ storeId }) => async (dispatch, getState) => {
  dispatch(registerRequest());
  try {
    const response = await fetch('/api/v1/register', {
      method: 'POST',
      body: JSON.stringify({ storeCode: storeId }),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    dispatch(registerSuccess(json.response));
    hashHistory.push(`/${storeId}`);
  }
  catch (e) {
    dispatch(registerFailure());
    hashHistory.push(`/error`);
  }
};