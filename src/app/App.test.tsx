import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from './App'

const MOCK_SUMMARY = {
  durationSeconds: 120,
  totalFrames: 200,
  goodPct: 65,
  warningPct: 25,
  badPct: 10,
  dominantStatus: 'good' as const,
  generalRecommendation: 'Keep it up!',
}

vi.mock('../components/PoseCamera', () => ({
  PoseCamera: ({
    onSessionEnd,
    onSessionPause,
    isActive,
  }: {
    onSessionEnd?: (summary: typeof MOCK_SUMMARY, freq: Record<string, number>) => void
    onSessionPause?: (cp: object) => void
    isActive?: boolean
  }) => (
    <div data-testid="mock-pose-camera" data-active={String(isActive ?? true)}>
      <button onClick={() => onSessionEnd?.(MOCK_SUMMARY, { shoulder_imbalance: 30 })}>
        End session
      </button>
      <button onClick={() => onSessionPause?.({ frameCount: 50, statusCounts: { good: 30, warning: 15, bad: 5 }, conditionFrequency: {}, elapsedSeconds: 60, startedAt: new Date().toISOString() })}>
        Pause session
      </button>
    </div>
  ),
}))

vi.mock('../lib/storage/profileStorage', () => ({
  loadProfile: () => null,
  saveProfile: vi.fn(),
  clearProfile: vi.fn(),
}))

vi.mock('../lib/calibration/calibrationLogic', () => ({
  loadBaseline: () => null,
  saveBaseline: vi.fn(),
  resetCalibration: vi.fn(),
  createBaselineFromPosture: vi.fn(),
  calculateDeviationFromBaseline: vi.fn(),
}))

vi.mock('../lib/history/sessionHistoryStorage', () => ({
  saveSessionRecord: vi.fn(),
  loadSessionHistory: () => [],
  clearSessionHistory: vi.fn(),
  deleteSessionRecord: vi.fn(),
  getSessionsByDay: () => ({}),
  averagePostureStats: () => null,
  topConditionAcrossRecords: () => null,
}))

vi.mock('../hooks/useReminderTimer', () => ({
  useReminderTimer: () => ({
    intervalMinutes: 45,
    remainingSeconds: 2700,
    isPaused: false,
    reminderCount: 0,
    items: [],
    fatigueReached: false,
    progress: { done: 0, total: 0 },
    notificationsEnabled: false,
    notificationPermission: 'unsupported',
    pause: vi.fn(),
    resume: vi.fn(),
    reset: vi.fn(),
    toggleItem: vi.fn(),
    requestDesktopNotifications: vi.fn(),
    disableNotifications: vi.fn(),
  }),
}))

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => null,
  Cell: () => null,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
}))

// Helper: get past WelcomeScreen
async function renderApp() {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: /skip for now/i }))
  return user
}

describe('App — WelcomeScreen', () => {
  it('shows WelcomeScreen on first load', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /skip for now/i })).toBeInTheDocument()
  })

  it('shows PosturePilot name on WelcomeScreen', () => {
    render(<App />)
    expect(screen.getByText('PosturePilot')).toBeInTheDocument()
  })

  it('shows tagline on WelcomeScreen', () => {
    render(<App />)
    expect(screen.getByText(/calm posture co-pilot/i)).toBeInTheDocument()
  })

  it('proceeds to main app after Skip for now', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /skip for now/i }))
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })
})

describe('App — branding (after welcome)', () => {
  it('renders PosturePilot brand logo image', async () => {
    await renderApp()
    // Logo renders as an img with alt "PosturePilot"
    const logos = screen.getAllByRole('img', { name: /posturepilot/i })
    expect(logos.length).toBeGreaterThan(0)
  })

  it('renders a disclaimer', async () => {
    await renderApp()
    const disclaimers = screen.getAllByText(/posture awareness.*not a medical|not a medical.*tool/i)
    expect(disclaimers.length).toBeGreaterThan(0)
  })

  it('does not render the old KinePose name', async () => {
    await renderApp()
    expect(screen.queryByText('KinePose')).not.toBeInTheDocument()
  })
})

describe('App — tab navigation', () => {
  it('renders tab navigation', async () => {
    await renderApp()
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })

  it('shows Live Check tab active after skip', async () => {
    await renderApp()
    expect(screen.getByRole('tab', { name: /live check/i })).toHaveAttribute('aria-selected', 'true')
  })

  it('switches to Reminders tab', async () => {
    const user = await renderApp()
    await user.click(screen.getByRole('tab', { name: /reminders/i }))
    expect(screen.getByText(/next reminder/i)).toBeInTheDocument()
  })

  it('switches to Analytics tab', async () => {
    const user = await renderApp()
    await user.click(screen.getByRole('tab', { name: /analytics/i }))
    expect(screen.getByText(/no session data yet/i)).toBeInTheDocument()
  })

  it('switches to Settings tab', async () => {
    const user = await renderApp()
    await user.click(screen.getByRole('tab', { name: /settings/i }))
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument()
  })
})

describe('App — AppFooter', () => {
  it('renders author name in footer', async () => {
    await renderApp()
    expect(screen.getByText(/ali shoeibi/i)).toBeInTheDocument()
  })

  it('renders GitHub link pointing to shoali2023', async () => {
    await renderApp()
    const link = screen.getByRole('link', { name: /github/i })
    expect(link).toHaveAttribute('href', 'https://github.com/shoali2023')
  })

  it('renders LinkedIn link', async () => {
    await renderApp()
    const link = screen.getByRole('link', { name: /linkedin/i })
    expect(link).toHaveAttribute('href', 'https://www.linkedin.com/in/ali-shoeibi01')
  })

  it('University of Salamanca is mentioned in footer', async () => {
    await renderApp()
    expect(screen.getByText(/university of salamanca/i)).toBeInTheDocument()
  })
})

describe('App — Live Check always mounted', () => {
  it('PoseCamera is present in the DOM even when on the Home tab', async () => {
    const user = await renderApp()
    await user.click(screen.getByRole('tab', { name: /home/i }))
    expect(screen.getByTestId('mock-pose-camera')).toBeInTheDocument()
  })

  it('PoseCamera has isActive=false when user is on a different tab', async () => {
    const user = await renderApp()
    await user.click(screen.getByRole('tab', { name: /reminders/i }))
    expect(screen.getByTestId('mock-pose-camera')).toHaveAttribute('data-active', 'false')
  })

  it('PoseCamera has isActive=true when on Live Check tab', async () => {
    await renderApp()
    expect(screen.getByTestId('mock-pose-camera')).toHaveAttribute('data-active', 'true')
  })
})

describe('App — session lifecycle across tab switches', () => {
  it('sessionSummary is preserved after switching to Analytics and back', async () => {
    const user = await renderApp()
    // End session from mock PoseCamera
    await user.click(screen.getByRole('button', { name: /end session/i }))
    // Navigate to Analytics
    await user.click(screen.getByRole('tab', { name: /analytics/i }))
    // Analytics should show session data, not "no session data yet"
    expect(screen.queryByText(/no session data yet/i)).not.toBeInTheDocument()
  })

  it('switching from Live Check to Reminders does NOT clear sessionSummary', async () => {
    const user = await renderApp()
    await user.click(screen.getByRole('button', { name: /end session/i }))
    // Switch to Reminders
    await user.click(screen.getByRole('tab', { name: /reminders/i }))
    // Switch to Analytics — summary should still be there
    await user.click(screen.getByRole('tab', { name: /analytics/i }))
    expect(screen.queryByText(/no session data yet/i)).not.toBeInTheDocument()
  })

  it('session record is saved to history when session ends', async () => {
    const { saveSessionRecord } = await import('../lib/history/sessionHistoryStorage')
    vi.clearAllMocks()
    const user = await renderApp()
    await user.click(screen.getByRole('button', { name: /end session/i }))
    expect(saveSessionRecord).toHaveBeenCalledOnce()
  })
})

describe('App — Settings smoothing selector', () => {
  it('renders the skeleton smoothing selector in Settings', async () => {
    const user = await renderApp()
    await user.click(screen.getByRole('tab', { name: /settings/i }))
    expect(screen.getByLabelText(/skeleton smoothing/i)).toBeInTheDocument()
  })

  it('default smoothing value is "balanced"', async () => {
    const user = await renderApp()
    await user.click(screen.getByRole('tab', { name: /settings/i }))
    const select = screen.getByLabelText(/skeleton smoothing/i) as HTMLSelectElement
    expect(select.value).toBe('balanced')
  })

  it('changing smoothing level updates the select UI value', async () => {
    const user = await renderApp()
    await user.click(screen.getByRole('tab', { name: /settings/i }))
    const select = screen.getByLabelText(/skeleton smoothing/i) as HTMLSelectElement
    await user.selectOptions(select, 'high')
    expect(select.value).toBe('high')
  })
})
