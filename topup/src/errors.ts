import { CodedError } from '@honesty-store/service/lib/error';

const stripeCodeToErrorCode = (stripeCode) => {
  switch (stripeCode) {
    case 'incorrect_number':      return 'CardIncorrectNumber';
    case 'invalid_number':        return 'CardInvalidNumber';
    case 'invalid_expiry_month':  return 'CardInvalidExpiryMonth';
    case 'invalid_expiry_year':   return 'CardInvalidExpiryYear';
    case 'incorrect_cvc':         return 'CardIncorrectCVC';
    case 'invalid_cvc':           return 'CardInvalidCVC';
    case 'expired_card':          return 'CardExpired';
    case 'card_declined':         return 'CardDeclined';

    case 'incorrect_zip':
    case 'missing':
    case 'processing_error':
      // fall through
    default:
      return 'CardError';
  }
};

export const userErrorFromStripeError = (stripeError) => {
  if (stripeError.type !== 'StripeCardError') {
    return stripeError;
  }

  const errorCode = stripeCodeToErrorCode(stripeError.code);
  return new CodedError(errorCode, stripeError.message);
};
