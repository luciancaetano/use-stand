import MiddlewareConfigStore from './middlewareSettingsStore';
import {
  Middleware, SetStateFn, StandApi,
} from './types';

class StandApiImpl<S> implements StandApi<S> {
  private state: S;

  private middlewares: Middleware<S>[] = [];

  private listeners: Set<(state: S, prevState: S) => void> = new Set();

  private middlewareConfigStore: MiddlewareConfigStore = new MiddlewareConfigStore();

  public get middlewareConfig(): MiddlewareConfigStore {
    return this.middlewareConfigStore;
  }

  constructor(initializer: (store: StandApiImpl<S>) => S) {
    this.state = initializer(this);
  }

  public getState = () => this.state;

  public setState: SetStateFn<S> = (partial, replace) => {
    const prevState = this.state;

    const actions = Object.keys(this.state as Object).reduce((acc, key) => {
      if (typeof (this.state as any)[key] === 'function') {
        (acc as any)[key] = (this.state as any)[key];
      }
      return acc;
    }, {} as Partial<S>);

    const partialValue = typeof partial === 'function' ? (partial as any)(this.state) : partial;

    if (this.middlewares.length > 0) {
      this.middlewares.forEach((middleware) => {
        const middlewareApi = middleware(this, this.middlewareConfigStore);
        const setState = middlewareApi(this.silentSetState);
        setState(partialValue, replace);
      });
    } else {
      this.state = replace ? { ...partialValue, ...actions } : { ...this.state, ...partialValue, ...actions };
    }

    this.listeners.forEach((listener) => listener(this.state, prevState));

    return this.state;
  };

  /**
   * Set state without triggering listeners or middlewares
   */
  private silentSetState: SetStateFn<S> = (partial, replace) => {
    const partialValue = typeof partial === 'function' ? (partial as any)(this.state) : partial;

    const actions = Object.keys(this.state as Object).reduce((acc, key) => {
      if (typeof (this.state as any)[key] === 'function') {
        (acc as any)[key] = (this.state as any)[key];
      }
      return acc;
    }, {} as Partial<S>);

    this.state = replace ? { ...partialValue, ...actions } : { ...this.state, ...partialValue, ...actions };

    return this.state;
  };

  public subscribe = (listener: (state: S, prevState: S) => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  public destroy = () => {
    this.listeners.clear();
  };

  public use = (middleware: Middleware<S>) => {
    const index = this.middlewares.findIndex((m) => m.name === middleware.name);

    if (index > -1) {
      this.middlewares[index] = middleware;
    } else {
      this.middlewares.push(middleware);
    }
  };
}

export default StandApiImpl;
