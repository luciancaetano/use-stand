import StandApiImpl from '../src/api';
import { Middleware } from '../src/types';

interface CounterState {
  counter: number;
  middlewareWorks: boolean;
  increment: () => void;
  decrement: () => void;
  incrementBy: (amount: number) => void;
  decrementBy: (amount: number) => void;
  incrementAsync: () => Promise<void>;
  decrementAsync: () => Promise<void>;
  incrementUsingStateApi: () => void;
  decrementUsingStateApi: () => void;
}

const clearSettingsMiddleware: Middleware<CounterState> = (_, config) => (next) => (partial, replace) => {
  config.clearMiddlewareConfig('testMiddleWare');
  return next(partial, replace);
};

const testMiddleWare:Middleware<CounterState> = (_, config) => (next) => (partial, replace) => {
  config.setMiddlewareConfig('testMiddleWare', 'configTest', '123');

  if (typeof partial === 'function') {
    return next((state) => {
      const newState = partial(state);
      return {
        ...newState,
        middlewareWorks: true,
      };
    }, replace);
  }
  return next({
    ...partial,
    middlewareWorks: true,
  }, replace);
};

describe('Store', () => {
  let store: StandApiImpl<CounterState>;

  beforeEach(() => {
    store = new StandApiImpl<CounterState>((s) => ({
      counter: 0,
      middlewareWorks: false,
      increment: () => s.setState((state) => ({ counter: state.counter + 1 })),
      decrement: () => s.setState((state) => ({ counter: state.counter - 1 })),
      incrementBy: (amount: number) => s.setState((state) => ({ counter: state.counter + amount })),
      decrementBy: (amount: number) => s.setState((state) => ({ counter: state.counter - amount })),
      incrementAsync: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        s.setState((state) => ({ counter: state.counter + 1 }));
      },
      decrementAsync: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        s.setState((state) => ({ counter: state.counter - 1 }));
      },
      incrementUsingStateApi: () => s.setState({
        counter: s.getState().counter + 1,
      }),
      decrementUsingStateApi: () => s.setState({
        counter: s.getState().counter - 1,
      }),
    }));
  });

  it('should initialize state', () => {
    expect(store.getState()).toEqual({
      counter: 0,
      middlewareWorks: false,
      increment: expect.any(Function),
      decrement: expect.any(Function),
      incrementBy: expect.any(Function),
      decrementBy: expect.any(Function),
      incrementAsync: expect.any(Function),
      decrementAsync: expect.any(Function),
      incrementUsingStateApi: expect.any(Function),
      decrementUsingStateApi: expect.any(Function),
    });
  });

  test('should create a store', () => {
    const store = new StandApiImpl(() => ({}));

    expect(store).toBeDefined();
  });

  test('should increment and decrement counter', () => {
    expect(store.getState().counter).toBe(0);

    store.getState().increment();
    expect(store.getState().counter).toBe(1);

    store.getState().decrement();
    expect(store.getState().counter).toBe(0);
  });

  test('should increment and decrement counter by amount', () => {
    expect(store.getState().counter).toBe(0);

    store.getState().incrementBy(10);
    expect(store.getState().counter).toBe(10);

    store.getState().decrementBy(5);
    expect(store.getState().counter).toBe(5);
  });

  test('should increment and decrement counter using state api', () => {
    expect(store.getState().counter).toBe(0);

    store.getState().incrementUsingStateApi();
    expect(store.getState().counter).toBe(1);

    store.getState().decrementUsingStateApi();
    expect(store.getState().counter).toBe(0);
  });

  test('should increment and decrement counter async', async () => {
    expect(store.getState().counter).toBe(0);

    store.getState().incrementAsync();
    expect(store.getState().counter).toBe(0);

    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(store.getState().counter).toBe(1);

    store.getState().decrementAsync();
    expect(store.getState().counter).toBe(1);

    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(store.getState().counter).toBe(0);
  });

  test('should subscribe to state changes', () => {
    const mock = jest.fn();
    store.subscribe(mock);

    store.getState().increment();
    expect(mock).toBeCalledTimes(1);

    store.getState().increment();
    expect(mock).toBeCalledTimes(2);
  });

  test('should unsubscribe from state changes', () => {
    const mock = jest.fn();
    const unsubscribe = store.subscribe(mock);

    store.getState().increment();
    expect(mock).toBeCalledTimes(1);

    unsubscribe();
    store.getState().increment();
    expect(mock).toBeCalledTimes(1);
  });

  test('should destroy store', () => {
    const mock = jest.fn();
    store.subscribe(mock);

    store.destroy();
    store.getState().increment();
    expect(mock).toBeCalledTimes(0);
  });

  test('should replace state', () => {
    store.getState().increment();
    expect(store.getState().counter).toBe(1);

    store.setState({ counter: 5 }, true);
    expect(store.getState().counter).toBe(5);
    expect(store.getState().middlewareWorks).toBe(undefined);
  });

  test('should use middleware', () => {
    store.use(testMiddleWare);

    store.getState().increment();
    expect(store.getState().middlewareWorks).toBe(true);
  });

  test('should use middleware with config', () => {
    store.use(testMiddleWare);

    store.getState().increment();
    expect(store.middlewareConfig.getMiddlewareConfig('testMiddleWare', 'configTest')).toBe('123');
  });

  test('should use middleware with config and replace', () => {
    store.use(testMiddleWare);

    store.getState().increment();
    expect(store.middlewareConfig.getMiddlewareConfig('testMiddleWare', 'configTest')).toBe('123');

    store.middlewareConfig.setMiddlewareConfig('testMiddleWare', 'configTest', '456');
    expect(store.middlewareConfig.getMiddlewareConfig('testMiddleWare', 'configTest')).toBe('456');
  });

  test('should use middleware with config and clear', () => {
    store.use(testMiddleWare);

    store.getState().increment();
    expect(store.middlewareConfig.getMiddlewareConfig('testMiddleWare', 'configTest')).toBe('123');

    store.use(clearSettingsMiddleware);

    expect(store.middlewareConfig.getMiddlewareConfig('testMiddleWare', 'configTest')).toBe('123');

    store.getState().increment();

    store.middlewareConfig.clearMiddlewareConfig('testMiddleWare');
    expect(store.middlewareConfig.getMiddlewareConfig('testMiddleWare', 'configTest')).toBe(undefined);
  });

  // replace state and check if actions is still working

  test('should replace state and check if actions is still working', async () => {
    store.getState().increment();
    expect(store.getState().counter).toBe(1);

    store.setState({ counter: 5 }, true);
    expect(store.getState().counter).toBe(5);
    expect(store.getState().middlewareWorks).toBe(undefined);

    store.getState().increment();
    expect(store.getState().counter).toBe(6);

    store.getState().decrement();
    expect(store.getState().counter).toBe(5);

    store.getState().incrementBy(10);
    expect(store.getState().counter).toBe(15);

    store.getState().decrementBy(5);
    expect(store.getState().counter).toBe(10);

    store.getState().incrementUsingStateApi();
    expect(store.getState().counter).toBe(11);

    store.getState().decrementUsingStateApi();
    expect(store.getState().counter).toBe(10);

    await store.getState().incrementAsync();
    expect(store.getState().counter).toBe(11);

    await store.getState().decrementAsync();
    expect(store.getState().counter).toBe(10);

    store.getState().increment();
    expect(store.getState().counter).toBe(11);
  });
});
