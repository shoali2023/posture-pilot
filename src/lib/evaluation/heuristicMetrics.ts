import type { HeuristicMetric } from '../../data/heuristicEvaluation'

export function calculateAverageBefore(metrics: HeuristicMetric[]): number {
  if (metrics.length === 0) return 0
  return metrics.reduce((sum, m) => sum + m.scoreBefore, 0) / metrics.length
}

export function calculateAverageAfter(metrics: HeuristicMetric[]): number {
  if (metrics.length === 0) return 0
  return metrics.reduce((sum, m) => sum + m.scoreAfter, 0) / metrics.length
}

export function calculateAverageImprovement(metrics: HeuristicMetric[]): number {
  if (metrics.length === 0) return 0
  return metrics.reduce((sum, m) => sum + m.improvement, 0) / metrics.length
}

export function getWeakestHeuristicsBefore(
  metrics: HeuristicMetric[],
  count = 3
): HeuristicMetric[] {
  return [...metrics].sort((a, b) => a.scoreBefore - b.scoreBefore).slice(0, count)
}

export function getStrongestHeuristicsAfter(
  metrics: HeuristicMetric[],
  count = 3
): HeuristicMetric[] {
  return [...metrics].sort((a, b) => b.scoreAfter - a.scoreAfter).slice(0, count)
}
