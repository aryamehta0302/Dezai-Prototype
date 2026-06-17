// Dezai Backend — Entry Point

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  await app.listen(3001);
  console.log('Dezai Backend listening on port 3001');
}

bootstrap();
