import { Handlers } from './handlers';
import {
  ClientLink,
  Observable,
  OperationRequest,
  OperationResponse,
} from '@theunderscorer/rpc-core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class InMemoryClientLink<Ctx = any> implements ClientLink<Ctx> {
  constructor(readonly handlers: Handlers) {}

  subscribeToEvent<Payload>(request: OperationRequest<unknown, Ctx>) {
    return this.handlers.event
      .lift()
      .filter((event) => event.operationName === request.name) as Observable<
      OperationResponse<Payload, OperationRequest<unknown, Ctx>, Ctx>
    >;
  }

  sendRequest<Payload, Result>(
    request: OperationRequest<Payload, Ctx>
  ): Promise<OperationResponse<Result, OperationRequest<Payload, Ctx>>> {
    return new Promise((resolve) => {
      const subscription = this.handlers.operationResult.subscribe(
        (response) => {
          if (response.request?.id === request.id) {
            subscription.unsubscribe();
            resolve(
              response as OperationResponse<
                Result,
                OperationRequest<Payload, Ctx>
              >
            );
          }
        }
      );

      this.handlers.operation.next(request);
    });
  }
}
