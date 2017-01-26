import { browserHistory } from 'react-router';

export const SUPPORT_REQUEST = 'SUPPORT_REQUEST';
export const SUPPORT_SUCCESS = 'SUPPORT_SUCCESS';
export const SUPPORT_FAILURE = 'SUPPORT_FAILURE';

const supportRequest = () => {
  return {
    type: SUPPORT_REQUEST,
  };
};

const supportSuccess = () => {
  return {
    type: SUPPORT_SUCCESS
  };
};

const supportFailure = () => {
  return {
    type: SUPPORT_FAILURE
  };
};

export const performSupport = ({ message }) => async (dispatch, getState) => {
  dispatch(supportRequest());
  try {
    const accessToken = getState().accessToken;
    const response = await fetch('/api/v1/support', {
      method: 'POST',
      body: JSON.stringify({ message }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer: ${accessToken}`
      }
    });
    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    dispatch(supportSuccess(json.response));
    browserHistory.push(`/help/success`);
  }
  catch (e) {
    dispatch(supportFailure());
    browserHistory.push(`/error`);
  }
};
