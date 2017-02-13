import apifetch from './apirequest';
import history from '../history';

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

const topupFailure = (error) => {
  return {
    type: TOPUP_FAILURE,
    error
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
    history.push(`/topup/success`);

  } catch (e) {
    dispatch(topupFailure(e));
    history.push(`/error`);
  }
};
