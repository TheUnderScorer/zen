import { SubscriptionFn } from '../shared/subscription.types';

export class Subscription {
  private _isUnsubscribed = false;

  private readonly subscriptions = new Set<SubscriptionFn>();

  constructor(subscription: SubscriptionFn) {
    this.subscriptions.add(subscription);
  }

  get isUnsubscribed() {
    return this._isUnsubscribed;
  }

  add(subscription: SubscriptionFn) {
    this.subscriptions.add(subscription);

    return this;
  }

  async unsubscribe() {
    if (this._isUnsubscribed) {
      return;
    }

    for (const subscription of this.subscriptions) {
      await subscription();
    }

    this._isUnsubscribed = true;
    this.subscriptions.clear();
  }
}
