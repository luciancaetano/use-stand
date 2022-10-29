/* eslint-disable no-console */
import { Middleware } from '../core/types';

export function logger(name: string): Middleware {
  return () => (next) => (partial) => {
    const result = next(partial);

    const allKeys = Object.keys(partial).concat(Object.keys(result));

    const changesObject: Record<string, { from: any; to: any }> = {};

    allKeys.forEach((key) => {
      if (partial[key] !== result[key]) {
        changesObject[key] = {
          from: partial[key],
          to: result[key],
        };
      }
    });

    if (Object.keys(changesObject).length > 0) {
      console.group(`%cState changed in ${name}`, 'color: red');
      console.log('%cchanges:', 'color: red', changesObject);
      console.groupEnd();
    }

    return result;
  };
}
