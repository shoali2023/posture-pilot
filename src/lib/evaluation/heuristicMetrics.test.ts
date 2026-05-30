import { describe, it, expect } from 'vitest'
import {
  calculateAverageBefore,
  calculateAverageAfter,
  calculateAverageImprovement,
  getWeakestHeuristicsBefore,
  getStrongestHeuristicsAfter,
} from './heuristicMetrics'
import { HEURISTIC_EVALUATION } from '../../data/heuristicEvaluation'
import type { HeuristicMetric } from '../../data/heuristicEvaluation'

const SAMPLE: HeuristicMetric[] = [
  {
    id: 1, name: 'A', statusBefore: 'weak', statusAfter: 'good',
    scoreBefore: 3, scoreAfter: 8, improvement: 5, evidence: ['e1'], implementedChanges: ['c1'],
  },
  {
    id: 2, name: 'B', statusBefore: 'partial', statusAfter: 'good',
    scoreBefore: 5, scoreAfter: 7, improvement: 2, evidence: ['e2'], implementedChanges: ['c2'],
  },
  {
    id: 3, name: 'C', statusBefore: 'absent', statusAfter: 'partial',
    scoreBefore: 2, scoreAfter: 6, improvement: 4, evidence: ['e3'], implementedChanges: ['c3'],
  },
]

describe('calculateAverageBefore', () => {
  it('returns correct average of scoreBefore values', () => {
    // (3 + 5 + 2) / 3 = 10/3 ≈ 3.33
    expect(calculateAverageBefore(SAMPLE)).toBeCloseTo(10 / 3)
  })

  it('returns 0 for empty input', () => {
    expect(calculateAverageBefore([])).toBe(0)
  })
})

describe('calculateAverageAfter', () => {
  it('returns correct average of scoreAfter values', () => {
    // (8 + 7 + 6) / 3 = 21/3 = 7
    expect(calculateAverageAfter(SAMPLE)).toBeCloseTo(7)
  })

  it('returns 0 for empty input', () => {
    expect(calculateAverageAfter([])).toBe(0)
  })
})

describe('calculateAverageImprovement', () => {
  it('returns correct average improvement', () => {
    // (5 + 2 + 4) / 3 = 11/3 ≈ 3.67
    expect(calculateAverageImprovement(SAMPLE)).toBeCloseTo(11 / 3)
  })

  it('equals calculateAverageAfter - calculateAverageBefore', () => {
    const improvement = calculateAverageImprovement(SAMPLE)
    const derived = calculateAverageAfter(SAMPLE) - calculateAverageBefore(SAMPLE)
    expect(improvement).toBeCloseTo(derived)
  })

  it('returns 0 for empty input', () => {
    expect(calculateAverageImprovement([])).toBe(0)
  })
})

describe('getWeakestHeuristicsBefore', () => {
  it('returns the requested number of heuristics', () => {
    expect(getWeakestHeuristicsBefore(SAMPLE, 2)).toHaveLength(2)
  })

  it('returns heuristics sorted by scoreBefore ascending', () => {
    const result = getWeakestHeuristicsBefore(SAMPLE, 3)
    expect(result[0].scoreBefore).toBeLessThanOrEqual(result[1].scoreBefore)
    expect(result[1].scoreBefore).toBeLessThanOrEqual(result[2].scoreBefore)
  })

  it('first result has the lowest scoreBefore', () => {
    const minScore = Math.min(...SAMPLE.map((h) => h.scoreBefore))
    expect(getWeakestHeuristicsBefore(SAMPLE, 1)[0].scoreBefore).toBe(minScore)
  })

  it('defaults to top 3', () => {
    expect(getWeakestHeuristicsBefore(SAMPLE)).toHaveLength(3)
  })
})

describe('getStrongestHeuristicsAfter', () => {
  it('returns heuristics sorted by scoreAfter descending', () => {
    const result = getStrongestHeuristicsAfter(SAMPLE, 3)
    expect(result[0].scoreAfter).toBeGreaterThanOrEqual(result[1].scoreAfter)
    expect(result[1].scoreAfter).toBeGreaterThanOrEqual(result[2].scoreAfter)
  })

  it('first result has the highest scoreAfter', () => {
    const maxScore = Math.max(...SAMPLE.map((h) => h.scoreAfter))
    expect(getStrongestHeuristicsAfter(SAMPLE, 1)[0].scoreAfter).toBe(maxScore)
  })
})

describe('metrics on real HEURISTIC_EVALUATION data', () => {
  it('averageAfter > averageBefore for the real dataset', () => {
    expect(calculateAverageAfter(HEURISTIC_EVALUATION))
      .toBeGreaterThan(calculateAverageBefore(HEURISTIC_EVALUATION))
  })

  it('average improvement is positive', () => {
    expect(calculateAverageImprovement(HEURISTIC_EVALUATION)).toBeGreaterThan(0)
  })

  it('weakest heuristic before has lowest scoreBefore', () => {
    const weakest = getWeakestHeuristicsBefore(HEURISTIC_EVALUATION, 1)[0]
    const minScore = Math.min(...HEURISTIC_EVALUATION.map((h) => h.scoreBefore))
    expect(weakest.scoreBefore).toBe(minScore)
  })
})
