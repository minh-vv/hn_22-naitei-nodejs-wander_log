import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  clientURL: process.env.APP_CLIENT_URL || 'http://localhost:3001',
}));