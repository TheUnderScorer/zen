import { OperationsSchema } from './schema/schema.types';
import { ClientLink } from './client/client.types';
import { MusubiClient } from './client/MusubiClient';
import { MusubiReceiver } from './receiver/MusubiReceiver';
import { ReceiverLink } from './receiver/receiver.types';
import { LinkParam } from './shared/link.types';

export interface MusubiParams<
  S extends OperationsSchema,
  ClientContext = unknown,
  ReceiverContext = unknown
> {
  schema: S;
  clientLinks: LinkParam<ClientLink<ClientContext>>[];
  receiverLinks: LinkParam<ReceiverLink<ReceiverContext>>[];
}

export interface Musubi<
  S extends OperationsSchema = OperationsSchema,
  ClientContext = unknown,
  ReceiverContext = unknown
> {
  client: MusubiClient<S, ClientContext>;
  receiver: MusubiReceiver<S, ReceiverContext>;
}

export function createMusubi<
  S extends OperationsSchema,
  ClientContext = unknown,
  ReceiverContext = unknown
>({
  clientLinks,
  receiverLinks,
  schema,
}: MusubiParams<S, ClientContext, ReceiverContext>) {
  return {
    client: new MusubiClient(schema, clientLinks),
    receiver: new MusubiReceiver(schema, receiverLinks),
  } satisfies Musubi<S, ClientContext, ReceiverContext>;
}
