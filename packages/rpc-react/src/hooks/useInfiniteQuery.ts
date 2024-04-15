import {
  SetQueryDataFn,
  UseInfiniteQueryOptions,
  UseInfiniteQueryReturn,
} from '../hooks.types';
import { useQueryKey } from './useQueryKey';
import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery as _useInfiniteQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useRpcClient } from '../providers/RpcProvider';
import { useCallback } from 'react';
import { RpcOperationName } from '@theunderscorer/rpc-core';

export function useInfiniteQuery<
  Payload,
  Result,
  PageParam extends keyof Payload
>(
  name: RpcOperationName,
  options: UseInfiniteQueryOptions<Payload, Result, PageParam>
) {
  const variables = options?.variables;
  const queryKey = useQueryKey(name, variables);

  const queryClient = useQueryClient();
  const client = useRpcClient(options?.musubiContext);

  const query = _useInfiniteQuery<
    Result,
    Error,
    InfiniteData<Result>,
    QueryKey,
    PageParam
  >({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(options as UseInfiniteQueryOptions<any, any, any>),
    queryKey,

    queryFn: async (params) => {
      const result = await client.query(
        name,
        {
          ...options?.variables,
          [options.pageParamKey]:
            'pageParam' in params
              ? params.pageParam
              : options?.variables?.[options.pageParamKey],
        },
        options?.channel
      );

      return result === undefined ? null : result;
    },
  });

  const setQueryData = useCallback<SetQueryDataFn<Result>>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data) => {
      queryClient.setQueryData(queryKey, data);
    },
    [queryClient, queryKey]
  );

  const cancel = useCallback(async () => {
    await queryClient.cancelQueries({
      queryKey,
    });
  }, [queryKey, queryClient]);

  return {
    ...query,
    key: queryKey,
    setQueryData,
    cancel,
  } as UseInfiniteQueryReturn<Result>;
}
