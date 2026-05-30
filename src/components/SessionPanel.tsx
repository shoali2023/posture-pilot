import type { SessionStats } from '../types/session'
import { formatDuration } from '../lib/session/computeSessionSummary'

interface Props {
  stats: SessionStats
}

export function SessionPanel({ stats }: Props) {
  const total = stats.frameCount > 0 ? stats.frameCount : 1
  const goodPct = ((stats.statusCounts.good / total) * 100).toFixed(1)
  const warnPct = ((stats.statusCounts.warning / total) * 100).toFixed(1)
  const badPct = ((stats.statusCounts.bad / total) * 100).toFixed(1)

  return (
    <div className="session-panel">
      <div className="session-panel__item">
        <span className="session-panel__label">Duration</span>
        <span className="session-panel__value">{formatDuration(stats.elapsedSeconds)}</span>
      </div>
      <div className="session-panel__item">
        <span className="session-panel__label">Frames</span>
        <span className="session-panel__value">{stats.frameCount.toLocaleString()}</span>
      </div>
      <div className="session-panel__item session-panel__item--good">
        <span className="session-panel__label">Good</span>
        <span className="session-panel__value">{goodPct}%</span>
      </div>
      <div className="session-panel__item session-panel__item--warning">
        <span className="session-panel__label">Warning</span>
        <span className="session-panel__value">{warnPct}%</span>
      </div>
      <div className="session-panel__item session-panel__item--bad">
        <span className="session-panel__label">Bad</span>
        <span className="session-panel__value">{badPct}%</span>
      </div>
    </div>
  )
}
