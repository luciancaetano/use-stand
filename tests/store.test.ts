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
  resetState: () => void;
}

const clearSettingsMiddleware: Middleware<CounterState> = (_, config) => (next) => (partial) => {
  config.clearMiddlewareConfig('testMiddleWare');
  return next(partial);
};

const testMiddleWare:Middleware<CounterState> = (_, config) => (next) => (partial) => {
  config.setMiddlewareConfig('testMiddleWare', 'configTest', '123');

  if (typeof partial === 'function') {
    return next((state) => {
      const newState = partial(state);
      return {
        ...newState,
        middlewareWorks: true,
      };
    });
  }
  return next({
    ...partial,
    middlewareWorks: true,
  });
};

describe('Store', () => {
  let store: StandApiImpl<CounterState>;

  beforeEach(() => {
    store = new StandApiImpl<CounterState>(({ setState, getState, getInitialState }) => ({
      counter: 0,
      middlewareWorks: false,
      increment: () => setState((state) => ({ counter: state.counter + 1 })),
      decrement: () => setState((state) => ({ counter: state.counter - 1 })),
      incrementBy: (amount: number) => setState((state) => ({ counter: state.counter + amount })),
      decrementBy: (amount: number) => setState((state) => ({ counter: state.counter - amount })),
      incrementAsync: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setState((state) => ({ counter: state.counter + 1 }));
      },
      decrementAsync: async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setState((state) => ({ counter: state.counter - 1 }));
      },
      incrementUsingStateApi: () => setState({
        counter: getState().counter + 1,
      }),
      decrementUsingStateApi: () => setState({
        counter: getState().counter - 1,
      }),
      resetState: () => setState(getInitialState()),
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
      resetState: expect.any(Function),
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

  test('should use middleware', () => {
    store.use(testMiddleWare);

    store.getState().increment();
    expect(store.getState().middlewareWorks).toBe(true);
  });

  test('should use middleware with config', () => {
    store.use(testMiddleWare);

    store.getState().increment();
    expect(store.getMiddlewareConfig().getMiddlewareConfig('testMiddleWare', 'configTest')).toBe('123');
  });

  test('should use middleware with config an', () => {
    store.use(testMiddleWare);

    store.getState().increment();
    expect(store.getMiddlewareConfig().getMiddlewareConfig('testMiddleWare', 'configTest')).toBe('123');

    store.getMiddlewareConfig().setMiddlewareConfig('testMiddleWare', 'configTest', '456');
    expect(store.getMiddlewareConfig().getMiddlewareConfig('testMiddleWare', 'configTest')).toBe('456');
  });

  test('should use middleware with config and clear', () => {
    store.use(testMiddleWare);

    store.getState().increment();
    expect(store.getMiddlewareConfig().getMiddlewareConfig('testMiddleWare', 'configTest')).toBe('123');

    store.use(clearSettingsMiddleware);

    expect(store.getMiddlewareConfig().getMiddlewareConfig('testMiddleWare', 'configTest')).toBe('123');

    store.getState().increment();

    store.getMiddlewareConfig().clearMiddlewareConfig('testMiddleWare');
    expect(store.getMiddlewareConfig().getMiddlewareConfig('testMiddleWare', 'configTest')).toBe(undefined);
  });

  test('should state and check if actions is still working', async () => {
    store.getState().increment();
    expect(store.getState().counter).toBe(1);

    store.getState().increment();
    expect(store.getState().counter).toBe(2);

    store.getState().decrement();
    expect(store.getState().counter).toBe(1);

    store.getState().incrementBy(10);
    expect(store.getState().counter).toBe(11);

    store.getState().decrementBy(8);
    expect(store.getState().counter).toBe(3);

    store.getState().incrementUsingStateApi();
    expect(store.getState().counter).toBe(4);

    store.getState().decrementUsingStateApi();
    expect(store.getState().counter).toBe(3);

    await store.getState().incrementAsync();
    expect(store.getState().counter).toBe(4);

    await store.getState().decrementAsync();
    expect(store.getState().counter).toBe(3);

    store.getState().increment();
    expect(store.getState().counter).toBe(4);
  });

  test('should reset state', async () => {
    store.getState().increment();
    expect(store.getState().counter).toBe(1);

    store.getState().increment();
    expect(store.getState().counter).toBe(2);

    store.getState().decrement();
    expect(store.getState().counter).toBe(1);

    store.getState().incrementBy(10);
    expect(store.getState().counter).toBe(11);

    store.getState().decrementBy(8);
    expect(store.getState().counter).toBe(3);

    store.getState().incrementUsingStateApi();
    expect(store.getState().counter).toBe(4);

    store.getState().decrementUsingStateApi();
    expect(store.getState().counter).toBe(3);

    await store.getState().incrementAsync();
    expect(store.getState().counter).toBe(4);

    await store.getState().decrementAsync();
    expect(store.getState().counter).toBe(3);

    store.getState().increment();
    expect(store.getState().counter).toBe(4);

    store.getState().resetState();

    expect(store.getState().counter).toBe(0);
  });
});
