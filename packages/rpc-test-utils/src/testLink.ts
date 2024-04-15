import {
  ClientLink,
  Observable, OperationKind,
  OperationName,
  OperationRequest,
  OperationResponse,
  ReceiverLink
} from '@theunderscorer/rpc-core';


export function createTestLink() {
  const clientLink = {
    subscribeToEvent: jest.fn(),
    sendRequest: jest.fn(),
  } satisfies ClientLink;

  const receiverLink = {
    receiveRequest: jest.fn(),
    sendResponse: jest.fn(),
  } satisfies ReceiverLink;

  const newRequest = new Observable<OperationRequest>();
  const newResponse = new Observable<OperationResponse>();
  const newEvent = new Observable<OperationResponse>();

  receiverLink.receiveRequest.mockImplementation((name: OperationName) => {
    return newRequest.lift().filter((req) => req.name === name);
  });

  receiverLink.sendResponse.mockImplementation(
    async (response: OperationResponse) => {
      if (response.operationKind === OperationKind.Event) {
        await newEvent.next(response);
      } else {
        await newResponse.next(response);
      }
    }
  );

  clientLink.subscribeToEvent.mockImplementation(
    (request: OperationRequest) => {
      return newEvent
        .lift()
        .filter((res) => res.operationName === request.name);
    }
  );

  clientLink.sendRequest.mockImplementation((request) => {
    return new Promise((resolve) => {
      const sub = newResponse
        .lift()
        .filter((res) => res.request?.id === request.id)
        .subscribe(async (response) => {
          await sub.unsubscribe();

          resolve(response);
        });

      newRequest.next(request);
    });
  });

  return {
    clientLink,
    receiverLink,
  };
}
