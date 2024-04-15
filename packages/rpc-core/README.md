# rpc-core

This library was generated with [Nx](https://nx.dev) and is part of the Zen, a library collection made by [TheUnderScorer](https://github.com/TheUnderScorer).

![logo.png](../../assets/logo.png)

## What is rpc-core?

Rpc-core is a library for end-to-end typesafe communication.
It is inspired by [tRPC](https://github.com/trpc/trpc), but with a focus on modularity and ability to define schema and implement it separately.

### Features
- ⛑️ Complete type safety for all operations, their inputs and return values.
- 💻 You can easily create multiple schemas for your operations and then merge them into one.
- 👀 Support for subscriptions
- 🔋Batteries included - includes adapters for your favorite frameworks, such as React.js, Next, Vue and more

## Install

With pnpm:

```bash
pnpm add @theunderscorer/rpc-core
```

With npm:

```bash
npm install @theunderscorer/rpc-core
```

## Usage
```ts
import { defineSchema, RpcClient } from "@theunderscorer/rpc-core";
import { createHttpClientLink } from "@theunderscorer/rpc-http-link";
import { z } from "zod";

const schema = defineSchema({
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

async function main() {
  const httpLink = createHttpClientLink({
    url: "http://localhost:3000/api"
  });
  const client = new RpcClient(schema, [httpLink]);

  // Querying the greeting
  const response = await client.query("greet", {
    name: "John"
  });

  console.log("response", response); // Hello John
}

```

## Building

Run `nx build rpc-core` to build the library.

## Running unit tests

Run `nx test rpc-core` to execute the unit tests via [Jest](https://jestjs.io).
