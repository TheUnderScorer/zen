/* eslint-disable @typescript-eslint/no-explicit-any */
import { OperationKind, OperationName } from './schema.types';
import { ZodSchema } from 'zod';

export interface OperationDefinitionProperties<
  Kind extends OperationKind = OperationKind,
  Name extends OperationName = OperationName,
  Payload = undefined,
  Result = any,
  Meta extends Record<string, any> = Record<string, any>
> {
  kind: Kind;
  payload: Payload;
  result: Result;
  name: Name;
  meta: Meta;
}

export class OperationDefinition<
  Kind extends OperationKind = OperationKind,
  Name extends OperationName = OperationName,
  Payload = undefined,
  Result = any,
  Meta extends Record<string, any> = Record<string, any>
> implements OperationDefinitionProperties<Kind, Name, Payload, Result, Meta>
{
  payload!: Payload;

  result!: Result;

  name!: Name;

  meta!: Meta;

  constructor(public kind: Kind) {}

  static query() {
    return new OperationDefinition<OperationKind.Query>(OperationKind.Query);
  }

  static command() {
    return new OperationDefinition<OperationKind.Command>(
      OperationKind.Command
    );
  }

  static event() {
    return new OperationDefinition<OperationKind.Event>(OperationKind.Event);
  }

  withPayload<P>(): OperationDefinition<Kind, Name, P, Result, Meta>;
  withPayload<P extends ZodSchema>(
    zod: P
  ): OperationDefinition<Kind, Name, P, Result, Meta>;

  /**
   * Defines operation payload.
   * If you pass zod schema, it will be used to validate the payload in client and receiver
   *
   * @example
   * ```ts
   * // Using zod
   * definition.withPayload(z.object({ id: z.number() }))
   *
   * // Using typescript
   * definition.withPayload<{ id: number }>()
   * */
  withPayload<P extends ZodSchema>(zodSchema?: P) {
    if (zodSchema) {
      Object.assign(this, {
        payload: zodSchema,
      });
    }

    return this as unknown as OperationDefinition<Kind, Name, P, Result, Meta>;
  }

  /**
   * Sets operation name.
   *
   * Note: it is not required to call it manually. Name will be automatically set by `defineSchema` function.
   * */
  withName<N extends OperationName>(name: N) {
    Object.assign(this, {
      name,
    });

    return this as unknown as OperationDefinition<
      Kind,
      N,
      Payload,
      Result,
      Meta
    >;
  }

  withResult<R>(): OperationDefinition<Kind, Name, Payload, R, Meta>;
  withResult<R>(
    zod: ZodSchema<R>
  ): OperationDefinition<Kind, Name, Payload, R, Meta>;

  /**
   * Defines operation result.
   * If you pass zod schema, it will be used to validate the result in client and receiver
   *
   * @example
   * ```ts
   * // Using zod
   * definition.withResult(z.object({ id: z.number() }))
   *
   * // Using typescript
   * definition.withResult<{ id: number }>()
   * */
  withResult<R extends ZodSchema>(zodSchema?: R) {
    if (this.kind === OperationKind.Event) {
      throw new TypeError('Events cannot have a result');
    }

    if (zodSchema) {
      Object.assign(this, {
        result: zodSchema,
      });
    }

    return this as unknown as OperationDefinition<Kind, Name, Payload, R, Meta>;
  }

  /**
   * Adds metadata to definition that can be used later, for example in links.
   *
   * @example
   *
   * ```ts
   * import { defineSchema, command, getOperationFromSchema } from '@musubi/core'
   *
   * const schema = defineSchema({
   *   commands: {
   *     createPost: command().withMeta({ auth: true })
   *   }
   * });
   *
   * console.log(
   *  getOperationFromSchema(schema, 'createPost').meta.auth // true
   * );
   *
   * console.log(
   *  schema.commands.createPost.meta.auth // true
   * );
   * */
  withMeta<M extends Record<string, any>>(meta: M | ((definition: this) => M)) {
    Object.assign(this, {
      meta: {
        ...this.meta,
        ...(typeof meta === 'function' ? meta(this) : meta),
      },
    });

    return this as unknown as OperationDefinition<
      Kind,
      Name,
      Payload,
      Result,
      M & Meta
    >;
  }

  toDefinition() {
    return {
      name: this.name,
      kind: this.kind,
      payload: this.payload as Payload,
      result: this.result as Result,
      meta: this.meta as Meta,
    } as OperationDefinitionProperties<Kind, Name, Payload, Result, Meta>;
  }

  clone() {
    return Object.assign(
      new OperationDefinition<Kind, Name, Payload, Result, Meta>(this.kind),
      this
    );
  }
}
