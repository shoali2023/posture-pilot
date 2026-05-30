import type { NormalizedLandmark } from '../../types/posture'

export const LM = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const

export const POSTURE_CONNECTIONS: [number, number][] = [
  // Torso
  [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
  [LM.LEFT_SHOULDER, LM.LEFT_HIP],
  [LM.RIGHT_SHOULDER, LM.RIGHT_HIP],
  [LM.LEFT_HIP, LM.RIGHT_HIP],
  // Left arm
  [LM.LEFT_SHOULDER, LM.LEFT_ELBOW],
  [LM.LEFT_ELBOW, LM.LEFT_WRIST],
  // Right arm
  [LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW],
  [LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
  // Left leg
  [LM.LEFT_HIP, LM.LEFT_KNEE],
  [LM.LEFT_KNEE, LM.LEFT_ANKLE],
  // Right leg
  [LM.RIGHT_HIP, LM.RIGHT_KNEE],
  [LM.RIGHT_KNEE, LM.RIGHT_ANKLE],
  // Head
  [LM.NOSE, LM.LEFT_EYE],
  [LM.NOSE, LM.RIGHT_EYE],
  [LM.LEFT_EYE, LM.LEFT_EAR],
  [LM.RIGHT_EYE, LM.RIGHT_EAR],
  [LM.LEFT_EAR, LM.LEFT_SHOULDER],
  [LM.RIGHT_EAR, LM.RIGHT_SHOULDER],
]

export const REQUIRED_POSTURE_INDICES = [
  LM.NOSE,
  LM.LEFT_SHOULDER,
  LM.RIGHT_SHOULDER,
  LM.LEFT_HIP,
  LM.RIGHT_HIP,
]

const VISIBILITY_THRESHOLD = 0.5

export function getRequiredPostureLandmarks(landmarks: NormalizedLandmark[]) {
  return REQUIRED_POSTURE_INDICES.map((i) => landmarks[i])
}

export function areMainLandmarksVisible(landmarks: NormalizedLandmark[]): boolean {
  return REQUIRED_POSTURE_INDICES.every((i) => {
    const lm = landmarks[i]
    return lm && (lm.visibility === undefined || lm.visibility >= VISIBILITY_THRESHOLD)
  })
}
