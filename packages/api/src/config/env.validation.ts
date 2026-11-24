import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().min(1).default('7d'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
