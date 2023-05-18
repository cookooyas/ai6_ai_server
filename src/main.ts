import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './util/swagger';
import cookieParser from 'cookie-parser';
import * as process from 'process';

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
  app.enableCors({
    origin: 'http://localhost:5173',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
    credentials: true, // 자격 증명 모드를 허용합니다.
  });
  app.use(cookieParser());
  await app.listen(process.env.SERVER_PORT);
}
bootstrap();
