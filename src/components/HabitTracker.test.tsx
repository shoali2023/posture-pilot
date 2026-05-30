import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HabitTracker } from './HabitTracker'
import type { SessionRecord } from '../types/sessionHistory'

vi.mock('../lib/history/sessionHistoryStorage', () => ({
  getSessionsByDay: vi.fn(),
}))

function makeRecord(goodPct = 70): SessionRecord {
  return {
    id: `r_${Math.random()}`,
    startedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    durationSeconds: 300,
    framesAnalyzed: 500,
    goodPercentage: goodPct,
    warningPercentage: 20,
    badPercentage: 10,
    conditionFrequency: {},
  }
}

function todayKey(): string {
  return new Date().toLocaleDateString('en-CA')
}

describe('HabitTracker — rendering', () => {
  it('renders the title', () => {
    render(<HabitTracker history={{}} />)
    expect(screen.getByText(/activity.*last \d+ days/i)).toBeInTheDocument()
  })

  it('renders 28 day cells by default', () => {
    render(<HabitTracker history={{}} />)
    const cells = screen.getAllByRole('listitem')
    expect(cells.length).toBe(28)
  })

  it('renders N day cells when days prop is provided', () => {
    render(<HabitTracker history={{}} days={14} />)
    const cells = screen.getAllByRole('listitem')
    expect(cells.length).toBe(14)
  })

  it('renders legend items', () => {
    render(<HabitTracker history={{}} />)
    expect(screen.getByText(/no session/i)).toBeInTheDocument()
  })
})

describe('HabitTracker — day cells with data', () => {
  it('marks today cell with session data', () => {
    const today = todayKey()
    const history = { [today]: [makeRecord(80)] }
    render(<HabitTracker history={history} />)
    const todayCell = screen.getAllByRole('listitem').find(el =>
      el.getAttribute('aria-label')?.includes(today)
    )
    expect(todayCell).toBeDefined()
    expect(todayCell?.getAttribute('aria-label')).toMatch(/1 session.*80%/)
  })

  it('shows "no session" label for empty day', () => {
    render(<HabitTracker history={{}} />)
    const cells = screen.getAllByRole('listitem')
    // First cell (oldest day) should have "no session"
    expect(cells[0].getAttribute('aria-label')).toMatch(/no session/)
  })

  it('applies high class when good percentage >= 70', () => {
    const today = todayKey()
    render(<HabitTracker history={{ [today]: [makeRecord(80)] }} />)
    const todayCell = screen.getAllByRole('listitem').find(el =>
      el.getAttribute('aria-label')?.includes(today)
    )
    expect(todayCell?.className).toContain('habit-day--high')
  })

  it('applies mid class when good percentage is 40-70', () => {
    const today = todayKey()
    render(<HabitTracker history={{ [today]: [makeRecord(55)] }} />)
    const todayCell = screen.getAllByRole('listitem').find(el =>
      el.getAttribute('aria-label')?.includes(today)
    )
    expect(todayCell?.className).toContain('habit-day--mid')
  })

  it('applies low class when good percentage < 40', () => {
    const today = todayKey()
    render(<HabitTracker history={{ [today]: [makeRecord(20)] }} />)
    const todayCell = screen.getAllByRole('listitem').find(el =>
      el.getAttribute('aria-label')?.includes(today)
    )
    expect(todayCell?.className).toContain('habit-day--low')
  })
})
