import { useState } from 'react'
import type { UserProfile, UserRole, ComputerHours, RemoteWorkStatus, PostureGoal, ReminderFrequency } from '../types/userProfile'
import {
  PROFILE_PRESETS,
  HOURS_LABELS,
  GOAL_LABELS,
  REMOTE_LABELS,
  REMINDER_LABELS,
} from '../data/profilePresets'

interface Props {
  profile: UserProfile | null
  onSave: (profile: UserProfile) => void
  onSkip?: () => void
}

interface FormState {
  role: UserRole | null
  computerHours: ComputerHours
  remoteWork: RemoteWorkStatus
  mainGoal: PostureGoal
  reminderFrequency: ReminderFrequency
  customReminderMinutes: number
}

function buildInitialForm(profile: UserProfile | null): FormState {
  if (profile) {
    return {
      role: profile.role,
      computerHours: profile.computerHours,
      remoteWork: profile.remoteWork,
      mainGoal: profile.mainGoal,
      reminderFrequency: profile.reminderFrequency,
      customReminderMinutes: profile.customReminderMinutes ?? 30,
    }
  }
  return {
    role: null,
    computerHours: '4_to_6',
    remoteWork: 'sometimes',
    mainGoal: 'general_awareness',
    reminderFrequency: '45',
    customReminderMinutes: 30,
  }
}

function ProfileSummaryCard({ profile, onEdit }: { profile: UserProfile; onEdit: () => void }) {
  const preset = PROFILE_PRESETS[profile.role]
  return (
    <div className="profile-summary">
      <div className="profile-summary__info">
        <span className="profile-summary__role">{preset.label}</span>
        <span className="profile-summary__detail">
          {HOURS_LABELS[profile.computerHours]} · {GOAL_LABELS[profile.mainGoal]}
        </span>
        <span className="profile-summary__tip">{preset.description}</span>
      </div>
      <button className="btn btn--ghost" onClick={onEdit}>
        Edit profile
      </button>
    </div>
  )
}

export function ProfileSetup({ profile, onSave, onSkip }: Props) {
  const [mode, setMode] = useState<'view' | 'edit'>(profile ? 'view' : 'edit')
  const [form, setForm] = useState<FormState>(() => buildInitialForm(profile))

  if (mode === 'view' && profile) {
    return <ProfileSummaryCard profile={profile} onEdit={() => setMode('edit')} />
  }

  function handleSave() {
    if (!form.role) return
    const saved: UserProfile = {
      role: form.role,
      computerHours: form.computerHours,
      remoteWork: form.remoteWork,
      mainGoal: form.mainGoal,
      reminderFrequency: form.reminderFrequency,
      customReminderMinutes: form.reminderFrequency === 'custom' ? form.customReminderMinutes : undefined,
    }
    onSave(saved)
    setMode('view')
  }

  function handleCancel() {
    if (profile) {
      setForm(buildInitialForm(profile))
      setMode('view')
    } else {
      onSkip?.()
    }
  }

  return (
    <div className="profile-setup">
      <h2 className="profile-setup__title">
        {profile ? 'Edit your profile' : 'Tell us about yourself'}
        <span className="profile-setup__optional"> (optional)</span>
      </h2>
      <p className="profile-setup__subtitle">
        This helps personalise your posture reminders and recommendations.
      </p>

      <div className="profile-setup__section">
        <label className="profile-setup__label">What best describes your role?</label>
        <div className="role-cards">
          {(Object.entries(PROFILE_PRESETS) as [UserRole, typeof PROFILE_PRESETS[UserRole]][]).map(([role, preset]) => (
            <button
              key={role}
              className={`role-card${form.role === role ? ' role-card--selected' : ''}`}
              onClick={() => setForm(prev => ({ ...prev, role }))}
              type="button"
            >
              <span className="role-card__label">{preset.label}</span>
              <span className="role-card__desc">{preset.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="profile-setup__fields">
        <div className="form-field">
          <label className="form-field__label" htmlFor="computerHours">Hours at computer daily</label>
          <select
            id="computerHours"
            className="form-field__select"
            value={form.computerHours}
            onChange={e => setForm(prev => ({ ...prev, computerHours: e.target.value as ComputerHours }))}
          >
            {(Object.entries(HOURS_LABELS) as [ComputerHours, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="remoteWork">Remote work</label>
          <select
            id="remoteWork"
            className="form-field__select"
            value={form.remoteWork}
            onChange={e => setForm(prev => ({ ...prev, remoteWork: e.target.value as RemoteWorkStatus }))}
          >
            {(Object.entries(REMOTE_LABELS) as [RemoteWorkStatus, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="mainGoal">Main posture goal</label>
          <select
            id="mainGoal"
            className="form-field__select"
            value={form.mainGoal}
            onChange={e => setForm(prev => ({ ...prev, mainGoal: e.target.value as PostureGoal }))}
          >
            {(Object.entries(GOAL_LABELS) as [PostureGoal, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-field__label" htmlFor="reminderFrequency">Reminder interval</label>
          <select
            id="reminderFrequency"
            className="form-field__select"
            value={form.reminderFrequency}
            onChange={e => setForm(prev => ({ ...prev, reminderFrequency: e.target.value as ReminderFrequency }))}
          >
            {(Object.entries(REMINDER_LABELS) as [ReminderFrequency, string][]).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {form.reminderFrequency === 'custom' && (
          <div className="form-field">
            <label className="form-field__label" htmlFor="customMinutes">Custom interval (minutes)</label>
            <input
              id="customMinutes"
              className="form-field__input"
              type="number"
              min={5}
              max={180}
              value={form.customReminderMinutes}
              onChange={e => setForm(prev => ({ ...prev, customReminderMinutes: parseInt(e.target.value, 10) || 30 }))}
            />
          </div>
        )}
      </div>

      <div className="profile-setup__actions">
        <button className="btn btn--secondary" onClick={handleCancel} type="button">
          {profile ? 'Cancel' : 'Skip for now'}
        </button>
        <button
          className="btn btn--primary"
          onClick={handleSave}
          disabled={!form.role}
          type="button"
        >
          Save profile
        </button>
      </div>
    </div>
  )
}
