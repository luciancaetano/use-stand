import { useEffect, useRef, useState } from 'react';
import Store from './store';
import { EqualityFn, Middleware, StoreInitializer } from './types';

export interface StateApi<S> {
  getState: () => S;
  setState: (partial: S | Partial<S> | ((state: S) => S | Partial<S>), replace?: boolean) => S;
  subscribe: (listener: (state: S, prevState: S) => void) => () => void;
  destroy: () => void;
}

function create<S>(initializer: StoreInitializer<S>, middlewares?: Middleware<S>[]) {
  function useStore(equalityFn?: EqualityFn<S>) {
    const [, setUpdate] = useState({});
    const store = useRef<Store<S>>(new Store(initializer));
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
