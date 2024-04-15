/* eslint-disable @typescript-eslint/no-explicit-any */
import { MaybePromise } from '../shared/promise';
import { OperationHandler } from './receiver.types';
import { OperationDefinition } from '../schema/OperationDefinition';
import {
  ExtractPayload,
  ExtractResult,
  OperationKind,
} from '../schema/schema.types';
import { MusubiReceiver } from './MusubiReceiver';
import { MusubiError } from '../errors/MusubiError';

export interface OperationBeforeMiddlewareParams<
  Operation extends OperationDefinition,
  Payload,
  Ctx
> {
  operation: Operation;
  payload: Payload;
  ctx: Ctx;
}

export interface OperationAfterMiddlewareParams<
  Operation extends OperationDefinition,
  Payload,
  Ctx,
  Result
> extends OperationBeforeMiddlewareParams<Operation, Payload, Ctx> {
  data: OperationAfterResult<Result>;
}

export type OperationBeforeMiddleware<
  Operation extends OperationDefinition,
  Ctx,
  Result
> = (
  params: OperationBeforeMiddlewareParams<
    Operation,
    ExtractPayload<Operation>,
    Ctx
  >
) => MaybePromise<Result>;

export type OperationAfterResult<Result> =
  | { error: Error; result: null }
  | { error: null; result: Result };

export type OperationAfterMiddleware<
  Operation extends OperationDefinition,
  Ctx
> = (
  params: OperationAfterMiddlewareParams<
    Operation,
    ExtractPayload<Operation>,
    Ctx,
    ExtractResult<Operation>
  >
) => MaybePromise<void>;

export class OperationReceiverBuilder<
  Operation extends OperationDefinition<any>,
  Ctx
> {
  private rootHandler?: OperationHandler<Operation, Ctx>;

  private readonly middlewareBefore: OperationBeforeMiddleware<
    Operation,
    Ctx,
    unknown
  >[] = [];

  private readonly middlewareAfter: OperationAfterMiddleware<Operation, Ctx>[] =
    [];

  constructor(
    private readonly receiver: MusubiReceiver<any, Ctx>,
    private readonly operation: Operation
  ) {}

  withHandler(handler: OperationHandler<Operation, Ctx>) {
    this.rootHandler = handler;

    return this;
  }

  /**
   * Appends middleware to be executed before operation handler.
   *
   * @example
   * ```ts
   *       receiver
   *         .handleQueryBuilder('getPost')
   *         .runBefore(({ payload, operation, ctx }) => {
   *           const user = await getUser(ctx);
   *
   *           // Return new ctx
   *           return {
   *             ...ctx,
   *             user
   *           }
   *         })
   *         .withHandler((payload, ctx) => {
   *            // Typescript knows that ctx has user property
   *           console.log(ctx.user);
   *         })
   * */
  runBefore<MiddlewareReturn>(
    middleware: OperationBeforeMiddleware<Operation, Ctx, MiddlewareReturn>
  ) {
    this.middlewareBefore.push(middleware);

    return this as unknown as OperationReceiverBuilder<
      Operation,
      MiddlewareReturn extends Awaited<infer V>
        ? V extends void | undefined | null
          ? Ctx
          : MiddlewareReturn
        : Ctx
    >;
  }

  /**
   * Appends middleware to be executed after operation handler.
   *
   * @example
   * ```ts
   *       receiver
   *         .handleQueryBuilder('getPost')
   *         .runAfter(({ data, operation }) => {
   *           if (data.error) {
   *             console.log("Operation ${operation.name} failed!")
   *           } else {
   *             console.log("Operation ${operation.name} succeeded!")
   *           }
   *         })
   * ```
   * */
  runAfter(middleware: OperationAfterMiddleware<Operation, Ctx>) {
    this.middlewareAfter.push(middleware);

    return this as unknown as OperationReceiverBuilder<Operation, Ctx>;
  }

  /**
   * Builds operation handler that can be passed into receiver.
   * @see register
   * */
  toHandler(): OperationHandler<Operation, Ctx> {
    if (!this.rootHandler) {
      throw new MusubiError(
        'Root handler is missing. Perhaps you forgot to call .withHandler() ?',
        this.operation
      );
    }

    return async (payload, ctx) => {
      const rootCtx = {
        ...ctx,
      };

      let operationResult: any | Error;

      for (const middleware of this.middlewareBefore) {
        try {
          const result = await middleware({
            operation: this.operation,
            ctx: rootCtx,
            payload,
          });

          if (result) {
            Object.assign(rootCtx as object, {
              ...rootCtx,
              ...result,
            });
          }
        } catch (error) {
          operationResult = error;
          break;
        }
      }

      if (!operationResult) {
        const asyncHandler = async () => this.rootHandler?.(payload, rootCtx);

        operationResult = await asyncHandler().catch((error) => error);
      }

      const isError = operationResult instanceof Error;

      const data = {
        error: isError ? operationResult : null,
        result: operationResult,
      } as OperationAfterResult<Awaited<ExtractResult<Operation>>>;

      for (const middleware of this.middlewareAfter) {
        await middleware({
          operation: this.operation,
          payload,
          ctx: rootCtx,
          data,
        });
      }

      if (isError) {
        throw operationResult;
      }

      return operationResult;
    };
  }

  /**
   * Registers handler into receiver
   *
   * @example
   * ```ts
   *       receiver
   *         .handleQueryBuilder('getPost')
   *         .runBefore(({ data, operation, ctx }) => {
   *           // Run before handler
   *         })
   *         .runAfter(({ data, operation, ctx }) => {
   *            // Run after handler
   *         })
   *         .withHandler((payload, ctx) => {
   *            // Implement handler
   *         })
   *         .register();
   * ``
   * */
  register() {
    const handler = this.toHandler();

    switch (this.operation.kind) {
      case OperationKind.Command:
        return this.receiver.handleCommand(this.operation.name, handler);

      case OperationKind.Query:
        return this.receiver.handleQuery(this.operation.name, handler);

      default:
        throw new MusubiError(
          `Unknown operation kind: ${this.operation.kind}`,
          this.operation
        );
    }
  }
}
