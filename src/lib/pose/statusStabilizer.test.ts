import { describe, it, expect } from 'vitest'
import { PostureStatusStabilizer } from './statusStabilizer'
import type { PostureResult } from '../../types/posture'

function r(status: 'good' | 'warning' | 'bad'): PostureResult {
  return { status, shoulderTilt: 0, trunkAngle: 0, neckOffset: 0, confidence: 0.9, activeConditions: [] }
}

// ── Bootstrap ────────────────────────────────────────────────

describe('PostureStatusStabilizer — bootstrap', () => {
  it('first update returns the result immediately', () => {
    const s = new PostureStatusStabilizer()
    expect(s.update(r('good')).status).toBe('good')
  })

  it('first update can bootstrap with bad status', () => {
    const s = new PostureStatusStabilizer()
    expect(s.update(r('bad')).status).toBe('bad')
  })
})

// ── Same status ──────────────────────────────────────────────

describe('PostureStatusStabilizer — same status updates pass through', () => {
  it('updates metrics immediately when status stays the same', () => {
    const s = new PostureStatusStabilizer()
    s.update(r('good'))
    const result = s.update({ ...r('good'), confidence: 0.75 })
    expect(result.status).toBe('good')
    expect(result.confidence).toBe(0.75)
  })
})

// ── Warning threshold (5 frames) ────────────────────────────

describe('PostureStatusStabilizer — warning threshold = 5', () => {
  it('does NOT switch to warning before 5 consecutive frames', () => {
    const s = new PostureStatusStabilizer()
    s.update(r('good'))
    for (let i = 0; i < 4; i++) {
      expect(s.update(r('warning')).status).toBe('good')
    }
  })

  it('switches to warning exactly on the 5th consecutive frame', () => {
    const s = new PostureStatusStabilizer()
    s.update(r('good'))
    for (let i = 0; i < 4; i++) s.update(r('warning'))
    expect(s.update(r('warning')).status).toBe('warning')
  })
})

// ── Bad threshold (3 frames) — faster ───────────────────────

describe('PostureStatusStabilizer — bad threshold = 3 (fastest)', () => {
  it('does NOT switch to bad before 3 consecutive frames', () => {
    const s = new PostureStatusStabilizer()
    s.update(r('good'))
    s.update(r('bad'))
    expect(s.update(r('bad')).status).toBe('good')
  })

  it('switches to bad on the 3rd consecutive bad frame', () => {
    const s = new PostureStatusStabilizer()
    s.update(r('good'))
    s.update(r('bad'))
    s.update(r('bad'))
    expect(s.update(r('bad')).status).toBe('bad')
  })
})

// ── Good threshold (7 frames) — slowest ─────────────────────

describe('PostureStatusStabilizer — good threshold = 7 (slowest)', () => {
  it('does NOT switch to good before 7 consecutive frames', () => {
    const s = new PostureStatusStabilizer()
    s.update(r('bad'))
    for (let i = 0; i < 6; i++) {
      expect(s.update(r('good')).status).toBe('bad')
    }
  })

  it('switches to good on the 7th consecutive good frame', () => {
    const s = new PostureStatusStabilizer()
    s.update(r('bad'))
    for (let i = 0; i < 6; i++) s.update(r('good'))
    expect(s.update(r('good')).status).toBe('good')
  })
})

// ── Candidate resets when status changes mid-stream ─────────

describe('PostureStatusStabilizer — candidate resets on status change', () => {
  it('switching candidate mid-stream resets the frame count', () => {
    const s = new PostureStatusStabilizer()
    s.update(r('good'))
    // 4 warning frames (not enough for threshold 5)
    for (let i = 0; i < 4; i++) s.update(r('warning'))
    // switch to bad — count resets; 3 bad frames confirm
    s.update(r('bad'))
    s.update(r('bad'))
    expect(s.update(r('bad')).status).toBe('bad')
  })

  it('reverts to original if candidate never reaches threshold', () => {
    const s = new PostureStatusStabilizer()
    s.update(r('good'))
    s.update(r('warning'))  // 1 frame, threshold = 5
    s.update(r('warning'))  // 2
    s.update(r('good'))     // back to good — candidate resets
    // still showing good
    expect(s.update(r('good')).status).toBe('good')
  })
})

// ── Reset ────────────────────────────────────────────────────

describe('PostureStatusStabilizer — reset', () => {
  it('reset() clears state — next call bootstraps immediately', () => {
    const s = new PostureStatusStabilizer()
    s.update(r('good'))
    s.reset()
    expect(s.update(r('warning')).status).toBe('warning')
  })

  it('after reset, thresholds apply normally again', () => {
    const s = new PostureStatusStabilizer()
    s.update(r('warning'))
    s.reset()
    s.update(r('warning')) // bootstrap = warning
    // now try to switch to good — needs 7 frames
    for (let i = 0; i < 6; i++) {
      expect(s.update(r('good')).status).toBe('warning')
    }
    expect(s.update(r('good')).status).toBe('good')
  })
})
