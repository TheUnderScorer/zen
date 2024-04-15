import { MaybePromise } from '../shared/promise';
import { Subscription } from './Subscription';
import { SubscriptionFn } from '../shared/subscription.types';

type ObserverFn<T> = (value: T) => MaybePromise<void>;

export interface Observer<T> {
  next?: ObserverFn<T>;
  error?: ObserverFn<Error>;
  complete?: ObserverFn<void>;
}

export class Observable<T> {
  protected _isCompleted = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected parent?: Observable<any>;

  protected readonly observers = new Set<Observer<T>>();
  protected readonly subscribers = new Set<Subscription>();

  constructor(
    observer?: (
      observer: Required<Observer<T>>
    ) => MaybePromise<SubscriptionFn | Subscription | void>
  ) {
    void this.initObserver(observer);
  }

  private async initObserver(
    observer?: (
      observer: Required<Observer<T>>
    ) => MaybePromise<SubscriptionFn | Subscription | void>
  ) {
    const onDone = await observer?.({
      next: async (value) => {
        await this.next(value);
      },
      error: async (error) => {
        await this.error(error);
      },
      complete: async () => {
        await this.complete();
      },
    });

    if (onDone) {
      this.subscribers.add(
        onDone instanceof Subscription
          ? onDone
          : new Subscription(async () => onDone?.())
      );
    }
  }

  get observersSize() {
    return this.observers.size;
  }

  get subscribersSize() {
    return this.subscribers.size;
  }

  get isCompleted() {
    return this._isCompleted;
  }

  subscribe(observer: ObserverFn<T> | Observer<T>) {
    if (this._isCompleted) {
      return new Subscription(() => {
        // no-op
      });
    }

    const observerObject =
      typeof observer === 'function' ? { next: observer } : observer;

    this.observers.add(observerObject);

    const subscription = new Subscription(async () => {
      this.observers.delete(observerObject);
      this.subscribers.delete(subscription);
    });

    this.subscribers.add(subscription);

    return subscription;
  }

  /**
   * Creates a new observable that emits the same values as this observable, but separated from the parent.
   *
   * When using in receiver that returns observable, it is recommended to always call this first, so that when the receiver subscription is disposed, the root observable is not touched.
   * */
  lift() {
    const observable = this.map((value) => value);

    observable.parent = undefined;

    return observable;
  }

  filter(predicate: (value: T) => boolean) {
    const observable = new Observable<T>();
    observable.parent = this;

    this.subscribe({
      next: async (value) => {
        if (predicate(value)) {
          await observable.next(value);
        }
      },
      error: async (error) => {
        await observable.error(error);
      },
      complete: async () => {
        await observable.complete();
      },
    });

    return observable;
  }

  map<U>(transform: (value: T) => U) {
    const observable = new Observable<Awaited<U>>();
    observable.parent = this;

    this.subscribe({
      next: async (value) => {
        try {
          await observable.next(await transform(value));
        } catch (error) {
          await observable.error(error as Error);
        }
      },
      error: async (error) => {
        await observable.error(error);
      },
      complete: async () => {
        await observable.complete();
      },
    });

    return observable;
  }

  async next(value: T) {
    if (this._isCompleted) {
      return;
    }

    for (const observer of this.observers) {
      await observer.next?.(value);
    }
  }

  async complete() {
    if (this._isCompleted) {
      return;
    }

    for (const observer of this.observers) {
      await observer.complete?.();
    }

    this.observers.clear();

    this.subscribers.forEach((sub) => {
      sub.unsubscribe();
    });

    this._isCompleted = true;
  }

  /**
   * Completes this observable and all its parents
   * */
  async completeAll() {
    await this.complete();

    await this.parent?.completeAll();
  }

  async error(error: Error) {
    if (this._isCompleted) {
      return;
    }

    for (const observer of this.observers) {
      await observer.error?.(error);
    }
  }
}
