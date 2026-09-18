import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import { HttpError } from './lib/http-error.js';
import type { Papel } from './types.js';
import { registerAuthRoutes } from './modules/auth/routes.js';
import { registerCategoryRoutes } from './modules/categories/routes.js';
import { registerChangelogRoutes } from './modules/changelog/routes.js';
import { registerCommunityRoutes } from './modules/communities/routes.js';
import { registerEventRoutes } from './modules/events/routes.js';
import { registerInstitutionRoutes } from './modules/institution/routes.js';
import { registerSequenceRoutes } from './modules/sequences/routes.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: env.NODE_ENV === 'production' ? false : true,
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    credentials: true,
  });

  await app.register(jwt, { secret: env.JWT_SECRET });

  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const decoded = await request.jwtVerify<{ sub: string; papel: Papel }>();
      request.userPrincipal = { sub: decoded.sub, papel: decoded.papel };
    } catch {
      return reply.code(401).send({ error: 'Não autenticado.' });
    }
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof HttpError) {
      return reply.code(error.statusCode).send({ error: error.message });
    }
    if (error instanceof ZodError) {
      const details = error.issues.map((i) => ({ campo: i.path.join('.'), mensagem: i.message }));
      return reply.code(400).send({ error: 'Dados inválidos.', details });
    }
    request.log.error(error);
    return reply.code(500).send({ error: 'Erro interno do servidor.' });
  });

  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api/')) {
      return reply.code(404).send({ error: 'Recurso não encontrado.' });
    }
    return reply.code(404).send({ error: 'Não encontrado.' });
  });

  registerAuthRoutes(app);
  registerCommunityRoutes(app);
  registerCategoryRoutes(app);
  registerInstitutionRoutes(app);
  registerEventRoutes(app);
  registerSequenceRoutes(app);
  registerChangelogRoutes(app);

  return app;
}