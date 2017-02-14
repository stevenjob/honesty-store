// this is duplicated in typescript @ service/src/error.ts

export const errorDefinitions = {
  TopupExceedsMaxBalance: { message: 'Topping up would exceed your maximum balance', retryable: false },
  TooManyPurchaseItems: { message: "You're purchasing too many items", retryable: false },
  EmailNotFound: { message: "Couldn't find your email", retryable: true },
  NoCardDetailsPresent: { message: 'We have no card details for you', retryable: true },
  EmailTokenInvalid: { message: 'The magic link you followed has expired', retryable: false },
  StoreNotFound: { message: "We couldn't find that store code", retryable: true },
  LocalStorageBlocked: { message: "We can't hold onto your session in private browsing", retryable: false },
};
