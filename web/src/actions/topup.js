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
  if (error.fromLocalValidation) {
    // an error from createStripeToken()
    return {
      type: TOPUP_FAILURE,
      cardError: error
    };
  }

  // error is from the backend/fetch
  return {
    type: TOPUP_FAILURE,
    error
  };
};

export const performTopup = ({ amount, cardDetails }) => async (dispatch, getState) => {
  dispatch(topupRequest());

  try {
    const response = await apifetch({
      url: '/api/v1/topup',
      body: {
        stripeToken: cardDetails ? await createStripeToken(cardDetails) : undefined,
        amount
      },
      getToken: () => getState().accessToken
    }, dispatch, getState);

    dispatch(topupSuccess(response));
    history.push(`/topup/success`);

  } catch (e) {
    if (!e.param) {
      e.param = paramFromCardProviderError(e);
    }

    dispatch(topupFailure(e));
  }
};
