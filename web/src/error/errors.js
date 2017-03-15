// this is duplicated in typescript @ service/src/error.ts

const retrySignInText = 'Please try signing in again';

export const errorDefinitions = {
  TopupExceedsMaxBalance: {
    message: 'Topping up would exceed your maximum balance'
  },
  TooManyPurchaseItems: { message: 'You\'re purchasing too many items' },
  EmailNotFound: { message: 'Couldn\'t find your email' },
  NoCardDetailsPresent: {
    message: 'We have no card details for you',
    actionDescription: 'Please contact support',
    redirectionURL: '/help/card/no-details'
  },
  EmailTokenInvalid: { message: 'The magic link you followed has expired' },
  StoreNotFound: {
    message: 'We couldn\'t find that store code',
    actionDescription: 'Could you double check it and try again?',
    redirectionURL: '/'
  },
  LocalStorageBlocked: { message: 'We can\'t hold onto your session in private browsing' },
  NetworkError: { message: 'Sorry, we\'re having trouble connecting' },
  CardIncorrectNumber: { message: 'Incorrect card number' },
  CardInvalidNumber: { message: 'Invalid card number'},
  CardInvalidExpiryMonth: { message: 'Invalid expiry month' },
  CardInvalidExpiryYear: { message: 'Invalid expiry year' },
  CardIncorrectCVC: { message: 'Incorrect CVC' },
  CardInvalidCVC: { message: 'Invalid CVC' },
  CardExpired: {
    message: 'Card expired',
    actionDescription: 'Please contact support to add a new card',
    redirectionURL: '/help/card/expired'
  },
  CardDeclined: {
    message: 'Card declined',
    actionDescription: 'Please contact support if the problem persists'
  },
  CardError: { message: 'Hit a problem with your card details' },
  TokenError: {
    message: 'Your local session is corrupt',
    actionDescription: retrySignInText,
    redirectionURL: '/register'
  },
  AccessTokenExpired: {
    message: 'Your access has expired',
    actionDescription: retrySignInText,
    redirectionURL: '/register'
  },
  RefreshTokenExpired: {
    message: 'Your session has expired',
    actionDescription: retrySignInText,
    redirectionURL: '/register'
  },
  MagicLinkTokenExpired: {
    message: 'Your magic link token has expired',
    actionDescription: retrySignInText,
    redirectionURL: '/register'
  }
};
