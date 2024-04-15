import { mergeSchemas } from '../schema/schemaHelpers';
import { testPostSchema, testUserSchema } from 'tools/test/testSchemas';
import { createTestLink } from 'tools/test/testLink';
import { MusubiReceiver } from './MusubiReceiver';
import { MusubiClient } from '../client/MusubiClient';
import { OperationBeforeMiddleware } from './OperationReceiverBuilder';
import { OperationDefinition } from '../schema/OperationDefinition';
import { MusubiZodError } from '../errors/MusubiZodError';
import { wait } from '../utils/wait';

const schema = mergeSchemas(testUserSchema, testPostSchema);

describe('MusubiReceiver', () => {
  let receiverLink: ReturnType<typeof createTestLink>['receiverLink'];
  let clientLink: ReturnType<typeof createTestLink>['clientLink'];

  beforeEach(() => {
    jest.clearAllMocks();

    const link = createTestLink();

    receiverLink = link.receiverLink;
    clientLink = link.clientLink;
  });

  it('should validate result', async () => {
    const receiver = new MusubiReceiver(schema, [receiverLink]);

    receiver.handleCommand(
      'createUser',
      async (payload) =>
        ({
          nam: payload.name,
          id: '1',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
    );

    const client = new MusubiClient(schema, [clientLink]);

    await expect(
      client.command('createUser', { name: 'test' })
    ).rejects.toThrow(MusubiZodError);
  });

  it('should receive channel from client', async () => {
    const channel = {
      test: true,
    };

    const receiver = new MusubiReceiver(schema, [
      {
        receiveRequest: (name, next) => {
          const observable = next(name);

          observable.subscribe((request) => {
            expect(request.channel).toBe(channel);
          });

          return observable;
        },
      },
      receiverLink,
    ]);

    receiver.handleCommand('createUser', async (payload) => ({
      name: payload.name,
      id: '1',
    }));

    const client = new MusubiClient(schema, [clientLink]);

    await client.command('createUser', { name: 'test' }, channel);
  });

  it('should support multiple links for sending response', async () => {
    const onSend = jest.fn();

    const receiver = new MusubiReceiver(schema, [
      {
        sendResponse: async (response, next) => {
          onSend(response.unwrap());

          await next(response);
        },
      },
      receiverLink,
    ]);

    receiver.handleCommand('createUser', async (payload) => ({
      name: payload.name,
      id: '1',
    }));

    const client = new MusubiClient(schema, [clientLink]);

    const result = await client.command('createUser', { name: 'test' });

    expect(onSend).toHaveBeenCalledTimes(1);
    expect(onSend).toHaveBeenCalledWith(result);
  });

  it('should support multiple async links', async () => {
    const onUnsub = jest.fn();

    const receiver = new MusubiReceiver(schema, [
      {
        receiveRequest: (name, next) => {
          const obs = next(name);

          const sub = obs.subscribe(() => {
            // no-op
          });

          sub.add(onUnsub);

          return obs.map(async (req) => {
            await wait(500);

            req.addCtx({
              didWait: {
                value: true,
                isSerializable: true,
              },
            });

            return req;
          });
        },
      },
      receiverLink,
    ]);

    const sub = receiver.handleCommand('createUser', async (payload, ctx) => {
      expect(ctx.didWait).toBeTruthy();

      return {
        name: payload.name,
        id: '1',
      };
    });

    const client = new MusubiClient(schema, [clientLink]);

    const result = await client.command('createUser', { name: 'test' });

    expect(result).toBeTruthy();

    await sub.unsubscribe();

    expect(onUnsub).toHaveBeenCalledTimes(1);
  });

  describe('Operation Builder', () => {
    it('should pass result to middleware after', async () => {
      const client = new MusubiClient(schema, [clientLink]);

      const receiver = new MusubiReceiver<typeof schema, { fromLink: true }>(
        schema,
        [receiverLink]
      );

      receiver
        .handleQueryBuilder('getPost')
        .runAfter(({ data }) => {
          expect(data.error).toBeNull();

          if (!data.error) {
            expect(data.result.id).toBe('1');
            expect(data.result.title).toBe('test');
          }
        })
        .withHandler((payload) => {
          return {
            id: payload.id,
            title: 'test',
          };
        })
        .register();

      const result = await client.query('getPost', { id: '1' });

      expect(result).toEqual({
        id: '1',
        title: 'test',
      });
    });

    it('should pass error from middleware before', async () => {
      const client = new MusubiClient(schema, [clientLink]);

      const receiver = new MusubiReceiver<typeof schema, { fromLink: true }>(
        schema,
        [receiverLink]
      );

      const runAfter = jest.fn();
      const nextMiddleware = jest.fn();
      const handler = jest.fn();

      receiver
        .handleQueryBuilder('getPost')
        .runBefore(() => {
          throw new Error('Middleware thrown error');
        })
        .runBefore(nextMiddleware)
        .runAfter(({ data, operation }) => {
          expect(operation).toEqual(schema.queries.getPost);
          expect(data.error).toBeTruthy();

          if (data.error) {
            expect(data.error.message).toBe('Middleware thrown error');
          }

          runAfter();
        })
        .withHandler(handler)
        .register();

      await expect(client.query('getPost', { id: '1' })).rejects.toThrow(
        'Middleware thrown error'
      );

      expect(handler).toHaveBeenCalledTimes(0);
      expect(runAfter).toHaveBeenCalledTimes(1);
      expect(nextMiddleware).toHaveBeenCalledTimes(0);
    });

    it('should pass error to middleware after if handler throws', async () => {
      const client = new MusubiClient(schema, [clientLink]);

      const receiver = new MusubiReceiver<typeof schema, { fromLink: true }>(
        schema,
        [receiverLink]
      );

      receiver
        .handleQueryBuilder('getPost')
        .runAfter(({ data, operation }) => {
          expect(operation).toEqual(schema.queries.getPost);
          expect(data.error).toBeTruthy();

          if (data.error) {
            expect(data.error.message).toBe('Post not found');
          }
        })
        .withHandler(() => {
          throw new Error('Post not found');
        })
        .register();

      await expect(client.query('getPost', { id: '1' })).rejects.toThrow(
        'Post not found'
      );
    });

    it('should support altering context for middleware before', async () => {
      const client = new MusubiClient(schema, [clientLink]);

      const receiver = new MusubiReceiver<typeof schema, { fromLink: true }>(
        schema,
        [
          {
            receiveRequest: (name, next) => {
              return next(name).map((request) => {
                request.addCtx({
                  fromLink: {
                    isSerializable: true,
                    value: true,
                  },
                });

                return request;
              });
            },
          },
          receiverLink,
        ]
      );

      const middleware =
        <
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Operation extends OperationDefinition<any, any, any, any>,
          Ctx
        >(): OperationBeforeMiddleware<
          Operation,
          Ctx,
          Ctx & { fromMiddleware: true }
        > =>
        ({ ctx, operation }) => {
          expect(operation).toEqual(schema.commands.createUser);

          return {
            ...ctx,
            fromMiddleware: true,
          };
        };

      receiver
        .handleCommandBuilder('createUser')
        .runBefore(middleware())
        .runBefore(({ ctx }) => {
          expect(ctx.fromLink).toBe(true);
          expect(ctx.fromMiddleware).toBe(true);

          return {
            ...ctx,
            fromSecondMiddleware: true,
          };
        })
        .withHandler(async (payload, ctx) => {
          expect(ctx.fromLink).toBe(true);
          expect(ctx.fromMiddleware).toBe(true);
          expect(ctx.fromSecondMiddleware).toBe(true);
          return {
            id: '1',
            name: payload.name,
          };
        })
        .register();

      const user = await client.command('createUser', {
        name: 'test',
      });

      expect(user).toEqual({
        id: '1',
        name: 'test',
      });
    });
  });
});
