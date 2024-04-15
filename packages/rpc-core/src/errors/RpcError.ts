import { OperationDefinitionProperties } from '../schema/OperationDefinition';

export class RpcError extends Error {
  constructor(
    message: string,
    readonly operation: OperationDefinitionProperties
  ) {
    super(message);
  }
}
