/* eslint-disable no-console */
import StandApiImpl from '../src/core/api';
import {
  persist, StorageEngine,
} from '../src';

interface CounterState {
  counter: number;
  reHydrated: boolean;
  increment: () => void;
  decrement: () => void;
}

const storageEngine = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

const asyncStorageEngine = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

describe('Persistence middleware', () => {
  let store: StandApiImpl<CounterState>;

  beforeEach(() => {
    store = new StandApiImpl<CounterState>(({ setState }) => ({
      counter: 0,
      reHydrated: false,
      increment: () => setState((state) => ({ counter: state.counter + 1 })),
      decrement: () => setState((state) => ({ counter: state.counter - 1 })),
    }));
  });

  it('should persist state', async () => {
    store.use(persist({
      name: 'test',
      storage: () => storageEngine as unknown as StorageEngine,
      onRehydrateStorage: ({ setState }) => {
        setState({ reHydrated: true });
      },
    }));

    store.setState((state) => ({ counter: state.counter + 1 }));

    expect(store.getState()).toEqual(
      expect.objectContaining({
        counter: 1,
        reHydrated: false,
      }),
    );

    expect(storageEngine.setItem).toHaveBeenCalledWith('test', '{"counter":1}');
  });

  it('should rehydrate state', () => {
    store.use(persist({
      name: 'test',
      storage: () => storageEngine as unknown as StorageEngine,
      onRehydrateStorage: ({ setState }) => {
        setState({ reHydrated: true });
      },
    }));
    storageEngine.getItem.mockReturnValueOnce('{"counter":1}');

    expect(store.getState().counter).toBe(1);
    expect(store.getState().reHydrated).toBe(true);
  });
});
