import { MaybePromise } from './promise';

export type SubscriptionFn = () => MaybePromise<void>;
