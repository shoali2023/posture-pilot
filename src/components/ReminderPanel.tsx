import type { ChecklistItem } from '../lib/reminders/reminderLogic'
import { SESSION_REMINDER_LIMIT } from '../lib/reminders/reminderLogic'

export interface ReminderPanelProps {
  intervalMinutes: number
  remainingSeconds: number
  isPaused: boolean
  reminderCount: number
  items: ChecklistItem[]
  currentTemplateTitle?: string
  fatigueReached: boolean
  progress: { done: number; total: number }
  notificationsEnabled: boolean
  notificationPermission: string
  hasProfile: boolean
  onPause: () => void
  onResume: () => void
  onReset: () => void
  onToggleItem: (id: string) => void
  onRequestDesktopNotifications: () => Promise<void>
  onDisableNotifications: () => void
}

export function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function ReminderPanel({
  intervalMinutes,
  remainingSeconds,
  isPaused,
  reminderCount,
  items,
  currentTemplateTitle,
  fatigueReached,
  progress,
  notificationsEnabled,
  notificationPermission,
  hasProfile,
  onPause,
  onResume,
  onReset,
  onToggleItem,
  onRequestDesktopNotifications,
  onDisableNotifications,
}: ReminderPanelProps) {
  const allDone = progress.done === progress.total

  if (fatigueReached) {
    return (
      <div className="reminder-panel reminder-panel--done">
        <p className="reminder-panel__fatigue-msg">
          You have completed enough posture reminders for this session. Great job.
        </p>
        <button className="btn btn--secondary" onClick={onReset} type="button">
          Start new session
        </button>
      </div>
    )
  }

  return (
    <div className="reminder-panel">
      <div className="reminder-panel__timer-block">
        <span className="reminder-panel__timer-label">Next reminder in</span>
        <span className="reminder-panel__timer-value">
          {isPaused ? '—' : formatCountdown(remainingSeconds)}
        </span>
        <span className="reminder-panel__interval-hint">
          Interval: every {intervalMinutes} min
        </span>
        {reminderCount > 0 && (
          <span className="reminder-panel__count">
            Reminders this session: {reminderCount} / {SESSION_REMINDER_LIMIT}
          </span>
        )}
      </div>

      <div className="reminder-panel__timer-controls">
        {isPaused ? (
          <button className="btn btn--secondary" onClick={onResume} type="button">
            Resume reminders
          </button>
        ) : (
          <button className="btn btn--secondary" onClick={onPause} type="button">
            Pause reminders
          </button>
        )}
      </div>

      <div className="reminder-panel__checklist-header">
        <h3 className="reminder-panel__checklist-title">
          {currentTemplateTitle ? currentTemplateTitle : 'Posture Checklist'}
        </h3>
        <span className={`reminder-panel__progress${allDone ? ' reminder-panel__progress--done' : ''}`}>
          {progress.done} / {progress.total} completed
        </span>
      </div>

      <ul className="checklist">
        {items.map(item => (
          <li key={item.id} className={`checklist-item${item.done ? ' checklist-item--done' : ''}`}>
            <button
              className="checklist-item__toggle"
              onClick={() => onToggleItem(item.id)}
              aria-label={item.done ? 'Mark as incomplete' : 'Mark as complete'}
              type="button"
            >
              <span className="checklist-item__check" aria-hidden="true">
                {item.done ? '✓' : '○'}
              </span>
            </button>
            <span className="checklist-item__text">{item.text}</span>
          </li>
        ))}
      </ul>

      <button
        className="btn btn--secondary reminder-panel__reset-btn"
        onClick={onReset}
        type="button"
      >
        Reset timer &amp; checklist
      </button>

      {/* Desktop notifications */}
      <div className="reminder-panel__notifications">
        <h4 className="reminder-panel__notifications-title">Desktop notifications</h4>
        {notificationPermission === 'unsupported' && (
          <p className="reminder-panel__notification-hint">
            Your browser does not support desktop notifications.
          </p>
        )}
        {notificationPermission === 'denied' && (
          <p className="reminder-panel__notification-hint reminder-panel__notification-hint--warn">
            Notifications are blocked. Enable them in your browser settings to use this feature.
          </p>
        )}
        {notificationPermission === 'default' && !notificationsEnabled && (
          <button
            className="btn btn--secondary"
            onClick={() => void onRequestDesktopNotifications()}
            type="button"
          >
            Allow notifications
          </button>
        )}
        {notificationPermission === 'granted' && (
          notificationsEnabled ? (
            <div className="reminder-panel__notification-status">
              <span className="reminder-panel__notification-on">Notifications on</span>
              <button
                className="btn btn--ghost"
                onClick={onDisableNotifications}
                type="button"
              >
                Disable
              </button>
            </div>
          ) : (
            <button
              className="btn btn--secondary"
              onClick={() => void onRequestDesktopNotifications()}
              type="button"
            >
              Enable desktop notifications
            </button>
          )
        )}
      </div>

      {!hasProfile && (
        <p className="reminder-panel__hint">
          Set up your profile in the Home tab for a personalised checklist.
        </p>
      )}
    </div>
  )
}
