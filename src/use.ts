/* eslint-disable no-redeclare */
/* eslint-disable default-param-last */
import React, { useEffect, useRef, useState } from 'react';
import { EqualityFn, UseStandContext } from './types';

const DEFAULT_SELECTOR: any = (state: any) => state;

export function useStandContext<S>(context: UseStandContext<S>): S;
export function useStandContext<S, U>(context: UseStandContext<S>, selector: (state: S) => U, equalityFn?: EqualityFn<U>): U;

export function useStandContext<S, U>(context: UseStandContext<S>, selector: (state: S) => U = DEFAULT_SELECTOR, equalityFn?: EqualityFn<U>): U {
  const store = React.useContext(context);
  const [, setUpdate] = useState({});
  const equalityFnRef = useRef<EqualityFn<U> | undefined>(equalityFn);
  const selectorRef = useRef<((state: S) => U) | undefined>(selector);

  useEffect(() => {
    equalityFnRef.current = equalityFn;
  }, [equalityFn]);

  useEffect(() => {
    selectorRef.current = selector;
  }, [selector]);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      if (equalityFnRef.current) {
        const state: U = selectorRef.current ? selectorRef.current(store.getState()) as U : store.getState() as unknown as U;
        if (!equalityFnRef.current(state, selectorRef.current ? selectorRef.current(store.getState()) as U : store.getState() as unknown as U)) {
          setUpdate({});
        }
      } else {
        setUpdate({});
      }
    });

    return () => {
      unsubscribe();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      store.destroy();
    };
  }, [store]);

  const state = selectorRef.current ? selectorRef.current(store.getState()) : store.getState();

  return state as U;
}
