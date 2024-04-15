import { OperationsSchema } from './schema/schema.types';
import { ClientLink } from './client/client.types';
import { RpcClient } from './client/RpcClient';
import { RpcReceiver } from './receiver/RpcReceiver';
import { ReceiverLink } from './receiver/receiver.types';
import { LinkParam } from './shared/link.types';

export interface RpcParams<
  S extends OperationsSchema,
  ClientContext = unknown,
  ReceiverContext = unknown
> {
  schema: S;
  clientLinks: LinkParam<ClientLink<ClientContext>>[];
  receiverLinks: LinkParam<ReceiverLink<ReceiverContext>>[];
}

export interface Rpc<
  S extends OperationsSchema = OperationsSchema,
  ClientContext = unknown,
  ReceiverContext = unknown
> {
  client: RpcClient<S, ClientContext>;
  receiver: RpcReceiver<S, ReceiverContext>;
}

export function createRpc<
  S extends OperationsSchema,
  ClientContext = unknown,
  ReceiverContext = unknown
>({
  clientLinks,
  receiverLinks,
  schema,
}: RpcParams<S, ClientContext, ReceiverContext>) {
  return {
    client: new RpcClient(schema, clientLinks),
    receiver: new RpcReceiver(schema, receiverLinks),
  } satisfies Rpc<S, ClientContext, ReceiverContext>;
}
