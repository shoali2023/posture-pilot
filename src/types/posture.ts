export type PostureStatus = 'good' | 'warning' | 'bad'

export type PostureConditionId =
  | 'upright_posture'
  | 'shoulder_imbalance'
  | 'trunk_lean'
  | 'head_misalignment'
  | 'low_visibility'

export interface PostureCondition {
  id: PostureConditionId
  name: string
  description: string
  feedback: string
  userInstruction: string
}

export interface PostureResult {
  status: PostureStatus
  shoulderTilt: number
  trunkAngle: number
  neckOffset: number
  confidence: number
  activeConditions: PostureCondition[]
}

export interface Point2D {
  x: number
  y: number
}

export interface NormalizedLandmark {
  x: number
  y: number
  z: number
  visibility?: number
}
