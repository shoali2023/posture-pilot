import type { PostureStatus } from '../types/posture'

interface Props {
  status: PostureStatus | null
  lowVisibility?: boolean
}

const OVERLAY_CONFIG: Record<
  PostureStatus,
  { frameColor: string; bgColor: string; message: string | null }
> = {
  good: {
    frameColor: 'rgba(34, 197, 94, 0.55)',
    bgColor: 'transparent',
    message: null,
  },
  warning: {
    frameColor: 'rgba(245, 158, 11, 0.70)',
    bgColor: 'rgba(245, 158, 11, 0.04)',
    message: 'Small posture adjustment suggested',
  },
  bad: {
    frameColor: 'rgba(239, 68, 68, 0.80)',
    bgColor: 'rgba(239, 68, 68, 0.07)',
    message: 'Posture check recommended',
  },
}

export function PostureOverlay({ status, lowVisibility = false }: Props) {
  if (!status) return null

  if (lowVisibility) {
    return (
      <div
        className="posture-overlay posture-overlay--low-visibility"
        data-testid="posture-overlay-low-visibility"
        role="status"
        aria-live="polite"
      >
        <p className="posture-overlay__hint">
          We cannot see your head, shoulders and hips clearly.
          <br />
          Adjust distance (1.5–2 m), lighting or camera angle.
        </p>
      </div>
    )
  }

  const cfg = OVERLAY_CONFIG[status]

  return (
    <div
      className={`posture-overlay posture-overlay--${status}`}
      data-testid={`posture-overlay-${status}`}
      style={{
        boxShadow: `inset 0 0 0 3px ${cfg.frameColor}, 0 0 12px 2px ${cfg.frameColor}`,
        background: cfg.bgColor,
      }}
      role="status"
      aria-live="polite"
    >
      {cfg.message && (
        <p className="posture-overlay__message">{cfg.message}</p>
      )}
    </div>
  )
}
