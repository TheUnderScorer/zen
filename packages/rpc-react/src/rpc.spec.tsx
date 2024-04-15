import { createReactRpc } from './rpc';
import { RpcProvider } from './providers/RpcProvider';
import { QueryClient } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { PropsWithChildren, useState } from 'react';

import { z } from 'zod';
import {
  createRpc,
  defineRpcSchema,
  mergeSchemas,
  operation,
  Rpc,
} from '@theunderscorer/rpc-core';
import { setupTestUserHandlers, testSchema } from 'rpc-test-utils';
import { createInMemoryLink } from '@theunderscorer/rpc-in-memory-link';
import { wait } from '@theunderscorer/wait';

const PaginationSchema = z.object({
  start: z.number(),
  offset: z.number(),
});

const TestInfiniteQueryPayloadSchema = z.object({
  pagination: PaginationSchema,
});

const testReactSchema = mergeSchemas(
  testSchema,
  defineRpcSchema({
    queries: {
      testUndefinedToNull: operation.query,
      testInfiniteQuery: operation.query
        .needs(TestInfiniteQueryPayloadSchema)
        .returns(
          z.object({
            newPagination: PaginationSchema,
            items: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
              })
            ),
          })
        ),
    },
    commands: {},
    events: {},
  })
);

const m = createReactRpc(testReactSchema);

let queryClient: QueryClient;
let rpc: Rpc<typeof testReactSchema>;

function Wrapper(props: PropsWithChildren) {
  return (
    <RpcProvider queryClient={queryClient} client={rpc.client}>
      {props.children}
    </RpcProvider>
  );
}

beforeEach(() => {
  jest.resetAllMocks();

  const link = createInMemoryLink();

  queryClient = new QueryClient();

  rpc = createRpc({
    schema: testReactSchema,
    clientLinks: [link.client],
    receiverLinks: [link.receiver],
  });

  setupTestUserHandlers(rpc.receiver);
});

describe('useInfiniteQuery', () => {
  it('should pass page param correctly', async () => {
    const items = Array.from({ length: 100 }).map((_, i) => ({
      id: i.toString(),
      name: `Item ${i}`,
    }));

    const handler = jest.fn(
      ({ pagination }: z.infer<typeof TestInfiniteQueryPayloadSchema>) => {
        return {
          items: items.slice(
            pagination.start,
            pagination.start + pagination.offset
          ),
          newPagination: {
            start: pagination.start + pagination.offset,
            offset: pagination.offset,
          },
        };
      }
    );

    rpc.receiver.handleQuery('testInfiniteQuery', handler);

    const queryHook = renderHook(
      () =>
        m.testInfiniteQuery.useInfiniteQuery({
          pageParamKey: 'pagination',
          initialPageParam: {
            start: 0,
            offset: 10,
          },
          getNextPageParam: (lastPage) => lastPage.newPagination,
        }),
      {
        wrapper: Wrapper,
      }
    );

    const queryResult = await queryHook.result.current.refetch();
    expect(queryResult.data?.pages).toHaveLength(1);
    expect(queryResult.data?.pages?.[0].items).toHaveLength(10);
    expect(queryResult.data?.pages?.[0].items[9].id).toEqual('9');

    await act(async () => {
      await queryHook.result.current.fetchNextPage();
    });

    const queryResult2 = await queryHook.result.current.refetch();

    expect(queryResult2.data?.pages).toHaveLength(2);
    expect(queryResult2.data?.pages?.[1].items).toHaveLength(10);
    expect(queryResult2.data?.pages?.[1].items[9].id).toEqual('19');
  });
});

describe('useCommand, useQuery', () => {
  it('should convert undefined to null from queries', async () => {
    rpc.receiver.handleQuery('testUndefinedToNull', () => {
      return undefined;
    });

    const queryHook = renderHook(() => m.testUndefinedToNull.useQuery(), {
      wrapper: Wrapper,
    });
    const queryResult = await queryHook.result.current.refetch();

    expect(queryResult.data).toBeNull();
  });

  it('should work', async () => {
    const commandHook = renderHook(() => m.createUser.useCommand(), {
      wrapper: Wrapper,
    });

    const commandResult = await commandHook.result.current.mutateAsync({
      name: 'John',
    });
    expect(commandResult.name).toBe('John');

    const queryHook = renderHook(
      () =>
        m.getUser.useQuery({
          variables: {
            id: commandResult.id,
          },
        }),
      {
        wrapper: Wrapper,
      }
    );
    const queryResult = await queryHook.result.current.refetch();
    expect(queryResult.data).toEqual(commandResult);
    expect(queryResult.data?.name).toBeTruthy();
  });
});

describe('useEvent', () => {
  it('should subscribe to event and unsubscribe correctly on unmount', async () => {
    const handler = jest.fn();

    const orgObserveEvent = rpc.client.observeEvent.bind(rpc.client);

    let unsubCallCount = 0;

    jest.spyOn(rpc.client, 'observeEvent').mockImplementation((name) => {
      const observable = orgObserveEvent(name);

      const orgSubscribe = observable.subscribe.bind(observable);

      if (name === 'userCreated') {
        jest.spyOn(observable, 'subscribe').mockImplementation((handler) => {
          const subscription = orgSubscribe(handler);

          const orgUnsub = subscription.unsubscribe.bind(subscription);

          jest.spyOn(subscription, 'unsubscribe').mockImplementation(() => {
            unsubCallCount++;

            return orgUnsub();
          });

          return subscription;
        });
      }

      return observable;
    });

    const useMockHook = () => {
      const [count, setCount] = useState(0);

      m.userCreated.useEvent(
        (args) => {
          handler(args);

          // Changing count should cause the hook to unsubscribe to the event and subscribe again
          setCount(count + 1);
        },
        [count]
      );
    };

    const hook = renderHook(() => useMockHook(), {
      wrapper: Wrapper,
    });

    const commandHook = renderHook(() => m.createUser.useCommand(), {
      wrapper: Wrapper,
    });

    const user = await act(() =>
      commandHook.result.current.mutateAsync({
        name: 'John',
      })
    );

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({ payload: user, ctx: {} });

    // Trigger event again
    await act(() =>
      commandHook.result.current.mutateAsync({
        name: 'Greg',
      })
    );

    expect(handler).toHaveBeenCalledTimes(2);

    expect(unsubCallCount).toEqual(2);

    hook.unmount();

    expect(unsubCallCount).toEqual(3);
  });

  it('should support passing placeholder data to query', () => {
    const placeholderData = {
      id: '1234',
      name: 'John',
    } as const;

    const hook = renderHook(
      () =>
        m.getUser.useQuery({
          placeholderData,
        }),
      {
        wrapper: Wrapper,
      }
    );

    expect(hook.result.current.isPlaceholderData).toBe(true);
    expect(hook.result.current.data).toEqual(placeholderData);
  });

  it('should correctly receive events even when dependency changes', async () => {
    const handler = jest.fn();

    const useTestHook = async () => {
      const [count, setCount] = useState(0);

      m.userCreated.useEvent(() => {
        handler(count);

        setCount(count + 1);
      }, [count]);
    };

    renderHook(() => useTestHook(), {
      wrapper: Wrapper,
    });

    const commandHook = renderHook(() => m.createUser.useCommand(), {
      wrapper: Wrapper,
    });

    const mutate = async (waitMs = 5) => {
      await act(async () => {
        await commandHook.result.current.mutateAsync({
          name: 'John',
        });
      });

      await act(async () => {
        await wait(waitMs);
      });
    };

    await mutate();
    await mutate();
    await mutate();
    await mutate();
    await mutate();

    expect(handler).toHaveBeenCalledTimes(5);
    expect(handler).toHaveBeenNthCalledWith(1, 0);
    expect(handler).toHaveBeenNthCalledWith(2, 1);
    expect(handler).toHaveBeenNthCalledWith(3, 2);
    expect(handler).toHaveBeenNthCalledWith(4, 3);
    expect(handler).toHaveBeenNthCalledWith(5, 4);
  });
});
