import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter ao menos 16 caracteres'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .transform((v) =>
      v
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0),
    ),
  AUTH_REGISTER_OPEN: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  BOOTSTRAP_ADMIN_NOME: z.string().default('Administrador'),
  BOOTSTRAP_ADMIN_EMAIL: z.string().email().default('admin@paroquia.local'),
  BOOTSTRAP_ADMIN_SENHA: z.string().min(8).default('trocar-senha-123'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
   
  console.error('Configuração de ambiente inválida:', parsed.error.flatten().fieldErrors);
  throw new Error('Variáveis de ambiente inválidas. Veja backend/.env.example');
}

export type Env = z.infer<typeof envSchema>;

export const env: Env = parsed.data;