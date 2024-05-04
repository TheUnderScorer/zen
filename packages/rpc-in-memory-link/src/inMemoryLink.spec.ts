import { createInMemoryLink } from './link';
import {
  command,
  defineRpcSchema,
  query,
  event,
  RpcClient,
  RpcReceiver,
  OperationHandler,
} from '@theunderscorer/rpc-core';
import { wait } from '@theunderscorer/wait';

describe('InMemoryLink', () => {
  const schema = defineRpcSchema({
    commands: {
      testCommand: command()
        .needs<{ test: string }>()
        .returns<{ test: string }>(),
    },
    queries: {
      testQuery: query().needs<{ test: string }>().returns<{ test: string }>(),
    },
    events: {
      testEvent: event().needs<{ test: string }>(),
    },
  });

  let client: RpcClient<typeof schema>;
  let receiver: RpcReceiver<typeof schema>;
  let link: ReturnType<typeof createInMemoryLink>;

  beforeEach(() => {
    link = createInMemoryLink();

    client = new RpcClient(schema, [link.client]);
    receiver = new RpcReceiver(schema, [link.receiver]);
  });

  it('should correctly dispose receiver subscriptions', async () => {
    const impl: OperationHandler<typeof schema.commands.testCommand> = async (
      payload
    ) => {
      return payload;
    };
    const handler = jest.fn(impl);

    const sub = receiver.handleCommand('testCommand', handler);

    let result = await client.command('testCommand', {
      test: 'test',
    });

    expect(result).toEqual({ test: 'test' });

    expect(link.handlers.registeredOperations).toContain('testCommand');

    await sub.unsubscribe();

    const promise = client.command('testCommand', {
      test: 'test',
    });

    await expect(promise).rejects.toThrow(
      'Operation handler for testCommand is not registered'
    );

    expect(link.handlers.registeredOperations).not.toContain('testCommand');

    // Restore handler
    receiver.handleCommand('testCommand', handler);

    result = await client.command('testCommand', {
      test: 'test',
    });

    expect(result).toEqual({ test: 'test' });
  });

  it('should send and receive commands', async () => {
    const impl: OperationHandler<typeof schema.commands.testCommand> = async (
      payload
    ) => {
      return payload;
    };
    const handler = jest.fn(impl);

    receiver.handleCommand('testCommand', handler);

    const result = await client.command('testCommand', {
      test: 'test',
    });

    expect(result).toEqual({ test: 'test' });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should send and receive queries', async () => {
    const impl: OperationHandler<typeof schema.queries.testQuery> = async (
      payload
    ) => {
      return payload;
    };
    const handler = jest.fn(impl);

    receiver.handleQuery('testQuery', handler);

    const result = await client.query('testQuery', {
      test: 'test',
    });

    expect(result).toEqual({ test: 'test' });

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should send and receive events', async () => {
    const handler = jest.fn();

    client.observeEvent('testEvent').subscribe(handler);

    await receiver.dispatchEvent('testEvent', {
      test: 'test',
    });

    await receiver.dispatchEvent('testEvent', {
      test: 'test1',
    });

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenCalledWith({
      payload: { test: 'test' },
      ctx: {},
    });
    expect(handler).toHaveBeenCalledWith({
      payload: { test: 'test1' },
      ctx: {},
    });
  });

  it('send command without registered handler', async () => {
    await expect(
      client.command('testCommand', {
        test: 'test',
      })
    ).rejects.toThrow('Operation handler for testCommand is not registered');
  });
});
