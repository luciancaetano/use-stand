import { Full } from '../core/helpers';
import { Middleware, Store } from '../core/types';

export interface StorageEngine {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

export interface StoreValue<S> {
  state: S;
  version?: number;
}

export interface PersistenceConfig<S> {
  /**
   * The key to use when storing the state in the storage engine.
   */
  name: string;
  /**
   * The storage engine to use. Defaults to `localStorage`.
   */
  version?: number;
  /**
   * The storage engine to use. Defaults to `localStorage`.
   */
  storage?: () => StorageEngine;
  /**
   * A function that receives the current state and returns the state to be stored.
   */
  serializer?: (value: StoreValue<S>) => string | Promise<string>;
  /**
   * A function that receives the stored state and returns the state to be set in the store.
   */
  deserializer?: (value: string) => StoreValue<S> | Promise<StoreValue<S>>;
  /**
   * A function that receives the current state and returns a boolean indicating whether the state should be stored.
   */
  selector?: (state: S) => Partial<S> | S | Promise<Partial<S> | S>;
  /**
   * A function that receives the current state and returns a boolean indicating whether the state should be stored.
   */
  migrate?: (persistedState: unknown, version: number) => S | Promise<S>;
  /**
   * A function that receives the current state and returns a boolean indicating whether the state should be stored.
   */
  merge?: (persistedState: unknown, currentState: S) => S | Promise<S>;

  onRehydrateStorage?: (store: Store<S>) => void | Promise<void>;
}

function toThenable<T>(value: T | Promise<T>): Promise<T> {
  return Promise.resolve(value);
}

const DEFAULT_CONFIG = {
  storage: () => localStorage,
  serializer: JSON.stringify,
  deserializer: JSON.parse,
  selector: (state: any) => state,
  merge: (persistedState: any, currentState: any) => ({ ...currentState, ...persistedState }),
} as unknown as Full<PersistenceConfig<any>>;

export function persist<S>(config: PersistenceConfig<S>): Middleware<S> {
  let initialized = false;
  const storage = typeof config.storage === 'function' ? config.storage() : DEFAULT_CONFIG.storage();
  const serializer = config.serializer || DEFAULT_CONFIG.serializer;
  const deserializer = config.deserializer || DEFAULT_CONFIG.deserializer;
  const selector = config.selector || DEFAULT_CONFIG.selector;
  const merge = config.merge || DEFAULT_CONFIG.merge;
  const { migrate } = config;
  const { onRehydrateStorage } = config;

  return (api) => (next) => (partial) => {
    if (initialized) {
      toThenable(selector(api.getState())).then((data) => {
        toThenable(serializer({ state: data, version: config.version })).then((serialized) => {
          storage.setItem(config.name, serialized);
        });
      });
    } else {
      initialized = true;
      toThenable(storage.getItem(config.name)).then((serialized) => {
        if (serialized) {
          toThenable(deserializer(serialized)).then((deserialized) => {
            if (migrate && deserialized.version !== config.version) {
              toThenable(migrate(deserialized.state, deserialized.version as number)).then((migrated) => {
                toThenable(merge(migrated, api.getState())).then((merged) => {
                  api.setState(merged);
                  if (onRehydrateStorage) {
                    onRehydrateStorage({
                      getInitialState: () => api.initialState,
                      getState: api.getState,
                      setState: api.setState,
                    });
                  }
                });
              });
            } else {
              toThenable(merge(deserialized.state, api.getState())).then((merged) => {
                api.setState(merged);
                if (onRehydrateStorage) {
                  onRehydrateStorage({
                    getInitialState: () => api.initialState,
                    getState: api.getState,
                    setState: api.setState,
                  });
                }
              });
            }
          });
        }
      });
    }

    return next(partial);
  };
}
