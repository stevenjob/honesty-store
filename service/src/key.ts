import { v4 as uuid } from 'uuid';
import isUUID = require('validator/lib/isUUID');
import isEmail = require('validator/lib/isEmail');

export interface Key {
    __IS__A__KEY__: void;
}

export const createUserKey = ({ userId }) => {
    if (!isUUID(userId)) {
        throw new Error(`Invalid userId specified ${userId}`);
    }
    return <Key>{
        toString() {
            return `${userId}:${uuid()}`;
        }
    };
};

export const createEmailKey = ({ emailAddress }) => {
    if (!isEmail(emailAddress)) {
        throw new Error(`Invalid emailAddress specified ${emailAddress}`);
    }
    return <Key>{
        toString() {
            return `${emailAddress}:${uuid()}`;
        }
    };
};