import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReminderPanel } from './ReminderPanel'
import type { ReminderPanelProps } from './ReminderPanel'
import { getChecklistForProfile } from '../lib/reminders/reminderLogic'
import { SESSION_REMINDER_LIMIT } from '../lib/reminders/reminderLogic'

function makeProps(overrides: Partial<ReminderPanelProps> = {}): ReminderPanelProps {
  const items = getChecklistForProfile(null)
  return {
    intervalMinutes: 45,
    remainingSeconds: 45 * 60,
    isPaused: false,
    reminderCount: 0,
    items,
    fatigueReached: false,
    progress: { done: 0, total: items.length },
    notificationsEnabled: false,
    notificationPermission: 'default',
    hasProfile: false,
    onPause: vi.fn(),
    onResume: vi.fn(),
    onReset: vi.fn(),
    onToggleItem: vi.fn(),
    onRequestDesktopNotifications: vi.fn().mockResolvedValue(undefined),
    onDisableNotifications: vi.fn(),
    ...overrides,
  }
}

describe('ReminderPanel — basic rendering', () => {
  it('shows countdown timer label', () => {
    render(<ReminderPanel {...makeProps()} />)
    expect(screen.getByText(/next reminder in/i)).toBeInTheDocument()
  })

  it('shows posture checklist heading', () => {
    render(<ReminderPanel {...makeProps()} />)
    expect(screen.getByText(/posture checklist/i)).toBeInTheDocument()
  })

  it('shows checklist items', () => {
    render(<ReminderPanel {...makeProps()} />)
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0)
  })

  it('shows 0 / N completed when none done', () => {
    render(<ReminderPanel {...makeProps()} />)
    const progressEl = screen.getByText(/\d+ completed$/i)
    expect(progressEl.textContent).toMatch(/^0 \/ \d+ completed$/)
  })

  it('shows hint when hasProfile is false', () => {
    render(<ReminderPanel {...makeProps({ hasProfile: false })} />)
    expect(screen.getByText(/set up your profile/i)).toBeInTheDocument()
  })

  it('does not show hint when hasProfile is true', () => {
    render(<ReminderPanel {...makeProps({ hasProfile: true })} />)
    expect(screen.queryByText(/set up your profile/i)).not.toBeInTheDocument()
  })
})

describe('ReminderPanel — countdown display', () => {
  it('shows formatted countdown when not paused', () => {
    render(<ReminderPanel {...makeProps({ remainingSeconds: 150 })} />)
    expect(screen.getByText('02:30')).toBeInTheDocument()
  })

  it('shows dash when paused', () => {
    render(<ReminderPanel {...makeProps({ isPaused: true })} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows reminder count when count > 0', () => {
    render(<ReminderPanel {...makeProps({ reminderCount: 3 })} />)
    expect(screen.getByText(/3 \/ \d+/)).toBeInTheDocument()
  })
})

describe('ReminderPanel — checklist progress', () => {
  it('shows updated progress when items done', () => {
    const items = getChecklistForProfile(null)
    items[0].done = true
    items[1].done = true
    render(<ReminderPanel {...makeProps({ items, progress: { done: 2, total: items.length } })} />)
    const progressEl = screen.getByText(/\d+ completed$/i)
    expect(progressEl.textContent).toMatch(/^2 \/ \d+ completed$/)
  })
})

describe('ReminderPanel — pause and resume buttons', () => {
  it('shows Pause reminders when not paused', () => {
    render(<ReminderPanel {...makeProps({ isPaused: false })} />)
    expect(screen.getByRole('button', { name: /pause reminders/i })).toBeInTheDocument()
  })

  it('shows Resume reminders when paused', () => {
    render(<ReminderPanel {...makeProps({ isPaused: true })} />)
    expect(screen.getByRole('button', { name: /resume reminders/i })).toBeInTheDocument()
  })

  it('calls onPause when Pause is clicked', async () => {
    const user = userEvent.setup()
    const onPause = vi.fn()
    render(<ReminderPanel {...makeProps({ onPause })} />)
    await user.click(screen.getByRole('button', { name: /pause reminders/i }))
    expect(onPause).toHaveBeenCalledOnce()
  })

  it('calls onResume when Resume is clicked', async () => {
    const user = userEvent.setup()
    const onResume = vi.fn()
    render(<ReminderPanel {...makeProps({ isPaused: true, onResume })} />)
    await user.click(screen.getByRole('button', { name: /resume reminders/i }))
    expect(onResume).toHaveBeenCalledOnce()
  })
})

describe('ReminderPanel — checklist toggle', () => {
  it('calls onToggleItem when a checklist toggle is clicked', async () => {
    const user = userEvent.setup()
    const onToggleItem = vi.fn()
    render(<ReminderPanel {...makeProps({ onToggleItem })} />)
    const toggle = screen.getAllByRole('button', { name: /mark as complete/i })[0]
    await user.click(toggle)
    expect(onToggleItem).toHaveBeenCalledOnce()
  })
})

describe('ReminderPanel — reset', () => {
  it('calls onReset when Reset timer button is clicked', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    render(<ReminderPanel {...makeProps({ onReset })} />)
    await user.click(screen.getByRole('button', { name: /reset timer/i }))
    expect(onReset).toHaveBeenCalledOnce()
  })
})

describe('ReminderPanel — fatigue state', () => {
  it('shows fatigue message when fatigueReached is true', () => {
    render(<ReminderPanel {...makeProps({ fatigueReached: true })} />)
    expect(screen.getByText(/enough posture reminders for this session/i)).toBeInTheDocument()
  })

  it('calls onReset when "Start new session" is clicked in fatigue state', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    render(<ReminderPanel {...makeProps({ fatigueReached: true, onReset })} />)
    await user.click(screen.getByRole('button', { name: /start new session/i }))
    expect(onReset).toHaveBeenCalledOnce()
  })

  it('SESSION_REMINDER_LIMIT is 8', () => {
    expect(SESSION_REMINDER_LIMIT).toBe(8)
  })
})

describe('ReminderPanel — desktop notifications UI', () => {
  it('shows Allow notifications button when permission is default', () => {
    render(<ReminderPanel {...makeProps({ notificationPermission: 'default' })} />)
    expect(screen.getByRole('button', { name: /allow notifications/i })).toBeInTheDocument()
  })

  it('calls onRequestDesktopNotifications when Allow is clicked', async () => {
    const user = userEvent.setup()
    const onRequestDesktopNotifications = vi.fn().mockResolvedValue(undefined)
    render(<ReminderPanel {...makeProps({ notificationPermission: 'default', onRequestDesktopNotifications })} />)
    await user.click(screen.getByRole('button', { name: /allow notifications/i }))
    expect(onRequestDesktopNotifications).toHaveBeenCalledOnce()
  })

  it('shows notification-on status when granted and enabled', () => {
    render(<ReminderPanel {...makeProps({ notificationPermission: 'granted', notificationsEnabled: true })} />)
    expect(screen.getByText(/notifications on/i)).toBeInTheDocument()
  })

  it('shows denied warning when permission is denied', () => {
    render(<ReminderPanel {...makeProps({ notificationPermission: 'denied' })} />)
    expect(screen.getByText(/notifications are blocked/i)).toBeInTheDocument()
  })

  it('shows unsupported message when not supported', () => {
    render(<ReminderPanel {...makeProps({ notificationPermission: 'unsupported' })} />)
    expect(screen.getByText(/browser does not support/i)).toBeInTheDocument()
  })
})
