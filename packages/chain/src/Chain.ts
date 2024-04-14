/* eslint-disable @typescript-eslint/no-explicit-any */
type SkipLast<T extends any[]> = T extends [...infer R, any] ? R : never;

export class Chain<T extends (...args: any[]) => any | Promise<any>> {
  private readonly callbacks: T[] = [];

  use(...callbacks: T[]) {
    this.callbacks.push(...callbacks);

    return this;
  }

  exec(...args: SkipLast<Parameters<T>>): ReturnType<T> {
    const runCallback = (index: number) => {
      if (index >= this.callbacks.length) {
        return () => undefined;
      }

      return (...args: any[]): Promise<any> => {
        const middleware = this.callbacks[index];

        return middleware(...args, runCallback(index + 1));
      };
    };

    return runCallback(0)(...args) as any;
  }
}
