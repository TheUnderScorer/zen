/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  InfiniteData,
  QueryClient,
  QueryKey,
  UseInfiniteQueryOptions as _UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions as _UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import { RpcProviderProps } from './providers/RpcProvider';
import {
  Channel,
  ExtractPayload,
  ExtractResult,
  ExtractZod,
  OperationEvent,
  OperationsSchema,
  RpcClient,
  RpcOperationDefinition,
  RpcOperationKind,
} from '@theunderscorer/rpc-core';

export type ReactOperationsSchema<S extends OperationsSchema> = {
  [Key in keyof S['commands']]: ReactHookForOperation<S['commands'][Key]>;
} & {
  [Key in keyof S['queries']]: ReactHookForOperation<S['queries'][Key]>;
} & {
  [Key in keyof S['events']]: ReactHookForOperation<S['events'][Key]>;
};

export type ReactHookForOperation<
  Operation extends RpcOperationDefinition<any>
> = Operation extends RpcOperationDefinition<infer Kind, any, any, any, any>
  ? ReactHookForOperationKind<Kind, Operation>
  : never;

export interface UseQueryProperty<
  Kind extends RpcOperationKind.Query,
  Operation extends RpcOperationDefinition<Kind>
> {
  useQuery: UseQueryFn<ExtractPayload<Operation>, ExtractResult<Operation>>;
  useInfiniteQuery: UseInfiniteQueryFn<
    ExtractPayload<Operation>,
    ExtractResult<Operation>
  >;
}

export interface UseCommandProperty<
  Kind extends RpcOperationKind.Command,
  Operation extends RpcOperationDefinition<Kind>
> {
  useCommand: UseCommandFn<ExtractPayload<Operation>, ExtractResult<Operation>>;
}

export interface UseEventProperty<
  Kind extends RpcOperationKind.Event,
  Operation extends RpcOperationDefinition<Kind>
> {
  useEvent: UseEventFn<ExtractPayload<Operation>, unknown>;
}

export type ReactHookForOperationKind<
  Kind extends RpcOperationKind,
  Operation extends RpcOperationDefinition<Kind>
> = Kind extends RpcOperationKind.Query
  ? UseQueryProperty<Kind, Operation>
  : Kind extends RpcOperationKind.Command
  ? UseCommandProperty<Kind, Operation>
  : Kind extends RpcOperationKind.Event
  ? UseEventProperty<Kind, Operation>
  : never;

export interface OnCommandSuccessParams<
  Payload,
  Result,
  S extends OperationsSchema = OperationsSchema
> {
  payload: Payload;
  result: Result;
  queryClient: QueryClient;
  rpcClient: RpcClient<S>;
}

export interface UseCommandOptions<Payload, Result>
  extends Omit<UseMutationOptions<Result, Error, Payload>, 'onSuccess'> {
  variables?: ExtractZod<Payload>;
  channel?: Channel;
  musubiContext?: RpcProviderProps['Context'];
  invalidateQueries?: QueryKey[];
  onSuccess?: (params: OnCommandSuccessParams<Payload, Result>) => unknown;
}

export type UseCommandReturn<Payload, Result> = UseMutationResult<
  ExtractZod<Result>,
  Error,
  ExtractZod<Payload>
> & {
  key: QueryKey;
};

export interface QueryOptionsExtra<Payload> {
  variables?: ExtractZod<Payload>;
  channel?: Channel;
  musubiContext?: RpcProviderProps['Context'];
}

export interface UseQueryOptions<Payload, Result>
  extends Omit<
      _UseQueryOptions<ExtractZod<Result>, Error, ExtractZod<Result>>,
      'queryFn' | 'queryKey'
    >,
    QueryOptionsExtra<Payload> {}

export interface UseInfiniteQueryOptions<
  Payload,
  Result,
  PageParamKey extends keyof Payload = keyof Payload
> extends Omit<
      _UseInfiniteQueryOptions<
        ExtractZod<Result>,
        Error,
        ExtractZod<Result>,
        ExtractZod<Result>,
        QueryKey,
        Payload[PageParamKey]
      >,
      'queryKey' | 'queryFn'
    >,
    QueryOptionsExtra<Omit<Payload, PageParamKey>> {
  pageParamKey: PageParamKey;
}

export interface QueryReturnExtra<Result> {
  key: QueryKey;
  setQueryData: SetQueryDataFn<Result>;
  cancel: () => Promise<void>;
}

export type UseQueryReturn<Result> = UseQueryResult<ExtractZod<Result>, Error> &
  QueryReturnExtra<Result>;

export type UseInfiniteQueryReturn<Result> = UseInfiniteQueryResult<
  InfiniteData<ExtractZod<Result>>,
  Error
> &
  QueryReturnExtra<Result>;

export type UseQueryFn<Payload, Result> = (
  options?: UseQueryOptions<Payload, Result>
) => UseQueryReturn<Result>;

export type UseInfiniteQueryFn<Payload, Result> = <
  PageParam extends keyof Payload = keyof Payload
>(
  options: UseInfiniteQueryOptions<Payload, Result, PageParam>
) => UseInfiniteQueryReturn<Result>;

export type UseCommandFn<Payload, Result> = (
  options?: UseCommandOptions<Payload, Result>
) => UseCommandReturn<Payload, Result>;

export type UseEventFn<Payload, Ctx> = (
  handler: (payload: OperationEvent<Payload, Ctx>) => void,
  deps?: unknown[],
  channel?: Channel
) => void;

export interface SetQueryDataFn<Data> {
  (data: Data): void;

  (updater: (prevData?: Data) => Data | undefined): void;
}
