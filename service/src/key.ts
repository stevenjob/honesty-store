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

// return a key like so: `service:correlationKey:tag1=value1:tag2=value2:...`
const createKey = ({ service, correlationKey = uuid(), tags = {} }) => {
  const tagString = Object.keys(tags).map((k) => `${k}=${tags[k]}`).join(':');

  return <Key>{
    __IS__A__KEY__: void 0,
    toJSON() {
      return this.toString();
    },
    toString() {
      return `${service}:${correlationKey}:${tagString}`;
    },
    service,
    correlationKey,
    tags
  };
};

export const createUserKey = ({ userId, correlationKey = undefined }) => {
  if (!isUUID(userId)) {
    throw new Error(`Invalid userId specified ${userId}`);
  }
  return createKey({
    service: 'user',
    correlationKey: correlationKey || uuid(),
    tags: { userId }
  });
};

export const createAuthenticationKey = () => {
  const correlationKey = uuid();
  const key = createKey({
    service: 'auth'
  });

  return <AuthenticationKey>{
    ...key,

    setUserId(userId: string): Key {
      return createUserKey({ userId, correlationKey });
    }
  };
};

export const createEmailKey = ({ emailAddress }) => {
  if (!isEmail(emailAddress)) {
    throw new Error(`Invalid emailAddress specified ${emailAddress}`);
  }
  return createKey({
    service: 'email',
    tags: { emailAddress }
  });
};

export const createUnauthenticatedKey = () => {
  return createKey({ service: 'unauthenticated' });
};

export const createServiceKey = ({ name }) => {
  return createKey({ service: name });
};
