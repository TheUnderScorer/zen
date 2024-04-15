# rpc-react

This library was generated with [Nx](https://nx.dev) and is part of the Zen, a library collection made by [TheUnderScorer](https://github.com/TheUnderScorer).

Wrapper for using RPC in React. It uses [react-query](https://react-query.tanstack.com/) under the hood.

![logo.png](../../assets/logo.png)

## Install

With pnpm:

```bash
pnpm add @theunderscorer/rpc-react
```

With npm:

```bash
npm install @theunderscorer/rpc-react
```

## Usage
1. Initialize react hooks
```tsx
// schema.ts
import { createReactRpc } from "@theunderscorer/rpc-react";
import { defineRpcSchema, query } from "@theunderscorer/rpc-core";
import { z } from "zod";

export const schema = defineRpcSchema({
  queries: {
    greet: query()
      .needs(
        z.object({
          name: z.string()
        })
      )
      .returns(z.string())
  }
});

export const rpc = createReactRpc(schema);
```
2. Wrap your application in provider

```tsx
// index.tsx
import { schema } from "./schema";
import { QueryClient } from "@tanstack/react-query";
import { RpcClient } from "@theunderscorer/rpc-core";
import { createInMemoryLink } from "@underscorer/rpc-in-memory-link";
import { App } from './App';
import { RpcProvider } from "@theunderscorer/rpc-react";

// Example with in memory link, but it could be any link
const link = createInMemoryLink()

// Query client from @tanstack/react-query
const queryClient = new QueryClient();

const client = new RpcClient(schema, [link.client]);

function MyApp() {
  return (
    <RpcProvider queryClient={queryClient} client={client}>
      <App />
    </RpcProvider>
  )
}
```
3. Use operations inside your components 🎉
```tsx
// App.tsx
import { rpc } from "./schema";

export function App() {
  const { data, isLoading } = rpc.greet.useQuery("greet", { name: "John" });

  return (
    <div>
      {isLoading ? "Loading..." : data}
    </div>
  )
}
```

## Building

Run `nx build rpc-react` to build the library.

## Running unit tests

Run `nx test rpc-react` to execute the unit tests via [Jest](https://jestjs.io).
