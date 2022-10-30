import { cloneObject } from './helpers';
import {
  GetStateFn,
  Middleware, SetStateFn, StandApi, Store,
} from './types';

class StandApiImpl<S> implements StandApi<S> {
  private state: S = {} as S;

  public initialState: S;

  private middlewares: Middleware<S>[] = [];

  private listeners: Set<(state: S, prevState: S) => void> = new Set();

  constructor(initializer: (store: Store<S>) => S) {
    this.state = initializer({
      getState: this.getState,
      setState: this.setState,
      getInitialState: () => this.initialState,
    });

    // clone the initial state
    this.initialState = cloneObject(this.state);
  }

  public getState: GetStateFn<S> = (selector = undefined as any) => {
    if (selector) {
      return selector(this.state);
    }
    return this.state;
  };

  public setState: SetStateFn<S> = (partial) => {
    const prevState = this.state;

    const partialValue = typeof partial === 'function' ? (partial as any)(this.state) : partial;

    if (this.middlewares.length > 0) {
      this.middlewares.forEach((middleware) => {
        const middlewareApi = middleware(this);
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
