/* eslint-disable @typescript-eslint/consistent-type-definitions */

import 'fastify';

export type Papel = 'admin' | 'editor';

export interface AuthUser {
  sub: string;
  papel: Papel;
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<unknown>;
  }

  interface FastifyRequest {
    userPrincipal: AuthUser;
  }
}