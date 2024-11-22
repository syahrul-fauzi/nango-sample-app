import type { RouteHandler } from 'fastify';
import { nango } from '../nango.js';
import { getUserFromDatabase } from '../db.js';

export type PostConnectSessionSuccess = {
  connectSession: string;
};
export type PostConnectSession = PostConnectSessionSuccess | { error: string };

/**
 * Create a session for each user that wants to connect to an integration
 * It allows your backend to control who is connecting and also enforce some filtering
 * So you don't have to store credentials in your frontend ever
 */
export const postConnectSession: RouteHandler<{
  Reply: PostConnectSession;
}> = async (_, reply) => {
  const user = await getUserFromDatabase();
  if (!user) {
    await reply.status(400).send({ error: 'invalid_user' });
    return;
  }

  const res = await nango.createConnectSession({
    end_user: {
      id: user.id,
      email: user.email,
      display_name: user.displayName,
    },
    allowed_integrations: ['slack'],
  });

  await reply.status(200).send({ connectSession: res.data.token });
};