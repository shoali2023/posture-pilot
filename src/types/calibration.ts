export interface PostureBaseline {
  shoulderTilt: number
  trunkAngle: number
  neckOffset: number
  createdAt: string
}

export interface BaselineDeviation {
  shoulderTiltDeviation: number
  trunkAngleDeviation: number
  neckOffsetDeviation: number
}
