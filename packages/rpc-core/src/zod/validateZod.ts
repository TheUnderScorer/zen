import { Schema, ZodError } from 'zod';
import { RpcOperationDefinitionProperties } from '../schema/RpcOperationDefinition';
import { RpcZodError } from '../errors/RpcZodError';

export function validateZod<T extends Schema>(
  schema: T,
  value: unknown,
  operation: RpcOperationDefinitionProperties
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
