// this is duplicated in typescript @ service/src/error.ts

export const errorDefinitions = {
  TopupExceedsMaxBalance: { message: 'Topping up would exceed your maximum balance' },
  TooManyPurchaseItems: { message: 'You\'re purchasing too many items' },
  EmailNotFound: { message: 'Couldn\'t find your email' },
  NoCardDetailsPresent: { message: 'We have no card details for you' },
  EmailTokenInvalid: { message: 'The magic link you followed has expired' },
  StoreNotFound: { message: 'We couldn\'t find that store code', },
  LocalStorageBlocked: { message: 'We can\'t hold onto your session in private browsing' },
  NetworkError: { message: 'Sorry, we\'re having trouble connecting' },
  CardIncorrectNumber: { message: 'Incorrect card number' },
  CardInvalidNumber: { message: 'Invalid card number'},
  CardInvalidExpiryMonth: { message: 'Invalid expiry month' },
  CardInvalidExpiryYear: { message: 'Invalid expiry year' },
  CardIncorrectCVC: { message: 'Incorrect CVC' },
  CardInvalidCVC: { message: 'Invalid CVC' },
  CardExpired: { message: 'Card expired' },
  CardDeclined: { message: 'Card declined' },
  CardError: { message: 'Hit a problem with your card details' },
  TokenError: { message: 'Your local session is corrupt - please sign in' },
  AccessTokenExpired: { message: 'Your access has expired - please sign in' },
  RefreshTokenExpired: { message: 'Your session has expired - please sign in' },
  MagicLinkTokenExpired: { message: 'Your magic link token has expired, please try again' }
};
