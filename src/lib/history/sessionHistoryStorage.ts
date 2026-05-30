import type { SessionRecord } from '../../types/sessionHistory'

const HISTORY_KEY = 'posturepilot_session_history'
const MAX_RECORDS = 60

function readHistory(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    return JSON.parse(raw) as SessionRecord[]
  } catch {
    return []
  }
}

function writeHistory(records: SessionRecord[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records))
  } catch {
    // storage full — silently skip
  }
}

export function saveSessionRecord(record: SessionRecord): void {
  const history = readHistory()
  history.unshift(record)           // newest first
  writeHistory(history.slice(0, MAX_RECORDS))
}

export function loadSessionHistory(): SessionRecord[] {
  return readHistory()
}

export function clearSessionHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch {
    // ignore
  }
}

export function deleteSessionRecord(id: string): void {
  const history = readHistory().filter(r => r.id !== id)
  writeHistory(history)
}

/** Group records by calendar date (YYYY-MM-DD in local time) */
export function getSessionsByDay(): Record<string, SessionRecord[]> {
  const groups: Record<string, SessionRecord[]> = {}
  for (const r of readHistory()) {
    const key = new Date(r.startedAt).toLocaleDateString('en-CA') // YYYY-MM-DD
    if (!groups[key]) groups[key] = []
    groups[key].push(r)
  }
  return groups
}

/** Return records whose startedAt falls within the last N calendar days */
export function getRecentRecords(days: number): SessionRecord[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  cutoff.setHours(0, 0, 0, 0)
  return readHistory().filter(r => new Date(r.startedAt) >= cutoff)
}

export function getSessionsByWeek(): SessionRecord[] {
  return getRecentRecords(7)
}

export function getSessionsByMonth(): SessionRecord[] {
  return getRecentRecords(30)
}

/** Average good/warning/bad percentages over a set of records */
export function averagePostureStats(records: SessionRecord[]): {
  goodPct: number; warningPct: number; badPct: number
} | null {
  if (records.length === 0) return null
  const n = records.length
  return {
    goodPct:    records.reduce((s, r) => s + r.goodPercentage,    0) / n,
    warningPct: records.reduce((s, r) => s + r.warningPercentage, 0) / n,
    badPct:     records.reduce((s, r) => s + r.badPercentage,     0) / n,
  }
}

/** Most frequent condition across a set of records */
export function topConditionAcrossRecords(records: SessionRecord[]): string | null {
  const totals: Record<string, number> = {}
  for (const r of records) {
    for (const [id, count] of Object.entries(r.conditionFrequency)) {
      totals[id] = (totals[id] ?? 0) + count
    }
  }
  const entries = Object.entries(totals).sort(([, a], [, b]) => b - a)
  return entries.length > 0 ? entries[0][0] : null
}
