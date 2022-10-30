/* eslint-disable no-console */
import { runAsync, shallowCompare } from '../core/helpers';
import { Middleware } from '../core/types';

export interface LoggerChangeMap {
  from: any;
  to: any;
}
export interface LogRender {
  (name: string, hasChanged: boolean, changes: Record<string, LoggerChangeMap>): void;
}

function defaultLogger(name: string, hasChanged: boolean, changes: Record<string, LoggerChangeMap>): void {
  if (hasChanged) {
    console.group(`%cState changed in ${name}`, 'color: red');
    console.log('%cchanges:', 'color: blue', changes);
    console.groupEnd();
  }
}

export function logger(name: string, logger: LogRender = defaultLogger): Middleware {
  return (store) => (next) => (partial) => {
    const state = store.getState();
    const partialValue = typeof partial === 'function' ? (partial as any)(state) : partial;
    const nextState = { ...state, ...partialValue };

    const allKeys = Object.keys(state).concat(Object.keys(nextState));

    const changesObject: Record<string, LoggerChangeMap> = {};

    allKeys.forEach((key) => {
      if (typeof state[key] === 'function' && typeof nextState[key] === 'function') return;

      if (!shallowCompare(state[key], nextState[key])) {
        changesObject[key] = {
          from: state[key],
          to: nextState[key],
        };
      }
    });

    runAsync(() => {
      logger(name, Object.keys(changesObject).length > 0, changesObject);
    });

    return next(partial);
  };
}
