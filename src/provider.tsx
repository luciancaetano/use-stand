import React from 'react';
import { StandApi } from './types';

export function createProvider<S>(context: React.Context<StandApi<S>>, api: StandApi<S>) {
  return function Provider({ children }: { children: React.ReactNode }) {
    return <context.Provider value={api}>{children}</context.Provider>;
  };
}
