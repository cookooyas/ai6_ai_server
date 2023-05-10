import { Module } from '@nestjs/common';
import { SingerController } from './singer.controller';
import { SingerService } from './singer.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [SingerController],
  providers: [SingerService],
  imports: [PrismaModule],
})
export class SingerModule {}
