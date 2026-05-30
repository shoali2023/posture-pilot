import { useCallback, useEffect, useRef, useState } from 'react'
import type { UserProfile } from '../types/userProfile'
import {
  getReminderInterval,
  getChecklistForProfile,
  getReminderTitle,
  calculateChecklistProgress,
  hasReachedFatigueLimit,
} from '../lib/reminders/reminderLogic'
import type { ChecklistItem } from '../lib/reminders/reminderLogic'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showPostureReminderNotification,
} from '../lib/notifications/notificationService'

// ── Persistence ──────────────────────────────────────────────

const REMINDER_STATE_KEY = 'posturepilot_reminder_state'
const MAX_RESTORE_AGE_MS = 24 * 60 * 60 * 1000

interface PersistedReminderState {
  remainingSeconds: number
  isPaused: boolean
  reminderCount: number
  items: ChecklistItem[]
  intervalMinutes: number
  savedAt: string
}

function saveReminderState(state: PersistedReminderState): void {
  try {
    localStorage.setItem(REMINDER_STATE_KEY, JSON.stringify(state))
  } catch { /* localStorage unavailable */ }
}

function loadReminderState(): PersistedReminderState | null {
  try {
    const raw = localStorage.getItem(REMINDER_STATE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedReminderState
    const age = Date.now() - new Date(parsed.savedAt).getTime()
    if (age > MAX_RESTORE_AGE_MS) return null
    return parsed
  } catch {
    return null
  }
}

function clearReminderState(): void {
  try { localStorage.removeItem(REMINDER_STATE_KEY) } catch { /* ignore */ }
}

// ── Hook ─────────────────────────────────────────────────────

export interface ReminderTimerState {
  intervalMinutes: number
  remainingSeconds: number
  isPaused: boolean
  reminderCount: number
  items: ChecklistItem[]
  currentTemplateTitle: string
  fatigueReached: boolean
  progress: { done: number; total: number }
  notificationsEnabled: boolean
  notificationPermission: string
}

export interface ReminderTimerActions {
  pause: () => void
  resume: () => void
  reset: () => void
  toggleItem: (id: string) => void
  requestDesktopNotifications: () => Promise<void>
  disableNotifications: () => void
}

export type ReminderTimer = ReminderTimerState & ReminderTimerActions

export function useReminderTimer(profile: UserProfile | null): ReminderTimer {
  const intervalMinutes = getReminderInterval(profile)

  function buildInitialState() {
    const saved = loadReminderState()
    if (saved && saved.intervalMinutes === intervalMinutes) {
      const elapsedSinceSave = Math.floor(
        (Date.now() - new Date(saved.savedAt).getTime()) / 1000
      )
      const adjustedRemaining = saved.isPaused
        ? saved.remainingSeconds
        : Math.max(1, saved.remainingSeconds - elapsedSinceSave)
      return {
        remainingSeconds: adjustedRemaining,
        isPaused: saved.isPaused,
        reminderCount: saved.reminderCount,
        items: saved.items,
      }
    }
    return {
      remainingSeconds: intervalMinutes * 60,
      isPaused: false,
      reminderCount: 0,
      items: getChecklistForProfile(profile, 0),
    }
  }

  const initial = buildInitialState()

  const [remainingSeconds, setRemainingSeconds] = useState(initial.remainingSeconds)
  const [isPaused, setIsPaused]                 = useState(initial.isPaused)
  const [reminderCount, setReminderCount]       = useState(initial.reminderCount)
  const [items, setItems]                       = useState<ChecklistItem[]>(initial.items)
  // Auto-enable if browser permission was already granted in a previous session
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => isNotificationSupported() && getNotificationPermission() === 'granted'
  )
  const [notificationPermission, setNotificationPermission] = useState<string>(
    isNotificationSupported() ? getNotificationPermission() : 'unsupported'
  )

  const stateRef = useRef({ remainingSeconds, isPaused, reminderCount, items, intervalMinutes })
  stateRef.current = { remainingSeconds, isPaused, reminderCount, items, intervalMinutes }

  // Track previous count so the notification effect fires only on increments
  const prevReminderCountRef = useRef(reminderCount)

  // When profile changes → rebuild checklist if interval changed
  const prevIntervalRef = useRef(intervalMinutes)
  useEffect(() => {
    if (prevIntervalRef.current !== intervalMinutes) {
      setRemainingSeconds(intervalMinutes * 60)
      setReminderCount(0)
      setIsPaused(false)
      clearReminderState()
    }
    setItems(getChecklistForProfile(profile, reminderCount))
    prevIntervalRef.current = intervalMinutes
  }, [profile, intervalMinutes]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Countdown tick ────────────────────────────────────────
  useEffect(() => {
    if (isPaused || hasReachedFatigueLimit(reminderCount)) return
    const iv = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          const nextCount = stateRef.current.reminderCount + 1
          // Rotate to next template on new cycle
          setItems(getChecklistForProfile(profile, nextCount))
          setReminderCount(nextCount)
          return stateRef.current.intervalMinutes * 60
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [isPaused, reminderCount]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Notification trigger (separate from state updater) ────
  // This effect fires whenever reminderCount increases, which is the correct
  // place to trigger browser notifications — not inside a setState updater.
  useEffect(() => {
    if (reminderCount > prevReminderCountRef.current) {
      if (
        notificationsEnabled &&
        !isPaused &&
        !hasReachedFatigueLimit(reminderCount)
      ) {
        const title = getReminderTitle(profile, reminderCount)
        void showPostureReminderNotification(title)
      }
    }
    prevReminderCountRef.current = reminderCount
  }, [reminderCount]) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist state every 10 seconds
  useEffect(() => {
    const iv = setInterval(() => {
      const s = stateRef.current
      saveReminderState({
        remainingSeconds: s.remainingSeconds,
        isPaused: s.isPaused,
        reminderCount: s.reminderCount,
        items: s.items,
        intervalMinutes: s.intervalMinutes,
        savedAt: new Date().toISOString(),
      })
    }, 10_000)
    return () => clearInterval(iv)
  }, [])

  // Persist on unmount
  useEffect(() => {
    return () => {
      const s = stateRef.current
      saveReminderState({
        remainingSeconds: s.remainingSeconds,
        isPaused: s.isPaused,
        reminderCount: s.reminderCount,
        items: s.items,
        intervalMinutes: s.intervalMinutes,
        savedAt: new Date().toISOString(),
      })
    }
  }, [])

  const fatigueReached = hasReachedFatigueLimit(reminderCount)
  const progress = calculateChecklistProgress(items)
  const currentTemplateTitle = getReminderTitle(profile, reminderCount)

  const pause  = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])

  const reset = useCallback(() => {
    const minutes = stateRef.current.intervalMinutes
    setRemainingSeconds(minutes * 60)
    setIsPaused(false)
    setReminderCount(0)
    setItems(getChecklistForProfile(profile, 0))
    clearReminderState()
  }, [profile])

  const toggleItem = useCallback((id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item))
  }, [])

  const requestDesktopNotifications = useCallback(async () => {
    if (!isNotificationSupported()) return
    const permission = await requestNotificationPermission()
    setNotificationPermission(permission)
    setNotificationsEnabled(permission === 'granted')
  }, [])

  const disableNotifications = useCallback(() => {
    setNotificationsEnabled(false)
  }, [])

  return {
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
    pause,
    resume,
    reset,
    toggleItem,
    requestDesktopNotifications,
    disableNotifications,
  }
}
