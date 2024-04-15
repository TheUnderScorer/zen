# rpc-in-memory-link

This library was generated with [Nx](https://nx.dev) and is part of the Zen, a library collection made by [TheUnderScorer](https://github.com/TheUnderScorer).

Adapter for using RPC with in-memory communication.

![logo.png](../../assets/logo.png)

## Install

With pnpm:

```bash
pnpm add @theunderscorer/rpc-in-memory-link
```

With npm:

```bash
npm install @theunderscorer/rpc-in-memory-link
```

## Usage
```ts
import { defineRpcSchema, RpcClient, RpcReceiver } from "@theunderscorer/rpc-core";
import { createInMemoryLink } from "@theunderscorer/rpc-in-memory-link";
import { z } from "zod";

const schema = defineRpcSchema({
  queries: {
    greet: query()
      .withPayload(
        z.object({
          name: z.string()
        })
      )
      .withResult(z.string())
  }
});

const memoryLink = createInMemoryLink();

const receiver = new RpcReceiver(schema, [memoryLink.receiver]);

receiver.handleQuery('greet', payload => `Hello ${payload.name}`);

async function main() {
  const client = new RpcClient(schema, [memoryLink.client]);

  // Querying the greeting
  const response = await client.query("greet", {
    name: "John"
  });

  console.log("response", response); // Hello John
}

```

## Building

Run `nx build rpc-in-memory-link` to build the library.

## Running unit tests

Run `nx test rpc-in-memory-link` to execute the unit tests via [Jest](https://jestjs.io).
