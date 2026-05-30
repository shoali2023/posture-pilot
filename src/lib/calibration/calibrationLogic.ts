import type { PostureResult } from '../../types/posture'
import type { PostureBaseline, BaselineDeviation } from '../../types/calibration'

const CALIBRATION_KEY = 'posturepilot_posture_baseline'
const MIN_SAMPLES = 10
const MIN_CONFIDENCE = 0.55

export function createBaselineFromPosture(postureResult: PostureResult): PostureBaseline {
  return {
    shoulderTilt: postureResult.shoulderTilt,
    trunkAngle: postureResult.trunkAngle,
    neckOffset: postureResult.neckOffset,
    createdAt: new Date().toISOString(),
  }
}

/** Average a set of posture samples into a single baseline. */
export function calculateCalibrationBaselineFromSamples(
  samples: PostureResult[]
): PostureBaseline {
  const n = samples.length
  const avg = (key: keyof Pick<PostureResult, 'shoulderTilt' | 'trunkAngle' | 'neckOffset'>) =>
    samples.reduce((s, r) => s + r[key], 0) / n
  return {
    shoulderTilt: avg('shoulderTilt'),
    trunkAngle:   avg('trunkAngle'),
    neckOffset:   avg('neckOffset'),
    createdAt:    new Date().toISOString(),
  }
}

export interface CalibrationQuality {
  valid: boolean
  message?: string
}

/** Check whether collected samples are reliable enough to accept. */
export function validateCalibrationQuality(samples: PostureResult[]): CalibrationQuality {
  if (samples.length < MIN_SAMPLES) {
    return { valid: false, message: 'Not enough frames collected. Hold still a moment longer.' }
  }
  const avgConf = samples.reduce((s, r) => s + r.confidence, 0) / samples.length
  if (avgConf < MIN_CONFIDENCE) {
    return {
      valid: false,
      message: 'Body not fully visible. Make sure your head, shoulders, and hips are in frame.',
    }
  }
  return { valid: true }
}

export function calculateDeviationFromBaseline(
  currentPosture: PostureResult,
  baseline: PostureBaseline
): BaselineDeviation {
  return {
    shoulderTiltDeviation: Math.abs(currentPosture.shoulderTilt - baseline.shoulderTilt),
    trunkAngleDeviation: Math.abs(currentPosture.trunkAngle - baseline.trunkAngle),
    neckOffsetDeviation: Math.abs(currentPosture.neckOffset - baseline.neckOffset),
  }
}

export function saveBaseline(baseline: PostureBaseline): void {
  try {
    localStorage.setItem(CALIBRATION_KEY, JSON.stringify(baseline))
  } catch {
    // localStorage may be unavailable in some environments
  }
}

export function loadBaseline(): PostureBaseline | null {
  try {
    const raw = localStorage.getItem(CALIBRATION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PostureBaseline
  } catch {
    return null
  }
}

export function resetCalibration(): void {
  try {
    localStorage.removeItem(CALIBRATION_KEY)
  } catch {
    // ignore
  }
}
