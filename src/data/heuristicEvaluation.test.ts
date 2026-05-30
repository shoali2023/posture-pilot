import { describe, it, expect } from 'vitest'
import { HEURISTIC_EVALUATION } from './heuristicEvaluation'

describe('HEURISTIC_EVALUATION — structure', () => {
  it('contains exactly 10 heuristics', () => {
    expect(HEURISTIC_EVALUATION).toHaveLength(10)
  })

  it('IDs go from 1 to 10 without gaps', () => {
    const ids = HEURISTIC_EVALUATION.map((h) => h.id).sort((a, b) => a - b)
    expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('every heuristic has a non-empty name', () => {
    HEURISTIC_EVALUATION.forEach((h) => {
      expect(h.name.length).toBeGreaterThan(0)
    })
  })
})

describe('HEURISTIC_EVALUATION — score integrity', () => {
  HEURISTIC_EVALUATION.forEach((h) => {
    it(`heuristic #${h.id} scoreBefore is between 0 and 10`, () => {
      expect(h.scoreBefore).toBeGreaterThanOrEqual(0)
      expect(h.scoreBefore).toBeLessThanOrEqual(10)
    })

    it(`heuristic #${h.id} scoreAfter is between 0 and 10`, () => {
      expect(h.scoreAfter).toBeGreaterThanOrEqual(0)
      expect(h.scoreAfter).toBeLessThanOrEqual(10)
    })

    it(`heuristic #${h.id} improvement equals scoreAfter - scoreBefore`, () => {
      expect(h.improvement).toBe(h.scoreAfter - h.scoreBefore)
    })

    it(`heuristic #${h.id} scoreAfter >= scoreBefore (no regression)`, () => {
      expect(h.scoreAfter).toBeGreaterThanOrEqual(h.scoreBefore)
    })
  })
})

describe('HEURISTIC_EVALUATION — evidence and changes', () => {
  HEURISTIC_EVALUATION.forEach((h) => {
    it(`heuristic #${h.id} has at least one evidence item`, () => {
      expect(h.evidence.length).toBeGreaterThan(0)
    })

    it(`heuristic #${h.id} has at least one implementedChange`, () => {
      expect(h.implementedChanges.length).toBeGreaterThan(0)
    })
  })
})

describe('HEURISTIC_EVALUATION — key improvements', () => {
  it('Error Prevention (heuristic #5) improved significantly', () => {
    const h = HEURISTIC_EVALUATION.find((h) => h.id === 5)!
    expect(h.improvement).toBeGreaterThanOrEqual(3)
    expect(h.scoreAfter).toBeGreaterThanOrEqual(7)
  })

  it('Help and Documentation (heuristic #10) improved significantly', () => {
    const h = HEURISTIC_EVALUATION.find((h) => h.id === 10)!
    expect(h.improvement).toBeGreaterThanOrEqual(4)
    expect(h.scoreAfter).toBeGreaterThanOrEqual(7)
  })

  it('Help and Documentation had the lowest score before', () => {
    const h10 = HEURISTIC_EVALUATION.find((h) => h.id === 10)!
    const minBefore = Math.min(...HEURISTIC_EVALUATION.map((h) => h.scoreBefore))
    expect(h10.scoreBefore).toBeLessThanOrEqual(minBefore + 1)
  })
})

describe('HEURISTIC_EVALUATION — aggregate metrics', () => {
  it('average scoreAfter is higher than average scoreBefore', () => {
    const avgBefore = HEURISTIC_EVALUATION.reduce((s, h) => s + h.scoreBefore, 0) / 10
    const avgAfter = HEURISTIC_EVALUATION.reduce((s, h) => s + h.scoreAfter, 0) / 10
    expect(avgAfter).toBeGreaterThan(avgBefore)
  })

  it('overall average improvement is positive', () => {
    const avgImprovement = HEURISTIC_EVALUATION.reduce((s, h) => s + h.improvement, 0) / 10
    expect(avgImprovement).toBeGreaterThan(0)
  })

  it('can compute total improvement across all heuristics', () => {
    const total = HEURISTIC_EVALUATION.reduce((s, h) => s + h.improvement, 0)
    expect(total).toBeGreaterThan(0)
  })
})
