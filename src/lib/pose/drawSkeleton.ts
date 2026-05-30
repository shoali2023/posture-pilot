import type { NormalizedLandmark, PostureStatus } from '../../types/posture'
import { POSTURE_CONNECTIONS } from './landmarkUtils'

const STATUS_COLOR: Record<PostureStatus, string> = {
  good: '#22c55e',
  warning: '#f59e0b',
  bad: '#ef4444',
}

const VISIBILITY_THRESHOLD = 0.4
const JOINT_RADIUS = 5
const LINE_WIDTH = 2.5

// Below this confidence the skeleton fades to signal unreliable detection
const LOW_CONFIDENCE_THRESHOLD = 0.45
const LOW_CONFIDENCE_ALPHA = 0.35

function isVisible(lm: NormalizedLandmark): boolean {
  return lm.visibility === undefined || lm.visibility >= VISIBILITY_THRESHOLD
}

export function drawSkeleton(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  status: PostureStatus,
  canvasWidth: number,
  canvasHeight: number,
  confidence = 1.0
): void {
  const color = STATUS_COLOR[status]
  const isLowConf = confidence < LOW_CONFIDENCE_THRESHOLD

  ctx.save()
  if (isLowConf) {
    ctx.globalAlpha = LOW_CONFIDENCE_ALPHA
  }

  // Draw connections
  ctx.strokeStyle = color
  ctx.lineWidth = LINE_WIDTH
  ctx.lineCap = 'round'

  for (const [startIdx, endIdx] of POSTURE_CONNECTIONS) {
    const start = landmarks[startIdx]
    const end = landmarks[endIdx]
    if (!start || !end) continue
    if (!isVisible(start) || !isVisible(end)) continue

    ctx.beginPath()
    ctx.moveTo(start.x * canvasWidth, start.y * canvasHeight)
    ctx.lineTo(end.x * canvasWidth, end.y * canvasHeight)
    ctx.stroke()
  }

  // Draw keypoints
  for (const lm of landmarks) {
    if (!lm || !isVisible(lm)) continue
    ctx.beginPath()
    ctx.arc(lm.x * canvasWidth, lm.y * canvasHeight, JOINT_RADIUS, 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  ctx.restore()
}
