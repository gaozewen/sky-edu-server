import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://192.168.2.23:5174',
      'http://192.168.1.100:5174',
      'https://sky-edu-api.gaozewen.com',
      'https://sky-edu-pc.gaozewen.com',
      'https://sky-edu-mobile.gaozewen.com',
    ],
    methods: ['POST', 'GET'],
  });
  await app.listen(3000);
}
bootstrap();
