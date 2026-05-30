import { describe, it, expect } from 'vitest'
import { LandmarkSmoother, ScalarSmoother } from './smoothing'
import type { NormalizedLandmark } from '../../types/posture'

function lm(x: number, y: number, z: number, visibility?: number): NormalizedLandmark {
  return { x, y, z, visibility }
}

// ── LandmarkSmoother ─────────────────────────────────────────

describe('LandmarkSmoother — first frame', () => {
  it('returns original landmarks unchanged on the first call', () => {
    const smoother = new LandmarkSmoother()
    const input = [lm(0.5, 0.5, 0.1)]
    expect(smoother.smooth(input)).toEqual(input)
  })

  it('returns null when first call receives null', () => {
    const smoother = new LandmarkSmoother()
    expect(smoother.smooth(null)).toBeNull()
  })

  it('returns null when first call receives empty array', () => {
    const smoother = new LandmarkSmoother()
    expect(smoother.smooth([])).toBeNull()
  })
})

describe('LandmarkSmoother — EMA blending', () => {
  it('second frame blends x toward current (alpha 0.5)', () => {
    const smoother = new LandmarkSmoother({ alpha: 0.5 })
    smoother.smooth([lm(0, 0, 0)])          // prev = (0,0,0)
    const result = smoother.smooth([lm(1, 1, 0)])!
    // 0.5*1 + 0.5*0 = 0.5
    expect(result[0].x).toBeCloseTo(0.5)
    expect(result[0].y).toBeCloseTo(0.5)
  })

  it('smooths the visibility channel separately (visibilityAlpha 0.5)', () => {
    const smoother = new LandmarkSmoother({ alpha: 0.5, visibilityAlpha: 0.5 })
    smoother.smooth([lm(0, 0, 0, 0)])
    const result = smoother.smooth([lm(0, 0, 0, 1)])!
    expect(result[0].visibility).toBeCloseTo(0.5)
  })

  it('leaves visibility undefined when both frames have undefined visibility', () => {
    const smoother = new LandmarkSmoother({ alpha: 0.5 })
    smoother.smooth([lm(0, 0, 0)])
    const result = smoother.smooth([lm(1, 1, 0)])!
    expect(result[0].visibility).toBeUndefined()
  })

  it('converges toward the current value after many frames', () => {
    const smoother = new LandmarkSmoother({ alpha: 0.5 })
    smoother.smooth([lm(0, 0, 0)])
    let last = smoother.smooth([lm(10, 0, 0)])!
    for (let i = 0; i < 20; i++) {
      last = smoother.smooth([lm(10, 0, 0)])!
    }
    expect(last[0].x).toBeCloseTo(10, 1)
  })
})

describe('LandmarkSmoother — missing frames', () => {
  it('null input returns null and does not affect history immediately', () => {
    const smoother = new LandmarkSmoother()
    smoother.smooth([lm(0.5, 0.5, 0)])
    expect(smoother.smooth(null)).toBeNull()
  })

  it('after resetAfterMissingFrames nulls, next valid frame is returned as-is', () => {
    const smoother = new LandmarkSmoother({ alpha: 0.5, resetAfterMissingFrames: 3 })
    smoother.smooth([lm(0, 0, 0)])
    smoother.smooth(null)
    smoother.smooth(null)
    smoother.smooth(null)
    // history cleared — next frame returns unchanged
    const next = [lm(1, 1, 0)]
    expect(smoother.smooth(next)).toEqual(next)
  })

  it('missing counter resets when valid landmarks resume', () => {
    const smoother = new LandmarkSmoother({ alpha: 0.5, resetAfterMissingFrames: 5 })
    smoother.smooth([lm(0, 0, 0)])
    smoother.smooth(null)
    smoother.smooth(null) // 2 missed, not yet at threshold
    // Resume — should still blend (history not cleared)
    const result = smoother.smooth([lm(2, 2, 0)])!
    // 0.5*2 + 0.5*0 = 1
    expect(result[0].x).toBeCloseTo(1)
  })
})

describe('LandmarkSmoother — reset and length mismatch', () => {
  it('reset() clears history — next frame returns as-is', () => {
    const smoother = new LandmarkSmoother({ alpha: 0.5 })
    smoother.smooth([lm(0, 0, 0)])
    smoother.reset()
    const next = [lm(1, 1, 0)]
    expect(smoother.smooth(next)).toEqual(next)
  })

  it('mismatched array length resets history and returns new landmarks unchanged', () => {
    const smoother = new LandmarkSmoother({ alpha: 0.5 })
    smoother.smooth([lm(0, 0, 0)])
    const next = [lm(1, 1, 0), lm(2, 2, 0)]
    expect(smoother.smooth(next)).toEqual(next)
  })

  it('after length-mismatch reset, subsequent frame blends normally', () => {
    const smoother = new LandmarkSmoother({ alpha: 0.5 })
    smoother.smooth([lm(0, 0, 0)])
    smoother.smooth([lm(0, 0, 0), lm(0, 0, 0)]) // mismatch → reset with 2 lm
    const result = smoother.smooth([lm(2, 2, 0), lm(2, 2, 0)])!
    // 0.5*2 + 0.5*0 = 1
    expect(result[0].x).toBeCloseTo(1)
  })
})

// ── ScalarSmoother ───────────────────────────────────────────

describe('ScalarSmoother', () => {
  it('first call returns the original value', () => {
    const s = new ScalarSmoother()
    expect(s.smooth(5)).toBe(5)
  })

  it('second call applies EMA (alpha 0.5)', () => {
    const s = new ScalarSmoother(0.5)
    s.smooth(0)              // prev = 0
    expect(s.smooth(2)).toBeCloseTo(1) // 0.5*2 + 0.5*0 = 1
  })

  it('converges toward the target over many calls', () => {
    const s = new ScalarSmoother(0.4)
    s.smooth(0)
    let v = 0
    for (let i = 0; i < 30; i++) v = s.smooth(100)
    expect(v).toBeGreaterThan(99)
  })

  it('reset() clears state — next call returns raw value', () => {
    const s = new ScalarSmoother(0.5)
    s.smooth(0)
    s.reset()
    expect(s.smooth(42)).toBe(42)
  })

  it('works with negative values', () => {
    const s = new ScalarSmoother(0.5)
    s.smooth(-10)
    expect(s.smooth(0)).toBeCloseTo(-5)
  })
})
