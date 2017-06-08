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

type Validator = (key: string, value: any) => void;

type ObjectValidator<Type> = { [Key in keyof Type]: Validator };

export const createAssertValidObject = <Type>(validator: ObjectValidator<Type>) =>
  (object: Type) => {
    for (const key of <(keyof Type)[]>Object.keys(object)) {
      const value = object[key];
      const keyValidator = validator[key];
      if (keyValidator == null) {
        throw new Error(`Invalid ${key} ${value}`);
      }
      validator[key](key, value);
    }
  };

export const assertNever = (value: never): never => {
  throw new Error(`Invalid value ${value}`);
};
