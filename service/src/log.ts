import { Key } from './key';
import * as winston from 'winston';

const replaceErrors = (key, value) => {
  if (value instanceof Error) {
    var error = {};

    Object.getOwnPropertyNames(value).forEach(function (key) {
      error[key] = value[key];
    });

    return error;
  }

  return value;
}

winston.configure({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      timestamp() {
        return Date.now();
      },
      formatter(options) {
        return `${new Date(options.timestamp()).toISOString()} ${options.level.toUpperCase()} ${options.message} ${JSON.stringify(options.meta, replaceErrors)}`;
      }
    })
  ]
});

export const debug = (key: Key, message: string, ...args: any[]) => {
  winston.debug(message, { key, args });
};

export const info = (key: Key, message: string, ...args: any[]) => {
  winston.info(message, { key, args });
};

export const warn = (key: Key, message: string, ...args: any[]) => {
  winston.warn(message, { key, args });
};

export const error = (key: Key, message: string, ...args: any[]) => {
  winston.error(message, { key, args });
};
