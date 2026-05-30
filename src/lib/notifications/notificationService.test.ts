import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showPostureReminderNotification,
  showReminderCompletedNotification,
} from './notificationService'

type MockNotificationConstructor = ReturnType<typeof vi.fn> & {
  permission: NotificationPermission
  requestPermission: ReturnType<typeof vi.fn>
}

function mockNotification(permission: NotificationPermission | null, supported = true) {
  if (!supported) {
    vi.stubGlobal('Notification', undefined)
    return
  }
  const ctor = vi.fn() as unknown as MockNotificationConstructor
  ctor.permission = permission ?? 'default'
  ctor.requestPermission = vi.fn().mockResolvedValue('granted')
  vi.stubGlobal('Notification', ctor)
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('isNotificationSupported', () => {
  it('returns false when Notification is undefined', () => {
    mockNotification(null, false)
    expect(isNotificationSupported()).toBe(false)
  })

  it('returns true when Notification is available', () => {
    mockNotification('default')
    expect(isNotificationSupported()).toBe(true)
  })
})

describe('getNotificationPermission', () => {
  it('returns denied when not supported', () => {
    mockNotification(null, false)
    expect(getNotificationPermission()).toBe('denied')
  })

  it('returns current permission when supported', () => {
    mockNotification('granted')
    expect(getNotificationPermission()).toBe('granted')
  })

  it('returns default when permission is default', () => {
    mockNotification('default')
    expect(getNotificationPermission()).toBe('default')
  })
})

describe('requestNotificationPermission', () => {
  it('returns denied when not supported', async () => {
    mockNotification(null, false)
    const result = await requestNotificationPermission()
    expect(result).toBe('denied')
  })

  it('returns granted without re-requesting when already granted', async () => {
    mockNotification('granted')
    const result = await requestNotificationPermission()
    expect(result).toBe('granted')
  })

  it('calls requestPermission when permission is default and returns granted', async () => {
    mockNotification('default')
    const result = await requestNotificationPermission()
    expect(result).toBe('granted')
  })
})

describe('showPostureReminderNotification', () => {
  it('does not throw when not supported', () => {
    mockNotification(null, false)
    expect(() => showPostureReminderNotification()).not.toThrow()
  })

  it('does not create notification when permission is denied', () => {
    mockNotification('denied')
    showPostureReminderNotification()
    expect(window.Notification).not.toHaveBeenCalled()
  })

  it('creates a notification when permission is granted', () => {
    mockNotification('granted')
    showPostureReminderNotification()
    expect(window.Notification).toHaveBeenCalledOnce()
  })

  it('uses tag posturepilot-reminder', () => {
    mockNotification('granted')
    showPostureReminderNotification()
    const MockCtor = window.Notification as unknown as MockNotificationConstructor
    const calls = (MockCtor as unknown as ReturnType<typeof vi.fn>).mock.calls
    const [, options] = calls[0] as [string, NotificationOptions]
    expect(options.tag).toBe('posturepilot-reminder')
  })
})

describe('showReminderCompletedNotification', () => {
  it('does not throw when not supported', () => {
    mockNotification(null, false)
    expect(() => showReminderCompletedNotification()).not.toThrow()
  })

  it('does not create notification when permission is denied', () => {
    mockNotification('denied')
    showReminderCompletedNotification()
    expect(window.Notification).not.toHaveBeenCalled()
  })

  it('creates a notification when permission is granted', () => {
    mockNotification('granted')
    showReminderCompletedNotification()
    expect(window.Notification).toHaveBeenCalledOnce()
  })
})
