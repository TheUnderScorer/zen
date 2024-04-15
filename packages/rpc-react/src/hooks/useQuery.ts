/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery as _useQuery, useQueryClient } from '@tanstack/react-query';
import {
  SetQueryDataFn,
  UseQueryOptions,
  UseQueryReturn,
} from '../hooks.types';
import { useQueryKey } from './useQueryKey';
import { useRpcClient } from '../providers/RpcProvider';
import { useCallback } from 'react';
import { RpcOperationName } from '@theunderscorer/rpc-core';

export function useQuery<Payload, Result>(
  name: RpcOperationName,
  options?: UseQueryOptions<Payload, Result>
) {
  const variables = options?.variables;
  const queryKey = useQueryKey(name, variables);

  const queryClient = useQueryClient();
  const client = useRpcClient(options?.musubiContext);

  const query = _useQuery<Result, Error, Payload>({
    ...(options as UseQueryOptions<any, any>),
    queryKey,
    queryFn: async () => {
      const result = await client.query(
        name,
        options?.variables,
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
  } as UseQueryReturn<Result>;
}
