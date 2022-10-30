import cloneDeep from 'lodash/cloneDeep';

export const DEFAULT_SELECTOR: any = (state: any) => state;

export function shallowCompare<A, B>(a: A | B, b: B | A): boolean {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  const len = aKeys.length;

  if (bKeys.length !== len) {
    return false;
  }

  for (let i = 0; i < len; i++) {
    const key = aKeys[i];

    if ((a as any)[key] !== (b as any)[key] || !Object.prototype.hasOwnProperty.call(b, key)) {
      return false;
    }
  }

  return true;
}

export function cloneObject<T>(obj: T): T {
  return cloneDeep(obj);
}

export type Full<T> = {
  [P in keyof T]-?: T[P];
};

export function runAsync(callback: () => void) {
  return new Promise<void>((resolve) => {
    callback();
    resolve();
  });
}
