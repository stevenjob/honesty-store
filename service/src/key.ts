import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');
import isEmail = require('validator/lib/isEmail');

export interface Key {
    __IS__A__KEY__: void;
}

export interface AuthenticationKey extends Key {
    setUserId(userId: string);
}

export const createAuthenticationKey = () => {
    const correlationKey = uuid();
    return <AuthenticationKey>{
        setUserId(userId: string): Key {
            if (!isUUID(userId)) {
                throw new Error(`Invalid userId specified ${userId}`);
            }
            return <Key>{
                toString() {
                    return `user:${userId}:${correlationKey}`;
                }
            };
        },
        toString() {
            return `auth:${correlationKey}`;
        }
    };
}

export const createUserKey = ({ userId }) => {
    if (!isUUID(userId)) {
        throw new Error(`Invalid userId specified ${userId}`);
    }
    const correlationKey = uuid();
    return <Key>{
        toString() {
            return `user:${userId}:${correlationKey}`;
        }
    };
};

export const createEmailKey = ({ emailAddress }) => {
    if (!isEmail(emailAddress)) {
        throw new Error(`Invalid emailAddress specified ${emailAddress}`);
    }
    const correlationKey = uuid();
    return <Key>{
        toString() {
            return `email:${emailAddress}:${correlationKey}`;
        }
    };
};