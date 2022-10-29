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

export function cloneObject(obj: any) {
  return JSON.parse(JSON.stringify(obj));
}

export const DEFAULT_SELECTOR: any = (state: any) => state;
