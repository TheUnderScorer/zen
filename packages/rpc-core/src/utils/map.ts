/* eslint-disable @typescript-eslint/no-explicit-any */

type MappedValues<T, U> = {
  [K in keyof T]: U;
};

export function mapObject<T extends object, U>(
  obj: T,
  callback: <Key extends keyof T>(value: T[Key], key: Key) => U
): MappedValues<T, U> {
  const result = {} as MappedValues<T, U>;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const typedKey = key as keyof T;
      const value = obj[typedKey];
      result[typedKey] = callback(value, typedKey);
    }
  }

  return result;
}
