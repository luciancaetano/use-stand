import React, { useEffect, useRef, useState } from 'react';
import StandApiImpl from './api';
import { createProvider } from './provider';
import {
  EqualityFn, Middleware, StandApi, StoreInitializer, UseStandContext,
} from './types';

function create<S>(initializer: StoreInitializer<S>, middlewares?: Middleware<S>[]) {
  function useStore(equalityFn?: EqualityFn<S>) {
    const [, setUpdate] = useState({});
    const store = useRef<StandApiImpl<S>>(new StandApiImpl(initializer));
    const equalityFnRef = useRef<EqualityFn<S> | undefined>(equalityFn);

    useEffect(() => {
      equalityFnRef.current = equalityFn;
    }, [equalityFn]);

    useEffect(() => {
      middlewares?.forEach((middleware) => {
        store.current.use(middleware);
      });
    }, []);

    useEffect(() => {
      const unsubscribe = store.current.subscribe(() => {
        if (equalityFnRef.current) {
          const state = store.current.getState();
          if (!equalityFnRef.current(state, store.current.getState())) {
            setUpdate({});
          }
        } else {
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

  return useStore;
}

export default create;

export function createStandContext<S>(initializer: StoreInitializer<S>, middlewares?: Middleware<S>[]): UseStandContext<S> {
  const store = new StandApiImpl(initializer);

  middlewares?.forEach((middleware) => {
    store.use(middleware);
  });

  const ctx = React.createContext<StandApi<S>>(store);

  const Provider = createProvider(ctx, store);

  Object.defineProperty(ctx, 'Provider', {
    value: Provider,
    writable: false,
  });

  return ctx as UseStandContext<S>;
}
