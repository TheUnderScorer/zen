# chain

This library was generated with [Nx](https://nx.dev) and is part of the Zen, a library collection made by [TheUnderScorer](https://github.com/TheUnderScorer).

Chain is used to create composable middleware functions, similar to the ones used in Express.js.

![logo.png](../../assets/logo.png)

## Install

With pnpm:

```bash
pnpm add @theunderscorer/chain
```

With npm:

```bash
npm install @theunderscorer/chain
```

## Usage

```ts
import { Chain } from '@theunderscorer/chain';

const chain = new Chain<
  (number: number, next: (number: number) => Promise<number>) => Promise<number>
>();

chain.use(async (number, next) => {
  console.log('First middleware', number);
  const result = await next(number + 1);
  console.log('First middleware result', result);
  return result;
});

chain.use(async (number, next) => {
  console.log('Second middleware', number);
  return number + 1;
});

const result = await chain.exec(1);

console.log('Result', result); // 3
```

## Building

Run `nx build chain` to build the library.

## Running unit tests

Run `nx test chain` to execute the unit tests via [Jest](https://jestjs.io).
