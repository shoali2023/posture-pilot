export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && typeof window.Notification !== 'undefined'
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied'
  return Notification.permission
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

const FALLBACK_BODIES = [
  'Relax your shoulders and realign your head.',
  'Take a short screen break.',
  'Stand up for one minute when you can.',
  'Check your neck position and sit upright.',
]

function fallbackBody(): string {
  return FALLBACK_BODIES[Math.floor(Math.random() * FALLBACK_BODIES.length)]
}

export function showPostureReminderNotification(templateTitle?: string): void {
  if (!isNotificationSupported()) return
  if (Notification.permission !== 'granted') return
  try {
    new Notification('Time for a posture check', {
      body: templateTitle ? `${templateTitle} — take a moment to reset.` : fallbackBody(),
      icon: '/favicon.png',
      tag: 'posturepilot-reminder',
      silent: false,
    })
  } catch {
    // Notifications blocked or unavailable in this context
  }
}

export function showReminderCompletedNotification(): void {
  if (!isNotificationSupported()) return
  if (Notification.permission !== 'granted') return
  try {
    new Notification('Posture Check Complete', {
      body: 'Great job keeping up with your posture routine!',
      icon: '/favicon.png',
      tag: 'posturepilot-complete',
      silent: true,
    })
  } catch {
    // ignore
  }
}
