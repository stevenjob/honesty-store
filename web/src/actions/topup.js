import apifetch from './apirequest';
import history from '../history';
import { createStripeToken, paramFromCardProviderError } from './stripe-token';

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

export const performTopupWithNewCard = ({ amount, cardDetails }) => async (dispatch, getState) => {
  // Generate stripe token
  const stripeToken = await createStripeToken(cardDetails);

  // TODO: figure out how to handle card details validation - similar to register2
  performTopup({ amount, stripeToken })(dispatch, getState);
};

export const performTopup = ({ amount, stripeToken }) => async (dispatch, getState) => {
  dispatch(topupRequest());

  try {
    const response = await apifetch({
      url: '/api/v1/topup',
      body: {
        amount
      },
      getToken: () => getState().accessToken
    }, dispatch, getState);

    dispatch(topupSuccess(response));
    history.push(`/topup/success`);

  } catch (e) {
    dispatch(topupFailure(e));
  }
};
