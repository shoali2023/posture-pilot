import type { NormalizedLandmark, Point2D, PostureConditionId, PostureResult } from '../../types/posture'
import { LM, REQUIRED_POSTURE_INDICES } from './landmarkUtils'
import { getCondition } from '../../data/gestureDictionary'

// ── Math helpers ───────────────────────────────────────────────────────────
export function midpoint(a: Point2D, b: Point2D): Point2D {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

// Angle from vertical in degrees (0° = straight, 90° = horizontal).
// Uses absolute values so it works correctly with y-down image coordinates.
export function calculateAngleFromVertical(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x
  const dy = p2.y - p1.y
  return Math.atan2(Math.abs(dx), Math.abs(dy)) * (180 / Math.PI)
}

export function calculateAverageVisibility(
  landmarks: NormalizedLandmark[],
  indices: number[]
): number {
  const values = indices.map((i) => landmarks[i]?.visibility ?? 1)
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

// ── Thresholds ─────────────────────────────────────────────────────────────
export const THRESHOLDS = {
  confidence:   0.5,
  shoulderTilt: 0.06,
  trunkAngle:   15,
  neckOffset:   0.10,
} as const

// ── Main analysis ──────────────────────────────────────────────────────────
export function analyzePosture(landmarks: NormalizedLandmark[]): PostureResult {
  // Guard: return low_visibility if critical landmarks are missing
  const critical = [LM.NOSE, LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_HIP, LM.RIGHT_HIP]
  if (critical.some((i) => !landmarks[i])) {
    return {
      status: 'bad',
      shoulderTilt: 0,
      trunkAngle: 0,
      neckOffset: 0,
      confidence: 0,
      activeConditions: [getCondition('low_visibility')],
    }
  }

  const confidence = calculateAverageVisibility(landmarks, REQUIRED_POSTURE_INDICES)

  if (confidence < THRESHOLDS.confidence) {
    return {
      status: 'bad',
      shoulderTilt: 0,
      trunkAngle: 0,
      neckOffset: 0,
      confidence,
      activeConditions: [getCondition('low_visibility')],
    }
  }

  const leftShoulder  = landmarks[LM.LEFT_SHOULDER]
  const rightShoulder = landmarks[LM.RIGHT_SHOULDER]
  const leftHip       = landmarks[LM.LEFT_HIP]
  const rightHip      = landmarks[LM.RIGHT_HIP]
  const nose          = landmarks[LM.NOSE]

  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y)
  const shoulderMid  = midpoint(leftShoulder, rightShoulder)
  const hipMid       = midpoint(leftHip, rightHip)
  const trunkAngle   = calculateAngleFromVertical(hipMid, shoulderMid)
  const neckOffset   = Math.abs(nose.x - shoulderMid.x)

  const activeIssueIds: PostureConditionId[] = []
  if (shoulderTilt > THRESHOLDS.shoulderTilt) activeIssueIds.push('shoulder_imbalance')
  if (trunkAngle   > THRESHOLDS.trunkAngle)   activeIssueIds.push('trunk_lean')
  if (neckOffset   > THRESHOLDS.neckOffset)   activeIssueIds.push('head_misalignment')

  const status =
    activeIssueIds.length === 0 ? 'good' :
    activeIssueIds.length === 1 ? 'warning' :
    'bad'

  const activeConditions =
    activeIssueIds.length === 0
      ? [getCondition('upright_posture')]
      : activeIssueIds.map(getCondition)

  return { status, shoulderTilt, trunkAngle, neckOffset, confidence, activeConditions }
}
