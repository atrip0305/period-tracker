import { Body, Controller, Post } from '@nestjs/common';
import { PredictionService } from './prediction.service';
import { DayLog } from './domain/day-log';
import { FlowLevel } from './domain/flow-level';

interface AnalyzeRequest {
  logs: Array<{
    date: string;
    flow: FlowLevel;
  }>;
}

@Controller('prediction')
export class PredictionController {
  constructor(
    private readonly predictionService: PredictionService,
  ) {}

  @Post('analyze')
  analyze(@Body() body: AnalyzeRequest) {
    const logs: DayLog[] = (body.logs ?? []).map((log) => ({
      date: log.date,
      flowLevel: log.flow,
    }));

    return this.predictionService.analyze(logs);
  }
}