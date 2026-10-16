import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/aegisflow'),
  JWT_ACCESS_SECRET: z.string().min(16).default('aegisflow_super_secret_access_key_change_in_production_min32chars'),
  JWT_REFRESH_SECRET: z.string().min(16).default('aegisflow_super_secret_refresh_key_change_in_production_min32chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  ENCRYPTION_KEY: z.string().default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),
  OPEN_METEO_BASE_URL: z.string().default('https://api.open-meteo.com/v1/forecast'),
  BUZZER_GATEWAY_URL: z.string().default('http://localhost:5000/api/mock/buzzer'),
  SMS_PROVIDER: z.enum(['mock', 'twilio', 'msg91']).default('mock'),
  VOICE_PROVIDER: z.enum(['mock', 'twilio']).default('mock'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_FROM_NUMBER: z.string().optional(),
  MSG91_AUTH_KEY: z.string().optional(),
  MSG91_SENDER_ID: z.string().optional(),
  RISK_ENGINE_CRON: z.string().default('*/30 * * * *'),
  ESCALATION_CHECK_CRON: z.string().default('*/1 * * * *'),
  SENSOR_HEALTH_CRON: z.string().default('*/5 * * * *')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
