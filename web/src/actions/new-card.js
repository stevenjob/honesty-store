import apifetch from './apirequest';
import history from '../history';
import { createStripeToken, paramFromCardProviderError } from './stripe-token';

export const NEW_CARD_REQUEST = 'NEW_CARD_REQUEST';
export const NEW_CARD_SUCCESS = 'NEW_CARD_SUCCESS';
export const NEW_CARD_FAILURE = 'NEW_CARD_FAILURE';

const newCardRequest = () => {
  return {
    type: NEW_CARD_REQUEST
  };
};

const newCardSuccess = response => {
  return {
    type: NEW_CARD_SUCCESS,
    response
  };
};

const newCardFailure = error => {
  if (error.fromLocalValidation) {
    // an error from createStripeToken()
    return {
      type: NEW_CARD_FAILURE,
      cardError: error
    };
  }

  // error is from the backend/fetch
  return {
    type: NEW_CARD_FAILURE,
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
