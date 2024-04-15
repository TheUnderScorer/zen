/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-non-null-assertion */
import { OperationDefinition } from './OperationDefinition';
import { OperationSchemaOperations, OperationsSchema } from './schema.types';
import { mapObject } from '../utils/map';
import { MergeAll } from '../shared/merge';

export function getOperationFromSchema<
  S extends OperationsSchema,
  Key extends OperationSchemaOperations<S>
>(schema: S, key: Key): OperationDefinition {
  const k = key as any;

  const operation = schema.commands[k] || schema.queries[k] || schema.events[k];

  if (!operation) {
    throw new TypeError(`Operation ${k} not found in schema`);
  }

  return operation;
}

export function defineSchema<S extends OperationsSchema>(schema: S) {
  const addName = (key: keyof Pick<S, 'queries' | 'events' | 'commands'>) =>
    mapObject(schema[key], (value, key) => {
      return value.withName(key.toString());
    });

  return {
    commands: addName('commands'),
    queries: addName('queries'),
    events: addName('events'),
  } as S;
}

export function query() {
  return OperationDefinition.query();
}

export function command() {
  return OperationDefinition.command();
}

export function event() {
  return OperationDefinition.event();
}

export const operation = {
  get query() {
    return query();
  },
  get command() {
    return command();
  },
  get event() {
    return event();
  },
};

type MergeSchemas<Schemas extends Array<OperationsSchema>> = MergeAll<Schemas>;

export function mergeSchemas<S extends OperationsSchema[]>(
  ...schemas: S
): MergeSchemas<S> {
  const result = schemas.reduce(
    (acc, schema) => {
      acc.queries = {
        ...acc.queries,
        ...schema.queries,
      };

      acc.commands = {
        ...acc.commands,
        ...schema.commands,
      };

      acc.events = {
        ...acc.events,
        ...schema.events,
      };

      return acc;
    },
    {
      events: {},
      commands: {},
      queries: {},
    }
  );

  return result as any;
}
