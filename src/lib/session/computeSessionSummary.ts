import type { SessionSummary } from '../../types/session'
import type { PostureStatus } from '../../types/posture'

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function computeSessionSummary(
  durationSeconds: number,
  totalFrames: number,
  statusCounts: { good: number; warning: number; bad: number }
): SessionSummary {
  const total = totalFrames > 0 ? totalFrames : 1
  const goodPct = (statusCounts.good / total) * 100
  const warningPct = (statusCounts.warning / total) * 100
  const badPct = (statusCounts.bad / total) * 100

  const dominantStatus: PostureStatus =
    statusCounts.good >= statusCounts.warning && statusCounts.good >= statusCounts.bad
      ? 'good'
      : statusCounts.warning >= statusCounts.bad
        ? 'warning'
        : 'bad'

  const generalRecommendation =
    dominantStatus === 'good'
      ? 'Excellent work! Your posture was predominantly good throughout the session. Keep up the good habits.'
      : dominantStatus === 'warning'
        ? 'Your posture needs some attention. Focus on keeping your shoulders level and your trunk upright in your next session.'
        : 'Significant posture issues were detected. Consider ergonomic adjustments to your workspace and schedule regular breaks to stretch.'

  return {
    durationSeconds,
    totalFrames,
    goodPct,
    warningPct,
    badPct,
    dominantStatus,
    generalRecommendation,
  }
}
