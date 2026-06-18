import fs from 'fs';
import path from 'path';

const logFormat = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
};

export const logger = {
  info: (msg) => {
    console.log(logFormat('info', msg));
  },
  error: (msg, err) => {
    const errorDetails = err ? ` - ${err.stack || err.message || err}` : '';
    console.error(logFormat('error', `${msg}${errorDetails}`));
  },
  warn: (msg) => {
    console.warn(logFormat('warn', msg));
  },
  debug: (msg) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(logFormat('debug', msg));
    }
  }
};
