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

  beforeEach(() => {
    const links = createInMemoryLink();

    client = new RpcClient(schema, [links.client]);
    receiver = new RpcReceiver(schema, [links.receiver]);
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

    await sub.unsubscribe();

    const promise = Promise.race([
      client.command('testCommand', {
        test: 'test',
      }),
      wait(1000).then(() => {
        throw new Error('Timeout');
      }),
    ]);

    await expect(promise).rejects.toThrow('Timeout');

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
});
