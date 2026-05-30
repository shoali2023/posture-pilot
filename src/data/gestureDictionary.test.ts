import { describe, it, expect } from 'vitest'
import { GESTURE_DICTIONARY, getCondition } from './gestureDictionary'
import type { GestureDefinition } from '../types/gesture'

const REQUIRED_IDS = [
  'upright_posture',
  'shoulder_imbalance',
  'trunk_lean',
  'head_misalignment',
  'low_visibility',
]

describe('GESTURE_DICTIONARY — structure', () => {
  it('contains at least 5 conditions', () => {
    expect(GESTURE_DICTIONARY.length).toBeGreaterThanOrEqual(5)
  })

  it('contains all required condition IDs', () => {
    const ids = GESTURE_DICTIONARY.map((g) => g.id)
    REQUIRED_IDS.forEach((id) => {
      expect(ids).toContain(id)
    })
  })

  it('has no duplicate IDs', () => {
    const ids = GESTURE_DICTIONARY.map((g) => g.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})

describe('GESTURE_DICTIONARY — required fields per entry', () => {
  GESTURE_DICTIONARY.forEach((g: GestureDefinition) => {
    describe(`condition: ${g.id}`, () => {
      it('has a non-empty id', () => expect(g.id).toBeTruthy())
      it('has a non-empty name', () => expect(g.name).toBeTruthy())
      it('has a non-empty description', () => expect(g.description).toBeTruthy())
      it('has usedLandmarks array with at least one entry', () => {
        expect(Array.isArray(g.usedLandmarks)).toBe(true)
        expect(g.usedLandmarks.length).toBeGreaterThan(0)
      })
      it('has ruleSummary array with at least one entry', () => {
        expect(Array.isArray(g.ruleSummary)).toBe(true)
        expect(g.ruleSummary.length).toBeGreaterThan(0)
      })
      it('has a non-empty userInstruction', () => expect(g.userInstruction).toBeTruthy())
      it('has a non-empty feedback', () => expect(g.feedback).toBeTruthy())
      it('has a valid severity', () => {
        expect(['good', 'warning', 'bad']).toContain(g.severity)
      })
      it('has heuristicPurpose array with at least one entry', () => {
        expect(Array.isArray(g.heuristicPurpose)).toBe(true)
        expect(g.heuristicPurpose.length).toBeGreaterThan(0)
      })
    })
  })
})

describe('GESTURE_DICTIONARY — semantic rules', () => {
  it('low_visibility has severity bad', () => {
    const lv = GESTURE_DICTIONARY.find((g) => g.id === 'low_visibility')!
    expect(lv.severity).toBe('bad')
  })

  it('upright_posture has severity good', () => {
    const up = GESTURE_DICTIONARY.find((g) => g.id === 'upright_posture')!
    expect(up.severity).toBe('good')
  })

  it('shoulder_imbalance, trunk_lean, head_misalignment have severity warning', () => {
    const issueIds = ['shoulder_imbalance', 'trunk_lean', 'head_misalignment']
    issueIds.forEach((id) => {
      const g = GESTURE_DICTIONARY.find((g) => g.id === id)!
      expect(g.severity).toBe('warning')
    })
  })

  it('main visible texts are human-readable (not raw IDs)', () => {
    GESTURE_DICTIONARY.forEach((g) => {
      expect(g.name).not.toMatch(/^[a-z_]+$/)        // not a raw snake_case ID
      expect(g.userInstruction.length).toBeGreaterThan(20)
      expect(g.feedback.length).toBeGreaterThan(10)
    })
  })
})

describe('getCondition', () => {
  it('returns a PostureCondition with the correct id', () => {
    const c = getCondition('upright_posture')
    expect(c.id).toBe('upright_posture')
  })

  it('returns the correct name from the dictionary', () => {
    const c = getCondition('shoulder_imbalance')
    const def = GESTURE_DICTIONARY.find((g) => g.id === 'shoulder_imbalance')!
    expect(c.name).toBe(def.name)
  })

  it('includes userInstruction in the returned condition', () => {
    const c = getCondition('trunk_lean')
    expect(c.userInstruction).toBeTruthy()
  })

  it('throws for an unknown ID', () => {
    // @ts-expect-error — intentional invalid ID for testing
    expect(() => getCondition('unknown_id')).toThrow()
  })
})
