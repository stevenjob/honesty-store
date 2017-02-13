import { browserHistory } from 'react-router';
import apifetch from './apirequest';

export const TOPUP_REQUEST = 'TOPUP_REQUEST';
export const TOPUP_SUCCESS = 'TOPUP_SUCCESS';
export const TOPUP_FAILURE = 'TOPUP_FAILURE';

const topupRequest = () => {
  return {
    type: TOPUP_REQUEST,
  };
};

const topupSuccess = (response) => {
  return {
    type: TOPUP_SUCCESS,
    response
  };
};

const topupFailure = () => {
  return {
    type: TOPUP_FAILURE
  };
};

export const performTopup = ({ amount }) => async (dispatch, getState) => {
  dispatch(topupRequest());

  try {
    const response = await apifetch({
      url: '/api/v1/topup',
      body: {
        amount
      },
      token: getState().accessToken
    });

    dispatch(topupSuccess(response));
    browserHistory.push(`/topup/success`);

  } catch (e) {
    dispatch(topupFailure());
    browserHistory.push(`/error`);
  }
};
