// JSON.stringify with circular references
export function safeStringify<T>(obj: T) {
  const cache = new WeakSet();

  return JSON.stringify(obj, (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular]';
      }
      cache.add(value);
    }

    return value;
  });
}
