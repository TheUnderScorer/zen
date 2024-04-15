/* eslint-disable @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-explicit-any */
import { OperationsSchema } from './schema.types';
import { mapObject } from '../utils/map';

type SchemaExtender<T extends OperationsSchema> = {
  [K in keyof T]?: {
    [P in keyof T[K]]?: (definition: T[K][P]) => T[K][P];
  };
};
type ExtendedSchema<
  BaseSchema extends OperationsSchema,
  Extender extends SchemaExtender<BaseSchema>
> = {
  [K in keyof BaseSchema]: {
    [P in keyof BaseSchema[K]]: P extends keyof Extender[K]
      ? Extender[K][P] extends (...args: any[]) => any
        ? ReturnType<Extender[K][P]>
        : BaseSchema[K][P]
      : BaseSchema[K][P];
  };
};

/**
 * Extends schema operations
 *
 * @example
 * ```ts
 * import { defineSchema, extendSchema, command, event, query } from '@musubi/core';
 *
 * const baseSchema = defineSchema({
 *   commands: {
 *     replaceContent: command()
 *       .withPayload(replaceContentSchema)
 *       .withResult<void>(),
 *     closeRightTab: command(),
 *   },
 *   events: {
 *     tabCreated: event().withPayload(
 *       z.object({
 *         id: z.number(),
 *       })
 *     ),
 *     contentReplaced: event(),
 *   },
 *   queries: {
 *     getAllTabIds: query().withResult(z.array(z.number())),
 *   },
 * });
 *
 *
 * // Extended base schema which adds metadata used by browser extension link
 * export const browserExtensionSchema = extendSchema(baseSchema, {
 *   commands: {
 *     replaceContent: (def) =>
 *       def.withMeta<BrowserExtensionLinkMeta>({
 *         browserExtensionChannel: {
 *           type: 'background',
 *         },,
 *       }),
 *
 *     closeRightTab: (def) =>
 *       def.withMeta<BrowserExtensionLinkMeta>({
 *         browserExtensionChannel: {
 *           type: 'background',
 *         },
 *       }),
 *   },
 *   queries: {
 *     getAllTabIds: (def) =>
 *       def.withMeta<BrowserExtensionLinkMeta>({
 *         browserExtensionChannel: {
 *           type: 'background',
 *         },
 *       }),
 *   },
 * });
 * ```
 * */
export function extendSchema<
  BaseSchema extends OperationsSchema,
  Extender extends SchemaExtender<BaseSchema>
>(
  baseSchema: BaseSchema,
  extender: Extender
): ExtendedSchema<BaseSchema, Extender> {
  return {
    commands: mapObject(baseSchema.commands, (value, key) => {
      const typedKey = key as keyof typeof extender.commands;

      if (typeof extender.commands?.[typedKey] === 'function') {
        return extender.commands[typedKey]!(value.clone() as any);
      }

      return value;
    }),
    queries: mapObject(baseSchema.queries, (value, key) => {
      const typedKey = key as keyof typeof extender.queries;

      if (typeof extender.queries?.[typedKey] === 'function') {
        return extender.queries[typedKey]!(value.clone() as any);
      }

      return value;
    }),
    events: mapObject(baseSchema.events, (value, key) => {
      const typedKey = key as keyof typeof extender.events;

      if (typeof extender.events?.[typedKey] === 'function') {
        return extender.events?.[typedKey]!(value.clone() as any);
      }

      return value;
    }),
  } as ExtendedSchema<BaseSchema, Extender>;
}
