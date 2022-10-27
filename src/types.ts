export interface StateApi<S> {
  getState: () => S;
  setState: (partial: S | Partial<S> | ((state: S) => S | Partial<S>), replace?: boolean) => S;
  subscribe: (listener: (state: S, prevState: S) => void) => () => void;
  destroy: () => void;
}

export type Store<S> = Pick<StateApi<S>, 'getState' | 'setState' >;

export interface StoreInitializer<S> {
  (store: Store<S>): S;
}

export interface Middleware<S> {
  (store: StateApi<S>): (next: (partial: S | Partial<S> | ((state: S) => S | Partial<S>), replace?: boolean) => S) => (partial: S | Partial<S> | ((state: S) => S | Partial<S>), replace?: boolean) => S;
}

export interface EqualityFn<S> {
  (state: S, prevState: S): boolean;
}
