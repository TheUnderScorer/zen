import { OperationRequest } from '../shared/OperationRequest';
import { OperationResponse } from '../shared/OperationResponse';
import {
  ExtractPayload,
  ExtractResult,
  RpcOperationName,
} from '../schema/schema.types';
import { RpcOperationDefinition } from '../schema/RpcOperationDefinition';
import { MaybePromise } from '../shared/promise';
import { Observable } from '../observable/Observable';

export type ReceiveRequestFn<Ctx = unknown> = (
  name: RpcOperationName,
  next: (name: RpcOperationName) => Observable<OperationRequest<unknown, Ctx>>
) => Observable<OperationRequest<unknown, Ctx>>;

export type SendResponseFn<Ctx = unknown> = <Payload, Result>(
  response: OperationResponse<Result, OperationRequest<Payload, Ctx>, Ctx>,
  next: (
    response: OperationResponse<Result, OperationRequest<Payload, Ctx>, Ctx>
  ) => Promise<void>
) => Promise<void>;

export type ReceiverLink<Ctx = unknown> = {
  /**
   * This method is responsible for receiving requests that come from client
   *
   * @see {ClientLink}
   * */
  receiveRequest?: ReceiveRequestFn<Ctx>;

  /**
   * This method is responsible for sending responses to client.
   * It handles both operation responses and events.
   *
   * You can use `response.kind` to distinguish between them.
   * */
  sendResponse?: SendResponseFn<Ctx>;
};

export type OperationHandler<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  O extends RpcOperationDefinition<any, any, any, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Ctx = any
> = (payload: ExtractPayload<O>, ctx: Ctx) => MaybePromise<ExtractResult<O>>;
