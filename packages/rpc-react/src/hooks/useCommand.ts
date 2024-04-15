/* eslint-disable @typescript-eslint/no-explicit-any */
import { UseCommandOptions, UseCommandReturn } from '../hooks.types';
import { useQueryKey } from './useQueryKey';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRpcClient } from '../providers/RpcProvider';
import { RpcOperationName } from '@theunderscorer/rpc-core';

export function useCommand<Payload, Result>(
  name: RpcOperationName,
  options?: UseCommandOptions<Payload, Result>
) {
  const variables = options?.variables;
  const mutationKey = useQueryKey(name, variables);

  const queryClient = useQueryClient();
  const client = useRpcClient(options?.musubiContext);

  const query = useMutation<Result, Error, Payload>({
    ...options,
    onSuccess: async (result, payload) => {
      if (options?.invalidateQueries?.length) {
        await Promise.all(
          options.invalidateQueries.map((q) =>
            queryClient.invalidateQueries({
              queryKey: q,
            })
          )
        );
      }

      options?.onSuccess?.({
        payload,
        result,
        queryClient,
        rpcClient: client,
      });
    },

    mutationKey,
    mutationFn: async (variables) => {
      return client.command(name, variables, options?.channel);
    },
  });

  return {
    ...query,
    key: mutationKey,
  } as UseCommandReturn<Payload, Result>;
}
