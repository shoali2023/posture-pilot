import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AnalyticsDashboard } from './AnalyticsDashboard'
import type { SessionSummary } from '../types/session'
import type { UserProfile } from '../types/userProfile'
import type { SessionRecord } from '../types/sessionHistory'

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}))

vi.mock('../lib/history/sessionHistoryStorage', () => ({
  averagePostureStats: vi.fn(() => null),
  topConditionAcrossRecords: vi.fn(() => null),
  getSessionsByDay: vi.fn(() => ({})),
}))

const mockSummary: SessionSummary = {
  durationSeconds: 300,
  totalFrames: 500,
  goodPct: 60,
  warningPct: 30,
  badPct: 10,
  dominantStatus: 'good',
  generalRecommendation: 'Good session.',
}

const mockProfile: UserProfile = {
  role: 'remote_worker',
  computerHours: '4_to_6',
  remoteWork: 'sometimes',
  mainGoal: 'general_awareness',
  reminderFrequency: '45',
}

const mockRecord: SessionRecord = {
  id: 'r1',
  startedAt: new Date().toISOString(),
  endedAt: new Date().toISOString(),
  durationSeconds: 300,
  framesAnalyzed: 500,
  goodPercentage: 60,
  warningPercentage: 30,
  badPercentage: 10,
  conditionFrequency: {},
  profileRole: 'remote_worker',
}

describe('AnalyticsDashboard — no session', () => {
  it('shows empty state message when no summary', () => {
    render(<AnalyticsDashboard summary={null} conditionFrequency={{}} profile={null} history={[]} />)
    expect(screen.getByText(/no session data yet/i)).toBeInTheDocument()
  })

  it('shows hint to use Live Check tab', () => {
    render(<AnalyticsDashboard summary={null} conditionFrequency={{}} profile={null} history={[]} />)
    expect(screen.getByText(/live check/i)).toBeInTheDocument()
  })

  it('shows profile nudge recommendation when no profile', () => {
    render(<AnalyticsDashboard summary={null} conditionFrequency={{}} profile={null} history={[]} />)
    expect(screen.getByText(/personalise/i)).toBeInTheDocument()
  })
})

describe('AnalyticsDashboard — with session summary', () => {
  it('shows duration stat card', () => {
    render(<AnalyticsDashboard summary={mockSummary} conditionFrequency={{}} profile={null} history={[]} />)
    expect(screen.getByText('Duration')).toBeInTheDocument()
  })

  it('shows frames analysed stat card', () => {
    render(<AnalyticsDashboard summary={mockSummary} conditionFrequency={{}} profile={null} history={[]} />)
    expect(screen.getByText(/frames analysed/i)).toBeInTheDocument()
  })

  it('shows good posture percentage', () => {
    render(<AnalyticsDashboard summary={mockSummary} conditionFrequency={{}} profile={null} history={[]} />)
    expect(screen.getByText(/60\.0%/)).toBeInTheDocument()
  })

  it('shows most frequent condition label', () => {
    render(<AnalyticsDashboard
      summary={mockSummary}
      conditionFrequency={{ head_misalignment: 200, shoulder_imbalance: 50 }}
      profile={null}
      history={[]}
    />)
    expect(screen.getByText('Most frequent')).toBeInTheDocument()
  })

  it('shows status distribution chart section', () => {
    render(<AnalyticsDashboard summary={mockSummary} conditionFrequency={{}} profile={null} history={[]} />)
    expect(screen.getByText(/status distribution/i)).toBeInTheDocument()
  })

  it('shows condition frequency chart when conditions are present', () => {
    render(<AnalyticsDashboard
      summary={mockSummary}
      conditionFrequency={{ head_misalignment: 100 }}
      profile={null}
      history={[]}
    />)
    expect(screen.getByText(/condition frequency/i)).toBeInTheDocument()
  })
})

describe('AnalyticsDashboard — recommendations', () => {
  it('shows recommendations section', () => {
    render(<AnalyticsDashboard summary={mockSummary} conditionFrequency={{}} profile={mockProfile} history={[]} />)
    expect(screen.getByText(/recommendations/i)).toBeInTheDocument()
  })

  it('shows role-based recommendation for remote_worker profile', () => {
    render(<AnalyticsDashboard summary={mockSummary} conditionFrequency={{}} profile={mockProfile} history={[]} />)
    const cards = screen.getAllByText(/.+/i)
    const hasRemoteWorkerContent = cards.some(el => /standing breaks|ergonomics|remote/i.test(el.textContent ?? ''))
    expect(hasRemoteWorkerContent).toBe(true)
  })
})

describe('AnalyticsDashboard — sub-tab navigation', () => {
  it('renders sub-tab buttons', () => {
    render(<AnalyticsDashboard summary={null} conditionFrequency={{}} profile={null} history={[]} />)
    expect(screen.getByRole('button', { name: /current session/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /history/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /habit tracker/i })).toBeInTheDocument()
  })

  it('switches to History sub-tab and shows empty history message', async () => {
    const user = userEvent.setup()
    render(<AnalyticsDashboard summary={null} conditionFrequency={{}} profile={null} history={[]} />)
    await user.click(screen.getByRole('button', { name: /history/i }))
    expect(screen.getByText(/no sessions recorded yet/i)).toBeInTheDocument()
  })

  it('shows session record in history table', async () => {
    const user = userEvent.setup()
    render(<AnalyticsDashboard summary={null} conditionFrequency={{}} profile={null} history={[mockRecord]} />)
    await user.click(screen.getByRole('button', { name: /history/i }))
    expect(screen.getByText(/session history/i)).toBeInTheDocument()
  })

  it('switches to Habit Tracker sub-tab', async () => {
    const user = userEvent.setup()
    render(<AnalyticsDashboard summary={null} conditionFrequency={{}} profile={null} history={[]} />)
    await user.click(screen.getByRole('button', { name: /habit tracker/i }))
    expect(screen.getByText(/activity/i)).toBeInTheDocument()
  })
})
