import {
  command,
  query,
  event,
  defineRpcSchema,
} from '@theunderscorer/rpc-core';
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
      .withPayload(
        z.object({
          name: z.string(),
        })
      )
      .withResult(User),
  },
  events: {
    userCreated: event().withPayload(User),
  },
  queries: {
    getUser: query()
      .withPayload(
        z.object({
          id: z.coerce.string(),
        })
      )
      .withResult(User.optional()),
  },
});

export const testPostSchema = defineRpcSchema({
  commands: {
    createPost: command()
      .withPayload(
        z.object({
          title: z.string(),
        })
      )
      .withResult(Post),
  },
  events: {
    postCreated: event().withPayload(Post),
  },
  queries: {
    getPost: query()
      .withPayload(
        z.object({
          id: z.string(),
        })
      )
      .withResult(Post),
  },
});
