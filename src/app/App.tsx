import { useState } from 'react'
import { BrandLogo } from '../components/BrandLogo'
import { AppTabs } from '../components/AppTabs'
import type { AppTab } from '../components/AppTabs'
import { PoseCamera } from '../components/PoseCamera'
import { UserGuide } from '../components/UserGuide'
import { ProfileSetup } from '../components/ProfileSetup'
import { ReminderPanel } from '../components/ReminderPanel'
import { AnalyticsDashboard } from '../components/AnalyticsDashboard'
import { CalibrationPanel } from '../components/CalibrationPanel'
import { AppFooter } from '../components/AppFooter'
import { WelcomeScreen } from '../components/WelcomeScreen'
import { PrivacyFirstCard } from '../components/PrivacyFirstCard'
import { useReminderTimer } from '../hooks/useReminderTimer'
import type { UserProfile } from '../types/userProfile'
import type { SessionSummary, SessionCheckpoint } from '../types/session'
import type { PostureResult } from '../types/posture'
import type { SmoothingLevel } from '../components/PoseCamera'
import type { PostureBaseline } from '../types/calibration'
import type { SessionRecord } from '../types/sessionHistory'
import { loadProfile, saveProfile, clearProfile } from '../lib/storage/profileStorage'
import {
  loadBaseline,
  saveBaseline,
  resetCalibration,
} from '../lib/calibration/calibrationLogic'
import {
  saveSessionRecord,
  loadSessionHistory,
  deleteSessionRecord,
  clearSessionHistory,
} from '../lib/history/sessionHistoryStorage'

type AppStage = 'welcome' | 'app'

function buildSessionRecord(
  summary: SessionSummary,
  conditionFrequency: Record<string, number>,
  profile: UserProfile | null,
  startedAt: string
): SessionRecord {
  const sortedConditions = Object.entries(conditionFrequency).sort(([, a], [, b]) => b - a)
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    startedAt,
    endedAt: new Date().toISOString(),
    durationSeconds: summary.durationSeconds,
    framesAnalyzed: summary.totalFrames,
    goodPercentage: summary.goodPct,
    warningPercentage: summary.warningPct,
    badPercentage: summary.badPct,
    mostFrequentCondition: sortedConditions[0]?.[0],
    conditionFrequency,
    profileRole: profile?.role,
  }
}

export function App() {
  const [stage, setStage] = useState<AppStage>(() =>
    loadProfile() ? 'welcome' : 'welcome'
  )
  const [activeTab, setActiveTab] = useState<AppTab>('home')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => loadProfile())
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null)
  const [conditionFrequency, setConditionFrequency] = useState<Record<string, number>>({})
  const [postureResult, setPostureResult] = useState<PostureResult | null>(null)
  const [baseline, setBaseline] = useState<PostureBaseline | null>(() => loadBaseline())
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>(() => loadSessionHistory())
  const [sessionStartedAt, setSessionStartedAt] = useState<string>('')
  const [sessionCheckpoint, setSessionCheckpoint] = useState<SessionCheckpoint | null>(null)
  const [smoothingLevel, setSmoothingLevel] = useState<SmoothingLevel>(() => {
    try {
      const stored = localStorage.getItem('posturepilot_smoothing_level')
      if (stored === 'low' || stored === 'balanced' || stored === 'high') return stored
    } catch { /* localStorage not available (e.g. SSR / test sandbox) */ }
    return 'balanced'
  })

  // Global reminder timer — lives at App level, persists across tab switches
  const reminderTimer = useReminderTimer(userProfile)

  // ── Profile ──────────────────────────────────────────────────
  function handleProfileSave(profile: UserProfile) {
    saveProfile(profile)
    setUserProfile(profile)
  }

  // ── Session ──────────────────────────────────────────────────
  function handleSessionStart() {
    setSessionStartedAt(new Date().toISOString())
  }

  function handleSessionEnd(summary: SessionSummary, frequency: Record<string, number>) {
    setSessionSummary(summary)
    setConditionFrequency(frequency)
    setSessionCheckpoint(null)
    // Persist session record
    const record = buildSessionRecord(summary, frequency, userProfile, sessionStartedAt || new Date().toISOString())
    saveSessionRecord(record)
    setSessionHistory(loadSessionHistory())
  }

  function handleSessionPause(checkpoint: SessionCheckpoint) {
    setSessionCheckpoint(checkpoint)
  }

  function handleSmoothingChange(level: SmoothingLevel) {
    setSmoothingLevel(level)
    try { localStorage.setItem('posturepilot_smoothing_level', level) } catch { /* ignore */ }
  }

  // ── Calibration ──────────────────────────────────────────────
  function handleCalibrate(newBaseline: PostureBaseline) {
    saveBaseline(newBaseline)
    setBaseline(newBaseline)
  }

  function handleResetCalibration() {
    resetCalibration()
    setBaseline(null)
  }

  // ── History ──────────────────────────────────────────────────
  function handleDeleteRecord(id: string) {
    deleteSessionRecord(id)
    setSessionHistory(loadSessionHistory())
  }

  // ── Welcome screen ───────────────────────────────────────────
  function handleContinueWithSaved() {
    setStage('app')
    setActiveTab('live')
  }

  function handleCreateSetup() {
    setStage('app')
    setActiveTab('home')
  }

  function handleContinueWithout() {
    setStage('app')
    setActiveTab('live')
  }

  function handleStartFresh() {
    clearProfile()
    clearSessionHistory()
    resetCalibration()
    setUserProfile(null)
    setSessionHistory([])
    setBaseline(null)
    setSessionSummary(null)
    setConditionFrequency({})
    reminderTimer.reset()
    setStage('app')
    setActiveTab('home')
  }

  // ── Welcome stage ────────────────────────────────────────────
  if (stage === 'welcome') {
    return (
      <WelcomeScreen
        savedProfile={userProfile}
        onContinueWithSaved={handleContinueWithSaved}
        onCreateSetup={handleCreateSetup}
        onContinueWithout={handleContinueWithout}
        onStartFresh={handleStartFresh}
      />
    )
  }

  // ── Main app ─────────────────────────────────────────────────
  return (
    <div className="app">
      <header className="app__header">
        <div className="app__title-row">
          <div className="app__brand">
            <BrandLogo variant="horizontal-dark" size="36px" />
          </div>
          {userProfile && (
            <span className="app__profile-chip">
              {userProfile.role.replace(/_/g, ' ')}
            </span>
          )}
        </div>
      </header>

      <AppTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="app__main">
        {activeTab === 'home' && (
          <div className="tab-content">
            <ProfileSetup
              profile={userProfile}
              onSave={handleProfileSave}
              onSkip={() => setActiveTab('live')}
            />
            <UserGuide />
            <PrivacyFirstCard />
            <p className="app__disclaimer-inline">
              PosturePilot supports posture awareness and habit-building only — it is not a medical tool.
              If you experience pain or discomfort, please consult a qualified healthcare professional.
            </p>
          </div>
        )}

        {/* Live Check — always mounted so session state survives tab switches */}
        <div
          className="tab-content tab-content--live"
          style={{ display: activeTab === 'live' ? undefined : 'none' }}
          aria-hidden={activeTab !== 'live'}
        >
          <PoseCamera
            isActive={activeTab === 'live'}
            onSessionEnd={handleSessionEnd}
            onSessionStart={handleSessionStart}
            onSessionPause={handleSessionPause}
            onPostureUpdate={setPostureResult}
            calibrationBaseline={baseline}
            sessionCheckpoint={sessionCheckpoint}
            smoothingLevel={smoothingLevel}
          />
          {/* Calibration inline — user sees themselves while calibrating */}
          <CalibrationPanel
            baseline={baseline}
            currentPosture={postureResult}
            onCalibrate={handleCalibrate}
            onReset={handleResetCalibration}
            inline={true}
          />
        </div>

        {activeTab === 'reminders' && (
          <div className="tab-content">
            <ReminderPanel
              {...reminderTimer}
              hasProfile={userProfile !== null}
              onPause={reminderTimer.pause}
              onResume={reminderTimer.resume}
              onReset={reminderTimer.reset}
              onToggleItem={reminderTimer.toggleItem}
              onRequestDesktopNotifications={reminderTimer.requestDesktopNotifications}
              onDisableNotifications={reminderTimer.disableNotifications}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="tab-content">
            <AnalyticsDashboard
              summary={sessionSummary}
              conditionFrequency={conditionFrequency}
              profile={userProfile}
              history={sessionHistory}
              onDeleteRecord={handleDeleteRecord}
            />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-content">
            <h2 className="settings__title">Settings</h2>

            <section className="settings__section">
              <h3 className="settings__section-title">Profile</h3>
              <ProfileSetup
                profile={userProfile}
                onSave={handleProfileSave}
                onSkip={() => setActiveTab('home')}
              />
            </section>

            <section className="settings__section">
              <h3 className="settings__section-title">Live Check</h3>
              <div className="settings__field">
                <label className="settings__label" htmlFor="smoothing-select">
                  Skeleton smoothing
                </label>
                <select
                  id="smoothing-select"
                  className="settings__select"
                  value={smoothingLevel}
                  onChange={e => handleSmoothingChange(e.target.value as SmoothingLevel)}
                >
                  <option value="low">Low — faster, slight jitter</option>
                  <option value="balanced">Balanced (recommended)</option>
                  <option value="high">High — smoother, slight delay</option>
                </select>
              </div>
            </section>

            <section className="settings__section">
              <h3 className="settings__section-title">Data</h3>
              <div className="settings__data-actions">
                <button
                  className="btn btn--secondary"
                  onClick={() => {
                    clearSessionHistory()
                    setSessionHistory([])
                  }}
                  type="button"
                >
                  Clear session history
                </button>
                <button
                  className="btn btn--secondary"
                  onClick={handleStartFresh}
                  type="button"
                >
                  Reset all data
                </button>
              </div>
            </section>

            <section className="settings__section">
              <h3 className="settings__section-title">About</h3>
              <p className="settings__about">
                PosturePilot is an open academic prototype for posture awareness.
                It is not a medical diagnosis tool.
                If you experience pain or discomfort, consult a qualified healthcare professional.
              </p>
            </section>
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  )
}
