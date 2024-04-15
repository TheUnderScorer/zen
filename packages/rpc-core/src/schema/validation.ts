import {
  RpcOperationKind,
  RpcOperationName,
  OperationsSchema,
} from './schema.types';
import { ZodSchema } from 'zod';
import { validateZod } from '../zod/validateZod';

export function validatePayload<S extends OperationsSchema, P>(
  schema: S,
  kind: RpcOperationKind,
  name: RpcOperationName,
  payload: P
) {
  const operationKey = resolveSchemaKey(kind);

  const definition = schema[operationKey][name];

  if (definition.payload instanceof ZodSchema) {
    return validateZod(definition.payload, payload, definition);
  }

  return payload;
}

export function validateResult<S extends OperationsSchema, R>(
  schema: S,
  kind: RpcOperationKind,
  name: RpcOperationName,
  result: R
) {
  const operationKey = resolveSchemaKey(kind);

  const definition = schema[operationKey][name];

  if (definition.result instanceof ZodSchema) {
    return validateZod(definition.result, result, definition);
  }

  return result;
}

export function resolveSchemaKey(
  kind: RpcOperationKind
): keyof OperationsSchema {
  switch (kind) {
    case RpcOperationKind.Command:
      return 'commands';

    case RpcOperationKind.Query:
      return 'queries';

    case RpcOperationKind.Event:
      return 'events';

    default:
      throw new TypeError(`Unknown operation kind: ${kind}`);
  }
}
