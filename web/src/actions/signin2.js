import { browserHistory } from 'react-router';
import apifetch from './apirequest';

export const SIGNIN2_REQUEST = 'SIGNIN2_REQUEST';
export const SIGNIN2_SUCCESS = 'SIGNIN2_SUCCESS';
export const SIGNIN2_FAILURE = 'SIGNIN2_FAILURE';

const signin2Request = () => {
  return {
    type: SIGNIN2_REQUEST,
  };
};

const signin2Success = (response) => {
  return {
    type: SIGNIN2_SUCCESS,
    response
  };
};

const signin2Failure = (error) => {
  return {
    type: SIGNIN2_FAILURE,
    error
  };
};

export const performSignin2 = ({ emailToken }) => async (dispatch, getState) => {
  dispatch(signin2Request());

  try {
    const response = await apifetch({
      url: '/api/v1/signin2',
      token: emailToken,
      body: {}
    });

    dispatch(signin2Success(response));
    browserHistory.push(`/store`);

  } catch (e) {
    if (e.code === 'NetworkError' && e.status === 401) {
      const timeoutError = new Error('Not Authorised');

      timeoutError.code = 'EmailTokenInvalid';

      dispatch(signin2Failure(timeoutError));
    } else {
      dispatch(signin2Failure(e));
    }

    browserHistory.push(`/error`);
  }
};
