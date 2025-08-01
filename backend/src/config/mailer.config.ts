import { registerAs } from '@nestjs/config';

export default registerAs('mailer', () => ({
  host: process.env.MAILER_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAILER_PORT || '587', 10),
  secure: process.env.MAILER_SECURE === 'true',
  user: process.env.MAILER_USER,
  password: process.env.MAILER_PASSWORD,
  defaultName: process.env.MAILER_DEFAULT_NAME || 'Wander Log',
  defaultEmail: process.env.MAILER_DEFAULT_EMAIL,
  workingDirectory: process.env.MAILER_WORKING_DIRECTORY || process.cwd(),
}));