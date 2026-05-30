import type { PostureStatus } from '../types/posture'

interface Props {
  status: PostureStatus
}

const LABELS: Record<PostureStatus, string> = {
  good: 'Good Posture',
  warning: 'Warning',
  bad: 'Poor Posture',
}

export function FeedbackBadge({ status }: Props) {
  return (
    <span className={`feedback-badge feedback-badge--${status}`}>
      {LABELS[status]}
    </span>
  )
}
