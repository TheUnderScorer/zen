import { MaybePromise } from '@theunderscorer/promise-utils';

export interface Disposable {
  // Disposes the object
  dispose: () => MaybePromise<void>;
}
