// this is duplicated in typescript @ service/src/error.ts

const retrySignInText = 'Please try signing in again';

export const errorDefinitions = {
  TopupExceedsMaxBalance: {
    message: 'Topping up would exceed your maximum balance',
    actionDescription: ''
  },
  TooManyPurchaseItems: {
    message: 'You\'re purchasing too many items',
    actionDescription: ''
  },
  NoCardDetailsPresent: {
    message: 'We have no card details for you',
    actionDescription: 'Please get in touch with us',
    redirectionURL: '/help/card/no-details',
    dismissalText: 'Tap to get in touch'
  },
  CardError: { message: 'Something unexpected happened' },
  CardExpired: {
    message: 'Card expired',
    actionDescription: 'Please get in touch with us to add a new card',
    redirectionURL: '/help/card/expired',
    dismissalText: 'Tap to get in touch'
  },
  CardDeclined: {
    message: 'Card declined',
    actionDescription: 'Please get in touch with us if the problem persists'
  },
  StoreNotFound: {
    message: 'We couldn\'t find that store code',
    actionDescription: 'Could you double check it and try again?',
    redirectionURL: '/',
    dismissalText: 'Tap to try again'
  },
  LocalStorageBlocked: {
    message: 'We can\'t hold onto your session in private browsing',
    actionDescription: 'Please disable it and try again'
  },
  NetworkError: { message: 'Sorry, we\'re having trouble connecting' },
  MagicLinkTokenInvalid: { message: 'The magic link you followed has expired' },
  MagicLinkTokenExpired: {
    message: 'Your magic link token has expired',
    actionDescription: retrySignInText,
    redirectionURL: '/register',
    dismissalText: 'Tap to try again'
  },
  // The following error codes are handled internally and never presented to the user
  EmailNotFound: { message: 'Couldn\'t find your email' },
  RefreshTokenExpired: { message: 'Your session has expired' },
  CardIncorrectNumber: { message: 'Incorrect card number' },
  CardInvalidNumber: { message: 'Invalid card number'},
  CardInvalidExpiryMonth: { message: 'Invalid expiry month' },
  CardInvalidExpiryYear: { message: 'Invalid expiry year' },
  CardIncorrectCVC: { message: 'Incorrect CVC' },
  CardInvalidCVC: { message: 'Invalid CVC' },
};
