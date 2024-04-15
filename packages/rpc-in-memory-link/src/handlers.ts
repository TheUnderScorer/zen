/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Observable,
  OperationRequest,
  OperationResponse,
} from '@theunderscorer/rpc-core';

export type EventHandler<Ctx = any> = <Payload>(
  request: OperationRequest<Payload, Ctx>
) => Promise<void>;

export function createHandlers() {
  return {
    operation: new Observable<OperationRequest>(),
    operationResult: new Observable<OperationResponse>(),
    event: new Observable<OperationResponse>(),
  };
}

export type Handlers = ReturnType<typeof createHandlers>;
