import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from './logger';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']).optional(), // To skipt while using drizzle commands
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  REDIS_HOST: z.string(),
  ALPHAVANTAGE_API_KEY: z.string(),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
});

const result = envVarsSchema.safeParse(process.env);

if (!result.success) {
  logger.error('Misconfigured environment variables:');

  for (const issue of result.error.issues) {
    const path = issue.path.join('.') || '(root)';
    logger.error(`${path}: ${issue.message}`);
  }

  process.exit(1);
}

const envVars = result.data;
const { DATABASE_URL } = envVars;
const databaseUrl = DATABASE_URL;

export const env = {
  mode: envVars.NODE_ENV,
  port: envVars.PORT,
  redis: envVars.REDIS_HOST,
  alphaVantage: envVars.ALPHAVANTAGE_API_KEY,
  db: {
    url: databaseUrl,
  },
  frontend: {
    url: envVars.FRONTEND_URL,
  },
};
