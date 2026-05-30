import type { UserProfile } from '../../types/userProfile'

const PROFILE_KEY = 'posturepilot_user_profile'

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY)
}
