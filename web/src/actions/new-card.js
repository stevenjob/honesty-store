import apifetch from './apirequest';
import history from '../history';
import { createStripeToken, paramFromCardProviderError } from './stripe-token';

export const NEWCARD_REQUEST = 'NEWCARD_REQUEST';
export const NEWCARD_SUCCESS = 'NEWCARD_SUCCESS';
export const NEWCARD_FAILURE = 'NEWCARD_FAILURE';

const newCardRequest = () => {
  return {
    type: NEWCARD_REQUEST
  };
};

const newCardSuccess = response => {
  return {
    type: NEWCARD_SUCCESS,
    response
  };
};

const newCardFailure = error => {
  if (error.fromLocalValidation) {
    // an error from createStripeToken()
    return {
      type: NEWCARD_FAILURE,
      cardError: error
    };
  }

  // error is from the backend/fetch
  return {
    type: NEWCARD_FAILURE,
    error
  };
};

export const performNewCard = ({ cardDetails }) => async (
  dispatch,
  getState
) => {
  dispatch(newCardRequest());

  try {
    const response = await apifetch(
      {
        url: '/api/v1/new-card',
        body: {
          stripeToken: await createStripeToken(cardDetails)
        },
        getToken: () => getState().accessToken,
        method: 'POST'
      },
      dispatch,
      getState
    );

    dispatch(newCardSuccess(response));
    history.push(`/balance/success`);
  } catch (e) {
    if (!e.param) {
      e.param = paramFromCardProviderError(e);
    }

    dispatch(newCardFailure(e));
  }
};
