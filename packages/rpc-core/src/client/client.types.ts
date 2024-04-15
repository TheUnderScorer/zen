import { OperationRequest } from '../shared/OperationRequest';
import { OperationResponse } from '../shared/OperationResponse';
import { Observable } from '../observable/Observable';

export type SendRequestFn<Ctx = unknown> = <Payload, Result>(
  request: OperationRequest<Payload, Ctx>,
  next: (
    request: OperationRequest<Payload, Ctx>
  ) => Promise<OperationResponse<Result, OperationRequest<Payload, Ctx>>>
) => Promise<OperationResponse<Result, OperationRequest<Payload, Ctx>>>;

export type SubscribeToEventFn<Ctx = unknown> = <Payload>(
  request: OperationRequest<unknown, Ctx>,
  next: (
    request: OperationRequest<unknown, Ctx>
  ) => Observable<
    OperationResponse<Payload, OperationRequest<unknown, Ctx>, Ctx>
  >
) => Observable<
  OperationResponse<Payload, OperationRequest<unknown, Ctx>, Ctx>
>;

export interface ClientLink<Ctx = unknown> {
  /**
   * Sends request to the receiver and returns a response.
   * */
  sendRequest?: SendRequestFn<Ctx>;

  /**
   * Subscribes to the receiver event and returns a subscription.
   * */
  subscribeToEvent?: SubscribeToEventFn<Ctx>;
}

export interface OperationEvent<Payload, Ctx> {
  payload: Payload;
  ctx: Ctx;
}
