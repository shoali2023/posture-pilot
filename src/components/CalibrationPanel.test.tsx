import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CalibrationPanel } from './CalibrationPanel'
import type { PostureBaseline } from '../types/calibration'
import type { PostureResult } from '../types/posture'

// ── Mock calibration logic for flow tests ─────────────────────
vi.mock('../lib/calibration/calibrationLogic', () => ({
  calculateDeviationFromBaseline: vi.fn(() => ({
    shoulderTiltDeviation: 0.03,
    trunkAngleDeviation: 0.02,
    neckOffsetDeviation: 0.01,
  })),
  calculateCalibrationBaselineFromSamples: vi.fn(() => ({
    shoulderTilt: 0.01,
    trunkAngle: 2.0,
    neckOffset: 0.02,
    createdAt: new Date().toISOString(),
  })),
  validateCalibrationQuality: vi.fn(() => ({ valid: true })),
}))

const mockBaseline: PostureBaseline = {
  shoulderTilt: 0.01,
  trunkAngle: 0.02,
  neckOffset: 0.03,
  createdAt: new Date().toISOString(),
}

const mockPosture: PostureResult = {
  status: 'good',
  shoulderTilt: 0.01,
  trunkAngle: 0.02,
  neckOffset: 0.03,
  confidence: 0.9,
  activeConditions: [],
}

const mockPostureDrifted: PostureResult = {
  status: 'warning',
  shoulderTilt: 0.08,
  trunkAngle: 0.15,
  neckOffset: 0.07,
  confidence: 0.9,
  activeConditions: [],
}

// ── Idle state ────────────────────────────────────────────────

describe('CalibrationPanel — no baseline, no posture', () => {
  it('shows "Not calibrated" status', () => {
    render(<CalibrationPanel baseline={null} currentPosture={null} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByText(/not calibrated/i)).toBeInTheDocument()
  })

  it('disables start calibration button when no live posture', () => {
    render(<CalibrationPanel baseline={null} currentPosture={null} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByRole('button', { name: /start calibration/i })).toBeDisabled()
  })

  it('shows a hint to start a live session', () => {
    render(<CalibrationPanel baseline={null} currentPosture={null} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByText(/start a live session/i)).toBeInTheDocument()
  })
})

describe('CalibrationPanel — with posture, no baseline', () => {
  it('enables start calibration button when posture result is available', () => {
    render(<CalibrationPanel baseline={null} currentPosture={mockPosture} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByRole('button', { name: /start calibration/i })).not.toBeDisabled()
  })

  it('disables start calibration when posture status is bad', () => {
    const badPosture: PostureResult = { ...mockPosture, status: 'bad' }
    render(<CalibrationPanel baseline={null} currentPosture={badPosture} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByRole('button', { name: /start calibration/i })).toBeDisabled()
  })
})

// ── Counting state ────────────────────────────────────────────

describe('CalibrationPanel — counting step', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  it('clicking start calibration enters countdown', () => {
    render(<CalibrationPanel baseline={null} currentPosture={mockPosture} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: /start calibration/i })) })
    expect(screen.getByText(/hold still/i)).toBeInTheDocument()
  })

  it('cancel during countdown returns to idle', () => {
    render(<CalibrationPanel baseline={null} currentPosture={mockPosture} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: /start calibration/i })) })
    act(() => { fireEvent.click(screen.getByRole('button', { name: /cancel/i })) })
    expect(screen.getByRole('button', { name: /start calibration/i })).toBeInTheDocument()
  })

  it('countdown completes and shows preview step', () => {
    render(<CalibrationPanel baseline={null} currentPosture={mockPosture} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: /start calibration/i })) })
    // Advance one second at a time so each setTimeout + re-render registers the next one
    act(() => { vi.advanceTimersByTime(1001) })
    act(() => { vi.advanceTimersByTime(1001) })
    act(() => { vi.advanceTimersByTime(1001) })
    act(() => { vi.advanceTimersByTime(100) })
    expect(screen.getByText(/calibration preview/i)).toBeInTheDocument()
  })
})

// ── Preview / accept state ────────────────────────────────────

describe('CalibrationPanel — preview step', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { vi.useRealTimers() })

  function enterPreview(onCalibrate = vi.fn()) {
    render(<CalibrationPanel baseline={null} currentPosture={mockPosture} onCalibrate={onCalibrate} onReset={vi.fn()} />)
    act(() => { fireEvent.click(screen.getByRole('button', { name: /start calibration/i })) })
    act(() => { vi.advanceTimersByTime(1001) })
    act(() => { vi.advanceTimersByTime(1001) })
    act(() => { vi.advanceTimersByTime(1001) })
    act(() => { vi.advanceTimersByTime(100) })
  }

  it('accept calibration calls onCalibrate with a baseline', () => {
    const onCalibrate = vi.fn()
    enterPreview(onCalibrate)
    act(() => { fireEvent.click(screen.getByRole('button', { name: /accept calibration/i })) })
    expect(onCalibrate).toHaveBeenCalledOnce()
    expect(onCalibrate).toHaveBeenCalledWith(expect.objectContaining({ createdAt: expect.any(String) }))
  })

  it('try again returns to idle without calling onCalibrate', () => {
    const onCalibrate = vi.fn()
    enterPreview(onCalibrate)
    act(() => { fireEvent.click(screen.getByRole('button', { name: /try again/i })) })
    expect(onCalibrate).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /start calibration/i })).toBeInTheDocument()
  })
})

// ── With existing baseline ────────────────────────────────────

describe('CalibrationPanel — with baseline', () => {
  it('shows "Calibrated" status badge', () => {
    render(<CalibrationPanel baseline={mockBaseline} currentPosture={mockPosture} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByText(/calibrated/i)).toBeInTheDocument()
  })

  it('displays baseline values', () => {
    render(<CalibrationPanel baseline={mockBaseline} currentPosture={mockPosture} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByText(/shoulder tilt/i)).toBeInTheDocument()
    expect(screen.getByText(/trunk angle/i)).toBeInTheDocument()
    expect(screen.getByText(/neck offset/i)).toBeInTheDocument()
  })

  it('shows reset button when baseline is set', () => {
    render(<CalibrationPanel baseline={mockBaseline} currentPosture={mockPosture} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByRole('button', { name: /reset calibration/i })).toBeInTheDocument()
  })

  it('calls onReset when reset button is clicked', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    render(<CalibrationPanel baseline={mockBaseline} currentPosture={mockPosture} onCalibrate={vi.fn()} onReset={onReset} />)
    await user.click(screen.getByRole('button', { name: /reset calibration/i }))
    expect(onReset).toHaveBeenCalledOnce()
  })

  it('shows Recalibrate instead of Start calibration', () => {
    render(<CalibrationPanel baseline={mockBaseline} currentPosture={mockPosture} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByRole('button', { name: /recalibrate/i })).toBeInTheDocument()
  })
})

// ── Live deviation ────────────────────────────────────────────

describe('CalibrationPanel — live deviation', () => {
  it('shows deviation section when baseline and posture are both set', () => {
    render(<CalibrationPanel baseline={mockBaseline} currentPosture={mockPostureDrifted} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByText(/live deviation from baseline/i)).toBeInTheDocument()
  })

  it('shows Shoulders, Trunk, Neck deviation rows', () => {
    render(<CalibrationPanel baseline={mockBaseline} currentPosture={mockPostureDrifted} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByText('Shoulders')).toBeInTheDocument()
    expect(screen.getByText('Trunk')).toBeInTheDocument()
    expect(screen.getByText('Neck')).toBeInTheDocument()
  })

  it('does not show deviation section when no baseline', () => {
    render(<CalibrationPanel baseline={null} currentPosture={mockPostureDrifted} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    expect(screen.queryByText(/live deviation/i)).not.toBeInTheDocument()
  })

  it('does not show deviation section when no posture', () => {
    render(<CalibrationPanel baseline={mockBaseline} currentPosture={null} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    expect(screen.queryByText(/live deviation/i)).not.toBeInTheDocument()
  })
})

// ── Inline mode ───────────────────────────────────────────────

describe('CalibrationPanel — inline mode', () => {
  it('does not show title when inline=true', () => {
    render(<CalibrationPanel baseline={null} currentPosture={null} onCalibrate={vi.fn()} onReset={vi.fn()} inline={true} />)
    expect(screen.queryByText('Posture Calibration')).not.toBeInTheDocument()
  })

  it('shows compact description in inline mode', () => {
    render(<CalibrationPanel baseline={null} currentPosture={null} onCalibrate={vi.fn()} onReset={vi.fn()} inline={true} />)
    expect(screen.getByText(/sit comfortably upright/i)).toBeInTheDocument()
  })
})

// ── After reset ───────────────────────────────────────────────

describe('CalibrationPanel — after reset', () => {
  it('shows Not calibrated after reset (baseline null)', () => {
    render(<CalibrationPanel baseline={null} currentPosture={mockPosture} onCalibrate={vi.fn()} onReset={vi.fn()} />)
    expect(screen.getByText(/not calibrated/i)).toBeInTheDocument()
    expect(screen.queryByText(/live deviation/i)).not.toBeInTheDocument()
  })
})
