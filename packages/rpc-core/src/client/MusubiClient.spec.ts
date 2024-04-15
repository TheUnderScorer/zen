import { MusubiClient } from './MusubiClient';
import { OperationResponse } from '../shared/OperationResponse';
import { MusubiReceiver } from '../receiver/MusubiReceiver';
import { mergeSchemas } from '../schema/schemaHelpers';
import { testPostSchema, testUserSchema } from 'tools/test/testSchemas';
import { createTestLink } from 'tools/test/testLink';
import { MusubiZodError } from '../errors/MusubiZodError';

const schema = mergeSchemas(testUserSchema, testPostSchema);

let receiverLink: ReturnType<typeof createTestLink>['receiverLink'];
let clientLink: ReturnType<typeof createTestLink>['clientLink'];

describe('MusubiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    const link = createTestLink();

    receiverLink = link.receiverLink;
    clientLink = link.clientLink;
  });

  it('should validate payload', async () => {
    const receiver = new MusubiReceiver(schema, [receiverLink]);

    receiver.handleCommand('createUser', async (payload) => ({
      name: payload.name,
      id: '1',
    }));

    const client = new MusubiClient(schema, [clientLink]);

    await expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      client.command('createUser', { invalid: 'test' } as any)
    ).rejects.toThrow(MusubiZodError);
  });

  it('should send channel in request', async () => {
    const channel = {
      test: true,
    };

    const receiver = new MusubiReceiver(schema, [receiverLink]);

    receiver.handleCommand('createUser', async (payload) => ({
      name: payload.name,
      id: '1',
    }));

    const client = new MusubiClient(schema, [
      {
        sendRequest: async (request, next) => {
          expect(request.channel).toBe(channel);

          const response = await next(request);

          expect(response).toBeInstanceOf(OperationResponse);
          expect(response.channel).toBe(channel);

          return response;
        },
      },
      clientLink,
    ]);

    await client.command('createUser', { name: 'test' }, channel);
  });

  it('should support multiple links', async () => {
    const receiver = new MusubiReceiver(schema, [receiverLink]);

    receiver.handleCommand('createUser', async (payload) => ({
      name: payload.name,
      id: '1',
    }));

    const client = new MusubiClient(schema, [
      {
        sendRequest: async (request, next) => {
          const response = await next(request);

          expect(response).toBeInstanceOf(OperationResponse);

          return response;
        },
      },
      clientLink,
    ]);

    await client.command('createUser', {
      name: 'Test',
    });
  });

  it('should support multiple links on error', async () => {
    const error = new Error('test');
    const receiver = new MusubiReceiver(schema, [receiverLink]);

    receiver.handleCommand('createUser', async () => {
      throw error;
    });

    const client = new MusubiClient(schema, [
      {
        sendRequest: async (request, next) => {
          const response = await next(request);

          expect(response).toBeInstanceOf(OperationResponse);
          expect(response.error).toBe(error);
          expect(response.result).toBeNull();

          return response;
        },
      },
      clientLink,
    ]);

    await expect(
      client.command('createUser', {
        name: 'Test',
      })
    ).rejects.toThrow(error);
  });

  it('should support multiple links for events', async () => {
    const onLinkEvent = jest.fn();
    const onEvent = jest.fn();

    const onTeardown = jest.fn();

    const receiver = new MusubiReceiver(schema, [receiverLink]);

    const client = new MusubiClient(schema, [
      {
        subscribeToEvent: (request, next) => {
          const obs = next(request);

          const sub = obs.subscribe((event) => {
            expect(event).toBeInstanceOf(OperationResponse);

            onLinkEvent(event);
          });

          sub.add(onTeardown);

          obs.subscribe({
            complete: () => {
              sub.unsubscribe();
            },
          });

          return obs;
        },
      },
      {
        subscribeToEvent: (request, next) => {
          const obs = next(request);

          const sub = obs.subscribe((event) => {
            onLinkEvent(event);
          });

          sub.add(onTeardown);

          obs.subscribe({
            complete: () => {
              sub.unsubscribe();
            },
          });

          return obs;
        },
      },
      clientLink,
    ]);

    const eventObservable = client.observeEvent('postCreated');
    const subscription = eventObservable.subscribe(onEvent);

    const payload = {
      id: '1',
      title: '1',
    };

    await receiver.dispatchEvent('postCreated', payload);
    await receiver.dispatchEvent('postCreated', payload);
    await receiver.dispatchEvent('postCreated', payload);

    expect(onLinkEvent).toHaveBeenCalledTimes(6);
    expect(onEvent).toHaveBeenCalledTimes(3);
    expect(onEvent).toHaveBeenCalledWith({
      payload,
      ctx: {},
    });

    await eventObservable.completeAll();

    expect(subscription.isUnsubscribed).toBe(true);

    expect(onTeardown).toHaveBeenCalledTimes(2);

    await receiver.dispatchEvent('postCreated', payload);

    expect(onTeardown).toHaveBeenCalledTimes(2);
    expect(onLinkEvent).toHaveBeenCalledTimes(6);
    expect(onEvent).toHaveBeenCalledTimes(3);
    expect(onEvent).toHaveBeenCalledWith({ payload, ctx: {} });
  });
});
