import { Handlers } from './handlers';
import {
  Observable,
  OperationKind,
  OperationName,
  OperationRequest,
  OperationResponse,
  ReceiverLink,
} from '@theunderscorer/rpc-core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class InMemoryReceiverLink<Ctx = any> implements ReceiverLink<Ctx> {
  constructor(readonly handlers: Handlers) {}

  async sendResponse<Payload, Result>(
    response: OperationResponse<Result, OperationRequest<Payload, Ctx>>
  ) {
    if (response.operationKind === OperationKind.Event) {
      await this.handlers.event.next(response);
    } else {
      await this.handlers.operationResult.next(response);
    }
  }

  receiveRequest(name: OperationName) {
    return this.handlers.operation
      .lift()
      .filter((req) => req.name === name) as Observable<
      OperationRequest<unknown, Ctx>
    >;
  }
}
