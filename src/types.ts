import { ReactNode } from 'react';
import MiddlewareConfigStore from './middlewareSettingsStore';

export type SetStateFn<S> = (
  partial: S | Partial<S> | ((state: S) => S | Partial<S>)
) => S;

export interface StandApi<S> {
  /**
   * Initial state
   */
  initialState: S;
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

export interface Store<S> {
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

  getInitialState: () => S;
}

export interface StoreInitializer<S> {
  (store: Store<S>): S;
}

export interface Middleware<S = any> {
  (store: StandApi<S>, settings: MiddlewareConfigStoreType): (
    setState: SetStateFn<S>
  ) => SetStateFn<S>;
}

export interface EqualityFn<S> {
  (state: S, prevState: S): boolean;
}

export type MiddlewareConfigStoreType = MiddlewareConfigStore;

export interface ProviderComponent {
  (props: { children: ReactNode }): JSX.Element;
}

export interface UseBoundedStandContext<S> {
  <U>(selector: (state: S) => U, equalityFn?: EqualityFn<U>): U;
  (): S;
}

export interface BoundedUseStand<S> {
  (equalityFn?: EqualityFn<S>): S;
}
export type UseStandContext<S> = [
  UseBoundedStandContext<S>,
  ProviderComponent
];
