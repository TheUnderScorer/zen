import { OperationKind, OperationName } from '../schema/schema.types';
import { Channel } from './communication.types';
import { generateUUIDv4 } from '../utils/id';
import { z } from 'zod';
import { OperationEnvelope } from './OperationEnvelope';

const operationRequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.nativeEnum(OperationKind),
  payload: z.unknown().optional(),
  timestamp: z.number(),
  channel: z.unknown().optional(),
  ctx: z.unknown().optional(),
});

export type OperationRequestObject = z.infer<typeof operationRequestSchema>;

export class OperationRequest<Payload = unknown, Ctx = unknown>
  extends OperationEnvelope<Ctx>
  implements OperationRequestObject
{
  static readonly schema = operationRequestSchema;

  id: string;

  timestamp: number;

  constructor(
    public name: OperationName,
    public kind: OperationKind,
    public payload: Payload,
    public channel?: Channel,
    ctx?: Ctx
  ) {
    super(ctx);

    this.id = generateUUIDv4();
    this.timestamp = Date.now();
  }

  static fromUnsafeObject<Payload, Ctx>(unsafeData: unknown) {
    const data = OperationRequest.schema.parse(unsafeData);

    const request = new OperationRequest<Payload, Ctx>(
      data.name,
      data.kind,
      data.payload as Payload,
      data.channel as Channel,
      data.ctx as Ctx
    );
    request.id = data.id;
    request.timestamp = data.timestamp;

    return request;
  }

  static fromObject<Payload, Ctx>(data: OperationRequestObject) {
    const request = new OperationRequest<Payload, Ctx>(
      data.name,
      data.kind,
      data.payload as Payload,
      data.channel as Channel,
      data.ctx as Ctx
    );
    request.id = data.id;
    request.timestamp = data.timestamp;

    return request;
  }
}
