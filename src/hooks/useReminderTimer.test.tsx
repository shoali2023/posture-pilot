/**
 * Tests for useReminderTimer hook.
 *
 * These tests cover initial state and basic action callbacks.
 * Countdown / setInterval behaviour is memory-intensive in jsdom and is
 * covered through ReminderPanel.test.tsx (UI integration) and
 * reminderLogic.test.ts (pure function coverage).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { useReminderTimer } from './useReminderTimer'
import type { UserProfile } from '../types/userProfile'

vi.mock('../lib/notifications/notificationService', () => ({
  isNotificationSupported: () => false,
  getNotificationPermission: () => 'default',
  requestNotificationPermission: vi.fn().mockResolvedValue('granted'),
  showPostureReminderNotification: vi.fn(),
}))

const store: Record<string, string> = {}

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
    clear: () => { Object.keys(store).forEach(k => delete store[k]) },
  })
  Object.keys(store).forEach(k => delete store[k])
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

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

function Harness({ profile }: { profile: UserProfile | null }) {
  const t = useReminderTimer(profile)
  return (
    <div>
      <span data-testid="interval">{t.intervalMinutes}</span>
      <span data-testid="remaining">{t.remainingSeconds}</span>
      <span data-testid="paused">{String(t.isPaused)}</span>
      <span data-testid="count">{t.reminderCount}</span>
      <span data-testid="items">{t.items.length}</span>
      <span data-testid="done">{t.progress.done}</span>
      <span data-testid="fatigue">{String(t.fatigueReached)}</span>
      <span data-testid="notif-perm">{t.notificationPermission}</span>
      <button data-testid="pause"  onClick={t.pause}>pause</button>
      <button data-testid="resume" onClick={t.resume}>resume</button>
      <button data-testid="reset"  onClick={t.reset}>reset</button>
      <button data-testid="toggle" onClick={() => t.items[0] && t.toggleItem(t.items[0].id)}>
        toggle
      </button>
    </div>
  )
}

describe('useReminderTimer — initial state', () => {
  it('uses interval from profile', () => {
    render(<Harness profile={makeProfile({ reminderFrequency: '30' })} />)
    expect(screen.getByTestId('interval').textContent).toBe('30')
  })

  it('defaults to 45 for null profile', () => {
    render(<Harness profile={null} />)
    expect(screen.getByTestId('interval').textContent).toBe('45')
  })

  it('remainingSeconds equals interval × 60 initially', () => {
    render(<Harness profile={makeProfile({ reminderFrequency: '30' })} />)
    expect(screen.getByTestId('remaining').textContent).toBe(String(30 * 60))
  })

  it('starts not paused', () => {
    render(<Harness profile={null} />)
    expect(screen.getByTestId('paused').textContent).toBe('false')
  })

  it('reminderCount is 0 initially', () => {
    render(<Harness profile={null} />)
    expect(screen.getByTestId('count').textContent).toBe('0')
  })

  it('has checklist items', () => {
    render(<Harness profile={null} />)
    expect(parseInt(screen.getByTestId('items').textContent ?? '0')).toBeGreaterThan(0)
  })

  it('fatigueReached is false initially', () => {
    render(<Harness profile={null} />)
    expect(screen.getByTestId('fatigue').textContent).toBe('false')
  })

  it('notificationPermission is unsupported when API not available', () => {
    render(<Harness profile={null} />)
    expect(screen.getByTestId('notif-perm').textContent).toBe('unsupported')
  })
})

describe('useReminderTimer — pause and resume', () => {
  it('pause sets isPaused to true', () => {
    render(<Harness profile={null} />)
    fireEvent.click(screen.getByTestId('pause'))
    expect(screen.getByTestId('paused').textContent).toBe('true')
  })

  it('resume sets isPaused to false after pause', () => {
    render(<Harness profile={null} />)
    fireEvent.click(screen.getByTestId('pause'))
    fireEvent.click(screen.getByTestId('resume'))
    expect(screen.getByTestId('paused').textContent).toBe('false')
  })
})

describe('useReminderTimer — reset', () => {
  it('reset restores full interval and clears paused state', () => {
    render(<Harness profile={makeProfile({ reminderFrequency: '30' })} />)
    fireEvent.click(screen.getByTestId('pause'))
    fireEvent.click(screen.getByTestId('reset'))
    expect(screen.getByTestId('paused').textContent).toBe('false')
    expect(screen.getByTestId('remaining').textContent).toBe(String(30 * 60))
  })
})

describe('useReminderTimer — checklist', () => {
  it('toggleItem increments done count', () => {
    render(<Harness profile={null} />)
    expect(screen.getByTestId('done').textContent).toBe('0')
    fireEvent.click(screen.getByTestId('toggle'))
    expect(screen.getByTestId('done').textContent).toBe('1')
  })
})
