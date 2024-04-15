import { Observable } from './Observable';
import { wait } from '../utils/wait';

describe('Observable', () => {
  it('passes observable in constructor', async () => {
    const done = jest.fn();

    const observable = new Observable<number>(async (observer) => {
      observer.next(5);

      await wait(200);

      observer.next(5);

      wait(200).then(() => {
        observer.complete();
      });

      return () => {
        done();
      };
    });

    const sub = jest.fn();

    observable.subscribe(sub);

    await wait(200);

    expect(sub).toBeCalledWith(5);

    await wait(200);

    expect(done).toBeCalled();
  });

  it('passes value to subscribers', async () => {
    const obs = new Observable<number>();

    const sub = jest.fn();

    obs.subscribe(sub);

    await obs.next(1);
    await obs.next(2);

    expect(sub).toBeCalledTimes(2);
  });

  it('does not call unsubscribed subscribers', () => {
    const obs = new Observable<number>();

    const sub = jest.fn();

    const unsub = obs.subscribe(sub);

    unsub.unsubscribe();

    obs.next(1);

    expect(sub).not.toBeCalled();
  });

  it('when completed it passed this to child observables', async () => {
    const obs = new Observable<number>();
    const child1 = obs.map((v) => v * 2);
    const child2 = child1.map((v) => v / 2);

    const sub = jest.fn();

    child2.subscribe(sub);

    await obs.next(2);

    expect(sub).toBeCalledWith(2);

    expect(child2.subscribersSize).toBe(1);
    expect(child2.observersSize).toBe(1);

    await obs.complete();

    expect(obs.isCompleted).toBe(true);
    expect(child1.isCompleted).toBe(true);
    expect(child2.isCompleted).toBe(true);

    await obs.next(2);

    expect(sub).toBeCalledTimes(1);
    expect(child2.observersSize).toBe(0);
    expect(child2.subscribersSize).toBe(0);
  });

  describe('calling .next() returns promise that resolves once all subscribers have finished', () => {
    it('with operators', async () => {
      const obs = new Observable<number>();
      const child1 = obs.map((v) => v * 2);
      const child2 = child1.map((v) => v / 2);

      const sub = jest.fn();

      child2.subscribe(async (v) => {
        await wait(200);

        sub(v);
      });

      await obs.next(2);

      expect(sub).toBeCalledWith(2);
    });

    it('in sequence', async () => {
      const obs = new Observable<number>();

      const sub = jest.fn();

      obs.subscribe(async () => {
        await wait(100);

        sub();
      });

      obs.subscribe(async () => {
        await wait(100);

        sub();
      });

      await obs.next(1);
      await obs.next(2);

      expect(sub).toBeCalledTimes(4);
    });

    it('in parallel', async () => {
      const obs = new Observable<number>();

      const sub = jest.fn();

      obs.subscribe(async () => {
        await wait(100);

        sub();
      });

      obs.subscribe(async () => {
        await wait(100);

        sub();
      });

      await Promise.all([obs.next(1), obs.next(2)]);

      expect(sub).toBeCalledTimes(4);
    });
  });
});
