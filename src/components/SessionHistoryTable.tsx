import type { SessionRecord } from '../types/sessionHistory'
import { GESTURE_DICTIONARY } from '../data/gestureDictionary'
import { formatDuration } from '../lib/session/computeSessionSummary'

const CONDITION_NAMES: Record<string, string> = Object.fromEntries(
  GESTURE_DICTIONARY.map(g => [g.id, g.name])
)

interface Props {
  records: SessionRecord[]
  onDelete?: (id: string) => void
}

export function SessionHistoryTable({ records, onDelete }: Props) {
  if (records.length === 0) {
    return (
      <p className="history-table__empty">
        No sessions recorded yet. Complete a session to see your history here.
      </p>
    )
  }

  return (
    <div className="history-table-wrapper">
      <table className="history-table">
        <thead>
          <tr>
            <th>Date &amp; time</th>
            <th>Duration</th>
            <th>Good</th>
            <th>Warning</th>
            <th>Bad</th>
            <th>Top issue</th>
            {onDelete && <th />}
          </tr>
        </thead>
        <tbody>
          {records.map(r => {
            const started = new Date(r.startedAt)
            const topConditionId = Object.entries(r.conditionFrequency)
              .sort(([, a], [, b]) => b - a)[0]?.[0]
            const topConditionLabel = topConditionId
              ? (CONDITION_NAMES[topConditionId] ?? topConditionId)
              : '—'
            return (
              <tr key={r.id} className="history-table__row">
                <td>
                  <span className="history-table__date">
                    {started.toLocaleDateString()}
                  </span>
                  <span className="history-table__time">
                    {started.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </td>
                <td>{formatDuration(r.durationSeconds)}</td>
                <td className="history-table__pct history-table__pct--good">
                  {r.goodPercentage.toFixed(0)}%
                </td>
                <td className="history-table__pct history-table__pct--warn">
                  {r.warningPercentage.toFixed(0)}%
                </td>
                <td className="history-table__pct history-table__pct--bad">
                  {r.badPercentage.toFixed(0)}%
                </td>
                <td className="history-table__condition">{topConditionLabel}</td>
                {onDelete && (
                  <td>
                    <button
                      className="btn btn--ghost history-table__delete"
                      onClick={() => onDelete(r.id)}
                      aria-label="Delete session"
                      type="button"
                    >
                      ×
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
