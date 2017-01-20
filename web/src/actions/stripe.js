import { hashHistory } from 'react-router';

const Stripe = window.Stripe;

export const createToken = (data) =>
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
        Stripe.setPublishableKey(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
        Stripe.card.createToken(data, stripeResponseHandler);
    });

export const STRIPE_REQUEST = 'STRIPE_REQUEST';
export const STRIPE_SUCCESS = 'STRIPE_SUCCESS';
export const STRIPE_FAILURE = 'STRIPE_FAILURE';

const stripeRequest = () => ({
    type: STRIPE_REQUEST
});

const stripeSuccess = (token) => ({
  type: STRIPE_SUCCESS,
  token
});

const stripeFailure = (error) => ({
  type: STRIPE_FAILURE,
  error
});

export const createCardToken = ({ storeId, name, number, cvc, exp_month, exp_year, address_zip }) => async (dispatch, getState) => {
  dispatch(stripeRequest());
  try {
    if (name == null || name.length === 0) {
      throw Object.assign(new Error('Missing name'), { param: 'name' });
    }
    if (!Stripe.card.validateCardNumber(number)) {
      throw Object.assign(new Error('Invalid card number'), { param: 'number' });
    }
    if (!Stripe.card.validateExpiry(exp_month, exp_year)) {
      throw Object.assign(new Error('Invalid expiry'), { param: 'exp' });
    }
    if (!Stripe.card.validateCVC(cvc)) {
      throw Object.assign(new Error('Invalid CVC'), { param: 'cvc' });
    }
    if (address_zip == null || address_zip.length === 0) {
      throw Object.assign(new Error('Missing postcode'), { param: 'address_zip' });
    }
    const token = await createToken({ name, number, cvc, exp: `${exp_month}/${exp_year}`, address_zip });
    dispatch(stripeSuccess(token));
    hashHistory.push(`/${storeId}/register/success`);
  }
  catch (e) {
    dispatch(stripeFailure(e));
  }
};
