import { command, query, event, defineRpcSchema } from 'packages/rpc-core/src';
import { z } from 'zod';

export const User = z.object({
  id: z.string(),
  name: z.string(),
});

export const Post = z.object({
  id: z.string(),
  title: z.string(),
});

export const testUserSchema = defineRpcSchema({
  commands: {
    createUser: command()
      .needs(
        z.object({
          name: z.string(),
        })
      )
      .returns(User),
  },
  events: {
    userCreated: event().needs(User),
  },
  queries: {
    getUser: query()
      .needs(
        z.object({
          id: z.coerce.string(),
        })
      )
      .returns(User.optional()),
  },
});

export const testPostSchema = defineRpcSchema({
  commands: {
    createPost: command()
      .needs(
        z.object({
          title: z.string(),
        })
      )
      .returns(Post),
  },
  events: {
    postCreated: event().needs(Post),
  },
  queries: {
    getPost: query()
      .needs(
        z.object({
          id: z.string(),
        })
      )
      .returns(Post),
  },
});
