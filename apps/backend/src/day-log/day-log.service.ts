import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DayLogService {
  constructor(private readonly prisma: PrismaService) {}

  async createDayLog(input: {
    date: Date;
    flow: 'NONE' | 'LIGHT' | 'MEDIUM' | 'HEAVY';
    notes?: string;
  }) {
    return this.prisma.dayLog.create({
      data: {
        date: input.date,
        flow: input.flow,
        notes: input.notes,
      },
    });
  }

  async getAllDayLogs() {
    return this.prisma.dayLog.findMany({
      orderBy: { date: 'asc' },
    });
  }
}
