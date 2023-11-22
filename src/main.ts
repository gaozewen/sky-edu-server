import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://sky-edu-api.gaozewen.com/graphql',
    ],
    // 仅支持 graphql 的 post 请求
    methods: ['POST'],
  });
  await app.listen(3000);
}
bootstrap();
