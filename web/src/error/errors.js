// this is duplicated in typescript @ service/src/error.ts

const dismissalText = {
  GET_IN_TOUCH: `Tap to get in touch`,
  DISMISS: `Tap to dismiss`
};

const errorDefinitions = {
  TopupExceedsMaxBalance: {
    message: `Topping up would exceed your maximum balance`,
    dismissalText: dismissalText.DISMISS
  },
  TooManyPurchaseItems: {
    message: `You're purchasing too many items`,
    dismissalText: dismissalText.DISMISS
  },
  NoCardDetailsPresent: {
    message: `We have no card details for you`,
    actionDescription: `Please get in touch with us to add a card`,
    redirectionURL: `/help/card/no-details`,
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
    redirectionURL: `/help/card/expired`,
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
    redirectionURL: `/`,
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
    redirectionURL: `/register`,
    dismissalText: dismissalText.DISMISS
  },
  MagicLinkTokenExpired: {
    message: `Your magic link token has expired`,
    actionDescription: `Could you please try signing in again?`,
    redirectionURL: `/register`,
    dismissalText: dismissalText.DISMISS
  },
  TokenError: {
    message: `Your local session is corrupt`,
    actionDescription: `We've reset your session`,
    dismissalText: dismissalText.DISMISS
  },
  BoxAlreadyMarkedAsReceived: {
    message: `You've already marked this box as received`,
    actionDescription: `Please get in touch with us if the items are not available`,
    redirectionURL: '/store',
    dismissalText: dismissalText.DISMISS
  },
  FullRegistrationRequired: {
    message: `You need to be fully registered to do that`,
    actionDescription: `Please sign up for an account and then try again`,
    redirectionURL: '/register',
    dismissalText: dismissalText.DISMISS
  },
  UnknownError: {
    message: `Oops! Something went wrong...`,
    actionDescription: `Can you try that again, please?`,
    dismissalText: dismissalText.DISMISS
  },
  // The following error codes are handled internally and never presented to the user
  EmailNotFound: { message: `Couldn't find your email` },
  RefreshTokenExpired: { message: `Your session has expired` },
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
