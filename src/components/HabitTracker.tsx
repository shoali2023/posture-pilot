import { getSessionsByDay } from '../lib/history/sessionHistoryStorage'
import type { SessionRecord } from '../types/sessionHistory'

interface Props {
  history: ReturnType<typeof getSessionsByDay>
  days?: number
}

function avgGood(records: SessionRecord[]): number {
  if (!records.length) return 0
  return records.reduce((s, r) => s + r.goodPercentage, 0) / records.length
}

function goodToClass(pct: number, hasSession: boolean): string {
  if (!hasSession) return 'habit-day--empty'
  if (pct >= 70) return 'habit-day--high'
  if (pct >= 40) return 'habit-day--mid'
  return 'habit-day--low'
}

/** Returns an array of YYYY-MM-DD strings for the last N days, oldest first */
function lastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toLocaleDateString('en-CA'))
  }
  return days
}

export function HabitTracker({ history, days = 28 }: Props) {
  const dayKeys = lastNDays(days)

  return (
    <div className="habit-tracker">
      <h3 className="habit-tracker__title">Activity — last {days} days</h3>
      <div className="habit-tracker__grid" role="list" aria-label="Posture session habit tracker">
        {dayKeys.map(day => {
          const records = history[day] ?? []
          const hasSession = records.length > 0
          const pct = avgGood(records)
          const cls = goodToClass(pct, hasSession)
          const label = hasSession
            ? `${day}: ${records.length} session${records.length > 1 ? 's' : ''}, avg good posture ${Math.round(pct)}%`
            : `${day}: no session`
          return (
            <div
              key={day}
              className={`habit-day ${cls}`}
              role="listitem"
              title={label}
              aria-label={label}
            />
          )
        })}
      </div>
      <div className="habit-tracker__legend">
        <span className="habit-day habit-day--empty" />
        <span>No session</span>
        <span className="habit-day habit-day--low" />
        <span>&lt;40% good</span>
        <span className="habit-day habit-day--mid" />
        <span>40–70%</span>
        <span className="habit-day habit-day--high" />
        <span>&gt;70% good</span>
      </div>
    </div>
  )
}
