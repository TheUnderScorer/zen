import { OperationKind, OperationName, OperationsSchema } from './schema.types';
import { ZodSchema } from 'zod';
import { validateZod } from '../zod/validateZod';

export function validatePayload<S extends OperationsSchema, P>(
  schema: S,
  kind: OperationKind,
  name: OperationName,
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
  kind: OperationKind,
  name: OperationName,
  result: R
) {
  const operationKey = resolveSchemaKey(kind);

  const definition = schema[operationKey][name];

  if (definition.result instanceof ZodSchema) {
    return validateZod(definition.result, result, definition);
  }

  return result;
}

export function resolveSchemaKey(kind: OperationKind): keyof OperationsSchema {
  switch (kind) {
    case OperationKind.Command:
      return 'commands';

    case OperationKind.Query:
      return 'queries';

    case OperationKind.Event:
      return 'events';

    default:
      throw new TypeError(`Unknown operation kind: ${kind}`);
  }
}
