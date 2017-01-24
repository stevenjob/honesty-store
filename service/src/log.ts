import { Key } from './key';
import * as winston from 'winston';

winston.configure({
  level: 'debug',
  transports: [
    new winston.transports.Console({
      timestamp() {
        return Date.now();
      },
      formatter(options) {
        return `${new Date(options.timestamp()).toISOString()} ${options.level.toUpperCase()} ${options.message} ${JSON.stringify(options.meta)}`;
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
