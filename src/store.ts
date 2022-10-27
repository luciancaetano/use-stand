import { Middleware, StateApi } from './types';

class Store<S> implements StateApi<S> {
  private state: S;

  private middlewares: Middleware<S>[] = [];

  private listeners: Set<(state: S, prevState: S) => void> = new Set();

  constructor(initializer: (store: Store<S>) => S) {
    this.state = initializer(this);
  }

  getState = () => this.state;

  setState = (partial: S | Partial<S> | ((state: S) => S | Partial<S>), replace?: boolean) => {
    const prevState = this.state;

    const actions = Object.keys(this.state as Object).reduce((acc, key) => {
      if (typeof (this.state as any)[key] === 'function') {
        (acc as any)[key] = (this.state as any)[key];
      }
      return acc;
    }, {} as Partial<S>);

    const partialValue = typeof partial === 'function' ? (partial as any)(this.state) : partial;

    this.state = this.middlewares.reduce((state, middleware) => middleware(this)(state), replace ? {
      ...partialValue,
      ...actions,
    } : { ...this.state, ...partialValue });

    this.listeners.forEach((listener) => listener(this.state, prevState));

    return this.state;
  };

  subscribe = (listener: (state: S, prevState: S) => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  destroy = () => {
    this.listeners.clear();
  };

  use = (middleware: Middleware<S>) => {
    if (this.middlewares.indexOf(middleware) === -1) {
      this.middlewares.push(middleware);
    }
  };
}

export default Store;
