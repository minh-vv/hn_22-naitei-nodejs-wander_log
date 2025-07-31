import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { I18nValidationPipe, I18nValidationExceptionFilter } from 'nestjs-i18n';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
    credentials: true,
  });

  app.useGlobalPipes(new I18nValidationPipe({
    whitelist: true,
    transform: true,
  }));

  app.useGlobalFilters(new I18nValidationExceptionFilter({
    detailedErrors: false,
  }));
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
