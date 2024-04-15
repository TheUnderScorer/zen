import { EnvelopeContextEntry } from './context';
import { safeStringify } from '../utils/json';

export function serializeContext<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Ctx extends Record<string, EnvelopeContextEntry<any>>
>(ctx: Ctx) {
  return Object.entries(ctx).reduce((acc, [key, value]) => {
    if (!value?.isSerializable) {
      return acc;
    }

    return {
      ...acc,
      [key]: serializeValue(value.value),
    };
  }, {});
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeValue<Value>(ctx: Value): any {
  if (typeof ctx === 'number' || typeof ctx === 'string') {
    return ctx;
  }

  if (typeof ctx === 'object') {
    if (Array.isArray(ctx)) {
      return ctx.map(serializeValue);
    }

    return Object.entries(ctx as object).reduce((acc, [key, entry]) => {
      if (!entry) {
        return acc;
      }

      const serializedValue = serializeValue(entry);

      if (!serializedValue) {
        return acc;
      }

      return {
        ...acc,
        [key]: serializedValue,
      };
    }, {});
  }

  if (typeof ctx === 'function') {
    return '[function]';
  }

  try {
    return safeStringify(ctx);
  } catch (error) {
    return '[unserializable]';
  }
}
