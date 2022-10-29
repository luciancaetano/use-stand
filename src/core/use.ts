/* eslint-disable no-redeclare */
/* eslint-disable default-param-last */
import React, { useEffect, useRef, useState } from 'react';
import StandApiImpl from './api';
import { DEFAULT_SELECTOR, shallowCompare } from './helpers';
import {
  EqualityFn, Middleware, StandApi, StoreInitializer,
} from './types';

export function useStandContext<S>(
  context: React.Context<StandApi<S>>
): S;
export function useStandContext<S, U>(
  context: React.Context<StandApi<S>>,
  selector: (state: S) => U,
  equalityFn?: EqualityFn<U>
): U;

export function useStandContext<S, U>(
  context: React.Context<StandApi<S>>,
  selector: (state: S) => U = DEFAULT_SELECTOR,
  equalityFn: EqualityFn<U> = shallowCompare,
): U {
  const store = React.useContext(context);
  const [, setUpdate] = useState({});
  const equalityFnRef = useRef<EqualityFn<U>>(equalityFn);
  const selectorRef = useRef<((state: S) => U) | undefined>(selector);

  useEffect(() => {
    equalityFnRef.current = equalityFn;
  }, [equalityFn]);

  useEffect(() => {
    selectorRef.current = selector;
  }, [selector]);

  useEffect(() => {
    const unsubscribe = store.subscribe((state, prevState) => {
      const selected = selectorRef.current ? selectorRef.current(state) : state;
      const prevSelected = selectorRef.current ? selectorRef.current(prevState) : prevState;

      if (!(equalityFnRef.current as any)(selected, prevSelected)) {
        setUpdate({});
      }
    });

    return () => {
      unsubscribe();
    };
  }, [store]);

  const state = selectorRef.current
    ? selectorRef.current(store.getState())
    : store.getState();

  return state as U;
}

export function useStand<S>(initializer: StoreInitializer<S>, middlewares?: Middleware<S>[], equalityFn: EqualityFn<S> = shallowCompare): S {
  const [, setUpdate] = useState({});
  const store = useRef<StandApiImpl<S>>(new StandApiImpl(initializer));
  const equalityFnRef = useRef<EqualityFn<S>>(equalityFn);

  useEffect(() => {
    equalityFnRef.current = equalityFn;
  }, [equalityFn]);

  useEffect(() => {
    middlewares?.forEach((middleware) => {
      store.current.use(middleware);
    });
  }, [middlewares]);

  useEffect(() => {
    const unsubscribe = store.current.subscribe((state, prevState) => {
      if (!equalityFnRef.current(state, prevState)) {
        setUpdate({});
      }
    });

    return () => {
      unsubscribe();
      // eslint-disable-next-line react-hooks/exhaustive-deps
      store.current.destroy();
    };
  }, []);

  const state = store.current.getState();

  return state;
}
