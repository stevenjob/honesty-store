import apifetch from './apirequest';
import history from '../history';

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

const supportFailure = (error) => {
  return {
    type: SUPPORT_FAILURE,
    error
  };
};

export const performSupport = ({ message, emailAddress }, successUrl = `/help/success`) => async (dispatch, getState) => {
  dispatch(supportRequest());

  try {
    const userAgent = navigator.userAgent;

    await apifetch({
      url: '/_api/v1/support',
      body: {
        message,
        emailAddress,
        userAgent
      },
      getToken: () => getState().accessToken
    }, dispatch, getState);

    history.push(successUrl);
    dispatch(supportSuccess());

  } catch (e) {
    dispatch(supportFailure(e));
  }
};
