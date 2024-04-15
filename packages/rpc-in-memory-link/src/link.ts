import { InMemoryReceiverLink } from './InMemoryReceiverLink';
import { createHandlers } from './handlers';
import { InMemoryClientLink } from './InMemoryClientLink';
import { LinkPair } from '@theunderscorer/rpc-core';

export function createInMemoryLink() {
  const handlers = createHandlers();

  const pair = {
    receiver: new InMemoryReceiverLink(handlers),
    client: new InMemoryClientLink(handlers),
  } satisfies LinkPair<InMemoryClientLink, InMemoryReceiverLink>;

  return {
    ...pair,
    handlers,
  };
}
