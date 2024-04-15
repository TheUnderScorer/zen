import { safeStringify } from './json';

describe('safeStringify', () => {
  it('should support circular references', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const circular: any = {
      a: true,
    };

    circular.b = circular;

    const result = safeStringify(circular);

    expect(result).toBe('{"a":true,"b":"[Circular]"}');
  });
});
