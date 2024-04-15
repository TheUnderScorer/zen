import {
  ReactHookForOperation,
  ReactOperationsSchema,
  UseCommandProperty,
  UseEventProperty,
  UseQueryProperty,
} from './hooks.types';
import { useQuery } from './hooks/useQuery';
import { useCommand } from './hooks/useCommand';
import { useEvent } from './hooks/useEvent';
import { useInfiniteQuery } from './hooks/useInfiniteQuery';
import {
  OperationsSchema,
  RpcOperationDefinition,
  RpcOperationKind,
  RpcOperationName,
} from '@theunderscorer/rpc-core';

export function createReactRpc<Schema extends OperationsSchema>(
  schema: Schema
): ReactOperationsSchema<Schema> {
  return createProxyForSchema(schema);
}

export function createProxyForSchema<Schema extends OperationsSchema>(
  schema: Schema
) {
  return new Proxy(
    {},
    {
      get: (_, p) => {
        const key = p.toString() as RpcOperationName;

        return Object.values(schema).reduce((acc, operations) => {
          const definition = operations[key] as
            | RpcOperationDefinition
            | undefined;

          if (definition) {
            const hook = buildHookForOperation(key, definition);

            if (hook) {
              Object.assign(acc, hook);
            }
          }

          return acc;
        }, {} as ReactHookForOperation<RpcOperationDefinition>);
      },
    }
  ) as ReactOperationsSchema<Schema>;
}

function buildHookForOperation(
  key: RpcOperationName,
  definition: RpcOperationDefinition
) {
  switch (definition.kind) {
    case RpcOperationKind.Query:
      return {
        useQuery: (options) => useQuery(key, options),
        useInfiniteQuery: (options) => useInfiniteQuery(key, options),
      } as UseQueryProperty<
        RpcOperationKind.Query,
        RpcOperationDefinition<RpcOperationKind.Query>
      >;

    case RpcOperationKind.Command:
      return {
        useCommand: (options) => useCommand(key, options),
      } as UseCommandProperty<
        RpcOperationKind.Command,
        RpcOperationDefinition<RpcOperationKind.Command>
      >;

    case RpcOperationKind.Event:
      return {
        useEvent: (handler, deps, channel) =>
          useEvent(key, handler, deps, channel),
      } as UseEventProperty<
        RpcOperationKind.Event,
        RpcOperationDefinition<RpcOperationKind.Event>
      >;

    default:
      return null;
  }
}
