import { useState } from 'react'
import type { PostureCondition, PostureResult, PostureStatus } from '../types/posture'
import { FeedbackBadge } from './FeedbackBadge'

interface Props {
  result: PostureResult | null
}

function Metric({ label, value, decimals = 3, unit = '' }: {
  label: string
  value: number
  decimals?: number
  unit?: string
}) {
  return (
    <div className="metric">
      <span className="metric__label">{label}</span>
      <span className="metric__value">
        {value.toFixed(decimals)}
        {unit && <span className="metric__unit">{unit}</span>}
      </span>
    </div>
  )
}

function GoodPostureFigure() {
  return (
    <svg
      className="good-posture-figure"
      viewBox="0 0 56 88"
      aria-label="Good posture figure"
      aria-hidden="true"
    >
      {/* Head — filled, proportional */}
      <circle cx="28" cy="9" r="8" fill="currentColor" />
      {/* Spine — the visual centre axis */}
      <line x1="28" y1="17" x2="28" y2="56" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* Shoulder bar */}
      <line x1="13" y1="27" x2="43" y2="27" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* Hip bar */}
      <line x1="17" y1="56" x2="39" y2="56" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* Left arm — relaxed, slight angle */}
      <line x1="13" y1="27" x2="7"  y2="46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Right arm */}
      <line x1="43" y1="27" x2="49" y2="46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Left leg */}
      <line x1="22" y1="56" x2="16" y2="82" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* Right leg */}
      <line x1="34" y1="56" x2="40" y2="82" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* Alignment dots — shoulder and hip on the spine */}
      <circle cx="28" cy="27" r="3.5" fill="currentColor" opacity="0.3" />
      <circle cx="28" cy="56" r="3.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

function ConditionCard({ condition, status }: { condition: PostureCondition; status: PostureStatus }) {
  const isGood   = condition.id === 'upright_posture'
  const isLowVis = condition.id === 'low_visibility'
  // low_visibility is always bad/red regardless of how status is passed in
  const colorMod = isGood ? 'good' : isLowVis ? 'bad' : status

  return (
    <div className={`condition-card condition-card--${colorMod}${isGood ? ' condition-card--upright' : ''}`}>
      <div className="condition-card__body">
        <div className="condition-card__header">
          <code className="condition-card__id">{condition.id}</code>
          <span className="condition-card__name">{condition.name}</span>
        </div>
        <p className="condition-card__feedback">{condition.feedback}</p>
        {!isGood && (
          <p className="condition-card__instruction">
            <span className="condition-card__instruction-label">What to do: </span>
            {condition.userInstruction}
          </p>
        )}
      </div>
      {isGood && <GoodPostureFigure />}
    </div>
  )
}

export function PostureReport({ result }: Props) {
  const [showDetails, setShowDetails] = useState(false)

  if (!result) {
    return (
      <div className="posture-report posture-report--empty">
        <p>Waiting for body detection…</p>
      </div>
    )
  }

  return (
    <div className="posture-report">
      <div className="posture-report__header">
        <FeedbackBadge status={result.status} />
        <span className="posture-report__confidence">
          Confidence: {(result.confidence * 100).toFixed(0)}%
        </span>
      </div>

      <div className="posture-report__conditions">
        <h4 className="posture-report__conditions-title">Detected conditions</h4>
        <div className="posture-report__conditions-list">
          {result.activeConditions.map((c) => (
            <ConditionCard key={c.id} condition={c} status={result.status} />
          ))}
        </div>
      </div>

      <div className="posture-report__details-toggle">
        <button
          className="btn btn--ghost btn--small"
          onClick={() => setShowDetails(prev => !prev)}
          aria-expanded={showDetails}
        >
          {showDetails ? 'Hide posture details' : 'Show posture details'}
        </button>
      </div>

      {showDetails && (
        <div className="posture-report__metrics" data-testid="posture-details">
          <Metric label="Shoulder tilt" value={result.shoulderTilt} decimals={3} />
          <Metric label="Trunk angle"   value={result.trunkAngle}   decimals={1} unit="°" />
          <Metric label="Neck offset"   value={result.neckOffset}   decimals={3} />
        </div>
      )}
    </div>
  )
}
