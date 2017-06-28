import isUUID = require('validator/lib/isUUID');

export const createAssertValidUuid = (name) =>
  (uuid) => {
    if (uuid == null || !isUUID(uuid, 4)) {
      throw new Error(`Invalid ${name} ${uuid}`);
    }
  };

export const assertValidUuid = (key: string, value: any) => {
  if (value == null || !isUUID(value, 4)) {
    throw new Error(`Invalid ${key} ${value}`);
  }
};

export const assertValidString = (key: string, value: any) => {
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${key} ${value}`);
  }
};

export const assertPositiveInteger = (key: string, value: any) => {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid ${key} ${value}`);
  }
};

export const assertNonZeroPositiveInteger = (key: string, value: any) => {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${key} ${value}`);
  }
};

export const assertOptional = (validator: Validator) => {
  return (key: string, value: any) => {
    if (value != null) {
      validator(key, value);
    }
  };
};

export type Validator = (key: string, value: any) => void;

export type ObjectValidator<Type> = { [Key in keyof Type]: Validator };

export const createAssertValidObject = <Type>(validator: ObjectValidator<Type>) =>
  (object: Type) => {
    for (const key of <(keyof Type)[]>Object.keys(validator)) {
      const value = object[key];
      validator[key](key, value);
    }
    const unexpectedKeys = Object.keys(object).filter((key) => !(key in validator));
    if (unexpectedKeys.length !== 0) {
      throw new Error(`Unexpected key(s) found on object: ${unexpectedKeys}`);
    }
  };

export const assertNever = (value: never): never => {
  throw new Error(`Invalid value ${value}`);
};
