import { describe, it, expect } from 'vitest'
import {
  getReminderInterval,
  getChecklistForProfile,
  getReminderTitle,
  calculateChecklistProgress,
  resetChecklist,
  hasReachedFatigueLimit,
  SESSION_REMINDER_LIMIT,
} from './reminderLogic'
import type { UserProfile } from '../../types/userProfile'

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    role: 'remote_worker',
    computerHours: '4_to_6',
    remoteWork: 'sometimes',
    mainGoal: 'general_awareness',
    reminderFrequency: '45',
    ...overrides,
  }
}

describe('getReminderInterval', () => {
  it('returns 45 for null profile', () => {
    expect(getReminderInterval(null)).toBe(45)
  })

  it('returns correct interval for remote_worker preset (45 min)', () => {
    expect(getReminderInterval(makeProfile({ reminderFrequency: '45' }))).toBe(45)
  })

  it('returns 30 for developer role override', () => {
    expect(getReminderInterval(makeProfile({ reminderFrequency: '30' }))).toBe(30)
  })

  it('returns 60 for hour frequency', () => {
    expect(getReminderInterval(makeProfile({ reminderFrequency: '60' }))).toBe(60)
  })

  it('returns 90 for longest preset', () => {
    expect(getReminderInterval(makeProfile({ reminderFrequency: '90' }))).toBe(90)
  })

  it('returns customReminderMinutes when frequency is custom', () => {
    expect(getReminderInterval(makeProfile({ reminderFrequency: 'custom', customReminderMinutes: 25 }))).toBe(25)
  })

  it('falls back to 45 when custom minutes not provided', () => {
    expect(getReminderInterval(makeProfile({ reminderFrequency: 'custom' }))).toBe(45)
  })
})

describe('getChecklistForProfile', () => {
  it('returns default checklist when profile is null', () => {
    const items = getChecklistForProfile(null)
    expect(items.length).toBeGreaterThan(0)
    expect(items.every(i => typeof i.text === 'string' && i.done === false)).toBe(true)
  })

  it('returns profile-specific checklist for remote_worker', () => {
    const items = getChecklistForProfile(makeProfile({ role: 'remote_worker' }))
    expect(items.length).toBeGreaterThan(0)
    expect(items[0].done).toBe(false)
  })

  it('returns different checklist for developer vs student', () => {
    const devItems = getChecklistForProfile(makeProfile({ role: 'developer' }))
    const studentItems = getChecklistForProfile(makeProfile({ role: 'student' }))
    const devTexts = devItems.map(i => i.text)
    const studentTexts = studentItems.map(i => i.text)
    expect(devTexts).not.toEqual(studentTexts)
  })

  it('assigns unique ids to each item', () => {
    const items = getChecklistForProfile(null)
    const ids = items.map(i => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('calculateChecklistProgress', () => {
  it('returns 0 done and total equal to items length when none done', () => {
    const items = getChecklistForProfile(null)
    const progress = calculateChecklistProgress(items)
    expect(progress.done).toBe(0)
    expect(progress.total).toBe(items.length)
  })

  it('counts done items correctly', () => {
    const items = getChecklistForProfile(null)
    items[0].done = true
    items[1].done = true
    const progress = calculateChecklistProgress(items)
    expect(progress.done).toBe(2)
  })

  it('returns done === total when all items are checked', () => {
    const items = getChecklistForProfile(null).map(i => ({ ...i, done: true }))
    const progress = calculateChecklistProgress(items)
    expect(progress.done).toBe(progress.total)
  })
})

describe('resetChecklist', () => {
  it('resets all done items to false', () => {
    const items = getChecklistForProfile(null).map(i => ({ ...i, done: true }))
    const reset = resetChecklist(items)
    expect(reset.every(i => i.done === false)).toBe(true)
  })

  it('preserves text and id', () => {
    const items = getChecklistForProfile(null)
    const reset = resetChecklist(items)
    reset.forEach((item, idx) => {
      expect(item.text).toBe(items[idx].text)
      expect(item.id).toBe(items[idx].id)
    })
  })
})

describe('template rotation via cycleIndex', () => {
  it('cycle 0 and cycle 1 return different items for remote_worker', () => {
    const c0 = getChecklistForProfile(makeProfile({ role: 'remote_worker' }), 0)
    const c1 = getChecklistForProfile(makeProfile({ role: 'remote_worker' }), 1)
    expect(c0.map(i => i.text)).not.toEqual(c1.map(i => i.text))
  })

  it('each template has 3 or 4 items', () => {
    const roles: Array<UserProfile['role']> = ['remote_worker', 'developer', 'student', 'researcher', 'office_worker', 'other']
    for (const role of roles) {
      for (let cycle = 0; cycle < 4; cycle++) {
        const items = getChecklistForProfile(makeProfile({ role }), cycle)
        expect(items.length).toBeGreaterThanOrEqual(3)
        expect(items.length).toBeLessThanOrEqual(4)
      }
    }
  })

  it('two consecutive cycles do not immediately repeat (with 3+ templates)', () => {
    for (let cycle = 0; cycle < 6; cycle++) {
      const a = getChecklistForProfile(makeProfile({ role: 'remote_worker' }), cycle)
      const b = getChecklistForProfile(makeProfile({ role: 'remote_worker' }), cycle + 1)
      expect(a.map(i => i.text)).not.toEqual(b.map(i => i.text))
    }
  })

  it('null profile cycles through other templates without error', () => {
    for (let cycle = 0; cycle < 5; cycle++) {
      const items = getChecklistForProfile(null, cycle)
      expect(items.length).toBeGreaterThan(0)
    }
  })

  it('getReminderTitle returns a non-empty string for each cycle', () => {
    expect(getReminderTitle(null, 0)).toBeTruthy()
    expect(getReminderTitle(makeProfile({ role: 'developer' }), 1)).toBeTruthy()
  })

  it('getReminderTitle changes across cycles', () => {
    const t0 = getReminderTitle(makeProfile({ role: 'remote_worker' }), 0)
    const t1 = getReminderTitle(makeProfile({ role: 'remote_worker' }), 1)
    expect(t0).not.toBe(t1)
  })
})

describe('hasReachedFatigueLimit', () => {
  it('returns false below the limit', () => {
    expect(hasReachedFatigueLimit(SESSION_REMINDER_LIMIT - 1)).toBe(false)
  })

  it('returns true at the limit', () => {
    expect(hasReachedFatigueLimit(SESSION_REMINDER_LIMIT)).toBe(true)
  })

  it('returns true above the limit', () => {
    expect(hasReachedFatigueLimit(SESSION_REMINDER_LIMIT + 5)).toBe(true)
  })
})
