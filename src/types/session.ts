export type SessionStatus = 'idle' | 'running' | 'paused' | 'stopped'

export interface SessionStats {
  elapsedSeconds: number
  frameCount: number
  statusCounts: {
    good: number
    warning: number
    bad: number
  }
}

export interface SessionSummary {
  durationSeconds: number
  totalFrames: number
  goodPct: number
  warningPct: number
  badPct: number
  dominantStatus: 'good' | 'warning' | 'bad'
  generalRecommendation: string
}

/**
 * Snapshot of in-progress session data taken when the camera is paused
 * (e.g. user switches tabs). Allows resuming a session later.
 */
export interface SessionCheckpoint {
  frameCount: number
  statusCounts: { good: number; warning: number; bad: number }
  conditionFrequency: Record<string, number>
  /** Seconds already elapsed before this checkpoint */
  elapsedSeconds: number
  startedAt: string
}
