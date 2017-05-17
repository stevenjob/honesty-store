const createToken = data =>
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

export const createStripeToken = ({ number, cvc, exp }) => {
  const Stripe = window.Stripe;
  if (!Stripe.card.validateCardNumber(number)) {
    throw Object.assign(new Error('Invalid card number'), {
      param: 'number',
      fromLocalValidation: true
    });
  }
  if (!Stripe.card.validateExpiry(exp)) {
    throw Object.assign(new Error('Invalid expiry'), {
      param: 'exp',
      fromLocalValidation: true
    });
  }
  if (!Stripe.card.validateCVC(cvc)) {
    throw Object.assign(new Error('Invalid CVC'), {
      param: 'cvc',
      fromLocalValidation: true
    });
  }
  return createToken({ number, cvc, exp });
};

export const paramFromCardProviderError = ({ code }) => {
  switch (code) {
    case 'CardIncorrectNumber':
    case 'CardInvalidNumber':
      return 'number';

    case 'CardInvalidExpiryMonth':
    case 'CardInvalidExpiryYear':
    case 'CardExpired':
      return 'exp';

    case 'CardIncorrectCVC':
    case 'CardInvalidCVC':
      return 'cvc';

    case 'CardDeclined':
    case 'CardError':
    default:
      return '';
  }
};
