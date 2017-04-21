// this is duplicated in javascript @ web/src/chrome/errors.js

export type ErrorCode =
  'TopupExceedsMaxBalance' |
  'TooManyPurchaseItems' |
  'EmailNotFound' |
  'NoCardDetailsPresent' |
  'StoreNotFound' |
  'CardIncorrectNumber' |
  'CardInvalidNumber' |
  'CardInvalidExpiryMonth' |
  'CardInvalidExpiryYear' |
  'CardIncorrectCVC' |
  'CardInvalidCVC' |
  'CardExpired' |
  'CardDeclined' |
  'CardError' |
  'TokenExpired' |
  'AccessTokenExpired' |
  'RefreshTokenExpired' |
  'MagicLinkTokenExpired' |
  'TokenError' |
  'ItemNotInBox' |
  'BoxAlreadyMarkedAsReceived' |
  'UnknownError';

export class CodedError extends Error {
  public code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
