import { DefaultContext, useRpcClient } from '../providers/RpcProvider';
import { useEffect, useMemo, useRef } from 'react';
import { Channel, RpcOperationName } from '@theunderscorer/rpc-core';

export function useEvent<Payload>(
  name: RpcOperationName,
  handler: (payload: Payload) => void,
  deps?: unknown[],
  channel?: Channel,
  ctx = DefaultContext
) {
  const client = useRpcClient(ctx);

  const observerRef = useRef(client.observeEvent(name, channel));

  const allDeps = useMemo(() => {
    if (!deps) {
      return [name];
    }

    return [name, ...deps];
  }, [name, deps]);

  useEffect(() => {
    observerRef.current = client.observeEvent(name, channel);
  }, [client, name, channel]);

  useEffect(() => {
    const subscription = observerRef.current.subscribe(async (value) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await handler(value as any);
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, allDeps);
}
