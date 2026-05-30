import type { NormalizedLandmark } from '../../types/posture'

export interface LandmarkSmootherOptions {
  /** EMA weight for position channels (0–1). Higher = faster but more jitter. */
  alpha?: number
  /** EMA weight for visibility channel. */
  visibilityAlpha?: number
  /** After this many consecutive empty frames, clear history and restart. */
  resetAfterMissingFrames?: number
}

/**
 * Exponential Moving Average smoother for MediaPipe landmark arrays.
 *
 * smoothed[t] = alpha * raw[t] + (1 - alpha) * smoothed[t-1]
 *
 * A lower alpha (e.g. 0.2) gives a smoother but slightly delayed result.
 * A higher alpha (e.g. 0.6) tracks faster but retains more jitter.
 * Default 0.35 balances responsiveness with visual stability for desk posture.
 */
export class LandmarkSmoother {
  private prev: NormalizedLandmark[] | null = null
  private missedFrames = 0

  private readonly alpha: number
  private readonly visibilityAlpha: number
  private readonly resetAfterMissingFrames: number

  constructor(options: LandmarkSmootherOptions = {}) {
    this.alpha                    = options.alpha                    ?? 0.35
    this.visibilityAlpha          = options.visibilityAlpha          ?? 0.5
    this.resetAfterMissingFrames  = options.resetAfterMissingFrames  ?? 5
  }

  smooth(landmarks: NormalizedLandmark[] | null): NormalizedLandmark[] | null {
    if (!landmarks || landmarks.length === 0) {
      this.missedFrames += 1
      if (this.missedFrames >= this.resetAfterMissingFrames) {
        this.prev = null
      }
      return null
    }

    this.missedFrames = 0

    // First frame or mismatched length → no history to blend with
    if (!this.prev || this.prev.length !== landmarks.length) {
      this.prev = landmarks
      return landmarks
    }

    const a  = this.alpha
    const av = this.visibilityAlpha

    const smoothed: NormalizedLandmark[] = landmarks.map((lm, i) => {
      const p = this.prev![i]
      return {
        x: a * lm.x + (1 - a) * p.x,
        y: a * lm.y + (1 - a) * p.y,
        z: a * lm.z + (1 - a) * p.z,
        visibility:
          lm.visibility !== undefined && p.visibility !== undefined
            ? av * lm.visibility + (1 - av) * p.visibility
            : lm.visibility,
      }
    })

    this.prev = smoothed
    return smoothed
  }

  reset(): void {
    this.prev = null
    this.missedFrames = 0
  }
}

// ── Metric EMA ───────────────────────────────────────────────

/**
 * Single-value EMA smoother for derived metrics (shoulderTilt, trunkAngle, etc.)
 */
export class ScalarSmoother {
  private prev: number | null = null
  private readonly alpha: number

  constructor(alpha = 0.3) {
    this.alpha = alpha
  }

  smooth(value: number): number {
    if (this.prev === null) {
      this.prev = value
      return value
    }
    const smoothed = this.alpha * value + (1 - this.alpha) * this.prev
    this.prev = smoothed
    return smoothed
  }

  reset(): void {
    this.prev = null
  }
}
