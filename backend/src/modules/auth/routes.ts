import bcrypt from 'bcryptjs';
import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { query } from '../../db/pool.js';
import type { UserRow } from '../../db/types.js';
import { HttpError } from '../../lib/http-error.js';
import { loginSchema, registerSchema } from './schemas.js';

export type SanitizedUser = {
  id: string;
  nome: string;
  email: string;
  papel: UserRow['papel'];
};

function sanitize(user: Pick<UserRow, 'id' | 'nome' | 'email' | 'papel'>): SanitizedUser {
  return { id: user.id, nome: user.nome, email: user.email, papel: user.papel };
}

export function registerAuthRoutes(app: FastifyInstance): void {
  app.post(
    '/api/auth/register',
    async (request, reply) => {
      if (!env.AUTH_REGISTER_OPEN) {
        throw new HttpError(403, 'Registro desabilitado. Use o seed (npm run db:seed).');
      }
      const { nome, email, senha } = registerSchema.parse(request.body);

      const existing = await query<{ id: string }>('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rowCount && existing.rowCount > 0) {
        throw new HttpError(409, 'Já existe um usuário com este e-mail.');
      }

      const senhaHash = await bcrypt.hash(senha, 12);
      const { rows } = await query<UserRow>(
        `INSERT INTO users (nome, email, senha_hash, papel)
         VALUES ($1, $2, $3, 'admin')
         RETURNING id, nome, email, papel`,
        [nome, email, senhaHash],
      );
      const user = rows[0];
      if (!user) throw new Error('Falha ao criar usuário.');

      const token = app.jwt.sign({ sub: user.id, papel: user.papel }, { expiresIn: '7d' });
      return reply.code(201).send({ token, user: sanitize(user) });
    },
  );

  app.post(
    '/api/auth/login',
    async (request, reply) => {
      const { email, senha } = loginSchema.parse(request.body);

      const { rows } = await query<UserRow>(
        'SELECT id, nome, email, senha_hash, papel, ativo FROM users WHERE email = $1',
        [email],
      );
      const user = rows[0];
      if (!user?.ativo) {
        throw new HttpError(401, 'E-mail ou senha inválidos.');
      }

      const senhaValida = await bcrypt.compare(senha, user.senha_hash);
      if (!senhaValida) {
        throw new HttpError(401, 'E-mail ou senha inválidos.');
      }

      const token = app.jwt.sign({ sub: user.id, papel: user.papel }, { expiresIn: '7d' });
      return reply.send({
        token,
        user: sanitize(user),
      });
    },
  );

  app.get('/api/auth/me', { preHandler: [app.authenticate] }, async (request) => {
    const { rows } = await query<UserRow>(
      'SELECT id, nome, email, papel FROM users WHERE id = $1 AND ativo = true',
      [request.userPrincipal.sub],
    );
    const user = rows[0];
    if (!user) throw new HttpError(401, 'Usuário não encontrado ou inativo.');
    return sanitize(user);
  });
}

export const idParamSchema = z.string().uuid();