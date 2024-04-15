import { ZodError } from 'zod';
import { OperationDefinitionProperties } from '../schema/OperationDefinition';

export class RpcZodError extends ZodError {
  constructor(
    errors: ZodError['errors'],
    readonly operation: OperationDefinitionProperties
  ) {
    super(errors);
  }
}
