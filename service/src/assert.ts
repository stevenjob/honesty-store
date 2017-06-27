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

export const assertOptional = (validator: Validator) => (key: string, value: any) => {
  return () => {
    if (value !== null) {
      validator(key, value);
    }
  };
};

export type Validator = (key: string, value: any) => void;

export type ObjectValidator<Type> = { [Key in keyof Type]: Validator };

export const createAssertValidObject = <Type>(validator: ObjectValidator<Type>) =>
  (object: Type) => {
    for (const key of <(keyof Type)[]>Object.keys(object)) {
      const value = object[key];
      const keyValidator = validator[key];
      if (keyValidator == null) {
        throw new Error(`${key} with value ${value} is not a specified key of the object being validated`);
      }
      validator[key](key, value);
    }
    for (const key of <(keyof Type)[]>Object.keys(validator)) {
      const value = object[key];
      const keyValidator = validator[key];
      if (keyValidator == null) {
        throw new Error(`Expected ${key} to exist on object`);
      }
      validator[key](key, value);
    }
  };

export const assertNever = (value: never): never => {
  throw new Error(`Invalid value ${value}`);
};
