import { browserHistory } from 'react-router';

const createToken = (data) =>
    new Promise((resolve, reject) => {
        const stripeResponseHandler = (status, response) => {
            if (response.error != null) {
                const error = Object.assign(new Error(), response.error);
                return reject(error);
            }
            if (status !== 200) {
                return reject(new Error(`Non-200 response ${status} from Stripe`));
            }
            resolve(response.id);
        };
        const Stripe = window.Stripe;
        Stripe.setPublishableKey(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
        Stripe.card.createToken(data, stripeResponseHandler);
    });

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
  return {
    type: REGISTER2_FAILURE,
    error
  };
};

const createStripeToken = ({ number, cvc, exp }) => {
  const Stripe = window.Stripe;
  if (!Stripe.card.validateCardNumber(number)) {
    throw Object.assign(new Error('Invalid card number'), { param: 'number' });
  }
  if (!Stripe.card.validateExpiry(exp)) {
    throw Object.assign(new Error('Invalid expiry'), { param: 'exp' });
  }
  if (!Stripe.card.validateCVC(cvc)) {
    throw Object.assign(new Error('Invalid CVC'), { param: 'cvc' });
  }
  return createToken({ number, cvc, exp });
};

export const performRegister2 = ({ storeId, itemID, topUpAmount, emailAddress, cardDetails }) => async (dispatch, getState) => {
  dispatch(register2Request());
  try {
    const stripeToken = await createStripeToken(cardDetails);
    const accessToken = getState().accessToken;
    const response = await fetch('/api/v1/register2', {
      method: 'POST',
      body: JSON.stringify({ itemID, topUpAmount, stripeToken, emailAddress }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer: ${accessToken}`
      }
    });
    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    const { user, store } = json.response;
    dispatch(register2Success({ user, store }));
    // ensure both the topup and purchase transactions were recorded
    const path = user.transactions.length === 2 ? `/${storeId}/register/success` : `/${storeId}/register/${itemID}/success`;
    browserHistory.push(path);
  }
  catch (e) {
    dispatch(register2Failure(e));
  }
};
