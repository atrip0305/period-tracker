import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { DayLogModule } from './day-log/day-log.module';
import { LogsModule } from './modules/logs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HealthModule,
    PrismaModule,
    DayLogModule,
    LogsModule,
  ],
})
export class AppModule {}
