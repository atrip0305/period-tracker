import { Module } from '@nestjs/common';
import { DayLogService } from './day-log.service';

@Module({
  providers: [DayLogService],
  exports: [DayLogService],
})
export class DayLogModule {}
