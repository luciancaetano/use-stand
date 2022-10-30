import { renderHook, act } from '@testing-library/react';
import create, {
  Middleware, StoreInitializer,
} from '../src/index';

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

const testMiddleWare:Middleware<CounterState> = () => (next) => (partial) => {
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

const initializer: StoreInitializer<CounterState> = ({ setState, getState }) => ({
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
});

const useStand = create(initializer, [testMiddleWare]);

describe('Store', () => {
  it('useStand', () => {
    const { result } = renderHook(() => useStand());
    expect(result.current.counter).toBe(0);

    act(() => {
      result.current.increment();
    });
    expect(result.current.counter).toBe(1);
  });

  it('useStand test equality', () => {
    const { result } = renderHook(() => useStand());
    expect(result.current.counter).toBe(0);

    act(() => {
      result.current.increment();
    });
    expect(result.current.counter).toBe(1);
  });
});
