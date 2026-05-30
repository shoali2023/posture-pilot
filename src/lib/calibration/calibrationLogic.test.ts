import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createBaselineFromPosture,
  calculateDeviationFromBaseline,
  resetCalibration,
  saveBaseline,
  loadBaseline,
} from './calibrationLogic'
import type { PostureResult } from '../../types/posture'

const mockPosture = (
  shoulderTilt: number,
  trunkAngle: number,
  neckOffset: number,
  status: PostureResult['status'] = 'good'
): PostureResult => ({
  shoulderTilt,
  trunkAngle,
  neckOffset,
  status,
  confidence: 0.9,
  activeConditions: [],
})

describe('createBaselineFromPosture', () => {
  it('captures shoulder tilt, trunk angle and neck offset from posture result', () => {
    const posture = mockPosture(0.01, 0.02, 0.03)
    const baseline = createBaselineFromPosture(posture)
    expect(baseline.shoulderTilt).toBe(0.01)
    expect(baseline.trunkAngle).toBe(0.02)
    expect(baseline.neckOffset).toBe(0.03)
  })

  it('sets createdAt to an ISO date string', () => {
    const posture = mockPosture(0, 0, 0)
    const baseline = createBaselineFromPosture(posture)
    expect(() => new Date(baseline.createdAt)).not.toThrow()
    expect(new Date(baseline.createdAt).getFullYear()).toBeGreaterThan(2020)
  })
})

describe('calculateDeviationFromBaseline', () => {
  it('returns absolute deviation for each metric', () => {
    const baseline = { shoulderTilt: 0.1, trunkAngle: 0.2, neckOffset: 0.3, createdAt: '' }
    const current = mockPosture(0.15, 0.1, 0.35)
    const deviation = calculateDeviationFromBaseline(current, baseline)
    expect(deviation.shoulderTiltDeviation).toBeCloseTo(0.05)
    expect(deviation.trunkAngleDeviation).toBeCloseTo(0.1)
    expect(deviation.neckOffsetDeviation).toBeCloseTo(0.05)
  })

  it('returns zero deviation when current matches baseline', () => {
    const baseline = { shoulderTilt: 0.1, trunkAngle: 0.2, neckOffset: 0.3, createdAt: '' }
    const current = mockPosture(0.1, 0.2, 0.3)
    const deviation = calculateDeviationFromBaseline(current, baseline)
    expect(deviation.shoulderTiltDeviation).toBe(0)
    expect(deviation.trunkAngleDeviation).toBe(0)
    expect(deviation.neckOffsetDeviation).toBe(0)
  })

  it('uses absolute value so negative offsets do not produce negative deviation', () => {
    const baseline = { shoulderTilt: 0.2, trunkAngle: 0.0, neckOffset: 0.0, createdAt: '' }
    const current = mockPosture(0.1, 0, 0)
    const deviation = calculateDeviationFromBaseline(current, baseline)
    expect(deviation.shoulderTiltDeviation).toBeCloseTo(0.1)
  })
})

describe('saveBaseline / loadBaseline / resetCalibration', () => {
  const store: Record<string, string> = {}

  beforeEach(() => {
    // Provide a localStorage-compatible mock for pure .ts test environment
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = value },
      removeItem: (key: string) => { delete store[key] },
      clear: () => { Object.keys(store).forEach(k => delete store[k]) },
    })
    Object.keys(store).forEach(k => delete store[k])
  })

  it('round-trips baseline through localStorage', () => {
    const baseline = { shoulderTilt: 0.1, trunkAngle: 0.2, neckOffset: 0.3, createdAt: '2025-01-01T00:00:00.000Z' }
    saveBaseline(baseline)
    const loaded = loadBaseline()
    expect(loaded).toEqual(baseline)
  })

  it('returns null when no baseline stored', () => {
    expect(loadBaseline()).toBeNull()
  })

  it('resetCalibration removes the stored baseline', () => {
    const baseline = { shoulderTilt: 0.1, trunkAngle: 0.2, neckOffset: 0.3, createdAt: '' }
    saveBaseline(baseline)
    resetCalibration()
    expect(loadBaseline()).toBeNull()
  })
})
