import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await app.listen(3000);
  console.log('Backend listening on port 3000');
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
