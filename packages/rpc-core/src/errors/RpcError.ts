import { RpcOperationDefinitionProperties } from '../schema/RpcOperationDefinition';

export class RpcError extends Error {
  constructor(
    message: string,
    readonly operation: RpcOperationDefinitionProperties
  ) {
    super(message);
  }
}
