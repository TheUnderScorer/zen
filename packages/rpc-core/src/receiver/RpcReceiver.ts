import {
  ExtractPayload,
  OperationKind,
  OperationName,
  OperationsSchema,
} from '../schema/schema.types';
import {
  OperationHandler,
  ReceiveRequestFn,
  ReceiverLink,
  SendResponseFn,
} from './receiver.types';
import { OperationResponse } from '../shared/OperationResponse';
import { Channel } from '../shared/communication.types';
import { validatePayload, validateResult } from '../schema/validation';
import { OperationRequest } from '../shared/OperationRequest';
import { MaybePromise } from '../shared/promise';
import { LinkParam } from '../shared/link.types';
import { createLinks } from '../shared/link';
import { OperationReceiverBuilder } from './OperationReceiverBuilder';
import { OperationDefinition } from '../schema/OperationDefinition';
import { Chain } from '@theunderscorer/chain';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class RpcReceiver<S extends OperationsSchema, Ctx = any> {
  private readonly links: ReceiverLink<Ctx>[];

  constructor(
    private readonly schema: S,
    links: LinkParam<ReceiverLink<Ctx>>[]
  ) {
    this.links = createLinks(links, schema);
  }

  cloneWithLinks(
    modifier: (links: ReceiverLink<Ctx>[]) => ReceiverLink<Ctx>[]
  ) {
    return new RpcReceiver(this.schema, modifier(this.links));
  }

  handleQuery<Name extends keyof S['queries']>(
    name: Name,
    handler: OperationHandler<S['queries'][Name], Ctx>
  ) {
    return this.subscribeToOperation(
      name as OperationName,
      handler,
      OperationKind.Query
    );
  }

  handleCommand<Name extends keyof S['commands']>(
    name: Name,
    handler: OperationHandler<S['commands'][Name], Ctx>
  ) {
    return this.subscribeToOperation(
      name as OperationName,
      handler,
      OperationKind.Command
    );
  }

  async dispatchEvent<Name extends keyof S['events']>(
    name: Name,
    payload?: ExtractPayload<S['events'][Name]>,
    channel?: Channel
  ) {
    const response = new OperationResponse<
      typeof payload,
      OperationRequest<unknown, Ctx>
    >(
      name as OperationName,
      OperationKind.Event,
      null,
      validatePayload(
        this.schema,
        OperationKind.Event,
        name as OperationName,
        payload
      ),
      null,
      channel
    );

    await this.sendResponse(response);
  }

  handleQueryBuilder<
    Key extends keyof S['queries'],
    Op extends S['queries'][Key],
    OpCtx
  >(name: Key): OperationReceiverBuilder<Op, Ctx & OpCtx> {
    const definition = this.schema.queries[name as OperationName] as Op;

    return this.createBuilder<typeof definition, OpCtx>(definition);
  }

  handleCommandBuilder<
    Key extends keyof S['commands'],
    Op extends S['commands'][Key],
    OpCtx
  >(name: Key): OperationReceiverBuilder<Op, Ctx & OpCtx> {
    const definition = this.schema.commands[name as OperationName] as Op;

    return this.createBuilder<Op, OpCtx>(definition);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private createBuilder<Operation extends OperationDefinition<any>, OpCtx>(
    operation: Operation
  ): OperationReceiverBuilder<Operation, Ctx & OpCtx> {
    return new OperationReceiverBuilder<Operation, Ctx & OpCtx>(
      this as RpcReceiver<S, Ctx & OpCtx>,
      operation
    );
  }

  private async sendResponse(
    response: OperationResponse<unknown, OperationRequest<unknown, Ctx>>
  ) {
    const chain = new Chain<SendResponseFn<Ctx>>();

    for (const link of this.links) {
      if (link.sendResponse) {
        chain.use(link.sendResponse.bind(link));
      }
    }

    await chain.exec(
      response as OperationResponse<
        unknown,
        OperationRequest<unknown, Ctx>,
        Ctx
      >
    );
  }

  private subscribeToOperation<Payload, Result>(
    name: OperationName,
    handler: (payload: Payload, ctx: Ctx) => MaybePromise<Result>,
    kind: OperationKind
  ) {
    const chain = new Chain<ReceiveRequestFn<Ctx>>();

    const links = this.links.filter((link) => link.receiveRequest);

    for (const link of links) {
      if (link.receiveRequest) {
        chain.use(link.receiveRequest.bind(link));
      }
    }

    const observable = chain.exec(name);

    return observable
      .filter((req) => req.kind === kind)
      .subscribe(async (request) => {
        let response: OperationResponse<Result, OperationRequest<Payload, Ctx>>;

        try {
          const payload = validatePayload(
            this.schema,
            kind,
            name,
            request.payload as Payload
          );
          const ctx = {
            ...(request.ctx as Ctx),
          };
          const result = await handler(payload, ctx);

          if (typeof ctx === 'object') {
            Object.keys(ctx as object).forEach((key) => {
              request.addCtx({
                [key]: {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  value: (ctx as any)[key],
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  isSerializable: request.isCtxSerializable(key as any),
                },
              });
            });
          }

          response = OperationResponse.fromResult<
            Result,
            OperationRequest<Payload, Ctx>
          >(
            request.name,
            request.kind,
            validateResult(this.schema, kind, name, result),
            request as OperationRequest<Payload, Ctx>
          );
        } catch (error) {
          response = OperationResponse.fromError<
            Result,
            OperationRequest<Payload, Ctx>,
            Ctx
          >(
            request.name,
            request.kind,
            error,
            request as OperationRequest<Payload, Ctx>
          );
        }

        await this.sendResponse(response);
      })
      .add(async () => {
        await observable.completeAll();
      });
  }
}
