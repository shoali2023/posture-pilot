import { describe, it, expect } from 'vitest'
import { analyzePosture, calculateAngleFromVertical, calculateAverageVisibility } from './postureMath'
import { LM } from './landmarkUtils'
import type { NormalizedLandmark } from '../../types/posture'

// ── Landmark factory ────────────────────────────────────────────────────────
const DEFAULT_LM: NormalizedLandmark = { x: 0.5, y: 0.5, z: 0, visibility: 0.9 }

function makeLandmarks(
  overrides: Partial<Record<number, Partial<NormalizedLandmark>>>
): NormalizedLandmark[] {
  const arr: NormalizedLandmark[] = Array.from({ length: 33 }, () => ({ ...DEFAULT_LM }))
  Object.entries(overrides).forEach(([idx, partial]) => {
    arr[Number(idx)] = { ...DEFAULT_LM, ...partial }
  })
  return arr
}

// Landmark sets for each test scenario
// NOTE: y increases downward in image coords. Hips (y≈0.70) are below shoulders (y≈0.35).
const UPRIGHT = makeLandmarks({
  [LM.NOSE]:           { x: 0.50, y: 0.15, visibility: 0.95 },
  [LM.LEFT_SHOULDER]:  { x: 0.40, y: 0.35, visibility: 0.95 },
  [LM.RIGHT_SHOULDER]: { x: 0.60, y: 0.35, visibility: 0.95 },
  [LM.LEFT_HIP]:       { x: 0.42, y: 0.70, visibility: 0.90 },
  [LM.RIGHT_HIP]:      { x: 0.58, y: 0.70, visibility: 0.90 },
})

const SHOULDER_IMBALANCE = makeLandmarks({
  [LM.NOSE]:           { x: 0.50, y: 0.15, visibility: 0.95 },
  [LM.LEFT_SHOULDER]:  { x: 0.40, y: 0.35, visibility: 0.95 },
  [LM.RIGHT_SHOULDER]: { x: 0.60, y: 0.43, visibility: 0.95 }, // tilt = 0.08 > 0.06
  [LM.LEFT_HIP]:       { x: 0.42, y: 0.70, visibility: 0.90 },
  [LM.RIGHT_HIP]:      { x: 0.58, y: 0.70, visibility: 0.90 },
})

const TRUNK_LEAN = makeLandmarks({
  [LM.NOSE]:           { x: 0.62, y: 0.15, visibility: 0.95 },
  [LM.LEFT_SHOULDER]:  { x: 0.52, y: 0.35, visibility: 0.95 },
  [LM.RIGHT_SHOULDER]: { x: 0.72, y: 0.35, visibility: 0.95 }, // shoulderMid.x = 0.62
  [LM.LEFT_HIP]:       { x: 0.42, y: 0.70, visibility: 0.90 },
  [LM.RIGHT_HIP]:      { x: 0.58, y: 0.70, visibility: 0.90 }, // hipMid.x = 0.50 → dx=0.12
})

const HEAD_MISALIGNMENT = makeLandmarks({
  [LM.NOSE]:           { x: 0.65, y: 0.15, visibility: 0.95 }, // neckOffset = 0.15 > 0.10
  [LM.LEFT_SHOULDER]:  { x: 0.40, y: 0.35, visibility: 0.95 },
  [LM.RIGHT_SHOULDER]: { x: 0.60, y: 0.35, visibility: 0.95 },
  [LM.LEFT_HIP]:       { x: 0.42, y: 0.70, visibility: 0.90 },
  [LM.RIGHT_HIP]:      { x: 0.58, y: 0.70, visibility: 0.90 },
})

const MULTIPLE_ISSUES = makeLandmarks({
  [LM.NOSE]:           { x: 0.62, y: 0.15, visibility: 0.95 },
  [LM.LEFT_SHOULDER]:  { x: 0.52, y: 0.35, visibility: 0.95 },
  [LM.RIGHT_SHOULDER]: { x: 0.72, y: 0.44, visibility: 0.95 }, // tilt=0.09>0.06 + lean
  [LM.LEFT_HIP]:       { x: 0.42, y: 0.70, visibility: 0.90 },
  [LM.RIGHT_HIP]:      { x: 0.58, y: 0.70, visibility: 0.90 },
})

const LOW_VISIBILITY = makeLandmarks({
  [LM.NOSE]:           { x: 0.50, y: 0.15, visibility: 0.25 },
  [LM.LEFT_SHOULDER]:  { x: 0.40, y: 0.35, visibility: 0.25 },
  [LM.RIGHT_SHOULDER]: { x: 0.60, y: 0.35, visibility: 0.25 },
  [LM.LEFT_HIP]:       { x: 0.42, y: 0.70, visibility: 0.25 },
  [LM.RIGHT_HIP]:      { x: 0.58, y: 0.70, visibility: 0.25 },
})

// ── Math helper tests ───────────────────────────────────────────────────────
describe('calculateAngleFromVertical', () => {
  it('returns 0° for a perfectly vertical line (hip below shoulder)', () => {
    // Shoulder at y=0.35, hip at y=0.70 → dx=0, |dy|=0.35
    const angle = calculateAngleFromVertical(
      { x: 0.5, y: 0.70 },
      { x: 0.5, y: 0.35 }
    )
    expect(angle).toBeCloseTo(0, 1)
  })

  it('returns 90° for a perfectly horizontal line', () => {
    const angle = calculateAngleFromVertical({ x: 0.3, y: 0.5 }, { x: 0.8, y: 0.5 })
    expect(angle).toBeCloseTo(90, 1)
  })

  it('returns ~15° for a noticeably leaning trunk', () => {
    // dx=0.12, |dy|=0.35
    const angle = calculateAngleFromVertical(
      { x: 0.50, y: 0.70 },
      { x: 0.62, y: 0.35 }
    )
    expect(angle).toBeGreaterThan(15)
    expect(angle).toBeLessThan(30)
  })
})

describe('calculateAverageVisibility', () => {
  it('returns 1.0 when visibility is undefined (defaults to visible)', () => {
    const lms: NormalizedLandmark[] = [{ x: 0.5, y: 0.5, z: 0 }]
    expect(calculateAverageVisibility(lms, [0])).toBe(1)
  })

  it('returns the correct average of visibility values', () => {
    const lms = makeLandmarks({ 0: { visibility: 0.8 }, 1: { visibility: 0.6 } })
    expect(calculateAverageVisibility(lms, [0, 1])).toBeCloseTo(0.7)
  })
})

// ── analyzePosture tests ────────────────────────────────────────────────────
describe('analyzePosture — upright posture', () => {
  it('returns status good', () => {
    expect(analyzePosture(UPRIGHT).status).toBe('good')
  })

  it('includes upright_posture in activeConditions', () => {
    const ids = analyzePosture(UPRIGHT).activeConditions.map((c) => c.id)
    expect(ids).toContain('upright_posture')
  })

  it('does NOT include any issue condition', () => {
    const ids = analyzePosture(UPRIGHT).activeConditions.map((c) => c.id)
    expect(ids).not.toContain('shoulder_imbalance')
    expect(ids).not.toContain('trunk_lean')
    expect(ids).not.toContain('head_misalignment')
  })

  it('shoulderTilt is below threshold', () => {
    expect(analyzePosture(UPRIGHT).shoulderTilt).toBeLessThanOrEqual(0.06)
  })

  it('trunkAngle is below threshold', () => {
    expect(analyzePosture(UPRIGHT).trunkAngle).toBeLessThanOrEqual(15)
  })

  it('confidence is high', () => {
    expect(analyzePosture(UPRIGHT).confidence).toBeGreaterThan(0.5)
  })
})

describe('analyzePosture — shoulder imbalance', () => {
  it('returns status warning (single issue)', () => {
    expect(analyzePosture(SHOULDER_IMBALANCE).status).toBe('warning')
  })

  it('includes shoulder_imbalance in activeConditions', () => {
    const ids = analyzePosture(SHOULDER_IMBALANCE).activeConditions.map((c) => c.id)
    expect(ids).toContain('shoulder_imbalance')
  })

  it('does NOT include upright_posture', () => {
    const ids = analyzePosture(SHOULDER_IMBALANCE).activeConditions.map((c) => c.id)
    expect(ids).not.toContain('upright_posture')
  })

  it('shoulderTilt exceeds threshold', () => {
    expect(analyzePosture(SHOULDER_IMBALANCE).shoulderTilt).toBeGreaterThan(0.06)
  })
})

describe('analyzePosture — trunk lean', () => {
  it('returns status warning (single issue)', () => {
    expect(analyzePosture(TRUNK_LEAN).status).toBe('warning')
  })

  it('includes trunk_lean in activeConditions', () => {
    const ids = analyzePosture(TRUNK_LEAN).activeConditions.map((c) => c.id)
    expect(ids).toContain('trunk_lean')
  })

  it('trunkAngle exceeds 15°', () => {
    expect(analyzePosture(TRUNK_LEAN).trunkAngle).toBeGreaterThan(15)
  })

  it('does NOT flag shoulder_imbalance (shoulders are level)', () => {
    const ids = analyzePosture(TRUNK_LEAN).activeConditions.map((c) => c.id)
    expect(ids).not.toContain('shoulder_imbalance')
  })
})

describe('analyzePosture — head misalignment', () => {
  it('returns status warning (single issue)', () => {
    expect(analyzePosture(HEAD_MISALIGNMENT).status).toBe('warning')
  })

  it('includes head_misalignment in activeConditions', () => {
    const ids = analyzePosture(HEAD_MISALIGNMENT).activeConditions.map((c) => c.id)
    expect(ids).toContain('head_misalignment')
  })

  it('neckOffset exceeds threshold', () => {
    expect(analyzePosture(HEAD_MISALIGNMENT).neckOffset).toBeGreaterThan(0.10)
  })
})

describe('analyzePosture — multiple issues', () => {
  it('returns status bad (2+ issues)', () => {
    expect(analyzePosture(MULTIPLE_ISSUES).status).toBe('bad')
  })

  it('includes shoulder_imbalance AND trunk_lean', () => {
    const ids = analyzePosture(MULTIPLE_ISSUES).activeConditions.map((c) => c.id)
    expect(ids).toContain('shoulder_imbalance')
    expect(ids).toContain('trunk_lean')
  })

  it('has at least 2 active conditions', () => {
    expect(analyzePosture(MULTIPLE_ISSUES).activeConditions.length).toBeGreaterThanOrEqual(2)
  })
})

describe('analyzePosture — low visibility', () => {
  it('returns status bad', () => {
    expect(analyzePosture(LOW_VISIBILITY).status).toBe('bad')
  })

  it('includes low_visibility in activeConditions', () => {
    const ids = analyzePosture(LOW_VISIBILITY).activeConditions.map((c) => c.id)
    expect(ids).toContain('low_visibility')
  })

  it('does NOT return upright_posture when visibility is low', () => {
    const ids = analyzePosture(LOW_VISIBILITY).activeConditions.map((c) => c.id)
    expect(ids).not.toContain('upright_posture')
  })

  it('confidence is below 0.5', () => {
    expect(analyzePosture(LOW_VISIBILITY).confidence).toBeLessThan(0.5)
  })
})

describe('analyzePosture — missing/incomplete landmarks', () => {
  it('handles an empty array without throwing', () => {
    expect(() => analyzePosture([])).not.toThrow()
  })

  it('returns low_visibility for an incomplete array', () => {
    const short: NormalizedLandmark[] = Array.from({ length: 5 }, () => DEFAULT_LM)
    const result = analyzePosture(short)
    const ids = result.activeConditions.map((c) => c.id)
    expect(ids).toContain('low_visibility')
  })

  it('does NOT return upright_posture for incomplete landmarks', () => {
    const result = analyzePosture([])
    const ids = result.activeConditions.map((c) => c.id)
    expect(ids).not.toContain('upright_posture')
  })
})
