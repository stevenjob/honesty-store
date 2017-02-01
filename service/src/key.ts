import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');
import isEmail = require('validator/lib/isEmail');

export interface Key {
  __IS__A__KEY__: void;
  toJSON(): string;
}

export interface AuthenticationKey extends Key {
  setUserId(userId: string);
}

export const createUserKey = ({ userId, correlationKey = undefined }) => {
  if (!isUUID(userId)) {
    throw new Error(`Invalid userId specified ${userId}`);
  }
  return <Key>{
    toJSON() {
      return this.toString();
    },
    toString() {
      return `user:${userId}:${correlationKey || uuid()}`;
    }
  };
};

export const createAuthenticationKey = () => {
  const correlationKey = uuid();
  return <AuthenticationKey>{
    setUserId(userId: string): Key {
      return createUserKey({ userId, correlationKey });
    },
    toJSON() {
      return this.toString();
    },
    toString() {
      return `auth:${correlationKey}`;
    }
  };
};

export const createEmailKey = ({ emailAddress }) => {
  if (!isEmail(emailAddress)) {
    throw new Error(`Invalid emailAddress specified ${emailAddress}`);
  }
  const correlationKey = uuid();
  return <Key>{
    toJSON() {
      return this.toString();
    },
    toString() {
      return `email:${emailAddress}:${correlationKey}`;
    }
  };
};

export const createUnauthenticatedKey = () => {
  const correlationKey = uuid();
  return <Key>{
    toJSON() {
      return this.toString();
    },
    toString() {
      return `unauthenticated:${correlationKey}`;
    }
  };
};

export const createServiceKey = ({ name }) => {
  return <Key>{
    toJSON() {
      return this.toString();
    },
    toString() {
      return `service:${name}`;
    }
  };
};
