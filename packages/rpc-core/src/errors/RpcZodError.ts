import { ZodError } from 'zod';
import { RpcOperationDefinitionProperties } from '../schema/RpcOperationDefinition';

export class RpcZodError extends ZodError {
  constructor(
    errors: ZodError['errors'],
    readonly operation: RpcOperationDefinitionProperties
  ) {
    super(errors);
  }
}
