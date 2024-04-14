# typed-di

This library was generated with [Nx](https://nx.dev).

> Yet another DI library for Typescript. It's type-safe though!

## Usage

### Creating container

```ts
import {Container} from '@theunderscorer/typed-di';

const myContainer = Container.create();
```

### Registering items

```ts
import {Container} from '@theunderscorer/typed-di';

const myContainer = Container
  .create()
  .register({
    key: 'now',
    factory: () => new Date(),
  })
  .register({
    key: 'tomorrow',
    factory: store => {
      const tomorrow = new Date(store.now);

      tomorrow.setDate(tomorrow.getDate() + 1);

      return tomorrow;
    }
  });

console.log(myContainer.resolve('tomorrow'));
//OR
console.log(myContainer.items.tomorrow);

console.log(myContainer.resolve('tomorrow', {
  injectionParams: {
    // Provide custom params that will be injected while resolving item
    now: new Date(),
  },
}));
```

### Singleton registrations

```ts
import {Container, LifeTime} from '@theunderscorer/typed-di';

const container = Container.create()
  .register({
    key: 'randomNumber',
    factory: () => Math.random() * 100,
  })
  .register({
    key: 'sum',
    factory: store => store.randomNumber + 2,
    lifeTime: LifeTime.Singleton,
  });

const sum = container.items.sum;
const secondSum = container.items.sum;

console.log(sum === secondSum) // true
```
> **Warning!** If a singleton is resolved, and it depends on a transient registration, those will remain in the singleton for it's lifetime!


### Creating scope

```ts
import {Container, LifeTime, Disposable} from '@theunderscorer/typed-di';
import {User} from './types';

class TasksService implements Disposable {
  constructor(private readonly currentUser: User) {
  }

  getTasks() {
    // Some magic that returns tasks for current user!
  }

  async dispose() {
    // Dispose the service...
  }
}

const myContainer = Container
  .create()
  // Declare that "currentUser" will have type "User", but don't register anything yet
  .declare<'currentUser', User>('currentUser')
  .register({
    key: 'tasksService',
    // store: {currentUser: User}
    factory: store => new TasksService(store.currentUser),
    lifetime: LifeTime.Scoped,
    // Because "TasksService" implements "Disposable", the "dispose" method will be called after container is disposed.
    // Alternatively, you can provide custom dispose logic here as well.
    /* disposer: tasksService => {

    }*/
  });

// middleware in some web framework
app.use(async (req, res, next) => {
  // create a scoped container
  req.scope = mycontainer.createScope();

  // register some request-specific data..
  req.scope.register({
    key: 'currentUser',
    // Type of "req.user" must match "User" because of the declaration above
    factory: () => req.user,
  });

  await next();

  // Destroy scoped container
  // At this point "dispose" function will be called in TasksService!
  await req.scope.dispose();
});

app.get('/messages', async (req, res) => {
  // for each request we get a new message service!
  const tasksService = req.scope.resolve('tasksService');

  return res.send(200, await tasksService.getTasks());
});

```

## Building

Run `nx build typed-di` to build the library.

## Running unit tests

Run `nx test typed-di` to execute the unit tests via [Jest](https://jestjs.io).
