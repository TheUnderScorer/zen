/* eslint-disable @typescript-eslint/no-explicit-any */
import { RpcOperationKind, RpcOperationName } from './schema.types';
import { ZodSchema } from 'zod';

export interface RpcOperationDefinitionProperties<
  Kind extends RpcOperationKind = RpcOperationKind,
  Name extends RpcOperationName = RpcOperationName,
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

export class RpcOperationDefinition<
  Kind extends RpcOperationKind = RpcOperationKind,
  Name extends RpcOperationName = RpcOperationName,
  Payload = undefined,
  Result = any,
  Meta extends Record<string, any> = Record<string, any>
> implements
    RpcOperationDefinitionProperties<Kind, Name, Payload, Result, Meta>
{
  payload!: Payload;

  result!: Result;

  name!: Name;

  meta!: Meta;

  constructor(public kind: Kind) {}

  static query() {
    return new RpcOperationDefinition<RpcOperationKind.Query>(
      RpcOperationKind.Query
    );
  }

  static command() {
    return new RpcOperationDefinition<RpcOperationKind.Command>(
      RpcOperationKind.Command
    );
  }

  static event() {
    return new RpcOperationDefinition<RpcOperationKind.Event>(
      RpcOperationKind.Event
    );
  }

  needs<P>(): RpcOperationDefinition<Kind, Name, P, Result, Meta>;
  needs<P extends ZodSchema>(
    zod: P
  ): RpcOperationDefinition<Kind, Name, P, Result, Meta>;

  /**
   * Defines operation payload.
   * If you pass zod schema, it will be used to validate the payload in client and receiver
   *
   * @example
   * ```ts
   * // Using zod
   * definition.needs(z.object({ id: z.number() }))
   *
   * // Using typescript
   * definition.needs<{ id: number }>()
   * */
  needs<P extends ZodSchema>(zodSchema?: P) {
    if (zodSchema) {
      Object.assign(this, {
        payload: zodSchema,
      });
    }

    return this as unknown as RpcOperationDefinition<
      Kind,
      Name,
      P,
      Result,
      Meta
    >;
  }

  /**
   * Sets operation name.
   *
   * Note: it is not required to call it manually. Name will be automatically set by `defineRpcSchema` function.
   * */
  named<N extends RpcOperationName>(name: N) {
    Object.assign(this, {
      name,
    });

    return this as unknown as RpcOperationDefinition<
      Kind,
      N,
      Payload,
      Result,
      Meta
    >;
  }

  returns<R>(): RpcOperationDefinition<Kind, Name, Payload, R, Meta>;
  returns<R>(
    zod: ZodSchema<R>
  ): RpcOperationDefinition<Kind, Name, Payload, R, Meta>;

  /**
   * Defines operation result.
   * If you pass zod schema, it will be used to validate the result in client and receiver
   *
   * @example
   * ```ts
   * // Using zod
   * definition.returns(z.object({ id: z.number() }))
   *
   * // Using typescript
   * definition.returns<{ id: number }>()
   * */
  returns<R extends ZodSchema>(zodSchema?: R) {
    if (this.kind === RpcOperationKind.Event) {
      throw new TypeError('Events cannot have a result');
    }

    if (zodSchema) {
      Object.assign(this, {
        result: zodSchema,
      });
    }

    return this as unknown as RpcOperationDefinition<
      Kind,
      Name,
      Payload,
      R,
      Meta
    >;
  }

  /**
   * Adds metadata to definition that can be used later, for example in links.
   *
   * @example
   *
   * ```ts
   * import { defineRpcSchema, command, getOperationFromSchema } from '@theunderscorer/rpc-core'
   *
   * const schema = defineRpcSchema({
   *   commands: {
   *     createPost: command().addMeta({ auth: true })
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
  addMeta<M extends Record<string, any>>(meta: M | ((definition: this) => M)) {
    Object.assign(this, {
      meta: {
        ...this.meta,
        ...(typeof meta === 'function' ? meta(this) : meta),
      },
    });

    return this as unknown as RpcOperationDefinition<
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
    } as RpcOperationDefinitionProperties<Kind, Name, Payload, Result, Meta>;
  }

  clone() {
    return Object.assign(
      new RpcOperationDefinition<Kind, Name, Payload, Result, Meta>(this.kind),
      this
    );
  }
}
