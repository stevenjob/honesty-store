import { Key } from './key';

type Level = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const replacer = (key, value) => {
  if (value instanceof Error) {
    const { message, stack } = value;
    return { message, stack };
  }
  return value;
};

const log = (level: Level, key: Key, message: string, ...args: any[]) => {
  const output = {
    timestamp: new Date().toISOString(),
    level,
    key,
    message,
    args
  };
  const json = JSON.stringify(output, replacer);
  console.log(json);
};

export const debug = (key: Key, message: string, ...args: any[]) => {
   log('DEBUG', key, message, args);
};

export const info = (key: Key, message: string, ...args: any[]) => {
  log('INFO', key, message, args);
};

export const warn = (key: Key, message: string, ...args: any[]) => {
  log('WARN', key, message, args);
};

export const error = (key: Key, message: string, ...args: any[]) => {
  log('ERROR', key, message, args);
};
