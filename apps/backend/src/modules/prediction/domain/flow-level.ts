export enum FlowLevel {
  NONE = 'NONE',
  SPOTTING = 'SPOTTING',
  LIGHT = 'LIGHT',
  MEDIUM = 'MEDIUM',
  HEAVY = 'HEAVY',
}

export const PERIOD_FLOW_LEVELS = new Set<FlowLevel>([
  FlowLevel.LIGHT,
  FlowLevel.MEDIUM,
  FlowLevel.HEAVY,
]);

export function isPeriodFlow(flow: FlowLevel): boolean {
  return PERIOD_FLOW_LEVELS.has(flow);
}
