import { describe, it, expect } from 'vitest'
import { PROFILE_PRESETS, ROLE_LABELS, HOURS_LABELS, GOAL_LABELS, REMINDER_LABELS } from './profilePresets'

const ALL_ROLES = ['remote_worker', 'student', 'researcher', 'developer', 'office_worker', 'other'] as const

describe('PROFILE_PRESETS — completeness', () => {
  ALL_ROLES.forEach(role => {
    it(`has a preset for "${role}"`, () => {
      expect(PROFILE_PRESETS[role]).toBeDefined()
    })

    it(`"${role}" has required fields`, () => {
      const preset = PROFILE_PRESETS[role]
      expect(typeof preset.label).toBe('string')
      expect(typeof preset.description).toBe('string')
      expect(Array.isArray(preset.focusAreas)).toBe(true)
      expect(preset.focusAreas.length).toBeGreaterThan(0)
      expect(typeof preset.defaultReminderMinutes).toBe('number')
      expect(preset.defaultReminderMinutes).toBeGreaterThan(0)
      expect(Array.isArray(preset.suggestedChecklist)).toBe(true)
      expect(preset.suggestedChecklist.length).toBeGreaterThan(0)
      expect(Array.isArray(preset.postureTips)).toBe(true)
      expect(preset.postureTips.length).toBeGreaterThan(0)
    })

    it(`"${role}" checklist items are non-empty strings`, () => {
      PROFILE_PRESETS[role].suggestedChecklist.forEach(item => {
        expect(typeof item).toBe('string')
        expect(item.length).toBeGreaterThan(5)
      })
    })
  })
})

describe('PROFILE_PRESETS — per-role defaults', () => {
  it('remote_worker has 45 min default', () => {
    expect(PROFILE_PRESETS.remote_worker.defaultReminderMinutes).toBe(45)
  })

  it('developer has shorter default interval', () => {
    expect(PROFILE_PRESETS.developer.defaultReminderMinutes).toBeLessThanOrEqual(40)
  })

  it('office_worker has focus on desk ergonomics', () => {
    const areas = PROFILE_PRESETS.office_worker.focusAreas.join(' ').toLowerCase()
    expect(areas).toMatch(/ergonomics|alignment|desk/)
  })

  it('student has focus on studying or screen distance', () => {
    const areas = PROFILE_PRESETS.student.focusAreas.join(' ').toLowerCase()
    expect(areas).toMatch(/study|screen|break|neck/)
  })
})

describe('Label maps', () => {
  it('ROLE_LABELS covers all roles', () => {
    ALL_ROLES.forEach(role => {
      expect(ROLE_LABELS[role]).toBeDefined()
      expect(typeof ROLE_LABELS[role]).toBe('string')
    })
  })

  it('HOURS_LABELS covers all hour options', () => {
    const expected = ['less_than_2', '2_to_4', '4_to_6', '6_to_8', 'more_than_8']
    expected.forEach(h => {
      expect(HOURS_LABELS[h as keyof typeof HOURS_LABELS]).toBeDefined()
    })
  })

  it('GOAL_LABELS covers all goals', () => {
    const expected = ['neck_posture', 'shoulder_alignment', 'back_posture', 'general_awareness', 'reduce_sitting_time']
    expected.forEach(g => {
      expect(GOAL_LABELS[g as keyof typeof GOAL_LABELS]).toBeDefined()
    })
  })

  it('REMINDER_LABELS covers all frequencies', () => {
    const expected = ['30', '45', '60', '90', 'custom']
    expected.forEach(f => {
      expect(REMINDER_LABELS[f as keyof typeof REMINDER_LABELS]).toBeDefined()
    })
  })
})
