import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  saveSessionRecord,
  loadSessionHistory,
  clearSessionHistory,
  deleteSessionRecord,
  getSessionsByDay,
  getSessionsByWeek,
  averagePostureStats,
  topConditionAcrossRecords,
} from './sessionHistoryStorage'
import type { SessionRecord } from '../../types/sessionHistory'

const store: Record<string, string> = {}

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { Object.keys(store).forEach(k => delete store[k]) },
  })
  Object.keys(store).forEach(k => delete store[k])
})

function makeRecord(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    id: `r_${Math.random()}`,
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    durationSeconds: 300,
    framesAnalyzed: 500,
    goodPercentage: 60,
    warningPercentage: 30,
    badPercentage: 10,
    conditionFrequency: { head_misalignment: 50 },
    profileRole: 'remote_worker',
    ...overrides,
  }
}

describe('saveSessionRecord / loadSessionHistory', () => {
  it('saves and loads a session record', () => {
    const record = makeRecord({ id: 'test1' })
    saveSessionRecord(record)
    const history = loadSessionHistory()
    expect(history.find(r => r.id === 'test1')).toBeDefined()
  })

  it('most recent record is first', () => {
    const r1 = makeRecord({ id: 'first' })
    const r2 = makeRecord({ id: 'second' })
    saveSessionRecord(r1)
    saveSessionRecord(r2)
    const history = loadSessionHistory()
    expect(history[0].id).toBe('second')
    expect(history[1].id).toBe('first')
  })

  it('returns empty array when no history', () => {
    expect(loadSessionHistory()).toEqual([])
  })
})

describe('clearSessionHistory', () => {
  it('removes all records', () => {
    saveSessionRecord(makeRecord())
    clearSessionHistory()
    expect(loadSessionHistory()).toEqual([])
  })
})

describe('deleteSessionRecord', () => {
  it('removes the record with the given id', () => {
    saveSessionRecord(makeRecord({ id: 'keep' }))
    saveSessionRecord(makeRecord({ id: 'delete' }))
    deleteSessionRecord('delete')
    const history = loadSessionHistory()
    expect(history.find(r => r.id === 'delete')).toBeUndefined()
    expect(history.find(r => r.id === 'keep')).toBeDefined()
  })
})

describe('getSessionsByDay', () => {
  it('groups records by local date', () => {
    saveSessionRecord(makeRecord({ startedAt: '2025-01-15T10:00:00Z' }))
    saveSessionRecord(makeRecord({ startedAt: '2025-01-15T14:00:00Z' }))
    saveSessionRecord(makeRecord({ startedAt: '2025-01-16T09:00:00Z' }))
    const groups = getSessionsByDay()
    const keys = Object.keys(groups)
    expect(keys.length).toBeGreaterThan(0)
  })
})

describe('getSessionsByWeek', () => {
  it('returns only records from last 7 days', () => {
    const now = new Date()
    const old = new Date()
    old.setDate(old.getDate() - 10)
    saveSessionRecord(makeRecord({ id: 'recent', startedAt: now.toISOString() }))
    saveSessionRecord(makeRecord({ id: 'old', startedAt: old.toISOString() }))
    const week = getSessionsByWeek()
    expect(week.find(r => r.id === 'recent')).toBeDefined()
    expect(week.find(r => r.id === 'old')).toBeUndefined()
  })

  it('returns empty array when no recent records', () => {
    const old = new Date()
    old.setDate(old.getDate() - 10)
    saveSessionRecord(makeRecord({ startedAt: old.toISOString() }))
    expect(getSessionsByWeek()).toHaveLength(0)
  })
})

describe('averagePostureStats', () => {
  it('returns null for empty array', () => {
    expect(averagePostureStats([])).toBeNull()
  })

  it('averages percentages correctly', () => {
    const r1 = makeRecord({ goodPercentage: 60, warningPercentage: 30, badPercentage: 10 })
    const r2 = makeRecord({ goodPercentage: 80, warningPercentage: 10, badPercentage: 10 })
    const stats = averagePostureStats([r1, r2])!
    expect(stats.goodPct).toBeCloseTo(70)
    expect(stats.warningPct).toBeCloseTo(20)
    expect(stats.badPct).toBeCloseTo(10)
  })
})

describe('topConditionAcrossRecords', () => {
  it('returns null for empty array', () => {
    expect(topConditionAcrossRecords([])).toBeNull()
  })

  it('returns the most frequent condition across records', () => {
    const r1 = makeRecord({ conditionFrequency: { head_misalignment: 100, shoulder_imbalance: 20 } })
    const r2 = makeRecord({ conditionFrequency: { head_misalignment: 50, trunk_lean: 200 } })
    const top = topConditionAcrossRecords([r1, r2])
    expect(top).toBe('trunk_lean')
  })
})
