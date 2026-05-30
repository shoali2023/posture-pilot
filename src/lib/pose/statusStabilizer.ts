import type { PostureResult } from '../../types/posture'

/**
 * Hysteresis filter for posture status.
 *
 * Prevents rapid flickering between good/warning/bad by requiring a
 * new status to hold for N consecutive frames before it becomes stable.
 *
 * Asymmetric thresholds:
 *  - 'bad'  is confirmed quickly (3 frames) — we don't delay problem visibility
 *  - 'good' requires more frames (7)       — avoids false "all clear" signals
 *  - 'warning' sits in the middle (5)
 */
export class PostureStatusStabilizer {
  private stable: PostureResult | null = null
  private candidate: PostureResult | null = null
  private candidateFrames = 0

  private readonly thresholds: Record<string, number>

  constructor(thresholds?: Partial<Record<'good' | 'warning' | 'bad', number>>) {
    this.thresholds = {
      good:    thresholds?.good    ?? 7,
      warning: thresholds?.warning ?? 5,
      bad:     thresholds?.bad     ?? 3,
    }
  }

  update(next: PostureResult): PostureResult {
    // Bootstrap
    if (!this.stable) {
      this.stable = next
      return next
    }

    // No status change — update conditions/metrics on stable result
    if (next.status === this.stable.status) {
      this.stable = next
      this.candidate = null
      this.candidateFrames = 0
      return this.stable
    }

    // Status differs from stable — accumulate candidate frames
    if (this.candidate?.status !== next.status) {
      this.candidate = next
      this.candidateFrames = 1
    } else {
      this.candidateFrames += 1
      this.candidate = next // keep latest metrics
    }

    const threshold = this.thresholds[next.status] ?? 5

    if (this.candidateFrames >= threshold) {
      this.stable = next
      this.candidate = null
      this.candidateFrames = 0
    }

    return this.stable
  }

  reset(): void {
    this.stable = null
    this.candidate = null
    this.candidateFrames = 0
  }
}
