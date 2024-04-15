import { z } from 'zod';
import { createTestLink } from './testLink';
import { testPostSchema, testUserSchema, User } from './testSchemas';
import { createRpc, mergeSchemas, RpcReceiver } from '@theunderscorer/rpc-core';

export const testSchema = mergeSchemas(testUserSchema, testPostSchema);

export function setupTestUserHandlers(
  receiver: RpcReceiver<typeof testUserSchema>
) {
  const users: Array<z.infer<typeof User>> = [];

  receiver.handleCommand('createUser', async (payload) => {
    const user = {
      id: Math.random().toString(),
      name: payload.name,
    };

    users.push(user);

    await receiver.dispatchEvent('userCreated', user);

    return user;
  });

  receiver.handleQuery('getUser', async (payload) => {
    return users.find((user) => user.id === payload.id);
  });

  return { users };
}

export function createTestRpc() {
  const link = createTestLink();
  const rpc = createRpc({
    schema: testSchema,
    clientLinks: [link.clientLink],
    receiverLinks: [link.receiverLink],
  });

  const { users } = setupTestUserHandlers(rpc.receiver);

  return {
    rpc,
    link,
    users,
  };
}
