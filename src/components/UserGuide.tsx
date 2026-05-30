import { GESTURE_DICTIONARY } from '../data/gestureDictionary'
import type { GestureDefinition } from '../types/gesture'

const SETUP_STEPS = [
  'Position yourself 1.5–2 metres from the camera.',
  'Make sure your head, shoulders and hips are fully visible in the frame.',
  'Use even, preferably front-facing lighting.',
  'Keep the camera stable and at eye level.',
  'Avoid backgrounds with too much movement or high contrast.',
  'For frontal analysis, look directly at the camera.',
  'For lateral analysis, position your body in profile.',
  'Avoid sudden movements when starting the session.',
  'Press Start when you are ready.',
  'You can press Stop or Reset at any time.',
]

const SEVERITY_LABEL: Record<string, string> = {
  good:    'Correct',
  warning: 'Warning',
  bad:     'Critical',
}

function GestureCard({ gesture }: { gesture: GestureDefinition }) {
  return (
    <div className={`gesture-card gesture-card--${gesture.severity}`}>
      <div className="gesture-card__header">
        <span className={`gesture-severity gesture-severity--${gesture.severity}`}>
          {SEVERITY_LABEL[gesture.severity]}
        </span>
        <span className="gesture-card__name">{gesture.name}</span>
      </div>

      <p className="gesture-card__description">{gesture.description}</p>

      <div className="gesture-card__instruction">
        <span className="gesture-card__instruction-label">How to achieve it:</span>
        {gesture.userInstruction}
      </div>

      <div className="gesture-card__feedback">
        <span className="gesture-card__feedback-label">System feedback:</span>
        {gesture.feedback}
      </div>

      <details className="gesture-card__details">
        <summary className="gesture-card__details-trigger">
          Body points analysed
        </summary>
        <ul className="gesture-card__landmarks">
          {gesture.usedLandmarks.map((lm) => (
            <li key={lm}>{lm.replace(/_/g, ' ')}</li>
          ))}
        </ul>
        <ul className="gesture-card__rules">
          {gesture.ruleSummary.map((rule, i) => (
            <li key={i}>{rule}</li>
          ))}
        </ul>
      </details>
    </div>
  )
}

export function UserGuide() {
  return (
    <section className="user-guide" aria-label="User guide">
      <div className="user-guide__setup">
        <h2 className="user-guide__section-title">How to position yourself before starting</h2>
        <ol className="setup-steps">
          {SETUP_STEPS.map((step, i) => (
            <li key={i} className="setup-step">
              <span className="setup-step__num">{i + 1}</span>
              <span className="setup-step__text">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="user-guide__gestures">
        <h2 className="user-guide__section-title">Postures recognised by the system</h2>
        <p className="user-guide__gestures-intro">
          The system analyses the following postural conditions in real time using the body
          points detected by the camera.
        </p>
        <div className="gesture-cards">
          {GESTURE_DICTIONARY.map((g) => (
            <GestureCard key={g.id} gesture={g} />
          ))}
        </div>
      </div>
    </section>
  )
}
