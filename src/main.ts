import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './util/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 에러 처리 로직 제대로 안 짬 -> 꼭 짜기
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      // disableErrorMessages: true // 배포할 때 설정해두기
    }),
  );
  setupSwagger(app);
  app.enableCors();
  app.use(cookieParser());
  await app.listen(8000);
}
bootstrap();
