/* eslint-disable @typescript-eslint/no-explicit-any */
import { OperationsSchema } from '../schema/schema.types';
import { ClientLink } from '../client/client.types';
import { ReceiverLink } from '../receiver/receiver.types';

export type LinkFn<T> = (params: LinkFnParams) => T;

export type LinkParam<T> = T | LinkFn<T>;

export interface LinkFnParams {
  schema: OperationsSchema;
  linkIndex: number;
}

export interface LinkPair<
  Client extends ClientLink<any>,
  Receiver extends ReceiverLink<any>
> {
  client: LinkParam<Client>;
  receiver: LinkParam<Receiver>;
}
