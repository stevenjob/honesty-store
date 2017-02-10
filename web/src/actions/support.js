import { browserHistory } from 'react-router';
import { apifetch, unpackJson } from './apirequest';

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

export const performSupport = ({ message, emailAddress }) => async (dispatch, getState) => {
  dispatch(supportRequest());

  try {
    const userAgent = navigator.userAgent;

    const response = await apifetch({
      url: '/api/v1/support',
      body: {
        message,
        emailAddress,
        userAgent
      },
      token: getState().accessToken
    });

    dispatch(supportSuccess(await unpackJson(response)));
    browserHistory.push(`/help/success`);

  } catch (e) {
    dispatch(supportFailure());
    browserHistory.push(`/error`);
  }
};
