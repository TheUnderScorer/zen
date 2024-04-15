/* eslint-disable @typescript-eslint/no-explicit-any */

import { z, ZodSchema } from 'zod';
import { OperationDefinition } from './OperationDefinition';

export type QueryDefinition<
  Name extends OperationName,
  Payload,
  Result
> = OperationDefinition<OperationKind.Query, Name, Payload, Result>;

export type CommandDefinition<
  Name extends OperationName,
  Payload,
  Result
> = OperationDefinition<OperationKind.Command, Name, Payload, Result>;

export type EventDefinition<
  Name extends OperationName,
  Payload
> = OperationDefinition<OperationKind.Event, Name, Payload, void>;

export type DefinitionsRecord<Entry extends OperationDefinition<any, any>> = {
  [key: OperationName]: Entry;
};

export enum OperationKind {
  Query = 'query',
  Command = 'command',
  Event = 'event',
}

export type OptionalPayload<T> = T extends undefined | null ? true : false;

export type ExtractPayload<P extends OperationDefinition<any, any>> =
  ExtractZod<P['payload']>;

export type ExtractResult<P extends OperationDefinition<any, any>> = ExtractZod<
  P['result']
>;

export type ExtractZod<T> = T extends ZodSchema ? z.infer<T> : T;

export type OperationName = string;

export type OperationsSchemaLike = {
  queries: any;
  commands: any;
  events: any;
};

export interface OperationsSchema<
  Queries extends DefinitionsRecord<
    QueryDefinition<any, any, any>
  > = DefinitionsRecord<QueryDefinition<any, any, any>>,
  Commands extends DefinitionsRecord<
    CommandDefinition<any, any, any>
  > = DefinitionsRecord<CommandDefinition<any, any, any>>,
  Events extends DefinitionsRecord<
    EventDefinition<any, any>
  > = DefinitionsRecord<EventDefinition<any, any>>
> {
  queries: Queries;
  commands: Commands;
  events: Events;
}

export type OperationSchemaOperations<S extends OperationsSchema> =
  | keyof S['queries']
  | keyof S['commands']
  | keyof S['events'];
