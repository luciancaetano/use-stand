import React from 'react';
import StandApiImpl from './api';
import {
  Middleware, StandApi, StoreInitializer, BoundedUseStand, UseStandContext,
} from './types';
import { useStandContext, useStand } from './use';

function create<S>(initializer: StoreInitializer<S>, middlewares?: Middleware<S>[]): BoundedUseStand<S> {
  const useBoundedStore = () => useStand(initializer, middlewares);

  return useBoundedStore;
}

export default create;

export function createStandContext<S>(initializer: StoreInitializer<S>, middlewares?: Middleware<S>[]): UseStandContext<S> {
  const store = new StandApiImpl(initializer);

  middlewares?.forEach((middleware) => {
    store.use(middleware);
  });

  const ctx = React.createContext<StandApi<S>>(store);

  const useBoundedContext: any = (selector: any, equalityFn: any) => useStandContext(ctx, selector, equalityFn);

  const Provider = function UseStandProvider({ children }: { children: React.ReactNode }) {
    return (
      <ctx.Provider value={store}>
        {children}
      </ctx.Provider>
    );
  };

  return [
    useBoundedContext,
    Provider,
  ];
}
