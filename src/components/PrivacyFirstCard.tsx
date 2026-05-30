interface Props {
  compact?: boolean
}

const PRIVACY_POINTS = [
  'Webcam processing runs entirely in your browser using WebAssembly.',
  'No video, image, or posture data is ever sent to a server.',
  'No account or sign-in is required.',
  'Your profile, history, and calibration are saved only in this browser.',
  'You can clear all saved data at any time from Settings.',
  'The pose detection model is downloaded once from a public CDN (MediaPipe / jsDelivr) and then cached. No other external requests are made.',
]

export function PrivacyFirstCard({ compact = false }: Props) {
  if (compact) {
    return (
      <p className="privacy-compact">
        All analysis runs locally · no upload · no account required
      </p>
    )
  }

  return (
    <div className="privacy-card">
      <div className="privacy-card__header">
        <span className="privacy-card__title">Privacy-first design</span>
      </div>
      <ul className="privacy-card__list">
        {PRIVACY_POINTS.map((point, i) => (
          <li key={i} className="privacy-card__item">{point}</li>
        ))}
      </ul>
    </div>
  )
}
