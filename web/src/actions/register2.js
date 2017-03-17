import apifetch from './apirequest';
import history from '../history';

import { createStripeToken, paramFromCardProviderError } from './stripe-token';

export const REGISTER2_REQUEST = 'REGISTER2_REQUEST';
export const REGISTER2_SUCESSS = 'REGISTER2_SUCESSS';
export const REGISTER2_FAILURE = 'REGISTER2_FAILURE';

const register2Request = () => {
  return {
    type: REGISTER2_REQUEST
  };
};

const register2Success = ({ user, store }) => {
  return {
    type: REGISTER2_SUCESSS,
    response: {
      user,
      store
    }
  };
};

const register2Failure = (error) => {
  if (error.fromLocalValidation) {
    // an error from createStripeToken()
    return {
      type: REGISTER2_FAILURE,
      cardError: error
    };
  }

  // error is from the backend/fetch
  return {
    type: REGISTER2_FAILURE,
    error
  };
};

export const performRegister2 = ({ itemID, topUpAmount, emailAddress, cardDetails }) => async (dispatch, getState) => {
  dispatch(register2Request());

  try {
    const response = await apifetch({
      url: '/api/v1/register2',
      body: {
        stripeToken: await createStripeToken(cardDetails),
        itemID,
        topUpAmount,
        emailAddress
      },
      getToken: () => getState().accessToken,
    }, dispatch, getState);

    dispatch(register2Success(response));

    // ensure both the topup and purchase transactions were recorded
    const { user } = response;

    let path;
    if (itemID == null) {
      path = `/register//success`;
    }
    else {
      path = user.transactions.length === 2
        ? `/register/${itemID}/success`
        : `/register/${itemID}/partial`;
    }

    history.push(path);
  } catch (e) {
    if (!e.param) {
      e.param = paramFromCardProviderError(e);
    }

    dispatch(register2Failure(e));
  }
};
