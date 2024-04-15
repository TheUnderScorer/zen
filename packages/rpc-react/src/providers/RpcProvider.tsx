import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createContext, PropsWithChildren, useContext } from 'react';
import { OperationsSchema, RpcClient } from '@theunderscorer/rpc-core';

export interface RpcProviderProps<
  S extends OperationsSchema = OperationsSchema
> {
  queryClient: QueryClient;
  client: RpcClient<S>;
  Context?: ReturnType<typeof createRpcContext>;
}

export interface RpcContextValue<
  S extends OperationsSchema = OperationsSchema
> {
  client: RpcClient<S>;
}

export function createRpcContext() {
  return createContext<RpcContextValue>({
    client: new RpcClient({} as OperationsSchema, []),
  });
}

export const DefaultContext = createRpcContext();

export function useRpcClient<S extends OperationsSchema>(ctx = DefaultContext) {
  return useContext(ctx).client as RpcClient<S>;
}

export function RpcProvider({
  queryClient,
  client,
  children,
  Context = DefaultContext,
}: PropsWithChildren<RpcProviderProps>) {
  return (
    <QueryClientProvider client={queryClient}>
      <Context.Provider value={{ client }}>{children}</Context.Provider>
    </QueryClientProvider>
  );
}
