import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionHistoryTable } from './SessionHistoryTable'
import type { SessionRecord } from '../types/sessionHistory'

function makeRecord(overrides: Partial<SessionRecord> = {}): SessionRecord {
  return {
    id: `r_${Math.random().toString(36).slice(2)}`,
    startedAt: '2025-01-15T10:30:00Z',
    endedAt: '2025-01-15T10:35:00Z',
    durationSeconds: 300,
    framesAnalyzed: 500,
    goodPercentage: 65,
    warningPercentage: 25,
    badPercentage: 10,
    conditionFrequency: { head_misalignment: 80 },
    profileRole: 'remote_worker',
    ...overrides,
  }
}

describe('SessionHistoryTable — empty state', () => {
  it('shows empty state message when no records', () => {
    render(<SessionHistoryTable records={[]} />)
    expect(screen.getByText(/no sessions recorded yet/i)).toBeInTheDocument()
  })
})

describe('SessionHistoryTable — with records', () => {
  it('renders table headers', () => {
    render(<SessionHistoryTable records={[makeRecord()]} />)
    expect(screen.getByText('Duration')).toBeInTheDocument()
    expect(screen.getByText('Good')).toBeInTheDocument()
    expect(screen.getByText(/top issue/i)).toBeInTheDocument()
  })

  it('renders one row per record', () => {
    const records = [makeRecord(), makeRecord()]
    render(<SessionHistoryTable records={records} />)
    expect(screen.getAllByRole('row').length).toBe(records.length + 1) // +1 for thead
  })

  it('shows formatted duration', () => {
    render(<SessionHistoryTable records={[makeRecord({ durationSeconds: 300 })]} />)
    // formatDuration(300) → "05:00"
    expect(screen.getByText('05:00')).toBeInTheDocument()
  })

  it('shows good percentage', () => {
    render(<SessionHistoryTable records={[makeRecord({ goodPercentage: 65 })]} />)
    expect(screen.getByText(/65%/)).toBeInTheDocument()
  })

  it('shows most frequent condition from condition frequency', () => {
    render(<SessionHistoryTable records={[makeRecord({ conditionFrequency: { head_misalignment: 100 } })]} />)
    expect(screen.getByText(/head misalignment/i)).toBeInTheDocument()
  })

  it('shows dash for top issue when no conditions', () => {
    render(<SessionHistoryTable records={[makeRecord({ conditionFrequency: {} })]} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})

describe('SessionHistoryTable — delete', () => {
  it('shows delete button when onDelete is provided', () => {
    render(<SessionHistoryTable records={[makeRecord()]} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: /delete session/i })).toBeInTheDocument()
  })

  it('does not show delete button when onDelete is not provided', () => {
    render(<SessionHistoryTable records={[makeRecord()]} />)
    expect(screen.queryByRole('button', { name: /delete session/i })).not.toBeInTheDocument()
  })

  it('calls onDelete with the record id when delete is clicked', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    const record = makeRecord({ id: 'test-id' })
    render(<SessionHistoryTable records={[record]} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: /delete session/i }))
    expect(onDelete).toHaveBeenCalledWith('test-id')
  })
})
