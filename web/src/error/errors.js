// this is duplicated in typescript @ service/src/error.ts

const dismissalText = {
  GET_IN_TOUCH: `Tap to get in touch`,
  DISMISS: `Tap to dismiss`
};

const errorDefinitions = {
  MaxBalanceExceeded: {
    message: `Your balance can't exceed £10`,
    redirectionPath: '/profile/history',
    dismissalText: dismissalText.DISMISS
  },
  TooManyPurchaseItems: {
    message: `You're purchasing too many items`,
    dismissalText: dismissalText.DISMISS
  },
  NoCardDetailsPresent: {
    message: `We have no card details for you`,
    actionDescription: `Please get in touch with us to add a card`,
    redirectionPath: `/help/card/no-details`,
    dismissalText: dismissalText.GET_IN_TOUCH
  },
  CardError: {
    message: `Something unexpected happened when trying to charge your card`,
    actionDescription: `Your card has not been charged. Please try again and get in touch with us if the problem persists`,
    dismissalText: dismissalText.DISMISS
  },
  CardExpired: {
    message: `Card expired`,
    actionDescription: `Please get in touch with us to add a new card`,
    redirectionPath: `/help/card/expired`,
    dismissalText: dismissalText.GET_IN_TOUCH
  },
  CardDeclined: {
    message: `Card declined`,
    actionDescription: `Please get in touch with us if the problem persists`,
    dismissalText: dismissalText.DISMISS
  },
  StoreNotFound: {
    message: `We couldn't find that store code`,
    actionDescription: `Could you double check it and try again?`,
    redirectionPath: `/`,
    dismissalText: dismissalText.DISMISS
  },
  LocalStorageBlocked: {
    message: `We can't hold onto your session in private browsing`,
    actionDescription: `Could you please disable it and try again?`,
    dismissalText: dismissalText.DISMISS
  },
  NetworkError: {
    message: `Sorry, we're having trouble connecting`,
    actionDescription: `Could you double check you're online and try again?`,
    dismissalText: dismissalText.DISMISS
  },
  MagicLinkTokenInvalid: {
    message: `The magic link you followed has expired`,
    actionDescription: `Could you please try signing in again?`,
    redirectionPath: `/register`,
    dismissalText: dismissalText.DISMISS
  },
  MagicLinkTokenExpired: {
    message: `Your magic link token has expired`,
    actionDescription: `Could you please try signing in again?`,
    redirectionPath: `/register`,
    dismissalText: dismissalText.DISMISS
  },
  TokenError: {
    message: `Your local session is corrupt`,
    actionDescription: `We've reset your session`,
    redirectionPath: '/',
    dismissalText: dismissalText.DISMISS
  },
  BoxAlreadyMarkedAsReceived: {
    message: `You've already marked this box as received`,
    actionDescription: `Please get in touch with us if the items are not available`,
    redirectionPath: '/store',
    dismissalText: dismissalText.DISMISS
  },
  FullRegistrationRequired: {
    message: `You need to be fully registered to do that`,
    actionDescription: `Please sign up for an account and then try again`,
    redirectionPath: '/register',
    dismissalText: dismissalText.DISMISS
  },
  AutoRefundPeriodExpired: {
    message: `You can no longer request a refund of this item`,
    actionDescription: `Please get in touch with us if you have any questions`,
    redirectionPath: '/profile/history',
    dismissalText: dismissalText.DISMISS
  },
  RefundAlreadyIssued: {
    message: `A refund has already been issued for this purchase`,
    actionDescription: `Please get in touch with us if you have any questions`,
    redirectionPath: '/profile/history',
    dismissalText: dismissalText.DISMISS
  },
  NonRefundableTransactionType: {
    message: `Only item purchases can be refunded at the moment`,
    actionDescription: `Please get in touch with us if you have any questions`,
    dismissalText: dismissalText.DISMISS
  },
  UserLoggedOut: {
    message: `Looks like you've signed out`,
    actionDescription: `Could you please select a store and try signing in again?`,
    redirectionPath: `/`,
    dismissalText: dismissalText.DISMISS
  },
  UnknownError: {
    message: `Oops! Something went wrong...`,
    actionDescription: `Can you try that again, please?`,
    dismissalText: dismissalText.DISMISS
  },
  AccessDenied: {
    message: `You don't have permission to access this page`,
    dismissalText: dismissalText.DISMISS,
    redirectionPath: `/store`
  },
  // The following error codes are handled internally and never presented to the user
  EmailNotFound: { message: `Couldn't find your email` },
  RefreshTokenExpired: {
    message: `Your session has expired`,
    redirectionPath: '/',
    dismissalText: dismissalText.DISMISS
  },
  CardIncorrectNumber: { message: `Incorrect card number` },
  CardInvalidNumber: { message: `Invalid card number` },
  CardInvalidExpiryMonth: { message: `Invalid expiry month` },
  CardInvalidExpiryYear: { message: `Invalid expiry year` },
  CardIncorrectCVC: { message: `Incorrect CVC` },
  CardInvalidCVC: { message: `Invalid CVC` }
};

export default code => {
  return errorDefinitions[code] || errorDefinitions['UnknownError'];
};
