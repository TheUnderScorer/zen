import { Schema, ZodError } from 'zod';
import { OperationDefinitionProperties } from '../schema/OperationDefinition';
import { RpcZodError } from '../errors/RpcZodError';

export function validateZod<T extends Schema>(
  schema: T,
  value: unknown,
  operation: OperationDefinitionProperties
) {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new RpcZodError(error.errors, operation);
    }

    throw error;
  }
}
