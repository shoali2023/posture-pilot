import type { SessionSummary as SessionSummaryData } from '../types/session'
import { FeedbackBadge } from './FeedbackBadge'
import { formatDuration } from '../lib/session/computeSessionSummary'

interface Props {
  summary: SessionSummaryData
}

function StatusBar({ pct, status }: { pct: number; status: 'good' | 'warning' | 'bad' }) {
  return (
    <div className="summary-bar">
      <div
        className={`summary-bar__fill summary-bar__fill--${status}`}
        style={{ width: `${Math.max(pct, 0).toFixed(1)}%` }}
      />
    </div>
  )
}

export function SessionSummary({ summary }: Props) {
  return (
    <div className="session-summary">
      <div className="session-summary__header">
        <h3 className="session-summary__title">Session Summary</h3>
        <FeedbackBadge status={summary.dominantStatus} />
      </div>

      <div className="session-summary__stats">
        <div className="session-summary__stat">
          <span className="session-summary__label">Duration</span>
          <span className="session-summary__value">{formatDuration(summary.durationSeconds)}</span>
        </div>
        <div className="session-summary__stat">
          <span className="session-summary__label">Frames analysed</span>
          <span className="session-summary__value">{summary.totalFrames.toLocaleString()}</span>
        </div>
      </div>

      <div className="session-summary__breakdown">
        <div className="session-summary__row">
          <span className="session-summary__breakdown-label session-summary__breakdown-label--good">
            Good
          </span>
          <StatusBar pct={summary.goodPct} status="good" />
          <span className="session-summary__pct">{summary.goodPct.toFixed(1)}%</span>
        </div>
        <div className="session-summary__row">
          <span className="session-summary__breakdown-label session-summary__breakdown-label--warning">
            Warning
          </span>
          <StatusBar pct={summary.warningPct} status="warning" />
          <span className="session-summary__pct">{summary.warningPct.toFixed(1)}%</span>
        </div>
        <div className="session-summary__row">
          <span className="session-summary__breakdown-label session-summary__breakdown-label--bad">
            Bad
          </span>
          <StatusBar pct={summary.badPct} status="bad" />
          <span className="session-summary__pct">{summary.badPct.toFixed(1)}%</span>
        </div>
      </div>

      <p className="session-summary__recommendation">{summary.generalRecommendation}</p>
    </div>
  )
}
