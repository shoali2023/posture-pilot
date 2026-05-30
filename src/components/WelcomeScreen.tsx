import { BrandLogo } from './BrandLogo'
import type { UserProfile } from '../types/userProfile'
import { PROFILE_PRESETS } from '../data/profilePresets'

interface Props {
  savedProfile: UserProfile | null
  onContinueWithSaved: () => void
  onCreateSetup: () => void
  onContinueWithout: () => void
  onStartFresh: () => void
}

export function WelcomeScreen({
  savedProfile,
  onContinueWithSaved,
  onCreateSetup,
  onContinueWithout,
  onStartFresh,
}: Props) {
  const roleLabel = savedProfile
    ? PROFILE_PRESETS[savedProfile.role]?.label ?? savedProfile.role
    : null

  if (savedProfile) {
    return (
      <div className="welcome-screen">
        <div className="welcome-screen__card">
          <div className="welcome-screen__logo">
            <BrandLogo variant="mark" size="72px" />
            <p className="welcome-screen__tagline">PosturePilot</p>
          </div>

          <p className="welcome-screen__greeting">Welcome back</p>
          <p className="welcome-screen__profile-info">
            Your saved setup: <strong>{roleLabel}</strong>
          </p>

          <div className="welcome-screen__actions">
            <button
              className="btn btn--primary welcome-screen__btn-primary"
              onClick={onContinueWithSaved}
              type="button"
            >
              Continue with saved setup
            </button>
            <button
              className="btn btn--secondary"
              onClick={onCreateSetup}
              type="button"
            >
              Edit setup
            </button>
            <button
              className="btn btn--ghost"
              onClick={onStartFresh}
              type="button"
            >
              Start fresh
            </button>
          </div>

          <p className="welcome-screen__privacy">
            All posture analysis runs locally in your browser — no account, no upload.
          </p>
          <p className="welcome-screen__disclaimer">
            PosturePilot supports posture awareness only and is not a medical tool.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-screen__card">
        <div className="welcome-screen__logo">
          <BrandLogo variant="mark" size="72px" />
          <p className="welcome-screen__tagline">PosturePilot</p>
          <p className="welcome-screen__subtitle">Your calm posture co-pilot during long computer sessions.</p>
        </div>

        <p className="welcome-screen__intro">
          Real-time webcam pose tracking, gentle feedback, personalised reminders, and habit analytics —
          all running locally in your browser. No account required.
        </p>

        <div className="welcome-screen__actions">
          <button
            className="btn btn--primary welcome-screen__btn-primary"
            onClick={onCreateSetup}
            type="button"
          >
            Set up your profile
          </button>
          <button
            className="btn btn--secondary"
            onClick={onContinueWithout}
            type="button"
          >
            Skip for now
          </button>
        </div>

        <p className="welcome-screen__privacy">
          Everything stays in this browser — no account, no video upload, no server.
        </p>
        <p className="welcome-screen__disclaimer">
          PosturePilot supports posture awareness only and is not a medical tool.
        </p>
      </div>
    </div>
  )
}
