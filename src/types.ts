import React, { ReactNode } from 'react';
import MiddlewareConfigStore from './middlewareSettingsStore';

export type SetStateFn<S> = (partial: S | Partial<S> | ((state: S) => S | Partial<S>), replace?: boolean) => S;

export interface StandApi<S> {
  /**
   * Get the current state
   */
  getState: () => S;
  /**
   * Set the state
   * @param partial Partial state or a function that returns a partial state
   * @param replace Replace the state instead of merging it
   */
  setState: SetStateFn<S>;
  /**
   * Subscribe to state changes
   * @param listener Listener function
   * @returns Unsubscribe function
   */
  subscribe: (listener: (state: S, prevState: S) => void) => () => void;
  /**
   * Destroy the store
   */
  destroy: () => void;
  /**
   * Use a middleware
   * @param middleware Middleware function
   */
  use: (middleware: Middleware<S>) => void;
}

export type Store<S> = Pick<StandApi<S>, 'getState' | 'setState' >;

export interface StoreInitializer<S> {
  (store: Store<S>): S;
}

export interface Middleware<S = any> {
  (store: StandApi<S>, settings: MiddlewareConfigStoreType): (setState: SetStateFn<S>) => SetStateFn<S>;
}

export interface EqualityFn<S> {
  (state: S, prevState: S): boolean;
}

export type MiddlewareConfigStoreType = MiddlewareConfigStore;

interface ProviderProps {
  children?: ReactNode | undefined;
}

export type UseStandContext<S> = Omit<React.Context<StandApi<S>>, 'Provider'> & {Provider: React.ProviderExoticComponent<ProviderProps>};
