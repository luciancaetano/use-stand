import StandApiImpl from '../src/core/api';
import { logger } from '../src';

interface CounterState {
  counter: number;
  increment: () => void;
  decrement: () => void;
}

describe('Logger middleware', () => {
  let store: StandApiImpl<CounterState>;

  beforeEach(() => {
    store = new StandApiImpl<CounterState>(({ setState }) => ({
      counter: 0,
      increment: () => setState((state) => ({ counter: state.counter + 1 })),
      decrement: () => setState((state) => ({ counter: state.counter - 1 })),
    }));
  });

  it('should log state changes', () => {
    const loggerSpy = jest.fn();
    const loggerMiddleware = logger('test', loggerSpy);
    store.use(loggerMiddleware);

    store.getState().increment();

    expect(loggerSpy).toHaveBeenCalledTimes(1);
    expect(loggerSpy).toHaveBeenCalledWith('test', true, { counter: { from: 0, to: 1 } });
  });
});
