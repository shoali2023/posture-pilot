import { describe, it, expect } from 'vitest'
import { generateRecommendations } from './recommendationEngine'
import type { UserProfile } from '../../types/userProfile'
import type { SessionSummary } from '../../types/session'

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

function makeSummary(overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    durationSeconds: 600,
    totalFrames: 1000,
    goodPct: 60,
    warningPct: 30,
    badPct: 10,
    dominantStatus: 'good',
    generalRecommendation: '',
    ...overrides,
  }
}

describe('generateRecommendations — condition-based', () => {
  it('produces screen-height recommendation for frequent head_misalignment', () => {
    const recs = generateRecommendations(null, { head_misalignment: 100, shoulder_imbalance: 10 }, null)
    const titles = recs.map(r => r.title.toLowerCase())
    expect(titles.some(t => t.includes('screen') || t.includes('height') || t.includes('adjustment'))).toBe(true)
  })

  it('produces shoulder relaxation recommendation for frequent shoulder_imbalance', () => {
    const recs = generateRecommendations(null, { shoulder_imbalance: 100, head_misalignment: 5 }, null)
    const texts = recs.map(r => (r.title + r.body).toLowerCase())
    expect(texts.some(t => t.includes('shoulder'))).toBe(true)
  })

  it('produces back support recommendation for frequent trunk_lean', () => {
    const recs = generateRecommendations(null, { trunk_lean: 100, head_misalignment: 5 }, null)
    const texts = recs.map(r => (r.title + r.body).toLowerCase())
    expect(texts.some(t => t.includes('trunk') || t.includes('back') || t.includes('lumbar'))).toBe(true)
  })

  it('produces camera positioning recommendation for frequent low_visibility', () => {
    const recs = generateRecommendations(null, { low_visibility: 100, head_misalignment: 5 }, null)
    const texts = recs.map(r => (r.title + r.body).toLowerCase())
    expect(texts.some(t => t.includes('camera') || t.includes('positioning') || t.includes('lighting'))).toBe(true)
  })
})

describe('generateRecommendations — role-based', () => {
  it('produces developer recommendation for developer role', () => {
    const recs = generateRecommendations(makeProfile({ role: 'developer' }), {}, null)
    const texts = recs.map(r => (r.title + r.body).toLowerCase())
    expect(texts.some(t => t.includes('micro') || t.includes('break') || t.includes('screen'))).toBe(true)
  })

  it('produces researcher recommendation for researcher role', () => {
    const recs = generateRecommendations(makeProfile({ role: 'researcher' }), {}, null)
    const texts = recs.map(r => (r.title + r.body).toLowerCase())
    expect(texts.some(t => t.includes('document') || t.includes('reading') || t.includes('neck'))).toBe(true)
  })

  it('produces student recommendation for student role', () => {
    const recs = generateRecommendations(makeProfile({ role: 'student' }), {}, null)
    const texts = recs.map(r => (r.title + r.body).toLowerCase())
    expect(texts.some(t => t.includes('20-20-20') || t.includes('study') || t.includes('eye'))).toBe(true)
  })
})

describe('generateRecommendations — computer hours', () => {
  it('recommends shorter reminders for more_than_8 hours', () => {
    const recs = generateRecommendations(makeProfile({ computerHours: 'more_than_8' }), {}, null)
    const texts = recs.map(r => (r.title + r.body).toLowerCase())
    expect(texts.some(t => t.includes('30') || t.includes('shorter') || t.includes('frequent'))).toBe(true)
  })
})

describe('generateRecommendations — session-based', () => {
  it('adds posture awareness card when bad percentage exceeds 50%', () => {
    const recs = generateRecommendations(null, {}, makeSummary({ badPct: 60, goodPct: 20, warningPct: 20 }))
    const texts = recs.map(r => (r.title + r.body).toLowerCase())
    expect(texts.some(t => t.includes('posture') || t.includes('workstation') || t.includes('awareness'))).toBe(true)
  })

  it('adds long session card for sessions over 1 hour', () => {
    const recs = generateRecommendations(null, {}, makeSummary({ durationSeconds: 3700 }))
    const texts = recs.map(r => (r.title + r.body).toLowerCase())
    expect(texts.some(t => t.includes('long session') || t.includes('break') || t.includes('hour'))).toBe(true)
  })
})

describe('generateRecommendations — no profile nudge', () => {
  it('nudges user to set up profile when no profile provided', () => {
    const recs = generateRecommendations(null, {}, null)
    const texts = recs.map(r => (r.title + r.body).toLowerCase())
    expect(texts.some(t => t.includes('personalise') || t.includes('profile') || t.includes('home tab'))).toBe(true)
  })
})

describe('generateRecommendations — output constraints', () => {
  it('returns at most 5 recommendations', () => {
    const recs = generateRecommendations(
      makeProfile({ role: 'developer', computerHours: 'more_than_8', mainGoal: 'neck_posture' }),
      { head_misalignment: 100, shoulder_imbalance: 50, trunk_lean: 50, low_visibility: 50 },
      makeSummary({ badPct: 70, durationSeconds: 4000 })
    )
    expect(recs.length).toBeLessThanOrEqual(5)
  })

  it('does not contain duplicate ids', () => {
    const recs = generateRecommendations(makeProfile(), { head_misalignment: 100 }, makeSummary())
    const ids = recs.map(r => r.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('does not use medical language', () => {
    const recs = generateRecommendations(makeProfile(), { trunk_lean: 100 }, makeSummary({ badPct: 70 }))
    const allText = recs.map(r => r.body).join(' ').toLowerCase()
    expect(allText).not.toMatch(/\bdiagnos/i)
    expect(allText).not.toMatch(/\btreat\b/i)
    expect(allText).not.toMatch(/clinical(ly)? (valid|proven|certified)/i)
  })
})
