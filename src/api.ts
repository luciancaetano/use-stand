import { cloneObject } from './helpers';
import MiddlewareConfigStore from './middlewareSettingsStore';
import {
  Middleware, SetStateFn, StandApi, Store,
} from './types';

class StandApiImpl<S> implements StandApi<S> {
  private state: S;

  public initialState: S;

  private middlewares: Middleware<S>[] = [];

  private listeners: Set<(state: S, prevState: S) => void> = new Set();

  private middlewareConfigStore: MiddlewareConfigStore = new MiddlewareConfigStore();

  public getMiddlewareConfig(): MiddlewareConfigStore {
    return this.middlewareConfigStore;
  }

  constructor(initializer: (store: Store<S>) => S) {
    this.state = initializer({
      getState: this.getState,
      setState: this.setState,
      getInitialState: () => this.initialState,
    });
    // clone state to initial state
    this.initialState = cloneObject(this.state);
  }

  public getState = () => this.state;

  public setState: SetStateFn<S> = (partial) => {
    const prevState = this.state;

    const partialValue = typeof partial === 'function' ? (partial as any)(this.state) : partial;

    if (this.middlewares.length > 0) {
      this.middlewares.forEach((middleware) => {
        const middlewareApi = middleware(this, this.middlewareConfigStore);
        const setState = middlewareApi(this.silentSetState);
        setState(partialValue);
      });
    } else {
      this.state = { ...this.state, ...partialValue };
    }

    this.listeners.forEach((listener) => listener(this.state, prevState));

    return this.state;
  };

  /**
   * Set state without triggering listeners or middlewares
   */
  private silentSetState: SetStateFn<S> = (partial) => {
    const partialValue = typeof partial === 'function' ? (partial as any)(this.state) : partial;

    this.state = { ...this.state, ...partialValue };

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
