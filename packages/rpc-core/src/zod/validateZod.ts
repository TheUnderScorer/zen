import { Schema, ZodError } from 'zod';
import { OperationDefinitionProperties } from '../schema/OperationDefinition';
import { MusubiZodError } from '../errors/MusubiZodError';

export function validateZod<T extends Schema>(
  schema: T,
  value: unknown,
  operation: OperationDefinitionProperties
) {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new MusubiZodError(error.errors, operation);
    }

    throw error;
  }
}
