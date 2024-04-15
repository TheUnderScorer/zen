import { OperationDefinitionProperties } from '../schema/OperationDefinition';

export class MusubiError extends Error {
  constructor(
    message: string,
    readonly operation: OperationDefinitionProperties
  ) {
    super(message);
  }
}
